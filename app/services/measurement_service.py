from app.services.crs_service import projected_geometry

MEASURED = {"Polygon": ("area", "m²"), "MultiPolygon": ("area", "m²"), "LineString": ("length", "m"), "MultiLineString": ("length", "m")}

def measure(geometry, geometry_type, source_crs):
    if geometry is None or geometry.is_empty:
        return {"status": "error", "error": "Geometry is empty"}
    if geometry_type in {"Point", "MultiPoint"}:
        return {"status": "not_required", "type": None, "value": None, "unit": None}
    if geometry_type not in MEASURED:
        return {"status": "not_supported", "error": f"Measurement is not supported for {geometry_type}"}
    if not geometry.is_valid:
        return {"status": "error", "error": "Geometry is invalid; it was not repaired"}
    try:
        projected = projected_geometry(geometry, source_crs)
        kind, unit = MEASURED[geometry_type]
        return {"status": "success", "type": kind, "value": float(getattr(projected, kind)), "unit": unit}
    except Exception as exc:
        return {"status": "error", "error": str(exc)}

