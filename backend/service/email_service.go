package service

import (
	"fmt"
	"gopkg.in/gomail.v2"
	"os"
)

type EmailService struct {
	dialer *gomail.Dialer
}

func NewEmailService() *EmailService {
	dialer := gomail.NewDialer(
		os.Getenv("SMTP_HOST"),
		587,
		os.Getenv("SMTP_EMAIL"),
		os.Getenv("SMTP_PASSWORD"),
	)

	return &EmailService{
		dialer: dialer,
	}
}

func (s *EmailService) SendVerificationCode(email, code string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", os.Getenv("SMTP_EMAIL"))
	m.SetHeader("To", email)
	m.SetHeader("Subject", "Kode Verifikasi Email")

	body := fmt.Sprintf(`
        <h2>Verifikasi Email</h2>
        <p>Kode verifikasi Anda adalah:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px;">%s</h1>
        <p>Kode ini akan kadaluarsa dalam 10 menit.</p>
        <p>Jika Anda tidak meminta kode ini, abaikan email ini.</p>
    `, code)

	m.SetBody("text/html", body)
	return s.dialer.DialAndSend(m)
}

func (s *EmailService) SendResetPasswordEmail(email, token string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", os.Getenv("SMTP_EMAIL"))
	m.SetHeader("To", email)
	m.SetHeader("Subject", "Reset Password")

	resetLink := fmt.Sprintf("%s/reset-password?token=%s", os.Getenv("APP_URL"), token)

	body := fmt.Sprintf(`
        <h2>Reset Password</h2>
        <p>Anda menerima email ini karena ada permintaan reset password untuk akun Anda.</p>
        <p>Klik link berikut untuk mereset password:</p>
        <p><a href="%s">Reset Password</a></p>
        <p>Link ini akan kadaluarsa dalam 10 menit.</p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        <br>
        <p>Atau copy link berikut ke browser Anda:</p>
        <p>%s</p>
    `, resetLink, resetLink)

	m.SetBody("text/html", body)
	return s.dialer.DialAndSend(m)
}
