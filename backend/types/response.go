package types

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   interface{} `json:"error,omitempty"`
}

type LoginResponse struct {
	Token string     `json:"token"`
	User  UserDetail `json:"user"`
}

type ErrorResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type UserDetail struct {
	ID   string `json:"id"`
	NRP  string `json:"nrp"`
	Name string `json:"name"`
	Role string `json:"role"`
}

func ErrorAuth(code int, message string) Response {
	return Response{
		Success: false,
		Message: message,
		Error: ErrorResponse{
			Code:    code,
			Message: message,
		},
	}
}

func SuccessLogin(token string, user UserDetail) Response {
	return Response{
		Success: true,
		Message: "Login successful",
		Data: LoginResponse{
			Token: token,
			User:  user,
		},
	}
}
