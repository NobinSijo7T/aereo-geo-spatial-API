from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "sqlite+pysqlite:///./geospatial.db"
    supabase_url: str | None = None
    supabase_secret_key: str | None = None
    supabase_storage_bucket: str = "geospatial-uploads"
    max_upload_size_bytes: int = 50 * 1024 * 1024
    sql_echo: bool = False
    frontend_origins: str = ",".join(
        [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
        ]
    )
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

@lru_cache
def get_settings() -> Settings:
    return Settings()
