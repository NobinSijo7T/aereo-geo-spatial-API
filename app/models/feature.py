import uuid
from sqlalchemy import ForeignKey, Index, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

class Feature(Base):
    __tablename__ = "features"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    file_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("files.id", ondelete="CASCADE"), index=True)
    feature_index: Mapped[int] = mapped_column(Integer)
    geometry_type: Mapped[str] = mapped_column(String(64))
    geometry_geojson: Mapped[dict] = mapped_column(JSON)
    properties: Mapped[dict] = mapped_column(JSON, default=dict)
    source_crs: Mapped[str | None] = mapped_column(String(255), nullable=True)
    file = relationship("File", back_populates="features")
    measurement = relationship("Measurement", back_populates="feature", uselist=False, cascade="all, delete-orphan")
    __table_args__ = (Index("ix_features_file_index", "file_id", "feature_index", unique=True),)

