"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const gradients = [
  ["#2dd4bf", "#0d9488"],
  ["#6366f1", "#4338ca"],
];

const XAxisTick = ({ x, y, payload }: any) => (
  <text
    x={x}
    y={y}
    dy={16}
    textAnchor="middle"
    fontSize={13}
    fontWeight={500}
    style={{ fill: "#ffffff" }}
  >
    {payload.value}
  </text>
);

const YAxisTick = ({ x, y, payload }: any) => (
  <text
    x={x - 10}
    y={y + 4}
    textAnchor="end"
    fontSize={11}
    fontWeight={500}
    style={{ fill: "#ffffff" }}
  >
    {payload.value + "%"}
  </text>
);

export function QualityBarChart({ data }: { data: any[] }) {
  return (
    <div className="bg-[#1a1c1b]/60 p-8 rounded-2xl border border-white/5 h-full backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group flex flex-col">
      <h3 className="text-white text-md font-bold mb-10 text-left">
        Completeness & Consistency
      </h3>

      <div className="flex-1 w-full min-h-[280px]">
        <ChartContainer
          config={{}}
          className="w-full h-full [&_.recharts-text]:fill-white [&_.recharts-cartesian-axis-tick-value]:fill-white"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              barCategoryGap="35%"
              margin={{ top: 10, right: 20, bottom: 25, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.08)"
              />

              <defs>
                {data.map((_, index) => (
                  <linearGradient
                    key={index}
                    id={`barGrad${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={gradients[index % 2][0]} />
                    <stop offset="100%" stopColor={gradients[index % 2][1]} />
                  </linearGradient>
                ))}
              </defs>

              <YAxis
                width={45}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                tick={<YAxisTick />}
              />

              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                tick={<XAxisTick />}
                interval={0}
              />

              <ChartTooltip
                cursor={{ fill: "white", opacity: 0.03 }}
                content={<ChartTooltipContent />}
              />

              <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1500}>
                {data.map((_, index) => (
                  <Cell
                    key={index}
                    fill={`url(#barGrad${index})`}
                    className="drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
