package types

type LoginRequest struct {
	NRP      string `json:"nrp"`
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

type CreateScheduleRequest struct {
	PracticumID int    `json:"practicumId"`
	GroupID     string `json:"groupId"`
	Date        string `json:"date"`      // Format: "2024-02-09"
	StartTime   string `json:"startTime"` // Format: "07:00"
}

type GradeRequest struct {
	ScheduleID   int    `json:"scheduleId"`
	UserID       string `json:"userId"`
	Prelab       int    `json:"prelab"`       // max 30
	Inlab        int    `json:"inlab"`        // max 5
	Abstract     int    `json:"abstract"`     // max 5
	Introduction int    `json:"introduction"` // max 10
	Methodology  int    `json:"methodology"`  // max 5
	Discussion   int    `json:"discussion"`   // max 30
	Conclusion   int    `json:"conclusion"`   // max 10
	Formatting   int    `json:"formatting"`   // max 5
	Feedback     string `json:"feedback"`
}
