import type { FileRecord } from "@/lib/api";
import { StatusLabel } from "@/components/StatusLabel";

export function FileSummary({ file }: { file: FileRecord }) {
  const items = [["Filename", file.filename], ["Features", String(file.feature_count)], ["Source CRS", file.crs || "Not reported"], ["Status", file.status]];
  return <dl className="grid border-y hairline sm:grid-cols-2 lg:grid-cols-4">{items.map(([label, value]) => <div className="border-b hairline px-0 py-4 last:border-0 sm:px-5 sm:first:pl-0 lg:border-b-0 lg:border-r lg:last:border-0" key={label}><dt className="eyebrow">{label}</dt><dd className={`mt-2 ${label === "Status" ? "" : "tabular"}`}>{label === "Status" ? <StatusLabel status={value} /> : value}</dd></div>)}</dl>;
}

