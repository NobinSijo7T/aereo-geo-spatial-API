from sqlalchemy.orm import Session
from app.models.file import File
from app.models.feature import Feature
from app.models.measurement import Measurement
from app.services.geospatial_parser import parse_upload
from app.services.measurement_service import measure
from app.services.crs_service import source_crs_text

def _is_missing(value):
    try:
        import pandas as pd
        result = pd.isna(value)
        return bool(result) if not hasattr(result, "__len__") else False
    except (TypeError, ValueError):
        return False

def process_upload(db: Session, storage, filename: str, data: bytes):
    frame = parse_upload(filename, data)
    source = source_crs_text(frame.crs)
    if frame.crs is None:
        raise ValueError("Source CRS is missing or unusable")
    stored = storage.upload(filename, data)
    record = File(filename=filename, storage_path=stored, source_crs=source, status="processing")
    db.add(record); db.flush()
    for index, row in frame.iterrows():
        geometry = row.geometry
        geometry_json = geometry.__geo_interface__ if geometry is not None else {"type": "GeometryCollection", "geometries": []}
        props = {str(k): v for k, v in row.drop(labels=["geometry"]).items() if v is not None and not _is_missing(v)}
        feature = Feature(file_id=record.id, feature_index=int(index), geometry_type=geometry.geom_type if geometry is not None else "Unknown", geometry_geojson=geometry_json, properties=props, source_crs=source)
        db.add(feature); db.flush()
        result = measure(geometry, feature.geometry_type, frame.crs)
        db.add(Measurement(feature_id=feature.id, measurement_type=result.get("type"), value=result.get("value"), unit=result.get("unit"), status=result["status"], error_message=result.get("error")))
    record.feature_count = len(frame); record.status = "completed"
    db.commit(); db.refresh(record)
    return record
