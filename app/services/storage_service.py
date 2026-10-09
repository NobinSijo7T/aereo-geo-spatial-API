import uuid
from pathlib import Path
from app.core.config import get_settings

class StorageService:
    def __init__(self):
        self.settings = get_settings()
        self.client = None
        if self.settings.supabase_url and self.settings.supabase_secret_key:
            from supabase import create_client
            self.client = create_client(self.settings.supabase_url, self.settings.supabase_secret_key)

    def upload(self, filename: str, content: bytes) -> str:
        path = f"{uuid.uuid4()}/{Path(filename).name}"
        if self.client:
            self.client.storage.from_(self.settings.supabase_storage_bucket).upload(path, content, {"upsert": "false"})
        else:
            target = Path(".storage") / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(content)
        return path

