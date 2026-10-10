from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.files import router
from app.core.config import get_settings

app = FastAPI(title="Geospatial File Measurement API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in get_settings().frontend_origins.split(",") if origin.strip()],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"]
)
app.include_router(router)

@app.get("/")
def root():
    return {
        "name": "Geo Studio API",
        "status": "ok",
        "health": "/health",
        "docs": "/docs",
    }

@app.get("/health")
def health():
    return {"status": "ok"}
