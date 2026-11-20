"use client";

import React, { useEffect, useState, useCallback } from "react";
import { RouterDevice, SystemHealth } from "@/types/router_types";
import { fetchRouters, fetchHealth } from "@/lib/api_client";
import { RouterDetailModal } from "@/components/router_detail_modal";
import { SignalBars, grade_th } from "@/components/signal_bars";
import { Activity, Search, RefreshCw, Router as RouterIcon, CheckCircle2, AlertTriangle, Users, ChevronRight, Wifi, MapPin, Server } from "lucide-react";

const REFRESH_SEC = 15;

export default function DashboardPage() {
  const [routers, setRouters] = useState<RouterDevice[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");
  const [selected, setSelected] = useState<RouterDevice | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_SEC);

  const load_data = useCallback(async () => {
    setLoading(true);
    try {
      const [list, h] = await Promise.all([fetchRouters(), fetchHealth().catch(() => null)]);
      setRouters(list);
      setHealth(h);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load_data();
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          load_data();
          return REFRESH_SEC;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [load_data]);

  const q = search.toLowerCase();
  const filtered = routers.filter((r) => {
    const hit = [r.site_name, r.imei, r.model, r.wan_ip].some((v) => (v || "").toLowerCase().includes(q));
    if (!hit) return false;
    return filter === "all" || r.status === filter;
  });

  const online_count = routers.filter((r) => r.status === "online").length;
  const offline_count = routers.length - online_count;
  const total_clients = routers.reduce((a, r) => a + (r.connected_devices_total || 0), 0);
  const total_gb = routers.reduce((a, r) => a + (r.download_total_gb || 0) + (r.upload_total_gb || 0), 0);
  const uptime_pct = routers.length ? Math.round((online_count / routers.length) * 100) : 0;

  const kpis = [
    { label: "เราเตอร์ทั้งหมด", value: routers.length, unit: "เครื่อง", icon: RouterIcon, tone: "from-blue-500 to-blue-600", sub: "เป้าหมาย 100 สาขา" },
    { label: "ออนไลน์", value: online_count, unit: `${uptime_pct}%`, icon: CheckCircle2, tone: "from-emerald-400 to-emerald-500", sub: "ส่ง Heartbeat ปกติ" },
    { label: "ออฟไลน์", value: offline_count, unit: "เครื่อง", icon: AlertTriangle, tone: "from-rose-400 to-rose-500", sub: "ขาดการติดต่อ > 10 นาที" },
    { label: "อุปกรณ์เชื่อมต่อ", value: total_clients, unit: "เครื่อง", icon: Users, tone: "from-sky-400 to-cyan-500", sub: `Data รวม ${total_gb.toFixed(2)} GB` },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-blue-100/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 shadow-lg shadow-blue-500/30">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Target-R Heartbeat</h1>
              <p className="-mt-0.5 text-xs text-slate-400">ระบบมอนิเตอร์เราเตอร์ 4G LTE</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs sm:flex">
              <Server className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-slate-500">Server</span>
              <span className={`h-2 w-2 rounded-full ${health?.status === "ok" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              <span className={`font-semibold ${health?.status === "ok" ? "text-emerald-600" : "text-rose-600"}`}>{health?.status === "ok" ? "ปกติ" : "ขัดข้อง"}</span>
            </div>
            <button
              onClick={() => { load_data(); setCountdown(REFRESH_SEC); }}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition hover:bg-blue-700"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              รีเฟรช ({countdown}s)
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome banner */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 p-8 text-white shadow-xl shadow-blue-500/20">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 right-32 h-40 w-40 rounded-full bg-white/10" />
          <p className="text-sm text-blue-100">ภาพรวมระบบ</p>
          <h2 className="mt-1 text-3xl font-bold">
            {online_count}/{routers.length} เราเตอร์ทำงานปกติ
          </h2>
          <div className="mt-4 h-2 w-full max-w-md overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${uptime_pct}%` }} />
          </div>
          <p className="mt-2 text-xs text-blue-100">อัปเดตอัตโนมัติทุก {REFRESH_SEC} วินาที · ข้อมูลจาก TR-069 Heartbeat</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{k.label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${k.tone} shadow-md`}>
                  <k.icon className="h-4.5 w-4.5 text-white" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-800">
                {k.value}
                <span className="ml-1.5 text-sm font-medium text-slate-400">{k.unit}</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold text-slate-800">รายการเราเตอร์</h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex rounded-full border border-blue-100 bg-white p-1 text-xs shadow-sm">
              {([
                ["all", `ทั้งหมด ${routers.length}`],
                ["online", `ออนไลน์ ${online_count}`],
                ["offline", `ออฟไลน์ ${offline_count}`],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`rounded-full px-4 py-1.5 font-medium transition ${filter === key ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:text-blue-600"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหา สาขา, IMEI, IP..."
                className="w-full rounded-full border border-blue-100 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 sm:w-72"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-50/70 text-xs text-slate-500">
                <tr>
                  {["จุดติดตั้ง", "สถานะ", "สัญญาณ 4G", "เสา / Band", "อุปกรณ์", "Data สะสม", "ล่าสุด", ""].map((h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-3.5 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      {loading ? "กำลังโหลดข้อมูล..." : "ไม่พบเราเตอร์ที่ค้นหา"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const online = r.status === "online";
                    return (
                      <tr key={r.imei} onClick={() => setSelected(r)} className="group cursor-pointer transition hover:bg-blue-50/60">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                              <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{r.site_name || "ยังไม่ตั้งชื่อ"}</p>
                              <p className="font-mono text-xs text-slate-400">{r.model} · {r.imei}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${online ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                            {online ? "ออนไลน์" : "ออฟไลน์"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <SignalBars rsrp={r.rsrp_dbm} />
                            <div>
                              <p className="font-semibold text-slate-700">{r.rsrp_dbm ?? "-"} dBm</p>
                              <p className="text-xs text-slate-400">{grade_th[r.signal_grade] || "-"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-700">Band {r.lte_band ?? "-"}</p>
                          <p className="font-mono text-xs text-slate-400">{r.cell_id ?? "-"}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-700">{r.connected_devices_total} เครื่อง</p>
                          <p className="flex items-center gap-1 text-xs text-slate-400"><Wifi className="h-3 w-3" />Wi-Fi {r.wifi_devices_count}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sky-600">↓ {r.download_total_gb} GB</p>
                          <p className="text-indigo-500">↑ {r.upload_total_gb} GB</p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{r.last_seen?.split(" ")[1] || "-"}</td>
                        <td className="px-5 py-4 text-right">
                          <ChevronRight className="ml-auto h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">Target-R Heartbeat · TR-069 ACS on AWS Lightsail (Singapore)</p>
      </main>

      {selected && <RouterDetailModal router={selected} onClose={() => setSelected(null)} onUpdateSuccess={load_data} />}
    </div>
  );
}
