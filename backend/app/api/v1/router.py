from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    health,
    courses,
    student,
    quantum,
    ai,
    quizzes,
    challenges,
    instructor,
    ai_generation,
    personalization,
    achievements,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(courses.router)
api_router.include_router(student.router)
api_router.include_router(quantum.router)
api_router.include_router(ai.router)
api_router.include_router(quizzes.router)
api_router.include_router(challenges.router)
api_router.include_router(instructor.router)

# Phase 8 API Endpoints
api_router.include_router(ai_generation.router, prefix="/ai", tags=["AI Generation"])
api_router.include_router(personalization.router, prefix="/personalization", tags=["Personalization"])
api_router.include_router(achievements.router, prefix="/achievements", tags=["Achievements"])
