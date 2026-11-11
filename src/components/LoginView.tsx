'use client';

import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Shield,
  Key,
  Database,
  Cpu,
  UserCheck,
} from 'lucide-react';
import { Manager } from '@/types';

interface LoginViewProps {
  onLoginSuccess: (user: Manager) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Credential presets
  const handleSelectPreset = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Invalid credentials. Please try again.');
        return;
      }

      if (data.success && data.user) {
        localStorage.setItem('lead_portal_auth_user', JSON.stringify(data.user));
        sessionStorage.setItem('lead_portal_auth_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }
    } catch {
      setErrorMessage('Unable to connect to authentication server. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-900 select-none">
      {/* ======================================================== */}
      {/* LEFT SIDE: SHOWCASE, BRANDING & PRESET CREDENTIALS       */}
      {/* ======================================================== */}
      <div className="lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-slate-950 via-[#0d1633] to-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 relative overflow-hidden text-white">
        {/* Background glow accents */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#ff6937]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding matching LeadManager Portal */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff6937] rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-orange-500/20">
              L
            </div>
            <div>
              <div className="font-bold text-white text-base leading-tight flex items-center gap-1.5">
                <span>LeadManager</span>
                <span className="text-[10px] text-slate-400 font-normal">™</span>
              </div>
              <div className="text-xs text-[#ff6937] font-semibold tracking-wide">
                Impiger Lead Portal
              </div>
            </div>
          </div>
        </div>

        {/* Center: Hero Value Proposition */}
        <div className="my-10 lg:my-auto relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Google Gemini 3.5 Flash Dispatch Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Intelligent Lead Routing & Team Management
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Automate enterprise inbound inquiries with semantic AI triage. Ingest inquiries directly from Impiger’s Contact Us page and auto-dispatch to specialists based on domain expertise and bandwidth.
          </p>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>PostgreSQL DB</span>
              </div>
              <div className="text-xs text-slate-300 font-medium">Database: <code className="text-[#ff6937] font-mono">lead217</code></div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-orange-400 font-bold text-sm mb-1">
                <Cpu className="w-4 h-4 text-orange-400" />
                <span>Live Gemini AI</span>
              </div>
              <div className="text-xs text-slate-300 font-medium">Auto-dispatch: <span className="text-emerald-400 font-semibold">Active</span></div>
            </div>
          </div>

          {/* 1-CLICK DEMO CREDENTIALS SECTION */}
          <div className="pt-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#ff6937]" />
                <span>Quick Login Credentials (Click to Auto-Fill)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Default: Password@123</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Preset 1: Admin */}
              <button
                type="button"
                onClick={() => handleSelectPreset('admin@impigertech.com', 'Password@123')}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer group ${
                  email === 'admin@impigertech.com'
                    ? 'bg-orange-500/20 border-[#ff6937] ring-1 ring-[#ff6937]'
                    : 'bg-slate-800/70 border-slate-700 hover:border-orange-400/60 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-900 border border-orange-400/40 text-orange-400 text-[10px] font-bold flex items-center justify-center">
                      AD
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                      Super Admin
                    </span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold">
                    FULL ACCESS
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono truncate">
                  admin@impigertech.com
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <span>Pass:</span>
                  <code className="text-slate-300">Password@123</code>
                  <span className="text-[9px] text-orange-400 ml-auto font-medium">Use ↗</span>
                </div>
              </button>

              {/* Preset 2: Specialist (Vinoth) */}
              {/* <button
                type="button"
                onClick={() => handleSelectPreset('vinoth@leadmaster.com', 'Password@123')}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer group ${
                  email === 'vinoth@leadmaster.com'
                    ? 'bg-orange-500/20 border-[#ff6937] ring-1 ring-[#ff6937]'
                    : 'bg-slate-800/70 border-slate-700 hover:border-orange-400/60 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-900 border border-blue-400/40 text-blue-400 text-[10px] font-bold flex items-center justify-center">
                      VN
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                      Vinoth
                    </span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                    SPECIALIST
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono truncate">
                  vinoth@leadmaster.com
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <span>Pass:</span>
                  <code className="text-slate-300">Password@123</code>
                  <span className="text-[9px] text-orange-400 ml-auto font-medium">Use ↗</span>
                </div>
              </button> */}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <div>v2.4 Enterprise</div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT SIDE: AUTHENTICATION FORM                          */}
      {/* ======================================================== */}
      <div className="lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 bg-[#f8fafc]">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[#ebeef2] shadow-xl shadow-slate-200/50 space-y-6">
          {/* Form Header */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ff6937] uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure Authentication</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Sign In to Lead Portal
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Enter your corporate credentials or select a quick account on the left.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 font-semibold">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="name@impigertech.com"
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-[#ff6937] transition-all text-xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-slate-700 font-semibold">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('admin@impigertech.com', 'Password@123')}
                  className="text-[11px] text-[#ff6937] hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-[#ff6937] transition-all text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#ff6937] border-slate-300 rounded focus:ring-orange-400 cursor-pointer accent-[#ff6937]"
                />
                <span className="text-slate-600 text-xs font-medium">Keep me signed in</span>
              </label>

              <span className="text-[11px] text-slate-400">
                Default: <code className="text-slate-700 font-mono font-semibold">Password@123</code>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-[#ff6937] hover:bg-[#ea580c] active:bg-[#c2410c] text-white rounded-xl font-bold shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all text-xs disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating with lead217...</span>
              ) : (
                <>
                  <span>Sign In to Lead Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Helper Banner */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Powered by Impiger Technologies</span>
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>PostgreSQL Active</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
