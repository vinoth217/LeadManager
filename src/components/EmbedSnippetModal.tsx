'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Code2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Palette,
  Sliders,
  Globe,
  Terminal,
} from 'lucide-react';

interface EmbedSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmbedSnippetModal: React.FC<EmbedSnippetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [portalUrl, setPortalUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6C47FF');
  const [position, setPosition] = useState<'right' | 'left'>('right');
  const [copied, setCopied] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'html' | 'wordpress' | 'webflow' | 'react'>('html');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPortalUrl(window.location.origin);
    }
  }, []);

  if (!isOpen) return null;

  const snippetCode = `<script
  src="${portalUrl || 'https://your-portal.com'}/lead-widget.js"
  data-portal-url="${portalUrl || 'https://your-portal.com'}"
  data-primary-color="${primaryColor}"
  data-position="${position}"
  defer
></script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippetCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6C47FF] flex items-center justify-center font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Chat Lead Form Snippet
              </h2>
              <p className="text-xs text-slate-500">
                Embed this floating chat lead widget into any external website
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Customization controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#6C47FF]" />
                <span>Primary Color</span>
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
                <div className="flex gap-1">
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
                <span>Launcher Position</span>
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

          {/* Snippet Code Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                HTML Embed Code Snippet
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-[#6C47FF] hover:bg-[#5935ED] text-white rounded-lg transition-colors shadow-xs"
              >
                {copied ? (
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

            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0f172a] p-4 text-xs font-mono text-slate-100 shadow-inner">
              <pre className="overflow-x-auto whitespace-pre leading-relaxed text-[#38bdf8]">
                {snippetCode}
              </pre>
            </div>
          </div>

          {/* Platform tabs */}
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Integration Instructions
            </div>
            <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold mb-3">
              {[
                { id: 'html', label: 'Plain HTML' },
                { id: 'wordpress', label: 'WordPress' },
                { id: 'webflow', label: 'Webflow' },
                { id: 'react', label: 'Next.js / React' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePlatform(p.id as any)}
                  className={`pb-2 border-b-2 transition-colors ${
                    activePlatform === p.id
                      ? 'border-[#6C47FF] text-[#6C47FF]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-200/80 leading-relaxed">
              {activePlatform === 'html' && (
                <p>
                  Paste the snippet code right before the closing{' '}
                  <code className="text-pink-600 bg-pink-50 px-1 py-0.5 rounded">&lt;/body&gt;</code> tag of your HTML pages. The widget automatically initializes without any additional setup.
                </p>
              )}
              {activePlatform === 'wordpress' && (
                <p>
                  In WordPress admin, go to <strong>Appearance &gt; Theme File Editor</strong> (or use a plugin like &ldquo;WPCode&rdquo; / &ldquo;Header and Footer Scripts&rdquo;) and paste the snippet inside the footer scripts section.
                </p>
              )}
              {activePlatform === 'webflow' && (
                <p>
                  In Webflow project settings, navigate to <strong>Custom Code</strong> &gt; <strong>Footer Code</strong>. Paste the snippet and publish your changes.
                </p>
              )}
              {activePlatform === 'react' && (
                <p>
                  Add the snippet inside your Next.js root layout using{' '}
                  <code className="text-purple-600 bg-purple-50 px-1 py-0.5 rounded">&lt;Script src=&quot;.../lead-widget.js&quot; strategy=&quot;afterInteractive&quot; /&gt;</code> or dynamic script loader in React.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <a
            href="/widget-demo.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6C47FF] hover:underline"
          >
            <span>Open standalone preview test page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-semibold bg-[#6C47FF] hover:bg-[#5935ED] text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
