import io, tempfile, zipfile
from pathlib import Path

ALLOWED = {".kml", ".zip"}

def _safe_zip(data: bytes) -> Path:
    root = Path(tempfile.mkdtemp(prefix="geo-upload-"))
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        names = [n for n in zf.namelist() if not n.endswith("/")]
        if any(Path(n).is_absolute() or ".." in Path(n).parts for n in names):
            raise ValueError("Archive contains unsafe paths")
        shp = [n for n in names if Path(n).suffix.lower() == ".shp"]
        if len(shp) != 1:
            raise ValueError("ZIP must contain exactly one Shapefile dataset")
        stem = Path(shp[0]).with_suffix("")
        siblings = {Path(n).with_suffix("") for n in names if Path(n).parent == Path(shp[0]).parent}
        if not {stem}.issubset(siblings):
            raise ValueError("Invalid Shapefile archive")
        required = {".shx", ".dbf"}
        present = {Path(n).suffix.lower() for n in names if Path(n).with_suffix("") == stem}
        if not required.issubset(present):
            raise ValueError("Shapefile archive is missing .shx or .dbf")
        zf.extractall(root)
    return root / shp[0]

def parse_upload(filename: str, data: bytes):
    import geopandas as gpd
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED:
        raise ValueError("Only .kml and .zip files are supported")
    if not data:
        raise ValueError("Uploaded file is empty")
    if suffix == ".zip":
        path = _safe_zip(data)
        return gpd.read_file(path)
    with tempfile.NamedTemporaryFile(suffix=".kml", delete=False) as handle:
        handle.write(data); path = handle.name
    frame = gpd.read_file(path, driver="KML")
    # KML coordinates are defined in WGS84 longitude/latitude.
    return frame.set_crs("EPSG:4326") if frame.crs is None else frame
