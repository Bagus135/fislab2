package helper

import (
	"encoding/json"
	"net/http"
)

// ReadRequestBody function
func ReadRequestBody(r *http.Request, result interface{}) {
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(result)
	ErrorPanic(err)
}

// WriteRequestBody function
func WriteRequestBody(w http.ResponseWriter, response interface{}) {

	w.Header().Add("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	err := encoder.Encode(response)
	ErrorPanic(err)
}
