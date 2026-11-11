'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DashboardView } from '@/components/DashboardView';
import { MetricsBar } from '@/components/MetricsBar';
import { FilterTabs } from '@/components/FilterTabs';
import { Toolbar } from '@/components/Toolbar';
import { LeadsTable } from '@/components/LeadsTable';
import { BatchActionBar } from '@/components/BatchActionBar';
import { LeadDetailModal } from '@/components/LeadDetailModal';
import { ManagersModal } from '@/components/ManagersModal';
import { UsersView } from '@/components/UsersView';
import { LoginView } from '@/components/LoginView';
import { ShieldAlert, Sparkles, CheckCircle2, X } from 'lucide-react';
import { Lead, LeadStats, Manager, UserSystemRole, ScheduledCall } from '@/types';
import { INITIAL_MANAGERS } from '@/lib/constants';

export default function App() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'users'>('dashboard');
  const [currentUser, setCurrentUser] = useState<Manager | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserSystemRole>('admin');

  // Load persisted authentication state and URL params on client mount (prevents SSR hydration mismatch)
  useEffect(() => {
    try {
      // 1. Sync Active Tab from URL query param or localStorage
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get('tab') as 'dashboard' | 'leads' | 'users' | null;
      const tabFromStorage = localStorage.getItem('lead_portal_active_tab') as 'dashboard' | 'leads' | 'users' | null;

      let initialTab: 'dashboard' | 'leads' | 'users' = 'dashboard';
      if (tabFromUrl && ['dashboard', 'leads', 'users'].includes(tabFromUrl)) {
        initialTab = tabFromUrl;
      } else if (tabFromStorage && ['dashboard', 'leads', 'users'].includes(tabFromStorage)) {
        initialTab = tabFromStorage;
      }
      setActiveTab(initialTab);

      // 2. Load Auth State
      const stored =
        localStorage.getItem('lead_portal_auth_user') ||
        sessionStorage.getItem('lead_portal_auth_user');
      if (stored) {
        const parsed: Manager = JSON.parse(stored);
        setCurrentUser(parsed);
        setCurrentUserRole(parsed.userRole || 'admin');
      }
    } catch (e) {
      console.error('Failed reading initial state:', e);
    } finally {
      setIsMounted(true);
    }
  }, []);

  const handleLogout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lead_portal_auth_user');
      sessionStorage.removeItem('lead_portal_auth_user');
      localStorage.setItem('lead_portal_active_tab', 'dashboard');
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'dashboard');
      window.history.replaceState({}, '', url.toString());
    }
    setActiveTab('dashboard');
    setCurrentUser(null);
  }, []);

  // Helper to change tab and persist to URL + localStorage
  const handleTabChange = useCallback((tab: 'dashboard' | 'leads' | 'users') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lead_portal_active_tab', tab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // Sync state with browser back/forward buttons
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') as 'dashboard' | 'leads' | 'users' | null;
      if (tab && ['dashboard', 'leads', 'users'].includes(tab)) {
        setActiveTab(tab);
        localStorage.setItem('lead_portal_active_tab', tab);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isMounted]);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [managers, setManagers] = useState<Manager[]>(INITIAL_MANAGERS);
  const [stats, setStats] = useState<LeadStats>({
    newLeads: { count: 0, changePercent: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
    qualifiedLeads: { count: 0, changePercent: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
    avgResponseTime: { value: '0.0h', changePercent: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
    hotLeads: { count: 0, changePercent: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
    totalCount: 0,
  });

  // Leads View UI States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentFilterTab, setCurrentFilterTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Modals
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [isManagersModalOpen, setIsManagersModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'info' | 'success' } | null>(null);

  // Fetch leads from API (user-scoped for specialists/members)
  const fetchLeads = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (currentFilterTab) params.set('status', currentFilterTab);
      if (searchQuery) params.set('q', searchQuery);
      if (currentUser?.name) {
        params.set('user', currentUser.name);
        params.set('role', currentUser.userRole || 'specialist');
      }

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        if (data.stats) setStats(data.stats);
        if (data.managers) setManagers(data.managers);
        // Keep activeLead synced with freshest lead data
        setActiveLead((prev) => {
          if (!prev) return null;
          const fresh = data.leads?.find((l: Lead) => l.id === prev.id);
          return fresh ? { ...prev, ...fresh } : prev;
        });
      }
    } catch (err) {
      console.warn('Error fetching leads:', err);
    }
  }, [currentFilterTab, searchQuery, currentUser?.name, currentUser?.userRole]);

  useEffect(() => {
    if (isMounted && currentUser) {
      fetchLeads();
    }
  }, [fetchLeads, isMounted, currentUser]);

  // Real-time polling & auto-sync: keep leads and notifications updated dynamically
  useEffect(() => {
    if (!isMounted || !currentUser) return;
    const interval = setInterval(() => {
      fetchLeads();
    }, 5000);

    const onFocus = () => fetchLeads();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchLeads, isMounted, currentUser]);

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === leads.length && leads.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((l) => l.id));
    }
  };

  const handleDiscardSelection = () => {
    setSelectedIds([]);
  };

  // Batch Delete
  const handleBatchDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.length} selected lead(s)?`
      )
    ) {
      return;
    }
    try {
      const res = await fetch('/api/leads/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', leadIds: selectedIds }),
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchLeads();
      }
    } catch {
      setLeads((prev) => prev.filter((l) => !selectedIds.includes(l.id)));
      setSelectedIds([]);
    }
  };

  // Single Lead Delete
  const handleDeleteLead = async (id: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        if (activeLead && activeLead.id === id) {
          setActiveLead(null);
        }
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
      setLeads((prev) => prev.filter((l) => l.id !== id));
    }
  };

  // Batch Assign To Manager
  const handleBatchAssign = async (targetManager: string) => {
    try {
      const res = await fetch('/api/leads/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign',
          leadIds: selectedIds,
          targetManager,
        }),
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch {
      setLeads((prev) =>
        prev.map((l) =>
          selectedIds.includes(l.id) ? { ...l, manager: targetManager } : l
        )
      );
    }
  };

  // Batch Re-Run Gemini AI
  const handleBatchAIRoute = async () => {
    try {
      const res = await fetch('/api/leads/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ai-reassign',
          leadIds: selectedIds,
        }),
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Lead Modal Actions
  const handleUpdateLeadStatus = async (
    id: string,
    newStatus: Lead['status']
  ) => {
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (activeLead && activeLead.id === id) {
        setActiveLead({ ...activeLead, status: newStatus });
      }
      fetchLeads();
    } catch {
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
      );
    }
  };

  const handleReassignLead = async (id: string, managerName: string) => {
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manager: managerName,
          aiInsights: activeLead?.aiInsights
            ? {
                ...activeLead.aiInsights,
                assignedReason: `Reassigned manually to ${managerName}.`,
                autoAssigned: false,
              }
            : undefined,
        }),
      });
      if (activeLead && activeLead.id === id) {
        setActiveLead({ ...activeLead, manager: managerName });
      }
      fetchLeads();
    } catch {
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, manager: managerName } : l))
      );
    }
  };

  const handleAIRetriage = async (id: string) => {
    try {
      await fetch('/api/leads/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ai-reassign', leadIds: [id] }),
      });
      const res = await fetch(`/api/leads`);
      const data = await res.json();
      const updated = data.leads?.find((l: Lead) => l.id === id);
      if (updated) {
        setActiveLead(updated);
        setLeads(data.leads);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleCall = async (
    id: string,
    scheduledCall: ScheduledCall | null
  ) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledCall }),
      });
      const data = await res.json();
      const updatedLead: Lead | undefined = data.lead;

      // Update activeLead with functional setter to prevent stale closure
      setActiveLead((prev) => {
        if (!prev || prev.id !== id) return prev;
        return updatedLead || { ...prev, scheduledCall: scheduledCall || undefined };
      });

      // Update leads list in place immediately
      setLeads((prev) =>
        prev.map((l) =>
          l.id === id ? (updatedLead || { ...l, scheduledCall: scheduledCall || undefined }) : l
        )
      );

      fetchLeads();
      return updatedLead;
    } catch (err) {
      console.error('Failed to schedule call:', err);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, scheduledCall: scheduledCall || undefined } : l
        )
      );
    }
  };

  const handleExport = () => {
    if (leads.length === 0) {
      alert('No leads to export.');
      return;
    }
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Customer,Company,Email,Status,Manager,Source,Score,Created']
        .concat(
          leads.map(
            (l) =>
              `"${l.customer}","${l.company}","${l.email}","${l.status}","${l.manager}","${l.source}",${l.score},"${l.created}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If checking authentication session on initial load, show sleek loader
  if (!isMounted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Authenticating session...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, display the Side-by-Side Login Screen
  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentUserRole(user.userRole || 'admin');
          handleTabChange('dashboard');
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] w-full">
      {/* Sidebar matching LeadManager layout with Admin-only Users tab */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isAdmin={currentUserRole === 'admin'}
        currentUserRole={currentUserRole}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area - Full width */}
      <main className="flex-1 min-w-0 flex flex-col w-full overflow-x-hidden">
        {/* Top Header */}
        <Header
          totalCount={stats.totalCount}
          managers={managers}
          leads={leads}
          onSelectLead={(lead) => {
            setActiveLead(lead);
            handleTabChange('leads');
          }}
          onOpenManagersModal={() => setIsManagersModalOpen(true)}
          activeView={activeTab}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Dynamic View: Dashboard | Users (Admin only) | Leads (Pipeline) */}
        {activeTab === 'dashboard' ? (
          <DashboardView
            leads={leads}
            onNavigateToLeads={() => handleTabChange('leads')}
            currentUser={currentUser}
          />
        ) : activeTab === 'users' ? (
          currentUserRole === 'admin' ? (
            <UsersView
              managers={managers}
              onRefreshManagers={fetchLeads}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4 ring-8 ring-rose-50/50">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Access Restricted: Admin Required
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-6">
                You are currently viewing in Specialist/Member mode. Team member and AI routing configurations are strictly accessible to Admins.
              </p>
              <button
                onClick={() => handleTabChange('dashboard')}
                className="px-4 py-2 bg-[#ff6937] hover:bg-[#ea580c] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          )
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Title Row matching Lead screen */}
            <div className="px-8 pt-5 pb-3 bg-white border-b border-[#ebeef2] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Leads <span className="text-slate-400 font-normal text-lg">{stats.totalCount}</span>
                </h1>
              </div>
            </div>

            {/* 4 KPI Cards */}
            <MetricsBar stats={stats} />

            {/* Filter Tabs: All, Favourite, New, Assigned to me, Overdue, Hot */}
            <FilterTabs
              currentTab={currentFilterTab}
              onTabSelect={(tab) => setCurrentFilterTab(tab)}
            />

            {/* Search & Actions Toolbar */}
            <Toolbar
              searchQuery={searchQuery}
              onSearchChange={(q) => setSearchQuery(q)}
              viewMode={viewMode}
              onViewModeChange={(mode) => setViewMode(mode)}
              onExport={handleExport}
            />

            {/* Main Data Table */}
            <div className="flex-1 pb-24">
              <LeadsTable
                leads={leads}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                onLeadClick={(lead) => setActiveLead(lead)}
                onDeleteLead={handleDeleteLead}
              />
            </div>

            {/* Floating Batch Action Bar */}
            <BatchActionBar
              selectedCount={selectedIds.length}
              managers={managers}
              onDiscard={handleDiscardSelection}
              onDelete={handleBatchDelete}
              onAssignTo={handleBatchAssign}
              onAIRoute={handleBatchAIRoute}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <LeadDetailModal
        lead={activeLead}
        managers={managers}
        onClose={() => setActiveLead(null)}
        onUpdateStatus={handleUpdateLeadStatus}
        onReassign={handleReassignLead}
        onAIRetriage={handleAIRetriage}
        onScheduleCall={handleScheduleCall}
      />

      <ManagersModal
        isOpen={isManagersModalOpen}
        onClose={() => setIsManagersModalOpen(false)}
        managers={managers}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white rounded-xl shadow-2xl p-4 border border-slate-700/80 animate-in slide-in-from-bottom-3 duration-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs leading-relaxed text-slate-200">
            {toastMessage.text}
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
