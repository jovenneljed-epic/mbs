import React, { useEffect, useState } from "react";
import "./SalesLandingPage.css";
import { API_BASE_URL } from "../config";
import {
    getLandingPageContent,
    saveLandingPageContent,
    LANDING_CONTENT_EVENT,
    type LandingPageContent,
} from "../services/landingPageContent";
import { PromoVideoPlayer } from "../components/PromoVideoPlayer";
import { getVideoMediaUrl, saveVideoMedia, VIDEO_MEDIA_EVENT } from "../services/videoMediaStorage";
import {
    BookOpen,
    GraduationCap,
    Calendar,
    MapPin,
    Clock,
    ChevronRight,
    ArrowRight,
    Search,
    User,
    CheckCircle2,
    X,
    ShieldCheck,
    Sparkles,
    Smartphone,
    Send,
    Download,
    Building2,
    Compass,
    Scroll
} from "lucide-react";

interface SalesLandingPageProps {
    onNavigate?: (page: string) => void;
}

interface ProgramModule {
    id: string;
    code: string;
    title: string;
    units: number;
    category: "foundations" | "theology" | "ministry" | "missions";
    description: string;
    instructor: string;
    schedule: string;
}

interface ModularSlide {
    id: string;
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    hostLocation: string;
    date: string;
    units: string;
    badge: string;
    tagline: string;
    themeGradient: string;
    primaryCta: string;
    curriculumHighlight: string[];
    videoUrl?: string;
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

// =========================================================
// APPLE-STYLE FEATURED FIELD MODULES (CAROUSEL)
// =========================================================
const MODULAR_SLIDES: ModularSlide[] = [
    {
        id: "module-1",
        eyebrow: "FIELD INTENSIVE • ADVANCED HERMENEUTICS",
        title: "Inductive Bible Study",
        highlight: "& Expository Exegesis",
        description:
            "Master the principles of biblical interpretation without relocating. We bring veteran theological faculty directly to your local church for a 3-day intensive on Greek tools, historical contexts, and expository sermon prep.",
        hostLocation: "Central Host Church • Metro Manila Hub",
        date: "November 14–16, 2026",
        units: "3 Academic Units",
        badge: "FALL COHORT",
        tagline: "Uncompromising biblical scholarship. Grounded in the local church.",
        themeGradient: "linear-gradient(135deg, #0a0a0c 0%, #17181c 50%, #20222a 100%)",
        primaryCta: "Apply for Hermeneutics Cohort",
        curriculumHighlight: [
            "Literal-Grammatical-Historical Method",
            "Syntactical Diagramming & Word Studies",
            "Sermon Outlining from Original Manuscripts"
        ]
    },
    {
        id: "module-2",
        eyebrow: "CORE THEOLOGY • SYSTEMATIC DOCTRINE",
        title: "Theology Proper &",
        highlight: "The Doctrines of Grace",
        description:
            "A foundational survey of Systematic Theology tailored for bi-vocational pastors and church leaders. Explore the character of God, Christology, Pneumatology, and the sovereign plan of redemption.",
        hostLocation: "North Luzon Regional Center • Baguio Hub",
        date: "December 04–06, 2026",
        units: "3 Academic Units",
        badge: "WINTER COHORT",
        tagline: "Sound doctrine that fuels passionate discipleship.",
        themeGradient: "linear-gradient(135deg, #050b14 0%, #0f1c2e 50%, #152840 100%)",
        primaryCta: "Enroll in Systematic Theology",
        curriculumHighlight: [
            "Trinity, Attributes & Divine Decrees",
            "Biblical Anthropology & The Fall",
            "Soteriology: Justification & Sanctification"
        ]
    },
    {
        id: "module-3",
        eyebrow: "MINISTRY PRACTICUM • HOMILETICS LAB",
        title: "Expository Preaching",
        highlight: "& Pastoral Care Lab",
        description:
            "Step into an interactive preaching clinic. Deliver trial messages before mentor pastors, receive constructive exegetical feedback, and learn biblical counseling techniques for church care.",
        hostLocation: "Visayas Regional Center • Cebu Hub",
        date: "January 15–17, 2027",
        units: "3 Academic Units",
        badge: "SPRING 2027",
        tagline: "Transforming scripture insights into life-changing proclamation.",
        themeGradient: "linear-gradient(135deg, #0e0717 0%, #1b102c 50%, #291845 100%)",
        primaryCta: "Register for Preaching Lab",
        curriculumHighlight: [
            "Manuscript Preparation & Big Idea Formulation",
            "Pastoral Counseling for Bereavement & Crisis",
            "Biblical Leadership & Elder Dynamics"
        ]
    },
    {
        id: "module-4",
        eyebrow: "FRONTIER MISSIONS • CHURCH EXPANSION",
        title: "Pioneer Church Planting",
        highlight: "& Cross-Cultural Evangelism",
        description:
            "Designed for evangelists and frontier missionaries. Learn strategy, demographic mapping, disciple-making movements, and multiplying indigenous church plants in unreached rural communities.",
        hostLocation: "Mindanao Frontier Campus • Davao Hub",
        date: "February 19–21, 2027",
        units: "4 Academic Units",
        badge: "MISSION FRONTIER",
        tagline: "Equipping disciples to take the Gospel to the unreached ends.",
        themeGradient: "linear-gradient(135deg, #03140d 0%, #08291a 50%, #0f402a 100%)",
        primaryCta: "Join Church Planting Practicum",
        curriculumHighlight: [
            "Indigenous Church Planting Methodologies",
            "Community Engagement & Contextual Apologetics",
            "Multiplying House Churches & Field Leadership"
        ]
    }
];

// =========================================================
// ACADEMIC CURRICULUM PROGRAMS (APPLE BENTO & TABS)
// =========================================================
const CURRICULUM_PROGRAMS: ProgramModule[] = [
    {
        id: "p-1",
        code: "BIB-101",
        title: "Old Testament Survey & Covenant History",
        units: 3,
        category: "foundations",
        description: "Comprehensive historical, theological, and literary overview of Genesis through Malachi with focus on redemptive covenants.",
        instructor: "Dr. Jonathan Reyes, Th.D.",
        schedule: "Modular Intensive (18 Class Hours + Practicum)"
    },
    {
        id: "p-2",
        code: "BIB-102",
        title: "New Testament Literature & Apostolic Era",
        units: 3,
        category: "foundations",
        description: "In-depth study of the Gospels, Acts, Epistles, and Revelation exploring the birth of the Church and Apostolic theology.",
        instructor: "Prof. Sarah Hernandez, M.Div.",
        schedule: "Modular Intensive (18 Class Hours + Practicum)"
    },
    {
        id: "p-3",
        code: "THEO-201",
        title: "Bibliology & Principles of Interpretation",
        units: 3,
        category: "theology",
        description: "The inspiration, inerrancy, and canon of Scripture paired with practical hermeneutical tools for modern disciples.",
        instructor: "Rev. Daniel Santos, Th.M.",
        schedule: "Weekend Modular (Fri-Sun 18 Hours)"
    },
    {
        id: "p-4",
        code: "THEO-202",
        title: "Systematic Theology: God, Christ & Holy Spirit",
        units: 3,
        category: "theology",
        description: "Examines the Triune God, the person and work of Jesus Christ, and the gifts and regenerating ministry of the Holy Spirit.",
        instructor: "Dr. Samuel Vance, Ph.D.",
        schedule: "Weekend Modular (Fri-Sun 18 Hours)"
    },
    {
        id: "p-5",
        code: "MIN-301",
        title: "Pastoral Leadership & Church Administration",
        units: 3,
        category: "ministry",
        description: "Biblical servant leadership, church bylaws, ethical ministry finance, volunteer mobilization, and counseling.",
        instructor: "Bishop Marcus Dela Cruz",
        schedule: "Field Practicum + Mentorship"
    },
    {
        id: "p-6",
        code: "MIS-401",
        title: "Frontier Missions & Cross-Cultural Evangelism",
        units: 3,
        category: "missions",
        description: "Equipping workers to plant indigenous, self-sustaining congregations in rural, urban-poor, and unreached tribal territories.",
        instructor: "Rev. Matthew Ocampo",
        schedule: "Field Immersion (5 Days on Location)"
    }
];

export const SalesLandingPage: React.FC<SalesLandingPageProps> = ({ onNavigate }) => {
    const [landingContent, setLandingContent] = useState<LandingPageContent>(getLandingPageContent);

    useEffect(() => {
        const handleContentUpdate = () => {
            setLandingContent(getLandingPageContent());
        };
        window.addEventListener(LANDING_CONTENT_EVENT, handleContentUpdate);
        return () => window.removeEventListener(LANDING_CONTENT_EVENT, handleContentUpdate);
    }, []);

    const isAdminLoggedIn = Boolean(localStorage.getItem("token") || localStorage.getItem("accessToken"));

    const handleQuickUploadFromReel = async (sceneIndex: number, file: File) => {
        const scene = landingContent.promoVideo.scenes[sceneIndex];
        if (!scene) return;
        const key = `scene_media_${scene.id || sceneIndex}`;

        try {
            if (file.type.startsWith("video/")) {
                const res = await saveVideoMedia(key, file);
                const updated = { ...landingContent };
                const scenes = [...updated.promoVideo.scenes];
                scenes[sceneIndex] = {
                    ...scenes[sceneIndex],
                    mediaType: "video",
                    videoUrl: res.url,
                    videoName: res.name,
                    videoSize: res.size,
                };
                updated.promoVideo = { ...updated.promoVideo, scenes };
                saveLandingPageContent(updated);
                setLandingContent(updated);
            } else {
                const reader = new FileReader();
                reader.onload = async (uploadEvt) => {
                    const dataUrl = uploadEvt.target?.result as string;
                    await saveVideoMedia(key, file);
                    const updated = { ...landingContent };
                    const scenes = [...updated.promoVideo.scenes];
                    scenes[sceneIndex] = {
                        ...scenes[sceneIndex],
                        mediaType: "image",
                        imageUrl: dataUrl,
                        imageName: file.name,
                        videoUrl: undefined,
                        videoName: undefined,
                        videoSize: undefined,
                    };
                    updated.promoVideo = { ...updated.promoVideo, scenes };
                    saveLandingPageContent(updated);
                    setLandingContent(updated);
                };
                reader.readAsDataURL(file);
            }
        } catch (err) {
            console.error("Error updating scene media:", err);
        }
    };

    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeFlyout, setActiveFlyout] = useState<string | null>(null);

    // Admissions / Host Modal
    const [showModal, setShowModal] = useState(false);
    const [modalContextTitle, setModalContextTitle] = useState("Admissions & Enrollment Application");
    const [formData, setFormData] = useState<DemoFormData>(INITIAL_FORM_DATA);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [slideVideoUrls, setSlideVideoUrls] = useState<Record<string, string>>({});

    const activeSlides: ModularSlide[] = MODULAR_SLIDES.map((slide, idx) => {
        const mod = landingContent.modules[idx];
        if (!mod) return slide;
        return {
            ...slide,
            eyebrow: mod.eyebrow || slide.eyebrow,
            title: mod.title || slide.title,
            highlight: mod.highlight || slide.highlight,
            description: mod.description || slide.description,
            hostLocation: mod.hostLocation || slide.hostLocation,
            date: mod.date || slide.date,
            units: mod.units || slide.units,
            badge: mod.badge || slide.badge,
            tagline: mod.tagline || slide.tagline,
            primaryCta: mod.primaryCta || slide.primaryCta,
            themeGradient: mod.themeGradient || slide.themeGradient,
            curriculumHighlight: Array.isArray(mod.curriculumHighlight) && mod.curriculumHighlight.length > 0
                ? mod.curriculumHighlight
                : slide.curriculumHighlight,
            videoUrl: mod.videoUrl,
        };
    });

    // Load stored slide videos from IndexedDB and listen for updates
    useEffect(() => {
        let isMounted = true;
        const loadSlideVideos = async () => {
            const urls: Record<string, string> = {};
            for (const slide of activeSlides) {
                if (slide.videoUrl) {
                    urls[slide.id] = slide.videoUrl;
                } else {
                    const storedUrl = await getVideoMediaUrl(`slide_${slide.id}`);
                    if (storedUrl) {
                        urls[slide.id] = storedUrl;
                    }
                }
            }
            if (isMounted) {
                setSlideVideoUrls(urls);
            }
        };

        loadSlideVideos();

        const handleMediaUpdate = (e: any) => {
            if (e.detail?.key?.startsWith("slide_")) {
                const slideId = e.detail.key.replace("slide_", "");
                setSlideVideoUrls(prev => ({
                    ...prev,
                    [slideId]: e.detail.url,
                }));
            }
        };

        window.addEventListener(VIDEO_MEDIA_EVENT as any, handleMediaUpdate);
        return () => {
            isMounted = false;
            window.removeEventListener(VIDEO_MEDIA_EVENT as any, handleMediaUpdate);
        };
    }, [activeSlides]);



    const navigate = (page: string, fallback: string) => {
        setMobileMenuOpen(false);
        setActiveFlyout(null);
        if (onNavigate) {
            onNavigate(page);
            return;
        }
        window.location.href = fallback;
    };

    const openAdmissionsModal = (contextTitle?: string) => {
        setModalContextTitle(contextTitle || "Admissions & Enrollment Application");
        setFormData({
            ...INITIAL_FORM_DATA,
            message: contextTitle ? `Application / Inquiry for: ${contextTitle}` : "",
        });
        setSuccessMessage(false);
        setErrorMessage("");
        setShowModal(true);
    };

    const closeModal = () => {
        if (submitting) return;
        setShowModal(false);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setErrorMessage("");

        if (!formData.fullName.trim() || !formData.email.trim() || !formData.churchName.trim()) {
            setErrorMessage("Please provide your full name, email address, and church/ministry affiliation.");
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                fullName: formData.fullName.trim(),
                email: formData.email.trim().toLowerCase(),
                churchName: formData.churchName.trim(),
                phone: formData.phone.trim() || null,
                position: formData.position.trim() || "Student / Ministry Applicant",
                message: formData.message.trim() || `Mobile Bible School Application: ${modalContextTitle}`,
            };

            const response = await fetch(`${API_BASE_URL}/DemoRequests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
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

    const filteredCurriculum = CURRICULUM_PROGRAMS.filter((p) => {
        const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
        const matchesQuery =
            !searchQuery.trim() ||
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.instructor.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesQuery;
    });

    return (
        <div className="apple-page-wrapper">
            {/* =========================================================
                APPLE RIBBON BANNER
            ========================================================= */}
            <div className="apple-ribbon">
                <div className="apple-ribbon-content">
                    <span>
                        {landingContent.ribbonText}
                    </span>
                    <button
                        type="button"
                        className="apple-ribbon-link"
                        onClick={() => openAdmissionsModal("Host a Mobile Cohort Inquiry")}
                    >
                        <span>{landingContent.ribbonCta}</span>
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            {/* =========================================================
                APPLE GLOBAL FROSTED GLASS NAVBAR & FLYOUT MEGA MENU
            ========================================================= */}
            <header className="apple-navbar">
                <div className="apple-nav-inner">
                    {/* Apple-style Brand Wordmark */}
                    <button
                        type="button"
                        className="apple-brand"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    >
                        <div className="apple-bible-mark">
                            <BookOpen size={18} strokeWidth={2.4} />
                        </div>
                        <div className="apple-brand-text">
                            <span className="brand-primary">{landingContent.schoolName.toUpperCase()}</span>
                            <span className="brand-badge">{landingContent.brandTagline.toUpperCase()}</span>
                        </div>
                    </button>

                    {/* Apple Global Navigation Links with Hover Flyouts */}
                    <nav className="apple-nav-links">
                        <div
                            className="apple-nav-item"
                            onMouseEnter={() => setActiveFlyout("programs")}
                            onMouseLeave={() => setActiveFlyout(null)}
                        >
                            <button type="button" className={`nav-link ${activeFlyout === "programs" ? "active" : ""}`}>
                                Programs
                            </button>

                            {/* Apple-style Programs Mega Flyout */}
                            {activeFlyout === "programs" && (
                                <div className="apple-flyout-panel">
                                    <div className="flyout-grid">
                                        <div className="flyout-col">
                                            <span className="flyout-heading">ACADEMIC TRACKS</span>
                                            <a href="#curriculum" onClick={() => setActiveFlyout(null)}>
                                                <strong>Certificate in Christian Foundations</strong>
                                                <span>1 Year • 24 Units • Essential Hermeneutics &amp; Bible Survey</span>
                                            </a>
                                            <a href="#curriculum" onClick={() => setActiveFlyout(null)}>
                                                <strong>Diploma in Pastoral Ministry</strong>
                                                <span>2 Years • 48 Units • Exegesis, Preaching &amp; Pastoral Care</span>
                                            </a>
                                            <a href="#curriculum" onClick={() => setActiveFlyout(null)}>
                                                <strong>Bachelor of Biblical Leadership</strong>
                                                <span>3 Years • 96 Units • Comprehensive Theology &amp; Greek</span>
                                            </a>
                                        </div>

                                        <div className="flyout-col">
                                            <span className="flyout-heading">MOBILE LEARNING MODEL</span>
                                            <a href="#modular-model" onClick={() => setActiveFlyout(null)}>
                                                <strong>Weekend Modular Intensives</strong>
                                                <span>Attend Friday evening to Sunday afternoon once a month</span>
                                            </a>
                                            <a href="#modular-model" onClick={() => setActiveFlyout(null)}>
                                                <strong>Offline Mobile App Study</strong>
                                                <span>Audio lectures, digital syllabi, and Greek word study offline</span>
                                            </a>
                                            <a href="#modular-model" onClick={() => setActiveFlyout(null)}>
                                                <strong>In-Church Mentorship Practicum</strong>
                                                <span>Immediate ministry deployment under local senior pastor</span>
                                            </a>
                                        </div>

                                        <div className="flyout-col card-col">
                                            <div className="flyout-feature-card">
                                                <div className="feature-icon">
                                                    <Compass size={24} />
                                                </div>
                                                <h4>Ready to Answer the Call?</h4>
                                                <p>
                                                    Download our comprehensive 2026–2027 Prospectus with full course
                                                    schedules and zero-relocation tuition plans.
                                                </p>
                                                <button
                                                    type="button"
                                                    className="apple-btn-secondary"
                                                    onClick={() => {
                                                        setActiveFlyout(null);
                                                        openAdmissionsModal("Academic Prospectus Request");
                                                    }}
                                                >
                                                    Request Prospectus →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div
                            className="apple-nav-item"
                            onMouseEnter={() => setActiveFlyout("curriculum")}
                            onMouseLeave={() => setActiveFlyout(null)}
                        >
                            <a href="#curriculum" className="nav-link">
                                Curriculum
                            </a>
                        </div>

                        <div
                            className="apple-nav-item"
                            onMouseEnter={() => setActiveFlyout("intensives")}
                            onMouseLeave={() => setActiveFlyout(null)}
                        >
                            <a href="#modular-showcase" className="nav-link">
                                Field Intensives
                            </a>
                        </div>

                        <div className="apple-nav-item">
                            <a href="#host-cohort" className="nav-link">
                                Host at Church
                            </a>
                        </div>

                        <div className="apple-nav-item">
                            <button
                                type="button"
                                className="nav-link"
                                onClick={() => openAdmissionsModal("Tuition Subsidy & Scholarships")}
                            >
                                Scholarships
                            </button>
                        </div>
                    </nav>

                    {/* Apple Right Action Buttons */}
                    <div className="apple-nav-actions">
                        <button
                            type="button"
                            className="apple-icon-btn"
                            title="Quick Search Curriculum"
                            onClick={() => {
                                const el = document.getElementById("curriculum-search");
                                el?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            <Search size={16} />
                        </button>

                        <button
                            type="button"
                            className="apple-btn-portal"
                            onClick={() => navigate("client-login", "/client-login")}
                        >
                            <User size={14} />
                            <span>Student Portal</span>
                        </button>

                        <button
                            type="button"
                            className="apple-btn-portal"
                            onClick={() => {
                                localStorage.removeItem("token");
                                localStorage.removeItem("accessToken");
                                localStorage.removeItem("jwt");
                                localStorage.removeItem("authToken");
                                navigate("login", "/login");
                            }}
                            style={{ background: "rgba(24, 119, 242, 0.2)", borderColor: "rgba(24, 119, 242, 0.4)", color: "#2997ff" }}
                        >
                            <ShieldCheck size={14} />
                            <span>Admin Portal</span>
                        </button>

                        <button
                            type="button"
                            className="apple-btn-primary"
                            onClick={() => openAdmissionsModal("Admissions Application")}
                        >
                            <span>Apply Now</span>
                        </button>

                        {/* Mobile Hamburger */}
                        <button
                            type="button"
                            className="apple-hamburger"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle navigation"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <div className="apple-bar-icon" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {mobileMenuOpen && (
                    <div className="apple-mobile-menu">
                        <a href="#modular-showcase" onClick={() => setMobileMenuOpen(false)}>
                            Field Intensives
                        </a>
                        <a href="#curriculum" onClick={() => setMobileMenuOpen(false)}>
                            Curriculum &amp; Courses
                        </a>
                        <a href="#modular-model" onClick={() => setMobileMenuOpen(false)}>
                            How Mobile Learning Works
                        </a>
                        <a href="#host-cohort" onClick={() => setMobileMenuOpen(false)}>
                            Host at Your Church
                        </a>
                        <button
                            type="button"
                            className="mobile-link-btn"
                            onClick={() => {
                                setMobileMenuOpen(false);
                                openAdmissionsModal("Scholarship Information");
                            }}
                        >
                            Scholarship &amp; Subsidies
                        </button>

                        <div className="mobile-action-group">
                            <button
                                type="button"
                                className="apple-btn-portal"
                                onClick={() => navigate("client-login", "/client-login")}
                            >
                                Student Portal Login
                            </button>
                            <button
                                type="button"
                                className="apple-btn-portal"
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    localStorage.removeItem("accessToken");
                                    localStorage.removeItem("jwt");
                                    localStorage.removeItem("authToken");
                                    navigate("login", "/login");
                                }}
                            >
                                Staff / Admin Portal
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* =========================================================
                APPLE HERO SECTION — CINEMATIC KEYNOTE SHOWCASE
            ========================================================= */}
            <section className="apple-hero-section">
                <div className="apple-hero-inner">
                    <div className="apple-hero-badge">
                        <Sparkles size={14} />
                        <span>{landingContent.heroBadge}</span>
                    </div>

                    <h1 className="apple-hero-title">
                        <span className="hero-line-white">{landingContent.heroTitleWhite}</span>
                        <span className="hero-line-gradient">{landingContent.heroTitleGradient}</span>
                    </h1>

                    <p className="apple-hero-subtitle">
                        {landingContent.heroSubtitle}
                    </p>

                    {/* Apple-style Action Buttons */}
                    <div className="apple-hero-ctas">
                        <button
                            type="button"
                            className="apple-btn-cta-blue"
                            onClick={() => openAdmissionsModal("Admissions 2026-2027")}
                        >
                            <span>{landingContent.ctaPrimary}</span>
                            <ArrowRight size={16} />
                        </button>

                        <button
                            type="button"
                            className="apple-btn-cta-ghost"
                            onClick={() => {
                                const el = document.getElementById("modular-showcase");
                                el?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            <span>{landingContent.ctaSecondary}</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="apple-hero-guarantees">
                        <div className="guarantee-item">
                            <CheckCircle2 size={15} color="#2997ff" />
                            <span>{landingContent.guarantee1}</span>
                        </div>
                        <div className="guarantee-item">
                            <CheckCircle2 size={15} color="#2997ff" />
                            <span>{landingContent.guarantee2}</span>
                        </div>
                        <div className="guarantee-item">
                            <CheckCircle2 size={15} color="#2997ff" />
                            <span>{landingContent.guarantee3}</span>
                        </div>
                    </div>

                    {/* Apple Hardware / Studio Display Mockup with Cinematic Promo Video */}
                    <div className="apple-device-showcase">
                        <div className="apple-display-frame">
                            <div className="display-notch">
                                <span className="camera-dot"></span>
                            </div>

                            <PromoVideoPlayer
                                settings={landingContent.promoVideo}
                                onApplyClick={() => {
                                    const form = document.getElementById("demo-form");
                                    form?.scrollIntoView({ behavior: "smooth" });
                                }}
                                onEditClick={onNavigate ? () => onNavigate("landing-editor") : undefined}
                                onUploadMedia={isAdminLoggedIn ? handleQuickUploadFromReel : undefined}
                            />
                        </div>

                        {/* Floating Ambient Glow */}
                        <div className="apple-display-glow"></div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                APPLE-STYLE SLIDER CAROUSEL (FIELD INTENSIVES)
            ========================================================= */}
            <section
                className="apple-carousel-section"
                id="modular-showcase"
            >
                <div className="apple-section-header">
                    <span className="apple-eyebrow">
                        {landingContent.carouselEyebrow || "UPCOMING FIELD INTENSIVES"}
                    </span>
                    <h2 className="apple-headline">
                        {landingContent.carouselHeadline || "Where Mobile Bible School is Heading Next."}
                    </h2>
                    <p className="apple-subheadline">
                        {landingContent.carouselSubheadline || "Experience world-class faculty on location. Each 3-day modular session equips leaders with in-depth scripture study and practical ministry skills."}
                    </p>
                </div>

                {/* Full-Page Grid: All course modules visible at once across the content page */}
                <div className="apple-modules-grid">
                    {activeSlides.map((slide) => {
                        return (
                            <div
                                key={slide.id}
                                className="apple-slide-card apple-module-grid-card"
                                style={{
                                    background: slide.themeGradient,
                                }}
                            >
                                <div className="slide-content-left">
                                    <div className="slide-badge-row">
                                        <span className="slide-tag">{slide.badge}</span>
                                        <span className="slide-eyebrow-text">{slide.eyebrow}</span>
                                    </div>

                                    <h3 className="slide-title">
                                        <span>{slide.title}</span>{" "}
                                        <span className="slide-highlight">{slide.highlight}</span>
                                    </h3>

                                    <p className="slide-desc">{slide.description}</p>

                                    <div className="slide-specs">
                                        <div className="spec-item">
                                            <MapPin size={15} color="#2997ff" />
                                            <span>{slide.hostLocation}</span>
                                        </div>
                                        <div className="spec-item">
                                            <Calendar size={15} color="#2997ff" />
                                            <span>{slide.date}</span>
                                        </div>
                                        <div className="spec-item">
                                            <GraduationCap size={15} color="#2997ff" />
                                            <span>{slide.units}</span>
                                        </div>
                                    </div>

                                    <div className="slide-topics-list">
                                        <span className="topics-heading">Core Module Syllabus:</span>
                                        <ul>
                                            {slide.curriculumHighlight.map((item) => (
                                                <li key={item}>
                                                    <CheckCircle2 size={14} color="#2997ff" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="slide-cta-row">
                                        <button
                                            type="button"
                                            className="apple-btn-cta-blue"
                                            onClick={() => openAdmissionsModal(slide.title)}
                                        >
                                            <span>{slide.primaryCta}</span>
                                            <ArrowRight size={15} />
                                        </button>
                                        <button
                                            type="button"
                                            className="apple-btn-cta-ghost"
                                            onClick={() => openAdmissionsModal(`Host Application: ${slide.title}`)}
                                        >
                                            <span>Request to Host Locally</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="slide-visual-right">
                                    {slideVideoUrls[slide.id] || slide.videoUrl ? (
                                        <div className="slide-video-card">
                                            <video
                                                src={slideVideoUrls[slide.id] || slide.videoUrl}
                                                controls
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className="slide-embedded-video"
                                            />
                                            <div className="slide-video-overlay-badge">
                                                <span>{slide.badge || "MODULE VIDEO"}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="slide-feature-card">
                                            <div className="card-top-icon">
                                                <Scroll size={32} color="#2997ff" />
                                            </div>
                                            <div className="card-tagline">
                                                <h4>{slide.tagline}</h4>
                                            </div>
                                            <div className="card-meta-metrics">
                                                <div className="metric-cell">
                                                    <strong>18 HRS</strong>
                                                    <span>CLASSROOM INSTRUCTION</span>
                                                </div>
                                                <div className="metric-cell">
                                                    <strong>3 UNITS</strong>
                                                    <span>ACCREDITED CREDITS</span>
                                                </div>
                                                <div className="metric-cell">
                                                    <strong>100%</strong>
                                                    <span>PRACTICAL MINISTRY</span>
                                                </div>
                                            </div>
                                            <div className="card-guarantee-note">
                                                <ShieldCheck size={16} color="#30d158" />
                                                <span>Approved by Mobile Theological Education Guild</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* =========================================================
                APPLE BENTO GRID — DESIGNED FOR THE HARVEST FIELD
            ========================================================= */}
            <section className="apple-bento-section" id="modular-model">
                <div className="apple-section-header">
                    <span className="apple-eyebrow">THE MOBILE ADVANTAGE</span>
                    <h2 className="apple-headline">Engineered for Busy Pastors &amp; Lay Disciples.</h2>
                    <p className="apple-subheadline">
                        Traditional seminaries require uprooting your family and stepping away from your congregation.
                        Mobile Bible School brings the highest tier of theological education straight to your doorstep.
                    </p>
                </div>

                <div className="apple-bento-grid">
                    {/* Bento 1: Large Span */}
                    <div className="bento-card bento-span-2">
                        <div className="bento-badge">ZERO RELOCATION</div>
                        <h3>Study In Your Church. Serve Without Interruption.</h3>
                        <p>
                            We conduct intensive weekend cohorts at local host churches once a month. Keep your secular
                            career, sustain your pastoral duties, and immediately apply weekend learnings into your Sunday
                            preaching and discipleship groups.
                        </p>
                        <div className="bento-visual-row">
                            <div className="visual-stat">
                                <strong>85%</strong>
                                <span>LOWER TUITION THAN RESIDENTIAL SEMINARIES</span>
                            </div>
                            <div className="visual-stat">
                                <strong>0 DAYS</strong>
                                <span>RELOCATION TIME REQUIRED</span>
                            </div>
                            <div className="visual-stat">
                                <strong>1:1</strong>
                                <span>SENIOR PASTOR FIELD MENTORSHIP</span>
                            </div>
                        </div>
                    </div>

                    {/* Bento 2 */}
                    <div className="bento-card">
                        <div className="bento-icon-circle">
                            <Smartphone size={24} color="#2997ff" />
                        </div>
                        <h3>Offline-Ready Mobile Learning</h3>
                        <p>
                            Access course audio lectures, digital Greek and Hebrew lexicons, and reading assignments
                            through our offline-first mobile app. Perfect for rural ministers and remote mission outposts.
                        </p>
                    </div>

                    {/* Bento 3 */}
                    <div className="bento-card">
                        <div className="bento-icon-circle">
                            <GraduationCap size={24} color="#2997ff" />
                        </div>
                        <h3>Accredited Modular Units</h3>
                        <p>
                            Every course delivers 3 to 4 fully recognized credit units. Stack modular certificates toward a
                            full Diploma in Pastoral Ministry or a Bachelor of Biblical Studies.
                        </p>
                    </div>

                    {/* Bento 4 */}
                    <div className="bento-card">
                        <div className="bento-icon-circle">
                            <Building2 size={24} color="#2997ff" />
                        </div>
                        <h3>Host a Cohort at Your Church</h3>
                        <p>
                            Are there 10 or more aspiring leaders in your fellowship or district? We partner with your
                            church to establish an official Mobile Bible School regional training center.
                        </p>
                    </div>

                    {/* Bento 5 */}
                    <div className="bento-card">
                        <div className="bento-icon-circle">
                            <ShieldCheck size={24} color="#2997ff" />
                        </div>
                        <h3>Generous Ministry Subsidies</h3>
                        <p>
                            Tuition should never prevent a servant of God from learning God's Word. Through our global
                            donor network, over 80% of our students receive partial or full study grants.
                        </p>
                    </div>
                </div>
            </section>

            {/* =========================================================
                APPLE-STYLE INTERACTIVE CURRICULUM EXPLORER
            ========================================================= */}
            <section className="apple-curriculum-section" id="curriculum">
                <div className="apple-section-header">
                    <span className="apple-eyebrow">COMPREHENSIVE BIBLE CATALOG</span>
                    <h2 className="apple-headline">Courses Designed for Spiritual Depth.</h2>
                    <p className="apple-subheadline">
                        Search through foundational scripture surveys, historical theology, pastoral counseling, and
                        frontier missionary planting.
                    </p>

                    {/* Search & Category Filter Pills */}
                    <div className="curriculum-controls-bar" id="curriculum-search">
                        <div className="apple-search-pill">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search courses, professors, theology keywords..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button type="button" onClick={() => setSearchQuery("")}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <div className="apple-filter-tabs">
                            <button
                                type="button"
                                className={`filter-tab ${selectedCategory === "all" ? "active" : ""}`}
                                onClick={() => setSelectedCategory("all")}
                            >
                                All Disciplines
                            </button>
                            <button
                                type="button"
                                className={`filter-tab ${selectedCategory === "foundations" ? "active" : ""}`}
                                onClick={() => setSelectedCategory("foundations")}
                            >
                                Biblical Foundations
                            </button>
                            <button
                                type="button"
                                className={`filter-tab ${selectedCategory === "theology" ? "active" : ""}`}
                                onClick={() => setSelectedCategory("theology")}
                            >
                                Systematic Theology
                            </button>
                            <button
                                type="button"
                                className={`filter-tab ${selectedCategory === "ministry" ? "active" : ""}`}
                                onClick={() => setSelectedCategory("ministry")}
                            >
                                Pastoral Ministry
                            </button>
                            <button
                                type="button"
                                className={`filter-tab ${selectedCategory === "missions" ? "active" : ""}`}
                                onClick={() => setSelectedCategory("missions")}
                            >
                                Frontier Missions
                            </button>
                        </div>
                    </div>
                </div>

                {/* Courses Grid */}
                <div className="apple-courses-grid">
                    {filteredCurriculum.map((item) => (
                        <div key={item.id} className="course-card">
                            <div className="course-card-top">
                                <span className="course-code-badge">{item.code}</span>
                                <span className="course-units-pill">{item.units} Credit Units</span>
                            </div>

                            <h3 className="course-card-title">{item.title}</h3>
                            <p className="course-card-desc">{item.description}</p>

                            <div className="course-card-meta">
                                <div className="meta-row">
                                    <User size={13} color="#86868b" />
                                    <span>Faculty: {item.instructor}</span>
                                </div>
                                <div className="meta-row">
                                    <Clock size={13} color="#86868b" />
                                    <span>{item.schedule}</span>
                                </div>
                            </div>

                            <div className="course-card-bottom">
                                <button
                                    type="button"
                                    className="btn-course-apply"
                                    onClick={() => openAdmissionsModal(item.title)}
                                >
                                    <span>Enroll in Course</span>
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* =========================================================
                HOST A MOBILE COHORT (CHURCH PARTNERSHIP SECTION)
            ========================================================= */}
            <section className="apple-host-section" id="host-cohort">
                <div className="apple-host-card">
                    <div className="host-card-content">
                        <span className="apple-eyebrow">CHURCH LEADERSHIP PARTNERSHIP</span>
                        <h2>Bring Mobile Bible School to Your Congregation.</h2>
                        <p>
                            Are you a senior pastor or district overseer? Partner with MBS to establish an accredited
                            training hub inside your church facility. We supply the accredited curriculum, qualified
                            theological professors, student handbooks, and grading systems — you provide the classroom and
                            eager disciples.
                        </p>
                        <div className="host-perks">
                            <div className="perk-item">✓ Fully accredited curriculum &amp; certified instructors</div>
                            <div className="perk-item">✓ Tailored schedule (weekend intensives or weekly evenings)</div>
                            <div className="perk-item">✓ Special host church leadership scholarships &amp; discounts</div>
                        </div>
                        <div className="host-cta-group">
                            <button
                                type="button"
                                className="apple-btn-cta-blue"
                                onClick={() => openAdmissionsModal("Host Church Regional Hub Application")}
                            >
                                <span>Apply to Become a Host Campus</span>
                                <ArrowRight size={16} />
                            </button>
                            <button
                                type="button"
                                className="apple-btn-cta-ghost"
                                onClick={() => openAdmissionsModal("Download Host Church Information Packet")}
                            >
                                <Download size={15} />
                                <span>Download Host Guide</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                APPLE-STYLE DIRECTORY FOOTER
            ========================================================= */}
            <footer className="apple-footer">
                <div className="apple-footer-inner">
                    <div className="apple-footer-disclaimer">
                        <p>
                            1. Mobile Bible School International (MBS) is a non-denominational evangelical theological
                            training network dedicated to equipping pastors, elders, church planters, and lay leaders.
                            Curriculum units are transferable across participating evangelical seminaries and accredited
                            through regional ministry oversight boards.
                        </p>
                        <p>
                            2. Tuition subsidy programs are subject to regional committee review and donor funding
                            allocations.
                        </p>
                    </div>

                    <div className="apple-footer-links-grid">
                        <div className="footer-col">
                            <h4>Academic Programs</h4>
                            <a href="#curriculum">Certificate in Christian Foundations</a>
                            <a href="#curriculum">Diploma in Pastoral Ministry</a>
                            <a href="#curriculum">Bachelor of Biblical Leadership</a>
                            <a href="#curriculum">Church Planting &amp; Missions</a>
                            <a href="#curriculum">Biblical Greek &amp; Hebrew</a>
                        </div>

                        <div className="footer-col">
                            <h4>Mobile Model</h4>
                            <a href="#modular-model">Weekend Modular Intensives</a>
                            <a href="#modular-model">Offline Mobile Study App</a>
                            <a href="#modular-model">Church Host Partnerships</a>
                            <a href="#modular-showcase">Field Practicum Calendar</a>
                            <a href="#modular-model">Faculty Mentorship</a>
                        </div>

                        <div className="footer-col">
                            <h4>Admissions</h4>
                            <button
                                type="button"
                                className="footer-text-btn"
                                onClick={() => openAdmissionsModal("Online Student Application")}
                            >
                                Apply Online
                            </button>
                            <button
                                type="button"
                                className="footer-text-btn"
                                onClick={() => openAdmissionsModal("Scholarship & Subsidy Inquiry")}
                            >
                                Tuition Assistance
                            </button>
                            <button
                                type="button"
                                className="footer-text-btn"
                                onClick={() => openAdmissionsModal("Academic Transfer Credits")}
                            >
                                Transfer Credits
                            </button>
                            <button
                                type="button"
                                className="footer-text-btn"
                                onClick={() => openAdmissionsModal("Prospectus Request")}
                            >
                                Download Prospectus
                            </button>
                        </div>

                        <div className="footer-col">
                            <h4>Student &amp; Staff Portals</h4>
                            <button
                                type="button"
                                className="footer-portal-link"
                                onClick={() => navigate("client-login", "/client-login")}
                            >
                                Student Information Portal →
                            </button>
                            <button
                                type="button"
                                className="footer-portal-link"
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    localStorage.removeItem("accessToken");
                                    localStorage.removeItem("jwt");
                                    localStorage.removeItem("authToken");
                                    navigate("login", "/login");
                                }}
                            >
                                Faculty &amp; Admin Portal Console →
                            </button>
                            <button
                                type="button"
                                className="footer-portal-link accent"
                                onClick={() => openAdmissionsModal("Host Church Inquiries")}
                            >
                                Host Campus Support →
                            </button>
                        </div>
                    </div>

                    <div className="apple-footer-bottom">
                        <div className="footer-legal">
                            <span>Copyright © {new Date().getFullYear()} Mobile Bible School International. All rights reserved.</span>
                            <div className="legal-links">
                                <span>Privacy Policy</span>
                                <span>Terms of Study</span>
                                <span>Doctrinal Statement</span>
                                <span>Site Map</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* =========================================================
                APPLE-STYLE ADMISSIONS & INQUIRY MODAL SHEET
            ========================================================= */}
            {showModal && (
                <div
                    className="apple-modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeModal();
                    }}
                >
                    <div className="apple-modal-card">
                        <div className="apple-modal-header">
                            <div>
                                <span className="modal-eyebrow">MOBILE BIBLE SCHOOL ADMISSIONS</span>
                                <h3>{modalContextTitle}</h3>
                            </div>
                            <button type="button" className="apple-modal-close" onClick={closeModal}>
                                <X size={18} />
                            </button>
                        </div>

                        {successMessage ? (
                            <div className="apple-modal-success">
                                <div className="success-icon-wrap">
                                    <CheckCircle2 size={54} color="#30d158" />
                                </div>
                                <h3>Application Received</h3>
                                <p>
                                    Thank you for your dedication to theological study. The Mobile Bible School Admissions
                                    Office will review your application and send the official curriculum syllabus and
                                    cohort schedule to your email.
                                </p>
                                <button type="button" className="apple-btn-cta-blue" onClick={closeModal}>
                                    Return to Homepage
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleFormSubmit} className="apple-modal-form">
                                {errorMessage && (
                                    <div className="apple-form-error">
                                        <span>!</span>
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                <div className="apple-form-grid">
                                    <div className="form-group">
                                        <label>FULL LEGAL NAME *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            placeholder="e.g. Pastor David E. Ramos"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>EMAIL ADDRESS *</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="e.g. david.ramos@church.org"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>CHURCH / MINISTRY AFFILIATION *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.churchName}
                                            onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                                            placeholder="e.g. Grace Fellowship Bible Church"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>CONTACT NUMBER / WHATSAPP</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="e.g. +63 917 555 0192"
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>MINISTRY ROLE / CALLING</label>
                                        <input
                                            type="text"
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                            placeholder="e.g. Senior Pastor, Youth Worker, Missionary, Lay Leader"
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>QUESTIONS / COHORT PREFERENCES</label>
                                        <textarea
                                            rows={3}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Specify preferred field intensive location or whether you are applying to host a cohort at your local church..."
                                        />
                                    </div>
                                </div>

                                <div className="apple-modal-footer">
                                    <button
                                        type="button"
                                        className="apple-btn-cta-ghost"
                                        onClick={closeModal}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="apple-btn-cta-blue" disabled={submitting}>
                                        <Send size={15} />
                                        <span>{submitting ? "Submitting Application..." : "Submit Application"}</span>
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
