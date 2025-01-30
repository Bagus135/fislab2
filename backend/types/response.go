package types

type Response struct {
	Token string `json:"token,omitempty"`
	Error string `json:"error,omitempty"`
}

func ErrorResponse(message string) Response {
	return Response{
		Error: message,
	}
}

func SuccessResponse(token string) Response {
	return Response{
		Token: token,
	}
}
