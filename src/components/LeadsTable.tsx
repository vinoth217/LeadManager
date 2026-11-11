'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MoreHorizontal,
  Check,
  Sparkles,
  Calendar,
  PhoneCall,
  Eye,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Lead, LeadStatus } from '@/types';

interface LeadsTableProps {
  leads: Lead[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onLeadClick: (lead: Lead) => void;
  onActionMenu?: (lead: Lead, e: React.MouseEvent) => void;
  onDeleteLead?: (id: string) => Promise<void> | void;
  onGenerateLeads?: () => void;
  isGenerating?: boolean;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onLeadClick,
  onActionMenu,
  onDeleteLead,
  onGenerateLeads,
  isGenerating,
}) => {
  const [openMenuLeadId, setOpenMenuLeadId] = useState<string | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const menuContainerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(e.target as Node)
      ) {
        setOpenMenuLeadId(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenuLeadId(null);
        setLeadToDelete(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const allSelected = leads.length > 0 && selectedIds.length === leads.length;

  const renderStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'HOT':
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-rose-50 text-rose-600 border border-rose-200/80">
            HOT
          </span>
        );
      case 'OPEN':
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-blue-50 text-blue-600 border border-blue-200/80">
            OPEN
          </span>
        );
      case 'NEW':
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-purple-50 text-purple-600 border border-purple-200/80">
            NEW
          </span>
        );
      case 'QUALIFIED':
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200/80">
            QUALIFIED
          </span>
        );
      case 'IN PROGRESS':
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap">
            IN PROGRESS
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
            PENDING
          </span>
        );
      default:
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  const renderScoreBars = (score: number) => {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-[2.5px]">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className={`w-[2.5px] h-3.5 rounded-full transition-colors ${
                i < score ? 'bg-amber-400' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] font-mono text-slate-400">{score}/10</span>
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto bg-white min-h-[360px]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#ebeef2] text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white select-none">
            <th className="py-3 px-8 w-12">
              <button
                onClick={onSelectAll}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  allSelected
                    ? 'bg-[#ff6937] border-[#ff6937] text-white'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                {allSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
            </th>
            <th className="py-3 px-3 font-semibold">Customer</th>
            <th className="py-3 px-3 font-semibold">Company</th>
            <th className="py-3 px-3 font-semibold">Email</th>
            <th className="py-3 px-3 font-semibold">Status</th>
            <th className="py-3 px-3 font-semibold">
              <div className="flex items-center gap-1">
                <span>Manager</span>
                <Sparkles className="w-2.5 h-2.5 text-orange-500" />
              </div>
            </th>
            <th className="py-3 px-3 font-semibold">Source</th>
            <th className="py-3 px-3 font-semibold">Score</th>
            <th className="py-3 px-3 font-semibold">Created</th>
            <th className="py-3 px-6 text-right font-semibold"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f1f3f7] text-xs">
          {leads.map((lead) => {
            const isSelected = selectedIds.includes(lead.id);
            const isMenuOpen = openMenuLeadId === lead.id;

            return (
              <tr
                key={lead.id}
                className={`group transition-colors hover:bg-[#fcfdfd] cursor-pointer ${
                  isSelected ? 'bg-[#fffaf6]' : ''
                } ${isMenuOpen ? 'bg-orange-50/20' : ''}`}
                onClick={() => onLeadClick(lead)}
              >
                {/* Checkbox */}
                <td
                  className="py-3.5 px-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(lead.id);
                  }}
                >
                  <button
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#ff6937] border-[#ff6937] text-white'
                        : 'border-slate-300 group-hover:border-slate-400'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                </td>

                {/* Customer */}
                <td className="py-3.5 px-3 font-medium text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span>{lead.customer}</span>
                    {lead.aiInsights?.autoAssigned && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-orange-400"
                        title="AI Auto-Assigned"
                      />
                    )}
                  </div>
                  {lead.scheduledCall && lead.scheduledCall.status === 'Scheduled' && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-md mt-1">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>{lead.scheduledCall.date} · {lead.scheduledCall.time}</span>
                    </div>
                  )}
                </td>

                {/* Company */}
                <td className="py-3.5 px-3 text-slate-600 font-normal">
                  {lead.company}
                </td>

                {/* Email */}
                <td className="py-3.5 px-3 text-slate-500 font-normal">
                  {lead.email}
                </td>

                {/* Status Badge */}
                <td className="py-3.5 px-3">
                  {renderStatusBadge(lead.status)}
                </td>

                {/* Manager (Assigned Rep) */}
                <td className="py-3.5 px-3 text-slate-700 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span>{lead.manager}</span>
                  </div>
                </td>

                {/* Source */}
                <td className="py-3.5 px-3 text-slate-500 font-normal">
                  {lead.source}
                </td>

                {/* Score */}
                <td className="py-3.5 px-3">
                  {renderScoreBars(lead.score)}
                </td>

                {/* Created */}
                <td className="py-3.5 px-3 text-slate-400 font-normal whitespace-nowrap">
                  {lead.created}
                </td>

                {/* Actions with Popover Dropdown */}
                <td className="py-3.5 px-6 text-right relative">
                  <div
                    className="relative inline-block text-left"
                    ref={isMenuOpen ? menuContainerRef : null}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuLeadId(isMenuOpen ? null : lead.id);
                      }}
                      className={`p-1.5 rounded-lg transition-all ${
                        isMenuOpen
                          ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-200'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Lead Options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {/* Action Popover Menu */}
                    {isMenuOpen && (
                      <div
                        className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 origin-top-right text-left"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-3 py-1 border-b border-slate-100 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Lead Actions
                          </span>
                        </div>

                        {/* View Details Option */}
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuLeadId(null);
                            onLeadClick(lead);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50/70 hover:text-[#ff6937] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>View Details</span>
                        </button>

                        {/* Schedule Call Option */}
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuLeadId(null);
                            onLeadClick(lead);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50/70 hover:text-[#ff6937] transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lead.scheduledCall ? 'Edit Call Schedule' : 'Schedule Call'}</span>
                        </button>

                        <div className="my-1 border-t border-slate-100" />

                        {/* Delete Lead Option */}
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuLeadId(null);
                            setLeadToDelete(lead);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Delete Lead</span>
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {leads.length === 0 && (
        <div className="text-center py-20 px-4 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-500 mb-3">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Pipeline is Fresh & Ready</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
            No leads yet. You can generate 10 test enterprise leads instantly or wait for inquiries to arrive from the website contact form.
          </p>
          {onGenerateLeads && (
            <button
              onClick={onGenerateLeads}
              disabled={isGenerating}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#ff6937] hover:bg-[#ea580c] text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating 10 Leads...' : 'Generate 10 Leads'}</span>
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Lead?</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Are you sure you want to permanently remove{' '}
              <strong className="font-semibold text-slate-800">{leadToDelete.customer}</strong>{' '}
              at <span className="font-semibold text-slate-700">{leadToDelete.company}</span>?
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (onDeleteLead && leadToDelete) {
                    setIsDeleting(true);
                    try {
                      await onDeleteLead(leadToDelete.id);
                    } finally {
                      setIsDeleting(false);
                      setLeadToDelete(null);
                    }
                  }
                }}
                disabled={isDeleting}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
