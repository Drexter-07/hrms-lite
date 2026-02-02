"""Pydantic request/response schemas with validation."""
from datetime import date
from pydantic import BaseModel, Field, field_validator
import re


# --- Employee Schemas ---
class EmployeeBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., max_length=255)
    department: str = Field(..., min_length=1, max_length=255)

    @field_validator("full_name", "department")
    @classmethod
    def non_empty_strip(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(pattern, v):
            raise ValueError("Invalid email format")
        return v.strip().lower()


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeResponse(EmployeeBase):
    id: int

    class Config:
        from_attributes = True


# --- Attendance Schemas ---
class AttendanceBase(BaseModel):
    employee_id: int
    date: date
    status: str = Field(..., pattern="^(Present|Absent)$")

    @field_validator("status")
    @classmethod
    def normalize_status(cls, v: str) -> str:
        return v.strip().capitalize()


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceResponse(AttendanceBase):
    id: int

    class Config:
        from_attributes = True


# --- Dashboard ---
class DashboardStats(BaseModel):
    total_employees: int
    present_today: int
