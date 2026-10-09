from fastapi import FastAPI
from app.api.routes.files import router
from app.db.session import Base, engine
from app.models import File, Feature, Measurement

app = FastAPI(title="Geospatial File Measurement API", version="1.0.0")
app.include_router(router)

@app.on_event("startup")
def startup():
    if str(engine.url).startswith("sqlite"):
        Base.metadata.create_all(engine)

@app.get("/health")
def health():
    return {"status": "ok"}

