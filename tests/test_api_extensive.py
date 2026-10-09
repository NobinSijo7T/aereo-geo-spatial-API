import io
import zipfile
import geopandas as gpd
from shapely.geometry import Polygon
from fastapi.testclient import TestClient
from app.core.config import get_settings
from app.main import app

KML = b'''<?xml version="1.0"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document>
<Placemark><name>square</name><Polygon><outerBoundaryIs><LinearRing><coordinates>
77.0000,12.0000 77.0010,12.0000 77.0010,12.0010 77.0000,12.0000
</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>
<Placemark><name>line</name><LineString><coordinates>77.0000,12.0000 77.0010,12.0000</coordinates></LineString></Placemark>
<Placemark><name>point</name><Point><coordinates>77.0000,12.0000</coordinates></Point></Placemark>
</Document></kml>'''

def test_kml_upload_metadata_measurements_and_pagination():
    with TestClient(app) as client:
        response = client.post("/api/files/", files={"file": ("sample.kml", KML, "application/vnd.google-earth.kml+xml")})
        assert response.status_code == 201, response.text
        metadata = response.json()
        assert metadata["feature_count"] == 3
        assert metadata["crs"] == "EPSG:4326"
        file_id = metadata["id"]

        page = client.get(f"/api/files/{file_id}/measurements/?page=1&page_size=2")
        assert page.status_code == 200
        body = page.json()
        assert body["total"] == 3
        assert len(body["features"]) == 2
        assert body["features"][0]["measurement"]["status"] == "success"
        assert body["features"][0]["measurement"]["unit"] == "m²"

        second = client.get(f"/api/files/{file_id}/measurements/?page=2&page_size=2").json()
        assert len(second["features"]) == 1
        assert second["features"][0]["measurement"]["status"] == "not_required"

def test_upload_validation_errors():
    with TestClient(app) as client:
        assert client.post("/api/files/", files={"file": ("data.txt", b"hello", "text/plain")}).status_code == 400
        assert client.post("/api/files/", files={"file": ("empty.kml", b"", "application/xml")}).status_code == 400
        assert client.post("/api/files/", files={"file": ("bad.kml", b"not xml", "application/xml")}).status_code == 400
        assert client.post("/api/files/", files={"file": ("bad.zip", b"not a zip", "application/zip")}).status_code == 400

def test_upload_size_limit(monkeypatch):
    monkeypatch.setattr(get_settings(), "max_upload_size_bytes", 4)
    with TestClient(app) as client:
        response = client.post("/api/files/", files={"file": ("large.kml", b"12345", "application/xml")})
        assert response.status_code == 413

def test_zip_archive_structure_validation():
    duplicate = io.BytesIO()
    with zipfile.ZipFile(duplicate, "w") as archive:
        for name in ("one.shp", "one.shx", "one.dbf", "two.shp", "two.shx", "two.dbf"):
            archive.writestr(name, b"")
    unsafe = io.BytesIO()
    with zipfile.ZipFile(unsafe, "w") as archive:
        archive.writestr("../escape.shp", b"")
    with TestClient(app) as client:
        assert client.post("/api/files/", files={"file": ("duplicate.zip", duplicate.getvalue(), "application/zip")}).status_code == 400
        assert client.post("/api/files/", files={"file": ("unsafe.zip", unsafe.getvalue(), "application/zip")}).status_code == 400

def test_valid_zip_shapefile_upload_and_missing_crs_rejection(tmp_path):
    source = tmp_path / "dataset"
    source.mkdir()
    frame = gpd.GeoDataFrame({"name": ["parcel"]}, geometry=[Polygon([(0, 0), (1, 0), (1, 1), (0, 0)])], crs="EPSG:4326")
    frame.to_file(source / "parcel.shp", driver="ESRI Shapefile")
    archive = io.BytesIO()
    with zipfile.ZipFile(archive, "w") as zf:
        for part in source.iterdir():
            zf.write(part, part.name)

    no_crs = tmp_path / "no-crs"
    no_crs.mkdir()
    gpd.GeoDataFrame({"name": ["unknown"]}, geometry=[Polygon([(0, 0), (1, 0), (1, 1), (0, 0)])]).to_file(no_crs / "unknown.shp", driver="ESRI Shapefile")
    no_crs_archive = io.BytesIO()
    with zipfile.ZipFile(no_crs_archive, "w") as zf:
        for part in no_crs.iterdir():
            zf.write(part, part.name)

    with TestClient(app) as client:
        response = client.post("/api/files/", files={"file": ("parcel.zip", archive.getvalue(), "application/zip")})
        assert response.status_code == 201, response.text
        assert response.json()["feature_count"] == 1
        rejected = client.post("/api/files/", files={"file": ("unknown.zip", no_crs_archive.getvalue(), "application/zip")})
        assert rejected.status_code == 400
        assert "CRS" in rejected.json()["detail"]
