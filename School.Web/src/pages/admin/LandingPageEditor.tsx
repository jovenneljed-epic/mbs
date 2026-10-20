import React, { useState, useEffect } from "react";
import "./LandingPageEditor.css";
import {
    getLandingPageContent,
    saveLandingPageContent,
    resetLandingPageContent,
    type LandingPageContent,
    type FieldModuleItem,
    type PromoVideoSettings,
    type PromoScene
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
    Video
} from "lucide-react";

interface LandingPageEditorProps {
    onNavigateToSite?: () => void;
}

const GRADIENT_PRESETS = [
    { name: "Deep Navy Blue", value: "linear-gradient(135deg, #090e17 0%, #0d1e38 50%, #15294a 100%)" },
    { name: "Emerald Forest", value: "linear-gradient(135deg, #0f1712 0%, #132b1e 50%, #1b3d2b 100%)" },
    { name: "Royal Amethyst", value: "linear-gradient(135deg, #170d1e 0%, #2a133b 50%, #3e1b54 100%)" },
    { name: "Golden Harvest", value: "linear-gradient(135deg, #1a1608 0%, #33260c 50%, #4a3814 100%)" },
    { name: "Obsidian Ruby", value: "linear-gradient(135deg, #1c0a0a 0%, #331313 50%, #471a1a 100%)" },
];

export const LandingPageEditor: React.FC<LandingPageEditorProps> = ({ onNavigateToSite }) => {
    const [content, setContent] = useState<LandingPageContent>(getLandingPageContent);
    const [activeTab, setActiveTab] = useState<"hero" | "video" | "banner" | "modules" | "preview">("video");
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

    const handleVideoSettingChange = (field: keyof PromoVideoSettings, value: any) => {
        setContent(prev => ({
            ...prev,
            promoVideo: {
                ...prev.promoVideo,
                [field]: value,
            },
        }));
    };

    const handleSceneChange = (index: number, field: keyof PromoScene, value: any) => {
        setContent(prev => {
            const scenes = [...prev.promoVideo.scenes];
            scenes[index] = {
                ...scenes[index],
                [field]: value,
            };
            return {
                ...prev,
                promoVideo: {
                    ...prev.promoVideo,
                    scenes,
                },
            };
        });
    };

    const processSceneMediaFile = async (index: number, file: File) => {
        const scene = content.promoVideo.scenes[index];
        const key = `scene_media_${scene.id || index}`;

        try {
            if (file.type.startsWith("video/")) {
                const res = await saveVideoMedia(key, file);
                setContent(prev => {
                    const scenes = [...prev.promoVideo.scenes];
                    scenes[index] = {
                        ...scenes[index],
                        mediaType: "video",
                        videoUrl: res.url,
                        videoName: res.name,
                        videoSize: res.size,
                    };
                    return {
                        ...prev,
                        promoVideo: {
                            ...prev.promoVideo,
                            scenes,
                        },
                    };
                });
            } else {
                // Photo / Image file: Read as Base64 Data URL for instant rendering & persistence
                const reader = new FileReader();
                reader.onload = async (uploadEvt) => {
                    const dataUrl = uploadEvt.target?.result as string;
                    await saveVideoMedia(key, file);
                    setContent(prev => {
                        const scenes = [...prev.promoVideo.scenes];
                        scenes[index] = {
                            ...scenes[index],
                            mediaType: "image",
                            imageUrl: dataUrl,
                            imageName: file.name,
                            videoUrl: undefined,
                            videoName: undefined,
                            videoSize: undefined,
                        };
                        return {
                            ...prev,
                            promoVideo: {
                                ...prev.promoVideo,
                                scenes,
                            },
                        };
                    });
                };
                reader.readAsDataURL(file);
            }
            setSavedNotification(true);
            setTimeout(() => setSavedNotification(false), 3000);
        } catch (err) {
            console.error("Error processing scene media:", err);
            alert("Failed to upload media file. Please check file format.");
        }
    };

    const handleSceneMediaUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await processSceneMediaFile(index, file);
    };

    const handleSceneMediaRemove = async (index: number) => {
        const scene = content.promoVideo.scenes[index];
        const key = `scene_media_${scene.id || index}`;
        await deleteVideoMedia(key);

        setContent(prev => {
            const scenes = [...prev.promoVideo.scenes];
            scenes[index] = {
                ...scenes[index],
                imageUrl: "",
                imageName: undefined,
                videoUrl: undefined,
                videoName: undefined,
                videoSize: undefined,
                mediaType: undefined,
            };
            return {
                ...prev,
                promoVideo: {
                    ...prev.promoVideo,
                    scenes,
                },
            };
        });
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

            {/* TAB: PROMOTIONAL VIDEO EDITOR */}
            {activeTab === "video" && (
                <div className="editor-card">
                    <h3>
                        <Film size={18} color="#1877f2" />
                        Promotional Video Showcase &amp; Reel
                    </h3>
                    <p style={{ margin: "4px 0 16px", color: "#65676b", fontSize: "13px" }}>
                        Configure the promotional video displayed in the Apple Studio Display frame on your public homepage.
                        Choose between an animated cinematic multi-scene reel or embed a custom video stream from YouTube, Vimeo, or direct MP4.
                    </p>

                    {/* PLAYBACK MODE SELECTOR */}
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#050505", display: "block", marginBottom: 8 }}>
                        Video Presentation Mode
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
                            className={`editor-mode-btn ${content.promoVideo.mode === "cinematic" ? "active" : ""}`}
                            onClick={() => handleVideoSettingChange("mode", "cinematic")}
                        >
                            <Film size={16} />
                            <span>🎬 Cinematic Animated Reel</span>
                        </button>

                        <button
                            type="button"
                            className={`editor-mode-btn ${content.promoVideo.mode === "embed" ? "active" : ""}`}
                            onClick={() => handleVideoSettingChange("mode", "embed")}
                        >
                            <Tv size={16} />
                            <span>📺 External Stream (YouTube/Link)</span>
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
                                        Size: {formatFileSize(content.promoVideo.uploadedVideoSize)} • Stored locally for instant playback
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
                                Supports MP4, WebM, MOV files up to 500MB • Stored directly in browser IndexedDB
                            </div>
                        </label>
                    )}

                    {/* GENERAL VIDEO METADATA */}
                    <div className="editor-form-grid">
                        <div className="editor-field-group">
                            <label>Video Badge Tag</label>
                            <input
                                type="text"
                                value={content.promoVideo.badgeText}
                                onChange={e => handleVideoSettingChange("badgeText", e.target.value)}
                                placeholder="e.g. OFFICIAL 2026 PROMO • 4K HDR"
                            />
                            <span className="editor-field-hint">Top right badge on video frame</span>
                        </div>

                        <div className="editor-field-group">
                            <label>Display Duration</label>
                            <input
                                type="text"
                                value={content.promoVideo.durationLabel}
                                onChange={e => handleVideoSettingChange("durationLabel", e.target.value)}
                                placeholder="e.g. 03:45"
                            />
                            <span className="editor-field-hint">Shown in playback scrubber</span>
                        </div>

                        <div className="editor-field-group editor-form-full">
                            <label>Video Main Title</label>
                            <input
                                type="text"
                                value={content.promoVideo.videoTitle}
                                onChange={e => handleVideoSettingChange("videoTitle", e.target.value)}
                                placeholder="e.g. Mobile Bible School: The Vision & Movement"
                            />
                        </div>

                        <div className="editor-field-group editor-form-full">
                            <label>Video Tagline / Overview</label>
                            <textarea
                                rows={2}
                                value={content.promoVideo.videoTagline}
                                onChange={e => handleVideoSettingChange("videoTagline", e.target.value)}
                                placeholder="Overview description of this promotional video..."
                            />
                        </div>

                        <div className="editor-field-group">
                            <label>Video Overlay CTA Button</label>
                            <input
                                type="text"
                                value={content.promoVideo.ctaText}
                                onChange={e => handleVideoSettingChange("ctaText", e.target.value)}
                                placeholder="e.g. Apply for Next Cohort"
                            />
                        </div>

                        {/* STREAM URL FIELD (ONLY WHEN EMBED MODE OR OPTIONAL) */}
                        <div className="editor-field-group editor-form-full">
                            <label>External Stream Video URL (YouTube, Vimeo, or .mp4)</label>
                            <input
                                type="text"
                                value={content.promoVideo.videoUrl}
                                onChange={e => handleVideoSettingChange("videoUrl", e.target.value)}
                                placeholder="e.g. https://www.youtube.com/watch?v=... or https://vimeo.com/... or https://domain.com/video.mp4"
                            />
                            <span className="editor-field-hint">
                                Paste any YouTube link, Vimeo link, or direct MP4 URL. If empty, the system automatically uses the cinematic animated reel.
                            </span>
                        </div>
                    </div>

                    {/* CINEMATIC SCENES ACCORDION */}
                    <div style={{ marginTop: 24 }}>
                        <h4 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#050505" }}>
                            Cinematic Reel Scenes ({content.promoVideo.scenes?.length || 0} Chapters)
                        </h4>
                        <p style={{ margin: "0 0 12px", fontSize: "12.5px", color: "#65676b" }}>
                            Customize each scene’s headline, voiceover narration script, theological Greek quote, and background atmosphere.
                        </p>

                        <div className="scenes-accordion-deck">
                            {content.promoVideo.scenes?.map((scene, sIdx) => (
                                <div key={scene.id || sIdx} className="scene-editor-card">
                                    <div className="scene-editor-header">
                                        <span>Scene {sIdx + 1}: {scene.chapterLabel}</span>
                                        <span className="scene-editor-badge">CHAPTER {scene.chapterNumber}</span>
                                    </div>

                                    <div className="scene-editor-body">
                                        <div className="editor-form-grid">
                                            <div className="editor-field-group">
                                                <label>Chapter Label (Short)</label>
                                                <input
                                                    type="text"
                                                    value={scene.chapterLabel}
                                                    onChange={e => handleSceneChange(sIdx, "chapterLabel", e.target.value)}
                                                    placeholder="e.g. GREEK & EXEGESIS"
                                                />
                                            </div>

                                            <div className="editor-field-group">
                                                <label>Location / Intensive Badge</label>
                                                <input
                                                    type="text"
                                                    value={scene.locationBadge}
                                                    onChange={e => handleSceneChange(sIdx, "locationBadge", e.target.value)}
                                                    placeholder="e.g. HERMENEUTICS LAB • 3.0 UNITS"
                                                />
                                            </div>

                                            <div className="editor-field-group editor-form-full">
                                                <label>Scene Main Headline</label>
                                                <input
                                                    type="text"
                                                    value={scene.title}
                                                    onChange={e => handleSceneChange(sIdx, "title", e.target.value)}
                                                    placeholder="Headline shown in scene"
                                                />
                                            </div>

                                            <div className="editor-field-group editor-form-full">
                                                <label>Narration / Voiceover Subtitle</label>
                                                <textarea
                                                    rows={2}
                                                    value={scene.subtitle}
                                                    onChange={e => handleSceneChange(sIdx, "subtitle", e.target.value)}
                                                    placeholder="Voiceover script or narrative description..."
                                                />
                                            </div>

                                            <div className="editor-field-group">
                                                <label>Promoted Event / Activity Title</label>
                                                <input
                                                    type="text"
                                                    value={scene.eventBadge || ""}
                                                    onChange={e => handleSceneChange(sIdx, "eventBadge", e.target.value)}
                                                    placeholder="e.g. ANNUAL CONVOCATION & SUMMIT"
                                                />
                                            </div>

                                            <div className="editor-field-group">
                                                <label>Event Date & Location</label>
                                                <input
                                                    type="text"
                                                    value={scene.eventDate || ""}
                                                    onChange={e => handleSceneChange(sIdx, "eventDate", e.target.value)}
                                                    placeholder="e.g. Nov 14–16, 2026 • Metro Manila Campus"
                                                />
                                            </div>

                                            <div className="slide-upload-box editor-form-full">
                                                <label style={{ fontSize: "12.5px", fontWeight: 700, color: "#050505", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                                                    <UploadCloud size={15} color="#1877f2" />
                                                    <span>Reel Slide Media (Upload Video or Photo)</span>
                                                </label>

                                                {/* UPLOADED FILE BANNER IF MEDIA IS PRESENT */}
                                                {(scene.videoUrl || scene.imageUrl) ? (
                                                    <div className="video-uploaded-file-banner" style={{ marginTop: 0, marginBottom: 10 }}>
                                                        <div className="video-file-info">
                                                            {scene.mediaType === "video" || scene.videoUrl ? (
                                                                <Video size={24} color="#30d158" />
                                                            ) : (
                                                                <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", flexShrink: 0, border: "1px solid #ccd0d5", background: "#000" }}>
                                                                    <img
                                                                        src={scene.imageUrl}
                                                                        alt="Preview"
                                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                                        onError={e => { (e.target as HTMLElement).style.display = "none"; }}
                                                                    />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                                                                    <span>
                                                                        {scene.videoName || scene.imageName || (scene.mediaType === "video" || scene.videoUrl ? "Custom Video Clip" : "Promotional Event Photo")}
                                                                    </span>
                                                                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: (scene.mediaType === "video" || scene.videoUrl) ? "#e7f3ff" : "#ecfdf5", color: (scene.mediaType === "video" || scene.videoUrl) ? "#1877f2" : "#059669" }}>
                                                                        {(scene.mediaType === "video" || scene.videoUrl) ? "🎥 VIDEO" : "📷 PHOTO"}
                                                                    </span>
                                                                </div>
                                                                <div style={{ fontSize: 11, color: "#65676b" }}>
                                                                    {scene.videoSize ? `${formatFileSize(scene.videoSize)} • ` : ""}Plays in Chapter {scene.chapterNumber} with Ken Burns &amp; contrast scrim
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                            <label
                                                                className="btn-editor-preview"
                                                                style={{ cursor: "pointer", margin: 0, padding: "6px 12px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
                                                            >
                                                                <UploadCloud size={13} />
                                                                <span>Upload New Video / Photo</span>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
                                                                    style={{ display: "none" }}
                                                                    onChange={e => handleSceneMediaUpload(sIdx, e)}
                                                                />
                                                            </label>
                                                            <button
                                                                type="button"
                                                                className="btn-remove-video"
                                                                style={{ padding: "6px 10px", fontSize: 12 }}
                                                                onClick={() => handleSceneMediaRemove(sIdx)}
                                                            >
                                                                <Trash2 size={13} />
                                                                <span>Remove</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* BIG UPLOAD BUTTON / DROPZONE IF EMPTY */
                                                    <label
                                                        className="video-upload-dropzone"
                                                        style={{ padding: "16px 20px", marginTop: 0, marginBottom: 10, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
                                                    >
                                                        <input
                                                            type="file"
                                                            accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
                                                            style={{ display: "none" }}
                                                            onChange={e => handleSceneMediaUpload(sIdx, e)}
                                                        />
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                            <UploadCloud size={18} color="#1877f2" />
                                                            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1877f2" }}>
                                                                Upload Video or Photo for Slide {sIdx + 1}
                                                            </span>
                                                        </div>
                                                        <span style={{ fontSize: 11.5, color: "#65676b" }}>
                                                            Supports MP4, WebM, MOV, JPG, PNG, WebP (Shown with smooth zoom and scrim overlay)
                                                        </span>
                                                    </label>
                                                )}

                                                {/* OPTIONAL EXTERNAL URL INPUT */}
                                                <div style={{ marginTop: 4 }}>
                                                    <details style={{ fontSize: 12, color: "#65676b" }}>
                                                        <summary style={{ cursor: "pointer", userSelect: "none", color: "#1877f2", fontWeight: 600 }}>
                                                            {scene.imageUrl || scene.videoUrl ? "Or edit media web link manually" : "Or enter external photo / video link"}
                                                        </summary>
                                                        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                                                            <input
                                                                type="text"
                                                                value={scene.imageUrl || scene.videoUrl || ""}
                                                                onChange={e => {
                                                                    const val = e.target.value;
                                                                    if (val.match(/\.(mp4|webm|ogg|mov)$/i)) {
                                                                        handleSceneChange(sIdx, "videoUrl", val);
                                                                        handleSceneChange(sIdx, "mediaType", "video");
                                                                    } else {
                                                                        handleSceneChange(sIdx, "imageUrl", val);
                                                                        handleSceneChange(sIdx, "mediaType", "image");
                                                                    }
                                                                }}
                                                                placeholder="https://images.unsplash.com/... or https://domain.com/video.mp4"
                                                                style={{ flex: 1, fontSize: 12, padding: "7px 10px", borderRadius: 6, border: "1px solid #ccd0d5" }}
                                                            />
                                                        </div>
                                                    </details>
                                                </div>
                                            </div>

                                            <div className="editor-field-group editor-form-full">
                                                <label>Event Activity Highlights / Description</label>
                                                <textarea
                                                    rows={2}
                                                    value={scene.eventDescription || ""}
                                                    onChange={e => handleSceneChange(sIdx, "eventDescription", e.target.value)}
                                                    placeholder="Brief overview of the activity, workshops, or graduation highlights..."
                                                />
                                            </div>

                                            <div className="editor-field-group">
                                                <label>Scripture / Greek Exegesis Phrase</label>
                                                <input
                                                    type="text"
                                                    value={scene.quoteGreek || ""}
                                                    onChange={e => handleSceneChange(sIdx, "quoteGreek", e.target.value)}
                                                    placeholder="e.g. χάριτί ἐστε σεσῳσμένοι"
                                                />
                                            </div>

                                            <div className="editor-field-group">
                                                <label>Scripture English Translation</label>
                                                <input
                                                    type="text"
                                                    value={scene.quoteEnglish || ""}
                                                    onChange={e => handleSceneChange(sIdx, "quoteEnglish", e.target.value)}
                                                    placeholder="e.g. “By grace you have been saved through faith”"
                                                />
                                            </div>

                                            <div className="editor-field-group">
                                                <label>Scene Duration (Seconds)</label>
                                                <select
                                                    value={scene.durationSeconds || 6}
                                                    onChange={e => handleSceneChange(sIdx, "durationSeconds", Number(e.target.value))}
                                                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #ccd0d5" }}
                                                >
                                                    <option value={4}>4 seconds (Fast)</option>
                                                    <option value={6}>6 seconds (Standard)</option>
                                                    <option value={8}>8 seconds (Extended)</option>
                                                    <option value={10}>10 seconds (Slow Cinematic)</option>
                                                </select>
                                            </div>

                                            <div className="editor-field-group">
                                                <label>Background Atmosphere Theme</label>
                                                <div className="gradient-preset-picker">
                                                    {GRADIENT_PRESETS.map((preset, pIdx) => (
                                                        <button
                                                            key={pIdx}
                                                            type="button"
                                                            className={`gradient-swatch ${scene.bgGradient === preset.value ? "selected" : ""}`}
                                                            style={{ background: preset.value }}
                                                            title={preset.name}
                                                            onClick={() => handleSceneChange(sIdx, "bgGradient", preset.value)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* LIVE INTERACTIVE VIDEO PLAYER PREVIEW */}
                    <div className="video-live-player-preview-card">
                        <h4>
                            <Play size={16} fill="#2997ff" />
                            LIVE INTERACTIVE PROMOTIONAL VIDEO PREVIEW
                        </h4>
                        <PromoVideoPlayer
                            settings={content.promoVideo}
                            onApplyClick={() => {
                                if (onNavigateToSite) onNavigateToSite();
                                else window.open("/", "_blank");
                            }}
                            onUploadMedia={(sIdx, file) => processSceneMediaFile(sIdx, file)}
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
