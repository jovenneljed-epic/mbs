import React, { useState, useEffect } from "react";
import {
    ArrowLeft,
    Printer,
    GraduationCap,
    BookOpen,
    User,
    CreditCard
} from "lucide-react";
import { API_BASE_URL } from "../../config";
import { courseCurriculumService } from "../../services/courseCurriculumService";
import type { CourseSubject } from "../../services/courseCurriculumService";
import { SchoolPrintService } from "../../utils/schoolPrintService";
import "./SchoolDocumentViewer.css";

export interface SchoolDocumentViewerProps {
    docId: string;
    docTitle: string;
    docDescription: string;
    onBack: () => void;
}

interface Member {
    memberId: number;
    memberCode?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    suffix?: string;
    gender?: string;
    birthDate?: string;
    civilStatus?: string;
    contactNumber?: string;
    email?: string;
    address?: string;
    ministry?: string;
    status?: string;
    dateJoined?: string;
    occupation?: string;
    notes?: string;
    photoPath?: string;
}

const getToken = (): string | null => {
    const keys = ["token", "accessToken", "jwt", "authToken", "epicToken"];
    for (const key of keys) {
        const value = localStorage.getItem(key);
        if (value) return value.replace(/^Bearer\s+/i, "").trim();
    }
    return null;
};

export const SchoolDocumentViewer: React.FC<SchoolDocumentViewerProps> = ({
    docId,
    docTitle,
    docDescription,
    onBack
}) => {
    const [students, setStudents] = useState<Member[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const baseUrl = API_BASE_URL.replace(/\/+$/, "");
                const token = getToken();
                const headers = new Headers();
                if (token) headers.set("Authorization", `Bearer ${token}`);

                const resp = await fetch(`${baseUrl}/Members`, { headers });
                if (resp.ok) {
                    const data = await resp.json();
                    const list = Array.isArray(data) ? data : data.members || data.data || [];
                    setStudents(list);
                    if (list.length > 0) {
                        setSelectedStudentId(list[0].memberId);
                    }
                }
            } catch (err) {
                console.error("Error loading document students:", err);
            } finally {
                setLoading(false);
            }
        };

        void loadInitialData();
    }, []);

    const selectedStudent = students.find(s => s.memberId === selectedStudentId) || students[0];

    // Parse student meta
    let parsedMeta: any = {};
    if (selectedStudent?.photoPath && selectedStudent.photoPath.startsWith("{")) {
        try {
            parsedMeta = JSON.parse(selectedStudent.photoPath);
        } catch {}
    }

    const getFullName = (s?: Member) => {
        if (!s) return "Student Candidate";
        return [s.firstName, s.middleName, s.lastName, s.suffix].filter(Boolean).join(" ").trim() || s.memberCode || "Student Candidate";
    };

    // Get student's enrolled subjects
    const enrolledCodes: string[] = Array.isArray(parsedMeta.subjects) && parsedMeta.subjects.length > 0
        ? parsedMeta.subjects
        : ["HERM-101", "OT-101", "NT-101", "THEO-101", "MIN-101"];

    const enrolledSubjects: CourseSubject[] = enrolledCodes.map(code => {
        const found = courseCurriculumService.getSubjectByCode(code);
        if (found) return found;
        return {
            code,
            title: "Biblical Theological Studies Module",
            units: 3,
            schedule: "Fri-Sun 8:00 AM - 12:00 PM (Modular)",
            room: "Modular Field Hub • Rm 101",
            instructor: "Faculty Coordinator"
        };
    });

    const totalUnits = enrolledSubjects.reduce((acc, s) => acc + s.units, 0);
    const ratePerUnit = parsedMeta.paymentPerUnit ?? 350;
    const totalTuition = parsedMeta.totalTuition ?? (totalUnits * ratePerUnit);
    const amountPaid = parsedMeta.amountPaid ?? 0;
    const balance = parsedMeta.balance ?? Math.max(0, totalTuition - amountPaid);
    const handlePrint = () => {
        SchoolPrintService.printDocument({
            docType: docId === "certificate-of-completion" ? "diploma" : docId === "transcript-of-records" ? "tor" : "com",
            docTitle,
            studentName: getFullName(selectedStudent),
            studentId: selectedStudent?.memberCode || `STD-2026-${String(selectedStudent?.memberId || 1).padStart(4, "0")}`,
            program: selectedStudent?.ministry || "Bachelor of Theology (B.Th.)",
            yearLevel: selectedStudent?.civilStatus || "1st Year",
            learningMode: parsedMeta.modeOfLearning || "Modular Field Cohort",
            contactNumber: selectedStudent?.contactNumber,
            email: selectedStudent?.email,
            address: selectedStudent?.address,
            guardianName: parsedMeta.guardianName,
            guardianContact: parsedMeta.guardianContact,
            subjects: enrolledSubjects,
            ratePerUnit,
            totalTuition,
            amountPaid,
            balance,
            paymentStatus: parsedMeta.paymentStatus || (totalTuition > 0 && balance <= 0 ? "PAID" : "PARTIAL")
        });
    };

    if (loading) {
        return (
            <div className="school-doc-viewer" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                <p>Loading official school document...</p>
            </div>
        );
    }

    return (
        <div className="school-doc-viewer">
            {/* Topbar */}
            <div className="doc-viewer-topbar">
                <button type="button" className="doc-back-btn" onClick={onBack}>
                    <ArrowLeft size={16} />
                    <span>Back to Documents Catalog</span>
                </button>

                <div className="doc-controls-group">
                    {students.length > 0 && (
                        <div className="student-picker-select">
                            <span>Target Student:</span>
                            <select
                                value={selectedStudentId || ""}
                                onChange={e => setSelectedStudentId(Number(e.target.value))}
                            >
                                {students.map(s => (
                                    <option key={s.memberId} value={s.memberId}>
                                        {getFullName(s)} ({s.memberCode || `STD-${s.memberId}`})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button type="button" className="btn-print-doc" onClick={handlePrint}>
                        <Printer size={16} />
                        <span>Print Document</span>
                    </button>
                </div>
            </div>

            <div className="doc-canvas-container">
                <div className="official-paper-sheet">
                    {/* Header */}
                    <div className="doc-header">
                        <div className="doc-emblem-circle">
                            <GraduationCap size={32} />
                        </div>
                        <h1 className="doc-school-title">MOBILE BIBLE SCHOOL</h1>
                        <p className="doc-school-sub">School of Theology & Christian Ministry • Academic Affairs Division</p>
                        <p className="doc-school-sub" style={{ fontSize: "11px", color: "#8a8d91" }}>
                            Provincial Hubs • Modular Distance Learning • Main Seminary Campus
                        </p>
                        <span className="doc-name-banner">{docTitle}</span>
                        {docDescription && (
                            <p style={{ fontSize: "12px", color: "#64748b", margin: "6px auto 0", maxWidth: "600px" }}>
                                {docDescription}
                            </p>
                        )}
                    </div>

                    {/* DIPLOMA VIEW */}
                    {docId === "certificate-of-completion" ? (
                        <div className="diploma-border-box">
                            <div className="diploma-latin">In Nomine Domini Nostri Jesu Christi</div>
                            <p style={{ margin: "10px 0", color: "#64748b", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px" }}>
                                The Board of Trustees and Academic Faculty hereby confer upon
                            </p>
                            <h2 className="diploma-recipient-name">{getFullName(selectedStudent)}</h2>
                            <p style={{ color: "#475569", margin: "14px 0 6px" }}>
                                who has honorably fulfilled all required theological curricula, field cohort requirements, and credit units for the degree of
                            </p>
                            <h3 className="diploma-degree-title">
                                {selectedStudent?.ministry || "Bachelor of Theology (B.Th.)"}
                            </h3>
                            <p className="diploma-body-text">
                                With all the rights, privileges, and pastoral credentials pertaining thereto, in testimony whereof this diploma is signed by the Chancellor and sealed by Mobile Bible School.
                            </p>
                            <div className="doc-sign-block">
                                <div>
                                    <div className="doc-sign-line" />
                                    <div className="doc-sign-name">Dr. Samuel Vance, Th.D.</div>
                                    <div className="doc-sign-title">Academic Dean & Faculty Head</div>
                                </div>
                                <div>
                                    <div className="doc-sign-line" />
                                    <div className="doc-sign-name">Rev. Emmanuel Davis, D.D.</div>
                                    <div className="doc-sign-title">President & Chancellor</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* STANDARD ACADEMIC FORM (COM, TOR, Admission Form, etc.) */
                        <>
                            {/* Student Info Box */}
                            <div className="doc-student-info-grid">
                                <div className="doc-info-list">
                                    <div className="doc-info-item">
                                        <label>Student Full Name</label>
                                        <span>{getFullName(selectedStudent)}</span>
                                    </div>
                                    <div className="doc-info-item">
                                        <label>Student ID Number</label>
                                        <span>{selectedStudent?.memberCode || `STD-2026-${String(selectedStudent?.memberId || 1).padStart(4, "0")}`}</span>
                                    </div>
                                    <div className="doc-info-item">
                                        <label>Academic Degree Program</label>
                                        <span>{selectedStudent?.ministry || "Bachelor of Theology (B.Th.)"}</span>
                                    </div>
                                    <div className="doc-info-item">
                                        <label>Curriculum Year Level</label>
                                        <span>{selectedStudent?.civilStatus || "1st Year"} • 1st Semester</span>
                                    </div>
                                    <div className="doc-info-item">
                                        <label>Mode of Learning</label>
                                        <span>{parsedMeta.modeOfLearning || "Modular Field Cohort"}</span>
                                    </div>
                                    <div className="doc-info-item">
                                        <label>Contact & Email</label>
                                        <span>{selectedStudent?.contactNumber || "N/A"} • {selectedStudent?.email || "N/A"}</span>
                                    </div>
                                </div>

                                <div className="doc-student-badge-col">
                                    <div className="photo-placeholder">
                                        <User size={24} />
                                        <span>2x2 Photo</span>
                                    </div>
                                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#166534" }}>
                                        STATUS: {selectedStudent?.status || "ACTIVE"}
                                    </span>
                                </div>
                            </div>

                            {/* Enrolled Subjects Table */}
                            <div className="doc-section-title">
                                <BookOpen size={16} color="#1877f2" />
                                <span>Officially Enrolled Subjects & Units</span>
                            </div>

                            <table className="doc-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "110px" }}>CODE</th>
                                        <th>SUBJECT TITLE</th>
                                        <th style={{ width: "60px" }}>UNITS</th>
                                        <th>SCHEDULE & CLASSROOM</th>
                                        <th>INSTRUCTOR</th>
                                        {docId === "transcript-of-records" && <th style={{ width: "70px" }}>GRADE</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrolledSubjects.map((sub, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 700, color: "#1877f2" }}>{sub.code}</td>
                                            <td>{sub.title}</td>
                                            <td style={{ fontWeight: 700 }}>{sub.units}</td>
                                            <td style={{ fontSize: "12px", color: "#475569" }}>{sub.schedule} • {sub.room}</td>
                                            <td>{sub.instructor}</td>
                                            {docId === "transcript-of-records" && (
                                                <td style={{ fontWeight: 800, color: "#15803d" }}>1.25</td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={2} style={{ textAlign: "right", fontWeight: 800 }}>TOTAL CREDIT LOAD:</td>
                                        <td style={{ fontWeight: 800 }}>{totalUnits} Units</td>
                                        <td colSpan={docId === "transcript-of-records" ? 3 : 2} style={{ fontSize: "12px", color: "#64748b" }}>
                                            Full Regular Semestral Academic Standing
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                            {/* Financial Assessment (Only for COM and Admission Form) */}
                            {docId !== "transcript-of-records" && docId !== "student-id-card" && (
                                <>
                                    <div className="doc-section-title">
                                        <CreditCard size={16} color="#1877f2" />
                                        <span>Tuition Fee Assessment & Ledger</span>
                                    </div>

                                    <div className="doc-finance-box">
                                        <div className="finance-item">
                                            <label>Rate Per Unit</label>
                                            <span>₱{ratePerUnit.toLocaleString()}</span>
                                        </div>
                                        <div className="finance-item">
                                            <label>Total Tuition Assessment</label>
                                            <span>₱{totalTuition.toLocaleString()}</span>
                                        </div>
                                        <div className="finance-item">
                                            <label>Amount Paid</label>
                                            <span>₱{amountPaid.toLocaleString()}</span>
                                        </div>
                                        <div className="finance-item">
                                            <label>Outstanding Balance</label>
                                            <span style={{ color: balance > 0 ? "#b91c1c" : "#15803d" }}>
                                                ₱{balance.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Official Verification Signatures */}
                            <div className="doc-sign-block">
                                <div>
                                    <div className="doc-sign-line" />
                                    <div className="doc-sign-name">Mrs. Clarissa Mendez</div>
                                    <div className="doc-sign-title">Office of the University Registrar</div>
                                </div>
                                <div>
                                    <div className="doc-sign-line" />
                                    <div className="doc-sign-name">{getFullName(selectedStudent)}</div>
                                    <div className="doc-sign-title">Student Conforme & Signature</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
