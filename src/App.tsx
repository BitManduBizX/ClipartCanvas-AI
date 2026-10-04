import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Sparkles,
  Wand2,
  Download,
  Share2,
  Sliders,
  Eraser,
  Check,
  Loader2,
  RotateCcw,
  Layers,
  Eye,
  Code2,
} from "lucide-react";
import { Header } from "./components/Header";
import { ArtisanAssistant } from "./components/ArtisanAssistant";
import { ShareQrModal } from "./components/ShareQrModal";
import { EducationalHub } from "./components/EducationalHub";
import {
  STYLE_PRESETS,
  PALETTE_OPTIONS,
  MULTILINGUAL_HUB_LANGUAGES,
  INITIAL_SHOWCASE_VARIATIONS,
  ClipartVariation,
  StylePreset,
} from "./data/studioPresets";
import {
  processArtworkOnCanvas,
  ProcessedCanvasResult,
} from "./utils/canvasProcessor";

export default function App() {
  // Studio Controls State
  const [prompt, setPrompt] = useState<string>(
    "Botanical monstera and fern leaf in an artisanal terracotta pot"
  );
  const [selectedStyle, setSelectedStyle] =
    useState<StylePreset["name"]>("Flat Vector");
  const [selectedPalette, setSelectedPalette] = useState<string>(
    PALETTE_OPTIONS[0].name
  );
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:3" | "16:9">("1:1");
  const [lineWeight, setLineWeight] = useState<number>(2.5);
  const [variationCount, setVariationCount] = useState<number>(2);
  const [inputLanguage, setInputLanguage] = useState<string>("English");

  // Voice Recognition State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceStatus, setVoiceStatus] = useState<string>("");
  const recognitionRef = useRef<any>(null);

  // Canvas Background Removal & Transparency State
  const [removeBackground, setRemoveBackground] = useState<boolean>(true);
  const [bgThreshold, setBgThreshold] = useState<number>(18);
  const [showSvgSource, setShowSvgSource] = useState<boolean>(false);

  // Variations Gallery & Active Selection State
  const [variations, setVariations] = useState<ClipartVariation[]>(
    INITIAL_SHOWCASE_VARIATIONS
  );
  const [activeVariationId, setActiveVariationId] = useState<string>(
    INITIAL_SHOWCASE_VARIATIONS[0].id
  );
  const [processedResult, setProcessedResult] =
    useState<ProcessedCanvasResult | null>(null);
  const [isProcessingCanvas, setIsProcessingCanvas] = useState<boolean>(false);

  // Generation & Optimization Status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [studioBannerNote, setStudioBannerNote] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Pending Prompt Optimization Consent State (when user clicks "Optimize Prompt")
  const [pendingOptimization, setPendingOptimization] = useState<{
    optimizedPrompt: string;
    suggestedStyle?: StylePreset["name"];
    rationale: string;
  } | null>(null);

  // Assistant & Share Modal State
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [shareTarget, setShareTarget] = useState<ClipartVariation | null>(null);

  const activeVariation =
    variations.find((v) => v.id === activeVariationId) || variations[0];

  // Parse URL query parameters on initial load (supports shared QR live links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedPrompt = params.get("prompt");
    const sharedStyle = params.get("style");
    if (sharedPrompt) {
      setPrompt(sharedPrompt);
    }
    if (sharedStyle) {
      const matched = STYLE_PRESETS.find(
        (s) => s.name.toLowerCase() === sharedStyle.toLowerCase()
      );
      if (matched) setSelectedStyle(matched.name);
    }
  }, []);

  // Re-run client-side Canvas background remover & format processor whenever active variation or transparency changes
  useEffect(() => {
    let cancelled = false;
    if (!activeVariation) return;

    setIsProcessingCanvas(true);
    processArtworkOnCanvas({
      sourceType: activeVariation.sourceType,
      svgCode: activeVariation.svgCode,
      imageUrl: activeVariation.imageUrl,
      aspectRatio: activeVariation.aspectRatio,
      removeBackground,
      threshold: bgThreshold,
    })
      .then((res) => {
        if (!cancelled) {
          setProcessedResult(res);
          setIsProcessingCanvas(false);
        }
      })
      .catch((err) => {
        console.error("Canvas processing warning:", err);
        if (!cancelled) {
          setIsProcessingCanvas(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeVariation, removeBackground, bgThreshold]);

  // Voice-to-Text Dictation Handler (Web Speech API)
  const handleToggleVoice = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setVoiceStatus("");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        "Voice dictation is not supported in this browser. Please type your clipart description directly."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langObj = MULTILINGUAL_HUB_LANGUAGES.find(
        (l) => l.language === inputLanguage
      );
      recognition.lang = langObj ? langObj.code : "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus(`Listening in ${inputLanguage}...`);
        setErrorMessage("");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setPrompt(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceStatus("");
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceStatus("");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceStatus("");
    }
  };

  // Optimize Prompt with User Consent Card
  const handleRequestOptimizePrompt = async () => {
    if (!prompt.trim() || isOptimizing) return;
    setIsOptimizing(true);
    setErrorMessage("");
    setPendingOptimization(null);

    try {
      const response = await fetch("/api/clipart/optimize-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: selectedStyle,
          language: inputLanguage,
          palette: selectedPalette,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not optimize prompt.");
      }

      const matchedStyle = STYLE_PRESETS.find(
        (s) => s.name.toLowerCase() === (data.suggestedStyle || "").toLowerCase()
      );

      setPendingOptimization({
        optimizedPrompt: data.optimizedPrompt,
        suggestedStyle: matchedStyle?.name,
        rationale:
          data.rationale ||
          "Refined for clean silhouette isolation and crisp vector boundaries.",
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Prompt optimization failed.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Generate Clipart Variations (2-4 Variations Simultaneously)
  const handleGenerateClipart = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage("");
    setStudioBannerNote("");

    try {
      const response = await fetch("/api/clipart/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: selectedStyle,
          palette: selectedPalette,
          aspectRatio,
          lineWeight,
          language: inputLanguage,
          variationCount,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate clipart variations.");
      }

      if (!Array.isArray(data.variations) || data.variations.length === 0) {
        throw new Error("No clipart variations returned. Please try another description.");
      }

      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const newItems: ClipartVariation[] = data.variations.map(
        (v: any, idx: number) => ({
          id: `gen-${Date.now()}-${idx}`,
          title: v.title || `${selectedStyle} Variation ${idx + 1}`,
          caption:
            v.caption ||
            `Generated in ${selectedStyle} style using ${selectedPalette} palette.`,
          style: selectedStyle,
          palette: selectedPalette,
          aspectRatio,
          sourceType: "svg",
          svgCode: v.svgCode,
          dominantColors:
            Array.isArray(v.dominantColors) && v.dominantColors.length > 0
              ? v.dominantColors
              : PALETTE_OPTIONS.find((p) => p.name === selectedPalette)?.colors.slice(0, 4) || [
                  "#4F46E5",
                  "#10B981",
                ],
          originalPrompt: prompt.trim(),
          optimizedPrompt: data.optimizedPrompt || prompt.trim(),
          language: data.detectedLanguage || inputLanguage,
          createdAt: timestamp,
        })
      );

      setVariations((prev) => [...newItems, ...prev]);
      setActiveVariationId(newItems[0].id);
      if (data.styleNotes) {
        setStudioBannerNote(data.styleNotes);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "An error occurred while generating your clipart."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Multi-Format Download Trigger (PNG, JPG, SVG)
  const handleDownloadAsset = (format: "png" | "jpg" | "svg") => {
    if (!processedResult || !activeVariation) return;

    const safeSlug = activeVariation.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const link = document.createElement("a");
    if (format === "png") {
      link.href = processedResult.pngDataUrl;
      link.download = `${safeSlug || "clipart"}-transparent.png`;
    } else if (format === "jpg") {
      link.href = processedResult.jpgDataUrl;
      link.download = `${safeSlug || "clipart"}-studio.jpg`;
    } else {
      const svgBlob = new Blob([processedResult.cleanSvgCode], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);
      link.href = url;
      link.download = `${safeSlug || "clipart"}-vector.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-slate-900">
      {/* Top Bar Contract Header */}
      <Header
        onOpenAssistant={() => setIsAssistantOpen((prev) => !prev)}
        isAssistantOpen={isAssistantOpen}
      />

      {/* Main Studio Workspace */}
      <main className="flex-1">
        {/* Studio Hero & Workspace Header */}
        <section
          id="studio-workspace"
          className="border-b border-[#E5E7EB] bg-[#FAFAFA]/60 pt-8 pb-14 scroll-mt-16"
        >
          <div className="max-w-[1380px] mx-auto px-6">
            {/* Compact Studio Intro Row */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
              <div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mb-2">
                  <span>Infinite Vector & Clipart Studio</span>
                  <span aria-hidden="true">·</span>
                  <span>Client-Side Alpha Transparency</span>
                  <span aria-hidden="true">·</span>
                  <span>PNG / JPG / SVG Export</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
                  Your Infinite Canvas for Clean, Free AI Clipart Generation
                </h1>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600 font-mono tabular-nums shrink-0">
                <span>VARIATIONS: {variations.length}</span>
                <span aria-hidden="true">·</span>
                <span>ASPECT: {aspectRatio}</span>
                <span aria-hidden="true">·</span>
                <span>STROKE: {lineWeight.toFixed(1)}px</span>
              </div>
            </div>

            {/* 12-Column Interactive Studio Canvas Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT PANEL (5 Cols): Prompt Input, Voice Dictation, Style Presets & Customization */}
              <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-6">
                <form onSubmit={handleGenerateClipart} className="space-y-6">
                  {/* 1. Dual-Mode Prompt Input (Rich Textarea + Voice-to-Text + Language) */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <label
                        htmlFor="clipart-prompt-input"
                        className="text-xs font-bold text-slate-900"
                      >
                        Clipart Subject & Visual Description
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          aria-label="Prompt Input Language"
                          value={inputLanguage}
                          onChange={(e) => setInputLanguage(e.target.value)}
                          className="text-xs bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
                        >
                          {MULTILINGUAL_HUB_LANGUAGES.map((l) => (
                            <option key={l.code} value={l.language}>
                              {l.language} ({l.nativeName})
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={handleToggleVoice}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                            isListening
                              ? "bg-rose-600 text-white border-rose-600"
                              : "bg-[#FAFAFA] text-slate-700 border-[#E5E7EB] hover:border-slate-300"
                          }`}
                          title="Dictate prompt with Voice-to-Text"
                        >
                          {isListening ? (
                            <>
                              <MicOff className="w-3.5 h-3.5" />
                              <span>Stop Voice</span>
                            </>
                          ) : (
                            <>
                              <Mic className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Voice Input</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        id="clipart-prompt-input"
                        rows={3}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe an isolated object, mascot, botanical leaf, or classroom sticker..."
                        className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors resize-none"
                      />
                    </div>

                    {voiceStatus && (
                      <p className="text-xs text-rose-600 font-medium mt-1.5">
                        {voiceStatus}
                      </p>
                    )}

                    {/* Quick Prompt Optimizer & Sample Loader */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={handleRequestOptimizePrompt}
                        disabled={isOptimizing || !prompt.trim()}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {isOptimizing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Wand2 className="w-3.5 h-3.5" />
                        )}
                        <span>Optimize Prompt with AI</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const currentPreset =
                            STYLE_PRESETS.find((s) => s.name === selectedStyle) ||
                            STYLE_PRESETS[0];
                          setPrompt(currentPreset.samplePrompt);
                        }}
                        className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2 cursor-pointer whitespace-nowrap"
                      >
                        Load {selectedStyle} Sample
                      </button>
                    </div>

                    {/* User Consent Banner for Prompt Overhaul */}
                    {pendingOptimization && (
                      <div className="mt-3 bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-950">
                            Proposed Studio Prompt Overhaul (Consent Check)
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-800 bg-white border border-indigo-100 rounded-lg p-2.5">
                          “{pendingOptimization.optimizedPrompt}”
                        </p>
                        <p className="text-xs text-slate-600">
                          {pendingOptimization.rationale}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setPrompt(pendingOptimization.optimizedPrompt);
                              if (pendingOptimization.suggestedStyle) {
                                setSelectedStyle(
                                  pendingOptimization.suggestedStyle
                                );
                              }
                              setPendingOptimization(null);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Apply Optimized Prompt</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingOptimization(null)}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-[#E5E7EB] text-xs font-medium rounded-lg transition-colors cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Smart Style Presets (1-Click Toggles - 8 Presets) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900">
                        Smart Style Presets (1-Click Toggle)
                      </span>
                      <span className="text-xs text-slate-500">
                        {selectedStyle}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {STYLE_PRESETS.map((preset) => {
                        const isActive = selectedStyle === preset.name;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setSelectedStyle(preset.name)}
                            className={`px-3 py-2 rounded-xl border text-left transition-colors cursor-pointer ${
                              isActive
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-[#FAFAFA] text-slate-700 border-[#E5E7EB] hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              {preset.swatchColors.map((hex, i) => (
                                <span
                                  key={i}
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: hex }}
                                />
                              ))}
                            </div>
                            <div className="text-xs font-semibold truncate">
                              {preset.name}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Studio Color Palette Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-2">
                      Color Palette Harmony
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {PALETTE_OPTIONS.map((pal) => {
                        const isSelected = selectedPalette === pal.name;
                        return (
                          <button
                            key={pal.id}
                            type="button"
                            onClick={() => setSelectedPalette(pal.name)}
                            className={`flex items-center justify-between px-3.5 py-2 rounded-xl border text-left transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-indigo-50/70 border-indigo-600 text-slate-900"
                                : "bg-[#FAFAFA] border-[#E5E7EB] text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <span className="text-xs font-semibold truncate">
                              {pal.name}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              {pal.colors.map((c, idx) => (
                                <span
                                  key={idx}
                                  className="w-3.5 h-3.5 rounded-full border border-black/10"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Aspect Ratio, Line Weight Slider & Batch Count */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5E7EB]">
                    {/* Aspect Ratio Toggle */}
                    <div>
                      <span className="block text-xs font-bold text-slate-900 mb-1.5">
                        Aspect Ratio
                      </span>
                      <div className="flex items-center gap-1 p-1 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl">
                        {(["1:1", "4:3", "16:9"] as const).map((ratio) => (
                          <button
                            key={ratio}
                            type="button"
                            onClick={() => setAspectRatio(ratio)}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                              aspectRatio === ratio
                                ? "bg-white text-slate-900 shadow-xs border border-[#E5E7EB]"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Multi-Variation Count Selector */}
                    <div>
                      <span className="block text-xs font-bold text-slate-900 mb-1.5">
                        Simultaneous Variations
                      </span>
                      <div className="flex items-center gap-1 p-1 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl">
                        {[2, 3, 4].map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => setVariationCount(count)}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer font-mono tabular-nums whitespace-nowrap ${
                              variationCount === count
                                ? "bg-white text-slate-900 shadow-xs border border-[#E5E7EB]"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {count}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Line Weight Slider */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <label
                        htmlFor="line-weight-slider"
                        className="font-bold text-slate-900 flex items-center gap-1.5"
                      >
                        <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Vector Line Weight & Contour Scale</span>
                      </label>
                      <span className="font-mono tabular-nums text-slate-600">
                        {lineWeight.toFixed(1)}px
                      </span>
                    </div>
                    <input
                      id="line-weight-slider"
                      type="range"
                      min={1}
                      max={6}
                      step={0.5}
                      value={lineWeight}
                      onChange={(e) => setLineWeight( parseFloat(e.target.value) )}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                      {errorMessage}
                    </div>
                  )}

                  {/* Primary Generate CTA */}
                  <button
                    type="submit"
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>
                          Generating {variationCount} Studio Clipart Variations...
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>
                          Generate {variationCount} Clipart Variations
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* RIGHT PANEL (7 Cols): Interactive Canvas Viewport, Background Remover, Export & Variations Grid */}
              <div className="lg:col-span-7 space-y-6">
                {/* Active Canvas Inspection Stage */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                  {/* Stage Top Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{activeVariation.style}</span>
                        <span aria-hidden="true">·</span>
                        <span>{activeVariation.palette}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {activeVariation.aspectRatio}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                        {activeVariation.title}
                      </h2>
                    </div>

                    {/* Transparency & Source Toggle Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRemoveBackground((prev) => !prev)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                          removeBackground
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-[#FAFAFA] text-slate-700 border-[#E5E7EB] hover:border-slate-300"
                        }`}
                      >
                        <Eraser className="w-3.5 h-3.5" />
                        <span>
                          {removeBackground
                            ? "Transparent PNG Mode: ON"
                            : "Remove Background"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowSvgSource((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAFAFA] hover:bg-slate-100 text-slate-700 border border-[#E5E7EB] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {showSvgSource ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Canvas</span>
                          </>
                        ) : (
                          <>
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Inspect SVG</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShareTarget(activeVariation)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAFAFA] hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-[#E5E7EB] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share / QR</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive Canvas Stage Frame */}
                  <div
                    className={`my-5 relative rounded-2xl border border-[#E5E7EB] overflow-hidden flex items-center justify-center min-h-[380px] sm:min-h-[420px] ${
                      removeBackground ? "bg-checkerboard" : "bg-[#FFFFFF]"
                    }`}
                  >
                    {showSvgSource && processedResult ? (
                      <div className="w-full h-[380px] p-4 bg-slate-950 text-emerald-300 font-mono text-xs overflow-auto">
                        <pre className="whitespace-pre-wrap break-all">
                          {processedResult.cleanSvgCode}
                        </pre>
                      </div>
                    ) : processedResult ? (
                      <img
                        src={
                          removeBackground
                            ? processedResult.pngDataUrl
                            : processedResult.jpgDataUrl
                        }
                        alt={activeVariation.title}
                        referrerPolicy="no-referrer"
                        className="max-h-[380px] w-auto object-contain transition-opacity duration-150 p-4"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-xs text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                        <span>Rendering high-resolution studio canvas...</span>
                      </div>
                    )}

                    {/* Dominant Color Swatches Overlay in Bottom-Left */}
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-slate-500 mr-1">
                        Swatches
                      </span>
                      {activeVariation.dominantColors.map((hex, idx) => (
                        <span
                          key={idx}
                          className="w-3.5 h-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>

                    {isProcessingCanvas && (
                      <div className="absolute top-3 right-3 bg-white/90 border border-[#E5E7EB] rounded-lg px-2.5 py-1 text-xs text-slate-600 flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        <span>Updating alpha...</span>
                      </div>
                    )}
                  </div>

                  {/* Background Remover Threshold Bar + Multi-Format Export Buttons */}
                  <div className="pt-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Threshold Slider */}
                    <div className="flex items-center gap-3 flex-1 max-w-xs">
                      <label
                        htmlFor="bg-threshold-slider"
                        className="text-xs font-semibold text-slate-700 whitespace-nowrap"
                      >
                        Alpha Tolerance:
                      </label>
                      <input
                        id="bg-threshold-slider"
                        type="range"
                        min={0}
                        max={85}
                        value={bgThreshold}
                        disabled={!removeBackground}
                        onChange={(e) =>
                          setBgThreshold(parseInt(e.target.value, 10))
                        }
                        className="w-full accent-emerald-600 cursor-pointer disabled:opacity-40"
                      />
                      <span className="text-xs font-mono tabular-nums text-slate-600 w-9 text-right">
                        {bgThreshold}%
                      </span>
                    </div>

                    {/* Multi-Format Download Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadAsset("png")}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PNG</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadAsset("svg")}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Vector SVG</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadAsset("jpg")}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FAFAFA] hover:bg-slate-100 text-slate-700 border border-[#E5E7EB] text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Save JPG</span>
                      </button>
                    </div>
                  </div>

                  {studioBannerNote && (
                    <div className="mt-4 pt-3 border-t border-[#E5E7EB] text-xs text-slate-600">
                      <strong className="text-slate-900">Studio Note:</strong>{" "}
                      {studioBannerNote}
                    </div>
                  )}
                </div>

                {/* Multi-Variation Output Gallery Strip */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Studio Variations & Clipart Library
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setVariations(INITIAL_SHOWCASE_VARIATIONS);
                        setActiveVariationId(INITIAL_SHOWCASE_VARIATIONS[0].id);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Showcase</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {variations.map((item) => {
                      const isSelected = item.id === activeVariation.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setActiveVariationId(item.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              setActiveVariationId(item.id);
                            }
                          }}
                          className={`group rounded-xl border p-3 transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-600/20"
                              : "border-[#E5E7EB] bg-[#FAFAFA] hover:border-slate-300"
                          }`}
                        >
                          <div className="aspect-square rounded-lg bg-white border border-[#E5E7EB] overflow-hidden flex items-center justify-center p-2 mb-2.5">
                            {item.sourceType === "svg" && item.svgCode ? (
                              <div
                                className="w-full h-full flex items-center justify-center"
                                dangerouslySetInnerHTML={{
                                  __html: item.svgCode,
                                }}
                              />
                            ) : (
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>

                          <div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {item.style} · {item.createdAt}
                            </div>
                            <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
                              {item.title}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Scroll-Down Comprehensive Educational Content, Style Explorer, Multilingual Hub & FAQs */}
        <EducationalHub
          onSelectStyleAndPrompt={(style, newPrompt, language) => {
            setSelectedStyle(style);
            setPrompt(newPrompt);
            if (language) {
              setInputLanguage(language);
            }
          }}
        />
      </main>

      {/* Embedded Omnipresent Artisan Agent Drawer */}
      <ArtisanAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        activePrompt={prompt}
        activeStyle={selectedStyle}
        activePalette={selectedPalette}
        onConsentApplyPrompt={(newPrompt, newStyle) => {
          setPrompt(newPrompt);
          if (newStyle) {
            setSelectedStyle(newStyle);
          }
        }}
      />

      {/* Social Share & Live QR Code Modal */}
      <ShareQrModal
        variation={shareTarget}
        onClose={() => setShareTarget(null)}
      />

      {/* Quiet Studio Footer */}
      <footer className="border-t border-[#E5E7EB] bg-[#FAFAFA] py-10 px-6">
        <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-slate-900 text-sm">
              ClipartCanvas AI
            </span>
            <span aria-hidden="true">·</span>
            <span>Infinite Studio Room for Unrestricted Vector & Clipart Creation</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#studio-workspace" className="hover:text-slate-900 transition-colors">
              Generator Studio
            </a>
            <a href="#style-explorer" className="hover:text-slate-900 transition-colors">
              Style Explorer
            </a>
            <a href="#prompt-guide" className="hover:text-slate-900 transition-colors">
              Prompt Guide
            </a>
            <a href="#multilingual-hub" className="hover:text-slate-900 transition-colors">
              Multilingual Hub
            </a>
            <a href="#faq-hub" className="hover:text-slate-900 transition-colors">
              FAQ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
