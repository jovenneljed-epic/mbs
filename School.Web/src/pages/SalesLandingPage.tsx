// ============================================================
// SalesLandingPage.tsx -> MOBILE BIBLE SCHOOL & THEOLOGICAL SEMINARY
// Official Institutional Portal & Academic Web System
// Fully connected to Landing Page Editor (CMS) & Real-time Content
// ============================================================

import React, { useState, useEffect, useMemo } from "react";
import "./SalesLandingPage.css";
import { API_BASE_URL } from "../config";
import {
    getLandingPageContent,
    LANDING_CONTENT_EVENT,
    applyGlobalTheme,
    type LandingPageContent
} from "../services/landingPageContent";
import { PromoVideoPlayer } from "../components/PromoVideoPlayer";
import {
    GraduationCap,
    ChevronRight,
    ArrowRight,
    Search,
    User,
    CheckCircle2,
    X,
    ShieldCheck,
    Award,
    CreditCard,
    Mail,
    Building2,
    Compass,
    BookOpen,
    Calendar
} from "lucide-react";

interface SalesLandingPageProps {
    onNavigate?: (page: string) => void;
}

interface AdmissionFormData {
    fullName: string;
    email: string;
    churchName: string;
    phone: string;
    program: string;
    position: string;
    message: string;
}

interface NewsArticle {
    id: string;
    tag: string;
    title: string;
    date: string;
    excerpt: string;
    fullContent: string[];
    image: string;
}

export const SalesLandingPage: React.FC<SalesLandingPageProps> = ({ onNavigate }) => {
    // ------------------------------------------------------------
    // Real-time CMS Content from LandingPageEditor
    // ------------------------------------------------------------
    const [content, setContent] = useState<LandingPageContent>(getLandingPageContent);

    useEffect(() => {
        const initial = getLandingPageContent();
        setContent(initial);
        if (initial.colorTheme) {
            applyGlobalTheme(initial.colorTheme);
        }

        const handleContentUpdate = (e: any) => {
            if (e && e.detail) {
                setContent(e.detail);
                if (e.detail.colorTheme) {
                    applyGlobalTheme(e.detail.colorTheme);
                }
            } else {
                const latest = getLandingPageContent();
                setContent(latest);
                if (latest.colorTheme) {
                    applyGlobalTheme(latest.colorTheme);
                }
            }
        };

        window.addEventListener(LANDING_CONTENT_EVENT, handleContentUpdate);
        return () => {
            window.removeEventListener(LANDING_CONTENT_EVENT, handleContentUpdate);
        };
    }, []);

    // Search query state
    const [searchQuery, setSearchQuery] = useState("");

    // Admissions Modal State
    const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [admissionSuccess, setAdmissionSuccess] = useState(false);
    const [admissionError, setAdmissionError] = useState<string | null>(null);

    // Active News Article Reader Modal State
    const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

    // Achievers pagination state
    const [achieverPage, setAchieverPage] = useState(1);
    const totalAchieverPages = 3;

    const [formData, setFormData] = useState<AdmissionFormData>({
        fullName: "",
        email: "",
        churchName: "",
        phone: "",
        program: "Bachelor of Theology (B.Th.)",
        position: "Aspiring Pastor / Ministry Leader",
        message: ""
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Centralized Bulletproof Navigation
    const navigateTo = (route: string) => {
        const clean = route.startsWith("/") ? route.replace(/^\/+/, "") : route;

        if (clean === "client-login" || clean === "student-portal") {
            if (onNavigate) onNavigate("client-login");
            else window.location.href = "/client-login";
            return;
        }

        if (clean === "login" || clean === "admin-login") {
            if (onNavigate) onNavigate("login");
            else window.location.href = "/login";
            return;
        }

        if (clean === "client-payment") {
            if (onNavigate) onNavigate("client-payment");
            else window.location.href = "/client-payment";
            return;
        }

        if (clean === "learning") {
            if (onNavigate) onNavigate("learning");
            else window.location.href = "/learning";
            return;
        }

        if (clean === "contact") {
            if (onNavigate) onNavigate("contact");
            else window.location.href = "/contact";
            return;
        }

        if (clean === "about") {
            if (onNavigate) onNavigate("about");
            else window.location.href = "/about";
            return;
        }

        if (clean === "landing-editor") {
            if (onNavigate) onNavigate("landing-editor");
            else window.location.href = "/admin/landing-editor";
            return;
        }

        if (onNavigate) {
            onNavigate(clean);
        } else {
            window.location.href = `/${clean}`;
        }
    };

    const openAdmissionWithProgram = (programName: string) => {
        setFormData(prev => ({ ...prev, program: programName }));
        setIsAdmissionOpen(true);
    };

    const handleAdmissionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setAdmissionError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/api/DemoRequests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    churchName: formData.churchName,
                    phone: formData.phone,
                    preferredDate: new Date().toISOString(),
                    preferredTime: "Admission Application",
                    organizationType: formData.program,
                    userRole: formData.position,
                    notes: `[Online Admission Application - ${content.schoolName || "Mobile Bible School"}]\nProgram: ${formData.program}\nRole: ${formData.position}\nMessage: ${formData.message}`
                })
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || "Failed to submit admission application");
            }

            setAdmissionSuccess(true);
            setFormData({
                fullName: "",
                email: "",
                churchName: "",
                phone: "",
                program: "Bachelor of Theology (B.Th.)",
                position: "Aspiring Pastor / Ministry Leader",
                message: ""
            });
        } catch (err: any) {
            setAdmissionError(err.message || "An error occurred while submitting your application.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // The 7 Official MBS Portals (Icon Launchers)
    const portals = useMemo(() => [
        {
            id: "admission",
            title: "Online Admission",
            subtitle: "New Student Application",
            icon: "admission",
            description: "Apply for undergraduate, pastoral diploma, and graduate theological programs.",
            actionText: "Apply Online",
            badge: "Open for SY 2026-2027",
            handler: () => openAdmissionWithProgram("Bachelor of Theology (B.Th.)")
        },
        {
            id: "enrollment",
            title: "Online Enrollment",
            subtitle: "Course Registration",
            icon: "enrollment",
            description: "Register for semester subjects, select class schedules, and verify curriculum load.",
            actionText: "Proceed to Enrollment",
            badge: "Active Term",
            handler: () => navigateTo("client-login")
        },
        {
            id: "payment",
            title: "Online Payment",
            subtitle: "Tuition & Fees Gateway",
            icon: "payment",
            description: "Secure tuition payments, course module dues, and financial ledger review.",
            actionText: "Make Payment",
            badge: "Instant Verification",
            handler: () => navigateTo("client-payment")
        },
        {
            id: "mail",
            title: "MBS Mail",
            subtitle: "Institutional Inquiries",
            icon: "mail",
            description: "Official communications for seminary students, pastoral faculty, and administration.",
            actionText: "Access Mail & Inquiries",
            badge: "Webmail Service",
            handler: () => navigateTo("contact")
        },
        {
            id: "my-mbs",
            title: "My MBS",
            subtitle: "Student & Faculty Portal",
            icon: "profile",
            description: "Centralized portal for student schedules, academic records, announcements, and profile.",
            actionText: "Login to My MBS",
            badge: "Single Sign-On",
            handler: () => navigateTo("client-login")
        },
        {
            id: "mbs-lms",
            title: "MBS LMS",
            subtitle: "Theological Learning Hub",
            icon: "lms",
            description: "Access online lecture videos, Greek/Hebrew exegetical tools, syllabi, and reading modules.",
            actionText: "Open LMS Hub",
            badge: "Interactive Classroom",
            handler: () => navigateTo("learning")
        },
        {
            id: "e-registrar",
            title: "eRegistrar",
            subtitle: "Academic Records & Evaluation",
            icon: "touch",
            description: "Official transcript requests, grade evaluations, graduation status, and pastoral endorsements.",
            actionText: "Access Records",
            badge: "Official Evaluation",
            handler: () => navigateTo("client-login")
        }
    ], [onNavigate]);

    // News & Features items
    const newsArticles: NewsArticle[] = useMemo(() => [
        {
            id: "pastoral-summit",
            tag: "MINISTRY SUMMIT",
            title: "MBS Hosts Annual National Pastors & Church Planters Colloquium 2026",
            date: "October 28, 2026",
            excerpt: "Over 350 church leaders, alumni, and seminary delegates gathered for three days of expository preaching, pastoral revitalization, and church planting strategies.",
            fullContent: [
                "The Mobile Bible School Annual National Pastors & Church Planters Colloquium brought together over 350 pastors, missionaries, and church planters from across Luzon, Visayas, and Mindanao.",
                "Keynote lectures centered on 'Expository Preaching in a Pluralistic Age', led by visiting seminary scholars and faculty leaders. Sessions covered biblical hermeneutics, pulpit endurance, family pastoral health, and establishing self-multiplying congregations in unreached towns.",
                "The event also celebrated the commissioning of 24 new church planting teams preparing to enter pioneering ministry fields across the Philippine archipelago."
            ],
            image: "/images/announcements/sunday-worship.jpg"
        },
        {
            id: "missions-expansion",
            tag: "GLOBAL MISSIONS",
            title: "MBS Alumni Pioneering 18 Cross-Cultural Church Plants in Southeast Asia",
            date: "October 16, 2026",
            excerpt: "From remote island communities to urban centers, our graduates continue to plant self-sustaining, Scripture-grounded congregations.",
            fullContent: [
                "The MBS Missions Board published its 2026 Field Assessment Report detailing remarkable ministry milestones achieved by Mobile Bible School alumni serving in frontier mission fields.",
                "Eighteen new indigenous fellowships have taken root, with local leaders being discipled through modular theological extension courses translated into indigenous regional dialects.",
                "Mobile Bible School continues to support missionary pastors through ongoing theological mentoring, leadership workshops, and study material sponsorships."
            ],
            image: "/images/announcements/youth-night.jpg"
        },
        {
            id: "theology-curriculum",
            tag: "ACADEMIC ADVANCE",
            title: "Seminary Launches Modular Programs in Advanced Hermeneutics & Biblical Counseling",
            date: "October 05, 2026",
            excerpt: "Designed for bivocational pastors and church ministry leaders, new evening and weekend intensive modules provide rigorous theological training.",
            fullContent: [
                "Responding to requests from church networks and bivocational servants, Mobile Bible School is launching brand new modular certificate tracks designed for busy ministry practitioners.",
                "The curriculum includes specialized courses in Biblical Counseling, Advanced Hermeneutics, Pauline Epistles, and Expository Preaching, taught by seasoned pastoral faculty.",
                "Enrolled students can attend both on-campus modular intensives and complete assignments via the MBS LMS cloud classroom."
            ],
            image: "/images/announcements/epic-platform-update.jpg"
        }
    ], []);

    // Alumni & Achievers Database across 3 pages
    const achieversData = useMemo(() => ({
        1: [
            {
                id: "1",
                category: "BACHELOR OF THEOLOGY (B.TH.)",
                rate: "100% ORDAINED",
                title: "Rev. David S. Morales, B.Th.",
                role: "Senior Pastor & Church Planter",
                honors: "Batch 2021 Summa Cum Laude",
                achievement: "Successfully planted 3 daughter churches and equipped 45 lay preachers across Southern Tagalog.",
                initials: "DM"
            },
            {
                id: "2",
                category: "MASTER OF MINISTRY (M.MIN.)",
                rate: "DISTINGUISHED ALUMNA",
                title: "Dr. Rebecca L. Santos, M.Min.",
                role: "Director of Biblical Counseling & Family Ministry",
                honors: "Batch 2019 Valedictorian",
                achievement: "Author of pastoral counseling manuals used across 80+ partner churches in Metro Manila.",
                initials: "RS"
            },
            {
                id: "3",
                category: "MASTER OF THEOLOGY (M.TH.)",
                rate: "EXPOSITOR & SCHOLAR",
                title: "Pastor Jonathan M. Cruz, M.Th.",
                role: "Dean of Biblical Languages & Exegesis",
                honors: "Batch 2016 High Distinction",
                achievement: "Lecturer in New Testament Greek, mentoring 120+ pastors in expository verse-by-verse pulpit ministry.",
                initials: "JC"
            }
        ],
        2: [
            {
                id: "4",
                category: "DIPLOMA IN PASTORAL STUDIES (DPS)",
                rate: "CHURCH REVITALIZER",
                title: "Pastor Timothy A. Bautista, DPS",
                role: "Lead Pastor & Youth Evangelist",
                honors: "Batch 2022 Magna Cum Laude",
                achievement: "Revitalized a struggling municipal congregation, growing active Sunday attendance from 30 to over 280 members.",
                initials: "TB"
            },
            {
                id: "5",
                category: "CROSS-CULTURAL MISSIONS",
                rate: "FRONTIER MISSIONARY",
                title: "Missionary Sarah G. Ramos, B.Th.",
                role: "Indigenous Church Planter",
                honors: "Batch 2020 Leadership Award",
                achievement: "Established 4 tribal Bible study fellowship hubs with translated hymnody and children's catechisms.",
                initials: "SR"
            },
            {
                id: "6",
                category: "DOCTOR OF THEOLOGY (D.TH.)",
                rate: "THEOLOGICAL PROFESSOR",
                title: "Dr. Benjamin K. Lee, D.Th.",
                role: "Professor of Systematic Theology",
                honors: "Batch 2014 Doctoral Fellow",
                achievement: "Published 3 peer-reviewed theological treatises on Reformation Ecclesiology and Expository Preaching.",
                initials: "BL"
            }
        ],
        3: [
            {
                id: "7",
                category: "CERTIFICATE IN BIBLICAL STUDIES (CBS)",
                rate: "LAY MINISTRY LEADER",
                title: "Sister Mary Grace Torres, CBS",
                role: "Director of Children's Ministry & VBS",
                honors: "Batch 2023 Exemplary Service",
                achievement: "Trained 200+ Sunday school teachers and coordinated Vacation Bible Schools reaching 1,500 children.",
                initials: "MT"
            },
            {
                id: "8",
                category: "BACHELOR OF THEOLOGY (B.TH.)",
                rate: "CAMPUS CHAPLAIN",
                title: "Pastor Emmanuel R. Reyes, B.Th.",
                role: "Collegiate Chaplain & Discipleship Mentor",
                honors: "Batch 2018 Academic Excellence",
                achievement: "Founded collegiate Christian fellowships across 5 university campuses in central Luzon.",
                initials: "ER"
            },
            {
                id: "9",
                category: "MASTER OF MINISTRY (M.MIN.)",
                rate: "WORSHIP DIRECTOR",
                title: "Pastor Nathaniel O. Castro, M.Min.",
                role: "Dean of Church Music & Hymnology",
                honors: "Batch 2017 Ministry Distinction",
                achievement: "Mentored over 60 church choirs and praise ensembles in Christ-centered, scripture-rich liturgical worship.",
                initials: "NC"
            }
        ]
    }), []);

    // Filtered portals
    const filteredPortals = useMemo(() => {
        if (!searchQuery.trim()) return portals;
        const q = searchQuery.toLowerCase();
        return portals.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.subtitle.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
    }, [searchQuery, portals]);

    return (
        <div className="ub-root">
            {/* ============================================================ */}
            {/* ANNOUNCEMENT RIBBON (EDITABLE FROM CMS)                       */}
            {/* ============================================================ */}
            {content.ribbonText && (
                <div className="ub-announcement-ribbon">
                    <div className="ub-announcement-container">
                        <span className="ub-announcement-pill">ANNOUNCEMENT</span>
                        <span className="ub-announcement-text">{content.ribbonText}</span>
                        {content.ribbonCta && (
                            <button
                                className="ub-announcement-btn"
                                onClick={() => openAdmissionWithProgram("Bachelor of Theology (B.Th.)")}
                            >
                                {content.ribbonCta} →
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* TOP INSTITUTIONAL HEADER & BRANDING                          */}
            {/* ============================================================ */}
            <header className="ub-header">
                <div className="ub-header-container">
                    {/* Brand Left */}
                    <div className="ub-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                        <div className="ub-crest">
                            <BookOpen className="ub-crest-icon" />
                        </div>
                        <div className="ub-title-block">
                            <h1 className="ub-university-name">{content.schoolName || "Mobile Bible School"}</h1>
                            <p className="ub-university-subtitle">{content.brandTagline || "Theological Seminary & Ministerial Institute"}</p>
                        </div>
                    </div>

                    {/* Nav Middle Links */}
                    <nav className="ub-nav-links">
                        <a
                            href="#campuses"
                            className="ub-nav-link"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById("campuses")?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            MAIN CAMPUS
                        </a>
                        <a
                            href="#learning"
                            className="ub-nav-link"
                            onClick={(e) => {
                                e.preventDefault();
                                navigateTo("learning");
                            }}
                        >
                            ONLINE EXTENSION
                        </a>
                        <a
                            href="#academic-programs"
                            className="ub-nav-link"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById("academic-programs")?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            ACADEMIC PROGRAMS
                        </a>
                        <div className="ub-anniversary-badge" title="40+ Years of Faithful Ministry & Theological Rigor">
                            <span className="ub-anniversary-sparkle">★</span>
                            <span>40+ Years of Ministry</span>
                        </div>
                    </nav>

                    {/* Actions Right */}
                    <div className="ub-header-actions">
                        <button
                            className="ub-btn-portal-student"
                            onClick={() => navigateTo("client-login")}
                            title="Student / Member Portal Login"
                        >
                            <User className="ub-btn-icon" />
                            <span>Student Portal</span>
                        </button>

                        <button
                            className="ub-btn-portal-admin"
                            onClick={() => navigateTo("login")}
                            title="Administrator / Faculty Login"
                        >
                            <ShieldCheck className="ub-btn-icon" />
                            <span>Admin Portal</span>
                        </button>

                        <button
                            className="ub-btn-apply"
                            onClick={() => openAdmissionWithProgram("Bachelor of Theology (B.Th.)")}
                            title="Open Online Admissions Application"
                        >
                            {content.ctaPrimary || "Apply Now"}
                        </button>
                    </div>
                </div>
            </header>

            {/* ============================================================ */}
            {/* CAMPUS HERO SECTION (CUSTOMIZED FROM CMS)                    */}
            {/* ============================================================ */}
            <section className="ub-hero-section">
                {/* Hero architectural background */}
                <div className="ub-hero-bg">
                    <div className="ub-hero-overlay" />
                    <div className="ub-hero-grid-pattern" />
                </div>

                <div className="ub-hero-content">
                    <div className="ub-hero-badge-row">
                        <span className="ub-accreditation-pill">
                            <Award className="ub-pill-icon" />
                            {content.heroBadge || "CHRIST-CENTERED THEOLOGICAL EDUCATION • ACCREDITED SEMINARY"}
                        </span>
                    </div>

                    <h2 className="ub-hero-title">
                        {content.heroTitleWhite} {content.heroTitleGradient}
                    </h2>

                    <p className="ub-hero-description">
                        {content.heroSubtitle}
                    </p>

                    {/* Hero CTA buttons */}
                    <div className="ub-hero-actions">
                        <button
                            className="ub-btn-hero-primary"
                            onClick={() => openAdmissionWithProgram("Bachelor of Theology (B.Th.)")}
                        >
                            {content.ctaPrimary || "Apply for Admission"}
                            <ArrowRight className="ub-btn-arrow" />
                        </button>

                        <a
                            href="#mbs-portals"
                            className="ub-btn-hero-secondary"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById("mbs-portals")?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            {content.ctaSecondary || "Access MBS Portals"}
                            <ChevronRight className="ub-btn-arrow" />
                        </a>
                    </div>

                    {/* Quick Search */}
                    <div className="ub-hero-search-wrapper">
                        <div className="ub-hero-search-bar">
                            <Search className="ub-search-icon" />
                            <input
                                type="text"
                                placeholder="Search theological programs, course subjects, portals, admissions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="ub-search-input"
                            />
                            {searchQuery && (
                                <button className="ub-search-clear" onClick={() => setSearchQuery("")}>
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats Bar */}
                    <div className="ub-hero-stats-card">
                        <div className="ub-stat-col">
                            <div className="ub-stat-number">{content.guarantee1?.split(" ")[0] || "40+"}</div>
                            <div className="ub-stat-label">{content.guarantee1?.replace(/^\S+\s*/, "") || "Years of Ministry"}</div>
                        </div>
                        <div className="ub-stat-divider" />
                        <div className="ub-stat-col">
                            <div className="ub-stat-number">{content.guarantee2?.split(" ")[0] || "100%"}</div>
                            <div className="ub-stat-label">{content.guarantee2?.replace(/^\S+\s*/, "") || "Ministry Placement"}</div>
                        </div>
                        <div className="ub-stat-divider" />
                        <div className="ub-stat-col">
                            <div className="ub-stat-number">{content.guarantee3?.split(" ")[0] || "35+"}</div>
                            <div className="ub-stat-label">{content.guarantee3?.replace(/^\S+\s*/, "") || "Church Plants & Hubs"}</div>
                        </div>
                        <div className="ub-stat-divider" />
                        <div className="ub-stat-col">
                            <div className="ub-stat-number">ACTS</div>
                            <div className="ub-stat-label">Accredited Seminary</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* MBS PORTALS (THE 7 COMPACT CLICKABLE ICONS)                  */}
            {/* ============================================================ */}
            <section id="mbs-portals" className="ub-portals-section">
                <div className="ub-portals-container">
                    <div className="ub-section-header">
                        <span className="ub-section-tag">STUDENT, FACULTY & MINISTERIAL SERVICES</span>
                        <h2 className="ub-section-title">MBS Portals</h2>
                        <div className="ub-title-line" />
                    </div>

                    <div className="ub-portals-icon-grid">
                        {filteredPortals.map((portal) => (
                            <button
                                key={portal.id}
                                className="ub-portal-icon-tile"
                                onClick={portal.handler}
                                title={`${portal.title} — ${portal.description}`}
                                type="button"
                            >
                                <div className={`ub-portal-icon-circle ub-circle-${portal.id}`}>
                                    {portal.icon === "admission" && <GraduationCap className="ub-icon-svg" />}
                                    {portal.icon === "enrollment" && <Building2 className="ub-icon-svg" />}
                                    {portal.icon === "payment" && <CreditCard className="ub-icon-svg" />}
                                    {portal.icon === "mail" && <Mail className="ub-icon-svg" />}
                                    {portal.icon === "profile" && <User className="ub-icon-svg" />}
                                    {portal.icon === "lms" && (
                                        <div className="ub-lms-hub-icon">
                                            <div className="ub-hub-center" />
                                            <div className="ub-hub-dot ub-dot-1" />
                                            <div className="ub-hub-dot ub-dot-2" />
                                            <div className="ub-hub-dot ub-dot-3" />
                                            <div className="ub-hub-dot ub-dot-4" />
                                            <div className="ub-hub-dot ub-dot-5" />
                                            <div className="ub-hub-dot ub-dot-6" />
                                        </div>
                                    )}
                                    {portal.icon === "touch" && <Compass className="ub-icon-svg" />}
                                </div>
                                <span className="ub-portal-icon-label">{portal.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* PROMOTIONAL VIDEO / MEDIA SHOWCASE (FROM CMS)                */}
            {/* ============================================================ */}
            {content.promoVideo && (
                <section className="ub-promo-video-section">
                    <div className="ub-portals-container">
                        <div className="ub-section-header">
                            <span className="ub-section-tag">FEATURED VIDEO SHOWCASE</span>
                            <h2 className="ub-section-title">{content.promoVideo.videoTitle || "Seminary Video Showcase"}</h2>
                            <div className="ub-title-line" />
                            {content.promoVideo.videoTagline && (
                                <p className="ub-section-lead">{content.promoVideo.videoTagline}</p>
                            )}
                        </div>
                        <div className="ub-promo-player-wrapper">
                            <PromoVideoPlayer
                                settings={content.promoVideo}
                                onApplyClick={() => openAdmissionWithProgram("Bachelor of Theology (B.Th.)")}
                                onEditClick={() => navigateTo("landing-editor")}
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* ============================================================ */}
            {/* ACADEMIC THEOLOGICAL PROGRAMS (FROM CMS MODULES)             */}
            {/* ============================================================ */}
            <section id="academic-programs" className="ub-programs-section">
                <div className="ub-portals-container">
                    <div className="ub-section-header">
                        <span className="ub-section-tag">{content.carouselEyebrow || "CURRICULUM & DEGREES"}</span>
                        <h2 className="ub-section-title">{content.carouselHeadline || "Academic & Ministerial Programs"}</h2>
                        <div className="ub-title-line" />
                        <p className="ub-section-lead">
                            {content.carouselSubheadline || "Comprehensive biblical instruction combining exegetical precision, systematic theology, and practical pastoral ministry training."}
                        </p>
                    </div>

                    <div className="ub-programs-grid">
                        {(content.modules && content.modules.length > 0 ? content.modules : []).map((mod, index) => (
                            <div
                                key={mod.id || index}
                                className={`ub-program-card ${index === 1 ? "ub-program-card-featured" : ""}`}
                            >
                                <span className={`ub-program-level ${index === 1 ? "ub-badge-gold" : ""}`}>
                                    {mod.eyebrow || mod.badge || "DEGREE PROGRAM"}
                                </span>
                                <h3 className="ub-program-name">{mod.title}</h3>
                                {mod.highlight && <h4 className="ub-program-highlight">{mod.highlight}</h4>}
                                <p className="ub-program-desc">{mod.description}</p>
                                <div className="ub-program-meta">
                                    <span>{mod.units || mod.date || "Academic Units"}</span>
                                    <button
                                        className="ub-program-link"
                                        onClick={() => openAdmissionWithProgram(mod.title)}
                                    >
                                        {mod.primaryCta || "Apply →"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* LICENSURE & ORDAINED ACHIEVERS SHOWCASE                      */}
            {/* ============================================================ */}
            <section className="ub-achievers-section">
                <div className="ub-portals-container">
                    <div className="ub-section-header">
                        <span className="ub-section-tag">FAITHFUL ALUMNI & GOSPEL IMPACT</span>
                        <h2 className="ub-section-title">Ordained Alumni & Ministry Achievers</h2>
                        <div className="ub-title-line" />
                        <p className="ub-section-lead">
                            Celebrating our graduates who are faithfully planting churches, shepherding congregations,
                            and leading cross-cultural ministries worldwide.
                        </p>
                    </div>

                    <div className="ub-achievers-grid">
                        {(achieversData[achieverPage as keyof typeof achieversData] || achieversData[1]).map((achiever) => (
                            <div key={achiever.id} className="ub-achiever-card">
                                <div className="ub-achiever-banner">
                                    <span className="ub-achiever-rate-tag">{achiever.rate}</span>
                                    <span className="ub-achiever-dept">{achiever.category}</span>
                                </div>

                                <div className="ub-achiever-body">
                                    <div className="ub-achiever-avatar">
                                        <div className="ub-avatar-circle">
                                            <span>{achiever.initials}</span>
                                        </div>
                                        <div className="ub-avatar-medal">
                                            <Award className="w-4 h-4 text-amber-900" />
                                        </div>
                                    </div>

                                    <h3 className="ub-achiever-name">{achiever.title}</h3>
                                    <p className="ub-achiever-role">{achiever.role}</p>
                                    <p className="ub-achiever-honors">{achiever.honors}</p>

                                    <div className="ub-achiever-quote">
                                        "{achiever.achievement}"
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination bar with real page switching */}
                    <div className="ub-pagination-bar">
                        <button
                            className="ub-page-nav"
                            disabled={achieverPage === 1}
                            onClick={() => setAchieverPage(p => Math.max(1, p - 1))}
                        >
                            &lt; Previous
                        </button>
                        <button
                            className={`ub-page-number ${achieverPage === 1 ? "active" : ""}`}
                            onClick={() => setAchieverPage(1)}
                        >
                            1
                        </button>
                        <button
                            className={`ub-page-number ${achieverPage === 2 ? "active" : ""}`}
                            onClick={() => setAchieverPage(2)}
                        >
                            2
                        </button>
                        <button
                            className={`ub-page-number ${achieverPage === 3 ? "active" : ""}`}
                            onClick={() => setAchieverPage(3)}
                        >
                            3
                        </button>
                        <span className="ub-page-ellipsis">...</span>
                        <button
                            className="ub-page-nav"
                            disabled={achieverPage === totalAchieverPages}
                            onClick={() => setAchieverPage(p => Math.min(totalAchieverPages, p + 1))}
                        >
                            Next &gt;
                        </button>
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* NEWS & FEATURES SECTION                                     */}
            {/* ============================================================ */}
            <section className="ub-news-section">
                <div className="ub-portals-container">
                    <div className="ub-section-header">
                        <span className="ub-section-tag">CAMPUS UPDATES & FIELD DISPATCHES</span>
                        <h2 className="ub-section-title">News & Features</h2>
                        <div className="ub-title-line" />
                    </div>

                    <div className="ub-news-grid">
                        {newsArticles.map((article) => (
                            <div key={article.id} className="ub-news-card">
                                <div className="ub-news-image-wrapper">
                                    <img src={article.image} alt={article.title} className="ub-news-img" />
                                    <span className="ub-news-badge">{article.tag}</span>
                                </div>
                                <div className="ub-news-body">
                                    <div className="ub-news-date">{article.date}</div>
                                    <h3 className="ub-news-card-title">{article.title}</h3>
                                    <p className="ub-news-excerpt">{article.excerpt}</p>
                                    <button
                                        className="ub-news-read-more"
                                        onClick={() => setActiveArticle(article)}
                                    >
                                        Read Dispatch
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* INSTITUTIONAL FOOTER                                        */}
            {/* ============================================================ */}
            <footer id="campuses" className="ub-footer">
                <div className="ub-footer-main">
                    <div className="ub-portals-container ub-footer-grid">
                        {/* Column 1: Institutional Seal & About */}
                        <div className="ub-footer-col ub-footer-col-brand">
                            <div className="ub-brand ub-footer-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                                <div className="ub-crest">
                                    <BookOpen className="ub-crest-icon" />
                                </div>
                                <div className="ub-title-block">
                                    <h3 className="ub-university-name text-white">{content.schoolName || "Mobile Bible School"}</h3>
                                    <p className="ub-university-subtitle text-amber-200">{content.brandTagline || "Theological Seminary & Institute"}</p>
                                </div>
                            </div>
                            <p className="ub-footer-motto">
                                "Preach the word; be ready in season and out of season; reprove, rebuke, and exhort,
                                with complete patience and teaching." — 2 Timothy 4:2
                            </p>
                            <div className="ub-footer-accreditations">
                                <span className="ub-tag-accred">ACTS ACCREDITED</span>
                                <span className="ub-tag-accred">CCHE RECOGNIZED</span>
                            </div>
                        </div>

                        {/* Column 2: Campus Locations */}
                        <div className="ub-footer-col">
                            <h4 className="ub-footer-heading">Campuses & Training Centers</h4>
                            <ul className="ub-footer-list">
                                <li><strong>Main Seminary Campus:</strong> Metro Manila, Philippines</li>
                                <li><strong>Regional Modular Centers:</strong> Luzon • Visayas • Mindanao</li>
                                <li><strong>Online Extension:</strong> Global Classroom Access</li>
                                <li><strong>Admissions Inquiries:</strong> +63 (02) 8800-BIBLE</li>
                                <li><strong>Direct Mobile:</strong> +63 917 123 4567</li>
                            </ul>
                        </div>

                        {/* Column 3: Quick Portals & Links */}
                        <div className="ub-footer-col">
                            <h4 className="ub-footer-heading">MBS Direct Portals</h4>
                            <ul className="ub-footer-list">
                                <li><button onClick={() => navigateTo("client-login")}>Student Portal (My MBS)</button></li>
                                <li><button onClick={() => navigateTo("login")}>Seminary Admin & Faculty Portal</button></li>
                                <li><button onClick={() => navigateTo("learning")}>Theological LMS (Class Modules)</button></li>
                                <li><button onClick={() => navigateTo("client-payment")}>Tuition & Assessment Payment</button></li>
                                <li><button onClick={() => openAdmissionWithProgram("Bachelor of Theology (B.Th.)")}>Online Admissions Desk</button></li>
                            </ul>
                        </div>

                        {/* Column 4: Admissions & Faith Statement */}
                        <div className="ub-footer-col">
                            <h4 className="ub-footer-heading">Admissions Desk</h4>
                            <p className="text-sm text-gray-300 mb-3">
                                Accepting applications for the upcoming academic semester. Open to pastors, church workers, and theological scholars.
                            </p>
                            <button
                                className="ub-btn-footer-apply"
                                onClick={() => openAdmissionWithProgram("Bachelor of Theology (B.Th.)")}
                            >
                                Apply for Admission
                            </button>
                        </div>
                    </div>
                </div>

                <div className="ub-footer-bottom">
                    <div className="ub-portals-container ub-footer-bottom-flex">
                        <p>© {new Date().getFullYear()} {content.schoolName || "Mobile Bible School"} & Theological Seminary. All Rights Reserved.</p>
                        <div className="ub-footer-links">
                            <a href="#privacy" onClick={(e) => { e.preventDefault(); navigateTo("contact"); }}>Privacy Policy</a>
                            <span>•</span>
                            <a href="#terms" onClick={(e) => { e.preventDefault(); navigateTo("about"); }}>Academic Policies</a>
                            <span>•</span>
                            <a href="#admissions" onClick={(e) => { e.preventDefault(); openAdmissionWithProgram("Bachelor of Theology (B.Th.)"); }}>Admissions Desk</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ============================================================ */}
            {/* ONLINE ADMISSION APPLICATION MODAL                           */}
            {/* ============================================================ */}
            {isAdmissionOpen && (
                <div className="ub-modal-overlay" onClick={() => setIsAdmissionOpen(false)}>
                    <div className="ub-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="ub-modal-close"
                            onClick={() => setIsAdmissionOpen(false)}
                            aria-label="Close Modal"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="ub-modal-header">
                            <div className="ub-modal-badge">
                                <GraduationCap className="w-4 h-4 mr-1 text-amber-400" />
                                Official Online Application
                            </div>
                            <h3 className="ub-modal-title">{content.schoolName || "Mobile Bible School"} Admission</h3>
                            <p className="ub-modal-desc">
                                Fill out your preliminary application for theological, pastoral, or graduate ministerial degree studies.
                            </p>
                        </div>

                        {admissionSuccess ? (
                            <div className="ub-modal-success">
                                <CheckCircle2 className="w-14 h-14 text-emerald-500 mb-3" />
                                <h4>Application Submitted Successfully!</h4>
                                <p>
                                    Thank you for applying to {content.schoolName || "Mobile Bible School"}. Our Admissions Committee and Registrar will contact you via email and phone regarding entrance requirements and course scheduling.
                                </p>
                                <button
                                    className="ub-btn-hero-primary mt-4"
                                    onClick={() => {
                                        setAdmissionSuccess(false);
                                        setIsAdmissionOpen(false);
                                    }}
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <form className="ub-modal-form" onSubmit={handleAdmissionSubmit}>
                                {admissionError && (
                                    <div className="ub-modal-error">
                                        {admissionError}
                                    </div>
                                )}

                                <div className="ub-form-group">
                                    <label>Full Applicant Name *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Pastor / Brother / Sister Full Name"
                                    />
                                </div>

                                <div className="ub-form-row">
                                    <div className="ub-form-group">
                                        <label>Email Address *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="your.email@domain.com"
                                        />
                                    </div>

                                    <div className="ub-form-group">
                                        <label>Contact Mobile *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="0917 123 4567"
                                        />
                                    </div>
                                </div>

                                <div className="ub-form-row">
                                    <div className="ub-form-group">
                                        <label>Home Church & Ministry *</label>
                                        <input
                                            type="text"
                                            name="churchName"
                                            required
                                            value={formData.churchName}
                                            onChange={handleInputChange}
                                            placeholder="Name of Local Church & Location"
                                        />
                                    </div>

                                    <div className="ub-form-group">
                                        <label>Desired Program *</label>
                                        <select
                                            name="program"
                                            value={formData.program}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Certificate in Biblical Studies (CBS)">Certificate in Biblical Studies (CBS)</option>
                                            <option value="Diploma in Pastoral Studies (DPS)">Diploma in Pastoral Studies (DPS)</option>
                                            <option value="Bachelor of Theology (B.Th.)">Bachelor of Theology (B.Th.)</option>
                                            <option value="Master of Ministry (M.Min.)">Master of Ministry (M.Min.)</option>
                                            <option value="Master of Theology (M.Th.)">Master of Theology (M.Th.)</option>
                                            <option value="Modular / Special Theological Subjects">Modular / Special Theological Subjects</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="ub-form-group">
                                    <label>Current Ministry Role *</label>
                                    <select
                                        name="position"
                                        value={formData.position}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Senior Pastor / Associate Pastor">Senior Pastor / Associate Pastor</option>
                                        <option value="Church Planter / Missionary">Church Planter / Missionary</option>
                                        <option value="Youth Pastor / Sunday School Teacher">Youth Pastor / Sunday School Teacher</option>
                                        <option value="Deacon / Church Leader">Deacon / Church Leader</option>
                                        <option value="Lay Minister / Bible Study Leader">Lay Minister / Bible Study Leader</option>
                                        <option value="Aspiring Student of the Word">Aspiring Student of the Word</option>
                                    </select>
                                </div>

                                <div className="ub-form-group">
                                    <label>Ministry Calling / Comments (Optional)</label>
                                    <textarea
                                        name="message"
                                        rows={3}
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        placeholder="Share brief background on your ministry calling or questions for the registrar..."
                                    />
                                </div>

                                <div className="ub-form-actions">
                                    <button
                                        type="button"
                                        className="ub-btn-cancel"
                                        onClick={() => setIsAdmissionOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="ub-btn-submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Submitting Application..." : "Submit Admission Application"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* ARTICLE READER MODAL (DISPATCH MODAL)                         */}
            {/* ============================================================ */}
            {activeArticle && (
                <div className="ub-modal-overlay" onClick={() => setActiveArticle(null)}>
                    <div className="ub-modal-content ub-article-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="ub-modal-close"
                            onClick={() => setActiveArticle(null)}
                            aria-label="Close Article"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="ub-article-modal-header">
                            <span className="ub-article-modal-tag">{activeArticle.tag}</span>
                            <div className="ub-article-modal-date">
                                <Calendar className="w-4 h-4 mr-1 text-amber-600 inline" />
                                {activeArticle.date}
                            </div>
                            <h2 className="ub-article-modal-title">{activeArticle.title}</h2>
                        </div>

                        <div className="ub-article-modal-image-wrapper">
                            <img src={activeArticle.image} alt={activeArticle.title} className="ub-article-modal-img" />
                        </div>

                        <div className="ub-article-modal-body">
                            {activeArticle.fullContent.map((paragraph, idx) => (
                                <p key={idx} className="ub-article-paragraph">{paragraph}</p>
                            ))}
                        </div>

                        <div className="ub-article-modal-footer">
                            <button
                                className="ub-btn-hero-primary"
                                onClick={() => {
                                    setActiveArticle(null);
                                    openAdmissionWithProgram("Bachelor of Theology (B.Th.)");
                                }}
                            >
                                Inquire with Admissions
                            </button>
                            <button
                                className="ub-btn-cancel"
                                onClick={() => setActiveArticle(null)}
                            >
                                Close Dispatch
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesLandingPage;
