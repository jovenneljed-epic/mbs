// ============================================================
// PromoVideoPlayer.tsx -> AUTOMATIC PROMOTIONAL VIDEO PLAYER
// Streamlined for real automatic video playback
// All fake cinematic scene carousels & slides removed
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

const DEFAULT_FALLBACK_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export const PromoVideoPlayer: React.FC<PromoVideoPlayerProps> = ({
    settings,
    onApplyClick,
    onEditClick
}) => {
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(settings.uploadedVideoUrl || null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(settings.muted ?? true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const chassisRef = useRef<HTMLDivElement>(null);

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

    // Determine the active video source
    const rawSource = uploadedUrl || settings.videoUrl || DEFAULT_FALLBACK_VIDEO;
    const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(rawSource);
    const isVimeo = /vimeo\.com/i.test(rawSource);
    const isEmbed = isYouTube || isVimeo;
    const embedSrc = isEmbed ? getEmbedUrl(rawSource, settings.autoPlay ?? true, isMuted) : null;

    // Handle HTML5 video events
    const togglePlay = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
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
            videoRef.current.currentTime = 0;
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    return (
        <div
            ref={chassisRef}
            className={`promo-player-chassis ${isFullscreen ? "fullscreen-active" : ""}`}
        >
            {/* TOP BAR BROWSER CHROME */}
            <div className="promo-player-topbar">
                <div className="traffic-dots">
                    <span className="dot-red" />
                    <span className="dot-yellow" />
                    <span className="dot-green" />
                </div>

                <div className="promo-player-url">
                    <span className="url-protocol">https://</span>
                    <span className="url-domain">mobilebibleschool.edu</span>
                    <span className="url-path">/promotional-video</span>
                </div>

                <div className="promo-player-meta-strip">
                    <span className="promo-badge-pill">
                        {settings.badgeText || "OFFICIAL PROMOTIONAL VIDEO"}
                    </span>
                    {onEditClick && (
                        <button
                            type="button"
                            className="btn-chassis-edit"
                            onClick={onEditClick}
                            title="Edit Video Settings in CMS"
                        >
                            <Settings size={14} />
                            <span>CMS Settings</span>
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
                            autoPlay={settings.autoPlay ?? true}
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
                                className="promo-btn-floating"
                                onClick={togglePlay}
                                title={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                            </button>

                            <button
                                type="button"
                                className={`promo-btn-floating ${isMuted ? "btn-muted-active" : ""}`}
                                onClick={toggleMute}
                                title={isMuted ? "Unmute Audio" : "Mute Audio"}
                            >
                                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                <span className="floating-mute-label">{isMuted ? "Click to Unmute" : "Sound On"}</span>
                            </button>

                            <button
                                type="button"
                                className="promo-btn-floating"
                                onClick={handleRestart}
                                title="Replay Video"
                            >
                                <RotateCcw size={18} />
                            </button>

                            <button
                                type="button"
                                className="promo-btn-floating"
                                onClick={toggleFullscreen}
                                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                            >
                                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
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
                        {settings.videoTagline || "Watch how our accredited theological curriculum equips pastors and servants of the Word worldwide."}
                    </p>
                </div>

                {onApplyClick && (
                    <button
                        type="button"
                        className="promo-btn-apply-cta"
                        onClick={onApplyClick}
                    >
                        <span>{settings.ctaText || "Apply for Admission"}</span>
                        <ArrowRight size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default PromoVideoPlayer;
