import React, { useState, useEffect, useMemo, useRef } from "react";
import {
    BookOpen,
    Plus,
    Edit3,
    Trash2,
    Search,
    RotateCcw,
    RefreshCw,
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
    ArrowLeft,
    Check,
    ChevronDown,
    BookMarked,
    Users,
    CheckSquare,
    Square,
    Sparkles
} from "lucide-react";
import {
    courseCurriculumService,
    PRESCRIBED_THEOLOGICAL_SUBJECTS,
    getSystemFacultyList
} from "../../services/courseCurriculumService";
import type {
    CourseProgram,
    CourseSubject,
    ModeOfLearningType,
    PrescribedSubject,
    FacultyInstructorOption
} from "../../services/courseCurriculumService";
import { apiClient } from "../../services/apiClient";
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
    const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("ALL");
    const [subjectSearch, setSubjectSearch] = useState<string>("");
    const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    // Course Modal State
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<CourseProgram | null>(null);
    const [courseForm, setCourseForm] = useState<{
        code: string;
        name: string;
        department: string;
        degreeLevel: "Undergraduate" | "Graduate / Seminary" | "Diploma" | "Certificate" | "Associate" | "Doctorate" | "Specialized / Bridge" | "Basic Education" | string;
        modeOfLearning: ModeOfLearningType;
        paymentPerUnit: number;
        totalYears: number;
        deanOrHead: string;
        description: string;
    }>({
        code: "",
        name: "",
        department: "Mobile Bible School & Theological Seminary",
        degreeLevel: "Undergraduate",
        modeOfLearning: "Modular Field Cohort",
        paymentPerUnit: 500,
        totalYears: 4,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
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
        instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
        modeOfLearning: "Modular Field Cohort",
        prerequisite: "",
        yearLevel: "1st Year"
    });

    // Faculty & Instructor Searchable Combobox State
    const [facultyList, setFacultyList] = useState<FacultyInstructorOption[]>([]);
    const [facultySearch, setFacultySearch] = useState<string>("");
    const [isFacultyDropdownOpen, setIsFacultyDropdownOpen] = useState(false);
    const [isCustomInstructor, setIsCustomInstructor] = useState(false);
    const facultyComboboxRef = useRef<HTMLDivElement>(null);

    // Prescribed Subject Catalog Selector State (Add/Edit Modal)
    const [catalogSearchQuery, setCatalogSearchQuery] = useState<string>("");
    const [selectedCatalogCode, setSelectedCatalogCode] = useState<string>("");

    // Batch Add Prescribed Subjects Modal State
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [batchSelectedCodes, setBatchSelectedCodes] = useState<string[]>([]);
    const [batchCategoryFilter, setBatchCategoryFilter] = useState<string>("ALL");
    const [batchSearchQuery, setBatchSearchQuery] = useState<string>("");
    const [batchInstructor, setBatchInstructor] = useState<string>("");
    const [batchRoom, setBatchRoom] = useState<string>("Field Hub • Room 101");
    const [batchSchedule, setBatchSchedule] = useState<string>("Fri-Sun 8:00 AM - 12:00 PM (Modular)");

    // Close faculty dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (facultyComboboxRef.current && !facultyComboboxRef.current.contains(e.target as Node)) {
                setIsFacultyDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Load faculties from local catalog + API users
    useEffect(() => {
        const initial = getSystemFacultyList();
        setFacultyList(initial);

        apiClient
            .get("/Users")
            .then(res => {
                if (Array.isArray(res.data)) {
                    const apiUsers: FacultyInstructorOption[] = res.data
                        .filter((u: any) => u.isActive !== false && u.fullName)
                        .map((u: any) => ({
                            fullName: u.fullName.trim(),
                            academicRank: u.role || "Faculty Instructor",
                            department: "School of Theology & Biblical Studies",
                            email: u.username?.includes("@") ? u.username : undefined
                        }));

                    setFacultyList(prev => {
                        const seen = new Set(prev.map(f => f.fullName.toLowerCase()));
                        const merged = [...prev];
                        apiUsers.forEach(u => {
                            if (!seen.has(u.fullName.toLowerCase())) {
                                seen.add(u.fullName.toLowerCase());
                                merged.push(u);
                            }
                        });
                        return merged;
                    });
                }
            })
            .catch(() => {
                // Ignore API failure; local catalog is active
            });
    }, []);

    // Filtered faculties for searchable dropdown
    const filteredFaculties = useMemo(() => {
        const q = facultySearch.trim().toLowerCase();
        if (!q) return facultyList;
        return facultyList.filter(
            f =>
                f.fullName.toLowerCase().includes(q) ||
                (f.academicRank && f.academicRank.toLowerCase().includes(q)) ||
                (f.department && f.department.toLowerCase().includes(q)) ||
                (f.email && f.email.toLowerCase().includes(q))
        );
    }, [facultyList, facultySearch]);

    // Grouped prescribed subjects for catalog picker
    const groupedPrescribedSubjects = useMemo(() => {
        const query = catalogSearchQuery.trim().toLowerCase();
        const map = new Map<string, PrescribedSubject[]>();

        PRESCRIBED_THEOLOGICAL_SUBJECTS.forEach(sub => {
            const matches =
                !query ||
                sub.code.toLowerCase().includes(query) ||
                sub.title.toLowerCase().includes(query) ||
                sub.category.toLowerCase().includes(query) ||
                sub.yearLevel.toLowerCase().includes(query);

            if (matches) {
                const list = map.get(sub.category) || [];
                list.push(sub);
                map.set(sub.category, list);
            }
        });

        return Array.from(map.entries()).map(([category, subjects]) => ({
            category,
            subjects
        }));
    }, [catalogSearchQuery]);

    const totalFilteredPrescribed = useMemo(() => {
        return groupedPrescribedSubjects.reduce((sum, g) => sum + g.subjects.length, 0);
    }, [groupedPrescribedSubjects]);

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
        // Load live courses from database
        courseCurriculumService.fetchCoursesFromApi().then(apiCourses => {
            if (apiCourses && apiCourses.length > 0) {
                setCourses(apiCourses);
            }
        }).catch(() => {});

        const unsubscribe = courseCurriculumService.subscribe(() => {
            refreshCourses();
        });
        return () => unsubscribe();
    }, []);

    // Manual sync with SQL Server database
    const handleSyncWithDb = async () => {
        setIsSyncing(true);
        try {
            const liveCourses = await courseCurriculumService.fetchCoursesFromApi();
            setCourses(liveCourses);
            showFeedback("success", `Synchronized ${liveCourses.length} authentic courses from database.`);
        } catch {
            showFeedback("error", "Failed to sync courses from database.");
        } finally {
            setIsSyncing(false);
        }
    };

    // Filtered courses
    const filteredCourses = useMemo(() => {
        let result = courses;
        if (selectedCategoryTab !== "ALL") {
            result = result.filter(c => {
                const level = (c.degreeLevel || "").toLowerCase();
                const dept = (c.department || "").toLowerCase();
                const name = (c.name || "").toLowerCase();
                const cat = selectedCategoryTab.toLowerCase();
                if (cat === "certificate") return level.includes("certificate") || dept.includes("certificate") || name.includes("certificate");
                if (cat === "diploma") return level.includes("diploma") || dept.includes("diploma") || name.includes("diploma");
                if (cat === "associate") return level.includes("associate") || dept.includes("associate") || name.includes("associate");
                if (cat === "bachelor") return level.includes("undergraduate") || level.includes("bachelor") || name.includes("bachelor") || name.includes("ab ");
                if (cat === "masteral") return level.includes("graduate") || level.includes("seminary") || level.includes("master") || name.includes("master");
                if (cat === "doctorate") return level.includes("doctorate") || name.includes("doctor");
                if (cat === "specialized") return level.includes("specialized") || level.includes("bridge") || dept.includes("subject") || dept.includes("honorary") || name.includes("bccst") || name.includes("llp") || name.includes("honorary");
                return true;
            });
        }
        if (!courseSearch.trim()) return result;
        const q = courseSearch.toLowerCase();
        return result.filter(
            c =>
                c.name.toLowerCase().includes(q) ||
                c.code.toLowerCase().includes(q) ||
                c.department.toLowerCase().includes(q) ||
                c.modeOfLearning.toLowerCase().includes(q)
        );
    }, [courses, courseSearch, selectedCategoryTab]);

    // Currently selected course
    const selectedCourse = useMemo(() => {
        return courses.find(c => c.id === selectedCourseId || c.code === selectedCourseId) || filteredCourses[0] || courses[0];
    }, [courses, filteredCourses, selectedCourseId]);

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
            department: "Mobile Bible School & Theological Seminary",
            degreeLevel: "Undergraduate",
            modeOfLearning: "Modular Field Cohort",
            paymentPerUnit: 500,
            totalYears: 4,
            deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
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

    // Handler: Pick Prescribed Subject from Catalog
    const handleSelectPrescribedSubject = (code: string) => {
        setSelectedCatalogCode(code);
        if (!code) return;
        const match = PRESCRIBED_THEOLOGICAL_SUBJECTS.find(s => s.code.toUpperCase() === code.toUpperCase());
        if (!match) return;

        setSubjectForm(prev => ({
            ...prev,
            code: match.code,
            title: match.title,
            units: match.units,
            yearLevel: match.yearLevel || prev.yearLevel || "1st Year",
            lectureHours: match.units,
            labHours: 0
        }));
    };

    // Open Modal for New Subject
    const handleOpenAddSubject = () => {
        if (!selectedCourse) return;
        setEditingSubject(null);
        setSelectedCatalogCode("");
        setCatalogSearchQuery("");
        setIsCustomInstructor(false);
        setIsFacultyDropdownOpen(false);

        const defaultInstructor =
            selectedCourse.deanOrHead ||
            (facultyList.length > 0 ? facultyList[0].fullName : "Dr. Samuel Vance, Th.D.");
        setFacultySearch(defaultInstructor);

        setSubjectForm({
            code: "",
            title: "",
            units: 3,
            lectureHours: 3,
            labHours: 0,
            schedule: "Fri-Sun 8:00 AM - 12:00 PM (Modular)",
            room: "Field Hub • Room 101",
            instructor: defaultInstructor,
            modeOfLearning: selectedCourse.modeOfLearning || "Modular Field Cohort",
            prerequisite: "",
            yearLevel: "1st Year"
        });
        setIsSubjectModalOpen(true);
    };

    // Open Modal for Editing Subject
    const handleOpenEditSubject = (subject: CourseSubject) => {
        setEditingSubject(subject);
        setSelectedCatalogCode(subject.code);
        setCatalogSearchQuery("");
        setFacultySearch(subject.instructor || "");
        setIsFacultyDropdownOpen(false);

        const matchesKnownFaculty = facultyList.some(
            f => f.fullName.toLowerCase() === (subject.instructor || "").toLowerCase()
        );
        setIsCustomInstructor(!matchesKnownFaculty && !!subject.instructor);

        setSubjectForm({ ...subject });
        setIsSubjectModalOpen(true);
    };

    // Open Batch Import Prescribed Subjects Modal
    const handleOpenBatchModal = () => {
        if (!selectedCourse) return;
        setBatchSelectedCodes([]);
        setBatchCategoryFilter("ALL");
        setBatchSearchQuery("");
        const defaultInstructor =
            selectedCourse.deanOrHead ||
            (facultyList.length > 0 ? facultyList[0].fullName : "Dr. Samuel Vance, Th.D.");
        setBatchInstructor(defaultInstructor);
        setBatchRoom("Field Hub • Room 101");
        setBatchSchedule("Fri-Sun 8:00 AM - 12:00 PM (Modular)");
        setIsBatchModalOpen(true);
    };

    // Toggle single subject selection in batch modal
    const handleToggleBatchSubject = (code: string) => {
        setBatchSelectedCodes(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    // Toggle Select All filtered in batch modal
    const handleSelectAllBatch = (subjectsToSelect: PrescribedSubject[]) => {
        const codesToSelect = subjectsToSelect.map(s => s.code);
        const allAlreadySelected = codesToSelect.every(c => batchSelectedCodes.includes(c));

        if (allAlreadySelected) {
            setBatchSelectedCodes(prev => prev.filter(c => !codesToSelect.includes(c)));
        } else {
            setBatchSelectedCodes(prev => Array.from(new Set([...prev, ...codesToSelect])));
        }
    };

    // Save batch selected subjects
    const handleSaveBatchSubjects = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourse) return;
        if (batchSelectedCodes.length === 0) {
            showFeedback("error", "Please select at least one prescribed subject to add.");
            return;
        }

        let addedCount = 0;
        try {
            batchSelectedCodes.forEach(code => {
                const prescribed = PRESCRIBED_THEOLOGICAL_SUBJECTS.find(s => s.code === code);
                if (prescribed) {
                    const newSub: CourseSubject = {
                        code: prescribed.code,
                        title: prescribed.title,
                        units: prescribed.units,
                        lectureHours: prescribed.units,
                        labHours: 0,
                        schedule: batchSchedule.trim() || "Fri-Sun 8:00 AM - 12:00 PM (Modular)",
                        room: batchRoom.trim() || "Field Hub • Room 101",
                        instructor: batchInstructor.trim() || selectedCourse.deanOrHead || "Dr. Samuel Vance, Th.D.",
                        modeOfLearning: selectedCourse.modeOfLearning,
                        yearLevel: prescribed.yearLevel
                    };
                    courseCurriculumService.addSubjectToCourse(selectedCourse.code, newSub);
                    addedCount++;
                }
            });

            setIsBatchModalOpen(false);
            refreshCourses();
            showFeedback(
                "success",
                `Successfully added ${addedCount} prescribed theological subject(s) to ${selectedCourse.name}.`
            );
        } catch (err: unknown) {
            const error = err as Error;
            showFeedback("error", error.message || "Failed to batch add subjects.");
        }
    };

    // Filtered Prescribed Subjects for Batch Modal
    const filteredBatchSubjects = useMemo(() => {
        const q = batchSearchQuery.trim().toLowerCase();
        return PRESCRIBED_THEOLOGICAL_SUBJECTS.filter(s => {
            const matchesCat =
                batchCategoryFilter === "ALL" ||
                s.category.includes(batchCategoryFilter) ||
                s.code.startsWith(batchCategoryFilter);
            const matchesQuery =
                !q ||
                s.code.toLowerCase().includes(q) ||
                s.title.toLowerCase().includes(q) ||
                s.category.toLowerCase().includes(q);
            return matchesCat && matchesQuery;
        });
    }, [batchCategoryFilter, batchSearchQuery]);

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
            "Are you sure you want to reset all courses and subjects to official Mobile Bible School curriculum?\n\nThis will restore all 16 academic programs (Certificate, Diploma, Associate, Bachelor, Masteral, Doctorate, and Bridge pathways)."
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
                            Manage authentic theological courses, subjects, units, class schedules, and tuition rates per unit.
                        </p>
                    </div>
                </div>

                <div className="course-mgr-header-actions">
                    <button
                        type="button"
                        className="course-mgr-btn btn-secondary"
                        onClick={handleSyncWithDb}
                        disabled={isSyncing}
                        title="Fetch real-time courses and modules from database"
                    >
                        <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                        <span>{isSyncing ? "Syncing..." : "Sync Database"}</span>
                    </button>
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

                        {/* Category filter tabs matching MBS menu */}
                        <div className="course-category-chips">
                            {[
                                { id: "ALL", label: "All", count: courses.length },
                                { id: "Certificate", label: "Certificate", count: courses.filter(c => (c.degreeLevel || "").toLowerCase().includes("certificate") || (c.department || "").toLowerCase().includes("certificate")).length },
                                { id: "Diploma", label: "Diploma", count: courses.filter(c => (c.degreeLevel || "").toLowerCase().includes("diploma")).length },
                                { id: "Associate", label: "Associate", count: courses.filter(c => (c.degreeLevel || "").toLowerCase().includes("associate")).length },
                                { id: "Bachelor", label: "Bachelor", count: courses.filter(c => (c.degreeLevel || "").toLowerCase().includes("undergraduate") || (c.degreeLevel || "").toLowerCase().includes("bachelor") || (c.name || "").toLowerCase().includes("ab ")).length },
                                { id: "Masteral", label: "Masteral", count: courses.filter(c => (c.degreeLevel || "").toLowerCase().includes("graduate") || (c.degreeLevel || "").toLowerCase().includes("seminary") || (c.name || "").toLowerCase().includes("master")).length },
                                { id: "Doctorate", label: "Doctorate", count: courses.filter(c => (c.degreeLevel || "").toLowerCase().includes("doctorate")).length },
                                { id: "Specialized", label: "Bridge / Specialized", count: courses.filter(c => (c.degreeLevel || "").toLowerCase().includes("specialized") || (c.degreeLevel || "").toLowerCase().includes("bridge")).length }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    className={`category-chip ${selectedCategoryTab === tab.id ? "active" : ""}`}
                                    onClick={() => setSelectedCategoryTab(tab.id)}
                                >
                                    <span>{tab.label}</span>
                                    <span className="chip-badge">{tab.count}</span>
                                </button>
                            ))}
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
                                            className="course-mgr-btn btn-secondary btn-sm"
                                            onClick={handleOpenBatchModal}
                                            title="Batch pick and add multiple subjects from the 35 prescribed curriculum list"
                                        >
                                            <BookMarked size={14} />
                                            <span>Batch Prescribed Catalog</span>
                                        </button>

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
                                            <option value="Certificate">Certificate Level (Short Term Courses)</option>
                                            <option value="Diploma">Diploma Level (2-Year Ministry)</option>
                                            <option value="Associate">Associate Degree (2-Year Pastoral / Naturopathy)</option>
                                            <option value="Undergraduate">Bachelor Degree (4-Year Theological / Arts)</option>
                                            <option value="Graduate / Seminary">Masteral Degree (Postgraduate Seminary)</option>
                                            <option value="Doctorate">Doctorate Degree (Terminal Doctoral Degree)</option>
                                            <option value="Specialized / Bridge">Bridge & Accelerated Programs (BCCST / LLP / Honorary)</option>
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
                                {/* PRESCRIBED SUBJECT CATALOG PICKER (35 OFFICIAL SUBJECTS) */}
                                <div className="prescribed-subject-picker-card">
                                    <div className="picker-header">
                                        <div className="picker-title-row">
                                            <div className="picker-icon-badge">
                                                <BookMarked size={16} />
                                            </div>
                                            <div>
                                                <h4 className="picker-title">Official Prescribed Theological Subjects (35 Subjects)</h4>
                                                <p className="picker-desc">
                                                    Select a prescribed subject below to automatically populate the code, descriptive title, credit units, and year level.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="picker-body">
                                        <div className="picker-controls-grid">
                                            <div className="picker-search-field-wrapper">
                                                <label className="picker-field-label">SEARCH CATALOG</label>
                                                <div className="picker-search-box">
                                                    <Search size={14} className="picker-search-icon" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search code or keywords (e.g. 'Greek', 'Ethics', 'CBS', 'Pastoral')..."
                                                        value={catalogSearchQuery}
                                                        onChange={e => setCatalogSearchQuery(e.target.value)}
                                                        className="picker-search-input"
                                                    />
                                                    {catalogSearchQuery && (
                                                        <button
                                                            type="button"
                                                            className="picker-clear-search-btn"
                                                            onClick={() => setCatalogSearchQuery("")}
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="picker-select-wrapper">
                                                <label className="picker-field-label">
                                                    CHOOSE FROM CATALOG ({totalFilteredPrescribed} Available)
                                                </label>
                                                <select
                                                    value={selectedCatalogCode}
                                                    onChange={e => handleSelectPrescribedSubject(e.target.value)}
                                                    className="picker-dropdown-select"
                                                >
                                                    <option value="">-- Select a Prescribed Subject to Auto-Fill --</option>
                                                    {groupedPrescribedSubjects.map(cat => (
                                                        <optgroup key={cat.category} label={cat.category}>
                                                            {cat.subjects.map(s => (
                                                                <option key={s.code} value={s.code}>
                                                                    {s.code} · {s.title} ({s.yearLevel} • {s.units} units)
                                                                </option>
                                                            ))}
                                                        </optgroup>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Applied Subject Indicator */}
                                        {selectedCatalogCode && (
                                            <div className="picker-applied-banner">
                                                <div className="applied-banner-content">
                                                    <CheckCircle2 size={15} className="applied-icon" />
                                                    <span>
                                                        Selected from Catalog: <strong>{selectedCatalogCode} · {subjectForm.title}</strong>
                                                    </span>
                                                    <span className="applied-pill">{subjectForm.units} Units</span>
                                                    <span className="applied-pill">{subjectForm.yearLevel}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="applied-clear-btn"
                                                    onClick={() => {
                                                        setSelectedCatalogCode("");
                                                        setSubjectForm(prev => ({ ...prev, code: "", title: "" }));
                                                    }}
                                                >
                                                    Reset
                                                </button>
                                            </div>
                                        )}

                                        {/* Quick Filter Series Chips */}
                                        <div className="picker-quick-series">
                                            <span className="quick-series-label">Quick Series:</span>
                                            {["ALL", "CBS 100", "DPS 200", "AML 300", "BTH 400", "MTH 500", "MMIN 600", "DTH 700"].map(
                                                series => {
                                                    const prefix = series === "ALL" ? "" : series.split(" ")[0];
                                                    const isActive =
                                                        series === "ALL"
                                                            ? !catalogSearchQuery
                                                            : catalogSearchQuery.toUpperCase() === prefix;
                                                    return (
                                                        <button
                                                            key={series}
                                                            type="button"
                                                            className={`quick-series-chip ${isActive ? "active" : ""}`}
                                                            onClick={() => setCatalogSearchQuery(prefix)}
                                                        >
                                                            {series}
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-grid-3">
                                    <div className="modal-form-group">
                                        <label>SUBJECT CODE *</label>
                                        <input
                                            type="text"
                                            required
                                            value={subjectForm.code}
                                            onChange={e =>
                                                setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })
                                            }
                                            placeholder="e.g. AML 301"
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
                                        placeholder="e.g. Christian Ethics"
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

                                    {/* SEARCHABLE FACULTY / INSTRUCTOR COMBOBOX */}
                                    <div className="modal-form-group faculty-picker-form-group">
                                        <div className="flex-label">
                                            <label>INSTRUCTOR / PROFESSOR *</label>
                                            <button
                                                type="button"
                                                className="faculty-mode-toggle"
                                                onClick={() => {
                                                    const nextCustom = !isCustomInstructor;
                                                    setIsCustomInstructor(nextCustom);
                                                    setIsFacultyDropdownOpen(false);
                                                }}
                                            >
                                                {isCustomInstructor
                                                    ? "← Pick from Faculty Roster"
                                                    : "✏️ Custom / Visiting Lecturer"}
                                            </button>
                                        </div>

                                        {isCustomInstructor ? (
                                            <input
                                                type="text"
                                                required
                                                value={subjectForm.instructor}
                                                onChange={e =>
                                                    setSubjectForm({ ...subjectForm, instructor: e.target.value })
                                                }
                                                placeholder="Type custom or visiting lecturer name..."
                                            />
                                        ) : (
                                            <div className="faculty-combobox-container" ref={facultyComboboxRef}>
                                                <div className="faculty-search-input-wrap">
                                                    <Search size={14} className="faculty-search-icon" />
                                                    <input
                                                        type="text"
                                                        required
                                                        value={facultySearch}
                                                        onFocus={() => setIsFacultyDropdownOpen(true)}
                                                        onChange={e => {
                                                            setFacultySearch(e.target.value);
                                                            setSubjectForm(prev => ({
                                                                ...prev,
                                                                instructor: e.target.value
                                                            }));
                                                            setIsFacultyDropdownOpen(true);
                                                        }}
                                                        placeholder="Search faculty by name, department or rank..."
                                                        className="faculty-input-field"
                                                    />
                                                    {facultySearch && (
                                                        <button
                                                            type="button"
                                                            className="faculty-clear-btn"
                                                            onClick={() => {
                                                                setFacultySearch("");
                                                                setSubjectForm(prev => ({ ...prev, instructor: "" }));
                                                                setIsFacultyDropdownOpen(true);
                                                            }}
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="faculty-arrow-toggle"
                                                        onClick={() => setIsFacultyDropdownOpen(!isFacultyDropdownOpen)}
                                                    >
                                                        <ChevronDown size={14} />
                                                    </button>
                                                </div>

                                                {/* Dropdown Options List */}
                                                {isFacultyDropdownOpen && (
                                                    <div className="faculty-dropdown-list-menu">
                                                        <div className="faculty-menu-header">
                                                            <Users size={13} />
                                                            <span>
                                                                Accredited Faculties & Instructors ({filteredFaculties.length})
                                                            </span>
                                                        </div>

                                                        <div className="faculty-menu-items">
                                                            {filteredFaculties.length === 0 ? (
                                                                <div className="faculty-empty-result">
                                                                    <p>No faculty matching "{facultySearch}"</p>
                                                                    <button
                                                                        type="button"
                                                                        className="use-custom-name-action"
                                                                        onClick={() => {
                                                                            setSubjectForm(prev => ({
                                                                                ...prev,
                                                                                instructor: facultySearch
                                                                            }));
                                                                            setIsFacultyDropdownOpen(false);
                                                                        }}
                                                                    >
                                                                        Use "{facultySearch}" as Instructor
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                filteredFaculties.map((fac, idx) => {
                                                                    const isSelected =
                                                                        subjectForm.instructor.toLowerCase() ===
                                                                        fac.fullName.toLowerCase();
                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            className={`faculty-menu-item ${isSelected ? "selected" : ""}`}
                                                                            onClick={() => {
                                                                                setSubjectForm(prev => ({
                                                                                    ...prev,
                                                                                    instructor: fac.fullName
                                                                                }));
                                                                                setFacultySearch(fac.fullName);
                                                                                setIsFacultyDropdownOpen(false);
                                                                            }}
                                                                        >
                                                                            <div className="faculty-avatar-circle">
                                                                                <User size={13} />
                                                                            </div>
                                                                            <div className="faculty-item-text">
                                                                                <div className="faculty-name-row">
                                                                                    <strong className="faculty-name">
                                                                                        {fac.fullName}
                                                                                    </strong>
                                                                                    {isSelected && (
                                                                                        <span className="selected-tag">
                                                                                            <Check size={11} /> Selected
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                {fac.academicRank && (
                                                                                    <span className="faculty-rank">
                                                                                        {fac.academicRank}
                                                                                    </span>
                                                                                )}
                                                                                {fac.department && (
                                                                                    <span className="faculty-dept">
                                                                                        {fac.department}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Selected Faculty Indicator Pill */}
                                                {subjectForm.instructor && (
                                                    <div className="selected-faculty-pill">
                                                        <CheckCircle2 size={13} className="pill-check" />
                                                        <span className="pill-label">Assigned:</span>
                                                        <strong className="pill-name">{subjectForm.instructor}</strong>
                                                    </div>
                                                )}
                                            </div>
                                        )}
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

            {/* MODAL 3: BATCH ADD PRESCRIBED THEOLOGICAL SUBJECTS */}
            {isBatchModalOpen && (
                <div className="course-mgr-modal-overlay" onClick={() => setIsBatchModalOpen(false)}>
                    <div className="course-mgr-modal-card modal-lg batch-subjects-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-card-header">
                            <div className="modal-header-title">
                                <BookMarked size={20} />
                                <div>
                                    <h3>Batch Import Prescribed Subjects</h3>
                                    <span className="modal-subtitle">
                                        Target Course: <strong>{selectedCourse?.name} ({selectedCourse?.code})</strong>
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setIsBatchModalOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveBatchSubjects}>
                            <div className="modal-card-body">
                                <div className="batch-intro-box">
                                    <Sparkles size={18} className="intro-icon" />
                                    <p>
                                        Select any number of official curriculum subjects below to instantly add them to{" "}
                                        <strong>{selectedCourse?.name}</strong> without having to type each one manually.
                                    </p>
                                </div>

                                {/* Filters and Select All toolbar */}
                                <div className="batch-toolbar">
                                    <div className="batch-search-box">
                                        <Search size={14} className="search-icon" />
                                        <input
                                            type="text"
                                            placeholder="Search by subject code, title or series..."
                                            value={batchSearchQuery}
                                            onChange={e => setBatchSearchQuery(e.target.value)}
                                        />
                                        {batchSearchQuery && (
                                            <button
                                                type="button"
                                                className="clear-search-btn"
                                                onClick={() => setBatchSearchQuery("")}
                                            >
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="batch-actions-row">
                                        <button
                                            type="button"
                                            className="batch-select-all-btn"
                                            onClick={() => handleSelectAllBatch(filteredBatchSubjects)}
                                        >
                                            {filteredBatchSubjects.length > 0 &&
                                            filteredBatchSubjects.every(s => batchSelectedCodes.includes(s.code)) ? (
                                                <>
                                                    <CheckSquare size={15} />
                                                    <span>Deselect All Filtered</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Square size={15} />
                                                    <span>Select All Filtered ({filteredBatchSubjects.length})</span>
                                                </>
                                            )}
                                        </button>

                                        <span className="batch-counter-badge">
                                            {batchSelectedCodes.length} Subjects Selected
                                        </span>
                                    </div>
                                </div>

                                {/* Series category pills */}
                                <div className="batch-category-chips">
                                    {[
                                        { key: "ALL", label: "All 35 Subjects" },
                                        { key: "CBS", label: "CBS 100 Series" },
                                        { key: "DPS", label: "DPS 200 Series" },
                                        { key: "AML", label: "AML 300 Series" },
                                        { key: "BTH", label: "BTH 400 Series" },
                                        { key: "MTH", label: "MTH 500 Series" },
                                        { key: "MMIN", label: "MMIN 600 Series" },
                                        { key: "DTH", label: "DTH 700 Series" }
                                    ].map(cat => (
                                        <button
                                            key={cat.key}
                                            type="button"
                                            className={`batch-chip ${batchCategoryFilter === cat.key ? "active" : ""}`}
                                            onClick={() => setBatchCategoryFilter(cat.key)}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Subjects Selection Grid */}
                                <div className="batch-subjects-grid">
                                    {filteredBatchSubjects.map(sub => {
                                        const isSelected = batchSelectedCodes.includes(sub.code);
                                        const alreadyInCourse = (selectedCourse?.subjects || []).some(
                                            s => s.code.toUpperCase() === sub.code.toUpperCase()
                                        );

                                        return (
                                            <div
                                                key={sub.code}
                                                className={`batch-subject-card ${isSelected ? "selected" : ""} ${alreadyInCourse ? "already-exists" : ""}`}
                                                onClick={() => handleToggleBatchSubject(sub.code)}
                                            >
                                                <div className="card-checkbox">
                                                    {isSelected ? (
                                                        <CheckSquare size={18} className="checkbox-checked" />
                                                    ) : (
                                                        <Square size={18} className="checkbox-empty" />
                                                    )}
                                                </div>
                                                <div className="card-body-content">
                                                    <div className="card-top-row">
                                                        <span className="subject-code-tag">{sub.code}</span>
                                                        <span className="subject-units-tag">{sub.units} Units</span>
                                                        <span className="subject-level-tag">{sub.yearLevel}</span>
                                                        {alreadyInCourse && (
                                                            <span className="already-tag">Already in Course</span>
                                                        )}
                                                    </div>
                                                    <h5 className="subject-card-title">{sub.title}</h5>
                                                    <span className="subject-category-tag">{sub.category}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Shared Assignment Defaults */}
                                <div className="batch-settings-card">
                                    <h5 className="settings-title">Default Assignment Settings for Selected Subjects:</h5>
                                    <div className="form-grid-3">
                                        <div className="modal-form-group">
                                            <label>ASSIGNED INSTRUCTOR / PROFESSOR</label>
                                            <select
                                                value={batchInstructor}
                                                onChange={e => setBatchInstructor(e.target.value)}
                                            >
                                                {facultyList.map((f, idx) => (
                                                    <option key={idx} value={f.fullName}>
                                                        {f.fullName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="modal-form-group">
                                            <label>DEFAULT CLASS SCHEDULE</label>
                                            <input
                                                type="text"
                                                value={batchSchedule}
                                                onChange={e => setBatchSchedule(e.target.value)}
                                                placeholder="e.g. Fri-Sun 8:00 AM - 12:00 PM"
                                            />
                                        </div>

                                        <div className="modal-form-group">
                                            <label>ROOM / VENUE</label>
                                            <input
                                                type="text"
                                                value={batchRoom}
                                                onChange={e => setBatchRoom(e.target.value)}
                                                placeholder="e.g. Field Hub • Rm 101"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-card-footer">
                                <button
                                    type="button"
                                    className="course-mgr-btn btn-secondary"
                                    onClick={() => setIsBatchModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="course-mgr-btn btn-primary"
                                    disabled={batchSelectedCodes.length === 0}
                                >
                                    <Plus size={16} />
                                    <span>
                                        {batchSelectedCodes.length > 0
                                            ? `Add Selected (${batchSelectedCodes.length}) Subjects`
                                            : "Select Subjects to Add"}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
