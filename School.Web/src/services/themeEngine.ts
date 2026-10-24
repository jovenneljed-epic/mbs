// ============================================================
// themeEngine.ts -> MOBILE BIBLE SCHOOL & THEOLOGICAL SEMINARY
// Official Institutional Global Theme Engine
// Permanently locked to Official Seminary Maroon & 24K Gold.
// Auto color theme system has been removed per institutional requirements.
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
// OFFICIAL MBS LUXURY THEME
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
    }
};

export const DEFAULT_THEME_ID = "seminary-maroon";

export function getAutoThemeId(): string {
    return DEFAULT_THEME_ID;
}

export function getEffectiveTheme(_mode?: ThemeMode, _presetId?: string): ColorTheme {
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
// Enforces unified Seminary Maroon & Gold across all pages
// ============================================================

export function applyGlobalTheme(targetTheme?: ColorTheme, _mode?: ThemeMode): void {
    if (typeof document === "undefined") return;

    try {
        const activeTheme = targetTheme || LUXURY_THEME_PRESETS[DEFAULT_THEME_ID];
        const root = document.documentElement;

        if (!root.style.getPropertyValue("--theme-transition")) {
            root.style.setProperty("--theme-transition", "background 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease");
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

        // Set Root HTML attributes
        root.setAttribute("data-theme-id", activeTheme.id);
        root.setAttribute("data-theme-mode", "preset");
        root.setAttribute("data-color-scheme", "dark");

        if (typeof window !== "undefined") {
            window.dispatchEvent(
                new CustomEvent(THEME_CHANGED_EVENT, {
                    detail: {
                        theme: activeTheme,
                        mode: "preset"
                    }
                })
            );
        }
    } catch (err) {
        console.warn("ThemeEngine: Failed to apply global theme:", err);
    }
}

export function setThemeMode(_mode: ThemeMode): void {
    applyGlobalTheme();
}

export function setThemePreset(_presetId: string): void {
    applyGlobalTheme();
}

// ============================================================
// THEME ENGINE INITIALIZATION
// ============================================================

export function initGlobalThemeEngine(): void {
    if (typeof window === "undefined") return;

    // Clear any obsolete auto-theme or old preset storage
    try {
        localStorage.removeItem(THEME_MODE_STORAGE_KEY);
        localStorage.removeItem(THEME_PRESET_STORAGE_KEY);
    } catch {
        // ignore
    }

    applyGlobalTheme();
}
