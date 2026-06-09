package handlers

import (
	"encoding/json"
	"sync"
	"time"
)

type cacheEntry struct {
	data      []byte
	expiresAt time.Time
}

var (
	cacheMu   sync.RWMutex
	cache     = make(map[string]*cacheEntry)
	cacheTTL  = 5 * time.Minute
)

func CacheGet(key string) ([]byte, bool) {
	cacheMu.RLock()
	entry, ok := cache[key]
	cacheMu.RUnlock()
	if !ok || time.Now().After(entry.expiresAt) {
		return nil, false
	}
	return entry.data, true
}

func CacheSet(key string, data interface{}) {
	bytes, err := json.Marshal(data)
	if err != nil {
		return
	}
	cacheMu.Lock()
	cache[key] = &cacheEntry{data: bytes, expiresAt: time.Now().Add(cacheTTL)}
	cacheMu.Unlock()
}

func CacheInvalidate(prefix string) {
	cacheMu.Lock()
	for k := range cache {
		if len(prefix) == 0 || (len(k) >= len(prefix) && k[:len(prefix)] == prefix) {
			delete(cache, k)
		}
	}
	cacheMu.Unlock()
}
