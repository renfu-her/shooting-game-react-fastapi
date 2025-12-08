"""Leaderboard controller - business logic for leaderboard operations."""
from app.services.database_service import DatabaseService
from app.models.leaderboard import LeaderboardEntry, AddScoreRequest
from typing import List
from datetime import datetime


class LeaderboardController:
    """Controller for leaderboard operations."""
    
    @staticmethod
    def get_leaderboard(limit: int = 10) -> List[LeaderboardEntry]:
        """Get top leaderboard entries.
        
        Args:
            limit: Maximum number of entries to return
            
        Returns:
            List of leaderboard entries sorted by score descending
        """
        try:
            entries_data = DatabaseService.get_leaderboard(limit)
            entries = [
                LeaderboardEntry(**entry) for entry in entries_data
            ]
            return entries
        except Exception as e:
            raise Exception(f"Failed to get leaderboard: {str(e)}")
    
    @staticmethod
    def add_score(request: AddScoreRequest) -> LeaderboardEntry:
        """Add a new score to the leaderboard.
        
        Args:
            request: AddScoreRequest containing name, score, and maxCombo
            
        Returns:
            Created leaderboard entry
        """
        try:
            entry_data = {
                "name": request.name,
                "score": request.score,
                "maxCombo": request.maxCombo,
                "timestamp": datetime.now().timestamp() * 1000,  # milliseconds
            }
            
            entry_id = DatabaseService.add_leaderboard_entry(entry_data)
            entry_data["id"] = entry_id
            
            return LeaderboardEntry(**entry_data)
        except Exception as e:
            raise Exception(f"Failed to add score: {str(e)}")

