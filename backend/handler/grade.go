package handler

import (
	"backend/prisma/db"
	"backend/types"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"strconv"
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
		return
	}

	var req types.GradeRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request format"})
		return
	}

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

	schedule, err := h.client.Schedule.FindFirst(
		db.Schedule.ID.Equals(req.ScheduleID),
	).Exec(r.Context())

	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			fmt.Printf("Schedule not found: %v\n", err)
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "schedule not found"})
			return
		}
		fmt.Printf("Error finding schedule: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to check schedule"})
		return
	}

	if schedule.AssistantID != assistantId {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	// Cek apakah user ada dalam misspoke
	group, err := h.client.Group.FindUnique(
		db.Group.ID.Equals(schedule.GroupID),
	).With(
		db.Group.Members.Fetch(),
	).Exec(r.Context())

	if err != nil {
		fmt.Printf("Error finding group: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to check group members"})
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
		_ = json.NewEncoder(w).Encode(map[string]string{
			"error": fmt.Sprintf("user %s is not a member of group %s", req.UserID, schedule.GroupID),
		})
		return
	}

	// Cek nilai yang sudah ada
	existingGrade, err := h.client.Grade.FindFirst(
		db.Grade.ScheduleID.Equals(req.ScheduleID),
		db.Grade.UserID.Equals(req.UserID),
	).Exec(r.Context())

	// Hanya cek error selain NotFound
	if err != nil && !errors.Is(err, db.ErrNotFound) {
		fmt.Printf("Error checking existing grade: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to check existing grade"})
		return
	}

	if existingGrade != nil {
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
		fmt.Printf("Error creating grade: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("failed to create grade: %v", err)})
		return
	}
	allGrades, err := h.client.Grade.FindMany(db.Grade.ScheduleID.Equals(req.ScheduleID)).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to check all grades"})
		return
	}

	if len(allGrades) == len(group.Members()) {
		_, err := h.client.Schedule.FindUnique(
			db.Schedule.ID.Equals(req.ScheduleID),
		).Update(
			db.Schedule.Status.Set(db.StatusCompleted),
		).Exec(r.Context())

		if err != nil {
			fmt.Printf("Error updating schedule status: %v\n", err)
		}
	}
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "grading success"})
}

func (h *GradeHandler) GetGrades(w http.ResponseWriter, r *http.Request) {
	userRole := r.Context().Value("role").(string)
	userID := r.Context().Value("userID").(string)

	if userRole != "PRAKTIKAN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	grades, err := h.client.Grade.FindMany(
		db.Grade.UserID.Equals(userID),
	).With(
		db.Grade.Schedule.Fetch().With(
			db.Schedule.Practicum.Fetch(),
			db.Schedule.Assistant.Fetch(),
		),
	).OrderBy(
		db.Grade.CreatedAt.Order(db.SortOrderDesc),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch grades"})
		return
	}

	var response []map[string]interface{}
	for _, grade := range grades {
		schedule := grade.Schedule()

		// Ambil nilai dengan menggunakan fungsi getter untuk field nullable
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

		gradeData := map[string]interface{}{
			"id": grade.ID,
			"practicum": map[string]interface{}{
				"id":    schedule.Practicum().ID,
				"title": schedule.Practicum().Title,
			},
			"assistant": map[string]interface{}{
				"name": schedule.Assistant().Name,
				"nrp":  schedule.Assistant().Nrp,
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
		response = append(response, gradeData)
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
		"id": grade.ID,
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
	var req types.GradeRequest
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

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "grade updated"})
}

func (h *GradeHandler) GetAssistantScoringDetails(w http.ResponseWriter, r *http.Request) {
	// Pastikan hanya admin yang bisa mengakses endpoint ini
	userRole := r.Context().Value("role").(string)
	if userRole != "ADMIN" && userRole != "SUPER_ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	requestedUserID := vars["id"]

	if requestedUserID == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "id is required"})
		return
	}

	// Ambil semua jadwal yang terkait dengan asisten ini
	schedules, err := h.client.Schedule.FindMany(
		db.Schedule.AssistantID.Equals(requestedUserID),
	).With(
		db.Schedule.Group.Fetch(),
		db.Schedule.Grades.Fetch(),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch schedules"})
		return
	}

	// Siapkan response
	response := make(map[string]interface{})
	groupDetails := make([]map[string]interface{}, 0)

	for _, schedule := range schedules {
		group := schedule.Group()
		grades := schedule.Grades()

		// Hitung jumlah anggota grup
		memberCount := len(group.Members())

		// Hitung jumlah nilai yang sudah diberikan
		gradedCount := len(grades)

		// Ambil status dari jadwal
		scheduleStatus := schedule.Status

		// Tentukan status penilaian dan pesan berdasarkan status jadwal
		var status, message string

		switch scheduleStatus {
		case db.StatusUnscheduled:
			status = "UNSCHEDULED"
			message = "Belum dijadwalkan"
		case db.StatusScheduled:
			status = "SCHEDULED"
			message = "Belum dilaksanakan"
		case db.StatusFinished:
			status = "FINISHED"
			message = "Selesai"
		case db.StatusCompleted:
			status = "COMPLETED"
			message = "Sudah dilaksanakan"
		case db.StatusCancelled:
			status = "CANCELLED"
			message = "Dibatalkan"
		default:
			status = "UNSCHEDULED"
			message = "Belum dijadwalkan"
		}

		// Tambahkan detail grup ke response
		groupDetails = append(groupDetails, map[string]interface{}{
			"groupId":      group.ID,
			"groupName":    group.Name,
			"memberCount":  memberCount,
			"gradedCount":  gradedCount,
			"status":       status,
			"message":      message,
			"scheduleId":   schedule.ID,
			"practicumId":  schedule.PracticumID,
			"scheduleDate": schedule.Date,
		})
	}

	response["assistantId"] = requestedUserID
	response["groups"] = groupDetails

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}
