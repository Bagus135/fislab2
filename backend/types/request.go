package types

type LoginRequest struct {
	NRP      string `json:"nrp"`
	Password string `json:"password"`
}
