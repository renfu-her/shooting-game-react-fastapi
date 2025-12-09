"""FastAPI application main entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.config import API_PREFIX, CORS_ORIGINS
from app.database import init_db
from app.views import leaderboard, auth
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Shooting Game API",
    description="FastAPI backend for shooting game",
    version="1.0.0"
)


def custom_openapi():
    """Custom OpenAPI schema with security scheme for token header."""
    if app.openapi_schema:
        return app.openapi_schema
    
    from app.config import API_TOKEN
    
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    
    # Ensure components section exists
    if "components" not in openapi_schema:
        openapi_schema["components"] = {}
    
    # Add security scheme for token header
    openapi_schema["components"]["securitySchemes"] = {
        "token": {
            "type": "apiKey",
            "name": "token",
            "in": "header",
            "description": f"API token for authentication. Get token from GET /api/auth/token endpoint. Example: {API_TOKEN}"
        }
    }
    
    # Apply security to paths that need authentication
    # Find all paths that have Security dependency in parameters
    # Also check leaderboard endpoints specifically
    leaderboard_paths = ["/api/leaderboard"]
    
    for path, path_item in openapi_schema.get("paths", {}).items():
        for method, operation in path_item.items():
            if isinstance(operation, dict):
                # Check if this is a leaderboard endpoint (which requires auth)
                is_leaderboard = any(path.startswith(lp) for lp in leaderboard_paths)
                
                # Check if any parameter is named "token" (from Security)
                has_token_param = False
                if "parameters" in operation:
                    for param in operation["parameters"]:
                        if param.get("name") == "token" and param.get("in") == "header":
                            has_token_param = True
                            # Add example value to the parameter
                            param["example"] = API_TOKEN
                            param["description"] = f"API token. Get from GET /api/auth/token. Current token: {API_TOKEN}"
                            # Ensure it's marked as required
                            param["required"] = True
                            break
                
                # If no token parameter found but this is a leaderboard endpoint, add it
                if is_leaderboard:
                    if "parameters" not in operation:
                        operation["parameters"] = []
                    
                    # Check if token parameter already exists
                    token_exists = any(
                        p.get("name") == "token" and p.get("in") == "header" 
                        for p in operation["parameters"]
                    )
                    if not token_exists:
                        # Add token parameter manually
                        operation["parameters"].append({
                            "name": "token",
                            "in": "header",
                            "required": True,
                            "schema": {
                                "type": "string"
                            },
                            "description": f"API token. Get from GET /api/auth/token. Current token: {API_TOKEN}",
                            "example": API_TOKEN
                        })
                        has_token_param = True
                
                # If endpoint has token parameter or is leaderboard endpoint, add security requirement
                # This will make Swagger UI show the Authorize button
                if has_token_param or is_leaderboard:
                    operation["security"] = [{"token": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database
try:
    init_db()
    logger.info("Database initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize database: {str(e)}")
    logger.warning("Application will start but database features may not work")


# Register routers
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(leaderboard.router, prefix=API_PREFIX)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Shooting Game API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

