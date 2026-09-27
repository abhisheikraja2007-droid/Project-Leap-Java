import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserRole } from '../types';

interface AiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  initialPrompt?: string;
}

export const AiCopilotModal: React.FC<AiCopilotModalProps> = ({
  isOpen,
  onClose,
  userRole,
  initialPrompt = '',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: `Hello Marcus. I am **AgriPulse AI Advisor**, your precision agronomy and automated irrigation copilot. 

I am continuously monitoring real-time telemetry from your 24 sensor nodes.
**Current Alert:** Sector 4-B (Corn V8) has breached the critical safety threshold with **17.4% VWC** under a high heat index (**ETc 6.4mm/day**).

How can I assist your field operations or financial reconciliation today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<'Agronomy' | 'Irrigation' | 'ERP Finance'>('Agronomy');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, text: m.text })),
          userRole,
          persona: selectedPersona,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.text || 'Telemetry acknowledged. All systems synchronized.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `⚠️ **AgriPulse AI Error:** ${err.message || 'Unable to connect to Gemini intelligence.'} \n*Defaulting to local telemetry baseline: Sector 4-B VWC 17.4% requires immediate 45m root recovery pulse.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Triage Sector 4-B critical moisture deficit (17.4% VWC)',
    'Recommend fertigation prescription for Corn V8 hybrid',
    'Explain Q3 electricity budget variance (+12% surge)',
    'Draft purchase order for 12x Solenoid Manifolds',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-inverse-surface/50 backdrop-blur-xs flex justify-end">
      <div className="bg-surface-container-lowest w-full max-w-xl h-full shadow-2xl flex flex-col justify-between border-l border-[#dce9ff]">
        {/* Header */}
        <div className="p-4 px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-900 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">
                  Agronomy Copilot
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  · Advisory Assistant
                </span>
              </div>
              <p className="text-xs text-slate-500">
                SCADA telemetry, soil physiology &amp; farm ledger advisor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/60 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Persona Selector Tabs */}
        <div className="px-6 py-2 bg-white border-b border-slate-200 flex items-center gap-2 text-xs">
          <span className="text-xs font-medium text-slate-500">Specialization:</span>
          <div className="inline-flex p-0.5 bg-slate-100 rounded-md">
            {(['Agronomy', 'Irrigation', 'ERP Finance'] as const).map((persona) => (
              <button
                key={persona}
                onClick={() => setSelectedPersona(persona)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                  selectedPersona === persona
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {persona}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">
                  {msg.role === 'user' ? 'Marcus Vance' : 'AgriPulse AI'}
                </span>
                <span className="font-data-mono text-[10px] text-outline">
                  {msg.timestamp}
                </span>
              </div>
              <div
                className={`max-w-[88%] rounded-2xl p-4 text-[13.5px] leading-relaxed shadow-xs whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-primary-container text-on-primary font-medium rounded-br-xs'
                    : 'bg-surface-container-low text-on-surface border border-[#dce9ff]/70 rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex flex-col items-start">
              <span className="font-label-sm text-[11px] text-on-surface-variant mb-1 px-1">
                AgriPulse AI Thinking...
              </span>
              <div className="bg-surface-container-low rounded-2xl rounded-bl-xs p-4 flex items-center gap-2 border border-[#dce9ff]/70">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></div>
                <span className="font-body-sm text-xs text-on-surface-variant ml-2">
                  Correlating sensor streams with Gemini reasoning...
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-6 py-2 bg-surface-container-lowest/90 border-t border-[#dce9ff]/50">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-3 py-1 rounded-full text-[11px] bg-surface-container text-on-surface hover:bg-primary-fixed hover:text-on-primary-fixed font-medium transition-colors cursor-pointer border border-[#dce9ff]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 px-6 bg-surface-container-low border-t border-[#dce9ff]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about soil telemetry, valve pulses, or budgets..."
              disabled={isLoading}
              className="flex-1 bg-surface-container-lowest px-4 py-2.5 rounded-xl border border-outline-variant text-on-surface font-body-sm text-[13.5px] placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>Powered by Gemini 3.5 Flash · Server-side SDK</span>
            <span className="font-data-mono">Spring Boot &amp; SCADA Linked</span>
          </div>
        </div>
      </div>
    </div>
  );
};
