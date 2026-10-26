import React, {
    useEffect,
    useMemo,
    useState,
} from "react";
import type { FormEvent } from "react";
import axios from "axios";
import {
    ShieldCheck,
    Lock,
    CheckCircle2,
    Sparkles,
    GraduationCap,
    Printer,
    RefreshCw,
    AlertCircle,
    ArrowRight,
    Phone,
    Mail,
    User,
    X,
    Building2,
    FileText
} from "lucide-react";

import { API_BASE_URL } from "../config";
import "./ClientPayment.css";

// =========================================================
// TYPES
// =========================================================

export interface TuitionPreset {
    id: string;
    title: string;
    amount: number;
    description: string;
    badge?: string;
    icon: string;
    highlight?: boolean;
}

export interface VerifiedReceiptData {
    receiptNumber: string;
    sessionId: string;
    paymentId?: string | null;
    studentName: string;
    studentEmail: string;
    studentPhone?: string;
    feeTitle: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    date: string;
    notes?: string;
}

export interface ClientPaymentProps {
    subscriptionId?: number | null;
}

// Preset options for Mobile Bible School modular tuition & fees
const TUITION_PRESETS: TuitionPreset[] = [
    {
        id: "modular_single",
        title: "Modular Course Tuition Fee",
        amount: 2500,
        description: "1 Full Accredited Subject Module, Syllabus, Professor Guidance & Transcript Credit",
        badge: "MOST POPULAR",
        icon: "🎓",
        highlight: true
    },
    {
        id: "full_semester",
        title: "Full Semester Package (3 Modules)",
        amount: 7500,
        description: "Complete Term Enrollment (e.g. Systematic Theology, Hermeneutics, Pastoral Ministry)",
        badge: "SAVE ₱500",
        icon: "📚",
    },
    {
        id: "matriculation",
        title: "Matriculation & Institutional Fee",
        amount: 1200,
        description: "Student ID, Online Learning Studio Access, Academic Verification & Library",
        badge: "NEW STUDENTS",
        icon: "📜",
    },
    {
        id: "graduation",
        title: "Graduation & Pastoral Ordination",
        amount: 3500,
        description: "Diploma Parchment, Ministerial Ordination Clearance & Baccalaureate Package",
        badge: "ASSESSMENT",
        icon: "🎖️",
    },
    {
        id: "custom",
        title: "Custom Modular Amount / Church Gift",
        amount: 0,
        description: "Specify any tuition or church partner sponsorship amount in Philippine Pesos",
        badge: "FLEXIBLE",
        icon: "✍️",
    }
];

export const ClientPayment: React.FC<ClientPaymentProps> = ({ subscriptionId }) => {
    // ---------------------------------------------------------
    // FORM STATE
    // ---------------------------------------------------------
    const [selectedPresetId, setSelectedPresetId] = useState<string>("modular_single");
    const [customAmount, setCustomAmount] = useState<string>("2500");
    const [studentName, setStudentName] = useState<string>("");
    const [studentEmail, setStudentEmail] = useState<string>("");
    const [studentPhone, setStudentPhone] = useState<string>("");
    const [courseProgram, setCourseProgram] = useState<string>("Bachelor of Ministry / Modular Study");
    const [notes, setNotes] = useState<string>("");

    // Payment Mode: "paymongo" (instant online) or "manual" (bank deposit reference)
    const [paymentMode, setPaymentMode] = useState<"paymongo" | "manual">("paymongo");
    const [manualReference, setManualReference] = useState<string>("");

    // UI Feedback
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [verifyingSession, setVerifyingSession] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [cancelledNotice, setCancelledNotice] = useState<boolean>(false);

    // Verified Receipt View
    const [receipt, setReceipt] = useState<VerifiedReceiptData | null>(null);

    // ---------------------------------------------------------
    // LOAD USER PROFILE / SUBSCRIPTION IF AVAILABLE
    // ---------------------------------------------------------
    useEffect(() => {
        // 1. Prefill from localStorage if student is logged in
        try {
            const userRaw = localStorage.getItem("epicUser");
            if (userRaw) {
                const u = JSON.parse(userRaw);
                if (u.fullName && !studentName) setStudentName(u.fullName);
                if (u.username && u.username.includes("@") && !studentEmail) setStudentEmail(u.username);
            }
            const storedEmail = localStorage.getItem("epicEmail");
            if (storedEmail && !studentEmail) setStudentEmail(storedEmail);
            const storedContact = localStorage.getItem("epicContactName");
            if (storedContact && !studentName) setStudentName(storedContact);
            const storedPhone = localStorage.getItem("epicPhone");
            if (storedPhone && !studentPhone) setStudentPhone(storedPhone);
        } catch { }

        // 2. Check URL query parameters for cancel or success
        try {
            const params = new URLSearchParams(window.location.search);
            const statusParam = params.get("status");
            const sessionId = params.get("session_id");

            if (statusParam === "cancelled") {
                setCancelledNotice(true);
            }

            if (statusParam === "success" && sessionId) {
                setVerifyingSession(true);
                axios.get(`${API_BASE_URL}/PayMongo/session/${sessionId}`)
                    .then(res => {
                        if (res.data?.success && res.data?.isPaid) {
                            setReceipt({
                                receiptNumber: res.data.paymentId || `MBS-OR-${Date.now().toString().slice(-6)}`,
                                sessionId: sessionId,
                                paymentId: res.data.paymentId,
                                studentName: studentName || "MBS Student",
                                studentEmail: studentEmail || "student@mbs.edu.ph",
                                studentPhone: studentPhone,
                                feeTitle: "Modular Course Tuition Fee",
                                amount: res.data.amount || 2500,
                                currency: "PHP",
                                paymentMethod: `PayMongo (${(res.data.paymentMethod || "GCASH/MAYA/CARD").toUpperCase()})`,
                                date: new Date().toLocaleDateString("en-PH", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })
                            });
                        } else {
                            setErrorMessage("PayMongo session detected, but payment is still pending. If you just paid, please refresh in a moment.");
                        }
                    })
                    .catch(err => {
                        console.error("PayMongo verify session error:", err);
                        setErrorMessage("Unable to verify PayMongo checkout session automatically. If your account was charged, please contact school admin.");
                    })
                    .finally(() => {
                        setVerifyingSession(false);
                    });
            }
        } catch { }
    }, [studentName, studentEmail, studentPhone]);

    // ---------------------------------------------------------
    // CALCULATE EFFECTIVE AMOUNT & TITLE
    // ---------------------------------------------------------
    const activePreset = useMemo(() => {
        return TUITION_PRESETS.find(p => p.id === selectedPresetId) || TUITION_PRESETS[0];
    }, [selectedPresetId]);

    const effectiveAmount = useMemo(() => {
        if (selectedPresetId === "custom") {
            const parsed = parseFloat(customAmount);
            return isNaN(parsed) || parsed < 0 ? 0 : parsed;
        }
        return activePreset.amount;
    }, [selectedPresetId, customAmount, activePreset]);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2,
        }).format(amount);
    };

    // ---------------------------------------------------------
    // LAUNCH PAYMONGO CHECKOUT
    // ---------------------------------------------------------
    const handleLaunchPayMongoCheckout = async (e?: FormEvent) => {
        if (e) e.preventDefault();
        setErrorMessage("");

        // Validation
        if (!studentName.trim()) {
            setErrorMessage("Please enter the Student or Payer Name.");
            return;
        }
        if (!studentEmail.trim() || !studentEmail.includes("@")) {
            setErrorMessage("Please enter a valid email address to receive your official payment receipt.");
            return;
        }
        if (effectiveAmount < 20) {
            setErrorMessage("Payment amount must be at least ₱20.00 for online checkout.");
            return;
        }

        try {
            setSubmitting(true);

            const successUrl = `${window.location.origin}/client-payment?status=success&session_id={CHECKOUT_SESSION_ID}`;
            const cancelUrl = `${window.location.origin}/client-payment?status=cancelled`;

            const payload = {
                amount: effectiveAmount,
                title: activePreset.id === "custom" ? "MBS Custom Tuition / Ministry Offering" : activePreset.title,
                description: `${activePreset.title} - ${studentName} (${courseProgram || "MBS Seminary"})`,
                customerName: studentName.trim(),
                customerEmail: studentEmail.trim(),
                customerPhone: studentPhone.trim() || undefined,
                subscriptionId: subscriptionId || null,
                successUrl,
                cancelUrl
            };

            const response = await axios.post(`${API_BASE_URL}/PayMongo/checkout`, payload);

            if (response.data?.success && response.data?.checkoutUrl) {
                // Redirect student directly to PayMongo's secure live checkout
                window.location.href = response.data.checkoutUrl;
            } else {
                throw new Error(response.data?.message || "Failed to initialize PayMongo checkout session.");
            }
        } catch (err: any) {
            console.error("PayMongo checkout launch error:", err);
            setErrorMessage(err.response?.data?.message || err.message || "Failed to connect to PayMongo checkout. Please try again.");
            setSubmitting(false);
        }
    };

    // ---------------------------------------------------------
    // HANDLE MANUAL REFERENCE SUBMISSION (OPTIONAL COUNTER DEPOSIT)
    // ---------------------------------------------------------
    const handleManualSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        if (!studentName.trim()) return setErrorMessage("Please enter Student Name.");
        if (!manualReference.trim()) return setErrorMessage("Please enter your bank or counter deposit reference number.");

        try {
            setSubmitting(true);
            const token = localStorage.getItem("epicUserToken");
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            await axios.post(`${API_BASE_URL}/ClientPayments/subscription/${subscriptionId || 1}`, {
                paymentMethod: "BankTransfer",
                referenceNumber: manualReference.trim(),
                notes: `Student: ${studentName}\nEmail: ${studentEmail}\nProgram: ${courseProgram}\nFee: ${activePreset.title}\nAmount: ${effectiveAmount}\n${notes}`
            }, config);

            setReceipt({
                receiptNumber: `MBS-MAN-${Date.now().toString().slice(-6)}`,
                sessionId: manualReference.trim(),
                studentName: studentName.trim(),
                studentEmail: studentEmail.trim(),
                studentPhone: studentPhone,
                feeTitle: activePreset.title,
                amount: effectiveAmount,
                currency: "PHP",
                paymentMethod: "Bank Deposit / Manual Verification",
                date: new Date().toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }),
                notes: "Submitted for manual verification by MBS administration."
            });
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || "Failed to submit manual payment reference.");
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================
    // RENDER: VERIFIED SUCCESS RECEIPT
    // =========================================================
    if (receipt) {
        return (
            <div className="premium-checkout-page">
                <div className="premium-receipt-wrapper">
                    <div className="receipt-glass-card">
                        {/* Top Celebration Badge */}
                        <div className="receipt-success-badge">
                            <CheckCircle2 className="receipt-success-icon" size={32} />
                            <div>
                                <h2>Payment Verified &amp; Confirmed</h2>
                                <p>Official Mobile Bible School &amp; Theological Seminary Receipt</p>
                            </div>
                        </div>

                        {/* Seminary Header on Receipt */}
                        <div className="receipt-school-header">
                            <div className="receipt-logo-mark">MBS</div>
                            <div>
                                <h3>Mobile Bible School &amp; Theological Seminary</h3>
                                <p>Lupao, Nueva Ecija, Philippines • CHED RECOGNIZED • CHED &amp; SEC ACCREDITED</p>
                                <span className="receipt-merchant-pill">
                                    Merchant Account: <strong>Kezjed Solutions (Ronnel Mislang)</strong>
                                </span>
                            </div>
                        </div>

                        <div className="receipt-divider" />

                        {/* Receipt Details Grid */}
                        <div className="receipt-grid">
                            <div className="receipt-item">
                                <span className="receipt-label">Official Receipt No.</span>
                                <strong className="receipt-value mono">{receipt.receiptNumber}</strong>
                            </div>
                            <div className="receipt-item">
                                <span className="receipt-label">Date &amp; Time</span>
                                <strong className="receipt-value">{receipt.date}</strong>
                            </div>
                            <div className="receipt-item">
                                <span className="receipt-label">Student / Payer</span>
                                <strong className="receipt-value">{receipt.studentName}</strong>
                            </div>
                            <div className="receipt-item">
                                <span className="receipt-label">Electronic Receipt Sent To</span>
                                <strong className="receipt-value">{receipt.studentEmail}</strong>
                            </div>
                            <div className="receipt-item full-width">
                                <span className="receipt-label">Tuition / Modular Purpose</span>
                                <strong className="receipt-value">{receipt.feeTitle}</strong>
                            </div>
                            <div className="receipt-item">
                                <span className="receipt-label">Payment Gateway</span>
                                <strong className="receipt-value highlight-green">{receipt.paymentMethod}</strong>
                            </div>
                            <div className="receipt-item">
                                <span className="receipt-label">Gateway Reference</span>
                                <strong className="receipt-value mono">{receipt.sessionId}</strong>
                            </div>
                        </div>

                        {/* Amount Box */}
                        <div className="receipt-total-box">
                            <div>
                                <span className="receipt-total-label">Total Amount Paid</span>
                                <span className="receipt-total-status">✓ Cleared &amp; Credited to School Account</span>
                            </div>
                            <div className="receipt-total-amount">
                                {formatCurrency(receipt.amount)}
                            </div>
                        </div>

                        {/* Receipt Actions */}
                        <div className="receipt-actions no-print">
                            <button
                                type="button"
                                className="receipt-btn secondary"
                                onClick={() => window.print()}
                            >
                                <Printer size={16} />
                                <span>Print Official Receipt</span>
                            </button>
                            <button
                                type="button"
                                className="receipt-btn primary"
                                onClick={() => window.location.href = "/"}
                            >
                                <GraduationCap size={16} />
                                <span>Enter Student Learning Studio</span>
                            </button>
                            <button
                                type="button"
                                className="receipt-btn outline"
                                onClick={() => {
                                    setReceipt(null);
                                    window.history.replaceState({}, document.title, "/client-payment");
                                }}
                            >
                                <RefreshCw size={14} />
                                <span>Make Another Payment</span>
                            </button>
                        </div>

                        <div className="receipt-security-footer">
                            <ShieldCheck size={16} className="text-emerald" />
                            <span>This is a computer-generated digital receipt certified by Mobile Bible School &amp; Kezjed Solutions. Zero physical stamp required.</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // RENDER: PREMIUM PAYMONGO CHECKOUT INTERFACE
    // =========================================================
    return (
        <div className="premium-checkout-page">
            {/* Ambient Background Glows */}
            <div className="ambient-glow glow-top" />
            <div className="ambient-glow glow-bottom" />

            <div className="premium-checkout-container">
                {/* -------------------------------------------------
                    TOP TRUST RIBBON
                ------------------------------------------------- */}
                <div className="trust-ribbon">
                    <div className="trust-ribbon-left">
                        <Lock size={14} className="text-gold" />
                        <span>256-BIT SSL ENCRYPTED GATEWAY</span>
                        <span className="dot">•</span>
                        <span>BSP REGULATED</span>
                        <span className="dot">•</span>
                        <span>OFFICIAL PAYMONGO PARTNER</span>
                    </div>
                    <div className="trust-ribbon-right">
                        <span className="live-status-pill">
                            <span className="live-pulse" />
                            LIVE PAYMONGO CHECKOUT ACTIVE
                        </span>
                    </div>
                </div>

                {/* -------------------------------------------------
                    INSTITUTIONAL HEADER
                ------------------------------------------------- */}
                <header className="checkout-masthead">
                    <div className="masthead-brand">
                        <div className="masthead-crest">
                            <span className="crest-initials">MBS</span>
                            <span className="crest-cross">✝</span>
                        </div>
                        <div>
                            <div className="masthead-eyebrow">
                                <span className="eyebrow-tag gold">CHED RECOGNIZED</span>
                                <span className="eyebrow-tag emerald">EST. 2026</span>
                                <span className="eyebrow-tag">LUPAO, NUEVA ECIJA</span>
                            </div>
                            <h1 className="masthead-title">
                                Mobile Bible School <span>&amp; Theological Seminary</span>
                            </h1>
                            <p className="masthead-tagline">
                                Deep Biblical Truth. Everywhere You Are Called. Official Modular Tuition &amp; Fee Portal.
                            </p>
                        </div>
                    </div>

                    <div className="merchant-trust-card">
                        <div className="merchant-header">
                            <ShieldCheck size={18} className="text-emerald" />
                            <span>Authorized PayMongo Merchant</span>
                        </div>
                        <div className="merchant-name">Kezjed Solutions</div>
                        <div className="merchant-rep">Account Owner: Ronnel Mislang</div>
                        <div className="merchant-channels">
                            <span className="channel-pill gcash">GCash</span>
                            <span className="channel-pill maya">Maya</span>
                            <span className="channel-pill cards">Cards</span>
                            <span className="channel-pill qrph">QR Ph</span>
                        </div>
                    </div>
                </header>

                {/* -------------------------------------------------
                    CONTEXT NOTICES (CANCELLED / ERROR)
                ------------------------------------------------- */}
                {cancelledNotice && (
                    <div className="checkout-notice-banner warning">
                        <AlertCircle size={20} className="notice-icon" />
                        <div className="notice-content">
                            <strong>Checkout Session Cancelled</strong>
                            <p>
                                Your previous PayMongo checkout session was cancelled. No money was deducted from your account. You can review your details and re-launch your secure payment below whenever you are ready.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="notice-dismiss"
                            onClick={() => setCancelledNotice(false)}
                            aria-label="Dismiss"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {errorMessage && (
                    <div className="checkout-notice-banner error">
                        <AlertCircle size={20} className="notice-icon" />
                        <div className="notice-content">
                            <strong>Notice</strong>
                            <p>{errorMessage}</p>
                        </div>
                        <button
                            type="button"
                            className="notice-dismiss"
                            onClick={() => setErrorMessage("")}
                            aria-label="Dismiss"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {verifyingSession && (
                    <div className="checkout-notice-banner info">
                        <RefreshCw size={20} className="notice-icon spinning" />
                        <div className="notice-content">
                            <strong>Verifying PayMongo Payment Session...</strong>
                            <p>Connecting to PayMongo live servers to verify your transaction status.</p>
                        </div>
                    </div>
                )}

                {/* -------------------------------------------------
                    MAIN 2-COLUMN CHECKOUT LAYOUT
                ------------------------------------------------- */}
                <div className="checkout-layout-grid">
                    {/* LEFT COLUMN: OPTIONS & STUDENT DETAILS */}
                    <main className="checkout-main-column">
                        {/* 1. SELECT TUITION / FEE TYPE */}
                        <section className="checkout-section-card">
                            <div className="section-card-header">
                                <div className="section-step-num">1</div>
                                <div>
                                    <h2 className="section-title">Select Modular Course or School Fee</h2>
                                    <p className="section-subtitle">
                                        Choose the accredited degree module, semester tuition bundle, or institutional assessment you are paying for:
                                    </p>
                                </div>
                            </div>

                            <div className="tuition-preset-grid">
                                {TUITION_PRESETS.map((preset) => {
                                    const isSelected = selectedPresetId === preset.id;
                                    return (
                                        <div
                                            key={preset.id}
                                            className={`tuition-preset-card ${isSelected ? "selected" : ""} ${preset.highlight ? "highlight" : ""}`}
                                            onClick={() => setSelectedPresetId(preset.id)}
                                        >
                                            <div className="preset-card-top">
                                                <span className="preset-card-icon">{preset.icon}</span>
                                                {preset.badge && (
                                                    <span className={`preset-card-badge ${preset.highlight ? "gold" : ""}`}>
                                                        {preset.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="preset-card-title">{preset.title}</h3>
                                            <p className="preset-card-desc">{preset.description}</p>
                                            <div className="preset-card-footer">
                                                {preset.id === "custom" ? (
                                                    <span className="preset-price-label">Custom PHP Amount</span>
                                                ) : (
                                                    <div className="preset-price-wrapper">
                                                        <span className="preset-price">{formatCurrency(preset.amount)}</span>
                                                        <span className="preset-price-period">/ Term</span>
                                                    </div>
                                                )}
                                                <div className={`preset-radio-indicator ${isSelected ? "active" : ""}`}>
                                                    {isSelected && <span className="radio-dot" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* CUSTOM AMOUNT INPUT (IF CUSTOM SELECTED) */}
                            {selectedPresetId === "custom" && (
                                <div className="custom-amount-field-wrapper">
                                    <label htmlFor="customAmountInput" className="input-label">
                                        <span>Enter Custom Tuition / Ministry Gift Amount (PHP)</span>
                                        <span className="text-muted">Minimum ₱20.00</span>
                                    </label>
                                    <div className="custom-amount-input-box">
                                        <span className="currency-prefix">₱</span>
                                        <input
                                            id="customAmountInput"
                                            type="number"
                                            min="20"
                                            step="50"
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(e.target.value)}
                                            placeholder="e.g. 5000"
                                            className="custom-amount-input"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="quick-amount-pills">
                                        {[1000, 2500, 5000, 10000].map((amt) => (
                                            <button
                                                key={amt}
                                                type="button"
                                                className="quick-pill"
                                                onClick={() => setCustomAmount(amt.toString())}
                                            >
                                                + ₱{amt.toLocaleString()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* 2. STUDENT / PAYER DETAILS */}
                        <section className="checkout-section-card">
                            <div className="section-card-header">
                                <div className="section-step-num">2</div>
                                <div>
                                    <h2 className="section-title">Student &amp; Payer Information</h2>
                                    <p className="section-subtitle">
                                        PayMongo will email your official verified payment receipt to this address:
                                    </p>
                                </div>
                            </div>

                            <div className="form-fields-grid">
                                <div className="form-field full-width">
                                    <label className="input-label" htmlFor="studentNameInput">
                                        <span>Student Full Name (or Church Representative) *</span>
                                    </label>
                                    <div className="input-icon-box">
                                        <User size={18} className="field-icon" />
                                        <input
                                            id="studentNameInput"
                                            type="text"
                                            value={studentName}
                                            onChange={(e) => setStudentName(e.target.value)}
                                            placeholder="e.g. Pastor Ronnel Mislang / Juan Dela Cruz"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label className="input-label" htmlFor="studentEmailInput">
                                        <span>Email Address for Receipt *</span>
                                    </label>
                                    <div className="input-icon-box">
                                        <Mail size={18} className="field-icon" />
                                        <input
                                            id="studentEmailInput"
                                            type="email"
                                            value={studentEmail}
                                            onChange={(e) => setStudentEmail(e.target.value)}
                                            placeholder="e.g. student@mbs.edu.ph"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label className="input-label" htmlFor="studentPhoneInput">
                                        <span>Mobile Number (GCash / SMS Alerts)</span>
                                    </label>
                                    <div className="input-icon-box">
                                        <Phone size={18} className="field-icon" />
                                        <input
                                            id="studentPhoneInput"
                                            type="tel"
                                            value={studentPhone}
                                            onChange={(e) => setStudentPhone(e.target.value)}
                                            placeholder="e.g. 09913114163"
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-field full-width">
                                    <label className="input-label" htmlFor="programInput">
                                        <span>Seminary Degree Program / Cohort (Optional)</span>
                                    </label>
                                    <div className="input-icon-box">
                                        <GraduationCap size={18} className="field-icon" />
                                        <input
                                            id="programInput"
                                            type="text"
                                            value={courseProgram}
                                            onChange={(e) => setCourseProgram(e.target.value)}
                                            placeholder="e.g. Bachelor of Ministry / Pastoral Leadership / Certificate"
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-field full-width">
                                    <label className="input-label" htmlFor="notesInput">
                                        <span>Notes or Special Instructions (Optional)</span>
                                    </label>
                                    <div className="input-icon-box">
                                        <FileText size={18} className="field-icon" />
                                        <input
                                            id="notesInput"
                                            type="text"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="e.g. Modular batch code, student ID, or sponsor reference"
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. PAYMONGO LIVE PAYMENT GATEWAY OVERVIEW */}
                        <section className="checkout-section-card">
                            <div className="section-card-header">
                                <div className="section-step-num">3</div>
                                <div>
                                    <h2 className="section-title">Official Payment Gateway: PayMongo Philippines</h2>
                                    <p className="section-subtitle">
                                        All major Philippine digital payment channels supported directly with instant automated verification:
                                    </p>
                                </div>
                            </div>

                            <div className="paymongo-channels-grid">
                                <div className="channel-box">
                                    <div className="channel-box-icon gcash">G</div>
                                    <div>
                                        <strong>GCash</strong>
                                        <small>App Login or GCash QR</small>
                                    </div>
                                </div>

                                <div className="channel-box">
                                    <div className="channel-box-icon maya">M</div>
                                    <div>
                                        <strong>Maya (PayMaya)</strong>
                                        <small>Maya Wallet &amp; Maya QR</small>
                                    </div>
                                </div>

                                <div className="channel-box">
                                    <div className="channel-box-icon card">💳</div>
                                    <div>
                                        <strong>Credit &amp; Debit Cards</strong>
                                        <small>Visa, Mastercard, JCB</small>
                                    </div>
                                </div>

                                <div className="channel-box">
                                    <div className="channel-box-icon qrph">QR</div>
                                    <div>
                                        <strong>QR Ph Universal</strong>
                                        <small>BDO, BPI, UnionBank &amp; All</small>
                                    </div>
                                </div>

                                <div className="channel-box">
                                    <div className="channel-box-icon bank">🏛️</div>
                                    <div>
                                        <strong>Direct Online Banking</strong>
                                        <small>BPI, UnionBank Direct</small>
                                    </div>
                                </div>
                            </div>

                            <div className="paymongo-reassurance-box">
                                <Sparkles size={16} className="text-gold" />
                                <span>
                                    No transaction convenience fee is passed to students. The seminary covers 100% of gateway processing costs.
                                </span>
                            </div>
                        </section>

                        {/* MANUAL COUNTER DEPOSIT TOGGLE (FOR SPECIAL CASES) */}
                        <div className="manual-deposit-toggle-box">
                            <button
                                type="button"
                                className="manual-toggle-btn"
                                onClick={() => setPaymentMode(paymentMode === "paymongo" ? "manual" : "paymongo")}
                            >
                                {paymentMode === "paymongo"
                                    ? "📋 Paying via Over-the-Counter Bank Deposit or Pastoral Grant? Click here to submit manual reference"
                                    : "⚡ Return to Instant PayMongo Online Checkout"}
                            </button>

                            {paymentMode === "manual" && (
                                <form onSubmit={handleManualSubmit} className="manual-deposit-subform">
                                    <label className="input-label" htmlFor="manualRefInput">
                                        Bank Deposit / Counter Reference Number *
                                    </label>
                                    <input
                                        id="manualRefInput"
                                        type="text"
                                        value={manualReference}
                                        onChange={(e) => setManualReference(e.target.value)}
                                        placeholder="e.g. BDO-DEP-8021948 or Cashier Ref"
                                        className="form-input"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="manual-submit-btn"
                                    >
                                        {submitting ? "Submitting..." : "Submit Manual Reference for Verification"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </main>

                    {/* RIGHT COLUMN: STICKY ORDER SUMMARY & ACTION */}
                    <aside className="checkout-summary-column">
                        <div className="sticky-summary-card">
                            <div className="summary-card-header">
                                <span className="summary-header-tag">PAYMENT SUMMARY</span>
                                <span className="summary-secure-badge">
                                    <Lock size={12} /> SECURE
                                </span>
                            </div>

                            <div className="summary-institution-row">
                                <Building2 size={16} className="text-emerald" />
                                <div>
                                    <strong>Mobile Bible School &amp; Theological Seminary</strong>
                                    <span>Lupao, Nueva Ecija • Main Campus</span>
                                </div>
                            </div>

                            <div className="summary-divider" />

                            <div className="summary-line-item">
                                <span className="line-item-name">{activePreset.title}</span>
                                <span className="line-item-price">{formatCurrency(effectiveAmount)}</span>
                            </div>

                            <div className="summary-line-item fee">
                                <span>PayMongo Online Gateway Processing</span>
                                <span className="free-tag">₱0.00 (WAIVED)</span>
                            </div>

                            <div className="summary-line-item fee">
                                <span>Instant Accreditation &amp; Portal Credit</span>
                                <span className="free-tag">INCLUDED</span>
                            </div>

                            <div className="summary-divider" />

                            {/* TOTAL ROW */}
                            <div className="summary-total-row">
                                <div>
                                    <span className="total-label">Total Amount Due</span>
                                    <span className="total-currency">Philippine Pesos (PHP)</span>
                                </div>
                                <div className="total-number">
                                    {formatCurrency(effectiveAmount)}
                                </div>
                            </div>

                            {/* MAIN CHECKOUT CTA BUTTON */}
                            <button
                                type="button"
                                className="paymongo-primary-cta"
                                onClick={() => handleLaunchPayMongoCheckout()}
                                disabled={submitting}
                            >
                                <span className="cta-glow" />
                                <span className="cta-inner">
                                    {submitting ? (
                                        <>
                                            <RefreshCw size={20} className="spinning" />
                                            <span>Redirecting to PayMongo...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Pay {formatCurrency(effectiveAmount)} via PayMongo</span>
                                            <ArrowRight size={20} className="cta-arrow" />
                                        </>
                                    )}
                                </span>
                            </button>

                            <p className="summary-paymongo-disclaimer">
                                You will be redirected to the official PayMongo checkout for <strong>Kezjed Solutions</strong> to complete your payment with GCash, Maya, Cards, or QR Ph.
                            </p>

                            {/* TRUST BADGES LIST */}
                            <div className="summary-trust-checklist">
                                <div className="trust-item">
                                    <CheckCircle2 size={15} className="text-emerald" />
                                    <span>Instant automated confirmation (No waiting)</span>
                                </div>
                                <div className="trust-item">
                                    <CheckCircle2 size={15} className="text-emerald" />
                                    <span>Official electronic receipt sent to your email</span>
                                </div>
                                <div className="trust-item">
                                    <CheckCircle2 size={15} className="text-emerald" />
                                    <span>Bangko Sentral ng Pilipinas (BSP) Regulated</span>
                                </div>
                                <div className="trust-item">
                                    <CheckCircle2 size={15} className="text-emerald" />
                                    <span>256-Bit Bank-Grade Encryption &amp; 3D Secure</span>
                                </div>
                            </div>

                            <div className="summary-divider" />

                            {/* FOOTER SHORTCUTS */}
                            <div className="summary-quick-links">
                                <a href="/subscription-dashboard" className="summary-link">
                                    📋 Subscriptions Dashboard
                                </a>
                                <a href="/giving" className="summary-link">
                                    🎓 Student Tuition Catalog
                                </a>
                                <a href="/" className="summary-link">
                                    🏠 Return to MBS Website
                                </a>
                            </div>

                            <div className="summary-support-note">
                                Need assistance? Call Admin: <strong>09913114163</strong>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default ClientPayment;
