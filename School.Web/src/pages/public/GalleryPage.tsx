// ============================================================
// GalleryPage.tsx -> MOBILE BIBLE SCHOOL & THEOLOGICAL SEMINARY
// Official Institutional Campus Photo Gallery & Media Chronicles
// Role-based logic: Admins can upload & manage; others view-only
// ============================================================

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import "./GalleryPage.css";
import "./PublicUnisonTheme.css";
import {
    getGalleryPhotos,
    addGalleryPhoto,
    uploadPhotoFile,
    deleteGalleryPhoto,
    likeGalleryPhoto,
    resetGalleryPhotos,
    isUserAdmin,
    GALLERY_CATEGORIES,
    GALLERY_UPDATED_EVENT
} from "../../services/galleryService";
import type { GalleryPhoto } from "../../services/galleryService";
import {
    Camera,
    Upload,
    Plus,
    Trash2,
    Heart,
    Share2,
    Download,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    GraduationCap,
    MapPin,
    Calendar,
    Check,
    ArrowRight,
    Image as ImageIcon,
    Sparkles,
    Eye,
    RotateCcw,
    Lock,
    ExternalLink,
    Copy,
    Smartphone
} from "lucide-react";

// High-availability fallback image and offline SVG placeholder
const FALLBACK_PHOTO_URL = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80";
const PLACEHOLDER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Crect width='100%25' height='100%25' fill='%230f172a'/%3E%3Cg transform='translate(600, 370)' text-anchor='middle'%3E%3Ccircle r='52' fill='%231e293b' stroke='%23f59e0b' stroke-width='3'/%3E%3Cpath d='M-18 -10 L0 -26 L18 -10 L18 16 L-18 16 Z' fill='none' stroke='%23f59e0b' stroke-width='2.5' stroke-linejoin='round'/%3E%3Ctext y='95' fill='%23ffffff' font-family='sans-serif' font-size='24' font-weight='700'%3EMOBILE BIBLE SCHOOL%3C/text%3E%3Ctext y='126' fill='%2394a3b8' font-family='sans-serif' font-size='16'%3ETheological Seminary Visual Chronicles%3C/text%3E%3C/g%3E%3C/svg%3E";

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (target.dataset.triedFallback !== "true") {
        target.dataset.triedFallback = "true";
        target.src = FALLBACK_PHOTO_URL;
    } else {
        target.onerror = null;
        target.src = PLACEHOLDER_SVG;
    }
};

// Social Media Brand SVG Components
const FacebookIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const TwitterIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const TikTokIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .59.043.87.126V9.41a6.33 6.33 0 0 0-.87-.06A6.339 6.339 0 0 0 3.12 15.68a6.339 6.339 0 0 0 9.07 5.72 6.36 6.36 0 0 0 3.6-5.73V8.84a8.27 8.27 0 0 0 4.8 1.52V6.91a4.84 4.84 0 0 1-1-.22z" />
    </svg>
);

const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
);

const LinkedInIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.62 1.62 0 1 0 0-3.24 1.62 1.62 0 0 0 0 3.24M7.86 18.5V10.13H5.07V18.5h2.79z" />
    </svg>
);

interface GalleryPageProps {
    onNavigate?: (page: string) => void;
}

const GalleryPage: React.FC<GalleryPageProps> = ({ onNavigate }) => {
    // ------------------------------------------------------------
    // STATE
    // ------------------------------------------------------------
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeCategory, setActiveCategory] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    // Lightbox modal state
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

    // Admin Upload modal state
    const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
    const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: "",
        category: "ACADEMIC",
        description: "",
        imageUrl: "",
        location: "Main Campus, Manila",
        date: "",
        tags: "",
        isFeatured: false
    });

    // Admin Delete confirmation state
    const [photoToDelete, setPhotoToDelete] = useState<GalleryPhoto | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);

    // User interactions
    const [likedPhotos, setLikedPhotos] = useState<Set<number>>(new Set());

    // Social Media Share modal state
    const [shareModalPhoto, setShareModalPhoto] = useState<GalleryPhoto | null>(null);
    const [copiedLink, setCopiedLink] = useState<boolean>(false);
    const [copiedCaption, setCopiedCaption] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ------------------------------------------------------------
    // INITIALIZATION & LIFECYCLE
    // ------------------------------------------------------------
    useEffect(() => {
        try {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        } catch {
            window.scrollTo(0, 0);
        }

        document.title = "Campus Photo Gallery & Student Life | Mobile Bible School & Theological Seminary";

        // Check Admin privilege
        const adminStatus = isUserAdmin();
        setIsAdmin(adminStatus);

        // Load liked photos from localStorage
        try {
            const rawLiked = localStorage.getItem("mbs_liked_photos");
            if (rawLiked) {
                setLikedPhotos(new Set(JSON.parse(rawLiked)));
            }
        } catch {
            // Ignore
        }

        // Fetch gallery photos
        loadPhotos();

        // Real-time listener for gallery updates
        const handleGalleryUpdated = (e: CustomEvent) => {
            if (e.detail && Array.isArray(e.detail)) {
                setPhotos(e.detail);
            }
        };

        window.addEventListener(GALLERY_UPDATED_EVENT as any, handleGalleryUpdated);
        return () => {
            window.removeEventListener(GALLERY_UPDATED_EVENT as any, handleGalleryUpdated);
        };
    }, []);

    const loadPhotos = async () => {
        setLoading(true);
        try {
            const items = await getGalleryPhotos();
            setPhotos(items);
        } catch (err) {
            console.error("Failed to load photos:", err);
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------------------------------
    // NAVIGATION HELPER
    // ------------------------------------------------------------
    const handleNavigate = (page: string) => {
        if (onNavigate) {
            onNavigate(page);
        } else {
            window.location.href = `/${page}`;
        }
    };

    // ------------------------------------------------------------
    // FILTERING & SEARCH
    // ------------------------------------------------------------
    const filteredPhotos = useMemo(() => {
        let list = [...photos];

        // Filter by category
        if (activeCategory !== "ALL") {
            list = list.filter((p) => p.category.toUpperCase() === activeCategory.toUpperCase());
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    p.location.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q) ||
                    (p.tags && p.tags.toLowerCase().includes(q))
            );
        }

        return list;
    }, [photos, activeCategory, searchQuery]);

    // Category count map
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { ALL: photos.length };
        photos.forEach((p) => {
            const cat = p.category.toUpperCase();
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
    }, [photos]);

    // ------------------------------------------------------------
    // LIGHTBOX HANDLERS & DEEP LINKING
    // ------------------------------------------------------------
    const openLightbox = (index: number) => {
        setSelectedPhotoIndex(index);
        document.body.style.overflow = "hidden";
        try {
            const photo = filteredPhotos[index];
            if (photo) {
                const url = new URL(window.location.href);
                url.searchParams.set("photo", String(photo.id));
                window.history.replaceState({}, "", url.toString());
                document.title = `${photo.title} | Mobile Bible School & Theological Seminary`;
            }
        } catch {
            // Ignore
        }
    };

    const closeLightbox = () => {
        setSelectedPhotoIndex(null);
        document.body.style.overflow = "auto";
        try {
            const url = new URL(window.location.href);
            url.searchParams.delete("photo");
            window.history.replaceState({}, "", url.toString());
            document.title = "Campus Photo Gallery & Student Life | Mobile Bible School & Theological Seminary";
        } catch {
            // Ignore
        }
    };

    // Deep-linking: auto-open photo from query param (?photo=id)
    useEffect(() => {
        if (photos.length === 0) return;
        try {
            const params = new URLSearchParams(window.location.search);
            const photoIdParam = params.get("photo");
            if (photoIdParam) {
                const targetId = Number(photoIdParam);
                const foundIdx = photos.findIndex((p) => p.id === targetId);
                if (foundIdx !== -1) {
                    openLightbox(foundIdx);
                }
            }
        } catch {
            // Ignore
        }
    }, [photos]);

    // Keep URL and document title in sync when user navigates next/prev photo
    useEffect(() => {
        if (selectedPhotoIndex !== null && filteredPhotos[selectedPhotoIndex]) {
            try {
                const photo = filteredPhotos[selectedPhotoIndex];
                const url = new URL(window.location.href);
                url.searchParams.set("photo", String(photo.id));
                window.history.replaceState({}, "", url.toString());
                document.title = `${photo.title} | Mobile Bible School & Theological Seminary`;
            } catch {
                // Ignore
            }
        }
    }, [selectedPhotoIndex, filteredPhotos]);

    const nextPhoto = useCallback(() => {
        if (selectedPhotoIndex === null || filteredPhotos.length === 0) return;
        setSelectedPhotoIndex((prev) => (prev! + 1) % filteredPhotos.length);
    }, [selectedPhotoIndex, filteredPhotos.length]);

    const prevPhoto = useCallback(() => {
        if (selectedPhotoIndex === null || filteredPhotos.length === 0) return;
        setSelectedPhotoIndex((prev) => (prev! - 1 + filteredPhotos.length) % filteredPhotos.length);
    }, [selectedPhotoIndex, filteredPhotos.length]);

    // Keyboard navigation for lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedPhotoIndex === null) return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") nextPhoto();
            if (e.key === "ArrowLeft") prevPhoto();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedPhotoIndex, nextPhoto, prevPhoto]);

    // ------------------------------------------------------------
    // LIKE HANDLER (ALL ACCOUNTS & VISITORS)
    // ------------------------------------------------------------
    const handleLike = async (e: React.MouseEvent, photoId: number) => {
        e.stopPropagation();
        if (likedPhotos.has(photoId)) return;

        const updatedSet = new Set(likedPhotos);
        updatedSet.add(photoId);
        setLikedPhotos(updatedSet);
        try {
            localStorage.setItem("mbs_liked_photos", JSON.stringify(Array.from(updatedSet)));
        } catch {
            // Ignore
        }

        await likeGalleryPhoto(photoId);

        // Update local photo state
        setPhotos((prev) =>
            prev.map((p) => (p.id === photoId ? { ...p, likesCount: (p.likesCount || 0) + 1 } : p))
        );
    };

    // ------------------------------------------------------------
    // SOCIAL MEDIA SHARE HELPERS & HANDLERS
    // ------------------------------------------------------------
    const getPhotoShareUrl = (photo: GalleryPhoto): string => {
        if (typeof window === "undefined") return "";
        const base = `${window.location.origin}${window.location.pathname}`;
        return `${base}?photo=${photo.id}`;
    };

    const getPhotoShareText = (photo: GalleryPhoto): string => {
        return `${photo.title} — ${photo.location} | Mobile Bible School & Theological Seminary`;
    };

    const getTikTokCaption = (photo: GalleryPhoto): string => {
        const url = getPhotoShareUrl(photo);
        return `${photo.title}\n\n📍 ${photo.location}\n🎓 Mobile Bible School & Theological Seminary\n🔗 ${url}\n\n#MobileBibleSchool #Theology #PastoralMinistry #SeminaryLife #BibleCollege #FaithfulGospel #ChristCentered`;
    };

    const handleOpenShareModal = (e: React.MouseEvent, photo: GalleryPhoto) => {
        e.stopPropagation();
        setShareModalPhoto(photo);
        setCopiedLink(false);
        setCopiedCaption(false);
    };

    const handleCloseShareModal = () => {
        setShareModalPhoto(null);
        setCopiedLink(false);
        setCopiedCaption(false);
    };

    const handleShareToFacebook = (photo: GalleryPhoto) => {
        const url = getPhotoShareUrl(photo);
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(photo.title)}`;
        window.open(fbUrl, "_blank", "width=640,height=580,noopener,noreferrer");
    };

    const handleShareToTwitter = (photo: GalleryPhoto) => {
        const url = getPhotoShareUrl(photo);
        const text = `${photo.title} — Mobile Bible School & Theological Seminary`;
        const twUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}&hashtags=${encodeURIComponent("MobileBibleSchool,Theology,SeminaryLife")}`;
        window.open(twUrl, "_blank", "width=640,height=580,noopener,noreferrer");
    };

    const handleShareToTikTok = (photo: GalleryPhoto) => {
        const caption = getTikTokCaption(photo);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(caption);
            setCopiedCaption(true);
            setTimeout(() => setCopiedCaption(false), 3500);
        }
        window.open("https://www.tiktok.com/upload", "_blank", "noopener,noreferrer");
    };

    const handleShareToWhatsApp = (photo: GalleryPhoto) => {
        const url = getPhotoShareUrl(photo);
        const text = `${photo.title} — ${photo.location}\n${url}`;
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(waUrl, "_blank", "noopener,noreferrer");
    };

    const handleShareToLinkedIn = (photo: GalleryPhoto) => {
        const url = getPhotoShareUrl(photo);
        const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(liUrl, "_blank", "width=640,height=580,noopener,noreferrer");
    };

    const handleNativeShare = async (photo: GalleryPhoto) => {
        const url = getPhotoShareUrl(photo);
        const text = getPhotoShareText(photo);
        if (navigator.share) {
            try {
                await navigator.share({
                    title: photo.title,
                    text: text,
                    url: url
                });
            } catch {
                // User cancelled
            }
        } else {
            handleCopyShareLink(photo);
        }
    };

    const handleCopyShareLink = (photo: GalleryPhoto) => {
        const url = getPhotoShareUrl(photo);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            setCopiedLink(true);
            setTimeout(() => {
                setCopiedLink(false);
            }, 2500);
        }
    };

    const handleCopyTikTokCaptionOnly = (photo: GalleryPhoto) => {
        const caption = getTikTokCaption(photo);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(caption);
            setCopiedCaption(true);
            setTimeout(() => setCopiedCaption(false), 2500);
        }
    };

    // ------------------------------------------------------------
    // HIGH-RES DOWNLOAD HANDLER
    // ------------------------------------------------------------
    const handleDownloadPhoto = async (e: React.MouseEvent, photo: GalleryPhoto) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const res = await fetch(photo.imageUrl, { mode: "cors" });
            if (res.ok) {
                const blob = await res.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = `${photo.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
                return;
            }
        } catch {
            // Fallback if cross-origin fetch is prevented
        }
        window.open(photo.imageUrl, "_blank", "noopener,noreferrer");
    };

    // ------------------------------------------------------------
    // ADMIN UPLOAD HANDLERS
    // ------------------------------------------------------------
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setUploadError(null);

        // Live preview
        const reader = new FileReader();
        reader.onload = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleOpenUploadModal = () => {
        setForm({
            title: "",
            category: "ACADEMIC",
            description: "",
            imageUrl: "",
            location: "Main Campus, Manila",
            date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
            tags: "Academic, Seminary Life",
            isFeatured: false
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadError(null);
        setIsUploadModalOpen(true);
    };

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadError(null);
    };

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) {
            setUploadError("Only administrative accounts are authorized to upload campus photos.");
            return;
        }

        if (!form.title.trim()) {
            setUploadError("Please provide a title or caption for the photo.");
            return;
        }

        let finalImageUrl = form.imageUrl.trim();

        if (uploadMode === "file") {
            if (!selectedFile && !previewUrl) {
                setUploadError("Please select an image file to upload.");
                return;
            }

            setUploading(true);
            try {
                if (selectedFile) {
                    finalImageUrl = await uploadPhotoFile(selectedFile);
                } else if (previewUrl) {
                    finalImageUrl = previewUrl;
                }
            } catch (err: any) {
                setUploadError(err?.message || "Failed to upload image. Please try again.");
                setUploading(false);
                return;
            }
        } else {
            if (!finalImageUrl) {
                setUploadError("Please paste a valid image URL.");
                return;
            }
        }

        try {
            await addGalleryPhoto({
                title: form.title.trim(),
                category: form.category,
                description: form.description.trim() || `Official campus media document: ${form.title.trim()}.`,
                imageUrl: finalImageUrl,
                location: form.location.trim() || "Main Campus, Manila",
                date: form.date.trim() || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
                tags: form.tags.trim() || form.category,
                isFeatured: form.isFeatured,
                likesCount: 1
            });

            handleCloseUploadModal();
            loadPhotos();
        } catch (err: any) {
            setUploadError(err?.message || "Error saving photo to gallery.");
        } finally {
            setUploading(false);
        }
    };

    // ------------------------------------------------------------
    // ADMIN DELETE HANDLERS
    // ------------------------------------------------------------
    const handleConfirmDelete = async () => {
        if (!photoToDelete || !isAdmin) return;
        setDeleting(true);

        try {
            await deleteGalleryPhoto(photoToDelete.id);
            setPhotoToDelete(null);
            if (selectedPhotoIndex !== null) {
                closeLightbox();
            }
            loadPhotos();
        } catch (err) {
            console.error("Delete photo error:", err);
        } finally {
            setDeleting(false);
        }
    };

    const handleResetToDefault = async () => {
        if (!isAdmin) return;
        if (window.confirm("Restore the gallery to the 12 default Mobile Bible School promotional photos? Custom uploads will be cleared.")) {
            await resetGalleryPhotos();
            loadPhotos();
        }
    };

    const activePhoto = selectedPhotoIndex !== null ? filteredPhotos[selectedPhotoIndex] : null;

    // ------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------
    return (
        <div className="mbs-gallery-page-root">
            {/* UNIFIED GLOBAL HEADER */}
            <PublicHeader onNavigate={onNavigate} hideThemeSwitcher={true} />

            {/* =========================================================
                HERO SECTION (Mobile Bible School Visual Chronicles)
            ========================================================= */}
            <section className="mbs-gallery-hero">
                <div className="mbs-gallery-hero-glow" />
                <div className="mbs-gallery-container">
                    <div className="mbs-gallery-hero-content">
                        <div className="mbs-gallery-hero-badge">
                            <Sparkles size={14} color="var(--theme-secondary, #F59E0B)" />
                            <span>MBS Visual Chronicles &amp; Institutional Life</span>
                        </div>

                        <h1 className="mbs-gallery-hero-title">
                            Campus Life &amp; <span>Academic Excellence</span>
                        </h1>

                        <p className="mbs-gallery-hero-subtitle">
                            Explore the vibrant, Christ-centered community of Mobile Bible School &amp; Theological Seminary — from intensive Greek &amp; Hebrew exegesis lectures and ordination convocations to campus chapel worship and nationwide student field ministries.
                        </p>

                        {/* Institutional Stats Banner */}
                        <div className="mbs-gallery-stats-row">
                            <div className="mbs-gallery-stat-pill">
                                <strong>Faithful</strong>
                                <span>Gospel Proclamation</span>
                            </div>
                            <div className="mbs-gallery-stat-pill">
                                <strong>5,000+</strong>
                                <span>Alumni Leaders</span>
                            </div>
                            <div className="mbs-gallery-stat-pill">
                                <strong>12</strong>
                                <span>Regional Campuses</span>
                            </div>
                            <div className="mbs-gallery-stat-pill">
                                <strong>100%</strong>
                                <span>Biblical Inerrancy</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                ADMIN PRIVILEGE / ROLE STATUS BAR
            ========================================================= */}
            <div className="mbs-role-bar">
                <div className="mbs-gallery-container">
                    <div className="mbs-role-bar-inner">
                        {isAdmin ? (
                            <div className="mbs-role-admin-badge">
                                <ShieldCheck size={16} color="#10B981" />
                                <div>
                                    <strong>Administrator Mode Active</strong>
                                    <small>You have authorized administrative access to upload, feature, and manage campus gallery photos.</small>
                                </div>
                            </div>
                        ) : (
                            <div className="mbs-role-viewer-badge">
                                <Eye size={15} color="var(--theme-secondary, #F59E0B)" />
                                <div>
                                    <strong>Student &amp; Public Showcase Mode</strong>
                                    <small>Viewing-only archive. Official promotional photography curated by the Seminary Academic Directorate.</small>
                                </div>
                            </div>
                        )}

                        <div className="mbs-role-actions">
                            {isAdmin ? (
                                <>
                                    <button
                                        type="button"
                                        className="mbs-btn-admin-upload"
                                        onClick={handleOpenUploadModal}
                                    >
                                        <Plus size={16} />
                                        <span>Upload New Photo</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="mbs-btn-admin-reset"
                                        onClick={handleResetToDefault}
                                        title="Restore default curated seminary photos"
                                    >
                                        <RotateCcw size={14} />
                                        <span>Reset Photos</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    className="mbs-btn-faculty-login"
                                    onClick={() => handleNavigate("login")}
                                    title="Faculty / Administrator Login"
                                >
                                    <Lock size={13} />
                                    <span>Faculty / Admin Sign In</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================================================
                GALLERY CONTROLS (CATEGORY TABS + SEARCH)
            ========================================================= */}
            <section className="mbs-gallery-controls-section">
                <div className="mbs-gallery-container">
                    <div className="mbs-controls-layout">
                        {/* CATEGORY TABS */}
                        <div className="mbs-category-tabs-scroll" role="tablist">
                            {GALLERY_CATEGORIES.map((cat) => {
                                const count = categoryCounts[cat.id] || 0;
                                const isActive = activeCategory === cat.id;

                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={isActive}
                                        className={`mbs-category-tab ${isActive ? "active" : ""}`}
                                        onClick={() => setActiveCategory(cat.id)}
                                    >
                                        <span>{cat.label}</span>
                                        <span className="mbs-tab-counter">{count}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* SEARCH INPUT */}
                        <div className="mbs-search-box">
                            <Search size={16} className="mbs-search-icon" />
                            <input
                                type="text"
                                placeholder="Search by title, location, category, or tag..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="mbs-clear-search-btn"
                                    onClick={() => setSearchQuery("")}
                                    title="Clear search"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                PHOTO GRID
            ========================================================= */}
            <main className="mbs-gallery-main">
                <div className="mbs-gallery-container">
                    {loading ? (
                        <div className="mbs-gallery-loading">
                            <Camera size={38} className="mbs-spin" />
                            <p>Loading Mobile Bible School Visual Chronicles...</p>
                        </div>
                    ) : filteredPhotos.length === 0 ? (
                        <div className="mbs-gallery-empty-state">
                            <div className="mbs-empty-crest">
                                <ImageIcon size={44} />
                            </div>
                            <h3>No Photos Found in this Section</h3>
                            <p>
                                No campus chronicles matched your active filter or search keyword: <strong>"{searchQuery || activeCategory}"</strong>.
                            </p>
                            <div className="mbs-empty-actions">
                                <button
                                    type="button"
                                    className="mbs-btn-secondary"
                                    onClick={() => {
                                        setActiveCategory("ALL");
                                        setSearchQuery("");
                                    }}
                                >
                                    Reset Filters &amp; Browse All
                                </button>
                                {isAdmin && (
                                    <button
                                        type="button"
                                        className="mbs-btn-primary"
                                        onClick={handleOpenUploadModal}
                                    >
                                        <Plus size={15} /> Upload First Photo
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mbs-photo-grid">
                            {filteredPhotos.map((photo, index) => {
                                const isLiked = likedPhotos.has(photo.id);

                                return (
                                    <article
                                        key={photo.id}
                                        className={`mbs-photo-card ${photo.isFeatured ? "featured" : ""}`}
                                        onClick={() => openLightbox(index)}
                                    >
                                        {/* Image Container with Aspect Ratio */}
                                        <div className="mbs-photo-frame">
                                            <img
                                                src={photo.imageUrl}
                                                alt={photo.title}
                                                loading="lazy"
                                                referrerPolicy="no-referrer"
                                                crossOrigin="anonymous"
                                                onError={handleImageError}
                                            />

                                            <div className="mbs-photo-overlay">
                                                <div className="mbs-overlay-top">
                                                    <span className="mbs-badge-category">
                                                        {photo.category}
                                                    </span>

                                                    {photo.isFeatured && (
                                                        <span className="mbs-badge-featured">
                                                            ★ Featured
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mbs-overlay-bottom">
                                                    <span className="mbs-quick-location">
                                                        <MapPin size={12} /> {photo.location}
                                                    </span>
                                                    <span className="mbs-quick-date">
                                                        <Calendar size={12} /> {photo.date}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Hover Zoom Icon */}
                                            <div className="mbs-zoom-indicator">
                                                <Eye size={20} />
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="mbs-photo-body">
                                            <h3 className="mbs-photo-title" title={photo.title}>
                                                {photo.title}
                                            </h3>

                                            <p className="mbs-photo-snippet">
                                                {photo.description}
                                            </p>

                                            <div className="mbs-photo-card-footer">
                                                {/* Likes button */}
                                                <button
                                                    type="button"
                                                    className={`mbs-like-btn ${isLiked ? "liked" : ""}`}
                                                    onClick={(e) => handleLike(e, photo.id)}
                                                    title={isLiked ? "You appreciated this photo" : "Appreciate this photo"}
                                                >
                                                    <Heart size={14} className={isLiked ? "fill-current" : ""} />
                                                    <span>{photo.likesCount || 0}</span>
                                                </button>

                                                {/* Share */}
                                                <button
                                                    type="button"
                                                    className="mbs-share-btn"
                                                    onClick={(e) => handleOpenShareModal(e, photo)}
                                                    title="Share on Facebook, Twitter, TikTok & more"
                                                >
                                                    <Share2 size={13} />
                                                </button>

                                                {/* Admin delete button */}
                                                {isAdmin && (
                                                    <button
                                                        type="button"
                                                        className="mbs-admin-delete-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPhotoToDelete(photo);
                                                        }}
                                                        title="Delete photo (Admin only)"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* =========================================================
                FULLSCREEN LIGHTBOX MODAL
            ========================================================= */}
            {activePhoto && (
                <div className="mbs-lightbox-backdrop" onClick={closeLightbox}>
                    <div className="mbs-lightbox-modal" onClick={(e) => e.stopPropagation()}>
                        {/* Close button */}
                        <button
                            type="button"
                            className="mbs-lightbox-close-btn"
                            onClick={closeLightbox}
                            aria-label="Close photo preview"
                        >
                            <X size={20} />
                        </button>

                        {/* Navigation Arrows */}
                        <button
                            type="button"
                            className="mbs-lightbox-nav prev"
                            onClick={prevPhoto}
                            aria-label="Previous photo"
                        >
                            <ChevronLeft size={28} />
                        </button>

                        <button
                            type="button"
                            className="mbs-lightbox-nav next"
                            onClick={nextPhoto}
                            aria-label="Next photo"
                        >
                            <ChevronRight size={28} />
                        </button>

                        {/* Main Stage */}
                        <div className="mbs-lightbox-stage">
                            <div className="mbs-lightbox-image-wrap">
                                <img
                                    src={activePhoto.imageUrl}
                                    alt={activePhoto.title}
                                    referrerPolicy="no-referrer"
                                    crossOrigin="anonymous"
                                    onError={handleImageError}
                                />
                            </div>

                            {/* Details Sidebar / Drawer */}
                            <div className="mbs-lightbox-info-pane">
                                <div className="mbs-lightbox-info-header">
                                    <span className="mbs-badge-category">
                                        {activePhoto.category}
                                    </span>
                                    {activePhoto.isFeatured && (
                                        <span className="mbs-badge-featured">
                                            ★ Featured Chronicle
                                        </span>
                                    )}
                                </div>

                                <h2 className="mbs-lightbox-title">
                                    {activePhoto.title}
                                </h2>

                                <div className="mbs-lightbox-metadata">
                                    <div className="mbs-meta-item">
                                        <MapPin size={14} color="var(--theme-secondary, #F59E0B)" />
                                        <span><strong>Campus:</strong> {activePhoto.location}</span>
                                    </div>
                                    <div className="mbs-meta-item">
                                        <Calendar size={14} color="var(--theme-secondary, #F59E0B)" />
                                        <span><strong>Recorded:</strong> {activePhoto.date}</span>
                                    </div>
                                    {activePhoto.tags && (
                                        <div className="mbs-meta-tags">
                                            {activePhoto.tags.split(",").map((tag, i) => (
                                                <span key={i} className="mbs-tag-chip">
                                                    #{tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mbs-lightbox-description">
                                    <h4>Institutional Description:</h4>
                                    <p>{activePhoto.description}</p>
                                </div>

                                {/* Lightbox Action Buttons */}
                                <div className="mbs-lightbox-actions-container">
                                    <div className="mbs-lightbox-actions">
                                        <button
                                            type="button"
                                            className={`mbs-btn-like ${likedPhotos.has(activePhoto.id) ? "active" : ""}`}
                                            onClick={(e) => handleLike(e, activePhoto.id)}
                                            title="Appreciate this chronicle"
                                        >
                                            <Heart size={16} className={likedPhotos.has(activePhoto.id) ? "fill-current" : ""} />
                                            <span>{activePhoto.likesCount || 0} Appreciations</span>
                                        </button>

                                        <button
                                            type="button"
                                            className="mbs-btn-download"
                                            onClick={(e) => handleDownloadPhoto(e, activePhoto)}
                                            title="Download high-resolution chronicle"
                                        >
                                            <Download size={15} />
                                            <span>Download High-Res</span>
                                        </button>

                                        <button
                                            type="button"
                                            className="mbs-btn-share-main"
                                            onClick={(e) => handleOpenShareModal(e, activePhoto)}
                                            title="Share to Facebook, Twitter, TikTok & more"
                                        >
                                            <Share2 size={15} />
                                            <span>Share Chronicle</span>
                                        </button>

                                        {isAdmin && (
                                            <button
                                                type="button"
                                                className="mbs-btn-admin-trash"
                                                onClick={() => setPhotoToDelete(activePhoto)}
                                                title="Delete photo (Admin only)"
                                            >
                                                <Trash2 size={15} />
                                                <span>Delete</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* 1-Click Social Media Sharing Strip */}
                                    <div className="mbs-quick-social-strip">
                                        <span className="mbs-quick-social-label">Share On:</span>
                                        <div className="mbs-quick-social-buttons">
                                            <button
                                                type="button"
                                                className="mbs-quick-btn fb"
                                                onClick={() => handleShareToFacebook(activePhoto)}
                                                title="Share to Facebook"
                                            >
                                                <FacebookIcon size={14} />
                                                <span>Facebook</span>
                                            </button>

                                            <button
                                                type="button"
                                                className="mbs-quick-btn tw"
                                                onClick={() => handleShareToTwitter(activePhoto)}
                                                title="Post to X (Twitter)"
                                            >
                                                <TwitterIcon size={13} />
                                                <span>X / Twitter</span>
                                            </button>

                                            <button
                                                type="button"
                                                className="mbs-quick-btn tt"
                                                onClick={() => handleShareToTikTok(activePhoto)}
                                                title="Copy caption & open TikTok"
                                            >
                                                <TikTokIcon size={14} />
                                                <span>TikTok</span>
                                            </button>

                                            <button
                                                type="button"
                                                className="mbs-quick-btn wa"
                                                onClick={() => handleShareToWhatsApp(activePhoto)}
                                                title="Send on WhatsApp"
                                            >
                                                <WhatsAppIcon size={14} />
                                                <span>WhatsApp</span>
                                            </button>

                                            <button
                                                type="button"
                                                className="mbs-quick-btn copy"
                                                onClick={() => handleCopyShareLink(activePhoto)}
                                                title="Copy direct link"
                                            >
                                                {copiedLink ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                                                <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Counter */}
                                <div className="mbs-lightbox-counter">
                                    Photo {(selectedPhotoIndex ?? 0) + 1} of {filteredPhotos.length}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================
                SOCIAL MEDIA SHARE MODAL (FACEBOOK, X/TWITTER, TIKTOK & MORE)
            ========================================================= */}
            {shareModalPhoto && (
                <div className="mbs-modal-backdrop" onClick={handleCloseShareModal}>
                    <div className="mbs-share-dialog" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="mbs-share-dialog-header">
                            <div className="mbs-share-title-box">
                                <div className="mbs-share-crest-icon">
                                    <Sparkles size={18} color="var(--theme-secondary, #F59E0B)" />
                                </div>
                                <div>
                                    <h3>Share Campus Chronicle</h3>
                                    <small>Mobile Bible School &amp; Theological Seminary</small>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="mbs-modal-close"
                                onClick={handleCloseShareModal}
                                aria-label="Close share dialog"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mbs-share-dialog-body">
                            {/* Chronicle Snapshot Preview Card */}
                            <div className="mbs-share-preview-card">
                                <img
                                    src={shareModalPhoto.imageUrl}
                                    alt={shareModalPhoto.title}
                                    referrerPolicy="no-referrer"
                                    onError={handleImageError}
                                />
                                <div className="mbs-share-preview-info">
                                    <div className="mbs-share-preview-top">
                                        <span className="mbs-badge-category">{shareModalPhoto.category}</span>
                                        {shareModalPhoto.isFeatured && (
                                            <span className="mbs-badge-featured">★ Featured</span>
                                        )}
                                    </div>
                                    <h4>{shareModalPhoto.title}</h4>
                                    <p><MapPin size={12} /> {shareModalPhoto.location}</p>
                                </div>
                            </div>

                            {/* Section: 1-Click Social Media Channels */}
                            <div className="mbs-share-section-title">
                                <span>Choose Social Platform</span>
                            </div>

                            <div className="mbs-share-grid">
                                {/* Facebook */}
                                <button
                                    type="button"
                                    className="mbs-share-tile fb"
                                    onClick={() => handleShareToFacebook(shareModalPhoto)}
                                >
                                    <div className="mbs-tile-icon fb">
                                        <FacebookIcon size={20} />
                                    </div>
                                    <div className="mbs-tile-meta">
                                        <strong>Facebook</strong>
                                        <span>Feed, Groups &amp; Stories</span>
                                    </div>
                                </button>

                                {/* Twitter / X */}
                                <button
                                    type="button"
                                    className="mbs-share-tile tw"
                                    onClick={() => handleShareToTwitter(shareModalPhoto)}
                                >
                                    <div className="mbs-tile-icon tw">
                                        <TwitterIcon size={19} />
                                    </div>
                                    <div className="mbs-tile-meta">
                                        <strong>X / Twitter</strong>
                                        <span>Tweet with Hashtags</span>
                                    </div>
                                </button>

                                {/* TikTok */}
                                <button
                                    type="button"
                                    className="mbs-share-tile tt"
                                    onClick={() => handleShareToTikTok(shareModalPhoto)}
                                >
                                    <div className="mbs-tile-icon tt">
                                        <TikTokIcon size={20} />
                                    </div>
                                    <div className="mbs-tile-meta">
                                        <strong>TikTok</strong>
                                        <span>Copy Caption &amp; Open</span>
                                    </div>
                                </button>

                                {/* WhatsApp */}
                                <button
                                    type="button"
                                    className="mbs-share-tile wa"
                                    onClick={() => handleShareToWhatsApp(shareModalPhoto)}
                                >
                                    <div className="mbs-tile-icon wa">
                                        <WhatsAppIcon size={20} />
                                    </div>
                                    <div className="mbs-tile-meta">
                                        <strong>WhatsApp</strong>
                                        <span>Direct Chat &amp; Status</span>
                                    </div>
                                </button>

                                {/* LinkedIn */}
                                <button
                                    type="button"
                                    className="mbs-share-tile li"
                                    onClick={() => handleShareToLinkedIn(shareModalPhoto)}
                                >
                                    <div className="mbs-tile-icon li">
                                        <LinkedInIcon size={19} />
                                    </div>
                                    <div className="mbs-tile-meta">
                                        <strong>LinkedIn</strong>
                                        <span>Post to Network</span>
                                    </div>
                                </button>

                                {/* Device Native Share */}
                                <button
                                    type="button"
                                    className="mbs-share-tile native"
                                    onClick={() => handleNativeShare(shareModalPhoto)}
                                >
                                    <div className="mbs-tile-icon native">
                                        <Smartphone size={19} />
                                    </div>
                                    <div className="mbs-tile-meta">
                                        <strong>Device Sheet</strong>
                                        <span>AirDrop, Instagram, SMS</span>
                                    </div>
                                </button>
                            </div>

                            {/* Direct Share Link Input Box */}
                            <div className="mbs-share-link-section">
                                <label>Direct Photo Deep-Link</label>
                                <div className="mbs-share-link-input-wrap">
                                    <input
                                        type="text"
                                        readOnly
                                        value={getPhotoShareUrl(shareModalPhoto)}
                                        onClick={(e) => (e.target as HTMLInputElement).select()}
                                    />
                                    <button
                                        type="button"
                                        className={`mbs-copy-btn ${copiedLink ? "copied" : ""}`}
                                        onClick={() => handleCopyShareLink(shareModalPhoto)}
                                    >
                                        {copiedLink ? (
                                            <>
                                                <Check size={14} color="#10B981" />
                                                <span>Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} />
                                                <span>Copy Link</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* TikTok & Instagram Caption Box */}
                            <div className="mbs-tiktok-caption-section">
                                <div className="mbs-tiktok-header">
                                    <div className="mbs-tiktok-title">
                                        <TikTokIcon size={16} />
                                        <span>TikTok &amp; Instagram Caption with Hashtags</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="mbs-copy-caption-btn"
                                        onClick={() => handleCopyTikTokCaptionOnly(shareModalPhoto)}
                                    >
                                        {copiedCaption ? (
                                            <>
                                                <Check size={13} color="#10B981" />
                                                <span>Caption Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={13} />
                                                <span>Copy Caption</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="mbs-tiktok-caption-preview">
                                    <code>{getTikTokCaption(shareModalPhoto)}</code>
                                </div>
                                <small className="mbs-tiktok-help">
                                    💡 <strong>TikTok / Reels Creator Tip:</strong> Click <strong>"Copy Caption"</strong>, then paste directly into your TikTok video caption, Instagram post, or Facebook Reel!
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================
                ADMIN UPLOAD MODAL (ADMIN ACCOUNTS ONLY)
            ========================================================= */}
            {isUploadModalOpen && (
                <div className="mbs-modal-backdrop" onClick={handleCloseUploadModal}>
                    <div className="mbs-upload-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="mbs-modal-header">
                            <div className="mbs-modal-title-box">
                                <ShieldCheck size={20} color="var(--theme-secondary, #F59E0B)" />
                                <div>
                                    <h3>Upload Campus Photo to Gallery</h3>
                                    <small>Official Administrator Media Portal • Mobile Bible School</small>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="mbs-modal-close"
                                onClick={handleCloseUploadModal}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {uploadError && (
                            <div className="mbs-modal-error-alert" role="alert">
                                <span>⚠️ {uploadError}</span>
                            </div>
                        )}

                        <form onSubmit={handleUploadSubmit} className="mbs-upload-form">
                            {/* Source Switcher: Upload File vs Image URL */}
                            <div className="mbs-source-switcher">
                                <button
                                    type="button"
                                    className={`mbs-source-btn ${uploadMode === "file" ? "active" : ""}`}
                                    onClick={() => setUploadMode("file")}
                                >
                                    <Upload size={14} />
                                    <span>Upload Local Image File</span>
                                </button>
                                <button
                                    type="button"
                                    className={`mbs-source-btn ${uploadMode === "url" ? "active" : ""}`}
                                    onClick={() => setUploadMode("url")}
                                >
                                    <ExternalLink size={14} />
                                    <span>Paste Image URL</span>
                                </button>
                            </div>

                            {/* Dropzone for File Upload */}
                            {uploadMode === "file" ? (
                                <div
                                    className="mbs-dropzone"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                        onChange={handleFileChange}
                                        style={{ display: "none" }}
                                    />

                                    {previewUrl ? (
                                        <div className="mbs-dropzone-preview">
                                            <img src={previewUrl} alt="Upload preview" />
                                            <div className="mbs-preview-overlay">
                                                <span>Click to change file</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mbs-dropzone-prompt">
                                            <Camera size={34} color="var(--theme-secondary, #F59E0B)" />
                                            <h4>Drag and drop photo here, or click to browse</h4>
                                            <p>Supports PNG, JPG, JPEG, and WEBP formats (up to 15 MB)</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mbs-form-group">
                                    <label htmlFor="imageUrl">
                                        Direct Image URL <span className="req">*</span>
                                    </label>
                                    <input
                                        id="imageUrl"
                                        type="url"
                                        placeholder="https://example.com/photos/seminary-event.jpg"
                                        value={form.imageUrl}
                                        onChange={(e) => {
                                            setForm({ ...form, imageUrl: e.target.value });
                                            setPreviewUrl(e.target.value);
                                        }}
                                        required
                                    />
                                    {previewUrl && (
                                        <div className="mbs-url-preview-thumb">
                                            <img src={previewUrl} alt="URL Preview" onError={() => setPreviewUrl(null)} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Title / Caption */}
                            <div className="mbs-form-group">
                                <label htmlFor="title">
                                    Photo Title / Headline <span className="req">*</span>
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    placeholder="e.g. 2026 Pastoral Ordination and Degree Conferment Ceremony"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    required
                                    maxLength={160}
                                />
                            </div>

                            {/* Category & Location Row */}
                            <div className="mbs-form-row">
                                <div className="mbs-form-group">
                                    <label htmlFor="category">Academic / Ministry Category</label>
                                    <select
                                        id="category"
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    >
                                        <option value="ACADEMIC">Academic &amp; Lectures</option>
                                        <option value="ORDINATION">Ordination &amp; Convocation</option>
                                        <option value="CHAPEL">Chapel &amp; Worship</option>
                                        <option value="MINISTRIES">Field Missions &amp; Outreach</option>
                                        <option value="FACILITIES">Campus &amp; Research Library</option>
                                    </select>
                                </div>

                                <div className="mbs-form-group">
                                    <label htmlFor="location">Campus / Facility Location</label>
                                    <input
                                        id="location"
                                        type="text"
                                        placeholder="e.g. Main Campus Auditorium, Manila"
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                        maxLength={100}
                                    />
                                </div>
                            </div>

                            {/* Date & Tags Row */}
                            <div className="mbs-form-row">
                                <div className="mbs-form-group">
                                    <label htmlFor="date">Academic Date / Month</label>
                                    <input
                                        id="date"
                                        type="text"
                                        placeholder="e.g. October 2026"
                                        value={form.date}
                                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        maxLength={50}
                                    />
                                </div>

                                <div className="mbs-form-group">
                                    <label htmlFor="tags">Tags (Comma separated)</label>
                                    <input
                                        id="tags"
                                        type="text"
                                        placeholder="B.Th., Graduation, Exegesis, Chapel"
                                        value={form.tags}
                                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                        maxLength={150}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mbs-form-group">
                                <label htmlFor="description">Promotional Context / Description</label>
                                <textarea
                                    id="description"
                                    rows={3}
                                    placeholder="Explain the academic or spiritual significance of this moment for prospective students and partners..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    maxLength={500}
                                />
                            </div>

                            {/* Featured Checkbox */}
                            <div className="mbs-checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={form.isFeatured}
                                        onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                                    />
                                    <span>Feature this photo at the top of the gallery</span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="mbs-modal-actions">
                                <button
                                    type="button"
                                    className="mbs-btn-cancel"
                                    onClick={handleCloseUploadModal}
                                    disabled={uploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="mbs-btn-upload-submit"
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <>
                                            <Camera size={16} className="mbs-spin" />
                                            <span>Publishing to Campus Gallery...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={16} />
                                            <span>Publish Photo to Gallery</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================
                ADMIN DELETE CONFIRMATION DIALOG
            ========================================================= */}
            {photoToDelete && (
                <div className="mbs-modal-backdrop" onClick={() => setPhotoToDelete(null)}>
                    <div className="mbs-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="mbs-confirm-icon">
                            <Trash2 size={32} color="#EF4444" />
                        </div>
                        <h3>Remove Photo from Campus Gallery?</h3>
                        <p>
                            Are you sure you want to delete <strong>"{photoToDelete.title}"</strong>? This will remove the photo from the public institutional gallery.
                        </p>
                        <div className="mbs-confirm-actions">
                            <button
                                type="button"
                                className="mbs-btn-cancel"
                                onClick={() => setPhotoToDelete(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="mbs-btn-danger"
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Removing..." : "Yes, Delete Photo"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================
                PROMOTIONAL CALL TO ACTION (FOR PROSPECTIVE STUDENTS)
            ========================================================= */}
            <section className="mbs-gallery-cta-section">
                <div className="mbs-gallery-container">
                    <div className="mbs-cta-card">
                        <div className="mbs-cta-content">
                            <div className="mbs-cta-badge">
                                <GraduationCap size={14} color="var(--theme-secondary, #F59E0B)" />
                                <span>Academic Year 2026–2027 Admissions</span>
                            </div>
                            <h2>Be Part of the Next Chapter at Mobile Bible School</h2>
                            <p>
                                Experience hands-on expository preaching, pastoral mentorship, and accredited theological scholarship. Whether on campus or through our modular and online branches, your calling starts here.
                            </p>
                            <div className="mbs-cta-btn-row">
                                <button
                                    type="button"
                                    className="mbs-btn-cta-primary"
                                    onClick={() => handleNavigate("contact")}
                                >
                                    <span>Apply for Admission Desk</span>
                                    <ArrowRight size={15} />
                                </button>
                                <button
                                    type="button"
                                    className="mbs-btn-cta-secondary"
                                    onClick={() => handleNavigate("events")}
                                >
                                    <span>Explore Upcoming Campus Events</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                UNIFIED INSTITUTIONAL FOOTER
            ========================================================= */}
            <PublicFooter
                onNavigate={handleNavigate}
                onOpenAdmission={() => handleNavigate("contact")}
            />
        </div>
    );
};

export default GalleryPage;
