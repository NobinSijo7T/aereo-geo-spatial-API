"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minus, Plus, X } from "lucide-react";
import Map, { AttributionControl, Layer, NavigationControl, ScaleControl, Source, type MapLayerMouseEvent, type MapRef } from "@vis.gl/react-maplibre";
import { LngLatBounds, type CircleLayerSpecification, type FillLayerSpecification, type LineLayerSpecification, type StyleSpecification } from "maplibre-gl";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { FeatureRecord } from "@/lib/api";

const polygonFill: FillLayerSpecification = { id: "geometry-polygon-fill", type: "fill", source: "uploaded-geometry", filter: ["in", ["geometry-type"], "Polygon", "MultiPolygon"] as never, paint: { "fill-color": "#000000", "fill-opacity": 0.08 } };
const polygonOutline: LineLayerSpecification = { id: "geometry-polygon-outline", type: "line", source: "uploaded-geometry", filter: ["in", ["geometry-type"], "Polygon", "MultiPolygon"] as never, paint: { "line-color": "#000000", "line-width": 1.2, "line-opacity": 0.7 } };
const lineLayer: LineLayerSpecification = { id: "geometry-lines", type: "line", source: "uploaded-geometry", filter: ["in", ["geometry-type"], "LineString", "MultiLineString"] as never, paint: { "line-color": "#000000", "line-width": 1.5, "line-opacity": 0.78 } };
const pointLayer: CircleLayerSpecification = { id: "geometry-points", type: "circle", source: "uploaded-geometry", filter: ["in", ["geometry-type"], "Point", "MultiPoint"] as never, paint: { "circle-color": "#000000", "circle-radius": 4, "circle-stroke-color": "#ffffff", "circle-stroke-width": 1.2 } };

function isCoordinate(value: unknown): value is [number, number] { return Array.isArray(value) && Number.isFinite(value[0]) && Number.isFinite(value[1]) && Math.abs(value[0]) <= 180 && Math.abs(value[1]) <= 90; }

function featureCollection(features: FeatureRecord[]): FeatureCollection<Geometry, { featureIndex: number }> {
  const collection: Feature<Geometry, { featureIndex: number }>[] = [];
  for (const feature of features) {
    const geometry = feature.display_geometry;
    if (!geometry || typeof geometry.type !== "string" || !Array.isArray(geometry.coordinates)) continue;
    collection.push({ type: "Feature", id: `feature-${feature.feature_index}`, geometry: geometry as unknown as Geometry, properties: { featureIndex: feature.feature_index } });
  }
  return { type: "FeatureCollection", features: collection };
}

function boundsFor(collection: FeatureCollection): LngLatBounds | null {
  const bounds = new LngLatBounds(); let found = false;
  const visit = (value: unknown) => { if (isCoordinate(value)) { bounds.extend(value); found = true; return; } if (Array.isArray(value)) value.forEach(visit); };
  collection.features.forEach((feature) => {
    if (!feature.geometry) return;
    if ("coordinates" in feature.geometry) visit(feature.geometry.coordinates);
    else feature.geometry.geometries.forEach((geometry) => { if ("coordinates" in geometry) visit(geometry.coordinates); });
  });
  if (!found) return null;
  if (bounds.getSouth() === bounds.getNorth() && bounds.getWest() === bounds.getEast()) bounds.extend([bounds.getWest() - 0.01, bounds.getSouth() - 0.01]).extend([bounds.getEast() + 0.01, bounds.getNorth() + 0.01]);
  return bounds;
}

function selectedFilter(types: string[], featureIndex: number | null) { return ["all", ["in", ["geometry-type"], ...types], ["==", ["get", "featureIndex"], featureIndex ?? -1]] as never; }

export function GeoMap({ features, selected, onSelect }: { features: FeatureRecord[]; selected: number | null; onSelect: (index: number | null) => void }) {
  const mapRef = useRef<MapRef>(null);
  const [mapStyle, setMapStyle] = useState<string | StyleSpecification>(process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://demotiles.maplibre.org/style.json");
  const [styleError, setStyleError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const fallbackAttempted = useRef(false);
  const data = useMemo(() => featureCollection(features), [features]);
  const bounds = useMemo(() => boundsFor(data), [data]);
  const fallbackStyle = useMemo<StyleSpecification>(() => ({
    version: 8,
    sources: { "uploaded-geometry": { type: "geojson", data } },
    layers: [
      { id: "fallback-background", type: "background", paint: { "background-color": "#f7f7f7" } },
      polygonFill,
      polygonOutline,
      lineLayer,
      pointLayer,
    ],
  }), [data]);
  const fit = useCallback(() => { if (bounds && mapRef.current) mapRef.current.fitBounds(bounds, { padding: 48, maxZoom: 15, duration: 0 }); }, [bounds]);
  useEffect(() => { fit(); }, [fit]);
  useEffect(() => { if (usingFallback) fit(); }, [usingFallback, fit]);

  function handleClick(event: MapLayerMouseEvent) { const featureIndex = event.features?.[0]?.properties?.featureIndex; onSelect(featureIndex == null ? null : Number(featureIndex)); }
  function handleError() {
    if (fallbackAttempted.current) return;
    fallbackAttempted.current = true;
    queueMicrotask(() => {
      setStyleError("The configured basemap could not be loaded. Geometry remains available without map tiles.");
      setUsingFallback(true);
      setMapStyle(fallbackStyle);
    });
  }

  if (!data.features.length) return <div className="flex min-h-[360px] items-center justify-center border hairline bg-[#f7f7f7] px-8 text-center text-sm text-[#6d6d6d]">No valid WGS 84 display geometries are available for this page. The source CRS may be missing, unusable, or the collection may be empty.</div>;
  return <div className="relative min-h-[360px] overflow-hidden border hairline bg-[#f7f7f7]" aria-label="Interactive MapLibre geometry map">
    <Map ref={mapRef} initialViewState={{ longitude: bounds?.getCenter().lng || 0, latitude: bounds?.getCenter().lat || 0, zoom: 2 }} mapStyle={mapStyle} workerUrl="/maplibre-gl-worker.mjs" onLoad={fit} onError={handleError} interactiveLayerIds={["geometry-polygon-fill", "geometry-polygon-outline", "geometry-lines", "geometry-points"]} onClick={handleClick} attributionControl={false} style={{ minHeight: 360, height: "100%" }}>
      {!usingFallback && <Source id="uploaded-geometry" type="geojson" data={data} promoteId="featureIndex"><Layer {...polygonFill} /><Layer {...polygonOutline} /><Layer {...lineLayer} /><Layer {...pointLayer} /><Layer id="geometry-selected-fill" type="fill" source="uploaded-geometry" filter={selectedFilter(["Polygon", "MultiPolygon"], selected)} paint={{ "fill-color": "#000000", "fill-opacity": 0.22 }} /><Layer id="geometry-selected-line" type="line" source="uploaded-geometry" filter={selectedFilter(["LineString", "MultiLineString", "Polygon", "MultiPolygon"], selected)} paint={{ "line-color": "#000000", "line-width": 3, "line-opacity": 1 }} /><Layer id="geometry-selected-point" type="circle" source="uploaded-geometry" filter={selectedFilter(["Point", "MultiPoint"], selected)} paint={{ "circle-color": "#000000", "circle-radius": 6, "circle-stroke-color": "#ffffff", "circle-stroke-width": 2 }} /></Source>}
      <NavigationControl position="top-right" showCompass={false} visualizePitch={false} /><ScaleControl position="bottom-left" maxWidth={120} unit="metric" /><AttributionControl position="bottom-right" compact customAttribution="MapLibre · © OpenStreetMap contributors" />
    </Map>
    <div className="absolute left-3 top-3 flex gap-1"><button className="map-control" onClick={() => mapRef.current?.zoomIn()} aria-label="Zoom in"><Plus size={15} /></button><button className="map-control" onClick={() => mapRef.current?.zoomOut()} aria-label="Zoom out"><Minus size={15} /></button><button className="map-control" onClick={fit} aria-label="Fit all geometries"><Maximize2 size={14} /></button>{selected != null && <button className="map-control" onClick={() => onSelect(null)} aria-label="Clear selected feature"><X size={14} /></button>}</div>
    {(styleError || usingFallback) && <p className="absolute bottom-8 left-3 max-w-[290px] border border-black bg-white px-3 py-2 text-xs leading-5" role="status">{styleError || "Basemap unavailable; showing geometry only."}</p>}
  </div>;
}
