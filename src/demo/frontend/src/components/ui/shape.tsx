"use client";

import React from "react";

export const Shape = () => {
  return (
    <svg className="absolute w-0 h-0">
      <defs>
        {/* shape 1: tab đầu */}
        <clipPath id="tab-shape-start" clipPathUnits="objectBoundingBox">
          <path d="M0,1 L0,0.2 C0,0.05 0.02,0 0.1,0 L0.75,0 C0.85,0 0.9,0.5 1,1 Z" />
        </clipPath>

        {/* shape 2: tab giữa */}
        <clipPath id="tab-shape-middle" clipPathUnits="objectBoundingBox">
          <path d="M0,1 C0.1,0.5 0.15,0 0.25,0 L0.75,0 C0.85,0 0.9,0.5 1,1 Z" />
        </clipPath>
      </defs>
    </svg>
  );
};
