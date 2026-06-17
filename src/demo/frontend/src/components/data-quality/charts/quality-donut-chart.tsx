"use client";

import { Label, Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function QualityDonutChart({ title, percent, label, data }: any) {
  return (
    <div className="bg-[#1a1c1b]/60 p-8 rounded-2xl border border-white/5 h-full backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group flex flex-col">
      <h3 className="text-white text-md font-bold mb-8 text-left relative z-10">
        {title}
      </h3>

      <div className="flex-1 flex flex-col items-center justify-between gap-6 relative z-10">
        <div className="w-full h-[180px] relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] bg-white/5 blur-[30px] rounded-full" />

          <ChartContainer config={{}} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      className="bg-[#1a1c1b] border-white/10"
                    />
                  }
                />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={65}
                  outerRadius={85}
                  strokeWidth={2}
                  paddingAngle={4}
                >
                  {data.map((entry: any, index: number) => (
                    <Cell
                      key={index}
                      fill={entry.fill}
                      className="hover:opacity-80 transition-opacity"
                      style={{ filter: `drop-shadow(0px 0px 4px ${entry.fill}66)` }}
                    />
                  ))}
                  <Label
                    content={({ viewBox }: any) => {
                      const { cx, cy } = viewBox;
                      return (
                        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan
                            x={cx}
                            y={cy}
                            className="fill-white text-3xl font-black tracking-tight leading-none"
                          >
                            {percent}%
                          </tspan>
                          <tspan
                            x={cx}
                            y={cy + 24}
                            className="fill-zinc-400 text-[10px] font-bold uppercase tracking-widest"
                          >
                            {label}
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* chú thích */}
        <div className="w-full grid grid-cols-2 gap-x-6 gap-y-3 px-2">
          {data.map((item: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg group/legend"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div
                    className="w-2.5 h-2.5 rounded-full relative z-10"
                    style={{ backgroundColor: item.fill }}
                  />
                  <div
                    className="absolute w-4 h-4 rounded-full blur-[4px] opacity-50 group-hover/legend:opacity-80 transition-opacity"
                    style={{ backgroundColor: item.fill }}
                  />
                </div>

                <span className="text-[13px] font-medium text-zinc-300 tracking-wider line-clamp-1">
                  {item.label}
                </span>
              </div>

              <span className="text-[13px] font-mono font-bold text-white tabular-nums">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
