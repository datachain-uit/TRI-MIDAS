"use client";

import React from "react";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  variant?: "start" | "middle";
}

export const Tab = ({ active, onClick, label, variant = "middle" }: TabButtonProps) => {
  const clipPathUrl =
    variant === "start" ? "url(#tab-shape-start)" : "url(#tab-shape-middle)";

  const paddingClass = variant === "start" ? "pl-8 pr-14" : "px-12";

  return (
    <button
      onClick={onClick}
      style={{ clipPath: clipPathUrl }}
      className={`
        relative flex items-center gap-2 pt-3 pb-3 text-base font-bold transition-all duration-200
        ${paddingClass}
        -ml-8 first:ml-0

        ${
          active
            ? "bg-[#292B2A] text-white z-10 h-[48px] -mb-[1px]"
            : "bg-transparent hover:bg-[#121214] text-zinc-500 hover:text-zinc-300 z-0 h-[42px] mt-[6px]"
        }
      `}
    >
      <span className="relative z-20 tracking-wide">{label}</span>
    </button>
  );
};
