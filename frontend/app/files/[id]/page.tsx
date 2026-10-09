"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, LoaderCircle, RotateCcw, TriangleAlert } from "lucide-react";
import { Header } from "@/components/Header";
import { FileSummary } from "@/components/FileSummary";
import { MeasurementTable } from "@/components/MeasurementTable";
import { GeometryMap } from "@/components/GeometryMap";
import { FeatureInspector } from "@/components/FeatureInspector";
import { MeasurementSummary } from "@/components/MeasurementSummary";
import { exportUrl, getDiagnostics, getFile, getMeasurements, getSummary, type DiagnosticRecord, type FileRecord, type FeatureRecord, type MeasurementPage, type SummaryRecord } from "@/lib/api";

export default function FileDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [file, setFile] = useState<FileRecord | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementPage | null>(null);
  const [summary, setSummary] = useState<SummaryRecord | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticRecord[]>([]);
  const [selected, setSelected] = useState<FeatureRecord | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { const controller = new AbortController(); setLoading(true); Promise.all([getFile(id, controller.signal), getMeasurements(id, page, 50, controller.signal), getSummary(id, controller.signal), getDiagnostics(id, controller.signal)]).then(([nextFile, nextMeasurements, nextSummary, nextDiagnostics]) => { setFile(nextFile); setMeasurements(nextMeasurements); setSummary(nextSummary); setDiagnostics(nextDiagnostics); setError(null); }).catch((caught) => { if (caught?.name !== "AbortError") setError(caught instanceof Error ? caught.message : "Could not load this file."); }).finally(() => setLoading(false)); return () => controller.abort(); }, [id, page]);

  return <><Header /><main className="mx-auto max-w-[1280px] px-5 pb-20 pt-10 sm:px-8 lg:px-12 lg:pt-14"><Link href="/" className="surface-link inline-flex items-center gap-2 text-sm text-[#6d6d6d]"><ArrowLeft size={15} /> Back to workspace</Link>{loading ? <div className="flex min-h-[400px] items-center justify-center gap-3 text-sm" role="status"><LoaderCircle className="animate-spin" size={17} /> Loading file details</div> : error ? <div className="mt-12 border border-black p-6" role="alert"><TriangleAlert size={18} /><p className="mt-4 font-semibold">This file could not be loaded</p><p className="mt-1 text-sm text-[#6d6d6d]">{error}</p><button className="pill mt-5 inline-flex items-center gap-2 bg-black px-4 py-2 text-sm text-white" onClick={() => { setError(null); setPage((current) => current); }}><RotateCcw size={14} /> Retry</button></div> : file && measurements && summary ? <><section className="mt-12"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">File details</p><h1 className="mt-4 break-words text-4xl font-light tracking-[-0.055em] sm:text-5xl">{file.filename}</h1><p className="mt-4 text-[#6d6d6d]">Authoritative measurements from FastAPI · source CRS {summary.source_crs || "not reported"}</p></div><a className="pill inline-flex items-center gap-2 border border-black px-4 py-2 text-sm" href={exportUrl(id)} download><Download size={15} /> Export CSV</a></div></section><section className="mt-12"><FileSummary file={file} /></section><section className="mt-7"><MeasurementSummary summary={summary} /></section><section className="mt-16 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]"><div><div className="mb-6 flex items-end justify-between gap-5"><div><p className="eyebrow">Spatial overview</p><h2 className="mt-2 text-2xl font-normal tracking-[-0.035em]">Interactive geometry map</h2></div><p className="text-right text-sm text-[#6d6d6d]">Click a geometry to inspect it.</p></div><GeometryMap features={measurements.features} selected={selected?.feature_index ?? null} onSelect={(index) => setSelected(measurements.features.find((feature) => feature.feature_index === index) || null)} /></div><FeatureInspector feature={selected} /></section><section className="mt-16"><div className="mb-6 flex items-end justify-between gap-5"><div><p className="eyebrow">Feature results</p><h2 className="mt-2 text-2xl font-normal tracking-[-0.035em]">Measurements</h2></div><p className="hidden text-sm text-[#6d6d6d] sm:block">Page {measurements.page} of {Math.max(1, Math.ceil(measurements.total / measurements.page_size))} · {measurements.total} total</p></div><MeasurementTable features={measurements.features} page={measurements.page} pageSize={measurements.page_size} total={measurements.total} selected={selected?.feature_index ?? null} onSelect={setSelected} onPage={setPage} /></section><section className="mt-16 border-t hairline pt-5"><p className="eyebrow">Processing diagnostics</p><h2 className="mt-2 text-2xl font-normal">Quality report</h2><div className="mt-5 grid gap-3 text-sm">{diagnostics.length ? diagnostics.map((item) => <div key={item.feature_index} className="border border-black p-3"><span className="font-semibold">Feature {item.feature_index + 1} · {item.geometry_type} · {item.status}</span><p className="mt-1 text-[#6d6d6d]">{item.error || "No explanation provided."}</p></div>) : <p className="text-[#6d6d6d]">No failed or unsupported measurements were reported.</p>}</div></section></> : null}</main></>;
}
