import React, { useState, useEffect, useMemo } from "react";
import {
    BookOpen,
    Plus,
    Edit3,
    Trash2,
    Search,
    RotateCcw,
    DollarSign,
    Clock,
    MapPin,
    User,
    GraduationCap,
    Layers,
    Building,
    CheckCircle2,
    Calendar,
    ChevronRight,
    AlertCircle,
    X,
    Save,
    ArrowLeft
} from "lucide-react";
import { courseCurriculumService } from "../../services/courseCurriculumService";
import type {
    CourseProgram,
    CourseSubject,
    ModeOfLearningType
} from "../../services/courseCurriculumService";
import "./CourseSubjectManager.css";

const LEARNING_MODES: { label: string; value: ModeOfLearningType; desc: string }[] = [
    {
        label: "Modular Field Cohort",
        value: "Modular Field Cohort",
        desc: "Weekend intensive hub rotation across provincial branches with offline workbooks."
    },
    {
        label: "Hybrid Cloud / Offline Sync",
        value: "Hybrid Cloud / Offline Sync",
        desc: "Interactive video modules, offline local database caching and bi-weekly sync."
    },
    {
        label: "Weekend Intensive",
        value: "Weekend Intensive",
        desc: "Friday evening to Sunday pastoral seminars for working professionals."
    },
    {
        label: "Online Distance Learning",
        value: "Online Distance Learning",
        desc: "100% remote asynchronous video lectures and weekly Zoom preceptorials."
    },
    {
        label: "On-Campus Resident",
        value: "On-Campus Resident",
        desc: "Full-time resident theological lecture and chapel ministry immersion."
    }
];

const SCHEDULE_PRESETS = [
    "Fri-Sun 8:00 AM - 12:00 PM (Modular)",
    "Fri-Sun 1:00 PM - 5:00 PM (Modular)",
    "Saturday 8:00 AM - 12:00 PM (Intensive)",
    "Saturday 1:00 PM - 5:00 PM (Intensive)",
    "Mon & Wed 6:00 PM - 8:30 PM (Evening)",
    "Tue & Thu 6:00 PM - 8:30 PM (Evening)",
    "Online Flexible / Asynchronous Modules",
    "Online Live Discussion • Thu 7:00 PM - 9:00 PM"
];

export interface CourseSubjectManagerProps {
    onBack?: () => void;
}

export const CourseSubjectManager: React.FC<CourseSubjectManagerProps> = ({ onBack }) => {
    const [courses, setCourses] = useState<CourseProgram[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const [courseSearch, setCourseSearch] = useState<string>("");
    const [subjectSearch, setSubjectSearch] = useState<string>("");
    const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Course Modal State
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<CourseProgram | null>(null);
    const [courseForm, setCourseForm] = useState<{
        code: string;
        name: string;
        department: string;
        degreeLevel: "Undergraduate" | "Graduate / Seminary" | "Diploma" | "Certificate" | "Basic Education";
        modeOfLearning: ModeOfLearningType;
        paymentPerUnit: number;
        totalYears: number;
        deanOrHead: string;
        description: string;
    }>({
        code: "",
        name: "",
        department: "School of Theology & Biblical Studies",
        degreeLevel: "Undergraduate",
        modeOfLearning: "Modular Field Cohort",
        paymentPerUnit: 350,
        totalYears: 4,
        deanOrHead: "",
        description: ""
    });

    // Subject Modal State
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<CourseSubject | null>(null);
    const [subjectForm, setSubjectForm] = useState<CourseSubject>({
        code: "",
        title: "",
        units: 3,
        lectureHours: 3,
        labHours: 0,
        schedule: "Fri-Sun 8:00 AM - 12:00 PM (Modular)",
        room: "Field Hub • Room 101",
        instructor: "Dr. Samuel Vance",
        modeOfLearning: "Modular Field Cohort",
        prerequisite: "",
        yearLevel: "1st Year"
    });

    // Refresh courses list
    const refreshCourses = () => {
        const list = courseCurriculumService.getCourses();
        setCourses(list);
        if (list.length > 0 && (!selectedCourseId || !list.find(c => c.id === selectedCourseId || c.code === selectedCourseId))) {
            setSelectedCourseId(list[0].id || list[0].code);
        }
    };

    useEffect(() => {
        refreshCourses();
        const unsubscribe = courseCurriculumService.subscribe(() => {
            refreshCourses();
        });
        return () => unsubscribe();
    }, []);

    // Currently selected course
    const selectedCourse = useMemo(() => {
        return courses.find(c => c.id === selectedCourseId || c.code === selectedCourseId) || courses[0];
    }, [courses, selectedCourseId]);

    // Filtered courses
    const filteredCourses = useMemo(() => {
        if (!courseSearch.trim()) return courses;
        const q = courseSearch.toLowerCase();
        return courses.filter(
            c =>
                c.name.toLowerCase().includes(q) ||
                c.code.toLowerCase().includes(q) ||
                c.department.toLowerCase().includes(q) ||
                c.modeOfLearning.toLowerCase().includes(q)
        );
    }, [courses, courseSearch]);

    // Filtered subjects of currently selected course
    const filteredSubjects = useMemo(() => {
        if (!selectedCourse) return [];
        if (!subjectSearch.trim()) return selectedCourse.subjects || [];
        const q = subjectSearch.toLowerCase();
        return (selectedCourse.subjects || []).filter(
            s =>
                s.title.toLowerCase().includes(q) ||
                s.code.toLowerCase().includes(q) ||
                s.instructor.toLowerCase().includes(q) ||
                s.room.toLowerCase().includes(q) ||
                (s.modeOfLearning && s.modeOfLearning.toLowerCase().includes(q))
        );
    }, [selectedCourse, subjectSearch]);

    const totalCourseUnits = useMemo(() => {
        if (!selectedCourse?.subjects) return 0;
        return selectedCourse.subjects.reduce((sum, s) => sum + (s.units || 0), 0);
    }, [selectedCourse]);

    const showFeedback = (type: "success" | "error", text: string) => {
        setFeedbackMessage({ type, text });
        setTimeout(() => setFeedbackMessage(null), 4500);
    };

    // Open Modal for New Course
    const handleOpenAddCourse = () => {
        setEditingCourse(null);
        setCourseForm({
            code: "",
            name: "",
            department: "School of Theology & Biblical Studies",
            degreeLevel: "Undergraduate",
            modeOfLearning: "Modular Field Cohort",
            paymentPerUnit: 350,
            totalYears: 4,
            deanOrHead: "Dr. Samuel Vance, Th.D.",
            description: ""
        });
        setIsCourseModalOpen(true);
    };

    // Open Modal for Editing Course
    const handleOpenEditCourse = (course: CourseProgram, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setEditingCourse(course);
        setCourseForm({
            code: course.code,
            name: course.name,
            department: course.department,
            degreeLevel: course.degreeLevel,
            modeOfLearning: course.modeOfLearning,
            paymentPerUnit: course.paymentPerUnit,
            totalYears: course.totalYears,
            deanOrHead: course.deanOrHead,
            description: course.description || ""
        });
        setIsCourseModalOpen(true);
    };

    // Save Course
    const handleSaveCourse = (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseForm.code.trim() || !courseForm.name.trim()) {
            showFeedback("error", "Course Code and Course Name are required.");
            return;
        }

        const id = editingCourse ? editingCourse.id : courseForm.code.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const newCourse: CourseProgram = {
            id,
            code: courseForm.code.trim().toUpperCase(),
            name: courseForm.name.trim(),
            department: courseForm.department.trim(),
            degreeLevel: courseForm.degreeLevel,
            modeOfLearning: courseForm.modeOfLearning,
            paymentPerUnit: Number(courseForm.paymentPerUnit) || 0,
            totalYears: Number(courseForm.totalYears) || 4,
            deanOrHead: courseForm.deanOrHead.trim(),
            description: courseForm.description.trim(),
            subjects: editingCourse ? editingCourse.subjects : []
        };

        try {
            courseCurriculumService.saveCourse(newCourse);
            setIsCourseModalOpen(false);
            setSelectedCourseId(newCourse.id);
            refreshCourses();
            showFeedback("success", `Course program '${newCourse.name}' saved successfully.`);
        } catch (err: unknown) {
            const e = err as Error;
            showFeedback("error", e.message || "Failed to save course.");
        }
    };

    // Delete Course
    const handleDeleteCourse = (course: CourseProgram, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (courses.length <= 1) {
            alert("At least one course program must remain in the curriculum catalog.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete course program:\n\n${course.name} (${course.code})\n\nThis will remove this course and its ${course.subjects.length} subjects from the catalog.`
        );
        if (!confirmed) return;

        courseCurriculumService.deleteCourse(course.id);
        refreshCourses();
        showFeedback("success", `Course '${course.name}' deleted.`);
    };

    // Open Modal for New Subject
    const handleOpenAddSubject = () => {
        if (!selectedCourse) return;
        setEditingSubject(null);
        setSubjectForm({
            code: "",
            title: "",
            units: 3,
            lectureHours: 3,
            labHours: 0,
            schedule: "Fri-Sun 8:00 AM - 12:00 PM (Modular)",
            room: "Field Hub • Room 101",
            instructor: selectedCourse.deanOrHead || "Dr. Samuel Vance",
            modeOfLearning: selectedCourse.modeOfLearning || "Modular Field Cohort",
            prerequisite: "",
            yearLevel: "1st Year"
        });
        setIsSubjectModalOpen(true);
    };

    // Open Modal for Editing Subject
    const handleOpenEditSubject = (subject: CourseSubject) => {
        setEditingSubject(subject);
        setSubjectForm({ ...subject });
        setIsSubjectModalOpen(true);
    };

    // Save Subject
    const handleSaveSubject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourse) return;
        if (!subjectForm.code.trim() || !subjectForm.title.trim()) {
            showFeedback("error", "Subject Code and Title are required.");
            return;
        }

        const preparedSubject: CourseSubject = {
            ...subjectForm,
            code: subjectForm.code.trim().toUpperCase(),
            title: subjectForm.title.trim(),
            units: Number(subjectForm.units) || 3,
            lectureHours: Number(subjectForm.lectureHours) || 3,
            labHours: Number(subjectForm.labHours) || 0,
            schedule: subjectForm.schedule.trim(),
            room: subjectForm.room.trim(),
            instructor: subjectForm.instructor.trim(),
            modeOfLearning: subjectForm.modeOfLearning || selectedCourse.modeOfLearning,
            prerequisite: subjectForm.prerequisite?.trim() || undefined,
            yearLevel: subjectForm.yearLevel || "1st Year"
        };

        try {
            if (editingSubject) {
                courseCurriculumService.updateSubjectInCourse(
                    selectedCourse.code,
                    editingSubject.code,
                    preparedSubject
                );
                showFeedback("success", `Subject '${preparedSubject.code}' updated in ${selectedCourse.code}.`);
            } else {
                courseCurriculumService.addSubjectToCourse(selectedCourse.code, preparedSubject);
                showFeedback("success", `Subject '${preparedSubject.code}' added to ${selectedCourse.code}.`);
            }

            setIsSubjectModalOpen(false);
            refreshCourses();
        } catch (err: unknown) {
            const e = err as Error;
            showFeedback("error", e.message || "Failed to save subject.");
        }
    };

    // Delete Subject
    const handleDeleteSubject = (subject: CourseSubject) => {
        if (!selectedCourse) return;
        const confirmed = window.confirm(
            `Delete subject ${subject.code} - ${subject.title} from ${selectedCourse.name}?`
        );
        if (!confirmed) return;

        courseCurriculumService.deleteSubjectFromCourse(selectedCourse.code, subject.code);
        refreshCourses();
        showFeedback("success", `Subject ${subject.code} deleted.`);
    };

    // Reset to defaults
    const handleResetDefaults = () => {
        const confirmed = window.confirm(
            "Are you sure you want to reset all courses and subjects to Mobile Bible School defaults?\n\nThis will restore Bachelor of Theology, Master of Divinity, Diploma in Pastoral Ministry, and Certificate in Biblical Studies."
        );
        if (!confirmed) return;

        courseCurriculumService.resetToDefaults();
        refreshCourses();
        showFeedback("success", "Curriculum catalog reset to Mobile Bible School defaults.");
    };

    return (
        <div className="course-mgr-container">
            {/* Topbar / Header */}
            <div className="course-mgr-header">
                <div className="course-mgr-header-left">
                    {onBack && (
                        <button
                            type="button"
                            className="course-mgr-back-btn"
                            onClick={onBack}
                            title="Return to Student Directory"
                        >
                            <ArrowLeft size={16} />
                            <span>Back to Directory</span>
                        </button>
                    )}
                    <div className="course-mgr-icon-circle">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <div className="course-mgr-title-row">
                            <h1 className="course-mgr-title">Course Curriculum & Subject Catalog</h1>
                            <span className="course-mgr-badge">Mobile Bible School CMS</span>
                        </div>
                        <p className="course-mgr-subtitle">
                            Manually configure courses, units, class schedules, modes of learning, and editable tuition rates per unit.
                        </p>
                    </div>
                </div>

                <div className="course-mgr-header-actions">
                    <button
                        type="button"
                        className="course-mgr-btn btn-secondary"
                        onClick={handleResetDefaults}
                        title="Restore theological curriculum defaults"
                    >
                        <RotateCcw size={16} />
                        <span>Reset Defaults</span>
                    </button>
                    <button
                        type="button"
                        className="course-mgr-btn btn-primary"
                        onClick={handleOpenAddCourse}
                    >
                        <Plus size={17} />
                        <span>Add New Course</span>
                    </button>
                </div>
            </div>

            {/* Notification alert */}
            {feedbackMessage && (
                <div className={`course-mgr-feedback ${feedbackMessage.type}`}>
                    {feedbackMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span>{feedbackMessage.text}</span>
                </div>
            )}

            {/* Main Split Layout */}
            <div className="course-mgr-split-layout">
                {/* LEFT SIDEBAR: List of Courses */}
                <div className="course-sidebar-card">
                    <div className="course-sidebar-header">
                        <div className="sidebar-header-title">
                            <GraduationCap size={18} />
                            <span>Academic Programs</span>
                            <span className="count-pill">{courses.length}</span>
                        </div>
                        <div className="course-search-box">
                            <Search size={14} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search courses or codes..."
                                value={courseSearch}
                                onChange={e => setCourseSearch(e.target.value)}
                            />
                            {courseSearch && (
                                <button
                                    type="button"
                                    className="clear-search-btn"
                                    onClick={() => setCourseSearch("")}
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="course-items-list">
                        {filteredCourses.map(course => {
                            const isSelected = selectedCourse?.id === course.id || selectedCourse?.code === course.code;
                            const subjectCount = course.subjects?.length || 0;
                            const courseUnits = (course.subjects || []).reduce((sum, s) => sum + s.units, 0);

                            return (
                                <div
                                    key={course.id || course.code}
                                    className={`course-list-item ${isSelected ? "selected" : ""}`}
                                    onClick={() => setSelectedCourseId(course.id || course.code)}
                                >
                                    <div className="item-header-row">
                                        <span className="course-code-pill">{course.code}</span>
                                        <div className="item-actions">
                                            <button
                                                type="button"
                                                className="icon-action-btn edit"
                                                onClick={e => handleOpenEditCourse(course, e)}
                                                title="Edit Course Details"
                                            >
                                                <Edit3 size={13} />
                                            </button>
                                            <button
                                                type="button"
                                                className="icon-action-btn delete"
                                                onClick={e => handleDeleteCourse(course, e)}
                                                title="Delete Course"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>

                                    <h4 className="course-name-title">{course.name}</h4>

                                    <div className="course-meta-tags">
                                        <span className="meta-tag mode-tag">
                                            <Layers size={11} />
                                            {course.modeOfLearning}
                                        </span>
                                        <span className="meta-tag rate-tag">
                                            <DollarSign size={11} />
                                            ₱{course.paymentPerUnit.toLocaleString()} / unit
                                        </span>
                                    </div>

                                    <div className="course-footer-stats">
                                        <span>{subjectCount} Subjects</span>
                                        <span>•</span>
                                        <span>{courseUnits} Total Units</span>
                                        <ChevronRight size={14} className="item-chevron" />
                                    </div>
                                </div>
                            );
                        })}

                        {filteredCourses.length === 0 && (
                            <div className="sidebar-empty-state">
                                <BookOpen size={32} />
                                <p>No matching courses found</p>
                                <button type="button" onClick={handleOpenAddCourse}>
                                    + Create Course
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT MAIN PANEL: Selected Course Details & Subject Catalog */}
                <div className="course-detail-panel">
                    {selectedCourse ? (
                        <>
                            {/* Course Overview Banner Card */}
                            <div className="course-overview-card">
                                <div className="course-overview-header">
                                    <div>
                                        <div className="course-overview-badges">
                                            <span className="badge-code">{selectedCourse.code}</span>
                                            <span className="badge-degree">{selectedCourse.degreeLevel}</span>
                                            <span className="badge-mode">
                                                <Layers size={13} />
                                                {selectedCourse.modeOfLearning}
                                            </span>
                                        </div>
                                        <h2 className="course-overview-title">{selectedCourse.name}</h2>
                                        <p className="course-overview-department">
                                            <Building size={14} />
                                            <span>{selectedCourse.department}</span>
                                            <span className="divider">•</span>
                                            <User size={14} />
                                            <span>Dean: {selectedCourse.deanOrHead || "Faculty Office"}</span>
                                        </p>
                                    </div>

                                    <div className="course-overview-actions">
                                        <button
                                            type="button"
                                            className="course-mgr-btn btn-secondary"
                                            onClick={e => handleOpenEditCourse(selectedCourse, e)}
                                        >
                                            <Edit3 size={15} />
                                            <span>Edit Course Info</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="course-mgr-btn btn-primary"
                                            onClick={handleOpenAddSubject}
                                        >
                                            <Plus size={16} />
                                            <span>Add Subject to Course</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Financial Rate & Academic Load Metrics */}
                                <div className="course-metrics-row">
                                    <div className="metric-box rate-box">
                                        <div className="metric-icon">
                                            <DollarSign size={20} />
                                        </div>
                                        <div>
                                            <span className="metric-label">TUITION PER UNIT</span>
                                            <div className="metric-value-row">
                                                <strong className="metric-value">₱{selectedCourse.paymentPerUnit.toLocaleString()}</strong>
                                                <span className="metric-unit">/ unit</span>
                                            </div>
                                            <span className="metric-note">Editable for student enrollment</span>
                                        </div>
                                    </div>

                                    <div className="metric-box">
                                        <div className="metric-icon">
                                            <BookOpen size={20} />
                                        </div>
                                        <div>
                                            <span className="metric-label">CURRICULUM LOAD</span>
                                            <div className="metric-value-row">
                                                <strong className="metric-value">{totalCourseUnits}.0</strong>
                                                <span className="metric-unit">Units</span>
                                            </div>
                                            <span className="metric-note">{selectedCourse.subjects.length} Subjects Defined</span>
                                        </div>
                                    </div>

                                    <div className="metric-box">
                                        <div className="metric-icon">
                                            <Layers size={20} />
                                        </div>
                                        <div>
                                            <span className="metric-label">DEFAULT MODE OF LEARNING</span>
                                            <div className="metric-value-row">
                                                <strong className="metric-value mode-text">{selectedCourse.modeOfLearning}</strong>
                                            </div>
                                            <span className="metric-note">Inherited upon student enlistment</span>
                                        </div>
                                    </div>

                                    <div className="metric-box">
                                        <div className="metric-icon">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <span className="metric-label">PROGRAM DURATION</span>
                                            <div className="metric-value-row">
                                                <strong className="metric-value">{selectedCourse.totalYears} Years</strong>
                                            </div>
                                            <span className="metric-note">{selectedCourse.degreeLevel}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subjects Catalog Table Card */}
                            <div className="course-subjects-card">
                                <div className="subjects-card-header">
                                    <div>
                                        <h3 className="subjects-card-title">
                                            Subjects Under {selectedCourse.name}
                                        </h3>
                                        <p className="subjects-card-desc">
                                            These subjects will appear in the enrollment modal and will compute the student's study load and tuition fee in their profile.
                                        </p>
                                    </div>

                                    <div className="subjects-filter-actions">
                                        <div className="subject-search-input">
                                            <Search size={14} className="search-icon" />
                                            <input
                                                type="text"
                                                placeholder="Filter subjects, instructor or schedule..."
                                                value={subjectSearch}
                                                onChange={e => setSubjectSearch(e.target.value)}
                                            />
                                            {subjectSearch && (
                                                <button
                                                    type="button"
                                                    className="clear-search-btn"
                                                    onClick={() => setSubjectSearch("")}
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            className="course-mgr-btn btn-primary btn-sm"
                                            onClick={handleOpenAddSubject}
                                        >
                                            <Plus size={15} />
                                            <span>Add Subject</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="subjects-table-responsive">
                                    <table className="course-subjects-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: "50px" }}>#</th>
                                                <th style={{ width: "120px" }}>CODE</th>
                                                <th>SUBJECT TITLE</th>
                                                <th style={{ width: "80px", textAlign: "center" }}>UNITS</th>
                                                <th style={{ width: "210px" }}>CLASS SCHEDULE</th>
                                                <th style={{ width: "160px" }}>ROOM / VENUE</th>
                                                <th style={{ width: "180px" }}>MODE OF LEARNING</th>
                                                <th style={{ width: "160px" }}>INSTRUCTOR</th>
                                                <th style={{ width: "90px", textAlign: "right" }}>ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSubjects.map((sub, index) => (
                                                <tr key={sub.code}>
                                                    <td className="row-index">{index + 1}</td>
                                                    <td>
                                                        <span className="sub-code-badge">{sub.code}</span>
                                                    </td>
                                                    <td>
                                                        <div className="sub-title-cell">
                                                            <strong>{sub.title}</strong>
                                                            {sub.prerequisite && (
                                                                <span className="sub-prereq-pill">
                                                                    Prereq: {sub.prerequisite}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: "center" }}>
                                                        <span className="sub-units-pill">{sub.units}.0</span>
                                                    </td>
                                                    <td>
                                                        <div className="sub-schedule-cell">
                                                            <Clock size={13} />
                                                            <span>{sub.schedule}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="sub-room-cell">
                                                            <MapPin size={13} />
                                                            <span>{sub.room}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="sub-learning-mode-badge">
                                                            <Layers size={12} />
                                                            <span>{sub.modeOfLearning || selectedCourse.modeOfLearning}</span>
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="sub-instructor-cell">
                                                            <User size={13} />
                                                            <span>{sub.instructor}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: "right" }}>
                                                        <div className="sub-action-buttons">
                                                            <button
                                                                type="button"
                                                                className="icon-action-btn edit"
                                                                onClick={() => handleOpenEditSubject(sub)}
                                                                title="Edit Subject Details"
                                                            >
                                                                <Edit3 size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="icon-action-btn delete"
                                                                onClick={() => handleDeleteSubject(sub)}
                                                                title="Delete Subject"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}

                                            {filteredSubjects.length === 0 && (
                                                <tr>
                                                    <td colSpan={9} className="table-empty-row">
                                                        <div className="table-empty-content">
                                                            <BookOpen size={36} />
                                                            <p>No subjects found for this course.</p>
                                                            <button
                                                                type="button"
                                                                className="course-mgr-btn btn-primary btn-sm"
                                                                onClick={handleOpenAddSubject}
                                                            >
                                                                + Add First Subject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        {filteredSubjects.length > 0 && (
                                            <tfoot>
                                                <tr>
                                                    <td colSpan={3} className="footer-total-label">
                                                        <strong>TOTAL ENLISTED UNITS IN COURSE:</strong>
                                                    </td>
                                                    <td style={{ textAlign: "center" }} className="footer-total-units">
                                                        <strong>{totalCourseUnits}.0</strong>
                                                    </td>
                                                    <td colSpan={5} className="footer-tuition-calc">
                                                        <span>
                                                            Estimated full semestral tuition load:{" "}
                                                            <strong>₱{(totalCourseUnits * selectedCourse.paymentPerUnit).toLocaleString()}</strong>{" "}
                                                            (@ ₱{selectedCourse.paymentPerUnit}/unit)
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="no-course-selected">
                            <BookOpen size={48} />
                            <h3>No Course Selected</h3>
                            <p>Select a course program from the left sidebar or create a new one.</p>
                            <button
                                type="button"
                                className="course-mgr-btn btn-primary"
                                onClick={handleOpenAddCourse}
                            >
                                <Plus size={16} />
                                <span>Create Course Program</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL 1: ADD / EDIT COURSE PROGRAM */}
            {isCourseModalOpen && (
                <div className="course-mgr-modal-overlay" onClick={() => setIsCourseModalOpen(false)}>
                    <div className="course-mgr-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-card-header">
                            <div className="modal-header-title">
                                <GraduationCap size={20} />
                                <h3>{editingCourse ? "Edit Course Program" : "Add New Academic Course"}</h3>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setIsCourseModalOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveCourse}>
                            <div className="modal-card-body">
                                <div className="form-grid-2">
                                    <div className="modal-form-group">
                                        <label>COURSE CODE *</label>
                                        <input
                                            type="text"
                                            required
                                            value={courseForm.code}
                                            onChange={e => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
                                            placeholder="e.g. B-TH, M-DIV, DIP-PM"
                                        />
                                        <span className="field-hint">Unique academic program abbreviation</span>
                                    </div>

                                    <div className="modal-form-group">
                                        <label>DEGREE LEVEL *</label>
                                        <select
                                            value={courseForm.degreeLevel}
                                            onChange={e =>
                                                setCourseForm({
                                                    ...courseForm,
                                                    degreeLevel: e.target.value as any
                                                })
                                            }
                                        >
                                            <option value="Undergraduate">Undergraduate (Bachelor)</option>
                                            <option value="Graduate / Seminary">Graduate / Seminary (Master/Doctorate)</option>
                                            <option value="Diploma">Diploma (2-Year Ministry)</option>
                                            <option value="Certificate">Certificate (Foundational / Lay)</option>
                                            <option value="Basic Education">Basic Education</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="modal-form-group">
                                    <label>FULL COURSE / PROGRAM NAME *</label>
                                    <input
                                        type="text"
                                        required
                                        value={courseForm.name}
                                        onChange={e => setCourseForm({ ...courseForm, name: e.target.value })}
                                        placeholder="e.g. Bachelor of Theology (B.Th.)"
                                    />
                                </div>

                                <div className="form-grid-2">
                                    <div className="modal-form-group">
                                        <label>DEPARTMENT / FACULTY *</label>
                                        <input
                                            type="text"
                                            required
                                            value={courseForm.department}
                                            onChange={e => setCourseForm({ ...courseForm, department: e.target.value })}
                                            placeholder="e.g. School of Theology & Biblical Languages"
                                        />
                                    </div>

                                    <div className="modal-form-group">
                                        <label>DEAN / PROGRAM HEAD</label>
                                        <input
                                            type="text"
                                            value={courseForm.deanOrHead}
                                            onChange={e => setCourseForm({ ...courseForm, deanOrHead: e.target.value })}
                                            placeholder="e.g. Dr. Samuel Vance, Th.D."
                                        />
                                    </div>
                                </div>

                                <div className="form-grid-2">
                                    <div className="modal-form-group">
                                        <label>DEFAULT MODE OF LEARNING *</label>
                                        <select
                                            value={courseForm.modeOfLearning}
                                            onChange={e =>
                                                setCourseForm({
                                                    ...courseForm,
                                                    modeOfLearning: e.target.value as ModeOfLearningType
                                                })
                                            }
                                        >
                                            {LEARNING_MODES.map(m => (
                                                <option key={m.value} value={m.value}>
                                                    {m.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="modal-form-group highlight-financial">
                                        <label>TUITION PAYMENT PER UNIT (₱) *</label>
                                        <div className="input-with-icon">
                                            <span className="currency-prefix">₱</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="10"
                                                required
                                                value={courseForm.paymentPerUnit}
                                                onChange={e =>
                                                    setCourseForm({
                                                        ...courseForm,
                                                        paymentPerUnit: Math.max(0, Number(e.target.value))
                                                    })
                                                }
                                                placeholder="350"
                                            />
                                        </div>
                                        <span className="field-hint">Automatically multiplied by enrolled units</span>
                                    </div>
                                </div>

                                <div className="form-grid-2">
                                    <div className="modal-form-group">
                                        <label>PROGRAM DURATION (YEARS)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="6"
                                            value={courseForm.totalYears}
                                            onChange={e =>
                                                setCourseForm({
                                                    ...courseForm,
                                                    totalYears: Number(e.target.value) || 4
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="modal-form-group">
                                        <label>DESCRIPTION / REMARKS</label>
                                        <input
                                            type="text"
                                            value={courseForm.description}
                                            onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                                            placeholder="e.g. Four-year training for ordained pastorate"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-card-footer">
                                <button
                                    type="button"
                                    className="course-mgr-btn btn-secondary"
                                    onClick={() => setIsCourseModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="course-mgr-btn btn-primary">
                                    <Save size={16} />
                                    <span>{editingCourse ? "Update Course Program" : "Create Course"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: ADD / EDIT SUBJECT IN COURSE */}
            {isSubjectModalOpen && (
                <div className="course-mgr-modal-overlay" onClick={() => setIsSubjectModalOpen(false)}>
                    <div className="course-mgr-modal-card modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-card-header">
                            <div className="modal-header-title">
                                <BookOpen size={20} />
                                <div>
                                    <h3>{editingSubject ? "Edit Subject Details" : "Add Subject to Course"}</h3>
                                    <span className="modal-subtitle">
                                        Target Course: <strong>{selectedCourse?.name} ({selectedCourse?.code})</strong>
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setIsSubjectModalOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveSubject}>
                            <div className="modal-card-body">
                                <div className="form-grid-3">
                                    <div className="modal-form-group">
                                        <label>SUBJECT CODE *</label>
                                        <input
                                            type="text"
                                            required
                                            value={subjectForm.code}
                                            onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                                            placeholder="e.g. HERM-101"
                                        />
                                    </div>

                                    <div className="modal-form-group">
                                        <label>CREDIT UNITS *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="12"
                                            step="0.5"
                                            required
                                            value={subjectForm.units}
                                            onChange={e =>
                                                setSubjectForm({
                                                    ...subjectForm,
                                                    units: Number(e.target.value) || 3
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="modal-form-group">
                                        <label>YEAR LEVEL</label>
                                        <select
                                            value={subjectForm.yearLevel || "1st Year"}
                                            onChange={e => setSubjectForm({ ...subjectForm, yearLevel: e.target.value })}
                                        >
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                            <option value="4th Year">4th Year</option>
                                            <option value="General / All">General / All Levels</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="modal-form-group">
                                    <label>DESCRIPTIVE SUBJECT TITLE *</label>
                                    <input
                                        type="text"
                                        required
                                        value={subjectForm.title}
                                        onChange={e => setSubjectForm({ ...subjectForm, title: e.target.value })}
                                        placeholder="e.g. Inductive Bible Study & Biblical Hermeneutics"
                                    />
                                </div>

                                {/* CLASS SCHEDULE WITH QUICK PRESETS */}
                                <div className="modal-form-group">
                                    <label className="flex-label">
                                        <span>CLASS SCHEDULE / TIME *</span>
                                        <span className="label-tip">Pick preset or customize</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={subjectForm.schedule}
                                        onChange={e => setSubjectForm({ ...subjectForm, schedule: e.target.value })}
                                        placeholder="e.g. Fri-Sun 8:00 AM - 12:00 PM (Modular)"
                                    />

                                    {/* Presets buttons */}
                                    <div className="schedule-presets-container">
                                        <span className="preset-label">Quick Presets:</span>
                                        <div className="preset-chips">
                                            {SCHEDULE_PRESETS.map((preset, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    className={`preset-chip ${subjectForm.schedule === preset ? "active" : ""}`}
                                                    onClick={() => setSubjectForm({ ...subjectForm, schedule: preset })}
                                                >
                                                    {preset}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-grid-2">
                                    <div className="modal-form-group">
                                        <label>ROOM / PHYSICAL VENUE / LINK *</label>
                                        <input
                                            type="text"
                                            required
                                            value={subjectForm.room}
                                            onChange={e => setSubjectForm({ ...subjectForm, room: e.target.value })}
                                            placeholder="e.g. Field Hub • Rm 101 or Virtual Zoom"
                                        />
                                    </div>

                                    <div className="modal-form-group">
                                        <label>INSTRUCTOR / PROFESSOR *</label>
                                        <input
                                            type="text"
                                            required
                                            value={subjectForm.instructor}
                                            onChange={e => setSubjectForm({ ...subjectForm, instructor: e.target.value })}
                                            placeholder="e.g. Dr. Samuel Vance"
                                        />
                                    </div>
                                </div>

                                <div className="form-grid-2">
                                    <div className="modal-form-group">
                                        <label>MODE OF LEARNING FOR THIS SUBJECT</label>
                                        <select
                                            value={subjectForm.modeOfLearning || selectedCourse?.modeOfLearning || "Modular Field Cohort"}
                                            onChange={e => setSubjectForm({ ...subjectForm, modeOfLearning: e.target.value })}
                                        >
                                            {LEARNING_MODES.map(m => (
                                                <option key={m.value} value={m.value}>
                                                    {m.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="modal-form-group">
                                        <label>PREREQUISITE SUBJECT (IF ANY)</label>
                                        <input
                                            type="text"
                                            value={subjectForm.prerequisite || ""}
                                            onChange={e => setSubjectForm({ ...subjectForm, prerequisite: e.target.value })}
                                            placeholder="e.g. HERM-101 or None"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-card-footer">
                                <button
                                    type="button"
                                    className="course-mgr-btn btn-secondary"
                                    onClick={() => setIsSubjectModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="course-mgr-btn btn-primary">
                                    <Save size={16} />
                                    <span>{editingSubject ? "Update Subject" : "Add Subject"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
