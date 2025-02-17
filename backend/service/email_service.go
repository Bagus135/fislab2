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
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body {
					font-family: Arial, sans-serif;
					background-color: #f4f4f4;
					margin: 0;
					padding: 0;
				}
				.container {
					max-width: 600px;
					margin: 20px auto;
					background-color: #ffffff;
					padding: 20px;
					border-radius: 8px;
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
				}
				h2 {
					color: #333333;
					text-align: center;
				}
				h1 {
					font-size: 32px;
					letter-spacing: 5px;
					text-align: center;
					color: #007BFF;
					margin: 20px 0;
				}
				p {
					color: #555555;
					line-height: 1.6;
					text-align: center;
				}
				.footer {
					margin-top: 20px;
					font-size: 12px;
					color: #888888;
					text-align: center;
				}
			</style>
		</head>
		<body>
			<div class="container">
				<h2>Verifikasi Email</h2>
				<p>Kode verifikasi Anda adalah:</p>
				<h1>%s</h1>
				<p>Kode ini akan kadaluarsa dalam <strong>10 menit</strong>.</p>
				<p>Jika Anda tidak meminta kode ini, abaikan email ini.</p>
				<div class="footer">
					<p>&copy; 2025 Fisika Laboratorium Departemen Fisika ITS.</p>
				</div>
			</div>
		</body>
		</html>
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

	// Template HTML dengan CSS inline
	body := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<style>
				body {
					font-family: Arial, sans-serif;
					background-color: #f4f4f4;
					margin: 0;
					padding: 0;
				}
				.container {
					max-width: 600px;
					margin: 20px auto;
					background-color: #ffffff;
					padding: 30px;
					border-radius: 10px;
					box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
				}
				h2 {
					color: #2c3e50;
					text-align: center;
					margin-bottom: 20px;
				}
				p {
					color: #555555;
					line-height: 1.6;
					margin: 10px 0;
				}
				.button {
					display: inline-block;
					background-color: #3498db;
					color: white;
					padding: 12px 30px;
					text-decoration: none;
					border-radius: 5px;
					font-weight: bold;
					text-align: center;
					margin: 20px 0;
				}
				.button:hover {
					background-color: #2980b9;
				}
				.footer {
					margin-top: 20px;
					font-size: 12px;
					color: #7f8c8d;
					text-align: center;
				}
				.link {
					color: #3498db;
					word-break: break-all;
				}
				hr {
					border: none;
					border-top: 1px solid #eee;
					margin: 20px 0;
				}
			</style>
		</head>
		<body>
			<div class="container">
				<h2>Reset Password</h2>
				<p>Anda menerima email ini karena ada permintaan reset password untuk akun Anda.</p>
				<p>Klik tombol berikut untuk mereset password Anda:</p>
				<div style="text-align: center;">
					<a href="%s" class="button">Reset Password</a>
				</div>
				<p>Link ini akan kadaluarsa dalam <strong>10 menit</strong>.</p>
				<p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
				<hr>
				<p class="footer">
					Jika tombol di atas tidak berfungsi, copy dan paste link berikut ke browser Anda:<br>
					<a href="%s" class="link">%s</a>
				</p>
			</div>
		</body>
		</html>
	`, resetLink, resetLink, resetLink)

	m.SetBody("text/html", body)
	return s.dialer.DialAndSend(m)
}
