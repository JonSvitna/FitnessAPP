"""Root-level ASGI entry point for the Fitness App API.

This module re-exports the FastAPI app from the fitness_app package,
allowing uvicorn to be run with: uvicorn main:app
"""

from fitness_app.main import app

__all__ = ["app"]
