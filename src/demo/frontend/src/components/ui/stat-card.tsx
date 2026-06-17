"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  className?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card className="relative  overflow-hidden pt-5 border border-indigo-500/20 rounded-2xl bg-[linear-gradient(to_bottom,#111827_70%,#0f1f2a_100%)] shadow-[0_12px_32px_-14px_rgba(0,0,0,0.75)]">
      <CardContent
        className={cn(
          "relative  flex flex-col gap-1 text-white h-full justify-center",
          className
        )}
      >
        <div className="absolute top-2 left-7 w-6 h-6 rounded-full bg-[#6366f1]/100 blur-[20px]" />

        <div className="relative z-10 w-9 h-9 rounded-lg flex items-center justify-center text-teal-300 mb-3">
          <Icon size={24} strokeWidth={1.8} />
        </div>

        <h3 className="text-[22px] leading-tight font-semibold tracking-tight">
          {value}
        </h3>

        <p className="text-md text-zinc-300 font-medium">{label}</p>
        {subtext && (
          <p className="text-[13px] text-zinc-500 mt-1 tracking-wider">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
}
