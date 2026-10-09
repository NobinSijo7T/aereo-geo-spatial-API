import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File as UploadFileParam
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.db.session import get_db
from app.repositories.file_repository import get_file, get_features, feature_count, all_features
from app.schemas.file import FileResponse, MeasurementsResponse, FeatureResponse, MeasurementResponse, SummaryResponse, DiagnosticResponse
from app.services.storage_service import StorageService
from app.services.upload_service import process_upload
from app.services.crs_service import display_geometry, measurement_crs_text
import csv
import io
import json
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api/files", tags=["files"])

def feature_response(item):
    measurement = item.measurement
    display = None
    measurement_crs = None
    try:
        from shapely.geometry import shape
        original = shape(item.geometry_geojson)
        display = display_geometry(original, item.source_crs).__geo_interface__
        measurement_crs = measurement_crs_text(original, item.source_crs)
    except Exception:
        pass
    return FeatureResponse(feature_index=item.feature_index, geometry_type=item.geometry_type, geometry=item.geometry_geojson, display_geometry=display, crs=item.source_crs, measurement_crs=measurement_crs, properties=item.properties or {}, measurement=MeasurementResponse(type=measurement.measurement_type, value=measurement.value, unit=measurement.unit, status=measurement.status, error=measurement.error_message))

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
        items.append(feature_response(item))
    return MeasurementsResponse(file_id=file_id, features=items, page=page, page_size=page_size, total=total)

@router.get("/{file_id}/summary/", response_model=SummaryResponse)
async def get_summary(file_id: uuid.UUID, db: Session = Depends(get_db)):
    record = get_file(db, file_id)
    if not record:
        raise HTTPException(404, "File not found")
    features = all_features(db, file_id)
    geometry_counts = {}
    area = length = 0.0
    success = failed = unsupported = not_required = 0
    crs_values = set()
    for item in features:
        geometry_counts[item.geometry_type] = geometry_counts.get(item.geometry_type, 0) + 1
        status = item.measurement.status
        if status == "success":
            success += 1
            if item.measurement.measurement_type == "area": area += item.measurement.value or 0
            if item.measurement.measurement_type == "length": length += item.measurement.value or 0
        elif status == "not_required": not_required += 1
        elif status == "not_supported": unsupported += 1
        else: failed += 1
        detail = feature_response(item)
        if detail.measurement_crs: crs_values.add(detail.measurement_crs)
    return SummaryResponse(total_features=len(features), geometry_counts=geometry_counts, area_total_m2=area, length_total_m=length, successful_measurements=success, failed_measurements=failed, unsupported_geometries=unsupported, not_required_measurements=not_required, source_crs=record.source_crs, measurement_crs=sorted(crs_values))

@router.get("/{file_id}/diagnostics/", response_model=list[DiagnosticResponse])
async def get_diagnostics(file_id: uuid.UUID, db: Session = Depends(get_db)):
    if not get_file(db, file_id):
        raise HTTPException(404, "File not found")
    return [DiagnosticResponse(feature_index=item.feature_index, geometry_type=item.geometry_type, status=item.measurement.status, error=item.measurement.error_message) for item in all_features(db, file_id) if item.measurement.status in {"error", "not_supported"}]

@router.get("/{file_id}/export.csv")
async def export_csv(file_id: uuid.UUID, db: Session = Depends(get_db)):
    record = get_file(db, file_id)
    if not record:
        raise HTTPException(404, "File not found")
    stream = io.StringIO()
    fields = ["file_id", "feature_index", "geometry_type", "source_crs", "measurement_type", "value", "unit", "measurement_status", "measurement_error", "properties"]
    writer = csv.DictWriter(stream, fieldnames=fields)
    writer.writeheader()
    for item in all_features(db, file_id):
        measurement = item.measurement
        writer.writerow({"file_id": str(file_id), "feature_index": item.feature_index, "geometry_type": item.geometry_type, "source_crs": item.source_crs or "", "measurement_type": measurement.measurement_type or "", "value": "" if measurement.value is None else measurement.value, "unit": measurement.unit or "", "measurement_status": measurement.status, "measurement_error": measurement.error_message or "", "properties": json.dumps(item.properties or {}, ensure_ascii=False, separators=(",", ":"))})
    filename = f'{record.filename.rsplit(".", 1)[0]}-measurements.csv'
    return StreamingResponse(iter([stream.getvalue()]), media_type="text/csv", headers={"Content-Disposition": f'attachment; filename="{filename}"'})
