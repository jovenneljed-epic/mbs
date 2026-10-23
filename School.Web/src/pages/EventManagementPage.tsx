// ============================================================
// EventManagementPage.tsx -> MOBILE BIBLE SCHOOL & THEOLOGICAL SEMINARY
// Official School Events Manager & Landing Page Editor CMS
// Directly controls and synchronizes events shown on the Public Landing Page
// ============================================================

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import axios from "axios";
import {
    Calendar,
    CalendarDays,
    Clock,
    MapPin,
    User,
    Plus,
    Edit3,
    Trash2,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    Search,
    Sparkles,
    RefreshCw,
    Globe,
    Building2,
    BookOpen,
    Download,
    Tag,
    X,
    Users
} from "lucide-react";
import { API_BASE_URL } from "../config";
import {
    getPublicSchoolEvents,
    saveSchoolEventsCache,
    notifySchoolEventsUpdated,
    formatDateLong,
    parseDayMonth,
    type SchoolEventItem,
} from "../services/schoolPublicDataService";
import EventPlanningPanel from "./events/EventPlanningPanel";
import "./EventManagementPage.css";

/* =========================================================
   TYPES & PRESETS
========================================================= */

export type EventStatus =
    | "SCHEDULED"
    | "UPCOMING"
    | "ONGOING"
    | "COMPLETED"
    | "CANCELLED";

export interface SchoolEventFormState {
    id?: number | string;
    title: string;
    eventType: string;
    startDate: string;
    startTime: string;
    endTime: string;
    location: string;
    speaker: string;
    ministry: string;
    status: EventStatus;
    description: string;
    notes: string;
}

const EVENT_TYPE_OPTIONS = [
    "Pastoral Intensive",
    "Admissions Open House",
    "Leadership Summit",
    "Commencement Exercises",
    "Modular Seminar",
    "Theological Colloquium",
    "Biblical Hermeneutics Workshop",
    "Missions Conference",
    "Campus Activity"
];

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
    { value: "SCHEDULED", label: "Scheduled (Live on Landing Page)" },
    { value: "UPCOMING", label: "Upcoming (Highlighted)" },
    { value: "ONGOING", label: "Ongoing (Active Today)" },
    { value: "COMPLETED", label: "Completed (Past Event)" },
    { value: "CANCELLED", label: "Cancelled" },
];

const INITIAL_FORM_STATE: SchoolEventFormState = {
    title: "",
    eventType: "Pastoral Intensive",
    startDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "17:00",
    location: "Main Seminary Campus (Hall A) & Zoom",
    speaker: "",
    ministry: "Biblical Studies & Homiletics",
    status: "SCHEDULED",
    description: "",
    notes: ""
};

/* =========================================================
   AUTH HELPER
========================================================= */

function getAuthHeaders(): Record<string, string> {
    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        "";

    return token ? { Authorization: `Bearer ${token}` } : {};
}

/* =========================================================
   COMPONENT
========================================================= */

export const EventManagementPage: React.FC = () => {
    // ---------------------------------------------------------
    // Main Data States
    // ---------------------------------------------------------
    const [events, setEvents] = useState<SchoolEventItem[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

    // ---------------------------------------------------------
    // Filters & Tabs
    // ---------------------------------------------------------
    const [search, setSearch] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
    const [activeDetailTab, setActiveDetailTab] = useState<"landing" | "operations">("landing");

    // ---------------------------------------------------------
    // Modal States
    // ---------------------------------------------------------
    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [formState, setFormState] = useState<SchoolEventFormState>(INITIAL_FORM_STATE);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [eventToDelete, setEventToDelete] = useState<SchoolEventItem | null>(null);

    // ---------------------------------------------------------
    // Auto-dismiss success notification
    // ---------------------------------------------------------
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(""), 4500);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // ---------------------------------------------------------
    // Load Events (Synchronized with backend & Landing Page)
    // ---------------------------------------------------------
    const loadEvents = useCallback(async (preferredId?: number | string | null) => {
        try {
            setLoading(true);
            setError("");

            // 1. Try authorized backend endpoint first
            let fetchedEvents: SchoolEventItem[] = [];
            try {
                const response = await axios.get(`${API_BASE_URL}/Events`, {
                    headers: getAuthHeaders(),
                    timeout: 6000
                });

                const data = response.data;
                const rawList: any[] = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.items)
                    ? data.items
                    : Array.isArray(data?.data)
                    ? data.data
                    : [];

                if (rawList.length > 0) {
                    fetchedEvents = rawList.map((e, idx) => {
                        const rawDate = e.startDate || e.eventDate || e.EventDate || e.StartDate || "";
                        const cleanDate = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;
                        const sTime = e.startTime || e.StartTime || "";
                        const eTime = e.endTime || e.EndTime || "";

                        return {
                            id: e.id || e.eventId || e.EventId || idx + 1,
                            title: e.title || e.Title || "Seminary Event",
                            eventType: e.eventType || e.EventType || "Campus Activity",
                            startDate: cleanDate,
                            formattedDate: formatDateLong(cleanDate),
                            dayMonth: parseDayMonth(cleanDate),
                            time: sTime ? `${sTime}${eTime ? ` - ${eTime}` : ""}` : "TBA",
                            rawStartTime: sTime,
                            rawEndTime: eTime,
                            location: e.venue || e.Venue || e.location || e.Location || "Main Seminary Campus",
                            speaker: e.speaker || e.Speaker || e.coordinator || e.Coordinator || "",
                            ministry: e.ministry || e.Ministry || "",
                            status: e.status || e.Status || "SCHEDULED",
                            description: e.description || e.Description || e.notes || e.Notes || "Join us for this theological seminar.",
                            notes: e.notes || e.Notes || ""
                        };
                    });
                }
            } catch (authErr) {
                console.warn("Could not fetch authorized /Events, falling back to public events helper:", authErr);
            }

            // 2. If empty or authorized endpoint was unavailable, load via centralized public service
            if (fetchedEvents.length === 0) {
                fetchedEvents = await getPublicSchoolEvents();
            }

            setEvents(fetchedEvents);

            // Sync cache and notify open tabs / landing page
            saveSchoolEventsCache(fetchedEvents);

            // Set selected event
            setSelectedEventId((prev) => {
                if (preferredId != null && fetchedEvents.some(ev => String(ev.id) === String(preferredId))) {
                    return preferredId;
                }
                if (prev != null && fetchedEvents.some(ev => String(ev.id) === String(prev))) {
                    return prev;
                }
                return fetchedEvents[0]?.id ?? null;
            });

        } catch (err: any) {
            console.error("Error loading school events:", err);
            setError("Unable to load events. Please check your network connection.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        void loadEvents();
    }, [loadEvents]);

    // ---------------------------------------------------------
    // Selected Event
    // ---------------------------------------------------------
    const selectedEvent = useMemo<SchoolEventItem | null>(() => {
        if (selectedEventId == null) return events[0] || null;
        return events.find((e) => String(e.id) === String(selectedEventId)) || events[0] || null;
    }, [events, selectedEventId]);

    // ---------------------------------------------------------
    // Filtered Events
    // ---------------------------------------------------------
    const filteredEvents = useMemo(() => {
        return events.filter((ev) => {
            // Search
            const query = search.trim().toLowerCase();
            const matchesSearch =
                !query ||
                ev.title.toLowerCase().includes(query) ||
                ev.eventType.toLowerCase().includes(query) ||
                ev.location.toLowerCase().includes(query) ||
                (ev.speaker && ev.speaker.toLowerCase().includes(query)) ||
                (ev.ministry && ev.ministry.toLowerCase().includes(query)) ||
                (ev.description && ev.description.toLowerCase().includes(query));

            // Status filter
            const matchesStatus =
                statusFilter === "ALL" ||
                ev.status.toUpperCase() === statusFilter.toUpperCase();

            // Category filter
            const matchesCategory =
                categoryFilter === "ALL" ||
                ev.eventType.toLowerCase() === categoryFilter.toLowerCase();

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [events, search, statusFilter, categoryFilter]);

    // ---------------------------------------------------------
    // Statistics
    // ---------------------------------------------------------
    const stats = useMemo(() => {
        const total = events.length;
        const upcoming = events.filter((e) => {
            const st = (e.status || "").toUpperCase();
            return st === "SCHEDULED" || st === "UPCOMING";
        }).length;
        const ongoing = events.filter((e) => (e.status || "").toUpperCase() === "ONGOING").length;
        const completed = events.filter((e) => (e.status || "").toUpperCase() === "COMPLETED").length;
        return { total, upcoming, ongoing, completed };
    }, [events]);

    // ---------------------------------------------------------
    // Open Create Modal
    // ---------------------------------------------------------
    const handleOpenCreate = () => {
        setFormState({
            ...INITIAL_FORM_STATE,
            startDate: new Date().toISOString().split("T")[0]
        });
        setModalMode("create");
        setShowModal(true);
    };

    // ---------------------------------------------------------
    // Open Edit Modal
    // ---------------------------------------------------------
    const handleOpenEdit = (eventItem: SchoolEventItem) => {
        let sTime = eventItem.rawStartTime || "";
        let eTime = eventItem.rawEndTime || "";

        // Attempt parsing from time string if raw times missing (e.g. "09:00 - 17:00")
        if (!sTime && eventItem.time) {
            const parts = eventItem.time.split("-").map(p => p.trim());
            sTime = parts[0] || "09:00";
            eTime = parts[1] || "17:00";
        }

        // Clean time to HH:MM format
        if (sTime.includes(":") && sTime.length > 5) sTime = sTime.substring(0, 5);
        if (eTime.includes(":") && eTime.length > 5) eTime = eTime.substring(0, 5);

        let validStatus: EventStatus = "SCHEDULED";
        const upper = (eventItem.status || "").toUpperCase();
        if (["SCHEDULED", "UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"].includes(upper)) {
            validStatus = upper as EventStatus;
        }

        setFormState({
            id: eventItem.id,
            title: eventItem.title,
            eventType: eventItem.eventType || "Pastoral Intensive",
            startDate: eventItem.startDate || new Date().toISOString().split("T")[0],
            startTime: sTime || "09:00",
            endTime: eTime || "17:00",
            location: eventItem.location || "Main Seminary Campus",
            speaker: eventItem.speaker || "",
            ministry: eventItem.ministry || "Biblical Studies & Homiletics",
            status: validStatus,
            description: eventItem.description || "",
            notes: eventItem.notes || ""
        });

        setModalMode("edit");
        setShowModal(true);
    };

    // ---------------------------------------------------------
    // Save Event (Create or Update)
    // ---------------------------------------------------------
    const handleSaveEvent = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formState.title.trim()) {
            alert("Please enter the event title.");
            return;
        }

        if (!formState.location.trim()) {
            alert("Please enter the venue or campus location.");
            return;
        }

        if (!formState.startDate) {
            alert("Please select the event date.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const cleanStartTime = formState.startTime ? (formState.startTime.length === 5 ? `${formState.startTime}:00` : formState.startTime) : "09:00:00";
            const cleanEndTime = formState.endTime ? (formState.endTime.length === 5 ? `${formState.endTime}:00` : formState.endTime) : "17:00:00";

            const apiPayload = {
                title: formState.title.trim(),
                eventType: formState.eventType.trim() || "Pastoral Intensive",
                eventDate: formState.startDate,
                startTime: cleanStartTime,
                endTime: cleanEndTime,
                venue: formState.location.trim(),
                speaker: formState.speaker.trim() || null,
                ministry: formState.ministry.trim() || null,
                status: formState.status || "SCHEDULED",
                description: formState.description.trim() || null,
                notes: formState.notes.trim() || null,
            };

            let savedId: number | string = formState.id || 0;
            const isNumericId = typeof formState.id === "number" || (!isNaN(Number(formState.id)) && Number(formState.id) > 0);

            if (modalMode === "edit" && isNumericId && Number(formState.id) < 100) {
                // Update existing backend event
                try {
                    await axios.put(`${API_BASE_URL}/Events/${formState.id}`, {
                        ...apiPayload,
                        eventId: Number(formState.id)
                    }, {
                        headers: {
                            ...getAuthHeaders(),
                            "Content-Type": "application/json"
                        }
                    });
                } catch (putErr) {
                    console.warn("PUT to backend failed, attempting POST to ensure record exists in DB:", putErr);
                    const postRes = await axios.post(`${API_BASE_URL}/Events`, apiPayload, {
                        headers: {
                            ...getAuthHeaders(),
                            "Content-Type": "application/json"
                        }
                    });
                    savedId = postRes.data?.eventId || postRes.data?.id || savedId;
                }
            } else {
                // Create new event on backend
                try {
                    const postRes = await axios.post(`${API_BASE_URL}/Events`, apiPayload, {
                        headers: {
                            ...getAuthHeaders(),
                            "Content-Type": "application/json"
                        }
                    });
                    savedId = postRes.data?.eventId || postRes.data?.id || Date.now();
                } catch (postErr) {
                    console.warn("Backend POST failed, persisting to local storage and cache:", postErr);
                    savedId = formState.id || Date.now();
                }
            }

            // Construct updated event item
            const dayMonth = parseDayMonth(formState.startDate);
            const formattedTime = `${formState.startTime}${formState.endTime ? ` - ${formState.endTime}` : ""}`;
            const updatedItem: SchoolEventItem = {
                id: savedId,
                title: formState.title.trim(),
                eventType: formState.eventType.trim(),
                startDate: formState.startDate,
                formattedDate: formatDateLong(formState.startDate),
                dayMonth,
                time: formattedTime,
                rawStartTime: formState.startTime,
                rawEndTime: formState.endTime,
                location: formState.location.trim(),
                speaker: formState.speaker.trim(),
                ministry: formState.ministry.trim(),
                status: formState.status,
                description: formState.description.trim() || "Join us for this theological seminar and fellowship.",
                notes: formState.notes.trim()
            };

            // Update in-memory events list
            let updatedList: SchoolEventItem[];
            if (modalMode === "edit") {
                updatedList = events.map(ev => String(ev.id) === String(formState.id) ? updatedItem : ev);
            } else {
                updatedList = [updatedItem, ...events];
            }

            setEvents(updatedList);
            setSelectedEventId(savedId);

            // Save to shared cache & trigger instant landing page refresh
            saveSchoolEventsCache(updatedList);
            notifySchoolEventsUpdated(updatedList);

            setShowModal(false);
            setSuccessMessage(
                modalMode === "edit"
                    ? `✓ Event "${formState.title}" updated and published to Landing Page!`
                    : `✓ Event "${formState.title}" published live to Landing Page & School Calendar!`
            );

        } catch (err: any) {
            console.error("Save event error:", err);
            alert("Error saving event: " + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    // ---------------------------------------------------------
    // Delete Event
    // ---------------------------------------------------------
    const handleConfirmDelete = async () => {
        if (!eventToDelete) return;

        try {
            setDeleting(true);
            const idToDelete = eventToDelete.id;

            // Delete from backend if numeric ID
            if (typeof idToDelete === "number" || (!isNaN(Number(idToDelete)) && Number(idToDelete) > 0)) {
                try {
                    await axios.delete(`${API_BASE_URL}/Events/${idToDelete}`, {
                        headers: getAuthHeaders(),
                        timeout: 5000
                    });
                } catch (delErr) {
                    console.warn("Backend DELETE returned warning (might have been local seed):", delErr);
                }
            }

            // Update state
            const updatedList = events.filter(ev => String(ev.id) !== String(idToDelete));
            setEvents(updatedList);
            saveSchoolEventsCache(updatedList);
            notifySchoolEventsUpdated(updatedList);

            if (String(selectedEventId) === String(idToDelete)) {
                setSelectedEventId(updatedList[0]?.id || null);
            }

            setShowDeleteModal(false);
            setEventToDelete(null);
            setSuccessMessage(`✓ Event "${eventToDelete.title}" removed from Landing Page.`);

        } catch (err: any) {
            console.error("Delete event error:", err);
            alert("Failed to delete event: " + (err.message || "Unknown error"));
        } finally {
            setDeleting(false);
        }
    };

    // ---------------------------------------------------------
    // Export .ICS Calendar File
    // ---------------------------------------------------------
    const handleDownloadIcs = (eventItem: SchoolEventItem) => {
        const cleanTitle = eventItem.title.replace(/[\\;,\n]/g, " ");
        const cleanDesc = eventItem.description.replace(/[\\;,\n]/g, " ");
        const cleanLoc = eventItem.location.replace(/[\\;,\n]/g, " ");

        const dateParts = eventItem.startDate.split("-");
        const y = dateParts[0] || "2026";
        const m = (dateParts[1] || "11").padStart(2, "0");
        const d = (dateParts[2] || "14").padStart(2, "0");

        const sHour = (eventItem.rawStartTime || "09:00").split(":")[0] || "09";
        const sMin = (eventItem.rawStartTime || "09:00").split(":")[1] || "00";
        const eHour = (eventItem.rawEndTime || "17:00").split(":")[0] || "17";
        const eMin = (eventItem.rawEndTime || "17:00").split(":")[1] || "00";

        const startIso = `${y}${m}${d}T${sHour}${sMin}00`;
        const endIso = `${y}${m}${d}T${eHour}${eMin}00`;

        const icsContent = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Mobile Bible School//School Events CMS//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "BEGIN:VEVENT",
            `UID:mbs-event-${eventItem.id}@mobilebibleschool.org`,
            `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
            `DTSTART:${startIso}`,
            `DTEND:${endIso}`,
            `SUMMARY:${cleanTitle}`,
            `DESCRIPTION:${cleanDesc}`,
            `LOCATION:${cleanLoc}`,
            "STATUS:CONFIRMED",
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\r\n");

        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${cleanTitle.substring(0, 30).toLowerCase().replace(/[^a-z0-9]/g, "_")}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="event-management">

            {/* =================================================
                HEADER
            ================================================= */}
            <div className="event-page-header">
                <div className="event-page-heading">
                    <div className="event-page-icon">
                        <CalendarDays size={28} className="text-blue-600" />
                    </div>
                    <div>
                        <div className="event-eyebrow-container">
                            <span className="event-eyebrow">
                                SCHOOL MANAGEMENT SYSTEM &bull; LANDING PAGE CMS
                            </span>
                            <span className="landing-live-indicator">
                                <span className="live-dot pulse"></span>
                                Synced Live with Landing Page &amp; Main Campus Menu
                            </span>
                        </div>
                        <h1>School Events &amp; Landing Page Editor</h1>
                        <p>
                            Add, edit, and publish official Mobile Bible School seminary intensives, admissions open houses, and graduation ceremonies shown on the public website.
                        </p>
                    </div>
                </div>

                <div className="event-header-actions">
                    <button
                        type="button"
                        className="event-secondary-button preview-website-button"
                        onClick={() => window.open("/#campus", "_blank")}
                        title="Preview how events appear on the public Landing Page"
                    >
                        <Globe size={16} />
                        <span>Preview on Landing Page</span>
                        <ExternalLink size={13} className="ml-1 opacity-70" />
                    </button>

                    <button
                        type="button"
                        className="event-secondary-button refresh-button"
                        onClick={() => void loadEvents(selectedEventId)}
                        disabled={loading}
                        title="Refresh events list from database"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        <span>Sync / Refresh</span>
                    </button>

                    <button
                        type="button"
                        className="event-primary-button create-event-button"
                        onClick={handleOpenCreate}
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        <span>Create School Event</span>
                    </button>
                </div>
            </div>

            {/* =================================================
                SUCCESS & ERROR BANNERS
            ================================================= */}
            {successMessage && (
                <div className="event-success-banner">
                    <CheckCircle2 size={18} />
                    <span>{successMessage}</span>
                    <button
                        type="button"
                        className="banner-close"
                        onClick={() => setSuccessMessage("")}
                    >
                        &times;
                    </button>
                </div>
            )}

            {error && (
                <div className="event-error-banner">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => void loadEvents(selectedEventId)}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* =================================================
                STATISTICS RIBBON
            ================================================= */}
            <div className="event-stat-grid">
                <div className="event-stat-card">
                    <div className="stat-card-top">
                        <span>TOTAL SCHOOL EVENTS</span>
                        <Calendar size={18} className="stat-icon" />
                    </div>
                    <strong>{stats.total}</strong>
                    <small>Official MBS events recorded</small>
                </div>

                <div className="event-stat-card upcoming">
                    <div className="stat-card-top">
                        <span>UPCOMING COHORTS</span>
                        <Sparkles size={18} className="stat-icon" />
                    </div>
                    <strong>{stats.upcoming}</strong>
                    <small>Actively published on Landing Page</small>
                </div>

                <div className="event-stat-card ongoing">
                    <div className="stat-card-top">
                        <span>ACTIVE / ONGOING</span>
                        <Clock size={18} className="stat-icon" />
                    </div>
                    <strong>{stats.ongoing}</strong>
                    <small>Currently in session</small>
                </div>

                <div className="event-stat-card completed">
                    <div className="stat-card-top">
                        <span>CONCLUDED EVENTS</span>
                        <BookOpen size={18} className="stat-icon" />
                    </div>
                    <strong>{stats.completed}</strong>
                    <small>Graduations &amp; prior summits</small>
                </div>
            </div>

            {/* =================================================
                MAIN WORKSPACE (Master / Detail Layout)
            ================================================= */}
            <div className="event-workspace">

                {/* =============================================
                    LEFT PANEL: EVENTS DIRECTORY & FILTERS
                ============================================= */}
                <section className="event-list-panel">
                    <div className="event-list-header">
                        <div>
                            <span className="section-eyebrow">MBS EVENTS DIRECTORY</span>
                            <h2>All School Events ({filteredEvents.length})</h2>
                        </div>
                    </div>

                    {/* Search & Filter Controls */}
                    <div className="event-filters-container">
                        <div className="event-search-box">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by title, speaker, venue..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button
                                    type="button"
                                    className="search-clear-btn"
                                    onClick={() => setSearch("")}
                                >
                                    &times;
                                </button>
                            )}
                        </div>

                        <div className="event-filter-selects">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                title="Filter by event status"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="SCHEDULED">Scheduled</option>
                                <option value="UPCOMING">Upcoming</option>
                                <option value="ONGOING">Ongoing</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>

                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                title="Filter by event category"
                            >
                                <option value="ALL">All Categories</option>
                                {EVENT_TYPE_OPTIONS.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Events List */}
                    <div className="event-list">
                        {loading && (
                            <div className="event-loading-state">
                                <RefreshCw size={24} className="animate-spin text-blue-600 mb-2" />
                                <span>Loading school events from system...</span>
                            </div>
                        )}

                        {!loading && filteredEvents.length === 0 && (
                            <div className="event-empty-list">
                                <CalendarDays size={36} className="text-gray-400 mb-2" />
                                <strong>No events match your criteria</strong>
                                <p>Try clearing filters or create a new school event.</p>
                                <button
                                    type="button"
                                    className="event-primary-button text-xs mt-3"
                                    onClick={handleOpenCreate}
                                >
                                    ＋ Create School Event
                                </button>
                            </div>
                        )}

                        {!loading &&
                            filteredEvents.map((eventItem) => {
                                const isSelected = String(selectedEvent?.id) === String(eventItem.id);
                                return (
                                    <div
                                        key={eventItem.id}
                                        className={`event-list-item-card ${isSelected ? "selected" : ""}`}
                                        onClick={() => setSelectedEventId(eventItem.id)}
                                    >
                                        {/* Date Tile */}
                                        <div className="event-list-date-tile">
                                            <strong>{eventItem.dayMonth.day}</strong>
                                            <span>{eventItem.dayMonth.month}</span>
                                        </div>

                                        {/* Content info */}
                                        <div className="event-list-card-content">
                                            <div className="event-card-tags">
                                                <span className="category-pill">{eventItem.eventType}</span>
                                                <span className={`status-pill ${eventItem.status.toLowerCase()}`}>
                                                    {eventItem.status}
                                                </span>
                                            </div>

                                            <h4 className="event-card-title">{eventItem.title}</h4>

                                            <div className="event-card-meta">
                                                <span>
                                                    <Clock size={13} />
                                                    {eventItem.time}
                                                </span>
                                                <span>
                                                    <MapPin size={13} />
                                                    {eventItem.location}
                                                </span>
                                                {eventItem.speaker && (
                                                    <span>
                                                        <User size={13} />
                                                        {eventItem.speaker}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quick Edit Action */}
                                        <div className="event-card-hover-actions">
                                            <button
                                                type="button"
                                                className="quick-edit-btn"
                                                title="Edit this event"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenEdit(eventItem);
                                                }}
                                            >
                                                <Edit3 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </section>

                {/* =============================================
                    RIGHT PANEL: EVENT DETAILS & CMS EDITOR
                ============================================= */}
                <section className="event-details-panel">
                    {loading && !selectedEvent ? (
                        <div className="event-empty-details">
                            <RefreshCw size={36} className="animate-spin text-blue-600 mb-3" />
                            <h2>Loading Event Details</h2>
                            <p>Connecting to Mobile Bible School database...</p>
                        </div>
                    ) : !selectedEvent ? (
                        <div className="event-empty-details">
                            <CalendarDays size={48} className="text-blue-500 mb-3" />
                            <h2>Select a School Event</h2>
                            <p>Choose an event from the directory on the left to edit its details, update landing page synopsis, or plan its program.</p>
                            <button
                                type="button"
                                className="event-primary-button mt-4"
                                onClick={handleOpenCreate}
                            >
                                <Plus size={16} />
                                <span>Create Your First School Event</span>
                            </button>
                        </div>
                    ) : (
                        <div className="event-details-inner">

                            {/* Details Header & Actions Toolbar */}
                            <div className="event-details-top-banner">
                                <div>
                                    <div className="event-category-row">
                                        <span className="event-category-badge">
                                            <Tag size={13} />
                                            {selectedEvent.eventType}
                                        </span>
                                        <span className={`event-status-badge ${selectedEvent.status.toLowerCase()}`}>
                                            ● {selectedEvent.status}
                                        </span>
                                        <span className="landing-synced-pill">
                                            <Globe size={13} />
                                            Visible on Landing Page
                                        </span>
                                    </div>

                                    <h2 className="event-hero-title">{selectedEvent.title}</h2>
                                </div>

                                {/* Main Action Buttons */}
                                <div className="event-details-action-bar">
                                    <button
                                        type="button"
                                        className="event-edit-button"
                                        onClick={() => handleOpenEdit(selectedEvent)}
                                        title="Open full editor modal for this event"
                                    >
                                        <Edit3 size={16} />
                                        <span>Edit Event</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="event-ics-button"
                                        onClick={() => handleDownloadIcs(selectedEvent)}
                                        title="Download .ICS calendar invite"
                                    >
                                        <Download size={15} />
                                        <span>.ICS Invite</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="event-delete-button"
                                        onClick={() => {
                                            setEventToDelete(selectedEvent);
                                            setShowDeleteModal(true);
                                        }}
                                        title="Delete this event from the system and landing page"
                                    >
                                        <Trash2 size={15} />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>

                            {/* View Switcher Tabs */}
                            <div className="event-detail-tabs">
                                <button
                                    type="button"
                                    className={`detail-tab-btn ${activeDetailTab === "landing" ? "active" : ""}`}
                                    onClick={() => setActiveDetailTab("landing")}
                                >
                                    <Globe size={16} />
                                    <span>Landing Page Content &amp; Synopsis</span>
                                </button>
                                <button
                                    type="button"
                                    className={`detail-tab-btn ${activeDetailTab === "operations" ? "active" : ""}`}
                                    onClick={() => setActiveDetailTab("operations")}
                                >
                                    <Users size={16} />
                                    <span>Event Program &amp; Assignments</span>
                                </button>
                            </div>

                            {/* TAB 1: LANDING PAGE CONTENT & DETAILS */}
                            {activeDetailTab === "landing" && (
                                <div className="landing-content-container">

                                    {/* Information Grid */}
                                    <div className="event-information-grid">
                                        <div className="info-card">
                                            <div className="info-label">
                                                <Calendar size={14} />
                                                <span>DATE</span>
                                            </div>
                                            <strong>{selectedEvent.formattedDate || selectedEvent.startDate}</strong>
                                            <small>{selectedEvent.startDate}</small>
                                        </div>

                                        <div className="info-card">
                                            <div className="info-label">
                                                <Clock size={14} />
                                                <span>TIME &amp; SCHEDULE</span>
                                            </div>
                                            <strong>{selectedEvent.time || "TBA"}</strong>
                                            <small>Standard Manila Seminary Time</small>
                                        </div>

                                        <div className="info-card">
                                            <div className="info-label">
                                                <MapPin size={14} />
                                                <span>VENUE / LOCATION</span>
                                            </div>
                                            <strong>{selectedEvent.location || "Main Seminary Campus"}</strong>
                                            <small>Hybrid On-Campus &amp; Online Hub</small>
                                        </div>

                                        <div className="info-card">
                                            <div className="info-label">
                                                <User size={14} />
                                                <span>SPEAKER / DEAN</span>
                                            </div>
                                            <strong>{selectedEvent.speaker || "Faculty Deans & Theologians"}</strong>
                                            <small>Academic Directorate</small>
                                        </div>

                                        <div className="info-card full-span">
                                            <div className="info-label">
                                                <Building2 size={14} />
                                                <span>DEPARTMENT / MINISTRY</span>
                                            </div>
                                            <strong>{selectedEvent.ministry || "Biblical Studies & Homiletics"}</strong>
                                        </div>
                                    </div>

                                    {/* Landing Page Synopsis Card */}
                                    <div className="landing-synopsis-section">
                                        <div className="section-head">
                                            <div className="flex items-center gap-2">
                                                <Sparkles size={17} className="text-amber-500" />
                                                <h3>Public Landing Page Event Synopsis</h3>
                                            </div>
                                            <button
                                                type="button"
                                                className="synopsis-edit-link"
                                                onClick={() => handleOpenEdit(selectedEvent)}
                                            >
                                                Edit Synopsis &rarr;
                                            </button>
                                        </div>
                                        <div className="synopsis-content-box">
                                            <p>{selectedEvent.description || "No public event description entered yet."}</p>
                                        </div>
                                        <div className="synopsis-footer-hint">
                                            <span>
                                                👁 This exact text is displayed in the Apple-style Main Campus menu and in the modal when visitors click on this event.
                                            </span>
                                        </div>
                                    </div>

                                    {/* Internal Notes */}
                                    {selectedEvent.notes && (
                                        <div className="internal-notes-section">
                                            <div className="section-head">
                                                <h3>Administrative &amp; Faculty Notes</h3>
                                            </div>
                                            <div className="notes-box">
                                                <p>{selectedEvent.notes}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Preview Callout */}
                                    <div className="landing-page-preview-callout">
                                        <div className="callout-icon">
                                            <Globe size={24} className="text-blue-600" />
                                        </div>
                                        <div className="callout-body">
                                            <strong>Check Live Display on Public Website</strong>
                                            <p>Verify how this event appears to prospective students, pastors, and church leaders on the Mobile Bible School home page.</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="event-primary-button text-xs py-2 px-3"
                                            onClick={() => window.open("/#campus", "_blank")}
                                        >
                                            <span>Open Landing Page</span>
                                            <ExternalLink size={14} />
                                        </button>
                                    </div>

                                </div>
                            )}

                            {/* TAB 2: INTERNAL OPERATIONS & PROGRAM ASSIGNMENTS */}
                            {activeDetailTab === "operations" && (
                                <div className="operations-content-container">
                                    <div className="operations-banner">
                                        <Users size={20} className="text-blue-600" />
                                        <div>
                                            <strong>Volunteer &amp; Department Assignments for: {selectedEvent.title}</strong>
                                            <p>Manage speakers, audiovisual techs, ushering, logistical needs, and event checklist tasks.</p>
                                        </div>
                                    </div>

                                    {/* Embedded existing EventPlanningPanel */}
                                    {typeof selectedEvent.id === "number" && (
                                        <EventPlanningPanel eventId={selectedEvent.id} />
                                    )}
                                    {typeof selectedEvent.id !== "number" && (
                                        <div className="p-6 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
                                            <p>Save this event to the database to manage operational tasks and volunteer assignments.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    )}
                </section>

            </div>

            {/* =================================================
                CREATE & EDIT SCHOOL EVENT MODAL
            ================================================= */}
            {showModal && (
                <div
                    className="event-modal-overlay"
                    onClick={() => !saving && setShowModal(false)}
                >
                    <div
                        className="event-modal cms-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="event-modal-header">
                            <div>
                                <span className="modal-eyebrow">
                                    {modalMode === "edit" ? "EDITING SCHOOL EVENT" : "NEW SCHOOL EVENT"}
                                </span>
                                <h2>
                                    {modalMode === "edit" ? "Edit School Event & Landing Page Content" : "Create & Publish School Event"}
                                </h2>
                                <small>
                                    Changes will immediately update the live Landing Page and Public Events directory.
                                </small>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                disabled={saving}
                                onClick={() => setShowModal(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEvent} className="event-editor-form">
                            <div className="event-form-grid">

                                {/* Title */}
                                <div className="event-form-field full">
                                    <label>
                                        EVENT TITLE <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formState.title}
                                        onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                                        placeholder="e.g. Modular Pastoral Intensive: Expository Preaching & Hermeneutics"
                                        required
                                        maxLength={200}
                                    />
                                    <span className="field-hint">The main headline displayed on the landing page dropdown and event cards.</span>
                                </div>

                                {/* Event Category */}
                                <div className="event-form-field">
                                    <label>EVENT CATEGORY / TYPE</label>
                                    <select
                                        value={formState.eventType}
                                        onChange={(e) => setFormState({ ...formState, eventType: e.target.value })}
                                    >
                                        {EVENT_TYPE_OPTIONS.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status */}
                                <div className="event-form-field">
                                    <label>STATUS ON WEBSITE</label>
                                    <select
                                        value={formState.status}
                                        onChange={(e) => setFormState({ ...formState, status: e.target.value as EventStatus })}
                                    >
                                        {STATUS_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date */}
                                <div className="event-form-field">
                                    <label>
                                        EVENT DATE <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formState.startDate}
                                        onChange={(e) => setFormState({ ...formState, startDate: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Time Range */}
                                <div className="event-form-field time-range-group">
                                    <label>TIME SCHEDULE</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="time"
                                            value={formState.startTime}
                                            onChange={(e) => setFormState({ ...formState, startTime: e.target.value })}
                                            title="Start Time"
                                        />
                                        <span className="text-gray-400 font-medium">to</span>
                                        <input
                                            type="time"
                                            value={formState.endTime}
                                            onChange={(e) => setFormState({ ...formState, endTime: e.target.value })}
                                            title="End Time"
                                        />
                                    </div>
                                </div>

                                {/* Venue / Location */}
                                <div className="event-form-field">
                                    <label>
                                        CAMPUS VENUE / LOCATION <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formState.location}
                                        onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                                        placeholder="e.g. Main Seminary Campus (Hall A) & Zoom"
                                        required
                                    />
                                </div>

                                {/* Speaker / Faculty */}
                                <div className="event-form-field">
                                    <label>SPEAKER / LECTURER / DEAN</label>
                                    <input
                                        type="text"
                                        value={formState.speaker}
                                        onChange={(e) => setFormState({ ...formState, speaker: e.target.value })}
                                        placeholder="e.g. Dr. Jonathan M. Cruz, M.Th."
                                    />
                                </div>

                                {/* Ministry / Department */}
                                <div className="event-form-field full">
                                    <label>ACADEMIC DEPARTMENT / MINISTRY</label>
                                    <input
                                        type="text"
                                        value={formState.ministry}
                                        onChange={(e) => setFormState({ ...formState, ministry: e.target.value })}
                                        placeholder="e.g. Biblical Studies & Homiletics, Admissions Directorate"
                                    />
                                </div>

                                {/* Landing Page Description */}
                                <div className="event-form-field full">
                                    <label>
                                        LANDING PAGE SYNOPSIS / EVENT DESCRIPTION <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={formState.description}
                                        onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                                        placeholder="Detailed event synopsis, key objectives, scripture focus, or who should attend. Displayed when visitors view this event on the landing page..."
                                        required
                                    />
                                    <span className="field-hint">Visitors on the website read this synopsis before registering.</span>
                                </div>

                                {/* Administrative Notes */}
                                <div className="event-form-field full">
                                    <label>INTERNAL FACULTY / ADMINISTRATIVE NOTES</label>
                                    <textarea
                                        rows={2}
                                        value={formState.notes}
                                        onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                                        placeholder="Internal notes, logistical requirements, room bookings, honorariums (not shown publicly)..."
                                    />
                                </div>

                            </div>

                            {/* Modal Actions */}
                            <div className="event-modal-actions">
                                <button
                                    type="button"
                                    className="event-cancel-button"
                                    disabled={saving}
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="event-primary-button submit-publish-btn"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            <span>Saving &amp; Publishing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={16} />
                                            <span>{modalMode === "edit" ? "Save & Update Landing Page" : "Publish to Landing Page"}</span>
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
            {showDeleteModal && eventToDelete && (
                <div
                    className="event-modal-overlay"
                    onClick={() => !deleting && setShowDeleteModal(false)}
                >
                    <div
                        className="event-modal delete-confirm-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="delete-modal-icon">
                            <Trash2 size={32} className="text-red-600" />
                        </div>
                        <h2>Delete School Event?</h2>
                        <p>
                            Are you sure you want to delete <strong>"{eventToDelete.title}"</strong>?
                        </p>
                        <div className="delete-modal-warning">
                            <AlertCircle size={16} />
                            <span>This event will be immediately removed from the Public Landing Page, Apple-style mega menu, and School Events Directory.</span>
                        </div>

                        <div className="delete-modal-actions">
                            <button
                                type="button"
                                className="event-cancel-button"
                                disabled={deleting}
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Keep Event
                            </button>

                            <button
                                type="button"
                                className="event-confirm-delete-btn"
                                disabled={deleting}
                                onClick={handleConfirmDelete}
                            >
                                {deleting ? "Deleting..." : "Yes, Delete Event"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default EventManagementPage;
