"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EnrollmentData {
  name: string;
  score: number;
}

interface EnrollmentLineChartProps {
  title: string;
  data: EnrollmentData[][];
  labels?: string[];
  className?: string;
  chartHeight?: number | string;
}

const LINE_COLORS = ["#6366f1", "#2dd4bf", "#f59e0b", "#f43f5e", "#8b5cf6"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 p-2 rounded shadow-md text-xs text-white">
        <p className="font-semibold mb-1 border-b border-zinc-600 pb-1">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="py-0.5">
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function CustomLineChart({
  title,
  data,
  labels,
  className,
  chartHeight,
}: EnrollmentLineChartProps) {
  const formattedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    const firstSeries = data[0];
    return firstSeries.map((item, index) => {
      const mergedItem: any = { name: item.name };
      data.forEach((series, seriesIndex) => {
        mergedItem[`score${seriesIndex}`] = series[index]?.score;
      });
      return mergedItem;
    });
  }, [data]);

  return (
    <Card
      className={cn(
        "flex flex-col col-span-1 p-4 lg:col-span-2 bg-[linear-gradient(to_bottom,#111827_10%,#0f1f2a_100%)] border border-indigo-500/10 shadow-xl shadow-black/30",
        "min-h-[400px]",
        className
      )}
      style={chartHeight ? { height: chartHeight } : undefined}
    >
      <CardHeader>
        <CardTitle className="text-xl font-medium text-white">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 w-full pl-0 pr-4 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ right: 20, bottom: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#636864ff"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="#fefeffff"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#f6f6ffff"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                value >= 1000 ? `${value / 1000}k` : value
              }
            />
            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: "20px", fontSize: "12px" }}
            />

            {data.map((_, index) => (
              <Line
                key={index}
                name={
                  labels && labels[index] ? labels[index] : `Nhóm ${index + 1}`
                }
                type="monotone"
                dataKey={`score${index}`}
                stroke={LINE_COLORS[index % LINE_COLORS.length]}
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: LINE_COLORS[index % LINE_COLORS.length],
                  strokeWidth: 0,
                }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
