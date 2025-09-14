from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from presentation.api.v1.games import router as games_router
from presentation.api.v1.clear_status import router as clear_status_router
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

app.include_router(games_router)
app.include_router(clear_status_router)

@app.get("/")
async def root():
    return {"message": "Touhou Clear Checker API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)