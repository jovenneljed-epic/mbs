// ============================================================
// SchoolNumberAuthModal.tsx
// Verification Modal requiring valid School Number (Student ID / Faculty ID)
// for posting thoughts, questions, and discussion comments in LMS
// ============================================================

import React, { useState } from "react";
import "./SchoolNumberAuthModal.css";
import {
    verifyStudentSchoolNumber,
    type LmsStudentSession
} from "../services/lmsCommunityService";
import {
    X,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    GraduationCap,
    Lock,
    UserCheck,
    BookOpen
} from "lucide-react";

interface SchoolNumberAuthModalProps {
    isOpen: boolean;
    onSuccess: (session: LmsStudentSession) => void;
    onClose: () => void;
    onNavigatePortal?: (portal: "student" | "admin") => void;
}

export const SchoolNumberAuthModal: React.FC<SchoolNumberAuthModalProps> = ({
    isOpen,
    onSuccess,
    onClose,
    onNavigatePortal
}) => {
    const [schoolNumber, setSchoolNumber] = useState("");
    const [lastName, setLastName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!schoolNumber.trim()) {
            setError("Please enter your official School Number / Student ID.");
            return;
        }

        setLoading(true);
        try {
            const res = await verifyStudentSchoolNumber(schoolNumber, lastName);
            if (res.success && res.session) {
                setSuccessMessage(res.message);
                setTimeout(() => {
                    onSuccess(res.session!);
                    onClose();
                }, 1000);
            } else {
                setError(res.message);
            }
        } catch (err: any) {
            setError(err?.message || "Verification failed. Please check your school number.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="school-auth-overlay">
            <div className="school-auth-modal">
                {/* HEADER */}
                <div className="school-auth-header">
                    <div className="school-auth-badge">
                        <ShieldCheck size={22} color="#10B981" />
                    </div>
                    <div className="school-auth-title-col">
                        <h3>Student &amp; Faculty Verification</h3>
                        <p>Mobile Bible School &amp; Theological Seminary • LMS Discussion Gate</p>
                    </div>
                    <button
                        type="button"
                        className="school-auth-close-btn"
                        onClick={onClose}
                        title="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* NOTICE BANNER */}
                <div className="school-auth-notice">
                    <Lock size={16} className="school-auth-notice-icon" />
                    <p>
                        <strong>Authentication Required to Post or Comment:</strong> Free access is open to read all courses and discussions. However, sharing thoughts, asking questions, and replying in community chats is strictly reserved for <strong>students and faculties with official School Numbers</strong>.
                    </p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="school-auth-form">
                    {successMessage && (
                        <div className="school-auth-alert success">
                            <CheckCircle2 size={16} />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {error && (
                        <div className="school-auth-alert error">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <label className="school-auth-field">
                        <span>Official School Number / Student ID *</span>
                        <input
                            type="text"
                            placeholder="e.g. MBS-2024-108 or EPIC-2885"
                            value={schoolNumber}
                            onChange={e => setSchoolNumber(e.target.value)}
                            disabled={loading}
                            autoFocus
                        />
                        <small>Enter the ID code issued upon enrollment or seminary registration.</small>
                    </label>

                    <label className="school-auth-field">
                        <span>Student / Faculty Last Name (Optional Verification)</span>
                        <input
                            type="text"
                            placeholder="e.g. Morales, Santos, or Torres"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            disabled={loading}
                        />
                    </label>

                    <div className="school-auth-actions">
                        <button
                            type="button"
                            className="school-auth-btn-cancel"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="school-auth-btn-verify"
                            disabled={loading}
                        >
                            <UserCheck size={16} />
                            <span>{loading ? "Verifying Credentials..." : "Authenticate & Join Chat"}</span>
                        </button>
                    </div>
                </form>

                {/* ALTERNATIVE LOGIN OPTIONS */}
                <div className="school-auth-footer-options">
                    <span className="school-auth-or-line">Already have a portal login?</span>
                    <div className="school-auth-portal-links">
                        <button
                            type="button"
                            className="school-auth-portal-btn"
                            onClick={() => {
                                onClose();
                                onNavigatePortal?.("student");
                            }}
                        >
                            <GraduationCap size={14} />
                            <span>Student Portal Login</span>
                        </button>
                        <button
                            type="button"
                            className="school-auth-portal-btn admin"
                            onClick={() => {
                                onClose();
                                onNavigatePortal?.("admin");
                            }}
                        >
                            <BookOpen size={14} />
                            <span>Faculty / Admin Portal</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolNumberAuthModal;
