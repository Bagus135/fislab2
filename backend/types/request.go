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
