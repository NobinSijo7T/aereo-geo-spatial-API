export type FileStatus = "processing" | "completed" | "failed" | string;

export interface FileRecord {
  id: string;
  filename: string;
  feature_count: number;
  crs: string | null;
  status: FileStatus;
}

export interface Measurement {
  type: string | null;
  value: number | null;
  unit: string | null;
  status: string;
  error: string | null;
}

export interface FeatureRecord {
  feature_index: number;
  geometry_type: string;
  geometry: Record<string, unknown>;
  display_geometry: Record<string, unknown> | null;
  crs: string | null;
  measurement_crs: string | null;
  properties: Record<string, unknown>;
  measurement: Measurement;
}

export interface SummaryRecord {
  total_features: number;
  geometry_counts: Record<string, number>;
  area_total_m2: number;
  length_total_m: number;
  successful_measurements: number;
  failed_measurements: number;
  unsupported_geometries: number;
  not_required_measurements: number;
  source_crs: string | null;
  measurement_crs: string[];
}

export interface DiagnosticRecord { feature_index: number; geometry_type: string; status: string; category: string; error: string | null; source_crs: string | null; measurement_crs: string | null; }

export interface MeasurementPage {
  file_id: string;
  features: FeatureRecord[];
  page: number;
  page_size: number;
  total: number;
}

const configuredBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
const productionApiUrl = "https://aereo-geo-spatial-api-production.up.railway.app";
const defaultHost = typeof window === "undefined" ? "127.0.0.1" : window.location.hostname;
const isLocalBrowser = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
const apiBaseUrls = Array.from(new Set([
  configuredBaseUrl,
  productionApiUrl,
  ...(isLocalBrowser || typeof window === "undefined" ? [`http://${defaultHost}:8000`, `http://${defaultHost}:8001`] : []),
])).filter(Boolean);
const baseUrl = apiBaseUrls[0] || `http://${defaultHost}:8000`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let lastNetworkError: unknown;
  for (const apiBaseUrl of apiBaseUrls) {
    try {
      const response = await fetch(`${apiBaseUrl}${path}`, init);
      if (!response.ok) {
        let detail = `Request failed (${response.status})`;
        try {
          const payload = await response.json() as { detail?: string };
          if (payload.detail) detail = payload.detail;
        } catch { /* Keep the HTTP fallback. */ }
        throw new Error(detail);
      }
      return response.json() as Promise<T>;
    } catch (caught) {
      if (caught instanceof Error && !caught.message.includes("Failed to fetch") && !caught.message.includes("NetworkError")) throw caught;
      lastNetworkError = caught;
    }
  }
  void lastNetworkError;
  throw new Error("Could not reach the API. Check NEXT_PUBLIC_API_BASE_URL or the Railway API deployment.");
}

export function uploadFile(file: File, signal?: AbortSignal) {
  const body = new FormData();
  body.append("file", file);
  return request<FileRecord>("/api/files/", { method: "POST", body, signal });
}

export function getFile(id: string, signal?: AbortSignal) {
  return request<FileRecord>(`/api/files/${encodeURIComponent(id)}/`, { signal, cache: "no-store" });
}

export function getMeasurements(id: string, page: number, pageSize: number, signal?: AbortSignal) {
  return request<MeasurementPage>(`/api/files/${encodeURIComponent(id)}/measurements/?page=${page}&page_size=${pageSize}`, { signal, cache: "no-store" });
}

export function getSummary(id: string, signal?: AbortSignal) { return request<SummaryRecord>(`/api/files/${encodeURIComponent(id)}/summary/`, { signal, cache: "no-store" }); }
export function getDiagnostics(id: string, signal?: AbortSignal) { return request<DiagnosticRecord[]>(`/api/files/${encodeURIComponent(id)}/diagnostics/`, { signal, cache: "no-store" }); }
export function exportUrl(id: string) { return `${baseUrl}/api/files/${encodeURIComponent(id)}/export.csv`; }

export async function downloadCsv(id: string, signal?: AbortSignal) {
  for (const apiBaseUrl of apiBaseUrls) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/files/${encodeURIComponent(id)}/export.csv`, { signal });
      if (!response.ok) throw new Error(`Export failed (${response.status})`);
      return response.blob();
    } catch (caught) {
      if (caught instanceof Error && !caught.message.includes("Failed to fetch") && !caught.message.includes("NetworkError")) throw caught;
    }
  }
  throw new Error("Could not reach the API. Check NEXT_PUBLIC_API_BASE_URL or the Railway API deployment.");
}

export { baseUrl };
