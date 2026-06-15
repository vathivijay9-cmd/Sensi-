import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for AI Analyzer
  app.post("/api/gemini/analyze", async (req, res) => {
    try {
      const { style, hudFingers, weapons, dragSpeed } = req.body;
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured. Please add it to Settings > Secrets." });
      }

      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const promptMsg = `Generate a customized high-performance Free Fire "One-Tap" Settings and Sensitivity Configuration specifically for the Vivo T2x 5G Android phone (which features a MediaTek Dimensity 6020 processor, up to 120Hz refresh rate screen, and FunTouch OS).
User specifics to customize for:
- Playing Style: ${style} (e.g. rusher, passives, one-tap specialist)
- HUD Custom Fingers: ${hudFingers} (e.g. 2 fingers, 3 fingers, 4 fingers)
- Target Weapons: ${weapons?.join(", ") || "All Weapons"}
- User Drag Speed / Touch Drag Habits: ${dragSpeed}

Examine the device characteristics: Vivo T2x 5G has a capacitive Multi-touch touchscreen. Touch response speed is critical here.
Suggest real, professional-grade numbers.
Include values for:
1. "General" Sensitivity (usually 95-100 for Vivo T2x for fast camera swipe headshots)
2. "Red Dot" Sensitivity
3. "2x Scope" Sensitivity
4. "4x Scope" Sensitivity
5. "Sniper Scope" Sensitivity
6. "Free Look" Sensitivity
7. Best "DPI" setting in Developer Options (Default is 384, suggest an optimized safe DPI that doesn't cause system lags, e.g., 420-460)
8. Ideal "Fire Button Size" (in % percentage, e.g. 42%, 45%, etc.)
9. Android System Pointer Speed
10. Android Touch and Hold Delay
11. Professional instructions, explaining exactly how to perform the drag shot (e.g., Rotation Drag vs Straight Drag) optimized for their preferred weapons on the Vivo T2x 5G to score clean one-tap headshots.

Return the response STRICTLY as a JSON object matching the requested schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptMsg,
        config: {
          systemInstruction: "You are an elite, professional Free Fire pro-player and technical configuration analyst who optimizes Android layouts, sensitivities, and developer options specifically for Vivo Android devices for flawless onetap headshots.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              general: { type: Type.INTEGER, description: "Sensitivity value for General (0-100)" },
              redDot: { type: Type.INTEGER, description: "Sensitivity value for Red Dot (0-100)" },
              scope2x: { type: Type.INTEGER, description: "Sensitivity value for 2x Scope (0-100)" },
              scope4x: { type: Type.INTEGER, description: "Sensitivity value for 4x Scope (0-100)" },
              sniperScope: { type: Type.INTEGER, description: "Sensitivity value for Sniper Scope (0-100)" },
              freeLook: { type: Type.INTEGER, description: "Sensitivity value for Free Look (0-100)" },
              dpi: { type: Type.INTEGER, description: "Optimal Developer Options DPI / Smallest Width setting for Vivo T2x 5G" },
              fireButtonSize: { type: Type.INTEGER, description: "Best Fire Button size percentage (0-100)" },
              pointerSpeed: { type: Type.STRING, description: "Best Touch Pointer Speed setting in Android Settings" },
              touchHoldDelay: { type: Type.STRING, description: "Accessibility Touch and Hold Delay recommendation (e.g. Short 0.5s or via accessibility settings)" },
              dragTechnique: { type: Type.STRING, description: "Recommended onetap drag technique detailed explanation (Straight Drag, Rotation Drag, or U-Drag)" },
              proTips: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "3-4 pro bullet tips specifically targeting Vivo T2x 5G optimization (e.g., Game Ultra Mode, refresh rate 90Hz/120Hz, pointer speed, touch feedback settings)"
              }
            },
            required: [
              "general", "redDot", "scope2x", "scope4x", "sniperScope", "freeLook",
              "dpi", "fireButtonSize", "pointerSpeed", "touchHoldDelay", "dragTechnique", "proTips"
            ]
          }
        }
      });

      const responseText = response.text || "{}";
      const cleanedData = JSON.parse(responseText.trim());
      res.json(cleanedData);

    } catch (error: any) {
      console.error("Gemini Api Server Error:", error);
      res.status(500).json({ error: error?.message || "Failed to generate configuration." });
    }
  });

  // Serve static assets or mount/redirect dev server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on port ${PORT}`);
  });
}

startServer();
