"use client";

import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1c1b] border border-white/10 p-3 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-md z-50">
        <p className="text-zinc-400 text-[12px] font-semibold tracking-widest mb-1">
          {payload[0].payload.subject}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-white font-mono font-semibold text-xl">
            {payload[0].value}
          </span>
          <span className="text-zinc-600 text-[10px] font-bold">
            / {payload[0].payload.fullMark || 100}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function AccDQSection({ data }: { data: any }) {
  const getDiagnosisIconAndColor = (type: string) => {
    switch (type) {
      case "success":
        return { icon: <CheckCircle2 size={16} />, colorClass: "text-green-400" };
      case "warning":
        return { icon: <AlertCircle size={16} />, colorClass: "text-yellow-400" };
      case "error":
        return { icon: <XCircle size={16} />, colorClass: "text-red-400" };
      default:
        return { icon: <AlertCircle size={16} />, colorClass: "text-zinc-400" };
    }
  };

  return (
    <div className="bg-[#1a1c1b]/60 p-8 rounded-2xl border border-white/5 backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 relative z-10">
        <div>
          <h3 className="text-white text-md font-bold flex items-center gap-2">
            Diagnostic Report
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex flex-col items-center justify-center min-w-[80px]">
            <span className="text-[13px] text-zinc-400 font-semibold tracking-widest mb-1">
              Score
            </span>
            <span className="text-base font-mono font-bold text-white leading-none">
              {data.score}
            </span>
          </div>

          <div
            className={`px-4 py-2 rounded-lg flex flex-col items-center justify-center min-w-[80px] border ${
              data.status === "Poor"
                ? "bg-red-500/10 border-red-500/20"
                : data.status === "Warning"
                ? "bg-yellow-500/10 border-yellow-500/20"
                : "bg-green-500/10 border-green-500/20"
            }`}
          >
            <span
              className="text-[13px] font-semibold tracking-widest mb-1 opacity-70"
              style={{
                color:
                  data.status === "Poor"
                    ? "#f43f5e"
                    : data.status === "Warning"
                    ? "#facc15"
                    : "#2dd4bf",
              }}
            >
              Status
            </span>
            <span
              className="text-base font-bold leading-none uppercase"
              style={{
                color:
                  data.status === "Poor"
                    ? "#f43f5e"
                    : data.status === "Warning"
                    ? "#facc15"
                    : "#2dd4bf",
              }}
            >
              {data.status}
            </span>
          </div>
        </div>
      </div>

      {/* chart */}
      <div className="flex-1 flex flex-col relative z-10">
        <div className="w-full flex justify-center items-center relative py-4 min-h-[300px]">
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] blur-[50px] rounded-full pointer-events-none ${
              data.status === "Poor"
                ? "bg-red-500/10"
                : data.status === "Warning"
                ? "bg-yellow-500/10"
                : "bg-green-500/10"
            }`}
          />

          <div className="w-full h-[300px] max-w-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data.radarData}>
                <PolarGrid stroke="#ffffff15" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#a1a1aa", fontSize: 13, fontWeight: 600, dy: 4 }}
                />
                <Radar
                  name="Metrics"
                  dataKey="A"
                  stroke={
                    data.status === "Poor"
                      ? "#f43f5e"
                      : data.status === "Warning"
                      ? "#facc15"
                      : "#2dd4bf"
                  }
                  strokeWidth={2}
                  fill={
                    data.status === "Poor"
                      ? "#f43f5e"
                      : data.status === "Warning"
                      ? "#facc15"
                      : "#2dd4bf"
                  }
                  fillOpacity={0.3}
                  isAnimationActive={true}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* diagnosis feed */}
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex items-center gap-2 text-zinc-50 text-sm font-bold tracking-widest mb-1">
            Diagnosis Feed
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.aiMessages.map((msg: any, i: number) => {
              const { icon, colorClass } = getDiagnosisIconAndColor(msg.type);
              return (
                <div
                  key={i}
                  className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg p-3 transition-colors duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${colorClass}`}>{icon}</div>
                    <div>
                      <h4 className={`text-sm font-bold ${colorClass} mb-1`}>
                        {msg.title}
                      </h4>
                      <p className="text-[13px] text-zinc-400 leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-7 pt-6 border-t border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 place-items-center">
            {data.footerIndicators.map((item: any, idx: number) => {
              return (
                <div
                  key={idx}
                  className="flex flex-col gap-1 items-center justify-center text-center p-2 rounded-lg hover:bg-white/5 transition-colors group w-full"
                >
                  <span className="text-[13px] text-zinc-200 font-bold tracking-wider line-clamp-1 group-hover:text-zinc-50 transition-colors">
                    {item.label}
                  </span>

                  <span className={`text-lg font-mono font-semibold ${item.color}`}>
                    {item.val}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
