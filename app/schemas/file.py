import uuid
from pydantic import BaseModel, ConfigDict

class FileResponse(BaseModel):
    id: uuid.UUID
    filename: str
    feature_count: int
    crs: str | None = None
    status: str
    model_config = ConfigDict(from_attributes=True)

class MeasurementResponse(BaseModel):
    type: str | None = None
    value: float | None = None
    unit: str | None = None
    status: str
    error: str | None = None

class FeatureResponse(BaseModel):
    feature_index: int
    geometry_type: str
    geometry: dict
    display_geometry: dict | None = None
    crs: str | None
    measurement_crs: str | None = None
    properties: dict
    measurement: MeasurementResponse

class MeasurementsResponse(BaseModel):
    file_id: uuid.UUID
    features: list[FeatureResponse]
    page: int
    page_size: int
    total: int

class SummaryResponse(BaseModel):
    total_features: int
    geometry_counts: dict[str, int]
    area_total_m2: float
    length_total_m: float
    successful_measurements: int
    failed_measurements: int
    unsupported_geometries: int
    not_required_measurements: int
    source_crs: str | None
    measurement_crs: list[str]

class DiagnosticResponse(BaseModel):
    feature_index: int
    geometry_type: str
    status: str
    category: str
    error: str | None
    source_crs: str | None = None
    measurement_crs: str | None = None
