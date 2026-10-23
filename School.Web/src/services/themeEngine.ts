// ============================================================
// themeEngine.ts -> MOBILE BIBLE SCHOOL & THEOLOGICAL SEMINARY
// Next-Gen Luxury Adaptive Global Theme Engine
// Automatically changes based on time-of-day & device preference
// with zero manual configuration required.
// ============================================================

export interface ColorTheme {
    id: string;
    name: string;
    badge: string;
    tagline: string;
    description: string;
    category: "dark" | "light" | "royal";
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
    glow: string;
    heroGlow: string;
    heroBgStart: string;
    heroBgEnd: string;
    surfaceBg: string;
    surfaceGlass: string;
    borderColor: string;
    borderHighlight: string;
    textColor: string;
    textMuted: string;
    gradient: string;
    cardAccent: string;
}

export type ThemeMode = "auto" | "preset";

export const THEME_MODE_STORAGE_KEY = "mbs_global_theme_mode";
export const THEME_PRESET_STORAGE_KEY = "mbs_global_theme_preset";
export const THEME_CHANGED_EVENT = "mbs:theme-changed";

// ============================================================
// LUXURY THEME PRESETS (Apple / Harvard / Oxford Tier)
// ============================================================
export const LUXURY_THEME_PRESETS: Record<string, ColorTheme> = {
    // --------------------------------------------------------
    // 1. SEMINARY MAROON & 24K GOLD (Official MBS Identity)
    // --------------------------------------------------------
    "seminary-maroon": {
        id: "seminary-maroon",
        name: "Seminary Maroon & 24K Gold",
        badge: "OFFICIAL MBS",
        tagline: "Prestigious Academic Heritage",
        description: "Deep collegiate velvet maroon, lustrous 24K gold accents, and imperial mahogany obsidian.",
        category: "royal",
        primary: "#7A1526",
        primaryHover: "#5c0e1c",
        secondary: "#F59E0B",
        secondaryHover: "#D97706",
        glow: "rgba(122, 21, 38, 0.42)",
        heroGlow: "rgba(245, 158, 11, 0.22)",
        heroBgStart: "#380710",
        heroBgEnd: "#120205",
        surfaceBg: "#1a0409",
        surfaceGlass: "rgba(35, 7, 14, 0.82)",
        borderColor: "rgba(245, 158, 11, 0.22)",
        borderHighlight: "rgba(245, 158, 11, 0.48)",
        textColor: "#FFFFFF",
        textMuted: "#E2D3B8",
        gradient: "linear-gradient(135deg, #FFFFFF 20%, #FDE68A 65%, #F59E0B 100%)",
        cardAccent: "rgba(122, 21, 38, 0.35)",
    },

    // --------------------------------------------------------
    // 2. MIDNIGHT CELESTIAL NAVY & SAPPHIRE
    // --------------------------------------------------------
    "midnight-celestial": {
        id: "midnight-celestial",
        name: "Midnight Celestial Navy & Sapphire",
        badge: "EXECUTIVE LUXURY",
        tagline: "Cosmic Theological Depth",
        description: "Ultra-deep starlight obsidian, luminous celestial sapphire, and subtle golden star-nebula glows.",
        category: "dark",
        primary: "#1877F2",
        primaryHover: "#0d5bcc",
        secondary: "#38BDF8",
        secondaryHover: "#0284C7",
        glow: "rgba(24, 119, 242, 0.45)",
        heroGlow: "rgba(56, 189, 248, 0.22)",
        heroBgStart: "#071228",
        heroBgEnd: "#020612",
        surfaceBg: "#0b152d",
        surfaceGlass: "rgba(11, 21, 45, 0.85)",
        borderColor: "rgba(56, 189, 248, 0.2)",
        borderHighlight: "rgba(56, 189, 248, 0.45)",
        textColor: "#FFFFFF",
        textMuted: "#94A3B8",
        gradient: "linear-gradient(135deg, #FFFFFF 20%, #BAE6FD 60%, #38BDF8 100%)",
        cardAccent: "rgba(24, 119, 242, 0.28)",
    },

    // --------------------------------------------------------
    // 3. LIVING WORD BOTANICAL EMERALD
    // --------------------------------------------------------
    "living-emerald": {
        id: "living-emerald",
        name: "Living Word Botanical Emerald",
        badge: "SPIRITUAL LIFE",
        tagline: "Fruitfulness & Spiritual Growth",
        description: "Ancient biblical cedar forests, shimmering imperial jade, and radiant mint highlights.",
        category: "royal",
        primary: "#059669",
        primaryHover: "#047857",
        secondary: "#34D399",
        secondaryHover: "#10B981",
        glow: "rgba(5, 150, 105, 0.42)",
        heroGlow: "rgba(52, 211, 153, 0.2)",
        heroBgStart: "#042014",
        heroBgEnd: "#010b06",
        surfaceBg: "#062b1b",
        surfaceGlass: "rgba(6, 43, 27, 0.82)",
        borderColor: "rgba(52, 211, 153, 0.24)",
        borderHighlight: "rgba(52, 211, 153, 0.5)",
        textColor: "#FFFFFF",
        textMuted: "#A7F3D0",
        gradient: "linear-gradient(135deg, #FFFFFF 20%, #A7F3D0 65%, #34D399 100%)",
        cardAccent: "rgba(5, 150, 105, 0.32)",
    },

    // --------------------------------------------------------
    // 4. COVENANT CRIMSON & VELVET BURGUNDY
    // --------------------------------------------------------
    "covenant-crimson": {
        id: "covenant-crimson",
        name: "Covenant Crimson & Velvet Wine",
        badge: "HISTORIC CATHEDRAL",
        tagline: "Sacred Covenantal Dignity",
        description: "Dignified historic European cathedral wine, rose-gold accents, and deep velvet burgundy.",
        category: "royal",
        primary: "#BE123C",
        primaryHover: "#9F1239",
        secondary: "#FDA4AF",
        secondaryHover: "#FB7185",
        glow: "rgba(190, 18, 60, 0.42)",
        heroGlow: "rgba(253, 164, 175, 0.22)",
        heroBgStart: "#28050e",
        heroBgEnd: "#0d0104",
        surfaceBg: "#1e040a",
        surfaceGlass: "rgba(30, 4, 10, 0.84)",
        borderColor: "rgba(253, 164, 175, 0.22)",
        borderHighlight: "rgba(253, 164, 175, 0.48)",
        textColor: "#FFFFFF",
        textMuted: "#FECDD3",
        gradient: "linear-gradient(135deg, #FFFFFF 20%, #FECDD3 65%, #FDA4AF 100%)",
        cardAccent: "rgba(190, 18, 60, 0.32)",
    },

    // --------------------------------------------------------
    // 5. DESERT HARVEST AMBER & TERRACOTTA
    // --------------------------------------------------------
    "desert-harvest": {
        id: "desert-harvest",
        name: "Desert Harvest Amber & Terracotta",
        badge: "BIBLICAL ANTIQUITY",
        tagline: "Ancient Near-Eastern Sunlight",
        description: "Warm Jerusalem stone, ancient biblical parchment, rich terracotta, and glowing amber wheat.",
        category: "royal",
        primary: "#D97706",
        primaryHover: "#B45309",
        secondary: "#FDE68A",
        secondaryHover: "#F59E0B",
        glow: "rgba(217, 119, 6, 0.45)",
        heroGlow: "rgba(253, 230, 138, 0.24)",
        heroBgStart: "#281504",
        heroBgEnd: "#0d0601",
        surfaceBg: "#1c0e03",
        surfaceGlass: "rgba(28, 14, 3, 0.85)",
        borderColor: "rgba(253, 230, 138, 0.24)",
        borderHighlight: "rgba(253, 230, 138, 0.52)",
        textColor: "#FFFFFF",
        textMuted: "#FDE68A",
        gradient: "linear-gradient(135deg, #FFFFFF 20%, #FDE68A 60%, #F59E0B 100%)",
        cardAccent: "rgba(217, 119, 6, 0.35)",
    },

    // --------------------------------------------------------
    // 6. TITANIUM PLATINUM SLATE (Apple Pro Minimalist)
    // --------------------------------------------------------
    "titanium-platinum": {
        id: "titanium-platinum",
        name: "Titanium Platinum & Obsidian",
        badge: "MINIMALIST PRO",
        tagline: "Engineered Apple Pro Luxury",
        description: "Pure aerospace titanium, diamond-cut platinum borders, and ultra-deep matte carbon obsidian.",
        category: "dark",
        primary: "#F8FAFC",
        primaryHover: "#E2E8F0",
        secondary: "#94A3B8",
        secondaryHover: "#CBD5E1",
        glow: "rgba(255, 255, 255, 0.3)",
        heroGlow: "rgba(148, 163, 184, 0.16)",
        heroBgStart: "#141418",
        heroBgEnd: "#070709",
        surfaceBg: "#111116",
        surfaceGlass: "rgba(17, 17, 22, 0.86)",
        borderColor: "rgba(255, 255, 255, 0.14)",
        borderHighlight: "rgba(255, 255, 255, 0.38)",
        textColor: "#FFFFFF",
        textMuted: "#CBD5E1",
        gradient: "linear-gradient(135deg, #FFFFFF 30%, #E2E8F0 70%, #94A3B8 100%)",
        cardAccent: "rgba(255, 255, 255, 0.16)",
    },

    // --------------------------------------------------------
    // 7. DAYLIGHT ALABASTER & ROYAL BLUE (Luminous Academic)
    // --------------------------------------------------------
    "daylight-ivory": {
        id: "daylight-ivory",
        name: "Daylight Alabaster & Royal Navy",
        badge: "DAYTIME CLARITY",
        tagline: "Crisp Collegiate High-End",
        description: "Ultra-clean alabaster ivory, distinguished Oxford royal blue, and golden crest illumination.",
        category: "light",
        primary: "#1E40AF",
        primaryHover: "#1E3A8A",
        secondary: "#D97706",
        secondaryHover: "#B45309",
        glow: "rgba(30, 64, 175, 0.22)",
        heroGlow: "rgba(217, 119, 6, 0.15)",
        heroBgStart: "#F8FAFC",
        heroBgEnd: "#EFF6FF",
        surfaceBg: "#FFFFFF",
        surfaceGlass: "rgba(255, 255, 255, 0.92)",
        borderColor: "rgba(30, 64, 175, 0.15)",
        borderHighlight: "rgba(30, 64, 175, 0.35)",
        textColor: "#0F172A",
        textMuted: "#475569",
        gradient: "linear-gradient(135deg, #1E40AF 10%, #2563EB 50%, #D97706 100%)",
        cardAccent: "rgba(30, 64, 175, 0.12)",
    }
};

export const DEFAULT_THEME_ID = "seminary-maroon";

// ============================================================
// TIME-AWARE AUTOMATIC THEME ENGINE
// Dynamically calculates the optimal luxury theme without configuration
// ============================================================

export function getAutoThemeId(): string {
    if (typeof window === "undefined") return DEFAULT_THEME_ID;

    const hour = new Date().getHours();
    const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

    // 1. Morning to Mid-Afternoon (06:00 - 16:59):
    //    If system prefers light, offer radiant Daylight Alabaster; if dark, offer iconic Seminary Maroon.
    if (hour >= 6 && hour < 17) {
        return systemPrefersDark ? "seminary-maroon" : "daylight-ivory";
    }

    // 2. Dusk / Golden Hour (17:00 - 20:29):
    //    Warm Sunset Amber & Near-Eastern Desert Harvest gold
    if (hour >= 17 && hour < 21) {
        return "desert-harvest";
    }

    // 3. Night / Late Hours (21:00 - 05:59):
    //    Atmospheric Midnight Celestial Navy & Sapphire Starlight
    return "midnight-celestial";
}

export function getEffectiveTheme(mode?: ThemeMode, presetId?: string): ColorTheme {
    const currentMode = mode || getThemeMode();

    if (currentMode === "auto") {
        const autoId = getAutoThemeId();
        return LUXURY_THEME_PRESETS[autoId] || LUXURY_THEME_PRESETS[DEFAULT_THEME_ID];
    }

    const targetId = presetId || getThemePresetId();
    return LUXURY_THEME_PRESETS[targetId] || LUXURY_THEME_PRESETS[DEFAULT_THEME_ID];
}

export function getThemeMode(): ThemeMode {
    if (typeof window === "undefined") return "auto";
    const saved = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    return saved === "preset" ? "preset" : "auto"; // Default is ALWAYS "auto" (Zero configuration!)
}

export function getThemePresetId(): string {
    if (typeof window === "undefined") return DEFAULT_THEME_ID;
    return localStorage.getItem(THEME_PRESET_STORAGE_KEY) || DEFAULT_THEME_ID;
}

// ============================================================
// APPLY GLOBAL THEME
// Injects cohesive CSS variables across the entire application
// ============================================================

export function applyGlobalTheme(targetTheme?: ColorTheme, mode?: ThemeMode): void {
    if (typeof document === "undefined") return;

    try {
        const effectiveMode = mode || getThemeMode();
        const activeTheme = targetTheme || getEffectiveTheme(effectiveMode);

        const root = document.documentElement;

        // Apply smooth transition properties for theme morphing
        if (!root.style.getPropertyValue("--theme-transition")) {
            root.style.setProperty("--theme-transition", "background 0.6s cubic-bezier(0.16, 1, 0.3, 1), color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease");
        }

        // Primary / Accent brand tokens
        root.style.setProperty("--mbs-maroon", activeTheme.primary);
        root.style.setProperty("--mbs-maroon-dark", activeTheme.primaryHover);
        root.style.setProperty("--mbs-maroon-deep", activeTheme.heroBgEnd);
        root.style.setProperty("--mbs-maroon-light", activeTheme.secondary);
        root.style.setProperty("--mbs-gold", activeTheme.secondary);
        root.style.setProperty("--mbs-gold-dark", activeTheme.secondaryHover);
        root.style.setProperty("--mbs-gold-subtle", `${activeTheme.secondary}26`);

        // Theme-specific tokens
        root.style.setProperty("--theme-primary", activeTheme.primary);
        root.style.setProperty("--theme-primary-hover", activeTheme.primaryHover);
        root.style.setProperty("--theme-secondary", activeTheme.secondary);
        root.style.setProperty("--theme-secondary-hover", activeTheme.secondaryHover);
        root.style.setProperty("--theme-glow", activeTheme.glow);
        root.style.setProperty("--theme-hero-glow", activeTheme.heroGlow);
        root.style.setProperty("--theme-bg-start", activeTheme.heroBgStart);
        root.style.setProperty("--theme-bg-end", activeTheme.heroBgEnd);
        root.style.setProperty("--theme-surface", activeTheme.surfaceBg);
        root.style.setProperty("--theme-surface-glass", activeTheme.surfaceGlass);
        root.style.setProperty("--theme-border", activeTheme.borderColor);
        root.style.setProperty("--theme-border-highlight", activeTheme.borderHighlight);
        root.style.setProperty("--theme-text-primary", activeTheme.textColor);
        root.style.setProperty("--theme-text-muted", activeTheme.textMuted);
        root.style.setProperty("--theme-gradient", activeTheme.gradient);
        root.style.setProperty("--theme-card-accent", activeTheme.cardAccent);

        // Public & Admin legacy bridge tokens
        root.style.setProperty("--epic-primary", activeTheme.primary);
        root.style.setProperty("--epic-primary-dark", activeTheme.primaryHover);
        root.style.setProperty("--epic-accent", activeTheme.secondary);
        root.style.setProperty("--epic-navy", activeTheme.primary);
        root.style.setProperty("--epic-blue", activeTheme.primary);
        root.style.setProperty("--epic-cyan", activeTheme.secondary);
        root.style.setProperty("--epic-bg", activeTheme.heroBgEnd);
        root.style.setProperty("--epic-bg-2", activeTheme.heroBgStart);
        root.style.setProperty("--epic-panel", activeTheme.surfaceGlass);

        // Apple keynote navbar variables
        root.style.setProperty("--apple-blue", activeTheme.primary);
        root.style.setProperty("--apple-blue-hover", activeTheme.primaryHover);
        root.style.setProperty("--apple-blue-light", activeTheme.secondary);

        // Set Root HTML attributes for CSS scoping
        root.setAttribute("data-theme-id", activeTheme.id);
        root.setAttribute("data-theme-mode", effectiveMode);
        root.setAttribute("data-color-scheme", activeTheme.category === "light" ? "light" : "dark");

        // Broadcast change event
        window.dispatchEvent(
            new CustomEvent(THEME_CHANGED_EVENT, {
                detail: {
                    theme: activeTheme,
                    mode: effectiveMode
                }
            })
        );
    } catch (err) {
        console.warn("ThemeEngine: Failed to apply global theme:", err);
    }
}

// ============================================================
// USER CONTROLS (Mode & Preset Switchers)
// ============================================================

export function setThemeMode(mode: ThemeMode): void {
    try {
        localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
        applyGlobalTheme(undefined, mode);
    } catch (e) {
        console.warn("ThemeEngine: Failed to save theme mode:", e);
    }
}

export function setThemePreset(presetId: string): void {
    try {
        if (!LUXURY_THEME_PRESETS[presetId]) return;
        localStorage.setItem(THEME_MODE_STORAGE_KEY, "preset");
        localStorage.setItem(THEME_PRESET_STORAGE_KEY, presetId);
        applyGlobalTheme(LUXURY_THEME_PRESETS[presetId], "preset");
    } catch (e) {
        console.warn("ThemeEngine: Failed to save theme preset:", e);
    }
}

// ============================================================
// CONTINUOUS AUTO-THEME BACKGROUND ENGINE
// Checks time & ambient preferences automatically every 60 seconds
// ============================================================

let engineInitialized = false;

export function initGlobalThemeEngine(): void {
    if (typeof window === "undefined" || engineInitialized) return;
    engineInitialized = true;

    // 1. Initial immediate execution
    applyGlobalTheme();

    // 2. Continuous time checker (smoothly adapts without manual refresh)
    setInterval(() => {
        if (getThemeMode() === "auto") {
            const currentAppliedId = document.documentElement.getAttribute("data-theme-id");
            const expectedId = getAutoThemeId();
            if (currentAppliedId !== expectedId) {
                applyGlobalTheme();
            }
        }
    }, 60000);

    // 3. OS Theme preference change listener
    if (window.matchMedia) {
        const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
        darkModeQuery.addEventListener("change", () => {
            if (getThemeMode() === "auto") {
                applyGlobalTheme();
            }
        });
    }

    // 4. Cross-tab synchronization
    window.addEventListener("storage", (e) => {
        if (e.key === THEME_MODE_STORAGE_KEY || e.key === THEME_PRESET_STORAGE_KEY) {
            applyGlobalTheme();
        }
    });
}
