from shapely.geometry import LineString, Point, Polygon
from app.services.measurement_service import measure

def test_point_does_not_require_measurement():
    result = measure(Point(0, 0), "Point", "EPSG:4326")
    assert result["status"] == "not_required"

def test_invalid_geometry_is_reported_without_repair():
    result = measure(Polygon([(0, 0), (1, 1), (0, 1), (1, 0), (0, 0)]), "Polygon", "EPSG:4326")
    assert result["status"] == "error"
    assert "invalid" in result["error"]

def test_unsupported_geometry_is_reported():
    result = measure(LineString([(0, 0), (1, 1)]), "GeometryCollection", "EPSG:4326")
    assert result["status"] == "not_supported"

