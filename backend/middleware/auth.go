package middleware

import (
	"context"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"net/http"
)

func AuthMiddleware(jwtSecret string) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Ambil token dari header
			tokenString := r.Header.Get("Authorization")
			if tokenString == "" {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			// Validasi token
			token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				return []byte(jwtSecret), nil
			}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Name}))

			if err != nil || !token.Valid {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			// Simpan data user di context
			claims := token.Claims.(jwt.MapClaims)
			ctx := context.WithValue(r.Context(), "role", claims["role"])
			r = r.WithContext(ctx)

			// Lanjut ke handler berikutnya
			next.ServeHTTP(w, r)
		})
	}
}
