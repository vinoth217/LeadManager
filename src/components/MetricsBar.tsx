'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LeadStats } from '@/types';

interface MetricsBarProps {
  stats: LeadStats;
}

interface SparklineProps {
  data?: number[];
  strokeColor?: string;
  gradientId: string;
}

const Sparkline: React.FC<SparklineProps> = ({
  data = [0, 0, 0, 0, 0, 0, 0],
  strokeColor = '#fb923c',
  gradientId,
}) => {
  const isAllZero = data.length === 0 || data.every((v) => v === 0);

  if (isAllZero) {
    return (
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 36">
        <line
          x1="4"
          y1="28"
          x2="96"
          y2="28"
          stroke="#e2e8f0"
          strokeWidth="2"
          strokeDasharray="3 3"
        />
      </svg>
    );
  }

  const width = 100;
  const height = 36;
  const paddingX = 4;
  const paddingY = 6;
  const usableW = width - paddingX * 2;
  const usableH = height - paddingY * 2;

  const min = Math.min(...data);
  const max = Math.max(...data);

  // Map to SVG coordinates
  const points = data.map((val, idx) => {
    const x = paddingX + (idx / Math.max(1, data.length - 1)) * usableW;
    const y =
      max === min
        ? height / 2
        : height - paddingY - ((val - min) / (max - min)) * usableH;
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  // Catmull-Rom spline with clamped control points
  let pathD = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    let cp1x = p1.x + (p2.x - p0.x) / 6;
    let cp1y = p1.y + (p2.y - p0.y) / 6;
    let cp2x = p2.x - (p3.x - p1.x) / 6;
    let cp2y = p2.y - (p3.y - p1.y) / 6;

    cp1y = Math.max(paddingY, Math.min(height - paddingY, cp1y));
    cp2y = Math.max(paddingY, Math.min(height - paddingY, cp2y));

    pathD += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  const lastPoint = points[points.length - 1];
  const fillD = `${pathD} L ${points[points.length - 1].x},${height - 2} L ${points[0].x},${height - 2} Z`;

  return (
    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 36">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.22" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gradientId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />
      <circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r="2.5"
        fill={strokeColor}
        className="drop-shadow-xs"
      />
    </svg>
  );
};

export const MetricsBar: React.FC<MetricsBarProps> = ({ stats }) => {
  const renderChangeBadge = (change: number, invertGood: boolean = false) => {
    if (change === 0) {
      return (
        <span className="flex items-center text-xs font-semibold text-slate-400">
          <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
          0%
        </span>
      );
    }

    const isGood = invertGood ? change < 0 : change > 0;
    const isUp = change > 0;

    return (
      <span
        className={`flex items-center text-xs font-semibold ${
          isGood ? 'text-emerald-600' : 'text-rose-500'
        }`}
      >
        {isUp ? (
          <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
        ) : (
          <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
        )}
        {change > 0 ? `+${change}%` : `${change}%`}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 border-b border-[#ebeef2] bg-white">
      {/* Metric 1: New Leads */}
      <div className="p-5 border-r border-[#ebeef2] flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-slate-400 mb-1">New Leads</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats.newLeads.count}
            </span>
            {renderChangeBadge(stats.newLeads.changePercent)}
          </div>
        </div>
        <div className="w-24 h-10">
          <Sparkline
            data={stats.newLeads.trend}
            gradientId="sparkline-new"
            strokeColor="#fb923c"
          />
        </div>
      </div>

      {/* Metric 2: Qualified Leads */}
      <div className="p-5 border-r border-[#ebeef2] flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-slate-400 mb-1">Qualified Leads</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats.qualifiedLeads.count}
            </span>
            {renderChangeBadge(stats.qualifiedLeads.changePercent)}
          </div>
        </div>
        <div className="w-24 h-10">
          <Sparkline
            data={stats.qualifiedLeads.trend}
            gradientId="sparkline-qual"
            strokeColor="#fb923c"
          />
        </div>
      </div>

      {/* Metric 3: Avg Response Time */}
      <div className="p-5 border-r border-[#ebeef2] flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-slate-400 mb-1">Avg Response Time</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats.avgResponseTime.value}
            </span>
            {renderChangeBadge(stats.avgResponseTime.changePercent, true)}
          </div>
        </div>
        <div className="w-24 h-10">
          <Sparkline
            data={stats.avgResponseTime.trend}
            gradientId="sparkline-resp"
            strokeColor="#fb923c"
          />
        </div>
      </div>

      {/* Metric 4: Hot Leads */}
      <div className="p-5 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-slate-400 mb-1">Hot Leads</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats.hotLeads.count}
            </span>
            {renderChangeBadge(stats.hotLeads.changePercent)}
          </div>
        </div>
        <div className="w-24 h-10">
          <Sparkline
            data={stats.hotLeads.trend}
            gradientId="sparkline-hot"
            strokeColor="#fb923c"
          />
        </div>
      </div>
    </div>
  );
};
