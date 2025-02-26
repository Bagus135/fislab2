package middleware

import (
	"net/http"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

// SecurityHeaders menambahkan header keamanan ke semua response
func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Proteksi XSS
		w.Header().Set("X-XSS-Protection", "1; mode=block")

		// Mencegah MIME sniffing
		w.Header().Set("X-Content-Type-Options", "nosniff")

		// Content Security Policy untuk mencegah XSS
		w.Header().Set("Content-Security-Policy", "default-src 'self'; img-src 'self'; script-src 'self'")

		// Mencegah clickjacking
		w.Header().Set("X-Frame-Options", "DENY")

		// Referrer Policy - Kontrol informasi referrer yang dikirim
		w.Header().Set("Referrer-Policy", "no-referrer-when-downgrade")

		// Permissions Policy (sebelumnya Feature Policy) - Kontrol fitur browser
		w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

		next.ServeHTTP(w, r)
	})
}

// RateLimiter membatasi jumlah request dari IP yang sama
// untuk mencegah brute force dan DoS attack
func RateLimiter(next http.Handler) http.Handler {
	// Struktur untuk menyimpan data rate-limiting
	type client struct {
		count     int       // Jumlah request
		lastSeen  time.Time // Waktu request terakhir
		blocked   bool      // Status blocked
		blockTime time.Time // Waktu kapan client akan diblokir sampai
	}

	var (
		mu              sync.Mutex
		clients         = make(map[string]*client)
		maxRequests     = 100              // Maksimum request per window
		window          = 60 * time.Second // Window waktu (1 menit)
		blockDuration   = 5 * time.Minute  // Durasi blocking jika terlalu banyak request
		cleanupInterval = 10 * time.Minute // Interval pembersihan
	)

	// Goroutine untuk membersihkan map clients secara periodik
	go func() {
		ticker := time.NewTicker(cleanupInterval)
		defer ticker.Stop()

		for range ticker.C {
			mu.Lock()
			now := time.Now()
			for ip, c := range clients {
				// Hapus entry yang sudah lama tidak dilihat
				if c.blocked && now.After(c.blockTime) {
					c.blocked = false
				}

				if now.Sub(c.lastSeen) > window*2 && !c.blocked {
					delete(clients, ip)
				}
			}
			mu.Unlock()
		}
	}()

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Dapatkan IP client
		ip := r.RemoteAddr

		// Tambahkan header X-Forwarded-For jika ada (untuk bekerja dengan proxy)
		forwardedFor := r.Header.Get("X-Forwarded-For")
		if forwardedFor != "" {
			ip = forwardedFor
		}

		mu.Lock()

		// Inisialisasi data client jika belum ada
		c, exists := clients[ip]
		if !exists {
			c = &client{
				count:    0,
				lastSeen: time.Now(),
				blocked:  false,
			}
			clients[ip] = c
		}

		// Jika client diblokir, cek apakah masa blocking sudah berakhir
		now := time.Now()
		if c.blocked {
			if now.After(c.blockTime) {
				// Reset data client
				c.blocked = false
				c.count = 0
			} else {
				// Client masih diblokir
				_ = c.blockTime.Sub(now).Seconds()
				mu.Unlock()
				w.Header().Set("Retry-After", "300") // 5 menit
				w.WriteHeader(http.StatusTooManyRequests)
				_, err := w.Write([]byte("Too many requests. Please try again later."))
				if err != nil {
					return
				}
				return
			}
		}

		// Reset counter jika sudah melewati window
		if now.Sub(c.lastSeen) > window {
			c.count = 0
			c.lastSeen = now
		}

		// Increment counter
		c.count++
		c.lastSeen = now

		// Jika melebihi batas, blokir sementara
		if c.count > maxRequests {
			c.blocked = true
			c.blockTime = now.Add(blockDuration)
			mu.Unlock()
			w.Header().Set("Retry-After", "300") // 5 menit
			w.WriteHeader(http.StatusTooManyRequests)
			_, err := w.Write([]byte("Too many requests. Please try again later."))
			if err != nil {
				return
			}
			return
		}

		mu.Unlock()

		// Lanjutkan ke handler berikutnya jika masih dalam batas
		next.ServeHTTP(w, r)
	})
}

// RequestValidation memvalidasi input request untuk mencegah serangan
func RequestValidation(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Validasi ukuran body maksimum
		r.Body = http.MaxBytesReader(w, r.Body, 10*1024*1024) // 10MB limit

		// Tambahan validasi Content-Type khusus untuk POST/PUT/PATCH
		if r.Method == "POST" || r.Method == "PUT" || r.Method == "PATCH" {
			contentType := r.Header.Get("Content-Type")

			// Hanya izinkan content type yang valid
			isValid := strings.Contains(contentType, "application/json") ||
				strings.Contains(contentType, "multipart/form-data") ||
				strings.Contains(contentType, "application/x-www-form-urlencoded")

			if !isValid && r.ContentLength > 0 {
				w.WriteHeader(http.StatusUnsupportedMediaType)
				_, err := w.Write([]byte("Unsupported media type"))
				if err != nil {
					return
				}
				return
			}
		}

		// Validasi URL path - mencegah path traversal
		if strings.Contains(r.URL.Path, "..") {
			w.WriteHeader(http.StatusBadRequest)
			_, err := w.Write([]byte("Invalid URL path"))
			if err != nil {
				return
			}
			return
		}

		// Validasi query parameters
		for _, values := range r.URL.Query() {
			for _, value := range values {
				// Deteksi pola SQL Injection
				sqlInjectionPatterns := []string{"'", "\"", ";", "--", "/*", "*/", "UNION", "SELECT", "DROP", "1=1"}
				for _, pattern := range sqlInjectionPatterns {
					if strings.Contains(value, pattern) {
						w.WriteHeader(http.StatusBadRequest)
						_, err := w.Write([]byte("Invalid query parameter"))
						if err != nil {
							return
						}
						return
					}
				}

				// Deteksi pola XSS
				xssPatterns := []string{"<script", "javascript:", "onerror=", "onload=", "eval("}
				for _, pattern := range xssPatterns {
					if strings.Contains(strings.ToLower(value), pattern) {
						w.WriteHeader(http.StatusBadRequest)
						_, err := w.Write([]byte("Invalid query parameter"))
						if err != nil {
							return
						}
						return
					}
				}
			}
		}

		next.ServeHTTP(w, r)
	})
}

// LogRequest melakukan logging untuk keperluan audit dan deteksi serangan
func LogRequest(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		startTime := time.Now()

		// Wrap ResponseWriter untuk mendapatkan status code
		wrapper := newResponseWriter(w)

		// Panggil handler berikutnya
		next.ServeHTTP(wrapper, r)

		// Logging setelah request diproses
		_ = time.Since(startTime)

		// Implementasi logging sesuai kebutuhan
		// Format: timestamp, IP, method, path, status, duration
		// log.Printf("[%s] %s %s %s %d %v",
		//     time.Now().Format(time.RFC3339),
		//     r.RemoteAddr,
		//     r.Method,
		//     r.URL.Path,
		//     wrapper.status,
		//     duration)

		// Deteksi request mencurigakan
		if wrapper.status >= 400 {
			// Log lebih detail untuk kode error
			// log.Printf("[WARNING] Error response: %d for %s %s from %s",
			//     wrapper.status,
			//     r.Method,
			//     r.URL.Path,
			//     r.RemoteAddr)
		}
	})
}

// ResponseWriter wrapper untuk mendapatkan status code
type responseWriter struct {
	http.ResponseWriter
	status int
}

func newResponseWriter(w http.ResponseWriter) *responseWriter {
	return &responseWriter{
		ResponseWriter: w,
		status:         http.StatusOK,
	}
}

func (rw *responseWriter) WriteHeader(status int) {
	rw.status = status
	rw.ResponseWriter.WriteHeader(status)
}

// SecureFileServer membungkus file server dengan validasi path untuk mencegah LFI/RFI
func SecureFileServer(fileServer http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Validasi dan sanitasi path
		urlPath := r.URL.Path

		// Mencegah path traversal
		if strings.Contains(urlPath, "..") || strings.Contains(urlPath, "./") {
			w.WriteHeader(http.StatusForbidden)
			_, err := w.Write([]byte("Forbidden"))
			if err != nil {
				return
			}
			return
		}

		// Hanya izinkan akses ke file dengan ekstensi yang diizinkan
		ext := strings.ToLower(filepath.Ext(urlPath))
		allowedExts := map[string]bool{
			".jpg": true, ".jpeg": true, ".png": true,
			".pdf": true, ".txt": true, ".csv": true,
		}

		if !allowedExts[ext] {
			w.WriteHeader(http.StatusForbidden)
			_, err := w.Write([]byte("Forbidden file type"))
			if err != nil {
				return
			}
			return
		}

		// Validasi nama file
		filename := filepath.Base(urlPath)
		if filename == "" || filename == "." || len(filename) > 255 {
			w.WriteHeader(http.StatusBadRequest)
			_, err := w.Write([]byte("Invalid filename"))
			if err != nil {
				return
			}
			return
		}

		// Validasi karakter yang diizinkan dalam nama file
		validFilenameChars := true
		for _, c := range filename {
			if (c < 'a' || c > 'z') && (c < 'A' || c > 'Z') && (c < '0' || c > '9') &&
				c != '-' && c != '_' && c != '.' {
				validFilenameChars = false
				break
			}
		}

		if !validFilenameChars {
			w.WriteHeader(http.StatusBadRequest)
			_, err := w.Write([]byte("Invalid filename characters"))
			if err != nil {
				return
			}
			return
		}

		// Set header keamanan tambahan untuk file
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Content-Disposition", "inline")

		// Cache control untuk file statis
		w.Header().Set("Cache-Control", "public, max-age=86400") // 1 day

		// Delegasikan ke file server asli
		fileServer.ServeHTTP(w, r)
	})
}

//// CORS middleware untuk mengatur Cross-Origin Resource Sharing
//func CORS(next http.Handler) http.Handler {
//	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
//		// Atur domain yang diizinkan
//		w.Header().Set("Access-Control-Allow-Origin", "https://fislab.com")
//
//		// Atur metode yang diizinkan
//		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
//
//		// Atur header yang diizinkan
//		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
//
//		// Atur berapa lama preflight request di-cache
//		w.Header().Set("Access-Control-Max-Age", "86400") // 24 jam
//
//		// Handle preflight request
//		if r.Method == "OPTIONS" {
//			w.WriteHeader(http.StatusOK)
//			return
//		}
//
//		next.ServeHTTP(w, r)
//	})
//}

// ContentSecurityPolicy mengatur CSP yang lebih spesifik untuk mencegah XSS
func ContentSecurityPolicy(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// CSP policy yang lebih detail
		csp := []string{
			"default-src 'self'",
			"img-src 'self' data:",
			"script-src 'self'",
			"style-src 'self'",
			"font-src 'self'",
			"connect-src 'self'",
			"object-src 'none'",
			"frame-ancestors 'none'",
			"form-action 'self'",
			"base-uri 'self'",
			"upgrade-insecure-requests",
		}

		w.Header().Set("Content-Security-Policy", strings.Join(csp, "; "))

		next.ServeHTTP(w, r)
	})
}
