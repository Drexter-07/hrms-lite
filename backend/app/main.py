"""FastAPI application entry point."""
import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from app.database import engine, Base
from app.routers import employees, attendance, dashboard


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
   
    MAX_RETRIES = 5
    RETRY_DELAY = 5 

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logger.info(f"🚀 Startup: Attempting database connection ({attempt}/{MAX_RETRIES})...")
            
            
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            
            logger.info("✅ Database connected and tables verified!")
            break  
            
        except (OperationalError, OSError, asyncio.TimeoutError) as e:
            if attempt == MAX_RETRIES:
                logger.error(f"❌ Database connection failed after {MAX_RETRIES} attempts.")
                raise e  
            
            logger.warning(f"⚠️ Connection failed (Database might be sleeping). Retrying in {RETRY_DELAY}s...")
            logger.warning(f"Error details: {e}")
            await asyncio.sleep(RETRY_DELAY)
            
    yield  

    logger.info("🛑 Shutting down application...")
    await engine.dispose()


app = FastAPI(
    title="HRMS Lite API",
    description="Lightweight HR system for employees and attendance",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://hrms-lite-phi-orcin.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router)
app.include_router(attendance.router)
app.include_router(dashboard.router)


@app.get("/health")
async def health():
    return {"status": "ok"}