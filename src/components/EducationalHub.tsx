import React, { useState } from "react";
import {
  ChevronDown,
  Globe2,
  Layers,
  Wand2,
  Download,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  STYLE_PRESETS,
  MULTILINGUAL_HUB_LANGUAGES,
  FAQ_ITEMS,
  StylePreset,
} from "../data/studioPresets";

interface EducationalHubProps {
  onSelectStyleAndPrompt: (
    style: StylePreset["name"],
    prompt: string,
    language?: string
  ) => void;
}

export const EducationalHub: React.FC<EducationalHubProps> = ({
  onSelectStyleAndPrompt,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedLangCode, setSelectedLangCode] = useState<string>("es-ES");

  const activeLangItem =
    MULTILINGUAL_HUB_LANGUAGES.find((l) => l.code === selectedLangCode) ||
    MULTILINGUAL_HUB_LANGUAGES[0];

  const handleLoadIntoStudio = (
    style: StylePreset["name"],
    prompt: string,
    language = "English"
  ) => {
    onSelectStyleAndPrompt(style, prompt, language);
    const el = document.getElementById("studio-workspace");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-24 py-16">
      {/* 1. 3-Step Studio Workflow */}
      <section className="max-w-[1380px] mx-auto px-6">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold text-indigo-600 mb-2">
            01. Studio Architecture & Workflow
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
            From Natural Voice or Text to Transparent Vector Assets in Three Steps
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Built for graphic designers, educators, and marketers who need clean silhouettes without background clutter or watermarks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums mb-4">
                <span>STEP 01</span>
                <span>INPUT & VOICE</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                1. Enter Prompt or Dictate via Voice
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Describe any object, mascot, or diagram in 20+ languages—or tap the studio microphone to dictate ideas hands-free via Web Speech recognition.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E5E7EB] flex items-center gap-2 text-xs text-slate-600">
              <Wand2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Automatic prompt engineering for isolated silhouettes</span>
            </div>
          </div>

          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums mb-4">
                <span>STEP 02</span>
                <span>STYLE & ALPHA</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                2. Generate Variations & Remove Backgrounds
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Create up to 4 simultaneous clipart variations across 8 curated styles. Toggle real-time HTML5 Canvas threshold transparency to strip backgrounds in one click.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E5E7EB] flex items-center gap-2 text-xs text-slate-600">
              <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Adjustable 0–100% luminance chroma-key slider</span>
            </div>
          </div>

          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums mb-4">
                <span>STEP 03</span>
                <span>EXPORT & QR SHARE</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                3. Download SVG / PNG / JPG or Share Live QR
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Export scalable SVG paths, crisp transparent PNGs, or high-res JPGs directly to your device, or generate an instant SVG QR code to send to mobile and social channels.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E5E7EB] flex items-center gap-2 text-xs text-slate-600">
              <Download className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Zero watermarks · Unrestricted commercial & classroom use</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Style Explorer */}
      <section id="style-explorer" className="max-w-[1380px] mx-auto px-6 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-indigo-600 mb-2">
              02. Curated Style Explorer
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
              Eight Purpose-Built Clipart & Vector Aesthetics
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Click any style card below to load its calibrated prompt formula and stroke geometry directly into the Studio Canvas.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono tabular-nums">
            8 PRESETS · 1-CLICK STUDIO LOAD
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STYLE_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="bg-white border border-[#E5E7EB] hover:border-indigo-500 rounded-2xl p-5 flex flex-col justify-between transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    {preset.swatchColors.map((hex, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {preset.id}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {preset.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {preset.tagline}
                </p>
                <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Sample: “{preset.samplePrompt}”
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleLoadIntoStudio(preset.name, preset.samplePrompt)
                }
                className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#FAFAFA] group-hover:bg-indigo-600 text-slate-800 group-hover:text-white border border-[#E5E7EB] group-hover:border-indigo-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Try {preset.name}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Prompt Engineering Guide & Top Tips for Better Clipart */}
      <section id="prompt-guide" className="max-w-[1380px] mx-auto px-6 scroll-mt-20">
        <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-3xl p-8 md:p-10">
          <div className="max-w-2xl mb-8">
            <p className="text-xs font-semibold text-emerald-700 mb-2">
              03. Prompt Engineering Guide & Clipart Best Practices
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
              How to Craft High-Yield Prompts for Clean Silhouette Isolation
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Unlike photographic prompts that ask for cinematic fog or shallow depth-of-field, great clipart prompts focus on contour clarity, singular subjects, and flat lighting.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Golden Rules */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Rule 1: Lead with a Single Isolated Subject + Action
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Instead of describing an entire room or landscape, anchor the prompt on a self-contained object or character (e.g., “A joyful red panda holding a bamboo paintbrush” rather than “A forest scene with animals painting”).
                </p>
              </div>

              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Rule 2: Specify Contour & Stroke Geometry
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Include terms like “bold outer contour”, “uniform monoline stroke”, “flat color planes”, or “die-cut white sticker border”. This guarantees crisp edges when you toggle transparent PNG or SVG export.
                </p>
              </div>

              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Rule 3: Maintain Consistent Visual Sets for Branding & Classroom Packs
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When building a 6-icon set for a presentation or worksheet, keep the Style Preset, Palette Selector, and Line Weight Slider locked while swapping only the subject noun.
                </p>
              </div>
            </div>

            {/* Right: Before vs After Comparison */}
            <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-5">
              <div>
                <div className="text-xs font-mono text-rose-600 mb-1">
                  WEAK PROMPT (CLUTTERED EDGES)
                </div>
                <p className="text-xs text-slate-600 bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-3 font-mono">
                  “A realistic coffee cup on a cafe table with morning sunlight and blurry background”
                </p>
              </div>

              <div>
                <div className="text-xs font-mono text-emerald-700 mb-1">
                  OPTIMIZED CLIPARTCANVAS PROMPT
                </div>
                <p className="text-xs text-slate-800 bg-emerald-50/50 border border-emerald-200 rounded-lg p-3 font-mono">
                  “Artisanal ceramic pour-over coffee dripper with rising steam swirls, clean flat vector clipart, bold geometric silhouette, Indigo & Emerald palette, isolated on solid white background”
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleLoadIntoStudio(
                    "Flat Vector",
                    "Artisanal ceramic pour-over coffee dripper with rising steam swirls and botanical leaves"
                  )
                }
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load Optimized Prompt into Studio</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Multilingual Hub (20+ Languages Interactive Switcher) */}
      <section id="multilingual-hub" className="max-w-[1380px] mx-auto px-6 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold text-indigo-600 mb-2">
              04. Global Multilingual Studio Hub
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
              Create Clipart in 20+ Native Languages with Automatic Visual Translation
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Write or speak in Spanish, Hindi, Arabic, Chinese, Japanese, French, German, Portuguese, or Korean. ClipartCanvas AI translates cultural concepts and idioms into precision English vector instructions automatically.
            </p>

            <div className="mt-6 space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Preserves regional motifs (Diya lamps, Origami, Arabesque lanterns)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Native Web Speech voice dictation language selector</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Side-by-side bilingual prompt transparency</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <Globe2 className="w-4 h-4 text-indigo-600" />
                <span>Select a Language to Preview & Test</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                20+ LANGUAGES SUPPORTED
              </span>
            </div>

            {/* Interactive Language Tabs */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {MULTILINGUAL_HUB_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLangCode(lang.code)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                    selectedLangCode === lang.code
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-[#E5E7EB] hover:border-slate-300"
                  }`}
                >
                  {lang.nativeName} · {lang.language}
                </button>
              ))}
            </div>

            {/* Active Language Preview Card */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Language: <strong className="text-slate-800">{activeLangItem.language}</strong> ({activeLangItem.code})
                </span>
                <span>
                  Recommended Style: <strong className="text-indigo-600">{activeLangItem.recommendedStyle}</strong>
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">Native Prompt Input:</p>
                <p className="text-base font-semibold text-slate-900">
                  “{activeLangItem.samplePrompt}”
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">
                  Automatic English Studio Translation:
                </p>
                <p className="text-xs text-slate-700 font-mono bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-2.5">
                  “{activeLangItem.englishMeaning}”
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleLoadIntoStudio(
                    activeLangItem.recommendedStyle,
                    activeLangItem.samplePrompt,
                    activeLangItem.language
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Test {activeLangItem.language} Prompt in Studio</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Rich Accordion FAQ Section */}
      <section id="faq-hub" className="max-w-[1380px] mx-auto px-6 scroll-mt-20">
        <div className="max-w-2xl mb-8">
          <p className="text-xs font-semibold text-indigo-600 mb-2">
            05. Frequently Asked Questions
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
            Everything You Need to Know About ClipartCanvas AI
          </h2>
        </div>

        <div className="space-y-3 max-w-4xl">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-150 ${
                      isOpen ? "rotate-180 text-indigo-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-[#E5E7EB]/60">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
