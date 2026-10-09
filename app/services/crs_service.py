def source_crs_text(crs):
    return crs.to_string() if crs else None

def measurement_crs(frame):
    if frame.crs is None:
        raise ValueError("Source CRS is missing or unusable")
    if frame.crs.is_projected:
        return frame.crs
    estimated = frame.estimate_utm_crs()
    if estimated is None or not estimated.is_projected:
        raise ValueError("Could not select a suitable projected CRS")
    return estimated

def projected_geometry(geometry, source_crs):
    import geopandas as gpd
    frame = gpd.GeoDataFrame({"geometry": [geometry]}, crs=source_crs)
    target = measurement_crs(frame)
    return frame.to_crs(target).geometry.iloc[0]
