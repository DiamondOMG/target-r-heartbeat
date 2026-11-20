"use client";

import React from "react";
import { TelemetryRecord } from "@/types/router_types";

interface TelemetryChartProps {
  data: TelemetryRecord[];
  type: "signal" | "traffic";
}

const W = 600;
const H = 200;
const PAD = { top: 20, right: 20, bottom: 28, left: 52 };
const CW = W - PAD.left - PAD.right;
const CH = H - PAD.top - PAD.bottom;

function build_path(values: number[], min_val: number, max_val: number) {
  const range = max_val - min_val || 1;
  const pts = values.map((v, i) => ({
    x: PAD.left + (i / Math.max(values.length - 1, 1)) * CW,
    y: PAD.top + CH - ((v - min_val) / range) * CH,
  }));
  // smooth curve
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const cx = (p0.x + p1.x) / 2;
    d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return { d, pts };
}

export function TelemetryChart({ data, type }: TelemetryChartProps) {
  if (!data || data.length < 2) {
    return (
      <div className="card flex h-56 items-center justify-center text-sm text-slate-400">
        กำลังรอข้อมูลรอบถัดไป...
      </div>
    );
  }

  const times = data.map((d) => d.timestamp.split(" ")[1]?.slice(0, 5) || "");
  const grid = [0, 0.25, 0.5, 0.75, 1];

  if (type === "signal") {
    const vals = data.map((d) => d.rsrp_dbm ?? -120);
    const min_val = Math.min(...vals, -110) - 2;
    const max_val = Math.max(...vals, -70) + 2;
    const { d, pts } = build_path(vals, min_val, max_val);
    const area = `${d} L ${pts[pts.length - 1].x} ${PAD.top + CH} L ${pts[0].x} ${PAD.top + CH} Z`;
    const last = vals[vals.length - 1];

    return (
      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">ความแรงสัญญาณ 4G</p>
            <p className="text-xs text-slate-400">RSRP (dBm) · ยิ่งใกล้ 0 ยิ่งดี</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-600">{last} dBm</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-48 w-full">
          <defs>
            <linearGradient id="sig_grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          {grid.map((g) => {
            const y = PAD.top + CH * g;
            const v = Math.round(max_val - (max_val - min_val) * g);
            return (
              <g key={g}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
                <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{v}</text>
              </g>
            );
          })}
          <path d={area} fill="url(#sig_grad)" />
          <path d={d} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="5" fill="#fff" stroke="#2563eb" strokeWidth="2.5" />
          <text x={PAD.left} y={H - 6} fontSize="10" fill="#94a3b8">{times[0]}</text>
          <text x={W - PAD.right} y={H - 6} fontSize="10" fill="#94a3b8" textAnchor="end">{times[times.length - 1]}</text>
        </svg>
      </div>
    );
  }

  const rx = data.map((d) => d.download_delta_kb || 0);
  const tx = data.map((d) => d.upload_delta_kb || 0);
  const max_val = Math.max(...rx, ...tx, 10) * 1.1;
  const rx_path = build_path(rx, 0, max_val);
  const tx_path = build_path(tx, 0, max_val);
  const rx_area = `${rx_path.d} L ${rx_path.pts[rx_path.pts.length - 1].x} ${PAD.top + CH} L ${rx_path.pts[0].x} ${PAD.top + CH} Z`;
  const fmt = (kb: number) => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`);

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">ปริมาณการใช้เน็ตต่อรอบ</p>
          <div className="mt-1 flex gap-3 text-xs">
            <span className="flex items-center gap-1 text-sky-600"><span className="h-2 w-2 rounded-full bg-sky-500" />Download</span>
            <span className="flex items-center gap-1 text-indigo-600"><span className="h-2 w-2 rounded-full bg-indigo-500" />Upload</span>
          </div>
        </div>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
          ↓ {fmt(rx[rx.length - 1])} · ↑ {fmt(tx[tx.length - 1])}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-48 w-full">
        <defs>
          <linearGradient id="rx_grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </linearGradient>
        </defs>
        {grid.map((g) => {
          const y = PAD.top + CH * g;
          return (
            <g key={g}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{fmt(max_val * (1 - g))}</text>
            </g>
          );
        })}
        <path d={rx_area} fill="url(#rx_grad)" />
        <path d={rx_path.d} fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
        <path d={tx_path.d} fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />
        <text x={PAD.left} y={H - 6} fontSize="10" fill="#94a3b8">{times[0]}</text>
        <text x={W - PAD.right} y={H - 6} fontSize="10" fill="#94a3b8" textAnchor="end">{times[times.length - 1]}</text>
      </svg>
    </div>
  );
}
