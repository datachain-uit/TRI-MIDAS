"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomLegend from "@/components/custom-legend";
import { cn } from "@/lib/utils";

interface PieChartItem {
  name: string;
  value: number;
  color: string;
}

interface OutcomePieChartProps {
  data: PieChartItem[];
  title: string | null;
  className?: string;
}

export function CustomPieChart({
  data,
  title = null,
  className,
}: OutcomePieChartProps) {
  return (
    <Card
      className={cn(
        "bg-[linear-gradient(to_bottom,#111827_10%,#0f1f2a_100%)] border border-indigo-500/10 shadow-xl shadow-black/30 min-w-[300px]",
        className
      )}
    >
      <CardHeader>
        <CardTitle className="text-xl font-medium">{title}</CardTitle>
      </CardHeader>

      <CardContent className="h-[250px] relative border-0 p-2">
        <div className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                className="outline-none focus:outline-none"
                data={data}
                cx="40%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f1f1f",
                  borderColor: "#333",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend
                content={<CustomLegend />}
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ right: 0, paddingLeft: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
