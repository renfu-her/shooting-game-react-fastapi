"""Database connection and session management."""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE

# Create MySQL connection URL
DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4"

# Create engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using
    pool_recycle=3600,    # Recycle connections after 1 hour
    echo=False            # Set to True for SQL query logging
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables and create default user if needed."""
    from app.services.user_service import UserService
    from app.config import DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD
    import logging
    
    logger = logging.getLogger(__name__)
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create default admin user if not exists
    db = SessionLocal()
    try:
        if not UserService.user_exists(db, DEFAULT_ADMIN_EMAIL):
            logger.info(f"Creating default admin user: {DEFAULT_ADMIN_EMAIL}")
            UserService.create_user(db, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD)
            logger.info("Default admin user created successfully!")
        else:
            logger.info("Default admin user already exists.")
    except Exception as e:
        logger.warning(f"Failed to create default user: {str(e)}")
    finally:
        db.close()


