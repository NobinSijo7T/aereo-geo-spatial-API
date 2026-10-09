from alembic import op
import sqlalchemy as sa
revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table("files", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("filename", sa.String(255), nullable=False), sa.Column("storage_path", sa.String(500), nullable=False), sa.Column("source_crs", sa.String(255)), sa.Column("feature_count", sa.Integer(), nullable=False, server_default="0"), sa.Column("status", sa.String(32), nullable=False), sa.Column("error_message", sa.Text()), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table("features", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("file_id", sa.Uuid(), sa.ForeignKey("files.id", ondelete="CASCADE"), nullable=False), sa.Column("feature_index", sa.Integer(), nullable=False), sa.Column("geometry_type", sa.String(64), nullable=False), sa.Column("geometry_geojson", sa.JSON(), nullable=False), sa.Column("properties", sa.JSON(), nullable=False), sa.Column("source_crs", sa.String(255)))
    op.create_index("ix_features_file_id", "features", ["file_id"])
    op.create_index("ix_features_file_index", "features", ["file_id", "feature_index"], unique=True)
    op.create_table("measurements", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("feature_id", sa.Uuid(), sa.ForeignKey("features.id", ondelete="CASCADE"), nullable=False, unique=True), sa.Column("measurement_type", sa.String(32)), sa.Column("value", sa.Float()), sa.Column("unit", sa.String(16)), sa.Column("status", sa.String(32), nullable=False), sa.Column("error_message", sa.Text()))

def downgrade():
    op.drop_table("measurements"); op.drop_index("ix_features_file_index", "features"); op.drop_index("ix_features_file_id", "features"); op.drop_table("features"); op.drop_table("files")

