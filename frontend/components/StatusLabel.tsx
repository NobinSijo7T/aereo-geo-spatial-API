import { CircleAlert, CircleCheck, CircleDashed, CircleDot } from "lucide-react";

export function StatusLabel({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const Icon = normalized === "completed" || normalized === "success" ? CircleCheck : normalized === "failed" || normalized === "error" ? CircleAlert : normalized === "not_required" || normalized === "not_supported" ? CircleDot : CircleDashed;
  const label = normalized === "not_required" ? "Not applicable" : normalized === "not_supported" ? "Not supported" : normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return <span className="inline-flex items-center gap-2 text-xs text-[#6d6d6d]"><Icon size={14} strokeWidth={1.5} aria-hidden="true" />{label}</span>;
}

