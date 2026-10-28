// ============================================================
// OnlineEnrollmentPage.tsx -> MOBILE BIBLE SCHOOL & THEOLOGICAL SEMINARY
// Official Public Online Student Enrollment Portal
// Direct Pipeline to Central Inquiries & Registrar Database
// ============================================================

import React, { useState, useEffect, useMemo } from "react";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import { applyGlobalTheme, getLandingPageContent } from "../../services/landingPageContent";
import "./OnlineEnrollmentPage.css";
import "./PublicUnisonTheme.css";
import { API_BASE_URL } from "../../config";
import {
    GraduationCap,
    CheckCircle2,
    ShieldCheck,
    Clock,
    MapPin,
    User,
    Mail,
    Phone,
    Building2,
    Sparkles,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    RefreshCw,
    Copy,
    Check,
    Printer,
    BookOpen,
    CreditCard
} from "lucide-react";

interface OnlineEnrollmentPageProps {
    onNavigate?: (page: string) => void;
}

interface EnrollmentFormState {
    // Step 1: Personal & Church Profile
    fullName: string;
    email: string;
    phone: string;
    churchName: string;
    ministryRole: string;
    location: string;

    // Step 2: Academic Program & Delivery Mode
    program: string;
    enrollmentType: string;
    learningMode: string;
    term: string;

    // Step 3: Unit Load & Subject Focus
    unitLoad: string;
    selectedSubjects: string[];
    pastorEndorsement: string;
    additionalNotes: string;
}

const PROGRAM_OPTIONS = [
    {
        id: "B.Th.",
        name: "Bachelor of Theology (B.Th.)",
        duration: "4 Years",
        desc: "Comprehensive pastoral ministry, exegetical Greek/Hebrew, systematic theology & homiletics.",
        badge: "Undergraduate Degree"
    },
    {
        id: "Dip.P.M.",
        name: "Diploma in Pastoral Ministry (Dip.P.M.)",
        duration: "2 Years",
        desc: "Equipping pastors, church planters, and modular ministry leaders with practical theology.",
        badge: "Pastoral Diploma"
    },
    {
        id: "C.B.S.",
        name: "Certificate in Biblical Studies (C.B.S.)",
        duration: "1 Year",
        desc: "Foundational survey of Old/New Testaments, biblical doctrine, and practical evangelism.",
        badge: "Certificate Program"
    },
    {
        id: "M.Div.",
        name: "Master of Divinity (M.Div.)",
        duration: "3 Years",
        desc: "Graduate-level ministerial scholarship, biblical languages, theology, and pastoral counseling.",
        badge: "Graduate Degree"
    },
    {
        id: "M.Min.",
        name: "Master of Ministry (M.Min.)",
        duration: "2 Years",
        desc: "Advanced modular leadership cohort for active pastors and ministry administrators.",
        badge: "Master's Modular"
    },
    {
        id: "Lay-Lead",
        name: "Modular Lay Leadership Certificate",
        duration: "6 Months",
        desc: "Weekend intensives for church elders, deacons, youth directors, and Sunday school teachers.",
        badge: "Leadership Track"
    }
];

const ENROLLMENT_TYPES = [
    { value: "New Enrollee", label: "New Enrollee / First-Time Applicant" },
    { value: "Continuing Student", label: "Continuing Student (Next Term / Semester)" },
    { value: "Transferee", label: "Transferee / Cross-Enrollee from Another Seminary" },
    { value: "Modular Auditor", label: "Modular Auditor (Special Non-Graded Track)" }
];

const DELIVERY_MODES = [
    {
        value: "Regional Modular Intensive",
        label: "Regional Modular Intensive Hubs",
        desc: "Luzon, Visayas, and Mindanao modular training centers (monthly on-site blocks)"
    },
    {
        value: "Hybrid Virtual & LMS",
        label: "Hybrid Virtual & LMS Online Hub",
        desc: "Flexible cloud video lectures + weekly live exegetical webinars via MBS LMS"
    },
    {
        value: "Main Campus Lectures",
        label: "Main Campus On-Site (Metro Manila)",
        desc: "On-campus weekly seminars, campus chapel, and seminary library access"
    },
    {
        value: "Church Extension Cohort",
        label: "Local Church Extension Host",
        desc: "Classes hosted inside your home church with visiting seminary faculty"
    }
];

const TERMS = [
    "Academic Year 2026-2027 • 1st Semester (Fall / August Cohort)",
    "Academic Year 2026-2027 • 2nd Semester (Spring / January Cohort)",
    "Summer Pastoral Intensive 2027 (April – May Cohort)"
];

const UNIT_LOADS = [
    { value: "Full Load (15–18 Units)", label: "Full-Time Load (15–18 Units / 5–6 Subjects)", units: 15 },
    { value: "Pastoral Load (6–9 Units)", label: "Pastoral Ministry Load (6–9 Units / 2–3 Subjects)", units: 9 },
    { value: "Modular Single Subject (3 Units)", label: "Single Modular Intensive (3 Units / 1 Subject)", units: 3 },
    { value: "Audit Only (No Units)", label: "Audit Only / Non-Credit Continuing Education", units: 0 }
];

const SUBJECT_OPTIONS = [
    "Systematic Theology & Biblical Doctrines",
    "Biblical Hermeneutics & Expository Preaching",
    "New Testament Greek Exegesis",
    "Old Testament Hebrew Foundations",
    "Pastoral Counseling & Family Ministries",
    "Church Planting, Evangelism & Missions",
    "Church History & Historical Theology",
    "Ecclesiology & Church Administration"
];

const MINISTRY_ROLES = [
    "Senior Pastor / Lead Minister",
    "Associate / Assistant Pastor",
    "Youth Pastor / Campus Director",
    "Church Planter / Missionary",
    "Bible Teacher / Sunday School Director",
    "Church Elder / Deacon / Trustee",
    "Worship Ministry Leader",
    "Aspiring Minister / Bible Student",
    "Other Ministry Worker"
];

const OnlineEnrollmentPage: React.FC<OnlineEnrollmentPageProps> = ({ onNavigate }) => {
    const landingContent = useMemo(() => getLandingPageContent(), []);
    const schoolName = landingContent.schoolName || "Mobile Bible School";

    useEffect(() => {
        try {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        } catch {
            window.scrollTo(0, 0);
        }
        document.title = `Online Enrollment | ${schoolName} & Theological Seminary`;
        applyGlobalTheme(undefined, true);
    }, [schoolName]);

    // Active Step: 1 = Profile, 2 = Program, 3 = Subjects, 4 = Review & Submit
    const [currentStep, setCurrentStep] = useState<number>(1);

    // Form state
    const [form, setForm] = useState<EnrollmentFormState>({
        fullName: "",
        email: "",
        phone: "",
        churchName: "",
        ministryRole: "Senior Pastor / Lead Minister",
        location: "",
        program: "Bachelor of Theology (B.Th.)",
        enrollmentType: "New Enrollee",
        learningMode: "Regional Modular Intensive",
        term: TERMS[0],
        unitLoad: "Pastoral Load (6–9 Units)",
        selectedSubjects: [
            "Systematic Theology & Biblical Doctrines",
            "Biblical Hermeneutics & Expository Preaching"
        ],
        pastorEndorsement: "",
        additionalNotes: ""
    });

    // Submission states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submissionData, setSubmissionData] = useState<{
        demoRequestId: number;
        trackingCode: string;
        email: string;
        submittedDate: string;
    } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [copiedTracking, setCopiedTracking] = useState(false);

    // Auto Email Resender
    const [resending, setResending] = useState(false);
    const [resendStatus, setResendStatus] = useState<string | null>(null);

    // Navigation helper
    const handleNavigate = (page: string) => {
        if (onNavigate) {
            onNavigate(page);
        } else {
            window.location.href = `/${page}`;
        }
    };

    // Form Input Handlers
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errorMessage) setErrorMessage(null);
    };

    const toggleSubject = (subject: string) => {
        setForm(prev => {
            const exists = prev.selectedSubjects.includes(subject);
            return {
                ...prev,
                selectedSubjects: exists
                    ? prev.selectedSubjects.filter(s => s !== subject)
                    : [...prev.selectedSubjects, subject]
            };
        });
    };

    // Validation per step
    const validateStep = (step: number): boolean => {
        if (step === 1) {
            if (!form.fullName.trim()) {
                setErrorMessage("Please enter your legal full name.");
                return false;
            }
            if (!form.email.trim() || !form.email.includes("@")) {
                setErrorMessage("Please enter a valid email address.");
                return false;
            }
            if (!form.phone.trim()) {
                setErrorMessage("Please enter your contact phone / WhatsApp number.");
                return false;
            }
            if (!form.churchName.trim()) {
                setErrorMessage("Please provide your local church name or ministry affiliation.");
                return false;
            }
        }
        setErrorMessage(null);
        return true;
    };

    const handleNextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 4));
            try {
                window.scrollTo({ top: 320, behavior: "smooth" });
            } catch {
                window.scrollTo(0, 320);
            }
        }
    };

    const handlePrevStep = () => {
        setErrorMessage(null);
        setCurrentStep(prev => Math.max(prev - 1, 1));
        try {
            window.scrollTo({ top: 320, behavior: "smooth" });
        } catch {
            window.scrollTo(0, 320);
        }
    };

    // Direct Database Submission -> POST /api/DemoRequests
    const handleSubmitEnrollment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!validateStep(1)) {
            setCurrentStep(1);
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            // Build the comprehensive enrollment dossier message
            const enrollmentDossier = [
                `[OFFICIAL ONLINE ENROLLMENT APPLICATION - ${schoolName.toUpperCase()}]`,
                `• Classification: ${form.enrollmentType}`,
                `• Degree / Program: ${form.program}`,
                `• Academic Term: ${form.term}`,
                `• Learning Mode: ${form.learningMode}`,
                `• Unit Load: ${form.unitLoad}`,
                `• Selected Subjects: ${form.selectedSubjects.length > 0 ? form.selectedSubjects.join(", ") : "Standard Curriculum Track"}`,
                `• Ministry Role: ${form.ministryRole}`,
                `• Local Church: ${form.churchName}`,
                form.location ? `• Province / Location: ${form.location}` : null,
                form.pastorEndorsement ? `• Pastoral Endorsement: ${form.pastorEndorsement}` : null,
                form.additionalNotes ? `• Student Remarks: ${form.additionalNotes}` : null,
                `--------------------------------------------------`,
                `Submitted via MBS Online Enrollment Desk on ${new Date().toLocaleString()}`
            ].filter(Boolean).join("\n");

            const payload = {
                fullName: form.fullName.trim(),
                churchName: form.churchName.trim() || "Independent Candidate / Local Church",
                email: form.email.trim().toLowerCase(),
                phone: form.phone.trim() || null,
                position: `Admissions & Enrollment: ${form.program} [${form.enrollmentType}]`,
                message: enrollmentDossier
            };

            const response = await fetch(`${API_BASE_URL}/DemoRequests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data?.message || "Failed to record enrollment application in the database.");
            }

            const id = data?.demoRequestId || 1;
            const tracking = data?.trackingCode || `MBS-INQ-${String(id).padStart(5, "0")}`;

            setSubmissionData({
                demoRequestId: id,
                trackingCode: tracking,
                email: form.email.trim().toLowerCase(),
                submittedDate: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                })
            });

            setSubmitted(true);
            try {
                window.scrollTo({ top: 120, behavior: "smooth" });
            } catch {
                window.scrollTo(0, 120);
            }
        } catch (err: any) {
            console.error("Enrollment submission error:", err);
            setErrorMessage(err?.message || "Unable to submit your enrollment at this time. Please verify your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Auto Resend Email confirmation
    const handleResendConfirmation = async () => {
        if (!submissionData?.demoRequestId || resending) return;

        setResending(true);
        setResendStatus(null);

        try {
            const res = await fetch(
                `${API_BASE_URL}/DemoRequests/${submissionData.demoRequestId}/resend-confirmation`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                }
            );

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || "Failed to resend confirmation email.");
            }

            setResendStatus(`✓ Confirmation notice resent to ${submissionData.email}`);
        } catch (err: any) {
            console.error("Resend error:", err);
            setResendStatus(`⚠️ Could not resend email: ${err?.message || "Please check with the registrar."}`);
        } finally {
            setResending(false);
        }
    };

    const handleCopyTracking = () => {
        if (!submissionData?.trackingCode) return;
        navigator.clipboard.writeText(submissionData.trackingCode);
        setCopiedTracking(true);
        setTimeout(() => setCopiedTracking(false), 2200);
    };

    return (
        <div className="mbs-enrollment-page-root">
            {/* PUBLIC NAVIGATION HEADER */}
            <PublicHeader onNavigate={handleNavigate} />

            {/* HERO BANNER */}
            <section className="mbs-enrollment-hero">
                <div className="mbs-enrollment-hero-glow" />
                <div className="mbs-enrollment-container">
                    <div className="mbs-enrollment-hero-content">
                        <div className="mbs-enrollment-hero-badge">
                            <GraduationCap size={14} style={{ marginRight: 6 }} />
                            OFFICIAL REGISTRAR PORTAL • SYSTEM DATABASE INQUIRIES
                        </div>

                        <h1 className="mbs-enrollment-hero-title">
                            Online Student <span>Enrollment</span>
                        </h1>

                        <p className="mbs-enrollment-hero-subtitle">
                            Register for degree programs, modular pastoral cohorts, and theological courses.
                            Your application is logged directly into our central registrar database for immediate review and course scheduling.
                        </p>

                        <div className="mbs-enrollment-trust-strip">
                            <div className="mbs-enrollment-trust-pill">
                                <ShieldCheck size={14} className="pill-icon" />
                                <span>100% Accredited Curriculum</span>
                            </div>
                            <div className="mbs-enrollment-trust-pill">
                                <Building2 size={14} className="pill-icon" />
                                <span>7 Regional Modular Hubs</span>
                            </div>
                            <div className="mbs-enrollment-trust-pill">
                                <Clock size={14} className="pill-icon" />
                                <span>Active Term: AY 2026-2027</span>
                            </div>
                            <div className="mbs-enrollment-trust-pill">
                                <Sparkles size={14} className="pill-icon" />
                                <span>80% Subsidized Pastoral Grant</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* MAIN ENROLLMENT CONTENT AREA */}
            <main className="mbs-enrollment-main-section">
                <div className="mbs-enrollment-container">

                    {/* SUCCESS CONFIRMATION STATE */}
                    {submitted && submissionData ? (
                        <div className="mbs-enrollment-success-card">
                            <div className="mbs-success-banner">
                                <div className="mbs-success-icon-wrap">
                                    <CheckCircle2 size={44} className="mbs-success-check-icon" />
                                </div>
                                <span className="mbs-success-tag">OFFICIALLY RECORDED IN INQUIRIES DATABASE</span>
                                <h2>Enrollment Application Successfully Submitted!</h2>
                                <p>
                                    Your enrollment dossier has been recorded directly into our central admissions &amp; registrar database under reference:
                                </p>

                                <div className="mbs-tracking-box">
                                    <span className="mbs-tracking-label">REGISTRAR TRACKING DOSSIER</span>
                                    <div className="mbs-tracking-code-row">
                                        <code className="mbs-tracking-code">{submissionData.trackingCode}</code>
                                        <button
                                            type="button"
                                            className="mbs-copy-btn"
                                            onClick={handleCopyTracking}
                                            title="Copy Tracking Number"
                                        >
                                            {copiedTracking ? (
                                                <>
                                                    <Check size={14} />
                                                    <span>Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={14} />
                                                    <span>Copy Code</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <small className="mbs-tracking-hint">
                                        Keep this tracking code to check your enrollment verification and course schedules.
                                    </small>
                                </div>
                            </div>

                            {/* DOSSIER SUMMARY */}
                            <div className="mbs-dossier-summary">
                                <h3>Enrollment Summary Overview</h3>
                                <div className="mbs-dossier-grid">
                                    <div className="mbs-dossier-item">
                                        <span className="dossier-label">Enrollee Name</span>
                                        <strong>{form.fullName}</strong>
                                    </div>
                                    <div className="mbs-dossier-item">
                                        <span className="dossier-label">Primary Email</span>
                                        <strong>{submissionData.email}</strong>
                                    </div>
                                    <div className="mbs-dossier-item">
                                        <span className="dossier-label">Selected Program</span>
                                        <strong className="text-gold">{form.program}</strong>
                                    </div>
                                    <div className="mbs-dossier-item">
                                        <span className="dossier-label">Enrollee Classification</span>
                                        <strong>{form.enrollmentType}</strong>
                                    </div>
                                    <div className="mbs-dossier-item">
                                        <span className="dossier-label">Learning Delivery Mode</span>
                                        <strong>{form.learningMode}</strong>
                                    </div>
                                    <div className="mbs-dossier-item">
                                        <span className="dossier-label">Home Church / Ministry</span>
                                        <strong>{form.churchName}</strong>
                                    </div>
                                    <div className="mbs-dossier-item">
                                        <span className="dossier-label">Course Unit Load</span>
                                        <strong>{form.unitLoad}</strong>
                                    </div>
                                    <div className="mbs-dossier-item">
                                        <span className="dossier-label">Target Semester</span>
                                        <strong>{form.term}</strong>
                                    </div>
                                </div>

                                {form.selectedSubjects.length > 0 && (
                                    <div className="mbs-dossier-subjects">
                                        <span className="dossier-label">Selected Focus Subjects ({form.selectedSubjects.length})</span>
                                        <div className="mbs-subject-tags-row">
                                            {form.selectedSubjects.map(sub => (
                                                <span key={sub} className="mbs-subject-pill">
                                                    <BookOpen size={12} />
                                                    {sub}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* NEXT STEPS GUIDE */}
                            <div className="mbs-next-steps-card">
                                <h4>What Happens Next?</h4>
                                <div className="mbs-steps-list">
                                    <div className="mbs-step-row">
                                        <div className="step-circle">1</div>
                                        <div>
                                            <strong>Registrar Evaluation</strong>
                                            <p>Our academic dean &amp; registrar review your submitted courses and prepare your official study syllabus.</p>
                                        </div>
                                    </div>
                                    <div className="step-row">
                                        <div className="step-circle">2</div>
                                        <div>
                                            <strong>Confirmation &amp; Study Schedule</strong>
                                            <p>You will receive an official notification with cohort dates, lecturer lineup, and modular venue instructions.</p>
                                        </div>
                                    </div>
                                    <div className="step-row">
                                        <div className="step-circle">3</div>
                                        <div>
                                            <strong>Online Tuition Payment &amp; LMS Activation</strong>
                                            <p>Lock in your modular seat by completing your subsidized matriculation fee via GCash, Maya, cards, or bank deposit.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="mbs-success-actions">
                                <button
                                    type="button"
                                    className="mbs-btn-payment-action"
                                    onClick={() => handleNavigate("client-payment")}
                                >
                                    <CreditCard size={16} />
                                    <span>Proceed to Online Tuition Payment</span>
                                </button>

                                <button
                                    type="button"
                                    className="mbs-btn-resend-action"
                                    onClick={handleResendConfirmation}
                                    disabled={resending}
                                >
                                    <RefreshCw size={14} className={resending ? "spin" : ""} />
                                    <span>{resending ? "Resending Notice..." : "Resend Confirmation Notice"}</span>
                                </button>

                                <button
                                    type="button"
                                    className="mbs-btn-print-action"
                                    onClick={() => window.print()}
                                >
                                    <Printer size={14} />
                                    <span>Print Enrollment Dossier</span>
                                </button>

                                <button
                                    type="button"
                                    className="mbs-btn-home-action"
                                    onClick={() => handleNavigate("home")}
                                >
                                    <span>Return to Home Page</span>
                                </button>
                            </div>

                            {resendStatus && (
                                <div className="mbs-resend-status-box">
                                    {resendStatus}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* STEPPED ENROLLMENT FORM */
                        <div className="mbs-enrollment-layout">

                            {/* MAIN FORM COLUMN */}
                            <div className="mbs-enrollment-form-column">

                                {/* STEP PROGRESS BAR */}
                                <div className="mbs-stepper-header">
                                    <div className={`mbs-stepper-step ${currentStep >= 1 ? "active" : ""} ${currentStep > 1 ? "completed" : ""}`}>
                                        <div className="step-badge">{currentStep > 1 ? <Check size={14} /> : "1"}</div>
                                        <span className="step-text">Profile &amp; Ministry</span>
                                    </div>
                                    <div className="step-divider" />
                                    <div className={`mbs-stepper-step ${currentStep >= 2 ? "active" : ""} ${currentStep > 2 ? "completed" : ""}`}>
                                        <div className="step-badge">{currentStep > 2 ? <Check size={14} /> : "2"}</div>
                                        <span className="step-text">Program &amp; Delivery</span>
                                    </div>
                                    <div className="step-divider" />
                                    <div className={`mbs-stepper-step ${currentStep >= 3 ? "active" : ""} ${currentStep > 3 ? "completed" : ""}`}>
                                        <div className="step-badge">{currentStep > 3 ? <Check size={14} /> : "3"}</div>
                                        <span className="step-text">Subjects &amp; Endorsement</span>
                                    </div>
                                    <div className="step-divider" />
                                    <div className={`mbs-stepper-step ${currentStep >= 4 ? "active" : ""}`}>
                                        <div className="step-badge">4</div>
                                        <span className="step-text">Review &amp; Submit</span>
                                    </div>
                                </div>

                                {/* ERROR NOTIFICATION */}
                                {errorMessage && (
                                    <div className="mbs-form-error-banner" role="alert">
                                        <AlertCircle size={18} />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmitEnrollment} className="mbs-enrollment-card">

                                    {/* ============================================================ */}
                                    {/* STEP 1: PERSONAL & CHURCH PROFILE                            */}
                                    {/* ============================================================ */}
                                    {currentStep === 1 && (
                                        <div className="mbs-form-step-pane">
                                            <div className="mbs-step-intro">
                                                <div className="step-counter-tag">STEP 1 OF 4</div>
                                                <h3>Applicant Identity &amp; Ministerial Background</h3>
                                                <p>Provide your official student details and church affiliation for registrar records.</p>
                                            </div>

                                            <div className="mbs-field-group">
                                                <label htmlFor="fullName">
                                                    Full Legal Name <span className="req">*</span>
                                                </label>
                                                <div className="mbs-input-icon-wrap">
                                                    <User size={16} className="mbs-input-icon" />
                                                    <input
                                                        type="text"
                                                        id="fullName"
                                                        name="fullName"
                                                        value={form.fullName}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g. Pastor Juan M. Dela Cruz"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="mbs-fields-row">
                                                <div className="mbs-field-group">
                                                    <label htmlFor="email">
                                                        Email Address <span className="req">*</span>
                                                    </label>
                                                    <div className="mbs-input-icon-wrap">
                                                        <Mail size={16} className="mbs-input-icon" />
                                                        <input
                                                            type="email"
                                                            id="email"
                                                            name="email"
                                                            value={form.email}
                                                            onChange={handleInputChange}
                                                            placeholder="e.g. pastorjuan@gmail.com"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mbs-field-group">
                                                    <label htmlFor="phone">
                                                        Contact / WhatsApp Number <span className="req">*</span>
                                                    </label>
                                                    <div className="mbs-input-icon-wrap">
                                                        <Phone size={16} className="mbs-input-icon" />
                                                        <input
                                                            type="tel"
                                                            id="phone"
                                                            name="phone"
                                                            value={form.phone}
                                                            onChange={handleInputChange}
                                                            placeholder="e.g. +63 917 123 4567"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mbs-field-group">
                                                <label htmlFor="churchName">
                                                    Home Church / Ministry Affiliation <span className="req">*</span>
                                                </label>
                                                <div className="mbs-input-icon-wrap">
                                                    <Building2 size={16} className="mbs-input-icon" />
                                                    <input
                                                        type="text"
                                                        id="churchName"
                                                        name="churchName"
                                                        value={form.churchName}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g. Grace Fellowship Bible Church - Pangasinan"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="mbs-fields-row">
                                                <div className="mbs-field-group">
                                                    <label htmlFor="ministryRole">Current Ministry Role</label>
                                                    <select
                                                        id="ministryRole"
                                                        name="ministryRole"
                                                        value={form.ministryRole}
                                                        onChange={handleInputChange}
                                                    >
                                                        {MINISTRY_ROLES.map(role => (
                                                            <option key={role} value={role}>{role}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="mbs-field-group">
                                                    <label htmlFor="location">City / Province / Region</label>
                                                    <div className="mbs-input-icon-wrap">
                                                        <MapPin size={16} className="mbs-input-icon" />
                                                        <input
                                                            type="text"
                                                            id="location"
                                                            name="location"
                                                            value={form.location}
                                                            onChange={handleInputChange}
                                                            placeholder="e.g. Urdaneta City, Pangasinan"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mbs-step-actions end-only">
                                                <button
                                                    type="button"
                                                    className="mbs-btn-primary"
                                                    onClick={handleNextStep}
                                                >
                                                    <span>Proceed to Program Selection</span>
                                                    <ArrowRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* ============================================================ */}
                                    {/* STEP 2: ACADEMIC PROGRAM & DELIVERY MODE                     */}
                                    {/* ============================================================ */}
                                    {currentStep === 2 && (
                                        <div className="mbs-form-step-pane">
                                            <div className="mbs-step-intro">
                                                <div className="step-counter-tag">STEP 2 OF 4</div>
                                                <h3>Academic Degree &amp; Learning Format</h3>
                                                <p>Choose your degree curriculum and preferred regional delivery mode.</p>
                                            </div>

                                            {/* PROGRAM CARDS SELECTION */}
                                            <div className="mbs-field-group">
                                                <label>Select Degree / Certificate Program <span className="req">*</span></label>
                                                <div className="mbs-program-grid">
                                                    {PROGRAM_OPTIONS.map(prog => (
                                                        <div
                                                            key={prog.name}
                                                            className={`mbs-prog-card ${form.program === prog.name ? "selected" : ""}`}
                                                            onClick={() => setForm(prev => ({ ...prev, program: prog.name }))}
                                                        >
                                                            <div className="mbs-prog-card-top">
                                                                <span className="mbs-prog-badge">{prog.badge}</span>
                                                                <span className="mbs-prog-duration">{prog.duration}</span>
                                                            </div>
                                                            <strong className="mbs-prog-name">{prog.name}</strong>
                                                            <p className="mbs-prog-desc">{prog.desc}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* ENROLLMENT CLASSIFICATION */}
                                            <div className="mbs-field-group">
                                                <label htmlFor="enrollmentType">Enrollee Classification</label>
                                                <select
                                                    id="enrollmentType"
                                                    name="enrollmentType"
                                                    value={form.enrollmentType}
                                                    onChange={handleInputChange}
                                                >
                                                    {ENROLLMENT_TYPES.map(type => (
                                                        <option key={type.value} value={type.value}>{type.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* DELIVERY MODE */}
                                            <div className="mbs-field-group">
                                                <label>Preferred Delivery &amp; Campus Mode</label>
                                                <div className="mbs-delivery-stack">
                                                    {DELIVERY_MODES.map(mode => (
                                                        <label
                                                            key={mode.value}
                                                            className={`mbs-delivery-option ${form.learningMode === mode.value ? "selected" : ""}`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="learningMode"
                                                                value={mode.value}
                                                                checked={form.learningMode === mode.value}
                                                                onChange={handleInputChange}
                                                            />
                                                            <div className="mbs-delivery-text">
                                                                <strong>{mode.label}</strong>
                                                                <small>{mode.desc}</small>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* TARGET TERM */}
                                            <div className="mbs-field-group">
                                                <label htmlFor="term">Academic Term / Semester Cohort</label>
                                                <select
                                                    id="term"
                                                    name="term"
                                                    value={form.term}
                                                    onChange={handleInputChange}
                                                >
                                                    {TERMS.map(term => (
                                                        <option key={term} value={term}>{term}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="mbs-step-actions">
                                                <button
                                                    type="button"
                                                    className="mbs-btn-secondary"
                                                    onClick={handlePrevStep}
                                                >
                                                    <ArrowLeft size={16} />
                                                    <span>Previous Step</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="mbs-btn-primary"
                                                    onClick={handleNextStep}
                                                >
                                                    <span>Proceed to Course Subjects</span>
                                                    <ArrowRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* ============================================================ */}
                                    {/* STEP 3: SUBJECT UNITS & ENDORSEMENT                          */}
                                    {/* ============================================================ */}
                                    {currentStep === 3 && (
                                        <div className="mbs-form-step-pane">
                                            <div className="mbs-step-intro">
                                                <div className="step-counter-tag">STEP 3 OF 4</div>
                                                <h3>Course Load &amp; Pastoral Endorsement</h3>
                                                <p>Select your semester unit volume and focus theological topics.</p>
                                            </div>

                                            {/* UNIT LOAD */}
                                            <div className="mbs-field-group">
                                                <label htmlFor="unitLoad">Planned Unit Load</label>
                                                <select
                                                    id="unitLoad"
                                                    name="unitLoad"
                                                    value={form.unitLoad}
                                                    onChange={handleInputChange}
                                                >
                                                    {UNIT_LOADS.map(load => (
                                                        <option key={load.value} value={load.value}>{load.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* SUBJECT CHECKBOXES */}
                                            <div className="mbs-field-group">
                                                <label>Focus Subjects of Interest (Select all that apply)</label>
                                                <div className="mbs-subjects-grid">
                                                    {SUBJECT_OPTIONS.map(subject => {
                                                        const isChecked = form.selectedSubjects.includes(subject);
                                                        return (
                                                            <div
                                                                key={subject}
                                                                className={`mbs-subject-checkbox-item ${isChecked ? "checked" : ""}`}
                                                                onClick={() => toggleSubject(subject)}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => {}} // handled by parent onClick
                                                                />
                                                                <span>{subject}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* PASTORAL ENDORSEMENT */}
                                            <div className="mbs-field-group">
                                                <label htmlFor="pastorEndorsement">
                                                    Sponsoring Pastor / Church Leader Endorsement
                                                </label>
                                                <input
                                                    type="text"
                                                    id="pastorEndorsement"
                                                    name="pastorEndorsement"
                                                    value={form.pastorEndorsement}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. Endorsed by Rev. Samuel Santos (Senior Pastor, Grace Bible Church)"
                                                />
                                                <small className="mbs-field-hint">
                                                    Optional for initial inquiry. Formal endorsement letters may be submitted upon module enrollment.
                                                </small>
                                            </div>

                                            {/* ADDITIONAL NOTES */}
                                            <div className="mbs-field-group">
                                                <label htmlFor="additionalNotes">
                                                    Additional Remarks, Modular Inquiries or Subsidy Questions
                                                </label>
                                                <textarea
                                                    id="additionalNotes"
                                                    name="additionalNotes"
                                                    rows={3}
                                                    value={form.additionalNotes}
                                                    onChange={handleInputChange}
                                                    placeholder="Mention any questions regarding class schedule, venue accommodation, transfer unit crediting, or subsidized tuition..."
                                                />
                                            </div>

                                            <div className="mbs-step-actions">
                                                <button
                                                    type="button"
                                                    className="mbs-btn-secondary"
                                                    onClick={handlePrevStep}
                                                >
                                                    <ArrowLeft size={16} />
                                                    <span>Previous Step</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="mbs-btn-primary"
                                                    onClick={handleNextStep}
                                                >
                                                    <span>Review Enrollment Dossier</span>
                                                    <ArrowRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* ============================================================ */}
                                    {/* STEP 4: REVIEW & DIRECT DATABASE SUBMISSION                  */}
                                    {/* ============================================================ */}
                                    {currentStep === 4 && (
                                        <div className="mbs-form-step-pane">
                                            <div className="mbs-step-intro">
                                                <div className="step-counter-tag">STEP 4 OF 4</div>
                                                <h3>Review &amp; Submit Directly to System Database</h3>
                                                <p>Verify all details before recording your enrollment in the central registrar inquiries database.</p>
                                            </div>

                                            {/* REVIEW RECAP BOX */}
                                            <div className="mbs-review-card">
                                                <div className="mbs-review-header">
                                                    <GraduationCap size={20} className="review-icon" />
                                                    <div>
                                                        <strong>{form.fullName || "Enrollee"}</strong>
                                                        <small>{form.churchName} &bull; {form.ministryRole}</small>
                                                    </div>
                                                </div>

                                                <div className="mbs-review-grid">
                                                    <div>
                                                        <span className="review-label">Contact Email</span>
                                                        <strong>{form.email}</strong>
                                                    </div>
                                                    <div>
                                                        <span className="review-label">Phone / WhatsApp</span>
                                                        <strong>{form.phone}</strong>
                                                    </div>
                                                    <div>
                                                        <span className="review-label">Degree Curriculum</span>
                                                        <strong className="text-gold">{form.program}</strong>
                                                    </div>
                                                    <div>
                                                        <span className="review-label">Enrollee Type</span>
                                                        <strong>{form.enrollmentType}</strong>
                                                    </div>
                                                    <div>
                                                        <span className="review-label">Delivery Mode</span>
                                                        <strong>{form.learningMode}</strong>
                                                    </div>
                                                    <div>
                                                        <span className="review-label">Semester Cohort</span>
                                                        <strong>{form.term}</strong>
                                                    </div>
                                                    <div>
                                                        <span className="review-label">Unit Load</span>
                                                        <strong>{form.unitLoad}</strong>
                                                    </div>
                                                    <div>
                                                        <span className="review-label">Subjects Chosen</span>
                                                        <strong>{form.selectedSubjects.length} Focus Modules</strong>
                                                    </div>
                                                </div>

                                                {form.pastorEndorsement && (
                                                    <div className="mbs-review-endorsement">
                                                        <span className="review-label">Pastoral Endorsement:</span>
                                                        <em>&ldquo;{form.pastorEndorsement}&rdquo;</em>
                                                    </div>
                                                )}

                                                <div className="mbs-database-pipe-note">
                                                    <ShieldCheck size={16} />
                                                    <span>
                                                        Direct System Integration: Submitting this form creates an official entry in the <code>DemoRequests</code> database table with category <strong>Admissions &amp; Enrollment</strong>. The admissions committee receives instant notification.
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mbs-step-actions">
                                                <button
                                                    type="button"
                                                    className="mbs-btn-secondary"
                                                    onClick={handlePrevStep}
                                                    disabled={isSubmitting}
                                                >
                                                    <ArrowLeft size={16} />
                                                    <span>Back to Edit</span>
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="mbs-btn-submit"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <RefreshCw size={16} className="spin" />
                                                            <span>Recording in System Database...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 size={16} />
                                                            <span>Confirm &amp; Submit Online Enrollment</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                </form>
                            </div>

                            {/* SIDEBAR SUMMARY & TRUST COLUMN */}
                            <aside className="mbs-enrollment-sidebar">

                                {/* TUITION & SUBSIDY CARD */}
                                <div className="mbs-sidebar-card">
                                    <div className="mbs-sidebar-card-badge">MINISTERIAL TUITION SUBSIDY</div>
                                    <h4>Affordable Biblical Training</h4>
                                    <p className="mbs-sidebar-desc">
                                        Through church partnership grants, tuition is heavily subsidized for pastors, workers, and modular students.
                                    </p>

                                    <div className="mbs-subsidy-highlight">
                                        <div className="subsidy-pct">80% OFF</div>
                                        <div className="subsidy-text">
                                            <strong>Pastoral Grant Active</strong>
                                            <small>Modular Cohorts 2026-2027</small>
                                        </div>
                                    </div>

                                    <ul className="mbs-subsidy-features">
                                        <li>
                                            <Check size={14} className="check-icon" />
                                            <span>Full access to MBS Theological LMS cloud library</span>
                                        </li>
                                        <li>
                                            <Check size={14} className="check-icon" />
                                            <span>Printed/Digital exegetical modular syllabi</span>
                                        </li>
                                        <li>
                                            <Check size={14} className="check-icon" />
                                            <span>Convenient PayMongo checkout (GCash, Maya, Cards)</span>
                                        </li>
                                        <li>
                                            <Check size={14} className="check-icon" />
                                            <span>Pastoral certification &amp; official transcript</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* REGISTRAR INQUIRIES DESK */}
                                <div className="mbs-sidebar-card support-card">
                                    <h4>Direct Registrar Inquiries</h4>
                                    <p>Have questions about prerequisites, credit transfer, or modular hub venues?</p>

                                    <div className="mbs-sidebar-contact-row">
                                        <Phone size={15} />
                                        <span>+63 (02) 8800-BIBLE &bull; +63 917 123 4567</span>
                                    </div>
                                    <div className="mbs-sidebar-contact-row">
                                        <Mail size={15} />
                                        <span>admissions@mobilebibleschool.edu.ph</span>
                                    </div>
                                    <div className="mbs-sidebar-contact-row">
                                        <MapPin size={15} />
                                        <span>Seminary Admissions Office &bull; Metro Manila</span>
                                    </div>

                                    <button
                                        type="button"
                                        className="mbs-sidebar-btn"
                                        onClick={() => handleNavigate("contact")}
                                    >
                                        <span>Contact Campus Desk</span>
                                        <ArrowRight size={13} />
                                    </button>
                                </div>

                                {/* PAYMENT GATEWAY CALLOUT */}
                                <div className="mbs-sidebar-card payment-shortcut-card">
                                    <div className="mbs-payment-shortcut-header">
                                        <CreditCard size={18} className="shortcut-icon" />
                                        <div>
                                            <strong>Already Enrolled?</strong>
                                            <small>Pay tuition &amp; matriculation directly</small>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="mbs-sidebar-pay-btn"
                                        onClick={() => handleNavigate("client-payment")}
                                    >
                                        <span>Open PayMongo Payment Desk</span>
                                        <ArrowRight size={13} />
                                    </button>
                                </div>

                            </aside>

                        </div>
                    )}

                </div>
            </main>

            {/* PUBLIC FOOTER */}
            <PublicFooter onNavigate={handleNavigate} />
        </div>
    );
};

export default OnlineEnrollmentPage;
