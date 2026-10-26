
import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./PaymentPage.css";
import { API_BASE_URL } from "../config";

interface PaymentPageProps {
    onNavigate: (page: string) => void;
}

type PaymentMethod = "paymongo" | "gcash" | "gotyme";

const PaymentPage: React.FC<PaymentPageProps> = ({
    onNavigate,
}) => {
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod>("paymongo");

    const [referenceNumber, setReferenceNumber] =
        useState("");

    const [proofFile, setProofFile] =
        useState<File | null>(null);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    const handleFileChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0] ?? null;
        if (file && file.size > 5 * 1024 * 1024) {
            setProofFile(null);
            setErrorMessage("Payment proof must be 5 MB or smaller.");
            return;
        }
        if (file && !["image/png", "image/jpeg", "image/webp", "application/pdf"].includes(file.type)) {
            setProofFile(null);
            setErrorMessage("Please upload a PNG, JPG, WEBP, or PDF payment proof.");
            return;
        }
        setProofFile(file);
        setErrorMessage("");
    };

    const handlePayMongoDirect = async () => {
        setIsSubmitting(true);
        setErrorMessage("");
        try {
            const subscriptionId = Number(localStorage.getItem("epicSubscriptionId")) || null;
            const churchName = localStorage.getItem("epicChurchName") || "Mobile Bible School";
            const contactName = localStorage.getItem("epicContactName") || "Student";
            const contactEmail = localStorage.getItem("epicEmail") || "student@mbs.edu.ph";
            const contactPhone = localStorage.getItem("epicPhone") || "";
            const planAmount = Number(localStorage.getItem("epicPlanAmount")) || 2500;
            const planName = localStorage.getItem("epicPlanName") || "MBS Modular Course Tuition";

            const successUrl = `${window.location.origin}/thank-you?status=success&session_id={CHECKOUT_SESSION_ID}`;
            const cancelUrl = `${window.location.origin}/payment?status=cancelled`;

            const response = await fetch(`${API_BASE_URL}/PayMongo/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: planAmount,
                    title: planName,
                    description: `Modular Tuition Fee for ${churchName}`,
                    customerName: contactName,
                    customerEmail: contactEmail,
                    customerPhone: contactPhone,
                    subscriptionId: subscriptionId,
                    successUrl,
                    cancelUrl
                })
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.success || !data.checkoutUrl) {
                throw new Error(data.message || "Unable to initiate PayMongo checkout session.");
            }

            window.location.href = data.checkoutUrl;
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "Unable to initiate PayMongo checkout.");
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage("");

        if (paymentMethod === "paymongo") {
            await handlePayMongoDirect();
            return;
        }

        const subscriptionId = Number(localStorage.getItem("epicSubscriptionId"));
        if (!subscriptionId) return setErrorMessage("Your subscription session is missing. Please return to checkout and try again.");
        if (!referenceNumber.trim()) return setErrorMessage("Please enter your payment reference number.");
        if (!proofFile) return setErrorMessage("Please upload your payment screenshot or proof of payment.");

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("subscriptionId", String(subscriptionId));
            formData.append("referenceNumber", referenceNumber.trim());
            formData.append("paymentMethod", paymentMethod);
            formData.append("proof", proofFile);

            const response = await fetch(`${API_BASE_URL}/PublicCheckout/payment`, {
                method: "POST",
                body: formData,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.message || "Unable to submit your payment.");

            localStorage.setItem("epicPaymentId", String(data.paymentId));
            localStorage.setItem("epicPaymentMethod", paymentMethod);
            localStorage.setItem("epicPaymentReference", referenceNumber.trim());
            localStorage.setItem("epicPaymentSubmitted", "true");
            onNavigate("thank-you");
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "Unable to submit your payment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="epic-payment-page">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="epic-payment-header">

                <button
                    type="button"
                    className="epic-payment-logo"
                    onClick={() =>
                        onNavigate("landing")
                    }
                >
                    <span className="epic-payment-logo-mark">
                        EPIC
                    </span>

                    <span className="epic-payment-logo-text">
                        CHURCH MANAGEMENT
                    </span>
                </button>

                <div className="epic-payment-secure">
                    <span className="epic-secure-icon">
                        🔒
                    </span>

                    Secure Payment
                </div>
            </header>

            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="epic-payment-main">

                {/* BACK */}
                <button
                    type="button"
                    className="epic-payment-back"
                    onClick={() =>
                        onNavigate("checkout")
                    }
                >
                    ← Back to Checkout
                </button>

                <div className="epic-payment-layout">

                    {/* =================================================
                        LEFT — PAYMENT
                    ================================================= */}

                    <section className="epic-payment-card">

                        <div className="epic-payment-heading">

                            <div className="epic-payment-step">
                                STEP 3 OF 3
                            </div>

                            <h1>
                                Complete Your Payment
                            </h1>

                            <p>
                                Choose your preferred payment
                                method and complete your
                                EPIC Church Management System
                                subscription payment.
                            </p>

                        </div>

                        {/* PAYMENT METHODS */}

                        <div className="epic-payment-section">

                            <h2>
                                Choose Payment Method
                            </h2>

                            <div className="epic-payment-methods">

                                <button
                                    type="button"
                                    className={`epic-payment-method ${
                                        paymentMethod ===
                                        "paymongo"
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() => {
                                        setPaymentMethod(
                                            "paymongo"
                                        );
                                        setErrorMessage("");
                                    }}
                                >
                                    <span className="epic-method-icon" style={{ background: "#059669", color: "#fff" }}>
                                        ⚡
                                    </span>

                                    <span className="epic-method-content">
                                        <strong>
                                            PayMongo Instant
                                        </strong>

                                        <small>
                                            GCash, Maya, Cards, QR Ph
                                        </small>
                                    </span>

                                    <span className="epic-method-check">
                                        {paymentMethod ===
                                        "paymongo"
                                            ? "✓"
                                            : ""}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className={`epic-payment-method ${
                                        paymentMethod ===
                                        "gcash"
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() => {
                                        setPaymentMethod(
                                            "gcash"
                                        );
                                        setErrorMessage("");
                                    }}
                                >
                                    <span className="epic-method-icon">
                                        ₱
                                    </span>

                                    <span className="epic-method-content">
                                        <strong>
                                            GCash
                                        </strong>

                                        <small>
                                            Pay using GCash QR
                                        </small>
                                    </span>

                                    <span className="epic-method-check">
                                        {paymentMethod ===
                                        "gcash"
                                            ? "✓"
                                            : ""}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className={`epic-payment-method ${
                                        paymentMethod ===
                                        "gotyme"
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() => {
                                        setPaymentMethod(
                                            "gotyme"
                                        );
                                        setErrorMessage("");
                                    }}
                                >
                                    <span className="epic-method-icon gotyme">
                                        G
                                    </span>

                                    <span className="epic-method-content">
                                        <strong>
                                            GoTyme
                                        </strong>

                                        <small>
                                            Pay using GoTyme QR
                                        </small>
                                    </span>

                                    <span className="epic-method-check">
                                        {paymentMethod ===
                                        "gotyme"
                                            ? "✓"
                                            : ""}
                                    </span>
                                </button>

                            </div>
                        </div>

                        {/* QR CODE / PAYMONGO INFO */}

                        {paymentMethod === "paymongo" ? (
                            <div style={{
                                background: "linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)",
                                border: "1.5px solid #10B981",
                                borderRadius: "14px",
                                padding: "24px",
                                margin: "20px 0"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                                    <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                                        ⚡
                                    </div>
                                    <div>
                                        <strong style={{ fontSize: "16px", color: "#065F46", display: "block" }}>
                                            PayMongo Automated Live Checkout
                                        </strong>
                                        <span style={{ fontSize: "13px", color: "#047857" }}>
                                            Authorized Merchant: <strong>Kezjed Solutions</strong> (Ronnel Mislang)
                                        </span>
                                    </div>
                                </div>

                                <p style={{ fontSize: "14px", color: "#065F46", margin: "10px 0 16px", lineHeight: "1.5" }}>
                                    Pay directly via your GCash, Maya, Visa/Mastercard Debit/Credit Cards, or QR Ph. Your payment is verified instantly with zero waiting time!
                                </p>

                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
                                    <span style={{ background: "#007DFE", color: "#fff", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700 }}>GCASH</span>
                                    <span style={{ background: "#000000", color: "#fff", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700 }}>MAYA</span>
                                    <span style={{ background: "#1A1F71", color: "#fff", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700 }}>VISA / MASTERCARD</span>
                                    <span style={{ background: "#C2410C", color: "#fff", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700 }}>QR PH</span>
                                </div>

                                <p style={{ fontSize: "12px", color: "#047857", margin: "0" }}>
                                    🔒 Safe &amp; PCI-DSS Level 1 Compliant. No manual screenshot upload required.
                                </p>
                            </div>
                        ) : (
                        <div className="epic-qr-section">

                            <div className="epic-qr-heading">

                                <div>
                                    <h2>
                                        Scan to Pay
                                    </h2>

                                    <p>
                                        Open{" "}
                                        {paymentMethod ===
                                        "gcash"
                                            ? "GCash"
                                            : "GoTyme"}{" "}
                                        and scan the QR code
                                        below.
                                    </p>
                                </div>

                                <span className="epic-selected-method">
                                    {paymentMethod ===
                                    "gcash"
                                        ? "GCash"
                                        : "GoTyme"}
                                </span>

                            </div>

                            <div className="epic-qr-container">

                                <div className="epic-qr-frame">

                                    {paymentMethod ===
                                    "gcash" ? (
                                        <img
                                            src="/payment/gcash-qr.png"
                                            alt="EPIC GCash QR Code"
                                            className="epic-qr-image"
                                            onError={(event) => {
                                                event.currentTarget.style.display =
                                                    "none";

                                                const parent =
                                                    event.currentTarget
                                                        .parentElement;

                                                if (
                                                    parent
                                                ) {
                                                    parent.classList.add(
                                                        "qr-missing"
                                                    );
                                                }
                                            }}
                                        />
                                    ) : (
                                        <img
                                            src="/payment/gotyme-qr.png"
                                            alt="EPIC GoTyme QR Code"
                                            className="epic-qr-image"
                                            onError={(event) => {
                                                event.currentTarget.style.display =
                                                    "none";

                                                const parent =
                                                    event.currentTarget
                                                        .parentElement;

                                                if (
                                                    parent
                                                ) {
                                                    parent.classList.add(
                                                        "qr-missing"
                                                    );
                                                }
                                            }}
                                        />
                                    )}

                                    <div className="epic-qr-placeholder">

                                        <span>
                                            QR CODE
                                        </span>

                                        <small>
                                            Place your{" "}
                                            {paymentMethod ===
                                            "gcash"
                                                ? "GCash"
                                                : "GoTyme"}{" "}
                                            QR image at:
                                        </small>

                                        <code>
                                            /public/payment/
                                            {paymentMethod ===
                                            "gcash"
                                                ? "gcash-qr.png"
                                                : "gotyme-qr.png"}
                                        </code>

                                    </div>

                                </div>

                            </div>

                            <div className="epic-qr-instruction">
                                <span>
                                    1
                                </span>

                                <p>
                                    Open your{" "}
                                    {paymentMethod ===
                                    "gcash"
                                        ? "GCash"
                                        : "GoTyme"}{" "}
                                    app.
                                </p>
                            </div>

                            <div className="epic-qr-instruction">
                                <span>
                                    2
                                </span>

                                <p>
                                    Scan the QR code and
                                    complete the payment.
                                </p>
                            </div>

                            <div className="epic-qr-instruction">
                                <span>
                                    3
                                </span>

                                <p>
                                    Save your payment
                                    confirmation for your
                                    records.
                                </p>
                            </div>

                        </div>
                        )}

                        {/* PAYMENT DETAILS */}

                        <form
                            className="epic-payment-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="epic-payment-section">

                                <h2>
                                    Payment Details
                                </h2>

                                {paymentMethod !== "paymongo" && (
                                <>
                                <div className="epic-form-group">

                                    <label htmlFor="referenceNumber">
                                        Payment Reference Number
                                    </label>

                                    <input
                                        id="referenceNumber"
                                        type="text"
                                        value={
                                            referenceNumber
                                        }
                                        onChange={(event) =>
                                            setReferenceNumber(
                                                event.target
                                                    .value
                                            )
                                        }
                                        placeholder="Enter your transaction/reference number"
                                        autoComplete="off"
                                    />

                                    <small>
                                        Enter the reference number
                                        shown after your payment.
                                    </small>

                                </div>

                                <div className="epic-form-group">

                                    <label htmlFor="paymentProof">
                                        Proof of Payment
                                    </label>

                                    <label
                                        htmlFor="paymentProof"
                                        className="epic-upload-box"
                                    >
                                        <span className="epic-upload-icon">
                                            ↑
                                        </span>

                                        <strong>
                                            {proofFile
                                                ? proofFile.name
                                                : "Upload payment screenshot"}
                                        </strong>

                                        <small>
                                            PNG, JPG, WEBP or PDF • Max 5 MB
                                        </small>
                                    </label>

                                    <input
                                        id="paymentProof"
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp,application/pdf"
                                        onChange={
                                            handleFileChange
                                        }
                                        hidden
                                    />

                                </div>
                                </>
                                )}

                                {errorMessage && (
                                    <div className="epic-payment-error">
                                        <span>
                                            !
                                        </span>

                                        {errorMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="epic-submit-payment"
                                    disabled={
                                        isSubmitting
                                    }
                                    style={paymentMethod === "paymongo" ? { background: "#059669", borderColor: "#047857" } : undefined}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="epic-spinner" />
                                            {paymentMethod === "paymongo" ? "Connecting to PayMongo Checkout..." : "Submitting Payment..."}
                                        </>
                                    ) : (
                                        <>
                                            {paymentMethod === "paymongo" ? "💳 Proceed to PayMongo Checkout →" : "✓ Submit Payment"}
                                        </>
                                    )}
                                </button>

                                <p className="epic-payment-disclaimer">
                                    Your payment will be reviewed
                                    by the EPIC administration team
                                    before your subscription is
                                    activated.
                                </p>

                            </div>

                        </form>

                    </section>

                    {/* =================================================
                        RIGHT — ORDER SUMMARY
                    ================================================= */}

                    <aside className="epic-order-summary">

                        <div className="epic-summary-header">

                            <span>
                                YOUR ORDER
                            </span>

                            <span className="epic-summary-secure">
                                🔒
                            </span>

                        </div>

                        <div className="epic-summary-product">

                            <div className="epic-summary-product-icon">
                                E
                            </div>

                            <div>
                                <strong>
                                    EPIC Church Management
                                    System
                                </strong>

                                <span>
                                    Church subscription
                                </span>
                            </div>

                        </div>

                        <div className="epic-summary-divider" />

                        <div className="epic-summary-row">

                            <span>
                                Subscription
                            </span>

                            <strong>
                                EPIC CMS
                            </strong>

                        </div>

                        <div className="epic-summary-row">

                            <span>
                                Billing
                            </span>

                            <strong>
                                Monthly
                            </strong>

                        </div>

                        <div className="epic-summary-row">

                            <span>
                                Payment Method
                            </span>

                            <strong>
                                {paymentMethod ===
                                "gcash"
                                    ? "GCash"
                                    : "GoTyme"}
                            </strong>

                        </div>

                        <div className="epic-summary-divider" />

                        <div className="epic-summary-total">

                            <span>
                                Total
                            </span>

                            <strong>
                                ₱
                                <span className="epic-price-placeholder">
                                    Amount
                                </span>
                            </strong>

                        </div>

                        <div className="epic-summary-note">

                            <span>
                                ✓
                            </span>

                            <p>
                                Your subscription will be
                                activated after payment
                                verification.
                            </p>

                        </div>

                        <div className="epic-trust-list">

                            <div>
                                <span>
                                    🔒
                                </span>

                                Secure payment
                            </div>

                            <div>
                                <span>
                                    ✓
                                </span>

                                Manual payment verification
                            </div>

                            <div>
                                <span>
                                    ⚡
                                </span>

                                Fast account activation
                            </div>

                        </div>

                    </aside>

                </div>
            </main>

            {/* =====================================================
                FOOTER
            ===================================================== */}

            <footer className="epic-payment-footer">

                <span>
                    © {new Date().getFullYear()} EPIC Church
                    Management System
                </span>

                <span>
                    Engaging People Into Christ
                </span>

            </footer>

        </div>
    );
};

export default PaymentPage;

