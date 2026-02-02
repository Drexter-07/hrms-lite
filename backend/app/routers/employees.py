"""Employee CRUD endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Employee
from app.schemas import EmployeeCreate, EmployeeResponse

router = APIRouter(prefix="/employees", tags=["employees"])


@router.post("/", response_model=EmployeeResponse)
async def create_employee(
    payload: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
):
    """Add a new employee."""
    employee = Employee(
        full_name=payload.full_name,
        email=payload.email,
        department=payload.department,
    )
    db.add(employee)
    try:
        await db.flush()
        await db.refresh(employee)
        return employee
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail="An employee with this email already exists.",
        )


@router.get("/", response_model=list[EmployeeResponse])
async def list_employees(db: AsyncSession = Depends(get_db)):
    """List all employees."""
    result = await db.execute(select(Employee).order_by(Employee.id))
    return result.scalars().all()


@router.delete("/{employee_id}", status_code=204)
async def delete_employee(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Remove an employee (cascade deletes attendance)."""
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    employee = result.scalar_one_or_none()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found.")
    await db.delete(employee)
    return None
