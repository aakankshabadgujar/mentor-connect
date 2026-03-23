from fastapi import APIRouter

router = APIRouter(prefix="/user", tags=["User"])

@router.get("/")
async def get_users():
    return [{"id": 1, "username": "Aakanksha"}]