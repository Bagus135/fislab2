package service

import (
	"context"
	"errors"
	"fmt"
	"github.com/redis/go-redis/v9"
	"time"
)

type CacheService struct {
	client *redis.Client
}

func NewCacheService() *CacheService {
	client := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
	})

	return &CacheService{
		client: client,
	}
}

func (s *CacheService) Set(key string, value string, expiration time.Duration) error {
	return s.client.Set(context.Background(), key, value, expiration).Err()
}

func (s *CacheService) Get(key string) (string, error) {
	return s.client.Get(context.Background(), key).Result()
}

func (s *CacheService) Delete(key string) error {
	return s.client.Del(context.Background(), key).Err()
}

func (s *CacheService) SetResetPasswordToken(email string, token string) error {
	key := fmt.Sprintf("reset_password:%s", token)
	return s.Set(key, email, 10*time.Minute)
}

func (s *CacheService) GetResetPasswordEmail(token string) (string, error) {
	key := fmt.Sprintf("reset_password:%s", token)

	email, err := s.Get(key)
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return "", fmt.Errorf("token not found or expired")
		}
		return "", fmt.Errorf("failed to get reset password token: %v", err)
	}

	// Hapus token setelah digunakan
	_ = s.Delete(key)

	return email, nil
}

func (s *CacheService) StoreSession(userID string, token string, expiration time.Duration) error {
	key := fmt.Sprintf("session:%s", userID)
	return s.client.Set(context.Background(), key, token, expiration).Err()
}

func (s *CacheService) GetSession(userID string) (string, error) {
	key := fmt.Sprintf("session:%s", userID)
	return s.client.Get(context.Background(), key).Result()
}

func (s *CacheService) RemoveSession(userID string) error {
	key := fmt.Sprintf("session:%s", userID)
	return s.client.Del(context.Background(), key).Err()
}
