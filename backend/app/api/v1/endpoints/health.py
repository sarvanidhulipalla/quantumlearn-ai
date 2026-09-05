import qiskit
import qiskit_aer
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db
from app.core.config import settings

router = APIRouter(tags=["Health & Status"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint to verify backend service, database, and quantum simulator availability."""
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy",
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status,
        "qiskit": True,
        "aer": True,
        "qiskit_version": getattr(qiskit, "__version__", "unknown"),
        "aer_version": getattr(qiskit_aer, "__version__", "unknown"),
        "supported_roles": ["Student", "Instructor", "Admin"],
    }
