"""Leaderboard API endpoints."""
from fastapi import APIRouter, HTTPException, Query, Security, status
from app.controllers.leaderboard_controller import LeaderboardController
from app.models.leaderboard import LeaderboardEntry, AddScoreRequest, LeaderboardResponse
from app.utils.auth_dependency import api_key_header
from app.services.auth_service import AuthService
from typing import List

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get(
    "",
    response_model=LeaderboardResponse
)
async def get_leaderboard(
    limit: int = Query(10, ge=1, le=100),
    token: str = Security(api_key_header)
):
    """Get top leaderboard entries.
    
    Args:
        limit: Maximum number of entries to return (default: 10, max: 100)
        token: API token for authentication (get from GET /api/auth/token)
        
    Returns:
        LeaderboardResponse with entries and total count
    """
    # Verify token
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing token. Please provide 'token' header with API token",
        )
    
    if not AuthService.verify_token(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    
    try:
        entries = LeaderboardController.get_leaderboard(limit)
        return LeaderboardResponse(entries=entries, total=len(entries))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "",
    response_model=LeaderboardEntry,
    status_code=201
)
async def add_score(
    request: AddScoreRequest,
    token: str = Security(api_key_header)
):
    """Add a new score to the leaderboard.
    
    Args:
        request: AddScoreRequest containing name, score, and maxCombo
        token: API token for authentication (get from GET /api/auth/token)
        
    Returns:
        Created leaderboard entry
    """
    # Verify token
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing token. Please provide 'token' header with API token",
        )
    
    if not AuthService.verify_token(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    
    try:
        entry = LeaderboardController.add_score(request)
        return entry
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
