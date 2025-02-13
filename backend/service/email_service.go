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

// service/email_service.go

func (s *EmailService) SendResetPasswordEmail(email, token string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", os.Getenv("SMTP_EMAIL"))
	m.SetHeader("To", email)
	m.SetHeader("Subject", "Reset Password")

	// Gunakan FRONTEND_URL dari env untuk mengarah ke aplikasi frontend
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", os.Getenv("FRONTEND_URL"), token)

	body := fmt.Sprintf(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
                <h2 style="color: #2c3e50; margin-bottom: 20px;">Reset Password</h2>
                <p>Anda menerima email ini karena ada permintaan reset password untuk akun Anda.</p>
                <p>Klik tombol berikut untuk mereset password Anda:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="%s" 
                       style="background-color: #3498db; 
                              color: white; 
                              padding: 12px 30px; 
                              text-decoration: none; 
                              border-radius: 5px;
                              font-weight: bold;
                              display: inline-block;">
                        Reset Password
                    </a>
                </div>

                <p style="margin-top: 20px;">Link ini akan kadaluarsa dalam 10 menit.</p>
                <p style="color: #7f8c8d;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #7f8c8d;">
                    Jika tombol di atas tidak berfungsi, copy dan paste link berikut ke browser Anda:<br>
                    <a href="%s" style="color: #3498db; word-break: break-all;">%s</a>
                </p>
            </div>
        </body>
        </html>
    `, resetLink, resetLink, resetLink)

	m.SetBody("text/html", body)
	return s.dialer.DialAndSend(m)
}
