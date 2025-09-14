from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Touhou Clear Checker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Touhou Clear Checker API"}

@app.get("/api/games")
async def get_games():
    # TODO: データベースから東方ゲーム一覧を取得
    return {"games": []}

@app.get("/api/clear-status")
async def get_clear_status():
    # TODO: クリア状況を取得
    return {"clear_status": []}