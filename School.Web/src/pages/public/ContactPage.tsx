// ============================================================
// ContactPage.tsx -> MOBILE BIBLE SCHOOL & THEOLOGICAL SEMINARY
// Official Public Contact & Inquiries Center
// Direct Pipeline to Admin CMS Inquiries + Auto Email Resender
// ============================================================

import React, { useState, useEffect } from "react";
import { applyGlobalTheme } from "../../services/landingPageContent";
import PublicHeader from "../../components/PublicHeader";
import "./ContactPage.css";
import "./PublicUnisonTheme.css";
import { API_BASE_URL } from "../../config";
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Calendar,
    CheckCircle,
    RefreshCw,
    Send,
    BookOpen,
    GraduationCap,
    AlertCircle,
    Copy,
    Check,
    ShieldCheck
} from "lucide-react";

interface ContactPageProps {
    onNavigate?: (page: string) => void;
}

interface ContactFormData {
    fullName: string;
    email: string;
    phone: string;
    churchName: string; // Affiliation / Church / School
    position: string;   // Category / Subject
    message: string;
}

const INQUIRY_CATEGORIES = [
    "Admissions & Enrollment",
    "Academic Programs & Curriculum",
    "Tuition, Units & Fees",
    "Campus Tour & Visit Request",
    "System Demonstration Request",
    "Student Records & Credentials",
    "Partnership & Collaboration",
    "General Inquiries"
];

const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
    useEffect(() => {
        try {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        } catch {
            window.scrollTo(0, 0);
        }
        document.title = "Contact & Campus Inquiries | Mobile Bible School & Theological Seminary";
        applyGlobalTheme();
    }, []);

    const [form, setForm] = useState<ContactFormData>({
        fullName: "",
        email: "",
        phone: "",
        churchName: "",
        position: "Admissions & Enrollment",
        message: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<{
        demoRequestId?: number;
        trackingCode?: string;
        email?: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Auto Email Resender state
    const [resending, setResending] = useState(false);
    const [resendStatus, setResendStatus] = useState<string | null>(null);
    const [copiedTracking, setCopiedTracking] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (submitting) return;

        if (!form.fullName.trim()) {
            setError("Please enter your full name.");
            return;
        }

        if (!form.email.trim() || !form.email.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!form.message.trim()) {
            setError("Please enter your message or question.");
            return;
        }

        setSubmitting(true);
        setError(null);
        setResendStatus(null);

        try {
            const payload = {
                fullName: form.fullName.trim(),
                churchName: form.churchName.trim() || "Independent Candidate / General Inquirer",
                email: form.email.trim().toLowerCase(),
                phone: form.phone.trim() || null,
                position: form.position.trim() || "General Inquiries",
                message: form.message.trim(),
            };

            const response = await fetch(`${API_BASE_URL}/DemoRequests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to submit inquiry. Please verify your details."
                );
            }

            const id = data?.demoRequestId || 1;
            const tracking = data?.trackingCode || `MBS-INQ-${String(id).padStart(5, "0")}`;

            setSubmissionResult({
                demoRequestId: id,
                trackingCode: tracking,
                email: payload.email,
            });

            setSubmitted(true);
        } catch (err: any) {
            console.error("Contact submission error:", err);
            setError(err?.message || "Unable to send your message. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Auto Email Resender Trigger
    const handleResendConfirmation = async () => {
        if (!submissionResult?.demoRequestId || resending) return;

        setResending(true);
        setResendStatus(null);

        try {
            const response = await fetch(
                `${API_BASE_URL}/DemoRequests/${submissionResult.demoRequestId}/resend-confirmation`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data?.message || "Failed to resend confirmation email.");
            }

            setResendStatus(
                `✓ Confirmation email successfully resent to ${submissionResult.email}!`
            );
        } catch (err: any) {
            console.error("Auto email resender error:", err);
            setResendStatus(`⚠️ Could not resend email: ${err?.message || "Please try again later."}`);
        } finally {
            setResending(false);
        }
    };

    const handleCopyTracking = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedTracking(true);
        setTimeout(() => setCopiedTracking(false), 2500);
    };

    const handleResetForm = () => {
        setForm({
            fullName: "",
            email: "",
            phone: "",
            churchName: "",
            position: "Admissions & Enrollment",
            message: "",
        });
        setSubmitted(false);
        setSubmissionResult(null);
        setResendStatus(null);
        setError(null);
    };

    return (
        <div className="mbs-contact-page-root">
            <PublicHeader onNavigate={onNavigate} hideThemeSwitcher={true} />

            {/* =========================================================
                HERO SECTION
            ========================================================= */}
            <section className="mbs-contact-hero">
                <div className="mbs-contact-hero-glow" />
                <div className="mbs-contact-container">
                    <div className="mbs-contact-hero-content">
                        <span className="mbs-contact-hero-badge">
                            <ShieldCheck size={13} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />
                            Official Admissions &amp; Campus Inquiries
                        </span>

                        <h1 className="mbs-contact-hero-title">
                            Connect With <span>Mobile Bible School</span>
                        </h1>

                        <p className="mbs-contact-hero-subtitle">
                            Theological Seminary &amp; Academic Institute — Have questions regarding our accredited degree programs, pastoral training, admissions, or course schedules? Our Admissions Directorate and Faculty Council are here to assist you.
                        </p>

                        <div className="mbs-contact-trust-row">
                            <div className="mbs-trust-item">
                                <GraduationCap size={15} color="var(--theme-secondary, #F59E0B)" />
                                <span>Accredited Theological Curricula</span>
                            </div>
                            <div className="mbs-trust-item">
                                <Send size={15} color="var(--theme-secondary, #F59E0B)" />
                                <span>Direct Campus Inquiry Pipeline</span>
                            </div>
                            <div className="mbs-trust-item">
                                <Mail size={15} color="var(--theme-secondary, #F59E0B)" />
                                <span>Automated Confirmation &amp; Tracking</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                MAIN CONTENT (GRID: INFO CARDS + FORM)
            ========================================================= */}
            <main className="mbs-contact-main-container">
                <div className="mbs-contact-layout-grid">

                    {/* LEFT COLUMN: CAMPUS INFORMATION & HOTLINES */}
                    <div className="mbs-contact-info-col">
                        <div className="mbs-info-section-header">
                            <span className="mbs-info-eyebrow">Direct Directory</span>
                            <h2>Campus Contact Desks</h2>
                            <p>
                                Reach out directly to our admissions officers, faculty deans, or academic registrars through our verified campus channels.
                            </p>
                        </div>

                        <div className="mbs-contact-cards-stack">
                            {/* Card 1: Admissions */}
                            <div className="mbs-contact-card">
                                <div className="mbs-contact-card-icon">
                                    <GraduationCap size={22} />
                                </div>
                                <div className="mbs-contact-card-body">
                                    <h3>Admissions &amp; Registrar</h3>
                                    <p>Degree enrollment, certificate courses, transcript requests, and scholarship qualifications.</p>
                                    <a href="mailto:admissions@mobilebibleschool.edu" className="mbs-contact-link">
                                        <Mail size={14} /> admissions@mobilebibleschool.edu
                                    </a>
                                </div>
                            </div>

                            {/* Card 2: Campus Hotline */}
                            <div className="mbs-contact-card">
                                <div className="mbs-contact-card-icon">
                                    <Phone size={22} />
                                </div>
                                <div className="mbs-contact-card-body">
                                    <h3>Campus Desk &amp; Hotlines</h3>
                                    <p>Direct telephone consultation with our administrative desk during active office hours.</p>
                                    <a href="tel:+639000000000" className="mbs-contact-link">
                                        <Phone size={14} /> +63 900 000 0000
                                    </a>
                                    <span className="mbs-contact-hours">
                                        <Clock size={12} /> Mon – Fri: 8:00 AM – 5:00 PM (PHT)
                                    </span>
                                </div>
                            </div>

                            {/* Card 3: Location */}
                            <div className="mbs-contact-card">
                                <div className="mbs-contact-card-icon">
                                    <MapPin size={22} />
                                </div>
                                <div className="mbs-contact-card-body">
                                    <h3>Seminary Main Campus</h3>
                                    <p>Mobile Bible School &amp; Theological Seminary Headquarters and Academic Complex.</p>
                                    <span className="mbs-contact-location-text">
                                        Mobile Bible School Campus, Philippines
                                    </span>
                                </div>
                            </div>

                            {/* Card 4: Dean Consultation */}
                            <div className="mbs-contact-card">
                                <div className="mbs-contact-card-icon">
                                    <BookOpen size={22} />
                                </div>
                                <div className="mbs-contact-card-body">
                                    <h3>Dean's Office &amp; Ministry Desk</h3>
                                    <p>For pastoral candidates, church partnerships, church-plant training, and dean consultations.</p>
                                    <a href="mailto:info@mobilebibleschool.edu" className="mbs-contact-link">
                                        <Mail size={14} /> info@mobilebibleschool.edu
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: INTERACTIVE INQUIRY FORM */}
                    <div className="mbs-contact-form-col">
                        <div className="mbs-form-wrapper-card">

                            {/* SUCCESS STATE WITH AUTO EMAIL RESENDER */}
                            {submitted && submissionResult ? (
                                <div className="mbs-form-success-card">
                                    <div className="mbs-success-badge-icon">
                                        <CheckCircle size={44} />
                                    </div>

                                    <h2>Inquiry Dispatched Successfully!</h2>
                                    <p className="mbs-success-subtitle">
                                        Your message has been officially recorded into our campus database and queued for review by our Admissions Directorate.
                                    </p>

                                    {/* Tracking Code Chip */}
                                    <div className="mbs-tracking-chip">
                                        <div>
                                            <small>Official Tracking Reference:</small>
                                            <strong>{submissionResult.trackingCode}</strong>
                                        </div>
                                        <button
                                            type="button"
                                            className="mbs-btn-copy"
                                            onClick={() => handleCopyTracking(submissionResult.trackingCode || "")}
                                            title="Copy Tracking ID"
                                        >
                                            {copiedTracking ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                                        </button>
                                    </div>

                                    {/* Auto Email Resender Section */}
                                    <div className="mbs-auto-resender-box">
                                        <div className="mbs-resender-header">
                                            <Mail size={18} color="var(--theme-secondary, #F59E0B)" />
                                            <div>
                                                <h4>Automated Email Confirmation</h4>
                                                <p>An official receipt has been sent to <strong>{submissionResult.email}</strong>.</p>
                                            </div>
                                        </div>

                                        <p className="mbs-resender-instructions">
                                            Please check your inbox (and spam/junk folder). If you have not received it within a few moments, you can trigger an automatic resend:
                                        </p>

                                        <button
                                            type="button"
                                            className="mbs-btn-auto-resend"
                                            onClick={handleResendConfirmation}
                                            disabled={resending}
                                        >
                                            {resending ? (
                                                <>
                                                    <RefreshCw size={15} className="spin" />
                                                    Resending Confirmation Email...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw size={15} />
                                                    Resend Confirmation Email Now
                                                </>
                                            )}
                                        </button>

                                        {resendStatus && (
                                            <div className="mbs-resend-feedback-alert">
                                                {resendStatus}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="mbs-success-actions">
                                        <button
                                            type="button"
                                            className="mbs-btn-primary"
                                            onClick={handleResetForm}
                                        >
                                            Send Another Message
                                        </button>
                                        <button
                                            type="button"
                                            className="mbs-btn-secondary"
                                            onClick={() => onNavigate ? onNavigate("events") : window.location.href = "/events"}
                                        >
                                            <Calendar size={14} /> Explore School Events
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* REGULAR CONTACT INQUIRY FORM */
                                <>
                                    <div className="mbs-form-header">
                                        <span className="mbs-form-tag">Interactive Campus Form</span>
                                        <h2>Submit Official Inquiry</h2>
                                        <p>
                                            Your message will route directly to our Admissions &amp; Inquiries module in the MBS administration portal.
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="mbs-form-error-alert" role="alert">
                                            <AlertCircle size={18} />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <form className="mbs-inquiry-form" onSubmit={handleSubmit}>
                                        {/* Category Select */}
                                        <div className="mbs-input-group">
                                            <label htmlFor="position">
                                                Inquiry Purpose / Category <span className="req">*</span>
                                            </label>
                                            <select
                                                id="position"
                                                name="position"
                                                value={form.position}
                                                onChange={handleChange}
                                                required
                                            >
                                                {INQUIRY_CATEGORIES.map((cat) => (
                                                    <option key={cat} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Full Name & Email */}
                                        <div className="mbs-form-row-2col">
                                            <div className="mbs-input-group">
                                                <label htmlFor="fullName">
                                                    Your Full Name <span className="req">*</span>
                                                </label>
                                                <input
                                                    id="fullName"
                                                    type="text"
                                                    name="fullName"
                                                    placeholder="Pastor / Brother / Sister Name"
                                                    value={form.fullName}
                                                    onChange={handleChange}
                                                    required
                                                    maxLength={150}
                                                />
                                            </div>

                                            <div className="mbs-input-group">
                                                <label htmlFor="email">
                                                    Email Address <span className="req">*</span>
                                                </label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    placeholder="your.email@example.com"
                                                    value={form.email}
                                                    onChange={handleChange}
                                                    required
                                                    maxLength={150}
                                                />
                                            </div>
                                        </div>

                                        {/* Phone & Affiliation */}
                                        <div className="mbs-form-row-2col">
                                            <div className="mbs-input-group">
                                                <label htmlFor="phone">
                                                    Phone / Mobile Number
                                                </label>
                                                <input
                                                    id="phone"
                                                    type="tel"
                                                    name="phone"
                                                    placeholder="+63 9XX XXX XXXX"
                                                    value={form.phone}
                                                    onChange={handleChange}
                                                    maxLength={50}
                                                />
                                            </div>

                                            <div className="mbs-input-group">
                                                <label htmlFor="churchName">
                                                    Church / Christian School / Organization
                                                </label>
                                                <input
                                                    id="churchName"
                                                    type="text"
                                                    name="churchName"
                                                    placeholder="e.g. Grace Fellowship, Independent, etc."
                                                    value={form.churchName}
                                                    onChange={handleChange}
                                                    maxLength={200}
                                                />
                                            </div>
                                        </div>

                                        {/* Message Textarea */}
                                        <div className="mbs-input-group">
                                            <label htmlFor="message">
                                                Your Inquiry or Consultation Message <span className="req">*</span>
                                            </label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                rows={5}
                                                placeholder="Please provide details regarding your inquiry, degree interest, questions, or preferred consultation dates..."
                                                value={form.message}
                                                onChange={handleChange}
                                                required
                                                maxLength={1000}
                                            />
                                            <small className="mbs-char-counter">
                                                {form.message.length} / 1000 characters
                                            </small>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            className="mbs-btn-submit-inquiry"
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <RefreshCw size={17} className="spin" />
                                                    Routing Message to Inquiries Desk...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={17} />
                                                    Submit Official Inquiry
                                                </>
                                            )}
                                        </button>

                                        <p className="mbs-form-disclaimer">
                                            🔒 All communications are confidential and processed in accordance with Mobile Bible School privacy and academic records policies. An automatic receipt will be dispatched to your email address.
                                        </p>
                                    </form>
                                </>
                            )}

                        </div>
                    </div>

                </div>
            </main>

            {/* =========================================================
                FOOTER
            ========================================================= */}
            <footer className="mbs-contact-footer">
                <div className="mbs-contact-container">
                    <div className="mbs-footer-content-row">
                        <div className="mbs-footer-brand-box">
                            <div className="mbs-footer-crest">
                                <BookOpen size={18} color="#FFFFFF" />
                            </div>
                            <div>
                                <h4>Mobile Bible School &amp; Theological Seminary</h4>
                                <small>Academic Portal &amp; Campus Communication System</small>
                            </div>
                        </div>
                        <div className="mbs-footer-nav">
                            <button type="button" onClick={() => onNavigate ? onNavigate("home") : window.location.href = "/home"}>Home</button>
                            <button type="button" onClick={() => onNavigate ? onNavigate("about") : window.location.href = "/about"}>About</button>
                            <button type="button" onClick={() => onNavigate ? onNavigate("events") : window.location.href = "/events"}>Events</button>
                            <button type="button" onClick={() => onNavigate ? onNavigate("announcements") : window.location.href = "/announcements"}>Announcements</button>
                            <button type="button" onClick={() => onNavigate ? onNavigate("learning") : window.location.href = "/learning"}>Theological LMS</button>
                        </div>
                    </div>
                    <div className="mbs-footer-bottom-row">
                        <span>© {new Date().getFullYear()} Mobile Bible School &amp; Theological Seminary. All rights reserved.</span>
                        <span>Equipping Disciples • Advancing Theological Scholarship • Proclaiming Truth</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ContactPage;
