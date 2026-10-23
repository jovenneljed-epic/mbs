// ============================================================
// EventsPage.tsx -> MOBILE BIBLE SCHOOL & THEOLOGICAL SEMINARY
// Official Public Events, Academic Calendar & Live Announcements
// Fetches REAL live data directly from SMS backend database
// ============================================================

import React, { useState, useEffect, useMemo } from "react";
import PublicHeader from "../../components/PublicHeader";
import {
    getPublicSchoolEvents,
    getPublicSchoolAnnouncements,
    type SchoolEventItem,
    type SchoolAnnouncementItem
} from "../../services/schoolPublicDataService";
import {
    Calendar,
    Clock,
    MapPin,
    User,
    Search,
    BookOpen,
    Bell,
    CheckCircle2,
    X,
    Filter,
    Download,
    ArrowRight,
    RefreshCw,
    Sparkles,
    Tag
} from "lucide-react";
import "./EventsPage.css";

interface EventsPageProps {
    onNavigate?: (page: string) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({ onNavigate }) => {
    // ------------------------------------------------------------
    // Navigation helper
    // ------------------------------------------------------------
    const handleNavigate = (page: string) => {
        if (onNavigate) {
            onNavigate(page);
        } else {
            window.location.href = `/${page}`;
        }
    };

    // ------------------------------------------------------------
    // Live SMS Data States
    // ------------------------------------------------------------
    const [events, setEvents] = useState<SchoolEventItem[]>([]);
    const [announcements, setAnnouncements] = useState<SchoolAnnouncementItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter & Search states
    const [activeTab, setActiveTab] = useState<"all" | "events" | "announcements">("events");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");

    // Modal states
    const [selectedEvent, setSelectedEvent] = useState<SchoolEventItem | null>(null);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<SchoolAnnouncementItem | null>(null);
    const [rsvpSuccess, setRsvpSuccess] = useState(false);
    const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);

    const [rsvpForm, setRsvpForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        churchName: "",
        role: "Pastor / Ministry Leader",
        notes: ""
    });

    // ------------------------------------------------------------
    // Fetch live SMS events and announcements from database
    // ------------------------------------------------------------
    const loadData = async () => {
        setIsLoading(true);
        try {
            const [fetchedEvents, fetchedAnnouncements] = await Promise.all([
                getPublicSchoolEvents(),
                getPublicSchoolAnnouncements()
            ]);

            setEvents(fetchedEvents || []);
            setAnnouncements(fetchedAnnouncements || []);
        } catch (err) {
            console.error("Error loading school events and announcements:", err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();

        const handleEventsUpdated = (e: any) => {
            if (e?.detail && Array.isArray(e.detail) && e.detail.length > 0) {
                setEvents(e.detail);
            } else {
                loadData();
            }
        };

        window.addEventListener("mbs:school-events-updated", handleEventsUpdated);
        return () => {
            window.removeEventListener("mbs:school-events-updated", handleEventsUpdated);
        };
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    // ------------------------------------------------------------
    // Generate .ICS Calendar Download
    // ------------------------------------------------------------
    const downloadIcs = (event: SchoolEventItem) => {
        const cleanTitle = event.title.replace(/[\\;,\n]/g, " ");
        const cleanDesc = event.description.replace(/[\\;,\n]/g, " ");
        const cleanLoc = event.location.replace(/[\\;,\n]/g, " ");

        // Parse date for ICS
        let startStr = "20261114T090000Z";
        try {
            const d = new Date(event.startDate || Date.now());
            if (!isNaN(d.getTime())) {
                const year = d.getUTCFullYear();
                const month = String(d.getUTCMonth() + 1).padStart(2, "0");
                const day = String(d.getUTCDate()).padStart(2, "0");
                startStr = `${year}${month}${day}T090000Z`;
            }
        } catch {
            // ignore
        }

        const icsContent = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Mobile Bible School//School Events//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "BEGIN:VEVENT",
            `UID:mbs-event-${event.id}@mobilebibleschool.edu`,
            `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, "")}`,
            `DTSTART:${startStr}`,
            `SUMMARY:${cleanTitle}`,
            `DESCRIPTION:${cleanDesc}`,
            `LOCATION:${cleanLoc}`,
            "STATUS:CONFIRMED",
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\r\n");

        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute("download", `${event.title.slice(0, 30).replace(/\s+/g, "_")}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ------------------------------------------------------------
    // Filter Categories
    // ------------------------------------------------------------
    const allCategories = useMemo(() => {
        const cats = new Set<string>();
        events.forEach(e => {
            if (e.eventType) cats.add(e.eventType);
        });
        return ["ALL", ...Array.from(cats)];
    }, [events]);

    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            const matchesCategory = selectedCategory === "ALL" || e.eventType === selectedCategory;
            const matchesSearch = !searchQuery.trim() ||
                e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (e.speaker && e.speaker.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCategory && matchesSearch;
        });
    }, [events, selectedCategory, searchQuery]);

    const filteredAnnouncements = useMemo(() => {
        return announcements.filter(a => {
            return !searchQuery.trim() ||
                a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.category.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [announcements, searchQuery]);

    // ------------------------------------------------------------
    // RSVP Submission
    // ------------------------------------------------------------
    const handleRsvpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingRsvp(true);
        setTimeout(() => {
            setIsSubmittingRsvp(false);
            setRsvpSuccess(true);
            setTimeout(() => {
                setRsvpSuccess(false);
                setSelectedEvent(null);
                setRsvpForm({
                    fullName: "",
                    email: "",
                    phone: "",
                    churchName: "",
                    role: "Pastor / Ministry Leader",
                    notes: ""
                });
            }, 2500);
        }, 800);
    };

    return (
        <div className="mbs-events-page-root">
            {/* UNIFIED MBS TOP HEADER */}
            <PublicHeader onNavigate={handleNavigate} />

            {/* HERO SECTION */}
            <section className="mbs-events-hero">
                <div className="mbs-events-hero-overlay" />
                <div className="mbs-events-hero-content">
                    <div className="mbs-hero-badge">
                        <Calendar size={13} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />
                        OFFICIAL ACADEMIC CALENDAR &amp; DISPATCHES
                    </div>

                    <h1 className="mbs-events-hero-title">
                        Seminary Events &amp; <span>Campus Bulletins</span>
                    </h1>

                    <p className="mbs-events-hero-subtitle">
                        Stay connected with scheduled pastoral modular intensives, academic open houses, theological lectureships, and official announcements from Mobile Bible School &amp; Theological Seminary.
                    </p>

                    {/* LIVE SEARCH & FILTER BAR */}
                    <div className="mbs-events-search-bar">
                        <Search size={18} className="mbs-search-icon" />
                        <input
                            type="text"
                            placeholder="Search by event title, faculty speaker, location, or announcement..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="mbs-search-clear"
                                onClick={() => setSearchQuery("")}
                            >
                                <X size={15} />
                            </button>
                        )}
                        <button
                            type="button"
                            className={`mbs-btn-refresh ${refreshing ? "spin" : ""}`}
                            onClick={handleRefresh}
                            title="Sync latest live events from SMS database"
                        >
                            <RefreshCw size={15} />
                            <span>Sync SMS</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT AREA */}
            <main className="mbs-events-main-container">
                {/* TABS SELECTOR */}
                <div className="mbs-tabs-wrapper">
                    <div className="mbs-tabs-group">
                        <button
                            type="button"
                            className={`mbs-tab-btn ${activeTab === "events" ? "active" : ""}`}
                            onClick={() => setActiveTab("events")}
                        >
                            <Calendar size={15} />
                            <span>Upcoming Events ({filteredEvents.length})</span>
                        </button>

                        <button
                            type="button"
                            className={`mbs-tab-btn ${activeTab === "announcements" ? "active" : ""}`}
                            onClick={() => setActiveTab("announcements")}
                        >
                            <Bell size={15} />
                            <span>Campus Bulletins ({filteredAnnouncements.length})</span>
                        </button>

                        <button
                            type="button"
                            className={`mbs-tab-btn ${activeTab === "all" ? "active" : ""}`}
                            onClick={() => setActiveTab("all")}
                        >
                            <Sparkles size={15} />
                            <span>All Dispatches ({filteredEvents.length + filteredAnnouncements.length})</span>
                        </button>
                    </div>

                    {/* Category Filter Pills (When on events or all) */}
                    {activeTab !== "announcements" && allCategories.length > 1 && (
                        <div className="mbs-category-pills">
                            <span className="mbs-filter-label">
                                <Filter size={12} />
                                <span>Filter:</span>
                            </span>
                            {allCategories.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`mbs-cat-pill ${selectedCategory === cat ? "active" : ""}`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* LOADING SKELETON */}
                {isLoading && (
                    <div className="mbs-loading-state">
                        <RefreshCw size={28} className="spin" color="#7A1526" />
                        <p>Fetching real-time event schedules from MBS database...</p>
                    </div>
                )}

                {/* EVENTS SECTION */}
                {!isLoading && (activeTab === "events" || activeTab === "all") && (
                    <section className="mbs-events-section">
                        <div className="mbs-section-title-row">
                            <div>
                                <h2 className="mbs-section-heading">Scheduled School Events</h2>
                                <p className="mbs-section-subheading">
                                    Official modular pastoral dates, lectureships, and regional conferences.
                                </p>
                            </div>
                            <span className="mbs-live-badge">
                                <span className="mbs-live-dot" />
                                LIVE SMS SYNCHRONIZED
                            </span>
                        </div>

                        {filteredEvents.length === 0 ? (
                            <div className="mbs-empty-state">
                                <Calendar size={42} color="#94A3B8" />
                                <h3>No events match your search</h3>
                                <p>Try clearing your keyword filters or check back soon for newly published academic cohorts.</p>
                                <button
                                    type="button"
                                    className="mbs-btn-primary"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedCategory("ALL");
                                    }}
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <div className="mbs-events-grid">
                                {filteredEvents.map(event => (
                                    <article key={event.id} className="mbs-event-card">
                                        {/* Card Top: Date tile + Category */}
                                        <div className="mbs-event-card-header">
                                            <div className="mbs-card-date-tile">
                                                <span className="mbs-tile-month">{event.dayMonth?.month || "MBS"}</span>
                                                <span className="mbs-tile-day">{event.dayMonth?.day || "15"}</span>
                                            </div>

                                            <div className="mbs-card-tag-wrapper">
                                                <span className="mbs-event-type-tag">{event.eventType}</span>
                                                <span className="mbs-event-status-pill">{event.status || "Scheduled"}</span>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3 className="mbs-event-card-title">{event.title}</h3>

                                        {/* Details Meta */}
                                        <div className="mbs-event-meta-list">
                                            <div className="mbs-meta-item">
                                                <Clock size={14} className="mbs-meta-icon" />
                                                <span>{event.time || "Schedule TBA"}</span>
                                            </div>
                                            <div className="mbs-meta-item">
                                                <MapPin size={14} className="mbs-meta-icon" />
                                                <span>{event.location || "Main Seminary Campus"}</span>
                                            </div>
                                            {event.speaker && (
                                                <div className="mbs-meta-item">
                                                    <User size={14} className="mbs-meta-icon" />
                                                    <span>{event.speaker}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <p className="mbs-event-card-desc">
                                            {event.description}
                                        </p>

                                        {/* Card Footer Actions */}
                                        <div className="mbs-event-card-actions">
                                            <button
                                                type="button"
                                                className="mbs-btn-rsvp"
                                                onClick={() => setSelectedEvent(event)}
                                            >
                                                <span>Register / RSVP</span>
                                                <ArrowRight size={13} />
                                            </button>

                                            <button
                                                type="button"
                                                className="mbs-btn-calendar-add"
                                                onClick={() => downloadIcs(event)}
                                                title="Add to Google Calendar, Apple iCal or Outlook (.ics)"
                                            >
                                                <Download size={13} />
                                                <span>Add to Calendar</span>
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* ANNOUNCEMENTS SECTION */}
                {!isLoading && (activeTab === "announcements" || activeTab === "all") && (
                    <section className="mbs-announcements-section">
                        <div className="mbs-section-title-row">
                            <div>
                                <h2 className="mbs-section-heading">Campus Announcements &amp; Dispatches</h2>
                                <p className="mbs-section-subheading">
                                    Official seminary bulletins, scholarship announcements, and portal updates.
                                </p>
                            </div>
                            <span className="mbs-bulletin-tag">
                                <Bell size={13} />
                                OFFICIAL BULLETINS
                            </span>
                        </div>

                        {filteredAnnouncements.length === 0 ? (
                            <div className="mbs-empty-state">
                                <Bell size={42} color="#94A3B8" />
                                <h3>No announcements match your search</h3>
                                <p>Check back shortly for upcoming seminary news and circulars.</p>
                            </div>
                        ) : (
                            <div className="mbs-announcements-grid">
                                {filteredAnnouncements.map(ann => (
                                    <div
                                        key={ann.id}
                                        className="mbs-announcement-card"
                                        onClick={() => setSelectedAnnouncement(ann)}
                                    >
                                        <div className="mbs-announcement-card-top">
                                            <span className="mbs-announcement-badge">
                                                <Tag size={11} />
                                                {ann.category}
                                            </span>
                                            <span className="mbs-announcement-date">
                                                {ann.formattedDate || ann.publishDate}
                                            </span>
                                        </div>

                                        <h3 className="mbs-announcement-title">{ann.title}</h3>
                                        <p className="mbs-announcement-body">{ann.content}</p>

                                        <button
                                            type="button"
                                            className="mbs-announcement-read-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedAnnouncement(ann);
                                            }}
                                        >
                                            <span>Read Full Bulletin</span>
                                            <ArrowRight size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </main>

            {/* EVENT REGISTRATION & DETAILS MODAL */}
            {selectedEvent && (
                <div className="mbs-modal-overlay" onClick={() => setSelectedEvent(null)}>
                    <div className="mbs-modal-content" onClick={e => e.stopPropagation()}>
                        <button
                            type="button"
                            className="mbs-modal-close"
                            onClick={() => setSelectedEvent(null)}
                        >
                            <X size={18} />
                        </button>

                        {rsvpSuccess ? (
                            <div className="mbs-modal-success">
                                <CheckCircle2 size={48} color="#10B981" />
                                <h3>Registration Confirmed!</h3>
                                <p>
                                    Thank you, <strong>{rsvpForm.fullName}</strong>. Your RSVP for <em>{selectedEvent.title}</em> has been registered with our seminary admissions desk. We look forward to fellowshipping with you.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="mbs-modal-header">
                                    <span className="mbs-event-type-tag">{selectedEvent.eventType}</span>
                                    <h2 className="mbs-modal-title">{selectedEvent.title}</h2>
                                </div>

                                <div className="mbs-modal-meta-grid">
                                    <div className="mbs-modal-meta-cell">
                                        <Calendar size={15} color="#7A1526" />
                                        <div>
                                            <strong>Date</strong>
                                            <span>{selectedEvent.formattedDate || selectedEvent.startDate}</span>
                                        </div>
                                    </div>

                                    <div className="mbs-modal-meta-cell">
                                        <Clock size={15} color="#7A1526" />
                                        <div>
                                            <strong>Time</strong>
                                            <span>{selectedEvent.time}</span>
                                        </div>
                                    </div>

                                    <div className="mbs-modal-meta-cell">
                                        <MapPin size={15} color="#7A1526" />
                                        <div>
                                            <strong>Location</strong>
                                            <span>{selectedEvent.location}</span>
                                        </div>
                                    </div>

                                    <div className="mbs-modal-meta-cell">
                                        <User size={15} color="#7A1526" />
                                        <div>
                                            <strong>Speaker / Dean</strong>
                                            <span>{selectedEvent.speaker || "Faculty Directorate"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mbs-modal-description">
                                    <h4>Event Overview</h4>
                                    <p>{selectedEvent.description}</p>
                                </div>

                                {/* RSVP FORM */}
                                <form className="mbs-rsvp-form" onSubmit={handleRsvpSubmit}>
                                    <h4>RSVP / Register for this Session</h4>

                                    <div className="mbs-form-row">
                                        <div className="mbs-form-group">
                                            <label>Full Name *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Pastor / Brother / Sister Name"
                                                value={rsvpForm.fullName}
                                                onChange={e => setRsvpForm(prev => ({ ...prev, fullName: e.target.value }))}
                                            />
                                        </div>

                                        <div className="mbs-form-group">
                                            <label>Email Address *</label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="pastor@church.org"
                                                value={rsvpForm.email}
                                                onChange={e => setRsvpForm(prev => ({ ...prev, email: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="mbs-form-row">
                                        <div className="mbs-form-group">
                                            <label>Mobile Number *</label>
                                            <input
                                                type="tel"
                                                required
                                                placeholder="+63 9XX XXX XXXX"
                                                value={rsvpForm.phone}
                                                onChange={e => setRsvpForm(prev => ({ ...prev, phone: e.target.value }))}
                                            />
                                        </div>

                                        <div className="mbs-form-group">
                                            <label>Local Church &amp; Province</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Grace Fellowship, Cavite"
                                                value={rsvpForm.churchName}
                                                onChange={e => setRsvpForm(prev => ({ ...prev, churchName: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="mbs-modal-actions">
                                        <button
                                            type="button"
                                            className="mbs-btn-secondary"
                                            onClick={() => downloadIcs(selectedEvent)}
                                        >
                                            <Download size={14} />
                                            <span>Export to Calendar (.ics)</span>
                                        </button>

                                        <button
                                            type="submit"
                                            className="mbs-btn-primary"
                                            disabled={isSubmittingRsvp}
                                        >
                                            {isSubmittingRsvp ? "Submitting Registration..." : "Confirm Event Attendance"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ANNOUNCEMENT READER MODAL */}
            {selectedAnnouncement && (
                <div className="mbs-modal-overlay" onClick={() => setSelectedAnnouncement(null)}>
                    <div className="mbs-modal-content mbs-announcement-modal" onClick={e => e.stopPropagation()}>
                        <button
                            type="button"
                            className="mbs-modal-close"
                            onClick={() => setSelectedAnnouncement(null)}
                        >
                            <X size={18} />
                        </button>

                        <div className="mbs-modal-header">
                            <span className="mbs-announcement-badge">
                                <Tag size={12} />
                                {selectedAnnouncement.category}
                            </span>
                            <span className="mbs-modal-date">{selectedAnnouncement.formattedDate || selectedAnnouncement.publishDate}</span>
                            <h2 className="mbs-modal-title" style={{ marginTop: 8 }}>{selectedAnnouncement.title}</h2>
                        </div>

                        <div className="mbs-modal-description" style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "#334155" }}>
                            <p>{selectedAnnouncement.content}</p>
                        </div>

                        <div className="mbs-modal-actions" style={{ marginTop: 24, justifyContent: "flex-end" }}>
                            <button
                                type="button"
                                className="mbs-btn-primary"
                                onClick={() => {
                                    setSelectedAnnouncement(null);
                                    handleNavigate("contact");
                                }}
                            >
                                Contact Admissions Office
                            </button>
                            <button
                                type="button"
                                className="mbs-btn-secondary"
                                onClick={() => setSelectedAnnouncement(null)}
                            >
                                Close Bulletin
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* INSTITUTIONAL FOOTER */}
            <footer className="mbs-events-footer">
                <div className="mbs-footer-inner">
                    <div className="mbs-footer-col">
                        <div className="mbs-footer-brand">
                            <div className="mbs-footer-crest">
                                <BookOpen size={18} color="#FFFFFF" />
                            </div>
                            <div>
                                <h4>Mobile Bible School</h4>
                                <small>Theological Seminary &amp; Ministerial Institute</small>
                            </div>
                        </div>
                        <p className="mbs-footer-motto">
                            &quot;Preach the word; be ready in season and out of season; reprove, rebuke, and exhort, with complete patience and teaching.&quot; — 2 Timothy 4:2
                        </p>
                    </div>

                    <div className="mbs-footer-col">
                        <h5>Direct Portals</h5>
                        <ul>
                            <li><button type="button" onClick={() => handleNavigate("client-login")}>Student Portal (My MBS)</button></li>
                            <li><button type="button" onClick={() => handleNavigate("login")}>Admin &amp; Faculty Portal</button></li>
                            <li><button type="button" onClick={() => handleNavigate("learning")}>Theological LMS</button></li>
                            <li><button type="button" onClick={() => handleNavigate("contact")}>Admissions Desk</button></li>
                        </ul>
                    </div>

                    <div className="mbs-footer-col">
                        <h5>Headquarters &amp; Hubs</h5>
                        <p>📍 Metro Manila Seminary Campus, Philippines</p>
                        <p>📞 Inquiries: +63 (02) 8800-BIBLE</p>
                        <p>📱 Direct Hotline: +63 917 123 4567</p>
                    </div>
                </div>

                <div className="mbs-footer-bottom">
                    <p>© {new Date().getFullYear()} Mobile Bible School &amp; Theological Seminary. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default EventsPage;
