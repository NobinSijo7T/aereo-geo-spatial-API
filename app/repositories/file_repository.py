from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload
from app.models.file import File
from app.models.feature import Feature

def get_file(db: Session, file_id):
    return db.get(File, file_id)

def get_features(db: Session, file_id, offset, limit):
    return list(db.scalars(select(Feature).options(joinedload(Feature.measurement)).where(Feature.file_id == file_id).order_by(Feature.feature_index).offset(offset).limit(limit)))

def feature_count(db: Session, file_id):
    return db.scalar(select(func.count()).select_from(Feature).where(Feature.file_id == file_id)) or 0

def all_features(db: Session, file_id):
    return list(db.scalars(select(Feature).options(joinedload(Feature.measurement)).where(Feature.file_id == file_id).order_by(Feature.feature_index)))
