"use client";

import React from "react";

interface InfoShapeProps {
  className?: string;
  children?: React.ReactNode;
}

export const InfoShape = ({ className = "", children }: InfoShapeProps) => {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* SVG Background - Đã chỉnh mép dưới ngắn lại mức trung bình */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 821 585" // Đã chỉnh viewBox cho khớp chiều cao mới
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none" // Quan trọng để co giãn theo Grid
      >
        <defs>
          <filter
            id="filter0_d_335_2184"
            x="0"
            y="0"
            width="821"
            height="585"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="4" dy="4" />
            <feGaussianBlur stdDeviation="3" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.0509804 0 0 0 0 0.054902 0 0 0 0 0.0705882 0 0 0 1 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_335_2184"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_335_2184"
              result="shape"
            />
          </filter>
          <radialGradient
            id="paint0_radial_335_2184"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(512.5 330) rotate(90) scale(182 201.5)"
            className=""
          >
            <stop stopColor="#2dd4bf" stopOpacity="0.41" />
            <stop offset="1" stopColor="#737373" stopOpacity="0" />
          </radialGradient>

          <linearGradient
            id="paint1_linear_335_2184"
            x1="410.5"
            y1="2"
            x2="410.5"
            y2="574"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.4" stopColor="#292B2A" />
            <stop offset="1" stopColor="#323734" />
          </linearGradient>
        </defs>

        {/* Path đã chỉnh ngắn mép dưới (V559 và 574) */}
        <g filter="url(#filter0_d_335_2184)">
          <path
            d="M811 292.906C811 301.191 804.284 307.906 796 307.906H520.967C512.683 307.906 505.967 314.622 505.967 322.906V559.083C505.967 567.367 499.251 574.083 490.967 574.083H17C8.71573 574.083 2 567.367 2 559.083V17C2 8.71576 8.71573 2 17 2H796C804.284 2 811 8.71573 811 17V292.906Z"
            fill="url(#paint1_linear_335_2184)"
          />
          {/* Lớp phủ Glow sáng nhẹ */}
          <path
            d="M811 292.906C811 301.191 804.284 307.906 796 307.906H520.967C512.683 307.906 505.967 314.622 505.967 322.906V559.083C505.967 567.367 499.251 574.083 490.967 574.083H17C8.71573 574.083 2 567.367 2 559.083V17C2 8.71576 8.71573 2 17 2H796C804.284 2 811 8.71573 811 17V292.906Z"
            fill="url(#paint0_radial_335_2184)"
            opacity="0.5"
          />
        </g>
      </svg>

      {/* Content bên trên */}
      <div className="relative z-10 w-full h-full p-4 md:p-6 overflow-hidden">
        {children}
      </div>
    </div>
  );
};
