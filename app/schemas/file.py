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
    crs: str | None
    properties: dict
    measurement: MeasurementResponse

class MeasurementsResponse(BaseModel):
    file_id: uuid.UUID
    features: list[FeatureResponse]
    page: int
    page_size: int
    total: int

