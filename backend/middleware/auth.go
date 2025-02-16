package middleware

import (
	"backend/service"
	"backend/types"
	"backend/utils"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
)

func AuthMiddleware(secretKey string, cacheService *service.CacheService) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")

			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				w.WriteHeader(http.StatusUnauthorized)
				_ = json.NewEncoder(w).Encode(types.ErrorResponse("missing token"))
				return
			}

			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			tokenString = strings.TrimSpace(tokenString)

			claims := &utils.Claims{}
			token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
				}
				return []byte(secretKey), nil
			})

			if err != nil {
				fmt.Printf("Token Parse Error: %v\n", err)
				w.WriteHeader(http.StatusUnauthorized)
				_ = json.NewEncoder(w).Encode(types.ErrorResponse("invalid token"))
				return
			}

			if !token.Valid {
				fmt.Printf("Token Invalid\n")
				w.WriteHeader(http.StatusUnauthorized)
				_ = json.NewEncoder(w).Encode(types.ErrorResponse("invalid token"))
				return
			}

			// Debug: print claims after parsing
			fmt.Printf("Parsed Claims: %+v\n", claims)

			// Verify Redis session
			storedToken, err := cacheService.GetSession(claims.UserID)
			if err != nil {
				fmt.Printf("Redis Error: %v\n", err)
				w.WriteHeader(http.StatusUnauthorized)
				_ = json.NewEncoder(w).Encode(types.ErrorResponse("session expired"))
				return
			}

			if storedToken != tokenString {
				fmt.Printf("Token Mismatch - Stored: %s, Current: %s\n", storedToken, tokenString)
				w.WriteHeader(http.StatusUnauthorized)
				_ = json.NewEncoder(w).Encode(types.ErrorResponse("invalid session"))
				return
			}

			// Create new context with values
			newCtx := context.WithValue(r.Context(), "userID", claims.UserID)
			newCtx = context.WithValue(newCtx, "nrp", claims.NRP)
			newCtx = context.WithValue(newCtx, "role", claims.Role)

			// Debug: verify context values
			fmt.Printf("Context Values Set - UserID: %v, NRP: %v, Role: %v\n",
				newCtx.Value("userID"),
				newCtx.Value("nrp"),
				newCtx.Value("role"),
			)

			// Use the new context
			next.ServeHTTP(w, r.WithContext(newCtx))
		})
	}
}
