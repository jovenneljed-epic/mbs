import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import {
    Calendar,
    Clock,
    Plus,
    Search,
    CheckCircle2,
    AlertCircle,
    BookOpen,
    Users,
    MapPin,
    GraduationCap,
    Trash2,
    Edit3,
    LayoutGrid,
    List,
    RefreshCw,
    X,
    Layers,
    BookCheck,
    CheckCheck,
    CalendarDays
} from "lucide-react";

import { API_BASE_URL } from "../config";
import "./ChurchServicesPage.css";

// =========================================================
// ACADEMIC CLASS SCHEDULE INTERFACES
// =========================================================

export interface ClassSchedule {
    churchServiceId: number;
    serviceName: string;       // Subject / Class Name
    serviceType: string;       // Class Format: LECTURE, LABORATORY, etc.
    serviceDate: string;       // Class Date (YYYY-MM-DD)
    startTime?: string | null; // Start Time (HH:mm)
    endTime?: string | null;   // End Time (HH:mm)
    location?: string | null;  // Classroom / Room / Venue
    serviceLeader?: string | null; // Section / Batch / Grade Level
    speaker?: string | null;   // Instructor / Professor / Teacher
    description?: string | null; // Syllabus / Class Agenda / Notes
    status: string;            // SCHEDULED, ONGOING, COMPLETED, CANCELLED
    createdDate?: string;
    updatedDate?: string | null;
}

interface ClassScheduleForm {
    serviceName: string;
    serviceType: string;
    serviceDate: string;
    startTime: string;
    endTime: string;
    location: string;
    serviceLeader: string;
    speaker: string;
    description: string;
    status: string;
}

type TabFilter = "ALL" | "UPCOMING" | "PAST";
type ViewMode = "cards" | "table";

// =========================================================
// CONSTANTS & ACADEMIC DICTIONARIES
// =========================================================

const MAX_DESCRIPTION_LENGTH = 500;

export const CLASS_FORMATS: [string, string][] = [
    ["LECTURE", "Lecture Period"],
    ["LABORATORY", "Laboratory / Practical"],
    ["SEMINAR", "Seminar & Discussion"],
    ["ONLINE VIRTUAL", "Online Virtual Classroom (Zoom/Meet)"],
    ["MODULAR", "Modular & Self-Paced"],
    ["REVIEW", "Review & Tutorial Session"],
    ["EXAMINATION", "Major Examination / Quiz"],
    ["WORKSHOP", "Ministry Practicum / Workshop"],
    ["OTHER", "Special Academic Session"],
];

export const CLASS_STATUSES: [string, string][] = [
    ["SCHEDULED", "Scheduled"],
    ["ONGOING", "In Session / Ongoing"],
    ["COMPLETED", "Completed"],
    ["POSTPONED", "Postponed"],
    ["CANCELLED", "Cancelled / Suspended"],
];

const SUBJECT_SUGGESTIONS = [
    "Old Testament Survey & Historical Books",
    "Systematic Theology 1 - Doctrine of God",
    "New Testament Greek & Syntax",
    "Biblical Hermeneutics & Exegesis",
    "Christian Ethics & Servant Leadership",
    "Homiletics & Expository Preaching",
    "Church History & Christian Thought",
    "Evangelism & Global Missions Strategy",
];

const SECTION_SUGGESTIONS = [
    "Section A - 1st Year",
    "Section B - 2nd Year",
    "Batch Alpha 2026",
    "Evening Class Cohort",
    "Senior High Department",
];

const ROOM_SUGGESTIONS = [
    "Room 101 - Academic Wing",
    "Room 204 - Theology Hall",
    "Lecture Hall A (Main Campus)",
    "Computer / Multimedia Lab",
    "Online Zoom Room / Studio",
];

const EMPTY_FORM: ClassScheduleForm = {
    serviceName: "",
    serviceType: "LECTURE",
    serviceDate: new Date().toISOString().split("T")[0],
    startTime: "08:00",
    endTime: "09:30",
    location: "Room 101 - Academic Wing",
    serviceLeader: "Section A - 1st Year",
    speaker: "",
    description: "",
    status: "SCHEDULED",
};

// =========================================================
// AUTH TOKEN HELPER
// =========================================================

const getToken = (): string => {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("jwt") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("epicToken") ||
        ""
    );
};

const getHeaders = (): HeadersInit => {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

// =========================================================
// COMPONENT
// =========================================================

export const ChurchServicesPage: React.FC = () => {
    const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    // Filters & Search
    const [search, setSearch] = useState<string>("");
    const [tabFilter, setTabFilter] = useState<TabFilter>("ALL");
    const [formatFilter, setFormatFilter] = useState<string>("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        return (localStorage.getItem("mbs_schedule_view") as ViewMode) || "cards";
    });

    // Modals
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<ClassScheduleForm>(EMPTY_FORM);
    const [deleteSchedule, setDeleteSchedule] = useState<ClassSchedule | null>(null);

    // Persist view mode preference
    const handleSetViewMode = (mode: ViewMode) => {
        setViewMode(mode);
        try {
            localStorage.setItem("mbs_schedule_view", mode);
        } catch {
            // ignore
        }
    };

    // =====================================================
    // LOAD CLASS SCHEDULES
    // =====================================================

    const loadSchedules = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_BASE_URL}/ChurchServices`, {
                method: "GET",
                headers: getHeaders(),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || `Server returned HTTP ${response.status}`);
            }

            const data = await response.json();
            const list: ClassSchedule[] = Array.isArray(data)
                ? data
                : Array.isArray(data?.services)
                    ? data.services
                    : Array.isArray(data?.churchServices)
                        ? data.churchServices
                        : [];

            setSchedules(list);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unable to load class schedules.";
            console.error("Error loading class schedules:", err);
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSchedules();
    }, [loadSchedules]);

    // =====================================================
    // FORM HANDLERS
    // =====================================================

    const openAddModal = () => {
        const currentUserFullName =
            localStorage.getItem("currentFullName") ||
            localStorage.getItem("fullName") ||
            localStorage.getItem("currentUser") ||
            "";

        setForm({
            ...EMPTY_FORM,
            serviceDate: new Date().toISOString().split("T")[0],
            speaker: currentUserFullName,
        });
        setEditingId(null);
        setError("");
        setIsModalOpen(true);
    };

    const openEditModal = (schedule: ClassSchedule) => {
        let cleanDate = "";
        if (schedule.serviceDate) {
            cleanDate = schedule.serviceDate.split("T")[0];
        }

        const normalizeTime = (val?: string | null) => {
            if (!val) return "";
            const match = val.match(/^(\d{2}:\d{2})/);
            return match ? match[1] : val;
        };

        setForm({
            serviceName: schedule.serviceName || "",
            serviceType: schedule.serviceType || "LECTURE",
            serviceDate: cleanDate,
            startTime: normalizeTime(schedule.startTime),
            endTime: normalizeTime(schedule.endTime),
            location: schedule.location || "",
            serviceLeader: schedule.serviceLeader || "",
            speaker: schedule.speaker || "",
            description: schedule.description || "",
            status: schedule.status || "SCHEDULED",
        });
        setEditingId(schedule.churchServiceId);
        setError("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setIsModalOpen(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
    };

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!form.serviceName.trim()) {
            setError("Subject / Class Name is required.");
            return;
        }

        if (!form.serviceDate) {
            setError("Schedule Date is required.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        const payload = {
            churchServiceId: editingId ?? 0,
            serviceName: form.serviceName.trim(),
            serviceType: form.serviceType.trim() || "LECTURE",
            serviceDate: form.serviceDate,
            startTime: form.startTime.trim() ? `${form.startTime.trim()}:00` : "",
            endTime: form.endTime.trim() ? `${form.endTime.trim()}:00` : "",
            location: form.location.trim(),
            serviceLeader: form.serviceLeader.trim(),
            speaker: form.speaker.trim(),
            description: form.description.trim(),
            status: form.status.trim() || "SCHEDULED",
        };

        try {
            const url = editingId
                ? `${API_BASE_URL}/ChurchServices/${editingId}`
                : `${API_BASE_URL}/ChurchServices`;
            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: getHeaders(),
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || `Server returned HTTP ${response.status}`);
            }

            setSuccess(
                editingId
                    ? `Class "${payload.serviceName}" schedule updated successfully.`
                    : `Class "${payload.serviceName}" scheduled successfully.`
            );
            closeModal();
            await loadSchedules();
            setTimeout(() => setSuccess(""), 5000);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to save class schedule.";
            console.error("Save schedule error:", err);
            setError(message);
        } finally {
            setSaving(false);
        }
    };

    // Quick status toggle
    const handleQuickStatusChange = async (scheduleId: number, newStatus: string) => {
        const schedule = schedules.find((s) => s.churchServiceId === scheduleId);
        if (!schedule) return;

        try {
            const payload = {
                ...schedule,
                status: newStatus,
            };

            const response = await fetch(`${API_BASE_URL}/ChurchServices/${scheduleId}`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setSchedules((prev) =>
                    prev.map((s) => (s.churchServiceId === scheduleId ? { ...s, status: newStatus } : s))
                );
                setSuccess(`Class status changed to ${newStatus}.`);
                setTimeout(() => setSuccess(""), 4000);
            }
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    // Delete schedule
    const handleDelete = async () => {
        if (!deleteSchedule) return;

        setSaving(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/ChurchServices/${deleteSchedule.churchServiceId}`,
                {
                    method: "DELETE",
                    headers: getHeaders(),
                }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || `Failed to delete schedule.`);
            }

            setSuccess(`Class schedule "${deleteSchedule.serviceName}" was deleted.`);
            setDeleteSchedule(null);
            await loadSchedules();
            setTimeout(() => setSuccess(""), 5000);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to delete class schedule.";
            setError(message);
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // METRICS & FILTERING
    // =====================================================

    const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

    const counts = useMemo(() => {
        const total = schedules.length;
        const scheduled = schedules.filter(
            (s) => s.status?.toUpperCase() === "SCHEDULED" || s.status?.toUpperCase() === "ONGOING"
        ).length;
        const upcoming = schedules.filter((s) => {
            const d = s.serviceDate ? s.serviceDate.split("T")[0] : "";
            return d >= todayStr && s.status?.toUpperCase() !== "CANCELLED";
        }).length;
        const completed = schedules.filter((s) => s.status?.toUpperCase() === "COMPLETED").length;

        return { total, scheduled, upcoming, completed };
    }, [schedules, todayStr]);

    const filteredSchedules = useMemo(() => {
        return schedules.filter((item) => {
            // Tab filter
            const dateStr = item.serviceDate ? item.serviceDate.split("T")[0] : "";
            if (tabFilter === "UPCOMING" && dateStr < todayStr) return false;
            if (tabFilter === "PAST" && dateStr >= todayStr) return false;

            // Format filter
            if (formatFilter !== "ALL") {
                if (item.serviceType?.toUpperCase() !== formatFilter) return false;
            }

            // Status filter
            if (statusFilter !== "ALL") {
                if (item.status?.toUpperCase() !== statusFilter) return false;
            }

            // Search query
            if (search.trim()) {
                const query = search.trim().toLowerCase();
                const matchName = item.serviceName?.toLowerCase().includes(query);
                const matchSection = item.serviceLeader?.toLowerCase().includes(query);
                const matchTeacher = item.speaker?.toLowerCase().includes(query);
                const matchRoom = item.location?.toLowerCase().includes(query);
                const matchType = item.serviceType?.toLowerCase().includes(query);

                if (!matchName && !matchSection && !matchTeacher && !matchRoom && !matchType) {
                    return false;
                }
            }

            return true;
        });
    }, [schedules, tabFilter, formatFilter, statusFilter, search, todayStr]);

    // Formatters
    const formatDate = (dateStr?: string | null): string => {
        if (!dateStr) return "TBD";
        try {
            const clean = dateStr.split("T")[0];
            const [y, m, d] = clean.split("-").map(Number);
            const date = new Date(y, m - 1, d);
            return date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    const formatTime = (timeStr?: string | null): string => {
        if (!timeStr) return "";
        try {
            const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
            if (!match) return timeStr;
            let hours = parseInt(match[1], 10);
            const minutes = match[2];
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12 || 12;
            return `${hours}:${minutes} ${ampm}`;
        } catch {
            return timeStr;
        }
    };

    const getFormatBadgeClass = (format?: string): string => {
        const f = (format || "").toUpperCase();
        if (f.includes("LAB")) return "badge-laboratory";
        if (f.includes("SEMINAR")) return "badge-seminar";
        if (f.includes("ONLINE") || f.includes("VIRTUAL")) return "badge-online";
        if (f.includes("EXAM")) return "badge-exam";
        if (f.includes("MODULAR")) return "badge-modular";
        return "badge-lecture";
    };

    const getFormatCardClass = (format?: string): string => {
        const f = (format || "").toUpperCase();
        if (f.includes("LAB")) return "format-laboratory";
        if (f.includes("SEMINAR")) return "format-seminar";
        if (f.includes("ONLINE") || f.includes("VIRTUAL")) return "format-online";
        if (f.includes("EXAM")) return "format-exam";
        return "format-lecture";
    };

    const getStatusPillClass = (status?: string): string => {
        const s = (status || "").toUpperCase();
        if (s === "ONGOING") return "status-ongoing";
        if (s === "COMPLETED") return "status-completed";
        if (s === "CANCELLED") return "status-cancelled";
        if (s === "POSTPONED") return "status-postponed";
        return "status-scheduled";
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="class-scheduler-page">
            {/* =================================================
                HEADER
            ================================================= */}
            <div className="scheduler-header">
                <div className="scheduler-title-group">
                    <span className="scheduler-eyebrow">
                        <GraduationCap size={15} /> Academic Schedule Management
                    </span>
                    <h1>Classes & Schedules</h1>
                    <p>
                        Organize daily subject timetables, course lecture periods, faculty instructors, and classroom venues.
                    </p>
                </div>

                <div className="scheduler-header-actions">
                    <button
                        type="button"
                        className="btn-refresh-icon"
                        title="Reload Schedules"
                        onClick={loadSchedules}
                        disabled={loading}
                    >
                        <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
                    </button>

                    <button
                        type="button"
                        className="btn-schedule-class"
                        onClick={openAddModal}
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        <span>Schedule a Class</span>
                    </button>
                </div>
            </div>

            {/* =================================================
                ALERTS
            ================================================= */}
            {success && (
                <div className="scheduler-alert scheduler-alert-success">
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <CheckCircle2 size={18} />
                        <span>{success}</span>
                    </div>
                    <button
                        type="button"
                        className="scheduler-alert-close"
                        onClick={() => setSuccess("")}
                    >
                        ×
                    </button>
                </div>
            )}

            {error && (
                <div className="scheduler-alert scheduler-alert-error">
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                    <button
                        type="button"
                        className="scheduler-alert-close"
                        onClick={() => setError("")}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* =================================================
                KPI METRICS
            ================================================= */}
            <div className="scheduler-kpi-grid">
                <div className="scheduler-kpi-card kpi-total">
                    <div className="kpi-icon-box">
                        <BookOpen size={24} />
                    </div>
                    <div className="kpi-info">
                        <span className="kpi-label">Total Classes</span>
                        <strong className="kpi-value">{counts.total}</strong>
                    </div>
                </div>

                <div className="scheduler-kpi-card kpi-upcoming">
                    <div className="kpi-icon-box">
                        <CalendarDays size={24} />
                    </div>
                    <div className="kpi-info">
                        <span className="kpi-label">Upcoming Sessions</span>
                        <strong className="kpi-value">{counts.upcoming}</strong>
                    </div>
                </div>

                <div className="scheduler-kpi-card kpi-scheduled">
                    <div className="kpi-icon-box">
                        <Clock size={24} />
                    </div>
                    <div className="kpi-info">
                        <span className="kpi-label">Active / Scheduled</span>
                        <strong className="kpi-value">{counts.scheduled}</strong>
                    </div>
                </div>

                <div className="scheduler-kpi-card kpi-completed">
                    <div className="kpi-icon-box">
                        <CheckCheck size={24} />
                    </div>
                    <div className="kpi-info">
                        <span className="kpi-label">Completed</span>
                        <strong className="kpi-value">{counts.completed}</strong>
                    </div>
                </div>
            </div>

            {/* =================================================
                TOOLBAR & FILTERS
            ================================================= */}
            <div className="scheduler-toolbar-card">
                <div className="toolbar-search-wrapper">
                    <Search size={16} className="toolbar-search-icon" />
                    <input
                        type="text"
                        className="toolbar-search-input"
                        placeholder="Search by subject, section, instructor, or room..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            type="button"
                            className="toolbar-search-clear"
                            onClick={() => setSearch("")}
                        >
                            ×
                        </button>
                    )}
                </div>

                <div className="toolbar-filters">
                    <div className="filter-tab-pills">
                        <button
                            type="button"
                            className={`tab-pill ${tabFilter === "ALL" ? "active" : ""}`}
                            onClick={() => setTabFilter("ALL")}
                        >
                            All ({schedules.length})
                        </button>
                        <button
                            type="button"
                            className={`tab-pill ${tabFilter === "UPCOMING" ? "active" : ""}`}
                            onClick={() => setTabFilter("UPCOMING")}
                        >
                            Upcoming
                        </button>
                        <button
                            type="button"
                            className={`tab-pill ${tabFilter === "PAST" ? "active" : ""}`}
                            onClick={() => setTabFilter("PAST")}
                        >
                            Past
                        </button>
                    </div>

                    <select
                        className="select-filter"
                        value={formatFilter}
                        onChange={(e) => setFormatFilter(e.target.value)}
                    >
                        <option value="ALL">All Class Formats</option>
                        {CLASS_FORMATS.map(([val, label]) => (
                            <option key={val} value={val}>
                                {label}
                            </option>
                        ))}
                    </select>

                    <select
                        className="select-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Statuses</option>
                        {CLASS_STATUSES.map(([val, label]) => (
                            <option key={val} value={val}>
                                {label}
                            </option>
                        ))}
                    </select>

                    <div className="view-toggle-group">
                        <button
                            type="button"
                            className={`btn-view-toggle ${viewMode === "cards" ? "active" : ""}`}
                            title="Timetable Cards View"
                            onClick={() => handleSetViewMode("cards")}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            type="button"
                            className={`btn-view-toggle ${viewMode === "table" ? "active" : ""}`}
                            title="Table List View"
                            onClick={() => handleSetViewMode("table")}
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* =================================================
                MAIN CONTENT: CARDS OR TABLE
            ================================================= */}
            {loading ? (
                <div className="scheduler-loading-state">
                    <div className="loading-spinner-circle" />
                    <p style={{ color: "#64748b", fontWeight: 600 }}>Loading academic schedules...</p>
                </div>
            ) : filteredSchedules.length === 0 ? (
                <div className="scheduler-empty-state">
                    <div className="empty-state-icon">
                        <Calendar size={36} />
                    </div>
                    <h3>No Classes Found</h3>
                    <p>
                        {search || formatFilter !== "ALL" || statusFilter !== "ALL" || tabFilter !== "ALL"
                            ? "No class schedule matches your current filters. Try resetting your search or filter options."
                            : "No classes have been scheduled yet. Create your first subject timetable to get started."}
                    </p>
                    <button
                        type="button"
                        className="btn-schedule-class"
                        onClick={openAddModal}
                    >
                        <Plus size={16} />
                        <span>Schedule a Class</span>
                    </button>
                </div>
            ) : viewMode === "cards" ? (
                /* =============================================
                   TIMETABLE CARDS VIEW
                ============================================= */
                <div className="scheduler-cards-grid">
                    {filteredSchedules.map((item) => (
                        <div
                            key={item.churchServiceId}
                            className={`class-card ${getFormatCardClass(item.serviceType)}`}
                        >
                            <div>
                                <div className="class-card-top">
                                    <span
                                        className={`class-type-badge ${getFormatBadgeClass(
                                            item.serviceType
                                        )}`}
                                    >
                                        <Layers size={11} />
                                        {item.serviceType || "LECTURE"}
                                    </span>

                                    <span
                                        className={`class-status-pill ${getStatusPillClass(
                                            item.status
                                        )}`}
                                    >
                                        {item.status || "SCHEDULED"}
                                    </span>
                                </div>

                                <h3 className="class-subject-title">{item.serviceName}</h3>

                                <div className="class-section-tag">
                                    {item.serviceLeader || "Regular Class Section"}
                                </div>

                                <div className="class-details-list">
                                    <div className="class-detail-item">
                                        <Calendar size={15} />
                                        <span>
                                            Date: <strong>{formatDate(item.serviceDate)}</strong>
                                        </span>
                                    </div>

                                    {(item.startTime || item.endTime) && (
                                        <div className="class-detail-item">
                                            <Clock size={15} />
                                            <span>
                                                Time:{" "}
                                                <strong>
                                                    {formatTime(item.startTime)}
                                                    {item.endTime ? ` – ${formatTime(item.endTime)}` : ""}
                                                </strong>
                                            </span>
                                        </div>
                                    )}

                                    {item.speaker && (
                                        <div className="class-detail-item">
                                            <Users size={15} />
                                            <span>
                                                Instructor: <strong>{item.speaker}</strong>
                                            </span>
                                        </div>
                                    )}

                                    {item.location && (
                                        <div className="class-detail-item">
                                            <MapPin size={15} />
                                            <span>
                                                Room: <strong>{item.location}</strong>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {item.description && (
                                    <p className="class-description" title={item.description}>
                                        {item.description}
                                    </p>
                                )}
                            </div>

                            <div className="class-card-footer">
                                <select
                                    className="quick-status-select"
                                    value={item.status || "SCHEDULED"}
                                    onChange={(e) =>
                                        handleQuickStatusChange(item.churchServiceId, e.target.value)
                                    }
                                >
                                    {CLASS_STATUSES.map(([val, label]) => (
                                        <option key={val} value={val}>
                                            {label}
                                        </option>
                                    ))}
                                </select>

                                <div className="card-action-btns">
                                    <button
                                        type="button"
                                        className="btn-card-edit"
                                        title="Edit Class Schedule"
                                        onClick={() => openEditModal(item)}
                                    >
                                        <Edit3 size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-card-delete"
                                        title="Delete Class Schedule"
                                        onClick={() => setDeleteSchedule(item)}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* =============================================
                   COMPACT TABLE VIEW
                ============================================= */
                <div className="scheduler-table-card">
                    <div className="table-responsive">
                        <table className="scheduler-table">
                            <thead>
                                <tr>
                                    <th>Subject & Section</th>
                                    <th>Session Type</th>
                                    <th>Schedule Date</th>
                                    <th>Time Period</th>
                                    <th>Classroom / Venue</th>
                                    <th>Instructor</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSchedules.map((item) => (
                                    <tr key={item.churchServiceId}>
                                        <td>
                                            <div className="table-subject-cell">
                                                <strong>{item.serviceName}</strong>
                                                <span className="table-section-tag">
                                                    {item.serviceLeader || "General Section"}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`class-type-badge ${getFormatBadgeClass(
                                                    item.serviceType
                                                )}`}
                                            >
                                                {item.serviceType || "LECTURE"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="table-date-cell">
                                                {formatDate(item.serviceDate)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="table-time-cell">
                                                <Clock size={13} style={{ color: "#94a3b8" }} />
                                                {formatTime(item.startTime)}
                                                {item.endTime ? ` - ${formatTime(item.endTime)}` : ""}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ color: "#475569" }}>
                                                {item.location || "—"}
                                            </span>
                                        </td>
                                        <td>
                                            <strong>{item.speaker || "—"}</strong>
                                        </td>
                                        <td>
                                            <select
                                                className="quick-status-select"
                                                value={item.status || "SCHEDULED"}
                                                onChange={(e) =>
                                                    handleQuickStatusChange(
                                                        item.churchServiceId,
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {CLASS_STATUSES.map(([val, label]) => (
                                                    <option key={val} value={val}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <div
                                                className="table-actions"
                                                style={{ justifyContent: "flex-end" }}
                                            >
                                                <button
                                                    type="button"
                                                    className="btn-card-edit"
                                                    title="Edit Class Schedule"
                                                    onClick={() => openEditModal(item)}
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-card-delete"
                                                    title="Delete Schedule"
                                                    onClick={() => setDeleteSchedule(item)}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* =================================================
                SCHEDULE / EDIT CLASS MODAL
            ================================================= */}
            {isModalOpen && (
                <div
                    className="scheduler-modal-overlay"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !saving) closeModal();
                    }}
                >
                    <div className="scheduler-modal">
                        <div className="modal-header-section">
                            <div>
                                <span className="modal-badge">
                                    <BookCheck size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />
                                    {editingId !== null ? "Edit Timetable" : "New Class Schedule"}
                                </span>
                                <h2>{editingId !== null ? "Edit Class Schedule" : "Schedule a Class Session"}</h2>
                                <p>
                                    Configure course subject, class section, timetable hours, faculty instructor, and classroom room.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="btn-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                            <div className="modal-body-scrollable">
                                <div className="modal-form-grid">
                                    {/* SUBJECT NAME */}
                                    <div className="modal-form-group form-field-full">
                                        <label htmlFor="modal-serviceName">
                                            <span>Subject / Course Name</span>
                                            <span className="required-mark">*</span>
                                        </label>
                                        <input
                                            id="modal-serviceName"
                                            name="serviceName"
                                            type="text"
                                            className="modal-input"
                                            value={form.serviceName}
                                            onChange={handleChange}
                                            placeholder="e.g. Old Testament Survey & Historical Books"
                                            required
                                            maxLength={200}
                                        />
                                        <div className="quick-chip-container">
                                            <span style={{ fontSize: 11, color: "#64748b", alignSelf: "center", marginRight: 4 }}>
                                                Quick Suggestions:
                                            </span>
                                            {SUBJECT_SUGGESTIONS.slice(0, 4).map((sugg) => (
                                                <button
                                                    key={sugg}
                                                    type="button"
                                                    className="quick-chip-btn"
                                                    onClick={() => setForm((p) => ({ ...p, serviceName: sugg }))}
                                                >
                                                    {sugg}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* SECTION / BATCH */}
                                    <div className="modal-form-group">
                                        <label htmlFor="modal-serviceLeader">
                                            <span>Section / Batch / Grade</span>
                                        </label>
                                        <input
                                            id="modal-serviceLeader"
                                            name="serviceLeader"
                                            type="text"
                                            className="modal-input"
                                            value={form.serviceLeader}
                                            onChange={handleChange}
                                            placeholder="e.g. Section A - 1st Year"
                                            maxLength={150}
                                        />
                                        <div className="quick-chip-container">
                                            {SECTION_SUGGESTIONS.slice(0, 3).map((sec) => (
                                                <button
                                                    key={sec}
                                                    type="button"
                                                    className="quick-chip-btn"
                                                    onClick={() => setForm((p) => ({ ...p, serviceLeader: sec }))}
                                                >
                                                    {sec}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CLASS FORMAT / TYPE */}
                                    <div className="modal-form-group">
                                        <label htmlFor="modal-serviceType">
                                            <span>Session Format / Type</span>
                                        </label>
                                        <select
                                            id="modal-serviceType"
                                            name="serviceType"
                                            className="modal-select"
                                            value={form.serviceType}
                                            onChange={handleChange}
                                        >
                                            {CLASS_FORMATS.map(([val, label]) => (
                                                <option key={val} value={val}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* INSTRUCTOR / TEACHER */}
                                    <div className="modal-form-group">
                                        <label htmlFor="modal-speaker">
                                            <span>Instructor / Faculty Teacher</span>
                                        </label>
                                        <input
                                            id="modal-speaker"
                                            name="speaker"
                                            type="text"
                                            className="modal-input"
                                            value={form.speaker}
                                            onChange={handleChange}
                                            placeholder="e.g. Dr. Rhoderick De Vera, Prof. Santos"
                                            maxLength={150}
                                        />
                                    </div>

                                    {/* ROOM / VENUE */}
                                    <div className="modal-form-group">
                                        <label htmlFor="modal-location">
                                            <span>Classroom / Room / Venue</span>
                                        </label>
                                        <input
                                            id="modal-location"
                                            name="location"
                                            type="text"
                                            className="modal-input"
                                            value={form.location}
                                            onChange={handleChange}
                                            placeholder="e.g. Room 101 - Academic Wing, Zoom Link"
                                            maxLength={200}
                                        />
                                        <div className="quick-chip-container">
                                            {ROOM_SUGGESTIONS.slice(0, 3).map((rm) => (
                                                <button
                                                    key={rm}
                                                    type="button"
                                                    className="quick-chip-btn"
                                                    onClick={() => setForm((p) => ({ ...p, location: rm }))}
                                                >
                                                    {rm}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* SCHEDULE DATE */}
                                    <div className="modal-form-group">
                                        <label htmlFor="modal-serviceDate">
                                            <span>Schedule Date</span>
                                            <span className="required-mark">*</span>
                                        </label>
                                        <input
                                            id="modal-serviceDate"
                                            name="serviceDate"
                                            type="date"
                                            className="modal-input"
                                            value={form.serviceDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* STATUS */}
                                    <div className="modal-form-group">
                                        <label htmlFor="modal-status">
                                            <span>Session Status</span>
                                        </label>
                                        <select
                                            id="modal-status"
                                            name="status"
                                            className="modal-select"
                                            value={form.status}
                                            onChange={handleChange}
                                        >
                                            {CLASS_STATUSES.map(([val, label]) => (
                                                <option key={val} value={val}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* START TIME */}
                                    <div className="modal-form-group">
                                        <label htmlFor="modal-startTime">
                                            <span>Start Time</span>
                                        </label>
                                        <input
                                            id="modal-startTime"
                                            name="startTime"
                                            type="time"
                                            className="modal-input"
                                            value={form.startTime}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* END TIME */}
                                    <div className="modal-form-group">
                                        <label htmlFor="modal-endTime">
                                            <span>End Time</span>
                                        </label>
                                        <input
                                            id="modal-endTime"
                                            name="endTime"
                                            type="time"
                                            className="modal-input"
                                            value={form.endTime}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* SYLLABUS / NOTES */}
                                    <div className="modal-form-group form-field-full">
                                        <label htmlFor="modal-description">
                                            <span>Syllabus Agenda / Class Instructions</span>
                                        </label>
                                        <textarea
                                            id="modal-description"
                                            name="description"
                                            className="modal-textarea"
                                            rows={3}
                                            value={form.description}
                                            onChange={handleChange}
                                            placeholder="Provide lecture topics, required readings, assignment reminders, or virtual classroom access link..."
                                            maxLength={MAX_DESCRIPTION_LENGTH}
                                        />
                                        <div className="char-count">
                                            {form.description.length} / {MAX_DESCRIPTION_LENGTH} characters
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer-actions">
                                <button
                                    type="button"
                                    className="btn-modal-cancel"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-modal-submit"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw size={15} className="animate-spin" /> Saving...
                                        </>
                                    ) : editingId !== null ? (
                                        <>
                                            <BookCheck size={16} /> Update Schedule
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={16} /> Schedule Class
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =================================================
                DELETE CONFIRMATION MODAL
            ================================================= */}
            {deleteSchedule && (
                <div
                    className="scheduler-modal-overlay"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !saving) setDeleteSchedule(null);
                    }}
                >
                    <div className="delete-modal-box">
                        <div className="delete-icon-wrapper">
                            <Trash2 size={26} />
                        </div>
                        <h3>Remove Class Schedule</h3>
                        <p>
                            Are you sure you want to remove the schedule for{" "}
                            <strong>"{deleteSchedule.serviceName}"</strong> on{" "}
                            {formatDate(deleteSchedule.serviceDate)}? This cannot be undone.
                        </p>
                        <div className="delete-modal-actions">
                            <button
                                type="button"
                                className="btn-modal-cancel"
                                onClick={() => setDeleteSchedule(null)}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn-confirm-delete"
                                onClick={handleDelete}
                                disabled={saving}
                            >
                                {saving ? "Removing..." : "Yes, Delete Schedule"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChurchServicesPage;
