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
	OldPassword string `json:"old_password"` // Password lama
	NewPassword string `json:"new_password"` // Password baru
}
