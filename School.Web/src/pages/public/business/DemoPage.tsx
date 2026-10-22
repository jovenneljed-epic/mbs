import React, { useState } from "react";
import "../../../components/business/business.css";
import { API_BASE_URL } from "../../../config";

interface DemoPageProps {
    onNavigate?: (page: string) => void;
}

export default function DemoPage({
    onNavigate
}: DemoPageProps) {
    const [churchName, setChurchName] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        setError("");
        setSubmitting(true);

        try {
            const payload = {
                fullName: fullName.trim(),
                churchName: churchName.trim() || "School / Organization",
                email: email.trim().toLowerCase(),
                phone: phone.trim() || null,
                position: "System Demonstration Request",
                message: message.trim() || "Requested a live demonstration of the School Management System."
            };

            const response = await fetch(`${API_BASE_URL}/DemoRequests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data?.message || "Unable to submit demo request. Please try again.");
            }

            setSubmitted(true);
            setChurchName("");
            setFullName("");
            setEmail("");
            setPhone("");
            setMessage("");
        } catch (err: unknown) {
            const e = err as Error;
            setError(e.message || "Failed to submit demo request.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="business-page">
            <section className="business-hero">
                <div className="business-container">
                    <h1>
                        See MBS In Action
                    </h1>
                    <p>
                        Schedule a personalized demonstration and discover how our Academic & School Management System empowers your institution.
                    </p>
                </div>
            </section>

            <section className="business-section">
                <div className="business-container">
                    <div className="business-card">
                        <h2>
                            Request Your Demonstration
                        </h2>

                        {submitted && (
                            <div style={{
                                background: "#ecfdf5",
                                color: "#065f46",
                                padding: "14px 18px",
                                borderRadius: "8px",
                                marginBottom: "20px",
                                fontWeight: 500,
                                border: "1px solid #a7f3d0"
                            }}>
                                ✓ Thank you! Your demonstration request has been submitted. Our team will contact you shortly to schedule your walkthrough.
                            </div>
                        )}

                        {error && (
                            <div style={{
                                background: "#fef2f2",
                                color: "#991b1b",
                                padding: "14px 18px",
                                borderRadius: "8px",
                                marginBottom: "20px",
                                fontWeight: 500,
                                border: "1px solid #fecaca"
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="School or Institution Name"
                                value={churchName}
                                onChange={e => setChurchName(e.target.value)}
                                required
                            />

                            <input
                                type="text"
                                placeholder="Your Full Name"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                required
                            />

                            <input
                                type="email"
                                placeholder="Official Email Address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />

                            <input
                                type="tel"
                                placeholder="Contact Phone Number"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                            />

                            <textarea
                                placeholder="Tell us about your school programs, student count, or specific requirements"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                rows={4}
                            />

                            <button
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting ? "Submitting Request..." : "Submit Demonstration Request"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <section className="business-section light">
                <div className="business-container">
                    <h2>
                        What You Will Experience
                    </h2>

                    <div className="business-grid">
                        <div className="business-card">
                            <h3>
                                Academic System
                            </h3>
                            <p>
                                Collegiate admissions, student registry, class scheduling, and academic transcripts.
                            </p>
                        </div>

                        <div className="business-card">
                            <h3>
                                Financial Controls
                            </h3>
                            <p>
                                Multi-channel tuition collection, student fee statements, school income and expense ledgers.
                            </p>
                        </div>

                        <div className="business-card">
                            <h3>
                                Faculty & Students Corner
                            </h3>
                            <p>
                                Dedicated student and teacher portals, subject assignments, grading, and attendance tracking.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="business-cta">
                <div className="business-container">
                    <h2>
                        Ready to modernize your academic institution?
                    </h2>

                    <button
                        onClick={() =>
                            onNavigate?.("pricing")
                        }
                    >
                        View Plans
                    </button>
                </div>
            </section>
        </div>
    );
}
