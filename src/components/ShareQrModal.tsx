import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Share2,
  QrCode,
  Mail,
  ExternalLink,
  Download,
} from "lucide-react";
import { ClipartVariation } from "../data/studioPresets";
import { generateQrSvgMarkup } from "../utils/canvasProcessor";

interface ShareQrModalProps {
  variation: ClipartVariation | null;
  onClose: () => void;
}

export const ShareQrModal: React.FC<ShareQrModalProps> = ({
  variation,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!variation) return null;

  const baseAppUrl =
    typeof window !== "undefined" ? window.location.origin : "https://clipartcanvas.app";
  const shareUrl = `${baseAppUrl}/?style=${encodeURIComponent(
    variation.style
  )}&prompt=${encodeURIComponent(variation.originalPrompt)}`;

  const shareText = `Check out "${variation.title}" (${variation.style} Clipart) created on ClipartCanvas AI: "${variation.originalPrompt}"`;

  const qrSvgMarkup = generateQrSvgMarkup(shareUrl);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback copy
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleDownloadQrSvg = () => {
    const blob = new Blob([qrSvgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clipartcanvas-qr-${variation.id}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const socialLinks = [
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      colorClass: "hover:border-blue-600 hover:text-blue-700",
    },
    {
      name: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      colorClass: "hover:border-emerald-600 hover:text-emerald-700",
    },
    {
      name: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      colorClass: "hover:border-slate-900 hover:text-slate-900",
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      colorClass: "hover:border-indigo-600 hover:text-indigo-700",
    },
    {
      name: "Pinterest",
      href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareText)}`,
      colorClass: "hover:border-rose-600 hover:text-rose-700",
    },
    {
      name: "Email",
      href: `mailto:?subject=${encodeURIComponent(`ClipartCanvas AI Asset: ${variation.title}`)}&body=${encodeURIComponent(`${shareText}\n\nOpen in Studio: ${shareUrl}`)}`,
      colorClass: "hover:border-amber-600 hover:text-amber-700",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div className="bg-white border border-[#E5E7EB] rounded-2xl max-w-lg w-full p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-indigo-600" />
            <h3 id="share-modal-title" className="text-lg font-bold text-slate-900">
              Share Clipart & Live QR Link
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
            aria-label="Close share dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
          {/* QR Code Box */}
          <div className="sm:col-span-5 flex flex-col items-center bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-4">
            <div
              className="w-36 h-36"
              dangerouslySetInnerHTML={{ __html: qrSvgMarkup }}
            />
            <button
              type="button"
              onClick={handleDownloadQrSvg}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save QR (.SVG)</span>
            </button>
          </div>

          {/* Asset Info & Social Channels */}
          <div className="sm:col-span-7 space-y-4">
            <div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>{variation.style}</span>
                <span aria-hidden="true">·</span>
                <span>{variation.aspectRatio}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                {variation.title}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                Prompt: “{variation.originalPrompt}”
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">
                One-Click Social Channels
              </p>
              <div className="grid grid-cols-2 gap-2">
                {socialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg transition-colors whitespace-nowrap ${item.colorClass}`}
                  >
                    <span>{item.name}</span>
                    {item.name === "Email" ? (
                      <Mail className="w-3.5 h-3.5 opacity-60" />
                    ) : (
                      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Studio Link Copy Bar */}
        <div className="pt-4 border-t border-[#E5E7EB]">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Direct Studio Preset Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
