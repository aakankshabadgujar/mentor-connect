from fastapi import APIRouter
import uuid

router = APIRouter()

sessions = {}

@router.post("/create")
def create_session():
    session_id = str(uuid.uuid4())
    sessions[session_id] = {"status": "active"}
    return {"session_id": session_id}

@router.get("/{session_id}")
def get_session(session_id: str):
    return sessions.get(session_id, {})