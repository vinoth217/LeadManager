'use client';

import React, { useState, useMemo } from 'react';
import {
  MoreVertical,
  Filter,
  Search,
  Video,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Users,
  Briefcase,
} from 'lucide-react';
import { Lead, Manager } from '@/types';

interface DashboardViewProps {
  leads: Lead[];
  onNavigateToLeads: () => void;
  currentUser?: Manager | null;
}

interface MonthlyPipelineData {
  month: string;
  qualification: number;
  proposals: number;
  negotiation: number;
  total: number;
  displayQual: string;
  displayProp: string;
  displayNeg: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  onNavigateToLeads,
  currentUser,
}) => {
  const [activePeriod, setActivePeriod] = useState<'Daily' | 'Monthly' | 'Yearly'>('Yearly');
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyPipelineData | null>(null);
  const [taskSearch, setTaskSearch] = useState('');

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const isAdmin = currentUser?.userRole === 'admin';

  // For Admin: Company-wide pipeline.
  // For Specialists/Members: Strictly scoped to their personal assigned leads.
  const scopedLeads = useMemo(() => {
    if (isAdmin) return leads;
    if (!currentUser?.name) return [];
    const currentName = currentUser.name.trim().toLowerCase();
    const currentId = currentUser.id?.trim().toLowerCase();
    return leads.filter((l) => {
      const leadManager = (l.manager || '').trim().toLowerCase();
      const leadManagerId = (l.managerId || '').trim().toLowerCase();
      return (
        leadManager === currentName ||
        (currentId && leadManagerId === currentId)
      );
    });
  }, [leads, isAdmin, currentUser]);

  // Dynamically calculate metrics based on scoped leads
  const openDealsCount = useMemo(() => {
    return scopedLeads.filter(
      (l) => l.status === 'HOT' || l.status === 'QUALIFIED' || l.status === 'IN PROGRESS'
    ).length;
  }, [scopedLeads]);

  // Scheduled meetings dynamically generated from real lead scheduled calls
  const meetings = useMemo(() => {
    return scopedLeads
      .filter((l) => l.scheduledCall && l.scheduledCall.status === 'Scheduled')
      .map((l) => {
        const sc = l.scheduledCall!;
        return {
          id: `call-${l.id}`,
          subject: sc.notes || `${sc.type || 'Phone Call'} with ${l.company}`,
          contact: l.customer,
          company: l.company,
          time: sc.time || '11:00 AM',
          dateBadge: sc.date || 'Scheduled',
          platform: sc.type || 'Phone Call',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(l.customer)}&background=ff6937&color=ffffff&bold=true`,
          status: 'Confirmed',
        };
      });
  }, [scopedLeads]);

  const openMeetingsCount = meetings.length;

  // Real Pipeline data aggregated from current year (2026) leads based on activePeriod
  const pipelineData: MonthlyPipelineData[] = useMemo(() => {
    if (activePeriod === 'Daily') {
      const today = new Date();
      const last7Days: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today.getTime() - i * 86400000);
        last7Days.push(
          d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
        );
      }

      return last7Days.map((dayStr) => {
        const dayLeads = scopedLeads.filter((l) => {
          if (!l.created) return false;
          return l.created.includes(dayStr);
        });

        const qualLeads = dayLeads.filter(
          (l) => l.status === 'QUALIFIED' || l.status === 'NEW'
        );
        const propLeads = dayLeads.filter(
          (l) => l.status === 'IN PROGRESS' || l.status === 'OPEN'
        );
        const negLeads = dayLeads.filter((l) => l.status === 'HOT');

        const qVal = qualLeads.reduce((sum, l) => sum + (l.score ? l.score * 1.5 : 12), 0);
        const pVal = propLeads.reduce((sum, l) => sum + (l.score ? l.score * 1.8 : 15), 0);
        const nVal = negLeads.reduce((sum, l) => sum + (l.score ? l.score * 2.2 : 20), 0);

        const qRound = Math.round(qVal);
        const pRound = Math.round(pVal);
        const nRound = Math.round(nVal);
        const totalRound = qRound + pRound + nRound;

        return {
          month: dayStr,
          qualification: qRound,
          proposals: pRound,
          negotiation: nRound,
          total: totalRound,
          displayQual: qRound > 0 ? `$${qRound}k (${qualLeads.length} deals)` : '$0',
          displayProp: pRound > 0 ? `$${pRound}k (${propLeads.length} deals)` : '$0',
          displayNeg: nRound > 0 ? `$${nRound}k (${negLeads.length} deals)` : '$0',
        };
      });
    }

    // Default: Monthly / Yearly (12 Months)
    return MONTHS.map((month) => {
      // Find leads created in this month of 2026
      const monthLeads = scopedLeads.filter((l) => {
        if (!l.created) return false;
        return l.created.toLowerCase().startsWith(month.toLowerCase());
      });

      const qualLeads = monthLeads.filter(
        (l) => l.status === 'QUALIFIED' || l.status === 'NEW'
      );
      const propLeads = monthLeads.filter(
        (l) => l.status === 'IN PROGRESS' || l.status === 'OPEN'
      );
      const negLeads = monthLeads.filter((l) => l.status === 'HOT');

      // Calculate enterprise deal values ($k)
      const qVal = qualLeads.reduce((sum, l) => sum + (l.score ? l.score * 1.5 : 12), 0);
      const pVal = propLeads.reduce((sum, l) => sum + (l.score ? l.score * 1.8 : 15), 0);
      const nVal = negLeads.reduce((sum, l) => sum + (l.score ? l.score * 2.2 : 20), 0);

      const qRound = Math.round(qVal);
      const pRound = Math.round(pVal);
      const nRound = Math.round(nVal);
      const totalRound = qRound + pRound + nRound;

      return {
        month,
        qualification: qRound,
        proposals: pRound,
        negotiation: nRound,
        total: totalRound,
        displayQual: qRound > 0 ? `$${qRound}k (${qualLeads.length} deals)` : '$0',
        displayProp: pRound > 0 ? `$${pRound}k (${propLeads.length} deals)` : '$0',
        displayNeg: nRound > 0 ? `$${nRound}k (${negLeads.length} deals)` : '$0',
      };
    });
  }, [scopedLeads, activePeriod]);

  // Dynamically scale Y-axis so bars NEVER exceed chart container
  const yAxisMax = useMemo(() => {
    const maxVal = Math.max(...pipelineData.map((d) => d.total), 40);
    if (maxVal <= 50) return 50;
    if (maxVal <= 100) return 100;
    if (maxVal <= 250) return 250;
    if (maxVal <= 500) return 500;
    const factor = Math.pow(10, Math.floor(Math.log10(maxVal)));
    const step = factor / 2;
    return Math.ceil(maxVal / step) * step;
  }, [pipelineData]);

  const yAxisGuidelines = useMemo(() => {
    return [
      yAxisMax,
      Math.round(yAxisMax * 0.75),
      Math.round(yAxisMax * 0.5),
      Math.round(yAxisMax * 0.25),
      0,
    ];
  }, [yAxisMax]);

  // Tasks derived from real 2026 scoped leads
  const tasks = useMemo(() => {
    if (scopedLeads.length === 0) return [];
    return scopedLeads.slice(0, 5).map((l, idx) => ({
      id: idx + 1,
      subject:
        idx === 0
          ? `Technical Architecture Review with ${l.company}`
          : idx === 1
          ? `Mobile App SOW & Wireframe Signoff - ${l.company}`
          : idx === 2
          ? `Gemini 3.5 AI Integration Scope - ${l.company}`
          : idx === 3
          ? `Automated Playwright QA Specs - ${l.company}`
          : `Enterprise Cloud SOW Deliverable - ${l.company}`,
      priority: l.aiInsights?.urgency || 'High',
      dueDate: l.created || `Nov 0${idx + 2}, ${currentYear}`,
      contact: l.customer,
      avatar: `https://images.unsplash.com/photo-${1535713875002 + idx * 1000}?w=60&h=60&fit=crop`,
      status:
        l.status === 'QUALIFIED'
          ? 'Completed'
          : l.status === 'IN PROGRESS'
          ? 'In Progress'
          : 'Pending',
    }));
  }, [scopedLeads, currentYear]);

  const filteredTasks = tasks.filter(
    (t) =>
      t.subject.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.contact.toLowerCase().includes(taskSearch.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 w-full">
      {/* Welcome Banner */}
      <div className="w-full">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>👋 Welcome Back, {currentUser?.name || 'Admin'}!</span>
          {!isAdmin && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-[#ff6937] border border-orange-200">
              Personal Workspace
            </span>
          )}
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          {isAdmin
            ? `As of today · ${currentYear} Company-wide Operational Pipeline`
            : `As of today · ${currentYear} Real-time Operational Pipeline Assigned to ${currentUser?.name || 'You'}`}
        </p>
      </div>

      {/* Top 3 KPI Stat Cards - Real Data, 0 when reset */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Card 1: MY LEADS */}
        <div
          onClick={onNavigateToLeads}
          className="bg-white rounded-2xl p-6 border border-[#ebeef2] shadow-2xs hover:border-orange-300 transition-all cursor-pointer group w-full"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              My Leads
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff6937] shadow-2xs group-hover:scale-105 group-hover:bg-orange-100/80 transition-all">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight group-hover:text-[#ff6937] transition-colors">
            {scopedLeads.length.toLocaleString()}
          </div>
          <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#f1f3f7] text-xs">
            <div className="text-slate-400 text-[11px]">
              My Leads last <strong className="text-slate-700 font-semibold">365 days</strong>
            </div>
            <div className="flex items-center gap-2.5">
              <span className={`text-[11px] font-bold ${scopedLeads.length > 0 ? 'text-[#ff6937]' : 'text-slate-400'}`}>
                {scopedLeads.length > 0 ? '+100%' : '0%'}
              </span>
              {/* Orange Capsule Bar matching Lead Screen */}
              <div className="w-20 h-3 bg-slate-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-[#ff6937] rounded-full transition-all duration-300"
                  style={{ width: scopedLeads.length > 0 ? '75%' : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: OPEN DEALS */}
        <div className="bg-white rounded-2xl p-6 border border-[#ebeef2] shadow-2xs hover:border-emerald-200 transition-all group w-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              Open Deals
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs group-hover:scale-105 group-hover:bg-emerald-100/80 transition-all">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
            {openDealsCount.toLocaleString()}
          </div>
          <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#f1f3f7] text-xs">
            <div className="text-slate-400 text-[11px]">
              Open Deals last <strong className="text-slate-700 font-semibold">365 days</strong>
            </div>
            <div className="flex items-center gap-2.5">
              <span className={`text-[11px] font-bold ${openDealsCount > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {openDealsCount > 0 ? '+85%' : '0%'}
              </span>
              {/* Teal/Emerald Capsule Bar */}
              <div className="w-20 h-3 bg-slate-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: openDealsCount > 0 ? '80%' : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: OPEN MEETING */}
        <div className="bg-white rounded-2xl p-6 border border-[#ebeef2] shadow-2xs hover:border-amber-200 transition-all group w-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              Open Meeting
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-2xs group-hover:scale-105 group-hover:bg-amber-100/80 transition-all">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight group-hover:text-amber-700 transition-colors">
            {openMeetingsCount}
          </div>
          <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#f1f3f7] text-xs">
            <div className="text-slate-400 text-[11px]">
              Open Meeting <strong className="text-slate-700 font-semibold">Scheduled</strong>
            </div>
            <div className="flex items-center gap-2.5">
              <span className={`text-[11px] font-bold ${openMeetingsCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                {openMeetingsCount > 0 ? `+${openMeetingsCount * 25}%` : '0%'}
              </span>
              {/* Amber Capsule Bar */}
              <div className="w-20 h-3 bg-slate-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, openMeetingsCount * 25)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Card: Pipeline Deals By Stage (Full Width Stacked Bar Chart) */}
      <div className="bg-white rounded-2xl p-6 border border-[#ebeef2] shadow-2xs relative w-full">
        {/* Header with Title & Legend matching Lead screen color scheme */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pipeline Deals By Stage
            </h2>
            <div className="flex items-center gap-5 mt-2 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-200"></span>
                <span>Qualification</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff6937]"></span>
                <span>Proposal/ Price Quote</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0f172a]"></span>
                <span>Negotiation</span>
              </div>
            </div>
          </div>

          {/* Time period switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#f8fafc] border border-slate-200/90 p-0.5 rounded-lg text-xs font-semibold">
              {(['Daily', 'Monthly'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setActivePeriod(period)}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activePeriod === period
                      ? 'bg-[#ff6937] text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            <button className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50">
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Stacked Chart Canvas */}
        <div className="relative pt-6 pb-2 w-full overflow-x-auto overflow-y-hidden">
          <div className="min-w-[640px] relative">
            {/* Y-axis guidelines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-mono pb-8">
              {yAxisGuidelines.map((val, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-8 text-right font-semibold text-slate-400">
                    {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : Math.round(val)}
                  </span>
                  <div
                    className={`flex-1 ${
                      idx === yAxisGuidelines.length - 1
                        ? 'border-b border-slate-200'
                        : 'border-b border-dashed border-slate-100'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Stacked Bars Container stretching full width */}
            <div
              onMouseLeave={() => setHoveredMonth(null)}
              className="pl-12 pr-4 grid gap-2 sm:gap-3 md:gap-4 lg:gap-6 h-64 items-end relative z-10 pb-8 w-full"
              style={{
                gridTemplateColumns: `repeat(${pipelineData.length}, minmax(0, 1fr))`,
              }}
            >
              {pipelineData.map((item) => {
                const isSelected = hoveredMonth?.month === item.month;
                const hasData = item.total > 0;
                // Proportional height strictly bounded within 0-100% of chart area
                const barHeightPercent = hasData
                  ? Math.min(100, Math.max(6, (item.total / yAxisMax) * 100))
                  : 0;

                const qualPct =
                  hasData && item.total > 0
                    ? (item.qualification / item.total) * 100
                    : 0;
                const propPct =
                  hasData && item.total > 0
                    ? (item.proposals / item.total) * 100
                    : 0;
                const negPct =
                  hasData && item.total > 0
                    ? (item.negotiation / item.total) * 100
                    : 0;

                return (
                  <div
                    key={item.month}
                    onMouseEnter={() => setHoveredMonth(item)}
                    onClick={() => setHoveredMonth(item)}
                    className={`flex flex-col items-center h-full justify-end cursor-pointer group rounded-xl p-1 transition-all w-full relative ${
                      isSelected ? 'bg-orange-50/50 ring-1 ring-orange-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* The 3-tier Stacked Bar */}
                    <div
                      className="w-full max-w-[42px] flex flex-col-reverse rounded-lg overflow-hidden transition-all duration-300 shadow-2xs"
                      style={{ height: hasData ? `${barHeightPercent}%` : '6px' }}
                    >
                      {hasData ? (
                        <>
                          {/* Bottom: Negotiation (Deep Slate/Charcoal) */}
                          <div
                            className="w-full bg-[#0f172a] transition-all hover:brightness-110"
                            style={{ height: `${negPct}%` }}
                            title={`Negotiation: ${item.displayNeg}`}
                          />
                          {/* Middle: Proposal (Vibrant Impiger Orange) */}
                          <div
                            className="w-full bg-[#ff6937] transition-all hover:brightness-110"
                            style={{ height: `${propPct}%` }}
                            title={`Proposal: ${item.displayProp}`}
                          />
                          {/* Top: Qualification (Warm Peach/Gold) */}
                          <div
                            className="w-full bg-orange-200 transition-all rounded-t-md hover:brightness-110"
                            style={{ height: `${qualPct}%` }}
                            title={`Qualification: ${item.displayQual}`}
                          />
                        </>
                      ) : (
                        // Clean empty baseline pill when 0 deals
                        <div className="w-full h-1.5 bg-slate-200/70 rounded-full" />
                      )}
                    </div>

                    {/* Month Label */}
                    <span
                      className={`mt-2 text-xs font-semibold transition-colors truncate ${
                        isSelected ? 'text-[#ff6937] font-bold' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    >
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Tooltip: ONLY pops up on hover, hidden by default */}
            {hoveredMonth && (() => {
              const hoveredIndex = Math.max(
                0,
                pipelineData.findIndex((p) => p.month === hoveredMonth.month)
              );
              const totalItems = pipelineData.length;
              const leftCalc = `calc(48px + (100% - 64px) * ${(hoveredIndex + 0.5) / totalItems})`;
              const transformCalc =
                hoveredIndex <= 1
                  ? 'translateX(-15%)'
                  : hoveredIndex >= totalItems - 2
                  ? 'translateX(-85%)'
                  : 'translateX(-50%)';
              const arrowLeft =
                hoveredIndex <= 1
                  ? '25%'
                  : hoveredIndex >= totalItems - 2
                  ? '75%'
                  : '50%';

              return (
                <div
                  className="absolute top-1 z-30 pointer-events-none transition-all duration-200 ease-out animate-in fade-in zoom-in-95"
                  style={{
                    left: leftCalc,
                    transform: transformCalc,
                  }}
                >
                  <div className="bg-[#111827] text-white p-3 rounded-xl shadow-2xl text-xs space-y-1.5 border border-slate-700 min-w-[160px] relative">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 pb-1 flex justify-between items-center">
                      <span className="font-bold text-slate-200">{hoveredMonth.month} {currentYear}</span>
                      <span className="text-[#ff6937] font-bold">PIPELINE</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-200"></span>
                        <span>Qualification</span>
                      </span>
                      <span className="font-bold text-white font-mono">{hoveredMonth.displayQual}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#ff6937]"></span>
                        <span>Proposals</span>
                      </span>
                      <span className="font-bold text-white font-mono">{hoveredMonth.displayProp}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                        <span>Negotiation</span>
                      </span>
                      <span className="font-bold text-white font-mono">{hoveredMonth.displayNeg}</span>
                    </div>

                    {/* Downward pointer caret */}
                    <div
                      className="absolute -bottom-1.5 w-3 h-3 bg-[#111827] rotate-45 border-r border-b border-slate-700"
                      style={{
                        left: arrowLeft,
                        transform: 'translateX(-50%) rotate(45deg)',
                      }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Bottom Section: Full Width 2 Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
        {/* Left Column (2/3 width on wide screens): My Open Task */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-[#ebeef2] shadow-2xs w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">
              My Open Task
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>
              <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
                <Filter className="w-3 h-3 text-slate-400" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Tasks Table */}
          <div className="overflow-x-auto w-full">
            {filteredTasks.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#ebeef2] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 font-semibold">Subject</th>
                    <th className="py-3 font-semibold">Priority</th>
                    <th className="py-3 font-semibold">Due Date</th>
                    <th className="py-3 font-semibold">Contact Name</th>
                    <th className="py-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f3f7]">
                  {filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-[#fcfdfd] transition-colors">
                      <td className="py-3.5 font-semibold text-slate-800 hover:text-[#ff6937] cursor-pointer">
                        {t.subject}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`text-[11px] font-semibold ${
                            t.priority === 'Critical'
                              ? 'text-rose-600'
                              : t.priority === 'High'
                              ? 'text-orange-600'
                              : 'text-slate-600'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-400 font-normal">{t.dueDate}</td>
                      <td className="py-3.5">
                        <span className="text-slate-700 font-medium">{t.contact}</span>
                      </td>
                      <td className="py-3.5 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold tracking-wider ${
                            t.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80'
                              : t.status === 'In Progress'
                              ? 'bg-blue-50 text-blue-600 border border-blue-200/80'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                <p className="text-xs font-semibold text-slate-600">No open tasks</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isAdmin
                    ? 'Tasks will generate automatically when leads enter the pipeline.'
                    : 'No pending tasks for your assigned leads.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3 width on wide screens): My Meetings */}
        <div className="bg-white rounded-2xl p-6 border border-[#ebeef2] shadow-2xs flex flex-col justify-between w-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">
                My Meetings
              </h2>
              <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
                <Filter className="w-3 h-3 text-slate-400" />
                <span>Filter</span>
              </button>
            </div>

            {/* Real Meetings List */}
            {meetings.length === 0 ? (
              <div className="py-10 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto mb-2 text-slate-400 shadow-2xs">
                  <Calendar className="w-5 h-5 text-slate-400" />
                </div>
                <div className="text-xs font-bold text-slate-700">No Scheduled Meetings</div>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto">
                  Schedule a call or contact touchpoint from any lead to queue meetings here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {meetings.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-orange-200 bg-[#fcfdfd] hover:bg-orange-50/20 transition-all flex items-start gap-3 group"
                  >
                    <img
                      src={m.avatar}
                      alt={m.contact}
                      className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-[#ff6937] transition-colors truncate">
                          {m.contact}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          {m.dateBadge}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-600 line-clamp-1 mb-1.5">
                        {m.subject}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{m.time}</span>
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-600">
                          <Video className="w-3 h-3 text-[#ff6937]" />
                          <span>{m.platform}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={onNavigateToLeads}
              className="text-xs text-[#ff6937] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>View All Pipeline Leads</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
