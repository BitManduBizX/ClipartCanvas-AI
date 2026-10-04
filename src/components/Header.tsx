import React from "react";
import { Sparkles, MessageSquareCode } from "lucide-react";

interface HeaderProps {
  onOpenAssistant: () => void;
  isAssistantOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAssistant,
  isAssistantOpen,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-6 py-3.5">
      <div className="max-w-[1380px] mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#studio-workspace"
          className="text-xl font-extrabold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0"
        >
          ClipartCanvas AI
        </a>

        {/* Zone 2: 5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a
            href="#studio-workspace"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
          >
            Generator Studio
          </a>
          <a
            href="#style-explorer"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
          >
            Style Explorer
          </a>
          <a
            href="#prompt-guide"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
          >
            Prompt Guide
          </a>
          <a
            href="#multilingual-hub"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
          >
            Multilingual Hub
          </a>
          <a
            href="#faq-hub"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
          >
            Studio FAQ
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenAssistant}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
              isAssistantOpen
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-[#FAFAFA] text-slate-800 border-[#E5E7EB] hover:border-slate-300 hover:bg-slate-100"
            }`}
          >
            <MessageSquareCode className="w-4 h-4" />
            <span>Artisan Agent</span>
          </button>

          <a
            href="#studio-workspace"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Clipart</span>
          </a>
        </div>
      </div>
    </header>
  );
};
