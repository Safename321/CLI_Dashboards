// CLI — AI Mentor chat panel (modal). 15 stateful mode tabs in 5 groups, each
// with its own conversation + input; alert strip; session HTML report export.
// Transport via ./api.js (secure proxy); responses rendered with deep-link
// buttons via ./renderMessage.jsx.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useData } from '../data/DataContext.jsx';
import { MENTOR_TABS, REPORT_BUTTON_SAYINGS } from '../data/datasets/mentor-content.js';
import SYSTEM_PROMPT from './system-prompt.md?raw';
import { sendMentorMessage } from './api.js';
import renderMentorMessage from './renderMessage.jsx';
import { buildDashboardContext, getMentorAlerts } from './buildContext.js';
import { CLILogo } from '../components/CLILogo.jsx';
import { generateSessionReport } from './sessionReport.js';
import MentorTabs from './MentorTabs.jsx';
import MentorAlerts from './MentorAlerts.jsx';

const emptyPerTab = (fill) => Object.fromEntries(MENTOR_TABS.map((t) => [t.id, fill()]));

export default function AIMentor({
  isOpen,
  onClose,
  currentDashboard,
  yearData,
  selectedYear,
  onNavigate,
  onDeepLink,
  conversation: externalConv,
  setConversation: setExternalConv,
}) {
  const { token, email, tenant } = useAuth();
  const { data } = useData();

  // Per-tab state: which mode panel is showing, its draft input, its history.
  const [activeTab, setActiveTab] = useState('ask');
  const [questions, setQuestions] = useState(() => emptyPerTab(() => ''));
  // Use the external per-tab conversations dict if provided; fall back to local.
  const externalIsDict = externalConv && !Array.isArray(externalConv) && typeof externalConv === 'object';
  const [localConversations, setLocalConversations] = useState(() => emptyPerTab(() => []));
  const conversations = externalIsDict ? externalConv : localConversations;
  const setConversations = externalIsDict ? setExternalConv : setLocalConversations;

  const conversation = conversations[activeTab] || [];
  const setConversation = (updater) => {
    setConversations((prev) => {
      const safe = prev && typeof prev === 'object' && !Array.isArray(prev) ? prev : {};
      const current = safe[activeTab] || [];
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...safe, [activeTab]: next };
    });
  };
  const question = questions[activeTab] || '';
  const setQuestion = (val) => {
    setQuestions((prev) => ({ ...prev, [activeTab]: typeof val === 'function' ? val(prev[activeTab] || '') : val }));
  };

  const tabConfig = MENTOR_TABS.find((t) => t.id === activeTab) || MENTOR_TABS[3];

  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isLoading]);

  // Focus input when the modal opens.
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const kpis = useMemo(() => data?.yearlyKPIs?.[selectedYear] || {}, [data, selectedYear]);
  const alerts = useMemo(
    () => getMentorAlerts(kpis).filter((a) => !dismissedAlerts.includes(a.id)),
    [kpis, dismissedAlerts],
  );

  const handleSelectTab = (tab) => {
    setActiveTab(tab.id);
    setErrorBanner(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleAsk = () => {
    if (!question.trim() || isLoading) return;
    const msg = question.trim();
    setQuestion('');
    sendMessage(msg, conversation);
  };

  const sendMessage = async (userContent, history) => {
    setConversation((prev) => [...prev, { role: 'user', content: userContent }]);
    setIsLoading(true);
    setErrorBanner(null);

    // Structured snapshot of what the user is looking at, prepended (by api.js)
    // to this turn's outgoing message only — displayed history stays clean.
    const dashboardContext = buildDashboardContext({ currentDashboard, selectedYear, yearData, kpis });

    try {
      const { text } = await sendMentorMessage({
        token,
        system: SYSTEM_PROMPT + (tabConfig.systemPrefix || ''),
        messages: [...history, { role: 'user', content: userContent }],
        dashboardContext,
      });
      setConversation((prev) => [...prev, { role: 'assistant', content: text, fromTab: activeTab }]);
    } catch (err) {
      // err.message is always user-facing (api.js maps raw server errors).
      console.error('[AIMentor] send failed:', err);
      setErrorBanner(err.message || 'Something went wrong — please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    generateSessionReport({
      conversation,
      tabLabel: tabConfig.label,
      currentDashboard,
      email,
      tenantName: tenant?.companyName,
    });
  };

  if (!isOpen) return null;

  const reportSaying = REPORT_BUTTON_SAYINGS[Math.floor(Date.now() / 1000) % REPORT_BUTTON_SAYINGS.length];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className="flex flex-col overflow-hidden rounded-2xl border border-accent/25 shadow-2xl"
        style={{
          width: '70vw',
          minWidth: '720px',
          maxWidth: '1400px',
          height: '85vh',
          background: 'linear-gradient(160deg,#0f0f1a 0%,#13131f 100%)',
        }}
      >
        {/* ── Header — compact ── */}
        <div
          className="flex shrink-0 items-center justify-between px-4 py-2"
          style={{ background: 'linear-gradient(90deg,#0e7490,#1d4ed8)' }}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow">
              <CLILogo size={24} />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">CLI — AI Mentor</span>
            <span className="text-xs text-cyan-300 opacity-70">· {currentDashboard}</span>
          </div>
          <div className="flex items-center gap-2">
            {conversation.length > 0 && (
              <button
                type="button"
                onClick={downloadReport}
                className="flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-600/80 px-2.5 py-1 text-xs font-bold text-white transition-all hover:bg-emerald-500"
                title="Download this session as HTML (open in browser → Print → Save as PDF)"
              >
                📄 {reportSaying}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close AI mentor"
              className="flex h-7 w-7 items-center justify-center rounded-full text-xl font-bold text-white transition-all hover:bg-white/20 hover:text-cyan-200"
            >
              ×
            </button>
          </div>
        </div>

        {/* ── Tabs row — 15 tabs in 5 labeled groups ── */}
        <MentorTabs activeTab={activeTab} onSelect={handleSelectTab} disabled={isLoading} />

        {/* ── Alerts — one-row summary + expandable detail ── */}
        <MentorAlerts
          alerts={alerts}
          onNavigate={onNavigate}
          onClose={onClose}
          onDismiss={(id) => setDismissedAlerts((prev) => [...prev, id])}
        />

        {/* ── Chat — fills remaining space ── */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-2.5 overflow-y-auto px-4 py-3">
            {conversation.length === 0 && (
              <div className="py-8 text-center">
                <div className="mb-2 text-[28px]">{tabConfig.icon}</div>
                <p className="mb-1 text-[13px] font-semibold" style={{ color: tabConfig.color }}>
                  {tabConfig.label}
                </p>
                <p className="mx-auto max-w-[480px] text-[11px] leading-[1.55] text-slate-400">
                  {tabConfig.description || 'Ask anything about CLI, your data, or leadership.'}
                </p>
              </div>
            )}
            {conversation.map((msg, i) => {
              const msgTab = msg.fromTab ? MENTOR_TABS.find((t) => t.id === msg.fromTab) : null;
              const accentColor = msgTab?.color;
              const isUser = msg.role === 'user';
              return (
                <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div
                      className="mr-2 mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center overflow-hidden rounded-full"
                      style={{ background: accentColor || '#fff' }}
                    >
                      {accentColor ? (
                        <span className="text-[11px]">{msgTab?.icon}</span>
                      ) : (
                        <CLILogo size={20} />
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] whitespace-pre-wrap rounded-xl px-3 py-2 text-[11.5px] leading-[1.55] ${
                      isUser
                        ? 'rounded-br-sm bg-gradient-to-br from-cyan-700 to-blue-800 text-white'
                        : 'rounded-bl-sm bg-panel text-slate-200'
                    }`}
                    style={
                      isUser
                        ? undefined
                        : {
                            borderTop: `1px solid ${accentColor || '#334155'}`,
                            borderRight: '1px solid #334155',
                            borderBottom: '1px solid #334155',
                            borderLeft: accentColor ? `2px solid ${accentColor}` : '1px solid #334155',
                          }
                    }
                  >
                    {isUser ? msg.content : renderMentorMessage(msg.content, onDeepLink, onNavigate)}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex items-center gap-2">
                <div
                  className="flex h-[22px] w-[22px] shrink-0 items-center justify-center overflow-hidden rounded-full"
                  style={{ background: tabConfig.color }}
                >
                  <span className="text-[11px]">{tabConfig.icon}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl rounded-bl-sm border border-border bg-panel px-3 py-2">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{
                        animationDelay: `${i * 0.2}s`,
                        animation: 'mentorBounce 1.2s ease-in-out infinite',
                        background: tabConfig.color,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Error banner — friendly message only, inside the chat panel */}
          {errorBanner && (
            <div className="mx-4 mb-2 mt-1 flex shrink-0 items-center justify-between rounded-xl border border-red-500/40 bg-red-900/30 px-3 py-2">
              <p className="text-xs font-semibold text-red-300">⚠️ {errorBanner}</p>
              <button
                type="button"
                onClick={() => setErrorBanner(null)}
                aria-label="Dismiss error"
                className="ml-3 text-sm leading-none text-red-400 hover:text-red-200"
              >
                ×
              </button>
            </div>
          )}

          {/* Download banner */}
          {conversation.some((m) => m.role === 'assistant') && (
            <div className="mx-4 mb-2 mt-1 flex shrink-0 items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-900/30 px-3 py-2">
              <div>
                <p className="text-xs font-semibold text-emerald-300">Session ready to save</p>
                <p className="text-xs text-slate-400">Organized Q&amp;A · Open in browser → Print → PDF</p>
              </div>
              <button
                type="button"
                onClick={downloadReport}
                className="ml-3 whitespace-nowrap rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-900/40 transition-all hover:bg-emerald-500 active:scale-95"
              >
                📄 {reportSaying}
              </button>
            </div>
          )}

          {/* Input — per-tab placeholder, accent color from active tab */}
          <div className="flex shrink-0 gap-2 border-t border-border/70 px-4 pb-3 pt-2">
            <input
              ref={inputRef}
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isLoading && question.trim()) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              disabled={isLoading}
              placeholder={tabConfig.placeholder}
              aria-label={`Message the mentor — ${tabConfig.label}`}
              style={{ fontSize: '12px', borderColor: tabConfig.color + '40' }}
              className="flex-1 rounded-lg border bg-panel px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
              onFocus={(e) => { e.target.style.borderColor = tabConfig.color; }}
              onBlur={(e) => { e.target.style.borderColor = tabConfig.color + '40'; }}
            />
            <button
              type="button"
              onClick={handleAsk}
              disabled={isLoading || !question.trim()}
              style={{ background: tabConfig.color }}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mentorBounce {
          0%,80%,100% { transform:translateY(0); opacity:0.4; }
          40% { transform:translateY(-5px); opacity:1; }
        }
      `}</style>
    </div>
  );
}
