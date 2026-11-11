'use client';

import React, { useState } from 'react';
import { Edit2, CornerUpRight, Trash2, Sparkles, X } from 'lucide-react';
import { Manager } from '@/types';

interface BatchActionBarProps {
  selectedCount: number;
  managers: Manager[];
  onDiscard: () => void;
  onDelete: () => void;
  onAssignTo: (managerName: string) => void;
  onAIRoute: () => void;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  managers,
  onDiscard,
  onDelete,
  onAssignTo,
  onAIRoute,
}) => {
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-[#111827] text-white px-2 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5 border border-slate-700/80 text-xs">
        {/* Selected count pill */}
        <div className="px-3 py-1 font-semibold text-slate-200 border-r border-slate-700 pr-3">
          Selected: <span className="text-white font-bold">{selectedCount}</span>
        </div>

        {/* Edit Button */}
        <button
          onClick={() => alert(`Bulk edit triggered for ${selectedCount} leads`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>

        {/* Assign To Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAssignDropdown(!showAssignDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <CornerUpRight className="w-3.5 h-3.5" />
            <span>Assign to</span>
          </button>

          {showAssignDropdown && (
            <div className="absolute bottom-full mb-2 left-0 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs">
              <div className="px-2 py-1.5 font-semibold text-slate-400 text-[11px] uppercase tracking-wider flex items-center justify-between">
                <span>Select Assignee</span>
                <button
                  onClick={() => setShowAssignDropdown(false)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Special option: Re-run Gemini AI auto-routing */}
              <button
                onClick={() => {
                  setShowAssignDropdown(false);
                  onAIRoute();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-orange-950/40 text-orange-400 hover:bg-orange-900/50 hover:text-orange-300 font-medium transition-colors mb-1 border border-orange-800/40"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>Re-run Gemini AI Auto-Dispatch</span>
              </button>

              <div className="max-h-48 overflow-y-auto space-y-0.5 mt-1 border-t border-slate-800 pt-1">
                {managers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setShowAssignDropdown(false);
                      onAssignTo(m.name);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white text-left transition-colors"
                  >
                    <span>{m.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {m.activeLeads}/{m.maxCapacity}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>

        {/* Discard Pill Button */}
        <button
          onClick={onDiscard}
          className="bg-white hover:bg-slate-100 text-slate-900 px-3.5 py-1.5 rounded-full font-semibold transition-colors shadow-sm ml-1"
        >
          Discard
        </button>
      </div>
    </div>
  );
};
