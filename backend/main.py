from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from database import engine, Base
from routes.auth import router as auth_router
from routes.user import router as user_router
from routes.chat import router as chat_router
import uuid 
import json 
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router, prefix="/auth")
app.include_router(user_router, prefix="/users")
app.include_router(chat_router, prefix="/chat")



video_connections = {}

@app.websocket("/ws/video/{session_id}")
async def video_ws(websocket: WebSocket, session_id: str):
    await websocket.accept()

    if session_id not in video_connections:
        video_connections[session_id] = []

    video_connections[session_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_text()

            # Broadcast to others
            for conn in video_connections[session_id]:
                if conn != websocket:
                    await conn.send_text(data)

    except WebSocketDisconnect:
                if session_id in video_connections:
                    video_connections[session_id].remove(websocket)
                    if not video_connections[session_id]:
                        del video_connections[session_id]
        



connections = {}


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()

    if session_id not in connections:
        connections[session_id] = []

    connections[session_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            try: 
                message = json.loads(data)  
            except:
                continue 
            for conn in connections[session_id]:
                await conn.send_text(json.dumps(message)) 

    except WebSocketDisconnect:
        if session_id in connections:
            connections[session_id].remove(websocket)
            if not connections[session_id]:
                del connections[session_id]

        
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


sessions = set()

@app.post("/sessions/create")
async def create_session():
    session_id = str(uuid.uuid4())[:6]
    sessions.add(session_id)
    return {"session_id": session_id}

@app.post("/sessions/join/{session_id}")
async def join_session(session_id: str):
    if session_id not in sessions:
        return {"success": False, "error": "Session not found"}
    return {"success": True, "session_id": session_id}


@app.get("/")
def root():
    return {"message": "Backend running Successfully 🚀"}