'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Sparkles,
  Building,
  Mail,
  Phone,
  Calendar,
  Layers,
  CheckCircle2,
  RefreshCw,
  User,
  ShieldCheck,
  Clock,
  PhoneCall,
  Video,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';
import { Lead, Manager, ScheduledCall } from '@/types';

interface LeadDetailModalProps {
  lead: Lead | null;
  managers: Manager[];
  onClose: () => void;
  onUpdateStatus: (id: string, status: Lead['status']) => void;
  onReassign: (id: string, managerName: string) => void;
  onAIRetriage: (id: string) => Promise<void>;
  onScheduleCall?: (id: string, scheduledCall: ScheduledCall | null) => Promise<any> | void;
}

// Helpers for formatted date and time display
function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

function formatMonth(dateStr?: string): string {
  if (!dateStr) return 'NOV';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', { month: 'short' });
    }
  } catch {}
  return 'NOV';
}

function formatDay(dateStr?: string): string {
  if (!dateStr) return '01';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return String(parseInt(parts[2], 10));
    }
  } catch {}
  return '01';
}

function formatDisplayTime(timeStr?: string): string {
  if (!timeStr) return '';
  try {
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    }
    return timeStr;
  } catch {
    return timeStr;
  }
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  managers,
  onClose,
  onUpdateStatus,
  onReassign,
  onAIRetriage,
  onScheduleCall,
}) => {
  const [isRetriaging, setIsRetriaging] = useState(false);

  // Dedicated Call Schedule State
  const [scheduledCall, setScheduledCall] = useState<ScheduledCall | null>(null);
  const [isEditingCall, setIsEditingCall] = useState(false);
  const [callDate, setCallDate] = useState('');
  const [callTime, setCallTime] = useState('11:00');
  const [callType, setCallType] = useState<ScheduledCall['type']>('Phone');
  const [callNotes, setCallNotes] = useState('');
  const [isSavingCall, setIsSavingCall] = useState(false);
  const [callSaveSuccess, setCallSaveSuccess] = useState(false);

  // Sync state whenever lead changes & fetch freshest data from DB to ensure no stale state
  useEffect(() => {
    if (!lead?.id) return;

    // 1. Initial hydration from prop
    if (lead.scheduledCall) {
      setScheduledCall(lead.scheduledCall);
      setCallDate(lead.scheduledCall.date);
      setCallTime(lead.scheduledCall.time);
      setCallType(lead.scheduledCall.type || 'Phone');
      setCallNotes(lead.scheduledCall.notes || '');
      setIsEditingCall(false);
    } else {
      setScheduledCall(null);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      setCallDate(`${yyyy}-${mm}-${dd}`);
      setCallTime('11:00');
      setCallType('Phone');
      setCallNotes('');
      setIsEditingCall(false);
    }

    // 2. Fresh background fetch from server to guarantee persistence
    let isMounted = true;
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const fresh = data.leads?.find((l: Lead) => l.id === lead.id);
        if (fresh && fresh.scheduledCall) {
          setScheduledCall(fresh.scheduledCall);
          setCallDate(fresh.scheduledCall.date);
          setCallTime(fresh.scheduledCall.time);
          setCallType(fresh.scheduledCall.type || 'Phone');
          setCallNotes(fresh.scheduledCall.notes || '');
          setIsEditingCall(false);
        }
      })
      .catch((err) => console.warn('Could not re-fetch fresh lead details', err));

    return () => {
      isMounted = false;
    };
  }, [lead?.id, lead?.scheduledCall]);

  if (!lead) return null;

  const assignedManager = managers.find((m) => m.name === lead.manager);

  const handleAIRun = async () => {
    setIsRetriaging(true);
    try {
      await onAIRetriage(lead.id);
    } finally {
      setIsRetriaging(false);
    }
  };

  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setCallDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleSaveCall = async () => {
    if (!lead || !callDate || !callTime) return;
    setIsSavingCall(true);
    const scheduledCallData: ScheduledCall = {
      date: callDate,
      time: callTime,
      type: callType,
      notes: callNotes.trim(),
      status: 'Scheduled',
      updatedAt: new Date().toISOString(),
    };

    // Update local state immediately so UI updates with zero lag
    setScheduledCall(scheduledCallData);
    setIsEditingCall(false);

    try {
      if (onScheduleCall) {
        await onScheduleCall(lead.id, scheduledCallData);
      } else {
        await fetch(`/api/leads/${lead.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scheduledCall: scheduledCallData }),
        });
      }
      setCallSaveSuccess(true);
      setTimeout(() => setCallSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to schedule call:', err);
    } finally {
      setIsSavingCall(false);
    }
  };

  const handleToggleCompleteCall = async () => {
    if (!lead || !scheduledCall) return;
    setIsSavingCall(true);
    const newStatus: ScheduledCall['status'] =
      scheduledCall.status === 'Completed' ? 'Scheduled' : 'Completed';
    const updated: ScheduledCall = {
      ...scheduledCall,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    setScheduledCall(updated);
    try {
      if (onScheduleCall) {
        await onScheduleCall(lead.id, updated);
      } else {
        await fetch(`/api/leads/${lead.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scheduledCall: updated }),
        });
      }
    } catch (err) {
      console.error('Failed to update call status:', err);
    } finally {
      setIsSavingCall(false);
    }
  };

  const handleRemoveCall = async () => {
    if (!lead) return;
    setIsSavingCall(true);
    setScheduledCall(null);
    setIsEditingCall(false);
    try {
      if (onScheduleCall) {
        await onScheduleCall(lead.id, null);
      } else {
        await fetch(`/api/leads/${lead.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scheduledCall: null }),
        });
      }
    } catch (err) {
      console.error('Failed to cancel call:', err);
    } finally {
      setIsSavingCall(false);
    }
  };

  const handleDone = async () => {
    // If the user modified date & time and clicks Done, auto-save before closing
    if (isEditingCall && callDate && callTime) {
      await handleSaveCall();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200/80 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-base">
              {lead.customer.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {lead.customer}
                <span className="text-xs font-normal text-slate-500">at</span>
                <span className="text-xs font-semibold text-slate-700">{lead.company}</span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>Created {lead.created}</span>
                <span>•</span>
                <span className="text-orange-600 font-medium">Source: {lead.source}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* AI Auto-Dispatch Card (Core Feature!) */}
          <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50/60 to-amber-50/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-500 rounded-lg text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-orange-950">
                      GEMINI AI LEAD ROUTING & TRIAGE
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white text-orange-700 border border-orange-200 shadow-2xs">
                      {lead.aiInsights?.engine || 'Google Gemini 3.5 Flash'}
                    </span>
                  </div>
                  <p className="text-[11px] text-orange-700/90">
                    Automatically matched with Impiger&apos;s specialist directory
                  </p>
                </div>
              </div>

              <button
                onClick={handleAIRun}
                disabled={isRetriaging}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white text-orange-700 border border-orange-300 rounded-lg hover:bg-orange-100 transition-all shadow-2xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRetriaging ? 'animate-spin' : ''}`} />
                <span>{isRetriaging ? 'Analyzing...' : 'Re-run AI Match'}</span>
              </button>
            </div>

            {/* AI Explanation Text */}
            <div className="bg-white/90 rounded-lg p-3 border border-orange-100 shadow-2xs mb-3">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Why AI Assigned This Lead:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {lead.aiInsights?.assignedReason ||
                  `Assigned to ${lead.manager} based on matching requirements and domain specialty.`}
              </p>
            </div>

            {/* Key AI Metadata Pills */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white/80 p-2.5 rounded-lg border border-orange-100/80">
                <div className="text-[10px] text-slate-400 uppercase font-medium">Confidence</div>
                <div className="text-sm font-bold text-orange-600">
                  {lead.aiInsights?.confidence || 92}% Match
                </div>
              </div>
              <div className="bg-white/80 p-2.5 rounded-lg border border-orange-100/80">
                <div className="text-[10px] text-slate-400 uppercase font-medium">Urgency</div>
                <div className="text-sm font-bold text-slate-800">
                  {lead.aiInsights?.urgency || 'High'}
                </div>
              </div>
              <div className="bg-white/80 p-2.5 rounded-lg border border-orange-100/80">
                <div className="text-[10px] text-slate-400 uppercase font-medium">Domain Area</div>
                <div className="text-sm font-bold text-slate-800 truncate">
                  {lead.aiInsights?.domain || lead.focusArea || 'Enterprise IT'}
                </div>
              </div>
            </div>

            {/* Tags */}
            {lead.aiInsights?.tags && lead.aiInsights.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-medium text-slate-500 mr-1">Extracted Tech:</span>
                {lead.aiInsights.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-orange-100/80 text-orange-800 rounded-md text-[10px] font-medium border border-orange-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Specialist Card */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Current Assigned Specialist
              </div>
              {/* Manual Reassign dropdown */}
              <select
                value={lead.manager}
                onChange={(e) => onReassign(lead.id, e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-orange-400"
              >
                {managers.map((m) => (
                  <option key={m.id} value={m.name}>
                    Reassign: {m.name} ({m.activeLeads}/{m.maxCapacity})
                  </option>
                ))}
              </select>
            </div>

            {assignedManager && (
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
                <img
                  src={assignedManager.avatar}
                  alt={assignedManager.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-orange-200"
                />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 text-sm">
                    {assignedManager.name}
                  </div>
                  <div className="text-xs text-slate-500 font-normal">
                    {assignedManager.role} • {assignedManager.region}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Active Load: {assignedManager.activeLeads}/{assignedManager.maxCapacity} leads
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customer Message & Scope */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Customer Message & Scope</span>
              <span className="text-[11px] text-orange-600 font-normal">
                Focus Area: {lead.focusArea || 'General Inquiry'}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {lead.message || 'No project description was provided.'}
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg">
              <Mail className="w-4 h-4 text-slate-400" />
              <div className="truncate">
                <div className="text-[10px] text-slate-400">Email</div>
                <div className="font-medium text-slate-800">{lead.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg">
              <Phone className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-[10px] text-slate-400">Phone</div>
                <div className="font-medium text-slate-800">{lead.phone || 'Not provided'}</div>
              </div>
            </div>
          </div>

          {/* CALL SCHEDULE & CONTACT TOUCHPOINT SECTION */}
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50/70 to-orange-50/30 p-4 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#ff6937] text-white rounded-lg shadow-2xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Call Schedule & Next Contact
                    </h3>
                    {scheduledCall ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                          scheduledCall.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                      >
                        {scheduledCall.status === 'Completed' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Completed</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                            <span>Scheduled</span>
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">
                        No call booked
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Set preferred date and time to contact {lead.customer}
                  </p>
                </div>
              </div>

              {scheduledCall && !isEditingCall && (
                <button
                  type="button"
                  onClick={() => setIsEditingCall(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-orange-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:border-orange-300 transition-colors shadow-2xs"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Reschedule</span>
                </button>
              )}
            </div>

            {/* Display Active Scheduled Call Card */}
            {scheduledCall && !isEditingCall ? (
              <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex flex-col items-center justify-center text-[#ff6937] font-bold">
                      <span className="text-[10px] uppercase tracking-wider leading-none text-orange-500 font-extrabold">
                        {formatMonth(scheduledCall.date)}
                      </span>
                      <span className="text-lg leading-none mt-0.5 font-extrabold text-slate-900">
                        {formatDay(scheduledCall.date)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {formatDisplayDate(scheduledCall.date)}
                        </span>
                        <span className="text-xs font-extrabold text-[#ff6937] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                          {formatDisplayTime(scheduledCall.time)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          {scheduledCall.type === 'Google Meet' && (
                            <Video className="w-3.5 h-3.5 text-blue-500" />
                          )}
                          {scheduledCall.type === 'Zoom' && (
                            <Video className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          {scheduledCall.type === 'Teams' && (
                            <Video className="w-3.5 h-3.5 text-indigo-500" />
                          )}
                          {(!scheduledCall.type || scheduledCall.type === 'Phone') && (
                            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          <span>{scheduledCall.type || 'Phone Call'}</span>
                        </span>
                        <span>•</span>
                        <span className="text-slate-500 truncate">
                          Assigned: <strong className="font-semibold text-slate-700">{lead.manager}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action: Call Now */}
                  <div className="flex items-center gap-2">
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
                        title={`Call ${lead.phone}`}
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call Now</span>
                      </a>
                    )}
                  </div>
                </div>

                {scheduledCall.notes && (
                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                    <span className="font-semibold text-slate-500 mr-1.5">Agenda / Notes:</span>
                    {scheduledCall.notes}
                  </div>
                )}

                {/* Action Footer for Scheduled Call */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleCompleteCall}
                      disabled={isSavingCall}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                        scheduledCall.status === 'Completed'
                          ? 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {scheduledCall.status === 'Completed'
                          ? 'Mark as Pending'
                          : 'Mark Completed'}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingCall(true)}
                      disabled={isSavingCall}
                      className="text-slate-600 hover:text-slate-900 px-2 py-1 rounded font-medium hover:bg-slate-100 transition-colors"
                    >
                      Edit Schedule
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveCall}
                      disabled={isSavingCall}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded font-medium transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel Call</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Form to Schedule or Edit Call */
              <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs space-y-4">
                {/* Date & Time Picker Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Date Input */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#ff6937]" />
                      <span>Date to Contact</span>
                    </label>
                    <input
                      type="date"
                      value={callDate}
                      onChange={(e) => setCallDate(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                    {/* Quick Date Shortcuts */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setQuickDate(0)}
                        className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-orange-50 hover:text-orange-700 rounded text-slate-600 font-medium transition-colors"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickDate(1)}
                        className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-orange-50 hover:text-orange-700 rounded text-slate-600 font-medium transition-colors"
                      >
                        Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickDate(2)}
                        className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-orange-50 hover:text-orange-700 rounded text-slate-600 font-medium transition-colors"
                      >
                        In 2 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickDate(7)}
                        className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-orange-50 hover:text-orange-700 rounded text-slate-600 font-medium transition-colors"
                      >
                        Next Week
                      </button>
                    </div>
                  </div>

                  {/* Time Input */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#ff6937]" />
                      <span>Time to Contact</span>
                    </label>
                    <input
                      type="time"
                      value={callTime}
                      onChange={(e) => setCallTime(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                    {/* Quick Time Shortcuts */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['10:00', '11:30', '14:30', '16:00', '17:30'].map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setCallTime(slot)}
                          className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors ${
                            callTime === slot
                              ? 'bg-orange-500 text-white font-bold'
                              : 'bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-600'
                          }`}
                        >
                          {formatDisplayTime(slot)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Call Channel / Type */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Contact Channel / Meeting Mode
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'Phone', label: 'Phone Call', icon: PhoneCall },
                      { id: 'Google Meet', label: 'Google Meet', icon: Video },
                      { id: 'Zoom', label: 'Zoom', icon: Video },
                      { id: 'Teams', label: 'MS Teams', icon: Video },
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const isSelected = (callType || 'Phone') === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setCallType(mode.id as ScheduledCall['type'])}
                          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-[#ff6937] text-white border-[#ff6937] shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Call Notes / Purpose */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
                    <span>Call Purpose & Discussion Topics (Optional)</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      Visible to assigned specialist
                    </span>
                  </label>
                  <input
                    type="text"
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    placeholder={`e.g. Discovery call on ${lead.focusArea || 'project requirements'}, review budget & timeline`}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    {callSaveSuccess && (
                      <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 animate-in fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Schedule saved!</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {scheduledCall && (
                      <button
                        type="button"
                        onClick={() => setIsEditingCall(false)}
                        disabled={isSavingCall}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSaveCall}
                      disabled={isSavingCall || !callDate || !callTime}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-[#ff6937] hover:bg-[#e05626] text-white rounded-lg text-xs font-bold transition-all shadow-2xs disabled:opacity-50"
                    >
                      {isSavingCall ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {scheduledCall ? 'Update Call Schedule' : 'Schedule Call'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer / Status updates */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Pipeline Status:</span>
            <div className="flex gap-1">
              {(['NEW', 'OPEN', 'HOT', 'QUALIFIED', 'IN PROGRESS'] as Lead['status'][]).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => onUpdateStatus(lead.id, st)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                      lead.status === st
                        ? 'bg-orange-500 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                )
              )}
            </div>
          </div>

          <button
            onClick={handleDone}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
