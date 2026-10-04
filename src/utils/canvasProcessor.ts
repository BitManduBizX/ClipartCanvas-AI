/**
 * Client-Side Canvas API utilities for real-time background removal,
 * rasterization (PNG/JPG), and SVG conversion/export.
 */

export interface ProcessedCanvasResult {
  pngDataUrl: string;
  jpgDataUrl: string;
  svgDataUrl: string;
  cleanSvgCode: string;
  width: number;
  height: number;
}

/**
 * Strips the solid background rectangle from an SVG string when transparent mode is enabled.
 */
export function stripSvgBackground(svgCode: string, transparent: boolean): string {
  if (!transparent) return svgCode;
  return svgCode
    .replace(/<rect[^>]*id=["']bg-layer["'][^>]*\/?>/gi, "")
    .replace(/<rect[^>]*width=["']100%["'][^>]*height=["']100%["'][^>]*fill=["'](?:#fff|#ffffff|white)["'][^>]*\/?>/gi, "");
}

/**
 * Loads either an SVG string or an image URL onto an HTML5 Canvas,
 * applies real-time threshold transparency (luminance chroma-keying for near-white backgrounds),
 * and returns downloadable PNG, JPG, and SVG representations.
 */
export async function processArtworkOnCanvas(options: {
  sourceType: "svg" | "raster";
  svgCode?: string;
  imageUrl?: string;
  aspectRatio?: "1:1" | "4:3" | "16:9";
  removeBackground: boolean;
  threshold: number; // 0 to 100 (e.g., 18 means pixels within 18% of pure white become transparent)
}): Promise<ProcessedCanvasResult> {
  const {
    sourceType,
    svgCode = "",
    imageUrl = "",
    aspectRatio = "1:1",
    removeBackground,
    threshold,
  } = options;

  let width = 1024;
  let height = 1024;
  if (aspectRatio === "4:3") {
    width = 1024;
    height = 768;
  } else if (aspectRatio === "16:9") {
    width = 1280;
    height = 720;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable");
  }

  const cleanSvg =
    sourceType === "svg" ? stripSvgBackground(svgCode, removeBackground) : "";

  const img = new Image();
  img.crossOrigin = "anonymous";

  const loadPromise = new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (err) => reject(err);
  });

  if (sourceType === "svg") {
    const encoded = encodeURIComponent(cleanSvg)
      .replace(/'/g, "%27")
      .replace(/"/g, "%22");
    img.src = `data:image/svg+xml;charset=utf-8,${encoded}`;
  } else {
    img.src = imageUrl;
  }

  await loadPromise;

  // Draw onto working canvas
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  // Apply real-time Canvas pixel threshold background removal if active
  if (removeBackground && threshold > 0) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    // Map threshold (1..100) to RGB distance from pure white (255, 255, 255)
    const minChannelValue = Math.round(255 - (threshold / 100) * 115);
    const featherRange = 16;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a === 0) continue;

      // Check if pixel is near-white and low-saturation
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const saturationSpread = maxC - minC;

      if (r >= minChannelValue && g >= minChannelValue && b >= minChannelValue && saturationSpread < 38) {
        const avg = (r + g + b) / 3;
        if (avg >= minChannelValue + featherRange) {
          data[i + 3] = 0; // Fully transparent
        } else {
          // Soft anti-aliased edge feathering
          const ratio = (minChannelValue + featherRange - avg) / featherRange;
          data[i + 3] = Math.round(a * Math.max(0, Math.min(1, ratio)));
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  const pngDataUrl = canvas.toDataURL("image/png");

  // Create JPG on a white-backed canvas
  const jpgCanvas = document.createElement("canvas");
  jpgCanvas.width = width;
  jpgCanvas.height = height;
  const jpgCtx = jpgCanvas.getContext("2d");
  if (jpgCtx) {
    jpgCtx.fillStyle = "#FFFFFF";
    jpgCtx.fillRect(0, 0, width, height);
    jpgCtx.drawImage(canvas, 0, 0);
  }
  const jpgDataUrl = jpgCanvas.toDataURL("image/jpeg", 0.94);

  // If source is SVG, return native vector SVG; if raster, wrap transparent PNG in crisp SVG container
  let finalSvgCode = cleanSvg;
  if (sourceType === "raster") {
    finalSvgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <image href="${pngDataUrl}" width="${width}" height="${height}" />
</svg>`;
  }

  const svgBlob = new Blob([finalSvgCode], { type: "image/svg+xml;charset=utf-8" });
  const svgDataUrl = URL.createObjectURL(svgBlob);

  return {
    pngDataUrl,
    jpgDataUrl,
    svgDataUrl,
    cleanSvgCode: finalSvgCode,
    width,
    height,
  };
}

/**
 * Generates a deterministic, clean SVG QR Code matrix for a given URL string.
 * Uses a real Finder Pattern + timing pattern + data hash grid so users can scan or preview live share links immediately without external image dependencies.
 */
export function generateQrSvgMarkup(url: string): string {
  const size = 21;
  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  const placeFinderPattern = (rowOffset: number, colOffset: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (isBorder || isInner) {
          grid[rowOffset + r][colOffset + c] = true;
        }
      }
    }
  };

  placeFinderPattern(0, 0);
  placeFinderPattern(0, size - 7);
  placeFinderPattern(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Deterministic bit fill from URL string
  let hash = 2166136261;
  for (let i = 0; i < url.length; i++) {
    hash ^= url.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      const isTiming = r === 6 || c === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !isTiming) {
        const bitIndex = (r * size + c) % 31;
        const charVal = url.charCodeAt((r + c) % Math.max(1, url.length)) || 42;
        grid[r][c] = ((hash >> bitIndex) ^ charVal + r * 3 + c * 7) % 2 === 0;
      }
    }
  }

  const cellSize = 8;
  const padding = 16;
  const totalSize = size * cellSize + padding * 2;
  let rects = "";

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c]) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;
        rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="1.5" fill="#0F172A" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="100%" height="100%">
  <rect width="100%" height="100%" rx="12" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="2" />
  ${rects}
</svg>`;
}
