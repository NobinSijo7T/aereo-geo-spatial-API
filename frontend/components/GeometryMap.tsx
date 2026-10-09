"use client";

import dynamic from "next/dynamic";
import type { FeatureRecord } from "@/lib/api";

const GeoMap = dynamic(() => import("@/components/map/GeoMap").then((module) => module.GeoMap), {
  ssr: false,
  loading: () => <div className="flex min-h-[360px] items-center justify-center border hairline bg-[#f7f7f7] text-sm text-[#6d6d6d]" role="status">Loading interactive map...</div>,
});

export function GeometryMap({ features, selected, onSelect }: { features: FeatureRecord[]; selected: number | null; onSelect: (index: number | null) => void }) {
  return <GeoMap features={features} selected={selected} onSelect={onSelect} />;
}
