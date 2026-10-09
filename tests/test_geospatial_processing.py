import geopandas as gpd
from shapely.geometry import LineString, Polygon
from app.services.measurement_service import measure

def test_projected_line_measurement_is_in_metres():
    result = measure(LineString([(0, 0), (0.001, 0)]), "LineString", "EPSG:4326")
    assert result["status"] == "success"
    assert result["unit"] == "m"
    assert 100 < result["value"] < 120

def test_known_projected_area_is_square_metres():
    frame = gpd.GeoDataFrame(geometry=[Polygon([(0, 0), (10, 0), (10, 10), (0, 0)])], crs="EPSG:3857")
    result = measure(frame.geometry.iloc[0], "Polygon", frame.crs)
    assert result["status"] == "success"
    assert result["unit"] == "m²"
    assert result["value"] == 50.0

def test_missing_crs_is_an_explicit_error():
    result = measure(LineString([(0, 0), (1, 1)]), "LineString", None)
    assert result["status"] == "error"
    assert "CRS" in result["error"]

