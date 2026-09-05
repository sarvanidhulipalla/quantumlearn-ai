from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from app.core.config import settings

# Configure engine based on SQLite or PostgreSQL
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def ensure_schema_migrations():
    """Safely adds newly added tables and columns to SQLite if they do not already exist."""
    from sqlalchemy import text
    from app.database.base import Base
    import app.models  # Ensure all model classes are imported
    Base.metadata.create_all(bind=engine)
    try:
        with engine.connect() as conn:
            # Check quizzes columns
            try:
                res = conn.execute(text("PRAGMA table_info(quizzes)")).fetchall()
                existing_cols = [r[1] for r in res]
                if existing_cols:
                    if "is_published" not in existing_cols:
                        conn.execute(text("ALTER TABLE quizzes ADD COLUMN is_published BOOLEAN DEFAULT 1 NOT NULL"))
                    if "creator_id" not in existing_cols:
                        conn.execute(text("ALTER TABLE quizzes ADD COLUMN creator_id INTEGER REFERENCES users(id)"))
                    conn.commit()
            except Exception:
                pass

            # Check challenges columns
            try:
                res = conn.execute(text("PRAGMA table_info(challenges)")).fetchall()
                existing_cols = [r[1] for r in res]
                if existing_cols:
                    if "is_published" not in existing_cols:
                        conn.execute(text("ALTER TABLE challenges ADD COLUMN is_published BOOLEAN DEFAULT 1 NOT NULL"))
                    if "creator_id" not in existing_cols:
                        conn.execute(text("ALTER TABLE challenges ADD COLUMN creator_id INTEGER REFERENCES users(id)"))
                    conn.commit()
            except Exception:
                pass

            # Check achievements columns
            try:
                res = conn.execute(text("PRAGMA table_info(achievements)")).fetchall()
                existing_cols = [r[1] for r in res]
                if existing_cols:
                    if "criteria_type" not in existing_cols:
                        conn.execute(text("ALTER TABLE achievements ADD COLUMN criteria_type VARCHAR(50) DEFAULT 'custom' NOT NULL"))
                    if "criteria_target" not in existing_cols:
                        conn.execute(text("ALTER TABLE achievements ADD COLUMN criteria_target VARCHAR(100)"))
                    if "criteria_threshold" not in existing_cols:
                        conn.execute(text("ALTER TABLE achievements ADD COLUMN criteria_threshold INTEGER DEFAULT 1 NOT NULL"))
                    conn.commit()
            except Exception:
                pass
    except Exception:
        pass


def get_db() -> Generator[Session, None, None]:
    """Dependency for obtaining database sessions per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
