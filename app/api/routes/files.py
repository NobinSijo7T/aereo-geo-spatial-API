import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File as UploadFileParam
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.db.session import get_db
from app.repositories.file_repository import get_file, get_features, feature_count
from app.schemas.file import FileResponse, MeasurementsResponse, FeatureResponse, MeasurementResponse
from app.services.storage_service import StorageService
from app.services.upload_service import process_upload

router = APIRouter(prefix="/api/files", tags=["files"])

@router.post("/", response_model=FileResponse, status_code=201)
async def upload_file(file: UploadFile = UploadFileParam(...), db: Session = Depends(get_db)):
    data = await file.read()
    if len(data) > get_settings().max_upload_size_bytes:
        raise HTTPException(413, "Uploaded file exceeds the configured size limit")
    try:
        return process_upload(db, StorageService(), file.filename or "upload", data)
    except (ValueError, OSError, RuntimeError) as exc:
        db.rollback()
        raise HTTPException(400, str(exc)) from exc

@router.get("/{file_id}/", response_model=FileResponse)
async def get_file_metadata(file_id: uuid.UUID, db: Session = Depends(get_db)):
    record = get_file(db, file_id)
    if not record:
        raise HTTPException(404, "File not found")
    return record

@router.get("/{file_id}/measurements/", response_model=MeasurementsResponse)
async def get_measurements(file_id: uuid.UUID, page: int = Query(1, ge=1), page_size: int = Query(100, ge=1, le=1000), db: Session = Depends(get_db)):
    record = get_file(db, file_id)
    if not record:
        raise HTTPException(404, "File not found")
    total = feature_count(db, file_id)
    items = []
    for item in get_features(db, file_id, (page - 1) * page_size, page_size):
        m = item.measurement
        items.append(FeatureResponse(feature_index=item.feature_index, geometry_type=item.geometry_type, geometry=item.geometry_geojson, crs=item.source_crs, properties=item.properties or {}, measurement=MeasurementResponse(type=m.measurement_type, value=m.value, unit=m.unit, status=m.status, error=m.error_message)))
    return MeasurementsResponse(file_id=file_id, features=items, page=page, page_size=page_size, total=total)

