"use client";

import { useRef, useState } from "react";
import { ArrowUp, FileArchive, FileCode2, LoaderCircle } from "lucide-react";

const MAX_BYTES = 50 * 1024 * 1024;

export function UploadZone({ disabled, onSelect }: { disabled?: boolean; onSelect: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function validate(file?: File) {
    if (!file) return;
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!(extension === ".kml" || extension === ".zip")) { setMessage("Choose a .kml file or a .zip Shapefile archive."); return; }
    if (file.size > MAX_BYTES) { setMessage("This file is larger than the 50 MB upload limit."); return; }
    setMessage(null); onSelect(file);
  }

  return (
    <div
      className={`upload-panel group relative flex min-h-[300px] flex-col items-center justify-center border px-6 text-center transition-colors ${dragging ? "border-black bg-white" : ""} ${disabled ? "pointer-events-none opacity-60" : ""}`}
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); validate(event.dataTransfer.files[0]); }}
    >
      <input ref={inputRef} className="sr-only" type="file" accept=".kml,.zip,application/vnd.google-earth.kml+xml,application/zip" onChange={(event) => validate(event.target.files?.[0])} disabled={disabled} />
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-black/15 bg-white text-[#6d6d6d]" aria-hidden="true"><FileCode2 size={18} strokeWidth={1.25} /><FileArchive size={18} strokeWidth={1.25} /></div>
      <h2 className="text-2xl font-normal tracking-[-0.04em]">Drop a geospatial file here</h2>
      <p className="mt-2 text-sm text-[#6d6d6d]">KML or zipped Shapefile · maximum 50 MB</p>
      <button type="button" className="pill mt-6 inline-flex items-center gap-2 bg-black px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50" onClick={() => inputRef.current?.click()} disabled={disabled}>
        {disabled ? <LoaderCircle className="animate-spin" size={15} /> : <ArrowUp size={15} />} Choose file
      </button>
      {message && <p className="mt-4 text-sm text-[#181818]" role="alert">{message}</p>}
    </div>
  );
}
