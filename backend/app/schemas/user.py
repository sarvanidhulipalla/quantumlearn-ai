from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    education_level: Optional[str] = None
    quantum_experience: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    education_level: Optional[str] = None
    quantum_experience: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserProfile(UserResponse):
    enrolled_courses_count: int = 0
    completed_lessons_count: int = 0
    total_points: int = 0
    achievements_count: int = 0
