/* =========================================================
   FACULTY & ADMINISTRATOR LESSON STUDIO
   Curriculum Lesson Authoring, Course Syllabus Management,
   Video Lectures, Quizzes & Student Submissions Review
========================================================= */

import React, { useState, useMemo } from "react";
import {
    BookOpen,
    Edit3,
    Plus,
    Trash2,
    CheckCircle2,
    Clock,
    PlayCircle,
    FileText,
    HelpCircle,
    X,
    Search,
    Printer,
    Eye,
    Save,
    RotateCcw,
    Layers,
    Award,
    Check,
    MessageSquare
} from "lucide-react";
import { courseCurriculumService } from "../../services/courseCurriculumService";
import type { CourseSubject } from "../../services/courseCurriculumService";
import { lessonContentService } from "../../services/lessonContentService";
import type {
    CourseLesson,
    LessonQuizQuestion,
    StudentSubmission
} from "../../services/lessonContentService";
import { SchoolPrintService } from "../../utils/schoolPrintService";
import StudentLearningArea from "./StudentLearningArea";
import "./FacultyLessonEditor.css";

export const FacultyLessonEditor: React.FC = () => {
    // Current User Info
    const currentUserName = useMemo(() => {
        return (
            localStorage.getItem("currentFullName") ||
            localStorage.getItem("fullName") ||
            localStorage.getItem("currentUser") ||
            "School Administrator"
        );
    }, []);

    const currentUserRole = useMemo(() => {
        return (
            localStorage.getItem("currentRole") ||
            localStorage.getItem("role") ||
            "ADMIN"
        );
    }, []);

    // Course Subjects List from Curriculum Service
    const availableSubjects: CourseSubject[] = useMemo(() => {
        const courses = courseCurriculumService.getCourses();
        const allSubjects: CourseSubject[] = [];
        const seenCodes = new Set<string>();

        courses.forEach((c) => {
            c.subjects.forEach((s) => {
                if (!seenCodes.has(s.code)) {
                    seenCodes.add(s.code);
                    allSubjects.push(s);
                }
            });
        });

        // Ensure default subjects if empty
        if (allSubjects.length === 0) {
            return [
                {
                    code: "HERM-101",
                    title: "Biblical Hermeneutics & Exegesis",
                    units: 3,
                    schedule: "Saturdays 8:00 AM - 12:00 PM (Modular)",
                    room: "Theology Hall Rm 102",
                    instructor: "Dr. Samuel Vance, Th.D."
                },
                {
                    code: "OT-101",
                    title: "Old Testament Literature & Covenant Theology",
                    units: 3,
                    schedule: "Modular Self-Paced • Hybrid",
                    room: "OT Studies Center",
                    instructor: "Prof. Nathan Cole, M.Div."
                },
                {
                    code: "NT-101",
                    title: "New Testament Exegesis & Johannine Epistles",
                    units: 3,
                    schedule: "Fridays 1:00 PM - 5:00 PM",
                    room: "Language Lab Rm 204",
                    instructor: "Dr. Elizabeth Warren, Ph.D."
                },
                {
                    code: "THEO-101",
                    title: "Systematic Theology I: Bibliology & Theology Proper",
                    units: 3,
                    schedule: "Thursdays 6:00 PM - 9:00 PM",
                    room: "Seminary Main Hall",
                    instructor: "Rev. Jonathan Edwards, Th.M."
                },
                {
                    code: "MIN-101",
                    title: "Pastoral Ministry & Christian Leadership",
                    units: 3,
                    schedule: "Mondays 9:00 AM - 12:00 PM",
                    room: "Ministry Chapel Rm 10",
                    instructor: "Bishop Marcus Reed, D.Min."
                }
            ];
        }

        return allSubjects;
    }, []);

    // Selected Course Subject
    const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>(() => {
        return availableSubjects[0]?.code || "HERM-101";
    });

    const activeSubject = useMemo(() => {
        return (
            availableSubjects.find((s) => s.code === selectedSubjectCode) ||
            availableSubjects[0]
        );
    }, [availableSubjects, selectedSubjectCode]);

    // Lessons Refresh Trigger
    const [refreshNonce, setRefreshNonce] = useState(0);

    // Active Subject's Lessons
    const subjectLessons = useMemo(() => {
        void refreshNonce;
        return lessonContentService.getLessons(selectedSubjectCode);
    }, [selectedSubjectCode, refreshNonce]);

    // Submissions
    const allSubmissions = useMemo(() => {
        void refreshNonce;
        return lessonContentService.getSubmissions();
    }, [refreshNonce]);

    const activeSubjectSubmissions = useMemo(() => {
        return allSubmissions.filter(
            (s) => s.courseCode.toUpperCase() === selectedSubjectCode.toUpperCase()
        );
    }, [allSubmissions, selectedSubjectCode]);

    // Search and filter
    const [lessonSearch, setLessonSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");

    const filteredLessons = useMemo(() => {
        return subjectLessons.filter((l) => {
            const matchesSearch =
                l.title.toLowerCase().includes(lessonSearch.toLowerCase()) ||
                l.scriptureReference.toLowerCase().includes(lessonSearch.toLowerCase()) ||
                l.overview.toLowerCase().includes(lessonSearch.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "PUBLISHED" && l.isPublished) ||
                (statusFilter === "DRAFT" && !l.isPublished);

            return matchesSearch && matchesStatus;
        });
    }, [subjectLessons, lessonSearch, statusFilter]);

    // Authoring Modal State
    const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null);
    const [activeModalTab, setActiveModalTab] = useState<
        "basic" | "reading" | "media" | "quiz" | "assignment"
    >("basic");

    // Submissions Review Modal State
    const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
    const [selectedSubmissionToGrade, setSelectedSubmissionToGrade] = useState<StudentSubmission | null>(null);
    const [gradingScore, setGradingScore] = useState("A (95%)");
    const [gradingFeedback, setGradingFeedback] = useState("Well-developed theological synthesis.");

    // Student Preview Mode
    const [isPreviewModeActive, setIsPreviewModeActive] = useState(false);

    // Feedback Toast
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Handlers: Open Create
    const handleOpenCreateLesson = () => {
        const nextNumber = subjectLessons.length + 1;
        const newLessonTemplate: CourseLesson = {
            id: `${selectedSubjectCode.toLowerCase()}-l${Date.now().toString().slice(-4)}`,
            courseCode: selectedSubjectCode,
            lessonNumber: nextNumber,
            title: `Lesson ${nextNumber}: New Subject Module`,
            duration: "45 mins lecture • 12 pages reading",
            isPublished: true,
            scriptureReference: "Scripture Reference (e.g. 2 Timothy 3:16-17)",
            overview: "Provide a comprehensive theological overview and learning objectives for this lesson.",
            readingContent: [
                "Enter the first paragraph of expository lecture notes and reading content here.",
                "Enter additional explanatory paragraphs to deepen the students' comprehension."
            ],
            keyTakeaways: [
                "Core theological takeaway #1.",
                "Core theological takeaway #2."
            ],
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            audioUrl: "",
            assignmentPrompt: "Reflect on this lesson's key scripture and write a 300-word pastoral application.",
            quizQuestions: [
                {
                    id: `q-${Date.now()}-1`,
                    question: "Sample Question: What is the main thesis of this lesson?",
                    options: [
                        "Incorrect option A",
                        "Correct theological answer B",
                        "Incorrect option C",
                        "Incorrect option D"
                    ],
                    correctIndex: 1,
                    explanation: "Option B is correct based on sound grammatical-historical interpretation."
                }
            ],
            updatedAt: new Date().toISOString()
        };

        setEditingLesson(newLessonTemplate);
        setActiveModalTab("basic");
        setIsAuthorModalOpen(true);
    };

    // Open Edit
    const handleOpenEditLesson = (lesson: CourseLesson) => {
        // Deep copy
        setEditingLesson(JSON.parse(JSON.stringify(lesson)));
        setActiveModalTab("basic");
        setIsAuthorModalOpen(true);
    };

    // Save Lesson
    const handleSaveLesson = () => {
        if (!editingLesson) return;
        if (!editingLesson.title.trim()) {
            alert("Please provide a lesson title.");
            return;
        }

        lessonContentService.saveLesson(editingLesson);
        setRefreshNonce((n) => n + 1);
        setIsAuthorModalOpen(false);
        showToast(`Saved "${editingLesson.title}" successfully!`);
    };

    // Delete Lesson
    const handleDeleteLesson = (lesson: CourseLesson) => {
        if (
            window.confirm(
                `Are you sure you want to delete "${lesson.title}" from ${lesson.courseCode}? This cannot be undone.`
            )
        ) {
            lessonContentService.deleteLesson(lesson.id);
            setRefreshNonce((n) => n + 1);
            showToast(`Deleted "${lesson.title}".`);
        }
    };

    // Toggle Publish Status
    const handleTogglePublish = (lesson: CourseLesson) => {
        const updated = { ...lesson, isPublished: !lesson.isPublished };
        lessonContentService.saveLesson(updated);
        setRefreshNonce((n) => n + 1);
        showToast(
            `Lesson "${lesson.title}" marked as ${
                updated.isPublished ? "PUBLISHED" : "DRAFT"
            }.`
        );
    };

    // Grade Submission
    const handleSaveGrade = () => {
        if (!selectedSubmissionToGrade) return;
        lessonContentService.gradeSubmission(
            selectedSubmissionToGrade.id,
            gradingScore,
            gradingFeedback
        );
        setRefreshNonce((n) => n + 1);
        setSelectedSubmissionToGrade(null);
        showToast("Submission graded and approved successfully!");
    };

    // Print Course Syllabus
    const handlePrintSyllabus = () => {
        const printData = {
            title: `${activeSubject.code} - Complete Course Syllabus & Modular Study Packet`,
            description: `${activeSubject.title} • Instructor: ${activeSubject.instructor || "Faculty"}`,
            summaryCards: [
                { label: "Course Code", value: activeSubject.code },
                { label: "Units", value: `${activeSubject.units} Academic Units` },
                { label: "Total Lessons", value: `${subjectLessons.length} Modules` },
                { label: "Mode", value: activeSubject.modeOfLearning || "Modular Field Cohort" }
            ],
            columns: [
                { header: "Module #" },
                { header: "Lesson Title & Scripture Reference" },
                { header: "Duration / Reading Load" },
                { header: "Status" }
            ],
            rows: subjectLessons.map((l) => [
                `Lesson ${l.lessonNumber}`,
                `${l.title} (${l.scriptureReference})`,
                l.duration,
                l.isPublished ? "PUBLISHED" : "DRAFT"
            ])
        };

        SchoolPrintService.printReport(printData);
    };

    // If Preview Mode is active, render student view with exit banner
    if (isPreviewModeActive) {
        return (
            <div className="student-preview-wrapper">
                <div className="student-preview-sticky-banner">
                    <div className="preview-banner-text">
                        <Eye size={18} />
                        <span>
                            <strong>STUDENT PREVIEW MODE</strong> — You are previewing how enrolled students interact with lessons, videos, and quizzes.
                        </span>
                    </div>
                    <button
                        className="btn-exit-preview"
                        onClick={() => setIsPreviewModeActive(false)}
                    >
                        Exit Preview & Return to Lesson Editor
                    </button>
                </div>
                <StudentLearningArea />
            </div>
        );
    }

    return (
        <div className="faculty-lesson-studio">
            {/* Toast feedback */}
            {toastMessage && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "24px",
                        right: "24px",
                        backgroundColor: "#0f172a",
                        color: "#ffffff",
                        padding: "14px 20px",
                        borderRadius: "8px",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        zIndex: 10000,
                        fontWeight: 600,
                        fontSize: "0.9rem"
                    }}
                >
                    <CheckCircle2 size={18} color="#22c55e" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Studio Header */}
            <div className="studio-header">
                <div className="studio-title-area">
                    <div className="studio-icon-badge">
                        <Edit3 size={28} />
                    </div>
                    <div>
                        <h1>E-Learning & Lesson Studio</h1>
                        <p>
                            Faculty Preceptor & Course Authoring Workspace • Mobile Bible School & Seminary
                        </p>
                        <div className="studio-role-pill">
                            <Award size={12} />
                            <span>Logged in as: {currentUserName} ({currentUserRole})</span>
                        </div>
                    </div>
                </div>

                <div className="studio-actions">
                    <button
                        className="studio-btn studio-btn-preview"
                        onClick={() => setIsPreviewModeActive(true)}
                        title="Preview how students view and interact with these lessons"
                    >
                        <Eye size={16} />
                        <span>Preview Student View</span>
                    </button>

                    <button
                        className="studio-btn studio-btn-secondary"
                        onClick={handlePrintSyllabus}
                        title="Print Course Syllabus & Modular Packet"
                    >
                        <Printer size={16} />
                        <span>Print Modular Syllabus</span>
                    </button>

                    <button
                        className="studio-btn studio-btn-secondary"
                        onClick={() => setIsSubmissionsModalOpen(true)}
                        title="Review student assignments & quiz results"
                    >
                        <MessageSquare size={16} />
                        <span>Student Submissions</span>
                        {allSubmissions.filter((s) => s.status === "PENDING_REVIEW").length > 0 && (
                            <span className="studio-badge-count">
                                {allSubmissions.filter((s) => s.status === "PENDING_REVIEW").length}
                            </span>
                        )}
                    </button>

                    <button
                        className="studio-btn studio-btn-primary"
                        onClick={handleOpenCreateLesson}
                    >
                        <Plus size={16} />
                        <span>Create New Lesson</span>
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="studio-stats-grid">
                <div className="studio-stat-card">
                    <div className="stat-icon blue">
                        <BookOpen size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Active Courses</span>
                        <span className="stat-value">{availableSubjects.length} Subjects</span>
                        <span className="stat-subtext">Undergraduate & Seminary Catalog</span>
                    </div>
                </div>

                <div className="studio-stat-card">
                    <div className="stat-icon green">
                        <Layers size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Published Lessons</span>
                        <span className="stat-value">
                            {lessonContentService.getLessons().filter((l) => l.isPublished).length} Modules
                        </span>
                        <span className="stat-subtext">Across all academic courses</span>
                    </div>
                </div>

                <div className="studio-stat-card">
                    <div className="stat-icon purple">
                        <PlayCircle size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">HD Video Lectures</span>
                        <span className="stat-value">
                            {lessonContentService.getLessons().filter((l) => Boolean(l.videoUrl)).length} Attached
                        </span>
                        <span className="stat-subtext">Online & Offline Sync Ready</span>
                    </div>
                </div>

                <div className="studio-stat-card">
                    <div className="stat-icon amber">
                        <FileText size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Student Reflections</span>
                        <span className="stat-value">{allSubmissions.length} Submissions</span>
                        <span className="stat-subtext">
                            {allSubmissions.filter((s) => s.status === "PENDING_REVIEW").length} Awaiting Faculty Review
                        </span>
                    </div>
                </div>
            </div>

            {/* Course Subject Selector Tabs */}
            <div className="subject-selector-card">
                <div className="selector-header">
                    <h3>
                        <BookOpen size={16} />
                        <span>Select Subject to Edit Lessons & Syllabus:</span>
                    </h3>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        Click any course below to manage its lessons, videos, and quizzes.
                    </span>
                </div>

                <div className="subject-pills-row">
                    {availableSubjects.map((subj) => {
                        const isActive = subj.code === selectedSubjectCode;
                        const lessonCount = lessonContentService.getLessons(subj.code).length;

                        return (
                            <button
                                key={subj.code}
                                className={`subject-pill ${isActive ? "active" : ""}`}
                                onClick={() => setSelectedSubjectCode(subj.code)}
                            >
                                <span className="pill-code">{subj.code}</span>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span className="pill-name">{subj.title}</span>
                                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                                        {subj.units} Units • {lessonCount} Lessons
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Active Subject Banner */}
            <div className="active-course-banner">
                <div className="banner-left">
                    <h2>
                        <span>{activeSubject.code}: {activeSubject.title}</span>
                    </h2>
                    <div className="banner-meta">
                        <span>👨‍🏫 <strong>Instructor:</strong> {activeSubject.instructor || "Assigned Faculty"}</span>
                        <span>📜 <strong>Units:</strong> {activeSubject.units} Academic Units</span>
                        <span>⏰ <strong>Schedule:</strong> {activeSubject.schedule || "Modular Field Schedule"}</span>
                        <span>📍 <strong>Location:</strong> {activeSubject.room || "Field Cohort"}</span>
                    </div>
                </div>
                <div>
                    <button
                        className="studio-btn studio-btn-primary"
                        onClick={handleOpenCreateLesson}
                    >
                        <Plus size={16} />
                        <span>Add Lesson to {activeSubject.code}</span>
                    </button>
                </div>
            </div>

            {/* Syllabus Lessons List Controls */}
            <div className="syllabus-controls-row">
                <h3>
                    <Layers size={18} />
                    <span>Course Lessons & Syllabus ({filteredLessons.length} Modules)</span>
                </h3>

                <div className="controls-right">
                    <div className="search-input-wrap">
                        <Search size={14} />
                        <input
                            type="text"
                            placeholder="Search lesson or scripture..."
                            value={lessonSearch}
                            onChange={(e) => setLessonSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PUBLISHED">Published Only</option>
                        <option value="DRAFT">Drafts Only</option>
                    </select>
                </div>
            </div>

            {/* Lessons Grid */}
            <div className="lessons-grid">
                {filteredLessons.length === 0 ? (
                    <div className="lessons-empty-state">
                        <div className="empty-state-icon">
                            <BookOpen size={28} />
                        </div>
                        <h4>No lessons found for {activeSubject.code}</h4>
                        <p>
                            Get started by creating the first lesson module with video lectures, reading notes, and quizzes.
                        </p>
                        <button
                            className="studio-btn studio-btn-primary"
                            onClick={handleOpenCreateLesson}
                        >
                            <Plus size={16} />
                            <span>Create First Lesson</span>
                        </button>
                    </div>
                ) : (
                    filteredLessons.map((lesson) => (
                        <div key={lesson.id} className="lesson-author-card">
                            <div className="card-main-content">
                                <div className="card-top-line">
                                    <span className="lesson-number-tag">
                                        Module {lesson.lessonNumber}
                                    </span>
                                    <span
                                        className={`status-badge ${
                                            lesson.isPublished ? "published" : "draft"
                                        }`}
                                    >
                                        {lesson.isPublished ? "● Published" : "○ Draft"}
                                    </span>
                                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                        <Clock size={12} style={{ display: "inline", marginRight: "3px" }} />
                                        {lesson.duration}
                                    </span>
                                </div>

                                <h3 className="lesson-card-title">{lesson.title}</h3>

                                <div className="lesson-scripture-line">
                                    <BookOpen size={14} />
                                    <span>{lesson.scriptureReference}</span>
                                </div>

                                <p className="lesson-card-overview">{lesson.overview}</p>

                                <div className="lesson-feature-badges">
                                    <span
                                        className={`feature-pill ${
                                            lesson.videoUrl ? "has-video" : ""
                                        }`}
                                    >
                                        <PlayCircle size={14} />
                                        {lesson.videoUrl ? "Video Attached" : "No Video"}
                                    </span>

                                    <span className="feature-pill">
                                        <FileText size={14} />
                                        {lesson.readingContent.length} Reading Sections
                                    </span>

                                    <span
                                        className={`feature-pill ${
                                            lesson.quizQuestions.length > 0 ? "has-quiz" : ""
                                        }`}
                                    >
                                        <HelpCircle size={14} />
                                        {lesson.quizQuestions.length} Quiz Questions
                                    </span>

                                    {lesson.assignmentPrompt && (
                                        <span className="feature-pill has-assignment">
                                            <Award size={14} />
                                            Practical Assignment Configured
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="card-actions-col">
                                <button
                                    className="btn-card-action btn-card-edit"
                                    onClick={() => handleOpenEditLesson(lesson)}
                                >
                                    <Edit3 size={14} />
                                    <span>Edit Lesson</span>
                                </button>

                                <button
                                    className="btn-card-action btn-card-preview"
                                    onClick={() => handleTogglePublish(lesson)}
                                    title="Toggle between Published and Draft"
                                >
                                    <RotateCcw size={14} />
                                    <span>{lesson.isPublished ? "Make Draft" : "Publish"}</span>
                                </button>

                                <button
                                    className="btn-card-action btn-card-delete"
                                    onClick={() => handleDeleteLesson(lesson)}
                                >
                                    <Trash2 size={14} />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* =========================================================
                LESSON AUTHORING & EDITING MODAL
            ========================================================= */}
            {isAuthorModalOpen && editingLesson && (
                <div className="modal-backdrop-overlay">
                    <div className="author-modal-container">
                        {/* Modal Header */}
                        <div className="modal-header-bar">
                            <div>
                                <h2>
                                    <Edit3 size={20} />
                                    <span>Lesson Authoring Studio • {editingLesson.courseCode}</span>
                                </h2>
                                <p className="modal-subtitle">
                                    Edit course syllabus, lecture reading content, video lectures, and quiz evaluations.
                                </p>
                            </div>
                            <button
                                className="modal-close-btn"
                                onClick={() => setIsAuthorModalOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Tabs Navigation */}
                        <div className="modal-tabs-nav">
                            <button
                                className={`modal-nav-tab ${activeModalTab === "basic" ? "active" : ""}`}
                                onClick={() => setActiveModalTab("basic")}
                            >
                                <Layers size={15} />
                                <span>1. Basic Details</span>
                            </button>
                            <button
                                className={`modal-nav-tab ${activeModalTab === "reading" ? "active" : ""}`}
                                onClick={() => setActiveModalTab("reading")}
                            >
                                <FileText size={15} />
                                <span>2. Lecture Reading Notes</span>
                            </button>
                            <button
                                className={`modal-nav-tab ${activeModalTab === "media" ? "active" : ""}`}
                                onClick={() => setActiveModalTab("media")}
                            >
                                <PlayCircle size={15} />
                                <span>3. Video & Media</span>
                            </button>
                            <button
                                className={`modal-nav-tab ${activeModalTab === "quiz" ? "active" : ""}`}
                                onClick={() => setActiveModalTab("quiz")}
                            >
                                <HelpCircle size={15} />
                                <span>4. Quiz & Evaluations ({editingLesson.quizQuestions.length})</span>
                            </button>
                            <button
                                className={`modal-nav-tab ${activeModalTab === "assignment" ? "active" : ""}`}
                                onClick={() => setActiveModalTab("assignment")}
                            >
                                <Award size={15} />
                                <span>5. Assignment Prompt</span>
                            </button>
                        </div>

                        {/* Modal Body Scroll */}
                        <div className="modal-body-scroll">
                            {/* TAB 1: BASIC DETAILS */}
                            {activeModalTab === "basic" && (
                                <div>
                                    <div className="row-2-col">
                                        <div className="form-group-block">
                                            <label>Lesson Number / Sequence</label>
                                            <input
                                                type="number"
                                                className="input-text-standard"
                                                value={editingLesson.lessonNumber}
                                                onChange={(e) =>
                                                    setEditingLesson({
                                                        ...editingLesson,
                                                        lessonNumber: parseInt(e.target.value) || 1
                                                    })
                                                }
                                            />
                                            <div className="form-hint-text">
                                                Determines the order of the lesson in the student syllabus.
                                            </div>
                                        </div>

                                        <div className="form-group-block">
                                            <label>Estimated Duration & Reading Load</label>
                                            <input
                                                type="text"
                                                className="input-text-standard"
                                                placeholder="e.g. 45 mins lecture • 12 pages reading"
                                                value={editingLesson.duration}
                                                onChange={(e) =>
                                                    setEditingLesson({
                                                        ...editingLesson,
                                                        duration: e.target.value
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group-block">
                                        <label>Lesson Title</label>
                                        <input
                                            type="text"
                                            className="input-text-standard"
                                            placeholder="e.g. Introduction to Biblical Exegesis & Divine Inspiration"
                                            value={editingLesson.title}
                                            onChange={(e) =>
                                                setEditingLesson({
                                                    ...editingLesson,
                                                    title: e.target.value
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="form-group-block">
                                        <label>Scripture Reference & Memory Verse</label>
                                        <input
                                            type="text"
                                            className="input-text-standard"
                                            placeholder="e.g. 2 Timothy 3:16-17 • 'All Scripture is God-breathed...'"
                                            value={editingLesson.scriptureReference}
                                            onChange={(e) =>
                                                setEditingLesson({
                                                    ...editingLesson,
                                                    scriptureReference: e.target.value
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="form-group-block">
                                        <label>Theological Lesson Overview / Summary</label>
                                        <textarea
                                            className="textarea-standard"
                                            rows={3}
                                            placeholder="Briefly state what students will learn in this module..."
                                            value={editingLesson.overview}
                                            onChange={(e) =>
                                                setEditingLesson({
                                                    ...editingLesson,
                                                    overview: e.target.value
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="form-group-block">
                                        <label>Publication Status</label>
                                        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", textTransform: "none", fontWeight: 500 }}>
                                            <input
                                                type="checkbox"
                                                checked={editingLesson.isPublished}
                                                onChange={(e) =>
                                                    setEditingLesson({
                                                        ...editingLesson,
                                                        isPublished: e.target.checked
                                                    })
                                                }
                                                style={{ width: "18px", height: "18px" }}
                                            />
                                            <span>
                                                <strong>Publish immediately</strong> — Make this lesson visible to students in the Student Learning Area.
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: LECTURE READING NOTES */}
                            {activeModalTab === "reading" && (
                                <div>
                                    <div className="form-group-block">
                                        <label>Expository Reading Content (Paragraphs)</label>
                                        <p className="form-hint-text" style={{ marginBottom: "12px" }}>
                                            Students studying in Modular or Offline mode read these lecture notes carefully.
                                        </p>

                                        {editingLesson.readingContent.map((para, index) => (
                                            <div key={index} className="dynamic-item-row">
                                                <span style={{ fontWeight: 700, color: "#64748b", marginTop: "8px", minWidth: "24px" }}>
                                                    #{index + 1}
                                                </span>
                                                <textarea
                                                    className="textarea-standard"
                                                    rows={3}
                                                    value={para}
                                                    onChange={(e) => {
                                                        const copy = [...editingLesson.readingContent];
                                                        copy[index] = e.target.value;
                                                        setEditingLesson({ ...editingLesson, readingContent: copy });
                                                    }}
                                                />
                                                <button
                                                    className="btn-remove-row"
                                                    onClick={() => {
                                                        const copy = editingLesson.readingContent.filter((_, i) => i !== index);
                                                        setEditingLesson({ ...editingLesson, readingContent: copy });
                                                    }}
                                                    title="Remove Paragraph"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            className="btn-add-item"
                                            onClick={() => {
                                                setEditingLesson({
                                                    ...editingLesson,
                                                    readingContent: [
                                                        ...editingLesson.readingContent,
                                                        "New paragraph of expository lecture notes."
                                                    ]
                                                });
                                            }}
                                        >
                                            <Plus size={14} />
                                            <span>Add Reading Paragraph</span>
                                        </button>
                                    </div>

                                    <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "24px 0" }} />

                                    <div className="form-group-block">
                                        <label>Key Theological Takeaways (Bullet Points)</label>
                                        {editingLesson.keyTakeaways.map((point, index) => (
                                            <div key={index} className="dynamic-item-row">
                                                <CheckCircle2 size={18} color="#2563eb" style={{ marginTop: "10px", flexShrink: 0 }} />
                                                <input
                                                    type="text"
                                                    className="input-text-standard"
                                                    value={point}
                                                    onChange={(e) => {
                                                        const copy = [...editingLesson.keyTakeaways];
                                                        copy[index] = e.target.value;
                                                        setEditingLesson({ ...editingLesson, keyTakeaways: copy });
                                                    }}
                                                />
                                                <button
                                                    className="btn-remove-row"
                                                    onClick={() => {
                                                        const copy = editingLesson.keyTakeaways.filter((_, i) => i !== index);
                                                        setEditingLesson({ ...editingLesson, keyTakeaways: copy });
                                                    }}
                                                    title="Remove Takeaway"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            className="btn-add-item"
                                            onClick={() => {
                                                setEditingLesson({
                                                    ...editingLesson,
                                                    keyTakeaways: [
                                                        ...editingLesson.keyTakeaways,
                                                        "Important core theological principle to remember."
                                                    ]
                                                });
                                            }}
                                        >
                                            <Plus size={14} />
                                            <span>Add Core Takeaway</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: VIDEO & MEDIA */}
                            {activeModalTab === "media" && (
                                <div>
                                    <div className="form-group-block">
                                        <label>Video Lecture URL (YouTube, Vimeo, MP4 or Direct Link)</label>
                                        <input
                                            type="text"
                                            className="input-text-standard"
                                            placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ"
                                            value={editingLesson.videoUrl || ""}
                                            onChange={(e) =>
                                                setEditingLesson({
                                                    ...editingLesson,
                                                    videoUrl: e.target.value
                                                })
                                            }
                                        />
                                        <div className="form-hint-text">
                                            Paste an embeddable YouTube URL (e.g. <code>https://www.youtube.com/embed/...</code>) or direct video MP4 URL.
                                        </div>
                                    </div>

                                    {/* Video Preview */}
                                    {editingLesson.videoUrl && (
                                        <div className="form-group-block">
                                            <label>Live Video Player Test Preview</label>
                                            <div className="video-preview-box">
                                                <iframe
                                                    src={editingLesson.videoUrl}
                                                    title="Video preview"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-group-block">
                                        <label>Audio Lecture MP3 URL (Optional)</label>
                                        <input
                                            type="text"
                                            className="input-text-standard"
                                            placeholder="e.g. https://school.edu/audio/lesson-1.mp3"
                                            value={editingLesson.audioUrl || ""}
                                            onChange={(e) =>
                                                setEditingLesson({
                                                    ...editingLesson,
                                                    audioUrl: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: QUIZ BUILDER */}
                            {activeModalTab === "quiz" && (
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                        <div>
                                            <h4 style={{ margin: "0 0 4px 0", fontSize: "1rem" }}>
                                                Knowledge Evaluation Quiz Questions
                                            </h4>
                                            <p className="form-hint-text">
                                                Self-evaluation quiz for students after completing the reading and lecture.
                                            </p>
                                        </div>
                                        <button
                                            className="btn-add-item"
                                            onClick={() => {
                                                const newQ: LessonQuizQuestion = {
                                                    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                                                    question: "Enter new evaluation question here?",
                                                    options: [
                                                        "Option A",
                                                        "Option B (Correct)",
                                                        "Option C",
                                                        "Option D"
                                                    ],
                                                    correctIndex: 1,
                                                    explanation: "Theological reasoning for why Option B is correct."
                                                };
                                                setEditingLesson({
                                                    ...editingLesson,
                                                    quizQuestions: [...editingLesson.quizQuestions, newQ]
                                                });
                                            }}
                                        >
                                            <Plus size={14} />
                                            <span>Add New Question</span>
                                        </button>
                                    </div>

                                    {editingLesson.quizQuestions.length === 0 ? (
                                        <div className="lessons-empty-state" style={{ padding: "24px" }}>
                                            <p>No quiz questions configured yet.</p>
                                        </div>
                                    ) : (
                                        editingLesson.quizQuestions.map((q, qIndex) => (
                                            <div key={q.id} className="quiz-builder-card">
                                                <div className="quiz-question-header">
                                                    <span style={{ fontWeight: 700, color: "#1e3a8a", fontSize: "0.9rem" }}>
                                                        Question #{qIndex + 1}
                                                    </span>
                                                    <button
                                                        className="btn-remove-row"
                                                        onClick={() => {
                                                            const copy = editingLesson.quizQuestions.filter((_, i) => i !== qIndex);
                                                            setEditingLesson({ ...editingLesson, quizQuestions: copy });
                                                        }}
                                                        title="Delete Question"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>

                                                <div className="form-group-block" style={{ marginBottom: "12px" }}>
                                                    <input
                                                        type="text"
                                                        className="input-text-standard"
                                                        placeholder="Enter question prompt..."
                                                        value={q.question}
                                                        onChange={(e) => {
                                                            const copy = [...editingLesson.quizQuestions];
                                                            copy[qIndex].question = e.target.value;
                                                            setEditingLesson({ ...editingLesson, quizQuestions: copy });
                                                        }}
                                                    />
                                                </div>

                                                <div style={{ marginBottom: "12px" }}>
                                                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                                                        Choices (Select radio button for the CORRECT answer):
                                                    </span>
                                                    <div style={{ marginTop: "6px" }}>
                                                        {q.options.map((opt, optIndex) => (
                                                            <div key={optIndex} className="quiz-opt-row">
                                                                <input
                                                                    type="radio"
                                                                    name={`correct-opt-${q.id}`}
                                                                    className="radio-correct-opt"
                                                                    checked={q.correctIndex === optIndex}
                                                                    onChange={() => {
                                                                        const copy = [...editingLesson.quizQuestions];
                                                                        copy[qIndex].correctIndex = optIndex;
                                                                        setEditingLesson({ ...editingLesson, quizQuestions: copy });
                                                                    }}
                                                                />
                                                                <input
                                                                    type="text"
                                                                    className="input-text-standard"
                                                                    style={{
                                                                        backgroundColor:
                                                                            q.correctIndex === optIndex ? "#f0fdf4" : "#ffffff",
                                                                        borderColor:
                                                                            q.correctIndex === optIndex ? "#86efac" : "#cbd5e1"
                                                                    }}
                                                                    value={opt}
                                                                    onChange={(e) => {
                                                                        const copy = [...editingLesson.quizQuestions];
                                                                        copy[qIndex].options[optIndex] = e.target.value;
                                                                        setEditingLesson({ ...editingLesson, quizQuestions: copy });
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="form-group-block" style={{ margin: 0 }}>
                                                    <label style={{ fontSize: "0.75rem" }}>Theological Explanation for Answer</label>
                                                    <input
                                                        type="text"
                                                        className="input-text-standard"
                                                        placeholder="Explains why the correct answer was selected..."
                                                        value={q.explanation || ""}
                                                        onChange={(e) => {
                                                            const copy = [...editingLesson.quizQuestions];
                                                            copy[qIndex].explanation = e.target.value;
                                                            setEditingLesson({ ...editingLesson, quizQuestions: copy });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* TAB 5: PRACTICAL ASSIGNMENT */}
                            {activeModalTab === "assignment" && (
                                <div>
                                    <div className="form-group-block">
                                        <label>Practical Ministry Assignment / Field Reflection Prompt</label>
                                        <textarea
                                            className="textarea-standard"
                                            rows={5}
                                            placeholder="Write the assignment prompt that students must submit after completing this lesson..."
                                            value={editingLesson.assignmentPrompt || ""}
                                            onChange={(e) =>
                                                setEditingLesson({
                                                    ...editingLesson,
                                                    assignmentPrompt: e.target.value
                                                })
                                            }
                                        />
                                        <div className="form-hint-text">
                                            Students will type their reflection into the submission box in their Student Learning Area.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="modal-footer-bar">
                            <button
                                className="studio-btn studio-btn-secondary"
                                onClick={() => setIsAuthorModalOpen(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="studio-btn studio-btn-primary"
                                onClick={handleSaveLesson}
                            >
                                <Save size={16} />
                                <span>Save Lesson Changes</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================
                STUDENT SUBMISSIONS & GRADING MODAL
            ========================================================= */}
            {isSubmissionsModalOpen && (
                <div className="modal-backdrop-overlay">
                    <div className="author-modal-container" style={{ maxWidth: "800px" }}>
                        <div className="modal-header-bar">
                            <div>
                                <h2>
                                    <MessageSquare size={20} />
                                    <span>Student Assignment Submissions • {activeSubject.code}</span>
                                </h2>
                                <p className="modal-subtitle">
                                    Review students' written reflections and assign grades/feedback.
                                </p>
                            </div>
                            <button
                                className="modal-close-btn"
                                onClick={() => setIsSubmissionsModalOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body-scroll">
                            {activeSubjectSubmissions.length === 0 ? (
                                <div className="lessons-empty-state">
                                    <h4>No student submissions for {activeSubject.code} yet.</h4>
                                    <p>When enrolled students submit their reflections, they will appear here for grading.</p>
                                </div>
                            ) : (
                                activeSubjectSubmissions.map((sub) => (
                                    <div
                                        key={sub.id}
                                        style={{
                                            background: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "8px",
                                            padding: "16px",
                                            marginBottom: "14px"
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                            <div>
                                                <h4 style={{ margin: "0 0 2px 0", fontSize: "0.95rem" }}>
                                                    {sub.studentName} ({sub.studentId})
                                                </h4>
                                                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                                    Submitted: {new Date(sub.submissionDate).toLocaleString()} • Quiz Score: {sub.quizScore ?? 100}%
                                                </span>
                                            </div>
                                            <span
                                                className={`status-badge ${
                                                    sub.status === "APPROVED" ? "published" : "draft"
                                                }`}
                                            >
                                                {sub.status === "APPROVED" ? `Graded: ${sub.grade}` : "Pending Review"}
                                            </span>
                                        </div>

                                        <div
                                            style={{
                                                backgroundColor: "#f8fafc",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "6px",
                                                padding: "12px",
                                                fontSize: "0.85rem",
                                                lineHeight: 1.5,
                                                color: "#334155",
                                                marginBottom: "10px"
                                            }}
                                        >
                                            <strong>Student Reflection:</strong>
                                            <p style={{ margin: "6px 0 0 0" }}>{sub.reflectionText}</p>
                                        </div>

                                        {sub.feedback && (
                                            <div style={{ fontSize: "0.8rem", color: "#166534", marginBottom: "8px" }}>
                                                <strong>Faculty Feedback:</strong> {sub.feedback}
                                            </div>
                                        )}

                                        <button
                                            className="studio-btn studio-btn-secondary"
                                            style={{ fontSize: "0.75rem", padding: "6px 12px" }}
                                            onClick={() => {
                                                setSelectedSubmissionToGrade(sub);
                                                setGradingScore(sub.grade || "A (95%)");
                                                setGradingFeedback(sub.feedback || "Well-articulated reflection.");
                                            }}
                                        >
                                            <Edit3 size={12} />
                                            <span>{sub.status === "APPROVED" ? "Update Grade" : "Grade & Leave Feedback"}</span>
                                        </button>
                                    </div>
                                ))
                            )}

                            {/* Grading sub-modal / form */}
                            {selectedSubmissionToGrade && (
                                <div
                                    style={{
                                        marginTop: "16px",
                                        padding: "16px",
                                        background: "#eff6ff",
                                        border: "1px solid #bfdbfe",
                                        borderRadius: "8px"
                                    }}
                                >
                                    <h4 style={{ margin: "0 0 10px 0", color: "#1e40af" }}>
                                        Grading: {selectedSubmissionToGrade.studentName}
                                    </h4>
                                    <div className="row-2-col" style={{ marginBottom: "10px" }}>
                                        <div>
                                            <label style={{ fontSize: "0.75rem", fontWeight: 700 }}>Grade / Score</label>
                                            <input
                                                type="text"
                                                className="input-text-standard"
                                                value={gradingScore}
                                                onChange={(e) => setGradingScore(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: "10px" }}>
                                        <label style={{ fontSize: "0.75rem", fontWeight: 700 }}>Faculty Remarks / Feedback</label>
                                        <textarea
                                            className="textarea-standard"
                                            rows={2}
                                            value={gradingFeedback}
                                            onChange={(e) => setGradingFeedback(e.target.value)}
                                        />
                                    </div>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button
                                            className="studio-btn studio-btn-primary"
                                            onClick={handleSaveGrade}
                                        >
                                            <Check size={14} />
                                            <span>Approve & Save Grade</span>
                                        </button>
                                        <button
                                            className="studio-btn studio-btn-secondary"
                                            onClick={() => setSelectedSubmissionToGrade(null)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer-bar">
                            <button
                                className="studio-btn studio-btn-secondary"
                                onClick={() => setIsSubmissionsModalOpen(false)}
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

export default FacultyLessonEditor;
