"use client";

import React, { useEffect, useState } from "react";
import { RouterDevice, TelemetryRecord } from "@/types/router_types";
import { fetchRouterHistory, updateSiteName } from "@/lib/api_client";
import { TelemetryChart } from "@/components/telemetry_chart";
import { SignalBars, grade_th } from "@/components/signal_bars";
import { X, Edit2, Check, Smartphone, CreditCard, Cpu, Clock, Radio, Users, Wifi, ArrowDownUp, MapPin } from "lucide-react";

interface Props {
  router: RouterDevice;
  onClose: () => void;
  onUpdateSuccess: () => void;
}

export function RouterDetailModal({ router, onClose, onUpdateSuccess }: Props) {
  const [history, setHistory] = useState<TelemetryRecord[]>([]);
  const [editing, setEditing] = useState(false);
  const [site_input, setSiteInput] = useState(router.site_name || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRouterHistory(router.imei, 60).then(setHistory).catch(console.error);
  }, [router.imei]);

  const save_site = async () => {
    setSaving(true);
    try {
      await updateSiteName(router.imei, site_input);
      setEditing(false);
      onUpdateSuccess();
    } catch {
      alert("บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const info = [
    { icon: Smartphone, label: "IMEI (เครื่อง)", value: router.imei },
    { icon: CreditCard, label: "ICCID (ซิม)", value: router.iccid || "-" },
    { icon: Cpu, label: "Firmware", value: router.firmware_version || "-" },
    { icon: Clock, label: "ล่าสุด", value: router.last_seen || "-" },
  ];

  const online = router.status === "online";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/30 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="my-8 w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-blue-900/20" onClick={(e) => e.stopPropagation()}>
        {/* Hero header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 px-8 py-7 text-white">
          <button onClick={onClose} className="absolute right-5 top-5 rounded-full bg-white/20 p-2 hover:bg-white/30">
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-blue-100">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold ${online ? "bg-emerald-400/90 text-white" : "bg-rose-500/90 text-white"}`}>
              <span className={`h-1.5 w-1.5 rounded-full bg-white ${online ? "animate-pulse" : ""}`} />
              {online ? "ออนไลน์" : "ออฟไลน์"}
            </span>
            {router.model} · {router.wan_ip}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <MapPin className="h-6 w-6 text-blue-100" />
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  value={site_input}
                  onChange={(e) => setSiteInput(e.target.value)}
                  autoFocus
                  placeholder="เช่น สาขาสยามสแควร์"
                  className="rounded-xl border-0 bg-white/95 px-3 py-1.5 text-lg font-semibold text-slate-800 outline-none ring-2 ring-white/50"
                />
                <button onClick={save_site} disabled={saving} className="rounded-xl bg-white p-2 text-blue-600 hover:bg-blue-50">
                  <Check className="h-5 w-5" />
                </button>
                <button onClick={() => setEditing(false)} className="rounded-xl bg-white/20 p-2 hover:bg-white/30">
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="group flex items-center gap-2 text-left">
                <h2 className="text-2xl font-bold">{router.site_name || "ยังไม่ได้ตั้งชื่อจุดติดตั้ง"}</h2>
                <Edit2 className="h-4 w-4 opacity-60 group-hover:opacity-100" />
              </button>
            )}
          </div>

          {/* Highlight stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
              <p className="flex items-center gap-1.5 text-xs text-blue-100"><Radio className="h-3.5 w-3.5" />สัญญาณ RSRP</p>
              <p className="mt-1 text-2xl font-bold">{router.rsrp_dbm ?? "-"}<span className="ml-1 text-sm font-normal">dBm</span></p>
              <p className="text-xs text-blue-100">{grade_th[router.signal_grade] || "-"}</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
              <p className="text-xs text-blue-100">เสา / Band</p>
              <p className="mt-1 text-2xl font-bold">B{router.lte_band ?? "-"}</p>
              <p className="text-xs text-blue-100">Cell {router.cell_id}</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
              <p className="flex items-center gap-1.5 text-xs text-blue-100"><Users className="h-3.5 w-3.5" />อุปกรณ์ต่ออยู่</p>
              <p className="mt-1 text-2xl font-bold">{router.connected_devices_total}<span className="ml-1 text-sm font-normal">เครื่อง</span></p>
              <p className="flex items-center gap-1 text-xs text-blue-100"><Wifi className="h-3 w-3" />Wi-Fi {router.wifi_devices_count}</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
              <p className="flex items-center gap-1.5 text-xs text-blue-100"><ArrowDownUp className="h-3.5 w-3.5" />Data สะสม</p>
              <p className="mt-1 text-2xl font-bold">{(router.download_total_gb + router.upload_total_gb).toFixed(2)}<span className="ml-1 text-sm font-normal">GB</span></p>
              <p className="text-xs text-blue-100">↓{router.download_total_gb} · ↑{router.upload_total_gb}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 bg-gradient-to-b from-blue-50/60 to-white p-8">
          {/* Info row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {info.map((it) => (
              <div key={it.label} className="rounded-2xl border border-blue-100 bg-white p-4">
                <p className="flex items-center gap-1.5 text-xs text-slate-400"><it.icon className="h-3.5 w-3.5 text-blue-500" />{it.label}</p>
                <p className="mt-1 truncate font-mono text-sm font-medium text-slate-700" title={it.value}>{it.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <TelemetryChart data={history} type="signal" />
            <TelemetryChart data={history} type="traffic" />
          </div>

          {/* History table */}
          <div className="card overflow-hidden">
            <div className="border-b border-blue-50 px-5 py-3 text-sm font-semibold text-slate-700">ประวัติ Heartbeat ล่าสุด</div>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-blue-50/90 text-xs text-slate-500">
                  <tr>
                    {["เวลา", "สัญญาณ", "RSRQ", "SINR", "อุปกรณ์", "↓ Download", "↑ Upload"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.slice().reverse().slice(0, 15).map((h) => (
                    <tr key={h.id} className="hover:bg-blue-50/50">
                      <td className="px-4 py-2 font-mono text-xs text-slate-500">{h.timestamp.split(" ")[1]}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <SignalBars rsrp={h.rsrp_dbm} />
                          <span className="font-semibold text-slate-700">{h.rsrp_dbm}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-slate-600">{h.rsrq_db} dB</td>
                      <td className="px-4 py-2 text-slate-600">{h.sinr_db} dB</td>
                      <td className="px-4 py-2 text-slate-600">{h.connected_devices_total}</td>
                      <td className="px-4 py-2 text-sky-600">{h.download_delta_kb} KB</td>
                      <td className="px-4 py-2 text-indigo-600">{h.upload_delta_kb} KB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
