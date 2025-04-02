package handler

import (
	"backend/prisma/db"
	"backend/types"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"sort"
	"strconv"
	"time"
)

type GradeHandler struct {
	client *db.PrismaClient
}

func NewGradeHandler(client *db.PrismaClient) *GradeHandler {
	return &GradeHandler{client: client}
}

func validateScore(component string, score int, maxScore int) error {
	if score < 0 || score > maxScore {
		return fmt.Errorf("%s score must be between 0 and %d", component, maxScore)
	}
	return nil
}

func (h *GradeHandler) CreateGrade(w http.ResponseWriter, r *http.Request) {
	userRole := r.Context().Value("role").(string)
	assistantId := r.Context().Value("userID").(string)

	if userRole != "ASISTEN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "you cannot grade practicants"})
		return
	}

	var req types.GradeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request format"})
		return
	}

	// Cek apakah ada nilai yang diinput (> 0)
	hasGrade := false
	if req.Punctuality > 0 || req.PreExam > 0 || req.OralTest > 0 ||
		req.SkillsAndAttitude > 0 || req.Abstract > 0 || req.Introduction > 0 ||
		req.Methodology > 0 || req.Discussion > 0 || req.DataProcessing > 0 ||
		req.Conclusion > 0 || req.Formatting > 0 {
		hasGrade = true
	}

	if !hasGrade {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"error": "at least one component must be graded",
		})
		return
	}

	// Cek apakah semua komponen sudah dinilai
	isCompleted := req.Punctuality > 0 && req.PreExam > 0 && req.OralTest > 0 &&
		req.SkillsAndAttitude > 0 && req.Abstract > 0 && req.Introduction > 0 &&
		req.Methodology > 0 && req.Discussion > 0 && req.DataProcessing > 0 &&
		req.Conclusion > 0 && req.Formatting > 0

	// Validasi nilai yang diinput (hanya yang > 0)
	scoreValidations := []struct {
		component string
		score     int
		maxScore  int
	}{
		{"punctuality", req.Punctuality, 5},
		{"preExam", req.PreExam, 10},
		{"oralTest", req.OralTest, 10},
		{"skillsAndAttitude", req.SkillsAndAttitude, 5},
		{"abstract", req.Abstract, 5},
		{"introduction", req.Introduction, 10},
		{"methodology", req.Methodology, 5},
		{"discussion", req.Discussion, 30},
		{"dataProcessing", req.DataProcessing, 10},
		{"conclusion", req.Conclusion, 5},
		{"formatting", req.Formatting, 5},
	}

	// Hanya validasi nilai yang diinput (> 0)
	for _, v := range scoreValidations {
		if v.score > 0 {
			if v.score > v.maxScore {
				w.WriteHeader(http.StatusBadRequest)
				_ = json.NewEncoder(w).Encode(map[string]string{
					"error": fmt.Sprintf("%s score cannot exceed %d", v.component, v.maxScore),
				})
				return
			}
		}
	}

	// Hitung total untuk setiap kategori
	prelabTotal := req.Punctuality + req.PreExam + req.OralTest
	inlabTotal := req.SkillsAndAttitude
	postlabTotal := req.Abstract + req.Introduction + req.Methodology + req.Discussion +
		req.DataProcessing + req.Conclusion + req.Formatting

	totalScore := prelabTotal + inlabTotal + postlabTotal

	if totalScore > 100 {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "total score cannot exceed 100"})
		return
	}

	// Validasi schedule dan asisten
	schedule, err := h.client.Schedule.FindFirst(
		db.Schedule.ID.Equals(req.ScheduleID),
	).Exec(r.Context())

	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "schedule not found"})
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to check schedule"})
		return
	}

	if schedule.AssistantID != assistantId {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "you can only grade your own schedules"})
		return
	}

	if schedule.Status != db.StatusFinished {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "anda harus klik selesai sebelum melakukan penilaian"})
		return
	}

	// Validasi praktikan ada di grup
	group, err := h.client.Group.FindUnique(
		db.Group.ID.Equals(schedule.GroupID),
	).With(
		db.Group.Members.Fetch(),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to check group"})
		return
	}

	memberFound := false
	for _, member := range group.Members() {
		if member.ID == req.UserID {
			memberFound = true
			break
		}
	}

	if !memberFound {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "user is not a member of this group"})
		return
	}

	// Cek nilai yang sudah ada
	existingGrade, err := h.client.Grade.FindFirst(
		db.Grade.ScheduleID.Equals(req.ScheduleID),
		db.Grade.UserID.Equals(req.UserID),
	).Exec(r.Context())

	if err == nil && existingGrade != nil {
		w.WriteHeader(http.StatusConflict)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "grade already exists for this user"})
		return
	}

	// Buat grade baru
	_, err = h.client.Grade.CreateOne(
		db.Grade.Schedule.Link(db.Schedule.ID.Equals(req.ScheduleID)),
		db.Grade.User.Link(db.User.ID.Equals(req.UserID)),
		db.Grade.Grader.Link(db.User.ID.Equals(assistantId)),
		db.Grade.Punctuality.Set(req.Punctuality),
		db.Grade.PreExam.Set(req.PreExam),
		db.Grade.OralTest.Set(req.OralTest),
		db.Grade.SkillsAndAttitude.Set(req.SkillsAndAttitude),
		db.Grade.Abstract.Set(req.Abstract),
		db.Grade.Introduction.Set(req.Introduction),
		db.Grade.Methodology.Set(req.Methodology),
		db.Grade.Discussion.Set(req.Discussion),
		db.Grade.DataProcessing.Set(req.DataProcessing),
		db.Grade.Conclusion.Set(req.Conclusion),
		db.Grade.Formatting.Set(req.Formatting),
		db.Grade.Feedback.Set(req.Feedback),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to create grade"})
		return
	}

	// Cek apakah semua anggota grup sudah dinilai dan semua nilai lengkap
	allGrades, err := h.client.Grade.FindMany(
		db.Grade.ScheduleID.Equals(req.ScheduleID),
	).Exec(r.Context())

	if err == nil && len(allGrades) == len(group.Members()) {
		// Cek apakah semua nilai lengkap
		allCompleted := true
		for _, grade := range allGrades {
			if punctuality, ok := grade.Punctuality(); !ok || punctuality == 0 {
				allCompleted = false
				break
			}
		}

		if allCompleted {
			_, err := h.client.Schedule.FindUnique(
				db.Schedule.ID.Equals(req.ScheduleID),
			).Update(
				db.Schedule.Status.Set(db.StatusCompleted),
			).Exec(r.Context())

			if err != nil {
				log.Printf("Warning: Failed to update schedule status: %v", err)
			}
		}
	}

	// Response sesuai status
	var message string
	if isCompleted {
		message = "grade completed"
	} else {
		message = "grade created"
	}

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": message,
	})
}

func (h *GradeHandler) GetGrades(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	userRole := r.Context().Value("role").(string)
	userID := r.Context().Value("userID").(string)

	if userRole != "PRAKTIKAN" && userRole != "ASISTEN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	// Helper function untuk mengambil nilai
	getGradeValue := func(valueFunc func() (int, bool)) int {
		if value, ok := valueFunc(); ok {
			return value
		}
		return 0
	}

	if userRole == "PRAKTIKAN" {
		grades, err := h.client.Grade.FindMany(
			db.Grade.UserID.Equals(userID),
		).With(
			db.Grade.Schedule.Fetch().With(
				db.Schedule.Practicum.Fetch(),
				db.Schedule.Assistant.Fetch(),
			),
		).Exec(r.Context())

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch grades"})
			return
		}

		var response []map[string]interface{}
		for _, grade := range grades {
			schedule := grade.Schedule()

			// Hitung total menggunakan helper function
			totalScore := getGradeValue(grade.Punctuality) +
				getGradeValue(grade.PreExam) +
				getGradeValue(grade.OralTest) +
				getGradeValue(grade.SkillsAndAttitude) +
				getGradeValue(grade.Abstract) +
				getGradeValue(grade.Introduction) +
				getGradeValue(grade.Methodology) +
				getGradeValue(grade.Discussion) +
				getGradeValue(grade.DataProcessing) +
				getGradeValue(grade.Conclusion) +
				getGradeValue(grade.Formatting)

			gradeData := map[string]interface{}{
				"gradeId": grade.ID,
				"code":    schedule.Practicum().ID,
				"title":   schedule.Practicum().Title,
				"assistant": map[string]interface{}{
					"id":   schedule.Assistant().ID,
					"name": schedule.Assistant().Name,
					"nrp":  schedule.Assistant().Nrp,
				},
				"totalScore": totalScore,
				"gradedAt":   grade.CreatedAt.Format("2006-01-02 15:04"),
			}
			response = append(response, gradeData)
		}

		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(response)
		return
	}

	// Logic untuk asisten
	schedules, err := h.client.Schedule.FindMany(
		db.Schedule.AssistantID.Equals(userID),
	).With(
		db.Schedule.Group.Fetch().With(
			db.Group.Members.Fetch(),
		),
		db.Schedule.Grades.Fetch().With(
			db.Grade.User.Fetch(),
		),
		db.Schedule.Practicum.Fetch(),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch schedules"})
		return
	}

	var response []map[string]interface{}
	for _, schedule := range schedules {
		group := schedule.Group()
		grades := schedule.Grades()
		groupMembers := group.Members()

		// Map untuk menyimpan nilai mahasiswa yang sudah dinilai
		gradedMembers := make(map[string]map[string]interface{})

		// Proses nilai yang sudah ada
		for _, grade := range grades {
			student := grade.User()
			totalScore := getGradeValue(grade.Punctuality) +
				getGradeValue(grade.PreExam) +
				getGradeValue(grade.OralTest) +
				getGradeValue(grade.SkillsAndAttitude) +
				getGradeValue(grade.Abstract) +
				getGradeValue(grade.Introduction) +
				getGradeValue(grade.Methodology) +
				getGradeValue(grade.Discussion) +
				getGradeValue(grade.DataProcessing) +
				getGradeValue(grade.Conclusion) +
				getGradeValue(grade.Formatting)

			gradedMembers[student.ID] = map[string]interface{}{
				"gradeId":    grade.ID,
				"id":         student.ID,
				"name":       student.Name,
				"nrp":        student.Nrp,
				"totalScore": totalScore,
				"gradedAt":   grade.CreatedAt.Format("2006-01-02 15:04"),
			}
		}

		var members []map[string]interface{}
		// Loop melalui semua anggota grup
		for _, member := range groupMembers {
			if gradedMember, exists := gradedMembers[member.ID]; exists {
				members = append(members, gradedMember)
			} else {
				members = append(members, map[string]interface{}{
					"gradeId":    nil,
					"id":         member.ID,
					"name":       member.Name,
					"nrp":        member.Nrp,
					"totalScore": nil,
					"gradedAt":   nil,
				})
			}
		}

		// Urutkan members berdasarkan NRP
		sort.Slice(members, func(i, j int) bool {
			return members[i]["nrp"].(string) < members[j]["nrp"].(string)
		})

		weekValue := 0
		if week, ok := schedule.Week(); ok {
			weekValue = week
		}

		scheduleData := map[string]interface{}{
			"scheduleId": schedule.ID,
			"week":       weekValue,
			"group":      group.Name,
			"practicum": map[string]interface{}{
				"code":  schedule.Practicum().ID,
				"title": schedule.Practicum().Title,
			},
			"members": members,
		}

		response = append(response, scheduleData)
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

func (h *GradeHandler) GetGradeDetail(w http.ResponseWriter, r *http.Request) {
	userRole := r.Context().Value("role").(string)
	userID := r.Context().Value("userID").(string)

	vars := mux.Vars(r)
	gradeID, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid grade ID"})
		return
	}

	grade, err := h.client.Grade.FindUnique(
		db.Grade.ID.Equals(gradeID),
	).With(
		db.Grade.Schedule.Fetch().With(
			db.Schedule.Practicum.Fetch(),
			db.Schedule.Assistant.Fetch(),
		),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "grade not found"})
		return
	}

	// Validasi akses
	if userRole == "PRAKTIKAN" && grade.UserID != userID {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "you can only view your own grades"})
		return
	}

	if userRole == "ASISTEN" && grade.Schedule().AssistantID != userID {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "you can only view grades you gave"})
		return
	}

	schedule := grade.Schedule()
	punctuality, _ := grade.Punctuality()
	preExam, _ := grade.PreExam()
	oralTest, _ := grade.OralTest()
	skillsAndAttitude, _ := grade.SkillsAndAttitude()
	abstract, _ := grade.Abstract()
	introduction, _ := grade.Introduction()
	methodology, _ := grade.Methodology()
	discussion, _ := grade.Discussion()
	dataProcessing, _ := grade.DataProcessing()
	conclusion, _ := grade.Conclusion()
	formatting, _ := grade.Formatting()
	feedback, _ := grade.Feedback()

	// Hitung total untuk setiap kategori
	prelabTotal := punctuality + preExam + oralTest
	inlabTotal := skillsAndAttitude
	postlabTotal := abstract + introduction + methodology + discussion + dataProcessing + conclusion + formatting
	totalScore := prelabTotal + inlabTotal + postlabTotal

	practicum := schedule.Practicum()
	assistant := schedule.Assistant()

	response := map[string]interface{}{
		"gradeId": grade.ID,
		"practicum": map[string]interface{}{
			"id":    practicum.ID,
			"title": practicum.Title,
		},
		"assistant": map[string]interface{}{
			"name": assistant.Name,
			"nrp":  assistant.Nrp,
		},
		"scores": map[string]interface{}{
			"prelab": map[string]interface{}{
				"punctuality": punctuality,
				"preExam":     preExam,
				"oralTest":    oralTest,
				"total":       prelabTotal,
			},
			"inlab": map[string]interface{}{
				"skillsAndAttitude": skillsAndAttitude,
				"total":             inlabTotal,
			},
			"postlab": map[string]interface{}{
				"abstract":       abstract,
				"introduction":   introduction,
				"methodology":    methodology,
				"discussion":     discussion,
				"dataProcessing": dataProcessing,
				"conclusion":     conclusion,
				"formatting":     formatting,
				"total":          postlabTotal,
			},
			"totalScore": totalScore,
		},
		"feedback": feedback,
		"gradedAt": grade.CreatedAt,
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

func (h *GradeHandler) UpdateGrade(w http.ResponseWriter, r *http.Request) {
	userRole := r.Context().Value("role").(string)
	assistantId := r.Context().Value("userID").(string)

	if userRole != "ASISTEN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	// Extract grade ID from URL parameters
	vars := mux.Vars(r)
	gradeId, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid grade ID"})
		return
	}

	// Get the existing grade
	existingGrade, err := h.client.Grade.FindUnique(
		db.Grade.ID.Equals(gradeId),
	).With(
		db.Grade.Schedule.Fetch(),
		db.Grade.User.Fetch(),
	).Exec(r.Context())

	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "grade not found"})
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to retrieve grade"})
		return
	}

	// Verify the assistant is authorized to update this grade
	if existingGrade.GradedBy != assistantId {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "you can only update grades you created"})
		return
	}

	// Check if the grade's schedule is completed
	schedule := existingGrade.Schedule()
	if schedule.Status == db.StatusCompleted {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "cannot update grade for completed schedule"})
		return
	}

	// Decode the update request
	var req types.UpdateGradeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request format"})
		return
	}

	// Validate the scores
	scoreValidations := []struct {
		component string
		score     int
		maxScore  int
	}{
		{"punctuality", req.Punctuality, 5},
		{"preExam", req.PreExam, 10},
		{"oralTest", req.OralTest, 10},
		{"skillsAndAttitude", req.SkillsAndAttitude, 5},
		{"abstract", req.Abstract, 5},
		{"introduction", req.Introduction, 10},
		{"methodology", req.Methodology, 5},
		{"discussion", req.Discussion, 30},
		{"dataProcessing", req.DataProcessing, 10},
		{"conclusion", req.Conclusion, 5},
		{"formatting", req.Formatting, 5},
	}

	for _, v := range scoreValidations {
		if err := validateScore(v.component, v.score, v.maxScore); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
	}

	// Calculate totals
	prelabTotal := req.Punctuality + req.PreExam + req.OralTest
	inlabTotal := req.SkillsAndAttitude
	postlabTotal := req.Abstract + req.Introduction + req.Methodology + req.Discussion +
		req.DataProcessing + req.Conclusion + req.Formatting
	totalScore := prelabTotal + inlabTotal + postlabTotal

	if totalScore > 100 {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "total score cannot exceed 100"})
		return
	}

	// Update the grade
	_, err = h.client.Grade.FindUnique(
		db.Grade.ID.Equals(gradeId),
	).Update(
		db.Grade.Punctuality.Set(req.Punctuality),
		db.Grade.PreExam.Set(req.PreExam),
		db.Grade.OralTest.Set(req.OralTest),
		db.Grade.SkillsAndAttitude.Set(req.SkillsAndAttitude),
		db.Grade.Abstract.Set(req.Abstract),
		db.Grade.Introduction.Set(req.Introduction),
		db.Grade.Methodology.Set(req.Methodology),
		db.Grade.Discussion.Set(req.Discussion),
		db.Grade.DataProcessing.Set(req.DataProcessing),
		db.Grade.Conclusion.Set(req.Conclusion),
		db.Grade.Formatting.Set(req.Formatting),
		db.Grade.Feedback.Set(req.Feedback),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("failed to update grade: %v", err)})
		return
	}

	// Cek apakah semua komponen sudah dinilai
	isCompleted := req.Punctuality > 0 && req.PreExam > 0 && req.OralTest > 0 &&
		req.SkillsAndAttitude > 0 && req.Abstract > 0 && req.Introduction > 0 &&
		req.Methodology > 0 && req.Discussion > 0 && req.DataProcessing > 0 &&
		req.Conclusion > 0 && req.Formatting > 0

	message := "grade updated"
	if isCompleted {
		message = "grade completed"
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": message,
	})
}

func (h *GradeHandler) GetAllGrades(w http.ResponseWriter, r *http.Request) {
	userRole := r.Context().Value("role").(string)

	// Only SUPER_ADMIN and ADMIN can view all grades
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "unauthorized access"})
		return
	}

	// Get all practicums
	practicums, err := h.client.Practicum.FindMany().Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch practicums"})
		return
	}

	// Helper to safely get grade values
	getGradeValue := func(valueFunc func() (int, bool)) int {
		if value, ok := valueFunc(); ok {
			return value
		}
		return 0
	}

	// For storing the final response
	type StudentData struct {
		ID    string         `json:"id"`
		Nama  string         `json:"nama"`
		NRP   string         `json:"nrp"`
		Nilai map[string]int `json:"nilai"`
	}

	type Response struct {
		Data []StudentData `json:"data"`
	}

	var finalResponse Response
	studentMap := make(map[string]*StudentData) // studentID -> student data

	// For each practicum
	for _, practicum := range practicums {
		practicumCode := practicum.ID // This is string (MP1, MP2, etc.)

		// Get all schedules for this practicum
		schedules, err := h.client.Schedule.FindMany(
			db.Schedule.PracticumID.Equals(practicum.ID),
		).Exec(r.Context())

		if err != nil {
			continue // Skip if error
		}

		// Get all grades for these schedules
		var grades []db.GradeModel
		if len(schedules) > 0 {
			scheduleIDs := make([]int, len(schedules))
			for i, s := range schedules {
				scheduleIDs[i] = s.ID // Schedule ID is int
			}

			grades, err = h.client.Grade.FindMany(
				db.Grade.ScheduleID.In(scheduleIDs),
			).With(
				db.Grade.User.Fetch(),
			).Exec(r.Context())

			if err != nil {
				continue // Skip if error
			}
		}

		// Process grades for this practicum
		for _, grade := range grades {
			studentID := grade.UserID

			// Initialize student data if not exists
			if _, exists := studentMap[studentID]; !exists {
				student := grade.User()
				studentMap[studentID] = &StudentData{
					ID:    studentID,
					Nama:  student.Name,
					NRP:   student.Nrp,
					Nilai: make(map[string]int),
				}
			}

			// Calculate total score for this practicum
			totalScore := getGradeValue(grade.Punctuality) +
				getGradeValue(grade.PreExam) +
				getGradeValue(grade.OralTest) +
				getGradeValue(grade.SkillsAndAttitude) +
				getGradeValue(grade.Abstract) +
				getGradeValue(grade.Introduction) +
				getGradeValue(grade.Methodology) +
				getGradeValue(grade.Discussion) +
				getGradeValue(grade.DataProcessing) +
				getGradeValue(grade.Conclusion) +
				getGradeValue(grade.Formatting)

			// Add score for this practicum
			studentMap[studentID].Nilai[practicumCode] = totalScore
		}
	}

	// Convert map to slice
	for _, student := range studentMap {
		finalResponse.Data = append(finalResponse.Data, *student)
	}

	// Sort students by name
	sort.Slice(finalResponse.Data, func(i, j int) bool {
		return finalResponse.Data[i].Nama < finalResponse.Data[j].Nama
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(finalResponse)
}

func (h *GradeHandler) GetAssistantGradingProgress(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	userRole := r.Context().Value("role").(string)
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		respondWithError(w, http.StatusForbidden, "only admins can access this endpoint")
		return
	}

	// Get assistantId from path
	vars := mux.Vars(r)
	assistantId := vars["id"]

	// Get assistant info
	assistant, err := h.client.User.FindUnique(
		db.User.ID.Equals(assistantId),
	).Exec(ctx)
	if err != nil {
		handleAssistantError(w, err)
		return
	}

	// Verify assistant role
	if assistant.Role != "ASISTEN" {
		respondWithError(w, http.StatusBadRequest, "user is not an assistant")
		return
	}

	// Get ALL assigned groups
	schedules, err := h.client.Schedule.FindMany(
		db.Schedule.AssistantID.Equals(assistantId),
	).With(
		db.Schedule.Group.Fetch().With(
			db.Group.Members.Fetch(),
		),
		db.Schedule.Grades.Fetch(),
	).Exec(ctx)
	if err != nil {
		log.Printf("Failed to fetch schedules: %v", err)
		respondWithError(w, http.StatusInternalServerError, "failed to fetch schedules")
		return
	}

	// Prepare response
	groupStatus := make(map[int]bool)
	completedGroups := 0

	// Process each group
	for _, schedule := range schedules {
		group := schedule.Group()
		grades := schedule.Grades()
		members := group.Members()

		// Check if all members are graded
		gradedCount := 0
		for _, member := range members {
			for _, grade := range grades {
				if grade.UserID == member.ID {
					gradedCount++
					break
				}
			}
		}

		isComplete := len(members) > 0 && gradedCount == len(members)
		groupStatus[group.Name] = isComplete
		if isComplete {
			completedGroups++
		}
	}

	// Build response
	response := map[string]interface{}{
		"assistant": map[string]interface{}{
			"id":   assistant.ID,
			"name": assistant.Name,
			"nrp":  assistant.Nrp,
		},
		"progress": fmt.Sprintf("%d/%d", completedGroups, len(schedules)),
		"groups":   groupStatus,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
	}
}

func handleAssistantError(w http.ResponseWriter, err error) {
	if errors.Is(err, db.ErrNotFound) {
		respondWithError(w, http.StatusNotFound, "assistant not found")
	} else {
		log.Printf("Failed to fetch assistant: %v", err)
		respondWithError(w, http.StatusInternalServerError, "failed to fetch assistant information")
	}
}
