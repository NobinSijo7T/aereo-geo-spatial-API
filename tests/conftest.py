from app.db.session import Base, engine
from app.models import File, Feature, Measurement

# Tests create their local schema explicitly; production uses Alembic.
Base.metadata.create_all(engine)

