"use client";

import { useMemo, useState } from "react";
import type { FeatureRecord } from "@/lib/api";

function points(geometry: Record<string, unknown>): [number, number][][] {
  const type = geometry.type as string;
  const coordinates = geometry.coordinates as unknown;
  if (type === "Point") return [[coordinates as [number, number]]];
  if (type === "MultiPoint" || type === "LineString") return [coordinates as [number, number][]];
  if (type === "MultiLineString" || type === "Polygon") return (coordinates as [number, number][][]);
  if (type === "MultiPolygon") return (coordinates as [number, number][][][]).flat();
  return [];
}

export function GeometryMap({ features, selected, onSelect }: { features: FeatureRecord[]; selected: number | null; onSelect: (index: number) => void }) {
  const [zoom, setZoom] = useState(1);
  const paths = useMemo(() => features.flatMap((feature) => points(feature.display_geometry || feature.geometry).map((line) => ({ feature, line }))), [features]);
  const extent = useMemo(() => { const all = paths.flatMap(({ line }) => line); if (!all.length) return { minX: 0, minY: 0, width: 1, height: 1 }; const xs = all.map((p) => p[0]); const ys = all.map((p) => p[1]); const minX = Math.min(...xs); const maxX = Math.max(...xs); const minY = Math.min(...ys); const maxY = Math.max(...ys); return { minX, minY, width: Math.max(maxX - minX, 0.00001), height: Math.max(maxY - minY, 0.00001) }; }, [paths]);
  const project = (point: [number, number]) => `${((point[0] - extent.minX) / extent.width) * 100},${100 - ((point[1] - extent.minY) / extent.height) * 100}`;
  return <div className="relative min-h-[360px] overflow-hidden border hairline bg-[#f7f7f7]" aria-label="Interactive geometry map">
    {paths.length ? <svg className="h-full min-h-[360px] w-full" viewBox={`${-50 / zoom} ${-50 / zoom} ${100 + 100 / zoom} ${100 + 100 / zoom}`} role="img"><g>{paths.map(({ feature, line }, index) => { const path = line.map(project).join(" "); const active = selected === feature.feature_index; const isPoint = feature.geometry_type.includes("Point"); return isPoint ? <circle key={index} cx={project(line[0]).split(",")[0]} cy={project(line[0]).split(",")[1]} r={active ? 2 : 1.25} className={active ? "fill-black stroke-white" : "fill-[#6d6d6d]"} onClick={() => onSelect(feature.feature_index)} /> : <polyline key={index} points={path} fill={feature.geometry_type.includes("Polygon") ? "rgba(0,0,0,.08)" : "none"} className={active ? "cursor-pointer stroke-black" : "cursor-pointer stroke-[#777]"} strokeWidth={active ? 0.9 : 0.45} onClick={() => onSelect(feature.feature_index)} />; })}</g></svg> : <div className="flex min-h-[360px] items-center justify-center px-8 text-center text-sm text-[#6d6d6d]">No display coordinates available. The source CRS may be missing or unusable.</div>}
    <div className="absolute right-3 top-3 flex gap-1"><button className="pill border border-black bg-white px-3 py-1 text-sm" onClick={() => setZoom((value) => Math.min(4, value + .5))} aria-label="Zoom in">+</button><button className="pill border border-black bg-white px-3 py-1 text-sm" onClick={() => setZoom((value) => Math.max(1, value - .5))} aria-label="Zoom out">−</button></div>
    <p className="absolute bottom-3 left-3 bg-white/90 px-2 py-1 text-[11px] uppercase tracking-[.12em] text-[#6d6d6d]">WGS 84 display geometry · {features.length} loaded features</p>
  </div>;
}
