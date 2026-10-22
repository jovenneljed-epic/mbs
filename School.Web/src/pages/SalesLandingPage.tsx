// ============================================================
// SalesLandingPage.tsx -> MOBILE BIBLE SCHOOL & THEOLOGICAL SEMINARY
// Official Institutional Portal & Academic Web System
// Structured after collegiate portal architecture
// ============================================================

import React, { useState, useMemo } from "react";
import "./SalesLandingPage.css";
import { API_BASE_URL } from "../config";
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
    BookOpen
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

export const SalesLandingPage: React.FC<SalesLandingPageProps> = ({ onNavigate }) => {
    // Search query state
    const [searchQuery, setSearchQuery] = useState("");

    // Admissions Modal State
    const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [admissionSuccess, setAdmissionSuccess] = useState(false);
    const [admissionError, setAdmissionError] = useState<string | null>(null);

    // Achievers pagination state
    const [achieverPage, setAchieverPage] = useState(1);
    const totalAchieverPages = 12;

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
                    notes: `[Online Admission Application - Mobile Bible School]\nProgram: ${formData.program}\nRole: ${formData.position}\nMessage: ${formData.message}`
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

    const navigateTo = (route: string) => {
        if (onNavigate) {
            onNavigate(route);
        } else {
            window.location.href = route;
        }
    };

    // The 7 Official MBS Portals
    const portals = useMemo(() => [
        {
            id: "admission",
            title: "Online Admission",
            subtitle: "New Student Application",
            icon: "admission",
            description: "Apply for undergraduate, pastoral diploma, and graduate theological programs.",
            actionText: "Apply Online",
            badge: "Open for SY 2026-2027",
            handler: () => setIsAdmissionOpen(true)
        },
        {
            id: "enrollment",
            title: "Online Enrollment",
            subtitle: "Course Registration",
            icon: "enrollment",
            description: "Register for semester subjects, select class schedules, and verify curriculum load.",
            actionText: "Proceed to Enrollment",
            badge: "Active Term",
            handler: () => navigateTo("/client-login")
        },
        {
            id: "payment",
            title: "Online Payment",
            subtitle: "Tuition & Fees Gateway",
            icon: "payment",
            description: "Secure tuition payments, course module dues, and financial ledger review.",
            actionText: "Make Payment",
            badge: "Instant Verification",
            handler: () => navigateTo("/client-payment")
        },
        {
            id: "mail",
            title: "MBS Mail",
            subtitle: "Institutional Inquiries",
            icon: "mail",
            description: "Official communications for seminary students, pastoral faculty, and administration.",
            actionText: "Access Mail & Inquiries",
            badge: "Webmail Service",
            handler: () => navigateTo("/contact")
        },
        {
            id: "my-mbs",
            title: "My MBS",
            subtitle: "Student & Faculty Portal",
            icon: "profile",
            description: "Centralized portal for student schedules, academic records, announcements, and profile.",
            actionText: "Login to My MBS",
            badge: "Single Sign-On",
            handler: () => navigateTo("/client-login")
        },
        {
            id: "mbs-lms",
            title: "MBS LMS",
            subtitle: "Theological Learning Hub",
            icon: "lms",
            description: "Access online lecture videos, Greek/Hebrew exegetical tools, syllabi, and reading modules.",
            actionText: "Open LMS Hub",
            badge: "Interactive Classroom",
            handler: () => navigateTo("/learning")
        },
        {
            id: "e-registrar",
            title: "eRegistrar",
            subtitle: "Academic Records & Evaluation",
            icon: "touch",
            description: "Official transcript requests, grade evaluations, graduation status, and pastoral endorsements.",
            actionText: "Access Records",
            badge: "Official Evaluation",
            handler: () => navigateTo("/client-login")
        }
    ], [onNavigate]);

    // News & Features items
    const newsArticles = useMemo(() => [
        {
            id: "pastoral-summit",
            tag: "MINISTRY SUMMIT",
            title: "MBS Hosts Annual National Pastors & Church Planters Colloquium 2026",
            date: "October 28, 2026",
            excerpt: "Over 350 church leaders, alumni, and seminary delegates gathered for three days of expository preaching, pastoral revitalization, and church planting strategies.",
            image: "/images/announcements/sunday-worship.jpg"
        },
        {
            id: "missions-expansion",
            tag: "GLOBAL MISSIONS",
            title: "MBS Alumni Pioneering 18 Cross-Cultural Church Plants in Southeast Asia",
            date: "October 16, 2026",
            excerpt: "From remote island communities to urban centers, our graduates continue to plant self-sustaining, Scripture-grounded congregations.",
            image: "/images/announcements/youth-night.jpg"
        },
        {
            id: "theology-curriculum",
            tag: "ACADEMIC ADVANCE",
            title: "Seminary Launches Modular Programs in Advanced Hermeneutics & Biblical Counseling",
            date: "October 05, 2026",
            excerpt: "Designed for bivocational pastors and church ministry leaders, new evening and weekend intensive modules provide rigorous theological training.",
            image: "/images/announcements/epic-platform-update.jpg"
        }
    ], []);

    // Alumni & Achievers
    const achievers = useMemo(() => [
        {
            id: "1",
            category: "BACHELOR OF THEOLOGY (B.TH.)",
            rate: "100% ORDAINED",
            title: "Rev. David S. Morales, B.Th.",
            role: "Senior Pastor & Church Planter",
            honors: "Batch 2021 Summa Cum Laude",
            achievement: "Successfully planted 3 daughter churches and equipped 45 lay preachers.",
            initials: "DM"
        },
        {
            id: "2",
            category: "MASTER OF MINISTRY (M.MIN.)",
            rate: "DISTINGUISHED ALUMNA",
            title: "Dr. Rebecca L. Santos, M.Min.",
            role: "Director of Biblical Counseling & Family Ministry",
            honors: "Batch 2019 Valedictorian",
            achievement: "Author of pastoral counseling manuals used across 80+ partner churches.",
            initials: "RS"
        },
        {
            id: "3",
            category: "MASTER OF THEOLOGY (M.TH.)",
            rate: "EXPOSITOR & SCHOLAR",
            title: "Pastor Jonathan M. Cruz, M.Th.",
            role: "Dean of Biblical Languages & Exegesis",
            honors: "Batch 2016 High Distinction",
            achievement: "Lecturer in New Testament Greek, mentoring pastors in expository pulpit ministry.",
            initials: "JC"
        }
    ], []);

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
            {/* TOP INSTITUTIONAL HEADER & BRANDING */}
            {/* ============================================================ */}
            <header className="ub-header">
                <div className="ub-header-container">
                    {/* Brand Left */}
                    <div className="ub-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                        <div className="ub-crest">
                            <BookOpen className="ub-crest-icon" />
                        </div>
                        <div className="ub-title-block">
                            <h1 className="ub-university-name">Mobile Bible School</h1>
                            <p className="ub-university-subtitle">Theological Seminary & Ministerial Institute</p>
                        </div>
                    </div>

                    {/* Nav Middle Links */}
                    <nav className="ub-nav-links">
                        <a href="#campuses" className="ub-nav-link" onClick={(e) => { e.preventDefault(); navigateTo("/about"); }}>
                            MAIN CAMPUS
                        </a>
                        <a href="#extension" className="ub-nav-link" onClick={(e) => { e.preventDefault(); navigateTo("/learning"); }}>
                            ONLINE EXTENSION
                        </a>
                        <a href="#programs" className="ub-nav-link" onClick={(e) => { e.preventDefault(); navigateTo("/about"); }}>
                            ACADEMIC PROGRAMS
                        </a>
                        <div className="ub-anniversary-badge">
                            <span className="ub-anniversary-sparkle">★</span>
                            <span>40+ Years of Ministry</span>
                        </div>
                    </nav>

                    {/* Actions Right */}
                    <div className="ub-header-actions">
                        <button
                            className="ub-btn-portal-student"
                            onClick={() => navigateTo("/client-login")}
                            title="Student Portal Login"
                        >
                            <User className="ub-btn-icon" />
                            <span>Student Portal</span>
                        </button>

                        <button
                            className="ub-btn-portal-admin"
                            onClick={() => navigateTo("/login")}
                            title="Administrator / Faculty Login"
                        >
                            <ShieldCheck className="ub-btn-icon" />
                            <span>Admin Portal</span>
                        </button>

                        <button
                            className="ub-btn-apply"
                            onClick={() => setIsAdmissionOpen(true)}
                        >
                            Apply Now
                        </button>
                    </div>
                </div>
            </header>

            {/* ============================================================ */}
            {/* CAMPUS HERO SECTION */}
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
                            CHRIST-CENTERED THEOLOGICAL EDUCATION • ACCREDITED SEMINARY
                        </span>
                    </div>

                    <h2 className="ub-hero-title">
                        Equipping Servants of the Word for God’s Global Kingdom
                    </h2>

                    <p className="ub-hero-description">
                        Rooted in biblical inerrancy, sound theological scholarship, expository preaching, and pastoral ministry.
                        Nurturing gospel-driven ministers equipped to preach the Truth and shepherd the flock with integrity.
                    </p>

                    {/* Hero CTA buttons */}
                    <div className="ub-hero-actions">
                        <button
                            className="ub-btn-hero-primary"
                            onClick={() => setIsAdmissionOpen(true)}
                        >
                            Apply for Admission
                            <ArrowRight className="ub-btn-arrow" />
                        </button>

                        <a
                            href="#mbs-portals"
                            className="ub-btn-hero-secondary"
                        >
                            Access MBS Portals
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
                            <div className="ub-stat-number">40+</div>
                            <div className="ub-stat-label">Years of Ministry</div>
                        </div>
                        <div className="ub-stat-divider" />
                        <div className="ub-stat-col">
                            <div className="ub-stat-number">100%</div>
                            <div className="ub-stat-label">Ministry Placement</div>
                        </div>
                        <div className="ub-stat-divider" />
                        <div className="ub-stat-col">
                            <div className="ub-stat-number">35+</div>
                            <div className="ub-stat-label">Church Plants & Hubs</div>
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
            {/* MBS PORTALS (THE 7 OFFICIAL CARDS) */}
            {/* ============================================================ */}
            <section id="mbs-portals" className="ub-portals-section">
                <div className="ub-portals-container">
                    <div className="ub-section-header">
                        <span className="ub-section-tag">STUDENT, FACULTY & MINISTERIAL SERVICES</span>
                        <h2 className="ub-section-title">MBS Portals</h2>
                        <div className="ub-title-line" />
                        <p className="ub-section-lead">
                            Centralized access point for Mobile Bible School academic portals, course syllabi,
                            admissions applications, tuition payment, and student records.
                        </p>
                    </div>

                    <div className="ub-portals-grid">
                        {filteredPortals.map((portal) => (
                            <div
                                key={portal.id}
                                className={`ub-portal-card ub-portal-card-${portal.id}`}
                                onClick={portal.handler}
                            >
                                <div className="ub-card-top">
                                    <div className="ub-card-icon-container">
                                        {/* Dynamic Icon based on UB Portal layout */}
                                        {portal.icon === "admission" && (
                                            <div className="ub-portal-icon-box ub-icon-admission">
                                                <GraduationCap className="ub-icon-svg" />
                                            </div>
                                        )}
                                        {portal.icon === "enrollment" && (
                                            <div className="ub-portal-icon-box ub-icon-enrollment">
                                                <Building2 className="ub-icon-svg" />
                                            </div>
                                        )}
                                        {portal.icon === "payment" && (
                                            <div className="ub-portal-icon-box ub-icon-payment">
                                                <CreditCard className="ub-icon-svg" />
                                            </div>
                                        )}
                                        {portal.icon === "mail" && (
                                            <div className="ub-portal-icon-box ub-icon-mail">
                                                <Mail className="ub-icon-svg" />
                                            </div>
                                        )}
                                        {portal.icon === "profile" && (
                                            <div className="ub-portal-icon-box ub-icon-profile">
                                                <User className="ub-icon-svg" />
                                            </div>
                                        )}
                                        {portal.icon === "lms" && (
                                            <div className="ub-portal-icon-box ub-icon-lms">
                                                {/* LMS segmented circular icon LMS learning hub */}
                                                <div className="ub-lms-hub-icon">
                                                    <div className="ub-hub-center" />
                                                    <div className="ub-hub-dot ub-dot-1" />
                                                    <div className="ub-hub-dot ub-dot-2" />
                                                    <div className="ub-hub-dot ub-dot-3" />
                                                    <div className="ub-hub-dot ub-dot-4" />
                                                    <div className="ub-hub-dot ub-dot-5" />
                                                    <div className="ub-hub-dot ub-dot-6" />
                                                </div>
                                            </div>
                                        )}
                                        {portal.icon === "touch" && (
                                            <div className="ub-portal-icon-box ub-icon-registrar">
                                                <Compass className="ub-icon-svg" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="ub-portal-badge">{portal.badge}</span>
                                </div>

                                <div className="ub-card-body">
                                    <h3 className="ub-portal-title">{portal.title}</h3>
                                    <h4 className="ub-portal-sub">{portal.subtitle}</h4>
                                    <p className="ub-portal-desc">{portal.description}</p>
                                </div>

                                <div className="ub-card-footer">
                                    <span className="ub-portal-action">
                                        {portal.actionText}
                                        <ChevronRight className="ub-action-arrow" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* ACADEMIC THEOLOGICAL PROGRAMS */}
            {/* ============================================================ */}
            <section className="ub-programs-section">
                <div className="ub-portals-container">
                    <div className="ub-section-header">
                        <span className="ub-section-tag">CURRICULUM & DEGREES</span>
                        <h2 className="ub-section-title">Academic & Ministerial Programs</h2>
                        <div className="ub-title-line" />
                        <p className="ub-section-lead">
                            Comprehensive biblical instruction combining exegetical precision, systematic theology,
                            and practical pastoral ministry training.
                        </p>
                    </div>

                    <div className="ub-programs-grid">
                        <div className="ub-program-card">
                            <span className="ub-program-level">DIPLOMA LEVEL</span>
                            <h3 className="ub-program-name">Diploma in Pastoral Studies (DPS)</h3>
                            <p className="ub-program-desc">
                                Essential training in Expository Preaching, Systematic Theology I & II, and Christian Education for Church Workers.
                            </p>
                            <div className="ub-program-meta">
                                <span>2 Years • 60 Credits</span>
                                <button className="ub-program-link" onClick={() => setIsAdmissionOpen(true)}>Apply →</button>
                            </div>
                        </div>

                        <div className="ub-program-card ub-program-card-featured">
                            <span className="ub-program-level ub-badge-gold">FLAGSHIP DEGREE</span>
                            <h3 className="ub-program-name">Bachelor of Theology (B.Th.)</h3>
                            <p className="ub-program-desc">
                                In-depth study in Biblical Greek, Hebrew, Hermeneutics, Pastoral Theology, Ecclesiology, and Pauline Epistles.
                            </p>
                            <div className="ub-program-meta">
                                <span>4 Years • 128 Credits</span>
                                <button className="ub-program-link" onClick={() => setIsAdmissionOpen(true)}>Apply →</button>
                            </div>
                        </div>

                        <div className="ub-program-card">
                            <span className="ub-program-level">GRADUATE LEVEL</span>
                            <h3 className="ub-program-name">Master of Ministry & Theology (M.Min / M.Th.)</h3>
                            <p className="ub-program-desc">
                                Advanced leadership in Apologetics, Church Management, Worship Leadership, and Reformation Theology.
                            </p>
                            <div className="ub-program-meta">
                                <span>2 Years • Graduate Seminar</span>
                                <button className="ub-program-link" onClick={() => setIsAdmissionOpen(true)}>Apply →</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* LICENSURE & ORDAINED ACHIEVERS SHOWCASE */}
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
                        {achievers.map((achiever) => (
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

                    {/* Pagination bar matching the collegiate screenshot */}
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
                            className={`ub-page-number ${achieverPage === totalAchieverPages ? "active" : ""}`}
                            onClick={() => setAchieverPage(totalAchieverPages)}
                        >
                            {totalAchieverPages}
                        </button>
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
            {/* NEWS & FEATURES SECTION */}
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
                                        onClick={() => setIsAdmissionOpen(true)}
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
            {/* INSTITUTIONAL FOOTER */}
            {/* ============================================================ */}
            <footer className="ub-footer">
                <div className="ub-footer-main">
                    <div className="ub-portals-container ub-footer-grid">
                        {/* Column 1: Institutional Seal & About */}
                        <div className="ub-footer-col ub-footer-col-brand">
                            <div className="ub-brand ub-footer-brand">
                                <div className="ub-crest">
                                    <BookOpen className="ub-crest-icon" />
                                </div>
                                <div className="ub-title-block">
                                    <h3 className="ub-university-name text-white">Mobile Bible School</h3>
                                    <p className="ub-university-subtitle text-amber-200">Theological Seminary & Institute</p>
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
                                <li><button onClick={() => navigateTo("/client-login")}>Student Portal (My MBS)</button></li>
                                <li><button onClick={() => navigateTo("/login")}>Seminary Admin & Faculty Portal</button></li>
                                <li><button onClick={() => navigateTo("/learning")}>Theological LMS (Class Modules)</button></li>
                                <li><button onClick={() => navigateTo("/client-payment")}>Tuition & Assessment Payment</button></li>
                                <li><button onClick={() => setIsAdmissionOpen(true)}>Online Admissions Desk</button></li>
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
                                onClick={() => setIsAdmissionOpen(true)}
                            >
                                Apply for Admission
                            </button>
                        </div>
                    </div>
                </div>

                <div className="ub-footer-bottom">
                    <div className="ub-portals-container ub-footer-bottom-flex">
                        <p>© {new Date().getFullYear()} Mobile Bible School & Theological Seminary. All Rights Reserved.</p>
                        <div className="ub-footer-links">
                            <a href="#privacy" onClick={(e) => { e.preventDefault(); navigateTo("/contact"); }}>Privacy Policy</a>
                            <span>•</span>
                            <a href="#terms" onClick={(e) => { e.preventDefault(); navigateTo("/contact"); }}>Academic Policies</a>
                            <span>•</span>
                            <a href="#admissions" onClick={(e) => { e.preventDefault(); setIsAdmissionOpen(true); }}>Admissions Desk</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ============================================================ */}
            {/* ONLINE ADMISSION APPLICATION MODAL */}
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
                            <h3 className="ub-modal-title">Mobile Bible School Admission</h3>
                            <p className="ub-modal-desc">
                                Fill out your preliminary application for theological, pastoral, or graduate ministerial degree studies.
                            </p>
                        </div>

                        {admissionSuccess ? (
                            <div className="ub-modal-success">
                                <CheckCircle2 className="w-14 h-14 text-emerald-500 mb-3" />
                                <h4>Application Submitted Successfully!</h4>
                                <p>
                                    Thank you for applying to Mobile Bible School. Our Admissions Committee and Registrar will contact you via email and phone regarding entrance requirements and course scheduling.
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
        </div>
    );
};

export default SalesLandingPage;
