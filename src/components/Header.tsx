'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  Search,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Briefcase,
  Shield,
  MapPin,
  Phone,
  LogOut,
  Flame,
  Calendar,
  CheckCircle2,
  Check,
  Trash2,
  Inbox,
} from 'lucide-react';
import { Manager } from '@/types';

interface HeaderProps {
  totalCount: number;
  managers: Manager[];
  onOpenManagersModal?: () => void;
  activeView: 'dashboard' | 'leads' | 'users';
  onGenerateLeads?: () => void;
  isGenerating?: boolean;
  currentUser?: Manager | null;
  onLogout?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'ai' | 'lead' | 'meeting' | 'system';
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [];

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  managers,
  onOpenManagersModal,
  activeView,
  onGenerateLeads,
  isGenerating,
  currentUser,
  onLogout,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');

  const popoverRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Notifications logic
  const unreadCount = notifications.filter((n) => n.unread).length;

  const filteredNotifications =
    notifFilter === 'unread'
      ? notifications.filter((n) => n.unread)
      : notifications;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Current active user or fallback default
  const user: Manager = currentUser || {
    id: 'admin',
    name: 'Admin',
    role: 'Lead Operations Administrator',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
    email: 'admin@impigertech.com',
    phone: '+1 (555) 019-2831',
    userRole: 'admin',
    status: 'Active',
    department: 'Operations & Enterprise Architecture',
    region: 'Global',
    specialties: ['Digital Transformation', 'Cloud & Architecture', 'AI Solutions'],
    activeLeads: 0,
    maxCapacity: 100,
  };

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="px-8 py-3.5 flex items-center justify-between border-b border-[#ebeef2] bg-white sticky top-0 z-20">
      {/* Left: Global Search & AI indicator matching Lead screen */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        {/* <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads, tasks, contacts..."
            className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-400 transition-all"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono bg-slate-200/60 px-1.5 py-0.5 rounded">
            /
          </span>
        </div> */}

        {/* <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 border border-orange-200/70 rounded-full text-[11px] font-medium text-orange-700">
          <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
          <span>Gemini AI Dispatch Active</span>
        </div> */}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Generate 10 Leads Action */}
        {onGenerateLeads && (
          <button
            onClick={onGenerateLeads}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-orange-50 hover:bg-orange-100 text-[#ff6937] border border-orange-200/80 rounded-lg transition-all disabled:opacity-50"
            title="Generate 10 random enterprise test leads"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating...' : 'Generate 10 Leads'}</span>
          </button>
        )}

        {/* Open Website Contact Page */}
        <Link
          href="/contact-us"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"
          title="Visit impigertech.com/contact-us"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          <span>Website Form</span>
        </Link>

        {/* Notification Popover Trigger */}
        <div ref={notificationRef} className="relative border-r border-[#ebeef2] pr-2.5">
          <button
            onClick={() => {
              setIsNotificationsOpen((prev) => !prev);
              setIsProfileOpen(false);
            }}
            className={`p-1.5 rounded-lg transition-all relative ${
              isNotificationsOpen
                ? 'bg-orange-50 text-[#ff6937] ring-1 ring-orange-200'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff6937]"></span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown Card */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2.5 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#fcfdfd]">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#ff6937] border border-orange-200/70">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-[#ff6937] hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Mark all as read</span>
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50 text-xs">
                <button
                  onClick={() => setNotifFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    notifFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('unread')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    notifFilter === 'unread'
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleToggleRead(n.id)}
                      className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group ${
                        n.unread ? 'bg-orange-50/25 hover:bg-orange-50/45' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Icon by type */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          n.type === 'ai'
                            ? 'bg-orange-100 text-[#ff6937]'
                            : n.type === 'lead'
                            ? 'bg-rose-100 text-rose-600'
                            : n.type === 'meeting'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {n.type === 'ai' && <Sparkles className="w-4 h-4" />}
                        {n.type === 'lead' && <Flame className="w-4 h-4" />}
                        {n.type === 'meeting' && <Calendar className="w-4 h-4" />}
                        {n.type === 'system' && <CheckCircle2 className="w-4 h-4" />}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2 mb-0.5">
                          <span
                            className={`text-xs font-bold truncate ${
                              n.unread ? 'text-slate-900' : 'text-slate-700'
                            }`}
                          >
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {n.description}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {n.unread && (
                        <span className="w-2 h-2 rounded-full bg-[#ff6937] shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-slate-400">
                    <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                    <p className="text-xs font-semibold text-slate-600">No notifications</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {notifFilter === 'unread'
                        ? 'All caught up! No unread notifications.'
                        : 'New alerts will appear here.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-slate-100 bg-[#fcfdfd] flex items-center justify-between text-xs">
                  <button
                    onClick={handleClearNotifications}
                    className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear all</span>
                  </button>
                  <span className="text-[10px] text-slate-400">
                    Impiger Lead Portal Alerts
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current User Profile Popover */}
        <div ref={popoverRef} className="relative">
          <button
            onClick={() => {
              setIsProfileOpen((prev) => !prev);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors group"
            title="View my profile"
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-200/80 group-hover:ring-orange-400 transition-all"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center ring-2 ring-orange-200/80">
                {getInitials(user.name)}
              </div>
            )}
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-[#ff6937] transition-colors truncate max-w-[120px]">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                {user.role}
              </div>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isProfileOpen ? 'rotate-180 text-orange-500' : ''
              }`}
            />
          </button>

          {/* Popover Card: Only current user details */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-5 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Profile Card Header */}
              <div className="flex items-start gap-3 pb-3.5 border-b border-slate-100">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-orange-200 shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center ring-2 ring-orange-200 shrink-0">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {user.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        user.userRole === 'admin'
                          ? 'bg-slate-900 text-white'
                          : 'bg-orange-100 text-[#ff6937]'
                      }`}
                    >
                      {user.userRole || 'specialist'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mb-1">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-medium text-emerald-700">
                      {user.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details List */}
              <div className="py-3 space-y-2 text-xs border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    Role:
                  </span>
                  <span className="font-semibold text-slate-800 text-right truncate max-w-[170px]">
                    {user.role}
                  </span>
                </div>

                {user.department && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      Department:
                    </span>
                    <span className="font-semibold text-slate-800 text-right truncate max-w-[170px]">
                      {user.department}
                    </span>
                  </div>
                )}

                {user.region && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Region:
                    </span>
                    <span className="font-semibold text-slate-800 text-right">
                      {user.region}
                    </span>
                  </div>
                )}

                {user.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Phone:
                    </span>
                    <span className="font-semibold text-slate-800 text-right">
                      {user.phone}
                    </span>
                  </div>
                )}

                {/* Specialties Pill Badges */}
                {user.specialties && user.specialties.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Specialties
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {user.specialties.map((s: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-orange-50 text-[#ff6937] border border-orange-200/60 text-[10px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sign Out Action */}
              {onLogout && (
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-100 hover:border-rose-200"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
