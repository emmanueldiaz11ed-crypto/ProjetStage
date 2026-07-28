from fastapi import APIRouter

from .auth import router as auth_router
from .endpoints import router as endpoints_router

router = APIRouter()
router.include_router(auth_router, prefix="/auth")
router.include_router(endpoints_router, prefix="")
