export function SignalBars({ rsrp }: { rsrp: number | null }) {
  const v = rsrp ?? -140;
  const level = v >= -80 ? 4 : v >= -95 ? 3 : v >= -105 ? 2 : v >= -115 ? 1 : 0;
  const color = level >= 3 ? "bg-emerald-500" : level === 2 ? "bg-amber-400" : "bg-rose-500";
  return (
    <div className="flex items-end gap-[3px]">
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`w-[5px] rounded-sm ${i <= level ? color : "bg-slate-200"}`}
          style={{ height: `${i * 4 + 2}px` }}
        />
      ))}
    </div>
  );
}

export const grade_th: Record<string, string> = {
  Excellent: "ดีเยี่ยม",
  Good: "ดี",
  Fair: "ปานกลาง",
  Poor: "อ่อน",
  Critical: "วิกฤต",
  Unknown: "ไม่ทราบ",
};
