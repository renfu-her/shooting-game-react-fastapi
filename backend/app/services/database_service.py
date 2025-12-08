"""Database service for leaderboard operations."""
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.db_models import LeaderboardEntryDB
from app.database import get_db
from typing import List, Dict, Any, Optional
from datetime import datetime


class DatabaseService:
    """Service for database operations."""
    
    @staticmethod
    def get_leaderboard(limit: int = 10) -> List[Dict[str, Any]]:
        """Get top leaderboard entries sorted by score descending.
        
        Args:
            limit: Maximum number of entries to return (default: 10)
            
        Returns:
            List of leaderboard entries
        """
        db: Session = next(get_db())
        try:
            entries = db.query(LeaderboardEntryDB)\
                .order_by(desc(LeaderboardEntryDB.score))\
                .limit(limit)\
                .all()
            
            result = []
            for entry in entries:
                result.append({
                    "id": str(entry.id),
                    "name": entry.name,
                    "score": entry.score,
                    "maxCombo": entry.max_combo,
                    "timestamp": float(entry.timestamp)
                })
            
            return result
        except Exception as e:
            raise Exception(f"Error fetching leaderboard: {str(e)}")
        finally:
            db.close()
    
    @staticmethod
    def add_leaderboard_entry(entry: Dict[str, Any]) -> str:
        """Add a new leaderboard entry.
        
        Args:
            entry: Dictionary containing name, score, maxCombo, timestamp
            
        Returns:
            ID of the created entry
        """
        db: Session = next(get_db())
        try:
            # Add timestamp if not present
            if "timestamp" not in entry:
                entry["timestamp"] = int(datetime.now().timestamp() * 1000)  # milliseconds
            
            db_entry = LeaderboardEntryDB(
                name=entry["name"],
                score=entry["score"],
                max_combo=entry.get("maxCombo", 0),
                timestamp=entry["timestamp"]
            )
            
            db.add(db_entry)
            db.commit()
            db.refresh(db_entry)
            
            return str(db_entry.id)
        except Exception as e:
            db.rollback()
            raise Exception(f"Error adding leaderboard entry: {str(e)}")
        finally:
            db.close()
    
    @staticmethod
    def get_entry_by_id(entry_id: int) -> Optional[Dict[str, Any]]:
        """Get a leaderboard entry by ID.
        
        Args:
            entry_id: Entry ID
            
        Returns:
            Entry data or None if not found
        """
        db: Session = next(get_db())
        try:
            entry = db.query(LeaderboardEntryDB).filter(LeaderboardEntryDB.id == entry_id).first()
            if entry:
                return {
                    "id": str(entry.id),
                    "name": entry.name,
                    "score": entry.score,
                    "maxCombo": entry.max_combo,
                    "timestamp": float(entry.timestamp)
                }
            return None
        except Exception as e:
            raise Exception(f"Error getting entry: {str(e)}")
        finally:
            db.close()
    
    @staticmethod
    def delete_entry(entry_id: int) -> bool:
        """Delete a leaderboard entry.
        
        Args:
            entry_id: Entry ID
            
        Returns:
            True if successful
        """
        db: Session = next(get_db())
        try:
            entry = db.query(LeaderboardEntryDB).filter(LeaderboardEntryDB.id == entry_id).first()
            if entry:
                db.delete(entry)
                db.commit()
                return True
            return False
        except Exception as e:
            db.rollback()
            raise Exception(f"Error deleting entry: {str(e)}")
        finally:
            db.close()

