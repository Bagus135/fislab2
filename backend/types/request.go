package types

type LoginRequest struct {
	NRP      string `json:"nrp"`
	Password string `json:"password"`
}

type RegisterSuperAdminRequest struct {
	NRP      string `json:"nrp"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	NRP      string `json:"nrp"`
	Name     string `json:"name"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type ChangePasswordRequest struct {
	OldPassword        string `json:"old_password"`
	NewPassword        string `json:"new_password"`
	ConfirmNewPassword string `json:"confirm_new_password"`
}

type SetScheduleRequest struct {
	PracticumCode string `json:"practicumCode"`
	GroupID       string `json:"groupId"`
	Date          string `json:"date"`      // Format: "2024-02-09"
	StartTime     string `json:"startTime"` // Format: "07:00"
}

type GradeRequest struct {
	ScheduleID        int    `json:"scheduleId"`
	UserID            string `json:"userId"`
	Punctuality       int    `json:"punctuality"`       // max 5
	PreExam           int    `json:"preExam"`           // max 10
	OralTest          int    `json:"oralTest"`          // max 10
	SkillsAndAttitude int    `json:"skillsAndAttitude"` // max 5
	Abstract          int    `json:"abstract"`          // max 5
	Introduction      int    `json:"introduction"`      // max 10
	Methodology       int    `json:"methodology"`       // max 5
	Discussion        int    `json:"discussion"`        // max 30
	DataProcessing    int    `json:"dataProcessing"`    // max 10
	Conclusion        int    `json:"conclusion"`        // max 5
	Formatting        int    `json:"formatting"`        // max 5
	Feedback          string `json:"feedback"`
}
