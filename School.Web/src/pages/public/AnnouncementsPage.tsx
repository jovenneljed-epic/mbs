// ============================================================
// AnnouncementsPage.tsx -> MOBILE BIBLE SCHOOL & THEOLOGICAL SEMINARY
// Official Real-Time Institutional Announcements & Academic Bulletins
// Connected directly to SMS Database (/api/announcements)
// Unified Luxury Global Theme (Maroon, Obsidian & Gold)
// ============================================================

import React, { useState, useEffect, useMemo, useCallback } from "react";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import "./AnnouncementsPage.css";
import "./PublicUnisonTheme.css";
import {
    getPublicSchoolAnnouncements,
    type SchoolAnnouncementItem
} from "../../services/schoolPublicDataService";
import {
    Bell,
    Search,
    RefreshCw,
    X,
    ArrowRight,
    Tag,
    Calendar,
    Share2,
    Sparkles,
    ShieldCheck,
    GraduationCap,
    BookOpen,
    Check,
    Mail
} from "lucide-react";

interface AnnouncementsPageProps {
    onNavigate?: (page: string) => void;
}

const BASE_CATEGORIES = [
    "ALL",
    "ADMISSIONS",
    "ACADEMIC",
    "SCHOLARSHIPS",
    "FACULTY",
    "CAMPUS NOTICE"
];

const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ onNavigate }) => {
    // ------------------------------------------------------------
    // STATE
    // ------------------------------------------------------------
    const [announcements, setAnnouncements] = useState<SchoolAnnouncementItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [activeCategory, setActiveCategory] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<SchoolAnnouncementItem | null>(null);
    const [copiedShare, setCopiedShare] = useState<boolean>(false);
    const [lastSyncTime, setLastSyncTime] = useState<string>("");

    // ------------------------------------------------------------
    // NAVIGATION HANDLER
    // ------------------------------------------------------------
    const handleNavigate = useCallback((page: string) => {
        if (onNavigate) {
            onNavigate(page);
        } else {
            const clean = page.startsWith("/") ? page : `/${page}`;
            window.location.href = clean;
        }
    }, [onNavigate]);

    // ------------------------------------------------------------
    // DATA FETCHING (DIRECT SMS DATABASE CONNECTION)
    // ------------------------------------------------------------
    const fetchAnnouncementsData = useCallback(async (isManualRefresh = false) => {
        if (isManualRefresh) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }

        try {
            const data = await getPublicSchoolAnnouncements();
            setAnnouncements(data || []);
            const now = new Date();
            setLastSyncTime(
                now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
            );
        } catch (err) {
            console.error("Failed to fetch real-time announcements from database:", err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    // ------------------------------------------------------------
    // INITIALIZATION & EVENT LISTENERS
    // ------------------------------------------------------------
    useEffect(() => {
        try {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        } catch {
            window.scrollTo(0, 0);
        }

        document.title = "Campus Bulletins & Academic Announcements | Mobile Bible School";

        fetchAnnouncementsData();

        // Listen for live SMS announcement updates
        const handleAnnouncementsUpdated = (e: any) => {
            if (e?.detail && Array.isArray(e.detail) && e.detail.length > 0) {
                setAnnouncements(e.detail);
                const now = new Date();
                setLastSyncTime(
                    now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                );
            } else {
                fetchAnnouncementsData(true);
            }
        };

        window.addEventListener("mbs:school-announcements-updated", handleAnnouncementsUpdated);
        return () => {
            window.removeEventListener("mbs:school-announcements-updated", handleAnnouncementsUpdated);
        };
    }, [fetchAnnouncementsData]);

    // Keyboard shortcut to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && selectedAnnouncement) {
                setSelectedAnnouncement(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedAnnouncement]);

    // ------------------------------------------------------------
    // COMPUTED CATEGORIES & FILTERING
    // ------------------------------------------------------------
    const allCategories = useMemo(() => {
        const set = new Set<string>(BASE_CATEGORIES);
        announcements.forEach(a => {
            if (a.category && a.category.trim()) {
                const norm = a.category.trim().toUpperCase();
                // Map subcategory tags if needed
                if (!set.has(norm)) {
                    set.add(norm);
                }
            }
        });
        return Array.from(set);
    }, [announcements]);

    const filteredAnnouncements = useMemo(() => {
        return announcements.filter(item => {
            // Category filter
            if (activeCategory !== "ALL") {
                const itemCat = (item.category || "").toUpperCase();
                const activeCat = activeCategory.toUpperCase();
                const matchCategory =
                    itemCat === activeCat ||
                    itemCat.includes(activeCat) ||
                    activeCat.includes(itemCat);
                if (!matchCategory) return false;
            }

            // Keyword search filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const titleMatch = (item.title || "").toLowerCase().includes(q);
                const contentMatch = (item.content || "").toLowerCase().includes(q);
                const categoryMatch = (item.category || "").toLowerCase().includes(q);
                if (!titleMatch && !contentMatch && !categoryMatch) return false;
            }

            return true;
        });
    }, [announcements, activeCategory, searchQuery]);

    // ------------------------------------------------------------
    // SHARE / COPY ACTION
    // ------------------------------------------------------------
    const handleShareAnnouncement = async (item: SchoolAnnouncementItem) => {
        const shareText = `[MBS Seminary Notice] ${item.title}\nCategory: ${item.category}\nDate: ${item.formattedDate || item.publishDate}\n\n${item.content}\n\nVisit: https://mbs-portal.onrender.com/announcements`;

        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareText);
                setCopiedShare(true);
                setTimeout(() => setCopiedShare(false), 2600);
            }
        } catch (err) {
            console.warn("Unable to copy to clipboard:", err);
        }
    };

    return (
        <div className="mbs-announcements-page-root">
            {/* PUBLIC NAVIGATION HEADER (Theme switcher hidden per global institutional theme standard) */}
            <PublicHeader onNavigate={onNavigate} hideThemeSwitcher={true} />

            {/* =====================================================
                HERO SECTION (LUXURY GLOBAL MAROON & GOLD)
            ===================================================== */}
            <section className="mbs-ann-hero">
                <div className="mbs-ann-hero-glow" />
                <div className="mbs-ann-container">
                    <div className="mbs-ann-hero-content">
                        <div className="mbs-ann-hero-badge">
                            <Sparkles size={14} />
                            <span>OFFICIAL CAMPUS BULLETINS &amp; DISPATCHES</span>
                        </div>

                        <h1 className="mbs-ann-hero-title">
                            Campus Bulletins &amp; <span>Academic Notices</span>
                        </h1>

                        <p className="mbs-ann-hero-subtitle">
                            Real-time official notices from the Seminary Directorate, Office of the Registrar,
                            and Academic Deans of Mobile Bible School &amp; Theological Seminary.
                        </p>

                        {/* Real-Time Database Status Bar */}
                        <div className="mbs-ann-status-bar">
                            <div className="mbs-ann-live-indicator">
                                <span className="mbs-ann-live-dot" />
                                <span className="mbs-ann-live-text">LIVE SMS DATABASE CONNECTED</span>
                            </div>

                            {lastSyncTime && (
                                <span className="mbs-ann-sync-time">
                                    Last Synced: <strong>{lastSyncTime}</strong>
                                </span>
                            )}

                            <button
                                type="button"
                                className={`mbs-ann-refresh-btn ${isRefreshing ? "spinning" : ""}`}
                                onClick={() => fetchAnnouncementsData(true)}
                                disabled={isRefreshing || isLoading}
                                title="Synchronize announcements with database"
                            >
                                <RefreshCw size={13} className={isRefreshing ? "spin-icon" : ""} />
                                <span>{isRefreshing ? "Syncing..." : "Sync Database"}</span>
                            </button>
                        </div>

                        {/* Institutional Highlights Row */}
                        <div className="mbs-ann-hero-stats">
                            <div className="mbs-ann-stat-card">
                                <ShieldCheck size={20} className="mbs-ann-stat-icon" />
                                <div>
                                    <strong>100% Verified</strong>
                                    <span>Authorized Circulars</span>
                                </div>
                            </div>

                            <div className="mbs-ann-stat-card">
                                <GraduationCap size={20} className="mbs-ann-stat-icon" />
                                <div>
                                    <strong>Registrar Desk</strong>
                                    <span>Admissions &amp; Modular Cohorts</span>
                                </div>
                            </div>

                            <div className="mbs-ann-stat-card">
                                <BookOpen size={20} className="mbs-ann-stat-icon" />
                                <div>
                                    <strong>Theological LMS</strong>
                                    <span>Courseware &amp; Library Updates</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =====================================================
                CONTROLS & SEARCH BAR
            ===================================================== */}
            <section className="mbs-ann-controls-section">
                <div className="mbs-ann-container">
                    <div className="mbs-ann-controls-wrapper">
                        {/* Search Input */}
                        <div className="mbs-ann-search-box">
                            <Search size={18} className="mbs-ann-search-icon" />
                            <input
                                type="text"
                                placeholder="Search bulletins by title, keyword, or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="mbs-ann-search-input"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="mbs-ann-clear-search"
                                    onClick={() => setSearchQuery("")}
                                    title="Clear search"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        {/* Category Filter Pills */}
                        <div className="mbs-ann-category-pills">
                            {allCategories.map(cat => {
                                const count = cat === "ALL"
                                    ? announcements.length
                                    : announcements.filter(a => (a.category || "").toUpperCase().includes(cat.toUpperCase())).length;

                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        className={`mbs-ann-cat-pill ${activeCategory === cat ? "active" : ""}`}
                                        onClick={() => setActiveCategory(cat)}
                                    >
                                        <span>{cat}</span>
                                        <span className="mbs-ann-cat-count">{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Results Counter Bar */}
                    <div className="mbs-ann-counter-bar">
                        <span className="mbs-ann-counter-text">
                            Showing <strong>{filteredAnnouncements.length}</strong> of <strong>{announcements.length}</strong> official campus announcements
                            {activeCategory !== "ALL" && (
                                <span> in category <em>{activeCategory}</em></span>
                            )}
                            {searchQuery && (
                                <span> matching "<em>{searchQuery}</em>"</span>
                            )}
                        </span>

                        {(activeCategory !== "ALL" || searchQuery) && (
                            <button
                                type="button"
                                className="mbs-ann-reset-link"
                                onClick={() => {
                                    setActiveCategory("ALL");
                                    setSearchQuery("");
                                }}
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* =====================================================
                ANNOUNCEMENTS LISTING GRID
            ===================================================== */}
            <main className="mbs-ann-main-section">
                <div className="mbs-ann-container">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="mbs-ann-loading-state">
                            <RefreshCw size={36} className="spin-icon" />
                            <h3>Connecting to School Database...</h3>
                            <p>Fetching real-time academic dispatches and registrar notices.</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && filteredAnnouncements.length === 0 && (
                        <div className="mbs-ann-empty-state">
                            <Bell size={48} className="mbs-ann-empty-icon" />
                            <h3>No bulletins match your selection</h3>
                            <p>
                                {searchQuery || activeCategory !== "ALL"
                                    ? "Try adjusting your search query or select another category above."
                                    : "There are currently no active announcements published in the school database. Check back soon!"}
                            </p>
                            {(activeCategory !== "ALL" || searchQuery) && (
                                <button
                                    type="button"
                                    className="mbs-ann-btn-primary"
                                    onClick={() => {
                                        setActiveCategory("ALL");
                                        setSearchQuery("");
                                    }}
                                >
                                    View All Bulletins
                                </button>
                            )}
                        </div>
                    )}

                    {/* Grid Cards */}
                    {!isLoading && filteredAnnouncements.length > 0 && (
                        <div className="mbs-ann-grid">
                            {filteredAnnouncements.map((item, index) => {
                                const isAdmissions = (item.category || "").toUpperCase().includes("ADMISSIONS");
                                const isScholarship = (item.category || "").toUpperCase().includes("SCHOLARSHIP") || (item.category || "").toUpperCase().includes("GRANT");
                                const isLms = (item.category || "").toUpperCase().includes("LMS") || (item.category || "").toUpperCase().includes("ACADEMIC");

                                return (
                                    <article
                                        key={item.id || index}
                                        className="mbs-ann-card"
                                        onClick={() => setSelectedAnnouncement(item)}
                                    >
                                        <div className="mbs-ann-card-header">
                                            <span
                                                className={`mbs-ann-badge ${
                                                    isAdmissions
                                                        ? "badge-admissions"
                                                        : isScholarship
                                                        ? "badge-scholarship"
                                                        : isLms
                                                        ? "badge-academic"
                                                        : "badge-default"
                                                }`}
                                            >
                                                <Tag size={11} />
                                                <span>{item.category || "CAMPUS NOTICE"}</span>
                                            </span>

                                            <div className="mbs-ann-date-wrapper">
                                                <Calendar size={12} />
                                                <span>{item.formattedDate || item.publishDate || "Current Term"}</span>
                                            </div>
                                        </div>

                                        <h2 className="mbs-ann-card-title">
                                            {item.title}
                                        </h2>

                                        <p className="mbs-ann-card-snippet">
                                            {item.content}
                                        </p>

                                        <div className="mbs-ann-card-footer">
                                            <button
                                                type="button"
                                                className="mbs-ann-card-read-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedAnnouncement(item);
                                                }}
                                            >
                                                <span>Read Full Bulletin</span>
                                                <ArrowRight size={14} />
                                            </button>

                                            <button
                                                type="button"
                                                className="mbs-ann-card-share-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleShareAnnouncement(item);
                                                }}
                                                title="Copy bulletin details to clipboard"
                                            >
                                                <Share2 size={13} />
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* =====================================================
                ANNOUNCEMENT READER MODAL
            ===================================================== */}
            {selectedAnnouncement && (
                <div
                    className="mbs-ann-modal-overlay"
                    onClick={() => setSelectedAnnouncement(null)}
                >
                    <div
                        className="mbs-ann-modal-dialog"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Close button */}
                        <button
                            type="button"
                            className="mbs-ann-modal-close"
                            onClick={() => setSelectedAnnouncement(null)}
                            aria-label="Close modal"
                        >
                            <X size={18} />
                        </button>

                        {/* Modal Header */}
                        <div className="mbs-ann-modal-header">
                            <div className="mbs-ann-modal-tags">
                                <span className="mbs-ann-badge badge-admissions">
                                    <Tag size={12} />
                                    <span>{selectedAnnouncement.category || "CAMPUS NOTICE"}</span>
                                </span>

                                <div className="mbs-ann-modal-date">
                                    <Calendar size={13} />
                                    <span>{selectedAnnouncement.formattedDate || selectedAnnouncement.publishDate}</span>
                                </div>
                            </div>

                            <h2 className="mbs-ann-modal-title">
                                {selectedAnnouncement.title}
                            </h2>
                        </div>

                        {/* Optional Image */}
                        {selectedAnnouncement.imageUrl && (
                            <div className="mbs-ann-modal-image-wrapper">
                                <img
                                    src={selectedAnnouncement.imageUrl}
                                    alt={selectedAnnouncement.title}
                                    className="mbs-ann-modal-image"
                                />
                            </div>
                        )}

                        {/* Modal Body */}
                        <div className="mbs-ann-modal-body">
                            <p className="mbs-ann-modal-text">
                                {selectedAnnouncement.content}
                            </p>
                        </div>

                        {/* Verification Notice */}
                        <div className="mbs-ann-modal-notice-banner">
                            <ShieldCheck size={18} className="mbs-ann-banner-icon" />
                            <div>
                                <strong>Official Seminary Publication</strong>
                                <p>
                                    This dispatch is officially verified by the Office of the Registrar and Academic Deans
                                    at Mobile Bible School &amp; Theological Seminary.
                                </p>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="mbs-ann-modal-footer">
                            <button
                                type="button"
                                className="mbs-ann-btn-secondary"
                                onClick={() => handleShareAnnouncement(selectedAnnouncement)}
                            >
                                {copiedShare ? (
                                    <>
                                        <Check size={14} color="#10b981" />
                                        <span style={{ color: "#10b981" }}>Notice Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Share2 size={14} />
                                        <span>Copy Notice</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                className="mbs-ann-btn-primary"
                                onClick={() => {
                                    setSelectedAnnouncement(null);
                                    handleNavigate("contact");
                                }}
                            >
                                <Mail size={14} />
                                <span>Inquire Regarding This Notice</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================
                OFFICIAL REGISTRAR & ADMISSIONS CTA
            ===================================================== */}
            <section className="mbs-ann-cta-section">
                <div className="mbs-ann-container">
                    <div className="mbs-ann-cta-card">
                        <div className="mbs-ann-cta-content">
                            <span className="mbs-ann-cta-eyebrow">
                                OFFICE OF THE REGISTRAR &amp; ACADEMIC AFFAIRS
                            </span>

                            <h2 className="mbs-ann-cta-heading">
                                Have Inquiries Regarding Academic Bulletins or Admissions?
                            </h2>

                            <p className="mbs-ann-cta-text">
                                Our Admissions Directorate and Faculty Deans are on hand to guide pastors,
                                elders, missionaries, and Christian workers through degree programs, modular schedules,
                                credit transfers, and pastoral tuition subsidies.
                            </p>

                            <div className="mbs-ann-cta-buttons">
                                <button
                                    type="button"
                                    className="mbs-ann-btn-primary"
                                    onClick={() => handleNavigate("contact")}
                                >
                                    <span>Contact Admissions Desk</span>
                                    <ArrowRight size={15} />
                                </button>

                                <button
                                    type="button"
                                    className="mbs-ann-btn-secondary"
                                    onClick={() => handleNavigate("about")}
                                >
                                    <span>Explore Academic Programs</span>
                                </button>

                                <button
                                    type="button"
                                    className="mbs-ann-btn-ghost"
                                    onClick={() => handleNavigate("gallery")}
                                >
                                    <span>View Campus Photo Gallery</span>
                                </button>
                            </div>
                        </div>

                        <div className="mbs-ann-cta-emblem">
                            <div className="mbs-ann-emblem-seal">
                                <GraduationCap size={44} />
                                <strong>MBS</strong>
                                <span>SEMINARY</span>
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

export default AnnouncementsPage;
