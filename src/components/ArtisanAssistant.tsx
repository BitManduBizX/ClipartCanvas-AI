import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Sparkles,
  Check,
  Wand2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { STYLE_PRESETS, StylePreset } from "../data/studioPresets";

interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  proposedPrompt?: string;
  proposedStyle?: string;
  quickTips?: string[];
  applied?: boolean;
  dismissed?: boolean;
}

interface ArtisanAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  activePrompt: string;
  activeStyle: StylePreset["name"];
  activePalette: string;
  onConsentApplyPrompt: (newPrompt: string, newStyle?: StylePreset["name"]) => void;
}

export const ArtisanAssistant: React.FC<ArtisanAssistantProps> = ({
  isOpen,
  onClose,
  activePrompt,
  activeStyle,
  activePalette,
  onConsentApplyPrompt,
}) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      text: "Hello! I am your Artisan Agent. I can see your active studio settings and help you refine descriptions into crisp, isolated vector clipart prompts, suggest style shifts, or plan cohesive visual sets. I will always ask your consent before modifying your prompt.",
      quickTips: [
        "Make my current prompt cleaner for sticker cutlines",
        "Suggest a 4-piece classroom icon set",
        "How do I get better silhouette separation?",
      ],
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const sendMessage = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/clipart/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          activePrompt,
          activeStyle,
          activePalette,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to reach Artisan Agent.");
      }

      const aiMsg: AssistantMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        text:
          data.reply ||
          "Here is a studio recommendation tailored for clean vector silhouette output.",
        proposedPrompt: data.proposedPrompt || "",
        proposedStyle: data.proposedStyle || "",
        quickTips: Array.isArray(data.quickTips) ? data.quickTips : [],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          text: `Studio note: ${err.message || "Unable to connect right now."}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyConsent = (msgId: string, promptToApply: string, styleStr?: string) => {
    const matchedPreset = STYLE_PRESETS.find(
      (s) => s.name.toLowerCase() === (styleStr || "").toLowerCase()
    );
    onConsentApplyPrompt(promptToApply, matchedPreset?.name);
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, applied: true } : m))
    );
  };

  const handleDismissConsent = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, dismissed: true } : m))
    );
  };

  return (
    <aside
      aria-label="Artisan Agent Studio Assistant"
      className="fixed right-4 bottom-4 top-20 z-50 w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 bg-[#FAFAFA] border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Artisan Agent
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Context: {activeStyle} · {activePalette}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          aria-label="Close Artisan Agent"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Active Prompt Context Strip */}
      <div className="px-5 py-2.5 bg-indigo-50/60 border-b border-indigo-100 flex items-center justify-between gap-2 text-xs">
        <span className="text-slate-600 truncate">
          <strong className="font-semibold text-slate-800">Active Prompt:</strong>{" "}
          {activePrompt || "None entered yet"}
        </span>
      </div>

      {/* Messages List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-slate-900 text-white"
                  : "bg-[#FAFAFA] border border-[#E5E7EB] text-slate-800"
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>

              {/* Consent Card for Proposed Prompt Overhaul */}
              {msg.proposedPrompt && !msg.dismissed && (
                <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 mb-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Consent Check: Apply Prompt Upgrade?</span>
                  </div>
                  <p className="text-xs bg-white border border-[#E5E7EB] rounded-lg p-2.5 text-slate-700 font-mono mb-2.5">
                    “{msg.proposedPrompt}”
                  </p>
                  {msg.proposedStyle && (
                    <p className="text-xs text-slate-500 mb-2.5">
                      Suggested Style: <strong className="text-slate-800">{msg.proposedStyle}</strong>
                    </p>
                  )}

                  {msg.applied ? (
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <Check className="w-4 h-4" />
                      <span>Applied to Studio Workspace</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleApplyConsent(
                            msg.id,
                            msg.proposedPrompt!,
                            msg.proposedStyle
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Approve & Apply</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDismissConsent(msg.id)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-[#E5E7EB] text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Keep Current
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Follow-up Suggestions */}
              {msg.quickTips && msg.quickTips.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#E5E7EB] flex flex-wrap gap-1.5">
                  {msg.quickTips.map((tip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => sendMessage(tip)}
                      className="text-left text-xs px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-[#E5E7EB] rounded-md text-slate-600 transition-colors cursor-pointer"
                    >
                      {tip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 px-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Artisan Agent is analyzing your canvas settings...</span>
          </div>
        )}
      </div>

      {/* Input Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="p-4 bg-white border-t border-[#E5E7EB] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for prompt tweaks, style advice, or icon sets..."
          className="flex-1 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer shrink-0"
          aria-label="Send message to Artisan Agent"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </aside>
  );
};
