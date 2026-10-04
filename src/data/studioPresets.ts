export interface ClipartVariation {
  id: string;
  title: string;
  caption: string;
  style: string;
  palette: string;
  aspectRatio: "1:1" | "4:3" | "16:9";
  sourceType: "svg" | "raster";
  svgCode?: string;
  imageUrl?: string;
  dominantColors: string[];
  originalPrompt: string;
  optimizedPrompt: string;
  language: string;
  createdAt: string;
}

export interface StylePreset {
  id: string;
  name:
    | "Flat Vector"
    | "Outline Line-Art"
    | "Kawaii/Cartoon"
    | "Doodle"
    | "Minimalist"
    | "Colored Illustration"
    | "Watercolor"
    | "Sticker/Die-Cut";
  tagline: string;
  promptSuffix: string;
  samplePrompt: string;
  swatchColors: [string, string, string];
}

export interface PaletteOption {
  id: string;
  name: string;
  colors: string[];
  description: string;
}

export interface MultilingualPromptExample {
  code: string;
  language: string;
  nativeName: string;
  samplePrompt: string;
  englishMeaning: string;
  recommendedStyle: StylePreset["name"];
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "flat-vector",
    name: "Flat Vector",
    tagline: "Crisp geometric planes & balanced negative space",
    promptSuffix: "clean flat vector illustration, isolated on solid white background, sharp edges, zero gradients",
    samplePrompt: "Artisanal ceramic pour-over coffee dripper with rising steam and botanical leaves",
    swatchColors: ["#4F46E5", "#10B981", "#F59E0B"],
  },
  {
    id: "outline-line-art",
    name: "Outline Line-Art",
    tagline: "Monoline architectural & editorial ink strokes",
    promptSuffix: "minimalist monoline vector line-art, uniform stroke weight, isolated on pure white background",
    samplePrompt: "Vintage brass astronomical telescope with celestial stars and crescent moon",
    swatchColors: ["#0F172A", "#6366F1", "#94A3B8"],
  },
  {
    id: "kawaii-cartoon",
    name: "Kawaii/Cartoon",
    tagline: "Expressive character charm with bold ink outlines",
    promptSuffix: "cute kawaii cartoon vector clipart, bold dark outlines, joyful expression, pastel accents, white background",
    samplePrompt: "Happy little astronaut cat floating with a golden star and planet ring",
    swatchColors: ["#EC4899", "#8B5CF6", "#FBBF24"],
  },
  {
    id: "doodle",
    name: "Doodle",
    tagline: "Playful hand-sketched curves & offset fills",
    promptSuffix: "hand-drawn studio doodle illustration, organic ink lines with offset color fills, white background",
    samplePrompt: "Creative designer desk essentials: fountain pen, sketchbook, eyeglasses, and matcha cup",
    swatchColors: ["#F97316", "#06B6D4", "#1E293B"],
  },
  {
    id: "minimalist",
    name: "Minimalist",
    tagline: "Essential Bauhaus geometry & iconic clarity",
    promptSuffix: "ultra-minimalist geometric symbol clipart, iconic silhouette, maximum negative space, white background",
    samplePrompt: "Geometric origami crane mid-flight with balanced sun disc",
    swatchColors: ["#1E293B", "#EF4444", "#E2E8F0"],
  },
  {
    id: "colored-illustration",
    name: "Colored Illustration",
    tagline: "Multi-layered editorial spot artwork",
    promptSuffix: "rich editorial colored vector spot illustration, layered highlights, isolated on white background",
    samplePrompt: "Retro rangefinder camera with geometric lens reflections and strap",
    swatchColors: ["#3B82F6", "#10B981", "#F43F5E"],
  },
  {
    id: "watercolor",
    name: "Watercolor",
    tagline: "Soft translucent botanical & storybook washes",
    promptSuffix: "artisanal watercolor clipart with crisp isolated silhouette edges on pure white background",
    samplePrompt: "Clever autumn red fox sitting peacefully beside woodland acorns and fern leaves",
    swatchColors: ["#EA580C", "#16A34A", "#FDE047"],
  },
  {
    id: "sticker-die-cut",
    name: "Sticker/Die-Cut",
    tagline: "Thick white vinyl contour ready for peel-and-pack",
    promptSuffix: "die-cut vinyl sticker clipart with thick white contour border, crisp vector colors, isolated on white",
    samplePrompt: "Smiling retro skateboard with lightning bolt wings and checker pattern",
    swatchColors: ["#6366F1", "#EC4899", "#10B981"],
  },
];

export const PALETTE_OPTIONS: PaletteOption[] = [
  {
    id: "indigo-emerald",
    name: "Indigo & Emerald Studio",
    colors: ["#4F46E5", "#10B981", "#F59E0B", "#0F172A", "#EEF2FF"],
    description: "Signature crisp editorial indigo with botanical emerald accents",
  },
  {
    id: "nordic-terracotta",
    name: "Warm Ceramic & Sage",
    colors: ["#D97706", "#059669", "#78350F", "#FDE68A", "#FEF3C7"],
    description: "Earthy studio tones for lifestyle, food, and botanical assets",
  },
  {
    id: "pastel-kawaii",
    name: "Soft Pastel Pop",
    colors: ["#F472B6", "#A78BFA", "#38BDF8", "#FBBF24", "#1E293B"],
    description: "Playful classroom, sticker pack, and character design palette",
  },
  {
    id: "monochrome-ink",
    name: "Archival Ink & Cobalt",
    colors: ["#0F172A", "#2563EB", "#64748B", "#CBD5E1", "#F8FAFC"],
    description: "High-contrast technical, SaaS documentation, and icon systems",
  },
  {
    id: "vibrant-citrus",
    name: "Electric Risograph",
    colors: ["#EF4444", "#3B82F6", "#EAB308", "#10B981", "#111827"],
    description: "Punchy print-inspired primary hues for posters and social graphics",
  },
];

export const MULTILINGUAL_HUB_LANGUAGES: MultilingualPromptExample[] = [
  {
    code: "en-US",
    language: "English",
    nativeName: "English",
    samplePrompt: "Botanical monstera and fern leaf in a minimalist ceramic pot",
    englishMeaning: "Botanical monstera and fern leaf in a minimalist ceramic pot",
    recommendedStyle: "Flat Vector",
  },
  {
    code: "es-ES",
    language: "Spanish",
    nativeName: "Español",
    samplePrompt: "Un pequeño zorro rojo de acuarela sentado junto a hojas de otoño",
    englishMeaning: "A small watercolor red fox sitting next to autumn leaves",
    recommendedStyle: "Watercolor",
  },
  {
    code: "hi-IN",
    language: "Hindi",
    nativeName: "हिन्दी",
    samplePrompt: "पारंपरिक मोर पंख और दीया का स्वच्छ फ्लैट वेक्टर चित्रण",
    englishMeaning: "Clean flat vector illustration of a traditional peacock feather and diya lamp",
    recommendedStyle: "Flat Vector",
  },
  {
    code: "ar-SA",
    language: "Arabic",
    nativeName: "العربية",
    samplePrompt: "فانوس هندسي عربي تقليدي مع نجوم ذهبية بأسلوب الرسم الخطي",
    englishMeaning: "Traditional geometric Arabian lantern with golden stars in line-art style",
    recommendedStyle: "Outline Line-Art",
  },
  {
    code: "zh-CN",
    language: "Chinese",
    nativeName: "中文",
    samplePrompt: "可爱卡通风格的宇航员小猫咪抱着一颗金色星星，贴纸剪贴画",
    englishMeaning: "Cute cartoon style astronaut kitten holding a golden star, sticker clipart",
    recommendedStyle: "Kawaii/Cartoon",
  },
  {
    code: "ja-JP",
    language: "Japanese",
    nativeName: "日本語",
    samplePrompt: "抹茶碗と桜の花びらのミニマリストなフラットベクターイラスト",
    englishMeaning: "Minimalist flat vector illustration of a matcha bowl and cherry blossom petals",
    recommendedStyle: "Minimalist",
  },
  {
    code: "fr-FR",
    language: "French",
    nativeName: "Français",
    samplePrompt: "Appareil photo rétro télémétrique avec des formes géométriques épurées",
    englishMeaning: "Retro rangefinder camera with clean geometric shapes",
    recommendedStyle: "Colored Illustration",
  },
  {
    code: "de-DE",
    language: "German",
    nativeName: "Deutsch",
    samplePrompt: "Handgezeichnete Skizze eines Fahrrads mit Blumenkorb im Doodle-Stil",
    englishMeaning: "Hand-drawn sketch of a bicycle with a flower basket in doodle style",
    recommendedStyle: "Doodle",
  },
  {
    code: "pt-BR",
    language: "Portuguese",
    nativeName: "Português",
    samplePrompt: "Tucano tropical colorido em estilo adesivo die-cut com borda branca",
    englishMeaning: "Colorful tropical toucan in die-cut sticker style with white border",
    recommendedStyle: "Sticker/Die-Cut",
  },
  {
    code: "ko-KR",
    language: "Korean",
    nativeName: "한국어",
    samplePrompt: "귀여운 다람쥐가 도토리를 들고 있는 카와이 스티커 일러스트",
    englishMeaning: "Kawaii sticker illustration of a cute squirrel holding an acorn",
    recommendedStyle: "Kawaii/Cartoon",
  },
];

export const INITIAL_SHOWCASE_VARIATIONS: ClipartVariation[] = [
  {
    id: "showcase-botanical-1",
    title: "Monstera & Terracotta Vessel",
    caption: "Crisp flat vector botanical study with layered emerald fronds and clean silhouette isolation.",
    style: "Flat Vector",
    palette: "Indigo & Emerald Studio",
    aspectRatio: "1:1",
    sourceType: "raster",
    imageUrl: "/src/assets/images/clipart_botanical_fern_1791091572693.jpg",
    dominantColors: ["#10B981", "#047857", "#D97706", "#4F46E5"],
    originalPrompt: "Botanical monstera and fern leaf in an artisanal terracotta pot",
    optimizedPrompt: "Clean flat vector clipart illustration of a tropical monstera and botanical fern leaf in an artisanal terracotta pot, isolated on a pure crisp white background, sharp vector edges",
    language: "English",
    createdAt: "Studio Preset",
  },
  {
    id: "showcase-kawaii-2",
    title: "Starlight Astronaut Cat",
    caption: "Die-cut character clipart with bold ink contours, pastel helmet visor, and floating star.",
    style: "Kawaii/Cartoon",
    palette: "Soft Pastel Pop",
    aspectRatio: "1:1",
    sourceType: "raster",
    imageUrl: "/src/assets/images/clipart_kawaii_astronaut_1791091584961.jpg",
    dominantColors: ["#6366F1", "#F472B6", "#FBBF24", "#1E293B"],
    originalPrompt: "Happy little astronaut cat floating with a golden star",
    optimizedPrompt: "Cute kawaii cartoon clipart illustration of a joyful little astronaut cat floating with a small golden star, thick clean vector outlines, pastel indigo and coral color palette, isolated on a pure solid white background",
    language: "English",
    createdAt: "Studio Preset",
  },
  {
    id: "showcase-camera-3",
    title: "Rangefinder Optic Icon",
    caption: "Geometric spot illustration with precision line-weight hierarchy and retro机身 accents.",
    style: "Colored Illustration",
    palette: "Archival Ink & Cobalt",
    aspectRatio: "1:1",
    sourceType: "raster",
    imageUrl: "/src/assets/images/clipart_vintage_camera_1791091595743.jpg",
    dominantColors: ["#0F172A", "#3B82F6", "#EF4444", "#E2E8F0"],
    originalPrompt: "Retro rangefinder camera with clean geometric shapes",
    optimizedPrompt: "Minimalist line-art and colored vector clipart of a retro rangefinder camera with clean geometric shapes, subtle halftone accent, isolated on a pure solid white background",
    language: "English",
    createdAt: "Studio Preset",
  },
  {
    id: "showcase-fox-4",
    title: "Woodland Watercolor Fox",
    caption: "Soft storybook wash with clean outer silhouette boundaries ready for transparent extraction.",
    style: "Watercolor",
    palette: "Warm Ceramic & Sage",
    aspectRatio: "1:1",
    sourceType: "raster",
    imageUrl: "/src/assets/images/clipart_watercolor_fox_1791091607257.jpg",
    dominantColors: ["#EA580C", "#F97316", "#FEF3C7", "#1E293B"],
    originalPrompt: "Clever autumn red fox sitting peacefully",
    optimizedPrompt: "Artisanal watercolor clipart of a clever autumn red fox sitting peacefully, soft expressive brush strokes with clean defined silhouette edges, isolated on a pure solid white background",
    language: "English",
    createdAt: "Studio Preset",
  },
];

export const FAQ_ITEMS = [
  {
    question: "What is AI Clipart, and how is ClipartCanvas AI different from standard photo generators?",
    answer:
      "Traditional image generators often produce cluttered backgrounds, photorealistic noise, and muddy edges that are difficult to place inside presentations, worksheets, or brand layouts. ClipartCanvas AI is purpose-engineered for isolated silhouettes, crisp vector paths, clean white backgrounds, and 1-click alpha transparency so every asset drops seamlessly into slides, Canva, Figma, or print documents.",
  },
  {
    question: "How does the 1-Click Canvas Background Remover work without server fees?",
    answer:
      "ClipartCanvas AI processes transparency directly in your browser using the HTML5 2D Canvas API and SVG DOM layer stripping. For native vector outputs, we strip the backing layer for mathematically pure alpha channels. For rasterized illustrations, our real-time luminance & saturation chroma-key algorithm removes white and near-white pixels with anti-aliased edge feathering—adjustable from 0% to 100% tolerance.",
  },
  {
    question: "What aspect ratios and download formats are supported?",
    answer:
      "You can generate and export artwork in 1:1 Square (1024×1024), 4:3 Editorial Card (1024×768), and 16:9 Presentation Wide (1280×720). Every variation can be downloaded immediately as a Transparent PNG, high-resolution Studio JPG, or scalable Vector SVG file.",
  },
  {
    question: "Can I enter prompts in non-English languages or using Voice Dictation?",
    answer:
      "Yes! ClipartCanvas AI supports 20+ global languages including English, Spanish, Hindi, Arabic, Chinese, Japanese, French, German, Portuguese, and Korean. Our Gemini prompt engine automatically translates your native description into precise English visual terminology while preserving cultural nuances. You can also click the microphone button to dictate ideas hands-free via Web Speech recognition.",
  },
  {
    question: "Are the generated clipart assets free for commercial, educational, and branding projects?",
    answer:
      "Absolutely. All clipart variations generated in ClipartCanvas AI are watermark-free and unrestricted. Educators use them for classroom flashcards, marketers build cohesive social sticker sets, and designers export SVG/PNG components directly into web and print workflows.",
  },
];
