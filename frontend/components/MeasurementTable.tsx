"use client";

import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { FeatureRecord } from "@/lib/api";
import { StatusLabel } from "@/components/StatusLabel";

function formatValue(value: number | null) { return value === null ? "—" : new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(value); }

export function MeasurementTable({ features, page, pageSize, total, selected, onSelect, onPage }: { features: FeatureRecord[]; page: number; pageSize: number; total: number; selected: number | null; onSelect: (feature: FeatureRecord) => void; onPage: (page: number) => void }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return <div className="border-t hairline">
    <div className="hidden grid-cols-[.5fr_1.4fr_1fr_.7fr_1fr_28px] gap-4 border-b hairline py-3 text-left md:grid"><span className="eyebrow">Feature</span><span className="eyebrow">Geometry</span><span className="eyebrow">Measurement</span><span className="eyebrow">Unit</span><span className="eyebrow">Status</span><span /></div>
    {features.length === 0 ? <div className="py-14 text-sm text-[#6d6d6d]">No features on this page.</div> : features.map((feature) => <div key={feature.feature_index} className={`border-b hairline py-4 ${selected === feature.feature_index ? "bg-[#f7f7f7]" : ""}`}>
      <button type="button" className="grid w-full grid-cols-[1fr_auto] gap-3 px-2 text-left md:grid-cols-[.5fr_1.4fr_1fr_.7fr_1fr_28px] md:items-center md:gap-4" onClick={() => { onSelect(feature); setExpanded(expanded === feature.feature_index ? null : feature.feature_index); }} aria-expanded={expanded === feature.feature_index}>
        <span className="tabular text-sm text-[#6d6d6d]">{String(feature.feature_index + 1).padStart(2, "0")}</span><span><span className="eyebrow md:hidden">Geometry · </span>{feature.geometry_type}</span><span className="tabular">{formatValue(feature.measurement.value)}</span><span className="text-[#6d6d6d]">{feature.measurement.unit || "—"}</span><StatusLabel status={feature.measurement.status} /><ChevronDown className={`justify-self-end transition-transform ${expanded === feature.feature_index ? "rotate-180" : ""}`} size={16} strokeWidth={1.5} />
      </button>
      {expanded === feature.feature_index && <div className="mt-4 grid gap-5 border-t hairline pt-4 text-sm md:grid-cols-2"><div><p className="eyebrow">Properties</p><pre className="mt-2 max-h-40 overflow-auto bg-[#f7f7f7] p-3 text-xs leading-5 whitespace-pre-wrap">{JSON.stringify(feature.properties, null, 2)}</pre></div><div><p className="eyebrow">Feature detail</p><p className="mt-2 text-[#6d6d6d]">CRS: <span className="text-[#181818]">{feature.crs || "Not reported"}</span></p>{feature.measurement.error && <p className="mt-2 text-[#181818]">Measurement issue: {feature.measurement.error}</p>}<pre className="mt-2 max-h-40 overflow-auto bg-[#f7f7f7] p-3 text-xs leading-5 whitespace-pre-wrap">{JSON.stringify(feature.geometry, null, 2)}</pre></div></div>}
    </div>)}
    <div className="flex items-center justify-between gap-4 pt-5"><p className="tabular text-sm text-[#6d6d6d]">Page {page} of {pages} · {total} features</p><div className="flex gap-2"><button className="pill inline-flex items-center border border-black px-3 py-2 text-sm disabled:opacity-30" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page"><ChevronLeft size={16} /></button><button className="pill inline-flex items-center border border-black px-3 py-2 text-sm disabled:opacity-30" onClick={() => onPage(page + 1)} disabled={page >= pages} aria-label="Next page"><ChevronRight size={16} /></button></div></div>
  </div>;
}
