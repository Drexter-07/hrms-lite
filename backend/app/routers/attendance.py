"""Attendance endpoints."""
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Employee, Attendance, AttendanceStatus
from app.schemas import AttendanceCreate, AttendanceResponse

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("/", response_model=AttendanceResponse)
async def mark_attendance(
    payload: AttendanceCreate,
    db: AsyncSession = Depends(get_db),
):
    """Mark attendance. Prevents duplicate entries for same employee on same date."""
    # Check employee exists
    emp_result = await db.execute(select(Employee).where(Employee.id == payload.employee_id))
    if not emp_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Employee not found.")

    # Check duplicate
    dup = await db.execute(
        select(Attendance).where(
            and_(
                Attendance.employee_id == payload.employee_id,
                Attendance.date == payload.date,
            )
        )
    )
    if dup.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="Attendance already recorded for this employee on this date.",
        )

    status_enum = AttendanceStatus.PRESENT if payload.status == "Present" else AttendanceStatus.ABSENT
    record = Attendance(
        employee_id=payload.employee_id,
        date=payload.date,
        status=status_enum,
    )
    
    db.add(record)
    
    await db.commit() 

    
    await db.refresh(record)
    return record


@router.get("/{employee_id}", response_model=list[AttendanceResponse])
async def get_attendance_history(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    from_date: date | None = Query(None, alias="from_date"),
    to_date: date | None = Query(None, alias="to_date"),
):
    """View attendance history for an employee."""
    emp_result = await db.execute(select(Employee).where(Employee.id == employee_id))
    if not emp_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Employee not found.")

    q = select(Attendance).where(Attendance.employee_id == employee_id)
    if from_date:
        q = q.where(Attendance.date >= from_date)
    if to_date:
        q = q.where(Attendance.date <= to_date)
    q = q.order_by(Attendance.date.desc())

    result = await db.execute(q)
    records = result.scalars().all()

    # Serialize with status as string
    return [
        AttendanceResponse(
            id=r.id,
            employee_id=r.employee_id,
            date=r.date,
            status=r.status.value,
        )
        for r in records
    ]
