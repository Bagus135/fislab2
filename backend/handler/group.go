package handler

import (
	"backend/prisma/db"
	"backend/types"
	"encoding/json"
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
	userRole, ok := r.Context().Value("role").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "role not found in context"})
		return
	}

	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{"error": "only SUPER_ADMIN and ADMIN can create groups"})
		return
	}

	var req struct {
		Name      int      `json:"kelompok"`
		MemberIDs []string `json:"member_ids"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	if req.Name == 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "name and member_ids are required"})
		return
	}

	// Buat group dulu
	group, err := h.client.Group.CreateOne(
		db.Group.Name.Set(req.Name),
	).Exec(r.Context())

	if err != nil {
		fmt.Printf("Error creating group: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to create group"})
		return
	}

	// Hubungkan members satu per satu
	for _, memberID := range req.MemberIDs {
		_, err = h.client.User.FindUnique(
			db.User.ID.Equals(memberID),
		).Update(
			db.User.MemberGroups.Link(
				db.Group.ID.Equals(group.ID),
			),
		).Exec(r.Context())

		if err != nil {
			fmt.Printf("Error linking member %s: %v\n", memberID, err)
		}
	}

	response := map[string]interface{}{
		"id":         group.ID,
		"kelompok":   group.Name,
		"member_ids": req.MemberIDs,
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
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
		fmt.Printf("Error fetching groups: %v\n", err)
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
	json.NewEncoder(w).Encode(response)
}

func (h *GroupHandler) GetGroupById(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	requestedGroupID := vars["id"]

	// Debugging
	fmt.Println("Requested Group ID:", requestedGroupID)

	if requestedGroupID == "" {
		// Jika tidak ada ID, tampilkan semua group
		groups, err := h.client.Group.FindMany().With(
			db.Group.Members.Fetch(),
		).Exec(r.Context())
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch groups"})
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
				"id":       group.ID,
				"kelompok": group.Name,
				"members":  members,
			})
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(response)
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
		json.NewEncoder(w).Encode(map[string]string{"error": "group not found"})
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
		"id":       group.ID,
		"kelompok": group.Name,
		"members":  members,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

//func (h *GroupHandler) UpdateGroup(w http.ResponseWriter, r *http.Request) {
//	// Ambil role dari context
//	userRole, ok := r.Context().Value("role").(string)
//	if !ok {
//		w.WriteHeader(http.StatusUnauthorized)
//		json.NewEncoder(w).Encode(map[string]string{"error": "role not found in context"})
//		return
//	}
//
//	// Periksa apakah user memiliki role yang diizinkan
//	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
//		w.WriteHeader(http.StatusForbidden)
//		json.NewEncoder(w).Encode(map[string]string{"error": "only SUPER_ADMIN and ADMIN can update groups"})
//		return
//	}
//
//	// Decode request body
//	var req struct {
//		Id        string   `json:"id"`
//		Name      int      `json:"name"`
//		MemberIDs []string `json:"member_ids"`
//	}
//
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
//		w.WriteHeader(http.StatusBadRequest)
//		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
//		return
//	}
//
//	// Validasi input
//	if req.Name == 0 || req.Id == "" {
//		w.WriteHeader(http.StatusBadRequest)
//		json.NewEncoder(w).Encode(map[string]string{"error": "name and id are required"})
//		return
//	}
//
//	// Update kelompok
//	updatedGroup, err := h.client.Group.FindUnique(
//		db.Group.ID.Equals(req.Id),
//	).With(
//		db.Group.Members.Fetch(), // Memuat relasi Members
//	).Update(
//		db.Group.Name.Set(req.Name),
//		db.Group.Members.Link(
//			db.User.ID.In(req.MemberIDs),
//		),
//	).Exec(r.Context())
//	if err != nil {
//		fmt.Printf("Error updating group: %v\n", err)
//		w.WriteHeader(http.StatusInternalServerError)
//		json.NewEncoder(w).Encode(map[string]string{"error": "failed to update group"})
//		return
//	}
//
//	// Buat response
//	response := map[string]interface{}{
//		"id":       updatedGroup.ID,
//		"kelompok": updatedGroup.Name,
//		"members":  updatedGroup.Members(),
//	}
//
//	// Kirim response sukses
//	w.WriteHeader(http.StatusOK)
//	json.NewEncoder(w).Encode(response)
//}
