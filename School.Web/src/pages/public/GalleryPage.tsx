// ============================================================
// GalleryPage.tsx -> MOBILE BIBLE SCHOOL & THEOLOGICAL SEMINARY
// Official Institutional Campus Photo Gallery & Media Chronicles
// Role-based logic: Admins can upload & manage; others view-only
// ============================================================

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import PublicHeader from "../../components/PublicHeader";
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
    BookOpen,
    Eye,
    RotateCcw,
    Lock,
    ExternalLink
} from "lucide-react";

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
    const [copiedShare, setCopiedShare] = useState<boolean>(false);

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
    // LIGHTBOX HANDLERS
    // ------------------------------------------------------------
    const openLightbox = (index: number) => {
        setSelectedPhotoIndex(index);
        document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
        setSelectedPhotoIndex(null);
        document.body.style.overflow = "auto";
    };

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
    // SHARE HANDLER
    // ------------------------------------------------------------
    const handleShare = (e: React.MouseEvent, photo: GalleryPhoto) => {
        e.stopPropagation();
        const shareUrl = window.location.href;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(`${photo.title} — ${photo.location} | Mobile Bible School: ${shareUrl}`);
            setCopiedShare(true);
            setTimeout(() => setCopiedShare(false), 2500);
        }
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
                                                onError={(e) => {
                                                    // Fallback image if broken link
                                                    (e.target as HTMLImageElement).src =
                                                        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80";
                                                }}
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
                                                    onClick={(e) => handleShare(e, photo)}
                                                    title="Copy link to photo"
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
                                <div className="mbs-lightbox-actions">
                                    <button
                                        type="button"
                                        className={`mbs-btn-like ${likedPhotos.has(activePhoto.id) ? "active" : ""}`}
                                        onClick={(e) => handleLike(e, activePhoto.id)}
                                    >
                                        <Heart size={16} className={likedPhotos.has(activePhoto.id) ? "fill-current" : ""} />
                                        <span>{activePhoto.likesCount || 0} Appreciations</span>
                                    </button>

                                    <a
                                        href={activePhoto.imageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mbs-btn-download"
                                        download
                                    >
                                        <Download size={15} />
                                        <span>Download High-Res</span>
                                    </a>

                                    <button
                                        type="button"
                                        className="mbs-btn-share"
                                        onClick={(e) => handleShare(e, activePhoto)}
                                    >
                                        {copiedShare ? (
                                            <>
                                                <Check size={15} color="#10B981" />
                                                <span>Link Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Share2 size={15} />
                                                <span>Share</span>
                                            </>
                                        )}
                                    </button>

                                    {isAdmin && (
                                        <button
                                            type="button"
                                            className="mbs-btn-admin-trash"
                                            onClick={() => setPhotoToDelete(activePhoto)}
                                        >
                                            <Trash2 size={15} />
                                            <span>Delete (Admin)</span>
                                        </button>
                                    )}
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
                FOOTER
            ========================================================= */}
            <footer className="mbs-gallery-footer">
                <div className="mbs-gallery-container">
                    <div className="mbs-footer-top">
                        <div className="mbs-footer-brand">
                            <div className="mbs-footer-crest">
                                <BookOpen size={20} color="#FFFFFF" />
                            </div>
                            <div>
                                <h4>Mobile Bible School &amp; Theological Seminary</h4>
                                <small>Visual Media Archives &amp; Institutional Documentation</small>
                            </div>
                        </div>

                        <div className="mbs-footer-links">
                            <button type="button" onClick={() => handleNavigate("home")}>Home</button>
                            <button type="button" onClick={() => handleNavigate("about")}>About</button>
                            <button type="button" onClick={() => handleNavigate("events")}>Events</button>
                            <button type="button" onClick={() => handleNavigate("announcements")}>Announcements</button>
                            <button type="button" onClick={() => handleNavigate("learning")}>Theological LMS</button>
                            <button type="button" onClick={() => handleNavigate("contact")}>Contact</button>
                        </div>
                    </div>

                    <div className="mbs-footer-bottom">
                        <span>© {new Date().getFullYear()} Mobile Bible School &amp; Theological Seminary. All rights reserved.</span>
                        <span>Equipping Pastors • Advancing Scholarship • Proclaiming Christ</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default GalleryPage;
