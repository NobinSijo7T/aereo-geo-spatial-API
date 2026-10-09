"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle, RotateCcw, TriangleAlert } from "lucide-react";
import { Header } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import { FileSummary } from "@/components/FileSummary";
import { uploadFile, type FileRecord } from "@/lib/api";

export default function Workspace() {
  const [record, setRecord] = useState<FileRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true); setError(null); setRecord(null);
    try { setRecord(await uploadFile(file)); } catch (caught) { setError(caught instanceof Error ? caught.message : "Upload failed."); } finally { setBusy(false); }
  }

  return <><Header /><main className="mx-auto max-w-[1280px] px-5 pb-20 pt-14 sm:px-8 lg:px-12 lg:pt-20"><section className="max-w-3xl"><p className="eyebrow">Geospatial file measurement</p><h1 className="mt-4 text-4xl font-light tracking-[-0.055em] sm:text-5xl">Measure what’s in the file.</h1><p className="mt-5 max-w-xl text-lg leading-8 text-[#6d6d6d]">Upload a KML or zipped Shapefile to inspect its source CRS, feature properties, and backend-verified measurements.</p></section><section className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-20"><div><UploadZone disabled={busy} onSelect={handleFile} />{busy && <div className="mt-5 flex items-center gap-3 text-sm" role="status"><LoaderCircle className="animate-spin" size={16} /> Processing file.</div>}{error && <div className="mt-5 flex items-start gap-3 border border-black p-4 text-sm" role="alert"><TriangleAlert className="mt-0.5 shrink-0" size={17} /><div><p className="font-semibold">Upload could not be completed</p><p className="mt-1 text-[#6d6d6d]">{error}</p><button className="mt-3 inline-flex items-center gap-2 text-sm underline underline-offset-4" onClick={() => setError(null)}><RotateCcw size={14} /> Try again</button></div></div>}{record && <div className="mt-12"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="eyebrow">Latest file</p><h2 className="mt-2 text-2xl font-normal tracking-[-0.035em]">{record.filename}</h2></div><Link className="pill inline-flex items-center gap-2 border border-black px-4 py-2 text-sm" href={`/files/${record.id}`}>Open details <ArrowRight size={15} /></Link></div><FileSummary file={record} /></div>}</div><aside className="border-t hairline pt-5 lg:border-t-0 lg:border-l lg:pl-8"><p className="eyebrow">Workflow</p><div className="mt-5 space-y-5 text-sm"><p><span className="font-semibold">01 / Upload</span><br /><span className="text-[#6d6d6d]">Send the original file to FastAPI.</span></p><p><span className="font-semibold">02 / Process</span><br /><span className="text-[#6d6d6d]">Parse features and transform measurement copies.</span></p><p><span className="font-semibold">03 / Inspect</span><br /><span className="text-[#6d6d6d]">Review each result, property, and failure.</span></p></div></aside></section></main></>;
}
