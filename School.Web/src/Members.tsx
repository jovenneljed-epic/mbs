import React, { useEffect, useMemo, useState } from "react";
import "./Members.css";
import PermissionService from "./PermissionService";
import { API_BASE_URL } from "./config";
import {
    GraduationCap,
    Search,
    UserPlus,
    Edit3,
    Trash2,
    Eye,
    BookOpen,
    Layers,
    Award,
    Phone,
    CheckCircle2,
    RefreshCw,
    AlertCircle,
    X,
    Clock,
    MapPin,
    User,
    DollarSign
} from "lucide-react";
import type { Subject } from "./data/curriculumData";
import {
    DEGREE_PROGRAMS,
    getSubjectByCode,
    getDefaultSubjectsForProgram,
    calculateTotalUnits
} from "./data/curriculumData";
import { courseCurriculumService } from "./services/courseCurriculumService";
import type { CourseSubject } from "./services/courseCurriculumService";
import { CourseSubjectManager } from "./pages/admin/CourseSubjectManager";
import { StudentProfileView } from "./components/StudentProfileView";

/* =========================================================
   TYPES
========================================================= */

export interface Member {
    memberId: number;
    customerId?: number;
    memberCode?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    suffix?: string;
    gender?: string;
    birthDate?: string;
    civilStatus?: string; // Academic Year Level & Term (e.g. "2nd Year - 1st Semester")
    contactNumber?: string;
    email?: string;
    address?: string;
    ministry?: string; // Academic Program / Course (e.g. "Bachelor of Theology")
    status?: string;
    dateJoined?: string;
    photoPath?: string; // JSON with enrolled subjects, tuition & metadata
    occupation?: string;
    notes?: string;
}

interface MemberForm {
    memberCode: string;
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
    gender: string;
    birthDate: string;
    civilStatus: string; // Year Level
    contactNumber: string;
    email: string;
    address: string;
    ministry: string; // Degree Program
    status: string;
    dateJoined: string;
    guardianName: string;
    guardianContact: string;
    selectedSubjectCodes: string[];
    modeOfLearning: string;
    paymentPerUnit: number;
    amountPaid: number;
    paymentStatus?: "PAID" | "PARTIAL" | "UNPAID";
}

interface JwtPayload {
    sub?: string;
    name?: string;
    unique_name?: string;
    role?: string | string[];
    roles?: string | string[];
    [key: string]: unknown;
}

const createEmptyForm = (): MemberForm => {
    const courses = courseCurriculumService.getCourses();
    const defaultCourse = courses[0];
    const defaultProgName = defaultCourse ? defaultCourse.name : "Bachelor of Theology (B.Th.)";
    const defaultMode = defaultCourse ? defaultCourse.modeOfLearning : "Modular Field Cohort";
    const defaultRate = defaultCourse ? defaultCourse.paymentPerUnit : 350;
    const defaultSubs = defaultCourse?.subjects ? defaultCourse.subjects.map(s => s.code) : [];

    return {
        memberCode: "",
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        gender: "MALE",
        birthDate: "2005-01-01",
        civilStatus: "1st Year - 1st Semester",
        contactNumber: "",
        email: "",
        address: "",
        ministry: defaultProgName,
        status: "ACTIVE",
        dateJoined: new Date().toISOString().split("T")[0],
        guardianName: "",
        guardianContact: "",
        selectedSubjectCodes: defaultSubs,
        modeOfLearning: defaultMode,
        paymentPerUnit: defaultRate,
        amountPaid: 0,
        paymentStatus: "UNPAID"
    };
};

/* =========================================================
   API HELPERS
========================================================= */

const getToken = (): string | null => {
    const keys = ["token", "accessToken", "jwt", "authToken", "epicToken"];
    for (const key of keys) {
        const value = localStorage.getItem(key);
        if (value) {
            return value.replace(/^Bearer\s+/i, "").trim();
        }
    }
    return null;
};

const getJwtPayload = (): JwtPayload | null => {
    const token = getToken();
    if (!token) return null;
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
        const decoded = atob(padded);
        return JSON.parse(decoded) as JwtPayload;
    } catch {
        return null;
    }
};

const getCurrentUserRoles = (): string[] => {
    const payload = getJwtPayload();
    if (!payload) return [];
    const roleClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
    const possibleRoleValues = [payload.role, payload.roles, payload[roleClaim]];
    const roleValue = possibleRoleValues.find(v => typeof v === "string" || Array.isArray(v));

    if (Array.isArray(roleValue)) {
        return roleValue.flatMap(r => String(r).split(",")).map(r => r.trim().toUpperCase()).filter(Boolean);
    }
    if (typeof roleValue === "string") {
        return roleValue.split(",").map(r => r.trim().toUpperCase()).filter(Boolean);
    }
    return [];
};

const hasAdminRole = (): boolean => {
    const roles = getCurrentUserRoles();
    return roles.some(r => ["ADMIN", "ADMINISTRATOR", "SUPER ADMIN", "SUPERADMIN"].includes(r));
};

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = API_BASE_URL.replace(/\/+$/, "");
    const cleanEndpoint = endpoint.replace(/^\/+/, "");
    const url = `${baseUrl}/${cleanEndpoint}`;
    const token = getToken();
    const headers = new Headers(options.headers);

    if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
        throw new Error("UNAUTHORIZED: Your session has expired. Please login again.");
    }
    if (!response.ok) {
        let msg = `HTTP ${response.status}`;
        try {
            const data = await response.json();
            msg = data.message || msg;
        } catch {}
        throw new Error(msg);
    }
    if (response.status === 204) return {} as T;
    return response.json();
}

/* =========================================================
   MAIN STUDENTS / ENROLLMENT COMPONENT
========================================================= */

const Members: React.FC = () => {
    // Main state
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [search, setSearch] = useState<string>("");
    const [programFilter, setProgramFilter] = useState<string>("ALL");
    const [yearFilter, setYearFilter] = useState<string>("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    // Profile View vs Directory View vs Curriculum View
    const [selectedStudent, setSelectedStudent] = useState<Member | null>(null);
    const [viewMode, setViewMode] = useState<"directory" | "profile" | "curriculum">("directory");

    // Modal state (Add / Edit Student)
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [form, setForm] = useState<MemberForm>(createEmptyForm());
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isAdmin, setIsAdmin] = useState<boolean>(hasAdminRole());

    // Permissions
    const canCreateMembers = isAdmin || PermissionService.hasPermission("Members", "create");
    const canEditMembers = isAdmin || PermissionService.hasPermission("Members", "edit");
    const canDeleteMembers = isAdmin || PermissionService.hasPermission("Members", "delete");

    useEffect(() => {
        const refreshRole = () => setIsAdmin(hasAdminRole());
        refreshRole();
        window.addEventListener("epic:permissions-changed", refreshRole);
        return () => window.removeEventListener("epic:permissions-changed", refreshRole);
    }, []);

    // Load members
    const fetchStudents = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await apiFetch<Member[] | { members?: Member[]; data?: Member[] }>("/Members");
            const list = Array.isArray(data) ? data : data.members || data.data || [];
            setMembers(list);

            // If a student is currently selected in profile view, update it with fresh data
            if (selectedStudent) {
                const updated = list.find(s => s.memberId === selectedStudent.memberId);
                if (updated) setSelectedStudent(updated);
            }
        } catch (err: unknown) {
            const e = err as Error;
            setError(e.message || "Failed to load student enrollment records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // Helpers
    const getFullName = (member: Member) => {
        return [member.firstName, member.middleName, member.lastName, member.suffix]
            .filter(Boolean)
            .join(" ")
            .trim() || "Student";
    };

    const getEnrolledSubjectsForMember = (member: Member): Subject[] => {
        if (member.photoPath && member.photoPath.startsWith("{")) {
            try {
                const parsed = JSON.parse(member.photoPath);
                if (parsed.subjects && Array.isArray(parsed.subjects) && parsed.subjects.length > 0) {
                    const mapped = parsed.subjects
                        .map((code: string) => getSubjectByCode(code))
                        .filter((s: Subject | undefined): s is Subject => s !== undefined);
                    if (mapped.length > 0) return mapped;
                }
            } catch {}
        }
        return getDefaultSubjectsForProgram(
            member.ministry || "BS Information Technology",
            member.civilStatus || "1st Year"
        );
    };

    // Filtered Students
    const filteredMembers = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return members.filter(member => {
            const fullName = getFullName(member).toLowerCase();
            const code = (member.memberCode || "").toLowerCase();
            const prog = (member.ministry || "").toLowerCase();
            const email = (member.email || "").toLowerCase();
            const contact = (member.contactNumber || "").toLowerCase();

            const matchesSearch =
                !keyword ||
                fullName.includes(keyword) ||
                code.includes(keyword) ||
                prog.includes(keyword) ||
                email.includes(keyword) ||
                contact.includes(keyword);

            const matchesProgram =
                programFilter === "ALL" ||
                (member.ministry || "").toUpperCase() === programFilter.toUpperCase();

            const matchesYear =
                yearFilter === "ALL" ||
                (member.civilStatus || "").toLowerCase().includes(yearFilter.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL" ||
                (member.status || "ACTIVE").toUpperCase() === statusFilter.toUpperCase();

            return matchesSearch && matchesProgram && matchesYear && matchesStatus;
        });
    }, [members, search, programFilter, yearFilter, statusFilter]);

    // Statistics Calculations
    const stats = useMemo(() => {
        const total = members.length;
        const active = members.filter(m => (m.status || "ACTIVE").toUpperCase() === "ACTIVE").length;
        let totalUnits = 0;
        const programsSet = new Set<string>();

        members.forEach(m => {
            if (m.ministry) programsSet.add(m.ministry);
            const subs = getEnrolledSubjectsForMember(m);
            totalUnits += calculateTotalUnits(subs);
        });

        const avgUnits = total > 0 ? (totalUnits / total).toFixed(1) : "0.0";

        return {
            total,
            active,
            totalUnits,
            avgUnits,
            programsCount: Math.max(programsSet.size, Object.keys(DEGREE_PROGRAMS).length)
        };
    }, [members]);

    // Catalog version to trigger re-renders upon course/subject updates
    const [catalogVersion, setCatalogVersion] = useState<number>(0);
    const [showCourseManager, setShowCourseManager] = useState<boolean>(false);

    useEffect(() => {
        const unsub = courseCurriculumService.subscribe(() => {
            setCatalogVersion(v => v + 1);
        });
        return () => unsub();
    }, []);

    const availableCourses = useMemo(() => {
        return courseCurriculumService.getCourses();
    }, [catalogVersion]);

    // Available subjects for the currently selected program & year in the modal form
    const formAvailableSubjects = useMemo(() => {
        const dynCourse = courseCurriculumService.getCourse(form.ministry);
        if (dynCourse && dynCourse.subjects.length > 0) {
            return dynCourse.subjects;
        }

        const prog = DEGREE_PROGRAMS[form.ministry] || DEGREE_PROGRAMS["Bachelor of Theology (B.Th.)"] || DEGREE_PROGRAMS["BS Information Technology"];
        if (prog) {
            const yearKey = Object.keys(prog.subjectsByYear).find(k =>
                form.civilStatus.toLowerCase().includes(k.toLowerCase())
            ) || Object.keys(prog.subjectsByYear)[0];
            return prog.subjectsByYear[yearKey] || [];
        }
        return [];
    }, [form.ministry, form.civilStatus, catalogVersion]);

    // Auto-update selected subject codes and rates when program or year level changes in Add mode
    const handleProgramOrYearChange = (newProgram: string, newYear: string) => {
        const dynCourse = courseCurriculumService.getCourse(newProgram);
        let defaultSubs: CourseSubject[] = [];

        if (dynCourse && dynCourse.subjects.length > 0) {
            defaultSubs = dynCourse.subjects;
        } else {
            defaultSubs = getDefaultSubjectsForProgram(newProgram, newYear);
        }

        setForm(prev => ({
            ...prev,
            ministry: newProgram,
            civilStatus: newYear,
            modeOfLearning: dynCourse?.modeOfLearning || prev.modeOfLearning || "Modular Field Cohort",
            paymentPerUnit: dynCourse?.paymentPerUnit ?? prev.paymentPerUnit ?? 350,
            selectedSubjectCodes: defaultSubs.map(s => s.code)
        }));
    };

    // Toggle a subject in the modal form
    const toggleSubjectCode = (code: string) => {
        setForm(prev => {
            const exists = prev.selectedSubjectCodes.includes(code);
            return {
                ...prev,
                selectedSubjectCodes: exists
                    ? prev.selectedSubjectCodes.filter(c => c !== code)
                    : [...prev.selectedSubjectCodes, code]
            };
        });
    };

    // Select all available subjects
    const selectAllSubjects = () => {
        setForm(prev => ({
            ...prev,
            selectedSubjectCodes: formAvailableSubjects.map(s => s.code)
        }));
    };

    // Clear all subjects
    const clearAllSubjects = () => {
        setForm(prev => ({
            ...prev,
            selectedSubjectCodes: []
        }));
    };

    // Computed total units in the modal
    const modalTotalUnits = useMemo(() => {
        return form.selectedSubjectCodes.reduce((sum, code) => {
            const s = getSubjectByCode(code);
            return sum + (s?.units || 3);
        }, 0);
    }, [form.selectedSubjectCodes, catalogVersion]);

    const modalTotalTuition = useMemo(() => {
        return modalTotalUnits * (form.paymentPerUnit || 0);
    }, [modalTotalUnits, form.paymentPerUnit]);

    const modalBalance = useMemo(() => {
        return Math.max(0, modalTotalTuition - (form.amountPaid || 0));
    }, [modalTotalTuition, form.amountPaid]);

    const modalComputedStatus: "PAID" | "PARTIAL" | "UNPAID" = useMemo(() => {
        if (modalTotalTuition > 0 && form.amountPaid >= modalTotalTuition) return "PAID";
        if (form.amountPaid > 0) return "PARTIAL";
        return "UNPAID";
    }, [modalTotalTuition, form.amountPaid]);

    // Open Add Student Modal
    const openAddModal = () => {
        const nextIdNumber = members.length + 1;
        const autoCode = `STD-2026-${String(nextIdNumber).padStart(4, "0")}`;
        const courses = courseCurriculumService.getCourses();
        const initialCourse = courses[0];
        const initialProg = initialCourse ? initialCourse.name : "Bachelor of Theology (B.Th.)";
        const initialYear = "1st Year - 1st Semester";
        const defaultSubs = initialCourse?.subjects?.length > 0
            ? initialCourse.subjects
            : getDefaultSubjectsForProgram(initialProg, initialYear);

        setEditingMember(null);
        setForm({
            ...createEmptyForm(),
            memberCode: autoCode,
            ministry: initialProg,
            civilStatus: initialYear,
            modeOfLearning: initialCourse?.modeOfLearning || "Modular Field Cohort",
            paymentPerUnit: initialCourse?.paymentPerUnit ?? 350,
            amountPaid: 0,
            paymentStatus: "UNPAID",
            selectedSubjectCodes: defaultSubs.map(s => s.code)
        });
        setError("");
        setMessage("");
        setShowModal(true);
    };

    // Open Edit Student Modal
    const openEditModal = (member: Member) => {
        setEditingMember(member);
        const subs = getEnrolledSubjectsForMember(member);

        let guardian = "";
        let guardianContact = "";
        let email = member.email || "";
        let modeOfLearning = "Modular Field Cohort";
        let paymentPerUnit = 350;
        let amountPaid = 0;
        let paymentStatus: "PAID" | "PARTIAL" | "UNPAID" = "UNPAID";

        const dynCourse = courseCurriculumService.getCourse(member.ministry || "");
        if (dynCourse) {
            modeOfLearning = dynCourse.modeOfLearning;
            paymentPerUnit = dynCourse.paymentPerUnit;
        }

        if (member.photoPath && member.photoPath.startsWith("{")) {
            try {
                const parsed = JSON.parse(member.photoPath);
                guardian = parsed.guardian || "";
                guardianContact = parsed.guardianContact || "";
                if (parsed.email) email = parsed.email;
                if (parsed.modeOfLearning) modeOfLearning = parsed.modeOfLearning;
                if (typeof parsed.paymentPerUnit === "number") paymentPerUnit = parsed.paymentPerUnit;
                if (typeof parsed.amountPaid === "number") amountPaid = parsed.amountPaid;
                if (parsed.paymentStatus) paymentStatus = parsed.paymentStatus;
            } catch {}
        }
        if (!guardian && member.address && member.address.includes("Guardian:")) {
            const parts = member.address.split("Guardian:");
            guardian = parts[1]?.trim() || "";
        }

        setForm({
            memberCode: member.memberCode || "",
            firstName: member.firstName || "",
            middleName: member.middleName || "",
            lastName: member.lastName || "",
            suffix: member.suffix || "",
            gender: member.gender || "MALE",
            birthDate: member.birthDate ? member.birthDate.split("T")[0] : "2005-01-01",
            civilStatus: member.civilStatus || "1st Year - 1st Semester",
            contactNumber: member.contactNumber || "",
            email: email,
            address: member.address?.split("|")[0]?.trim() || member.address || "",
            ministry: member.ministry || (dynCourse?.name || "Bachelor of Theology (B.Th.)"),
            status: member.status || "ACTIVE",
            dateJoined: member.dateJoined ? member.dateJoined.split("T")[0] : new Date().toISOString().split("T")[0],
            guardianName: guardian,
            guardianContact: guardianContact,
            selectedSubjectCodes: subs.map(s => s.code),
            modeOfLearning,
            paymentPerUnit,
            amountPaid,
            paymentStatus
        });
        setError("");
        setMessage("");
        setShowModal(true);
    };

    // Save Student (Create or Update)
    const handleSaveStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!form.firstName.trim()) {
            setError("First name is required.");
            return;
        }
        if (!form.lastName.trim()) {
            setError("Last name is required.");
            return;
        }

        setSaving(true);

        const totalTuition = modalTotalTuition;
        const balance = modalBalance;
        const status = modalComputedStatus;

        // Package metadata into photoPath JSON
        const metadataJson = JSON.stringify({
            subjects: form.selectedSubjectCodes,
            units: modalTotalUnits,
            courseCode: courseCurriculumService.getCourse(form.ministry)?.code || "",
            courseName: form.ministry,
            modeOfLearning: form.modeOfLearning,
            paymentPerUnit: form.paymentPerUnit,
            totalTuition,
            amountPaid: form.amountPaid,
            balance,
            paymentStatus: status,
            guardian: form.guardianName.trim(),
            guardianContact: form.guardianContact.trim(),
            email: form.email.trim()
        });

        // Pack address with guardian if entered
        let combinedAddress = form.address.trim();
        if (form.guardianName.trim() || form.guardianContact.trim()) {
            combinedAddress += ` | Guardian: ${form.guardianName.trim()} (${form.guardianContact.trim()})`;
        }

        const payload = {
            memberCode: form.memberCode.trim(),
            firstName: form.firstName.trim(),
            middleName: form.middleName.trim(),
            lastName: form.lastName.trim(),
            gender: form.gender.toUpperCase(),
            birthDate: form.birthDate ? `${form.birthDate}T00:00:00Z` : null,
            civilStatus: form.civilStatus.trim(),
            contactNumber: form.contactNumber.trim(),
            address: combinedAddress,
            ministry: form.ministry.trim(),
            status: form.status.toUpperCase(),
            dateJoined: form.dateJoined ? `${form.dateJoined}T00:00:00Z` : null,
            photoPath: metadataJson
        };

        try {
            if (editingMember) {
                // Update
                await apiFetch(`/Members/${editingMember.memberId}`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });
                setMessage(`Student record for ${form.firstName} ${form.lastName} updated successfully.`);
            } else {
                // Create
                await apiFetch("/Members", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
                setMessage(`Student ${form.firstName} ${form.lastName} enrolled successfully.`);
            }

            setShowModal(false);
            await fetchStudents();
        } catch (err: unknown) {
            const e = err as Error;
            setError(e.message || "Failed to save student record.");
        } finally {
            setSaving(false);
        }
    };

    // Delete Student
    const handleDeleteStudent = async (student: Member) => {
        const studentName = getFullName(student);
        const confirmed = window.confirm(
            `Are you sure you want to unenroll / delete student record for:\n\n${studentName} (${student.memberCode || "No ID"})\n\nThis will remove their enrollment and study load.`
        );
        if (!confirmed) return;

        try {
            await apiFetch(`/Members/${student.memberId}`, {
                method: "DELETE"
            });
            setMessage(`Student ${studentName} was successfully dropped/removed.`);

            // If we are currently viewing this student's profile, switch back to directory
            if (selectedStudent?.memberId === student.memberId) {
                setSelectedStudent(null);
                setViewMode("directory");
            }
            await fetchStudents();
        } catch (err: unknown) {
            const e = err as Error;
            setError(e.message || "Failed to delete student record.");
        }
    };

    // Open Student Profile Page when clicking student name or avatar
    const handleViewStudentProfile = (student: Member) => {
        setSelectedStudent(student);
        setViewMode("profile");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // IF VIEW MODE IS PROFILE: Render Dedicated Personal Profile Page!
    if (viewMode === "profile" && selectedStudent) {
        return (
            <StudentProfileView
                student={selectedStudent}
                onBack={() => {
                    setSelectedStudent(null);
                    setViewMode("directory");
                }}
                onEdit={s => openEditModal(s as Member)}
                onDelete={s => handleDeleteStudent(s as Member)}
                canEdit={canEditMembers}
                canDelete={canDeleteMembers}
            />
        );
    }

    // IF VIEW MODE IS CURRICULUM: Render Dedicated Full-Page Curriculum & Course Manager!
    if (viewMode === "curriculum" || showCourseManager) {
        return (
            <CourseSubjectManager
                onBack={() => {
                    setShowCourseManager(false);
                    setViewMode("directory");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }}
            />
        );
    }

    // ELSE: Render Student Directory & Enrollment Dashboard
    return (
        <div className="members-page-wrapper">
            {/* Header */}
            <div className="members-header">
                <div className="members-header-title">
                    <div className="members-header-icon-box">
                        <GraduationCap size={28} color="#0284c7" />
                    </div>
                    <div>
                        <h1>Student Enrollment & Academic Directory</h1>
                        <p>Complete academic registration, curriculum programs, enrolled subjects, and credit units management</p>
                    </div>
                </div>

                <div className="members-header-actions">
                    <button
                        type="button"
                        className="members-refresh-btn"
                        onClick={fetchStudents}
                        title="Reload student list"
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={loading ? "spin-icon" : ""} />
                        <span>Refresh</span>
                    </button>

                    {canCreateMembers && (
                        <button
                            type="button"
                            className="members-add-student-btn"
                            onClick={openAddModal}
                        >
                            <UserPlus size={18} />
                            <span>Enroll New Student</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Alerts */}
            {message && (
                <div className="alert-banner alert-success">
                    <CheckCircle2 size={18} />
                    <span>{message}</span>
                    <button type="button" onClick={() => setMessage("")}><X size={15} /></button>
                </div>
            )}

            {error && (
                <div className="alert-banner alert-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                    <button type="button" onClick={() => setError("")}><X size={15} /></button>
                </div>
            )}

            {/* Stat Cards */}
            <div className="academic-stat-grid">
                <div className="academic-stat-card stat-blue">
                    <div className="stat-card-icon">
                        <GraduationCap size={26} />
                    </div>
                    <div className="stat-card-info">
                        <span className="stat-card-label">TOTAL STUDENTS</span>
                        <strong className="stat-card-value">{stats.total}</strong>
                        <span className="stat-card-sub">Officially Enrolled</span>
                    </div>
                </div>

                <div className="academic-stat-card stat-emerald">
                    <div className="stat-card-icon">
                        <CheckCircle2 size={26} />
                    </div>
                    <div className="stat-card-info">
                        <span className="stat-card-label">ACTIVE ENROLLMENTS</span>
                        <strong className="stat-card-value">{stats.active}</strong>
                        <span className="stat-card-sub">In Good Standing</span>
                    </div>
                </div>

                <div className="academic-stat-card stat-purple">
                    <div className="stat-card-icon">
                        <BookOpen size={26} />
                    </div>
                    <div className="stat-card-info">
                        <span className="stat-card-label">ACADEMIC PROGRAMS</span>
                        <strong className="stat-card-value">{stats.programsCount}</strong>
                        <span className="stat-card-sub">Colleges & Strands</span>
                    </div>
                </div>

                <div className="academic-stat-card stat-sky">
                    <div className="stat-card-icon">
                        <Award size={26} />
                    </div>
                    <div className="stat-card-info">
                        <span className="stat-card-label">TOTAL ENROLLED UNITS</span>
                        <strong className="stat-card-value">{stats.totalUnits}</strong>
                        <span className="stat-card-sub">Avg {stats.avgUnits} Units / Student</span>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="academic-filter-card">
                <div className="academic-search-input-box">
                    <Search size={18} className="search-box-icon" />
                    <input
                        type="text"
                        placeholder="Search student name, student ID, degree program, or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button type="button" className="clear-search-btn" onClick={() => setSearch("")}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="academic-filters-row">
                    <div className="filter-item">
                        <label>PROGRAM / COURSE:</label>
                        <div className="course-filter-group">
                            <select
                                value={programFilter}
                                onChange={e => setProgramFilter(e.target.value)}
                            >
                                <option value="ALL">All Academic Programs</option>
                                {availableCourses.map(prog => (
                                    <option key={prog.id || prog.code} value={prog.name}>
                                        {prog.name} ({prog.code})
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                className="btn-open-course-mgr"
                                onClick={() => {
                                    setViewMode("curriculum");
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                title="Add/Edit courses, units, class schedules, modes of learning, and payment per unit"
                            >
                                <BookOpen size={14} />
                                <span>Manage Courses & Subjects</span>
                            </button>
                        </div>
                    </div>

                    <div className="filter-item">
                        <label>YEAR LEVEL:</label>
                        <select
                            value={yearFilter}
                            onChange={e => setYearFilter(e.target.value)}
                        >
                            <option value="ALL">All Year Levels</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="Grade 11">Grade 11 (SHS)</option>
                            <option value="Grade 12">Grade 12 (SHS)</option>
                        </select>
                    </div>

                    <div className="filter-item">
                        <label>STATUS:</label>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="ACTIVE">Active / Enrolled</option>
                            <option value="INACTIVE">Inactive / Dropped</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="academic-table-container">
                <table className="academic-data-table">
                    <thead>
                        <tr>
                            <th style={{ width: "35px" }}>#</th>
                            <th style={{ width: "115px" }}>STUDENT ID</th>
                            <th>STUDENT NAME</th>
                            <th style={{ width: "195px" }}>PROGRAM & MODE</th>
                            <th style={{ width: "135px" }}>YEAR & TERM</th>
                            <th style={{ width: "130px" }}>STUDY LOAD</th>
                            <th style={{ width: "145px" }}>TUITION & FINANCIALS</th>
                            <th style={{ width: "85px" }}>STATUS</th>
                            <th style={{ width: "115px", textAlign: "center" }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={9} className="table-empty-cell">
                                    <div className="table-loader">
                                        <RefreshCw size={24} className="spin-icon" />
                                        <span>Loading student enrollment records...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredMembers.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="table-empty-cell">
                                    <div className="table-no-data">
                                        <GraduationCap size={40} color="#94a3b8" />
                                        <p>No student records found matching your filters.</p>
                                        {canCreateMembers && (
                                            <button
                                                type="button"
                                                className="table-empty-add-btn"
                                                onClick={openAddModal}
                                            >
                                                <UserPlus size={15} />
                                                <span>Enroll First Student</span>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredMembers.map((member, index) => {
                                const fullName = getFullName(member);
                                const subs = getEnrolledSubjectsForMember(member);
                                const unitsCount = calculateTotalUnits(subs);

                                let parsedMeta: any = {};
                                if (member.photoPath && member.photoPath.startsWith("{")) {
                                    try {
                                        parsedMeta = JSON.parse(member.photoPath);
                                    } catch {}
                                }
                                const courseMode = parsedMeta.modeOfLearning || "Modular Field Cohort";
                                const rate = parsedMeta.paymentPerUnit ?? 350;
                                const totalTuition = parsedMeta.totalTuition ?? (unitsCount * rate);
                                const balance = parsedMeta.balance ?? Math.max(0, totalTuition - (parsedMeta.amountPaid || 0));
                                const paymentStatus = parsedMeta.paymentStatus || (totalTuition > 0 && balance <= 0 ? "PAID" : (parsedMeta.amountPaid > 0 ? "PARTIAL" : "UNPAID"));

                                return (
                                    <tr key={member.memberId}>
                                        <td className="row-index">{index + 1}</td>
                                        <td>
                                            <span className="student-id-badge">
                                                {member.memberCode || `STD-2026-${String(member.memberId).padStart(4, "0")}`}
                                            </span>
                                        </td>
                                        <td>
                                            {/* Clickable student name leading to Personal Profile Page */}
                                            <div
                                                className="student-name-link-box"
                                                onClick={() => handleViewStudentProfile(member)}
                                                title={`Click to view ${fullName}'s personal profile & study load`}
                                            >
                                                <div className="student-table-avatar">
                                                    {member.firstName?.[0]?.toUpperCase()}
                                                    {member.lastName?.[0]?.toUpperCase()}
                                                </div>
                                                <div className="student-name-details">
                                                    <span className="student-name-text">{fullName}</span>
                                                    <span className="student-view-profile-hint">
                                                        Click for Personal Profile Page →
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="program-table-cell">
                                                <span className="program-table-pill">
                                                    {member.ministry || "Bachelor of Theology (B.Th.)"}
                                                </span>
                                                <span className="table-mode-pill">
                                                    <Layers size={11} />
                                                    {courseMode}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="year-level-cell">
                                                <Layers size={13} />
                                                <span>{member.civilStatus || "1st Year - 1st Sem"}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="study-load-pill" title={`${subs.length} Enrolled Subjects`}>
                                                <strong>{subs.length} Subjects</strong> • {unitsCount}.0 Units
                                            </span>
                                        </td>
                                        <td>
                                            <div className="table-tuition-cell">
                                                <span className="tuition-total">₱{totalTuition.toLocaleString()}</span>
                                                <span className="tuition-balance">Bal: ₱{balance.toLocaleString()}</span>
                                                <span className={`table-payment-badge ${paymentStatus.toLowerCase()}`}>
                                                    {paymentStatus}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${member.status?.toLowerCase() === "active" ? "active" : "inactive"}`}>
                                                {member.status || "ACTIVE"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="table-actions-cell">
                                                <button
                                                    type="button"
                                                    className="table-btn btn-view"
                                                    onClick={() => handleViewStudentProfile(member)}
                                                    title="View Personal Profile Page"
                                                >
                                                    <Eye size={15} />
                                                    <span>Profile</span>
                                                </button>

                                                {canEditMembers && (
                                                    <button
                                                        type="button"
                                                        className="table-btn btn-edit"
                                                        onClick={() => openEditModal(member)}
                                                        title="Edit Enrollment"
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>
                                                )}

                                                {canDeleteMembers && (
                                                    <button
                                                        type="button"
                                                        className="table-btn btn-delete"
                                                        onClick={() => handleDeleteStudent(member)}
                                                        title="Drop Student"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ENROLLMENT / EDIT STUDENT MODAL */}
            {showModal && (
                <div className="student-modal-overlay">
                    <div className="student-modal-wrapper">
                        <div className="student-modal-header">
                            <div className="modal-title-box">
                                <GraduationCap size={22} color="#0284c7" />
                                <div>
                                    <h3>{editingMember ? "Edit Student Enrollment" : "Enroll New Student"}</h3>
                                    <p>Academic Program, Curriculum Enlistment, and Personal Profile Record</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="modal-close-icon-btn"
                                onClick={() => setShowModal(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form className="student-enrollment-form" onSubmit={handleSaveStudent}>
                            <div className="student-modal-body">
                                {error && (
                                    <div className="modal-inline-error">
                                        <AlertCircle size={16} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Section 1: Academic Enrollment & Program Selection */}
                                <div className="modal-form-section">
                                    <h4 className="section-title">
                                        <BookOpen size={16} />
                                        <span>Academic Program & Curriculum Enlistment</span>
                                    </h4>

                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label>STUDENT ID / NUMBER *</label>
                                            <input
                                                type="text"
                                                required
                                                value={form.memberCode}
                                                onChange={e => setForm({ ...form, memberCode: e.target.value })}
                                                placeholder="e.g. STD-2026-0012"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>ACADEMIC PROGRAM / DEGREE COURSE *</label>
                                            <select
                                                required
                                                value={form.ministry}
                                                onChange={e => handleProgramOrYearChange(e.target.value, form.civilStatus)}
                                            >
                                                {availableCourses.map(prog => (
                                                    <option key={prog.id || prog.code} value={prog.name}>
                                                        {prog.name} ({prog.code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label>MODE OF LEARNING *</label>
                                            <select
                                                required
                                                value={form.modeOfLearning}
                                                onChange={e => setForm({ ...form, modeOfLearning: e.target.value })}
                                            >
                                                <option value="Modular Field Cohort">Modular Field Cohort</option>
                                                <option value="Hybrid Cloud / Offline Sync">Hybrid Cloud / Offline Sync</option>
                                                <option value="Weekend Intensive">Weekend Intensive</option>
                                                <option value="Online Distance Learning">Online Distance Learning</option>
                                                <option value="On-Campus Resident">On-Campus Resident</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>YEAR LEVEL & SEMESTER *</label>
                                            <select
                                                required
                                                value={form.civilStatus}
                                                onChange={e => handleProgramOrYearChange(form.ministry, e.target.value)}
                                            >
                                                <option value="1st Year - 1st Semester">1st Year - 1st Semester</option>
                                                <option value="1st Year - 2nd Semester">1st Year - 2nd Semester</option>
                                                <option value="2nd Year - 1st Semester">2nd Year - 1st Semester</option>
                                                <option value="2nd Year - 2nd Semester">2nd Year - 2nd Semester</option>
                                                <option value="3rd Year - 1st Semester">3rd Year - 1st Semester</option>
                                                <option value="3rd Year - 2nd Semester">3rd Year - 2nd Semester</option>
                                                <option value="4th Year - 1st Semester">4th Year - 1st Semester</option>
                                                <option value="4th Year - 2nd Semester">4th Year - 2nd Semester</option>
                                                <option value="Grade 11 - 1st Semester">Grade 11 - 1st Semester (SHS)</option>
                                                <option value="Grade 12 - 1st Semester">Grade 12 - 1st Semester (SHS)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Subject Enlistment & Study Load */}
                                <div className="modal-form-section">
                                    <div className="enlistment-subjects-box">
                                        <div className="enlistment-box-header">
                                            <div className="enlistment-title">
                                                <strong>Available Subjects under {form.ministry} ({form.civilStatus})</strong>
                                                <span>Check subjects to enroll. Total units and tuition fee compute automatically.</span>
                                            </div>
                                            <div className="enlistment-actions-summary">
                                                <div className="modal-total-units-badge">
                                                    TOTAL UNITS: <strong>{modalTotalUnits}.0</strong>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn-select-all"
                                                    onClick={selectAllSubjects}
                                                >
                                                    Select All
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-clear-all"
                                                    onClick={clearAllSubjects}
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>

                                        <div className="enlistment-subjects-list">
                                            {formAvailableSubjects.length === 0 ? (
                                                <div className="no-subjects-hint">
                                                    No subjects found for this program. You can configure curriculum in the Course Manager.
                                                </div>
                                            ) : (
                                                formAvailableSubjects.map(sub => {
                                                    const isSelected = form.selectedSubjectCodes.includes(sub.code);
                                                    return (
                                                        <div
                                                            key={sub.code}
                                                            className={`subject-enlist-item ${isSelected ? "selected" : ""}`}
                                                            onClick={() => toggleSubjectCode(sub.code)}
                                                        >
                                                            <div className="subject-check">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => {}} // Handled by div click
                                                                />
                                                            </div>
                                                            <div className="subject-code-tag">{sub.code}</div>
                                                            <div className="subject-text">
                                                                <div className="subject-title-line">
                                                                    <strong>{sub.title}</strong>
                                                                    <span className="subject-unit-tag">{sub.units}.0 Units</span>
                                                                </div>
                                                                <div className="subject-meta-line">
                                                                    <span><Clock size={12} /> {sub.schedule}</span>
                                                                    <span><MapPin size={12} /> {sub.room}</span>
                                                                    <span><Layers size={12} /> {(sub as any).modeOfLearning || form.modeOfLearning}</span>
                                                                    <span><User size={12} /> {sub.instructor}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Financial Tuition Assessment & Downpayment Box */}
                                <div className="modal-form-section">
                                    <div className="enlistment-tuition-box">
                                        <div className="tuition-box-header">
                                            <strong>
                                                <DollarSign size={16} />
                                                Tuition Assessment & Payment Calculation
                                            </strong>
                                            <span className={`tuition-status-badge ${modalComputedStatus.toLowerCase()}`}>
                                                Status: {modalComputedStatus}
                                            </span>
                                        </div>

                                        <div className="tuition-inputs-grid">
                                            <div className="tuition-col">
                                                <label>RATE PER UNIT (₱) *</label>
                                                <div className="tuition-input-wrap">
                                                    <span className="currency-prefix">₱</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="10"
                                                        value={form.paymentPerUnit}
                                                        onChange={e => setForm({ ...form, paymentPerUnit: Math.max(0, Number(e.target.value)) })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="tuition-col">
                                                <label>ENROLLED UNITS</label>
                                                <div className="tuition-val-box units">
                                                    <strong>{modalTotalUnits}.0</strong>
                                                </div>
                                            </div>

                                            <div className="tuition-col">
                                                <label>TOTAL TUITION</label>
                                                <div className="tuition-val-box total">
                                                    <strong>₱{modalTotalTuition.toLocaleString()}</strong>
                                                </div>
                                            </div>

                                            <div className="tuition-col">
                                                <label>DOWNPAYMENT / PAID (₱)</label>
                                                <div className="tuition-input-wrap">
                                                    <span className="currency-prefix">₱</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="50"
                                                        value={form.amountPaid}
                                                        onChange={e => setForm({ ...form, amountPaid: Math.max(0, Number(e.target.value)) })}
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>

                                            <div className="tuition-col">
                                                <label>BALANCE DUE</label>
                                                <div className={`tuition-val-box ${modalBalance > 0 ? "balance-due" : "balance-cleared"}`}>
                                                    <strong>₱{modalBalance.toLocaleString()}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: Student Personal Information */}
                                <div className="modal-form-section">
                                    <h4 className="section-title">
                                        <User size={16} />
                                        <span>Personal Demographics</span>
                                    </h4>

                                    <div className="form-grid-3">
                                        <div className="form-group">
                                            <label>FIRST NAME *</label>
                                            <input
                                                type="text"
                                                required
                                                value={form.firstName}
                                                onChange={e => setForm({ ...form, firstName: e.target.value })}
                                                placeholder="e.g. Alexander"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>MIDDLE NAME</label>
                                            <input
                                                type="text"
                                                value={form.middleName}
                                                onChange={e => setForm({ ...form, middleName: e.target.value })}
                                                placeholder="e.g. Cruz"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>LAST NAME *</label>
                                            <input
                                                type="text"
                                                required
                                                value={form.lastName}
                                                onChange={e => setForm({ ...form, lastName: e.target.value })}
                                                placeholder="e.g. Reyes"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-grid-4">
                                        <div className="form-group">
                                            <label>SUFFIX</label>
                                            <input
                                                type="text"
                                                value={form.suffix}
                                                onChange={e => setForm({ ...form, suffix: e.target.value })}
                                                placeholder="e.g. Jr., III"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>GENDER</label>
                                            <select
                                                value={form.gender}
                                                onChange={e => setForm({ ...form, gender: e.target.value })}
                                            >
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>DATE OF BIRTH</label>
                                            <input
                                                type="date"
                                                value={form.birthDate}
                                                onChange={e => setForm({ ...form, birthDate: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>DATE OF ADMISSION</label>
                                            <input
                                                type="date"
                                                value={form.dateJoined}
                                                onChange={e => setForm({ ...form, dateJoined: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 5: Contact & Emergency Guardian Information */}
                                <div className="modal-form-section">
                                    <h4 className="section-title">
                                        <Phone size={16} />
                                        <span>Contact & Guardian Information</span>
                                    </h4>

                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label>STUDENT CONTACT NUMBER</label>
                                            <input
                                                type="text"
                                                value={form.contactNumber}
                                                onChange={e => setForm({ ...form, contactNumber: e.target.value })}
                                                placeholder="e.g. +63 917 123 4567"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>STUDENT EMAIL</label>
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={e => setForm({ ...form, email: e.target.value })}
                                                placeholder="e.g. student@school.edu"
                                            />
                                        </div>

                                        <div className="form-group full-width">
                                            <label>PERMANENT RESIDENCE ADDRESS</label>
                                            <input
                                                type="text"
                                                value={form.address}
                                                onChange={e => setForm({ ...form, address: e.target.value })}
                                                placeholder="e.g. 142 Rizal Ave, Quezon City"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>PARENT / GUARDIAN NAME</label>
                                            <input
                                                type="text"
                                                value={form.guardianName}
                                                onChange={e => setForm({ ...form, guardianName: e.target.value })}
                                                placeholder="e.g. Remedios Reyes"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>GUARDIAN CONTACT NUMBER</label>
                                            <input
                                                type="text"
                                                value={form.guardianContact}
                                                onChange={e => setForm({ ...form, guardianContact: e.target.value })}
                                                placeholder="e.g. +63 918 234 5678"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>ENROLLMENT STATUS</label>
                                            <select
                                                value={form.status}
                                                onChange={e => setForm({ ...form, status: e.target.value })}
                                            >
                                                <option value="ACTIVE">ACTIVE / ENROLLED</option>
                                                <option value="INACTIVE">INACTIVE / ON LEAVE</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="student-modal-footer">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={saving}
                                >
                                    {saving ? "Saving Record..." : editingMember ? "Save Student Changes" : "Confirm Enrollment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Members;