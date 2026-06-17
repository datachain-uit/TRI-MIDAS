import React from "react";
import { ChevronRight, ChevronLeft, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  if (totalPages <= 0) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center py-4 select-none font-sans",
        className
      )}
    >
      <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/5 rounded-full shadow-lg transition-all duration-300 hover:bg-black/60 hover:border-[#2dd4bf]/30 hover:shadow-[0_0_15px_rgba(0,0,0,0.2)]">
        {/* prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-full text-zinc-400 hover:text-[#2dd4bf] hover:bg-[#2dd4bf]/10 transition-all disabled:opacity-20 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === "...") {
              return (
                <span key={`dots-${index}`} className="px-2 text-zinc-500">
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              );
            }

            const isActive = currentPage === page;

            return (
              <button
                key={index}
                onClick={() => onPageChange(page as number)}
                className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-[#2dd4bf] text-black shadow-[0_0_10px_rgba(255,252,230,0.4)] scale-110 font-bold" // Giảm bóng glow của nút active
                    : "text-zinc-400 hover:text-[#2dd4bf] hover:bg-[#2dd4bf]/10"
                )}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-full text-zinc-400 hover:text-[#2dd4bf] hover:bg-[#2dd4bf]/10 transition-all disabled:opacity-20 disabled:hover:bg-transparent"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
