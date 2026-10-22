// ============================================================
// PromoVideoPlayer.tsx -> MODERN STYLISH AUTOMATIC VIDEO FRAME
// Auto-plays when scrolled into view • Pauses when scrolled away
// Sleek compact glass chassis • Resilient fallback & poster
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import "./PromoVideoPlayer.css";
import type { PromoVideoSettings } from "../services/landingPageContent";
import { getVideoMediaUrl, VIDEO_MEDIA_EVENT } from "../services/videoMediaStorage";
import {
    Play,
    Pause,
    RotateCcw,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    Settings,
    ArrowRight
} from "lucide-react";

interface PromoVideoPlayerProps {
    settings: PromoVideoSettings;
    onApplyClick?: () => void;
    onEditClick?: () => void;
    onUploadMedia?: (sceneIndex: number, file: File) => void;
}

// Convert various video URL formats to embeddable URLs
function getEmbedUrl(rawUrl: string, autoPlay: boolean = true, isMuted: boolean = true): string | null {
    if (!rawUrl) return null;
    const url = rawUrl.trim();

    // YouTube: https://www.youtube.com/watch?v=ID or https://youtu.be/ID or embed
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch && ytMatch[1]) {
        const videoId = ytMatch[1];
        const ap = autoPlay ? "1" : "0";
        const mute = isMuted ? "1" : "0";
        return `https://www.youtube.com/embed/${videoId}?autoplay=${ap}&mute=${mute}&loop=1&playlist=${videoId}&playsinline=1&rel=0&modestbranding=1`;
    }

    // Vimeo: https://vimeo.com/ID
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
        const videoId = vimeoMatch[1];
        const ap = autoPlay ? "1" : "0";
        const mute = isMuted ? "1" : "0";
        return `https://player.vimeo.com/video/${videoId}?autoplay=${ap}&muted=${mute}&loop=1&playsinline=1`;
    }

    // Direct MP4 / WebM / Blob
    return url;
}

// High reliability fallback (hosted locally in public/videos)
const DEFAULT_FALLBACK_VIDEO = "/videos/promo.mp4";
const DEFAULT_POSTER = "/images/announcements/sunday-worship.jpg";

export const PromoVideoPlayer: React.FC<PromoVideoPlayerProps> = ({
    settings,
    onApplyClick,
    onEditClick
}) => {
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(settings.uploadedVideoUrl || null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(settings.muted ?? true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const chassisRef = useRef<HTMLDivElement>(null);
    const userManuallyPausedRef = useRef<boolean>(false);

    // Sync uploaded video from IndexedDB
    useEffect(() => {
        let isMounted = true;
        if (settings.uploadedVideoUrl) {
            setUploadedUrl(settings.uploadedVideoUrl);
        } else {
            getVideoMediaUrl("promo_main").then(url => {
                if (isMounted && url) {
                    setUploadedUrl(url);
                }
            }).catch(() => {});
        }

        const handleMediaUpdate = () => {
            getVideoMediaUrl("promo_main").then(url => {
                if (isMounted && url) {
                    setUploadedUrl(url);
                }
            }).catch(() => {});
        };

        window.addEventListener(VIDEO_MEDIA_EVENT, handleMediaUpdate);
        return () => {
            isMounted = false;
            window.removeEventListener(VIDEO_MEDIA_EVENT, handleMediaUpdate);
        };
    }, [settings.uploadedVideoUrl]);

    // Active source resolution (guaranteed not to point to blocked Google sample)
    let rawSource = uploadedUrl || settings.videoUrl;
    if (!rawSource || rawSource.includes("commondatastorage.googleapis.com")) {
        rawSource = DEFAULT_FALLBACK_VIDEO;
    }

    const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(rawSource);
    const isVimeo = /vimeo\.com/i.test(rawSource);
    const isEmbed = isYouTube || isVimeo;
    const embedSrc = isEmbed ? getEmbedUrl(rawSource, settings.autoPlay ?? true, isMuted) : null;
    const activePoster = settings.posterUrl || DEFAULT_POSTER;

    // ============================================================
    // AUTOMATIC PLAY WHEN SCROLLED INTO VIEW (IntersectionObserver)
    // ============================================================
    useEffect(() => {
        const target = chassisRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry) return;

                if (entry.isIntersecting) {
                    // Element is visible in viewport!
                    // If user previously manually paused on this section, don't override,
                    // but if it's the normal scroll into view, trigger autoplay
                    if (!userManuallyPausedRef.current && videoRef.current) {
                        videoRef.current.muted = isMuted;
                        const playPromise = videoRef.current.play();
                        if (playPromise !== undefined) {
                            playPromise
                                .then(() => {
                                    setIsPlaying(true);
                                })
                                .catch(() => {
                                    // Browser policy blocked unmuted autoplay: force mute & retry
                                    if (videoRef.current) {
                                        videoRef.current.muted = true;
                                        setIsMuted(true);
                                        videoRef.current.play()
                                            .then(() => setIsPlaying(true))
                                            .catch(() => setIsPlaying(false));
                                    }
                                });
                        }
                    }
                } else {
                    // Scrolled out of view: pause to conserve memory & bandwidth
                    if (videoRef.current && !videoRef.current.paused) {
                        videoRef.current.pause();
                        setIsPlaying(false);
                    }
                    // Reset user manual pause flag once they scroll completely away,
                    // so when they scroll back it auto-plays afresh
                    userManuallyPausedRef.current = false;
                }
            },
            {
                // Trigger when 30% of the chassis is visible on screen
                threshold: [0.15, 0.35],
                rootMargin: "0px 0px -40px 0px"
            }
        );

        observer.observe(target);
        return () => {
            observer.disconnect();
        };
    }, [isMuted, rawSource]);

    // Handle HTML5 video events
    const togglePlay = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            userManuallyPausedRef.current = false;
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        } else {
            userManuallyPausedRef.current = true;
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = () => {
        const nextMute = !isMuted;
        setIsMuted(nextMute);
        if (videoRef.current) {
            videoRef.current.muted = nextMute;
        }
    };

    const toggleFullscreen = () => {
        if (!chassisRef.current) return;
        if (!document.fullscreenElement) {
            chassisRef.current.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            document.exitFullscreen().catch(() => {});
            setIsFullscreen(false);
        }
    };

    const handleRestart = () => {
        if (videoRef.current) {
            userManuallyPausedRef.current = false;
            videoRef.current.currentTime = 0;
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
    };

    return (
        <div
            ref={chassisRef}
            className={`promo-player-chassis ${isFullscreen ? "fullscreen-active" : ""}`}
        >
            {/* MODERN SLIM TOP BAR */}
            <div className="promo-player-topbar">
                <div className="traffic-dots">
                    <span className="dot-red" title="Close" />
                    <span className="dot-yellow" title="Minimize" />
                    <span className="dot-green" title="Expand" />
                </div>

                <div className="promo-player-url">
                    <span className="url-lock">🔒</span>
                    <span className="url-protocol">https://</span>
                    <span className="url-domain">mobilebibleschool.edu</span>
                    <span className="url-path">/promotional-video</span>
                </div>

                <div className="promo-player-meta-strip">
                    <span className={`promo-badge-pill ${isPlaying ? "status-playing" : ""}`}>
                        <span className="pulse-indicator" />
                        {isPlaying ? "AUTO-PLAYING" : (settings.badgeText || "PROMOTIONAL VIDEO")}
                    </span>
                    {onEditClick && (
                        <button
                            type="button"
                            className="btn-chassis-edit"
                            onClick={onEditClick}
                            title="Edit Video Settings in CMS"
                        >
                            <Settings size={13} />
                            <span>Edit in CMS</span>
                        </button>
                    )}
                </div>
            </div>

            {/* VIDEO DISPLAY AREA */}
            <div className="promo-video-screen-container">
                {isEmbed && embedSrc ? (
                    <div className="promo-iframe-wrapper">
                        <iframe
                            src={embedSrc}
                            title={settings.videoTitle || "Promotional Video"}
                            className="promo-iframe"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div className="promo-native-video-wrapper">
                        <video
                            ref={videoRef}
                            src={rawSource}
                            poster={activePoster}
                            loop={settings.loop ?? true}
                            muted={isMuted}
                            playsInline
                            className="promo-native-video"
                            onTimeUpdate={() => {
                                if (videoRef.current) {
                                    setCurrentTime(videoRef.current.currentTime);
                                    setDuration(videoRef.current.duration || 0);
                                }
                            }}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onClick={togglePlay}
                        />

                        {/* FLOATING ACTION OVERLAY CONTROLS */}
                        <div className="promo-floating-controls">
                            <button
                                type="button"
                                className="promo-btn-floating btn-play-pause"
                                onClick={togglePlay}
                                title={isPlaying ? "Pause Video" : "Play Video"}
                            >
                                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                                <span className="floating-ctrl-label">{isPlaying ? "Pause" : "Play"}</span>
                            </button>

                            <button
                                type="button"
                                className={`promo-btn-floating btn-audio-toggle ${isMuted ? "btn-muted-active" : "btn-unmuted"}`}
                                onClick={toggleMute}
                                title={isMuted ? "Click to Unmute Audio" : "Mute Sound"}
                            >
                                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                <span className="floating-mute-label">
                                    {isMuted ? "Click to Unmute" : "Sound On"}
                                </span>
                            </button>

                            <button
                                type="button"
                                className="promo-btn-floating btn-icon-only"
                                onClick={handleRestart}
                                title="Replay Video from Beginning"
                            >
                                <RotateCcw size={15} />
                            </button>

                            <button
                                type="button"
                                className="promo-btn-floating btn-icon-only"
                                onClick={toggleFullscreen}
                                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                            >
                                {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
                            </button>
                        </div>

                        {/* TIME SCRUBBER DISPLAY */}
                        {duration > 0 && (
                            <div className="promo-video-progress-bar">
                                <div
                                    className="promo-video-progress-fill"
                                    style={{ width: `${(currentTime / duration) * 100}%` }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* BOTTOM INFO & ACTION BAR */}
            <div className="promo-player-bottom-bar">
                <div className="promo-bottom-info">
                    <h3 className="promo-bottom-title">
                        {settings.videoTitle || "Mobile Bible School: Life, Doctrine & Ministry"}
                    </h3>
                    <p className="promo-bottom-desc">
                        {settings.videoTagline || "Equipping pastors and servants of the Word worldwide with sound doctrine."}
                    </p>
                </div>

                {onApplyClick && (
                    <button
                        type="button"
                        className="promo-btn-apply-cta"
                        onClick={onApplyClick}
                    >
                        <span>{settings.ctaText || "Apply for Admission"}</span>
                        <ArrowRight size={15} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default PromoVideoPlayer;
