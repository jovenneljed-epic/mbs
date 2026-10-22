// ============================================================
// SalesLandingPage.tsx -> University of Batangas (UB) Institutional Portal
// Official Academic Website & Portals
// Mobile Bible School & Theological Seminary Heritage
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
} from "lucide-react";

interface SalesLandingPageProps {
    onNavigate?: (page: string) => void;
}

interface DemoFormData {
    fullName: string;
    email: string;
    churchName: string;
    phone: string;
    position: string;
    message: string;
}

const INITIAL_FORM_DATA: DemoFormData = {
    fullName: "",
    email: "",
    churchName: "",
    phone: "",
    position: "",
    message: "",
};

// ============================================================
// NEWS & FEATURES DATA
// ============================================================
interface NewsItem {
    id: string;
    title: string;
    category: "Forum" | "Feature" | "Academic" | "Milestone";
    date: string;
    excerpt: string;
    imageUrl: string;
    badgeText?: string;
}

const NEWS_DATA: NewsItem[] = [
    {
        id: "news-1",
        title: "UB to host Batangas leg of regional forum on West Philippine Sea",
        category: "Forum",
        date: "October 13, 2026",
        excerpt:
            "The University of Batangas (UB) will host the Batangas leg of the forum, 'Mobilizing Filipino Voices on the 10th Anniversary of the South China Sea Arbitral Ruling' on October 23, welcoming national delegates, scholars, and youth leaders.",
        imageUrl: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80",
        badgeText: "Regional Forum"
    },
    {
        id: "news-2",
        title: "Believing in One's Potential: How the University of Batangas Shaped a Global Leader",
        category: "Feature",
        date: "October 12, 2026",
        excerpt:
            "The story of the University of Batangas (UB), originally founded in 1946 as Western Philippine Colleges (WPC), is one of deliberate, dignified growth. Over the decades, the institution has continuously produced nation-builders.",
        imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
        badgeText: "Feature"
    },
    {
        id: "news-3",
        title: "Pause, Inspect, Verify: UB JHS, SHS students gain digital safety and responsible AI insights in cybersecurity webinar with Globe",
        category: "Academic",
        date: "September 24, 2026",
        excerpt:
            "Junior High School (JHS) and Senior High School (SHS) students of the University of Batangas participated in an intensive webinar titled 'Cybersecurity Awareness and Digital Citizenship' held via Google Meet.",
        imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
        badgeText: "Cybersecurity & AI"
    }
];

// ============================================================
// ACADEMIC ACHIEVEMENTS & LICENSURE PASSERS DATA
// ============================================================
interface AchieverItem {
    id: string;
    bannerTitle: string;
    title: string;
    date: string;
    excerpt: string;
    passRateBadge?: string;
    imageUrl: string;
}

const ACHIEVERS_DATA: AchieverItem[] = [
    {
        id: "achiever-1",
        bannerTitle: "UBLC Psychology celebrates back-to-back licensure examination successes",
        title: "UBLC Psychology celebrates back-to-back licensure examination successes",
        date: "September 24, 2026",
        passRateBadge: "100% Passing Rate",
        excerpt:
            "A new milestone marks the University of Batangas Lipa City (UBLC) College of Education, Arts, and Sciences (CEAS) as its Bachelor of Science in Psychology program achieved a 100% passing rate in the recent board exams.",
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "achiever-2",
        bannerTitle: "UB HRDM alumna earns national Human Resource Associate certification",
        title: "UB HRDM alumna earns national Human Resource Associate certification",
        date: "September 22, 2026",
        passRateBadge: "Certified HR Associate",
        excerpt:
            "Patricia Michaella S. Rosales, a graduate of the Bachelor of Science in Business Administration (BSBA) major in Human Resource Development Management (HRDM) program at the University of Batangas (UB), earned national certification honors.",
        imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "achiever-3",
        bannerTitle: "Two UB BSEE graduates pass September 2026 Electrical Engineers Licensure Exam",
        title: "Two UB BSEE graduates pass September 2026 Electrical Engineers Licensure Exam",
        date: "September 22, 2026",
        passRateBadge: "Registered Engineers",
        excerpt:
            "Two graduates of the University of Batangas (UB) Bachelor of Science in Electrical Engineering (BSEE) program under the College of Engineering (CENG) successfully passed the September 2026 Licensure Examination.",
        imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80"
    }
];

// ============================================================
// ACADEMIC PROGRAMS
// ============================================================
interface AcademicCourse {
    code: string;
    title: string;
    units: number;
    college: string;
    description: string;
}

const ACADEMIC_COURSES: AcademicCourse[] = [
    { code: "THEO-101", title: "Systematic Theology I", units: 3, college: "College of Theology", description: "Comprehensive survey of Theology Proper, Trinity, Christology, and Biblical anthropology." },
    { code: "HERM-201", title: "Inductive Bible Study & Advanced Hermeneutics", units: 3, college: "College of Biblical Studies", description: "Exegetical principles, Greek tools, and literal-grammatical-historical interpretation." },
    { code: "PAST-301", title: "Pastoral Theology & Homiletics Practicum", units: 3, college: "College of Pastoral Leadership", description: "Expository preaching delivery, pulpit ministry clinic, and pastoral counseling." },
    { code: "CHED-102", title: "Christian Education & Youth Leadership", units: 3, college: "College of Education", description: "Pedagogy, curriculum development, and ministry leadership for children and youth." },
    { code: "MISS-401", title: "Pioneer Church Planting & Cross-Cultural Missions", units: 4, college: "School of Global Missions", description: "Indigenous church multiplication, demographic mapping, and frontier evangelism." },
    { code: "ETH-302", title: "Christian Ethics & 21st Century Apologetics", units: 3, college: "College of Theology", description: "Biblical ethics in contemporary culture, moral philosophy, and worldview defense." }
];

export default function SalesLandingPage({ onNavigate }: SalesLandingPageProps) {
    // Navigation helper
    const navigate = (page: string, fallbackUrl?: string) => {
        if (onNavigate) {
            onNavigate(page);
            return;
        }
        if (fallbackUrl) {
            window.location.href = fallbackUrl;
        }
    };

    // Admission Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalContextTitle, setModalContextTitle] = useState("Admissions Application");
    const [formData, setFormData] = useState<DemoFormData>(INITIAL_FORM_DATA);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Search query for programs
    const [programSearch, setProgramSearch] = useState("");
    const [activeCollegeTab, setActiveCollegeTab] = useState("All");

    // Achievers pagination state
    const [achieverPage, setAchieverPage] = useState(1);

    const openAdmissionsModal = (contextTitle?: string) => {
        setModalContextTitle(contextTitle || "Online Admission Application 2026-2027");
        setFormData(INITIAL_FORM_DATA);
        setSuccessMessage(false);
        setErrorMessage("");
        setShowModal(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setErrorMessage("");

        if (!formData.fullName.trim() || !formData.email.trim()) {
            setErrorMessage("Please provide your full name and valid email address.");
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                fullName: formData.fullName.trim(),
                email: formData.email.trim().toLowerCase(),
                churchName: formData.churchName.trim() || "Applicant (Direct Website)",
                phone: formData.phone.trim() || null,
                position: formData.position.trim() || "Online Admission Inquiry",
                message: formData.message.trim() || `University Online Admission Application: ${modalContextTitle}`
            };

            const response = await fetch(`${API_BASE_URL}/DemoRequests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data?.message || "Failed to submit application. Please try again.");
            }

            setSuccessMessage(true);
        } catch (err: unknown) {
            const e = err as Error;
            setErrorMessage(e.message || "Failed to submit application.");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredCourses = useMemo(() => {
        return ACADEMIC_COURSES.filter(c => {
            const matchesTab = activeCollegeTab === "All" || c.college === activeCollegeTab;
            const matchesQuery =
                !programSearch.trim() ||
                c.title.toLowerCase().includes(programSearch.toLowerCase()) ||
                c.code.toLowerCase().includes(programSearch.toLowerCase()) ||
                c.description.toLowerCase().includes(programSearch.toLowerCase());
            return matchesTab && matchesQuery;
        });
    }, [activeCollegeTab, programSearch]);

    return (
        <div className="ub-institutional-wrapper">
            {/* =========================================================
                TOP MAROON BRAND BAR & CAMPUS NAVIGATION (EXACT UB HEADER)
            ========================================================= */}
            <header className="ub-top-header">
                <div className="ub-header-container">
                    {/* LEFT: UNIVERSITY OF BATANGAS CREST & WORDMARK */}
                    <div className="ub-brand-identity" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                        <div className="ub-crest-seal">
                            <div className="crest-inner">
                                <GraduationCap size={22} className="crest-icon" />
                            </div>
                        </div>
                        <div className="ub-brand-titles">
                            <span className="brand-prefix">University of</span>
                            <span className="brand-main">Batangas</span>
                            <span className="brand-heritage">MBS • Theological Seminary Heritage</span>
                        </div>
                    </div>

                    {/* RIGHT: CAMPUSES, SDG & 80TH ANNIVERSARY BADGE */}
                    <nav className="ub-campus-nav">
                        <button type="button" className="ub-nav-link" onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}>
                            BATANGAS CITY
                        </button>
                        <button type="button" className="ub-nav-link" onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}>
                            LIPA CITY
                        </button>
                        <button type="button" className="ub-nav-link" onClick={() => openAdmissionsModal("SDG & Academic Inquiries")}>
                            SDG INITIATIVES
                        </button>

                        <div className="ub-anniversary-badge">
                            <span>80th Anniversary</span>
                        </div>

                        {/* PORTAL ACCESS SHORTCUTS */}
                        <div className="ub-header-action-group">
                            <button
                                type="button"
                                className="ub-btn-header-portal"
                                onClick={() => navigate("client-login", "/client-login")}
                                title="Access Student & Faculty Portal"
                            >
                                <User size={14} />
                                <span>Student Portal</span>
                            </button>

                            <button
                                type="button"
                                className="ub-btn-header-admin"
                                onClick={() => navigate("login", "/login")}
                                title="School Administrator & Faculty Access"
                            >
                                <ShieldCheck size={14} />
                                <span>Admin Portal</span>
                            </button>

                            <button
                                type="button"
                                className="ub-btn-header-apply"
                                onClick={() => openAdmissionsModal("Online Admissions 2026-2027")}
                            >
                                <span>Apply Now</span>
                            </button>
                        </div>
                    </nav>
                </div>
            </header>

            {/* =========================================================
                HERO SECTION: GRAND CAMPUS FAÇADE SHOWCASE (IMAGE 5)
            ========================================================= */}
            <section className="ub-hero-showcase">
                <div className="ub-hero-image-wrapper">
                    <img
                        src="/images/ub-campus.jpg"
                        alt="University of Batangas Campus Façade"
                        className="ub-campus-bg-img"
                    />
                    <div className="ub-hero-gradient-overlay" />
                </div>

                <div className="ub-hero-content-container">
                    <div className="ub-hero-glass-badge">
                        <Award size={15} color="#ffd60a" />
                        <span>AUTONOMOUS STATUS • PAASCU &amp; CHED ACCREDITED</span>
                    </div>

                    <h1 className="ub-hero-headline">
                        Excellence in Higher Education &amp; Servant Leadership
                    </h1>

                    <p className="ub-hero-tagline">
                        Rooted in academic rigor, ethical scholarship, and national transformation since 1946. Nurturing globally competent graduates equipped to serve God and society.
                    </p>

                    <div className="ub-hero-buttons">
                        <button
                            type="button"
                            className="ub-btn-gold"
                            onClick={() => openAdmissionsModal("Undergraduate & Seminary Admission 2026-2027")}
                        >
                            <span>Apply for Admission</span>
                            <ArrowRight size={16} />
                        </button>

                        <button
                            type="button"
                            className="ub-btn-outline-white"
                            onClick={() => {
                                const el = document.getElementById("ub-portals-section");
                                el?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            <span>Access University Portals</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="ub-quick-stats-strip">
                        <div className="quick-stat">
                            <strong>1946</strong>
                            <span>Year Founded</span>
                        </div>
                        <div className="quick-stat-divider" />
                        <div className="quick-stat">
                            <strong>100%</strong>
                            <span>Licensure Passing Rates</span>
                        </div>
                        <div className="quick-stat-divider" />
                        <div className="quick-stat">
                            <strong>2 Campuses</strong>
                            <span>Batangas City &amp; Lipa City</span>
                        </div>
                        <div className="quick-stat-divider" />
                        <div className="quick-stat">
                            <strong>PAASCU</strong>
                            <span>Level III &amp; IV Accredited</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                UB PORTALS SECTION (IMAGE 1 — EXACT UB PORTALS REPLICA)
            ========================================================= */}
            <section id="ub-portals-section" className="ub-portals-section">
                <div className="ub-section-container">
                    <h2 className="ub-section-title">UB PORTALS</h2>

                    <div className="ub-portals-grid">
                        {/* 1. ONLINE ADMISSION */}
                        <div
                            className="ub-portal-card"
                            onClick={() => openAdmissionsModal("Online Admission Portal")}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="ub-portal-icon-wrapper">
                                <div className="ub-icon-admission">
                                    <div className="doc-sheet">
                                        <div className="doc-line" />
                                        <div className="doc-line short" />
                                        <div className="doc-line" />
                                    </div>
                                </div>
                            </div>
                            <span className="ub-portal-name">Online Admission</span>
                        </div>

                        {/* 2. ONLINE ENROLLMENT */}
                        <div
                            className="ub-portal-card"
                            onClick={() => navigate("client-login", "/client-login")}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="ub-portal-icon-wrapper">
                                <div className="ub-icon-enrollment">
                                    <div className="person-circle" />
                                    <div className="mail-badge" />
                                </div>
                            </div>
                            <span className="ub-portal-name">Online Enrollment</span>
                        </div>

                        {/* 3. ONLINE PAYMENT */}
                        <div
                            className="ub-portal-card"
                            onClick={() => navigate("client-payment", "/client-payment")}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="ub-portal-icon-wrapper">
                                <div className="ub-icon-payment">
                                    <CreditCard size={32} strokeWidth={2} />
                                </div>
                            </div>
                            <span className="ub-portal-name">Online Payment</span>
                        </div>

                        {/* 4. UB MAIL / MBS MAIL */}
                        <div
                            className="ub-portal-card"
                            onClick={() => navigate("contact", "/contact")}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="ub-portal-icon-wrapper">
                                <div className="ub-icon-mail">
                                    <Mail size={32} strokeWidth={2} />
                                    <div className="mail-speed-lines" />
                                </div>
                            </div>
                            <span className="ub-portal-name">UB Mail</span>
                        </div>

                        {/* 5. MY UB / MY MBS */}
                        <div
                            className="ub-portal-card"
                            onClick={() => navigate("client-login", "/client-login")}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="ub-portal-icon-wrapper">
                                <div className="ub-icon-myub">
                                    <div className="open-folder-top" />
                                    <div className="folder-doc">
                                        <div className="f-line" />
                                        <div className="f-line" />
                                    </div>
                                </div>
                            </div>
                            <span className="ub-portal-name">My UB</span>
                        </div>

                        {/* 6. UBIAN LMS / CANVAS HUB */}
                        <div
                            className="ub-portal-card"
                            onClick={() => navigate("learning", "/cms/learning")}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="ub-portal-icon-wrapper">
                                <div className="ub-icon-lms">
                                    <div className="lms-hub-dot dot-1" />
                                    <div className="lms-hub-dot dot-2" />
                                    <div className="lms-hub-dot dot-3" />
                                    <div className="lms-hub-dot dot-4" />
                                    <div className="lms-hub-dot dot-5" />
                                    <div className="lms-hub-dot dot-6" />
                                    <div className="lms-hub-dot dot-7" />
                                    <div className="lms-hub-dot dot-8" />
                                </div>
                            </div>
                            <span className="ub-portal-name">UBian LMS</span>
                        </div>

                        {/* 7. EBRAHMAN / DIGITAL RECORDS */}
                        <div
                            className="ub-portal-card"
                            onClick={() => navigate("client-portal", "/client-portal")}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="ub-portal-icon-wrapper">
                                <div className="ub-icon-ebrahman">
                                    <div className="touch-finger" />
                                </div>
                            </div>
                            <span className="ub-portal-name">eBrahman</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                NEWS & FEATURES SECTION (IMAGE 3 — EXACT UB REPLICA)
            ========================================================= */}
            <section className="ub-news-section">
                <div className="ub-section-container">
                    <h2 className="ub-section-title">NEWS &amp; FEATURES</h2>

                    <div className="ub-news-grid">
                        {NEWS_DATA.map(item => (
                            <article key={item.id} className="ub-news-card">
                                <div className="ub-news-img-box">
                                    <img src={item.imageUrl} alt={item.title} className="ub-news-img" />
                                    <div className="ub-news-brand-banner">
                                        <div className="brand-crest-mini">
                                            <GraduationCap size={14} color="#ffd60a" />
                                        </div>
                                        <span>University of Batangas</span>
                                    </div>
                                    <div className="ub-news-category-tag">
                                        <span>{item.category}</span>
                                    </div>
                                </div>

                                <div className="ub-news-body">
                                    <h3 className="ub-news-card-title">{item.title}</h3>
                                    <time className="ub-news-date">{item.date}</time>
                                    <p className="ub-news-excerpt">{item.excerpt}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* =========================================================
                ACADEMIC ACHIEVEMENTS & LICENSURE PASSERS (IMAGE 2)
            ========================================================= */}
            <section className="ub-achievers-section">
                <div className="ub-section-container">
                    <div className="achievers-header-row">
                        <div>
                            <span className="achievers-sub">COLLEGE OF EXCELLENCE • BOARD EXAMINATION HONORS</span>
                            <h2 className="achievers-title">Academic Triumphs &amp; Licensure Exam Successes</h2>
                        </div>
                        <div className="achievers-pass-badge">
                            <Award size={18} color="#ffd60a" />
                            <span>100% BOARD PASSING RATE</span>
                        </div>
                    </div>

                    <div className="ub-achievers-grid">
                        {ACHIEVERS_DATA.map(item => (
                            <div key={item.id} className="ub-achiever-card">
                                <div className="achiever-photo-box">
                                    <img src={item.imageUrl} alt={item.title} className="achiever-img" />
                                    <div className="achiever-card-brand-bar">
                                        <div className="crest-seal-mini">
                                            <GraduationCap size={13} color="#ffffff" />
                                        </div>
                                        <span>University of Batangas</span>
                                    </div>
                                    <div className="achiever-banner-strip">
                                        <p>{item.bannerTitle}</p>
                                    </div>
                                    {item.passRateBadge && (
                                        <span className="achiever-honor-pill">{item.passRateBadge}</span>
                                    )}
                                </div>

                                <div className="achiever-card-body">
                                    <h3 className="achiever-heading">{item.title}</h3>
                                    <time className="achiever-date">{item.date}</time>
                                    <p className="achiever-snippet">{item.excerpt}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* PAGINATION (EXACT MATCH TO UB PREVIOUS / 1 2 3 ... 149 / NEXT) */}
                    <div className="ub-pagination-bar">
                        <button
                            type="button"
                            className="ub-page-nav-btn"
                            disabled={achieverPage === 1}
                            onClick={() => setAchieverPage(p => Math.max(1, p - 1))}
                        >
                            &laquo; Previous
                        </button>
                        <button
                            type="button"
                            className={`ub-page-num ${achieverPage === 1 ? "active" : ""}`}
                            onClick={() => setAchieverPage(1)}
                        >
                            1
                        </button>
                        <button
                            type="button"
                            className={`ub-page-num ${achieverPage === 2 ? "active" : ""}`}
                            onClick={() => setAchieverPage(2)}
                        >
                            2
                        </button>
                        <button
                            type="button"
                            className={`ub-page-num ${achieverPage === 3 ? "active" : ""}`}
                            onClick={() => setAchieverPage(3)}
                        >
                            3
                        </button>
                        <span className="ub-page-dots">...</span>
                        <button
                            type="button"
                            className={`ub-page-num ${achieverPage === 149 ? "active" : ""}`}
                            onClick={() => setAchieverPage(149)}
                        >
                            149
                        </button>
                        <button
                            type="button"
                            className="ub-page-nav-btn"
                            onClick={() => setAchieverPage(p => p + 1)}
                        >
                            Next &raquo;
                        </button>
                    </div>
                </div>
            </section>

            {/* =========================================================
                ACADEMIC COLLEGES & CURRICULUM CATALOG
            ========================================================= */}
            <section className="ub-colleges-section">
                <div className="ub-section-container">
                    <div className="colleges-header">
                        <span className="section-eyebrow">ACADEMIC EXCELLENCE • DEGREE PROGRAMS</span>
                        <h2 className="ub-section-title" style={{ textAlign: "left", marginBottom: "8px" }}>
                            Academic Colleges &amp; Program Offerings
                        </h2>
                        <p className="section-desc">
                            Explore rigorous, CHED-recognized undergraduate degrees, graduate diplomas, and theological credentials designed for modern leadership.
                        </p>
                    </div>

                    {/* FILTER TABS & SEARCH */}
                    <div className="courses-filter-bar">
                        <div className="college-tabs-row">
                            {["All", "College of Theology", "College of Biblical Studies", "College of Pastoral Leadership", "College of Education", "School of Global Missions"].map(tab => (
                                <button
                                    key={tab}
                                    type="button"
                                    className={`college-tab-btn ${activeCollegeTab === tab ? "active" : ""}`}
                                    onClick={() => setActiveCollegeTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="course-search-field">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search course title, code (e.g. THEO-101), or subject..."
                                value={programSearch}
                                onChange={e => setProgramSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="courses-grid">
                        {filteredCourses.map(course => (
                            <div key={course.code} className="course-card">
                                <div className="course-card-top">
                                    <span className="course-code-pill">{course.code}</span>
                                    <span className="course-units-badge">{course.units} Units</span>
                                </div>
                                <h4 className="course-title">{course.title}</h4>
                                <span className="course-college-name">{course.college}</span>
                                <p className="course-desc">{course.description}</p>
                                <button
                                    type="button"
                                    className="btn-course-inquire"
                                    onClick={() => openAdmissionsModal(`Course Inquiry: ${course.code} - ${course.title}`)}
                                >
                                    <span>Inquire Syllabus</span>
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =========================================================
                CAMPUS LOCATIONS & CONTACT STRIP
            ========================================================= */}
            <section className="ub-campuses-strip">
                <div className="ub-section-container">
                    <div className="campus-strip-grid">
                        <div className="campus-info-card">
                            <div className="campus-icon-box">
                                <Building2 size={24} color="#ffd60a" />
                            </div>
                            <div>
                                <h4>BATANGAS CITY MAIN CAMPUS</h4>
                                <p>M.H. Del Pilar Street, Batangas City 4200, Philippines</p>
                                <span className="campus-tel">Tel: (043) 723-1446 • info@ub.edu.ph</span>
                            </div>
                        </div>

                        <div className="campus-info-card">
                            <div className="campus-icon-box">
                                <Building2 size={24} color="#ffd60a" />
                            </div>
                            <div>
                                <h4>LIPA CITY CAMPUS</h4>
                                <p>Pres. J.P. Laurel Highway, Marawoy, Lipa City, Batangas 4217</p>
                                <span className="campus-tel">Tel: (043) 756-1184 • lipa@ub.edu.ph</span>
                            </div>
                        </div>

                        <div className="campus-info-card">
                            <div className="campus-icon-box">
                                <Compass size={24} color="#ffd60a" />
                            </div>
                            <div>
                                <h4>REGIONAL &amp; MODULAR COHORTS</h4>
                                <p>Central Luzon, Visayas, Mindanao &amp; Frontier Learning Centers</p>
                                <span className="campus-tel">Online &amp; Modular Timetable Available</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                OFFICIAL UNIVERSITY FOOTER (MAROON & GOLD INSTITUTIONAL)
            ========================================================= */}
            <footer className="ub-footer">
                <div className="ub-footer-container">
                    <div className="ub-footer-grid">
                        <div className="footer-col brand-col">
                            <div className="footer-brand">
                                <div className="ub-crest-seal footer-crest">
                                    <GraduationCap size={20} color="#ffd60a" />
                                </div>
                                <div className="footer-brand-title">
                                    <strong>UNIVERSITY OF BATANGAS</strong>
                                    <span>Founded 1946 • Western Philippine Colleges Heritage</span>
                                </div>
                            </div>
                            <p className="footer-about-text">
                                The University of Batangas is committed to the pursuit of academic excellence, spiritual character development, research capability, and social service through its collegiate and theological education programs.
                            </p>
                            <div className="footer-accreditation-badges">
                                <span className="acc-badge">PAASCU Accredited</span>
                                <span className="acc-badge">ISO 9001:2015</span>
                                <span className="acc-badge">CHED Recognized</span>
                            </div>
                        </div>

                        <div className="footer-col">
                            <h4>QUICK PORTAL ACCESS</h4>
                            <ul className="footer-links">
                                <li>
                                    <button type="button" onClick={() => openAdmissionsModal("Online Admission")}>
                                        Online Admissions Desk
                                    </button>
                                </li>
                                <li>
                                    <button type="button" onClick={() => navigate("client-login", "/client-login")}>
                                        My UB / Student Portal
                                    </button>
                                </li>
                                <li>
                                    <button type="button" onClick={() => navigate("client-payment", "/client-payment")}>
                                        Online Payment System
                                    </button>
                                </li>
                                <li>
                                    <button type="button" onClick={() => navigate("learning", "/cms/learning")}>
                                        UBian LMS &amp; E-Learning
                                    </button>
                                </li>
                                <li>
                                    <button type="button" onClick={() => navigate("login", "/login")}>
                                        Staff &amp; Faculty Admin Portal
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div className="footer-col">
                            <h4>ACADEMIC COLLEGES</h4>
                            <ul className="footer-links">
                                <li><span>College of Theology &amp; Biblical Studies</span></li>
                                <li><span>College of Pastoral Leadership &amp; Homiletics</span></li>
                                <li><span>College of Education, Arts &amp; Sciences</span></li>
                                <li><span>College of Business &amp; Accountancy</span></li>
                                <li><span>Graduate School of Ministry &amp; Leadership</span></li>
                            </ul>
                        </div>

                        <div className="footer-col contact-col">
                            <h4>CONTACT &amp; INQUIRIES</h4>
                            <p className="footer-contact-p">
                                Office of the University Registrar &amp; Admissions<br />
                                <strong>Direct:</strong> (043) 723-1446 loc. 201<br />
                                <strong>Admissions Mobile:</strong> +63 917 123 4567<br />
                                <strong>Email:</strong> admissions@ub.edu.ph
                            </p>
                            <button
                                type="button"
                                className="ub-footer-inquire-btn"
                                onClick={() => openAdmissionsModal("General University Inquiry")}
                            >
                                <Mail size={14} />
                                <span>Send Inquiry Message</span>
                            </button>
                        </div>
                    </div>

                    <div className="ub-footer-bottom-bar">
                        <p>&copy; {new Date().getFullYear()} University of Batangas. All Rights Reserved. Mobile Bible School System.</p>
                        <div className="footer-bottom-links">
                            <span>Privacy Policy</span>
                            <span>•</span>
                            <span>Terms of Service</span>
                            <span>•</span>
                            <span>Student Handbook</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* =========================================================
                OFFICIAL ONLINE ADMISSION MODAL SHEET
            ========================================================= */}
            {showModal && (
                <div
                    className="ub-modal-backdrop"
                    onMouseDown={e => {
                        if (e.target === e.currentTarget && !submitting) setShowModal(false);
                    }}
                >
                    <div className="ub-modal-card" role="dialog" aria-modal="true">
                        <div className="ub-modal-header">
                            <div className="modal-header-titles">
                                <div className="modal-crest-row">
                                    <div className="ub-crest-seal modal-crest">
                                        <GraduationCap size={16} color="#ffd60a" />
                                    </div>
                                    <span>UNIVERSITY OF BATANGAS • ADMISSIONS DESK</span>
                                </div>
                                <h3>{modalContextTitle}</h3>
                            </div>
                            <button
                                type="button"
                                className="ub-btn-modal-close"
                                onClick={() => setShowModal(false)}
                                disabled={submitting}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {successMessage ? (
                            <div className="ub-modal-success-state">
                                <CheckCircle2 size={54} color="#10b981" />
                                <h4>Application Submitted Successfully!</h4>
                                <p>
                                    Thank you for applying to the University of Batangas. Your admission intake has been received directly by the Admissions &amp; Registrar office. An admissions counselor will reach out to you shortly with next clearance steps.
                                </p>
                                <button
                                    type="button"
                                    className="ub-btn-modal-done"
                                    onClick={() => setShowModal(false)}
                                >
                                    Close Window
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleFormSubmit} className="ub-modal-form">
                                {errorMessage && (
                                    <div className="ub-modal-error-alert">
                                        {errorMessage}
                                    </div>
                                )}

                                <div className="ub-form-group">
                                    <label>APPLICANT FULL NAME *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Maria Santos Dela Cruz"
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="ub-form-row">
                                    <div className="ub-form-group">
                                        <label>EMAIL ADDRESS *</label>
                                        <input
                                            type="email"
                                            placeholder="applicant@example.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="ub-form-group">
                                        <label>CONTACT PHONE NUMBER *</label>
                                        <input
                                            type="tel"
                                            placeholder="+63 9XX XXX XXXX"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="ub-form-row">
                                    <div className="ub-form-group">
                                        <label>PREVIOUS SCHOOL / CHURCH / AFFILIATION</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Batangas National High School / Independent"
                                            value={formData.churchName}
                                            onChange={e => setFormData({ ...formData, churchName: e.target.value })}
                                        />
                                    </div>

                                    <div className="ub-form-group">
                                        <label>DEGREE PROGRAM OF CHOICE</label>
                                        <select
                                            value={formData.position}
                                            onChange={e => setFormData({ ...formData, position: e.target.value })}
                                        >
                                            <option value="">Select degree program</option>
                                            <option value="BS Psychology (CEAS)">BS Psychology (CEAS)</option>
                                            <option value="BS Business Administration (HRDM)">BS Business Administration (HRDM)</option>
                                            <option value="BS Electrical Engineering (CENG)">BS Electrical Engineering (CENG)</option>
                                            <option value="Bachelor of Theology (BTh)">Bachelor of Theology (BTh)</option>
                                            <option value="Diploma in Pastoral Ministry (DPS)">Diploma in Pastoral Ministry (DPS)</option>
                                            <option value="Certificate in Biblical Studies (CBS)">Certificate in Biblical Studies (CBS)</option>
                                            <option value="Master of Ministry (MMIN)">Master of Ministry (MMIN)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="ub-form-group">
                                    <label>QUESTIONS, CREDENTIALS OR ADMISSIONS MESSAGE</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Please provide any questions regarding tuition, Form 137 / TOR clearance, or entrance evaluation..."
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>

                                <div className="ub-modal-footer">
                                    <button
                                        type="button"
                                        className="ub-btn-modal-cancel"
                                        onClick={() => setShowModal(false)}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="ub-btn-modal-submit"
                                        disabled={submitting}
                                    >
                                        {submitting ? "Submitting Application..." : "Submit Online Application"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
