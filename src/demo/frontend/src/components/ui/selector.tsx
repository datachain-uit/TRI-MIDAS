"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

interface VersionSelectorProps {
  value: string;
  onChange: (val: string) => void;
  options: { id: string; label: string }[];
}

export const Selector = ({
  value,
  onChange,
  options,
}: VersionSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((opt) => opt.id === value)?.label;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-4 bg-[#27272a] hover:bg-[#3f3f46] border border-zinc-700 text-sm px-4 py-2 rounded-full transition-all min-w-[170px] ${
          isOpen ? "ring-2 ring-[#6366f1]/50 border-[#6366f1]/50" : ""
        }`}
      >
        <span className="font-semibold text-orange-100">{selectedLabel}</span>
        <ChevronDown
          size={16}
          className={`text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[220px] bg-[#18181b] border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
              className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between group transition-colors ${
                value === opt.id
                  ? "bg-orange-500/10 text-orange-200"
                  : "text-zinc-400 hover:bg-[#27272a] hover:text-zinc-200"
              }`}
            >
              <span>{opt.label}</span>
              {value === opt.id && (
                <Check size={14} className="text-orange-400" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
