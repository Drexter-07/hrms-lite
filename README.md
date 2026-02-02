# HRMS Lite

A lightweight HR system to manage employees and track daily attendance.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Axios, React Router
- **Backend:** FastAPI, PostgreSQL, SQLAlchemy (Async), Pydantic
- **Database:** PostgreSQL

## Project Structure

```
├── backend/           # FastAPI app
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routers/
│   │       ├── employees.py
│   │       ├── attendance.py
│   │       └── dashboard.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/          # React (Vite) app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── .env.example
└── README.md
```

## Setup

### 1. Database

Create a PostgreSQL database and set the connection URL:

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env: DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/hrms_lite
```

### 2. Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Tables are created automatically on startup.

### 3. Frontend

```bash
cd frontend
npm install
# Optional: cp .env.example .env and set VITE_API_URL if backend runs elsewhere
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/employees/`       | Add employee |
| GET    | `/employees/`       | List all employees |
| DELETE | `/employees/{id}`   | Remove employee (cascade delete attendance) |
| POST   | `/attendance/`      | Mark attendance (no duplicate per employee/date) |
| GET    | `/attendance/{employee_id}` | Attendance history |
| GET    | `/dashboard/stats`  | Total employees & present today |

## Features

- **Dashboard:** Total Employees, Present Today
- **Employees:** Table with Delete; Add Employee modal with validation (email format, non-empty fields)
- **Attendance:** Select employee, date, Present/Absent; view history by employee

No authentication (single Admin assumed). Use environment variables for `DATABASE_URL` and optional `VITE_API_URL`.
