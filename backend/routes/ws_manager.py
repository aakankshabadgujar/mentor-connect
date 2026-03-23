from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.rooms = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        if session_id not in self.rooms:
            self.rooms[session_id] = []
        self.rooms[session_id].append(websocket)

    def disconnect(self, session_id: str, websocket: WebSocket):
        self.rooms[session_id].remove(websocket)

    async def broadcast(self, session_id: str, message: str):
        for connection in self.rooms.get(session_id, []):
            await connection.send_text(message)

manager = ConnectionManager()