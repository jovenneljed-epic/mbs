import React, { useState, useEffect, useMemo } from "react";
import {
    ArrowLeft,
    Printer,
    Download,
    Search,
    GraduationCap,
    BookOpen,
    Users,
    CreditCard,
    Clock,
    Layers,
    DollarSign,
    RefreshCw,
    AlertCircle
} from "lucide-react";
import { API_BASE_URL } from "../../config";
import { courseCurriculumService } from "../../services/courseCurriculumService";
import type { CourseProgram, CourseSubject } from "../../services/courseCurriculumService";
import { SchoolPrintService } from "../../utils/schoolPrintService";
import "./SchoolReportViewer.css";

/* =========================================================
   TYPES
========================================================= */

export interface SchoolReportViewerProps {
    reportId: string;
    reportTitle: string;
    reportCategory: string;
    reportDescription: string;
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
    civilStatus?: string; // Often stores Year Level e.g. "1st Year"
    contactNumber?: string;
    email?: string;
    address?: string;
    ministry?: string; // Often stores Degree Program e.g. "Bachelor of Theology (B.Th.)"
    status?: string;
    dateJoined?: string;
    occupation?: string;
    notes?: string;
    photoPath?: string; // Stores JSON metadata { subjects, modeOfLearning, paymentPerUnit, amountPaid, balance, paymentStatus }
}

const getToken = (): string | null => {
    const keys = ["token", "accessToken", "jwt", "authToken", "epicToken"];
    for (const key of keys) {
        const value = localStorage.getItem(key);
        if (value) return value.replace(/^Bearer\s+/i, "").trim();
    }
    return null;
};

async function apiFetch<T>(endpoint: string): Promise<T> {
    const baseUrl = API_BASE_URL.replace(/\/+$/, "");
    const cleanEndpoint = endpoint.replace(/^\/+/, "");
    const token = getToken();
    const headers = new Headers();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(`${baseUrl}/${cleanEndpoint}`, { headers });
    if (!response.ok) {
        throw new Error(`Failed to load data (${response.status})`);
    }
    const text = await response.text();
    if (!text.trim()) return [] as unknown as T;
    return JSON.parse(text) as T;
}

/* =========================================================
   COMPONENT
========================================================= */

export const SchoolReportViewer: React.FC<SchoolReportViewerProps> = ({
    reportId,
    reportTitle,
    reportCategory,
    reportDescription,
    onBack
}) => {
    const [members, setMembers] = useState<Member[]>([]);
    const [courses, setCourses] = useState<CourseProgram[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [programFilter, setProgramFilter] = useState("ALL");
    const [yearFilter, setYearFilter] = useState("ALL");
    const [modeFilter, setModeFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        const loadReportData = async () => {
            setLoading(true);
            setError("");
            try {
                // Load courses from curriculum service
                const loadedCourses = courseCurriculumService.getCourses();
                setCourses(loadedCourses);

                // Load students
                const data = await apiFetch<Member[] | { members?: Member[]; data?: Member[] }>("/Members");
                const list = Array.isArray(data) ? data : data.members || data.data || [];
                setMembers(list);
            } catch (err: unknown) {
                const e = err as Error;
                setError(e.message || "Failed to load report dataset.");
            } finally {
                setLoading(false);
            }
        };

        void loadReportData();
    }, [reportId]);

    // Parse student metadata helper
    const getStudentMeta = (m: Member) => {
        let meta: any = {};
        if (m.photoPath && m.photoPath.startsWith("{")) {
            try {
                meta = JSON.parse(m.photoPath);
            } catch {}
        }
        const subjects: string[] = Array.isArray(meta.subjects) ? meta.subjects : [];
        const units = subjects.length > 0
            ? subjects.reduce((sum, code) => {
                const sub = courseCurriculumService.getSubjectByCode(code);
                return sum + (sub?.units || 3);
            }, 0)
            : 18; // Default semestral load
        const rate = meta.paymentPerUnit ?? 350;
        const totalTuition = meta.totalTuition ?? (units * rate);
        const amountPaid = meta.amountPaid ?? 0;
        const balance = meta.balance ?? Math.max(0, totalTuition - amountPaid);
        const paymentStatus = meta.paymentStatus || (totalTuition > 0 && balance <= 0 ? "PAID" : (amountPaid > 0 ? "PARTIAL" : "UNPAID"));
        const mode = meta.modeOfLearning || "Modular Field Cohort";

        return {
            subjects,
            units,
            rate,
            totalTuition,
            amountPaid,
            balance,
            paymentStatus,
            mode,
            guardian: meta.guardianName || "N/A",
            guardianContact: meta.guardianContact || "N/A"
        };
    };

    const getFullName = (m: Member) => {
        return [m.firstName, m.middleName, m.lastName, m.suffix].filter(Boolean).join(" ").trim() || m.memberCode || "Student";
    };

    // Filter students
    const filteredMembers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return members.filter(m => {
            const name = getFullName(m).toLowerCase();
            const code = (m.memberCode || "").toLowerCase();
            const email = (m.email || "").toLowerCase();
            const prog = (m.ministry || "").toLowerCase();
            const year = (m.civilStatus || "").toLowerCase();
            const meta = getStudentMeta(m);

            const matchesSearch = !query || name.includes(query) || code.includes(query) || email.includes(query) || prog.includes(query) || year.includes(query);
            const matchesProg = programFilter === "ALL" || (m.ministry || "") === programFilter;
            const matchesYear = yearFilter === "ALL" || (m.civilStatus || "") === yearFilter;
            const matchesMode = modeFilter === "ALL" || meta.mode === modeFilter;
            const matchesStatus = statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && (m.status || "ACTIVE").toUpperCase() === "ACTIVE") ||
                (statusFilter === "INACTIVE" && (m.status || "").toUpperCase() === "INACTIVE") ||
                (statusFilter === "PAID" && meta.paymentStatus === "PAID") ||
                (statusFilter === "UNPAID" && meta.paymentStatus === "UNPAID") ||
                (statusFilter === "PARTIAL" && meta.paymentStatus === "PARTIAL");

            return matchesSearch && matchesProg && matchesYear && matchesMode && matchesStatus;
        });
    }, [members, searchTerm, programFilter, yearFilter, modeFilter, statusFilter]);

    // Filter subjects across courses
    const allSubjects = useMemo(() => {
        const subs: (CourseSubject & { courseName: string; courseCode: string })[] = [];
        courses.forEach(c => {
            (c.subjects || []).forEach(s => {
                subs.push({
                    ...s,
                    courseName: c.name,
                    courseCode: c.code
                });
            });
        });
        return subs;
    }, [courses]);

    const filteredSubjects = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return allSubjects.filter(s => {
            const matchesSearch = !query || s.code.toLowerCase().includes(query) || s.title.toLowerCase().includes(query) || s.instructor.toLowerCase().includes(query) || s.courseName.toLowerCase().includes(query);
            const matchesProg = programFilter === "ALL" || s.courseName === programFilter;
            return matchesSearch && matchesProg;
        });
    }, [allSubjects, searchTerm, programFilter]);

    // KPI Metrics calculation
    const metrics = useMemo(() => {
        let totalUnits = 0;
        let totalAssessed = 0;
        let totalCollected = 0;
        let totalReceivables = 0;
        let activeCount = 0;

        filteredMembers.forEach(m => {
            const meta = getStudentMeta(m);
            totalUnits += meta.units;
            totalAssessed += meta.totalTuition;
            totalCollected += meta.amountPaid;
            totalReceivables += meta.balance;
            if ((m.status || "ACTIVE").toUpperCase() === "ACTIVE") activeCount++;
        });

        return {
            totalStudents: filteredMembers.length,
            activeStudents: activeCount,
            totalUnits,
            totalAssessed,
            totalCollected,
            totalReceivables
        };
    }, [filteredMembers]);

    // Print Handler using isolated high-res print frame
    const handlePrint = () => {
        const isSubjectReport = reportId === "curriculum-matrix" || reportId === "subject-catalog-report" || reportId === "faculty-workload" || reportId === "class-schedule-matrix";

        if (isSubjectReport) {
            SchoolPrintService.printReport({
                title: reportTitle,
                category: reportCategory,
                description: reportDescription,
                filterSummary: `Filter: ${programFilter !== "ALL" ? programFilter : "All Programs"} • Total Subjects: ${filteredSubjects.length}`,
                summaryCards: [
                    { label: "Total Subjects", value: filteredSubjects.length, subtext: "Curriculum Catalog" },
                    { label: "Theological Programs", value: courses.length, subtext: "Active Curricula" },
                    { label: "Active Faculty", value: new Set(filteredSubjects.map(s => s.instructor)).size, subtext: "Assigned Teachers" },
                    { label: "Total Units", value: filteredSubjects.reduce((sum, s) => sum + s.units, 0), subtext: "Accredited Units" }
                ],
                columns: [
                    { header: "#", width: "4%", align: "center" },
                    { header: "CODE", width: "12%", align: "left" },
                    { header: "SUBJECT TITLE", width: "30%", align: "left" },
                    { header: "UNITS", width: "8%", align: "center" },
                    { header: "DEGREE PROGRAM", width: "18%", align: "left" },
                    { header: "CLASS SCHEDULE", width: "16%", align: "left" },
                    { header: "INSTRUCTOR", width: "12%", align: "left" }
                ],
                rows: filteredSubjects.map((s, idx) => [
                    idx + 1,
                    s.code,
                    s.title,
                    `${s.units} Units`,
                    s.courseName,
                    s.schedule,
                    s.instructor
                ])
            });
        } else {
            SchoolPrintService.printReport({
                title: reportTitle,
                category: reportCategory,
                description: reportDescription,
                filterSummary: `Program: ${programFilter} • Year: ${yearFilter} • Mode: ${modeFilter} • Status: ${statusFilter}`,
                summaryCards: [
                    { label: "Total Students", value: metrics.totalStudents, subtext: `${metrics.activeStudents} Active` },
                    { label: "Enrolled Units", value: metrics.totalUnits, subtext: "Total Academic Load" },
                    { label: "Tuition Assessed", value: `₱${metrics.totalAssessed.toLocaleString()}`, subtext: `₱${metrics.totalCollected.toLocaleString()} Paid` },
                    { label: "Outstanding Receivables", value: `₱${metrics.totalReceivables.toLocaleString()}`, subtext: "Balances Pending" }
                ],
                columns: [
                    { header: "#", width: "4%", align: "center" },
                    { header: "STUDENT ID", width: "14%", align: "left" },
                    { header: "STUDENT FULL NAME", width: "22%", align: "left" },
                    { header: "DEGREE PROGRAM", width: "18%", align: "left" },
                    { header: "YEAR", width: "8%", align: "center" },
                    { header: "MODE OF LEARNING", width: "14%", align: "left" },
                    { header: "UNITS", width: "6%", align: "center" },
                    { header: "TUITION & FEES", width: "14%", align: "right" }
                ],
                rows: filteredMembers.map((m, idx) => {
                    const meta = getStudentMeta(m);
                    return [
                        idx + 1,
                        m.memberCode || `STD-2026-${String(m.memberId).padStart(4, "0")}`,
                        getFullName(m),
                        m.ministry || "Bachelor of Theology (B.Th.)",
                        m.civilStatus || "1st Year",
                        meta.mode,
                        meta.units,
                        `₱${meta.totalTuition.toLocaleString()} (Bal: ₱${meta.balance.toLocaleString()})`
                    ];
                })
            });
        }
    };

    // CSV Export Handler
    const handleExportCsv = () => {
        let csvContent = "";
        const isSubjectReport = reportId === "curriculum-matrix" || reportId === "subject-catalog-report" || reportId === "faculty-workload" || reportId === "class-schedule-matrix";

        if (isSubjectReport) {
            csvContent = "Subject Code,Subject Title,Units,Course / Degree,Schedule,Room / Hub,Instructor,Mode of Learning\n";
            filteredSubjects.forEach(s => {
                csvContent += `"${s.code}","${s.title}",${s.units},"${s.courseName}","${s.schedule}","${s.room}","${s.instructor}","${s.modeOfLearning || 'Modular'}"\n`;
            });
        } else {
            csvContent = "Student ID,Full Name,Degree Program,Year Level,Mode of Learning,Units,Tuition (PHP),Paid (PHP),Balance (PHP),Payment Status,Academic Status\n";
            filteredMembers.forEach(m => {
                const meta = getStudentMeta(m);
                csvContent += `"${m.memberCode || ''}","${getFullName(m)}","${m.ministry || 'B.Th.'}","${m.civilStatus || '1st Year'}","${meta.mode}",${meta.units},${meta.totalTuition},${meta.amountPaid},${meta.balance},"${meta.paymentStatus}","${m.status || 'ACTIVE'}"\n`;
            });
        }

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${reportId}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const isSubjectReport = reportId === "curriculum-matrix" || reportId === "subject-catalog-report" || reportId === "faculty-workload" || reportId === "class-schedule-matrix";

    return (
        <div className="school-report-viewer">
            {/* Top Navigation Bar */}
            <div className="report-viewer-topbar">
                <button type="button" className="report-back-btn" onClick={onBack}>
                    <ArrowLeft size={16} />
                    <span>Back to Reports Catalog</span>
                </button>

                <div className="report-viewer-actions">
                    <button type="button" className="btn-report-action btn-secondary" onClick={handleExportCsv} title="Download spreadsheet data">
                        <Download size={15} />
                        <span>Export to CSV</span>
                    </button>
                    <button type="button" className="btn-report-action btn-primary" onClick={handlePrint} title="Print official institutional document">
                        <Printer size={15} />
                        <span>Print Official Report</span>
                    </button>
                </div>
            </div>

            <div className="report-viewer-content">
                {/* Official Letterhead Header */}
                <div className="report-official-header-card">
                    <div className="school-letterhead">
                        <div className="letterhead-left">
                            <div className="school-emblem">
                                <GraduationCap size={28} />
                            </div>
                            <div>
                                <h1 className="school-name">MOBILE BIBLE SCHOOL</h1>
                                <p className="school-department">School of Theology, Christian Ministry & Biblical Studies • Academic Affairs</p>
                            </div>
                        </div>

                        <div className="letterhead-right">
                            <span className="doc-badge">{reportCategory.toUpperCase()} • OFFICIAL REPORT</span>
                            <div className="doc-date">Generated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        </div>
                    </div>

                    <div className="report-headline-row">
                        <div>
                            <h2 className="report-headline-title">{reportTitle}</h2>
                            <p className="report-headline-desc">{reportDescription}</p>
                        </div>
                    </div>
                </div>

                {/* KPI Metrics Summary */}
                <div className="report-kpi-grid">
                    <div className="report-kpi-card">
                        <div className="kpi-icon-box blue">
                            <Users size={20} />
                        </div>
                        <div className="kpi-details">
                            <span className="kpi-label">Total Records</span>
                            <strong className="kpi-value">{isSubjectReport ? filteredSubjects.length : metrics.totalStudents}</strong>
                            <span className="kpi-subtext">{isSubjectReport ? "Curriculum Subjects" : `${metrics.activeStudents} Active Students`}</span>
                        </div>
                    </div>

                    <div className="report-kpi-card">
                        <div className="kpi-icon-box purple">
                            <BookOpen size={20} />
                        </div>
                        <div className="kpi-details">
                            <span className="kpi-label">{isSubjectReport ? "Programs" : "Enrolled Units"}</span>
                            <strong className="kpi-value">{isSubjectReport ? courses.length : metrics.totalUnits}</strong>
                            <span className="kpi-subtext">{isSubjectReport ? "Degree Programs" : "Total Study Load"}</span>
                        </div>
                    </div>

                    <div className="report-kpi-card">
                        <div className="kpi-icon-box green">
                            <DollarSign size={20} />
                        </div>
                        <div className="kpi-details">
                            <span className="kpi-label">Tuition Assessed</span>
                            <strong className="kpi-value">₱{metrics.totalAssessed.toLocaleString()}</strong>
                            <span className="kpi-subtext">₱{metrics.totalCollected.toLocaleString()} Collected</span>
                        </div>
                    </div>

                    <div className="report-kpi-card">
                        <div className="kpi-icon-box amber">
                            <CreditCard size={20} />
                        </div>
                        <div className="kpi-details">
                            <span className="kpi-label">Outstanding Receivables</span>
                            <strong className="kpi-value">₱{metrics.totalReceivables.toLocaleString()}</strong>
                            <span className="kpi-subtext">Tuition Balances Pending</span>
                        </div>
                    </div>
                </div>

                {/* Interactive Filter Bar */}
                <div className="report-filter-card">
                    <div className="report-search-field">
                        <Search size={15} className="search-icon" />
                        <input
                            type="text"
                            placeholder={isSubjectReport ? "Search subject code, title, instructor..." : "Search student name, student ID, email..."}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-select-group">
                        <div className="filter-select-item">
                            <select value={programFilter} onChange={e => setProgramFilter(e.target.value)}>
                                <option value="ALL">All Academic Programs</option>
                                {courses.map(c => (
                                    <option key={c.id || c.code} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {!isSubjectReport && (
                            <>
                                <div className="filter-select-item">
                                    <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                                        <option value="ALL">All Year Levels</option>
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="4th Year">4th Year</option>
                                    </select>
                                </div>

                                <div className="filter-select-item">
                                    <select value={modeFilter} onChange={e => setModeFilter(e.target.value)}>
                                        <option value="ALL">All Learning Modes</option>
                                        <option value="Modular Field Cohort">Modular Field Cohort</option>
                                        <option value="Hybrid Cloud / Offline Sync">Hybrid Cloud / Offline Sync</option>
                                        <option value="Weekend Intensive">Weekend Intensive</option>
                                        <option value="Online Distance Learning">Online Distance Learning</option>
                                    </select>
                                </div>

                                <div className="filter-select-item">
                                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                        <option value="ALL">All Payment & Standing Statuses</option>
                                        <option value="ACTIVE">Active Students</option>
                                        <option value="INACTIVE">Inactive / On Leave</option>
                                        <option value="PAID">Fully Paid</option>
                                        <option value="PARTIAL">Partial Payment</option>
                                        <option value="UNPAID">Unpaid Balance</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Report Table */}
                <div className="report-table-card">
                    {loading ? (
                        <div className="table-empty-box">
                            <RefreshCw size={28} className="spin-icon" style={{ animation: "spin 1s linear infinite" }} />
                            <p>Loading school records...</p>
                        </div>
                    ) : error ? (
                        <div className="table-empty-box" style={{ color: "#ef4444" }}>
                            <AlertCircle size={28} />
                            <p>{error}</p>
                        </div>
                    ) : isSubjectReport ? (
                        /* Subjects / Curriculum View */
                        <div className="table-responsive-box">
                            <table className="school-report-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "40px" }}>#</th>
                                        <th style={{ width: "110px" }}>CODE</th>
                                        <th>SUBJECT TITLE</th>
                                        <th style={{ width: "60px" }}>UNITS</th>
                                        <th>DEGREE PROGRAM</th>
                                        <th>CLASS SCHEDULE</th>
                                        <th>ROOM / HUB</th>
                                        <th>INSTRUCTOR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubjects.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="table-empty-box">No subjects found matching your filters.</td>
                                        </tr>
                                    ) : (
                                        filteredSubjects.map((sub, idx) => (
                                            <tr key={`${sub.code}-${idx}`}>
                                                <td style={{ color: "#8a8d91" }}>{idx + 1}</td>
                                                <td><span className="std-id-tag">{sub.code}</span></td>
                                                <td><strong>{sub.title}</strong></td>
                                                <td><span className="badge-program">{sub.units} Units</span></td>
                                                <td><span className="badge-program">{sub.courseName}</span></td>
                                                <td><span style={{ fontSize: "12px", color: "#475569" }}><Clock size={11} style={{ display: "inline", marginRight: "4px" }} />{sub.schedule}</span></td>
                                                <td><span style={{ fontSize: "12px", color: "#475569" }}>{sub.room}</span></td>
                                                <td><span style={{ fontSize: "12.5px", fontWeight: 600 }}>{sub.instructor}</span></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* Student & Enrollment View */
                        <div className="table-responsive-box">
                            <table className="school-report-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "40px" }}>#</th>
                                        <th style={{ width: "120px" }}>STUDENT ID</th>
                                        <th>STUDENT NAME</th>
                                        <th>DEGREE PROGRAM</th>
                                        <th style={{ width: "85px" }}>YEAR</th>
                                        <th>MODE OF LEARNING</th>
                                        <th style={{ width: "70px" }}>UNITS</th>
                                        <th>TUITION & FEES</th>
                                        <th>BALANCE</th>
                                        <th style={{ width: "85px" }}>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMembers.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="table-empty-box">No student records found matching your filters.</td>
                                        </tr>
                                    ) : (
                                        filteredMembers.map((m, idx) => {
                                            const meta = getStudentMeta(m);
                                            return (
                                                <tr key={m.memberId}>
                                                    <td style={{ color: "#8a8d91" }}>{idx + 1}</td>
                                                    <td>
                                                        <span className="std-id-tag">{m.memberCode || `STD-2026-${String(m.memberId).padStart(4, "0")}`}</span>
                                                    </td>
                                                    <td className="std-name-cell">
                                                        <strong>{getFullName(m)}</strong>
                                                        <span>{m.email || m.contactNumber || "No contact info"}</span>
                                                    </td>
                                                    <td>
                                                        <span className="badge-program">{m.ministry || "Bachelor of Theology (B.Th.)"}</span>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontWeight: 600, color: "#334155" }}>{m.civilStatus || "1st Year"}</span>
                                                    </td>
                                                    <td>
                                                        <span className="badge-mode">
                                                            <Layers size={10} />
                                                            {meta.mode}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <strong>{meta.units}</strong>
                                                    </td>
                                                    <td>
                                                        <div>₱{meta.totalTuition.toLocaleString()}</div>
                                                        <span style={{ fontSize: "11px", color: "#16a34a" }}>Paid: ₱{meta.amountPaid.toLocaleString()}</span>
                                                    </td>
                                                    <td>
                                                        <strong style={{ color: meta.balance > 0 ? "#dc2626" : "#16a34a" }}>
                                                            ₱{meta.balance.toLocaleString()}
                                                        </strong>
                                                    </td>
                                                    <td>
                                                        <span className={`badge-status ${meta.paymentStatus.toLowerCase()}`}>
                                                            {meta.paymentStatus}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Official Signoff Block for Printing */}
                <div className="report-signoff-card">
                    <div className="signoff-title">Institutional Verification & Sign-off</div>
                    <div className="signoff-grid">
                        <div>
                            <div className="signoff-line" />
                            <div className="signoff-name">Office of the University Registrar</div>
                            <div className="signoff-role">Prepared & Certified Official</div>
                        </div>
                        <div>
                            <div className="signoff-line" />
                            <div className="signoff-name">Dean of Academic Affairs</div>
                            <div className="signoff-role">Verified Academic Standing</div>
                        </div>
                        <div>
                            <div className="signoff-line" />
                            <div className="signoff-name">School President / Chancellor</div>
                            <div className="signoff-role">Final Institutional Approval</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
