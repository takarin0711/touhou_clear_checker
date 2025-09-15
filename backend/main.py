from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from presentation.api.v1.games import router as games_router
from presentation.api.v1.clear_status import router as clear_status_router
from presentation.api.v1.users import router as users_router
from presentation.api.v1.admin import router as admin_router
from infrastructure.database.connection import engine, Base

app = FastAPI(title="Touhou Clear Checker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(games_router, prefix="/api/v1/games", tags=["games"])
app.include_router(clear_status_router, prefix="/api/v1/clear-status", tags=["clear-status"])
app.include_router(users_router, prefix="/api/v1/users", tags=["users"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])

@app.get("/")
async def root():
    return {"message": "Touhou Clear Checker API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)