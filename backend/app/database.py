from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

# Use pg8000 driver instead of psycopg2 for Windows compatibility
if "://" in settings.DATABASE_URL and not settings.DATABASE_URL.startswith("postgresql+"):
    engine = create_engine(f"postgresql+pg8000://{settings.DATABASE_URL[13:]}")
else:
    engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
