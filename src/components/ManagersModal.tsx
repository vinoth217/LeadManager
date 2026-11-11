'use client';

import React, { useState } from 'react';
import { X, UserCheck, Sparkles, Plus, ShieldCheck } from 'lucide-react';
import { Manager } from '@/types';

interface ManagersModalProps {
  isOpen: boolean;
  onClose: () => void;
  managers: Manager[];
  onAddManager?: (newManager: Manager) => void;
}

export const ManagersModal: React.FC<ManagersModalProps> = ({
  isOpen,
  onClose,
  managers,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500 rounded-lg text-white">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Team & Lead Assignment Directory
              </h2>
              <p className="text-xs text-slate-500">
                Active administrator managing incoming inquiries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Directory List */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="space-y-3">
            {managers.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-orange-200 bg-orange-50/20 flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=ff6937&color=ffffff&bold=true`}
                    alt={m.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=ff6937&color=ffffff&bold=true`;
                    }}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-orange-300 shrink-0 bg-slate-900"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {m.name}
                        <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded">
                          Primary Admin
                        </span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {m.region}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5">
                      {m.role}
                    </div>
                    <div className="text-xs text-slate-400">{m.email}</div>
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Managed Domains
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {m.specialties.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-[11px] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Workload Indicator */}
                <div className="pt-2 border-t border-orange-100/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Active Assigned Leads: <strong className="text-slate-900">{m.activeLeads}</strong>
                  </span>
                  <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Operational & Ready
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>How Lead Routing Works in Admin-Only Mode</span>
            </div>
            All inbound website inquiries are evaluated by Gemini AI for project domain, technical scope, budget hints, and urgency, and assigned directly to the <strong>Admin</strong> queue with full analysis notes.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
