'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  Send,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

const FOCUS_AREAS = [
  'Platforms & Products',
  'Product Engineering Services',
  'Cloud & Digital Transformation',
  'Mobile App Development',
  'AI & GenAI Solutions',
  'Testing Services / QA',
  'IoT & Smart Systems',
  'Enterprise Logistics / ERP',
];

export default function ContactUsPage() {
  const [focusArea, setFocusArea] = useState('Cloud & Digital Transformation');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+1 ');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<{
    customer: string;
    company: string;
    manager: string;
    score: number;
    reason: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email || !message) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          company,
          email,
          phone,
          focusArea,
          message,
          source: 'Website',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedLead({
          customer: data.lead.customer,
          company: data.lead.company,
          manager: data.lead.manager,
          score: data.lead.score,
          reason: data.lead.aiInsights?.assignedReason,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Impiger Brand Top Navigation */}
      <header className="border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#ff6937] rounded-lg flex items-center justify-center text-white font-extrabold text-lg">
              i
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-lg">
              Impiger <span className="text-[#ff6937]">Technologies</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <span className="hover:text-orange-600 cursor-pointer">Product Engineering</span>
            <span className="hover:text-orange-600 cursor-pointer">Cloud & DevOps</span>
            <span className="hover:text-orange-600 cursor-pointer">AI & Analytics</span>
            <span className="hover:text-orange-600 cursor-pointer">Case Studies</span>
          </nav>
        </div>

        <Link
          href="/?tab=dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Management Portal</span>
        </Link>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>AI-Powered Real-Time Lead Intake</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Let&apos;s Build Something Great Together
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Share your project requirements below. Our Gemini AI triage engine will instantly route your inquiry to the best-suited Solutions Architect.
          </p>
        </div>

        {/* Content Box */}
        {submittedLead ? (
          <div className="max-w-xl mx-auto bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h2 className="text-xl font-bold text-emerald-950">Thank you, {submittedLead.customer}!</h2>
            <p className="text-xs text-emerald-800 mt-1">
              Your inquiry from <strong>{submittedLead.company}</strong> has been received and analyzed by our AI triage engine.
            </p>

            <div className="my-6 p-4 bg-white/90 rounded-xl border border-emerald-100 text-left text-xs shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Routing Result:</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                Assigned Specialist: <span className="text-orange-600">{submittedLead.manager}</span>
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">{submittedLead.reason}</p>
            </div>

            <div className="flex justify-center gap-3">
              <Link
                href="/?tab=dashboard"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <span>View in Management Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setSubmittedLead(null)}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Submit Another Inquiry
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-100/60 p-8 max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Focus Area selector pills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  What are you exploring? (Focus Area)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {FOCUS_AREAS.map((fa) => {
                    const isSelected = focusArea === fa;
                    return (
                      <button
                        type="button"
                        key={fa}
                        onClick={() => setFocusArea(fa)}
                        className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-[#ff6937] bg-orange-50/70 text-orange-950 shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        {fa}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              {/* Company & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Health Inc."
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Email ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@acmehealth.com"
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number (with country code)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Description / Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your project requirements, technology stack, target launch dates, and expectations..."
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 leading-relaxed"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#ff6937] hover:bg-[#ea580c] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Gemini AI is analyzing & matching your project...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Inquiry</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
