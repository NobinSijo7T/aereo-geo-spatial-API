def source_crs_text(crs):
    return crs.to_string() if crs else None

def measurement_crs(frame):
    if frame.crs is None:
        raise ValueError("Source CRS is missing or unusable")
    if frame.crs.is_projected:
        units = {str(axis.unit_name).lower() for axis in frame.crs.axis_info if axis.unit_name}
        if units and not any(unit in {"metre", "meter", "metres", "meters"} for unit in units):
            raise ValueError(f"Source CRS uses unsupported linear units: {', '.join(sorted(units))}")
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

def display_geometry(geometry, source_crs):
    import geopandas as gpd
    if geometry is None or geometry.is_empty:
        return geometry
    if source_crs is None:
        raise ValueError("Source CRS is missing or unusable")
    frame = gpd.GeoDataFrame({"geometry": [geometry]}, crs=source_crs)
    return frame.to_crs("EPSG:4326").geometry.iloc[0]

def measurement_crs_text(geometry, source_crs):
    import geopandas as gpd
    if source_crs is None:
        return None
    frame = gpd.GeoDataFrame({"geometry": [geometry]}, crs=source_crs)
    return measurement_crs(frame).to_string()
