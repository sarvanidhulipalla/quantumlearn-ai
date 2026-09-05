from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    full_name: str = Field(..., min_length=2, max_length=100)
    role: str = Field("Student", description="User role: 'Student' or 'Instructor'")
    education_level: Optional[str] = "Undergraduate"
    quantum_experience: Optional[str] = "Beginner (No background)"


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None


from app.schemas.user import UserResponse
Token.model_rebuild()
