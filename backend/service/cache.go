package service

import (
	"context"
	"github.com/redis/go-redis/v9"
	"os"
	"time"
)

type CacheService struct {
	client *redis.Client
}

func NewCacheService() *CacheService {
	client := redis.NewClient(
		&redis.Options{
			Addr: os.Getenv("REDIS_URL")})

	return &CacheService{client: client}
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
