'use client';

import React, { useState, useEffect } from 'react';
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
  Code2,
  Copy,
  ExternalLink,
  MessageSquare,
  Palette,
  Sliders,
  Terminal,
  X,
  RotateCcw,
} from 'lucide-react';

export default function ContactUsPage() {
  const [activeView, setActiveView] = useState<'form' | 'snippet'>('form');

  // Form State matching screenshot
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<{
    customer: string;
    company: string;
    manager: string;
    score: number;
    reason: string;
    urgency?: string;
  } | null>(null);

  // Snippet Generator State
  const [portalUrl, setPortalUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6C47FF');
  const [position, setPosition] = useState<'right' | 'left'>('right');
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [isFloatingOpen, setIsFloatingOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPortalUrl(window.location.origin);

      // Load the embeddable widget script dynamically on this page for live interactive testing
      const script = document.createElement('script');
      script.id = 'impiger-lead-widget-script';
      script.src = '/lead-widget.js';
      script.setAttribute('data-primary-color', '#6C47FF');
      script.defer = true;
      document.body.appendChild(script);

      return () => {
        const s = document.getElementById('impiger-lead-widget-script');
        if (s) s.remove();
        const widgetContainer = document.getElementById('impiger-lead-widget-container');
        if (widgetContainer) widgetContainer.remove();
        delete (window as any).__IMPIGER_LEAD_WIDGET_LOADED__;
        delete (window as any).ImpigerLeadWidget;
        delete (window as any).LeadWidget;
      };
    }
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !company.trim() || !email.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const fullPhone = `${countryCode} ${phone.trim()}`;

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          name: fullName,
          customer: fullName,
          company: company.trim(),
          email: email.trim(),
          phone: fullPhone,
          message: message.trim() || 'Inquiry submitted through chat lead form',
          source: 'Website',
          focusArea: 'Cloud & Digital Transformation',
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
          urgency: data.lead.aiInsights?.urgency,
        });
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFirstName('');
    setLastName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setMessage('');
    setSubmittedLead(null);
  };

  const snippetCode = `<script
  src="${portalUrl || 'https://your-domain.com'}/lead-widget.js"
  data-portal-url="${portalUrl || 'https://your-domain.com'}"
  data-primary-color="${primaryColor}"
  data-position="${position}"
  defer
></script>`;

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippetCode);
      setSnippetCopied(true);
      setTimeout(() => setSnippetCopied(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between">
      {/* Impiger Brand Top Navigation */}
      <header className="border-b border-slate-200/80 px-6 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-20 shadow-2xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-base shadow-xs">
              L
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-base leading-none block">
                LeadManager
              </span>
              <span className="text-[10px] text-[#ff6937] font-semibold">
                Chat Design Lead Intake
              </span>
            </div>
          </div>

          {/* View switcher tabs */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveView('form')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'form'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#6C47FF]" />
              <span>Chat Lead Form</span>
            </button>
            <button
              onClick={() => setActiveView('snippet')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'snippet'
                  ? 'bg-white text-[#6C47FF] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Get Embed Snippet Code</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/?tab=dashboard"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Management Portal</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full flex flex-col items-center justify-center">
        {/* Switcher pills for mobile */}
        <div className="sm:hidden flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold mb-6">
          <button
            onClick={() => setActiveView('form')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'form' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Chat Lead Form
          </button>
          <button
            onClick={() => setActiveView('snippet')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'snippet' ? 'bg-white text-[#6C47FF] shadow-2xs' : 'text-slate-600'
            }`}
          >
            Get Embed Snippet
          </button>
        </div>

        {activeView === 'form' ? (
          <div className="w-full flex flex-col items-center">
            {/* Title & subtitle */}
            <div className="text-center max-w-xl mx-auto mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 text-[#6C47FF] rounded-full text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Chat-Driven Lead Generation Widget</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Connect With Our Specialists
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
                Submit through our chat-styled lead widget. Leads are instantly triaged with AI and dispatched to the LeadManager portal.
              </p>
            </div>

            {/* Chat Design Lead Card Container */}
            <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200 overflow-hidden transition-all">
              {/* Card Header matching screenshot */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  title="Reset form"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <img src="/widget-logo.png" alt="Logo" className="h-5 w-auto object-contain" />
                  <span className="text-xs font-bold text-slate-800">Impiger Technologies</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  title="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {submittedLead ? (
                /* Success View */
                <div className="p-6 text-center animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-200">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Thank you, {submittedLead.customer}!
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    We will be in touch with you shortly. Your inquiry has been routed in the LeadManager portal.
                  </p>

                  <div className="my-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>AI Triage Details:</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">
                      Assigned: <span className="text-orange-600">{submittedLead.manager}</span>
                    </div>
                    {submittedLead.reason && (
                      <p className="text-slate-500 text-[11px] mt-1 leading-snug">
                        {submittedLead.reason}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link
                      href="/?tab=dashboard"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>View in Management Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={handleResetForm}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Submit Another Inquiry</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Form View matching exact user screenshot */
                <div className="p-4">
                  {/* Chat message prompt bubble */}
                  <div className="bg-[#fafafc] border border-slate-200/90 rounded-xl p-3 mb-4 text-xs font-medium text-slate-800 leading-relaxed shadow-2xs">
                    Thank you! 🤭 Fill out your contact details and we will be in touch with you shortly! *
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-3">
                    {/* First name & Last name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          First name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Enter first name here"
                          className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Last name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Enter last name here"
                          className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Company name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Company name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Enter company name here"
                        className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Email ID */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Email ID <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email ID here"
                        className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Mobile number with country select */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Mobile number <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center bg-[#f8fafc] border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-400 focus-within:bg-white transition-all">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="bg-slate-100 border-r border-slate-200 text-xs px-2.5 py-2 font-medium text-slate-700 outline-none cursor-pointer"
                        >
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+971">🇦🇪 +971</option>
                          <option value="+65">🇸🇬 +65</option>
                          <option value="+61">🇦🇺 +61</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+81">🇯🇵 +81</option>
                          <option value="+966">🇸🇦 +966</option>
                        </select>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter mobile number here"
                          className="w-full bg-transparent px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Message
                      </label>
                      <textarea
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter message here"
                        className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all resize-none leading-relaxed"
                      />
                    </div>

                    <p className="text-[10px] text-slate-500 leading-tight">
                      * Your data will be managed according to our{' '}
                      <span className="underline cursor-pointer text-slate-700">Privacy Policy</span>
                    </p>

                    {/* Send contact request purple rounded button matching screenshot */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-[#6C47FF] hover:bg-[#5935ED] text-white rounded-full font-semibold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin" />
                          <span>Sending request...</span>
                        </>
                      ) : (
                        <span>Send contact request</span>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Quick helper link to snippet */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setActiveView('snippet')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6C47FF] hover:underline"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Want to embed this chat lead form on any external website? Get Snippet Code &rarr;</span>
              </button>
            </div>
          </div>
        ) : (
          /* Embed Snippet Generator View */
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Embeddable Chat Form Snippet
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Copy and paste this script tag into any HTML, WordPress, Shopify, or Webflow website.
                </p>
              </div>
              <button
                onClick={() => setActiveView('form')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Back to Chat Preview
              </button>
            </div>

            {/* Customization controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#6C47FF]" />
                  <span>Widget Theme Color</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-24 px-2 py-1 text-xs font-mono bg-white border border-slate-300 rounded-md text-slate-800"
                  />
                  <div className="flex gap-1.5">
                    {['#6C47FF', '#FF6937', '#10B981', '#2563EB', '#0F172A'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setPrimaryColor(c)}
                        className="w-5 h-5 rounded-full border border-white shadow-xs"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>Widget Position</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPosition('right')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      position === 'right'
                        ? 'bg-purple-50 text-[#6C47FF] border-[#6C47FF]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Bottom Right (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosition('left')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      position === 'left'
                        ? 'bg-purple-50 text-[#6C47FF] border-[#6C47FF]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Bottom Left
                  </button>
                </div>
              </div>
            </div>

            {/* Code Snippet */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  Drop-in Embed Code
                </span>
                <button
                  onClick={handleCopySnippet}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#6C47FF] hover:bg-[#5935ED] text-white rounded-lg transition-colors shadow-xs"
                >
                  {snippetCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#0f172a] p-4 text-xs font-mono text-[#38bdf8] shadow-inner">
                <pre className="overflow-x-auto whitespace-pre leading-relaxed">
                  {snippetCode}
                </pre>
              </div>
            </div>

            {/* Integration Instructions */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2 leading-relaxed">
              <div className="font-bold text-slate-900">How to use on any website:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>HTML / Static Sites:</strong> Paste the code immediately before the closing <code className="text-purple-600 bg-purple-50 px-1 py-0.5 rounded">&lt;/body&gt;</code> tag.
                </li>
                <li>
                  <strong>WordPress:</strong> Use Header & Footer scripts plugin or paste inside <em>footer.php</em>.
                </li>
                <li>
                  <strong>Webflow / Wix / Shopify:</strong> Paste into the Site Settings &gt; Custom Code / Footer section.
                </li>
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
              <a
                href="/widget-demo.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#6C47FF] hover:underline"
              >
                <span>Launch Standalone Test Simulation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleCopySnippet}
                className="px-4 py-2 bg-[#6C47FF] hover:bg-[#5935ED] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                {snippetCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{snippetCopied ? 'Code Copied' : 'Copy Embed Code'}</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 px-6 py-4 text-center text-xs text-slate-400 bg-white">
        LeadManager &copy; {new Date().getFullYear()} Impiger Technologies. Chat Design Lead Capture Engine.
      </footer>
    </div>
  );
}
