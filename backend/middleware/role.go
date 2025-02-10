package middleware

import (
	"net/http"
)

func RoleCheck(roles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Ambil role dari context
			userRole := r.Context().Value("role").(string)

			// Cek apakah role user ada dalam daftar roles yang diizinkan
			allowed := false
			for _, role := range roles {
				if userRole == role {
					allowed = true
					break
				}
			}

			if !allowed {
				http.Error(w, "Forbidden", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
