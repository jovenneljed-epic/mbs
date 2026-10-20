import React, { useState, useEffect, useMemo } from "react";
import {
    GraduationCap,
    Users,
    BookOpen,
    Briefcase,
    Search,
    Plus,
    Edit3,
    Trash2,
    Eye,
    Mail,
    MapPin,
    Award,
    Printer,
    X,
    UserCheck,
    LayoutGrid,
    List,
    CheckCircle2
} from "lucide-react";
import { API_BASE_URL } from "../config";
import { courseCurriculumService } from "../services/courseCurriculumService";
import type { CourseProgram, CourseSubject } from "../services/courseCurriculumService";
import { SchoolPrintService } from "../utils/schoolPrintService";
import "./FacultyStaffCorner.css";

/* =========================================================
   TYPES
========================================================= */

export type FacultyClassification = "Teaching Faculty" | "Non-Teaching Staff";
export type EmploymentType = "Full-Time" | "Part-Time" | "Adjunct / Visiting" | "Emeritus";

export interface FacultyStaff {
    id: string;
    employeeCode: string;
    honorific: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    suffix?: string;
    gender: "Male" | "Female";
    classification: FacultyClassification;
    department: string;
    academicRank: string;
    highestDegree: string;
    almaMater?: string;
    specialization: string;
    email: string;
    phone: string;
    officeLocation: string;
    consultationHours: string;
    employmentType: EmploymentType;
    status: "ACTIVE" | "ON LEAVE" | "INACTIVE";
    dateHired: string;
    bio: string;
    photoUrl?: string;
    assignedSubjectCodes: string[];
}

interface Member {
    memberId: number;
    memberCode?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    suffix?: string;
    ministry?: string;
    civilStatus?: string;
    contactNumber?: string;
    email?: string;
    status?: string;
    photoPath?: string;
}

const STORAGE_KEY = "mbs_faculty_staff_catalog_v2";

const DEFAULT_FACULTY_STAFF: FacultyStaff[] = [
    {
        id: "fac-1",
        employeeCode: "FAC-2026-001",
        honorific: "Dr.",
        firstName: "Samuel",
        middleName: "A.",
        lastName: "Vance",
        suffix: "Th.D.",
        gender: "Male",
        classification: "Teaching Faculty",
        department: "School of Theology & Biblical Studies",
        academicRank: "Dean of Academic Affairs & Professor of Systematic Theology",
        highestDegree: "Th.D. in Systematic Theology (Dallas Theological Seminary)",
        almaMater: "Dallas Theological Seminary",
        specialization: "Systematic Theology, Hermeneutics & Pauline Epistles",
        email: "s.vance@mobilebibleschool.edu",
        phone: "+63 917 555 0101",
        officeLocation: "Academic Dean's Office • Hall of Faith Rm 101",
        consultationHours: "Mon & Wed 1:00 PM - 4:00 PM",
        employmentType: "Full-Time",
        status: "ACTIVE",
        dateHired: "2018-06-01",
        bio: "Dr. Samuel Vance has served as theological educator, academic dean, and pastoral preceptor for over 20 years with extensive research in biblical covenant theology.",
        assignedSubjectCodes: ["HERM-101", "THEO-101"]
    },
    {
        id: "fac-2",
        employeeCode: "FAC-2026-002",
        honorific: "Prof.",
        firstName: "Nathan",
        middleName: "E.",
        lastName: "Cole",
        suffix: "M.Div.",
        gender: "Male",
        classification: "Teaching Faculty",
        department: "School of Theology & Biblical Studies",
        academicRank: "Associate Professor of Old Testament Literature",
        highestDegree: "M.Div. in Old Testament Exegesis & Biblical Hebrew",
        almaMater: "Trinity Evangelical Divinity School",
        specialization: "Pentateuch, Hebrew Grammar & Covenant Theology",
        email: "n.cole@mobilebibleschool.edu",
        phone: "+63 918 555 0102",
        officeLocation: "Old Testament Faculty Hub • Rm 204",
        consultationHours: "Tue & Thu 9:00 AM - 12:00 PM",
        employmentType: "Full-Time",
        status: "ACTIVE",
        dateHired: "2020-08-15",
        bio: "Prof. Nathan Cole specializes in Old Testament covenant themes, Hebrew syntax, and biblical archaeology across the Ancient Near East.",
        assignedSubjectCodes: ["OT-101"]
    },
    {
        id: "fac-3",
        employeeCode: "FAC-2026-003",
        honorific: "Dr.",
        firstName: "Elizabeth",
        middleName: "M.",
        lastName: "Warren",
        suffix: "Ph.D.",
        gender: "Female",
        classification: "Teaching Faculty",
        department: "School of Theology & Biblical Studies",
        academicRank: "Professor of New Testament Exegesis & Koine Greek",
        highestDegree: "Ph.D. in Biblical Studies (Wheaton College Graduate School)",
        almaMater: "Wheaton College Graduate School",
        specialization: "Koine Greek, Johannine Literature, Gospels Exegesis",
        email: "e.warren@mobilebibleschool.edu",
        phone: "+63 919 555 0103",
        officeLocation: "Biblical Languages Hub • Rm 208",
        consultationHours: "Friday 8:00 AM - 12:00 PM",
        employmentType: "Full-Time",
        status: "ACTIVE",
        dateHired: "2019-01-10",
        bio: "Dr. Elizabeth Warren authored multiple textbooks on first-century apostolic history, contextual hermeneutics, and New Testament textual criticism.",
        assignedSubjectCodes: ["NT-101"]
    },
    {
        id: "fac-4",
        employeeCode: "FAC-2026-004",
        honorific: "Pastor",
        firstName: "David",
        middleName: "J.",
        lastName: "Morales",
        suffix: "D.Min.",
        gender: "Male",
        classification: "Teaching Faculty",
        department: "Department of Pastoral Ministry & Missions",
        academicRank: "Senior Lecturer in Pastoral Care & Church Planting",
        highestDegree: "D.Min. in Pastoral Leadership (Asbury Theological Seminary)",
        almaMater: "Asbury Theological Seminary",
        specialization: "Pastoral Leadership, Homiletics & Church Planting",
        email: "d.morales@mobilebibleschool.edu",
        phone: "+63 920 555 0104",
        officeLocation: "Pastoral Ministry Center • Hub A",
        consultationHours: "Saturday 1:00 PM - 5:00 PM",
        employmentType: "Adjunct / Visiting",
        status: "ACTIVE",
        dateHired: "2021-06-01",
        bio: "Pastor David Morales has pioneered 14 provincial church plants and mentors modular field cohort candidates across rural theological centers.",
        assignedSubjectCodes: ["MIN-101"]
    },
    {
        id: "stf-1",
        employeeCode: "STF-2026-001",
        honorific: "Mrs.",
        firstName: "Clarissa",
        middleName: "B.",
        lastName: "Mendez",
        suffix: "M.Ed.",
        gender: "Female",
        classification: "Non-Teaching Staff",
        department: "Office of the University Registrar & Admissions",
        academicRank: "Chief University Registrar & Records Head",
        highestDegree: "M.Ed. in Educational Administration",
        almaMater: "University of the Philippines",
        specialization: "Academic Registry, Transcripts & Matriculation Assessments",
        email: "registrar@mobilebibleschool.edu",
        phone: "+63 922 555 0201",
        officeLocation: "Registrar's Office • Admin Wing Rm 102",
        consultationHours: "Mon-Fri 8:00 AM - 5:00 PM",
        employmentType: "Full-Time",
        status: "ACTIVE",
        dateHired: "2017-04-15",
        bio: "Mrs. Clarissa Mendez oversees official student academic records, certificates of matriculation, graduation clearances, and CHED compliance.",
        assignedSubjectCodes: []
    },
    {
        id: "stf-2",
        employeeCode: "STF-2026-002",
        honorific: "Mr.",
        firstName: "Benjamin",
        middleName: "T.",
        lastName: "Cruz",
        suffix: "B.S.",
        gender: "Male",
        classification: "Non-Teaching Staff",
        department: "Office of the University Registrar & Admissions",
        academicRank: "Admissions Officer & Provincial Hub Logistics Coordinator",
        highestDegree: "B.S. in Information Systems",
        almaMater: "De La Salle University",
        specialization: "Student Admissions & Modular Weekend Field Rotations",
        email: "admissions@mobilebibleschool.edu",
        phone: "+63 923 555 0202",
        officeLocation: "Admissions Office • Admin Wing Rm 105",
        consultationHours: "Mon-Fri 8:00 AM - 5:00 PM",
        employmentType: "Full-Time",
        status: "ACTIVE",
        dateHired: "2022-02-01",
        bio: "Mr. Benjamin Cruz manages incoming theological applications, entrance evaluations, and coordinates travel schedules for provincial modular hubs.",
        assignedSubjectCodes: []
    },
    {
        id: "stf-3",
        employeeCode: "STF-2026-003",
        honorific: "Ms.",
        firstName: "Rachel",
        middleName: "S.",
        lastName: "Santos",
        suffix: "CPA",
        gender: "Female",
        classification: "Non-Teaching Staff",
        department: "Finance & Student Accounts Office",
        academicRank: "Student Accounts & Tuition Billing Comptroller",
        highestDegree: "B.S. in Accountancy, Certified Public Accountant",
        almaMater: "University of Santo Tomas",
        specialization: "Tuition Fee Billing, Payment Per Unit Assessments, Financial Grants",
        email: "finance@mobilebibleschool.edu",
        phone: "+63 925 555 0203",
        officeLocation: "Bursar & Finance Office • Admin Wing Rm 108",
        consultationHours: "Mon-Fri 8:30 AM - 4:30 PM",
        employmentType: "Full-Time",
        status: "ACTIVE",
        dateHired: "2019-11-01",
        bio: "Ms. Rachel Santos oversees student tuition accounts, flexible payment plan arrangements, and pastoral study sponsorship disbursements.",
        assignedSubjectCodes: []
    }
];

const getToken = (): string | null => {
    const keys = ["token", "accessToken", "jwt", "authToken", "epicToken"];
    for (const key of keys) {
        const value = localStorage.getItem(key);
        if (value) return value.replace(/^Bearer\s+/i, "").trim();
    }
    return null;
};

export const FacultyStaffCorner: React.FC = () => {
    const [facultyList, setFacultyList] = useState<FacultyStaff[]>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch {}
        return DEFAULT_FACULTY_STAFF;
    });

    const [students, setStudents] = useState<Member[]>([]);
    const [courses, setCourses] = useState<CourseProgram[]>([]);

    // Filters
    const [search, setSearch] = useState("");
    const [classFilter, setClassFilter] = useState<"ALL" | FacultyClassification>("ALL");
    const [deptFilter, setDeptFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

    // Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<FacultyStaff | null>(null);
    const [selectedDetailStaff, setSelectedDetailStaff] = useState<FacultyStaff | null>(null);

    // Form State
    const [formData, setFormData] = useState<{
        honorific: string;
        firstName: string;
        middleName: string;
        lastName: string;
        suffix: string;
        gender: "Male" | "Female";
        classification: FacultyClassification;
        department: string;
        academicRank: string;
        highestDegree: string;
        almaMater: string;
        specialization: string;
        email: string;
        phone: string;
        officeLocation: string;
        consultationHours: string;
        employmentType: EmploymentType;
        status: "ACTIVE" | "ON LEAVE" | "INACTIVE";
        bio: string;
        assignedSubjectCodes: string[];
    }>({
        honorific: "Prof.",
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        gender: "Male",
        classification: "Teaching Faculty",
        department: "School of Theology & Biblical Studies",
        academicRank: "Assistant Professor",
        highestDegree: "M.Div. in Theological Studies",
        almaMater: "",
        specialization: "Biblical Exegesis & Theology",
        email: "",
        phone: "",
        officeLocation: "Main Faculty Hall",
        consultationHours: "Mon & Wed 2:00 PM - 5:00 PM",
        employmentType: "Full-Time",
        status: "ACTIVE",
        bio: "",
        assignedSubjectCodes: []
    });

    // Save to LocalStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(facultyList));
    }, [facultyList]);

    // Load Courses & Students
    useEffect(() => {
        const loadAcademicData = async () => {
            try {
                const loadedCourses = courseCurriculumService.getCourses();
                setCourses(loadedCourses);

                const baseUrl = API_BASE_URL.replace(/\/+$/, "");
                const token = getToken();
                const headers = new Headers();
                if (token) headers.set("Authorization", `Bearer ${token}`);

                const resp = await fetch(`${baseUrl}/Members`, { headers });
                if (resp.ok) {
                    const data = await resp.json();
                    const list = Array.isArray(data) ? data : data.members || data.data || [];
                    setStudents(list);
                }
            } catch (err) {
                console.error("Failed to load academic records in Faculty Corner:", err);
            }
        };

        void loadAcademicData();
    }, []);

    // Helper: Map all accredited subjects
    const allAvailableSubjects = useMemo(() => {
        const subs: CourseSubject[] = [];
        courses.forEach(c => {
            (c.subjects || []).forEach(s => {
                if (!subs.some(existing => existing.code === s.code)) {
                    subs.push(s);
                }
            });
        });
        return subs;
    }, [courses]);

    // Helper: Match enrolled students under a faculty member's subjects
    const getEnrolledStudentsForFaculty = (faculty: FacultyStaff) => {
        if (faculty.classification !== "Teaching Faculty" || faculty.assignedSubjectCodes.length === 0) {
            return [];
        }

        return students.filter(student => {
            let enrolledCodes: string[] = [];
            if (student.photoPath && student.photoPath.startsWith("{")) {
                try {
                    const parsed = JSON.parse(student.photoPath);
                    if (Array.isArray(parsed.subjects)) {
                        enrolledCodes = parsed.subjects;
                    }
                } catch {}
            }

            // Fallback: check if the student enrolled in any of faculty's assigned subjects
            const hasExplicitMatch = faculty.assignedSubjectCodes.some(code => enrolledCodes.includes(code));
            if (hasExplicitMatch) return true;

            // Default program match if student has no explicit subjects
            if (enrolledCodes.length === 0 && student.ministry?.includes("Theology")) {
                return faculty.department.includes("Theology");
            }

            return false;
        });
    };

    // Calculate Teaching Load for faculty
    const getTeachingLoad = (faculty: FacultyStaff) => {
        const assigned = faculty.assignedSubjectCodes.map(code => courseCurriculumService.getSubjectByCode(code)).filter(Boolean) as CourseSubject[];
        const totalUnits = assigned.reduce((sum, s) => sum + s.units, 0);
        return {
            subjectsCount: assigned.length,
            totalUnits,
            assigned
        };
    };

    // Filter faculty list
    const filteredFaculty = useMemo(() => {
        const query = search.trim().toLowerCase();
        return facultyList.filter(f => {
            const fullName = `${f.honorific} ${f.firstName} ${f.lastName} ${f.suffix || ""}`.toLowerCase();
            const code = f.employeeCode.toLowerCase();
            const dept = f.department.toLowerCase();
            const spec = f.specialization.toLowerCase();
            const hasSubjectMatch = f.assignedSubjectCodes.some(c => c.toLowerCase().includes(query));

            const matchesSearch = !query || fullName.includes(query) || code.includes(query) || dept.includes(query) || spec.includes(query) || hasSubjectMatch;
            const matchesClass = classFilter === "ALL" || f.classification === classFilter;
            const matchesDept = deptFilter === "ALL" || f.department === deptFilter;
            const matchesStatus = statusFilter === "ALL" || f.status === statusFilter;

            return matchesSearch && matchesClass && matchesDept && matchesStatus;
        });
    }, [facultyList, search, classFilter, deptFilter, statusFilter]);

    // KPI Metrics
    const kpiMetrics = useMemo(() => {
        const teaching = facultyList.filter(f => f.classification === "Teaching Faculty");
        const nonTeaching = facultyList.filter(f => f.classification === "Non-Teaching Staff");
        const totalUnits = teaching.reduce((acc, f) => acc + getTeachingLoad(f).totalUnits, 0);

        return {
            totalStaff: facultyList.length,
            teachingCount: teaching.length,
            nonTeachingCount: nonTeaching.length,
            totalTeachingUnits: totalUnits,
            totalEnrolledStudents: students.length
        };
    }, [facultyList, students]);

    // Open Add Modal
    const handleOpenAdd = () => {
        setEditingStaff(null);
        setFormData({
            honorific: "Prof.",
            firstName: "",
            middleName: "",
            lastName: "",
            suffix: "",
            gender: "Male",
            classification: "Teaching Faculty",
            department: "School of Theology & Biblical Studies",
            academicRank: "Assistant Professor",
            highestDegree: "M.Div. in Theological Studies",
            almaMater: "",
            specialization: "Biblical Exegesis & Theology",
            email: "",
            phone: "",
            officeLocation: "Main Faculty Hall • Rm 101",
            consultationHours: "Mon & Wed 2:00 PM - 5:00 PM",
            employmentType: "Full-Time",
            status: "ACTIVE",
            bio: "",
            assignedSubjectCodes: []
        });
        setIsFormModalOpen(true);
    };

    // Open Edit Modal
    const handleOpenEdit = (staff: FacultyStaff) => {
        setEditingStaff(staff);
        setFormData({
            honorific: staff.honorific,
            firstName: staff.firstName,
            middleName: staff.middleName || "",
            lastName: staff.lastName,
            suffix: staff.suffix || "",
            gender: staff.gender,
            classification: staff.classification,
            department: staff.department,
            academicRank: staff.academicRank,
            highestDegree: staff.highestDegree,
            almaMater: staff.almaMater || "",
            specialization: staff.specialization,
            email: staff.email,
            phone: staff.phone,
            officeLocation: staff.officeLocation,
            consultationHours: staff.consultationHours,
            employmentType: staff.employmentType,
            status: staff.status,
            bio: staff.bio,
            assignedSubjectCodes: staff.assignedSubjectCodes
        });
        setIsFormModalOpen(true);
    };

    // Save Faculty Member
    const handleSaveStaff = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            alert("First and last names are required.");
            return;
        }

        if (editingStaff) {
            // Update
            setFacultyList(prev => prev.map(item => {
                if (item.id === editingStaff.id) {
                    return {
                        ...item,
                        ...formData
                    };
                }
                return item;
            }));
        } else {
            // Create New
            const prefix = formData.classification === "Teaching Faculty" ? "FAC" : "STF";
            const newCode = `${prefix}-2026-${String(facultyList.length + 1).padStart(3, "0")}`;
            const newStaff: FacultyStaff = {
                id: `staff-${Date.now()}`,
                employeeCode: newCode,
                dateHired: new Date().toISOString().split("T")[0],
                ...formData
            };
            setFacultyList(prev => [newStaff, ...prev]);
        }

        setIsFormModalOpen(false);
    };

    // Delete Faculty Member
    const handleDeleteStaff = (staff: FacultyStaff) => {
        if (window.confirm(`Are you sure you want to remove ${staff.honorific} ${staff.firstName} ${staff.lastName} from the faculty roster?`)) {
            setFacultyList(prev => prev.filter(f => f.id !== staff.id));
            if (selectedDetailStaff?.id === staff.id) {
                setSelectedDetailStaff(null);
            }
        }
    };

    // Toggle Assigned Subject Checkbox
    const toggleSubjectAssignment = (code: string) => {
        setFormData(prev => {
            const exists = prev.assignedSubjectCodes.includes(code);
            if (exists) {
                return {
                    ...prev,
                    assignedSubjectCodes: prev.assignedSubjectCodes.filter(c => c !== code)
                };
            } else {
                return {
                    ...prev,
                    assignedSubjectCodes: [...prev.assignedSubjectCodes, code]
                };
            }
        });
    };

    // Print Faculty Directory
    const handlePrintDirectory = () => {
        SchoolPrintService.printReport({
            title: "Faculty & Staff Institutional Directory",
            category: "Academic Faculty & Administration",
            description: "Official roster of teaching professors, preceptors, and non-teaching administrative officers.",
            filterSummary: `Category: ${classFilter} • Department: ${deptFilter} • Status: ${statusFilter}`,
            summaryCards: [
                { label: "Total Staff", value: kpiMetrics.totalStaff, subtext: "Institutional Roster" },
                { label: "Teaching Faculty", value: kpiMetrics.teachingCount, subtext: "Professors & Lecturers" },
                { label: "Non-Teaching Staff", value: kpiMetrics.nonTeachingCount, subtext: "Administrative Personnel" },
                { label: "Teaching Load", value: `${kpiMetrics.totalTeachingUnits} Units`, subtext: "Accredited Subjects" }
            ],
            columns: [
                { header: "#", width: "4%", align: "center" },
                { header: "CODE", width: "12%", align: "left" },
                { header: "FACULTY / STAFF NAME", width: "24%", align: "left" },
                { header: "CLASSIFICATION", width: "14%", align: "left" },
                { header: "DEPARTMENT", width: "20%", align: "left" },
                { header: "RANK / DESIGNATION", width: "16%", align: "left" },
                { header: "LOAD / SUBJECTS", width: "10%", align: "center" }
            ],
            rows: filteredFaculty.map((f, idx) => {
                const load = getTeachingLoad(f);
                return [
                    idx + 1,
                    f.employeeCode,
                    `${f.honorific} ${f.firstName} ${f.lastName} ${f.suffix || ""}`,
                    f.classification,
                    f.department,
                    f.academicRank,
                    f.classification === "Teaching Faculty" ? `${load.totalUnits} Units (${load.subjectsCount})` : "Admin"
                ];
            })
        });
    };

    return (
        <div className="faculty-corner-container">
            {/* Hero Banner */}
            <div className="faculty-hero">
                <div className="faculty-hero-left">
                    <div className="faculty-hero-icon">
                        <GraduationCap size={32} />
                    </div>
                    <div>
                        <span className="hero-tagline">Mobile Bible School • Academic System</span>
                        <h1>Teachers & Faculty Corner</h1>
                        <p>
                            Comprehensive profiling for teaching professors and non-teaching administrative staff. Assign curriculum course subjects, compute teaching loads, and track student class rosters.
                        </p>
                    </div>
                </div>

                <div className="faculty-hero-actions">
                    <button type="button" className="hero-btn secondary" onClick={handlePrintDirectory}>
                        <Printer size={16} />
                        <span>Print Directory</span>
                    </button>
                    <button type="button" className="hero-btn primary" onClick={handleOpenAdd}>
                        <Plus size={17} />
                        <span>Add Faculty / Staff</span>
                    </button>
                </div>
            </div>

            <div className="faculty-body">
                {/* KPI Metrics */}
                <div className="faculty-kpi-grid">
                    <div className="faculty-kpi-card">
                        <div className="kpi-icon-wrapper blue">
                            <Users size={22} />
                        </div>
                        <div className="kpi-info-col">
                            <span className="kpi-title">Total Personnel</span>
                            <strong className="kpi-count">{kpiMetrics.totalStaff}</strong>
                            <span className="kpi-note">Official School Staff</span>
                        </div>
                    </div>

                    <div className="faculty-kpi-card">
                        <div className="kpi-icon-wrapper purple">
                            <GraduationCap size={22} />
                        </div>
                        <div className="kpi-info-col">
                            <span className="kpi-title">Teaching Faculty</span>
                            <strong className="kpi-count">{kpiMetrics.teachingCount}</strong>
                            <span className="kpi-note">Professors & Preceptors</span>
                        </div>
                    </div>

                    <div className="faculty-kpi-card">
                        <div className="kpi-icon-wrapper emerald">
                            <Briefcase size={22} />
                        </div>
                        <div className="kpi-info-col">
                            <span className="kpi-title">Non-Teaching Staff</span>
                            <strong className="kpi-count">{kpiMetrics.nonTeachingCount}</strong>
                            <span className="kpi-note">Registrar, Billing & Admin</span>
                        </div>
                    </div>

                    <div className="faculty-kpi-card">
                        <div className="kpi-icon-wrapper amber">
                            <BookOpen size={22} />
                        </div>
                        <div className="kpi-info-col">
                            <span className="kpi-title">Total Teaching Units</span>
                            <strong className="kpi-count">{kpiMetrics.totalTeachingUnits}</strong>
                            <span className="kpi-note">Accredited Subject Load</span>
                        </div>
                    </div>

                    <div className="faculty-kpi-card">
                        <div className="kpi-icon-wrapper indigo">
                            <UserCheck size={22} />
                        </div>
                        <div className="kpi-info-col">
                            <span className="kpi-title">Enrolled Students</span>
                            <strong className="kpi-count">{kpiMetrics.totalEnrolledStudents}</strong>
                            <span className="kpi-note">Under Active Roster</span>
                        </div>
                    </div>
                </div>

                {/* Control & Filter Card */}
                <div className="faculty-control-card">
                    <div className="control-top-row">
                        <div className="classification-tabs">
                            <button
                                type="button"
                                className={`tab-pill ${classFilter === "ALL" ? "active" : ""}`}
                                onClick={() => setClassFilter("ALL")}
                            >
                                <Users size={15} />
                                <span>All Personnel ({facultyList.length})</span>
                            </button>
                            <button
                                type="button"
                                className={`tab-pill ${classFilter === "Teaching Faculty" ? "active" : ""}`}
                                onClick={() => setClassFilter("Teaching Faculty")}
                            >
                                <GraduationCap size={15} />
                                <span>Teaching Faculty ({kpiMetrics.teachingCount})</span>
                            </button>
                            <button
                                type="button"
                                className={`tab-pill ${classFilter === "Non-Teaching Staff" ? "active" : ""}`}
                                onClick={() => setClassFilter("Non-Teaching Staff")}
                            >
                                <Briefcase size={15} />
                                <span>Non-Teaching Staff ({kpiMetrics.nonTeachingCount})</span>
                            </button>
                        </div>

                        <div className="view-mode-toggle">
                            <button
                                type="button"
                                className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                                onClick={() => setViewMode("grid")}
                                title="Grid View"
                            >
                                <LayoutGrid size={15} />
                                <span>Grid</span>
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn ${viewMode === "table" ? "active" : ""}`}
                                onClick={() => setViewMode("table")}
                                title="Table View"
                            >
                                <List size={15} />
                                <span>Table</span>
                            </button>
                        </div>
                    </div>

                    <div className="control-bottom-row">
                        <div className="faculty-search-box">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search faculty name, faculty ID, specialization, or subject code..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="faculty-select-filter">
                            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                                <option value="ALL">All Departments</option>
                                <option value="School of Theology & Biblical Studies">School of Theology & Biblical Studies</option>
                                <option value="Department of Pastoral Ministry & Missions">Department of Pastoral Ministry & Missions</option>
                                <option value="Office of the University Registrar & Admissions">Office of the University Registrar & Admissions</option>
                                <option value="Finance & Student Accounts Office">Finance & Student Accounts Office</option>
                            </select>
                        </div>

                        <div className="faculty-select-filter">
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                <option value="ALL">All Statuses</option>
                                <option value="ACTIVE">Active</option>
                                <option value="ON LEAVE">On Leave</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main View: Grid vs Table */}
                {filteredFaculty.length === 0 ? (
                    <div className="faculty-empty-state">
                        <Users size={48} color="#94a3b8" />
                        <p>No faculty or staff found matching your filter criteria.</p>
                        <button type="button" className="hero-btn primary" onClick={handleOpenAdd} style={{ background: "#1877f2", color: "#fff" }}>
                            <Plus size={16} />
                            <span>Add New Faculty / Staff</span>
                        </button>
                    </div>
                ) : viewMode === "grid" ? (
                    /* GRID CARDS VIEW */
                    <div className="faculty-cards-grid">
                        {filteredFaculty.map(staff => {
                            const isTeaching = staff.classification === "Teaching Faculty";
                            const load = getTeachingLoad(staff);
                            const enrolledStudents = getEnrolledStudentsForFaculty(staff);

                            return (
                                <div key={staff.id} className="faculty-profile-card">
                                    <div className="faculty-card-header">
                                        <div className={`faculty-avatar ${!isTeaching ? "staff" : ""}`}>
                                            {staff.firstName[0]}{staff.lastName[0]}
                                        </div>
                                        <div className="faculty-header-details">
                                            <div className="faculty-name-row">
                                                <h3 className="faculty-full-name">
                                                    {staff.honorific} {staff.firstName} {staff.lastName} {staff.suffix || ""}
                                                </h3>
                                                <span className="badge-emp-code">{staff.employeeCode}</span>
                                            </div>
                                            <div className="faculty-rank-title">{staff.academicRank}</div>
                                            <p className="faculty-department-name">{staff.department}</p>
                                        </div>
                                    </div>

                                    <div className="faculty-card-body">
                                        <div className="faculty-meta-item">
                                            <Award size={14} color="#1877f2" />
                                            <span><strong>Degree:</strong> {staff.highestDegree}</span>
                                        </div>
                                        <div className="faculty-meta-item">
                                            <Mail size={14} color="#64748b" />
                                            <span>{staff.email}</span>
                                        </div>
                                        <div className="faculty-meta-item">
                                            <MapPin size={14} color="#64748b" />
                                            <span>{staff.officeLocation}</span>
                                        </div>

                                        {/* Assigned Course Subjects */}
                                        {isTeaching && (
                                            <div className="assigned-subjects-box">
                                                <div className="assigned-header">
                                                    <span className="assigned-header-title">Assigned Course Subjects</span>
                                                    <span className="teaching-load-pill">{load.totalUnits} Units</span>
                                                </div>

                                                {load.assigned.length > 0 ? (
                                                    <div className="subject-tag-list">
                                                        {load.assigned.map(s => (
                                                            <div key={s.code} className="subject-tag" title={`${s.title} (${s.schedule})`}>
                                                                <strong>{s.code}</strong>
                                                                <span className="units-dot">• {s.units}u</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: "11.5px", color: "#8a8d91" }}>No subjects assigned yet</span>
                                                )}

                                                <div className="student-roster-count">
                                                    <Users size={13} />
                                                    <span>{enrolledStudents.length} Students Enrolled in Classes</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="faculty-card-actions">
                                        <button
                                            type="button"
                                            className="action-btn-link"
                                            onClick={() => setSelectedDetailStaff(staff)}
                                        >
                                            <Eye size={14} />
                                            <span>View Profile & Class Roster</span>
                                        </button>

                                        <div className="card-btn-group">
                                            <button
                                                type="button"
                                                className="icon-btn-circle"
                                                onClick={() => handleOpenEdit(staff)}
                                                title="Edit Faculty Details"
                                                aria-label="Edit Profile"
                                            >
                                                <Edit3 size={15} strokeWidth={2.2} />
                                            </button>
                                            <button
                                                type="button"
                                                className="icon-btn-circle delete"
                                                onClick={() => handleDeleteStaff(staff)}
                                                title="Remove Staff"
                                                aria-label="Remove Staff"
                                            >
                                                <Trash2 size={15} strokeWidth={2.2} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* TABLE VIEW */
                    <div className="faculty-table-card">
                        <table className="faculty-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "40px" }}>#</th>
                                    <th style={{ width: "120px" }}>CODE</th>
                                    <th>NAME & CREDENTIALS</th>
                                    <th>CLASSIFICATION</th>
                                    <th>DEPARTMENT</th>
                                    <th>RANK / TITLE</th>
                                    <th>TEACHING LOAD</th>
                                    <th>OFFICE & CONSULTATION</th>
                                    <th style={{ width: "100px", textAlign: "center" }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFaculty.map((staff, idx) => {
                                    const isTeaching = staff.classification === "Teaching Faculty";
                                    const load = getTeachingLoad(staff);

                                    return (
                                        <tr key={staff.id}>
                                            <td style={{ color: "#8a8d91" }}>{idx + 1}</td>
                                            <td><span className="badge-emp-code">{staff.employeeCode}</span></td>
                                            <td>
                                                <strong style={{ color: "#050505", display: "block" }}>
                                                    {staff.honorific} {staff.firstName} {staff.lastName} {staff.suffix || ""}
                                                </strong>
                                                <span style={{ fontSize: "11px", color: "#64748b" }}>{staff.highestDegree}</span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    fontSize: "11px",
                                                    fontWeight: 700,
                                                    padding: "2px 8px",
                                                    borderRadius: "4px",
                                                    background: isTeaching ? "#eff6ff" : "#f1f5f9",
                                                    color: isTeaching ? "#1d4ed8" : "#475569"
                                                }}>
                                                    {staff.classification}
                                                </span>
                                            </td>
                                            <td>{staff.department}</td>
                                            <td><strong style={{ color: "#1877f2" }}>{staff.academicRank}</strong></td>
                                            <td>
                                                {isTeaching ? (
                                                    <span style={{ fontWeight: 700, color: "#166534" }}>
                                                        {load.totalUnits} Units ({load.subjectsCount} Subjects)
                                                    </span>
                                                ) : (
                                                    <span style={{ color: "#8a8d91" }}>Administrative</span>
                                                )}
                                            </td>
                                            <td>
                                                <span style={{ fontSize: "11.5px", color: "#475569", display: "block" }}>{staff.officeLocation}</span>
                                                <span style={{ fontSize: "11px", color: "#8a8d91" }}>{staff.consultationHours}</span>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <div style={{ display: "inline-flex", gap: "6px" }}>
                                                    <button
                                                        type="button"
                                                        className="icon-btn-circle"
                                                        onClick={() => setSelectedDetailStaff(staff)}
                                                        title="View Details"
                                                        aria-label="View Details"
                                                    >
                                                        <Eye size={15} strokeWidth={2.2} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="icon-btn-circle"
                                                        onClick={() => handleOpenEdit(staff)}
                                                        title="Edit Profile"
                                                        aria-label="Edit Profile"
                                                    >
                                                        <Edit3 size={15} strokeWidth={2.2} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="icon-btn-circle delete"
                                                        onClick={() => handleDeleteStaff(staff)}
                                                        title="Delete Staff"
                                                        aria-label="Delete Staff"
                                                    >
                                                        <Trash2 size={15} strokeWidth={2.2} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* DETAIL MODAL: PROFILE & CLASS ROSTER */}
            {selectedDetailStaff && (
                <div className="faculty-modal-overlay" onClick={() => setSelectedDetailStaff(null)}>
                    <div className="faculty-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="faculty-modal-header">
                            <div>
                                <h3 style={{ margin: 0, fontSize: "18px" }}>Faculty Profile & Class Roster</h3>
                                <span style={{ fontSize: "12px", color: "#64748b" }}>
                                    {selectedDetailStaff.honorific} {selectedDetailStaff.firstName} {selectedDetailStaff.lastName} ({selectedDetailStaff.employeeCode})
                                </span>
                            </div>
                            <button type="button" className="faculty-modal-close" onClick={() => setSelectedDetailStaff(null)}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className="faculty-modal-body">
                            {/* Personal & Academic Summary */}
                            <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "14px" }}>
                                    <div className="faculty-avatar" style={{ width: "64px", height: "64px", fontSize: "22px" }}>
                                        {selectedDetailStaff.firstName[0]}{selectedDetailStaff.lastName[0]}
                                    </div>
                                    <div>
                                        <h2 style={{ margin: "0 0 2px 0", fontSize: "20px", color: "#0f172a" }}>
                                            {selectedDetailStaff.honorific} {selectedDetailStaff.firstName} {selectedDetailStaff.middleName ? `${selectedDetailStaff.middleName} ` : ""}{selectedDetailStaff.lastName} {selectedDetailStaff.suffix || ""}
                                        </h2>
                                        <div style={{ color: "#1877f2", fontWeight: 700, fontSize: "13.5px" }}>
                                            {selectedDetailStaff.academicRank} • {selectedDetailStaff.department}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                                            {selectedDetailStaff.highestDegree} • {selectedDetailStaff.almaMater || "Theological Seminary"}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", fontSize: "12.5px" }}>
                                    <div><strong>Email:</strong> {selectedDetailStaff.email}</div>
                                    <div><strong>Phone:</strong> {selectedDetailStaff.phone}</div>
                                    <div><strong>Office:</strong> {selectedDetailStaff.officeLocation}</div>
                                    <div><strong>Consultation:</strong> {selectedDetailStaff.consultationHours}</div>
                                    <div><strong>Employment:</strong> {selectedDetailStaff.employmentType} ({selectedDetailStaff.status})</div>
                                    <div><strong>Specialization:</strong> {selectedDetailStaff.specialization}</div>
                                </div>

                                {selectedDetailStaff.bio && (
                                    <p style={{ margin: "12px 0 0", fontSize: "12.5px", color: "#475569", lineHeight: "1.5", fontStyle: "italic" }}>
                                        "{selectedDetailStaff.bio}"
                                    </p>
                                )}
                            </div>

                            {/* Assigned Course Subjects */}
                            {selectedDetailStaff.classification === "Teaching Faculty" && (
                                <>
                                    <h4 style={{ margin: "10px 0 6px", fontSize: "15px", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <BookOpen size={16} color="#1877f2" />
                                        <span>Assigned Curriculum Subjects ({getTeachingLoad(selectedDetailStaff).totalUnits} Units Total)</span>
                                    </h4>

                                    <table className="faculty-table" style={{ border: "1px solid #e2e8f0" }}>
                                        <thead>
                                            <tr>
                                                <th>CODE</th>
                                                <th>SUBJECT TITLE</th>
                                                <th>UNITS</th>
                                                <th>CLASS SCHEDULE</th>
                                                <th>CLASSROOM / HUB</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getTeachingLoad(selectedDetailStaff).assigned.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} style={{ textAlign: "center", color: "#8a8d91" }}>No subjects assigned to this teacher.</td>
                                                </tr>
                                            ) : (
                                                getTeachingLoad(selectedDetailStaff).assigned.map(s => (
                                                    <tr key={s.code}>
                                                        <td><span className="badge-emp-code">{s.code}</span></td>
                                                        <td><strong>{s.title}</strong></td>
                                                        <td><strong>{s.units} Units</strong></td>
                                                        <td style={{ fontSize: "12px" }}>{s.schedule}</td>
                                                        <td style={{ fontSize: "12px" }}>{s.room}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>

                                    {/* Matched Enrolled Students Class Roster */}
                                    <h4 style={{ margin: "14px 0 6px", fontSize: "15px", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <Users size={16} color="#16a34a" />
                                        <span>Enrolled Students in Teacher's Classes ({getEnrolledStudentsForFaculty(selectedDetailStaff).length} Students)</span>
                                    </h4>

                                    <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                                        <table className="faculty-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: "30px" }}>#</th>
                                                    <th>STUDENT ID</th>
                                                    <th>STUDENT NAME</th>
                                                    <th>DEGREE PROGRAM</th>
                                                    <th>YEAR LEVEL</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getEnrolledStudentsForFaculty(selectedDetailStaff).length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} style={{ textAlign: "center", color: "#8a8d91", padding: "16px" }}>
                                                            No enrolled students matched under these courses yet.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    getEnrolledStudentsForFaculty(selectedDetailStaff).map((std, idx) => (
                                                        <tr key={std.memberId}>
                                                            <td style={{ color: "#8a8d91" }}>{idx + 1}</td>
                                                            <td><span className="badge-emp-code">{std.memberCode || `STD-${std.memberId}`}</span></td>
                                                            <td><strong>{[std.firstName, std.lastName].filter(Boolean).join(" ")}</strong></td>
                                                            <td>{std.ministry || "Bachelor of Theology"}</td>
                                                            <td>{std.civilStatus || "1st Year"}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="faculty-modal-footer">
                            <button type="button" className="btn-modal secondary" onClick={() => setSelectedDetailStaff(null)}>
                                <X size={15} />
                                <span>Close</span>
                            </button>
                            <button
                                type="button"
                                className="btn-modal primary"
                                onClick={() => {
                                    const staffToEdit = selectedDetailStaff;
                                    setSelectedDetailStaff(null);
                                    handleOpenEdit(staffToEdit);
                                }}
                            >
                                <Edit3 size={15} />
                                <span>Edit Profile</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE / EDIT MODAL */}
            {isFormModalOpen && (
                <div className="faculty-modal-overlay" onClick={() => setIsFormModalOpen(false)}>
                    <div className="faculty-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="faculty-modal-header">
                            <div>
                                <h3 style={{ margin: 0, fontSize: "18px" }}>
                                    {editingStaff ? "Edit Faculty / Staff Profile" : "Create New Faculty / Staff Member"}
                                </h3>
                                <span style={{ fontSize: "12px", color: "#64748b" }}>
                                    Mobile Bible School • Complete Institutional Profiling
                                </span>
                            </div>
                            <button type="button" className="faculty-modal-close" onClick={() => setIsFormModalOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveStaff}>
                            <div className="faculty-modal-body">
                                <div className="faculty-form-grid">
                                    <div className="faculty-form-group">
                                        <label>Honorific / Title *</label>
                                        <select
                                            value={formData.honorific}
                                            onChange={e => setFormData({ ...formData, honorific: e.target.value })}
                                        >
                                            <option value="Dr.">Dr.</option>
                                            <option value="Prof.">Prof.</option>
                                            <option value="Rev.">Rev.</option>
                                            <option value="Pastor">Pastor</option>
                                            <option value="Mr.">Mr.</option>
                                            <option value="Mrs.">Mrs.</option>
                                            <option value="Ms.">Ms.</option>
                                            <option value="Engr.">Engr.</option>
                                        </select>
                                    </div>

                                    <div className="faculty-form-group">
                                        <label>Classification *</label>
                                        <select
                                            value={formData.classification}
                                            onChange={e => setFormData({ ...formData, classification: e.target.value as FacultyClassification })}
                                        >
                                            <option value="Teaching Faculty">Teaching Faculty (Professors & Instructors)</option>
                                            <option value="Non-Teaching Staff">Non-Teaching Staff (Registrar, Finance & Admin)</option>
                                        </select>
                                    </div>

                                    <div className="faculty-form-group">
                                        <label>First Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.firstName}
                                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                            placeholder="e.g. Samuel"
                                        />
                                    </div>

                                    <div className="faculty-form-group">
                                        <label>Last Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.lastName}
                                            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                            placeholder="e.g. Vance"
                                        />
                                    </div>

                                    <div className="faculty-form-group">
                                        <label>Middle Name</label>
                                        <input
                                            type="text"
                                            value={formData.middleName}
                                            onChange={e => setFormData({ ...formData, middleName: e.target.value })}
                                            placeholder="e.g. Alexander"
                                        />
                                    </div>

                                    <div className="faculty-form-group">
                                        <label>Suffix / Post-Nominal</label>
                                        <input
                                            type="text"
                                            value={formData.suffix}
                                            onChange={e => setFormData({ ...formData, suffix: e.target.value })}
                                            placeholder="e.g. Th.D., Ph.D., CPA"
                                        />
                                    </div>

                                    <div className="faculty-form-group">
                                        <label>Department / College *</label>
                                        <select
                                            value={formData.department}
                                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                                        >
                                            <option value="School of Theology & Biblical Studies">School of Theology & Biblical Studies</option>
                                            <option value="Department of Pastoral Ministry & Missions">Department of Pastoral Ministry & Missions</option>
                                            <option value="Office of the University Registrar & Admissions">Office of the University Registrar & Admissions</option>
                                            <option value="Finance & Student Accounts Office">Finance & Student Accounts Office</option>
                                            <option value="General Academic & Student Affairs">General Academic & Student Affairs</option>
                                        </select>
                                    </div>

                                    <div className="faculty-form-group">
                                        <label>Academic Rank / Designation *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.academicRank}
                                            onChange={e => setFormData({ ...formData, academicRank: e.target.value })}
                                            placeholder="e.g. Dean of Academic Affairs / Associate Professor"
                                        />
                                    </div>

                                    <div className="faculty-form-group">
                                        <label>Highest Educational Degree *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.highestDegree}
                                            onChange={e => setFormData({ ...formData, highestDegree: e.target.value })}
                                            placeholder="e.g. Th.D. in Systematic Theology"
                                        />
                                    </div>

                                    <div className="faculty-form-group">
                                        <label>Alma Mater / Institution</label>
                                        <input
                                            type="text"
                                            value={formData.almaMater}
                                            onChange={e => setFormData({ ...formData, almaMater: e.target.value })}
                                            placeholder="e.g. Dallas Theological Seminary"
                                        />
                                    </div>

                                    <div className="faculty-form-group">
                                        <label>Specialization / Expertise</label>
                                        <input
                                            type="text"
                                            value={formData.specialization}
                                            onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                                            placeholder="e.g. Hermeneutics, Greek Exegesis"
                                        />
                                    </div>

                                    <div className="faculty-form-group">
                                        <label>Employment Type</label>
                                        <select
                                            value={formData.employmentType}
                                            onChange={e => setFormData({ ...formData, employmentType: e.target.value as EmploymentType })}
                                        >
                                            <option value="Full-Time">Full-Time</option>
                                            <option value="Part-Time">Part-Time</option>
                                            <option value="Adjunct / Visiting">Adjunct / Visiting</option>
                                            <option value="Emeritus">Emeritus</option>
                                        </select>
                                    </div>

                                    <div className="faculty-form-group">
                                        <label>Official Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="e.g. faculty@mobilebibleschool.edu"
                                        />
                                    </div>

                                    <div className="faculty-form-group">
                                        <label>Phone / Mobile</label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="e.g. +63 917 555 0100"
                                        />
                                    </div>

                                    <div className="faculty-form-group">
                                        <label>Office / Room Location</label>
                                        <input
                                            type="text"
                                            value={formData.officeLocation}
                                            onChange={e => setFormData({ ...formData, officeLocation: e.target.value })}
                                            placeholder="e.g. Academic Wing • Rm 204"
                                        />
                                    </div>

                                    <div className="faculty-form-group">
                                        <label>Consultation Hours</label>
                                        <input
                                            type="text"
                                            value={formData.consultationHours}
                                            onChange={e => setFormData({ ...formData, consultationHours: e.target.value })}
                                            placeholder="e.g. Mon & Wed 1:00 PM - 4:00 PM"
                                        />
                                    </div>

                                    <div className="faculty-form-group full-width">
                                        <label>Biographical Summary</label>
                                        <textarea
                                            rows={2}
                                            value={formData.bio}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                            placeholder="Brief theological background, academic service, and ministry immersion..."
                                        />
                                    </div>
                                </div>

                                {/* Subject Assignment Multi-Select (For Teaching Faculty) */}
                                {formData.classification === "Teaching Faculty" && (
                                    <div style={{ marginTop: "14px" }}>
                                        <label style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", display: "block", marginBottom: "6px" }}>
                                            Assign Course Subjects to Teach (Matches Enrolled Students)
                                        </label>
                                        <span style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "10px" }}>
                                            Select accredited subjects from the curriculum. Students who enroll in these subjects will automatically appear in this teacher's class roster.
                                        </span>

                                        <div className="subject-picker-container">
                                            {allAvailableSubjects.map(sub => {
                                                const isSelected = formData.assignedSubjectCodes.includes(sub.code);
                                                return (
                                                    <div
                                                        key={sub.code}
                                                        className={`subject-picker-item ${isSelected ? "selected" : ""}`}
                                                        onClick={() => toggleSubjectAssignment(sub.code)}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {}}
                                                        />
                                                        <span style={{ fontWeight: 800, color: "#1877f2", width: "95px" }}>{sub.code}</span>
                                                        <span style={{ flex: 1, fontWeight: 600 }}>{sub.title}</span>
                                                        <span style={{ fontSize: "11px", background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px" }}>
                                                            {sub.units} Units
                                                        </span>
                                                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                                                            {sub.schedule}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="faculty-modal-footer">
                                <button type="button" className="btn-modal secondary" onClick={() => setIsFormModalOpen(false)}>
                                    <X size={15} />
                                    <span>Cancel</span>
                                </button>
                                <button type="submit" className="btn-modal primary">
                                    <CheckCircle2 size={15} />
                                    <span>{editingStaff ? "Save Profile Changes" : "Create Faculty Member"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyStaffCorner;
