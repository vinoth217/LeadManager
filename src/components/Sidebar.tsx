'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Shield,
  ShieldAlert,
  LogOut,
  MessageSquareCode,
  ExternalLink,
} from 'lucide-react';
import { Manager, UserSystemRole } from '@/types';

interface SidebarProps {
  activeTab: 'dashboard' | 'leads' | 'users';
  onTabChange: (tab: 'dashboard' | 'leads' | 'users') => void;
  isAdmin?: boolean;
  currentUserRole?: UserSystemRole;
  currentUser?: Manager | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isAdmin = true,
  currentUserRole = 'admin',
  currentUser,
  onLogout,
}) => {
  return (
    <aside className="w-64 bg-white border-r border-[#ebeef2] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      <div className="flex flex-col">
        {/* Brand Header matching Lead screen */}
        <div className="p-5 flex items-center justify-between border-b border-[#ebeef2]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              L
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-sm leading-tight flex items-center gap-1.5">
                <span>LeadManager</span>
                <span className="text-[10px] text-slate-400 font-normal">™</span>
              </div>
              <div className="text-[11px] text-[#ff6937] font-semibold">
                Impiger Lead Portal
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Group: Dashboard, Leads, and Users (Admin Only) */}
        <div className="p-4">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-2 flex items-center justify-between">
            <span>Main Menu</span>
            {currentUserRole === 'admin' ? (
              <span className="text-[9px] text-[#ff6937] font-semibold uppercase tracking-wider bg-orange-50 px-1.5 py-0.5 rounded">
                Admin Mode
              </span>
            ) : (
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                User Mode
              </span>
            )}
          </div>
          <nav className="space-y-1">
            {/* Dashboard / Overview */}
            <button
              onClick={() => onTabChange('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                activeTab === 'dashboard'
                  ? 'bg-orange-50/80 text-[#ff6937] border border-orange-200/80 shadow-2xs font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard
                className={`w-4 h-4 ${
                  activeTab === 'dashboard' ? 'text-[#ff6937]' : 'text-slate-400'
                }`}
              />
              <span>Dashboard</span>
            </button>

            {/* Leads */}
            <button
              onClick={() => onTabChange('leads')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                activeTab === 'leads'
                  ? 'bg-orange-50/80 text-[#ff6937] border border-orange-200/80 shadow-2xs font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <UserCheck
                className={`w-4 h-4 ${
                  activeTab === 'leads' ? 'text-[#ff6937]' : 'text-slate-400'
                }`}
              />
              <span>Leads</span>
            </button>

            {/* Users - STRICTLY ADMIN ONLY */}
            {isAdmin && (
              <button
                onClick={() => onTabChange('users')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  activeTab === 'users'
                    ? 'bg-orange-50/80 text-[#ff6937] border border-orange-200/80 shadow-2xs font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users
                    className={`w-4 h-4 ${
                      activeTab === 'users' ? 'text-[#ff6937]' : 'text-slate-400'
                    }`}
                  />
                  <span>Users</span>
                </div>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    activeTab === 'users'
                      ? 'bg-orange-100 text-[#ff6937]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  ADMIN
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* Lead Capture Widget & Snippet Section */}
        <div className="px-4 py-2 border-t border-[#ebeef2]">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-2 flex items-center justify-between">
            <span>Lead Capture</span>
            <span className="text-[9px] text-[#6C47FF] font-semibold uppercase tracking-wider bg-purple-50 px-1.5 py-0.5 rounded">
              Widget
            </span>
          </div>
          <Link
            href="/contact-us"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-slate-600 hover:bg-purple-50/60 hover:text-[#6C47FF] group"
          >
            <div className="flex items-center gap-3">
              <MessageSquareCode className="w-4 h-4 text-[#6C47FF] group-hover:scale-110 transition-transform" />
              <span>Chat Form & Snippet</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C47FF]" />
          </Link>
        </div>
      </div>

      {/* User Profile at Bottom matching Lead screen with Admin indicator & Role Switch Tester */}
      <div className="p-4 border-t border-[#ebeef2] bg-white space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-orange-200 shadow-sm shrink-0"
              />
            ) : (
              <div
                className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center ring-2 shadow-sm shrink-0 ${
                  currentUserRole === 'admin'
                    ? 'bg-slate-900 text-white ring-orange-200'
                    : 'bg-slate-200 text-slate-700 ring-slate-100'
                }`}
              >
                {currentUser?.name
                  ? currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : currentUserRole === 'admin'
                  ? 'AD'
                  : 'SP'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                <span className="truncate">
                  {currentUser?.name || (currentUserRole === 'admin' ? 'Super Admin' : 'Specialist')}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md shrink-0 ${
                    currentUserRole === 'admin'
                      ? 'bg-orange-100 text-[#ff6937]'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {currentUserRole === 'admin' ? 'Admin' : 'Member'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {currentUser?.email ||
                  (currentUserRole === 'admin'
                    ? 'admin@impigertech.com'
                    : 'specialist@impigertech.com')}
              </div>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-600 transition-colors"
            title="Sign out of your account"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
};
