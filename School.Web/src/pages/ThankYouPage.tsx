
import React from "react";
import "./ThankYouPage.css";

interface ThankYouPageProps {
    onNavigate: (page: string) => void;
}

const ThankYouPage: React.FC<ThankYouPageProps> = ({
    onNavigate,
}) => {
    const isPayMongoVerified = typeof window !== "undefined" && (
        new URLSearchParams(window.location.search).get("status") === "success" ||
        Boolean(new URLSearchParams(window.location.search).get("session_id"))
    );

    return (
        <div className="thankyou-page">
            {/* BACKGROUND EFFECTS */}
            <div className="thankyou-glow thankyou-glow-one" />
            <div className="thankyou-glow thankyou-glow-two" />

            <div className="thankyou-container">
                {/* SUCCESS ICON */}
                <div className="thankyou-success-icon">
                    <div className="thankyou-check">
                        ✓
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="thankyou-badge" style={isPayMongoVerified ? { background: "#059669", color: "#fff" } : undefined}>
                    {isPayMongoVerified ? "PAYMENT VERIFIED • PAYMONGO" : "PAYMENT SUBMITTED"}
                </div>

                <h1>
                    Welcome to{" "}
                    <span>MBS Seminary!</span>
                </h1>

                <h2>
                    {isPayMongoVerified
                        ? "Your payment is confirmed and your portal is active."
                        : "Your journey toward ministry excellence starts here."}
                </h2>

                <p className="thankyou-description">
                    {isPayMongoVerified
                        ? "Thank you for completing your tuition and modular enrollment payment via PayMongo. Your account has been automatically verified and activated for Kezjed Solutions / Mobile Bible School."
                        : "Thank you for choosing Mobile Bible School. Your payment information has been received and is now ready for verification."}
                </p>

                {/* STATUS CARD */}
                <div className="thankyou-status-card" style={isPayMongoVerified ? { borderColor: "#10B981", background: "#F0FDF4" } : undefined}>
                    <div className="thankyou-status-icon" style={isPayMongoVerified ? { background: "#D1FAE5", color: "#059669" } : undefined}>
                        ✓
                    </div>

                    <div className="thankyou-status-content">
                        <strong style={isPayMongoVerified ? { color: "#065F46" } : undefined}>
                            {isPayMongoVerified ? "Payment Verified Instantly (PayMongo)" : "Payment Received"}
                        </strong>

                        <span style={isPayMongoVerified ? { color: "#047857" } : undefined}>
                            {isPayMongoVerified
                                ? "Instant confirmation via GCash, Maya, Card, or QR Ph. You may now access all modular materials."
                                : "Our team will verify your payment and activate your subscription."}
                        </span>
                    </div>
                </div>

                {/* WHAT HAPPENS NEXT */}
                <div className="thankyou-next">
                    <div className="thankyou-section-label">
                        WHAT HAPPENS NEXT
                    </div>

                    <div className="thankyou-steps">
                        <div className="thankyou-step">
                            <div className="thankyou-step-number">
                                01
                            </div>

                            <div>
                                <strong>
                                    Payment Verification
                                </strong>

                                <p>
                                    Your submitted
                                    payment will be
                                    reviewed by our
                                    team.
                                </p>
                            </div>
                        </div>

                        <div className="thankyou-step">
                            <div className="thankyou-step-number">
                                02
                            </div>

                            <div>
                                <strong>
                                    Account Activation
                                </strong>

                                <p>
                                    Once verified,
                                    your EPIC account
                                    and subscription
                                    will be activated.
                                </p>
                            </div>
                        </div>

                        <div className="thankyou-step">
                            <div className="thankyou-step-number">
                                03
                            </div>

                            <div>
                                <strong>
                                    Start Managing
                                </strong>

                                <p>
                                    Access your church
                                    management tools
                                    and start using
                                    School.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="thankyou-actions">
                    <button
                        type="button"
                        className="thankyou-primary-button"
                        onClick={() =>
                            onNavigate("home")
                        }
                    >
                        <span>
                            Enter EPIC
                        </span>

                        <span className="thankyou-arrow">
                            →
                        </span>
                    </button>

                    <button
                        type="button"
                        className="thankyou-secondary-button"
                        onClick={() =>
                            onNavigate("landing")
                        }
                    >
                        Return to Website
                    </button>
                </div>

                {/* SUPPORT */}
                <div className="thankyou-support">
                    <span className="thankyou-support-icon">
                        ?
                    </span>

                    <span>
                        Need help? Contact the EPIC
                        team for assistance with
                        your account or payment.
                    </span>
                </div>

                {/* FOOTER */}
                <div className="thankyou-footer">
                    <div className="thankyou-footer-logo">
                        EPIC
                    </div>

                    <div>
                        <strong>
                            EPIC CHURCH MANAGEMENT
                            SYSTEM
                        </strong>

                        <span>
                            Engaging People Into
                            Christ
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThankYouPage;

