import type { SummaryRecord } from "@/lib/api";

const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
export function MeasurementSummary({ summary }: { summary: SummaryRecord }) {
  const areaHa = summary.area_total_m2 / 10000; const areaAcres = summary.area_total_m2 / 4046.8564224; const lengthKm = summary.length_total_m / 1000;
  const items = [["Features", nf.format(summary.total_features)], ["Polygon area", `${nf.format(summary.geometry_counts.Polygon || 0)} / ${nf.format(summary.geometry_counts.MultiPolygon || 0)} · ${nf.format(summary.area_total_m2)} m² · ${nf.format(areaHa)} ha · ${nf.format(areaAcres)} ac`], ["Line length", `${nf.format(summary.geometry_counts.LineString || 0)} / ${nf.format(summary.geometry_counts.MultiLineString || 0)} · ${nf.format(summary.length_total_m)} m · ${nf.format(lengthKm)} km`], ["Point features", `${nf.format(summary.geometry_counts.Point || 0)} / ${nf.format(summary.geometry_counts.MultiPoint || 0)} · no measurement`], ["Quality", `${summary.successful_measurements} success · ${summary.failed_measurements} failed · ${summary.not_required_measurements} N/A · ${summary.unsupported_geometries} unsupported`]];
  return <div className="grid border-y hairline sm:grid-cols-2 xl:grid-cols-5">{items.map(([label, value]) => <div key={label} className="border-b hairline px-0 py-4 sm:px-5 sm:first:pl-0 xl:border-b-0 xl:border-r xl:last:border-0"><p className="eyebrow">{label}</p><p className="mt-2 tabular text-sm">{value}</p></div>)}</div>;
}
