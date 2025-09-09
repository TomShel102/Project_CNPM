from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from config import Config
from infrastructure.databases.base import Base

# Database configuration
DATABASE_URI = Config.DATABASE_URI
engine = create_engine(DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Use scoped_session to manage a thread-local session per request
session = scoped_session(SessionLocal)
def init_mssql(app):
    Base.metadata.create_all(bind=engine)

def remove_session():
    """Remove the current SQLAlchemy session (to be called after each request)."""
    session.remove()