"use client";

import { useId, useState } from "react";

const CATEGORICAL_PALETTE = [
  "#2a78d6", // blue
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
  "#e87ba4", // magenta
  "#eb6834", // orange
];

export interface BarChartDatum {
  period: string;
  label: string;
  values: Record<string, number>;
}

export function SalesBarChart({
  data,
  manufacturers,
}: {
  data: BarChartDatum[];
  manufacturers: string[];
}) {
  const gradientId = useId();
  const [hover, setHover] = useState<{ period: string; manufacturer: string } | null>(null);

  const maxValue = Math.max(1, ...data.flatMap((d) => manufacturers.map((m) => d.values[m] ?? 0)));

  const chartHeight = 200;
  const chartTop = 12;
  const chartBottom = chartTop + chartHeight;
  const leftAxisWidth = 32;
  const groupWidth = 64;
  const barGap = 3;
  const barWidth = Math.max(6, (groupWidth - barGap * (manufacturers.length + 1)) / manufacturers.length);
  const width = leftAxisWidth + Math.max(1, data.length) * groupWidth + 12;
  const height = chartBottom + 28;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  function niceMax(n: number): number {
    if (n <= 5) return 5;
    const magnitude = Math.pow(10, Math.floor(Math.log10(n)));
    const residual = n / magnitude;
    const step = residual > 5 ? 10 : residual > 2 ? 5 : residual > 1 ? 2 : 1;
    return step * magnitude;
  }
  const axisMax = niceMax(maxValue);

  const hoverDatum = hover ? data.find((d) => d.period === hover.period) : null;
  const hoverValue = hoverDatum && hover ? (hoverDatum.values[hover.manufacturer] ?? 0) : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 text-sm" role="list" aria-label="Teckenförklaring">
        {manufacturers.map((m, i) => (
          <div key={m} role="listitem" className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block size-3 rounded-sm shrink-0"
              style={{ backgroundColor: CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length] }}
            />
            <span className="text-foreground">{m}</span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto relative">
        <svg
          role="img"
          aria-label="Antal sålda maskiner per period, uppdelat på tillverkare"
          width={width}
          height={height}
          className="max-w-none"
        >
          <defs>
            <clipPath id={gradientId}>
              <rect x={0} y={chartTop} width={width} height={chartHeight} />
            </clipPath>
          </defs>

          {gridLines.map((g) => {
            const y = chartBottom - g * chartHeight;
            return (
              <g key={g}>
                <line
                  x1={leftAxisWidth}
                  x2={width}
                  y1={y}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth={1}
                />
                <text
                  x={leftAxisWidth - 6}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-muted-foreground"
                  style={{ fontSize: 10, fontVariantNumeric: "tabular-nums" }}
                >
                  {Math.round(g * axisMax)}
                </text>
              </g>
            );
          })}
          <line
            x1={leftAxisWidth}
            x2={width}
            y1={chartBottom}
            y2={chartBottom}
            stroke="var(--muted-foreground)"
            strokeWidth={1}
          />

          {data.map((d, gi) => {
            const groupX = leftAxisWidth + gi * groupWidth;
            return (
              <g key={d.period}>
                {manufacturers.map((m, mi) => {
                  const value = d.values[m] ?? 0;
                  const barHeight = axisMax > 0 ? (value / axisMax) * chartHeight : 0;
                  const x = groupX + barGap + mi * (barWidth + barGap);
                  const y = chartBottom - barHeight;
                  const isHovered = hover?.period === d.period && hover?.manufacturer === m;
                  return (
                    <rect
                      key={m}
                      x={x}
                      y={value > 0 ? y : chartBottom - 2}
                      width={barWidth}
                      height={value > 0 ? Math.max(2, barHeight) : 2}
                      rx={4}
                      fill={CATEGORICAL_PALETTE[mi % CATEGORICAL_PALETTE.length]}
                      opacity={isHovered ? 1 : hover ? 0.55 : 0.9}
                      onMouseEnter={() => setHover({ period: d.period, manufacturer: m })}
                      onMouseLeave={() => setHover(null)}
                    />
                  );
                })}
                <text
                  x={groupX + groupWidth / 2}
                  y={chartBottom + 16}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  style={{ fontSize: 10 }}
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>

        {hover && hoverDatum && (
          <div className="pointer-events-none absolute top-1 left-1 rounded-md border bg-popover px-2 py-1 text-xs shadow-md">
            <span className="font-medium">{hoverDatum.label}</span> — {hover.manufacturer}:{" "}
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{hoverValue}</span>
          </div>
        )}
      </div>

      {data.length === 0 && (
        <p className="text-sm text-muted-foreground">Inga sålda maskiner i det valda intervallet.</p>
      )}
    </div>
  );
}
