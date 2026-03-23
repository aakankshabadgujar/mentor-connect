from fastapi import APIRouter

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.get("/")
async def get_chats():
    return [{"id": 1, "name": "Demo Chat"}]

@router.post("/")
async def create_chat():
    return {"message": "Chat created"}