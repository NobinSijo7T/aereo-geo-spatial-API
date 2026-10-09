from fastapi.testclient import TestClient
from app.main import app

def test_health():
    with TestClient(app) as client:
        assert client.get("/health").json() == {"status": "ok"}

def test_unknown_file():
    with TestClient(app) as client:
        response = client.get("/api/files/00000000-0000-0000-0000-000000000000/")
        assert response.status_code == 404
