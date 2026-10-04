import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient() {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured in environment variables."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "25mb" }));

  // 1. Optimize & Translate Clipart Prompt + Generate 2-4 Crisp SVG Variations
  app.post("/api/clipart/generate", async (req, res) => {
    try {
      const {
        prompt,
        style = "Flat Vector",
        palette = "Indigo & Emerald Studio",
        aspectRatio = "1:1",
        lineWeight = 2.5,
        language = "English",
        variationCount = 2,
      } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Please provide a valid prompt description." });
      }

      const ai = getGenAIClient();
      const count = Math.min(Math.max(Number(variationCount) || 2, 1), 4);

      let viewBox = "0 0 512 512";
      if (aspectRatio === "4:3") viewBox = "0 0 640 480";
      if (aspectRatio === "16:9") viewBox = "0 0 800 450";

      const systemInstruction = `You are a master vector & clipart artist and SVG illustrator.
Transform the user's request into ${count} distinct, high-craft, studio-grade SVG clipart variations.

Rules for Clipart Generation:
1. Input Language: ${language}. Translate and interpret any non-English input into precise English visual terminology.
2. Required Artistic Style: ${style}.
   - If "Flat Vector": Crisp geometric shapes, layered flat color planes, zero strokes or minimal accent lines, modern iconographic balance.
   - If "Outline Line-Art": Clean monoline vector paths with stroke-width="${lineWeight * 2}" and round caps/joins, minimal or subtle accent fills.
   - If "Kawaii/Cartoon": Expressive cute character proportions, thick dark outlines (stroke="#1E293B" stroke-width="${lineWeight * 2.2}"), rosy cheeks, joyful eyes, pastel/vibrant fills.
   - If "Doodle": Hand-drawn playful organic curves, energetic offset fills, expressive linework.
   - If "Minimalist": Essential geometric reduction, maximum negative space, Bauhaus-inspired balance.
   - If "Colored Illustration": Rich multi-layered paths, subtle highlights and shading shapes, editorial spot-illustration quality.
   - If "Watercolor": Soft overlapping translucent organic shapes (using opacity="0.75" to "0.9"), artistic botanical/storybook wash feel.
   - If "Sticker/Die-Cut": Include a thick white outer contour/offset border around the subject with a subtle drop shadow filter so it looks like a die-cut vinyl sticker.
3. Color Palette Direction: ${palette}. Use harmonious hex codes matching this palette.
4. Background: MUST include a clean solid white background rectangle (<rect id="bg-layer" width="100%" height="100%" fill="#FFFFFF" />) as the very first element inside the <svg> so that our client-side Canvas background remover or SVG stripper can toggle transparency cleanly.
5. SVG Technical Quality:
   - Root <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="100%" height="100%">
   - Rich, detailed, recognizable artwork using multiple <path>, <circle>, <rect>, <ellipse>, <polygon>, and <g> elements. Never output a trivial 2-shape placeholder; compose at least 12-30 thoughtful vector elements per variation with proper layering, highlights, and details.
   - Ensure all tags are valid XML/SVG with no markdown code fences inside the svgCode string.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Create ${count} distinct clipart variations for: "${prompt}".
Style: ${style}
Palette: ${palette}
Aspect Ratio: ${aspectRatio} (viewBox="${viewBox}")
Stroke Weight Scale: ${lineWeight}px`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              optimizedPrompt: {
                type: Type.STRING,
                description: "The refined English clipart prompt optimized for clean silhouettes and vector isolation.",
              },
              englishTranslation: {
                type: Type.STRING,
                description: "Clean English translation of the user's original prompt.",
              },
              detectedLanguage: {
                type: Type.STRING,
                description: "Detected input language.",
              },
              styleNotes: {
                type: Type.STRING,
                description: "Brief studio note explaining how the style and palette were applied.",
              },
              variations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: {
                      type: Type.STRING,
                      description: "Short descriptive title of this variation (e.g., 'Front Silhouette', 'Playful Angle').",
                    },
                    caption: {
                      type: Type.STRING,
                      description: "1-sentence description of the composition and vector details.",
                    },
                    dominantColors: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Array of 3-5 hex color codes used in this clipart.",
                    },
                    svgCode: {
                      type: Type.STRING,
                      description: "Complete, valid, self-contained <svg>...</svg> markup.",
                    },
                  },
                  required: ["title", "caption", "dominantColors", "svgCode"],
                },
              },
            },
            required: ["optimizedPrompt", "englishTranslation", "detectedLanguage", "styleNotes", "variations"],
          },
        },
      });

      const rawText = response.text || "{}";
      const parsed = JSON.parse(rawText);
      return res.json(parsed);
    } catch (error: any) {
      console.error("Clipart generation error:", error);
      return res.status(500).json({
        error: error?.message || "Failed to generate clipart variations.",
      });
    }
  });

  // 2. Optimize Prompt Only
  app.post("/api/clipart/optimize-prompt", async (req, res) => {
    try {
      const { prompt, style = "Flat Vector", language = "English", palette = "Indigo & Emerald Studio" } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
      }

      const ai = getGenAIClient();
      const systemInstruction = `You are a master vector & clipart artist prompt engineer.
Transform the user's request into an optimized AI clipart prompt.
Rules:
- Focus on clean silhouettes, isolated objects, sharp vector edges, balanced colors.
- Style required: ${style}.
- Palette preference: ${palette}.
- Input Language: ${language}. Translate and refine to precise English visual terms.
- Ensure background is requested as clean white or isolated solid color for easy transparent extraction.
- Exclude complex photo textures or cluttered backgrounds.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `User Request: "${prompt}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              optimizedPrompt: {
                type: Type.STRING,
                description: "The refined, high-yield clipart prompt.",
              },
              suggestedStyle: {
                type: Type.STRING,
                description: "Recommended style preset from: Flat Vector, Outline Line-Art, Kawaii/Cartoon, Doodle, Minimalist, Colored Illustration, Watercolor, Sticker/Die-Cut.",
              },
              rationale: {
                type: Type.STRING,
                description: "1-sentence explanation of why these visual keywords improve silhouette isolation.",
              },
            },
            required: ["optimizedPrompt", "suggestedStyle", "rationale"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (error: any) {
      console.error("Optimize prompt error:", error);
      return res.status(500).json({
        error: error?.message || "Failed to optimize prompt.",
      });
    }
  });

  // 3. Embedded Canvas AI Assistant ("Artisan Agent")
  app.post("/api/clipart/assistant", async (req, res) => {
    try {
      const {
        message,
        activePrompt = "",
        activeStyle = "Flat Vector",
        activePalette = "Indigo & Emerald Studio",
        history = [],
      } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      const ai = getGenAIClient();
      const systemInstruction = `You are the "Artisan Agent", the embedded Studio AI Assistant inside ClipartCanvas AI.
You have live awareness of the user's active canvas workspace:
- Current Prompt: "${activePrompt || "(empty)"}"
- Active Style Preset: "${activeStyle}"
- Active Color Palette: "${activePalette}"

Your role:
- Help designers, educators, marketers, and creators craft crisp, isolated clipart and consistent visual sets.
- Suggest specific prompt improvements, style tweaks, or color harmony ideas.
- Whenever you propose a concrete improved prompt or style change that the user could apply to their workspace, populate \`proposedPrompt\` and \`proposedStyle\` so the UI can show a User Consent confirmation card before applying it.
- Keep your reply concise, warm, and practical (2-4 short paragraphs or bullet points).`;

      const conversationContext = history
        .slice(-6)
        .map((m: { role: string; text: string }) => `${m.role === "user" ? "Creator" : "Artisan Agent"}: ${m.text}`)
        .join("\n");

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `${conversationContext ? `Recent conversation:\n${conversationContext}\n\n` : ""}Creator asks: "${message}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: "Helpful studio response from the Artisan Agent.",
              },
              proposedPrompt: {
                type: Type.STRING,
                description: "Optional upgraded prompt that the user can review and consent to apply to their studio input. Empty string if not applicable.",
              },
              proposedStyle: {
                type: Type.STRING,
                description: "Optional recommended style preset name if suggesting a style switch, or empty string.",
              },
              quickTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Up to 3 short actionable tips related to their question.",
              },
            },
            required: ["reply", "proposedPrompt", "proposedStyle", "quickTips"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (error: any) {
      console.error("Artisan Agent error:", error);
      return res.status(500).json({
        error: error?.message || "Artisan Agent encountered an error.",
      });
    }
  });

  const distPath = path.join(__dirname, "dist");
  const isProd =
    process.env.NODE_ENV === "production" ||
    (fs.existsSync(path.join(distPath, "index.html")) &&
      process.env.NODE_ENV !== "development" &&
      !process.env.VITE_DEV_SERVER);

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ClipartCanvas AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
