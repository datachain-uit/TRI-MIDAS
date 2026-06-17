"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Database,
  Scale,
} from "lucide-react";

// --- DỮ LIỆU ---

// 1. Dữ liệu so sánh Before/After
const comparisonData = [
  {
    name: "Completeness",
    Before: 0.160873206,
    After: 1,
  },
  {
    name: "Consistency",
    Before: 0.603008,
    After: 1,
  },
];

// 2. Dữ liệu chi tiết Data Quality (Mapping từ chuỗi số bạn cung cấp)
// Data: 1, 0.509..., 0.815..., 0.186..., 0.796..., 0.5, 0.626..., 0.473..., 52.94...
const metricsRaw = {
  snan: 1,
  smaj: 0.509509449,
  sjsd: 0.815330929,
  sent: 0.186512633,
  sdrift: 0.7962774,
  sleak: 0.5,
  S_san_plus: 0.626632277,
  Sperf: 0.4731626083,
  Acc_TEMPO: 52.9433423, // Cái này thang 100
};

// Chuyển đổi sang format cho biểu đồ (Loại Acc_TEMPO ra để hiển thị riêng)
const detailMetricsData = [
  { name: "snan", value: metricsRaw.snan, fill: "#3b82f6" }, // Blue
  { name: "smaj", value: metricsRaw.smaj, fill: "#8b5cf6" }, // Violet
  { name: "sjsd", value: metricsRaw.sjsd, fill: "#2dd4bf" }, // Teal
  { name: "sent", value: metricsRaw.sent, fill: "#f59e0b" }, // Amber
  { name: "sdrift", value: metricsRaw.sdrift, fill: "#ef4444" }, // Red
  { name: "sleak", value: metricsRaw.sleak, fill: "#ec4899" }, // Pink
  { name: "S_san+", value: metricsRaw.S_san_plus, fill: "#06b6d4" }, // Cyan
  { name: "Sperf", value: metricsRaw.Sperf, fill: "#6366f1" }, // Indigo
];

// --- CẤU HÌNH LÝ THUYẾT ---
const definitions = [
  {
    key: "snan",
    title: "Missing Values Ratio",
    desc: "Proportion of missing values in the dataset. (1 = No missing values)",
  },
  {
    key: "smaj",
    title: "Class Imbalance",
    desc: "Ratio of the majority class. Lower is often better for balanced learning.",
  },
  {
    key: "sjsd",
    title: "Distribution Shift",
    desc: "Jensen-Shannon distance measuring how data distribution differs from a reference.",
  },
  {
    key: "sent",
    title: "Class Entropy",
    desc: "Measure of impurity or randomness in the data classes.",
  },
  {
    key: "sdrift",
    title: "Concept Drift",
    desc: "Changes in data distribution over time that affect model accuracy.",
  },
  {
    key: "sleak",
    title: "Data Leakage",
    desc: "Risk of training data containing information from the target variable.",
  },
  {
    key: "S_san+",
    title: "Sanitation Score",
    desc: "Effectiveness of data cleaning and preprocessing steps.",
  },
  {
    key: "Sperf",
    title: "Performance Proxy",
    desc: "Estimated potential performance of a model trained on this data.",
  },
];

export default function DataQualityPage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
          Data Quality Assessment
        </h1>
        <p className="text-zinc-400">
          Monitoring completeness, consistency, and advanced quality metrics.
        </p>
      </div>

      {/* --- SECTION 1: COMPLETENESS & CONSISTENCY (2 Columns) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cột 1: Lý thuyết */}
        <Card className="bg-zinc-900/50 border-zinc-800 text-zinc-100 flex flex-col justify-center">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Database className="text-blue-400" />
              Foundational Metrics
            </CardTitle>
            <CardDescription>
              Understanding the core pillars of data reliability.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-zinc-800/50 rounded-lg border-l-4 border-green-500">
              <h3 className="font-semibold text-green-400 mb-1 flex items-center gap-2">
                <CheckCircle2 size={18} /> Completeness
              </h3>
              <p className="text-sm text-zinc-300">
                Measures the percentage of fields that contain values versus
                missing data (null/NaN). A score of <strong>1.0</strong> means
                zero missing values. Essential for ensuring your dataset has
                enough information for analysis.
              </p>
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-lg border-l-4 border-yellow-500">
              <h3 className="font-semibold text-yellow-400 mb-1 flex items-center gap-2">
                <Scale size={18} /> Consistency
              </h3>
              <p className="text-sm text-zinc-300">
                Evaluates whether data follows defined rules and constraints.
                Ensures logical validity across your dataset (e.g., age cannot
                be negative, format matches ISO standards).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cột 2: Biểu đồ so sánh */}
        <Card className="bg-zinc-900/50 border-zinc-800 text-zinc-100">
          <CardHeader>
            <CardTitle>Processing Impact Analysis</CardTitle>
            <CardDescription>
              Comparing metrics before and after data cleaning pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#888" tick={{ fill: "#888" }} />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    color: "#f4f4f5",
                  }}
                  itemStyle={{ color: "#f4f4f5" }}
                  cursor={{ fill: "transparent" }}
                />
                <Legend />
                <Bar
                  dataKey="Before"
                  fill="#ef4444" // Red for Before
                  radius={[4, 4, 0, 0]}
                  name="Before Processing"
                  animationDuration={1500}
                />
                <Bar
                  dataKey="After"
                  fill="#2dd4bf" // Teal for After
                  radius={[4, 4, 0, 0]}
                  name="After Processing"
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* --- SECTION 2: DETAILED METRICS VISUALIZATION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        {/* Thẻ riêng cho Acc-TEMPO (Thang 100) */}
        <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-zinc-700 flex flex-col justify-center items-center text-center py-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          <ShieldCheck className="w-12 h-12 text-indigo-400 mb-4" />
          <h2 className="text-5xl font-extrabold text-white tracking-tighter">
            {metricsRaw.Acc_TEMPO.toFixed(2)}
          </h2>
          <p className="text-indigo-200 mt-2 font-medium">Acc-TEMPO Score</p>
          <p className="text-zinc-400 text-xs mt-4 px-6">
            Overall Data Quality Accuracy (Scaled 1-100)
          </p>
        </Card>

        {/* Biểu đồ cho các chỉ số [0,1] */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="text-purple-400" />
              Advanced Quality Indicators
            </CardTitle>
            <CardDescription>
              Detailed breakdown of statistical quality metrics (Scale 0-1).
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={detailMetricsData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                <XAxis type="number" domain={[0, 1]} hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#a1a1aa"
                  width={60}
                  tick={{ fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-zinc-900 border border-zinc-700 p-2 rounded shadow-lg text-xs text-white">
                          <p className="font-bold mb-1">{payload[0].payload.name}</p>
                          <p>Value: {Number(payload[0].value).toFixed(4)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} background={{ fill: "#27272a" }}>
                    {/* Map màu riêng cho từng thanh nếu muốn đẹp hơn */}
                    {detailMetricsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* --- SECTION 3: METRIC DEFINITIONS (THEORY) --- */}
      <div className="pt-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-zinc-400" />
          Metric Reference Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {definitions.map((def) => (
            <div
              key={def.key}
              className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800/60 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                  {def.key}
                </span>
              </div>
              <h4 className="text-sm font-medium text-zinc-200 mb-1">
                {def.title}
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {def.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}