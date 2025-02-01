package utils

import (
	"github.com/golang-jwt/jwt/v4"
	"time"
)

type Claims struct {
	UserID string `json:"id"`
	NRP    string `json:"nrp"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func GenerateTokens(UserID string, nrp string, role string, secretkey string) (string, error) {
	claims := Claims{
		UserID: UserID,
		NRP:    nrp,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}
	Token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return Token.SignedString([]byte(secretkey))
}
