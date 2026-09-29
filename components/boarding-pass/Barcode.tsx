import React from "react";

interface BarcodeProps {
  className?: string;
  height?: number;
  pattern?: number[];
}

export function Barcode({
  className = "w-full h-8 text-black/70",
  height = 36,
  pattern = [
    2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3,
    1, 2, 3, 1, 4, 2, 1, 2, 3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 2, 1, 3, 2,
    1, 4, 2, 1, 2, 3, 1, 2, 4, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2,
  ],
}: BarcodeProps) {
  let currentX = 0;

  return (
    <svg
      viewBox={`0 0 ${pattern.reduce((a, b) => a + b + 2, 0)} ${height}`}
      className={className}
      preserveAspectRatio="none"
      fill="currentColor"
    >
      {pattern.map((width, idx) => {
        const x = currentX;
        currentX += width + (idx % 2 === 0 ? 2 : 1.5);
        return (
          <rect
            key={idx}
            x={x}
            y={0}
            width={width}
            height={height}
            rx={0.5}
          />
        );
      })}
    </svg>
  );
}
