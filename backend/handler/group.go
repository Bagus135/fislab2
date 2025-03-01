package handler

import (
	"backend/prisma/db"
	"backend/types"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
)

type GroupHandler struct {
	client *db.PrismaClient
}

func NewGroupHandler(client *db.PrismaClient) *GroupHandler {
	return &GroupHandler{client: client}
}

func (h *GroupHandler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole, ok := r.Context().Value("role").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "unauthorized"})
		return
	}

	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	var req struct {
		Name      int      `json:"group"`
		MemberIDs []string `json:"member_ids"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request format"})
		return
	}

	if req.Name == 0 {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "group number is required"})
		return
	}

	if len(req.MemberIDs) == 0 {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "member_ids cannot be empty"})
		return
	}

	// Cek apakah nomor kelompok sudah ada
	existingGroup, err := h.client.Group.FindFirst(
		db.Group.Name.Equals(req.Name),
	).Exec(r.Context())

	if err != nil && !errors.Is(err, db.ErrNotFound) {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to check existing group"})
		return
	}

	if existingGroup != nil {
		w.WriteHeader(http.StatusConflict)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("group with number %d already exists", req.Name)})
		return
	}

	// Validasi semua user sebelum membuat group
	validUsers := make([]db.UserModel, 0)
	for _, memberName := range req.MemberIDs {
		user, err := h.client.User.FindUnique(
			db.User.ID.Equals(memberName),
		).With(
			db.User.MemberGroups.Fetch(),
		).Exec(r.Context())

		if err != nil {
			if errors.Is(err, db.ErrNotFound) {
				w.WriteHeader(http.StatusBadRequest)
				_ = json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("user with name %s not found", memberName)})
				return
			}
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to validate user"})
			return
		}

		// Cek role user (harus PRAKTIKAN)
		if user.Role != "PRAKTIKAN" {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("user %s is not a PRAKTIKAN", memberName)})
			return
		}

		// Cek apakah user sudah terdaftar di kelompok lain
		if len(user.MemberGroups()) > 0 {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("user %s is already in another group", memberName)})
			return
		}

		validUsers = append(validUsers, *user)
	}

	// Setelah validasi berhasil, buat group
	group, err := h.client.Group.CreateOne(
		db.Group.Name.Set(req.Name),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to create group"})
		return
	}

	// Link semua member yang sudah divalidasi
	for _, user := range validUsers {
		_, err = h.client.User.FindUnique(
			db.User.ID.Equals(user.ID),
		).Update(
			db.User.MemberGroups.Link(
				db.Group.ID.Equals(group.ID),
			),
		).Exec(r.Context())

		if err != nil {
			// Log error tapi lanjutkan proses
			fmt.Printf("Error linking member %s: %v\n", user.ID, err)
		}
	}

	// Ambil data group yang sudah dibuat beserta membernya
	createdGroup, err := h.client.Group.FindUnique(
		db.Group.ID.Equals(group.ID),
	).With(
		db.Group.Members.Fetch(),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch created group"})
		return
	}

	filteredMembers := make([]map[string]string, 0)
	for _, member := range createdGroup.Members() {
		filteredMembers = append(filteredMembers, map[string]string{
			"nrp":  member.Nrp,
			"name": member.Name,
		})
	}

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "group created"})
}

func (h *GroupHandler) GetAllGroups(w http.ResponseWriter, r *http.Request) {
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

	// Ambil semua kelompok dari database
	groups, err := h.client.Group.FindMany().With(
		db.Group.Members.Fetch(),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	var response []types.GroupResponse
	for _, group := range groups {
		// Format members
		var members []types.MemberResponse
		for _, member := range group.Members() {
			members = append(members, types.MemberResponse{
				ID:   member.ID,
				NRP:  member.Nrp,
				Name: member.Name,
			})
		}

		// Add group to response
		response = append(response, types.GroupResponse{
			ID:      group.ID,
			Name:    group.Name,
			Members: members,
		})
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

func (h *GroupHandler) GetGroupById(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	requestedGroupID := vars["id"]

	if requestedGroupID == "" {
		// Jika tidak ada ID, tampilkan semua group
		groups, err := h.client.Group.FindMany().With(
			db.Group.Members.Fetch(),
		).Exec(r.Context())
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch groups"})
			return
		}

		var response []map[string]interface{}
		for _, group := range groups {
			var members []map[string]string
			for _, member := range group.Members() {
				members = append(members, map[string]string{
					"id":   member.ID,
					"nrp":  member.Nrp,
					"name": member.Name,
				})
			}

			response = append(response, map[string]interface{}{
				"id":      group.ID,
				"group":   group.Name,
				"members": members,
			})
		}

		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(response)
		return
	}

	// Jika ada ID, tampilkan detail group tersebut
	group, err := h.client.Group.FindUnique(
		db.Group.ID.Equals(requestedGroupID),
	).With(
		db.Group.Members.Fetch(),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "group not found"})
		return
	}

	var members []map[string]string
	for _, member := range group.Members() {
		members = append(members, map[string]string{
			"id":   member.ID,
			"nrp":  member.Nrp,
			"name": member.Name,
		})
	}

	response := map[string]interface{}{
		"id":      group.ID,
		"group":   group.Name,
		"members": members,
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

func (h *GroupHandler) UpdateGroup(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole, ok := r.Context().Value("role").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "role not found in context"})
		return
	}

	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	var req struct {
		Id        string   `json:"id"`
		Name      int      `json:"group"`
		MemberIDs []string `json:"member_ids"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	if req.Name == 0 || req.Id == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "name and id are required"})
		return
	}

	// Validasi semua user baru
	validUsers := make([]db.UserModel, 0)
	for _, memberName := range req.MemberIDs {
		user, err := h.client.User.FindUnique(
			db.User.ID.Equals(memberName),
		).With(
			db.User.MemberGroups.Fetch(),
		).Exec(r.Context())

		if err != nil {
			if errors.Is(err, db.ErrNotFound) {
				w.WriteHeader(http.StatusBadRequest)
				_ = json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("user with name %s not found", memberName)})
				return
			}
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to validate user"})
			return
		}

		// Cek role user (harus PRAKTIKAN)
		if user.Role != "PRAKTIKAN" {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("user %s is not a PRAKTIKAN", memberName)})
			return
		}

		// Cek apakah user sudah di kelompok lain (kecuali kelompok yang sedang diupdate)
		if len(user.MemberGroups()) > 0 {
			for _, group := range user.MemberGroups() {
				if group.ID != req.Id {
					w.WriteHeader(http.StatusBadRequest)
					_ = json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("user %s is already in another group", memberName)})
					return
				}
			}
		}

		validUsers = append(validUsers, *user)
	}

	// Hapus semua relasi member lama
	existingGroup, err := h.client.Group.FindUnique(
		db.Group.ID.Equals(req.Id),
	).With(
		db.Group.Members.Fetch(),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch existing group"})
		return
	}

	// Unlink semua member lama satu per satu
	for _, member := range existingGroup.Members() {
		_, err = h.client.User.FindUnique(
			db.User.ID.Equals(member.ID),
		).Update(
			db.User.MemberGroups.Unlink(
				db.Group.ID.Equals(req.Id),
			),
		).Exec(r.Context())

		if err != nil {
			fmt.Printf("Error unlinking member %s: %v\n", member.ID, err)
		}
	}

	// Update nama group
	group, err := h.client.Group.FindUnique(
		db.Group.ID.Equals(req.Id),
	).Update(
		db.Group.Name.Set(req.Name),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update group"})
		return
	}

	// Link member baru satu per satu
	for _, user := range validUsers {
		_, err = h.client.User.FindUnique(
			db.User.ID.Equals(user.ID),
		).Update(
			db.User.MemberGroups.Link(
				db.Group.ID.Equals(group.ID),
			),
		).Exec(r.Context())

		if err != nil {
			fmt.Printf("Error linking member %s: %v\n", user.ID, err)
		}
	}

	// Ambil data group yang sudah diupdate
	_, err = h.client.Group.FindUnique(
		db.Group.ID.Equals(group.ID),
	).With(
		db.Group.Members.Fetch(),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch updated group"})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "group updated"})
}

func (h *GroupHandler) DeleteGroup(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Ambil role dari context
	userRole := r.Context().Value("role").(string)
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("you are not allowed to delete groups"))
		return
	}

	// Parse request body
	var req struct {
		GroupID string `json:"groupId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("invalid request"))
		return
	}

	// Validasi input
	if req.GroupID == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("group_id is required"))
		return
	}

	// Hapus kelompok
	_, err := h.client.Group.FindUnique(
		db.Group.ID.Equals(req.GroupID),
	).Delete().Exec(r.Context())

	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(types.ErrorResponse("group not found"))
		} else {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to delete group"))
		}
		return
	}

	// Kirim response sukses
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(types.SuccessResponse("group deleted"))
}
