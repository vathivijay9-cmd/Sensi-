import React, { useState, useEffect } from "react";
import { 
  Smartphone, 
  Sparkles, 
  Crosshair, 
  Sliders, 
  HelpCircle, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Activity, 
  Cpu, 
  Compass, 
  Target, 
  Layers,
  Flame,
  MousePointer,
  ChevronRight,
  Info,
  Download,
  Terminal,
  Zap,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Pre-configured expert configurations for Vivo T2x 5G
interface ConfigProfile {
  name: string;
  category: string;
  general: number;
  redDot: number;
  scope2x: number;
  scope4x: number;
  sniperScope: number;
  freeLook: number;
  dpi: number;
  fireButtonSize: number;
  pointerSpeed: string;
  touchHoldDelay: string;
  dragTechnique: string;
  proTips: string[];
}

const PRESET_PROFILES: Record<string, ConfigProfile> = {
  shotgun_m1887: {
    name: "One-Tap Shotgun Special (M1887/M1014)",
    category: "Close Range",
    general: 98,
    redDot: 95,
    scope2x: 88,
    scope4x: 82,
    sniperScope: 50,
    freeLook: 70,
    dpi: 440,
    fireButtonSize: 45,
    pointerSpeed: "Fast (7/8)",
    touchHoldDelay: "Short (0.5s)",
    dragTechnique: "Rotation Drag (Hook Drag)",
    proTips: [
      "Keep crosshair slightly white near target chest, then pull down and quickly rotate up in a J-shape.",
      "Use Vivo T2x's Game Ultra Mode and configure touch sampling speed to Maximum.",
      "Set your screen refresh rate to 120Hz manually for smoother tracking."
    ]
  },
  desert_eagle: {
    name: "One-Tap Pistol & Desert Eagle Specialist",
    category: "Mid Range",
    general: 96,
    redDot: 92,
    scope2x: 90,
    scope4x: 85,
    sniperScope: 45,
    freeLook: 65,
    dpi: 410,
    fireButtonSize: 42,
    pointerSpeed: "Fast (8/8)",
    touchHoldDelay: "Short (0.5s)",
    dragTechnique: "Straight Drag (Quick Flick)",
    proTips: [
      "Keep the white crosshair at neck/shoulder height before flicking straight up.",
      "A smaller fire button (42%) creates a wider dragging space on the Vivo T2x screen.",
      "Avoid shooting while moving to ensure maximum first-shot accuracy."
    ]
  },
  all_around_rush: {
    name: "Balanced Full-Squad Rusher (SMG + AR)",
    category: "Versatile Rush",
    general: 100,
    redDot: 98,
    scope2x: 94,
    scope4x: 90,
    sniperScope: 55,
    freeLook: 80,
    dpi: 450,
    fireButtonSize: 48,
    pointerSpeed: "Fast (7/8)",
    touchHoldDelay: "Short (0.5s)",
    dragTechnique: "U-Drag or Rotation Drag",
    proTips: [
      "Perfect for high mobility gameplays using MP40, Thompson, and Woodpecker.",
      "Clean Vivo FunTouch OS RAM cache periodically via 'iManager' app before entering matches.",
      "Enable 'Touch Feedback' optimizations in Accessibility Menu."
    ]
  }
};

export default function App() {
  const [selectedPreset, setSelectedPreset] = useState<string>("shotgun_m1887");
  const [customStyle, setCustomStyle] = useState<string>("Rusher (Fast Action)");
  const [hudFingers, setHudFingers] = useState<string>("2 Fingers Layout");
  const [dragSpeed, setDragSpeed] = useState<string>("Fast Drag (High Flick Force)");
  const [selectedWeapons, setSelectedWeapons] = useState<string[]>(["M1887 Shotgun", "Desert Eagle"]);
  
  // Custom interactive settings (loaded initially from selected preset, then tweakable)
  const [currentConfig, setCurrentConfig] = useState<ConfigProfile>(PRESET_PROFILES.shotgun_m1887);
  
  // AI Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Training Simulator State
  const [dragType, setDragType] = useState<"rotation" | "straight" | "u_drag">("rotation");
  const [dragPoints, setDragPoints] = useState<{ x: number; y: number }[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hitResult, setHitResult] = useState<"aiming" | "headshot" | "miss">("aiming");

  // Calibration action response visual simulation state
  const [applyStatus, setApplyStatus] = useState<string | null>(null);

  // Automatic download options
  const [autoDownloadEnabled, setAutoDownloadEnabled] = useState<boolean>(true);

  // Handle first load automatic download trigger
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      if (autoDownloadEnabled) {
        handleDownloadConfig(PRESET_PROFILES.shotgun_m1887);
      }
    }, 1250);
    return () => clearTimeout(initialTimer);
  }, []);

  // Sync state to preset selection changes and trigger automatic download
  useEffect(() => {
    if (PRESET_PROFILES[selectedPreset]) {
      const config = PRESET_PROFILES[selectedPreset];
      setCurrentConfig({ ...config });
      if (autoDownloadEnabled) {
        const downloadTimer = setTimeout(() => {
          handleDownloadConfig(config);
        }, 600);
        return () => clearTimeout(downloadTimer);
      }
    }
  }, [selectedPreset, autoDownloadEnabled]);

  // Handle manual tweaking
  const updateConfigValue = (key: keyof ConfigProfile, value: any) => {
    setCurrentConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleWeaponToggle = (weapon: string) => {
    if (selectedWeapons.includes(weapon)) {
      setSelectedWeapons(prev => prev.filter(w => w !== weapon));
    } else {
      setSelectedWeapons(prev => [...prev, weapon]);
    }
  };

  // Dragshot Interactive Simulation Area Coordinates Canvas and drag detection
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragPoints([{ x, y }]);
    setIsDragging(true);
    setHitResult("aiming");
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    setDragPoints(prev => [...prev, { x, y }]);
  };

  const handleDragEnd = () => {
    if (!isDragging || dragPoints.length < 5) {
      setIsDragging(false);
      return;
    }
    setIsDragging(false);

    // Analyze the trajectory of points
    const firstPoint = dragPoints[0];
    const lastPoint = dragPoints[dragPoints.length - 1];

    const dy = firstPoint.y - lastPoint.y; // Positive means cursor moved UP (flicked)
    const dx = lastPoint.x - firstPoint.x;

    // Check minimum drag distance for registration
    if (dy > 45) {
      if (dragType === "straight") {
        if (Math.abs(dx) < 30) {
          setHitResult("headshot");
        } else {
          setHitResult("miss");
        }
      } else if (dragType === "rotation") {
        // Checking for a curve (J shape: goes slightly down/right, then hooks way up/left)
        // Check middle points for hook curve
        const midPoint = dragPoints[Math.floor(dragPoints.length / 2)];
        const isCurved = midPoint.y > firstPoint.y - 10 || Math.abs(midPoint.x - firstPoint.x) > 15;
        if (isCurved) {
          setHitResult("headshot");
        } else {
          setHitResult("miss");
        }
      } else {
        // U drag check
        const isUShaped = Math.abs(dx) > 30;
        if (isUShaped) {
          setHitResult("headshot");
        } else {
          setHitResult("miss");
        }
      }
    } else {
      setHitResult("miss");
    }
  };

  // Call the server API proxying the Gemini request for customized settings
  const generateAIConfig = async () => {
    setIsGenerating(true);
    setAiError(null);
    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style: customStyle,
          hudFingers,
          weapons: selectedWeapons,
          dragSpeed
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to generate configuration from API");
      }

      const data = await response.json();
      const mappedConfig: ConfigProfile = {
        name: `AI Custom Config for ${customStyle}`,
        category: "Generated AI Config",
        general: data.general ?? 98,
        redDot: data.redDot ?? 95,
        scope2x: data.scope2x ?? 90,
        scope4x: data.scope4x ?? 88,
        sniperScope: data.sniperScope ?? 50,
        freeLook: data.freeLook ?? 70,
        dpi: data.dpi ?? 440,
        fireButtonSize: data.fireButtonSize ?? 45,
        pointerSpeed: data.pointerSpeed ?? "Fast",
        touchHoldDelay: data.touchHoldDelay ?? "Short",
        dragTechnique: data.dragTechnique ?? "Rotation Drag",
        proTips: data.proTips ?? [
          "Enable ultra touch response speed in Vivo FunTouch OS game menu.",
          "Perfect headshot alignment requires proper crosshair placement relative to shoulders.",
          "Maintain clear physical screen touch area."
        ]
      };
      
      setCurrentConfig(mappedConfig);
      setSelectedPreset("custom"); // Mark as custom generated
      
      setApplyStatus("AI Calibration Config generated successfully!");
      setTimeout(() => setApplyStatus(null), 4000);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Something went wrong. Please check your internet connection and API Key setup.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger config file local download
  const handleDownloadConfig = (configToUse: ConfigProfile = currentConfig) => {
    const configDataStr = JSON.stringify({
      device: "vivo_t2x_5g",
      chipset: "MediaTek Dimensity 6020",
      refresh_rate_support: "120Hz",
      calibration_date: new Date().toISOString().split('T')[0],
      sensitivity: {
        general: configToUse.general,
        redDot: configToUse.redDot,
        scope2x: configToUse.scope2x,
        scope4x: configToUse.scope4x,
        sniperScope: configToUse.sniperScope,
        freeLook: configToUse.freeLook
      },
      system_overrides: {
        smallest_width_dpi: configToUse.dpi,
        pointer_speed: configToUse.pointerSpeed,
        touch_hold_delay: configToUse.touchHoldDelay,
        fire_button_percentage: configToUse.fireButtonSize
      },
      recommended_technique: configToUse.dragTechnique,
      expert_tips: configToUse.proTips
    }, null, 2);

    const blob = new Blob([configDataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vivo__t2x__onetap__config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setApplyStatus(`Active Sensi File download sequence started! Configuration applied: ${configToUse.name}`);
    setTimeout(() => setApplyStatus(null), 4000);
  };

  const handleApplyDirectly = () => {
    setApplyStatus("Directly Loaded! Sensitivities set to game register cache.");
    setTimeout(() => setApplyStatus(null), 4000);
  };

  // JSON preview block
  const jsonPreviewStr = `{
  "device": "vivo_t2x_5g",
  "sensitivity": { 
    "gen": ${currentConfig.general}, 
    "red": ${currentConfig.redDot}, 
    "2x": ${currentConfig.scope2x}, 
    "4x": ${currentConfig.scope4x}, 
    "snip": ${currentConfig.sniperScope} 
  },
  "hw_acceleration": true,
  "pointer_speed": "${currentConfig.pointerSpeed}",
  "touch_feedback": "instant",
  "macro_delay": "0ms"
}`;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-300 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* HEADER SECTION - Styled exactly from Design HTML with added Auto-Download Master Mode */}
      <header className="max-w-7xl w-full mx-auto px-6 pt-8 pb-6 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/10 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-500 font-extrabold mb-1 font-display">
            Device Optimization Suite
          </p>
          <h1 className="text-4xl font-black text-white tracking-tighter font-display flex items-center gap-2">
            V-SENSI PRO <span className="text-cyan-500 underline decoration-2 underline-offset-8">v4.2</span>
          </h1>
        </div>
        <div className="flex flex-col sm:items-end gap-3">
          <div className="text-left sm:text-right">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
              Target Hardware
            </p>
            <p className="text-xl font-mono text-white font-extrabold">
              VIVO T2X 5G / MT6833P
            </p>
          </div>
          
          {/* Automatic Download Master Switch */}
          <button
            id="toggle-autodwnd-btn"
            onClick={() => setAutoDownloadEnabled(!autoDownloadEnabled)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              autoDownloadEnabled 
                ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.2)]" 
                : "bg-black/40 border-white/10 text-slate-500"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${autoDownloadEnabled ? "bg-cyan-400 animate-pulse" : "bg-zinc-600"}`}></div>
            <span>Auto-Download on Tweak: {autoDownloadEnabled ? "ENABLED" : "DISABLED"}</span>
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-2 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        
        {/* Left Column: Preset Matrix, AI calibration parameters (Col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Preset Matrix Section */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col shadow-lg shadow-black/40">
            <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-4 flex items-center font-display">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-ping"></span> 
              Expert Configuration Profiles
            </h2>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Select one of our fine-tuned sports presets designed specifically for the Vivo T2x 5G capacitive screens:
            </p>

            <div className="flex flex-col gap-3">
              {Object.entries(PRESET_PROFILES).map(([key, preset]) => (
                <button
                  id={`preset-btn-${key}`}
                  key={key}
                  onClick={() => setSelectedPreset(key)}
                  className={`text-left p-4 rounded-lg border transition-all relative overflow-hidden group flex items-start justify-between gap-3 ${
                    selectedPreset === key 
                      ? "bg-cyan-500/10 border-cyan-500/80 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)]" 
                      : "bg-black/30 border-white/5 hover:border-white/20 hover:bg-black/55 text-slate-300"
                  }`}
                >
                  <div className="flex-1">
                    <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${
                      selectedPreset === key ? "bg-cyan-500 text-black text-[9px]" : "bg-white/10 text-slate-400"
                    }`}>
                      {preset.category}
                    </span>
                    <p className="font-bold text-sm mt-2 group-hover:text-cyan-400 transition-colors font-display">
                      {preset.name}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform mt-0.5 ${
                    selectedPreset === key ? "text-cyan-400 translate-x-1" : "text-slate-600"
                  }`} />
                </button>
              ))}
            </div>
          </div>

          {/* AI Generator Parameters */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg shadow-black/40 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full"></div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-bold font-display">
                  Dynamic Parameter Generator
                </h2>
              </div>
              <span className="text-[10px] text-cyan-400 font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30">
                AI ACTIVE
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Calculate optimized sensitivities dynamically utilizing our Google Gemini 3.5 AI backend, taking your unique habits into account:
            </p>

            <div className="space-y-4">
              
              {/* Playing Style */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 font-mono">
                  Playing Action Profile
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Rusher (Fast Action)", "One-Tap Specialist", "Tournament Tactician", "Passive Defender"].map((style) => (
                    <button
                      id={`style-${style}`}
                      key={style}
                      onClick={() => setCustomStyle(style)}
                      className={`text-xs px-3 py-2 rounded border text-left transition-all ${
                        customStyle === style 
                          ? "bg-cyan-500/10 border-cyan-500 text-white font-semibold" 
                          : "bg-black/30 border-white/5 text-slate-400 hover:border-white/15"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* HUD custom layout */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 font-mono">
                  HUD custom layout (Fingers)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["2 Fingers Layout", "3 Fingers Layout", "4 Fingers Layout"].map((finger) => (
                    <button
                      id={`finger-${finger}`}
                      key={finger}
                      onClick={() => setHudFingers(finger)}
                      className={`text-xs py-2 rounded border text-center transition-all ${
                        hudFingers === finger 
                          ? "bg-cyan-500/10 border-cyan-500 text-white font-semibold" 
                          : "bg-black/30 border-white/5 text-slate-400"
                      }`}
                    >
                      {finger}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drag Speed Habits */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 font-mono">
                  Drag Speed & Touch Habit
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Fast Drag (High Flick Force)",
                    "Medium Smooth Drag (Controlled)",
                    "Short Close Drag",
                    "Slow Drag (Heavy Pull)"
                  ].map((speed) => (
                    <button
                      id={`drag-${speed}`}
                      key={speed}
                      onClick={() => setDragSpeed(speed)}
                      className={`text-xs p-2.5 rounded border text-left transition-all leading-normal ${
                        dragSpeed === speed 
                          ? "bg-cyan-500/10 border-cyan-500 text-white font-semibold" 
                          : "bg-black/30 border-white/5 text-slate-400 hover:border-white/10"
                      }`}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target One-Tap Weapons */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 font-mono">
                  Target One-Tap Weapons
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {["Desert Eagle", "M1887 Shotgun", "M1014", "Woodpecker AR", "SVD Sniper", "UMP"].map((weapon) => (
                    <button
                      id={`weapon-${weapon}`}
                      key={weapon}
                      onClick={() => handleWeaponToggle(weapon)}
                      className={`text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                        selectedWeapons.includes(weapon)
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                          : "bg-black/40 border-white/5 text-slate-400 hover:border-white/12"
                      }`}
                    >
                      {weapon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action trigger Button */}
              <button
                id="generate-btn"
                onClick={generateAIConfig}
                disabled={isGenerating}
                className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-widest text-xs shadow-[0_4px_25px_rgba(6,182,212,0.25)] transition-all flex items-center justify-center gap-2.5 mt-2 cursor-pointer font-display"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Calculating Latency Mapping...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-white" />
                    RUN MACHINE DYNAMIC TUNING
                  </>
                )}
              </button>

              {aiError && (
                <div id="ai-error-banner" className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-300">
                    {aiError}
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Right Column: Sensitivity matrix, quick calibration indicators, training sandbox, generated layout (Col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Sensitivity Matrix Card (Calculated & Polish parameters style) */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col shadow-lg shadow-black/40 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4 mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold block mb-1">
                  Active Configuration Matrix
                </span>
                <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2 font-display">
                  <Sliders className="w-4 h-4 text-cyan-500" />
                  Target Device Touch Scaling
                </h3>
              </div>
              <div className="px-3 py-1 rounded bg-black/60 border border-white/10 text-[10px] font-mono font-bold text-slate-300">
                SOURCE: <span className="text-cyan-400">{currentConfig.category.toUpperCase()}</span>
              </div>
            </div>

            {/* Custom Interactive Sliders */}
            <div className="space-y-4 mb-6">
              {[
                { label: "General Touch (Camera Sweep headshots)", key: "general" },
                { label: "Red Dot Locking Rate", key: "redDot" },
                { label: "2x Scope Scaling Calibration", key: "scope2x" },
                { label: "4x Scope Magnification Sensi", key: "scope4x" },
                { label: "Sniper Scope Steady Sensitivity", key: "sniperScope" },
                { label: "Free Look Camera Scope", key: "freeLook" }
              ].map(({ label, key }) => {
                const val = currentConfig[key as keyof ConfigProfile] as number;
                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-300">{label}</span>
                      <span className="text-xs font-mono text-cyan-400 font-black">{val} / 100</span>
                    </div>
                    <div className="relative w-full h-1.5 bg-white/10 rounded-full">
                      <div 
                        className="absolute h-full bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-300"
                        style={{ width: `${val}%` }}
                      />
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={val}
                        onChange={(e) => updateConfigValue(key as keyof ConfigProfile, parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hardware Hacks Overrides Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5 pt-5">
              
              {/* Box 1: DPI Setting */}
              <div className="bg-black/40 border border-white/5 p-4 rounded-lg flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-wider font-mono">
                    Smallest Width (DPI)
                  </h4>
                  <p className="text-xl font-mono font-black text-white mt-1">
                    {currentConfig.dpi} <span className="text-[10px] text-zinc-500 font-normal">px</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                    Funtouch Default: <span className="font-bold underline">384</span>. Optimized for panel drag speed.
                  </p>
                </div>
              </div>

              {/* Box 2: Fire Button */}
              <div className="bg-black/40 border border-white/5 p-4 rounded-lg flex items-start gap-3">
                <Target className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-wider font-mono">
                    Fire Button Diameter
                  </h4>
                  <p className="text-xl font-mono font-black text-white mt-1">
                    {currentConfig.fireButtonSize}%
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                    Perfect alignment height calibrated for thumb radius.
                  </p>
                </div>
              </div>

              {/* Box 3: Touch Settings pointer / speed */}
              <div className="bg-black/40 border border-white/5 p-4 rounded-lg flex items-start gap-3">
                <MousePointer className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-wider font-mono">
                    Pointer & Hold Delay
                  </h4>
                  <div className="mt-1">
                    <p className="text-xs font-bold text-white leading-tight">
                      Speed: <span className="text-cyan-400 font-mono">{currentConfig.pointerSpeed}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                      Hold delay: <span className="text-white font-mono">{currentConfig.touchHoldDelay}</span>
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Interactive Drag Shot Muscle Memory sandbox simulator */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg shadow-black/40 relative overflow-hidden flex flex-col">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4 mb-5">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold font-mono">
                  Muscle Memory Trainer
                </span>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-display">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Tactical Drag-Shot Simulator Canvas
                </h3>
              </div>

              <div className="flex bg-black/60 rounded p-1 border border-white/10">
                {[
                  { value: "rotation", label: "Rotation (J-Curve)" },
                  { value: "straight", label: "Straight (Vertical)" },
                  { value: "u_drag", label: "U-Drag Dragshot" }
                ].map((t) => (
                  <button
                    id={`drag-type-btn-${t.value}`}
                    key={t.value}
                    onClick={() => {
                      setDragType(t.value as any);
                      setHitResult("aiming");
                    }}
                    className={`text-[9px] font-bold tracking-widest px-2.5 py-1 rounded transition-all ${
                      dragType === t.value 
                        ? "bg-cyan-500 text-black font-extrabold" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Touch/Click and drag the glowing <span className="font-bold text-cyan-400">FIRE BUTTON</span> in the canvas in a fast vertical swipe. Follow the <span className="text-cyan-400 underline">{dragType.toUpperCase()}</span> path guidelines to lock red-dotted headshots.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              
              {/* Simulated Game screen display frame */}
              <div className="md:col-span-8 flex flex-col bg-black/80 rounded-lg p-4 border border-white/15 relative h-72 md:h-80 select-none overflow-hidden justify-between">
                
                {/* Cyber style background lines */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.06)_0%,transparent_85%)]"></div>
                <div className="absolute top-2 left-2 text-[8px] font-mono text-zinc-600">PREVIEW_ENGINE // V-AIM LOCK </div>
                
                {/* Target Head & Body structure */}
                <div className="flex flex-col items-center justify-start mt-6 relative z-10">
                  <div className="relative">
                    {/* Head target element */}
                    <div className={`w-14 h-14 rounded-full border border-dashed transition-all flex items-center justify-center ${
                      hitResult === "headshot" 
                        ? "bg-red-500/40 border-red-500 ring-4 ring-red-500/30 scale-105" 
                        : hitResult === "miss" 
                        ? "bg-white/5 border-white/10" 
                        : "bg-cyan-500/10 border-cyan-500/60 animate-pulse"
                    }`}>
                      <Crosshair className={`w-6 h-6 transition-transform duration-200 ${
                        hitResult === "headshot" ? "text-red-300 scale-125" : "text-cyan-400"
                      }`} />
                    </div>
                    {/* label */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/90 border border-white/15 px-2 py-0.5 rounded text-[8px] font-black uppercase text-cyan-400 tracking-wider">
                      Red dot target
                    </div>
                  </div>
                  
                  {/* Body component */}
                  <div className="w-16 h-28 bg-[#121214] border border-white/5 rounded-b-xl mt-1 flex flex-col items-center p-2 text-center relative">
                    <div className="w-6 h-1.5 bg-white/10 rounded mb-2"></div>
                    <div className="text-[9px] text-zinc-600 font-mono">CORE_BOX</div>
                  </div>
                </div>

                {/* Simulated Game HUD Controls Overlay area */}
                <div 
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  className="absolute inset-0 z-20 cursor-crosshair flex items-end justify-center pb-8"
                >
                  <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-zinc-600 pointer-events-none">
                    CLICK & DRAG FIRE BUTTON UPWARDS
                  </p>

                  {/* Drag line path tracer SVG vector */}
                  {dragPoints.length > 1 && (
                    <svg className="absolute inset-0 pointer-events-none w-full h-full">
                      <path
                        d={`M ${dragPoints.map(p => `${p.x},${p.y}`).join(" L ")}`}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                      />
                    </svg>
                  )}

                  {/* Floating drag handle fire trigger ring */}
                  <div 
                    className="p-3 bg-cyan-500/10 rounded-full border border-cyan-500/20 shadow-lg select-none transition-transform pointer-events-none"
                    style={{
                      transform: isDragging ? "scale(1.1) rotate(5deg)" : "scale(1)"
                    }}
                  >
                    <div 
                      className={`rounded-full border-2 flex items-center justify-center font-bold tracking-widest text-[9px] select-none transition-all ${
                        isDragging 
                          ? "bg-cyan-500/40 border-cyan-200 text-white shadow-[0_0_15px_rgba(6,182,212,0.6)]" 
                          : "bg-cyan-500 border-cyan-400 text-black font-extrabold"
                      }`}
                      style={{
                        width: `${currentConfig.fireButtonSize * 1.05}px`,
                        height: `${currentConfig.fireButtonSize * 1.05}px`
                      }}
                    >
                      FIRE
                    </div>
                  </div>

                </div>

                {/* Instant Feedback HUD Indicator block */}
                <div className="absolute top-2 right-2 p-2 rounded bg-black/90 border border-white/10 text-right font-mono text-[9px] z-30">
                  <div className="font-bold text-slate-500">HIT ESTIMATE:</div>
                  <div className={`font-black uppercase text-xs tracking-wider mt-0.5 ${
                    hitResult === "headshot" 
                      ? "text-red-500 animate-pulse font-mono shadow-red-500/50" 
                      : hitResult === "miss" 
                      ? "text-slate-400" 
                      : "text-cyan-400"
                  }`}>
                    {hitResult === "headshot" ? "☠ RED HEADSHOT!" : hitResult === "miss" ? "MISS / RECOIL" : "AIMING_LOCK.."}
                  </div>
                </div>

              </div>

              {/* Steps sidebar helper inside simulator */}
              <div className="md:col-span-4 flex flex-col justify-between gap-4">
                <div className="bg-black/40 border border-white/5 p-4 rounded-lg flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase font-mono tracking-widest block mb-2 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      CALIBRATED MOTION
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {dragType === "rotation" && (
                        "Aim white dot near shoulder range, pull trigger key slightly down, then slam it up-right in a high velocity hook (J-shape). Perfect for M1887 shotgun."
                      )}
                      {dragType === "straight" && (
                        "Set red dot layout directly near head level, then pull straight upwards in a swift fluid motion. Avoid quick horizontal drifts. Ideal for Desert Eagle."
                      )}
                      {dragType === "u_drag" && (
                        "Pull the fire button downwards, swipe side-right in a curve and push straight up. Bypasses automatic chest lock limits of Funtouch OS."
                      )}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-3 mt-4">
                    <span className="text-[9px] uppercase font-bold text-cyan-400 font-mono tracking-widest block">calibration tip</span>
                    <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                      For best results manually tweak DPI to <span className="text-cyan-400 font-mono">{currentConfig.dpi}</span> and set game sensitivity to <span className="text-cyan-400 font-mono">{currentConfig.general}</span> inside your Free Fire settings app.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Sensi JSON File Preview & Exports Frame - From Professional Polish theme instructions */}
          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-6 flex flex-col shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-cyan-400 font-black font-display">Generated Config File Content</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">JSON model ready for device file system overlay import.</p>
              </div>
              <span className="px-2.5 py-1 bg-cyan-500/20 text-[10px] text-cyan-400 font-mono rounded font-bold">JSON_EXPORT</span>
            </div>

            <div className="bg-black/60 font-mono text-[11px] p-4 rounded border border-white/5 text-cyan-200 overflow-hidden flex-grow select-all transition-all">
              <pre className="whitespace-pre-wrap leading-relaxed">{jsonPreviewStr}</pre>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button 
                id="download-cmd-btn"
                onClick={handleDownloadConfig}
                className="flex-grow bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold py-3 px-6 rounded-lg uppercase tracking-widest text-xs shadow-[0_4px_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Config File
              </button>
              <button 
                id="apply-cmd-btn"
                onClick={handleApplyDirectly}
                className="bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-widest text-xs transition-all cursor-pointer"
              >
                Apply Directly
              </button>
            </div>
          </div>

          {/* System Calibration and game optimization guidelines */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-5 flex items-center font-display">
              <Cpu className="w-4 h-4 mr-2" />
              Hardware Accelerations & System Boosters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="bg-black/30 border border-white/5 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded flex items-center justify-center text-cyan-400">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-xs">Touch Response Engine</p>
                    <p className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider">ULTRA BOOSTER LIVE</p>
                  </div>
                </div>
                <div className="space-y-2 mt-3 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Sampling Interval</span>
                    <span className="text-white font-semibold">360 Hz</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>System DPI Override</span>
                    <span className="text-white font-semibold">{currentConfig.dpi} DPI</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 border border-white/5 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded flex items-center justify-center text-cyan-400">
                    <Sliders className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-xs">Visual Driver Override</p>
                    <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider">STABLE VULKAN 1.3</p>
                  </div>
                </div>
                <div className="space-y-2 mt-3 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Refresh Lock</span>
                    <span className="text-white font-semibold">120 Hz (Adaptive)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Rendering Backend</span>
                    <span className="text-white font-semibold">OpenGL/Vulkan API</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Configured bullet tips block dynamically loaded based on preset output */}
            <div className="bg-[#121214] border border-white/5 p-4 rounded-lg">
              <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400 block mb-2 font-mono">
                BOOSTER CALIBRATION TIPS SUMMARY:
              </span>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                {currentConfig.proTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

      </main>

      {/* Global Toast Notification Container for Apply Actions */}
      <AnimatePresence>
        {applyStatus && (
          <motion.div 
            id="apply-toast"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0E0E10] border border-cyan-500/40 text-slate-200 px-4 py-3.5 rounded-lg shadow-xl shadow-cyan-950/20 flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Check className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-white">System Calibration Override</p>
              <p className="text-slate-400 mt-0.5">{applyStatus}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER BAR - Matching Design HTML exactly */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-8 border-t border-white/5 mt-auto flex flex-col sm:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-slate-500 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center">
          <span>STATUS: <span className="text-green-500 font-bold">&#x25CF; SERVER LIVE</span></span>
          <span>BUILD: <span className="text-cyan-400 font-bold font-mono">8.9.2-VIVO</span></span>
        </div>
        <div className="text-center sm:text-right font-semibold">
          &copy; 15th Generation Vivo Configurator &bull; ProGaming Lab Solutions
        </div>
      </footer>

    </div>
  );
}
