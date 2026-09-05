import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.database.session import engine, SessionLocal, ensure_schema_migrations
from app.models import Base
from app.utils.seed import seed_demo_data

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("quantumlearn.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup & shutdown events."""
    logger.info("Initializing QuantumLearn AI platform database...")
    Base.metadata.create_all(bind=engine)
    ensure_schema_migrations()
    
    # Seed initial test & demo accounts
    db = SessionLocal()
    try:
        seed_demo_data(db)
        logger.info("Database initialized and demo curriculum verified.")
    except Exception as e:
        logger.error(f"Database startup seeding failed: {e}")
    finally:
        db.close()
    
    yield
    logger.info("Shutting down QuantumLearn AI backend service.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Configuration with strict origin list from settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Sanitizes unexpected exceptions to prevent leaking internal stack traces or DB statements.
    """
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred. Please try again or contact support."}
    )


# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": "Learn. Build. Run. Understand.",
        "version": settings.VERSION,
        "description": "Interactive Quantum Algorithm Learning Platform",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
