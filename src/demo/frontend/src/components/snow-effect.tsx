"use client";

import React, { useEffect, useState } from "react";

interface FlakeProps {
  id: number;
  left: string;
  animationDuration: string;
  animationDelay: string;
  size: string;
  opacity: number;
  animationClass: string;
  content: string;
  spinDuration: string;
}

const SnowEffect = () => {
  const SNOWFLAKE_COUNT = 50;

  const FLAKE_TYPES = [
    { char: "❄\uFE0E", weight: 1 }, // Bông tuyết to
    { char: "❅\uFE0E", weight: 2 }, // Bông tuyết vừa
    { char: "❆\uFE0E", weight: 1 }, // Bông tuyết nhỏ
    { char: "•", weight: 20 }, // Hạt bụi tuyết
  ];

  const ANIMATION_TYPES = [
    "animate-fall-1",
    "animate-fall-2",
    "animate-fall-3",
  ];

  const [snowflakes, setSnowflakes] = useState<FlakeProps[]>([]);

  useEffect(() => {
    const totalWeight = FLAKE_TYPES.reduce((sum, item) => sum + item.weight, 0);

    const flakes = Array.from({ length: SNOWFLAKE_COUNT }).map((_, i) => {
      const duration = Math.random() * 10 + 10 + "s";
      const animClass =
        ANIMATION_TYPES[Math.floor(Math.random() * ANIMATION_TYPES.length)];

      // Logic chọn hạt theo trọng số
      let randomNum = Math.random() * totalWeight;
      let selectedChar = FLAKE_TYPES[0].char;

      for (const type of FLAKE_TYPES) {
        if (randomNum < type.weight) {
          selectedChar = type.char;
          break;
        }
        randomNum -= type.weight;
      }

      const isDot = selectedChar === "•";
      const baseSize = isDot ? Math.random() * 12 + 8 : Math.random() * 24 + 10;
      const baseOpacity = isDot
        ? Math.random() * 0.4 + 0.1
        : Math.random() * 0.6 + 0.3;

      return {
        id: i,
        left: Math.random() * 100 + "%",
        animationDuration: duration,
        animationDelay: "-" + Math.random() * 20 + "s",
        size: baseSize + "px",
        opacity: baseOpacity,
        animationClass: animClass,
        content: selectedChar,
        spinDuration: Math.random() * 10 + 5 + "s",
      };
    });

    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden font-sans">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className={`absolute text-white select-none ${flake.animationClass}`}
          style={{
            left: flake.left,
            fontSize: flake.size,
            opacity: flake.opacity,
            animationDuration: flake.animationDuration,
            animationDelay: flake.animationDelay,
          }}
        >
          <div
            style={{
              animation:
                flake.content !== "•"
                  ? `spin-slow ${flake.spinDuration} linear infinite`
                  : "none",
            }}
          >
            {flake.content}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SnowEffect;
