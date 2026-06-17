"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BarChartItem {
  name: string;
  rate: number;
}

interface TopPassRateBarChartProps {
  data: BarChartItem[];
  title: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 p-2 rounded shadow-md">
        <p className="font-semibold mb-1 text-base ">{label}</p>
        <p style={{ color: payload[0].color }}>
          {payload[0].name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export function RateBarChart({ data, title }: TopPassRateBarChartProps) {
  const processedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      remain: 100 - item.rate,
    }));
  }, [data]);

  return (
    <Card className="h-full flex flex-col bg-[linear-gradient(to_bottom,#111827_10%,#0f1f2a_100%)] border border-indigo-500/10 shadow-xl shadow-black/30">
      <CardHeader className="shrink-0">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData} barCategoryGap="25%" barGap={4}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#58D764" />
                <stop offset="100%" stopColor="#FBE947" />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#27272a"
            />

            <XAxis
              dataKey="name"
              stroke="#71717a"
              fontSize={14}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip cursor={{ fill: "#27272a" }} content={<CustomTooltip />} />

            <Bar dataKey="rate" stackId="total">
              {processedData.map((_, index) => (
                <Cell
                  key={index}
                  fill="url(#colorGradient)"
                  fillOpacity={0.85}
                />
              ))}
            </Bar>

            <Bar dataKey="remain" stackId="total">
              {processedData.map((_, index) => (
                <Cell key={index} fill="#ffffff" fillOpacity={0.1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
