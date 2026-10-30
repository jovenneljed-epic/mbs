// ============================================================
// AboutPage.tsx -> Mobile Bible School & Theological Seminary
// Official Institutional Dossier, Statement of Faith, Faculty & Campuses
// Editable by Administrator • Viewing-Only for Others
// Connected to Global Adaptive Theme System & Live CMS Backend
// ============================================================

import React, { useState, useEffect } from "react";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import "./AboutPage.css";
import {
    getAboutContent,
    saveAboutContent,
    resetAboutContent,
    isUserAdmin,
    ABOUT_CONTENT_UPDATED_EVENT,
    DEFAULT_ABOUT_CONTENT
} from "../../services/aboutContentService";
import type { AboutContentData } from "../../services/aboutContentService";
import AboutEditorModal from "./AboutEditorModal";
import {
    BookOpen,
    Award,
    ShieldCheck,
    MapPin,
    GraduationCap,
    CheckCircle2,
    ArrowRight,
    Clock,
    Globe,
    Building2,
    Users,
    ChevronDown,
    ChevronUp,
    Landmark,
    ScrollText,
    Edit2,
    Eye,
    Check
} from "lucide-react";

export type AboutTab = "overview" | "faith" | "faculty" | "accreditations" | "campuses";

interface AboutPageProps {
    onNavigate?: (page: string) => void;
    initialTab?: AboutTab;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, initialTab = "overview" }) => {
    // ------------------------------------------------------------
    // STATE
    // ------------------------------------------------------------
    const [content, setContent] = useState<AboutContentData>(DEFAULT_ABOUT_CONTENT);
    const [activeTab, setActiveTab] = useState<AboutTab>(initialTab);
    const [facultyFilter, setFacultyFilter] = useState<"all" | "leadership" | "languages" | "theology" | "ministry">("all");
    const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

    // Admin & Permission state
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [previewAsVisitor, setPreviewAsVisitor] = useState<boolean>(false);
    const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
    const [editorTab, setEditorTab] = useState<"hero" | "faith" | "faculty" | "campuses" | "accreditations">("hero");
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // ------------------------------------------------------------
    // INITIALIZATION & LIFECYCLE
    // ------------------------------------------------------------
    useEffect(() => {
        // Check Admin privilege
        const adminStatus = isUserAdmin();
        setIsAdmin(adminStatus);

        // Fetch live about content
        loadData();

        // Real-time listener for updates across tabs
        const handleContentUpdated = (e: CustomEvent) => {
            if (e.detail) {
                setContent(e.detail);
            }
        };

        window.addEventListener(ABOUT_CONTENT_UPDATED_EVENT as any, handleContentUpdated);
        return () => {
            window.removeEventListener(ABOUT_CONTENT_UPDATED_EVENT as any, handleContentUpdated);
        };
    }, []);

    const loadData = async () => {
        try {
            const data = await getAboutContent();
            if (data) {
                setContent(data);
            }
        } catch (err) {
            console.warn("Could not load about content:", err);
        }
    };

    // Sync activeTab when initialTab prop updates
    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [initialTab]);

    // Set page title
    useEffect(() => {
        const titles: Record<AboutTab, string> = {
            overview: "About MBS & Institutional Dossier | Mobile Bible School",
            faith: "Statement of Faith & Doctrinal Articles | Mobile Bible School",
            faculty: "Seminary Faculty & Deans | Mobile Bible School",
            accreditations: "ACTS & CCHE Accreditations & Credentials | Mobile Bible School",
            campuses: "Campus Locations & Regional Facilities | Mobile Bible School"
        };
        document.title = titles[activeTab] || "Mobile Bible School & Theological Seminary";
    }, [activeTab]);

    const navigateTo = (route: string) => {
        if (onNavigate) {
            onNavigate(route);
        } else {
            window.location.href = `/${route}`;
        }
    };

    const handleTabChange = (tab: AboutTab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 380, behavior: "smooth" });
    };

    // ------------------------------------------------------------
    // ADMIN EDITOR HANDLERS
    // ------------------------------------------------------------
    const handleOpenEditor = (tab: "hero" | "faith" | "faculty" | "campuses" | "accreditations") => {
        setEditorTab(tab);
        setIsEditorOpen(true);
    };

    const handleSaveContent = async (updated: AboutContentData): Promise<boolean> => {
        const success = await saveAboutContent(updated);
        if (success) {
            setContent(updated);
            showToast("Content updated and published successfully!");
        }
        return success;
    };

    const handleResetContent = async () => {
        const def = await resetAboutContent();
        setContent(def);
        showToast("Restored factory seminary dossier defaults.");
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Active admin editing mode (true only if user is admin AND not in preview mode)
    const canEdit = isAdmin && !previewAsVisitor;

    // Filter faculty members
    const filteredFaculty = facultyFilter === "all"
        ? content.faculty.members
        : content.faculty.members.filter(f => f.department === facultyFilter);

    return (
        <div className="mbs-about-root">
            <PublicHeader onNavigate={onNavigate} hideAbout={true} hideThemeSwitcher={true} />

            {/* ============================================================ */}
            {/* ADMIN ROLE STATUS BAR (Visible to Administrator Only)        */}
            {/* ============================================================ */}
            {isAdmin && !previewAsVisitor && (
                <div className="mbs-about-role-bar">
                    <div className="mbs-about-role-bar-inner">
                        <div className="mbs-about-role-badge">
                            <ShieldCheck size={18} color="#10b981" />
                            <div>
                                <strong>Administrator Mode Active</strong>
                                <small>You have authorized administrative access to edit this institutional dossier.</small>
                            </div>
                        </div>

                        <div className="mbs-about-role-actions">
                            <button
                                type="button"
                                className="mbs-btn-admin-edit"
                                onClick={() => handleOpenEditor("hero")}
                            >
                                <Edit2 size={14} />
                                <span>Edit Page Content</span>
                            </button>

                            <button
                                type="button"
                                className="mbs-btn-admin-outline"
                                onClick={() => handleOpenEditor("faith")}
                            >
                                <ScrollText size={13} />
                                <span>Edit Faith</span>
                            </button>

                            <button
                                type="button"
                                className="mbs-btn-admin-outline"
                                onClick={() => handleOpenEditor("faculty")}
                            >
                                <Award size={13} />
                                <span>Manage Faculty</span>
                            </button>

                            <button
                                type="button"
                                className="mbs-btn-admin-outline"
                                onClick={() => handleOpenEditor("campuses")}
                            >
                                <MapPin size={13} />
                                <span>Manage Campuses</span>
                            </button>

                            <button
                                type="button"
                                className="mbs-btn-admin-preview-toggle"
                                onClick={() => setPreviewAsVisitor(true)}
                                title="Preview how visitors and others view this page"
                            >
                                <Eye size={13} />
                                <span>Preview as Visitor</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* VISITOR PREVIEW BANNER (When Admin tests view-only mode) */}
            {isAdmin && previewAsVisitor && (
                <div className="mbs-visitor-preview-banner">
                    <Eye size={15} />
                    <span>Viewing-Only Preview Mode Active — This is how students and public visitors view the page.</span>
                    <button
                        type="button"
                        className="mbs-btn-exit-preview"
                        onClick={() => setPreviewAsVisitor(false)}
                    >
                        Return to Admin Edit Mode
                    </button>
                </div>
            )}

            {/* ============================================================ */}
            {/* HERO BANNER SECTION                                          */}
            {/* ============================================================ */}
            <section className="mbs-about-hero">
                <div className="mbs-about-hero-bg" />
                <div className="mbs-about-hero-pattern" />

                <div className="mbs-about-hero-container">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="mbs-hero-badge-pill">
                            <GraduationCap size={15} className="mbs-badge-icon" />
                            <span>{content.hero.badge}</span>
                        </div>

                        {canEdit && (
                            <button
                                type="button"
                                className="mbs-section-edit-trigger"
                                onClick={() => handleOpenEditor("hero")}
                                style={{ marginBottom: 20 }}
                                title="Edit Hero Title & Subtitle"
                            >
                                <Edit2 size={12} />
                                <span>Edit Hero</span>
                            </button>
                        )}
                    </div>

                    <h1 className="mbs-about-hero-title">
                        {content.hero.title}
                        <span className="mbs-gold-text">{content.hero.titleHighlight}</span>
                    </h1>

                    <p className="mbs-about-hero-subtitle">
                        {content.hero.subtitle}
                    </p>

                    <div className="mbs-hero-trust-chips">
                        {content.hero.trustChips.map((chip, idx) => (
                            <span key={idx} className="mbs-trust-chip">
                                <CheckCircle2 size={13} color="var(--theme-secondary, #F59E0B)" />
                                <span>{chip}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* LUXURY ACADEMIC DOSSIER NAVIGATION TABS                     */}
            {/* ============================================================ */}
            <div className="mbs-about-nav-strip">
                <div className="mbs-about-nav-container">
                    <button
                        type="button"
                        className={`mbs-dossier-tab ${activeTab === "overview" ? "active" : ""}`}
                        onClick={() => handleTabChange("overview")}
                    >
                        <Landmark size={16} />
                        <span>Institutional Overview</span>
                    </button>

                    <button
                        type="button"
                        className={`mbs-dossier-tab ${activeTab === "faith" ? "active" : ""}`}
                        onClick={() => handleTabChange("faith")}
                    >
                        <ScrollText size={16} />
                        <span>Statement of Faith</span>
                    </button>

                    <button
                        type="button"
                        className={`mbs-dossier-tab ${activeTab === "faculty" ? "active" : ""}`}
                        onClick={() => handleTabChange("faculty")}
                    >
                        <Award size={16} />
                        <span>Faculty &amp; Deans</span>
                    </button>

                    <button
                        type="button"
                        className={`mbs-dossier-tab ${activeTab === "accreditations" ? "active" : ""}`}
                        onClick={() => handleTabChange("accreditations")}
                    >
                        <ShieldCheck size={16} />
                        <span>Accreditations</span>
                    </button>

                    <button
                        type="button"
                        className={`mbs-dossier-tab ${activeTab === "campuses" ? "active" : ""}`}
                        onClick={() => handleTabChange("campuses")}
                    >
                        <MapPin size={16} />
                        <span>Campuses &amp; Centers</span>
                    </button>
                </div>
            </div>

            {/* ============================================================ */}
            {/* TAB CONTENT 1: INSTITUTIONAL OVERVIEW                        */}
            {/* ============================================================ */}
            {activeTab === "overview" && (
                <div className="mbs-tab-pane animate-fade-in">
                    <div className="mbs-content-container">
                        {/* President's Message Card */}
                        <div className="mbs-chancellor-card">
                            <div className="mbs-header-with-edit">
                                <div className="mbs-chancellor-meta">
                                    <div className="mbs-crest-box">
                                        <BookOpen size={28} color="var(--theme-secondary, #F59E0B)" />
                                    </div>
                                    <div>
                                        <span className="mbs-label-eyebrow">{content.overview.chancellor.eyebrow}</span>
                                        <h3 className="mbs-chancellor-name">{content.overview.chancellor.name}</h3>
                                        <small className="mbs-chancellor-sub">{content.overview.chancellor.title}</small>
                                    </div>
                                </div>

                                {canEdit && (
                                    <button
                                        type="button"
                                        className="mbs-section-edit-trigger"
                                        onClick={() => handleOpenEditor("hero")}
                                    >
                                        <Edit2 size={12} />
                                        <span>Edit Message</span>
                                    </button>
                                )}
                            </div>

                            <blockquote className="mbs-chancellor-quote">
                                &ldquo;{content.overview.chancellor.quote}&rdquo;
                            </blockquote>

                            <div className="mbs-scripture-signature">
                                <span>{content.overview.chancellor.scripture}</span>
                                <strong>{content.overview.chancellor.reference}</strong>
                            </div>
                        </div>

                        {/* Four Core Pillars */}
                        <div className="mbs-pillars-grid">
                            {content.overview.pillars.map((pil) => (
                                <div key={pil.id} className="mbs-pillar-card">
                                    <div className="mbs-pillar-icon-box">
                                        {pil.icon === "ScrollText" ? (
                                            <ScrollText size={22} color="var(--theme-secondary, #F59E0B)" />
                                        ) : pil.icon === "GraduationCap" ? (
                                            <GraduationCap size={22} color="var(--theme-secondary, #F59E0B)" />
                                        ) : pil.icon === "Users" ? (
                                            <Users size={22} color="var(--theme-secondary, #F59E0B)" />
                                        ) : (
                                            <BookOpen size={22} color="var(--theme-secondary, #F59E0B)" />
                                        )}
                                    </div>
                                    <h4>{pil.title}</h4>
                                    <p>{pil.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* Seminary History & Timeline */}
                        <div className="mbs-history-card">
                            <span className="mbs-label-eyebrow">{content.overview.history.eyebrow}</span>
                            <h3>{content.overview.history.title}</h3>
                            <p className="mbs-history-desc">
                                {content.overview.history.desc}
                            </p>

                            <div className="mbs-timeline-row">
                                {content.overview.history.timeline.map((point, i) => (
                                    <div key={i} className="mbs-timeline-point">
                                        <strong className="mbs-timeline-year">{point.year}</strong>
                                        <span>{point.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB CONTENT 2: STATEMENT OF FAITH & DOCTRINE                 */}
            {/* ============================================================ */}
            {activeTab === "faith" && (
                <div className="mbs-tab-pane animate-fade-in">
                    <div className="mbs-content-container">
                        <div className="mbs-section-intro-card">
                            <div className="mbs-header-with-edit">
                                <div className="mbs-intro-header">
                                    <div className="mbs-crest-box">
                                        <ScrollText size={26} color="var(--theme-secondary, #F59E0B)" />
                                    </div>
                                    <div>
                                        <span className="mbs-label-eyebrow">{content.faith.intro.eyebrow}</span>
                                        <h2>{content.faith.intro.title}</h2>
                                        <p>{content.faith.intro.desc}</p>
                                    </div>
                                </div>

                                {canEdit && (
                                    <button
                                        type="button"
                                        className="mbs-section-edit-trigger"
                                        onClick={() => handleOpenEditor("faith")}
                                    >
                                        <Edit2 size={12} />
                                        <span>Edit Articles</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Articles Accordion / Cards List */}
                        <div className="mbs-articles-stack">
                            {content.faith.articles.map((article, idx) => {
                                const isExpanded = expandedArticle === idx;
                                return (
                                    <div key={article.num + idx} className={`mbs-article-card ${isExpanded ? "expanded" : ""}`}>
                                        <div
                                            className="mbs-article-header"
                                            onClick={() => setExpandedArticle(isExpanded ? null : idx)}
                                        >
                                            <div className="mbs-article-title-col">
                                                <span className="mbs-article-badge">{article.num}</span>
                                                <h3 className="mbs-article-title">{article.title}</h3>
                                                <p className="mbs-article-short">{article.shortSummary}</p>
                                            </div>

                                            <button type="button" className="mbs-article-toggle-btn" aria-label="Toggle article text">
                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                        </div>

                                        {isExpanded && (
                                            <div className="mbs-article-body animate-fade-in">
                                                <div className="mbs-article-divider" />
                                                <p className="mbs-article-full">{article.fullText}</p>

                                                <div className="mbs-scripture-proofs">
                                                    <span className="mbs-proofs-label">Scripture Proofs:</span>
                                                    <div className="mbs-proof-tags">
                                                        {article.scriptures.map(s => (
                                                            <span key={s} className="mbs-proof-pill">
                                                                <BookOpen size={11} />
                                                                <span>{s}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB CONTENT 3: SEMINARY FACULTY & DEANS                      */}
            {/* ============================================================ */}
            {activeTab === "faculty" && (
                <div className="mbs-tab-pane animate-fade-in">
                    <div className="mbs-content-container">
                        <div className="mbs-section-intro-card">
                            <div className="mbs-header-with-edit">
                                <div className="mbs-intro-header">
                                    <div className="mbs-crest-box">
                                        <Award size={26} color="var(--theme-secondary, #F59E0B)" />
                                    </div>
                                    <div>
                                        <span className="mbs-label-eyebrow">{content.faculty.intro.eyebrow}</span>
                                        <h2>{content.faculty.intro.title}</h2>
                                        <p>{content.faculty.intro.desc}</p>
                                    </div>
                                </div>

                                {canEdit && (
                                    <button
                                        type="button"
                                        className="mbs-section-edit-trigger"
                                        onClick={() => handleOpenEditor("faculty")}
                                    >
                                        <Edit2 size={12} />
                                        <span>Manage Faculty</span>
                                    </button>
                                )}
                            </div>

                            {/* Department Filter Pills */}
                            <div className="mbs-filter-strip">
                                <button
                                    type="button"
                                    className={`mbs-filter-pill ${facultyFilter === "all" ? "active" : ""}`}
                                    onClick={() => setFacultyFilter("all")}
                                >
                                    All Faculty ({content.faculty.members.length})
                                </button>
                                <button
                                    type="button"
                                    className={`mbs-filter-pill ${facultyFilter === "leadership" ? "active" : ""}`}
                                    onClick={() => setFacultyFilter("leadership")}
                                >
                                    Executive &amp; Deans
                                </button>
                                <button
                                    type="button"
                                    className={`mbs-filter-pill ${facultyFilter === "languages" ? "active" : ""}`}
                                    onClick={() => setFacultyFilter("languages")}
                                >
                                    Biblical Languages
                                </button>
                                <button
                                    type="button"
                                    className={`mbs-filter-pill ${facultyFilter === "theology" ? "active" : ""}`}
                                    onClick={() => setFacultyFilter("theology")}
                                >
                                    Systematic Theology
                                </button>
                                <button
                                    type="button"
                                    className={`mbs-filter-pill ${facultyFilter === "ministry" ? "active" : ""}`}
                                    onClick={() => setFacultyFilter("ministry")}
                                >
                                    Pastoral Practice
                                </button>
                            </div>
                        </div>

                        {/* Faculty Grid */}
                        <div className="mbs-faculty-grid">
                            {filteredFaculty.map(fac => (
                                <div key={fac.id} className="mbs-faculty-card">
                                    <div className="mbs-faculty-header">
                                        <div className="mbs-faculty-avatar-box">
                                            {fac.photoUrl ? (
                                                <img
                                                    src={fac.photoUrl}
                                                    alt={fac.name}
                                                    className="mbs-faculty-photo"
                                                    onError={(e) => {
                                                        (e.currentTarget as HTMLElement).style.display = "none";
                                                        const fallback = (e.currentTarget.parentElement?.querySelector(".mbs-faculty-initials") as HTMLElement);
                                                        if (fallback) fallback.style.display = "flex";
                                                    }}
                                                />
                                            ) : null}
                                            <span
                                                className="mbs-faculty-initials"
                                                style={{ display: fac.photoUrl ? "none" : "flex" }}
                                            >
                                                {fac.name.split(" ").filter(p => !p.includes(".")).map(n => n[0]).slice(0, 2).join("")}
                                            </span>
                                        </div>
                                        <div className="mbs-faculty-identity">
                                            <span className="mbs-dept-badge">{fac.departmentLabel}</span>
                                            <h3 className="mbs-faculty-name">{fac.name}</h3>
                                            <p className="mbs-faculty-title">{fac.title}</p>
                                        </div>
                                    </div>

                                    <p className="mbs-faculty-bio">{fac.bio}</p>

                                    <div className="mbs-faculty-section">
                                        <span className="mbs-section-subhead">DEGREES &amp; ALMA MATER</span>
                                        <ul className="mbs-degrees-list">
                                            {fac.degrees.map((deg, i) => (
                                                <li key={i}>{deg}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mbs-faculty-section">
                                        <span className="mbs-section-subhead">COURSES TAUGHT</span>
                                        <div className="mbs-courses-tags">
                                            {fac.courses.map((c, i) => (
                                                <span key={i} className="mbs-course-tag">{c}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mbs-faculty-footer">
                                        <span className="mbs-tenure-tag">
                                            <Clock size={12} />
                                            <span>{fac.tenureYears}+ Years Ministry Tenure</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB CONTENT 4: ACCREDITATIONS & RECOGNITION                  */}
            {/* ============================================================ */}
            {activeTab === "accreditations" && (
                <div className="mbs-tab-pane animate-fade-in">
                    <div className="mbs-content-container">
                        <div className="mbs-section-intro-card">
                            <div className="mbs-header-with-edit">
                                <div className="mbs-intro-header">
                                    <div className="mbs-crest-box">
                                        <ShieldCheck size={26} color="var(--theme-secondary, #F59E0B)" />
                                    </div>
                                    <div>
                                        <span className="mbs-label-eyebrow">{content.accreditations.intro.eyebrow}</span>
                                        <h2>{content.accreditations.intro.title}</h2>
                                        <p>{content.accreditations.intro.desc}</p>
                                    </div>
                                </div>

                                {canEdit && (
                                    <button
                                        type="button"
                                        className="mbs-section-edit-trigger"
                                        onClick={() => handleOpenEditor("accreditations")}
                                    >
                                        <Edit2 size={12} />
                                        <span>Edit Accreditations</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Accreditation Cards */}
                        <div className="mbs-accredit-grid">
                            {content.accreditations.accreditations.map(acc => (
                                <div key={acc.id} className="mbs-accredit-card">
                                    <div className="mbs-accredit-badge">{acc.badge}</div>
                                    <h3>{acc.title}</h3>
                                    <p className="mbs-accredit-desc">
                                        {acc.description}
                                    </p>
                                    <div className="mbs-accredit-meta">
                                        {acc.meta.map((m, i) => (
                                            <span key={i} className="mbs-meta-item">
                                                <strong>{m.label}:</strong> {m.value}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Ordination & Transferability Card */}
                        <div className="mbs-transfer-card">
                            <div className="mbs-transfer-header">
                                <GraduationCap size={24} color="var(--theme-secondary, #F59E0B)" />
                                <div>
                                    <h4>{content.accreditations.transfer.title}</h4>
                                    <p>{content.accreditations.transfer.subtitle}</p>
                                </div>
                            </div>

                            <div className="mbs-transfer-points">
                                {content.accreditations.transfer.points.map((pt, i) => (
                                    <div key={i} className="mbs-transfer-col">
                                        <h5>{pt.title}</h5>
                                        <p>{pt.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB CONTENT 5: CAMPUSES & REGIONAL FACILITIES                */}
            {/* ============================================================ */}
            {activeTab === "campuses" && (
                <div className="mbs-tab-pane animate-fade-in">
                    <div className="mbs-content-container">
                        <div className="mbs-section-intro-card">
                            <div className="mbs-header-with-edit">
                                <div className="mbs-intro-header">
                                    <div className="mbs-crest-box">
                                        <MapPin size={26} color="var(--theme-secondary, #F59E0B)" />
                                    </div>
                                    <div>
                                        <span className="mbs-label-eyebrow">{content.campuses.intro.eyebrow}</span>
                                        <h2>{content.campuses.intro.title}</h2>
                                        <p>{content.campuses.intro.desc}</p>
                                    </div>
                                </div>

                                {canEdit && (
                                    <button
                                        type="button"
                                        className="mbs-section-edit-trigger"
                                        onClick={() => handleOpenEditor("campuses")}
                                    >
                                        <Edit2 size={12} />
                                        <span>Edit Campuses</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Main Campus Feature Card */}
                        <div className="mbs-main-campus-card">
                            <div className="mbs-campus-head">
                                <div className="mbs-campus-badge">{content.campuses.mainCampus.badge}</div>
                                <h3>{content.campuses.mainCampus.title}</h3>
                                <p className="mbs-campus-location">
                                    <MapPin size={14} color="var(--theme-secondary, #F59E0B)" />
                                    <span>{content.campuses.mainCampus.location}</span>
                                </p>
                            </div>

                            <p className="mbs-campus-narrative">
                                {content.campuses.mainCampus.narrative}
                            </p>

                            <div className="mbs-facilities-grid">
                                {content.campuses.mainCampus.facilities.map((fac, idx) => (
                                    <div key={fac.id || idx} className="mbs-facility-item">
                                        {fac.icon === "BookOpen" ? (
                                            <BookOpen size={18} color="var(--theme-secondary, #F59E0B)" />
                                        ) : fac.icon === "Building2" ? (
                                            <Building2 size={18} color="var(--theme-secondary, #F59E0B)" />
                                        ) : fac.icon === "Users" ? (
                                            <Users size={18} color="var(--theme-secondary, #F59E0B)" />
                                        ) : (
                                            <Landmark size={18} color="var(--theme-secondary, #F59E0B)" />
                                        )}
                                        <div>
                                            <strong>{fac.title}</strong>
                                            <small>{fac.subtitle}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Regional Hubs Cards */}
                        <div className="mbs-regional-grid">
                            {content.campuses.regionalHubs.map(reg => (
                                <div key={reg.id} className="mbs-regional-card">
                                    <span className="mbs-region-badge">{reg.regionBadge}</span>
                                    <h4>{reg.title}</h4>
                                    <p>{reg.subtitle}</p>
                                    <ul className="mbs-hub-list">
                                        {reg.hubs.map((h, i) => (
                                            <li key={i}>
                                                <strong>{h.name}:</strong> {h.description}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Online Extension */}
                        <div className="mbs-online-ext-card">
                            <div className="mbs-online-icon-box">
                                <Globe size={26} color="var(--theme-secondary, #F59E0B)" />
                            </div>
                            <div className="mbs-online-text">
                                <h4>{content.campuses.onlineExt.title}</h4>
                                <p>{content.campuses.onlineExt.desc}</p>
                            </div>
                            <button
                                type="button"
                                className="mbs-btn-online-portal"
                                onClick={() => navigateTo("learning")}
                            >
                                <span>{content.campuses.onlineExt.buttonText}</span>
                                <ArrowRight size={15} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* CALL TO ACTION BANNER                                        */}
            {/* ============================================================ */}
            <section className="mbs-about-cta-section">
                <div className="mbs-cta-inner">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
                        <span className="mbs-cta-pill">{content.cta.pill}</span>
                        {canEdit && (
                            <button
                                type="button"
                                className="mbs-section-edit-trigger"
                                onClick={() => handleOpenEditor("accreditations")}
                            >
                                <Edit2 size={12} />
                                <span>Edit CTA</span>
                            </button>
                        )}
                    </div>

                    <h2>{content.cta.title}</h2>
                    <p>{content.cta.desc}</p>

                    <div className="mbs-cta-buttons">
                        <button
                            type="button"
                            className="mbs-btn-cta-primary"
                            onClick={() => navigateTo("home")}
                        >
                            <span>{content.cta.primaryBtn}</span>
                            <ArrowRight size={16} />
                        </button>
                        <button
                            type="button"
                            className="mbs-btn-cta-secondary"
                            onClick={() => navigateTo("contact")}
                        >
                            <span>{content.cta.secondaryBtn}</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* ADMIN MASTER MODAL EDITOR                                    */}
            {/* ============================================================ */}
            {isAdmin && (
                <AboutEditorModal
                    isOpen={isEditorOpen}
                    initialTab={editorTab}
                    content={content}
                    onSave={handleSaveContent}
                    onReset={handleResetContent}
                    onClose={() => setIsEditorOpen(false)}
                />
            )}

            {/* TOAST FEEDBACK */}
            {toastMessage && (
                <div className="mbs-toast-alert">
                    <Check size={18} color="#10b981" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* ============================================================ */}
            {/* UNIFIED INSTITUTIONAL FOOTER                                 */}
            {/* ============================================================ */}
            <PublicFooter
                onNavigate={navigateTo}
                onOpenAdmission={() => navigateTo("contact")}
            />
        </div>
    );
};

export default AboutPage;
