package handler

import (
	"backend/prisma/db"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type AnnouncementHandler struct {
	client *db.PrismaClient
}

func NewAnnouncementHandler(client *db.PrismaClient) *AnnouncementHandler {
	return &AnnouncementHandler{client: client}
}

func (h *AnnouncementHandler) CreateAnnouncement(w http.ResponseWriter, r *http.Request) {
	// Ambil role dari context
	userRole, ok := r.Context().Value("role").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	// Periksa apakah user memiliki role yang diizinkan
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	// Ambil userID dari context
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	// Periksa apakah user dengan ID tersebut ada di database
	_, err := h.client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Exec(r.Context())
	if err != nil {
		fmt.Printf("Error finding user: %v\n", err)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	// Decode request body
	var req struct {
		Title   string `json:"title"`
		Content string `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	// Buat announcement
	_, err = h.client.Announcement.CreateOne(
		db.Announcement.Title.Set(req.Title),
		db.Announcement.Content.Set(req.Content),
		db.Announcement.Author.Link(
			db.User.ID.Equals(userID),
		),
	).Exec(r.Context())
	if err != nil {
		fmt.Printf("Error creating announcement: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to create announcement"})
		return
	}

	// Kirim response sukses
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "announcement created"})
}

func (h *AnnouncementHandler) GetAnnouncements(w http.ResponseWriter, r *http.Request) {
	announcement, err := h.client.Announcement.FindMany().With(
		db.Announcement.Author.Fetch(),
	).Exec(r.Context())
	if err != nil {
		fmt.Printf("Error getting announcement: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	var response []map[string]interface{}
	for _, a := range announcement {
		var authorName string
		if a.Author() != nil {
			authorName = a.Author().Name
		} else {
			authorName = "Unknown"
		}
		response = append(response, map[string]interface{}{
			"id":         a.ID,
			"title":      a.Title,
			"content":    a.Content,
			"author":     authorName,
			"created_at": a.CreatedAt,
			"updated_at": a.UpdatedAt,
		})
	}
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

func (h *AnnouncementHandler) UpdateAnnouncement(w http.ResponseWriter, r *http.Request) {
	userRole, ok := r.Context().Value("role").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}
	var req struct {
		ID      int    `json:"id"`
		Title   string `json:"title"`
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}
	// update announcement
	announcement, err := h.client.Announcement.FindUnique(
		db.Announcement.ID.Equals(req.ID),
	).Update(
		db.Announcement.Title.Set(req.Title),
		db.Announcement.Content.Set(req.Content),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Printf("Error updating announcement: %v\n", err)
		return
	}
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"message": "announcement updated"})
	_ = json.NewEncoder(w).Encode(announcement)
}

func (h *AnnouncementHandler) DeleteAnnouncement(w http.ResponseWriter, r *http.Request) {
	userRole, ok := r.Context().Value("role").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}
	var req struct {
		ID int `json:"id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	announcement, err := h.client.Announcement.FindUnique(
		db.Announcement.ID.Equals(req.ID),
	).Exec(r.Context())
	if err != nil {
		log.Println("Error fetching announcement:", err)
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "announcement not found"})
		return
	}
	_, err = h.client.Announcement.FindUnique(
		db.Announcement.ID.Equals(announcement.ID),
	).Delete().Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println("Error deleting announcement:", err)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"message": "announcement deleted"})

}
