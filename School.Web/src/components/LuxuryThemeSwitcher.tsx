// ============================================================
// LuxuryThemeSwitcher.tsx -> MOBILE BIBLE SCHOOL
// Premium Apple/Stripe-tier Global Theme Switcher
// Supports 1-Click Adaptive Auto (Zero Configuration) + Handcrafted Luxury Presets
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import {
    Sparkles,
    Clock,
    Check,
    Palette,
    ChevronDown,
    Zap
} from "lucide-react";
import {
    LUXURY_THEME_PRESETS,
    getThemeMode,
    getEffectiveTheme,
    setThemeMode,
    setThemePreset,
    THEME_CHANGED_EVENT,
    type ThemeMode,
    type ColorTheme
} from "../services/themeEngine";
import "./LuxuryThemeSwitcher.css";

interface LuxuryThemeSwitcherProps {
    variant?: "header" | "floating" | "minimal";
    className?: string;
}

export const LuxuryThemeSwitcher: React.FC<LuxuryThemeSwitcherProps> = ({
    variant = "header",
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMode, setCurrentMode] = useState<ThemeMode>(getThemeMode());
    const [activeTheme, setActiveTheme] = useState<ColorTheme>(getEffectiveTheme());
    const [currentTimeString, setCurrentTimeString] = useState<string>("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Update time display
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            setCurrentTimeString(timeStr);
        };
        updateTime();
        const interval = setInterval(updateTime, 30000);
        return () => clearInterval(interval);
    }, []);

    // Listen for global theme changes
    useEffect(() => {
        const handleThemeChange = (e: any) => {
            if (e?.detail) {
                if (e.detail.theme) setActiveTheme(e.detail.theme);
                if (e.detail.mode) setCurrentMode(e.detail.mode);
            } else {
                setCurrentMode(getThemeMode());
                setActiveTheme(getEffectiveTheme());
            }
        };

        window.addEventListener(THEME_CHANGED_EVENT, handleThemeChange);
        return () => window.removeEventListener(THEME_CHANGED_EVENT, handleThemeChange);
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleOutsideClick);
        }
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [isOpen]);

    // Handlers
    const handleSelectAuto = () => {
        setThemeMode("auto");
        setCurrentMode("auto");
        setActiveTheme(getEffectiveTheme("auto"));
    };

    const handleSelectPreset = (presetId: string) => {
        setThemePreset(presetId);
        setCurrentMode("preset");
        if (LUXURY_THEME_PRESETS[presetId]) {
            setActiveTheme(LUXURY_THEME_PRESETS[presetId]);
        }
    };

    const isAuto = currentMode === "auto";

    return (
        <div
            className={`luxury-theme-switcher ${variant} ${className}`}
            ref={dropdownRef}
        >
            {/* Main Trigger Pill */}
            <button
                type="button"
                className={`theme-trigger-pill ${isAuto ? "is-auto" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label="Toggle Luxury Theme System"
                title="Customize or switch website global color theme"
            >
                {/* Visual Swatch Indicator */}
                <div className="theme-pill-swatch">
                    <span
                        className="swatch-dot primary-dot"
                        style={{ background: activeTheme.primary }}
                    />
                    <span
                        className="swatch-dot secondary-dot"
                        style={{ background: activeTheme.secondary }}
                    />
                </div>

                {/* Status / Label */}
                <div className="theme-pill-label">
                    {isAuto ? (
                        <>
                            <Zap size={13} className="text-amber-400 fill-amber-400" />
                            <span>Auto Theme</span>
                        </>
                    ) : (
                        <span>{activeTheme.name.split("&")[0] || activeTheme.name}</span>
                    )}
                </div>

                <ChevronDown
                    size={13}
                    className={`theme-arrow ${isOpen ? "rotated" : ""}`}
                />
            </button>

            {/* Glassmorphism Luxury Popover */}
            {isOpen && (
                <div className="luxury-theme-popover animate-luxury-pop">
                    {/* Header */}
                    <div className="theme-popover-header">
                        <div className="flex items-center gap-2">
                            <Palette size={16} className="text-amber-400" />
                            <h4>Website Theme &amp; Ambience</h4>
                        </div>
                        <span className="live-status-chip">
                            <span className="pulse-dot" />
                            Global Real-Time
                        </span>
                    </div>

                    {/* Auto Mode Spotlight Card */}
                    <div
                        className={`auto-mode-card ${isAuto ? "active" : ""}`}
                        onClick={handleSelectAuto}
                    >
                        <div className="auto-card-left">
                            <div className="auto-icon-badge">
                                <Sparkles size={17} />
                            </div>
                            <div className="auto-text-group">
                                <div className="flex items-center gap-2">
                                    <strong>Automatic Ambient (Zero Config)</strong>
                                    <span className="recommended-tag">RECOMMENDED</span>
                                </div>
                                <p>
                                    Seamlessly adapts between Morning Light, Golden Dusk, and Midnight Celestial based on local time ({currentTimeString}).
                                </p>
                            </div>
                        </div>

                        <div className="auto-card-action">
                            {isAuto ? (
                                <div className="active-check-circle">
                                    <Check size={14} />
                                </div>
                            ) : (
                                <button type="button" className="enable-auto-btn">
                                    Enable
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Preset Section Header */}
                    <div className="theme-divider">
                        <span>OR SELECT HANDCRAFTED PRESET</span>
                    </div>

                    {/* Luxury Theme Presets Grid */}
                    <div className="luxury-presets-grid">
                        {Object.values(LUXURY_THEME_PRESETS).map((preset) => {
                            const isSelected = !isAuto && activeTheme.id === preset.id;
                            return (
                                <div
                                    key={preset.id}
                                    className={`preset-theme-card ${isSelected ? "selected" : ""}`}
                                    onClick={() => handleSelectPreset(preset.id)}
                                >
                                    {/* Preview Swatch Bar */}
                                    <div
                                        className="preset-preview-gradient"
                                        style={{
                                            background: `linear-gradient(135deg, ${preset.heroBgStart} 0%, ${preset.primary} 50%, ${preset.secondary} 100%)`
                                        }}
                                    >
                                        <div className="dual-color-badges">
                                            <span style={{ background: preset.primary }} />
                                            <span style={{ background: preset.secondary }} />
                                        </div>
                                    </div>

                                    {/* Content Info */}
                                    <div className="preset-card-body">
                                        <div className="preset-top-line">
                                            <span className="preset-title">{preset.name}</span>
                                            {isSelected && <Check size={14} className="text-amber-400" />}
                                        </div>
                                        <span className="preset-badge">{preset.badge}</span>
                                        <p className="preset-desc">{preset.tagline}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Insight */}
                    <div className="theme-popover-footer">
                        <Clock size={12} />
                        <span>Changes apply globally across all landing pages, seminary calendar, and portals.</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LuxuryThemeSwitcher;
