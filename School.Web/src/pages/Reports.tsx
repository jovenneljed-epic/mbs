import React, { useMemo, useState } from "react";
import "./Reports.css";
import { SchoolReportViewer } from "./reports/SchoolReportViewer";
import { SchoolDocumentViewer } from "./reports/SchoolDocumentViewer";

// =========================================================
// TYPES
// =========================================================

export type ReportCategory =
    | "Students & Enrollment"
    | "Curriculum & Programs"
    | "Class Attendance"
    | "Tuition & Billing"
    | "School Events";

export interface ReportsProps {
    onOpenAttendanceReport?: () => void;
    onOpenAttendanceByDate?: () => void;
}

interface ReportDefinition {
    id: string;
    title: string;
    description: string;
    category: ReportCategory;
    icon: string;
}

interface FormDefinition {
    id: string;
    title: string;
    description: string;
    icon: string;
}

// =========================================================
// SCHOOL REPORT DEFINITIONS
// =========================================================

const REPORTS: ReportDefinition[] = [
    // STUDENTS & ENROLLMENT
    {
        id: "student-master-roster",
        title: "Student Master Roster & Directory",
        description: "Official master directory of all enrolled students with Student ID, Degree Program, Year Level, Mode of Learning, and Contact.",
        category: "Students & Enrollment",
        icon: "🎓"
    },
    {
        id: "active-enrollees",
        title: "Active Enrollees Summary",
        description: "Roster of currently active enrollees grouped by academic degree program and curriculum standing.",
        category: "Students & Enrollment",
        icon: "📋"
    },
    {
        id: "student-academic-profiles",
        title: "Student Study Load & Ledger",
        description: "Detailed student record of enrolled subjects, credit units, learning modes, and academic status.",
        category: "Students & Enrollment",
        icon: "👤"
    },
    {
        id: "graduating-candidates",
        title: "Graduation Candidates Roster",
        description: "List of candidate senior students qualifying for theological degree and diploma completion.",
        category: "Students & Enrollment",
        icon: "📜"
    },

    // CURRICULUM & PROGRAMS
    {
        id: "curriculum-matrix",
        title: "Curriculum & Academic Programs",
        description: "Complete list of theological degree programs, required credit units, program duration, and academic deans.",
        category: "Curriculum & Programs",
        icon: "🏛️"
    },
    {
        id: "subject-catalog-report",
        title: "Course Subjects & Syllabus Catalog",
        description: "Official catalog of accredited subjects, credit unit weights, prerequisites, and assigned instructors.",
        category: "Curriculum & Programs",
        icon: "📚"
    },
    {
        id: "faculty-workload",
        title: "Faculty & Instructor Teaching Load",
        description: "Summary of faculty members, assigned course subjects, class schedules, and teaching hours.",
        category: "Curriculum & Programs",
        icon: "👨‍🏫"
    },
    {
        id: "class-schedule-matrix",
        title: "Class Timetable & Schedule Matrix",
        description: "Schedule matrix of classes across modular weekend hubs, evening sessions, and online discussion forums.",
        category: "Curriculum & Programs",
        icon: "🗓️"
    },

    // CLASS ATTENDANCE
    {
        id: "student-attendance-summary",
        title: "Student Attendance Summary",
        description: "Summary of attendance rates, present/absent counts across classroom and modular weekend hubs.",
        category: "Class Attendance",
        icon: "📊"
    },
    {
        id: "attendance-date-report",
        title: "Attendance by Class Date",
        description: "Detailed attendance tracking for specific dates, cohorts, and modular intensive sessions.",
        category: "Class Attendance",
        icon: "📅"
    },
    {
        id: "modular-roll-call",
        title: "Daily Roll-Call & Attendance Sheet",
        description: "Printable roll-call attendance sheet for instructors and modular field coordinators.",
        category: "Class Attendance",
        icon: "✍️"
    },

    // TUITION & BILLING
    {
        id: "tuition-billing-ledger",
        title: "Tuition Fee & Billing Ledger",
        description: "Student assessment ledger tracking rate per unit, total tuition, amounts paid, outstanding balance, and payment status.",
        category: "Tuition & Billing",
        icon: "₱"
    },
    {
        id: "tuition-collections",
        title: "Tuition Collections & Fee Receipts",
        description: "Summary of school fees collected, receipts issued, and semester revenue breakdown.",
        category: "Tuition & Billing",
        icon: "💳"
    },
    {
        id: "outstanding-receivables",
        title: "Outstanding Balances & Receivables",
        description: "Students with unpaid or partial tuition balances for registrar follow-up and clearance tracking.",
        category: "Tuition & Billing",
        icon: "⚠️"
    },

    // SCHOOL EVENTS
    {
        id: "academic-calendar-events",
        title: "Academic Calendar & Events Schedule",
        description: "Official schedule of school semesters, modular intensives, exams, orientation, and chapel convocations.",
        category: "School Events",
        icon: "🗓️"
    }
];

// =========================================================
// CATEGORIES
// =========================================================

const CATEGORIES: Array<{
    name: ReportCategory | "All";
    icon: string;
}> = [
    { name: "All", icon: "▦" },
    { name: "Students & Enrollment", icon: "🎓" },
    { name: "Curriculum & Programs", icon: "📖" },
    { name: "Class Attendance", icon: "⏱️" },
    { name: "Tuition & Billing", icon: "💳" },
    { name: "School Events", icon: "📅" }
];

// =========================================================
// OFFICIAL FORMS & DOCUMENTS
// =========================================================

const FORMS: FormDefinition[] = [
    {
        id: "certificate-of-matriculation",
        title: "Certificate of Matriculation (COM)",
        description: "Official enrollment assessment certificate with enrolled subjects, credit units, schedule, tuition assessment, and registrar signature.",
        icon: "📜"
    },
    {
        id: "student-admission-form",
        title: "Student Admission & Registration Form",
        description: "Official student enrollment and biographical application form for incoming theological students.",
        icon: "📝"
    },
    {
        id: "transcript-of-records",
        title: "Official Transcript of Records (TOR) / Grade Slip",
        description: "Academic grade report with subject codes, units, final grades, GPA, and school dean seal.",
        icon: "📄"
    },
    {
        id: "student-id-card",
        title: "Student ID Card Template",
        description: "Printable student identification card with photo placeholder, student ID, and emergency contact.",
        icon: "🪪"
    },
    {
        id: "certificate-of-completion",
        title: "Certificate of Completion / Diploma",
        description: "Graduation diploma with school seal, president and academic dean signature lines.",
        icon: "🏅"
    },
    {
        id: "instructor-gradebook-sheet",
        title: "Instructor Class Record & Gradebook",
        description: "Printable grading sheet for instructors to record attendance, quizzes, midterms, and finals.",
        icon: "📋"
    },
    {
        id: "good-moral-certificate",
        title: "Certificate of Good Moral Character",
        description: "Official certification of student conduct and good academic standing.",
        icon: "🎖️"
    }
];

// =========================================================
// COMPONENT
// =========================================================

const Reports: React.FC<ReportsProps> = ({
    onOpenAttendanceReport,
    onOpenAttendanceByDate
}) => {
    const [activeReportView, setActiveReportView] = useState<ReportDefinition | null>(null);
    const [activeDocView, setActiveDocView] = useState<FormDefinition | null>(null);

    const [activeCategory, setActiveCategory] = useState<ReportCategory | "All">("All");
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"reports" | "forms">("reports");

    // Filter reports
    const filteredReports = useMemo(() => {
        const query = search.trim().toLowerCase();
        return REPORTS.filter((report) => {
            const matchesCategory =
                activeCategory === "All" || report.category === activeCategory;
            const matchesSearch =
                !query ||
                report.title.toLowerCase().includes(query) ||
                report.description.toLowerCase().includes(query) ||
                report.category.toLowerCase().includes(query);
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, search]);

    // Handle Open Report
    const handleOpenReport = (report: ReportDefinition): void => {
        if (report.id === "attendance-summary" && onOpenAttendanceReport) {
            onOpenAttendanceReport();
            return;
        }
        if (report.id === "attendance-date-report" && onOpenAttendanceByDate) {
            onOpenAttendanceByDate();
            return;
        }
        setActiveReportView(report);
    };

    // Handle Open Form
    const handleOpenForm = (form: FormDefinition): void => {
        setActiveDocView(form);
    };

    // ACTIVE REPORT VIEW
    if (activeReportView) {
        return (
            <SchoolReportViewer
                reportId={activeReportView.id}
                reportTitle={activeReportView.title}
                reportCategory={activeReportView.category}
                reportDescription={activeReportView.description}
                onBack={() => setActiveReportView(null)}
            />
        );
    }

    // ACTIVE FORM / DOCUMENT VIEW
    if (activeDocView) {
        return (
            <SchoolDocumentViewer
                docId={activeDocView.id}
                docTitle={activeDocView.title}
                docDescription={activeDocView.description}
                onBack={() => setActiveDocView(null)}
            />
        );
    }

    // MAIN HUB
    return (
        <div className="epic-reports">
            {/* HERO */}
            <div className="reports-hero">
                <div className="reports-hero-content">
                    <div className="reports-hero-icon">
                        🎓
                    </div>
                    <div>
                        <h1>Academic Reports & School Records System</h1>
                        <p>
                            Mobile Bible School • Track, analyze, and generate official printable student records, enrollment rosters, curriculum matrix, attendance sheets, and tuition billing reports.
                        </p>
                    </div>
                </div>

                <div className="reports-hero-actions">
                    <button
                        type="button"
                        className="reports-print-button"
                        onClick={() => handleOpenReport(REPORTS[0])}
                    >
                        🖨️ Master Student Roster
                    </button>
                </div>
            </div>

            {/* TABS */}
            <div className="reports-tabs">
                <button
                    type="button"
                    className={activeTab === "reports" ? "active" : ""}
                    onClick={() => setActiveTab("reports")}
                >
                    📊 Academic Reports
                </button>
                <button
                    type="button"
                    className={activeTab === "forms" ? "active" : ""}
                    onClick={() => setActiveTab("forms")}
                >
                    📝 Forms & Official Documents
                </button>
            </div>

            {/* SEARCH TOOLBAR */}
            <div className="reports-toolbar">
                <div className="reports-search">
                    <span>🔍</span>
                    <input
                        type="text"
                        placeholder={activeTab === "reports" ? "Search academic reports by title, category, or description..." : "Search official forms and certificates..."}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* REPORTS TAB */}
            {activeTab === "reports" && (
                <>
                    {/* CATEGORY BAR */}
                    <div className="reports-category-bar">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.name}
                                type="button"
                                className={activeCategory === cat.name ? "active" : ""}
                                onClick={() => setActiveCategory(cat.name)}
                            >
                                <span>{cat.icon}</span>
                                <strong>{cat.name}</strong>
                            </button>
                        ))}
                    </div>

                    <div className="reports-section-heading">
                        <div>
                            <h2>Available School Reports</h2>
                            <p>
                                Select any academic report to track live student data, filter records, export to CSV, or print an official document.
                            </p>
                        </div>
                        <span className="reports-count">
                            {filteredReports.length} reports
                        </span>
                    </div>

                    {filteredReports.length > 0 ? (
                        <div className="reports-grid">
                            {filteredReports.map((report) => (
                                <button
                                    key={report.id}
                                    type="button"
                                    className="report-card"
                                    onClick={() => handleOpenReport(report)}
                                    aria-label={`Open ${report.title}`}
                                >
                                    <div className="report-card-icon">
                                        {report.icon}
                                    </div>
                                    <div className="report-card-content">
                                        <span className="report-card-category">
                                            {report.category}
                                        </span>
                                        <h3>{report.title}</h3>
                                        <p>{report.description}</p>
                                    </div>
                                    <span className="report-card-arrow">
                                        →
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="reports-empty">
                            <div>🔎</div>
                            <h3>No reports found</h3>
                            <p>Try another search term or report category.</p>
                        </div>
                    )}
                </>
            )}

            {/* FORMS TAB */}
            {activeTab === "forms" && (
                <>
                    <div className="reports-section-heading">
                        <div>
                            <h2>Official Forms, Diplomas & Documents</h2>
                            <p>
                                Select a document to preview and print official student certificates, matriculation assessments, diplomas, and gradebooks.
                            </p>
                        </div>
                        <span className="reports-count">
                            {FORMS.length} documents
                        </span>
                    </div>

                    <div className="reports-grid">
                        {FORMS.map((form) => (
                            <button
                                key={form.id}
                                type="button"
                                className="report-card"
                                onClick={() => handleOpenForm(form)}
                                aria-label={`Open ${form.title}`}
                            >
                                <div className="report-card-icon">
                                    {form.icon}
                                </div>
                                <div className="report-card-content">
                                    <span className="report-card-category">
                                        OFFICIAL FORM
                                    </span>
                                    <h3>{form.title}</h3>
                                    <p>{form.description}</p>
                                </div>
                                <span className="report-card-arrow">
                                    →
                                </span>
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* FOOTER PRINT INFO */}
            <div className="reports-print-info">
                <div>🖨️</div>
                <div>
                    <strong>Instant Tracking & Print to PDF</strong>
                    <p>
                        All reports and documents include live student data tracking, instant spreadsheet CSV export, and clean official Mobile Bible School letterhead formatting for physical printing and <strong>Save as PDF</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Reports;