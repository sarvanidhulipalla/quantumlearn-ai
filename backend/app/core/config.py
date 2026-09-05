import os
from typing import List, Union
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "QuantumLearn AI"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Interactive Quantum Algorithm Learning Platform — SIH 26140 Specification"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Security & JWT
    SECRET_KEY: str = os.getenv("JWT_SECRET", "quantumlearn-ai-super-secret-jwt-key-2026-xyz")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7)))  # 7 days
    
    # Database (Supports SQLite and PostgreSQL)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./quantumlearn.db")
    
    # CORS Configuration
    CORS_ALLOWED_ORIGINS: str = os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.CORS_ALLOWED_ORIGINS:
            return ["http://localhost:5173", "http://localhost:3000"]
        return [origin.strip() for origin in self.CORS_ALLOWED_ORIGINS.split(",") if origin.strip()]

    # AI Service Settings
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-1.5-flash")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-004")
    AI_RATE_LIMIT_PER_MINUTE: int = int(os.getenv("AI_RATE_LIMIT_PER_MINUTE", "60"))
    
    # Quantum Simulator Security Limits
    DEFAULT_SHOTS: int = 1024
    MIN_QUBITS: int = 1
    MAX_QUBITS: int = 12
    MIN_CLBITS: int = 0
    MAX_CLBITS: int = 12
    MIN_SHOTS: int = 128
    MAX_SHOTS: int = 8192
    MAX_CIRCUIT_GATES: int = 100

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"


settings = Settings()
