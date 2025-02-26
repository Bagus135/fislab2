package helper

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"html"
	"io"
	"math/rand"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"regexp"
	"strings"
	"time"
	"unicode"
)

// IsValidImageType Validasi tipe file
func IsValidImageType(contentType string) bool {
	validTypes := map[string]bool{
		"image/jpeg": true,
		"image/jpg":  true,
		"image/png":  true,
	}
	return validTypes[contentType]
}

// ValidateAndReadFile - Baca dan validasi file
func ValidateAndReadFile(file multipart.File, size int64) ([]byte, error) {
	// Batasi ukuran
	if size <= 0 || size > 512*1024 {
		return nil, errors.New("invalid file size")
	}

	// Baca file ke buffer
	buffer := make([]byte, size)
	_, err := io.ReadFull(file, buffer)
	if err != nil {
		return nil, errors.New("failed to read file")
	}

	// Validasi magic number
	if len(buffer) < 8 {
		return nil, errors.New("file too small")
	}

	// Cek magic number untuk JPEG
	if buffer[0] == 0xFF && buffer[1] == 0xD8 && buffer[2] == 0xFF {
		return buffer, nil
	}

	// Cek magic number untuk PNG
	if buffer[0] == 0x89 && buffer[1] == 0x50 && buffer[2] == 0x4E && buffer[3] == 0x47 &&
		buffer[4] == 0x0D && buffer[5] == 0x0A && buffer[6] == 0x1A && buffer[7] == 0x0A {
		return buffer, nil
	}

	// File tidak valid
	return nil, errors.New("invalid image format")
}

// ServeDefaultImage - Tampilkan gambar default
func ServeDefaultImage(w http.ResponseWriter) {
	// Data minimal untuk gambar 1x1 pixel transparan PNG
	transparentPixel := []byte{
		0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
		0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
		0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
		0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
		0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
		0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82,
	}

	w.Header().Set("Content-Type", "image/png")
	w.Header().Set("Cache-Control", "public, max-age=86400")
	_, err := w.Write(transparentPixel)
	if err != nil {
		return
	}
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
	// Escape HTML entities untuk mencegah XSS
	escaped := html.EscapeString(input)

	// Hapus karakter kontrol
	return strings.Map(func(r rune) rune {
		if unicode.IsControl(r) {
			return -1
		}
		return r
	}, escaped)
}

// IsValidFileName memvalidasi nama file
func IsValidFileName(filename string) bool {
	// Hapus path dan extension
	base := filepath.Base(filename)

	// Validasi panjang
	if len(base) < 1 || len(base) > 255 {
		return false
	}

	// Validasi karakter yang diperbolehkan
	validChars := regexp.MustCompile(`^[a-zA-Z0-9_\-.]+$`).MatchString
	return validChars(base)
}

// SanitizePath membersihkan path dari LFI attack
func SanitizePath(path string) string {
	// Hapus karakter "../" dan "./" untuk mencegah traversal direktori
	clean := filepath.Clean(path)

	// Hapus semua path traversal
	clean = strings.ReplaceAll(clean, "../", "")
	clean = strings.ReplaceAll(clean, "./", "")

	return clean
}

// ValidateInputAgainstSQLi memeriksa input terhadap kemungkinan SQL injection
func ValidateInputAgainstSQLi(input string) bool {
	// Cek pola SQL injection umum
	sqlPatterns := []string{
		"--", ";", "/*", "*/", "@@", "@",
		"CHAR(", "EXEC(", "CAST(", "DECLARE", "SELECT",
		"INSERT", "UPDATE", "DELETE", "DROP", "UNION",
		"1=1", "OR 1", "OR TRUE",
	}

	lowerInput := strings.ToLower(input)

	for _, pattern := range sqlPatterns {
		if strings.Contains(lowerInput, strings.ToLower(pattern)) {
			return false
		}
	}

	return true
}

// IsSecureImageFile memeriksa file gambar untuk keamanan
func IsSecureImageFile(data []byte, size int64, filename string) error {
	// Validasi ukuran
	if size <= 0 || size > 500*1024 {
		return errors.New("invalid file size")
	}

	// Validasi ekstensi file
	ext := strings.ToLower(filepath.Ext(filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		return errors.New("unsupported file extension")
	}

	// Validasi magic number
	if len(data) < 8 {
		return errors.New("file too small")
	}

	// JPEG magic number
	if (ext == ".jpg" || ext == ".jpeg") &&
		!(data[0] == 0xFF && data[1] == 0xD8 && data[2] == 0xFF) {
		return errors.New("invalid JPEG format")
	}

	// PNG magic number
	if ext == ".png" &&
		!(data[0] == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47 &&
			data[4] == 0x0D && data[5] == 0x0A && data[6] == 0x1A && data[7] == 0x0A) {
		return errors.New("invalid PNG format")
	}

	return nil
}

// GenerateSecureFilename menghasilkan nama file aman berdasarkan konten dan timestamp
func GenerateSecureFilename(data []byte, ext string) string {
	hash := sha256.Sum256(data)
	hashStr := hex.EncodeToString(hash[:])
	timestamp := time.Now().UnixNano()

	return fmt.Sprintf("%s_%d%s", hashStr[:16], timestamp, ext)
}
