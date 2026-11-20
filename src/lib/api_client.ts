import { RouterDevice, TelemetryRecord, SystemHealth } from "@/types/router_types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://18.143.141.90";

export async function fetchHealth(): Promise<SystemHealth> {
  const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error("Healthcheck failed");
  return res.json();
}

export async function fetchRouters(): Promise<RouterDevice[]> {
  const res = await fetch(`${API_BASE}/api/v1/routers`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch routers");
  const data = await res.json();
  return data.routers || [];
}

export async function fetchRouterHistory(imei: string, limit = 50): Promise<TelemetryRecord[]> {
  const res = await fetch(`${API_BASE}/api/v1/routers/${imei}/history?limit=${limit}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch history");
  const data = await res.json();
  return data.history || [];
}

export async function updateSiteName(imei: string, siteName: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/routers/${imei}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ site_name: siteName }),
  });
  if (!res.ok) throw new Error("Failed to update site name");
}
