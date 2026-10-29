import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
    Calendar,
    Clock,
    Video,
    BookOpen,
    FileText,
    MapPin,
    User,
    Plus,
    RefreshCw,
    Search,
    Printer,
    Bell,
    CheckCircle2,
    AlertCircle,
    CalendarPlus,
    X,
    Trash2,
    Edit3
} from "lucide-react";
import { API_BASE_URL } from "../../config";
import { SchoolPrintService } from "../../utils/schoolPrintService";
import type { SchoolReportPrintData } from "../../utils/schoolPrintService";
import "./StudentScheduleSystem.css";

/* =========================================================
   TYPES & INTERFACES
   ========================================================= */

export interface StudentScheduleItem {
    churchServiceId: number;
    customerId: number;
    serviceName: string;
    serviceType?: string; // "CLASS_LECTURE", "MODULAR_EXAM", "ONLINE_MEETING", "SEMINAR", "CHAPEL"
    serviceDate: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    serviceLeader?: string; // Class Cohort / Section (e.g. "Section A - 1st Year")
    speaker?: string; // Professor / Instructor (e.g. "Dr. Rhoderick De Vera")
    description?: string;
    status?: string; // "SCHEDULED", "LIVE_NOW", "COMPLETED", "CANCELLED"
    createdDate?: string;
    updatedDate?: string;
}

export interface ClientPermission {
    clientPermissionId?: number;
    moduleName: string;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canManage: boolean;
}

export interface StudentScheduleSystemProps {
    permissions?: ClientPermission[];
    onNavigate?: (page: string) => void;
}

export type ScheduleCategoryFilter = "ALL" | "EXAM" | "MEETING" | "LECTURE" | "SEMINAR";

/* =========================================================
   COMPONENT IMPLEMENTATION
   ========================================================= */

export const StudentScheduleSystem: React.FC<StudentScheduleSystemProps> = ({
    permissions = [],
    onNavigate
}) => {
    const canCreate = permissions.length === 0 || permissions.some(p => p.moduleName?.toLowerCase() === "services" ? p.canCreate : true);

    // Schedules state
    const [schedules, setSchedules] = useState<StudentScheduleItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

    // Filter and search
    const [categoryFilter, setCategoryFilter] = useState<ScheduleCategoryFilter>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Modal state (Create / Edit)
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<StudentScheduleItem | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Form inputs
    const [formTitle, setFormTitle] = useState<string>("");
    const [formCategory, setFormCategory] = useState<string>("CLASS_LECTURE");
    const [formDate, setFormDate] = useState<string>("");
    const [formStartTime, setFormStartTime] = useState<string>("08:00 AM");
    const [formEndTime, setFormEndTime] = useState<string>("10:00 AM");
    const [formLocation, setFormLocation] = useState<string>("");
    const [formInstructor, setFormInstructor] = useState<string>("");
    const [formSection, setFormSection] = useState<string>("Cohort 1 - All Students");
    const [formDescription, setFormDescription] = useState<string>("");
    const [formStatus, setFormStatus] = useState<string>("SCHEDULED");

    // Auth Token
    const getToken = (): string | null => {
        return (
            localStorage.getItem("clientToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("clientAccessToken")
        );
    };

    const getAxiosConfig = useCallback(() => {
        const token = getToken();
        return {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        };
    }, []);

    // ---------------------------------------------------------
    // FETCH REALTIME SCHEDULES FROM DATABASE
    // ---------------------------------------------------------
    const fetchSchedules = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);
        setError("");

        try {
            const response = await axios.get<StudentScheduleItem[]>(
                `${API_BASE_URL}/ChurchServices`,
                getAxiosConfig()
            );

            if (Array.isArray(response.data)) {
                // Sort by date ascending
                const sorted = [...response.data].sort((a, b) => {
                    const dateA = new Date(a.serviceDate).getTime();
                    const dateB = new Date(b.serviceDate).getTime();
                    return dateB - dateA;
                });
                setSchedules(sorted);
            } else {
                setSchedules([]);
            }
        } catch (err: any) {
            console.error("Error fetching student schedules from database:", err);
            setError(err.response?.data?.message || "Failed to load realtime schedules.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [getAxiosConfig]);

    // Initial load + periodic realtime sync every 25 seconds
    useEffect(() => {
        void fetchSchedules(false);

        const interval = setInterval(() => {
            void fetchSchedules(true);
        }, 25000);

        return () => clearInterval(interval);
    }, [fetchSchedules]);

    // ---------------------------------------------------------
    // CATEGORIZE AND NORMALIZE TYPE
    // ---------------------------------------------------------
    const getCategoryType = (type?: string, location?: string): "EXAM" | "MEETING" | "LECTURE" | "SEMINAR" => {
        const t = (type || "").toUpperCase();
        const l = (location || "").toUpperCase();

        if (t.includes("EXAM") || t.includes("MIDTERM") || t.includes("FINAL")) return "EXAM";
        if (t.includes("MEETING") || t.includes("ZOOM") || t.includes("ONLINE") || l.includes("ZOOM") || l.includes("MEET") || l.includes("HTTP")) return "MEETING";
        if (t.includes("SEMINAR") || t.includes("WORKSHOP") || t.includes("CHAPEL")) return "SEMINAR";
        return "LECTURE";
    };

    // Filtered schedules
    const filteredSchedules = useMemo(() => {
        return schedules.filter((item) => {
            const cat = getCategoryType(item.serviceType, item.location);
            const matchesCat = categoryFilter === "ALL" || cat === categoryFilter;

            const q = searchQuery.toLowerCase();
            const matchesQuery =
                !q ||
                item.serviceName.toLowerCase().includes(q) ||
                (item.speaker && item.speaker.toLowerCase().includes(q)) ||
                (item.location && item.location.toLowerCase().includes(q)) ||
                (item.description && item.description.toLowerCase().includes(q)) ||
                (item.serviceLeader && item.serviceLeader.toLowerCase().includes(q));

            return matchesCat && matchesQuery;
        });
    }, [schedules, categoryFilter, searchQuery]);

    // KPI Counts
    const metrics = useMemo(() => {
        let examsCount = 0;
        let meetingsCount = 0;
        let lecturesCount = 0;
        let liveCount = 0;

        schedules.forEach((s) => {
            const cat = getCategoryType(s.serviceType, s.location);
            if (cat === "EXAM") examsCount++;
            if (cat === "MEETING") meetingsCount++;
            if (cat === "LECTURE") lecturesCount++;
            if (s.status?.toUpperCase() === "LIVE_NOW" || s.status?.toUpperCase() === "ONGOING") liveCount++;
        });

        return {
            total: schedules.length,
            exams: examsCount,
            meetings: meetingsCount,
            lectures: lecturesCount,
            live: liveCount
        };
    }, [schedules]);

    // Active Live Notification item
    const urgentNotification = useMemo(() => {
        const live = schedules.find((s) => s.status?.toUpperCase() === "LIVE_NOW");
        if (live) return { type: "LIVE", item: live };

        const upcoming = schedules.find((s) => {
            const cat = getCategoryType(s.serviceType, s.location);
            return cat === "EXAM" || cat === "MEETING";
        });
        if (upcoming) return { type: "UPCOMING", item: upcoming };

        return schedules[0] ? { type: "INFO", item: schedules[0] } : null;
    }, [schedules]);

    // ---------------------------------------------------------
    // OPEN CREATE / EDIT MODAL
    // ---------------------------------------------------------
    const handleOpenCreate = () => {
        setEditingItem(null);
        setFormTitle("");
        setFormCategory("CLASS_LECTURE");
        setFormDate(new Date().toISOString().split("T")[0]);
        setFormStartTime("08:00 AM");
        setFormEndTime("10:00 AM");
        setFormLocation("Room 201 - Academic Hall");
        setFormInstructor("Dr. Rhoderick De Vera, Th.D.");
        setFormSection("Section A - 1st Year");
        setFormDescription("");
        setFormStatus("SCHEDULED");
        setShowModal(true);
    };

    const handleOpenEdit = (item: StudentScheduleItem) => {
        setEditingItem(item);
        setFormTitle(item.serviceName);
        setFormCategory(item.serviceType || "CLASS_LECTURE");
        setFormDate(item.serviceDate ? item.serviceDate.split("T")[0] : "");
        setFormStartTime(item.startTime || "08:00 AM");
        setFormEndTime(item.endTime || "10:00 AM");
        setFormLocation(item.location || "");
        setFormInstructor(item.speaker || "");
        setFormSection(item.serviceLeader || "");
        setFormDescription(item.description || "");
        setFormStatus(item.status || "SCHEDULED");
        setShowModal(true);
    };

    // ---------------------------------------------------------
    // SAVE SCHEDULE (POST / PUT VIA DATABASE API)
    // ---------------------------------------------------------
    const handleSaveSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim()) {
            alert("Please enter a subject or schedule title.");
            return;
        }

        setIsSaving(true);
        setError("");

        try {
            const payload = {
                serviceName: formTitle.trim(),
                serviceType: formCategory,
                serviceDate: `${formDate || new Date().toISOString().split("T")[0]}T00:00:00`,
                startTime: formStartTime,
                endTime: formEndTime,
                location: formLocation.trim(),
                speaker: formInstructor.trim(),
                serviceLeader: formSection.trim(),
                description: formDescription.trim(),
                status: formStatus
            };

            if (editingItem && editingItem.churchServiceId > 0) {
                // PUT Update
                await axios.put(
                    `${API_BASE_URL}/ChurchServices/${editingItem.churchServiceId}`,
                    payload,
                    getAxiosConfig()
                );
                setSuccessMessage(`Schedule "${formTitle}" updated successfully.`);
            } else {
                // POST Insert
                await axios.post(
                    `${API_BASE_URL}/ChurchServices`,
                    payload,
                    getAxiosConfig()
                );
                setSuccessMessage(`New schedule "${formTitle}" posted to the database.`);
            }

            setShowModal(false);
            void fetchSchedules(false);
            setTimeout(() => setSuccessMessage(""), 4000);
        } catch (err: any) {
            console.error("Failed to save schedule:", err);
            setError(err.response?.data?.message || "Failed to update schedule in database.");
        } finally {
            setIsSaving(false);
        }
    };

    // ---------------------------------------------------------
    // DELETE SCHEDULE
    // ---------------------------------------------------------
    const handleDeleteSchedule = async (id: number, name: string) => {
        if (!window.confirm(`Are you sure you want to remove "${name}" from the schedule database?`)) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/ChurchServices/${id}`, getAxiosConfig());
            setSuccessMessage(`Schedule removed from database.`);
            void fetchSchedules(false);
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err: any) {
            console.error("Failed to delete schedule:", err);
            alert("Failed to delete schedule: " + (err.response?.data?.message || err.message));
        }
    };

    // ---------------------------------------------------------
    // GOOGLE CALENDAR LINK GENERATOR
    // ---------------------------------------------------------
    const getGoogleCalendarUrl = (item: StudentScheduleItem) => {
        const title = encodeURIComponent(item.serviceName);
        const details = encodeURIComponent(
            `${item.description || ""}\nInstructor: ${item.speaker || "MBS Faculty"}\nVenue: ${item.location || ""}`
        );
        const loc = encodeURIComponent(item.location || "Mobile Bible School Campus");

        // Format Date
        const dateClean = item.serviceDate.split("T")[0].replace(/-/g, "");
        const dates = `${dateClean}T080000Z/${dateClean}T100000Z`;

        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${loc}&dates=${dates}`;
    };

    // ---------------------------------------------------------
    // PRINT MASTER SCHEDULE SYLLABUS
    // ---------------------------------------------------------
    const handlePrintMasterSchedule = () => {
        const reportData: SchoolReportPrintData = {
            title: "MOBILE BIBLE SCHOOL & THEOLOGICAL SEMINARY",
            category: "OFFICIAL ACADEMIC SCHEDULE & NOTIFICATION DIRECTORY",
            description: `Live Databased Schedule Directory for Students & Faculty • Trimester SY 2026-2027`,
            filterSummary: `Total Scheduled Sessions: ${schedules.length} • Generated on ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
            summaryCards: [
                { label: "Total Sessions", value: metrics.total, subtext: "In Database" },
                { label: "Examinations", value: metrics.exams, subtext: "Modular & Finals" },
                { label: "Online Meetings", value: metrics.meetings, subtext: "Zoom & Google Meet" },
                { label: "Campus Lectures", value: metrics.lectures, subtext: "Academic Hubs" }
            ],
            columns: [
                { header: "Schedule Title / Subject", width: "30%", align: "left" },
                { header: "Category", width: "15%", align: "left" },
                { header: "Date & Time", width: "20%", align: "left" },
                { header: "Venue / Online Room", width: "20%", align: "left" },
                { header: "Instructor / Proctor", width: "15%", align: "left" }
            ],
            rows: schedules.map((s) => [
                s.serviceName,
                s.serviceType || "LECTURE",
                `${s.serviceDate.split("T")[0]} (${s.startTime || "08:00 AM"} - ${s.endTime || "10:00 AM"})`,
                s.location || "Academic Hall",
                s.speaker || "Faculty Staff"
            ])
        };

        SchoolPrintService.printReport(reportData);
    };

    return (
        <div className="sss-container">
            {/* =====================================================
                HERO BANNER WITH REALTIME DATABASE STATUS
            ===================================================== */}
            <header className="sss-hero">
                <div className="sss-hero-content">
                    <div>
                        <div className="sss-live-badge">
                            <span className="pulse-dot" />
                            Live SQL Database Connected • Auto-Sync Active
                        </div>
                        <h1 className="sss-hero-title">
                            Realtime Student Schedule & Notification System
                        </h1>
                        <div className="sss-hero-meta">
                            <span><strong>Institution:</strong> Mobile Bible School & Theological Seminary</span>
                            <span className="divider">•</span>
                            <span><strong>Synced Records:</strong> {schedules.length} Live in Database</span>
                            <span className="divider">•</span>
                            <span><strong>Term:</strong> 1st Trimester A.Y. 2026–2027</span>
                        </div>
                    </div>

                    <div className="sss-hero-actions">
                        <button
                            type="button"
                            className="sss-btn-secondary"
                            onClick={() => void fetchSchedules(false)}
                            title="Instant re-fetch from database"
                        >
                            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                            Sync Database
                        </button>

                        {onNavigate && (
                            <button
                                type="button"
                                className="sss-btn-secondary"
                                onClick={() => onNavigate("learning")}
                                title="Go to Student Learning Studio"
                            >
                                <BookOpen size={16} />
                                Learning Area
                            </button>
                        )}

                        <button
                            type="button"
                            className="sss-btn-secondary"
                            onClick={handlePrintMasterSchedule}
                        >
                            <Printer size={16} />
                            Print Schedule
                        </button>

                        {canCreate && (
                            <button
                                type="button"
                                className="sss-btn-primary"
                                onClick={handleOpenCreate}
                            >
                            <Plus size={18} />
                            Post New Schedule
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Success Message Banner */}
            {successMessage && (
                <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "14px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "10px", fontWeight: 600 }}>
                    <CheckCircle2 size={20} />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Error Message Banner */}
            {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "10px", fontWeight: 600 }}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* =====================================================
                ACTIVE NOTIFICATION MARQUEE / ALERT BAR
            ===================================================== */}
            {urgentNotification && (
                <div className="sss-notification-bar">
                    <div className="sss-notification-left">
                        <div className="sss-notification-icon">
                            <Bell size={20} />
                        </div>
                        <div>
                            <strong>
                                {urgentNotification.type === "LIVE"
                                    ? "🔴 LIVE NOW ONGOING:"
                                    : urgentNotification.type === "UPCOMING"
                                        ? "📢 UPCOMING SCHEDULE ALERT:"
                                        : "ℹ️ IMPORTANT ANNOUNCEMENT:"}
                            </strong>{" "}
                            <span>{urgentNotification.item.serviceName}</span>{" "}
                            <span style={{ opacity: 0.8 }}>
                                • {urgentNotification.item.serviceDate.split("T")[0]} ({urgentNotification.item.startTime || "TBA"})
                            </span>
                        </div>
                    </div>

                    {urgentNotification.item.location && urgentNotification.item.location.toLowerCase().includes("http") && (
                        <a
                            href={urgentNotification.item.location.match(/https?:\/\/[^\s]+/)?.[0] || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sss-btn-join"
                            style={{ flexShrink: 0 }}
                        >
                            <Video size={16} />
                            Join Online Live Room
                        </a>
                    )}
                </div>
            )}

            {/* =====================================================
                KPI METRICS CARDS
            ===================================================== */}
            <section className="sss-kpi-grid">
                <div className="sss-kpi-card">
                    <div className="sss-kpi-top">
                        <div>
                            <div className="sss-kpi-label">Total Scheduled</div>
                            <div className="sss-kpi-value">{metrics.total}</div>
                        </div>
                        <div className="sss-kpi-icon indigo">
                            <Calendar size={22} />
                        </div>
                    </div>
                    <div className="sss-kpi-subtext">Active database records</div>
                </div>

                <div className="sss-kpi-card">
                    <div className="sss-kpi-top">
                        <div>
                            <div className="sss-kpi-label">Examinations</div>
                            <div className="sss-kpi-value" style={{ color: "#e11d48" }}>{metrics.exams}</div>
                        </div>
                        <div className="sss-kpi-icon rose">
                            <FileText size={22} />
                        </div>
                    </div>
                    <div className="sss-kpi-subtext">Modular Midterm & Finals</div>
                </div>

                <div className="sss-kpi-card">
                    <div className="sss-kpi-top">
                        <div>
                            <div className="sss-kpi-label">Online Meetings</div>
                            <div className="sss-kpi-value" style={{ color: "#0891b2" }}>{metrics.meetings}</div>
                        </div>
                        <div className="sss-kpi-icon cyan">
                            <Video size={22} />
                        </div>
                    </div>
                    <div className="sss-kpi-subtext">Zoom & Google Meet Links</div>
                </div>

                <div className="sss-kpi-card">
                    <div className="sss-kpi-top">
                        <div>
                            <div className="sss-kpi-label">Classroom Lectures</div>
                            <div className="sss-kpi-value" style={{ color: "#2563eb" }}>{metrics.lectures}</div>
                        </div>
                        <div className="sss-kpi-icon blue">
                            <BookOpen size={22} />
                        </div>
                    </div>
                    <div className="sss-kpi-subtext">On-Campus & Modular Hubs</div>
                </div>
            </section>

            {/* =====================================================
                CONTROLS & FILTER TABS
            ===================================================== */}
            <div className="sss-controls-bar">
                <div className="sss-filter-pills">
                    <button
                        type="button"
                        className={`sss-filter-pill ${categoryFilter === "ALL" ? "active" : ""}`}
                        onClick={() => setCategoryFilter("ALL")}
                    >
                        <span>All Schedules</span>
                        <span style={{ fontSize: "0.74rem", opacity: 0.7 }}>({metrics.total})</span>
                    </button>

                    <button
                        type="button"
                        className={`sss-filter-pill ${categoryFilter === "EXAM" ? "active" : ""}`}
                        onClick={() => setCategoryFilter("EXAM")}
                    >
                        <span>📝 Modular Exams</span>
                        <span style={{ fontSize: "0.74rem", opacity: 0.7 }}>({metrics.exams})</span>
                    </button>

                    <button
                        type="button"
                        className={`sss-filter-pill ${categoryFilter === "MEETING" ? "active" : ""}`}
                        onClick={() => setCategoryFilter("MEETING")}
                    >
                        <span>📹 Online Meetings</span>
                        <span style={{ fontSize: "0.74rem", opacity: 0.7 }}>({metrics.meetings})</span>
                    </button>

                    <button
                        type="button"
                        className={`sss-filter-pill ${categoryFilter === "LECTURE" ? "active" : ""}`}
                        onClick={() => setCategoryFilter("LECTURE")}
                    >
                        <span>📖 Class Lectures</span>
                        <span style={{ fontSize: "0.74rem", opacity: 0.7 }}>({metrics.lectures})</span>
                    </button>

                    <button
                        type="button"
                        className={`sss-filter-pill ${categoryFilter === "SEMINAR" ? "active" : ""}`}
                        onClick={() => setCategoryFilter("SEMINAR")}
                    >
                        <span>✦ Seminars & Chapels</span>
                    </button>
                </div>

                <div className="sss-search-box">
                    <Search size={16} style={{ position: "absolute", left: "12px", color: "#94a3b8" }} />
                    <input
                        type="text"
                        className="sss-search-input"
                        placeholder="Search subject, instructor, room..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* =====================================================
                SCHEDULE CARDS GRID
            ===================================================== */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "60px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                    <RefreshCw size={28} className="animate-spin" style={{ margin: "0 auto 12px auto", color: "#4f46e5" }} />
                    <h3 style={{ margin: 0, color: "#0f172a" }}>Loading Realtime Schedules...</h3>
                    <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "0.88rem" }}>Connecting to seminary SQL database</p>
                </div>
            ) : filteredSchedules.length > 0 ? (
                <div className="sss-cards-grid">
                    {filteredSchedules.map((item) => {
                        const cat = getCategoryType(item.serviceType, item.location);
                        const isLive = item.status?.toUpperCase() === "LIVE_NOW" || item.status?.toUpperCase() === "ONGOING";
                        const hasMeetingLink = item.location && item.location.toLowerCase().includes("http");
                        const rawUrl = hasMeetingLink ? item.location?.match(/https?:\/\/[^\s]+/)?.[0] : null;

                        return (
                            <div key={item.churchServiceId} className={`sss-card ${cat.toLowerCase()}`}>
                                <div>
                                    <div className="sss-card-top">
                                        <span className={`sss-type-badge ${cat.toLowerCase()}`}>
                                            {cat === "EXAM" && "📝 Modular Exam"}
                                            {cat === "MEETING" && "📹 Online Meeting"}
                                            {cat === "LECTURE" && "📖 Class Lecture"}
                                            {cat === "SEMINAR" && "✦ Exegesis Seminar"}
                                        </span>

                                        <span className={`sss-status-pill ${isLive ? "live" : "scheduled"}`}>
                                            {isLive ? "🔴 LIVE NOW" : "✓ SCHEDULED"}
                                        </span>
                                    </div>

                                    <h3 className="sss-card-title">{item.serviceName}</h3>

                                    <div className="sss-card-details">
                                        <div className="sss-detail-row">
                                            <Calendar size={16} color="#4f46e5" />
                                            <span>
                                                <strong>{item.serviceDate.split("T")[0]}</strong>
                                            </span>
                                        </div>

                                        <div className="sss-detail-row">
                                            <Clock size={16} color="#0891b2" />
                                            <span>{item.startTime || "TBA"} - {item.endTime || "TBA"}</span>
                                        </div>

                                        <div className="sss-detail-row location">
                                            <MapPin size={16} color="#e11d48" />
                                            <span>{item.location || "Mobile Bible School Campus"}</span>
                                        </div>

                                        {item.speaker && (
                                            <div className="sss-detail-row">
                                                <User size={16} color="#64748b" />
                                                <span>Instructor: <strong>{item.speaker}</strong></span>
                                            </div>
                                        )}

                                        {item.serviceLeader && (
                                            <div className="sss-detail-row" style={{ fontSize: "0.8rem", color: "#64748b" }}>
                                                <span>Target: {item.serviceLeader}</span>
                                            </div>
                                        )}
                                    </div>

                                    {item.description && (
                                        <div className="sss-card-description">
                                            {item.description}
                                        </div>
                                    )}
                                </div>

                                <div className="sss-card-actions">
                                    {hasMeetingLink && rawUrl ? (
                                        <a
                                            href={rawUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="sss-btn-join"
                                        >
                                            <Video size={15} />
                                            Join Live Room
                                        </a>
                                    ) : (
                                        <a
                                            href={getGoogleCalendarUrl(item)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="sss-btn-secondary"
                                            style={{ padding: "6px 12px", fontSize: "0.8rem", color: "#334155", background: "#f8fafc", borderColor: "#cbd5e1" }}
                                            title="Add to Google Calendar"
                                        >
                                            <CalendarPlus size={15} />
                                            Add to Calendar
                                        </a>
                                    )}

                                    <div className="sss-action-icons">
                                        <button
                                            type="button"
                                            className="sss-icon-btn"
                                            title="Edit Schedule"
                                            onClick={() => handleOpenEdit(item)}
                                        >
                                            <Edit3 size={15} />
                                        </button>
                                        <button
                                            type="button"
                                            className="sss-icon-btn"
                                            title="Delete Schedule"
                                            onClick={() => handleDeleteSchedule(item.churchServiceId, item.serviceName)}
                                        >
                                            <Trash2 size={15} color="#dc2626" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{ textAlign: "center", padding: "60px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                    <Calendar size={36} style={{ color: "#94a3b8", margin: "0 auto 12px auto" }} />
                    <h3 style={{ margin: "0 0 6px 0", color: "#0f172a" }}>No Schedules Found</h3>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.88rem" }}>
                        No records match the selected category or search filter.
                    </p>
                </div>
            )}

            {/* =====================================================
                MODAL: POST / EDIT SCHEDULE IN DATABASE
            ===================================================== */}
            {showModal && (
                <div className="sss-modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="sss-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="sss-modal-header">
                            <div>
                                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>
                                    {editingItem ? "Edit Schedule Record" : "Post New Student Schedule"}
                                </h3>
                                <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "#64748b" }}>
                                    Live updates will be instantly broadcast to all students and faculty in the database
                                </p>
                            </div>
                            <button
                                type="button"
                                className="sss-icon-btn"
                                onClick={() => setShowModal(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveSchedule} className="sss-form-grid">
                            <div className="sss-form-group full">
                                <label>Subject / Schedule Title:</label>
                                <input
                                    type="text"
                                    className="sss-input"
                                    placeholder="e.g. HERM-101: Midterm Modular Examination"
                                    value={formTitle}
                                    required
                                    onChange={(e) => setFormTitle(e.target.value)}
                                />
                            </div>

                            <div className="sss-form-group">
                                <label>Schedule Category:</label>
                                <select
                                    className="sss-input"
                                    value={formCategory}
                                    onChange={(e) => setFormCategory(e.target.value)}
                                >
                                    <option value="CLASS_LECTURE">Classroom Lecture</option>
                                    <option value="MODULAR_EXAM">Modular Examination (Midterm / Final)</option>
                                    <option value="ONLINE_MEETING">Live Online Video Meeting (Zoom / Meet)</option>
                                    <option value="EXEGESIS_SEMINAR">Exegesis Seminar & Workshop</option>
                                    <option value="CHAPEL">Seminary Chapel & Convocation</option>
                                </select>
                            </div>

                            <div className="sss-form-group">
                                <label>Status:</label>
                                <select
                                    className="sss-input"
                                    value={formStatus}
                                    onChange={(e) => setFormStatus(e.target.value)}
                                >
                                    <option value="SCHEDULED">SCHEDULED</option>
                                    <option value="LIVE_NOW">LIVE NOW (Ongoing)</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </select>
                            </div>

                            <div className="sss-form-group">
                                <label>Date:</label>
                                <input
                                    type="date"
                                    className="sss-input"
                                    value={formDate}
                                    required
                                    onChange={(e) => setFormDate(e.target.value)}
                                />
                            </div>

                            <div className="sss-form-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                <div>
                                    <label>Start Time:</label>
                                    <input
                                        type="text"
                                        className="sss-input"
                                        placeholder="08:00 AM"
                                        value={formStartTime}
                                        onChange={(e) => setFormStartTime(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label>End Time:</label>
                                    <input
                                        type="text"
                                        className="sss-input"
                                        placeholder="10:00 AM"
                                        value={formEndTime}
                                        onChange={(e) => setFormEndTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="sss-form-group full">
                                <label>Venue / Online Meeting URL:</label>
                                <input
                                    type="text"
                                    className="sss-input"
                                    placeholder="e.g. Room 201 - Academic Hall OR Zoom: https://zoom.us/j/8492019482?pwd=..."
                                    value={formLocation}
                                    required
                                    onChange={(e) => setFormLocation(e.target.value)}
                                />
                            </div>

                            <div className="sss-form-group">
                                <label>Professor / Instructor / Proctor:</label>
                                <input
                                    type="text"
                                    className="sss-input"
                                    placeholder="e.g. Dr. Samuel Vance, Th.D."
                                    value={formInstructor}
                                    onChange={(e) => setFormInstructor(e.target.value)}
                                />
                            </div>

                            <div className="sss-form-group">
                                <label>Target Cohort / Section:</label>
                                <input
                                    type="text"
                                    className="sss-input"
                                    placeholder="e.g. Section A - 1st Year (B.Min)"
                                    value={formSection}
                                    onChange={(e) => setFormSection(e.target.value)}
                                />
                            </div>

                            <div className="sss-form-group full">
                                <label>Description / Exam Syllabus / Meeting Notes:</label>
                                <textarea
                                    className="sss-input"
                                    style={{ minHeight: "80px" }}
                                    placeholder="Enter examination coverage, required modular reading packages, or meeting passcodes..."
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                />
                            </div>

                            <div className="sss-form-group full" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                                <button
                                    type="button"
                                    className="sss-btn-secondary"
                                    style={{ background: "#f1f5f9", color: "#334155" }}
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="sss-btn-primary"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            Saving to Database...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={16} />
                                            {editingItem ? "Update Database Schedule" : "Save & Broadcast Schedule"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentScheduleSystem;
