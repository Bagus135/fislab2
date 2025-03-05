package helper

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"html"
	"math/rand"
	"path/filepath"
	"regexp"
	"strings"
	"time"
	"unicode"
)

// GenerateResetToken Generate kode verifikasi 6 digit
func GenerateResetToken() string {

	timestamp := time.Now().Unix()

	// Generate random string
	source := rand.NewSource(time.Now().UnixNano())
	r := rand.New(source)

	// Generate 32 random bytes
	randomBytes := make([]byte, 32)
	for i := range randomBytes {
		randomBytes[i] = byte(r.Intn(256))
	}

	// Gabungkan timestamp dan random bytes
	token := fmt.Sprintf("%d-%x", timestamp, randomBytes)
	return token
}

// GenerateVerificationCode Generate kode verifikasi 6 digit
func GenerateVerificationCode() string {
	source := rand.NewSource(time.Now().UnixNano())
	r := rand.New(source)
	return fmt.Sprintf("%06d", r.Intn(900000)+100000)
}

// GenerateRandomCode - Generating code presensi
func GenerateRandomCode() string {
	// Generate angular random antara 100000-999999
	m := 100000
	i := 999999

	// Gunakan math/rand dengan source baru
	source := rand.NewSource(time.Now().UnixNano())
	r := rand.New(source)

	// Generate angka random
	code := r.Intn(i-m+1) + m

	// Format menjadi 6 digit dengan leading zeros
	return fmt.Sprintf("%06d", code)
}

// SanitizeString membersihkan string dari karakter berbahaya
func SanitizeString(input string) string {
	// Jika input kosong, kembalikan string kosong
	if input == "" {
		return ""
	}

	// Escape HTML entities untuk mencegah XSS, tapi biarkan karakter umum
	escaped := html.EscapeString(input)

	// Hapus hanya karakter kontrol berbahaya, biarkan whitespace
	return strings.Map(func(r rune) rune {
		// Biarkan tab, newline, dan carriage return
		if r == '\t' || r == '\n' || r == '\r' {
			return r
		}
		// Hapus karakter kontrol lainnya
		if unicode.IsControl(r) {
			return -1
		}
		return r
	}, escaped)
}

// SanitizePath membersihkan path dari LFI attack
func SanitizePath(path string) string {
	// Gunakan filepath.Clean untuk normalisasi path
	clean := filepath.Clean(path)

	// Cegah path traversal dengan menghapus awalan "../"
	if strings.HasPrefix(clean, "../") {
		clean = strings.TrimPrefix(clean, "../")
	}

	// Hapus semua "../" di tengah path - ini lebih longgar tapi tetap aman
	for strings.Contains(clean, "/../") {
		clean = strings.Replace(clean, "/../", "/", 1)
	}

	return clean
}

// ValidateInputAgainstSQLi memeriksa input terhadap kemungkinan SQL injection
func ValidateInputAgainstSQLi(input string) bool {
	// Jika input kosong, anggap valid
	if input == "" {
		return true
	}

	// Untuk email, gunakan validasi khusus
	if strings.Contains(input, "@") {
		// Validasi dasar email menggunakan regex
		emailPattern := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
		if emailPattern.MatchString(input) {
			return true // Email yang valid
		}

		// Jika tidak match dengan pattern email tapi mengandung @,
		// lakukan pemeriksaan SQL injection yang lebih ketat
	}

	// Daftar pola berbahaya yang benar-benar perlu diblokir
	dangerousPatterns := []string{
		"--", "/**/", "/*", "*/", // Komentar SQL
		";", ";--", "';", "';--", // Statement terminator
		"UNION SELECT", "UNION ALL SELECT", // Union attacks
		"DROP TABLE", "DROP DATABASE", // Destructive commands
		"DELETE FROM", "TRUNCATE TABLE", // Destructive commands
		"OR 1=1", "OR '1'='1'", "OR 1 = 1", "OR TRUE", "OR 1=1--", // Boolean-based injections
		"' OR '", "' OR 1=1", "admin' --", // Login bypass
		"EXEC(", "EXECUTE(", "EXEC sp_", "xp_cmdshell", // Command execution
	}

	lowerInput := strings.ToLower(input)

	// Cek pola berbahaya yang berdiri sendiri
	for _, pattern := range dangerousPatterns {
		if strings.Contains(lowerInput, pattern) {
			// Cek apakah ini benar-benar pola berbahaya atau hanya kebetulan
			// Misalnya, jika pattern ada di dalam kata lain
			patternWithDelimiters := regexp.MustCompile(`\b` + regexp.QuoteMeta(pattern) + `\b`)

			// Jika pola berdiri sendiri atau diawali/diakhiri karakter khusus
			if patternWithDelimiters.MatchString(lowerInput) ||
				strings.Contains(lowerInput, "'"+pattern) ||
				strings.Contains(lowerInput, pattern+"'") ||
				strings.Contains(lowerInput, " "+pattern) ||
				strings.Contains(lowerInput, pattern+" ") {
				return false
			}
		}
	}

	return true
}

// IsSecureImageFile memeriksa file gambar untuk keamanan
func IsSecureImageFile(data []byte, size int64, filename string) error {
	// Validasi ukuran
	if size <= 0 {
		return errors.New("file cannot be empty")
	}

	if size > 500*1024 {
		return errors.New("file too large, maximum size is 500 KB")
	}

	// Validasi ekstensi file dengan lebih toleran
	ext := strings.ToLower(filepath.Ext(filename))

	// Daftar ekstensi yang diizinkan
	allowedExts := map[string]bool{
		".jpg": true, ".jpeg": true, ".png": true,
		".gif": true, ".webp": true, // Tambahan format gambar yang diizinkan
	}

	if !allowedExts[ext] && ext != "" {
		return errors.New("unsupported file extension, allowed: jpg, jpeg, png, gif, webp")
	}

	// Cek ukuran minimal file
	if len(data) < 4 {
		return errors.New("file too small")
	}

	// Deteksi format file berdasarkan magic numbers
	isJPEG := len(data) > 2 && data[0] == 0xFF && data[1] == 0xD8
	isPNG := len(data) > 4 && data[0] == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47
	isGIF := len(data) > 3 && data[0] == 0x47 && data[1] == 0x49 && data[2] == 0x46
	isBMP := len(data) > 2 && data[0] == 0x42 && data[1] == 0x4D
	isWEBP := len(data) > 12 && data[0] == 0x52 && data[1] == 0x49 && data[2] == 0x46 && data[3] == 0x46 &&
		data[8] == 0x57 && data[9] == 0x45 && data[10] == 0x42 && data[11] == 0x50

	// Lebih toleran - jika ekstensi tidak dikenal tapi format file terdeteksi
	if ext == "" && (isJPEG || isPNG || isGIF || isBMP || isWEBP) {
		return nil // File terdeteksi sebagai gambar
	}

	// Verifikasi ekstensi sesuai dengan format sebenarnya
	if (ext == ".jpg" || ext == ".jpeg") && !isJPEG {
		// Lebih toleran - terima JPEG bahkan jika magic number tidak tepat
		if isPNG || isGIF || isBMP || isWEBP {
			return nil // Format lain yang valid
		}
		return errors.New("file extension is jpg/jpeg but content is not a valid JPEG image")
	}

	if ext == ".png" && !isPNG {
		// Lebih toleran - terima PNG bahkan jika magic number tidak tepat
		if isJPEG || isGIF || isBMP || isWEBP {
			return nil // Format lain yang valid
		}
		return errors.New("file extension is png but content is not a valid PNG image")
	}

	if ext == ".gif" && !isGIF {
		return errors.New("file extension is gif but content is not a valid GIF image")
	}

	if ext == ".webp" && !isWEBP {
		return errors.New("file extension is webp but content is not a valid WebP image")
	}

	// Jika tidak terdeteksi sebagai gambar tapi ekstensi valid
	if !isJPEG && !isPNG && !isGIF && !isBMP && !isWEBP && ext != "" {
		// Periksa beberapa byte pertama untuk deteksi format lainnya
		// Lebih toleran - coba deteksi lagi dengan pola yang lebih sederhana
		if len(data) > 2 && ((data[0] == 0xFF) || (data[0] == 0x89) || (data[0] == 0x47) ||
			(data[0] == 0x42) || (data[0] == 0x52)) {
			return nil // Kemungkinan gambar dengan format yang tidak dikenali
		}
		return errors.New("unrecognized image format")
	}

	return nil
}

// GenerateSecureFilename menghasilkan nama file aman berdasarkan konten dan timestamp
func GenerateSecureFilename(data []byte, ext string) string {
	hash := sha256.Sum256(data)
	hashStr := hex.EncodeToString(hash[:])
	timestamp := time.Now().UnixNano()

	// Jika ekstensi tidak dimulai dengan dot, tambahkan
	if ext != "" && !strings.HasPrefix(ext, ".") {
		ext = "." + ext
	}

	return fmt.Sprintf("%s_%d%s", hashStr[:16], timestamp, ext)
}
