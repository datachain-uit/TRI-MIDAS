"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomPieChart } from "@/components/pie-chart";
import { BookOpen, Activity, PlayCircle } from "lucide-react";

// --- 1. HÀM TIỆN ÍCH: GÁN MÀU CHO BIỂU ĐỒ TRÒN ---
// Xử lý cả trường hợp tên đầy đủ (Excellent) và viết tắt (E, G, M, L, F)
const assignColor = (label: string) => {
  if (!label) return "#9CA3AF"; // Màu xám nếu null

  const l = String(label).toLowerCase().trim();

  // Nhóm Tốt (Teal): Excellent, High, E, H
  if (["excellent", "high", "e", "h"].some(k => l === k || l.includes(k)))
    return "#2dd4bf";

  // Nhóm Trung bình (Amber): Good, Average, Medium, G, A, M
  if (["good", "average", "medium", "g", "a", "m"].some(k => l === k || l.includes(k)))
    return "#f59e0b";

  // Nhóm Thấp/Cảnh báo (Rose): Failed, Risk, Low, F, L, R
  if (["failed", "risk", "low", "l", "f", "r"].some(k => l === k || l.includes(k)))
    return "#f43f5e";

  return "#94a3b8"; // Mặc định
};

// --- 2. COMPONENT HIỂN THỊ NHÃN (BADGE) ---
const StatusBadge = ({ label }: { label: string }) => {
  const safeLabel = label || "N/A";
  const l = String(safeLabel).toLowerCase().trim();

  let colorClass = "text-gray-400 bg-gray-400/10"; // Mặc định xám

  if (["excellent", "high", "e", "h"].some(k => l === k || l.includes(k)))
      colorClass = "text-teal-400 bg-teal-400/10";

  else if (["good", "average", "medium", "g", "a", "m"].some(k => l === k || l.includes(k)))
      colorClass = "text-amber-400 bg-amber-400/10";

  else if (["failed", "risk", "low", "l", "f", "r"].some(k => l === k || l.includes(k)))
      colorClass = "text-rose-400 bg-rose-400/10";

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colorClass} border border-white/5`}>
      {safeLabel}
    </span>
  );
};

// --- 3. COMPONENT CHÍNH (chỉ tập trung Course Quality) ---
export default function OverviewPage() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
  });

  const [courseDistribution, setCourseDistribution] = useState<any[]>([]);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [resStats, resDist, resList] = await Promise.all([
          fetch("/api/overview-stats"),
          fetch("/api/distribution-stats"),
          fetch("/api/list-stats"),
        ]);

        const dataStats = await resStats.json();
        const dataDist = await resDist.json();
        const dataList = await resList.json();

        setStats(dataStats);

        setCourseDistribution(
          (dataDist.courseDistribution || []).map((item: any) => ({
            name: item.name || "Unknown",
            value: item.value,
            color: assignColor(item.name),
          }))
        );

        setTopCourses(dataList.topCourses || []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const statsDisplay = [
    {
      label: "Total Courses",
      val: stats.totalCourses?.toLocaleString() || "0",
      sub: "Organized courses",
      icon: BookOpen,
    },
    {
      label: "Active Courses",
      val: stats.activeCourses?.toLocaleString() || "0",
      sub: "With quality records",
      icon: Activity,
    },
  ];

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-zinc-400 gap-2">
        <Activity className="animate-spin w-8 h-8 text-blue-500" />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <h1 className="text-3xl font-bold mb-2 tracking-tight drop-shadow-md text-white">
        Overview
      </h1>

      {/* --- PHẦN 1: THẺ STATS (course quality) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {statsDisplay.map((item, i) => (
          <StatCard
            key={i}
            value={item.val}
            label={item.label}
            subtext={item.sub}
            icon={item.icon}
          />
        ))}
      </div>

      {/* --- PHẦN 2: COURSE QUALITY --- */}
      <div className="space-y-6">
        <CustomPieChart
          data={courseDistribution}
          title="Course Quality Distribution"
        />

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2 text-zinc-200">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Latest Course Activity
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Course Name</TableHead>
                <TableHead className="text-zinc-400 text-center">Views</TableHead>
                <TableHead className="text-zinc-400 text-center">Ex. Count</TableHead>
                <TableHead className="text-zinc-400 text-right">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCourses?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-zinc-500 py-8">
                    No course data available
                  </TableCell>
                </TableRow>
              )}

              {topCourses?.map((c: any, i: number) => (
                <TableRow key={i} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                  <TableCell className="font-medium text-zinc-200 truncate max-w-[200px]" title={c.name}>
                      {c.name}
                  </TableCell>
                  <TableCell className="text-center text-zinc-400">
                    <div className="flex justify-center items-center gap-1">
                       <PlayCircle className="w-3 h-3 text-zinc-500" />
                       {(Number(c.views) || 0).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-zinc-400">
                    {Number(c.exercises).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <StatusBadge label={c.label} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
