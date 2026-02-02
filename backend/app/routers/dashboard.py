"""Dashboard stats endpoint."""
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models import Employee, Attendance, AttendanceStatus
from app.schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    query_date: date | None = Query(None)
    ):
    """Total employees and present today."""

    target_date = query_date or date.today()

    total_result = await db.execute(select(func.count(Employee.id)))
    total_employees = total_result.scalar() or 0

    
    present_result = await db.execute(
        select(func.count(Attendance.id)).where(
            Attendance.date == target_date,
            Attendance.status == AttendanceStatus.PRESENT,
        )
    )
    present_today = present_result.scalar() or 0

    return DashboardStats(total_employees=total_employees, present_today=present_today)
