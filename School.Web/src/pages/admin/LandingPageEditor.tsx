import React, { useState, useEffect } from "react";
import "./LandingPageEditor.css";
import {
    getLandingPageContent,
    saveLandingPageContent,
    resetLandingPageContent,
    applyGlobalTheme,
    COLOR_THEME_PRESETS,
    type LandingPageContent,
    type FieldModuleItem,
    type PromoVideoSettings,
    type ColorThemeSettings
} from "../../services/landingPageContent";
import { PromoVideoPlayer } from "../../components/PromoVideoPlayer";
import {
    saveVideoMedia,
    deleteVideoMedia,
    formatFileSize
} from "../../services/videoMediaStorage";
import {
    FileEdit,
    Globe,
    RotateCcw,
    Save,
    CheckCircle2,
    Sparkles,
    BookOpen,
    Layers,
    Film,
    Tv,
    Play,
    UploadCloud,
    Trash2,
    Video,
    Palette
} from "lucide-react";

interface LandingPageEditorProps {
    onNavigateToSite?: () => void;
}

export const LandingPageEditor: React.FC<LandingPageEditorProps> = ({ onNavigateToSite }) => {
    const [content, setContent] = useState<LandingPageContent>(getLandingPageContent);
    const [activeTab, setActiveTab] = useState<"hero" | "theme" | "video" | "banner" | "modules" | "preview">("hero");
    const [savedNotification, setSavedNotification] = useState(false);

    useEffect(() => {
        setContent(getLandingPageContent());
    }, []);

    const handleChange = (field: keyof LandingPageContent, value: string) => {
        setContent(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSelectTheme = (themeId: string) => {
        const preset = COLOR_THEME_PRESETS[themeId];
        if (preset) {
            setContent(prev => ({
                ...prev,
                colorTheme: { ...preset }
            }));
            applyGlobalTheme(preset);
        }
    };

    const handleCustomColorChange = (field: keyof ColorThemeSettings, value: string) => {
        setContent(prev => {
            const nextTheme = {
                ...prev.colorTheme,
                themeId: "custom",
                name: "Custom Palette",
                badge: "CUSTOM",
                description: "User customized color palette",
                [field]: value
            };
            applyGlobalTheme(nextTheme);
            return {
                ...prev,
                colorTheme: nextTheme
            };
        });
    };

    const handleVideoSettingChange = (field: keyof PromoVideoSettings, value: any) => {
        setContent(prev => ({
            ...prev,
            promoVideo: {
                ...prev.promoVideo,
                [field]: value,
            },
        }));
    };

    const handleModuleChange = (index: number, field: keyof FieldModuleItem, value: any) => {
        setContent(prev => {
            const updated = [...prev.modules];
            updated[index] = {
                ...updated[index],
                [field]: value,
            };
            return {
                ...prev,
                modules: updated,
            };
        });
    };

    const handlePromoVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const res = await saveVideoMedia("promo_main", file);
            setContent(prev => ({
                ...prev,
                promoVideo: {
                    ...prev.promoVideo,
                    mode: "uploaded",
                    uploadedVideoUrl: res.url,
                    uploadedVideoName: res.name,
                    uploadedVideoSize: res.size,
                },
            }));
            setSavedNotification(true);
            setTimeout(() => setSavedNotification(false), 3000);
        } catch (err) {
            console.error("Error saving promotional video:", err);
            alert("Failed to process uploaded video. Please check file format.");
        }
    };

    const handlePromoVideoRemove = async () => {
        if (window.confirm("Remove uploaded promotional video?")) {
            await deleteVideoMedia("promo_main");
            setContent(prev => ({
                ...prev,
                promoVideo: {
                    ...prev.promoVideo,
                    mode: "cinematic",
                    uploadedVideoUrl: undefined,
                    uploadedVideoName: undefined,
                    uploadedVideoSize: undefined,
                },
            }));
        }
    };

    const handleSlideVideoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const module = content.modules[index];
        const key = `slide_${module.id || index}`;

        try {
            const res = await saveVideoMedia(key, file);
            setContent(prev => {
                const updated = [...prev.modules];
                updated[index] = {
                    ...updated[index],
                    videoUrl: res.url,
                    videoName: res.name,
                    videoSize: res.size,
                };
                return {
                    ...prev,
                    modules: updated,
                };
            });
            setSavedNotification(true);
            setTimeout(() => setSavedNotification(false), 3000);
        } catch (err) {
            console.error("Error saving slide video:", err);
            alert("Failed to process slide video.");
        }
    };

    const handleSlideVideoRemove = async (index: number) => {
        const module = content.modules[index];
        const key = `slide_${module.id || index}`;
        await deleteVideoMedia(key);

        setContent(prev => {
            const updated = [...prev.modules];
            updated[index] = {
                ...updated[index],
                videoUrl: undefined,
                videoName: undefined,
                videoSize: undefined,
            };
            return {
                ...prev,
                modules: updated,
            };
        });
    };

    const handleSave = () => {
        saveLandingPageContent(content);
        setSavedNotification(true);
        setTimeout(() => setSavedNotification(false), 4000);
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all landing page customizations back to factory defaults?")) {
            const defaults = resetLandingPageContent();
            setContent(defaults);
            setSavedNotification(true);
            setTimeout(() => setSavedNotification(false), 3000);
        }
    };

    return (
        <div className="landing-editor-page">
            {/* TOP HEADER */}
            <header className="landing-editor-header">
                <div className="landing-editor-title-box">
                    <h1>
                        <FileEdit size={24} color="#1877f2" />
                        Landing Page Editor (CMS)
                    </h1>
                    <p>Customize your public website headlines, announcements, cohort modules, and branding in real-time.</p>
                </div>

                <div className="landing-editor-actions">
                    <button
                        type="button"
                        className="btn-editor-preview"
                        onClick={() => {
                            if (onNavigateToSite) {
                                onNavigateToSite();
                            } else {
                                window.open("/", "_blank");
                            }
                        }}
                        title="View live public landing page"
                    >
                        <Globe size={15} />
                        <span>Preview Live Website</span>
                    </button>

                    <button
                        type="button"
                        className="btn-editor-reset"
                        onClick={handleReset}
                        title="Reset to original Mobile Bible School defaults"
                    >
                        <RotateCcw size={15} />
                        <span>Reset Defaults</span>
                    </button>

                    <button
                        type="button"
                        className="btn-editor-save"
                        onClick={handleSave}
                    >
                        <Save size={15} />
                        <span>Save Changes</span>
                    </button>
                </div>
            </header>

            {/* SAVED NOTIFICATION */}
            {savedNotification && (
                <div className="editor-alert-banner">
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CheckCircle2 size={18} />
                        Landing page content saved successfully! Your live homepage has been updated.
                    </span>
                    <button
                        type="button"
                        className="btn-editor-preview"
                        onClick={() => {
                            if (onNavigateToSite) onNavigateToSite();
                            else window.open("/", "_blank");
                        }}
                        style={{ padding: "4px 10px", fontSize: 12 }}
                    >
                        View Live Site →
                    </button>
                </div>
            )}

            {/* TABS */}
            <div className="editor-tabs">
                <button
                    type="button"
                    className={`editor-tab-btn ${activeTab === "hero" ? "active" : ""}`}
                    onClick={() => setActiveTab("hero")}
                >
                    <Sparkles size={16} />
                    <span>Hero &amp; Branding</span>
                </button>

                <button
                    type="button"
                    className={`editor-tab-btn ${activeTab === "theme" ? "active" : ""}`}
                    onClick={() => setActiveTab("theme")}
                >
                    <Palette size={16} />
                    <span>🎨 Color Theme</span>
                </button>

                <button
                    type="button"
                    className={`editor-tab-btn ${activeTab === "video" ? "active" : ""}`}
                    onClick={() => setActiveTab("video")}
                >
                    <Film size={16} />
                    <span>🎬 Promotional Video</span>
                </button>

                <button
                    type="button"
                    className={`editor-tab-btn ${activeTab === "banner" ? "active" : ""}`}
                    onClick={() => setActiveTab("banner")}
                >
                    <BookOpen size={16} />
                    <span>Announcement Ribbon</span>
                </button>

                <button
                    type="button"
                    className={`editor-tab-btn ${activeTab === "modules" ? "active" : ""}`}
                    onClick={() => setActiveTab("modules")}
                >
                    <Layers size={16} />
                    <span>Cohort Field Modules ({content.modules.length})</span>
                </button>

                <button
                    type="button"
                    className={`editor-tab-btn ${activeTab === "preview" ? "active" : ""}`}
                    onClick={() => setActiveTab("preview")}
                >
                    <Globe size={16} />
                    <span>Instant Preview</span>
                </button>
            </div>

            {/* TAB 1: HERO & BRANDING */}
            {activeTab === "hero" && (
                <div className="editor-card">
                    <h3>
                        <Sparkles size={18} color="#1877f2" />
                        Hero Section &amp; School Identity
                    </h3>

                    <div className="editor-form-grid">
                        <div className="editor-field-group">
                            <label>School Name (Brand Title)</label>
                            <input
                                type="text"
                                value={content.schoolName}
                                onChange={e => handleChange("schoolName", e.target.value)}
                                placeholder="e.g. Mobile Bible School"
                            />
                            <span className="editor-field-hint">Displayed on top navbar and footers</span>
                        </div>

                        <div className="editor-field-group">
                            <label>Brand Badge / Tagline</label>
                            <input
                                type="text"
                                value={content.brandTagline}
                                onChange={e => handleChange("brandTagline", e.target.value)}
                                placeholder="e.g. INTERNATIONAL"
                            />
                        </div>

                        <div className="editor-field-group editor-form-full">
                            <label>Hero Top Eyebrow Badge</label>
                            <input
                                type="text"
                                value={content.heroBadge}
                                onChange={e => handleChange("heroBadge", e.target.value)}
                                placeholder="e.g. ACCREDITED THEOLOGICAL EDUCATION • ZERO RELOCATION"
                            />
                        </div>

                        <div className="editor-field-group">
                            <label>Main Headline (Line 1 - White)</label>
                            <input
                                type="text"
                                value={content.heroTitleWhite}
                                onChange={e => handleChange("heroTitleWhite", e.target.value)}
                                placeholder="e.g. Deep Biblical Truth."
                            />
                        </div>

                        <div className="editor-field-group">
                            <label>Headline Highlight (Line 2 - Gradient)</label>
                            <input
                                type="text"
                                value={content.heroTitleGradient}
                                onChange={e => handleChange("heroTitleGradient", e.target.value)}
                                placeholder="e.g. Everywhere You Are Called."
                            />
                        </div>

                        <div className="editor-field-group editor-form-full">
                            <label>Hero Description / Subtitle</label>
                            <textarea
                                rows={3}
                                value={content.heroSubtitle}
                                onChange={e => handleChange("heroSubtitle", e.target.value)}
                                placeholder="Describe the mission and value proposition..."
                            />
                        </div>

                        <div className="editor-field-group">
                            <label>Primary CTA Button Label</label>
                            <input
                                type="text"
                                value={content.ctaPrimary}
                                onChange={e => handleChange("ctaPrimary", e.target.value)}
                                placeholder="e.g. Apply for Admission"
                            />
                        </div>

                        <div className="editor-field-group">
                            <label>Secondary CTA Button Label</label>
                            <input
                                type="text"
                                value={content.ctaSecondary}
                                onChange={e => handleChange("ctaSecondary", e.target.value)}
                                placeholder="e.g. Explore Field Modules"
                            />
                        </div>

                        <div className="editor-field-group">
                            <label>Highlight Guarantee 1</label>
                            <input
                                type="text"
                                value={content.guarantee1}
                                onChange={e => handleChange("guarantee1", e.target.value)}
                                placeholder="e.g. 100% Mobile & Modular"
                            />
                        </div>

                        <div className="editor-field-group">
                            <label>Highlight Guarantee 2</label>
                            <input
                                type="text"
                                value={content.guarantee2}
                                onChange={e => handleChange("guarantee2", e.target.value)}
                                placeholder="e.g. Keep Working Full-Time"
                            />
                        </div>

                        <div className="editor-field-group editor-form-full">
                            <label>Highlight Guarantee 3</label>
                            <input
                                type="text"
                                value={content.guarantee3}
                                onChange={e => handleChange("guarantee3", e.target.value)}
                                placeholder="e.g. 80% Subsidized Tuition"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: COLOR THEME SELECTOR */}
            {activeTab === "theme" && (
                <div className="editor-card theme-editor-card">
                    <div className="theme-editor-header">
                        <div>
                            <h3>
                                <Palette size={20} color="#1877f2" />
                                Landing Page Color Theme &amp; Visual Identity
                            </h3>
                            <p style={{ margin: "4px 0 0", color: "#65676b", fontSize: "13px" }}>
                                Choose from 7 calibrated academic themes or fine-tune a custom color scheme. Updates live homepage buttons, badges, gradients, and glows immediately.
                            </p>
                        </div>
                        <div className="theme-active-indicator">
                            <span className="theme-swatch-dot" style={{ background: content.colorTheme?.primary || "#1877f2" }} />
                            <span>Active: <strong>{content.colorTheme?.name || "Custom Palette"}</strong></span>
                            <span className="theme-badge-pill" style={{ background: content.colorTheme?.primary || "#1877f2", color: "#fff" }}>
                                {content.colorTheme?.badge || "ACTIVE"}
                            </span>
                        </div>
                    </div>

                    {/* PRESET CARDS GRID */}
                    <div className="theme-presets-grid">
                        {Object.values(COLOR_THEME_PRESETS).map((preset) => {
                            const isSelected = content.colorTheme?.themeId === preset.themeId;
                            return (
                                <div
                                    key={preset.themeId}
                                    className={`theme-preset-card ${isSelected ? "selected" : ""}`}
                                    onClick={() => handleSelectTheme(preset.themeId)}
                                >
                                    <div className="theme-preset-card-top">
                                        <div className="theme-swatches-strip">
                                            <span
                                                className="swatch-segment"
                                                style={{ background: preset.heroBgEnd }}
                                                title={`Dark Base: ${preset.heroBgEnd}`}
                                            />
                                            <span
                                                className="swatch-segment"
                                                style={{ background: preset.primary }}
                                                title={`Primary: ${preset.primary}`}
                                            />
                                            <span
                                                className="swatch-segment"
                                                style={{ background: preset.secondary }}
                                                title={`Secondary: ${preset.secondary}`}
                                            />
                                            <span
                                                className="swatch-segment"
                                                style={{ background: preset.gradient }}
                                                title="Heading Gradient"
                                            />
                                        </div>
                                        <span className="theme-card-badge">{preset.badge}</span>
                                    </div>

                                    <div className="theme-preset-info">
                                        <h4>{preset.name}</h4>
                                        <p>{preset.description}</p>
                                    </div>

                                    <div className="theme-preset-footer">
                                        <div className="theme-hex-tags">
                                            <span className="hex-tag" style={{ borderLeft: `3px solid ${preset.primary}` }}>
                                                {preset.primary}
                                            </span>
                                            <span className="hex-tag" style={{ borderLeft: `3px solid ${preset.secondary}` }}>
                                                {preset.secondary}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className={`btn-select-theme ${isSelected ? "active" : ""}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectTheme(preset.themeId);
                                            }}
                                        >
                                            {isSelected ? "✓ Active" : "Select Theme"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* LIVE KEYNOTE PREVIEW SANDBOX */}
                    <div className="theme-live-preview-box" style={{
                        background: `radial-gradient(circle at 50% 20%, ${content.colorTheme?.heroGlow || "rgba(24,119,242,0.16)"} 0%, transparent 70%), linear-gradient(180deg, ${content.colorTheme?.heroBgStart || "#050a14"} 0%, ${content.colorTheme?.heroBgEnd || "#0a1224"} 100%)`,
                        borderColor: content.colorTheme?.cardAccent || "rgba(255, 255, 255, 0.15)"
                    }}>
                        <div className="preview-watermark">
                            <span>LIVE HOMEPAGE HERO PREVIEW</span>
                        </div>

                        <div className="preview-hero-content">
                            <span
                                className="preview-hero-badge"
                                style={{
                                    color: content.colorTheme?.secondary || "#f59e0b",
                                    borderColor: content.colorTheme?.primary || "#1877f2",
                                    boxShadow: `0 0 12px ${content.colorTheme?.glow || "rgba(24,119,242,0.35)"}`
                                }}
                            >
                                ★ {content.heroBadge || "ACCREDITED THEOLOGICAL EDUCATION"}
                            </span>

                            <h2 className="preview-hero-title">
                                <span style={{ color: "#ffffff", display: "block" }}>
                                    {content.heroTitleWhite || "Deep Biblical Truth."}
                                </span>
                                <span style={{
                                    background: content.colorTheme?.gradient || "linear-gradient(180deg, #ffffff 20%, #93c5fd 65%, #f59e0b 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    display: "block"
                                }}>
                                    {content.heroTitleGradient || "Everywhere You Are Called."}
                                </span>
                            </h2>

                            <p className="preview-hero-subtitle">
                                {content.heroSubtitle || "Mobile Bible School delivers rigorous, Christ-centered seminary instruction directly to local churches."}
                            </p>

                            <div className="preview-hero-ctas">
                                <button
                                    type="button"
                                    className="preview-btn-primary"
                                    style={{
                                        background: content.colorTheme?.primary || "#1877f2",
                                        boxShadow: `0 4px 18px ${content.colorTheme?.glow || "rgba(24,119,242,0.35)"}`
                                    }}
                                >
                                    {content.ctaPrimary || "Apply for Admission"} →
                                </button>
                                <button type="button" className="preview-btn-ghost">
                                    {content.ctaSecondary || "Explore Field Modules"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CUSTOM COLOR PALETTE TUNER */}
                    <div className="custom-theme-tuner">
                        <h4>
                            <Sparkles size={16} color="#1877f2" />
                            Fine-Tune Custom Color Palette
                        </h4>
                        <p style={{ margin: "2px 0 16px", fontSize: "12px", color: "#65676b" }}>
                            Want a bespoke look? Pick exact hex colors below. Changes will be saved as your Custom Palette.
                        </p>

                        <div className="tuner-form-grid">
                            <div className="tuner-field">
                                <label>Primary Accent Color (Buttons &amp; Active Rings)</label>
                                <div className="color-picker-row">
                                    <input
                                        type="color"
                                        value={content.colorTheme?.primary?.startsWith("#") ? content.colorTheme.primary : "#1877f2"}
                                        onChange={(e) => {
                                            handleCustomColorChange("primary", e.target.value);
                                            handleCustomColorChange("glow", `${e.target.value}55`);
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={content.colorTheme?.primary || "#1877f2"}
                                        onChange={(e) => handleCustomColorChange("primary", e.target.value)}
                                        placeholder="#1877f2"
                                    />
                                </div>
                            </div>

                            <div className="tuner-field">
                                <label>Secondary Highlight (Badges &amp; Gold Accents)</label>
                                <div className="color-picker-row">
                                    <input
                                        type="color"
                                        value={content.colorTheme?.secondary?.startsWith("#") ? content.colorTheme.secondary : "#f59e0b"}
                                        onChange={(e) => handleCustomColorChange("secondary", e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        value={content.colorTheme?.secondary || "#f59e0b"}
                                        onChange={(e) => handleCustomColorChange("secondary", e.target.value)}
                                        placeholder="#f59e0b"
                                    />
                                </div>
                            </div>

                            <div className="tuner-field">
                                <label>Hero Background (Top Tint)</label>
                                <div className="color-picker-row">
                                    <input
                                        type="color"
                                        value={content.colorTheme?.heroBgStart?.startsWith("#") ? content.colorTheme.heroBgStart : "#050a14"}
                                        onChange={(e) => handleCustomColorChange("heroBgStart", e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        value={content.colorTheme?.heroBgStart || "#050a14"}
                                        onChange={(e) => handleCustomColorChange("heroBgStart", e.target.value)}
                                        placeholder="#050a14"
                                    />
                                </div>
                            </div>

                            <div className="tuner-field">
                                <label>Hero Background (Bottom Tint)</label>
                                <div className="color-picker-row">
                                    <input
                                        type="color"
                                        value={content.colorTheme?.heroBgEnd?.startsWith("#") ? content.colorTheme.heroBgEnd : "#0a1224"}
                                        onChange={(e) => handleCustomColorChange("heroBgEnd", e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        value={content.colorTheme?.heroBgEnd || "#0a1224"}
                                        onChange={(e) => handleCustomColorChange("heroBgEnd", e.target.value)}
                                        placeholder="#0a1224"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="tuner-actions" style={{ marginTop: 20 }}>
                            <button
                                type="button"
                                className="btn-editor-save"
                                onClick={handleSave}
                            >
                                <Save size={15} />
                                <span>Save Color Theme Changes</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: PROMOTIONAL VIDEO EDITOR */}
            {activeTab === "video" && (
                <div className="editor-card">
                    <h3>
                        <Film size={18} color="#1877f2" />
                        Automatic Promotional Video Showcase
                    </h3>
                    <p style={{ margin: "4px 0 16px", color: "#65676b", fontSize: "13px" }}>
                        Configure the promotional video that automatically plays on your public landing page.
                        Upload an institutional video file (MP4/WebM) or embed a video stream from YouTube, Vimeo, or direct MP4.
                    </p>

                    {/* PLAYBACK MODE SELECTOR */}
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#050505", display: "block", marginBottom: 8 }}>
                        Video Presentation Source
                    </label>
                    <div className="editor-mode-toggle-group">
                        <button
                            type="button"
                            className={`editor-mode-btn ${content.promoVideo.mode === "uploaded" ? "active" : ""}`}
                            onClick={() => handleVideoSettingChange("mode", "uploaded")}
                        >
                            <UploadCloud size={16} />
                            <span>📁 Upload Video File (MP4, WebM, MOV)</span>
                        </button>

                        <button
                            type="button"
                            className={`editor-mode-btn ${content.promoVideo.mode === "embed" || content.promoVideo.mode === "cinematic" ? "active" : ""}`}
                            onClick={() => handleVideoSettingChange("mode", "embed")}
                        >
                            <Tv size={16} />
                            <span>📺 External Stream URL (YouTube / Vimeo / MP4 Link)</span>
                        </button>
                    </div>

                    {/* VIDEO UPLOAD DROPZONE / BANNER */}
                    {content.promoVideo.uploadedVideoUrl ? (
                        <div className="video-uploaded-file-banner">
                            <div className="video-file-info">
                                <Video size={22} color="#30d158" />
                                <div>
                                    <div style={{ fontWeight: 700 }}>
                                        {content.promoVideo.uploadedVideoName || "Custom Promotional Video"}
                                    </div>
                                    <div style={{ fontSize: 11, color: "#65676b" }}>
                                        Size: {formatFileSize(content.promoVideo.uploadedVideoSize)} • Stored locally for instant automatic playback
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <label
                                    className="btn-editor-preview"
                                    style={{ cursor: "pointer", margin: 0, padding: "6px 12px", fontSize: 12 }}
                                >
                                    Replace Video
                                    <input
                                        type="file"
                                        accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                        style={{ display: "none" }}
                                        onChange={handlePromoVideoUpload}
                                    />
                                </label>
                                <button
                                    type="button"
                                    className="btn-remove-video"
                                    onClick={handlePromoVideoRemove}
                                >
                                    <Trash2 size={13} />
                                    <span>Remove</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label className="video-upload-dropzone">
                            <input
                                type="file"
                                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                style={{ display: "none" }}
                                onChange={handlePromoVideoUpload}
                            />
                            <div className="video-upload-icon">
                                <UploadCloud size={36} />
                            </div>
                            <div className="video-upload-text-main">
                                Click or Drag &amp; Drop to Upload Promotional Video
                            </div>
                            <div className="video-upload-text-sub">
                                Supports MP4, WebM, MOV files up to 500MB • Stored directly in browser for instant playback
                            </div>
                        </label>
                    )}

                    {/* GENERAL VIDEO METADATA */}
                    <div className="editor-form-grid">
                        <div className="editor-field-group editor-form-full">
                            <label>External Stream Video URL (YouTube, Vimeo, or direct .mp4)</label>
                            <input
                                type="text"
                                value={content.promoVideo.videoUrl}
                                onChange={e => handleVideoSettingChange("videoUrl", e.target.value)}
                                placeholder="e.g. https://www.youtube.com/watch?v=... or https://vimeo.com/... or https://domain.com/video.mp4"
                            />
                            <span className="editor-field-hint">
                                Paste any YouTube link, Vimeo link, or direct MP4 URL. If empty, the system automatically uses the official seminary showcase.
                            </span>
                        </div>

                        <div className="editor-field-group">
                            <label>Video Badge Tag</label>
                            <input
                                type="text"
                                value={content.promoVideo.badgeText}
                                onChange={e => handleVideoSettingChange("badgeText", e.target.value)}
                                placeholder="e.g. OFFICIAL PROMOTIONAL VIDEO • 4K"
                            />
                            <span className="editor-field-hint">Top right badge on video frame</span>
                        </div>

                        <div className="editor-field-group">
                            <label>Video Overlay CTA Button Label</label>
                            <input
                                type="text"
                                value={content.promoVideo.ctaText}
                                onChange={e => handleVideoSettingChange("ctaText", e.target.value)}
                                placeholder="e.g. Apply for Admission"
                            />
                        </div>

                        <div className="editor-field-group editor-form-full">
                            <label>Video Main Title</label>
                            <input
                                type="text"
                                value={content.promoVideo.videoTitle}
                                onChange={e => handleVideoSettingChange("videoTitle", e.target.value)}
                                placeholder="e.g. Mobile Bible School: Life, Doctrine & Ministry"
                            />
                        </div>

                        <div className="editor-field-group editor-form-full">
                            <label>Video Tagline / Subtitle</label>
                            <textarea
                                rows={2}
                                value={content.promoVideo.videoTagline}
                                onChange={e => handleVideoSettingChange("videoTagline", e.target.value)}
                                placeholder="Overview description of this promotional video..."
                            />
                        </div>

                        {/* PLAYBACK BEHAVIOR TOGGLES */}
                        <div className="editor-field-group editor-form-full" style={{ background: "#f0f2f5", padding: "16px", borderRadius: "10px" }}>
                            <label style={{ fontSize: "13px", fontWeight: 700, marginBottom: "8px", display: "block" }}>
                                Automatic Playback Settings
                            </label>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                    <input
                                        type="checkbox"
                                        checked={content.promoVideo.autoPlay ?? true}
                                        onChange={e => handleVideoSettingChange("autoPlay", e.target.checked)}
                                        style={{ width: "16px", height: "16px" }}
                                    />
                                    <span><strong>Autoplay Video on Landing Page:</strong> Video starts playing automatically when visitors view the page.</span>
                                </label>

                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                    <input
                                        type="checkbox"
                                        checked={content.promoVideo.loop ?? true}
                                        onChange={e => handleVideoSettingChange("loop", e.target.checked)}
                                        style={{ width: "16px", height: "16px" }}
                                    />
                                    <span><strong>Loop Continuously:</strong> Seamlessly restart video from beginning when playback finishes.</span>
                                </label>

                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                    <input
                                        type="checkbox"
                                        checked={content.promoVideo.muted ?? true}
                                        onChange={e => handleVideoSettingChange("muted", e.target.checked)}
                                        style={{ width: "16px", height: "16px" }}
                                    />
                                    <span><strong>Muted by Default:</strong> Recommended for modern browsers to guarantee video autoplays without being blocked. Visitors can unmute anytime with 1 click.</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* LIVE INTERACTIVE VIDEO PLAYER PREVIEW */}
                    <div className="video-live-player-preview-card" style={{ marginTop: "24px" }}>
                        <h4>
                            <Play size={16} fill="#2997ff" />
                            LIVE AUTOMATIC PROMOTIONAL VIDEO PREVIEW
                        </h4>
                        <PromoVideoPlayer
                            settings={content.promoVideo}
                            onApplyClick={() => {
                                if (onNavigateToSite) onNavigateToSite();
                                else window.open("/", "_blank");
                            }}
                        />
                    </div>
                </div>
            )}

            {/* TAB 2: ANNOUNCEMENT RIBBON */}
            {activeTab === "banner" && (
                <div className="editor-card">
                    <h3>
                        <BookOpen size={18} color="#1877f2" />
                        Top Announcement Ribbon
                    </h3>

                    <div className="editor-form-grid">
                        <div className="editor-field-group editor-form-full">
                            <label>Announcement Banner Message</label>
                            <textarea
                                rows={3}
                                value={content.ribbonText}
                                onChange={e => handleChange("ribbonText", e.target.value)}
                                placeholder="e.g. Spring & Summer 2027 Mobile Modular Cohorts..."
                            />
                            <span className="editor-field-hint">This ribbon sits at the very top of the public website.</span>
                        </div>

                        <div className="editor-field-group">
                            <label>Ribbon Link Button Text</label>
                            <input
                                type="text"
                                value={content.ribbonCta}
                                onChange={e => handleChange("ribbonCta", e.target.value)}
                                placeholder="e.g. Host a Mobile Cohort"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: COHORT MODULES */}
            {activeTab === "modules" && (
                <div className="editor-card">
                    <h3>
                        <Layers size={18} color="#1877f2" />
                        Featured Field Intensives &amp; Cohort Modules
                    </h3>

                    {/* SECTION HEADLINE & SUBHEADLINE SETTINGS */}
                    <div style={{ background: "#f7f8fa", border: "1px solid #e4e6eb", borderRadius: "10px", padding: "16px 20px", marginBottom: "24px" }}>
                        <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 700, color: "#050505" }}>
                            Carousel Section Headline (Heading Next)
                        </h4>
                        <div className="editor-form-grid">
                            <div className="editor-field-group">
                                <label>Section Eyebrow</label>
                                <input
                                    type="text"
                                    value={content.carouselEyebrow}
                                    onChange={e => handleChange("carouselEyebrow", e.target.value)}
                                    placeholder="e.g. UPCOMING FIELD INTENSIVES"
                                />
                                <span className="editor-field-hint">Small uppercase blue title above the headline</span>
                            </div>

                            <div className="editor-field-group editor-form-full">
                                <label>Section Main Headline</label>
                                <input
                                    type="text"
                                    value={content.carouselHeadline}
                                    onChange={e => handleChange("carouselHeadline", e.target.value)}
                                    placeholder="e.g. Where Mobile Bible School is Heading Next."
                                />
                                <span className="editor-field-hint">The large white title on the landing page</span>
                            </div>

                            <div className="editor-field-group editor-form-full">
                                <label>Section Subheadline / Description</label>
                                <textarea
                                    rows={2}
                                    value={content.carouselSubheadline}
                                    onChange={e => handleChange("carouselSubheadline", e.target.value)}
                                    placeholder="e.g. Experience world-class faculty on location..."
                                />
                            </div>
                        </div>
                    </div>

                    {content.modules.map((module, idx) => (
                        <div className="module-card-item" key={module.id || idx}>
                            <div className="module-card-header">
                                <span className="module-badge-tag">MODULE #{idx + 1} • {module.badge || "COHORT"}</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#1877f2" }}>{module.units}</span>
                            </div>

                            <div className="editor-form-grid">
                                <div className="editor-field-group">
                                    <label>Cohort Badge</label>
                                    <input
                                        type="text"
                                        value={module.badge}
                                        onChange={e => handleModuleChange(idx, "badge", e.target.value)}
                                        placeholder="e.g. WINTER COHORT, FALL COHORT"
                                    />
                                    <span className="editor-field-hint">Blue pill tag above title</span>
                                </div>

                                <div className="editor-field-group">
                                    <label>Eyebrow Category</label>
                                    <input
                                        type="text"
                                        value={module.eyebrow}
                                        onChange={e => handleModuleChange(idx, "eyebrow", e.target.value)}
                                        placeholder="e.g. CORE THEOLOGY • SYSTEMATIC DOCTRINE"
                                    />
                                    <span className="editor-field-hint">Category text next to badge</span>
                                </div>

                                <div className="editor-field-group">
                                    <label>Module Title (White Text)</label>
                                    <input
                                        type="text"
                                        value={module.title}
                                        onChange={e => handleModuleChange(idx, "title", e.target.value)}
                                        placeholder="e.g. Theology Proper &"
                                    />
                                </div>

                                <div className="editor-field-group">
                                    <label>Title Highlight (Blue Text)</label>
                                    <input
                                        type="text"
                                        value={module.highlight}
                                        onChange={e => handleModuleChange(idx, "highlight", e.target.value)}
                                        placeholder="e.g. The Doctrines of Grace"
                                    />
                                </div>

                                <div className="editor-field-group">
                                    <label>Cohort Dates</label>
                                    <input
                                        type="text"
                                        value={module.date}
                                        onChange={e => handleModuleChange(idx, "date", e.target.value)}
                                        placeholder="e.g. December 04–06, 2026"
                                    />
                                </div>

                                <div className="editor-field-group">
                                    <label>Host Location Hub</label>
                                    <input
                                        type="text"
                                        value={module.hostLocation}
                                        onChange={e => handleModuleChange(idx, "hostLocation", e.target.value)}
                                        placeholder="e.g. North Luzon Regional Center • Baguio Hub"
                                    />
                                </div>

                                <div className="editor-field-group">
                                    <label>Academic Units Credited</label>
                                    <input
                                        type="text"
                                        value={module.units}
                                        onChange={e => handleModuleChange(idx, "units", e.target.value)}
                                        placeholder="e.g. 3 Academic Units"
                                    />
                                </div>

                                <div className="editor-field-group">
                                    <label>Action Button Label</label>
                                    <input
                                        type="text"
                                        value={module.primaryCta}
                                        onChange={e => handleModuleChange(idx, "primaryCta", e.target.value)}
                                        placeholder="e.g. Enroll in Systematic Theology"
                                    />
                                </div>

                                <div className="editor-field-group editor-form-full">
                                    <label>Course Description</label>
                                    <textarea
                                        rows={2}
                                        value={module.description}
                                        onChange={e => handleModuleChange(idx, "description", e.target.value)}
                                        placeholder="Overview of what students will learn in this intensive..."
                                    />
                                </div>

                                <div className="editor-field-group editor-form-full">
                                    <label>Right Card Motto / Tagline</label>
                                    <input
                                        type="text"
                                        value={module.tagline}
                                        onChange={e => handleModuleChange(idx, "tagline", e.target.value)}
                                        placeholder="e.g. Sound doctrine that fuels passionate discipleship."
                                    />
                                </div>

                                <div className="editor-field-group editor-form-full">
                                    <label>Core Module Syllabus Topics (One topic per line)</label>
                                    <textarea
                                        rows={3}
                                        value={Array.isArray(module.curriculumHighlight) ? module.curriculumHighlight.join("\n") : ""}
                                        onChange={e => handleModuleChange(idx, "curriculumHighlight", e.target.value.split("\n"))}
                                        placeholder={"Trinity, Sovereignty, and Divine Decrees\nPneumatology & Sovereign Grace\nCovenant Theology vs. Dispensational Hermeneutics"}
                                    />
                                    <span className="editor-field-hint">Each line will become a bullet point with a blue checkmark on the slide</span>
                                </div>

                                <div className="slide-upload-box editor-form-full">
                                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#050505", display: "flex", alignItems: "center", gap: 6 }}>
                                        <Video size={14} color="#1877f2" />
                                        <span>Slide Promotional Video / Clip</span>
                                    </label>

                                    {module.videoUrl ? (
                                        <div className="video-uploaded-file-banner" style={{ marginTop: 8, marginBottom: 0 }}>
                                            <div className="video-file-info">
                                                <Video size={18} color="#30d158" />
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 12.5 }}>
                                                        {module.videoName || `Slide Video ${idx + 1}`}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: "#65676b" }}>
                                                        {formatFileSize(module.videoSize)} • Displayed on this cohort slide
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                                <label
                                                    className="btn-editor-preview"
                                                    style={{ cursor: "pointer", margin: 0, padding: "4px 10px", fontSize: 11.5 }}
                                                >
                                                    Replace
                                                    <input
                                                        type="file"
                                                        accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                                        style={{ display: "none" }}
                                                        onChange={e => handleSlideVideoUpload(idx, e)}
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    className="btn-remove-video"
                                                    style={{ padding: "4px 8px", fontSize: 11.5 }}
                                                    onClick={() => handleSlideVideoRemove(idx)}
                                                >
                                                    <Trash2 size={12} />
                                                    <span>Remove</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label
                                            className="video-upload-dropzone"
                                            style={{ padding: "14px", marginTop: 8, marginBottom: 0 }}
                                        >
                                            <input
                                                type="file"
                                                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                                style={{ display: "none" }}
                                                onChange={e => handleSlideVideoUpload(idx, e)}
                                            />
                                            <div className="video-upload-icon" style={{ marginBottom: 4 }}>
                                                <UploadCloud size={24} />
                                            </div>
                                            <div className="video-upload-text-main" style={{ fontSize: 12.5 }}>
                                                Upload Video for this Slide (MP4, WebM, MOV)
                                            </div>
                                            <div className="video-upload-text-sub" style={{ fontSize: 11 }}>
                                                Replaces the static metrics card with an interactive video player on this slide
                                            </div>
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB 4: LIVE PREVIEW */}
            <div className="editor-preview-box">
                <div className="editor-preview-label">
                    <Sparkles size={14} />
                    LIVE HEADLINE PREVIEW
                </div>

                <div className="preview-ribbon">
                    📢 {content.ribbonText} — <span style={{ color: "#2997ff" }}>{content.ribbonCta} →</span>
                </div>

                <div className="preview-hero-title">
                    <span className="white-line">{content.heroTitleWhite}</span>
                    <span className="gradient-line">{content.heroTitleGradient}</span>
                </div>

                <p className="preview-hero-subtitle">{content.heroSubtitle}</p>

                <div className="preview-hero-pills">
                    <span className="preview-hero-pill">✓ {content.guarantee1}</span>
                    <span className="preview-hero-pill">✓ {content.guarantee2}</span>
                    <span className="preview-hero-pill">✓ {content.guarantee3}</span>
                </div>
            </div>
        </div>
    );
};

export default LandingPageEditor;
