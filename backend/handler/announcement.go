package handler

import (
	"backend/prisma/db"
	"encoding/json"
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
	userRole, ok := r.Context().Value("role").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	_, err := h.client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Exec(r.Context())
	if err != nil {
		log.Printf("Error finding user: %v\n", err)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	var req struct {
		Title   string `json:"title"`
		Content string `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	_, err = h.client.Announcement.CreateOne(
		db.Announcement.Title.Set(req.Title),
		db.Announcement.Content.Set(req.Content),
		db.Announcement.Author.Link(
			db.User.ID.Equals(userID),
		),
	).Exec(r.Context())
	if err != nil {
		log.Printf("Error creating announcement: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to create announcement"})
		return
	}

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "announcement created"})
}

func (h *AnnouncementHandler) GetAnnouncements(w http.ResponseWriter, r *http.Request) {
	announcements, err := h.client.Announcement.FindMany().
		OrderBy(
			db.Announcement.CreatedAt.Order(db.SortOrderDesc),
		).
		With(
			db.Announcement.Author.Fetch(),
		).
		Exec(r.Context())
	if err != nil {
		log.Printf("Error getting announcements: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	var response []map[string]interface{}
	for _, a := range announcements {
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

	_, err := h.client.Announcement.FindUnique(
		db.Announcement.ID.Equals(req.ID),
	).Update(
		db.Announcement.Title.Set(req.Title),
		db.Announcement.Content.Set(req.Content),
	).Exec(r.Context())

	if err != nil {
		log.Printf("Error updating announcement: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "announcement updated"})
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

	_, err := h.client.Announcement.FindUnique(
		db.Announcement.ID.Equals(req.ID),
	).Delete().Exec(r.Context())
	if err != nil {
		log.Printf("Error deleting announcement: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "announcement deleted"})
}
