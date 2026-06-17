"use client";

import React from "react";
import {
  BookOpen,
  Calendar,
  PlayCircle,
  FileText,
  Award,
  Users,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { CustomPieChart } from "@/components/pie-chart";
import { RateBarChart } from "@/components/rate-bar-chart";
import { CustomLineChart } from "@/components/line-chart";
import { InfoShape } from "./info-shape";

// --- DỮ LIỆU MOCK UP ---

const courseInfo = {
  name: "Machine Learning",
  description:
    "About this course: ¡Buscamos promover llevemos el desarrollo física de nuestros atletas. ¡Unite y juntos llevemos el a otro nivel!...",
  startDate: "16/09/2025",
  endDate: "16/01/2026",
  status: "Available now",
};

const barData = [
  { name: "Excellent", rate: 45 },
  { name: "Good", rate: 60 },
  { name: "Average", rate: 85 },
];

const pieData = [
  { name: "Exam", value: 79, color: "#6366f1" },
  { name: "Exercise", value: 17, color: "#f59e0b" },
  { name: "Video", value: 4, color: "#2dd4bf" },
];

const lineData = [
  [
    { name: "Phase 1", score: 14000 },
    { name: "Phase 2", score: 21000 },
    { name: "Phase 3", score: 7000 },
    { name: "Phase 4", score: 15000 },
  ],
  [
    { name: "Phase 1", score: 14000 },
    { name: "Phase 2", score: 11000 },
    { name: "Phase 3", score: 17000 },
    { name: "Phase 4", score: 25000 },
  ],
  [
    { name: "Phase 1", score: 14000 },
    { name: "Phase 2", score: 21000 },
    { name: "Phase 3", score: 17000 },
    { name: "Phase 4", score: 25000 },
  ],
];

const statCards = [
  {
    label: "Students",
    value: "10k",
    subtext: "",
    icon: Users,
  },
  {
    label: "Videos",
    value: "24",
    subtext: "",
    icon: PlayCircle,
  },
  {
    label: "Exercises",
    value: "60",
    subtext: "",
    icon: FileText,
  },
  {
    label: "Exams",
    value: "2",
    subtext: "",
    icon: Award,
  },
];
export default function CourseDashboard() {
  return (
    <div className="w-full  text-white flex justify-center font-sans">
      <div className="w-full grid  grid-cols-3 auto-rows-min gap-6">
        <div className="w-full relative col-span-2 row-span-2">
          <InfoShape className="w-full">
            <div className="flex flex-col justify-center h-ful  gap-6 pb-3">
              {/* Top info */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-5 h-5 text-amber-400 mt-1" />

                  <span className="text-zinc-400 text-xs uppercase ">
                    Course Name :
                  </span>
                  <h2 className="text-zinc-100 font-semibold text-lg ">
                    {courseInfo.name}
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 mb-4">
                  {/* Dates */}
                  <div className="space-y-3 min-w-[240px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-[#ff5f5f] w-4 h-4" />
                      <div className="text-sm flex text-zinc-400 gap-3">
                        <span>Start date:</span>
                        <div className="text-white font-medium">
                          {courseInfo.startDate}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="text-teal-400 w-4 h-4" />
                      <div className="text-sm flex text-zinc-400 gap-3">
                        <span>End date:</span>
                        <div className="text-white font-medium">
                          {courseInfo.endDate}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400 mt-1 shrink-0" />
                    <p className=" text-zinc-400 line-clamp-4">
                      {courseInfo.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 sm:w-[60%] lg:w-[60%] p-3">
                {statCards.map((item, index) => (
                  <StatCard key={index} {...item} />
                ))}
              </div>
            </div>
          </InfoShape>
        </div>

        {/* 3. BAR CHART CARD */}
        <div className="row-span-2">
          <RateBarChart data={barData} title="Monthly Pass Rate of Users" />
        </div>

        {/* 2. PIE CHART */}
        <div className="row-start-3 relative flex w-full rounded-3xl items-end pt-4 ">
          <CustomPieChart
            data={pieData}
            title={"Resource Distribution"}
            className="h-full w-full gap-12"
          />
        </div>

        {/* 4. LINE CHART CARD */}

        <CustomLineChart
          title="Number of comments by phase"
          data={lineData}
          labels={["positive", "neutral", "negative"]}
          className="col-span-1 h-full w-full"
        />
      </div>
    </div>
  );
}
