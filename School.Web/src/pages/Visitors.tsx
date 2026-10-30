// ============================================================
// Visitors.tsx -> Student Admissions & Applications System
// Mobile Bible School & Theological Seminary
// Academic System • Office of Admissions & University Registrar
// ============================================================

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    GraduationCap,
    FileText,
    CheckCircle2,
    Clock,
    Award,
    Search,
    Plus,
    RotateCcw,
    Printer,
    Layers,
    Eye,
    Edit3,
    UserPlus,
    X,
    School,
    Phone,
    Mail,
    FileCheck,
    Check,
    User,
    Users,
    CheckSquare,
    Square
} from "lucide-react";

import "./Visitors.css";
import { API_BASE_URL } from "../config.ts";
import {
    courseCurriculumService,
    type CourseProgram
} from "../services/courseCurriculumService";
import { SchoolPrintService, type AdmissionLetterData } from "../utils/schoolPrintService";

// ============================================================
// ADMISSIONS TYPES & DATA MODELS
// ============================================================

export type AdmissionStage =
    | "APPLICATION_FILED"
    | "DOCUMENT_REVIEW"
    | "EXAM_INTERVIEW"
    | "OFFICIALLY_ADMITTED"
    | "ENROLLED";

export interface ApplicantCredentials {
    tor: boolean; // Transcript of Records / Form 137 / 138 / Report Card
    birthCert: boolean; // PSA Birth Certificate
    goodMoral: boolean; // Certificate of Good Moral Character
    recommendationLetter: boolean; // Pastoral / Academic Recommendation
    statementOfFaith: boolean; // Personal Testimony / Calling Statement
    idPhotos: boolean; // 2x2 Colored ID Photographs
    medicalCert?: boolean; // Health Clearance
}

export interface ApplicantMetadata {
    program: string;
    modeOfLearning: string;
    applicantType: "Freshman" | "Transferee" | "Graduate / Seminary" | "Second Degree / Returnee";
    previousSchool?: string;
    gwa?: string;
    examScore?: string;
    examDate?: string;
    interviewRating?: string;
    interviewerName?: string;
    interviewNotes?: string;
    documents: ApplicantCredentials;
    guardianName?: string;
    guardianContact?: string;
    guardianRelationship?: string;
    email?: string;
    civilStatus?: string;
    nationality?: string;
    religion?: string;
    applicationTerm?: string;
    admissionDecisionDate?: string;
    admittedBy?: string;
    generalRemarks?: string;
}

export interface ApplicantRecord {
    applicantId: number;
    applicantCode: string;
    firstName: string;
    middleName?: string | null;
    lastName: string;
    fullName: string;
    gender?: string | null;
    birthDate?: string | null;
    contactNumber?: string | null;
    address?: string | null;
    program: string;
    applicationDate: string;
    screeningCount: number;
    admissionStage: AdmissionStage;
    status: string;
    isMatriculated: boolean;
    matriculatedStudentId?: number | null;
    matriculationDate?: string | null;
    meta: ApplicantMetadata;
    rawNotes?: string | null;
    createdDate?: string | null;
    updatedDate?: string | null;
}

export interface ScreeningSession {
    attendanceId: number;
    applicantId: number;
    category: string;
    sessionDate: string;
    evaluator: string;
    scoreRating: string;
    result: string;
    notes: string;
}

type ViewMode = "table" | "cards";

// Stage Mapping Utilities (Compatible with backend followUpStatus: NEW, CONTACTED, FOLLOW-UP, CONNECTED, CONVERTED)
const STAGE_CONFIG: Record<
    AdmissionStage,
    { label: string; backendStatus: string; stepNumber: string; color: string; desc: string }
> = {
    APPLICATION_FILED: {
        label: "Application Filed",
        backendStatus: "NEW",
        stepNumber: "1",
        color: "#2563eb",
        desc: "Applicant Intake & Program Choice"
    },
    DOCUMENT_REVIEW: {
        label: "Document Verification",
        backendStatus: "CONTACTED",
        stepNumber: "2",
        color: "#d97706",
        desc: "Credentials & TOR Evaluation"
    },
    EXAM_INTERVIEW: {
        label: "Exam & Interview",
        backendStatus: "FOLLOW-UP",
        stepNumber: "3",
        color: "#7c3aed",
        desc: "Scholastic Test & Panel Interview"
    },
    OFFICIALLY_ADMITTED: {
        label: "Officially Admitted",
        backendStatus: "CONNECTED",
        stepNumber: "4",
        color: "#059669",
        desc: "Board Clearance & Acceptance Letter"
    },
    ENROLLED: {
        label: "Matriculated / Enrolled",
        backendStatus: "CONVERTED",
        stepNumber: "5",
        color: "#16a34a",
        desc: "Registered Student with Student ID"
    }
};

function mapBackendToStage(backendStatus?: string | null, isConverted?: boolean): AdmissionStage {
    if (isConverted) return "ENROLLED";
    const clean = (backendStatus || "").toUpperCase().trim();
    if (clean === "CONVERTED") return "ENROLLED";
    if (clean === "CONNECTED") return "OFFICIALLY_ADMITTED";
    if (clean === "FOLLOW-UP" || clean === "FOLLOWUP") return "EXAM_INTERVIEW";
    if (clean === "CONTACTED") return "DOCUMENT_REVIEW";
    return "APPLICATION_FILED";
}

function mapStageToBackend(stage: AdmissionStage): string {
    return STAGE_CONFIG[stage]?.backendStatus || "NEW";
}

function parseApplicantNotes(notesStr?: string | null): ApplicantMetadata {
    const defaultMeta: ApplicantMetadata = {
        program: "Bachelor of Theology (B.Th.)",
        modeOfLearning: "Modular Field Cohort",
        applicantType: "Freshman",
        previousSchool: "",
        gwa: "",
        examScore: "",
        examDate: "",
        interviewRating: "",
        interviewerName: "",
        interviewNotes: "",
        documents: {
            tor: false,
            birthCert: false,
            goodMoral: false,
            recommendationLetter: false,
            statementOfFaith: false,
            idPhotos: false,
            medicalCert: false
        },
        guardianName: "",
        guardianContact: "",
        guardianRelationship: "Parent / Guardian",
        email: "",
        civilStatus: "Single",
        nationality: "Filipino",
        religion: "Christian",
        applicationTerm: "1st Sem A.Y. 2026-2027",
        admissionDecisionDate: "",
        admittedBy: "Board of Admissions",
        generalRemarks: ""
    };

    if (!notesStr || !notesStr.trim()) return defaultMeta;

    if (notesStr.startsWith("{") && notesStr.endsWith("}")) {
        try {
            const parsed = JSON.parse(notesStr);
            return {
                ...defaultMeta,
                ...parsed,
                documents: {
                    ...defaultMeta.documents,
                    ...(parsed.documents || {})
                }
            };
        } catch {
            return { ...defaultMeta, generalRemarks: notesStr };
        }
    }

    return { ...defaultMeta, generalRemarks: notesStr };
}

function getTodayString(): string {
    return new Date().toISOString().split("T")[0];
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("jwt") ||
        "";

    const baseUrl = API_BASE_URL.replace(/\/+$/, "");
    const cleanEndpoint = endpoint.replace(/^\/+/, "");
    const url = `${baseUrl}/${cleanEndpoint}`;

    const headers = new Headers(options.headers);
    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, { ...options, headers });
    const text = await response.text();

    if (!response.ok) {
        let msg = `Request failed: ${response.status} ${response.statusText}`;
        try {
            const errObj = JSON.parse(text);
            msg = errObj.message || errObj.error || msg;
        } catch {}
        throw new Error(msg);
    }

    try {
        return JSON.parse(text) as T;
    } catch {
        return text as unknown as T;
    }
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Visitors() {
    const [applicants, setApplicants] = useState<ApplicantRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Dynamic Academic Programs from Course Curriculum Service
    const [availableCourses, setAvailableCourses] = useState<CourseProgram[]>([]);

    // Search & Filters
    const [search, setSearch] = useState("");
    const [stageFilter, setStageFilter] = useState<AdmissionStage | "ALL">("ALL");
    const [programFilter, setProgramFilter] = useState("ALL");
    const [modeFilter, setModeFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [viewMode, setViewMode] = useState<ViewMode>("table");

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDossierModal, setShowDossierModal] = useState(false);
    const [showScreeningModal, setShowScreeningModal] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState<ApplicantRecord | null>(null);

    // Form Tabs inside Add Modal
    const [activeAddTab, setActiveAddTab] = useState<"profile" | "academics" | "documents" | "decision">("profile");

    // Intake Form State
    const [applicantForm, setApplicantForm] = useState<{
        firstName: string;
        middleName: string;
        lastName: string;
        gender: string;
        birthDate: string;
        civilStatus: string;
        contactNumber: string;
        email: string;
        address: string;
        guardianName: string;
        guardianContact: string;
        guardianRelationship: string;
        program: string;
        modeOfLearning: string;
        applicantType: "Freshman" | "Transferee" | "Graduate / Seminary" | "Second Degree / Returnee";
        previousSchool: string;
        gwa: string;
        applicationDate: string;
        examScore: string;
        interviewRating: string;
        interviewerName: string;
        interviewNotes: string;
        admissionStage: AdmissionStage;
        documents: ApplicantCredentials;
        generalRemarks: string;
    }>({
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "Male",
        birthDate: "2004-01-15",
        civilStatus: "Single",
        contactNumber: "",
        email: "",
        address: "",
        guardianName: "",
        guardianContact: "",
        guardianRelationship: "Parent / Guardian",
        program: "Bachelor of Theology (B.Th.)",
        modeOfLearning: "Modular Field Cohort",
        applicantType: "Freshman",
        previousSchool: "",
        gwa: "",
        applicationDate: getTodayString(),
        examScore: "",
        interviewRating: "",
        interviewerName: "Rev. Dr. Rhoderick De Vera, Th.D.",
        interviewNotes: "",
        admissionStage: "APPLICATION_FILED",
        documents: {
            tor: false,
            birthCert: false,
            goodMoral: false,
            recommendationLetter: false,
            statementOfFaith: false,
            idPhotos: false,
            medicalCert: false
        },
        generalRemarks: ""
    });

    // Screening modal state
    const [screeningForm, setScreeningForm] = useState<{
        category: string;
        sessionDate: string;
        roomVenue: string;
        evaluator: string;
        scoreRating: string;
        result: string;
        notes: string;
        advanceStageTo: AdmissionStage;
    }>({
        category: "Entrance Diagnostic Exam",
        sessionDate: getTodayString(),
        roomVenue: "Examination Room • Rm 101",
        evaluator: "Rev. Dr. Rhoderick De Vera, Th.D.",
        scoreRating: "88.5%",
        result: "Passed - Recommended for Admission",
        notes: "Demonstrated strong scripture familiarity and high scholastic aptitude.",
        advanceStageTo: "EXAM_INTERVIEW"
    });

    // Toast helper
    const showNotice = (type: "success" | "error", msg: string) => {
        if (type === "success") {
            setSuccess(msg);
            setTimeout(() => setSuccess(""), 4500);
        } else {
            setError(msg);
            setTimeout(() => setError(""), 5500);
        }
    };

    // Load Courses from curriculum service
    useEffect(() => {
        const list = courseCurriculumService.getCourses();
        setAvailableCourses(list);
    }, []);

    // LOAD APPLICANTS
    const loadApplicants = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const rawData = await apiFetch<any[]>("/Visitors");
            if (Array.isArray(rawData)) {
                const mapped: ApplicantRecord[] = rawData.map(v => {
                    const parsedMeta = parseApplicantNotes(v.notes);
                    const defaultProgram = v.ministry || parsedMeta.program || "Bachelor of Theology (B.Th.)";
                    const stage = mapBackendToStage(v.followUpStatus, v.isConvertedToMember);

                    const fullName =
                        v.fullName ||
                        `${v.firstName || ""} ${v.middleName ? v.middleName + " " : ""}${v.lastName || ""}`.trim();

                    return {
                        applicantId: v.visitorId,
                        applicantCode: v.visitorCode || `APP-2026-${String(v.visitorId).padStart(4, "0")}`,
                        firstName: v.firstName || "",
                        middleName: v.middleName,
                        lastName: v.lastName || "",
                        fullName: fullName || "Unnamed Applicant",
                        gender: v.gender || "Unspecified",
                        birthDate: v.birthDate,
                        contactNumber: v.contactNumber || parsedMeta.guardianContact || "",
                        address: v.address || "",
                        program: defaultProgram,
                        applicationDate: v.firstVisitDate ? v.firstVisitDate.split("T")[0] : getTodayString(),
                        screeningCount: v.visitCount || 0,
                        admissionStage: stage,
                        status: v.status || "ACTIVE",
                        isMatriculated: !!v.isConvertedToMember,
                        matriculatedStudentId: v.convertedMemberId,
                        matriculationDate: v.conversionDate,
                        meta: {
                            ...parsedMeta,
                            program: defaultProgram
                        },
                        rawNotes: v.notes,
                        createdDate: v.createdDate,
                        updatedDate: v.updatedDate
                    };
                });
                setApplicants(mapped);
            }
        } catch (err: unknown) {
            const e = err as Error;
            setError(e.message || "Failed to load applicant records.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadApplicants();
    }, [loadApplicants]);

    // KPI METRICS
    const stats = useMemo(() => {
        const total = applicants.length;
        const documentReview = applicants.filter(a => a.admissionStage === "DOCUMENT_REVIEW").length;
        const newApps = applicants.filter(a => a.admissionStage === "APPLICATION_FILED").length;
        const examInterview = applicants.filter(a => a.admissionStage === "EXAM_INTERVIEW").length;
        const admitted = applicants.filter(a => a.admissionStage === "OFFICIALLY_ADMITTED").length;
        const enrolled = applicants.filter(a => a.isMatriculated || a.admissionStage === "ENROLLED").length;
        const yieldRate = total > 0 ? Math.round((enrolled / total) * 100) : 0;
        return { total, documentReview, newApps, examInterview, admitted, enrolled, yieldRate };
    }, [applicants]);

    const freshmenCount = useMemo(() => {
        return applicants.filter(a => a.meta.applicantType === "Freshman").length;
    }, [applicants]);

    const transfereeCount = useMemo(() => {
        return applicants.filter(a => a.meta.applicantType !== "Freshman").length;
    }, [applicants]);

    // FILTERED APPLICANTS
    const filteredApplicants = useMemo(() => {
        const q = search.trim().toLowerCase();
        return applicants.filter(a => {
            const matchesQuery =
                !q ||
                a.fullName.toLowerCase().includes(q) ||
                a.applicantCode.toLowerCase().includes(q) ||
                a.program.toLowerCase().includes(q) ||
                (a.contactNumber && a.contactNumber.toLowerCase().includes(q)) ||
                (a.meta.email && a.meta.email.toLowerCase().includes(q)) ||
                (a.meta.previousSchool && a.meta.previousSchool.toLowerCase().includes(q)) ||
                (a.address && a.address.toLowerCase().includes(q));

            const matchesStage = stageFilter === "ALL" || a.admissionStage === stageFilter;
            const matchesProgram = programFilter === "ALL" || a.program.toLowerCase().includes(programFilter.toLowerCase());
            const matchesMode = modeFilter === "ALL" || (a.meta.modeOfLearning && a.meta.modeOfLearning.toLowerCase().includes(modeFilter.toLowerCase()));
            const matchesType = typeFilter === "ALL" || a.meta.applicantType === typeFilter;

            return matchesQuery && matchesStage && matchesProgram && matchesMode && matchesType;
        });
    }, [applicants, search, stageFilter, programFilter, modeFilter, typeFilter]);

    // OPEN ADD MODAL
    const handleOpenAddModal = () => {
        const defaultProg = availableCourses.length > 0 ? availableCourses[0].name : "Bachelor of Theology (B.Th.)";
        const defaultMode = availableCourses.length > 0 ? availableCourses[0].modeOfLearning : "Modular Field Cohort";

        setApplicantForm({
            firstName: "",
            middleName: "",
            lastName: "",
            gender: "Male",
            birthDate: "2004-01-15",
            civilStatus: "Single",
            contactNumber: "",
            email: "",
            address: "",
            guardianName: "",
            guardianContact: "",
            guardianRelationship: "Parent / Guardian",
            program: defaultProg,
            modeOfLearning: defaultMode,
            applicantType: "Freshman",
            previousSchool: "",
            gwa: "",
            applicationDate: getTodayString(),
            examScore: "",
            interviewRating: "",
            interviewerName: "Rev. Dr. Rhoderick De Vera, Th.D.",
            interviewNotes: "",
            admissionStage: "APPLICATION_FILED",
            documents: {
                tor: false,
                birthCert: false,
                goodMoral: false,
                recommendationLetter: false,
                statementOfFaith: false,
                idPhotos: false,
                medicalCert: false
            },
            generalRemarks: ""
        });
        setActiveAddTab("profile");
        setShowAddModal(true);
    };

    // OPEN EDIT MODAL
    const handleOpenEditModal = (applicant: ApplicantRecord) => {
        setSelectedApplicant(applicant);
        setApplicantForm({
            firstName: applicant.firstName,
            middleName: applicant.middleName || "",
            lastName: applicant.lastName,
            gender: applicant.gender || "Male",
            birthDate: applicant.birthDate ? applicant.birthDate.split("T")[0] : "2004-01-15",
            civilStatus: applicant.meta.civilStatus || "Single",
            contactNumber: applicant.contactNumber || "",
            email: applicant.meta.email || "",
            address: applicant.address || "",
            guardianName: applicant.meta.guardianName || "",
            guardianContact: applicant.meta.guardianContact || "",
            guardianRelationship: applicant.meta.guardianRelationship || "Parent / Guardian",
            program: applicant.program,
            modeOfLearning: applicant.meta.modeOfLearning || "Modular Field Cohort",
            applicantType: applicant.meta.applicantType || "Freshman",
            previousSchool: applicant.meta.previousSchool || "",
            gwa: applicant.meta.gwa || "",
            applicationDate: applicant.applicationDate,
            examScore: applicant.meta.examScore || "",
            interviewRating: applicant.meta.interviewRating || "",
            interviewerName: applicant.meta.interviewerName || "Rev. Dr. Rhoderick De Vera, Th.D.",
            interviewNotes: applicant.meta.interviewNotes || "",
            admissionStage: applicant.admissionStage,
            documents: { ...(applicant.meta.documents || {}) },
            generalRemarks: applicant.meta.generalRemarks || ""
        });
        setShowEditModal(true);
    };

    // OPEN DOSSIER MODAL
    const handleOpenDossierModal = (applicant: ApplicantRecord) => {
        setSelectedApplicant(applicant);
        setShowDossierModal(true);
    };

    // OPEN SCREENING MODAL
    const handleOpenScreeningModal = (applicant: ApplicantRecord) => {
        setSelectedApplicant(applicant);
        setScreeningForm({
            category: "Entrance Diagnostic Exam",
            sessionDate: getTodayString(),
            roomVenue: "Examination Hall • Rm 101",
            evaluator: applicant.meta.interviewerName || "Rev. Dr. Rhoderick De Vera, Th.D.",
            scoreRating: applicant.meta.examScore || "88.5%",
            result: "Passed - Recommended for Admission",
            notes: "Exemplary understanding of Christian doctrine and strong academic readiness.",
            advanceStageTo: applicant.admissionStage === "APPLICATION_FILED" ? "EXAM_INTERVIEW" : applicant.admissionStage
        });
        setShowScreeningModal(true);
    };

    // SAVE NEW APPLICATION DOSSIER
    const handleSaveNewApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!applicantForm.firstName.trim() || !applicantForm.lastName.trim()) {
            showNotice("error", "First name and last name are required for admission application.");
            return;
        }

        setSaving(true);
        try {
            const metaToStore: ApplicantMetadata = {
                program: applicantForm.program,
                modeOfLearning: applicantForm.modeOfLearning,
                applicantType: applicantForm.applicantType,
                previousSchool: applicantForm.previousSchool,
                gwa: applicantForm.gwa,
                examScore: applicantForm.examScore,
                examDate: applicantForm.applicationDate,
                interviewRating: applicantForm.interviewRating,
                interviewerName: applicantForm.interviewerName,
                interviewNotes: applicantForm.interviewNotes,
                documents: applicantForm.documents,
                guardianName: applicantForm.guardianName,
                guardianContact: applicantForm.guardianContact,
                guardianRelationship: applicantForm.guardianRelationship,
                email: applicantForm.email,
                civilStatus: applicantForm.civilStatus,
                applicationTerm: "1st Sem A.Y. 2026-2027",
                admissionDecisionDate: applicantForm.admissionStage === "OFFICIALLY_ADMITTED" ? getTodayString() : "",
                admittedBy: "Board of Admissions",
                generalRemarks: applicantForm.generalRemarks
            };

            const payload = {
                firstName: applicantForm.firstName.trim(),
                middleName: applicantForm.middleName.trim(),
                lastName: applicantForm.lastName.trim(),
                gender: applicantForm.gender.toUpperCase(),
                birthDate: applicantForm.birthDate ? `${applicantForm.birthDate}T00:00:00` : null,
                contactNumber: applicantForm.contactNumber.trim(),
                address: applicantForm.address.trim(),
                invitedBy: applicantForm.previousSchool.trim() || applicantForm.guardianName.trim() || "Online Portal",
                ministry: applicantForm.program.trim(),
                firstVisitDate: applicantForm.applicationDate ? `${applicantForm.applicationDate}T00:00:00` : null,
                notes: JSON.stringify(metaToStore)
            };

            await apiFetch("/Visitors", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            setShowAddModal(false);
            await loadApplicants();
            showNotice("success", `Application dossier for ${applicantForm.firstName} ${applicantForm.lastName} registered successfully.`);
        } catch (err: unknown) {
            const e = err as Error;
            showNotice("error", e.message || "Failed to register admission application.");
        } finally {
            setSaving(false);
        }
    };

    // UPDATE APPLICATION DOSSIER & STAGE
    const handleUpdateApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApplicant) return;

        setSaving(true);
        try {
            const metaToStore: ApplicantMetadata = {
                program: applicantForm.program,
                modeOfLearning: applicantForm.modeOfLearning,
                applicantType: applicantForm.applicantType,
                previousSchool: applicantForm.previousSchool,
                gwa: applicantForm.gwa,
                examScore: applicantForm.examScore,
                examDate: selectedApplicant.meta.examDate || getTodayString(),
                interviewRating: applicantForm.interviewRating,
                interviewerName: applicantForm.interviewerName,
                interviewNotes: applicantForm.interviewNotes,
                documents: applicantForm.documents,
                guardianName: applicantForm.guardianName,
                guardianContact: applicantForm.guardianContact,
                guardianRelationship: applicantForm.guardianRelationship,
                email: applicantForm.email,
                civilStatus: applicantForm.civilStatus,
                applicationTerm: selectedApplicant.meta.applicationTerm || "1st Sem A.Y. 2026-2027",
                admissionDecisionDate: applicantForm.admissionStage === "OFFICIALLY_ADMITTED" ? getTodayString() : selectedApplicant.meta.admissionDecisionDate,
                admittedBy: "Board of Admissions",
                generalRemarks: applicantForm.generalRemarks
            };

            // 1. Update basic record
            const updatePayload = {
                firstName: applicantForm.firstName.trim(),
                middleName: applicantForm.middleName.trim(),
                lastName: applicantForm.lastName.trim(),
                gender: applicantForm.gender.toUpperCase(),
                birthDate: applicantForm.birthDate ? `${applicantForm.birthDate}T00:00:00` : null,
                contactNumber: applicantForm.contactNumber.trim(),
                address: applicantForm.address.trim(),
                invitedBy: applicantForm.previousSchool.trim() || "Online Portal",
                ministry: applicantForm.program.trim(),
                firstVisitDate: applicantForm.applicationDate ? `${applicantForm.applicationDate}T00:00:00` : null,
                notes: JSON.stringify(metaToStore)
            };

            await apiFetch(`/Visitors/${selectedApplicant.applicantId}`, {
                method: "PUT",
                body: JSON.stringify(updatePayload)
            });

            // 2. Update admission follow-up status
            const backendStatus = mapStageToBackend(applicantForm.admissionStage);
            await apiFetch(`/Visitors/${selectedApplicant.applicantId}/follow-up`, {
                method: "POST",
                body: JSON.stringify({ followUpStatus: backendStatus })
            });

            setShowEditModal(false);
            await loadApplicants();
            showNotice("success", `Applicant dossier and admission stage updated to '${STAGE_CONFIG[applicantForm.admissionStage].label}'.`);
        } catch (err: unknown) {
            const e = err as Error;
            showNotice("error", e.message || "Failed to update applicant dossier.");
        } finally {
            setSaving(false);
        }
    };

    // QUICK ADVANCE STAGE

    // SAVE SCREENING ASSESSMENT
    const handleSaveScreening = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApplicant) return;

        setSaving(true);
        try {
            // Update applicant meta with latest exam and interview scores
            const updatedMeta: ApplicantMetadata = {
                ...selectedApplicant.meta,
                examScore: screeningForm.scoreRating,
                interviewRating: screeningForm.result,
                interviewerName: screeningForm.evaluator,
                interviewNotes: screeningForm.notes
            };

            await apiFetch(`/Visitors/${selectedApplicant.applicantId}`, {
                method: "PUT",
                body: JSON.stringify({
                    firstName: selectedApplicant.firstName,
                    lastName: selectedApplicant.lastName,
                    ministry: selectedApplicant.program,
                    notes: JSON.stringify(updatedMeta)
                })
            });

            // Advance stage if requested
            if (screeningForm.advanceStageTo && screeningForm.advanceStageTo !== selectedApplicant.admissionStage) {
                const backendStatus = mapStageToBackend(screeningForm.advanceStageTo);
                await apiFetch(`/Visitors/${selectedApplicant.applicantId}/follow-up`, {
                    method: "POST",
                    body: JSON.stringify({ followUpStatus: backendStatus })
                });
            }

            setShowScreeningModal(false);
            await loadApplicants();
            showNotice("success", `Screening assessment recorded for ${selectedApplicant.fullName}. Evaluation: ${screeningForm.scoreRating}.`);
        } catch (err: unknown) {
            const e = err as Error;
            showNotice("error", e.message || "Failed to save screening assessment.");
        } finally {
            setSaving(false);
        }
    };

    // MATRICULATE APPLICANT AS STUDENT (Direct 1-Click Conversion)
    const handleMatriculateApplicant = async (applicant: ApplicantRecord) => {
        if (applicant.isMatriculated) {
            alert(`This applicant is already officially matriculated as student.`);
            return;
        }

        const confirmed = window.confirm(
            `OFFICIAL MATRICULATION CONFIRMATION:\n\n` +
            `Are you sure you want to officially matriculate applicant:\n` +
            `${applicant.fullName} (${applicant.applicantCode})\n\n` +
            `Program: ${applicant.program}\n` +
            `Delivery Mode: ${applicant.meta.modeOfLearning}\n\n` +
            `This will create an active Student profile in the School Student Registry, generate a Student ID, and open subject enrollment.`
        );

        if (!confirmed) return;

        setSaving(true);
        try {
            const result: any = await apiFetch(`/Visitors/${applicant.applicantId}/convert-to-member`, {
                method: "POST"
            });

            const studentCode = result?.memberCode || result?.memberId || "STU-NEW";

            await loadApplicants();
            showNotice(
                "success",
                `🎓 CONGRATULATIONS! ${applicant.fullName} is now officially matriculated with Student ID: ${studentCode}! Registered under ${applicant.program}.`
            );
        } catch (err: unknown) {
            const e = err as Error;
            showNotice("error", e.message || "Failed to matriculate applicant.");
        } finally {
            setSaving(false);
        }
    };

    // PRINT OFFICIAL LETTER OF ACCEPTANCE / ADMISSION
    const handlePrintAcceptanceLetter = (applicant: ApplicantRecord) => {
        const letterData: AdmissionLetterData = {
            applicantName: applicant.fullName,
            applicantCode: applicant.applicantCode,
            program: applicant.program,
            modeOfLearning: applicant.meta.modeOfLearning || "Modular Field Cohort",
            applicantType: applicant.meta.applicantType || "Freshman",
            applicationDate: applicant.applicationDate,
            examScore: applicant.meta.examScore || "Passed (88.5%)",
            interviewRating: applicant.meta.interviewRating || "Recommended by Panel",
            address: applicant.address || undefined,
            contactNumber: applicant.contactNumber || undefined,
            email: applicant.meta.email || undefined,
            guardianName: applicant.meta.guardianName || undefined,
            admittedTerm: applicant.meta.applicationTerm || "Academic Year 2026–2027 (1st Semester)",
            admittedBy: applicant.meta.admittedBy || "Office of Admissions & Registrar"
        };

        SchoolPrintService.printAdmissionAcceptanceLetter(letterData);
    };

    // Copy code helper
    const handleCopyCode = (code: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        showNotice("success", `Copied Application Code '${code}' to clipboard.`);
    };

    return (
        <div className="visitors-page admissions-system-page">
            <div className="visitors-shell">
                {/* ==================================================
                    OFFICE OF ADMISSIONS HEADER
                ================================================== */}
                <header className="visitors-header admissions-portal-header">
                    <div>
                        <div className="eyebrow academic-eyebrow">
                            <School size={13} className="eyebrow-icon" />
                            <span>ACADEMIC AFFAIRS • OFFICE OF ADMISSIONS & UNIVERSITY REGISTRAR</span>
                        </div>
                        <h1 className="admissions-main-title">
                            Student Admissions & Applications Portal
                        </h1>
                        <p className="admissions-subtitle">
                            Comprehensive applicant lifecycle management: applicant intake, credentials verification, entrance examination screening, acceptance notices, and official matriculation.
                        </p>
                    </div>

                    <div className="header-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => void loadApplicants()}
                            disabled={loading}
                            title="Reload latest applications"
                        >
                            <RotateCcw size={15} className={loading ? "spin" : ""} />
                            <span>Refresh Roster</span>
                        </button>

                        <button
                            type="button"
                            className="btn btn-primary btn-admission-action"
                            onClick={handleOpenAddModal}
                        >
                            <Plus size={16} />
                            <span>File New Application</span>
                        </button>
                    </div>
                </header>

                {/* ALERTS */}
                {error && (
                    <div className="alert alert-error">
                        <span className="alert-icon">!</span>
                        <div>
                            <strong>Admissions System Notice</strong>
                            <p>{error}</p>
                        </div>
                        <button type="button" onClick={() => setError("")}>×</button>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <span className="alert-icon">✓</span>
                        <div>
                            <strong>Admissions Operation Successful</strong>
                            <p>{success}</p>
                        </div>
                        <button type="button" onClick={() => setSuccess("")}>×</button>
                    </div>
                )}

                {/* ==================================================
                    COLLEGE & UNIVERSITY ADMISSIONS METRICS (6 KPI CARDS)
                ================================================== */}
                <section className="stats-grid admissions-metrics-grid">
                    <div className="stat-card stat-blue">
                        <div className="stat-icon">
                            <Users size={18} />
                        </div>
                        <div>
                            <span>Total Applicants</span>
                            <strong>{stats.total}</strong>
                            <small>All registered applicant dossiers</small>
                        </div>
                    </div>

                    <div className="stat-card stat-orange">
                        <div className="stat-icon">
                            <FileCheck size={18} />
                        </div>
                        <div>
                            <span>Credential Review</span>
                            <strong>{stats.documentReview}</strong>
                            <small>Form 138 / TOR evaluation stage</small>
                        </div>
                    </div>

                    <div className="stat-card stat-sky">
                        <div className="stat-icon">
                            <UserPlus size={18} />
                        </div>
                        <div>
                            <span>New Applications</span>
                            <strong>{stats.newApps}</strong>
                            <small>Pending initial committee review</small>
                        </div>
                    </div>

                    <div className="stat-card stat-purple">
                        <div className="stat-icon">
                            <Award size={18} />
                        </div>
                        <div>
                            <span>Exam & Interview</span>
                            <strong>{stats.examInterview}</strong>
                            <small>Diagnostic testing & faculty panel</small>
                        </div>
                    </div>

                    <div className="stat-card stat-teal">
                        <div className="stat-icon">
                            <CheckCircle2 size={18} />
                        </div>
                        <div>
                            <span>Officially Admitted</span>
                            <strong>{stats.admitted}</strong>
                            <small>Accepted awaiting confirmation</small>
                        </div>
                    </div>

                    <div className="stat-card stat-gold">
                        <div className="stat-icon">
                            <GraduationCap size={18} />
                        </div>
                        <div>
                            <span>Officially Enrolled</span>
                            <strong>{stats.enrolled}</strong>
                            <small>Matriculated with Student ID ({stats.yieldRate}% yield)</small>
                        </div>
                    </div>
                </section>

                {/* ==================================================
                    ACADEMIC ADMISSIONS PIPELINE (5 STAGES)
                ================================================== */}
                <section className="admissions-pipeline-card">
                    <div className="pipeline-header">
                        <div>
                            <span className="section-kicker">ACADEMIC ADMISSIONS PIPELINE</span>
                            <h2 className="pipeline-title">Applicant Screening & Matriculation Journey</h2>
                        </div>
                        <div className="pipeline-summary-pills">
                            <span className="pipeline-pill">Freshmen: <strong>{freshmenCount}</strong></span>
                            <span className="pipeline-pill">Transferees/Grad: <strong>{transfereeCount}</strong></span>
                            <span className="pipeline-pill highlight">Matriculation Yield: <strong>{stats.yieldRate}%</strong></span>
                        </div>
                    </div>

                    <div className="pipeline-track">
                        {(Object.keys(STAGE_CONFIG) as AdmissionStage[]).map((stageKey, idx) => {
                            const config = STAGE_CONFIG[stageKey];
                            let count = 0;
                            if (stageKey === "APPLICATION_FILED") count = stats.newApps;
                            else if (stageKey === "DOCUMENT_REVIEW") count = stats.documentReview;
                            else if (stageKey === "EXAM_INTERVIEW") count = stats.examInterview;
                            else if (stageKey === "OFFICIALLY_ADMITTED") count = stats.admitted;
                            else if (stageKey === "ENROLLED") count = stats.enrolled;

                            const isCurrentFilter = stageFilter === stageKey;

                            return (
                                <React.Fragment key={stageKey}>
                                    <div
                                        className={`pipeline-step ${isCurrentFilter ? "active-filter" : ""}`}
                                        onClick={() => setStageFilter(stageFilter === stageKey ? "ALL" : stageKey)}
                                        title={`Filter by ${config.label} (${count})`}
                                    >
                                        <div className="step-circle" style={{ backgroundColor: isCurrentFilter ? config.color : undefined }}>
                                            {config.stepNumber}
                                        </div>
                                        <div className="step-content">
                                            <strong className="step-label">{config.label}</strong>
                                            <span className="step-count">{count} Applicants</span>
                                            <small className="step-desc">{config.desc}</small>
                                        </div>
                                    </div>
                                    {idx < 4 && <div className="pipeline-arrow" />}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </section>

                {/* ==================================================
                    ADMISSIONS ROSTER & SEARCH TOOLBAR
                ================================================== */}
                <section className="visitor-content admissions-roster-content">
                    <div className="content-toolbar admissions-toolbar">
                        <div className="search-box admissions-search-box">
                            <Search size={15} className="search-box-icon" />
                            <input
                                type="text"
                                placeholder="Search applicant name, application code, mobile, email, or school..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            {search && (
                                <button type="button" onClick={() => setSearch("")} className="clear-btn">
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {/* Stage Filter */}
                        <select
                            className="filter-select"
                            value={stageFilter}
                            onChange={e => setStageFilter(e.target.value as any)}
                        >
                            <option value="ALL">All Admission Stages ({applicants.length})</option>
                            {(Object.keys(STAGE_CONFIG) as AdmissionStage[]).map(stageKey => (
                                <option key={stageKey} value={stageKey}>
                                    {STAGE_CONFIG[stageKey].label}
                                </option>
                            ))}
                        </select>

                        {/* Program Filter */}
                        <select
                            className="filter-select"
                            value={programFilter}
                            onChange={e => setProgramFilter(e.target.value)}
                        >
                            <option value="ALL">All Degree Programs</option>
                            {availableCourses.map(c => (
                                <option key={c.id || c.code} value={c.name}>
                                    {c.name} ({c.code})
                                </option>
                            ))}
                        </select>

                        {/* Delivery Mode Filter */}
                        <select
                            className="filter-select"
                            value={modeFilter}
                            onChange={e => setModeFilter(e.target.value)}
                        >
                            <option value="ALL">All Delivery Modes</option>
                            <option value="Modular Field Cohort">Modular Field Cohort</option>
                            <option value="Hybrid Cloud / Offline Sync">Hybrid Cloud / Offline Sync</option>
                            <option value="Weekend Intensive">Weekend Intensive</option>
                            <option value="Online Distance Learning">Online Distance Learning</option>
                            <option value="On-Campus Resident">On-Campus Resident</option>
                        </select>

                        {/* Applicant Type Filter */}
                        <select
                            className="filter-select"
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                        >
                            <option value="ALL">All Applicant Types</option>
                            <option value="Freshman">Freshman / 1st Year</option>
                            <option value="Transferee">Transferee</option>
                            <option value="Graduate / Seminary">Graduate / Seminary</option>
                            <option value="Second Degree / Returnee">Second Degree</option>
                        </select>

                        {/* View Switcher */}
                        <div className="view-toggle">
                            <button
                                type="button"
                                className={viewMode === "table" ? "active" : ""}
                                onClick={() => setViewMode("table")}
                                title="Tabular View"
                            >
                                ☷
                            </button>
                            <button
                                type="button"
                                className={viewMode === "cards" ? "active" : ""}
                                onClick={() => setViewMode("cards")}
                                title="Applicant Cards View"
                            >
                                ▦
                            </button>
                        </div>
                    </div>

                    {/* Results Counter Bar */}
                    <div className="results-header admissions-results-header">
                        <div>
                            <strong>Admissions Records</strong>
                            <span> — Showing {filteredApplicants.length} of {applicants.length} registered applicant dossiers</span>
                        </div>
                        {stageFilter !== "ALL" && (
                            <button
                                type="button"
                                className="reset-filter-link"
                                onClick={() => setStageFilter("ALL")}
                            >
                                Reset Stage Filter
                            </button>
                        )}
                    </div>

                    {/* ==================================================
                        VIEW 1: TABULAR ADMISSIONS MASTERLIST
                    ================================================== */}
                    {viewMode === "table" && (
                        <div className="table-responsive">
                            <table className="visitors-table admissions-master-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "120px" }}>APPLICANT ID</th>
                                        <th>APPLICANT LEGAL NAME & CONTACT</th>
                                        <th style={{ width: "230px" }}>INTENDED DEGREE PROGRAM</th>
                                        <th style={{ width: "140px" }}>DOCUMENTS</th>
                                        <th style={{ width: "130px" }}>EXAM / SCREENING</th>
                                        <th style={{ width: "160px" }}>ADMISSION STAGE</th>
                                        <th style={{ width: "180px", textAlign: "right" }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredApplicants.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="empty-table-cell">
                                                <div className="empty-state-box">
                                                    <FileText size={36} className="empty-icon" />
                                                    <h4>No admissions applications match your search or filters.</h4>
                                                    <p>Try clearing filters or click below to submit a new student application.</p>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        onClick={handleOpenAddModal}
                                                    >
                                                        + File Admission Application
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredApplicants.map(applicant => {
                                            const stageConf = STAGE_CONFIG[applicant.admissionStage];
                                            const docs = applicant.meta.documents || {};
                                            const clearedDocsCount = Object.values(docs).filter(Boolean).length;

                                            return (
                                                <tr key={applicant.applicantId} className="applicant-row">
                                                    <td>
                                                        <div className="code-pill-wrapper">
                                                            <span className="applicant-code-pill" onClick={e => handleCopyCode(applicant.applicantCode, e)}>
                                                                {applicant.applicantCode}
                                                            </span>
                                                        </div>
                                                        <span className="app-date-sub">{applicant.applicationDate}</span>
                                                    </td>

                                                    <td>
                                                        <div className="applicant-profile-cell">
                                                            <div className="applicant-avatar">
                                                                {applicant.firstName.charAt(0)}{applicant.lastName.charAt(0)}
                                                            </div>
                                                            <div className="applicant-details">
                                                                <strong className="applicant-full-name">{applicant.fullName}</strong>
                                                                <div className="applicant-meta-line">
                                                                    <span>{applicant.gender}</span>
                                                                    {applicant.birthDate && (
                                                                        <span>• DOB: {applicant.birthDate.split("T")[0]}</span>
                                                                    )}
                                                                </div>
                                                                <div className="applicant-contact-line">
                                                                    {applicant.contactNumber && (
                                                                        <span><Phone size={11} /> {applicant.contactNumber}</span>
                                                                    )}
                                                                    {applicant.meta.email && (
                                                                        <span><Mail size={11} /> {applicant.meta.email}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="program-cell">
                                                            <strong className="program-title">{applicant.program}</strong>
                                                            <span className="delivery-mode-tag">
                                                                <Layers size={10} />
                                                                {applicant.meta.modeOfLearning || "Modular Field Cohort"}
                                                            </span>
                                                            <span className="applicant-type-tag">
                                                                {applicant.meta.applicantType || "Freshman"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="credentials-summary-cell">
                                                            <div className="credentials-pills-row">
                                                                <span className={`doc-chip ${docs.tor ? "cleared" : "pending"}`} title="Official TOR / Form 138">
                                                                    TOR
                                                                </span>
                                                                <span className={`doc-chip ${docs.birthCert ? "cleared" : "pending"}`} title="PSA Birth Certificate">
                                                                    PSA
                                                                </span>
                                                                <span className={`doc-chip ${docs.goodMoral ? "cleared" : "pending"}`} title="Good Moral Certificate">
                                                                    GMC
                                                                </span>
                                                                <span className={`doc-chip ${docs.recommendationLetter ? "cleared" : "pending"}`} title="Pastor Recommendation">
                                                                    REC
                                                                </span>
                                                            </div>
                                                            <small className="docs-ratio-text">{clearedDocsCount} of 6 Cleared</small>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="screening-cell">
                                                            {applicant.meta.examScore ? (
                                                                <>
                                                                    <strong className="exam-score-text">Rating: {applicant.meta.examScore}</strong>
                                                                    <span className="interview-rating-sub">
                                                                        {applicant.meta.interviewRating || "Interview Cleared"}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="exam-pending-pill">
                                                                    <Clock size={11} /> Pending Test
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="admission-stage-cell">
                                                            <span
                                                                className="stage-badge"
                                                                style={{
                                                                    backgroundColor: `${stageConf.color}15`,
                                                                    color: stageConf.color,
                                                                    borderColor: `${stageConf.color}40`
                                                                }}
                                                            >
                                                                <span className="stage-dot" style={{ backgroundColor: stageConf.color }} />
                                                                {stageConf.label}
                                                            </span>
                                                            {applicant.isMatriculated && (
                                                                <span className="matriculated-sub-tag">
                                                                    <CheckCircle2 size={10} /> Enrolled
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td style={{ textAlign: "right" }}>
                                                        <div className="action-buttons-group">
                                                            <button
                                                                type="button"
                                                                className="action-icon-btn btn-view"
                                                                onClick={() => handleOpenDossierModal(applicant)}
                                                                title="View Full Applicant Dossier"
                                                            >
                                                                <Eye size={14} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="action-icon-btn btn-edit"
                                                                onClick={() => handleOpenEditModal(applicant)}
                                                                title="Update Stage & Review Details"
                                                            >
                                                                <Edit3 size={14} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="action-icon-btn btn-print"
                                                                onClick={() => handlePrintAcceptanceLetter(applicant)}
                                                                title="Print Official Acceptance Letter"
                                                            >
                                                                <Printer size={14} />
                                                            </button>

                                                            {!applicant.isMatriculated ? (
                                                                <button
                                                                    type="button"
                                                                    className="btn-matriculate-mini"
                                                                    onClick={() => handleMatriculateApplicant(applicant)}
                                                                    title="Matriculate as Official Student"
                                                                >
                                                                    <GraduationCap size={13} />
                                                                    <span>Enrol</span>
                                                                </button>
                                                            ) : (
                                                                <span className="enrolled-check-badge" title="Already Matriculated in Student Registry">
                                                                    <Check size={12} />
                                                                </span>
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
                    )}

                    {/* ==================================================
                        VIEW 2: APPLICANT DOSSIER CARDS GRID
                    ================================================== */}
                    {viewMode === "cards" && (
                        <div className="admissions-cards-grid">
                            {filteredApplicants.length === 0 ? (
                                <div className="empty-cards-state">
                                    <FileText size={42} className="empty-icon" />
                                    <h4>No applicant dossiers found matching the criteria.</h4>
                                </div>
                            ) : (
                                filteredApplicants.map(applicant => {
                                    const stageConf = STAGE_CONFIG[applicant.admissionStage];
                                    const docs = applicant.meta.documents || {};
                                    const clearedCount = Object.values(docs).filter(Boolean).length;

                                    return (
                                        <div key={applicant.applicantId} className="applicant-dossier-card">
                                            <div className="card-top-bar">
                                                <div className="applicant-code-tag">{applicant.applicantCode}</div>
                                                <span
                                                    className="card-stage-pill"
                                                    style={{
                                                        backgroundColor: `${stageConf.color}15`,
                                                        color: stageConf.color
                                                    }}
                                                >
                                                    {stageConf.label}
                                                </span>
                                            </div>

                                            <div className="card-profile-header">
                                                <div className="card-avatar">
                                                    {applicant.firstName.charAt(0)}{applicant.lastName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="card-name">{applicant.fullName}</h4>
                                                    <span className="card-sub">{applicant.gender} • Applied: {applicant.applicationDate}</span>
                                                </div>
                                            </div>

                                            <div className="card-program-box">
                                                <div className="card-program-title">{applicant.program}</div>
                                                <div className="card-tags-row">
                                                    <span className="card-tag">{applicant.meta.modeOfLearning}</span>
                                                    <span className="card-tag">{applicant.meta.applicantType}</span>
                                                </div>
                                            </div>

                                            {applicant.meta.previousSchool && (
                                                <div className="card-school-row">
                                                    <School size={12} />
                                                    <span>{applicant.meta.previousSchool} {applicant.meta.gwa ? `(GWA: ${applicant.meta.gwa})` : ""}</span>
                                                </div>
                                            )}

                                            <div className="card-documents-progress">
                                                <div className="progress-labels">
                                                    <span>Credentials Verified</span>
                                                    <strong>{clearedCount}/6 Cleared</strong>
                                                </div>
                                                <div className="progress-bar-track">
                                                    <div
                                                        className="progress-bar-fill"
                                                        style={{ width: `${(clearedCount / 6) * 100}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {applicant.meta.examScore && (
                                                <div className="card-exam-banner">
                                                    <Award size={13} className="award-icon" />
                                                    <span>Diagnostic Rating: <strong>{applicant.meta.examScore}</strong></span>
                                                </div>
                                            )}

                                            <div className="card-footer-actions">
                                                <button
                                                    type="button"
                                                    className="btn-card-secondary"
                                                    onClick={() => handleOpenDossierModal(applicant)}
                                                >
                                                    <Eye size={13} />
                                                    <span>Dossier</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn-card-secondary"
                                                    onClick={() => handlePrintAcceptanceLetter(applicant)}
                                                    title="Print Acceptance Letter"
                                                >
                                                    <Printer size={13} />
                                                </button>

                                                {!applicant.isMatriculated ? (
                                                    <button
                                                        type="button"
                                                        className="btn-card-primary"
                                                        onClick={() => handleMatriculateApplicant(applicant)}
                                                    >
                                                        <GraduationCap size={13} />
                                                        <span>Matriculate</span>
                                                    </button>
                                                ) : (
                                                    <span className="card-enrolled-pill">
                                                        <CheckCircle2 size={12} /> Matriculated
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </section>
            </div>

            {/* =========================================================
                MODAL 1: FILE NEW ADMISSION APPLICATION (Multi-Tab Intake)
            ========================================================= */}
            {showAddModal && (
                <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
                    <div className="modal modal-large admissions-form-modal">
                        <div className="modal-header">
                            <div className="modal-title-row">
                                <School size={20} className="modal-title-icon" />
                                <div>
                                    <h3>Office of Admissions • New Student Application</h3>
                                    <span className="modal-subtitle">Official Student Admissions & Enrollment Application Form</span>
                                </div>
                            </div>
                            <button type="button" className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
                        </div>

                        {/* Tabs header */}
                        <div className="form-tabs-bar">
                            <button
                                type="button"
                                className={`form-tab-btn ${activeAddTab === "profile" ? "active" : ""}`}
                                onClick={() => setActiveAddTab("profile")}
                            >
                                1. Personal & Contact
                            </button>
                            <button
                                type="button"
                                className={`form-tab-btn ${activeAddTab === "academics" ? "active" : ""}`}
                                onClick={() => setActiveAddTab("academics")}
                            >
                                2. Program Choice
                            </button>
                            <button
                                type="button"
                                className={`form-tab-btn ${activeAddTab === "documents" ? "active" : ""}`}
                                onClick={() => setActiveAddTab("documents")}
                            >
                                3. Credentials Checklist
                            </button>
                            <button
                                type="button"
                                className={`form-tab-btn ${activeAddTab === "decision" ? "active" : ""}`}
                                onClick={() => setActiveAddTab("decision")}
                            >
                                4. Screening & Stage
                            </button>
                        </div>

                        <form onSubmit={handleSaveNewApplication}>
                            <div className="modal-body admissions-modal-body">
                                {/* TAB 1: PERSONAL & CONTACT */}
                                {activeAddTab === "profile" && (
                                    <div className="form-tab-content">
                                        <div className="form-section-title">Legal Name & Demographic Data</div>
                                        <div className="form-grid-3">
                                            <div className="form-group">
                                                <label>FIRST NAME *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={applicantForm.firstName}
                                                    onChange={e => setApplicantForm({ ...applicantForm, firstName: e.target.value })}
                                                    placeholder="e.g. Timothy"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>MIDDLE NAME</label>
                                                <input
                                                    type="text"
                                                    value={applicantForm.middleName}
                                                    onChange={e => setApplicantForm({ ...applicantForm, middleName: e.target.value })}
                                                    placeholder="e.g. James"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>LAST NAME *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={applicantForm.lastName}
                                                    onChange={e => setApplicantForm({ ...applicantForm, lastName: e.target.value })}
                                                    placeholder="e.g. Alcantara"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-grid-3">
                                            <div className="form-group">
                                                <label>GENDER *</label>
                                                <select
                                                    value={applicantForm.gender}
                                                    onChange={e => setApplicantForm({ ...applicantForm, gender: e.target.value })}
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>DATE OF BIRTH *</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={applicantForm.birthDate}
                                                    onChange={e => setApplicantForm({ ...applicantForm, birthDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>CIVIL STATUS</label>
                                                <select
                                                    value={applicantForm.civilStatus}
                                                    onChange={e => setApplicantForm({ ...applicantForm, civilStatus: e.target.value })}
                                                >
                                                    <option value="Single">Single</option>
                                                    <option value="Married">Married</option>
                                                    <option value="Widowed">Widowed</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-section-title" style={{ marginTop: "16px" }}>Contact Information & Residence</div>
                                        <div className="form-grid-2">
                                            <div className="form-group">
                                                <label>MOBILE / TELEPHONE NUMBER *</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={applicantForm.contactNumber}
                                                    onChange={e => setApplicantForm({ ...applicantForm, contactNumber: e.target.value })}
                                                    placeholder="e.g. +63 917 555 0199"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>EMAIL ADDRESS</label>
                                                <input
                                                    type="email"
                                                    value={applicantForm.email}
                                                    onChange={e => setApplicantForm({ ...applicantForm, email: e.target.value })}
                                                    placeholder="e.g. t.alcantara@email.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>PERMANENT RESIDENTIAL ADDRESS *</label>
                                            <input
                                                type="text"
                                                required
                                                value={applicantForm.address}
                                                onChange={e => setApplicantForm({ ...applicantForm, address: e.target.value })}
                                                placeholder="House No., Street, Barangay, City / Municipality, Province"
                                            />
                                        </div>

                                        <div className="form-section-title" style={{ marginTop: "16px" }}>Parent / Guardian / Emergency Contact</div>
                                        <div className="form-grid-3">
                                            <div className="form-group">
                                                <label>GUARDIAN / SPONSOR FULL NAME</label>
                                                <input
                                                    type="text"
                                                    value={applicantForm.guardianName}
                                                    onChange={e => setApplicantForm({ ...applicantForm, guardianName: e.target.value })}
                                                    placeholder="e.g. Rev. Roberto Alcantara"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>GUARDIAN CONTACT NUMBER</label>
                                                <input
                                                    type="tel"
                                                    value={applicantForm.guardianContact}
                                                    onChange={e => setApplicantForm({ ...applicantForm, guardianContact: e.target.value })}
                                                    placeholder="e.g. +63 918 555 0200"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>RELATIONSHIP</label>
                                                <input
                                                    type="text"
                                                    value={applicantForm.guardianRelationship}
                                                    onChange={e => setApplicantForm({ ...applicantForm, guardianRelationship: e.target.value })}
                                                    placeholder="e.g. Father / Pastor / Sponsor"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: PROGRAM CHOICE */}
                                {activeAddTab === "academics" && (
                                    <div className="form-tab-content">
                                        <div className="form-section-title">Degree Program & Enrolment Preferences</div>
                                        <div className="form-group">
                                            <label>INTENDED DEGREE PROGRAM *</label>
                                            <select
                                                required
                                                value={applicantForm.program}
                                                onChange={e => {
                                                    const chosenProg = e.target.value;
                                                    const matchedCourse = availableCourses.find(c => c.name === chosenProg);
                                                    setApplicantForm({
                                                        ...applicantForm,
                                                        program: chosenProg,
                                                        modeOfLearning: matchedCourse?.modeOfLearning || applicantForm.modeOfLearning
                                                    });
                                                }}
                                            >
                                                {availableCourses.map(c => (
                                                    <option key={c.id || c.code} value={c.name}>
                                                        {c.name} ({c.code} • {c.degreeLevel})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-grid-2">
                                            <div className="form-group">
                                                <label>PREFERRED LEARNING DELIVERY MODE</label>
                                                <select
                                                    value={applicantForm.modeOfLearning}
                                                    onChange={e => setApplicantForm({ ...applicantForm, modeOfLearning: e.target.value })}
                                                >
                                                    <option value="Modular Field Cohort">Modular Field Cohort</option>
                                                    <option value="Hybrid Cloud / Offline Sync">Hybrid Cloud / Offline Sync</option>
                                                    <option value="Weekend Intensive">Weekend Intensive</option>
                                                    <option value="Online Distance Learning">Online Distance Learning</option>
                                                    <option value="On-Campus Resident">On-Campus Resident</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>APPLICANT CLASSIFICATION</label>
                                                <select
                                                    value={applicantForm.applicantType}
                                                    onChange={e => setApplicantForm({ ...applicantForm, applicantType: e.target.value as any })}
                                                >
                                                    <option value="Freshman">Incoming Freshman / 1st Year College</option>
                                                    <option value="Transferee">Transferee from Another Institution</option>
                                                    <option value="Graduate / Seminary">Graduate Seminary / Post-Baccalaureate</option>
                                                    <option value="Second Degree / Returnee">Second Degree / Returnee</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-section-title" style={{ marginTop: "16px" }}>Previous Academic Background</div>
                                        <div className="form-grid-2">
                                            <div className="form-group">
                                                <label>PREVIOUS SCHOOL ATTENDED / HIGH SCHOOL ALMA MATER</label>
                                                <input
                                                    type="text"
                                                    value={applicantForm.previousSchool}
                                                    onChange={e => setApplicantForm({ ...applicantForm, previousSchool: e.target.value })}
                                                    placeholder="e.g. Berean Christian High School or University of the East"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>LAST GWA / GPA / ACADEMIC TRACK</label>
                                                <input
                                                    type="text"
                                                    value={applicantForm.gwa}
                                                    onChange={e => setApplicantForm({ ...applicantForm, gwa: e.target.value })}
                                                    placeholder="e.g. 91.5% (GAS Track) or 1.50 GPA"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: CREDENTIALS CHECKLIST */}
                                {activeAddTab === "documents" && (
                                    <div className="form-tab-content">
                                        <div className="form-section-title">Submitted Admission Credentials & Requirements</div>
                                        <p className="tab-instructions">
                                            Check the official documents already submitted by the applicant for admissions board verification.
                                        </p>

                                        <div className="credentials-checklist-grid">
                                            {[
                                                { key: "tor", label: "Official Transcript of Records (TOR) / Form 137 / 138 / Senior High Card" },
                                                { key: "birthCert", label: "PSA Authenticated Birth Certificate (Original Copy)" },
                                                { key: "goodMoral", label: "Certificate of Good Moral Character from School Head" },
                                                { key: "recommendationLetter", label: "Pastoral or Christian Leader Recommendation Letter" },
                                                { key: "statementOfFaith", label: "Personal Testimony & Statement of Faith / Calling" },
                                                { key: "idPhotos", label: "2x2 Official Colored ID Photographs (White Background)" },
                                                { key: "medicalCert", label: "Medical Examination / Health Clearance" },
                                            ].map(item => {
                                                const isChecked = (applicantForm.documents as any)[item.key];
                                                return (
                                                    <div
                                                        key={item.key}
                                                        className={`checklist-item ${isChecked ? "checked" : ""}`}
                                                        onClick={() => {
                                                            setApplicantForm({
                                                                ...applicantForm,
                                                                documents: {
                                                                    ...applicantForm.documents,
                                                                    [item.key]: !isChecked
                                                                }
                                                            });
                                                        }}
                                                    >
                                                        <div className="item-checkbox">
                                                            {isChecked ? <CheckSquare size={18} className="icon-checked" /> : <Square size={18} />}
                                                        </div>
                                                        <span className="item-label">{item.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* TAB 4: SCREENING & INITIAL STAGE */}
                                {activeAddTab === "decision" && (
                                    <div className="form-tab-content">
                                        <div className="form-section-title">Initial Admissions Committee Evaluation & Stage</div>
                                        <div className="form-grid-2">
                                            <div className="form-group">
                                                <label>INITIAL ADMISSION STAGE *</label>
                                                <select
                                                    value={applicantForm.admissionStage}
                                                    onChange={e => setApplicantForm({ ...applicantForm, admissionStage: e.target.value as any })}
                                                >
                                                    <option value="APPLICATION_FILED">Stage 1: Application Filed (Intake)</option>
                                                    <option value="DOCUMENT_REVIEW">Stage 2: Document Verification</option>
                                                    <option value="EXAM_INTERVIEW">Stage 3: Exam & Interview Scheduled</option>
                                                    <option value="OFFICIALLY_ADMITTED">Stage 4: Officially Admitted (Approved)</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>ENTRANCE DIAGNOSTIC EXAM SCORE (IF CONDUCTED)</label>
                                                <input
                                                    type="text"
                                                    value={applicantForm.examScore}
                                                    onChange={e => setApplicantForm({ ...applicantForm, examScore: e.target.value })}
                                                    placeholder="e.g. 88.5% or Passed with High Honors"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-grid-2">
                                            <div className="form-group">
                                                <label>INTERVIEWING PROFESSOR / EVALUATOR</label>
                                                <input
                                                    type="text"
                                                    value={applicantForm.interviewerName}
                                                    onChange={e => setApplicantForm({ ...applicantForm, interviewerName: e.target.value })}
                                                    placeholder="e.g. Rev. Dr. Rhoderick De Vera, Th.D."
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>INTERVIEW PANEL RATING</label>
                                                <input
                                                    type="text"
                                                    value={applicantForm.interviewRating}
                                                    onChange={e => setApplicantForm({ ...applicantForm, interviewRating: e.target.value })}
                                                    placeholder="e.g. Highly Recommended / Excellent Calling"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>ADMISSIONS BOARD EVALUATION REMARKS & NOTES</label>
                                            <textarea
                                                rows={3}
                                                value={applicantForm.generalRemarks}
                                                onChange={e => setApplicantForm({ ...applicantForm, generalRemarks: e.target.value })}
                                                placeholder="Enter notes on candidate's spiritual maturity, academic strengths, and prerequisite compliance..."
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer admissions-modal-footer">
                                <div className="footer-tab-nav">
                                    {activeAddTab !== "profile" && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                if (activeAddTab === "decision") setActiveAddTab("documents");
                                                else if (activeAddTab === "documents") setActiveAddTab("academics");
                                                else if (activeAddTab === "academics") setActiveAddTab("profile");
                                            }}
                                        >
                                            ← Previous Step
                                        </button>
                                    )}
                                    {activeAddTab !== "decision" && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                if (activeAddTab === "profile") setActiveAddTab("academics");
                                                else if (activeAddTab === "academics") setActiveAddTab("documents");
                                                else if (activeAddTab === "documents") setActiveAddTab("decision");
                                            }}
                                        >
                                            Next Step →
                                        </button>
                                    )}
                                </div>

                                <div className="footer-submit-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        <Check size={16} />
                                        <span>{saving ? "Submitting Application..." : "Submit Application Dossier"}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================
                MODAL 2: FULL APPLICANT DOSSIER VIEWER
            ========================================================= */}
            {showDossierModal && selectedApplicant && (
                <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowDossierModal(false); }}>
                    <div className="modal modal-large admissions-dossier-modal">
                        <div className="modal-header dossier-header">
                            <div className="dossier-header-profile">
                                <div className="dossier-avatar">
                                    {selectedApplicant.firstName.charAt(0)}{selectedApplicant.lastName.charAt(0)}
                                </div>
                                <div>
                                    <div className="dossier-title-row">
                                        <h3>{selectedApplicant.fullName}</h3>
                                        <span className="dossier-code-badge">{selectedApplicant.applicantCode}</span>
                                        <span className="dossier-stage-badge" style={{ backgroundColor: STAGE_CONFIG[selectedApplicant.admissionStage].color }}>
                                            {STAGE_CONFIG[selectedApplicant.admissionStage].label}
                                        </span>
                                    </div>
                                    <p className="dossier-subtitle">
                                        {selectedApplicant.program} • {selectedApplicant.meta.modeOfLearning}
                                    </p>
                                </div>
                            </div>
                            <button type="button" className="modal-close" onClick={() => setShowDossierModal(false)}>×</button>
                        </div>

                        <div className="modal-body dossier-body">
                            {/* Section 1: Overview Grid */}
                            <div className="dossier-grid-2">
                                <div className="dossier-card">
                                    <h5 className="dossier-card-title"><User size={14} /> Personal & Contact Profile</h5>
                                    <div className="info-item-row"><span className="lbl">Gender & Civil Status:</span><strong>{selectedApplicant.gender} • {selectedApplicant.meta.civilStatus || "Single"}</strong></div>
                                    <div className="info-item-row"><span className="lbl">Date of Birth:</span><strong>{selectedApplicant.birthDate ? selectedApplicant.birthDate.split("T")[0] : "N/A"}</strong></div>
                                    <div className="info-item-row"><span className="lbl">Mobile Number:</span><strong>{selectedApplicant.contactNumber || "N/A"}</strong></div>
                                    <div className="info-item-row"><span className="lbl">Email Address:</span><strong>{selectedApplicant.meta.email || "N/A"}</strong></div>
                                    <div className="info-item-row"><span className="lbl">Residential Address:</span><strong>{selectedApplicant.address || "N/A"}</strong></div>
                                    <div className="info-item-row"><span className="lbl">Emergency Contact:</span><strong>{selectedApplicant.meta.guardianName || "N/A"} ({selectedApplicant.meta.guardianContact || "N/A"})</strong></div>
                                </div>

                                <div className="dossier-card">
                                    <h5 className="dossier-card-title"><School size={14} /> Academic Selection & Background</h5>
                                    <div className="info-item-row"><span className="lbl">Admitted Program:</span><strong className="text-primary">{selectedApplicant.program}</strong></div>
                                    <div className="info-item-row"><span className="lbl">Delivery Mode:</span><strong>{selectedApplicant.meta.modeOfLearning}</strong></div>
                                    <div className="info-item-row"><span className="lbl">Applicant Type:</span><strong>{selectedApplicant.meta.applicantType}</strong></div>
                                    <div className="info-item-row"><span className="lbl">Previous School:</span><strong>{selectedApplicant.meta.previousSchool || "N/A"}</strong></div>
                                    <div className="info-item-row"><span className="lbl">GWA / Academic Rating:</span><strong>{selectedApplicant.meta.gwa || "N/A"}</strong></div>
                                    <div className="info-item-row"><span className="lbl">Term of Admission:</span><strong>{selectedApplicant.meta.applicationTerm || "1st Sem A.Y. 2026-2027"}</strong></div>
                                </div>
                            </div>

                            {/* Section 2: Credentials Checklist */}
                            <div className="dossier-card" style={{ marginTop: "14px" }}>
                                <h5 className="dossier-card-title"><FileCheck size={14} /> Verified Admission Credentials</h5>
                                <div className="dossier-credentials-pills">
                                    {[
                                        { key: "tor", label: "Official Transcript (TOR) / Form 138" },
                                        { key: "birthCert", label: "PSA Birth Certificate" },
                                        { key: "goodMoral", label: "Good Moral Certificate" },
                                        { key: "recommendationLetter", label: "Pastoral Recommendation" },
                                        { key: "statementOfFaith", label: "Statement of Faith / Calling" },
                                        { key: "idPhotos", label: "2x2 Identification Photos" },
                                        { key: "medicalCert", label: "Medical Health Clearance" },
                                    ].map(item => {
                                        const isCleared = (selectedApplicant.meta.documents as any)?.[item.key];
                                        return (
                                            <div key={item.key} className={`dossier-cred-chip ${isCleared ? "cleared" : "pending"}`}>
                                                {isCleared ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                                                <span>{item.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Section 3: Screening & Evaluation */}
                            <div className="dossier-card" style={{ marginTop: "14px" }}>
                                <h5 className="dossier-card-title"><Award size={14} /> Admissions Examination & Panel Interview</h5>
                                <div className="dossier-grid-2">
                                    <div>
                                        <div className="info-item-row"><span className="lbl">Diagnostic Exam Score:</span><strong>{selectedApplicant.meta.examScore || "Pending Evaluation"}</strong></div>
                                        <div className="info-item-row"><span className="lbl">Faculty Interviewer:</span><strong>{selectedApplicant.meta.interviewerName || "Board of Admissions"}</strong></div>
                                    </div>
                                    <div>
                                        <div className="info-item-row"><span className="lbl">Interview Result:</span><strong>{selectedApplicant.meta.interviewRating || "Cleared"}</strong></div>
                                        <div className="info-item-row"><span className="lbl">Matriculation Status:</span><strong style={{ color: selectedApplicant.isMatriculated ? "#16a34a" : "#d97706" }}>{selectedApplicant.isMatriculated ? "Officially Matriculated" : "Awaiting Matriculation"}</strong></div>
                                    </div>
                                </div>
                                {selectedApplicant.meta.generalRemarks && (
                                    <div className="dossier-remarks-box">
                                        <span className="lbl">Admissions Board Notes:</span>
                                        <p>{selectedApplicant.meta.generalRemarks}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer dossier-footer">
                            <div className="dossier-footer-left">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => handlePrintAcceptanceLetter(selectedApplicant)}
                                >
                                    <Printer size={15} />
                                    <span>Print Letter of Acceptance</span>
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowDossierModal(false);
                                        handleOpenScreeningModal(selectedApplicant);
                                    }}
                                >
                                    <Award size={15} />
                                    <span>Log Screening Assessment</span>
                                </button>
                            </div>

                            <div className="dossier-footer-right">
                                {!selectedApplicant.isMatriculated && (
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-matriculate-large"
                                        onClick={() => {
                                            setShowDossierModal(false);
                                            handleMatriculateApplicant(selectedApplicant);
                                        }}
                                    >
                                        <GraduationCap size={16} />
                                        <span>Matriculate / Enrol Student</span>
                                    </button>
                                )}
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDossierModal(false)}>
                                    Close Dossier
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================
                MODAL 3: UPDATE ADMISSION STAGE & CREDENTIALS
            ========================================================= */}
            {showEditModal && selectedApplicant && (
                <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
                    <div className="modal modal-medium admissions-stage-modal">
                        <div className="modal-header">
                            <div className="modal-title-row">
                                <Edit3 size={18} className="modal-title-icon" />
                                <div>
                                    <h3>Update Admissions Decision & Stage</h3>
                                    <span className="modal-subtitle">
                                        Applicant: <strong>{selectedApplicant.fullName}</strong> ({selectedApplicant.applicantCode})
                                    </span>
                                </div>
                            </div>
                            <button type="button" className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleUpdateApplication}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>ADMISSION STAGE & SELECTION STATUS *</label>
                                    <select
                                        value={applicantForm.admissionStage}
                                        onChange={e => setApplicantForm({ ...applicantForm, admissionStage: e.target.value as any })}
                                    >
                                        <option value="APPLICATION_FILED">Stage 1: Application Filed</option>
                                        <option value="DOCUMENT_REVIEW">Stage 2: Document Verification</option>
                                        <option value="EXAM_INTERVIEW">Stage 3: Exam & Interview Scheduled</option>
                                        <option value="OFFICIALLY_ADMITTED">Stage 4: Officially Admitted (Acceptance Letter Issued)</option>
                                        <option value="ENROLLED">Stage 5: Matriculated & Enrolled</option>
                                    </select>
                                </div>

                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>ENTRANCE EXAM SCORE</label>
                                        <input
                                            type="text"
                                            value={applicantForm.examScore}
                                            onChange={e => setApplicantForm({ ...applicantForm, examScore: e.target.value })}
                                            placeholder="e.g. 90.0%"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>PANEL INTERVIEW RATING</label>
                                        <input
                                            type="text"
                                            value={applicantForm.interviewRating}
                                            onChange={e => setApplicantForm({ ...applicantForm, interviewRating: e.target.value })}
                                            placeholder="e.g. Cleared / Recommended"
                                        />
                                    </div>
                                </div>

                                <div className="form-section-title" style={{ marginTop: "12px", fontSize: "12px" }}>Credentials Clearance Check</div>
                                <div className="credentials-checklist-mini">
                                    {[
                                        { key: "tor", label: "TOR / Form 138" },
                                        { key: "birthCert", label: "PSA Birth Cert" },
                                        { key: "goodMoral", label: "Good Moral" },
                                        { key: "recommendationLetter", label: "Pastor Recommendation" },
                                    ].map(item => {
                                        const isChecked = (applicantForm.documents as any)[item.key];
                                        return (
                                            <label key={item.key} className="checkbox-label-mini">
                                                <input
                                                    type="checkbox"
                                                    checked={!!isChecked}
                                                    onChange={e => {
                                                        setApplicantForm({
                                                            ...applicantForm,
                                                            documents: {
                                                                ...applicantForm.documents,
                                                                [item.key]: e.target.checked
                                                            }
                                                        });
                                                    }}
                                                />
                                                <span>{item.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>

                                <div className="form-group" style={{ marginTop: "12px" }}>
                                    <label>ADMISSIONS COMMITTEE DECISION NOTES</label>
                                    <textarea
                                        rows={3}
                                        value={applicantForm.generalRemarks}
                                        onChange={e => setApplicantForm({ ...applicantForm, generalRemarks: e.target.value })}
                                        placeholder="Enter decision remarks, conditions for enrollment, or scholarship grant details..."
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    <Check size={16} />
                                    <span>{saving ? "Saving Changes..." : "Save Admissions Decision"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================
                MODAL 4: RECORD ENTRANCE EXAM / SCREENING SESSION
            ========================================================= */}
            {showScreeningModal && selectedApplicant && (
                <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowScreeningModal(false); }}>
                    <div className="modal modal-medium admissions-screening-modal">
                        <div className="modal-header">
                            <div className="modal-title-row">
                                <Award size={18} className="modal-title-icon" />
                                <div>
                                    <h3>Log Admissions Screening Assessment</h3>
                                    <span className="modal-subtitle">
                                        Candidate: <strong>{selectedApplicant.fullName}</strong> ({selectedApplicant.program})
                                    </span>
                                </div>
                            </div>
                            <button type="button" className="modal-close" onClick={() => setShowScreeningModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleSaveScreening}>
                            <div className="modal-body">
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>ASSESSMENT CATEGORY *</label>
                                        <select
                                            value={screeningForm.category}
                                            onChange={e => setScreeningForm({ ...screeningForm, category: e.target.value })}
                                        >
                                            <option value="Entrance Diagnostic Exam">Entrance Diagnostic Exam</option>
                                            <option value="Faculty & Dean Panel Interview">Faculty & Dean Panel Interview</option>
                                            <option value="Pastoral Aptitude & Calling Screening">Pastoral Aptitude Screening</option>
                                            <option value="Document Credentials Evaluation">Credentials Review Session</option>
                                            <option value="Campus Orientation & Consultation">Campus Orientation & Tour</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>ASSESSMENT DATE *</label>
                                        <input
                                            type="date"
                                            required
                                            value={screeningForm.sessionDate}
                                            onChange={e => setScreeningForm({ ...screeningForm, sessionDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>DIAGNOSTIC SCORE / RATING *</label>
                                        <input
                                            type="text"
                                            required
                                            value={screeningForm.scoreRating}
                                            onChange={e => setScreeningForm({ ...screeningForm, scoreRating: e.target.value })}
                                            placeholder="e.g. 92% or Passed with High Honors"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>EXAMINER / INTERVIEWING PROFESSOR</label>
                                        <input
                                            type="text"
                                            required
                                            value={screeningForm.evaluator}
                                            onChange={e => setScreeningForm({ ...screeningForm, evaluator: e.target.value })}
                                            placeholder="e.g. Rev. Dr. Rhoderick De Vera, Th.D."
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>EVALUATION RESULT / RECOMMENDATION</label>
                                    <select
                                        value={screeningForm.result}
                                        onChange={e => setScreeningForm({ ...screeningForm, result: e.target.value })}
                                    >
                                        <option value="Passed - Recommended for Admission">Passed - Recommended for Immediate Admission</option>
                                        <option value="Passed - Conditional Acceptance">Passed - Conditional Acceptance</option>
                                        <option value="Scheduled for Re-interview">Scheduled for Re-interview</option>
                                        <option value="Ineligible / Disqualified">Ineligible / Disqualified</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>ADVANCE ADMISSION STAGE UPON SAVING</label>
                                    <select
                                        value={screeningForm.advanceStageTo}
                                        onChange={e => setScreeningForm({ ...screeningForm, advanceStageTo: e.target.value as any })}
                                    >
                                        <option value="EXAM_INTERVIEW">Stage 3: Exam & Interview Scheduled</option>
                                        <option value="OFFICIALLY_ADMITTED">Stage 4: Move Directly to Officially Admitted</option>
                                        <option value={selectedApplicant.admissionStage}>Keep Current Stage ({STAGE_CONFIG[selectedApplicant.admissionStage].label})</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>FACULTY OBSERVATIONS & COMMENTS</label>
                                    <textarea
                                        rows={3}
                                        value={screeningForm.notes}
                                        onChange={e => setScreeningForm({ ...screeningForm, notes: e.target.value })}
                                        placeholder="Record details on theological understanding, academic background, and recommendations..."
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowScreeningModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    <Check size={16} />
                                    <span>{saving ? "Logging Assessment..." : "Log Screening Assessment"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
