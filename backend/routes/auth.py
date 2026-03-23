from fastapi import APIRouter

router = APIRouter()

@router.post("/register")
async def register():
    return {"message": "User registered"}

@router.post("/login")
async def login():
    return {"message": "User logged in"}


@router.get("/")
def test_auth():
    return {"msg": "auth working"}