"use client";

import { BookOpen } from "lucide-react";

export function TheorySection({ content }: { content: any[] }) {
  return (
    <div className="bg-[#1a1c1b]/60 p-8 rounded-2xl border border-white/5 h-full backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group">
      <h3 className="text-white text-md font-bold mb-10">Theory Foundation</h3>
      <div className="space-y-10">
        {content.map((item, idx) => (
          <div key={idx} className="relative pl-8 group/item">
            <div className="absolute left-0 top-0 w-[2px] h-full bg-orange-500/10 group-hover/item:bg-orange-500/40 transition-colors" />

            <div className="flex items-center gap-3 mb-3">
              <BookOpen size={18} className="text-orange-500" strokeWidth={2.5} />
              <h4 className="text-md font-semibold text-white">{item.title}</h4>
            </div>
            <p className="text-[13px] text-zinc-500 leading-relaxed font-medium italic">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
