"""Dashboard stats endpoint."""
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models import Employee, Attendance, AttendanceStatus
from app.schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """Total employees and present today."""
    total_result = await db.execute(select(func.count(Employee.id)))
    total_employees = total_result.scalar() or 0

    today = date.today()
    present_result = await db.execute(
        select(func.count(Attendance.id)).where(
            Attendance.date == today,
            Attendance.status == AttendanceStatus.PRESENT,
        )
    )
    present_today = present_result.scalar() or 0

    return DashboardStats(total_employees=total_employees, present_today=present_today)
