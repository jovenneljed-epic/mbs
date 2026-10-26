// ============================================================
// themeEngine.ts -> MOBILE BIBLE SCHOOL & THEOLOGICAL SEMINARY
// Official Institutional Global Theme Engine
// Manually configured by the Administrator via Landing Page Editor (CMS).
// Applies dynamically to ALL pages across the entire system.
// ============================================================

import { API_BASE_URL } from "../config";

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

export type ThemeMode = "preset";

export const THEME_STORAGE_KEY = "mbs_admin_global_theme";
export const THEME_CHANGED_EVENT = "mbs:theme-changed";

// ============================================================
// OFFICIAL MBS LUXURY THEME PRESETS
// ============================================================
export const LUXURY_THEME_PRESETS: Record<string, ColorTheme> = {
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
    "classic-navy": {
        id: "classic-navy",
        name: "Classic Seminary",
        badge: "RECOMMENDED",
        tagline: "Distinguished Academic Cobalt",
        description: "Prestigious seminary cobalt with golden celestial accents & deep navy backdrop.",
        category: "dark",
        primary: "#1877f2",
        primaryHover: "#1464cc",
        secondary: "#f59e0b",
        secondaryHover: "#d97706",
        glow: "rgba(24, 119, 242, 0.35)",
        heroGlow: "rgba(24, 119, 242, 0.16)",
        heroBgStart: "#050a14",
        heroBgEnd: "#0a1224",
        surfaceBg: "#0a1224",
        surfaceGlass: "rgba(10, 18, 36, 0.85)",
        borderColor: "rgba(24, 119, 242, 0.25)",
        borderHighlight: "#f59e0b",
        textColor: "#FFFFFF",
        textMuted: "#94A3B8",
        gradient: "linear-gradient(180deg, #ffffff 20%, #93c5fd 65%, #f59e0b 100%)",
        cardAccent: "rgba(24, 119, 242, 0.2)",
    },
    "emerald-academic": {
        id: "emerald-academic",
        name: "Living Word Emerald",
        badge: "NATURE & GROWTH",
        tagline: "Spiritual Fruitfulness & Life",
        description: "Deep botanical forest greens & bright mint symbolizing spiritual fruitfulness and life.",
        category: "royal",
        primary: "#10b981",
        primaryHover: "#059669",
        secondary: "#34d399",
        secondaryHover: "#059669",
        glow: "rgba(16, 185, 129, 0.35)",
        heroGlow: "rgba(16, 185, 129, 0.16)",
        heroBgStart: "#020f0a",
        heroBgEnd: "#051b12",
        surfaceBg: "#051b12",
        surfaceGlass: "rgba(5, 27, 18, 0.85)",
        borderColor: "rgba(16, 185, 129, 0.25)",
        borderHighlight: "#34d399",
        textColor: "#FFFFFF",
        textMuted: "#A7F3D0",
        gradient: "linear-gradient(180deg, #ffffff 20%, #a7f3d0 65%, #10b981 100%)",
        cardAccent: "rgba(16, 185, 129, 0.2)",
    },
    "covenant-crimson": {
        id: "covenant-crimson",
        name: "Covenant Crimson & Wine",
        badge: "HISTORIC SEMINARY",
        tagline: "Sacred Covenantal Dignity",
        description: "Dignified historical wine, rich burgundy, and rose gold of ancient theological institutions.",
        category: "royal",
        primary: "#e11d48",
        primaryHover: "#be123c",
        secondary: "#fb7185",
        secondaryHover: "#e11d48",
        glow: "rgba(225, 29, 72, 0.35)",
        heroGlow: "rgba(225, 29, 72, 0.18)",
        heroBgStart: "#100307",
        heroBgEnd: "#1f070e",
        surfaceBg: "#1f070e",
        surfaceGlass: "rgba(31, 7, 14, 0.85)",
        borderColor: "rgba(225, 29, 72, 0.25)",
        borderHighlight: "#fb7185",
        textColor: "#FFFFFF",
        textMuted: "#FECDD3",
        gradient: "linear-gradient(180deg, #ffffff 20%, #fecdd3 65%, #fb7185 100%)",
        cardAccent: "rgba(225, 29, 72, 0.2)",
    },
    "royal-amethyst": {
        id: "royal-amethyst",
        name: "Royal Amethyst & Violet",
        badge: "INSPIRATIONAL",
        tagline: "Majestic Apostolic Purple",
        description: "Majestic apostolic purple with glowing violet highlights and deep velvet shadows.",
        category: "royal",
        primary: "#8b5cf6",
        primaryHover: "#7c3aed",
        secondary: "#c084fc",
        secondaryHover: "#7c3aed",
        glow: "rgba(139, 92, 246, 0.35)",
        heroGlow: "rgba(139, 92, 246, 0.18)",
        heroBgStart: "#0b0517",
        heroBgEnd: "#170b2e",
        surfaceBg: "#170b2e",
        surfaceGlass: "rgba(23, 11, 46, 0.85)",
        borderColor: "rgba(139, 92, 246, 0.25)",
        borderHighlight: "#c084fc",
        textColor: "#FFFFFF",
        textMuted: "#DDD6FE",
        gradient: "linear-gradient(180deg, #ffffff 20%, #ddd6fe 65%, #c084fc 100%)",
        cardAccent: "rgba(139, 92, 246, 0.2)",
    },
    "cyber-cyan": {
        id: "cyber-cyan",
        name: "Midnight Obsidian & Cyan",
        badge: "MODERN TECH",
        tagline: "High-Contrast Radiant Cyan",
        description: "Ultra-modern, high-contrast dark mode with radiant cyan and sapphire tones.",
        category: "dark",
        primary: "#06b6d4",
        primaryHover: "#0891b2",
        secondary: "#38bdf8",
        secondaryHover: "#0891b2",
        glow: "rgba(6, 182, 212, 0.35)",
        heroGlow: "rgba(6, 182, 212, 0.16)",
        heroBgStart: "#020617",
        heroBgEnd: "#081024",
        surfaceBg: "#081024",
        surfaceGlass: "rgba(8, 16, 36, 0.85)",
        borderColor: "rgba(6, 182, 212, 0.25)",
        borderHighlight: "#38bdf8",
        textColor: "#FFFFFF",
        textMuted: "#A5F3FC",
        gradient: "linear-gradient(180deg, #ffffff 20%, #a5f3fc 65%, #38bdf8 100%)",
        cardAccent: "rgba(6, 182, 212, 0.2)",
    },
    "desert-harvest": {
        id: "desert-harvest",
        name: "Desert Harvest & Gold",
        badge: "BIBLICAL LANDS",
        tagline: "Ancient Near-Eastern Parchment",
        description: "Warm Near-Eastern biblical tones, ancient parchment, terracotta, and amber harvest gold.",
        category: "royal",
        primary: "#f59e0b",
        primaryHover: "#d97706",
        secondary: "#fbbf24",
        secondaryHover: "#d97706",
        glow: "rgba(245, 158, 11, 0.35)",
        heroGlow: "rgba(245, 158, 11, 0.16)",
        heroBgStart: "#0f0904",
        heroBgEnd: "#1e1308",
        surfaceBg: "#1e1308",
        surfaceGlass: "rgba(30, 19, 8, 0.85)",
        borderColor: "rgba(245, 158, 11, 0.25)",
        borderHighlight: "#fbbf24",
        textColor: "#FFFFFF",
        textMuted: "#FDE68A",
        gradient: "linear-gradient(180deg, #ffffff 20%, #fde68a 65%, #f59e0b 100%)",
        cardAccent: "rgba(245, 158, 11, 0.2)",
    },
    "monochrome-titanium": {
        id: "monochrome-titanium",
        name: "Titanium Slate Minimalist",
        badge: "MINIMALIST",
        tagline: "Pure Aerospace Titanium Finish",
        description: "Refined Apple Pro titanium finish with monochrome steel and crisp silver accents.",
        category: "dark",
        primary: "#f8fafc",
        primaryHover: "#e2e8f0",
        secondary: "#94a3b8",
        secondaryHover: "#cbd5e1",
        glow: "rgba(255, 255, 255, 0.25)",
        heroGlow: "rgba(255, 255, 255, 0.1)",
        heroBgStart: "#09090b",
        heroBgEnd: "#18181b",
        surfaceBg: "#18181b",
        surfaceGlass: "rgba(24, 24, 27, 0.85)",
        borderColor: "rgba(255, 255, 255, 0.15)",
        borderHighlight: "#cbd5e1",
        textColor: "#FFFFFF",
        textMuted: "#CBD5E1",
        gradient: "linear-gradient(180deg, #ffffff 30%, #cbd5e1 65%, #94a3b8 100%)",
        cardAccent: "rgba(255, 255, 255, 0.15)",
    },
    "daylight-ivory": {
        id: "daylight-ivory",
        name: "Daylight Alabaster & Royal Navy",
        badge: "DAYTIME CLARITY",
        tagline: "Crisp Oxford Royal Blue",
        description: "Ultra-clean collegiate alabaster ivory, royal navy accents, and warm golden crest illumination.",
        category: "light",
        primary: "#1E40AF",
        primaryHover: "#1E3A8A",
        secondary: "#D97706",
        secondaryHover: "#B45309",
        glow: "rgba(30, 64, 175, 0.25)",
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
        cardAccent: "rgba(30, 64, 175, 0.15)",
    }
};

export const DEFAULT_THEME_ID = "seminary-maroon";

export function getAutoThemeId(): string {
    return DEFAULT_THEME_ID;
}

export function getEffectiveTheme(): ColorTheme {
    return LUXURY_THEME_PRESETS[DEFAULT_THEME_ID];
}

export function getThemeMode(): ThemeMode {
    return "preset";
}

export function getThemePresetId(): string {
    return DEFAULT_THEME_ID;
}

// ============================================================
// APPLY GLOBAL THEME
// Applies admin-configured theme CSS variables to the document root (:root)
// Dynamically changing ALL pages of the entire system immediately.
// ============================================================

let isApplyingTheme = false;

export function applyGlobalTheme(targetTheme?: any, skipBroadcast = false): void {
    if (typeof document === "undefined") return;
    if (isApplyingTheme) return;
    isApplyingTheme = true;

    try {
        let active = targetTheme;

        // If no explicit theme passed, read from localStorage
        if (!active && typeof window !== "undefined") {
            try {
                const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
                if (storedTheme) {
                    active = JSON.parse(storedTheme);
                } else {
                    const storedContent = localStorage.getItem("sms_landing_content");
                    if (storedContent) {
                        const parsed = JSON.parse(storedContent);
                        if (parsed?.colorTheme) {
                            active = parsed.colorTheme;
                        }
                    }
                }
            } catch {
                // ignore
            }
        }

        // Fallback to official default, auto-healing legacy emerald to official seminary maroon
        if (
            !active ||
            !active.primary ||
            active.themeId === "emerald-academic" ||
            active.id === "emerald-academic" ||
            active.primary === "#10b981" ||
            active.primary === "#059669" ||
            active.primary === "#047857"
        ) {
            active = LUXURY_THEME_PRESETS[DEFAULT_THEME_ID];
            try {
                if (typeof window !== "undefined") {
                    localStorage.removeItem(THEME_STORAGE_KEY);
                }
            } catch {}
        }

        const root = document.documentElement;

        const primary = active.primary || "#7A1526";
        const primaryHover = active.primaryHover || "#580d1b";
        const secondary = active.secondary || "#F59E0B";
        const secondaryHover = active.secondaryHover || "#D97706";
        const glow = active.glow || `${primary}45`;
        const heroGlow = active.heroGlow || `${secondary}26`;
        const heroBgStart = active.heroBgStart || "#380710";
        const heroBgEnd = active.heroBgEnd || "#120205";
        const surfaceBg = active.surfaceBg || heroBgEnd;
        const surfaceGlass = active.surfaceGlass || "rgba(35, 7, 14, 0.82)";
        const borderColor = active.borderColor || active.cardAccent || "rgba(245, 158, 11, 0.22)";
        const borderHighlight = active.borderHighlight || secondary;
        const textColor = active.textColor || "#FFFFFF";
        const textMuted = active.textMuted || "#E2D3B8";
        const gradient = active.gradient || "linear-gradient(135deg, #FFFFFF 20%, #FDE68A 65%, #F59E0B 100%)";
        const cardAccent = active.cardAccent || "rgba(122, 21, 38, 0.35)";

        if (!root.style.getPropertyValue("--theme-transition")) {
            root.style.setProperty("--theme-transition", "background 0.35s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease");
        }

        // Primary / Accent brand tokens
        root.style.setProperty("--mbs-maroon", primary);
        root.style.setProperty("--mbs-maroon-dark", primaryHover);
        root.style.setProperty("--mbs-maroon-deep", heroBgEnd);
        root.style.setProperty("--mbs-maroon-light", secondary);
        root.style.setProperty("--mbs-gold", secondary);
        root.style.setProperty("--mbs-gold-dark", secondaryHover);
        root.style.setProperty("--mbs-gold-subtle", `${secondary}26`);

        // Global unified theme tokens
        root.style.setProperty("--theme-primary", primary);
        root.style.setProperty("--theme-primary-hover", primaryHover);
        root.style.setProperty("--theme-secondary", secondary);
        root.style.setProperty("--theme-secondary-hover", secondaryHover);
        root.style.setProperty("--theme-glow", glow);
        root.style.setProperty("--theme-hero-glow", heroGlow);
        root.style.setProperty("--theme-bg-start", heroBgStart);
        root.style.setProperty("--theme-bg-end", heroBgEnd);
        root.style.setProperty("--theme-surface", surfaceBg);
        root.style.setProperty("--theme-surface-glass", surfaceGlass);
        root.style.setProperty("--theme-border", borderColor);
        root.style.setProperty("--theme-border-highlight", borderHighlight);
        root.style.setProperty("--theme-text-primary", textColor);
        root.style.setProperty("--theme-text-muted", textMuted);
        root.style.setProperty("--theme-gradient", gradient);
        root.style.setProperty("--theme-card-accent", cardAccent);

        // Public & Admin legacy bridge tokens
        root.style.setProperty("--epic-primary", primary);
        root.style.setProperty("--epic-primary-dark", primaryHover);
        root.style.setProperty("--epic-accent", secondary);
        root.style.setProperty("--epic-navy", primary);
        root.style.setProperty("--epic-blue", primary);
        root.style.setProperty("--epic-cyan", secondary);
        root.style.setProperty("--epic-bg", heroBgEnd);
        root.style.setProperty("--epic-bg-2", heroBgStart);
        root.style.setProperty("--epic-panel", surfaceGlass);

        // Apple keynote navbar variables
        root.style.setProperty("--apple-blue", primary);
        root.style.setProperty("--apple-blue-hover", primaryHover);
        root.style.setProperty("--apple-blue-light", secondary);
        root.style.setProperty("--apple-gold", secondary);

        // Root attributes
        const themeId = active.themeId || active.id || "custom";
        root.setAttribute("data-theme-id", themeId);
        root.setAttribute("data-theme-mode", "preset");
        root.setAttribute("data-color-scheme", themeId === "daylight-ivory" ? "light" : "dark");

        // Broadcast to all active components
        if (!skipBroadcast && typeof window !== "undefined") {
            window.dispatchEvent(
                new CustomEvent(THEME_CHANGED_EVENT, {
                    detail: {
                        theme: active,
                        mode: "preset"
                    }
                })
            );
        }
    } catch (err) {
        console.warn("ThemeEngine: Failed to apply global theme:", err);
    } finally {
        isApplyingTheme = false;
    }
}

export function setThemeMode(_mode?: any): void {
    applyGlobalTheme();
}

export function setThemePreset(presetId: string): void {
    if (LUXURY_THEME_PRESETS[presetId]) {
        applyGlobalTheme(LUXURY_THEME_PRESETS[presetId]);
    }
}

// ============================================================
// THEME ENGINE INITIALIZATION
// Fetches the admin-configured theme from backend and applies it immediately
// ============================================================

export function initGlobalThemeEngine(): void {
    if (typeof window === "undefined") return;

    // 1. Apply existing cached theme immediately (0 latency)
    applyGlobalTheme();

    // 2. Fetch latest admin-configured theme from backend API in background
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        fetch(`${API_BASE_URL}/theme`, {
            signal: controller.signal,
            headers: { Accept: "application/json" }
        })
            .then(res => {
                clearTimeout(timeoutId);
                if (res.ok) return res.json();
                return null;
            })
            .then(serverTheme => {
                if (serverTheme && serverTheme.primary) {
                    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(serverTheme));
                    applyGlobalTheme(serverTheme);
                }
            })
            .catch(() => {
                // Silently fallback to cached theme
            });
    } catch {
        // ignore
    }
}
