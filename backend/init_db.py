"""Database initialization script."""
from app.database import init_db, engine, SessionLocal
from app.models.db_models import Base
from app.services.user_service import UserService
from app.config import DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    try:
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully!")
        
        # Create default admin user if not exists
        db = SessionLocal()
        try:
            if not UserService.user_exists(db, DEFAULT_ADMIN_EMAIL):
                logger.info(f"Creating default admin user: {DEFAULT_ADMIN_EMAIL}")
                UserService.create_user(db, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD)
                logger.info("Default admin user created successfully!")
            else:
                logger.info("Default admin user already exists.")
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise


