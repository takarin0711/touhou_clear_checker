from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from presentation.api.v1.games import router as games_router
from presentation.api.v1.clear_records import router as clear_records_router
from presentation.api.v1.users import router as users_router
from presentation.api.v1.admin import router as admin_router
from presentation.api.v1.game_characters import router as game_characters_router
from presentation.api.v1.game_memos import router as game_memos_router
from infrastructure.database.connection import engine, Base
from infrastructure.config.network_constants import NetworkConstants
from infrastructure.logging.logger import LoggerFactory
from infrastructure.logging.middleware import RequestTracingMiddleware
from infrastructure.logging.exception_handler import ExceptionHandlerMiddleware

# ロギングシステムの初期化
LoggerFactory.setup_logging()
logger = LoggerFactory.get_logger(__name__)

app = FastAPI(title="Touhou Clear Checker API", version="1.0.0")

logger.info("FastAPI application starting up")

# 例外ハンドラーミドルウェアを追加（最初に実行されるよう最初に追加）
app.add_middleware(ExceptionHandlerMiddleware)

# リクエストトレーシングミドルウェアを追加
app.add_middleware(RequestTracingMiddleware)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=NetworkConstants.ALLOWED_ORIGINS,
    allow_credentials=NetworkConstants.ALLOW_CREDENTIALS,
    allow_methods=NetworkConstants.ALLOWED_METHODS,
    allow_headers=NetworkConstants.ALLOWED_HEADERS,
)

Base.metadata.create_all(bind=engine)

app.include_router(games_router, prefix="/api/v1/games", tags=["games"])
app.include_router(clear_records_router, prefix="/api/v1/clear-records", tags=["clear-records"])
app.include_router(users_router, prefix="/api/v1/users", tags=["users"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(game_characters_router, prefix="/api/v1/game-characters", tags=["game-characters"])
app.include_router(game_memos_router, prefix="/api/v1/game-memos", tags=["game-memos"])

@app.get("/")
async def root():
    logger.debug("Root endpoint accessed")
    return {"message": "Touhou Clear Checker API"}

if __name__ == "__main__":
    import uvicorn
    logger.info(
        f"Starting server on {NetworkConstants.DEFAULT_HOST}:{NetworkConstants.DEFAULT_PORT}"
    )
    uvicorn.run(app, host=NetworkConstants.DEFAULT_HOST, port=NetworkConstants.DEFAULT_PORT)