import React, { useState, useEffect, useRef } from "react";
import "./PromoVideoPlayer.css";
import type { PromoVideoSettings, PromoScene } from "../services/landingPageContent";
import { getVideoMediaUrl, VIDEO_MEDIA_EVENT } from "../services/videoMediaStorage";
import {
    Play,
    Pause,
    RotateCcw,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    Subtitles,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Film,
    GraduationCap,
    Smartphone,
    Tv,
    Settings,
    Calendar,
    UploadCloud
} from "lucide-react";

interface PromoVideoPlayerProps {
    settings: PromoVideoSettings;
    onApplyClick?: () => void;
    onEditClick?: () => void;
    onUploadMedia?: (sceneIndex: number, file: File) => void;
}

// Convert various video URL formats to embeddable URLs
function getEmbedUrl(rawUrl: string): string | null {
    if (!rawUrl) return null;
    const url = rawUrl.trim();

    // YouTube: https://www.youtube.com/watch?v=ID or https://youtu.be/ID
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch && ytMatch[1]) {
        return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
    }

    // Vimeo: https://vimeo.com/ID
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    // Direct MP4 / WebM
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
        return url;
    }

    return url;
}

export const PromoVideoPlayer: React.FC<PromoVideoPlayerProps> = ({
    settings,
    onApplyClick,
    onEditClick,
    onUploadMedia
}) => {
    const scenes = settings.scenes && settings.scenes.length > 0 ? settings.scenes : [];
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(settings.autoPlay);
    const [progress, setProgress] = useState(0); // 0 to 100% of current scene
    const [totalElapsed, setTotalElapsed] = useState(0); // seconds
    const [isMuted, setIsMuted] = useState(true);
    const [showCaptions, setShowCaptions] = useState(settings.showCaptions ?? true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(settings.uploadedVideoUrl || null);
    const [sceneVideoUrls, setSceneVideoUrls] = useState<Record<number, string>>({});
    const [activeTabMode, setActiveTabMode] = useState<"cinematic" | "embed" | "uploaded">(
        settings.mode || (settings.uploadedVideoUrl ? "uploaded" : "cinematic")
    );

    const playerContainerRef = useRef<HTMLDivElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const oscRef = useRef<OscillatorNode | null>(null);
    const gainRef = useRef<GainNode | null>(null);

    const activeScene: PromoScene = scenes[currentSceneIndex] || {
        id: "default",
        chapterNumber: "01",
        chapterLabel: "MBS INTENSIVE",
        title: settings.videoTitle,
        subtitle: settings.videoTagline,
        locationBadge: "GLOBAL CAMPUS",
        durationSeconds: 6,
        bgGradient: "linear-gradient(135deg, #090e17 0%, #0d1e38 50%, #15294a 100%)",
        imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80",
        eventBadge: "CAMPUS CONVOCATION • 2026 THEOLOGICAL SUMMIT",
        eventDate: "November 14–16, 2026 • Metro Manila Campus",
        eventDescription: "3-day campus gathering with master-class expository lectures, faculty panels, and praise.",
        quoteGreek: "χάριτί ἐστε σεσῳσμένοι",
        quoteEnglish: "“By grace you have been saved through faith”",
    };

    const activeSceneVideo = sceneVideoUrls[currentSceneIndex] || activeScene.videoUrl;

    // Load stored uploaded video from IndexedDB and sync mode
    useEffect(() => {
        let isMounted = true;
        if (settings.uploadedVideoUrl) {
            setUploadedUrl(settings.uploadedVideoUrl);
        } else {
            getVideoMediaUrl("promo_main").then(url => {
                if (isMounted && url) {
                    setUploadedUrl(url);
                    if (settings.mode === "uploaded") {
                        setActiveTabMode("uploaded");
                    }
                }
            });
        }

        const handleMediaUpdate = (e: any) => {
            if (e.detail?.key === "promo_main") {
                setUploadedUrl(e.detail.url);
                if (e.detail.url) {
                    setActiveTabMode("uploaded");
                }
            }
        };

        window.addEventListener(VIDEO_MEDIA_EVENT as any, handleMediaUpdate);
        return () => {
            isMounted = false;
            window.removeEventListener(VIDEO_MEDIA_EVENT as any, handleMediaUpdate);
        };
    }, [settings.uploadedVideoUrl, settings.mode]);

    // Load individual scene videos from IndexedDB
    useEffect(() => {
        let isMounted = true;
        const loadSceneVideos = async () => {
            const urls: Record<number, string> = {};
            for (let idx = 0; idx < scenes.length; idx++) {
                const sc = scenes[idx];
                if (sc.videoUrl) {
                    urls[idx] = sc.videoUrl;
                } else {
                    const stored = await getVideoMediaUrl(`scene_media_${sc.id || idx}`);
                    if (stored) {
                        urls[idx] = stored;
                    }
                }
            }
            if (isMounted) {
                setSceneVideoUrls(urls);
            }
        };

        loadSceneVideos();

        const handleSceneMediaUpdate = (e: any) => {
            if (e.detail?.key?.startsWith("scene_media_")) {
                loadSceneVideos();
            }
        };

        window.addEventListener(VIDEO_MEDIA_EVENT as any, handleSceneMediaUpdate);
        return () => {
            isMounted = false;
            window.removeEventListener(VIDEO_MEDIA_EVENT as any, handleSceneMediaUpdate);
        };
    }, [scenes]);

    // Keep activeTabMode synced if settings change externally
    useEffect(() => {
        if (settings.mode) {
            setActiveTabMode(settings.mode);
        }
    }, [settings.mode]);

    // Total duration of all scenes
    const totalDurationSeconds = scenes.reduce((acc, s) => acc + (s.durationSeconds || 6), 0);

    // Cinematic Tone Synth using Web Audio API for immersive ambient pad
    const playAmbientTone = (sceneIdx: number) => {
        if (isMuted) return;
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;

            if (!audioCtxRef.current) {
                audioCtxRef.current = new AudioContextClass();
            }
            if (audioCtxRef.current.state === "suspended") {
                audioCtxRef.current.resume();
            }

            // Stop existing oscillator if any
            if (oscRef.current) {
                try { oscRef.current.stop(); } catch (e) { /* ignore */ }
            }

            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            // Pentatonic warm chord frequencies based on scene
            const baseFreqs = [220, 261.63, 293.66, 329.63]; // A3, C4, D4, E4
            const targetFreq = baseFreqs[sceneIdx % baseFreqs.length] || 220;

            osc.type = "sine";
            osc.frequency.setValueAtTime(targetFreq, ctx.currentTime);

            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 1.2);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 5.0);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 5.5);

            oscRef.current = osc;
            gainRef.current = gain;
        } catch (err) {
            // Audio context not allowed until user gesture - safe to ignore
        }
    };

    // Progress timer
    useEffect(() => {
        if (!isPlaying || activeTabMode === "embed") return;

        const currentSceneDuration = activeScene.durationSeconds || 6;
        const tickIntervalMs = 80;
        const incrementPct = (tickIntervalMs / (currentSceneDuration * 1000)) * 100;

        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + incrementPct;
                if (next >= 100) {
                    // Advance to next scene
                    setCurrentSceneIndex((prevIndex) => {
                        const nextIndex = (prevIndex + 1) % scenes.length;
                        playAmbientTone(nextIndex);
                        return nextIndex;
                    });
                    return 0;
                }
                return next;
            });

            setTotalElapsed((prev) => (prev + tickIntervalMs / 1000) % Math.max(1, totalDurationSeconds));
        }, tickIntervalMs);

        return () => clearInterval(interval);
    }, [isPlaying, activeScene, scenes.length, activeTabMode, totalDurationSeconds, isMuted]);

    // Handle Play / Pause toggle
    const handleTogglePlay = () => {
        const nextState = !isPlaying;
        setIsPlaying(nextState);
        if (nextState && !isMuted) {
            playAmbientTone(currentSceneIndex);
        }
    };

    // Handle scene navigation
    const handleJumpToScene = (index: number) => {
        setCurrentSceneIndex(index);
        setProgress(0);
        if (isPlaying && !isMuted) {
            playAmbientTone(index);
        }
    };

    const handlePrevScene = () => {
        const prev = currentSceneIndex === 0 ? scenes.length - 1 : currentSceneIndex - 1;
        handleJumpToScene(prev);
    };

    const handleNextScene = () => {
        const next = (currentSceneIndex + 1) % scenes.length;
        handleJumpToScene(next);
    };

    // Toggle mute
    const handleToggleMute = () => {
        setIsMuted((prev) => {
            const next = !prev;
            if (!next && isPlaying) {
                playAmbientTone(currentSceneIndex);
            }
            return next;
        });
    };

    // Fullscreen toggle
    const handleToggleFullscreen = () => {
        if (!playerContainerRef.current) return;
        if (!document.fullscreenElement) {
            playerContainerRef.current.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            document.exitFullscreen().catch(() => {});
            setIsFullscreen(false);
        }
    };

    // Format seconds into MM:SS
    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const embedUrl = getEmbedUrl(settings.videoUrl);
    const isDirectVideo = embedUrl && embedUrl.match(/\.(mp4|webm|ogg)$/i);

    return (
        <div
            className={`promo-player-chassis ${isFullscreen ? "fullscreen-active" : ""}`}
            ref={playerContainerRef}
        >
            {/* TOP BAR (STUDIO DISPLAY BROWSER CHROME) */}
            <div className="promo-player-topbar">
                <div className="traffic-dots">
                    <span className="dot-red" title="Close"></span>
                    <span className="dot-yellow" title="Minimize"></span>
                    <span className="dot-green" title="Expand"></span>
                </div>

                <div className="promo-player-url">
                    <span className="url-protocol">https://</span>
                    <span className="url-domain">mbs-portal.edu</span>
                    <span className="url-path">/promotional-reel/2026-trailer</span>
                </div>

                <div className="promo-player-meta-strip">
                    {(uploadedUrl || settings.videoUrl) && (
                        <div className="mode-toggle-pill">
                            <button
                                type="button"
                                className={`pill-opt ${activeTabMode === "cinematic" ? "active" : ""}`}
                                onClick={() => setActiveTabMode("cinematic")}
                                title="Cinematic Animated Reel"
                            >
                                <Film size={11} />
                                <span>Reel</span>
                            </button>
                            {uploadedUrl && (
                                <button
                                    type="button"
                                    className={`pill-opt ${activeTabMode === "uploaded" ? "active" : ""}`}
                                    onClick={() => setActiveTabMode("uploaded")}
                                    title="Play Uploaded Video"
                                >
                                    <Play size={11} />
                                    <span>Uploaded Video</span>
                                </button>
                            )}
                            {settings.videoUrl && (
                                <button
                                    type="button"
                                    className={`pill-opt ${activeTabMode === "embed" ? "active" : ""}`}
                                    onClick={() => setActiveTabMode("embed")}
                                    title="Embedded Stream Video"
                                >
                                    <Tv size={11} />
                                    <span>Stream</span>
                                </button>
                            )}
                        </div>
                    )}

                    {onUploadMedia && (
                        <label
                            className="btn-reel-quick-upload"
                            title={`Upload Video or Photo for Chapter ${activeScene.chapterNumber} (${activeScene.chapterLabel})`}
                        >
                            <UploadCloud size={12} />
                            <span>Upload Video / Photo</span>
                            <input
                                type="file"
                                accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
                                style={{ display: "none" }}
                                onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        onUploadMedia(currentSceneIndex, file);
                                    }
                                }}
                            />
                        </label>
                    )}

                    <div className="badge-promo-live">
                        <span className="live-pulsing-dot"></span>
                        <span>{settings.badgeText || "PROMO REEL"}</span>
                    </div>
                </div>
            </div>

            {/* VIDEO VIEWPORT CONTAINER */}
            <div className="promo-player-screen">
                {activeTabMode === "uploaded" && uploadedUrl ? (
                    /* UPLOADED VIDEO PLAYBACK */
                    <div className="promo-embed-viewport">
                        <video
                            src={uploadedUrl}
                            controls
                            autoPlay
                            playsInline
                            className="promo-direct-video"
                        />
                    </div>
                ) : activeTabMode === "embed" && embedUrl ? (
                    /* EMBEDDED REAL VIDEO (YOUTUBE / VIMEO / DIRECT MP4) */
                    <div className="promo-embed-viewport">
                        {isDirectVideo ? (
                            <video
                                src={embedUrl}
                                controls
                                autoPlay
                                className="promo-direct-video"
                            />
                        ) : (
                            <iframe
                                src={embedUrl}
                                title={settings.videoTitle}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="promo-embed-iframe"
                            />
                        )}
                    </div>
                ) : (
                    /* CINEMATIC ANIMATED REEL (BUILT-IN INTERACTIVE PROMOTIONAL VIDEO) */
                    <div
                        className="promo-cinematic-stage"
                        style={{ background: activeScene.bgGradient }}
                    >
                        {/* CINEMATIC BACKGROUND VIDEO OR IMAGE WITH KEN BURNS EFFECT */}
                        {activeSceneVideo ? (
                            <div className="cinematic-bg-wrapper">
                                <video
                                    src={activeSceneVideo}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="cinematic-bg-video"
                                    key={`video-${activeScene.id || currentSceneIndex}`}
                                />
                                <div className="cinematic-image-scrim"></div>
                            </div>
                        ) : activeScene.imageUrl ? (
                            <div className="cinematic-bg-wrapper">
                                <img
                                    src={activeScene.imageUrl}
                                    alt={activeScene.title}
                                    className={`cinematic-bg-img ${isPlaying ? "ken-burns-active" : ""}`}
                                    key={`img-${activeScene.id || currentSceneIndex}`}
                                />
                                <div className="cinematic-image-scrim"></div>
                            </div>
                        ) : null}

                        {/* AMBIENT MOTION LIGHT OVERLAY */}
                        <div className="cinematic-ambient-lights">
                            <div className="light-orb orb-1"></div>
                            <div className="light-orb orb-2"></div>
                        </div>

                        {/* BIG HOVER / PAUSE PLAY OVERLAY */}
                        {!isPlaying && (
                            <div
                                className="cinematic-play-hero-overlay"
                                onClick={handleTogglePlay}
                                title="Click to play promotional video"
                            >
                                <div className="hero-play-circle">
                                    <Play size={34} fill="#ffffff" color="#ffffff" style={{ marginLeft: 4 }} />
                                </div>
                                <span className="hero-play-label">WATCH PROMOTIONAL REEL</span>
                                <span className="hero-play-sub">Click to Play • {settings.durationLabel || "03:45"}</span>
                            </div>
                        )}

                        {/* ACTIVE SCENE CONTENT DECK */}
                        <div className="cinematic-content-deck">
                            {/* SCENE HEADER METADATA */}
                            <div className="scene-meta-pill-row">
                                <div className="scene-chapter-tag">
                                    <span>CHAPTER {activeScene.chapterNumber}</span>
                                    <span className="dot-divider">•</span>
                                    <span>{activeScene.chapterLabel}</span>
                                </div>

                                <div className="scene-location-pill">
                                    <GraduationCap size={13} color="#2997ff" />
                                    <span>{activeScene.locationBadge}</span>
                                </div>

                                {activeScene.eventBadge && (
                                    <div className="scene-event-pill">
                                        <Calendar size={12} color="#fbbf24" />
                                        <span>{activeScene.eventBadge}</span>
                                    </div>
                                )}
                            </div>

                            {/* SCENE TITLE */}
                            <h2 className="scene-headline">{activeScene.title}</h2>

                            {/* NARRATOR / SUBTITLE SCRIPT */}
                            {showCaptions && (
                                <div className="scene-narrator-caption">
                                    <div className="caption-speaker-badge">
                                        <Sparkles size={11} color="#f5a623" />
                                        <span>MBS FACULTY NARRATION</span>
                                    </div>
                                    <p className="caption-text">{activeScene.subtitle}</p>
                                </div>
                            )}

                            {/* SCHOOL EVENT PROMOTION BANNER */}
                            {activeScene.eventDate && (
                                <div className="scene-event-details-strip">
                                    <div className="event-date-col">
                                        <div className="event-date-row">
                                            <Calendar size={13} color="#f59e0b" />
                                            <span className="event-date-text">{activeScene.eventDate}</span>
                                        </div>
                                        {activeScene.eventDescription && (
                                            <span className="event-desc-text">{activeScene.eventDescription}</span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className="event-quick-rsvp-btn"
                                        onClick={onApplyClick}
                                    >
                                        <span>Register for Event</span>
                                    </button>
                                </div>
                            )}

                            {/* GREEK & THEOLOGICAL SCRIPTURE STRIP */}
                            {(activeScene.quoteGreek || activeScene.quoteEnglish) && (
                                <div className="scene-greek-highlight-strip">
                                    <div className="greek-text-deck">
                                        {activeScene.quoteGreek && (
                                            <span className="greek-font-phrase">{activeScene.quoteGreek}</span>
                                        )}
                                        {activeScene.quoteEnglish && (
                                            <span className="english-trans-phrase">{activeScene.quoteEnglish}</span>
                                        )}
                                    </div>

                                    <div className="offline-accred-badge">
                                        <Smartphone size={13} />
                                        <span>Field Ready &amp; Offline Synced</span>
                                    </div>
                                </div>
                            )}

                            {/* AUDIO SOUNDWAVE VISUALIZER */}
                            <div className="cinematic-soundwave-row">
                                <div className={`soundwave-bars ${isPlaying ? "active" : ""}`}>
                                    <span style={{ animationDelay: "0ms" }}></span>
                                    <span style={{ animationDelay: "150ms" }}></span>
                                    <span style={{ animationDelay: "300ms" }}></span>
                                    <span style={{ animationDelay: "75ms" }}></span>
                                    <span style={{ animationDelay: "220ms" }}></span>
                                    <span style={{ animationDelay: "380ms" }}></span>
                                    <span style={{ animationDelay: "120ms" }}></span>
                                    <span style={{ animationDelay: "280ms" }}></span>
                                    <span style={{ animationDelay: "190ms" }}></span>
                                    <span style={{ animationDelay: "90ms" }}></span>
                                </div>
                                <span className="soundwave-status">
                                    {isPlaying
                                        ? `Now Playing: Scene ${currentSceneIndex + 1} of ${scenes.length}`
                                        : "Playback Paused"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* VIDEO PLAYER BOTTOM CONTROLS & TIMELINE */}
            <div className="promo-player-controls-deck">
                {/* INTERACTIVE CHAPTER SCRUBBER BAR */}
                <div
                    className="promo-scrubber-track"
                    title="Click on chapters to jump to specific scenes"
                >
                    {scenes.map((scene, idx) => {
                        let fillWidth = 0;
                        if (idx < currentSceneIndex) {
                            fillWidth = 100;
                        } else if (idx === currentSceneIndex) {
                            fillWidth = progress;
                        }

                        return (
                            <div
                                key={scene.id || idx}
                                className={`scrubber-segment ${idx === currentSceneIndex ? "active" : ""}`}
                                onClick={() => handleJumpToScene(idx)}
                                title={`Jump to Chapter ${scene.chapterNumber}: ${scene.chapterLabel}`}
                            >
                                <div
                                    className="scrubber-segment-fill"
                                    style={{ width: `${fillWidth}%` }}
                                ></div>
                            </div>
                        );
                    })}
                </div>

                {/* CONTROLS BUTTONS STRIP */}
                <div className="promo-controls-action-bar">
                    {/* LEFT CONTROLS: PLAY/PAUSE, PREV, NEXT, TIME */}
                    <div className="ctrl-group-left">
                        <button
                            type="button"
                            className="ctrl-btn-play"
                            onClick={handleTogglePlay}
                            title={isPlaying ? "Pause Video" : "Play Video"}
                        >
                            {isPlaying ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: 2 }} />}
                        </button>

                        <button
                            type="button"
                            className="ctrl-btn-step"
                            onClick={handlePrevScene}
                            title="Previous Chapter"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <button
                            type="button"
                            className="ctrl-btn-step"
                            onClick={handleNextScene}
                            title="Next Chapter"
                        >
                            <ChevronRight size={16} />
                        </button>

                        <button
                            type="button"
                            className="ctrl-btn-step"
                            onClick={() => handleJumpToScene(0)}
                            title="Restart from beginning"
                        >
                            <RotateCcw size={14} />
                        </button>

                        <div className="ctrl-time-counter">
                            <span className="time-current">{formatTime(totalElapsed)}</span>
                            <span className="time-separator">/</span>
                            <span className="time-total">{settings.durationLabel || formatTime(totalDurationSeconds)}</span>
                        </div>
                    </div>

                    {/* CENTER CONTROLS: CHAPTER QUICK-SELECTORS */}
                    <div className="ctrl-group-center">
                        {scenes.map((scene, idx) => {
                            const thumbVid = sceneVideoUrls[idx] || scene.videoUrl;
                            return (
                                <button
                                    key={scene.id || idx}
                                    type="button"
                                    className={`chapter-chip-btn ${idx === currentSceneIndex ? "selected" : ""}`}
                                    onClick={() => handleJumpToScene(idx)}
                                >
                                    {thumbVid ? (
                                        <video src={thumbVid} className="chip-thumb" muted />
                                    ) : scene.imageUrl ? (
                                        <img
                                            src={scene.imageUrl}
                                            alt=""
                                            className="chip-thumb"
                                        />
                                    ) : null}
                                    <span className="chip-num">{scene.chapterNumber}</span>
                                    <span className="chip-name">{scene.chapterLabel}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* RIGHT CONTROLS: CAPTIONS, AUDIO, FULLSCREEN, APPLY */}
                    <div className="ctrl-group-right">
                        <button
                            type="button"
                            className={`ctrl-btn-icon ${showCaptions ? "active-tint" : ""}`}
                            onClick={() => setShowCaptions((prev) => !prev)}
                            title={showCaptions ? "Hide Subtitles [CC]" : "Show Subtitles [CC]"}
                        >
                            <Subtitles size={16} />
                            <span className="btn-label-sub">CC</span>
                        </button>

                        <button
                            type="button"
                            className={`ctrl-btn-icon ${!isMuted ? "active-tint" : ""}`}
                            onClick={handleToggleMute}
                            title={isMuted ? "Unmute Audio" : "Mute Audio"}
                        >
                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>

                        <button
                            type="button"
                            className="ctrl-btn-icon"
                            onClick={handleToggleFullscreen}
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        >
                            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                        </button>

                        {onEditClick && (
                            <button
                                type="button"
                                className="ctrl-btn-icon"
                                onClick={onEditClick}
                                title="Edit Video in CMS"
                            >
                                <Settings size={14} />
                                <span className="btn-label-sub">Edit</span>
                            </button>
                        )}

                        {onApplyClick && (
                            <button
                                type="button"
                                className="ctrl-btn-cta"
                                onClick={onApplyClick}
                            >
                                <span>{settings.ctaText || "Apply for Cohort"}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
