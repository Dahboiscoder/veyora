"use client";

import { useMemo, useState } from "react";

export interface ViewsChartPoint {
  day: string; // YYYY-MM-DD
  count: number;
}

const WIDTH = 600;
const HEIGHT = 180;
const PAD_LEFT = 32;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 24;

function niceMax(value: number): number {
  if (value <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const steps = [1, 2, 5, 10];
  for (const step of steps) {
    if (value <= step * magnitude) return step * magnitude;
  }
  return Math.ceil(value / magnitude) * magnitude;
}

export function ViewsChart({ data }: { data: ViewsChartPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { points, yMax, plotW, plotH } = useMemo(() => {
    const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
    const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
    const max = niceMax(Math.max(...data.map((d) => d.count), 1));
    const pts = data.map((d, i) => ({
      x: PAD_LEFT + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW),
      y: PAD_TOP + plotH - (d.count / max) * plotH,
      ...d,
    }));
    return { points: pts, yMax: max, plotW, plotH };
  }, [data]);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]?.x.toFixed(1)} ${PAD_TOP + plotH} L ${points[0]?.x.toFixed(1)} ${PAD_TOP + plotH} Z`;

  const active = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];
  const totalViews = data.reduce((sum, d) => sum + d.count, 0);

  function handlePointerMove(e: React.PointerEvent<SVGRectElement>) {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-sm font-semibold text-white">Views, last 14 days</p>
        <p className="text-xs text-white/40">{totalViews.toLocaleString()} total</p>
      </div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          tabIndex={0}
          onFocus={() => setHoverIndex(points.length - 1)}
          onBlur={() => setHoverIndex(null)}
        >
          {[0, 0.5, 1].map((frac) => {
            const y = PAD_TOP + plotH * (1 - frac);
            return (
              <g key={frac}>
                <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                <text x={PAD_LEFT - 8} y={y + 3} textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.35)">
                  {Math.round(yMax * frac)}
                </text>
              </g>
            );
          })}

          <defs>
            <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f96a1f" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#f96a1f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#viewsFill)" />
          <path d={linePath} fill="none" stroke="#f96a1f" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {active && (
            <line x1={active.x} x2={active.x} y1={PAD_TOP} y2={PAD_TOP + plotH} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
          )}
          {active && (
            <circle cx={active.x} cy={active.y} r={4} fill="#f96a1f" stroke="#0c0d10" strokeWidth={2} />
          )}

          <rect
            x={PAD_LEFT}
            y={0}
            width={plotW}
            height={HEIGHT}
            fill="transparent"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoverIndex(null)}
            style={{ cursor: "crosshair" }}
          />
        </svg>

        {active && (
          <div
            className="pointer-events-none absolute top-0 rounded-lg border border-white/10 bg-void-950/95 px-2.5 py-1.5 text-xs shadow-lg"
            style={{
              left: `${(active.x / WIDTH) * 100}%`,
              transform: `translateX(${active.x > WIDTH * 0.75 ? "-100%" : "-8px"})`,
            }}
          >
            <p className="font-semibold text-white">{active.count} views</p>
            <p className="text-white/40">
              {new Date(active.day).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
