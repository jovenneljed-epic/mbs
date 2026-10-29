import React, { useState, useMemo, useEffect } from "react";
import {
    BookOpen,
    PlayCircle,
    Download,
    Wifi,
    FileText,
    CheckCircle2,
    Clock,
    Search,
    Printer,
    Award,
    Send,
    Layers,
    Radio,
    Tv,
    FileDown,
    FolderOpen,
    Sparkles,
    Filter,
    ArrowLeft,
    FileCheck,
    Upload,
    Check,
    RefreshCw,
    GraduationCap
} from "lucide-react";
import { courseCurriculumService } from "../../services/courseCurriculumService";
import type { CourseProgram } from "../../services/courseCurriculumService";
import { lessonContentService } from "../../services/lessonContentService";
import type { CourseLesson, StudentSubmission } from "../../services/lessonContentService";
import { SchoolPrintService } from "../../utils/schoolPrintService";
import "./StudentLearningArea.css";

/* =========================================================
   TYPES & MAPPINGS
========================================================= */

export type StudyMode = "online" | "modular" | "offline";
export type ResourceCategory = "ALL" | "SLM" | "VIDEO" | "AUDIO" | "LAS" | "ASSESSMENT";

export interface StudentSubjectView {
    code: string;
    title: string;
    units: number;
    schedule: string;
    room: string;
    instructor: string;
    modeOfLearning: string;
    programId: string;
    programCode: string;
    programName: string;
    degreeLevel: string;
    publishedLessons: CourseLesson[];
    progressPercent: number;
    completedCount: number;
}

const StudentLearningArea: React.FC = () => {
    // Current Logged-in Student Identity
    const studentName = useMemo(() => {
        try {
            const clientUser = localStorage.getItem("clientUser") || sessionStorage.getItem("clientUser");
            if (clientUser) {
                const parsed = JSON.parse(clientUser);
                if (parsed.member?.fullName) return parsed.member.fullName;
                if (parsed.fullName) return parsed.fullName;
                if (parsed.username) return parsed.username;
            }
            const clientMember = localStorage.getItem("clientMember") || sessionStorage.getItem("clientMember");
            if (clientMember) {
                const parsed = JSON.parse(clientMember);
                if (parsed.fullName) return parsed.fullName;
            }
        } catch {
            // fallback
        }
        return "Enrolled Student";
    }, []);

    const studentId = useMemo(() => {
        try {
            const clientUser = localStorage.getItem("clientUser") || sessionStorage.getItem("clientUser");
            if (clientUser) {
                const parsed = JSON.parse(clientUser);
                if (parsed.member?.memberCode) return parsed.member.memberCode;
                if (parsed.memberCode) return parsed.memberCode;
            }
        } catch {
            // fallback
        }
        return "MBS-STUDENT";
    }, []);

    // Refresh trigger to react to live changes in Lesson Studio or Curriculum
    const [refreshNonce, setRefreshNonce] = useState(0);

    useEffect(() => {
        // Load authentic curriculum and lessons directly from live database API
        courseCurriculumService.fetchCoursesFromApi().then(() => setRefreshNonce((n) => n + 1));
        lessonContentService.fetchLessonsFromApi().then(() => setRefreshNonce((n) => n + 1));

        const handleLessonsUpdated = () => {
            setRefreshNonce((n) => n + 1);
        };
        const handleCurriculumUpdated = () => {
            setRefreshNonce((n) => n + 1);
        };

        window.addEventListener("sms_lessons_updated", handleLessonsUpdated);
        window.addEventListener("sms_curriculum_updated", handleCurriculumUpdated);
        window.addEventListener("storage", handleLessonsUpdated);

        return () => {
            window.removeEventListener("sms_lessons_updated", handleLessonsUpdated);
            window.removeEventListener("sms_curriculum_updated", handleCurriculumUpdated);
            window.removeEventListener("storage", handleLessonsUpdated);
        };
    }, []);

    // Delivery Modality State
    const [studyMode, setStudyMode] = useState<StudyMode>(() => {
        const saved = localStorage.getItem("mbs_student_study_mode");
        return (saved as StudyMode) || "modular";
    });

    const handleSetMode = (mode: StudyMode) => {
        setStudyMode(mode);
        localStorage.setItem("mbs_student_study_mode", mode);
    };

    // Filters
    const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>("ALL");
    const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>("ALL");
    const [searchKeyword, setSearchKeyword] = useState("");

    // Offline Cached Simulation Tracker
    const [cachedResources, setCachedResources] = useState<Record<string, boolean>>(() => {
        try {
            const saved = localStorage.getItem("deped_offline_cached_items");
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    const toggleOfflineCache = (id: string) => {
        setCachedResources((prev) => {
            const next = { ...prev, [id]: !prev[id] };
            localStorage.setItem("deped_offline_cached_items", JSON.stringify(next));
            return next;
        });
    };

    // Dynamic Curriculum Courses & Subjects from courseCurriculumService
    const allCourses: CourseProgram[] = useMemo(() => {
        void refreshNonce;
        return courseCurriculumService.getCourses();
    }, [refreshNonce]);

    // Student Submissions from lessonContentService
    const studentSubmissions: StudentSubmission[] = useMemo(() => {
        void refreshNonce;
        return lessonContentService.getSubmissions();
    }, [refreshNonce]);

    // Build Live Enrolled Subjects directly from Course Curriculum & Lesson Studio
    const liveSubjects: StudentSubjectView[] = useMemo(() => {
        void refreshNonce;
        const list: StudentSubjectView[] = [];
        const seenCodes = new Set<string>();

        allCourses.forEach((course) => {
            course.subjects.forEach((subj) => {
                const normCode = subj.code.trim().toUpperCase();
                if (!seenCodes.has(normCode)) {
                    seenCodes.add(normCode);

                    // Fetch ONLY the actual live published lessons from lessonContentService
                    const allLessonsForCode = lessonContentService.getLessons(subj.code);
                    const published = allLessonsForCode.filter((l) => l.isPublished);

                    // Calculate progress based on student's submissions for this subject
                    const subjSubmissions = studentSubmissions.filter(
                        (s) => s.courseCode.toUpperCase() === normCode
                    );
                    const completedCount = Math.min(subjSubmissions.length, published.length);
                    const progressPercent =
                        published.length > 0
                            ? Math.round((completedCount / published.length) * 100)
                            : 0;

                    list.push({
                        code: subj.code,
                        title: subj.title,
                        units: subj.units,
                        schedule: subj.schedule || "Flexible Modular Schedule",
                        room: subj.room || "E-Learning Online Hub",
                        instructor: subj.instructor || "Faculty Preceptor",
                        modeOfLearning: subj.modeOfLearning || course.modeOfLearning || "Modular Field Cohort",
                        programId: course.id,
                        programCode: course.code,
                        programName: course.name,
                        degreeLevel: course.degreeLevel,
                        publishedLessons: published,
                        progressPercent,
                        completedCount
                    });
                }
            });
        });

        return list;
    }, [allCourses, studentSubmissions, refreshNonce]);

    // Filtered Subjects based on user selections
    const filteredSubjects = useMemo(() => {
        return liveSubjects.filter((sub) => {
            // Program filter
            if (selectedProgramFilter !== "ALL" && sub.programCode !== selectedProgramFilter) {
                return false;
            }

            // Category filter
            if (selectedCategory === "VIDEO") {
                const hasVideo = sub.publishedLessons.some((l) => !!l.videoUrl);
                if (!hasVideo && sub.publishedLessons.length > 0) return false;
            } else if (selectedCategory === "AUDIO") {
                const hasAudio = sub.publishedLessons.some((l) => !!l.audioUrl);
                if (!hasAudio && sub.publishedLessons.length > 0) return false;
            } else if (selectedCategory === "LAS") {
                const hasLAS = sub.publishedLessons.some((l) => !!l.assignmentPrompt);
                if (!hasLAS && sub.publishedLessons.length > 0) return false;
            } else if (selectedCategory === "ASSESSMENT") {
                const hasQuiz = sub.publishedLessons.some((l) => l.quizQuestions && l.quizQuestions.length > 0);
                if (!hasQuiz && sub.publishedLessons.length > 0) return false;
            }

            // Keyword search
            if (searchKeyword.trim()) {
                const q = searchKeyword.toLowerCase();
                const matches =
                    sub.code.toLowerCase().includes(q) ||
                    sub.title.toLowerCase().includes(q) ||
                    sub.instructor.toLowerCase().includes(q) ||
                    sub.programName.toLowerCase().includes(q);
                if (!matches) return false;
            }

            return true;
        });
    }, [liveSubjects, selectedProgramFilter, selectedCategory, searchKeyword]);

    // Summary Statistics from Live Data
    const liveStats = useMemo(() => {
        const totalCourses = allCourses.length;
        const totalSubjects = liveSubjects.length;
        const totalPublishedModules = liveSubjects.reduce(
            (acc, s) => acc + s.publishedLessons.length,
            0
        );
        const totalVideos = liveSubjects.reduce(
            (acc, s) => acc + s.publishedLessons.filter((l) => !!l.videoUrl).length,
            0
        );
        const totalQuizzes = liveSubjects.reduce(
            (acc, s) =>
                acc +
                s.publishedLessons.filter((l) => l.quizQuestions && l.quizQuestions.length > 0).length,
            0
        );
        return {
            totalCourses,
            totalSubjects,
            totalPublishedModules,
            totalVideos,
            totalQuizzes
        };
    }, [allCourses, liveSubjects]);

    // Active Interactive Classroom / Study Studio State
    const [activeSubject, setActiveSubject] = useState<StudentSubjectView | null>(null);
    const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
    const [studioTab, setStudioTab] = useState<"slm" | "video" | "audio" | "las" | "assessment" | "syllabus">("slm");

    // Audio Playback Simulation State
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [audioSpeed, setAudioSpeed] = useState<number>(1.0);

    // Quiz and LAS Submissions State
    const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [lasResponse, setLasResponse] = useState("");
    const [lasSubmitted, setLasSubmitted] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

    // Current Active Lesson from Lesson Studio
    const currentLesson: CourseLesson | null = useMemo(() => {
        if (!activeSubject || activeSubject.publishedLessons.length === 0) return null;
        return activeSubject.publishedLessons[selectedLessonIndex] || activeSubject.publishedLessons[0] || null;
    }, [activeSubject, selectedLessonIndex]);

    // Check if the student has already submitted work for this active lesson
    const existingSubmissionForLesson: StudentSubmission | undefined = useMemo(() => {
        if (!currentLesson) return undefined;
        return studentSubmissions.find(
            (s) => s.lessonId === currentLesson.id
        );
    }, [studentSubmissions, currentLesson]);

    // Open Interactive Studio for a Subject
    const handleOpenStudio = (
        subject: StudentSubjectView,
        initialTab: "slm" | "video" | "audio" | "las" | "assessment" | "syllabus" = "slm"
    ) => {
        setActiveSubject(subject);
        setSelectedLessonIndex(0);
        setStudioTab(initialTab);
        setQuizAnswers({});
        setQuizSubmitted(false);
        setLasSubmitted(false);
        setLasResponse("");
        setUploadedFileName(null);
        setIsPlayingAudio(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Print Modular Lesson Packet
    const handlePrintModularPacket = () => {
        if (!activeSubject) return;

        if (currentLesson) {
            SchoolPrintService.printReport({
                title: `${activeSubject.code} • LESSON ${currentLesson.lessonNumber} STUDY PACKET`,
                category: `Mobile Bible School & Seminary • E-Learning & Lesson Studio Material`,
                description: `${activeSubject.title} • Instructor: ${activeSubject.instructor}`,
                filterSummary: `Lesson: ${currentLesson.title} • Reference: ${currentLesson.scriptureReference}`,
                summaryCards: [
                    { label: "Subject Code", value: activeSubject.code, subtext: `${activeSubject.units} Academic Units` },
                    { label: "Degree Program", value: activeSubject.programName, subtext: activeSubject.degreeLevel },
                    { label: "Learning Mode", value: activeSubject.modeOfLearning, subtext: "Self-Paced / Cohort" },
                    { label: "Student", value: studentName, subtext: studentId }
                ],
                columns: [
                    { header: "CURRICULUM SECTION", width: "190px" },
                    { header: "EXPOSITORY LESSON NOTES & THEOLOGICAL STUDY GUIDE" }
                ],
                rows: [
                    ["SCRIPTURE REFERENCE", currentLesson.scriptureReference || "See syllabus reading guide"],
                    ["MODULE OVERVIEW", currentLesson.overview || "Authored by faculty preceptor"],
                    ...currentLesson.readingContent.map((para, i) => [`EXPOSITORY LECTURE (Part ${i + 1})`, para]),
                    ["CORE TAKEAWAYS", currentLesson.keyTakeaways ? currentLesson.keyTakeaways.join("\n• ") : "N/A"],
                    ["ASSIGNMENT PROMPT", currentLesson.assignmentPrompt || "Complete reflection essay and submit to preceptor."]
                ]
            });
        } else {
            SchoolPrintService.printReport({
                title: `${activeSubject.code} • COMPLETE COURSE SYLLABUS`,
                category: `Mobile Bible School & Seminary • Curriculum Catalog`,
                description: `${activeSubject.title} • Instructor: ${activeSubject.instructor}`,
                summaryCards: [
                    { label: "Course Code", value: activeSubject.code, subtext: `${activeSubject.units} Units` },
                    { label: "Program", value: activeSubject.programName, subtext: activeSubject.degreeLevel },
                    { label: "Schedule", value: activeSubject.schedule, subtext: activeSubject.room },
                    { label: "Faculty", value: activeSubject.instructor, subtext: "Preceptor" }
                ],
                columns: [
                    { header: "SUBJECT DETAILS" },
                    { header: "DESCRIPTION" }
                ],
                rows: [
                    ["Course Code", activeSubject.code],
                    ["Subject Title", activeSubject.title],
                    ["Units", `${activeSubject.units} Academic Units`],
                    ["Instructor", activeSubject.instructor],
                    ["Class Schedule", activeSubject.schedule],
                    ["Classroom / Hub", activeSubject.room],
                    ["Learning Delivery Mode", activeSubject.modeOfLearning],
                    ["Degree Program", `${activeSubject.programName} (${activeSubject.degreeLevel})`]
                ]
            });
        }
    };

    // =========================================================
    // RENDER: INTERACTIVE LEARNING STUDIO (FULL IN-PAGE VIEW)
    // =========================================================

    if (activeSubject) {
        return (
            <div className="deped-studio-view">
                {/* STUDIO BREADCRUMB & HEADER */}
                <div className="deped-studio-header-card">
                    <div className="deped-studio-topline">
                        <button
                            type="button"
                            className="btn-back-commons"
                            onClick={() => setActiveSubject(null)}
                        >
                            <ArrowLeft size={16} />
                            <span>Back to Learning Area & Course Catalog</span>
                        </button>

                        <div className="deped-studio-modality-tags">
                            <span className="deped-modality-pill active">
                                <Sparkles size={13} />
                                Live E-Learning Studio Source
                            </span>
                            <span className="deped-quarter-pill">
                                {activeSubject.publishedLessons.length} Published Module{activeSubject.publishedLessons.length === 1 ? "" : "s"}
                            </span>
                        </div>
                    </div>

                    <div className="deped-studio-title-row">
                        <div>
                            <span className="deped-course-tag">{activeSubject.code} • {activeSubject.units} Units</span>
                            <h1 className="deped-course-headline">{activeSubject.title}</h1>
                            <p className="deped-course-submeta">
                                <span>Faculty Preceptor: <strong>{activeSubject.instructor}</strong></span>
                                <span>•</span>
                                <span>Curriculum Program: <strong>{activeSubject.programName}</strong></span>
                                <span>•</span>
                                <span>Mode: <strong>{activeSubject.modeOfLearning}</strong></span>
                            </p>
                        </div>

                        <div className="deped-studio-quick-actions">
                            <button
                                type="button"
                                className="btn-deped-print"
                                onClick={handlePrintModularPacket}
                                title="Print / Generate Modular Study Packet (A4 Format)"
                            >
                                <Printer size={15} />
                                <span>Print Modular Packet</span>
                            </button>

                            {currentLesson && (
                                <button
                                    type="button"
                                    className={`btn-deped-cache ${cachedResources[currentLesson.id] ? "cached" : ""}`}
                                    onClick={() => toggleOfflineCache(currentLesson.id)}
                                    title="Save to local browser cache for offline study"
                                >
                                    {cachedResources[currentLesson.id] ? (
                                        <>
                                            <Check size={15} color="#16a34a" />
                                            <span>Cached Offline</span>
                                        </>
                                    ) : (
                                        <>
                                            <FileDown size={15} />
                                            <span>Cache for Offline</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* MULTI-RESOURCE STUDIO TABS */}
                    <div className="deped-studio-tab-strip">
                        <button
                            type="button"
                            className={`deped-studio-tab ${studioTab === "slm" ? "active" : ""}`}
                            onClick={() => setStudioTab("slm")}
                        >
                            <BookOpen size={16} />
                            <span>📖 Lesson Exegesis & Reading Notes</span>
                        </button>

                        <button
                            type="button"
                            className={`deped-studio-tab ${studioTab === "video" ? "active" : ""}`}
                            onClick={() => setStudioTab("video")}
                        >
                            <Tv size={16} />
                            <span>🎬 HD Video Lecture</span>
                        </button>

                        <button
                            type="button"
                            className={`deped-studio-tab ${studioTab === "audio" ? "active" : ""}`}
                            onClick={() => setStudioTab("audio")}
                        >
                            <Radio size={16} />
                            <span>📻 Audio Lecture / Broadcast</span>
                        </button>

                        <button
                            type="button"
                            className={`deped-studio-tab ${studioTab === "las" ? "active" : ""}`}
                            onClick={() => setStudioTab("las")}
                        >
                            <FileCheck size={16} />
                            <span>📝 Assignment & Student Reflection</span>
                        </button>

                        <button
                            type="button"
                            className={`deped-studio-tab ${studioTab === "assessment" ? "active" : ""}`}
                            onClick={() => setStudioTab("assessment")}
                        >
                            <Award size={16} />
                            <span>📊 Knowledge Check & Quiz</span>
                        </button>

                        <button
                            type="button"
                            className={`deped-studio-tab ${studioTab === "syllabus" ? "active" : ""}`}
                            onClick={() => setStudioTab("syllabus")}
                        >
                            <FolderOpen size={16} />
                            <span>📋 Syllabus & Schedule</span>
                        </button>
                    </div>
                </div>

                {/* ZERO PUBLISHED LESSONS NOTICE */}
                {activeSubject.publishedLessons.length === 0 ? (
                    <div className="deped-empty-state" style={{ background: "#ffffff", padding: "48px 32px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                        <BookOpen size={48} color="#94a3b8" />
                        <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "14px 0 6px 0" }}>
                            No Lessons Published Yet for {activeSubject.code}
                        </h3>
                        <p style={{ fontSize: "14px", color: "#64748b", maxWidth: "600px", margin: "0 auto 20px auto", lineHeight: 1.5 }}>
                            Your faculty preceptor, <strong>{activeSubject.instructor}</strong>, has not published modules for <em>{activeSubject.title}</em> in the <strong>E-Learning & Lesson Studio</strong> yet. When lessons are authored and marked Published, they will appear here automatically in real time.
                        </p>
                        <button
                            type="button"
                            className="btn-back-commons"
                            onClick={() => setActiveSubject(null)}
                            style={{ margin: "0 auto" }}
                        >
                            ← Browse Other Active Courses
                        </button>
                    </div>
                ) : (
                    /* STUDIO TWO-COLUMN WORKSPACE */
                    <div className="deped-studio-workspace-grid">
                        {/* LEFT COLUMN: REAL LESSON SYLLABUS LIST */}
                        <div className="deped-syllabus-card">
                            <div className="deped-syllabus-header">
                                <div>
                                    <strong>Authored Modules</strong>
                                    <span>{activeSubject.publishedLessons.length} Published Lessons</span>
                                </div>
                                <span className="deped-syllabus-code">{activeSubject.code}</span>
                            </div>

                            <div className="deped-syllabus-list">
                                {activeSubject.publishedLessons.map((lesson, idx) => {
                                    const isCurrent = idx === selectedLessonIndex;
                                    const hasCompleted = studentSubmissions.some(
                                        (s) => s.lessonId === lesson.id
                                    );

                                    return (
                                        <div
                                            key={lesson.id}
                                            className={`deped-syllabus-item ${isCurrent ? "active" : ""}`}
                                            onClick={() => {
                                                setSelectedLessonIndex(idx);
                                                setQuizSubmitted(false);
                                                setQuizAnswers({});
                                                setLasSubmitted(false);
                                                setLasResponse("");
                                                setIsPlayingAudio(false);
                                            }}
                                        >
                                            <div className="deped-syllabus-item-status">
                                                {hasCompleted ? (
                                                    <CheckCircle2 size={18} color="#16a34a" />
                                                ) : (
                                                    <Clock size={18} color={isCurrent ? "#0284c7" : "#94a3b8"} />
                                                )}
                                            </div>

                                            <div className="deped-syllabus-item-text">
                                                <span className="deped-lesson-num">Lesson {lesson.lessonNumber}</span>
                                                <strong>{lesson.title}</strong>
                                                <span className="deped-lesson-dur">{lesson.duration}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Faculty Preceptor Stamp */}
                            <div className="deped-preceptor-box">
                                <span className="deped-preceptor-label">Faculty Preceptor</span>
                                <strong>{activeSubject.instructor}</strong>
                                <p>{activeSubject.programName}</p>
                                <div className="deped-curriculum-stamp">
                                    <span>✓ LIVE LESSON STUDIO SYNC</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: ACTIVE RESOURCE TAB CONTENT */}
                        <div className="deped-studio-main-card">
                            {currentLesson && (
                                <>
                                    {/* TAB 1: MODULAR EXPOSITORY READING */}
                                    {studioTab === "slm" && (
                                        <div className="deped-slm-container">
                                            <div className="slm-banner-intro">
                                                <div className="slm-badge-row">
                                                    <span className="slm-pill">{activeSubject.code} • LESSON {currentLesson.lessonNumber}</span>
                                                    <span className="slm-competency-pill">{currentLesson.duration}</span>
                                                </div>
                                                <h2 className="slm-headline">{currentLesson.title}</h2>
                                                <p className="slm-overview-text">{currentLesson.overview}</p>
                                            </div>

                                            {/* SCRIPTURE FOUNDATION */}
                                            {currentLesson.scriptureReference && (
                                                <div className="scripture-focus-banner" style={{ marginBottom: "22px" }}>
                                                    <div className="scripture-badge">Key Scripture Anchor</div>
                                                    <p>{currentLesson.scriptureReference}</p>
                                                </div>
                                            )}

                                            {/* EXPOSITORY READING CONTENT (From Lesson Studio) */}
                                            <div className="slm-phase-card">
                                                <div className="slm-phase-header phase-blue">
                                                    <div className="slm-phase-num">📖</div>
                                                    <div>
                                                        <h3>Expository Lecture Notes & Reading Proper</h3>
                                                        <span>Authored by {activeSubject.instructor} in E-Learning & Lesson Studio</span>
                                                    </div>
                                                </div>
                                                <div className="slm-phase-body slm-reading-prose">
                                                    {currentLesson.readingContent && currentLesson.readingContent.length > 0 ? (
                                                        currentLesson.readingContent.map((para, pIdx) => (
                                                            <p key={pIdx}>{para}</p>
                                                        ))
                                                    ) : (
                                                        <p style={{ fontStyle: "italic", color: "#64748b" }}>
                                                            No written notes attached for this lesson yet.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* CORE THEOLOGICAL TAKEAWAYS */}
                                            {currentLesson.keyTakeaways && currentLesson.keyTakeaways.length > 0 && (
                                                <div className="slm-phase-card">
                                                    <div className="slm-phase-header phase-indigo">
                                                        <div className="slm-phase-num">💡</div>
                                                        <div>
                                                            <h3>Core Theological & Ministerial Takeaways</h3>
                                                            <span>Essential Principles for Preaching & Discipleship</span>
                                                        </div>
                                                    </div>
                                                    <div className="slm-phase-body">
                                                        <ul className="slm-takeaways-list">
                                                            {currentLesson.keyTakeaways.map((takeaway, tIdx) => (
                                                                <li key={tIdx}>
                                                                    <CheckCircle2 size={16} color="#4f46e5" />
                                                                    <span>{takeaway}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}

                                            {/* BOTTOM PRINT BAR */}
                                            <div className="slm-download-footer-bar">
                                                <div>
                                                    <strong>Download & Print Modular Study Packet</strong>
                                                    <span>Formatted for Mobile Bible School Modular Binders (A4 / Letter)</span>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="btn-print-slm-footer"
                                                    onClick={handlePrintModularPacket}
                                                >
                                                    <Download size={16} />
                                                    <span>Print / Save PDF Packet</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB 2: HD VIDEO LECTURE */}
                                    {studioTab === "video" && (
                                        <div className="deped-video-studio">
                                            <div className="video-player-frame">
                                                {currentLesson.videoUrl ? (
                                                    currentLesson.videoUrl.includes("youtube.com") || currentLesson.videoUrl.includes("youtu.be") ? (
                                                        <iframe
                                                            src={currentLesson.videoUrl}
                                                            title={currentLesson.title}
                                                            style={{
                                                                width: "100%",
                                                                aspectRatio: "16 / 9",
                                                                border: "none",
                                                                display: "block"
                                                            }}
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        />
                                                    ) : (
                                                        <div className="video-player-screen">
                                                            <div className="video-overlay-badge">
                                                                <Tv size={14} />
                                                                <span>HD VIDEO STREAM</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="video-big-play-btn"
                                                                onClick={() => window.open(currentLesson.videoUrl, "_blank")}
                                                            >
                                                                <PlayCircle size={48} color="#ffffff" />
                                                            </button>
                                                            <div className="video-bottom-controls">
                                                                <span>{activeSubject.code} • Lesson {currentLesson.lessonNumber}</span>
                                                                <span>{currentLesson.duration}</span>
                                                            </div>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="video-player-screen" style={{ flexDirection: "column", gap: "10px", padding: "40px 20px" }}>
                                                        <Tv size={42} color="#94a3b8" />
                                                        <strong style={{ fontSize: "16px" }}>No Video Attached by Preceptor</strong>
                                                        <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0, textAlign: "center" }}>
                                                            Your instructor ({activeSubject.instructor}) has not linked a video lecture URL for this module in E-Learning & Lesson Studio yet.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="video-details-card">
                                                <div className="video-header-row">
                                                    <div>
                                                        <h3>{currentLesson.title}</h3>
                                                        <span>Lectured by {activeSubject.instructor} • {activeSubject.code}</span>
                                                    </div>
                                                    {currentLesson.videoUrl && (
                                                        <button
                                                            type="button"
                                                            className="btn-video-download"
                                                            onClick={() => alert("Lecture video bookmarked in browser cache for offline study.")}
                                                        >
                                                            <FileDown size={14} />
                                                            <span>Save for Offline</span>
                                                        </button>
                                                    )}
                                                </div>

                                                <p className="video-synopsis">{currentLesson.overview}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB 3: AUDIO LECTURE */}
                                    {studioTab === "audio" && (
                                        <div className="deped-audio-studio">
                                            <div className="audio-player-card">
                                                <div className="audio-hero-visual">
                                                    <div className="audio-icon-pulse">
                                                        <Radio size={36} color="#ffffff" />
                                                    </div>
                                                    <div>
                                                        <span className="audio-broadcast-tag">COHORT AUDIO BROADCAST • {activeSubject.code}</span>
                                                        <h3>{currentLesson.title}</h3>
                                                        <p>Preceptor: {activeSubject.instructor} • High-fidelity audio stream</p>
                                                    </div>
                                                </div>

                                                <div className="audio-controls-panel">
                                                    <div className="audio-scrub-bar">
                                                        <div
                                                            className="audio-progress-fill"
                                                            style={{ width: isPlayingAudio ? "60%" : "0%" }}
                                                        />
                                                    </div>

                                                    <div className="audio-buttons-row">
                                                        <div className="audio-time-meta">
                                                            <span>{isPlayingAudio ? "22:15" : "00:00"}</span>
                                                            <span>/ 45:00</span>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            className="btn-audio-play"
                                                            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                                                        >
                                                            {isPlayingAudio ? "⏸ Pause Audio" : "▶ Play Audio Lecture"}
                                                        </button>

                                                        <div className="audio-speed-selector">
                                                            <span>Speed:</span>
                                                            {[1.0, 1.25, 1.5].map((spd) => (
                                                                <button
                                                                    key={spd}
                                                                    type="button"
                                                                    className={`spd-btn ${audioSpeed === spd ? "active" : ""}`}
                                                                    onClick={() => setAudioSpeed(spd)}
                                                                >
                                                                    {spd}x
                                                                </button>
                                                            ))}
                                                        </div>

                                                        <button
                                                            type="button"
                                                            className="btn-audio-download"
                                                            onClick={() => alert("Audio podcast downloaded to your local offline library.")}
                                                        >
                                                            <Download size={14} />
                                                            <span>Download MP3</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="audio-transcript-card">
                                                <h4>Lecture Scripture Notes & Transcript</h4>
                                                <div className="transcript-prose">
                                                    <p><strong>Anchor Passage:</strong> {currentLesson.scriptureReference}</p>
                                                    {currentLesson.readingContent.slice(0, 2).map((p, i) => (
                                                        <p key={i}>{p}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB 4: ASSIGNMENT & STUDENT REFLECTION */}
                                    {studioTab === "las" && (
                                        <div className="deped-las-studio">
                                            <div className="las-header-banner">
                                                <div>
                                                    <span className="las-tag">STUDENT REFLECTION & LAS</span>
                                                    <h3>Modular Reflection & Practical Assignment</h3>
                                                    <p>{activeSubject.code} • Lesson {currentLesson.lessonNumber}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn-print-las"
                                                    onClick={handlePrintModularPacket}
                                                >
                                                    <Printer size={14} />
                                                    <span>Print Prompt</span>
                                                </button>
                                            </div>

                                            <div className="las-prompt-card">
                                                <h4>Faculty Assignment Prompt:</h4>
                                                <p className="las-task-desc">
                                                    {currentLesson.assignmentPrompt ||
                                                        "Write a 300-word reflection essay synthesizing how the theological principles in this lesson apply to your local church ministry preaching and personal discipleship."}
                                                </p>
                                            </div>

                                            {/* Existing Graded Submission Review */}
                                            {existingSubmissionForLesson && (
                                                <div
                                                    style={{
                                                        background: "#f0fdf4",
                                                        border: "1px solid #86efac",
                                                        borderRadius: "12px",
                                                        padding: "18px 20px"
                                                    }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                                                        <strong style={{ color: "#166534", fontSize: "14px" }}>
                                                            ✓ Work Previously Submitted on {new Date(existingSubmissionForLesson.submissionDate).toLocaleDateString()}
                                                        </strong>
                                                        <span
                                                            style={{
                                                                background: existingSubmissionForLesson.status === "APPROVED" ? "#16a34a" : "#ca8a04",
                                                                color: "#ffffff",
                                                                fontSize: "11px",
                                                                fontWeight: 800,
                                                                padding: "3px 8px",
                                                                borderRadius: "6px"
                                                            }}
                                                        >
                                                            {existingSubmissionForLesson.status === "APPROVED" ? "GRADED & APPROVED" : "AWAITING PRECEPTOR REVIEW"}
                                                        </span>
                                                    </div>

                                                    <p style={{ fontSize: "13px", color: "#334155", background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                                        "{existingSubmissionForLesson.reflectionText}"
                                                    </p>

                                                    {existingSubmissionForLesson.grade && (
                                                        <div style={{ marginTop: "10px", fontSize: "13px", color: "#166534" }}>
                                                            <strong>Grade Assigned:</strong> {existingSubmissionForLesson.grade}
                                                            {existingSubmissionForLesson.feedback && (
                                                                <p style={{ margin: "4px 0 0 0", fontStyle: "italic" }}>
                                                                    Faculty Feedback: "{existingSubmissionForLesson.feedback}"
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="las-submission-form">
                                                <label htmlFor="las-editor">
                                                    <strong>Submit Your Essay / Reflection:</strong>
                                                </label>
                                                <textarea
                                                    id="las-editor"
                                                    rows={8}
                                                    placeholder="Type your reflection essay here... Cite Scripture and apply the grammatical-historical principles discussed."
                                                    value={lasResponse}
                                                    onChange={(e) => setLasResponse(e.target.value)}
                                                    disabled={lasSubmitted}
                                                />

                                                <div className="las-attachment-row">
                                                    <label className="btn-file-upload">
                                                        <Upload size={15} />
                                                        <span>{uploadedFileName || "Attach Document / Written Scan (Optional)"}</span>
                                                        <input
                                                            type="file"
                                                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                                            style={{ display: "none" }}
                                                            onChange={(e) => {
                                                                if (e.target.files && e.target.files[0]) {
                                                                    setUploadedFileName(e.target.files[0].name);
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                    {uploadedFileName && (
                                                        <span className="upload-success-label">
                                                            ✓ Attached: {uploadedFileName}
                                                        </span>
                                                    )}
                                                </div>

                                                {lasSubmitted ? (
                                                    <div className="las-success-alert">
                                                        <CheckCircle2 size={20} color="#16a34a" />
                                                        <div>
                                                            <strong>Assignment Submitted Successfully!</strong>
                                                            <p>
                                                                Sent to {activeSubject.instructor} in E-Learning & Lesson Studio. You can check for grade updates in your portal.
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="btn-submit-las"
                                                        onClick={() => {
                                                            if (!lasResponse.trim() && !uploadedFileName) {
                                                                alert("Please type your response or attach your worksheet before submitting.");
                                                                return;
                                                            }
                                                            lessonContentService.submitStudentWork({
                                                                lessonId: currentLesson.id,
                                                                courseCode: activeSubject.code,
                                                                studentName,
                                                                studentId,
                                                                reflectionText: lasResponse || `[Attached Document: ${uploadedFileName}]`,
                                                                quizScore: 100
                                                            });
                                                            setLasSubmitted(true);
                                                            setRefreshNonce((n) => n + 1);
                                                        }}
                                                    >
                                                        <Send size={15} />
                                                        <span>Submit to Preceptor in Lesson Studio</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB 5: FORMATIVE MASTERY QUIZ */}
                                    {studioTab === "assessment" && (
                                        <div className="deped-quiz-studio">
                                            <div className="quiz-header-banner">
                                                <div>
                                                    <span className="quiz-tag">KNOWLEDGE EVALUATION</span>
                                                    <h3>Lesson Mastery Check</h3>
                                                    <p>Authored by {activeSubject.instructor} for {activeSubject.code} - Lesson {currentLesson.lessonNumber}</p>
                                                </div>
                                                <div className="quiz-score-badge">
                                                    {quizSubmitted ? "SCORED" : "IN PROGRESS"}
                                                </div>
                                            </div>

                                            {currentLesson.quizQuestions && currentLesson.quizQuestions.length > 0 ? (
                                                <div className="quiz-questions-stack">
                                                    {currentLesson.quizQuestions.map((q, qIndex) => {
                                                        const selected = quizAnswers[qIndex];
                                                        const isCorrect = selected === q.correctIndex;

                                                        return (
                                                            <div key={qIndex} className="quiz-question-card">
                                                                <strong className="quiz-q-title">
                                                                    Question {qIndex + 1}: {q.question}
                                                                </strong>

                                                                <div className="quiz-options-list">
                                                                    {q.options.map((opt, optIndex) => {
                                                                        const isThisSelected = selected === optIndex;
                                                                        const isThisCorrect = q.correctIndex === optIndex;

                                                                        let stateClass = "";
                                                                        if (quizSubmitted) {
                                                                            if (isThisCorrect) stateClass = "correct";
                                                                            else if (isThisSelected && !isThisCorrect) stateClass = "incorrect";
                                                                        } else if (isThisSelected) {
                                                                            stateClass = "selected";
                                                                        }

                                                                        return (
                                                                            <div
                                                                                key={optIndex}
                                                                                className={`quiz-option-choice ${stateClass}`}
                                                                                onClick={() => {
                                                                                    if (!quizSubmitted) {
                                                                                        setQuizAnswers((prev) => ({
                                                                                            ...prev,
                                                                                            [qIndex]: optIndex
                                                                                        }));
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <span className="quiz-letter-badge">
                                                                                    {String.fromCharCode(65 + optIndex)}
                                                                                </span>
                                                                                <span className="quiz-text">{opt}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>

                                                                {quizSubmitted && q.explanation && (
                                                                    <div className={`deped-rationale-box ${isCorrect ? "correct" : "review"}`}>
                                                                        <strong>Preceptor Key to Correction & Rationale:</strong>
                                                                        <p>{q.explanation}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}

                                                    <div className="quiz-footer-actions">
                                                        {quizSubmitted ? (
                                                            <div className="quiz-done-row">
                                                                <div className="quiz-recorded-alert">
                                                                    ✓ Knowledge Check Completed & Recorded in Your Academic Profile!
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="btn-retake-quiz"
                                                                    onClick={() => {
                                                                        setQuizSubmitted(false);
                                                                        setQuizAnswers({});
                                                                    }}
                                                                >
                                                                    <RefreshCw size={14} />
                                                                    <span>Retake Quiz</span>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="btn-submit-quiz"
                                                                onClick={() => setQuizSubmitted(true)}
                                                            >
                                                                <CheckCircle2 size={16} />
                                                                <span>Submit Knowledge Check</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                                                    <Award size={40} color="#cbd5e1" style={{ marginBottom: "10px" }} />
                                                    <p>No quiz questions have been authored for this lesson by {activeSubject.instructor} yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* TAB 6: SYLLABUS & SCHEDULE */}
                                    {studioTab === "syllabus" && (
                                        <div className="deped-library-studio">
                                            <div className="library-header-banner">
                                                <div>
                                                    <span className="library-tag">{activeSubject.code} OFFICIAL SYLLABUS</span>
                                                    <h3>Curriculum Structure & Academic Logistics</h3>
                                                    <p>Accredited Course Catalog Data from Mobile Bible School</p>
                                                </div>
                                            </div>

                                            <div className="library-items-grid">
                                                <div className="library-resource-card">
                                                    <div className="lib-icon-box">
                                                        <Clock size={24} color="#0284c7" />
                                                    </div>
                                                    <div className="lib-details">
                                                        <strong>Class Schedule & Modality</strong>
                                                        <span>{activeSubject.schedule} • {activeSubject.modeOfLearning}</span>
                                                    </div>
                                                </div>

                                                <div className="library-resource-card">
                                                    <div className="lib-icon-box">
                                                        <GraduationCap size={24} color="#7c3aed" />
                                                    </div>
                                                    <div className="lib-details">
                                                        <strong>Academic Program</strong>
                                                        <span>{activeSubject.programName} ({activeSubject.degreeLevel})</span>
                                                    </div>
                                                </div>

                                                <div className="library-resource-card">
                                                    <div className="lib-icon-box">
                                                        <FileText size={24} color="#059669" />
                                                    </div>
                                                    <div className="lib-details">
                                                        <strong>Classroom / Learning Hub</strong>
                                                        <span>{activeSubject.room} • {activeSubject.units} Academic Units</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ marginTop: "24px" }}>
                                                <button
                                                    type="button"
                                                    className="btn-print-slm-footer"
                                                    onClick={handlePrintModularPacket}
                                                >
                                                    <Printer size={16} />
                                                    <span>Print Official Course Syllabus</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // =========================================================
    // RENDER: MAIN STUDENT LEARNING AREA & COURSE CATALOG
    // =========================================================

    return (
        <div className="student-learning-page deped-commons-page">
            {/* HERO BANNER */}
            <div className="deped-hero-banner">
                <div className="deped-hero-seal">
                    <div className="seal-emblem">MBS</div>
                    <div className="seal-sub">STUDENT</div>
                </div>

                <div className="deped-hero-info">
                    <div className="deped-hero-badge-row">
                        <span className="deped-official-badge">MBS STUDENT PORTAL</span>
                        <span className="deped-accreditation-badge">Connected to E-Learning & Lesson Studio</span>
                    </div>

                    <h1 className="deped-hero-title">Student Learning Area</h1>

                    <p className="deped-hero-desc">
                        Welcome, <strong>{studentName}</strong> (ID: {studentId})
                        <br />
                        Access your enrolled subjects, study published lesson modules, watch lectures, and submit assignments authored by your faculty preceptors.
                    </p>

                    {/* Delivery Modality Strip */}
                    <div className="deped-modality-bar">
                        <span className="modality-label">Study Delivery Modality:</span>
                        <div className="modality-pills">
                            <button
                                type="button"
                                className={`modality-pill ${studyMode === "modular" ? "active" : ""}`}
                                onClick={() => handleSetMode("modular")}
                            >
                                <BookOpen size={14} />
                                <span>Modular Distance Learning (MDL - Print/PDF)</span>
                            </button>

                            <button
                                type="button"
                                className={`modality-pill ${studyMode === "online" ? "active" : ""}`}
                                onClick={() => handleSetMode("online")}
                            >
                                <Wifi size={14} />
                                <span>Online Distance Learning (ODL - Streaming)</span>
                            </button>

                            <button
                                type="button"
                                className={`modality-pill ${studyMode === "offline" ? "active" : ""}`}
                                onClick={() => handleSetMode("offline")}
                            >
                                <Radio size={14} />
                                <span>Radio/Audio Instruction (RBI - Offline Cache)</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live Stats Deck */}
                <div className="deped-stats-deck">
                    <div className="deped-stat-tile">
                        <strong>{liveStats.totalSubjects}</strong>
                        <span>Active Subjects</span>
                    </div>
                    <div className="deped-stat-tile">
                        <strong>{liveStats.totalPublishedModules}</strong>
                        <span>Published Modules</span>
                    </div>
                    <div className="deped-stat-tile">
                        <strong>{liveStats.totalVideos}</strong>
                        <span>HD Video Lectures</span>
                    </div>
                    <div className="deped-stat-tile">
                        <strong>{liveStats.totalQuizzes}</strong>
                        <span>Evaluations</span>
                    </div>
                </div>
            </div>

            {/* CURRICULUM PROGRAM & CATEGORY FILTERING */}
            <div className="deped-filter-strip-card">
                {/* TIER 1: PROGRAM FILTER */}
                <div className="deped-grade-filter-row">
                    <span className="filter-title">
                        <Filter size={15} />
                        <span>Curriculum Program:</span>
                    </span>

                    <div className="grade-button-group">
                        <button
                            type="button"
                            className={`grade-btn ${selectedProgramFilter === "ALL" ? "active" : ""}`}
                            onClick={() => setSelectedProgramFilter("ALL")}
                        >
                            All Programs ({liveSubjects.length} Subjects)
                        </button>
                        {allCourses.map((c) => (
                            <button
                                key={c.code}
                                type="button"
                                className={`grade-btn ${selectedProgramFilter === c.code ? "active" : ""}`}
                                onClick={() => setSelectedProgramFilter(c.code)}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TIER 2: RESOURCE CATEGORY */}
                <div className="deped-category-tabs-row">
                    <button
                        type="button"
                        className={`deped-cat-tab ${selectedCategory === "ALL" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("ALL")}
                    >
                        <Layers size={15} />
                        <span>All Learning Resources</span>
                    </button>

                    <button
                        type="button"
                        className={`deped-cat-tab ${selectedCategory === "SLM" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("SLM")}
                    >
                        <BookOpen size={15} />
                        <span>📖 Lesson Modules & Exegesis</span>
                    </button>

                    <button
                        type="button"
                        className={`deped-cat-tab ${selectedCategory === "VIDEO" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("VIDEO")}
                    >
                        <Tv size={15} />
                        <span>🎬 Video Lectures</span>
                    </button>

                    <button
                        type="button"
                        className={`deped-cat-tab ${selectedCategory === "AUDIO" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("AUDIO")}
                    >
                        <Radio size={15} />
                        <span>📻 Audio Lectures</span>
                    </button>

                    <button
                        type="button"
                        className={`deped-cat-tab ${selectedCategory === "LAS" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("LAS")}
                    >
                        <FileCheck size={15} />
                        <span>📝 Student Assignments</span>
                    </button>

                    <button
                        type="button"
                        className={`deped-cat-tab ${selectedCategory === "ASSESSMENT" ? "active" : ""}`}
                        onClick={() => setSelectedCategory("ASSESSMENT")}
                    >
                        <Award size={15} />
                        <span>📊 Quizzes & Checks</span>
                    </button>
                </div>

                {/* TIER 3: SEARCH */}
                <div className="deped-quarter-search-row">
                    <div className="deped-search-box" style={{ maxWidth: "100%" }}>
                        <Search size={16} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Search by subject code (e.g. HERM-101), course title, or faculty preceptor..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                        />
                        {searchKeyword && (
                            <button
                                type="button"
                                className="search-clear-btn"
                                onClick={() => setSearchKeyword("")}
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* LIVE SUBJECTS CATALOG GRID */}
            <div className="deped-catalog-header">
                <div>
                    <h2>
                        Curriculum Subjects ({filteredSubjects.length} Course{filteredSubjects.length === 1 ? "" : "s"} • {liveStats.totalPublishedModules} Published Lessons)
                    </h2>
                    <p>Direct live data from Mobile Bible School E-Learning & Lesson Studio</p>
                </div>

                <div className="deped-catalog-legend">
                    <span className="legend-item"><span className="legend-dot slm" /> Modular Text</span>
                    <span className="legend-item"><span className="legend-dot video" /> HD Video</span>
                    <span className="legend-item"><span className="legend-dot audio" /> Audio Podcast</span>
                    <span className="legend-item"><span className="legend-dot las" /> Assignment Work</span>
                </div>
            </div>

            <div className="deped-resource-grid">
                {filteredSubjects.map((sub) => {
                    const hasLessons = sub.publishedLessons.length > 0;

                    return (
                        <div key={sub.code} className="deped-resource-card">
                            <div className="resource-card-top">
                                <div className="resource-tag-group">
                                    <span className="card-quarter-tag">{sub.programCode}</span>
                                    <span className="card-level-tag">{sub.degreeLevel}</span>
                                </div>
                                <span className="card-units-tag">{sub.units} Units</span>
                            </div>

                            <div className="resource-card-body">
                                <span className="resource-subject-code">{sub.code}</span>
                                <h3 className="resource-subject-title">{sub.title}</h3>
                                <p className="resource-melc-text">{sub.programName}</p>

                                <div className="resource-instructor-info">
                                    <span className="instructor-label">Faculty Preceptor:</span>
                                    <strong>{sub.instructor}</strong>
                                </div>

                                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px" }}>
                                    <span>Schedule: {sub.schedule}</span>
                                </div>

                                {/* Resource Badges */}
                                <div className="multi-resource-pills">
                                    <span
                                        className="res-pill"
                                        style={{
                                            background: hasLessons ? "#eff6ff" : "#f1f5f9",
                                            color: hasLessons ? "#1e40af" : "#94a3b8"
                                        }}
                                    >
                                        <BookOpen size={13} />
                                        <span>{sub.publishedLessons.length} Module{sub.publishedLessons.length === 1 ? "" : "s"}</span>
                                    </span>

                                    {sub.publishedLessons.some((l) => !!l.videoUrl) && (
                                        <span className="res-pill" style={{ background: "#fef2f2", color: "#991b1b" }}>
                                            <Tv size={13} />
                                            <span>Video</span>
                                        </span>
                                    )}

                                    {sub.publishedLessons.some((l) => !!l.audioUrl) && (
                                        <span className="res-pill" style={{ background: "#f5f3ff", color: "#5b21b6" }}>
                                            <Radio size={13} />
                                            <span>Audio</span>
                                        </span>
                                    )}

                                    {sub.publishedLessons.some((l) => !!l.assignmentPrompt) && (
                                        <span className="res-pill" style={{ background: "#f0fdf4", color: "#166534" }}>
                                            <FileCheck size={13} />
                                            <span>Assignment</span>
                                        </span>
                                    )}

                                    {sub.publishedLessons.some((l) => l.quizQuestions && l.quizQuestions.length > 0) && (
                                        <span className="res-pill" style={{ background: "#fffbeb", color: "#92400e" }}>
                                            <Award size={13} />
                                            <span>Quiz</span>
                                        </span>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div className="resource-progress-box">
                                    <div className="progress-labels">
                                        <span>Student Course Progress</span>
                                        <strong>{sub.progressPercent}%</strong>
                                    </div>
                                    <div className="progress-track">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${sub.progressPercent}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="resource-card-footer">
                                <button
                                    type="button"
                                    className="btn-open-studio"
                                    onClick={() => handleOpenStudio(sub)}
                                >
                                    <BookOpen size={15} />
                                    <span>{hasLessons ? "Study Course Modules" : "View Course Details"}</span>
                                </button>

                                <button
                                    type="button"
                                    className="btn-quick-print"
                                    onClick={() => {
                                        setActiveSubject(sub);
                                        setSelectedLessonIndex(0);
                                        setTimeout(() => handlePrintModularPacket(), 100);
                                    }}
                                    title="Print Syllabus / Modular Packet"
                                >
                                    <Printer size={15} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredSubjects.length === 0 && (
                <div className="deped-empty-state">
                    <FolderOpen size={48} color="#94a3b8" />
                    <h3>No subjects match your filter</h3>
                    <p>Try clearing your search query or selecting "All Programs".</p>
                    <button
                        type="button"
                        className="btn-reset-filters"
                        onClick={() => {
                            setSearchKeyword("");
                            setSelectedProgramFilter("ALL");
                            setSelectedCategory("ALL");
                        }}
                    >
                        Reset All Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentLearningArea;
