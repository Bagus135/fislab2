# Praktikum Management System

A comprehensive system for managing laboratory practicals in educational institutions. Built with Go, PostgreSQL, Prisma, and Redis.

## Tech Stack

- **Backend**: Go (Golang)
- **Database**: PostgreSQL
- **ORM**: Prisma Client Go
- **Session Management**: Redis
- **Authentication**: JWT + Redis Session
- **Email**: SMTP (Gmail)

## Features

- **User Management**
  - Multi-role system (SUPER_ADMIN, ADMIN, ASISTEN, PRAKTIKAN)
  - Secure authentication and authorization
  - Password reset via email
  - Profile management
  - Profile picture upload

- **Practicum Management**
  - Create and manage practical courses
  - Assign assistants to practicals
  - Group management
  - Schedule management

- **Attendance System**
  - Generate unique attendance codes
  - Track attendance status (HADIR, SAKIT, IZIN, TIDAK_HADIR)
  - View attendance reports

- **Grading System**
  - Multi-component grading (prelab, inlab, report components)
  - Grade tracking
  - Analytics and reporting

- **Announcements**
  - Create and manage course announcements
  - Targeted announcements

## Prerequisites

- Go 1.19 or higher
- PostgreSQL 14 or higher
- Redis 6 or higher
- SMTP credentials for email functionality

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/praktikum-system.git
cd praktikum-system
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # If applicable

# JWT
JWT_SECRET=your-secret-key

# SMTP (for email functionality)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Use Gmail App Password

# Application
FRONTEND_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
go mod download
go install github.com/steebchen/prisma-client-go
```

### 4. Generate Prisma Client

```bash
go run github.com/steebchen/prisma-client-go generate
```

**Important Note**: After generating Prisma client, you may need to patch certain methods in the generated files. If you encounter errors related to missing methods, run the provided patch script:

```bash
./scripts/patch_gen.sh
```

### 5. Set Up Database

```bash
go run github.com/steebchen/prisma-client-go migrate dev
```

### 6. Run the Application

```bash
go run main.go
```

### 7. Initial Setup

After running the application for the first time, create the first SUPER_ADMIN user:

```bash
curl -X POST http://localhost:8080/api/register-first-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "nrp": "admin123",
    "name": "Super Admin",
    "password": "your_password",
    "confirm_password": "your_password"
  }'
```

## Redis Setup

Redis is used for session management and caching. Make sure Redis is running before starting the application.

### Install Redis

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# macOS
brew install redis

# Windows
# Download and install from https://redis.io/download
```

### Start Redis Service

```bash
# Ubuntu/Debian
sudo systemctl start redis-server

# macOS
brew services start redis

# Windows
redis-server
```

### Test Redis Connection

```bash
redis-cli ping
# Should return "PONG"
```

## SMTP Setup (Gmail)

For email functionality (password reset, verification), set up SMTP with Gmail:

1. Create/use a Gmail account
2. Enable 2-Step Verification at https://myaccount.google.com/security
3. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Other" as the app and name it (e.g., "Praktikum System")
   - Copy the 16-character password
4. Use this App Password in your `.env` file for `SMTP_PASSWORD`

## API Documentation

### Authentication

- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `POST /api/register-first-super-admin` - Register the first SUPER_ADMIN
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password with token
- `PUT /api/change-password` - Change password (authenticated)

### User Management

- `GET /api/profile` - Get current user profile
- `GET /api/profile/{id}` - Get user profile by ID
- `PUT /api/profile` - Update user profile
- `POST /api/profile/picture` - Upload profile picture

### Practicum Management

- `GET /api/practicum` - Get all practicums
- `POST /api/admin/practicum` - Create practicum (admin only)
- `PUT /api/admin/practicum` - Update practicum (admin only)
- `DELETE /api/admin/practicum` - Delete practicum (admin only)

### Assistant Management

- `GET /api/admin/assistant` - Get all assistants
- `POST /api/admin/assistant/practicum` - Assign assistant to practicum
- `POST /api/admin/assistant/group` - Assign assistant to group

### Schedule Management

- `GET /api/schedule` - Get schedules
- `PUT /api/assistant/set-schedule` - Set schedule (assistant only)
- `POST /api/assistant/schedule/mark-finished` - Mark schedule as finished

### Attendance Management

- `POST /api/assistant/attendance/generate` - Generate attendance code
- `POST /api/attendance` - Submit attendance
- `GET /api/assistant/attendance/status/{id}` - Get attendance status
- `PUT /api/assistant/attendance/update` - Update attendance

### Grading

- `POST /api/assistant/grade` - Create/update grade
- `GET /api/grade` - Get grades
- `GET /api/grade/{id}` - Get grade details

### Announcements

- `GET /api/announcement` - Get all announcements
- `POST /api/announcement` - Create announcement
- `PUT /api/announcement` - Update announcement
- `DELETE /api/announcement` - Delete announcement

## Deployment

### Server Requirements

- 1+ vCPU
- 2+ GB RAM
- 20+ GB Storage
- Ubuntu 20.04 LTS or newer

### Deployment Steps

1. Set up a VPS with the requirements above
2. Install required software (Go, PostgreSQL, Redis, Nginx)
3. Clone the repository
4. Set up environment variables
5. Generate Prisma client
6. Build the application
7. Set up Nginx as a reverse proxy
8. Set up SSL with Let's Encrypt
9. Configure firewall
10. Set up systemd service

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributors

- [Your Name](https://github.com/yourusername)
