'use client';

import React from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  SlidersHorizontal,
  LayoutList,
  LayoutGrid,
  UploadCloud,
  DownloadCloud,
  Sparkles,
} from 'lucide-react';

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  onExport: () => void;
  onGenerateLeads: () => void;
  isGenerating?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onExport,
  onGenerateLeads,
  isGenerating,
}) => {
  return (
    <div className="px-8 py-3.5 bg-white border-b border-[#ebeef2] flex items-center justify-between gap-4">
      {/* Left: Search & Filter controls */}
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-400 transition-all"
          />
        </div>

        <button className="p-2 border border-slate-200/80 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
          <Filter className="w-3.5 h-3.5" />
        </button>

        <button className="p-2 border border-slate-200/80 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
          <ArrowUpDown className="w-3.5 h-3.5" />
        </button>

        <button className="p-2 border border-slate-200/80 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: View toggles, Import/Export, and Generate 10 Leads Button */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center border border-slate-200/80 rounded-lg p-0.5 bg-[#f8fafc]">
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded text-xs transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded text-xs transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>

        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200/80 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors">
          <UploadCloud className="w-3.5 h-3.5 text-slate-400" />
          <span>Import</span>
        </button>

        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200/80 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors"
        >
          <DownloadCloud className="w-3.5 h-3.5 text-slate-400" />
          <span>Export</span>
        </button>

        {/* Generate 10 Leads Button */}
        {/* <button
          onClick={onGenerateLeads}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#ff6937] hover:bg-[#ea580c] text-white rounded-lg text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
          title="Instantly generate 10 realistic enterprise leads"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Generating...' : 'Generate 10 Leads'}</span>
        </button> */}
      </div>
    </div>
  );
};
