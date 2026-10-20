import React, { useState } from "react";
import {
    ArrowLeft,
    Printer,
    Edit3,
    Trash2,
    GraduationCap,
    BookOpen,
    Calendar,
    Clock,
    MapPin,
    User,
    Phone,
    ShieldCheck,
    CheckCircle2,
    FileText,
    Building,
    Layers,
    DollarSign,
    CreditCard
} from "lucide-react";
import type { Subject } from "../data/curriculumData";
import {
    DEGREE_PROGRAMS,
    getSubjectByCode,
    getDefaultSubjectsForProgram,
    calculateTotalUnits
} from "../data/curriculumData";
import { courseCurriculumService } from "../services/courseCurriculumService";
import "./StudentProfileView.css";

export interface StudentProfileData {
    memberId: number;
    memberCode?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    suffix?: string;
    gender?: string;
    birthDate?: string;
    civilStatus?: string; // Used for Year Level & Semester
    contactNumber?: string;
    email?: string;
    address?: string;
    ministry?: string; // Used for Academic Program / Course
    status?: string;
    dateJoined?: string;
    photoPath?: string;
    occupation?: string;
    notes?: string;
}

interface StudentProfileViewProps {
    student: StudentProfileData;
    onBack: () => void;
    onEdit: (student: StudentProfileData) => void;
    onDelete: (student: StudentProfileData) => void;
    canEdit?: boolean;
    canDelete?: boolean;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
    student,
    onBack,
    onEdit,
    onDelete,
    canEdit = true,
    canDelete = true
}) => {
    const [activeTab, setActiveTab] = useState<"cor" | "personal" | "guardian">("cor");
    const [showCorModal, setShowCorModal] = useState<boolean>(false);

    // Full name formatting
    const fullName = [student.firstName, student.middleName, student.lastName, student.suffix]
        .filter(Boolean)
        .join(" ")
        .trim() || "Student";

    // Program info
    const programName = student.ministry || "Bachelor of Theology (B.Th.)";
    const programInfo = DEGREE_PROGRAMS[programName];
    const dynamicCourse = courseCurriculumService.getCourse(programName);

    // Year level and semester
    const yearLevelStr = student.civilStatus || "1st Year - 1st Semester";

    // Extract metadata / enrolled subjects / financials from photoPath if saved as JSON
    let parsedMetadata: {
        subjects?: string[];
        units?: number;
        guardian?: string;
        guardianContact?: string;
        email?: string;
        courseCode?: string;
        courseName?: string;
        modeOfLearning?: string;
        paymentPerUnit?: number;
        totalTuition?: number;
        amountPaid?: number;
        balance?: number;
        paymentStatus?: "PAID" | "PARTIAL" | "UNPAID";
    } = {};

    if (student.photoPath && student.photoPath.startsWith("{")) {
        try {
            parsedMetadata = JSON.parse(student.photoPath);
        } catch (e) {
            console.error("Failed to parse student photoPath metadata", e);
        }
    }

    // Determine student's enrolled subjects
    const enrolledSubjects: Subject[] = React.useMemo(() => {
        if (parsedMetadata.subjects && parsedMetadata.subjects.length > 0) {
            const mapped = parsedMetadata.subjects
                .map(code => getSubjectByCode(code))
                .filter((s): s is Subject => s !== undefined);
            if (mapped.length > 0) return mapped;
        }
        // Fallback to default curriculum for their program & year level
        return getDefaultSubjectsForProgram(programName, yearLevelStr);
    }, [parsedMetadata.subjects, programName, yearLevelStr]);

    const totalUnits = calculateTotalUnits(enrolledSubjects);
    const totalLecHours = enrolledSubjects.reduce((sum, s) => sum + s.lectureHours, 0);
    const totalLabHours = enrolledSubjects.reduce((sum, s) => sum + s.labHours, 0);

    // Mode of Learning resolution
    const modeOfLearning = parsedMetadata.modeOfLearning || dynamicCourse?.modeOfLearning || "Modular Field Cohort";

    // Financial calculations
    const paymentPerUnit = parsedMetadata.paymentPerUnit ?? (dynamicCourse?.paymentPerUnit ?? 350);
    const totalTuition = parsedMetadata.totalTuition ?? (totalUnits * paymentPerUnit);
    const amountPaid = parsedMetadata.amountPaid ?? 0;
    const balance = parsedMetadata.balance ?? Math.max(0, totalTuition - amountPaid);
    const paymentStatus: "PAID" | "PARTIAL" | "UNPAID" =
        parsedMetadata.paymentStatus || (totalTuition > 0 && balance <= 0 ? "PAID" : amountPaid > 0 ? "PARTIAL" : "UNPAID");

    // Extract guardian details
    let guardianName = parsedMetadata.guardian || "";
    let guardianContact = parsedMetadata.guardianContact || "";

    if (!guardianName && student.address && student.address.includes("Guardian:")) {
        const parts = student.address.split("Guardian:");
        if (parts[1]) {
            guardianName = parts[1].trim();
        }
    }

    const cleanAddress = student.address?.split("|")[0]?.trim() || student.address || "No address specified";

    const studentEmail = parsedMetadata.email || student.email || `${student.firstName?.toLowerCase().replace(/\s+/g, "") || "student"}.${student.lastName?.toLowerCase().replace(/\s+/g, "") || "profile"}@mbs.edu`;

    // Calculate age if birthDate is available
    const calculateAge = (birthDateStr?: string) => {
        if (!birthDateStr) return "—";
        try {
            const birthDate = new Date(birthDateStr);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return isNaN(age) ? "—" : `${age} yrs old`;
        } catch {
            return "—";
        }
    };

    const handlePrint = () => {
        setShowCorModal(true);
    };

    const triggerSystemPrint = () => {
        window.print();
    };

    return (
        <div className="student-profile-container">
            {/* Top Navigation & Breadcrumb */}
            <div className="profile-top-bar">
                <button type="button" className="profile-back-btn" onClick={onBack}>
                    <ArrowLeft size={18} />
                    <span>Back to Student Directory</span>
                </button>

                <div className="profile-top-actions">
                    <button
                        type="button"
                        className="profile-action-btn btn-print-cor"
                        onClick={handlePrint}
                        title="Print Certificate of Registration"
                    >
                        <Printer size={16} />
                        <span>Print Registration (COR)</span>
                    </button>

                    {canEdit && (
                        <button
                            type="button"
                            className="profile-action-btn btn-edit-student"
                            onClick={() => onEdit(student)}
                            title="Edit Student Info"
                        >
                            <Edit3 size={16} />
                            <span>Edit Student</span>
                        </button>
                    )}

                    {canDelete && (
                        <button
                            type="button"
                            className="profile-action-btn btn-delete-student"
                            onClick={() => onDelete(student)}
                            title="Unenroll / Drop Student"
                        >
                            <Trash2 size={16} />
                            <span>Drop / Delete</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Student Hero Banner Card */}
            <div className="student-hero-card">
                <div className="student-hero-banner-accent"></div>
                <div className="student-hero-content">
                    <div className="student-avatar-wrapper">
                        <div className="student-hero-avatar">
                            {student.firstName?.[0]?.toUpperCase()}
                            {student.lastName?.[0]?.toUpperCase()}
                        </div>
                        <span className="student-avatar-status-dot" title="Active Student"></span>
                    </div>

                    <div className="student-hero-info">
                        <div className="student-hero-header-row">
                            <h1 className="student-full-name">{fullName}</h1>
                            <span className="student-code-tag">
                                {student.memberCode || `STD-2026-${String(student.memberId).padStart(4, "0")}`}
                            </span>
                        </div>

                        <p className="student-hero-department">
                            <Building size={15} />
                            <span>{programInfo?.department || dynamicCourse?.department || "School of Theology & Biblical Languages"}</span>
                        </p>

                        <div className="student-hero-badges-row">
                            <span className="hero-badge badge-program">
                                <GraduationCap size={14} />
                                {programName}
                            </span>
                            <span className="hero-badge badge-mode">
                                <Layers size={14} />
                                {modeOfLearning}
                            </span>
                            <span className="hero-badge badge-year">
                                <Calendar size={14} />
                                {yearLevelStr}
                            </span>
                            <span className={`hero-badge badge-financial ${paymentStatus.toLowerCase()}`}>
                                <DollarSign size={13} />
                                Tuition: {paymentStatus}
                            </span>
                            <span className="hero-badge badge-status">
                                <CheckCircle2 size={14} />
                                {student.status || "ENROLLED"}
                            </span>
                        </div>
                    </div>

                    <div className="student-hero-stats">
                        <div className="hero-stat-box">
                            <span className="stat-label">TOTAL UNITS</span>
                            <strong className="stat-value">{totalUnits}.0</strong>
                            <span className="stat-subtext">Credit Load</span>
                        </div>
                        <div className="hero-stat-box">
                            <span className="stat-label">SUBJECTS</span>
                            <strong className="stat-value">{enrolledSubjects.length}</strong>
                            <span className="stat-subtext">Enlisted</span>
                        </div>
                        <div className="hero-stat-box financial-box">
                            <span className="stat-label">TOTAL TUITION</span>
                            <strong className="stat-value text-emerald">₱{totalTuition.toLocaleString()}</strong>
                            <span className="stat-subtext">@ ₱{paymentPerUnit}/unit</span>
                        </div>
                        <div className="hero-stat-box balance-box">
                            <span className="stat-label">BALANCE</span>
                            <strong className={`stat-value ${balance > 0 ? "text-amber" : "text-emerald"}`}>
                                ₱{balance.toLocaleString()}
                            </strong>
                            <span className="stat-subtext">{paymentStatus}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="profile-tabs-header">
                <button
                    type="button"
                    className={`profile-tab-btn ${activeTab === "cor" ? "active" : ""}`}
                    onClick={() => setActiveTab("cor")}
                >
                    <BookOpen size={17} />
                    <span>Enrolled Subjects & Study Load (COR)</span>
                    <span className="tab-pill-count">{enrolledSubjects.length}</span>
                </button>

                <button
                    type="button"
                    className={`profile-tab-btn ${activeTab === "personal" ? "active" : ""}`}
                    onClick={() => setActiveTab("personal")}
                >
                    <User size={17} />
                    <span>Personal & Contact Information</span>
                </button>

                <button
                    type="button"
                    className={`profile-tab-btn ${activeTab === "guardian" ? "active" : ""}`}
                    onClick={() => setActiveTab("guardian")}
                >
                    <ShieldCheck size={17} />
                    <span>Guardian & Emergency Details</span>
                </button>
            </div>

            {/* TAB CONTENT 1: ENROLLED SUBJECTS & STUDY LOAD */}
            {activeTab === "cor" && (
                <div className="profile-tab-content">
                    {/* FINANCIAL ASSESSMENT & TUITION CARD */}
                    <div className="cor-financial-card">
                        <div className="financial-card-header">
                            <div className="financial-card-title">
                                <CreditCard size={20} className="text-blue" />
                                <div>
                                    <h4>Official Tuition & Semestral Assessment Breakdown</h4>
                                    <p>Tuition calculated from enrolled credit units multiplied by program unit rate</p>
                                </div>
                            </div>
                            <div className={`financial-status-badge ${paymentStatus.toLowerCase()}`}>
                                <span>PAYMENT STATUS:</span>
                                <strong>{paymentStatus}</strong>
                            </div>
                        </div>

                        <div className="financial-metrics-grid">
                            <div className="financial-metric-item">
                                <span className="lbl">PAYMENT RATE PER UNIT</span>
                                <strong className="val">₱{paymentPerUnit.toLocaleString()}</strong>
                                <span className="sub">Per Credit Unit</span>
                            </div>
                            <div className="financial-metric-item">
                                <span className="lbl">ENROLLED CREDIT UNITS</span>
                                <strong className="val">{totalUnits}.0</strong>
                                <span className="sub">{enrolledSubjects.length} Subjects</span>
                            </div>
                            <div className="financial-metric-item">
                                <span className="lbl">TOTAL ASSESSED TUITION</span>
                                <strong className="val text-blue">₱{totalTuition.toLocaleString()}</strong>
                                <span className="sub">Assessment Total</span>
                            </div>
                            <div className="financial-metric-item">
                                <span className="lbl">AMOUNT PAID / DEPOSITED</span>
                                <strong className="val text-emerald">₱{amountPaid.toLocaleString()}</strong>
                                <span className="sub">Receipt Validated</span>
                            </div>
                            <div className="financial-metric-item balance-highlight">
                                <span className="lbl">OUTSTANDING BALANCE</span>
                                <strong className={`val ${balance > 0 ? "text-amber" : "text-emerald"}`}>
                                    ₱{balance.toLocaleString()}
                                </strong>
                                <span className="sub">{balance === 0 ? "Fully Paid" : "Due for Finals"}</span>
                            </div>
                        </div>

                        <div className="mode-of-learning-banner">
                            <Layers size={16} className="text-blue" />
                            <span>
                                <strong>Assigned Mode of Learning:</strong> {modeOfLearning} — Classes conducted according to official field cohort rotations and hybrid cloud syllabus.
                            </span>
                        </div>
                    </div>

                    {/* STUDY LOAD CARD & SUBJECTS TABLE */}
                    <div className="cor-summary-card">
                        <div className="cor-summary-title">
                            <div>
                                <h3>Certificate of Registration • Official Study Load</h3>
                                <p>First Semester, Academic Year 2025–2026 • Verified by Mobile Bible School & Seminary Registrar</p>
                            </div>
                            <div className="cor-total-units-badge">
                                <span>TOTAL ENROLLED LOAD</span>
                                <strong>{totalUnits}.0 UNITS</strong>
                            </div>
                        </div>

                        <div className="academic-load-metrics">
                            <div className="metric-chip">
                                <span className="metric-label">Mode of Learning:</span>
                                <strong className="text-blue">{modeOfLearning}</strong>
                            </div>
                            <div className="metric-chip">
                                <span className="metric-label">Lecture Hours:</span>
                                <strong>{totalLecHours} hrs/wk</strong>
                            </div>
                            <div className="metric-chip">
                                <span className="metric-label">Practical / Lab:</span>
                                <strong>{totalLabHours} hrs/wk</strong>
                            </div>
                            <div className="metric-chip">
                                <span className="metric-label">Academic Status:</span>
                                <span className="metric-status-ok">Regular Full-Load Student</span>
                            </div>
                            <div className="metric-chip">
                                <span className="metric-label">Dean / Program Chair:</span>
                                <strong>{programInfo?.deanOrHead || dynamicCourse?.deanOrHead || "Dr. Samuel Vance, Th.D."}</strong>
                            </div>
                        </div>

                        {/* Subjects Table */}
                        <div className="profile-subjects-table-wrapper">
                            <table className="profile-subjects-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>#</th>
                                        <th style={{ width: "120px" }}>SUBJECT CODE</th>
                                        <th>DESCRIPTIVE COURSE TITLE</th>
                                        <th style={{ width: "80px", textAlign: "center" }}>UNITS</th>
                                        <th style={{ width: "220px" }}>CLASS SCHEDULE / TIME</th>
                                        <th style={{ width: "160px" }}>VENUE / ROOM</th>
                                        <th style={{ width: "170px" }}>INSTRUCTOR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrolledSubjects.map((sub, index) => (
                                        <tr key={sub.code}>
                                            <td className="row-num">{index + 1}</td>
                                            <td>
                                                <span className="subject-code-pill">{sub.code}</span>
                                            </td>
                                            <td>
                                                <div className="subject-title-cell">
                                                    <strong>{sub.title}</strong>
                                                    {sub.prerequisite && (
                                                        <span className="prereq-note">Prerequisite: {sub.prerequisite}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <span className="subject-unit-badge">{sub.units}.0</span>
                                            </td>
                                            <td>
                                                <div className="schedule-cell">
                                                    <Clock size={13} />
                                                    <span>{sub.schedule}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="room-cell">
                                                    <MapPin size={13} />
                                                    <span>{sub.room}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="instructor-cell">
                                                    <User size={13} />
                                                    <span>{sub.instructor}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={3} className="table-footer-label">
                                            <strong>TOTAL REGISTERED UNITS ENROLLED:</strong>
                                        </td>
                                        <td style={{ textAlign: "center" }} className="table-footer-units">
                                            <strong>{totalUnits}.0</strong>
                                        </td>
                                        <td colSpan={3} className="table-footer-note">
                                            <span>
                                                Tuition: ₱{totalTuition.toLocaleString()} • Balance: ₱{balance.toLocaleString()} • Status: {paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="cor-actions-row">
                            <button
                                type="button"
                                className="btn-print-preview"
                                onClick={handlePrint}
                            >
                                <FileText size={16} />
                                <span>Preview & Print Official Certificate of Registration (COR)</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT 2: PERSONAL INFORMATION */}
            {activeTab === "personal" && (
                <div className="profile-tab-content">
                    <div className="profile-info-grid">
                        <div className="profile-info-card">
                            <h4 className="info-card-header">
                                <User size={17} />
                                <span>Demographic Details</span>
                            </h4>
                            <div className="info-rows-list">
                                <div className="info-row">
                                    <span className="info-key">Full Legal Name:</span>
                                    <span className="info-val">{fullName}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-key">Student Number:</span>
                                    <span className="info-val font-mono">{student.memberCode || "—"}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-key">Gender / Sex:</span>
                                    <span className="info-val">{student.gender || "Not specified"}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-key">Date of Birth:</span>
                                    <span className="info-val">
                                        {student.birthDate
                                            ? new Date(student.birthDate).toLocaleDateString("en-US", {
                                                  month: "long",
                                                  day: "numeric",
                                                  year: "numeric"
                                              })
                                            : "—"}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-key">Calculated Age:</span>
                                    <span className="info-val">{calculateAge(student.birthDate)}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-key">Year Level & Term:</span>
                                    <span className="info-val">{yearLevelStr}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-key">Enrollment Date:</span>
                                    <span className="info-val">
                                        {student.dateJoined
                                            ? new Date(student.dateJoined).toLocaleDateString("en-US", {
                                                  month: "long",
                                                  day: "numeric",
                                                  year: "numeric"
                                              })
                                            : "August 15, 2025"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="profile-info-card">
                            <h4 className="info-card-header">
                                <Phone size={17} />
                                <span>Contact & Address</span>
                            </h4>
                            <div className="info-rows-list">
                                <div className="info-row">
                                    <span className="info-key">Mobile Phone:</span>
                                    <span className="info-val font-mono">{student.contactNumber || "None registered"}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-key">Official Email:</span>
                                    <span className="info-val font-mono text-blue">{studentEmail}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-key">Residential Address:</span>
                                    <span className="info-val">{cleanAddress}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-key">Degree Program:</span>
                                    <span className="info-val">{programName}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-key">Mode of Learning:</span>
                                    <span className="info-val font-semibold text-blue">{modeOfLearning}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-key">Account Status:</span>
                                    <span className="info-val text-emerald font-semibold">
                                        {student.status || "ACTIVE"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT 3: GUARDIAN & EMERGENCY */}
            {activeTab === "guardian" && (
                <div className="profile-tab-content">
                    <div className="profile-info-grid">
                        <div className="profile-info-card full-width">
                            <h4 className="info-card-header">
                                <ShieldCheck size={17} />
                                <span>Guardian, Ministry Sponsor & Emergency Contact</span>
                            </h4>
                            <div className="info-rows-list">
                                <div className="info-row">
                                    <span className="info-key">Primary Guardian / Pastor:</span>
                                    <span className="info-val font-bold">
                                        {guardianName || "No designated guardian on record"}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-key">Emergency Contact Number:</span>
                                    <span className="info-val font-mono">
                                        {guardianContact || student.contactNumber || "—"}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-key">Residence / Address:</span>
                                    <span className="info-val">{cleanAddress}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-key">Emergency Authorization:</span>
                                    <span className="info-val text-emerald font-semibold">
                                        Authorized for Medical & School Notifications
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CERTIFICATE OF REGISTRATION (COR) MODAL / PRINT PREVIEW */}
            {showCorModal && (
                <div className="cor-modal-overlay">
                    <div className="cor-modal-wrapper">
                        <div className="cor-modal-top-actions no-print">
                            <div className="cor-modal-title">
                                <FileText size={20} />
                                <span>Certificate of Registration (COR) • Official Document</span>
                            </div>
                            <div className="cor-modal-btn-group">
                                <button
                                    type="button"
                                    className="btn-modal-print"
                                    onClick={triggerSystemPrint}
                                >
                                    <Printer size={16} />
                                    <span>Print Form</span>
                                </button>
                                <button
                                    type="button"
                                    className="btn-modal-close"
                                    onClick={() => setShowCorModal(false)}
                                >
                                    Close Preview
                                </button>
                            </div>
                        </div>

                        {/* Printable Certificate Document Content */}
                        <div className="cor-printable-sheet" id="cor-printable-sheet">
                            {/* School Header */}
                            <div className="cor-doc-header">
                                <div className="cor-school-logo-badge">
                                    <GraduationCap size={36} color="#1877f2" />
                                </div>
                                <div className="cor-school-text">
                                    <h2>MOBILE BIBLE SCHOOL & SEMINARY</h2>
                                    <p className="cor-school-sub">"Study to shew thyself approved unto God" • 2 Timothy 2:15</p>
                                    <p className="cor-school-sub">Office of Academic Affairs & Admissions • A.Y. 2025–2026</p>
                                    <h1 className="cor-doc-badge">OFFICIAL CERTIFICATE OF REGISTRATION</h1>
                                </div>
                            </div>

                            {/* Student Metadata Table */}
                            <div className="cor-student-meta-grid">
                                <div className="cor-meta-item">
                                    <span className="cor-meta-lbl">STUDENT NO.:</span>
                                    <strong className="cor-meta-val">{student.memberCode || "—"}</strong>
                                </div>
                                <div className="cor-meta-item">
                                    <span className="cor-meta-lbl">NAME:</span>
                                    <strong className="cor-meta-val">{fullName}</strong>
                                </div>
                                <div className="cor-meta-item">
                                    <span className="cor-meta-lbl">DEGREE PROGRAM:</span>
                                    <strong className="cor-meta-val">{programName}</strong>
                                </div>
                                <div className="cor-meta-item">
                                    <span className="cor-meta-lbl">MODE OF LEARNING:</span>
                                    <strong className="cor-meta-val text-blue">{modeOfLearning}</strong>
                                </div>
                                <div className="cor-meta-item">
                                    <span className="cor-meta-lbl">YEAR & TERM:</span>
                                    <strong className="cor-meta-val">{yearLevelStr}</strong>
                                </div>
                                <div className="cor-meta-item">
                                    <span className="cor-meta-lbl">ENROLLMENT STATUS:</span>
                                    <strong className="cor-meta-val text-emerald">OFFICIALLY ENROLLED</strong>
                                </div>
                            </div>

                            {/* Enrolled Courses Table */}
                            <table className="cor-doc-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "40px" }}>NO.</th>
                                        <th style={{ width: "110px" }}>COURSE CODE</th>
                                        <th>COURSE TITLE / SUBJECT DESCRIPTION</th>
                                        <th style={{ width: "70px", textAlign: "center" }}>UNITS</th>
                                        <th style={{ width: "180px" }}>CLASS SCHEDULE</th>
                                        <th style={{ width: "130px" }}>ROOM / VENUE</th>
                                        <th style={{ width: "160px" }}>INSTRUCTOR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrolledSubjects.map((sub, i) => (
                                        <tr key={sub.code}>
                                            <td style={{ textAlign: "center" }}>{i + 1}</td>
                                            <td className="font-mono font-bold">{sub.code}</td>
                                            <td>{sub.title}</td>
                                            <td style={{ textAlign: "center", fontWeight: "bold" }}>{sub.units}.0</td>
                                            <td>{sub.schedule}</td>
                                            <td>{sub.room}</td>
                                            <td>{sub.instructor}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: "right", fontWeight: "bold" }}>
                                            TOTAL ENROLLED ACADEMIC UNITS:
                                        </td>
                                        <td style={{ textAlign: "center", fontWeight: "bold", fontSize: "15px" }}>
                                            {totalUnits}.0
                                        </td>
                                        <td colSpan={3} style={{ fontSize: "11px", color: "#555" }}>
                                            REGULAR SEMESTRAL STUDY LOAD VALIDATED
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                            {/* Financial Assessment Table in Print Form */}
                            <div className="cor-print-financial-section">
                                <h4 className="cor-fin-title">STATEMENT OF TUITION ACCOUNT & ASSESSMENT</h4>
                                <table className="cor-fin-table">
                                    <thead>
                                        <tr>
                                            <th>TUITION PER UNIT</th>
                                            <th>TOTAL UNITS</th>
                                            <th>TOTAL ASSESSED</th>
                                            <th>AMOUNT PAID</th>
                                            <th>OUTSTANDING BALANCE</th>
                                            <th>STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>₱{paymentPerUnit.toLocaleString()} / unit</td>
                                            <td>{totalUnits}.0 Units</td>
                                            <td className="font-bold">₱{totalTuition.toLocaleString()}</td>
                                            <td className="text-emerald font-bold">₱{amountPaid.toLocaleString()}</td>
                                            <td className="font-bold">₱{balance.toLocaleString()}</td>
                                            <td className="font-bold">{paymentStatus}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Signatures & Validation Footer */}
                            <div className="cor-signatures-grid">
                                <div className="cor-sig-box">
                                    <div className="cor-sig-line"></div>
                                    <span className="cor-sig-name">{fullName}</span>
                                    <span className="cor-sig-role">Student Signature</span>
                                </div>

                                <div className="cor-sig-box">
                                    <div className="cor-sig-line"></div>
                                    <span className="cor-sig-name">{programInfo?.deanOrHead || dynamicCourse?.deanOrHead || "Dr. Samuel Vance, Th.D."}</span>
                                    <span className="cor-sig-role">Dean of Academic Affairs</span>
                                </div>

                                <div className="cor-sig-box">
                                    <div className="cor-sig-line"></div>
                                    <span className="cor-sig-name">Office of the University Registrar</span>
                                    <span className="cor-sig-role">Official Registrar Seal & Validation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
