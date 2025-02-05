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

type GroupResponse struct {
	ID      string           `json:"id"`
	Name    int              `json:"kelompok"`
	Members []MemberResponse `json:"members"`
}

type MemberResponse struct {
	ID   string `json:"id"`
	NRP  string `json:"nrp"`
	Name string `json:"name"`
}
