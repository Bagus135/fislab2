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
