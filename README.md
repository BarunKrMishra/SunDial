# HRMS Platform

A comprehensive Human Resource Management System built with Django REST Framework backend and React frontend.

## Features

- Employee Management
- Payroll Management
- Leave Management
- Attendance Tracking
- Performance Reviews
- Recruitment & Onboarding
- Employee Self-Service Portal
- Reporting & Analytics

## Tech Stack

### Backend
- Django 5.0
- Django REST Framework
- PostgreSQL
- JWT Authentication

### Frontend
- React
- Modern UI/UX

## Project Structure

```
HRMS/
├── backend/          # Django backend
├── frontend/         # React frontend
├── requirements.txt  # Python dependencies
└── README.md
```

## Setup Instructions

### Backend Setup

1. Create and activate virtual environment:
```bash
python -m venv venv
# Windows
.\venv\Scripts\Activate.ps1
# Linux/Mac
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run migrations:
```bash
cd backend
python manage.py migrate
```

4. Create superuser:
```bash
python manage.py createsuperuser
```

5. Run server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

## Docker (One Command)

Make sure you create a `.env` in the project root on the server (see example below).

Example `.env` (adjust IP/domain):
```env
SECRET_KEY=change-me
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,SERVER_IP_OR_DOMAIN
CORS_ALLOWED_ORIGINS=http://SERVER_IP_OR_DOMAIN:3000
VITE_API_URL=http://SERVER_IP_OR_DOMAIN:8000/api/v1
VITE_AUTH_URL=http://SERVER_IP_OR_DOMAIN:8000
```

1. Build and start:
```bash
docker compose up --build
```

2. Open:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1/

Optional (first-time admin user):
```bash
docker compose exec backend python manage.py createsuperuser
```

## API Documentation

API endpoints are available at `/api/v1/` when the backend server is running.

## License

MIT

