import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "./MemberAttendanceReport.css";

// ============================================================
// TYPES
// ============================================================

type AttendanceStatus =
    | "PRESENT"
    | "LATE"
    | "EARLY"
    | "ABSENT"
    | "EXCUSED";

interface AttendanceRecord {
    attendanceId: number;
    memberId: number;
    memberCode?: string | null;
    memberName?: string | null;
    churchServiceId?: number | null;
    eventId?: number | null;
    serviceName?: string | null;
    service?: string | null;
    attendanceDate: string;
    status: AttendanceStatus;
    recordedBy?: string | null;
    recordedDate?: string | null;
}

interface StudentSummary {
    studentId: number;
    studentCode: string;
    name: string;
    total: number;
    present: number;
    late: number;
    early: number;
    absent: number;
    excused: number;
    percentage: number;
    classification: string;
}

interface MemberAttendanceReportProps {
    onBack?: () => void;
}

// ============================================================
// AUTHENTICATION HELPERS
// ============================================================

const getToken = (): string | null => {
    const keys = [
        "token",
        "accessToken",
        "jwt",
        "authToken",
        "epicToken",
        "clientToken"
    ];

    for (const key of keys) {
        const token = localStorage.getItem(key);
        if (token?.trim()) {
            return token;
        }
    }
    return null;
};

const getAuthConfig = () => {
    const token = getToken();
    if (!token) return {};
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// ============================================================
// DATA NORMALIZATION & HELPERS
// ============================================================

const getStudentName = (record: AttendanceRecord): string => {
    return record.memberName?.trim() || `Student #${record.memberId}`;
};

const getStudentCode = (record: AttendanceRecord): string => {
    return record.memberCode?.trim() || `STD-${record.memberId}`;
};

const getClassName = (record: AttendanceRecord): string => {
    return (
        record.serviceName?.trim() ||
        record.service?.trim() ||
        "Modular Lecture Session"
    );
};

const normalizeStatus = (value: unknown): AttendanceStatus => {
    switch (String(value ?? "").trim().toUpperCase()) {
        case "PRESENT":
            return "PRESENT";
        case "LATE":
            return "LATE";
        case "EARLY":
            return "EARLY";
        case "EXCUSED":
            return "EXCUSED";
        case "ABSENT":
        default:
            return "ABSENT";
    }
};

const normalizeAttendanceRecord = (
    record: AttendanceRecord
): AttendanceRecord => {
    return {
        ...record,
        attendanceId: Number(record.attendanceId),
        memberId: Number(record.memberId),
        status: normalizeStatus(record.status),
    };
};

const getClassification = (percentage: number): string => {
    if (percentage >= 90) {
        return "HONOR ROLL (90-100%)";
    }
    if (percentage >= 75) {
        return "GOOD STANDING";
    }
    if (percentage >= 60) {
        return "ACADEMIC WARNING";
    }
    return "ACADEMIC INTERVENTION";
};

const getClassificationClass = (percentage: number): string => {
    if (percentage >= 90) {
        return "excellent";
    }
    if (percentage >= 75) {
        return "good";
    }
    if (percentage >= 60) {
        return "needs-follow-up";
    }
    return "pastoral-follow-up";
};

const formatDate = (value?: string | null): string => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const escapeHtml = (value: unknown): string => {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const getStatusLabel = (status: AttendanceStatus): string => {
    switch (status) {
        case "PRESENT":
            return "Present";
        case "LATE":
            return "Late (Tardy)";
        case "EARLY":
            return "Early Departure";
        case "ABSENT":
            return "Absent";
        case "EXCUSED":
            return "Excused Leave";
        default:
            return status;
    }
};

// ============================================================
// COMPONENT
// ============================================================

export const MemberAttendanceReport: React.FC<MemberAttendanceReportProps> = ({
    onBack,
}) => {
    // State
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [serviceFilter, setServiceFilter] = useState("ALL");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

    // Load Attendance Records from Database API
    const loadAttendance = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_BASE_URL}/Attendance`,
                getAuthConfig()
            );

            const data = Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.data?.data)
                ? response.data.data
                : [];

            const normalized = data.map((item: AttendanceRecord) =>
                normalizeAttendanceRecord(item)
            );

            setRecords(normalized);
        } catch (err: any) {
            console.error("Student attendance load error:", err);
            if (err?.response?.status === 401) {
                setError("Your session has expired. Please login again.");
            } else if (err?.response?.status === 403) {
                setError("You do not have permission to view student attendance reports.");
            } else {
                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load student attendance records from database."
                );
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadAttendance();
    }, [loadAttendance]);

    // Unique class sessions / courses
    const classSessions = useMemo(() => {
        const set = new Set<string>();
        records.forEach((record) => {
            set.add(getClassName(record));
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [records]);

    // Filter Records
    const filteredRecords = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return records.filter((record) => {
            const studentName = getStudentName(record).toLowerCase();
            const studentCode = getStudentCode(record).toLowerCase();
            const sessionName = getClassName(record);
            const recordDate = record.attendanceDate?.substring(0, 10) || "";

            const matchesSearch =
                !keyword ||
                studentName.includes(keyword) ||
                studentCode.includes(keyword) ||
                sessionName.toLowerCase().includes(keyword);

            const matchesSession =
                serviceFilter === "ALL" || sessionName === serviceFilter;

            const matchesFrom = !dateFrom || recordDate >= dateFrom;
            const matchesTo = !dateTo || recordDate <= dateTo;

            return matchesSearch && matchesSession && matchesFrom && matchesTo;
        });
    }, [records, search, serviceFilter, dateFrom, dateTo]);

    // Student Summaries
    const studentSummaries: StudentSummary[] = useMemo(() => {
        const map = new Map<number, StudentSummary>();

        filteredRecords.forEach((record) => {
            if (!map.has(record.memberId)) {
                map.set(record.memberId, {
                    studentId: record.memberId,
                    studentCode: getStudentCode(record),
                    name: getStudentName(record),
                    total: 0,
                    present: 0,
                    late: 0,
                    early: 0,
                    absent: 0,
                    excused: 0,
                    percentage: 0,
                    classification: "ACADEMIC INTERVENTION",
                });
            }

            const student = map.get(record.memberId);
            if (!student) return;

            student.total++;

            switch (record.status) {
                case "PRESENT":
                    student.present++;
                    break;
                case "LATE":
                    student.late++;
                    break;
                case "EARLY":
                    student.early++;
                    break;
                case "ABSENT":
                    student.absent++;
                    break;
                case "EXCUSED":
                    student.excused++;
                    break;
            }
        });

        return Array.from(map.values())
            .map((student) => {
                const attended = student.present + student.late + student.early;
                const percentage =
                    student.total > 0
                        ? Math.round((attended / student.total) * 100)
                        : 0;

                return {
                    ...student,
                    percentage,
                    classification: getClassification(percentage),
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [filteredRecords]);

    // Selected Student for View Modal
    const selectedStudent = useMemo(
        () =>
            selectedStudentId === null
                ? null
                : studentSummaries.find((s) => s.studentId === selectedStudentId) ?? null,
        [studentSummaries, selectedStudentId]
    );

    // Selected Student Detailed Logs
    const selectedStudentRecords = useMemo(() => {
        if (selectedStudentId === null) return [];
        return filteredRecords
            .filter((record) => record.memberId === selectedStudentId)
            .sort(
                (a, b) =>
                    new Date(b.attendanceDate).getTime() -
                    new Date(a.attendanceDate).getTime()
            );
    }, [filteredRecords, selectedStudentId]);

    // Overall Metrics
    const statistics = useMemo(() => {
        const result = {
            total: 0,
            present: 0,
            late: 0,
            early: 0,
            absent: 0,
            excused: 0,
            attended: 0,
            percentage: 0,
        };

        filteredRecords.forEach((record) => {
            result.total++;
            switch (record.status) {
                case "PRESENT":
                    result.present++;
                    break;
                case "LATE":
                    result.late++;
                    break;
                case "EARLY":
                    result.early++;
                    break;
                case "ABSENT":
                    result.absent++;
                    break;
                case "EXCUSED":
                    result.excused++;
                    break;
            }
        });

        result.attended = result.present + result.late + result.early;
        result.percentage =
            result.total > 0 ? Math.round((result.attended / result.total) * 100) : 0;

        return result;
    }, [filteredRecords]);

    // Distribution Percentages
    const attendanceDistribution = useMemo(() => {
        const total = statistics.total;
        const getPct = (val: number) =>
            total > 0 ? Math.round((val / total) * 100) : 0;

        return {
            present: getPct(statistics.present),
            late: getPct(statistics.late),
            early: getPct(statistics.early),
            absent: getPct(statistics.absent),
            excused: getPct(statistics.excused),
        };
    }, [statistics]);

    // Academic Counts
    const academicInterventionCount = useMemo(
        () => studentSummaries.filter((s) => s.percentage < 75).length,
        [studentSummaries]
    );

    const honorRollStudents = useMemo(
        () => studentSummaries.filter((s) => s.percentage >= 90).length,
        [studentSummaries]
    );

    // Print Period Label
    const printPeriod = useMemo(() => {
        if (dateFrom && dateTo) {
            return `${formatDate(dateFrom)} — ${formatDate(dateTo)}`;
        }
        if (dateFrom) {
            return `${formatDate(dateFrom)} — Present`;
        }
        if (dateTo) {
            return `Beginning — ${formatDate(dateTo)}`;
        }
        return "All Trimester Dates";
    }, [dateFrom, dateTo]);

    // Reset Filters
    const resetFilters = () => {
        setSearch("");
        setServiceFilter("ALL");
        setDateFrom("");
        setDateTo("");
    };

    // Export CSV Functionality
    const handleExportCSV = () => {
        if (studentSummaries.length === 0) {
            alert("There are no student attendance records to export.");
            return;
        }

        const headers = [
            "#",
            "Student ID",
            "Student Name",
            "Attendance Rate (%)",
            "Present",
            "Late",
            "Early",
            "Absent",
            "Excused",
            "Total Sessions",
            "Academic Standing"
        ];

        const rows = studentSummaries.map((s, idx) => [
            idx + 1,
            `"${s.studentCode}"`,
            `"${s.name}"`,
            s.percentage,
            s.present,
            s.late,
            s.early,
            s.absent,
            s.excused,
            s.total,
            `"${s.classification}"`
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `mbs-student-attendance-report-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Official Seminary Print Report
    const handlePrint = () => {
        if (studentSummaries.length === 0) {
            alert("There are no student attendance records to print.");
            return;
        }

        const printWindow = window.open("", "_blank", "width=1200,height=900");
        if (!printWindow) {
            alert("Unable to open print document. Please allow pop-ups for this site.");
            return;
        }

        const generated = new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });

        const classLabel =
            serviceFilter === "ALL" ? "All Classes & Modules" : serviceFilter;

        const rowsHtml = studentSummaries
            .map((student, index) => {
                const cls = getClassificationClass(student.percentage);
                return `
                    <tr>
                        <td class="number">${index + 1}</td>
                        <td><strong>${escapeHtml(student.studentCode)}</strong></td>
                        <td><strong class="member-name">${escapeHtml(student.name)}</strong></td>
                        <td class="center percentage">${student.percentage}%</td>
                        <td class="center present">${student.present}</td>
                        <td class="center late">${student.late}</td>
                        <td class="center early">${student.early}</td>
                        <td class="center absent">${student.absent}</td>
                        <td class="center excused">${student.excused}</td>
                        <td>
                            <span class="classification ${cls}">
                                ${escapeHtml(student.classification)}
                            </span>
                        </td>
                    </tr>
                `;
            })
            .join("");

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <title>MBS - Student Attendance Report</title>
                <style>
                    * { box-sizing: border-box; }
                    html, body { margin: 0; padding: 0; }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                        color: #1e293b;
                        background: #ffffff;
                        font-size: 11px;
                        line-height: 1.45;
                        padding: 20px;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 12mm 10mm;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        padding-bottom: 15px;
                        border-bottom: 2px solid #0f172a;
                        margin-bottom: 18px;
                    }
                    .brand-name {
                        font-size: 14px;
                        font-weight: 900;
                        letter-spacing: 1.2px;
                        color: #0f172a;
                    }
                    .brand-subtitle {
                        margin-top: 3px;
                        font-size: 9px;
                        color: #64748b;
                        letter-spacing: 0.5px;
                    }
                    .doc-title {
                        text-align: right;
                        font-size: 14px;
                        font-weight: 800;
                        color: #1e3a8a;
                    }
                    .meta-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 10px;
                        margin-bottom: 18px;
                    }
                    .meta-card {
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        padding: 10px 12px;
                    }
                    .meta-card span {
                        display: block;
                        font-size: 8px;
                        font-weight: 800;
                        color: #64748b;
                        text-transform: uppercase;
                    }
                    .meta-card strong {
                        display: block;
                        font-size: 12px;
                        color: #0f172a;
                        margin-top: 3px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 10px;
                    }
                    th {
                        background: #f1f5f9;
                        padding: 8px 10px;
                        text-align: left;
                        font-size: 9px;
                        font-weight: 800;
                        color: #475569;
                        border-bottom: 1px solid #cbd5e1;
                    }
                    td {
                        padding: 8px 10px;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    .center { text-align: center; }
                    .percentage { font-weight: 800; color: #2563eb; }
                    .present { color: #047857; font-weight: 700; }
                    .late { color: #b45309; }
                    .early { color: #0e7490; }
                    .absent { color: #b91c1c; font-weight: 700; }
                    .excused { color: #6d28d9; }
                    .classification {
                        display: inline-block;
                        padding: 2px 7px;
                        border-radius: 99px;
                        font-size: 8px;
                        font-weight: 800;
                    }
                    .classification.excellent { background: #d1fae5; color: #047857; }
                    .classification.good { background: #dbeafe; color: #1e40af; }
                    .classification.needs-follow-up { background: #fef3c7; color: #92400e; }
                    .classification.pastoral-follow-up { background: #fee2e2; color: #991b1b; }
                    .signatures {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px dashed #cbd5e1;
                    }
                    .sig-block {
                        text-align: center;
                        min-width: 220px;
                    }
                    .sig-line {
                        border-bottom: 1px solid #0f172a;
                        height: 35px;
                        margin-bottom: 6px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="brand-name">MOBILE BIBLE SCHOOL & THEOLOGICAL SEMINARY</div>
                        <div class="brand-subtitle">Theological Seminary & Institute • Academic Affairs Division</div>
                    </div>
                    <div>
                        <div class="doc-title">OFFICIAL STUDENT ATTENDANCE REPORT</div>
                        <div style="font-size: 9px; color: #64748b; margin-top: 3px;">Report Period: ${escapeHtml(printPeriod)}</div>
                    </div>
                </div>

                <div class="meta-grid">
                    <div class="meta-card">
                        <span>Students Tracked</span>
                        <strong>${studentSummaries.length} Enrolled</strong>
                    </div>
                    <div class="meta-card">
                        <span>Class Session</span>
                        <strong>${escapeHtml(classLabel)}</strong>
                    </div>
                    <div class="meta-card">
                        <span>Overall Attendance</span>
                        <strong>${statistics.percentage}% Rate</strong>
                    </div>
                    <div class="meta-card">
                        <span>Generated On</span>
                        <strong>${escapeHtml(generated)}</strong>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>STUDENT ID</th>
                            <th>STUDENT NAME</th>
                            <th class="center">ATTENDANCE RATE</th>
                            <th class="center">PRESENT</th>
                            <th class="center">LATE</th>
                            <th class="center">EARLY</th>
                            <th class="center">ABSENT</th>
                            <th class="center">EXCUSED</th>
                            <th>ACADEMIC STANDING</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>

                <div class="signatures">
                    <div class="sig-block">
                        <div class="sig-line"></div>
                        <strong>Office of the Academic Registrar</strong>
                        <div style="font-size: 9px; color: #64748b;">Seminary Registrar & Attendance Records</div>
                    </div>
                    <div class="sig-block">
                        <div class="sig-line"></div>
                        <strong>Dr. Rhoderick De Vera, Th.D.</strong>
                        <div style="font-size: 9px; color: #64748b;">Seminary President & Dean of Academic Affairs</div>
                    </div>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 500);
    };

    // Loading State
    if (loading) {
        return (
            <div className="mar-loading-page">
                <div className="mar-loading-spinner" />
                <h2>Loading Student Attendance</h2>
                <p>Retrieving class attendance and lecture records from database...</p>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="mar-error-page">
                <div className="mar-error-icon">!</div>
                <h2>Unable to Load Student Attendance</h2>
                <p>{error}</p>
                <div className="mar-error-actions">
                    {onBack && (
                        <button
                            type="button"
                            className="mar-button secondary"
                            onClick={onBack}
                        >
                            ← Back to Reports
                        </button>
                    )}
                    <button
                        type="button"
                        className="mar-button primary"
                        onClick={() => void loadAttendance()}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="member-attendance-report">
            {/* SCREEN HEADER */}
            <header className="mar-screen-header">
                <div className="mar-header-title-area">
                    <span className="mar-eyebrow">
                        ACADEMICS & STUDENTS &gt; STUDENT ATTENDANCE REPORT
                    </span>
                    <h1>Student Attendance Report</h1>
                    <p>
                        Monitor student participation, lecture attendance performance, and academic follow-up.
                    </p>
                </div>

                <div className="mar-header-actions">
                    {onBack && (
                        <button
                            type="button"
                            className="mar-button secondary"
                            onClick={onBack}
                        >
                            ← Back to Reports
                        </button>
                    )}

                    <button
                        type="button"
                        className="mar-button secondary"
                        onClick={resetFilters}
                        title="Reset all search and date filters"
                    >
                        Reset Filters
                    </button>

                    <button
                        type="button"
                        className="mar-button secondary"
                        onClick={handleExportCSV}
                        title="Export current filtered records to CSV spreadsheet"
                    >
                        📥 Export CSV
                    </button>

                    <button
                        type="button"
                        className="mar-button primary"
                        onClick={handlePrint}
                        title="Print or save official PDF document"
                    >
                        🖨 Print / Save PDF
                    </button>
                </div>
            </header>

            {/* TOP SUMMARY CARDS (Matched to screenshot metrics) */}
            <section className="mar-summary-grid">
                <div className="mar-summary-card">
                    <span>STUDENTS</span>
                    <strong>{studentSummaries.length}</strong>
                    <small>Students tracked</small>
                </div>

                <div className="mar-summary-card">
                    <span>RECORDS</span>
                    <strong>{statistics.total}</strong>
                    <small>Attendance records</small>
                </div>

                <div className="mar-summary-card">
                    <span>ATTENDANCE</span>
                    <strong>{statistics.percentage}%</strong>
                    <small>Overall attendance</small>
                </div>

                <div className="mar-summary-card">
                    <span>FOLLOW-UP</span>
                    <strong style={{ color: academicInterventionCount > 0 ? "#ef4444" : "inherit" }}>
                        {academicInterventionCount}
                    </strong>
                    <small>Below 75% passing</small>
                </div>
            </section>

            {/* DETAILED ATTENDANCE OVERVIEW */}
            <section className="mar-card">
                <div className="mar-card-header">
                    <div>
                        <span>ATTENDANCE ANALYTICS</span>
                        <h2>Attendance Overview</h2>
                        <p>
                            Detailed breakdown of student attendance performance for the selected report period.
                        </p>
                    </div>
                </div>

                {/* 5 STATUS CARDS */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                        gap: "12px",
                        padding: "20px 25px 10px",
                    }}
                >
                    {/* PRESENT */}
                    <div
                        style={{
                            padding: "18px",
                            border: "1px solid #a7f3d0",
                            borderRadius: "14px",
                            background: "linear-gradient(135deg, #ffffff, #ecfdf5)",
                            boxShadow: "0 5px 15px rgba(16,185,129,.06)",
                        }}
                    >
                        <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "1px", color: "#047857" }}>
                            PRESENT
                        </div>
                        <div style={{ marginTop: "8px", fontSize: "30px", fontWeight: 850, color: "#10b981", lineHeight: 1 }}>
                            {statistics.present}
                        </div>
                        <div style={{ marginTop: "7px", fontSize: "11px", color: "#64748b" }}>
                            {attendanceDistribution.present}% of records
                        </div>
                    </div>

                    {/* LATE */}
                    <div
                        style={{
                            padding: "18px",
                            border: "1px solid #fde68a",
                            borderRadius: "14px",
                            background: "linear-gradient(135deg, #ffffff, #fffbeb)",
                            boxShadow: "0 5px 15px rgba(245,158,11,.06)",
                        }}
                    >
                        <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "1px", color: "#b45309" }}>
                            LATE
                        </div>
                        <div style={{ marginTop: "8px", fontSize: "30px", fontWeight: 850, color: "#f59e0b", lineHeight: 1 }}>
                            {statistics.late}
                        </div>
                        <div style={{ marginTop: "7px", fontSize: "11px", color: "#64748b" }}>
                            {attendanceDistribution.late}% of records
                        </div>
                    </div>

                    {/* EARLY */}
                    <div
                        style={{
                            padding: "18px",
                            border: "1px solid #a5f3fc",
                            borderRadius: "14px",
                            background: "linear-gradient(135deg, #ffffff, #ecfeff)",
                            boxShadow: "0 5px 15px rgba(6,182,212,.06)",
                        }}
                    >
                        <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "1px", color: "#0e7490" }}>
                            EARLY
                        </div>
                        <div style={{ marginTop: "8px", fontSize: "30px", fontWeight: 850, color: "#06b6d4", lineHeight: 1 }}>
                            {statistics.early}
                        </div>
                        <div style={{ marginTop: "7px", fontSize: "11px", color: "#64748b" }}>
                            {attendanceDistribution.early}% of records
                        </div>
                    </div>

                    {/* ABSENT */}
                    <div
                        style={{
                            padding: "18px",
                            border: "1px solid #fecaca",
                            borderRadius: "14px",
                            background: "linear-gradient(135deg, #ffffff, #fef2f2)",
                            boxShadow: "0 5px 15px rgba(239,68,68,.06)",
                        }}
                    >
                        <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "1px", color: "#b91c1c" }}>
                            ABSENT
                        </div>
                        <div style={{ marginTop: "8px", fontSize: "30px", fontWeight: 850, color: "#ef4444", lineHeight: 1 }}>
                            {statistics.absent}
                        </div>
                        <div style={{ marginTop: "7px", fontSize: "11px", color: "#64748b" }}>
                            {attendanceDistribution.absent}% of records
                        </div>
                    </div>

                    {/* EXCUSED */}
                    <div
                        style={{
                            padding: "18px",
                            border: "1px solid #ddd6fe",
                            borderRadius: "14px",
                            background: "linear-gradient(135deg, #ffffff, #f5f3ff)",
                            boxShadow: "0 5px 15px rgba(139,92,246,.06)",
                        }}
                    >
                        <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "1px", color: "#6d28d9" }}>
                            EXCUSED
                        </div>
                        <div style={{ marginTop: "8px", fontSize: "30px", fontWeight: 850, color: "#8b5cf6", lineHeight: 1 }}>
                            {statistics.excused}
                        </div>
                        <div style={{ marginTop: "7px", fontSize: "11px", color: "#64748b" }}>
                            {attendanceDistribution.excused}% of records
                        </div>
                    </div>
                </div>

                {/* 3 ACADEMIC METRICS CARDS */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: "14px",
                        padding: "10px 25px 20px",
                    }}
                >
                    <div
                        style={{
                            padding: "18px",
                            border: "1px solid #dbeafe",
                            borderRadius: "14px",
                            background: "#f8fbff",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ color: "#64748b", fontSize: "10px", fontWeight: 800, letterSpacing: "1px" }}>
                                OVERALL ATTENDANCE RATE
                            </span>
                            <strong style={{ color: "#2563eb", fontSize: "22px" }}>
                                {statistics.percentage}%
                            </strong>
                        </div>
                        <div style={{ marginTop: "12px", height: "8px", overflow: "hidden", borderRadius: "99px", background: "#e2e8f0" }}>
                            <div
                                style={{
                                    width: `${statistics.percentage}%`,
                                    height: "100%",
                                    borderRadius: "99px",
                                    background: "linear-gradient(90deg, #3b82f6, #10b981)",
                                    transition: "width .4s ease",
                                }}
                            />
                        </div>
                        <p style={{ margin: "9px 0 0", color: "#64748b", fontSize: "11px" }}>
                            {statistics.attended} attended class sessions out of {statistics.total}
                        </p>
                    </div>

                    <div
                        style={{
                            padding: "18px",
                            border: "1px solid #a7f3d0",
                            borderRadius: "14px",
                            background: "#f7fffb",
                        }}
                    >
                        <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 800, letterSpacing: "1px" }}>
                            HONOR ATTENDANCE (90%+)
                        </div>
                        <strong style={{ display: "block", marginTop: "9px", color: "#10b981", fontSize: "27px", fontWeight: 850 }}>
                            {honorRollStudents}
                        </strong>
                        <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: "11px" }}>
                            Students with 90%+ attendance standing
                        </p>
                    </div>

                    <div
                        style={{
                            padding: "18px",
                            border: "1px solid #fecaca",
                            borderRadius: "14px",
                            background: "#fffafa",
                        }}
                    >
                        <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 800, letterSpacing: "1px" }}>
                            ACADEMIC INTERVENTION
                        </div>
                        <strong style={{ display: "block", marginTop: "9px", color: "#ef4444", fontSize: "27px", fontWeight: 850 }}>
                            {academicInterventionCount}
                        </strong>
                        <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: "11px" }}>
                            Students below 75% passing threshold
                        </p>
                    </div>
                </div>

                {/* STATUS DISTRIBUTION BARS */}
                <div style={{ padding: "4px 25px 25px" }}>
                    <div
                        style={{
                            marginBottom: "12px",
                            color: "#475569",
                            fontSize: "11px",
                            fontWeight: 800,
                            letterSpacing: "0.6px",
                        }}
                    >
                        ATTENDANCE DISTRIBUTION BREAKDOWN
                    </div>

                    {[
                        { label: "Present", percentage: attendanceDistribution.present, text: "#047857", background: "#ecfdf5", bar: "#10b981" },
                        { label: "Late (Tardy)", percentage: attendanceDistribution.late, text: "#b45309", background: "#fffbeb", bar: "#f59e0b" },
                        { label: "Early Departure", percentage: attendanceDistribution.early, text: "#0e7490", background: "#ecfeff", bar: "#06b6d4" },
                        { label: "Absent", percentage: attendanceDistribution.absent, text: "#b91c1c", background: "#fef2f2", bar: "#ef4444" },
                        { label: "Excused Leave", percentage: attendanceDistribution.excused, text: "#6d28d9", background: "#f5f3ff", bar: "#8b5cf6" },
                    ].map((item) => (
                        <div key={item.label} style={{ marginBottom: "10px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                                <span style={{ color: item.text, fontSize: "11px", fontWeight: 700 }}>
                                    {item.label}
                                </span>
                                <span style={{ color: "#64748b", fontSize: "11px" }}>
                                    {item.percentage}%
                                </span>
                            </div>
                            <div style={{ height: "7px", borderRadius: "99px", background: item.background, overflow: "hidden" }}>
                                <div
                                    style={{
                                        width: `${item.percentage}%`,
                                        height: "100%",
                                        background: item.bar,
                                        borderRadius: "99px",
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FILTERS */}
            <section className="mar-card">
                <div className="mar-card-header">
                    <div>
                        <span>REPORT BUILDER</span>
                        <h2>Attendance Filters</h2>
                        <p>Adjust parameters before generating or printing.</p>
                    </div>
                </div>

                <div className="mar-filters">
                    <div className="mar-field search">
                        <label>Search Student</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search student name, student ID, or course..."
                        />
                    </div>

                    <div className="mar-field">
                        <label>Class / Course Session</label>
                        <select
                            value={serviceFilter}
                            onChange={(e) => setServiceFilter(e.target.value)}
                        >
                            <option value="ALL">All Classes & Modules</option>
                            {classSessions.map((session) => (
                                <option key={session} value={session}>
                                    {session}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mar-field">
                        <label>Date From</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </div>

                    <div className="mar-field">
                        <label>Date To</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* STUDENT REPORT REGISTRY */}
            <section className="mar-card">
                <div className="mar-report-toolbar">
                    <div>
                        <span>REPORT PREVIEW</span>
                        <h2>Student Attendance Registry</h2>
                        <p>
                            Showing <strong>{studentSummaries.length}</strong> students from{" "}
                            <strong>{filteredRecords.length}</strong> attendance records.
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            type="button"
                            className="mar-button secondary"
                            onClick={handleExportCSV}
                        >
                            📥 Export CSV
                        </button>
                        <button
                            type="button"
                            className="mar-button primary"
                            onClick={handlePrint}
                        >
                            🖨 Print Official Report
                        </button>
                    </div>
                </div>

                <div className="mar-table-wrapper">
                    <table className="mar-screen-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>STUDENT NAME</th>
                                <th>STUDENT ID</th>
                                <th>RATE</th>
                                <th>PRESENT</th>
                                <th>LATE</th>
                                <th>EARLY</th>
                                <th>ABSENT</th>
                                <th>EXCUSED</th>
                                <th>ACADEMIC STANDING</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>

                        <tbody>
                            {studentSummaries.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="mar-empty" style={{ textAlign: "center", padding: "40px" }}>
                                        <div style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                                            No student attendance records found.
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                                            Attendance taken through the <strong>Daily Attendance</strong> module will automatically calculate and display here in real-time.
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                studentSummaries.map((student, index) => (
                                    <tr key={student.studentId}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <strong>{student.name}</strong>
                                        </td>
                                        <td>{student.studentCode}</td>
                                        <td>
                                            <strong className="mar-percentage">
                                                {student.percentage}%
                                            </strong>
                                        </td>
                                        <td>{student.present}</td>
                                        <td>{student.late}</td>
                                        <td>{student.early}</td>
                                        <td>{student.absent}</td>
                                        <td>{student.excused}</td>
                                        <td>
                                            <span
                                                className={`mar-classification ${getClassificationClass(
                                                    student.percentage
                                                )}`}
                                            >
                                                {student.classification}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="mar-button secondary"
                                                style={{
                                                    padding: "7px 13px",
                                                    minWidth: "70px",
                                                    fontSize: "11px",
                                                    fontWeight: 800,
                                                }}
                                                onClick={() => setSelectedStudentId(student.studentId)}
                                            >
                                                👁 View Log
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* SCREEN FOOTER */}
            <footer className="mar-screen-footer">
                <div>
                    <strong>Mobile Bible School & Theological Seminary</strong>
                    <span>Academic & Student Attendance System</span>
                </div>
                <div>
                    <span>Report Period: </span>
                    <strong>{printPeriod}</strong>
                </div>
            </footer>

            {/* VIEW STUDENT ATTENDANCE MODAL */}
            {selectedStudent && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="student-attendance-view-title"
                    onClick={() => setSelectedStudentId(null)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "24px",
                        background: "rgba(15, 23, 42, 0.58)",
                        backdropFilter: "blur(5px)",
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "min(920px, 100%)",
                            maxHeight: "calc(100vh - 48px)",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            background: "#ffffff",
                            borderRadius: "20px",
                            boxShadow: "0 25px 70px rgba(15,23,42,.25)",
                        }}
                    >
                        {/* MODAL HEADER */}
                        <div
                            style={{
                                padding: "22px 25px",
                                borderBottom: "1px solid #e2e8f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "20px",
                            }}
                        >
                            <div>
                                <span
                                    style={{
                                        display: "block",
                                        marginBottom: "5px",
                                        fontSize: "10px",
                                        fontWeight: 850,
                                        letterSpacing: "1.2px",
                                        color: "#64748b",
                                    }}
                                >
                                    STUDENT ATTENDANCE LOG
                                </span>
                                <h2
                                    id="student-attendance-view-title"
                                    style={{
                                        margin: 0,
                                        fontSize: "22px",
                                        fontWeight: 800,
                                        color: "#172033",
                                    }}
                                >
                                    {selectedStudent.name}
                                </h2>
                                <p
                                    style={{
                                        margin: "5px 0 0",
                                        fontSize: "12px",
                                        color: "#64748b",
                                    }}
                                >
                                    {selectedStudent.studentCode} • Academic Attendance History
                                </p>
                            </div>

                            <button
                                type="button"
                                aria-label="Close student attendance"
                                onClick={() => setSelectedStudentId(null)}
                                style={{
                                    width: "38px",
                                    height: "38px",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "10px",
                                    background: "#f8fafc",
                                    color: "#475569",
                                    fontSize: "20px",
                                    cursor: "pointer",
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* STUDENT STATS BANNER */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                                gap: "10px",
                                padding: "18px 25px",
                                background: "#f8fafc",
                                borderBottom: "1px solid #e2e8f0",
                            }}
                        >
                            <div style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#ffffff" }}>
                                <span style={{ display: "block", fontSize: "9px", fontWeight: 800, color: "#64748b" }}>
                                    ATTENDANCE RATE
                                </span>
                                <strong style={{ display: "block", marginTop: "5px", fontSize: "20px", color: "#2563eb" }}>
                                    {selectedStudent.percentage}%
                                </strong>
                            </div>

                            <div style={{ padding: "12px", border: "1px solid #d1fae5", borderRadius: "12px", background: "#ecfdf5" }}>
                                <span style={{ display: "block", fontSize: "9px", fontWeight: 800, color: "#047857" }}>
                                    PRESENT
                                </span>
                                <strong style={{ display: "block", marginTop: "5px", fontSize: "20px", color: "#10b981" }}>
                                    {selectedStudent.present}
                                </strong>
                            </div>

                            <div style={{ padding: "12px", border: "1px solid #fde68a", borderRadius: "12px", background: "#fffbeb" }}>
                                <span style={{ display: "block", fontSize: "9px", fontWeight: 800, color: "#b45309" }}>
                                    LATE
                                </span>
                                <strong style={{ display: "block", marginTop: "5px", fontSize: "20px", color: "#f59e0b" }}>
                                    {selectedStudent.late}
                                </strong>
                            </div>

                            <div style={{ padding: "12px", border: "1px solid #fecaca", borderRadius: "12px", background: "#fef2f2" }}>
                                <span style={{ display: "block", fontSize: "9px", fontWeight: 800, color: "#b91c1c" }}>
                                    ABSENT
                                </span>
                                <strong style={{ display: "block", marginTop: "5px", fontSize: "20px", color: "#ef4444" }}>
                                    {selectedStudent.absent}
                                </strong>
                            </div>

                            <div style={{ padding: "12px", border: "1px solid #ddd6fe", borderRadius: "12px", background: "#f5f3ff" }}>
                                <span style={{ display: "block", fontSize: "9px", fontWeight: 800, color: "#6d28d9" }}>
                                    ACADEMIC STANDING
                                </span>
                                <strong style={{ display: "block", marginTop: "5px", fontSize: "11px", color: "#6d28d9" }}>
                                    {selectedStudent.classification}
                                </strong>
                            </div>
                        </div>

                        {/* ATTENDANCE HISTORY TABLE */}
                        <div style={{ overflowY: "auto", padding: "20px 25px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: "15px", color: "#172033" }}>
                                        Lecture & Session Records
                                    </h3>
                                    <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#64748b" }}>
                                        {selectedStudentRecords.length} recorded class sessions
                                    </p>
                                </div>
                            </div>

                            {selectedStudentRecords.length === 0 ? (
                                <div
                                    style={{
                                        padding: "35px",
                                        textAlign: "center",
                                        border: "1px dashed #cbd5e1",
                                        borderRadius: "14px",
                                        color: "#64748b",
                                        fontSize: "13px",
                                    }}
                                >
                                    No attendance records found for this student.
                                </div>
                            ) : (
                                <div style={{ border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ background: "#f8fafc" }}>
                                                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "10px", fontWeight: 800, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>
                                                    DATE
                                                </th>
                                                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "10px", fontWeight: 800, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>
                                                    CLASS / SUBJECT SESSION
                                                </th>
                                                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: "10px", fontWeight: 800, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>
                                                    STATUS
                                                </th>
                                                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "10px", fontWeight: 800, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>
                                                    RECORDED BY
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedStudentRecords.map((record) => {
                                                const status = record.status;
                                                const statusStyles =
                                                    status === "PRESENT"
                                                        ? { background: "#ecfdf5", color: "#047857" }
                                                        : status === "LATE"
                                                        ? { background: "#fffbeb", color: "#b45309" }
                                                        : status === "EARLY"
                                                        ? { background: "#ecfeff", color: "#0e7490" }
                                                        : status === "ABSENT"
                                                        ? { background: "#fef2f2", color: "#b91c1c" }
                                                        : { background: "#f5f3ff", color: "#6d28d9" };

                                                return (
                                                    <tr key={record.attendanceId}>
                                                        <td style={{ padding: "13px 14px", borderBottom: "1px solid #f1f5f9", fontSize: "12px", color: "#334155" }}>
                                                            {formatDate(record.attendanceDate)}
                                                        </td>
                                                        <td style={{ padding: "13px 14px", borderBottom: "1px solid #f1f5f9", fontSize: "12px", color: "#172033", fontWeight: 600 }}>
                                                            {getClassName(record)}
                                                        </td>
                                                        <td style={{ padding: "13px 14px", textAlign: "center", borderBottom: "1px solid #f1f5f9" }}>
                                                            <span style={{ display: "inline-block", padding: "5px 10px", borderRadius: "999px", fontSize: "10px", fontWeight: 800, ...statusStyles }}>
                                                                {getStatusLabel(status)}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: "13px 14px", borderBottom: "1px solid #f1f5f9", fontSize: "12px", color: "#64748b" }}>
                                                            {record.recordedBy?.trim() || "Office of the Registrar"}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* MODAL FOOTER */}
                        <div
                            style={{
                                padding: "15px 25px",
                                borderTop: "1px solid #e2e8f0",
                                display: "flex",
                                justifyContent: "flex-end",
                                background: "#f8fafc",
                            }}
                        >
                            <button
                                type="button"
                                className="mar-button secondary"
                                onClick={() => setSelectedStudentId(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberAttendanceReport;
