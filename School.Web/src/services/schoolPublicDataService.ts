// ============================================================
// schoolPublicDataService.ts
// Centralized live data fetcher connecting SMS Events & Announcements
// to the public website & Apple-style Main Campus mega menu
// ============================================================

import { API_BASE_URL } from "../config";

export interface SchoolEventItem {
    id: number | string;
    title: string;
    eventType: string;
    startDate: string;
    formattedDate: string;
    dayMonth: { day: string; month: string };
    time: string;
    rawStartTime?: string;
    rawEndTime?: string;
    location: string;
    speaker?: string;
    ministry?: string;
    status: string;
    description: string;
    notes?: string;
}

export interface SchoolAnnouncementItem {
    id: number | string;
    title: string;
    category: string;
    publishDate: string;
    formattedDate: string;
    content: string;
    imageUrl?: string | null;
}

const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export function parseDayMonth(dateStr: string): { day: string; month: string } {
    try {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            return {
                day: String(d.getDate()).padStart(2, "0"),
                month: MONTH_NAMES[d.getMonth()] || "MBS",
            };
        }
    } catch {
        // ignore
    }
    return { day: "15", month: "MBS" };
}

export function formatDateLong(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            return d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            });
        }
    } catch {
        // ignore
    }
    return dateStr;
}

// ------------------------------------------------------------
// Curated Default Events (Official Mobile Bible School Seminary)
// ------------------------------------------------------------
export const DEFAULT_SCHOOL_EVENTS: SchoolEventItem[] = [
    {
        id: 101,
        title: "Modular Pastoral Intensive: Expository Preaching & Hermeneutics",
        eventType: "Pastoral Intensive",
        startDate: "2026-11-14",
        formattedDate: "November 14-16, 2026",
        dayMonth: { day: "14", month: "NOV" },
        time: "9:00 AM - 5:00 PM",
        location: "Main Seminary Campus & Virtual Hub",
        speaker: "Dr. Jonathan Cruz & Senior Faculty",
        ministry: "Expository Preaching Department",
        status: "Upcoming",
        description: "In-depth exegetical study of original biblical manuscripts, homiletical structural design, and verse-by-verse expository pulpit delivery for pastors and teachers."
    },
    {
        id: 102,
        title: "Spring 2027 Admissions Open House & Campus Tour",
        eventType: "Campus Open House",
        startDate: "2026-12-05",
        formattedDate: "December 5, 2026",
        dayMonth: { day: "05", month: "DEC" },
        time: "10:00 AM - 2:00 PM",
        location: "Seminary Main Campus, Metro Manila",
        speaker: "Admissions Directorate & Faculty Deans",
        ministry: "Academic Admissions",
        status: "Upcoming",
        description: "Tour our theological library, meet distinguished pastoral faculty, evaluate degree credits, and receive on-the-spot modular enrollment assistance."
    },
    {
        id: 103,
        title: "National Church Planting & Leadership Colloquium",
        eventType: "Leadership Summit",
        startDate: "2027-01-22",
        formattedDate: "January 22-24, 2027",
        dayMonth: { day: "22", month: "JAN" },
        time: "8:30 AM - 4:30 PM",
        location: "Metro Manila Central Hall & Regional Centers",
        speaker: "Pastoral Council & Guest Theologians",
        ministry: "Missions & Church Revitalization",
        status: "Upcoming",
        description: "Equipping bivocational church planters, church revitalizers, and lay elders with sound ecclesiology and strategic church multiplication."
    },
    {
        id: 104,
        title: "Seminary Commencement & Commissioning Service",
        eventType: "Commencement",
        startDate: "2027-03-27",
        formattedDate: "March 27, 2027",
        dayMonth: { day: "27", month: "MAR" },
        time: "2:00 PM - 6:00 PM",
        location: "Seminary Grand Auditorium",
        speaker: "Chancellor & Board of Trustees",
        ministry: "Academic Council",
        status: "Scheduled",
        description: "Conferral of degrees for Bachelor of Theology (B.Th.), Master of Ministry (M.Min.), and Diploma in Pastoral Studies (DPS)."
    }
];

// ------------------------------------------------------------
// Curated Default Announcements (Official Mobile Bible School Seminary)
// ------------------------------------------------------------
export const DEFAULT_SCHOOL_ANNOUNCEMENTS: SchoolAnnouncementItem[] = [
    {
        id: 201,
        title: "Now Accepting Applications for Academic Year 2026-2027",
        category: "ADMISSIONS DESK",
        publishDate: "2026-10-15",
        formattedDate: "Oct 15, 2026",
        content: "Registration is officially open for modular on-campus intensives and global online seminary cohorts. Early applicant scholarships are available for pastors and church planters."
    },
    {
        id: 202,
        title: "MBS Theological LMS 3.0 Platform Upgrade & Cloud Library",
        category: "ACADEMIC PORTAL",
        publishDate: "2026-10-10",
        formattedDate: "Oct 10, 2026",
        content: "Students can now access over 15,000 digital commentaries, exegetical lexicons, and class video replays directly in the student portal."
    },
    {
        id: 203,
        title: "Tuition Subsidy & Pastoral Grant Fund Established",
        category: "SCHOLARSHIPS",
        publishDate: "2026-09-28",
        formattedDate: "Sep 28, 2026",
        content: "Through generous seminary partners, an 80% tuition subsidy grant is now active for full-time bivocational ministers and rural church workers."
    }
];

export const EVENTS_CACHE_KEY = "mbs_school_events_cache";

export function notifySchoolEventsUpdated(events?: SchoolEventItem[]): void {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("mbs:school-events-updated", { detail: events }));
    }
}

export function saveSchoolEventsCache(events: SchoolEventItem[]): void {
    try {
        if (typeof window !== "undefined") {
            localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(events));
            notifySchoolEventsUpdated(events);
        }
    } catch (e) {
        console.warn("Failed to cache school events in localStorage:", e);
    }
}

export function getSchoolEventsCache(): SchoolEventItem[] | null {
    try {
        if (typeof window !== "undefined") {
            const raw = localStorage.getItem(EVENTS_CACHE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        }
    } catch (e) {
        console.warn("Failed to read school events cache:", e);
    }
    return null;
}

// ------------------------------------------------------------
export const ANNOUNCEMENTS_CACHE_KEY = "mbs_school_announcements_cache";

export function notifySchoolAnnouncementsUpdated(announcements?: SchoolAnnouncementItem[]): void {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("mbs:school-announcements-updated", { detail: announcements }));
    }
}

export function saveSchoolAnnouncementsCache(announcements: SchoolAnnouncementItem[]): void {
    try {
        if (typeof window !== "undefined") {
            localStorage.setItem(ANNOUNCEMENTS_CACHE_KEY, JSON.stringify(announcements));
            notifySchoolAnnouncementsUpdated(announcements);
        }
    } catch (e) {
        console.warn("Failed to cache school announcements in localStorage:", e);
    }
}

export function getSchoolAnnouncementsCache(): SchoolAnnouncementItem[] | null {
    try {
        if (typeof window !== "undefined") {
            const raw = localStorage.getItem(ANNOUNCEMENTS_CACHE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        }
    } catch (e) {
        console.warn("Failed to read school announcements cache:", e);
    }
    return null;
}

// ------------------------------------------------------------
// Public Events Fetcher (Connected directly to SMS)
// ------------------------------------------------------------
export async function getPublicSchoolEvents(): Promise<SchoolEventItem[]> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        // 1. Try public endpoint first
        let response = await fetch(`${API_BASE_URL}/Events/public`, {
            signal: controller.signal,
            headers: { Accept: "application/json" }
        });

        // 2. If 404 or unauthorized, attempt general Events endpoint
        if (!response.ok) {
            const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
            response = await fetch(`${API_BASE_URL}/Events`, {
                signal: controller.signal,
                headers: {
                    Accept: "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });
        }

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            const rawEvents: any[] = Array.isArray(data)
                ? data
                : Array.isArray(data?.items)
                ? data.items
                : Array.isArray(data?.data)
                ? data.data
                : [];

            if (rawEvents.length > 0) {
                const mappedEvents = rawEvents.map((e, idx) => {
                    const rawDate = e.startDate || e.eventDate || e.EventDate || e.StartDate || "";
                    const dayMonth = parseDayMonth(rawDate);
                    const sTime = e.startTime || e.StartTime || "";
                    const eTime = e.endTime || e.EndTime || "";
                    return {
                        id: e.id || e.eventId || e.EventId || idx + 1,
                        title: e.title || e.Title || "Seminary Event",
                        eventType: e.eventType || e.EventType || "Campus Activity",
                        startDate: rawDate.includes("T") ? rawDate.split("T")[0] : rawDate,
                        formattedDate: formatDateLong(rawDate),
                        dayMonth,
                        time: sTime ? `${sTime}${eTime ? ` - ${eTime}` : ""}` : "TBA",
                        rawStartTime: sTime,
                        rawEndTime: eTime,
                        location: e.location || e.venue || e.Venue || "Main Seminary Campus",
                        speaker: e.speaker || e.Speaker || e.coordinator || e.Coordinator || "",
                        ministry: e.ministry || e.Ministry || "",
                        status: e.status || e.Status || "Upcoming",
                        description: e.description || e.Description || e.notes || e.Notes || "Join us for this theological seminar and fellowship.",
                        notes: e.notes || e.Notes || ""
                    };
                });

                // Update cache
                saveSchoolEventsCache(mappedEvents);
                return mappedEvents;
            }
        }
    } catch (err) {
        // Silently fallback on network error/timeout
        console.warn("SMS public events endpoint unavailable, attempting local cache fallback:", err);
    }

    // Check local storage cache before default fallback
    const cached = getSchoolEventsCache();
    if (cached && cached.length > 0) {
        return cached;
    }

    return DEFAULT_SCHOOL_EVENTS;
}

// ------------------------------------------------------------
// Public Announcements Fetcher (Connected directly to SMS)
// ------------------------------------------------------------
export async function getPublicSchoolAnnouncements(): Promise<SchoolAnnouncementItem[]> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(`${API_BASE_URL}/announcements`, {
            signal: controller.signal,
            headers: { Accept: "application/json" }
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            const raw: any[] = Array.isArray(data)
                ? data
                : Array.isArray(data?.items)
                ? data.items
                : [];

            if (raw.length > 0) {
                const mappedAnnouncements = raw.map((a, idx) => {
                    const pubDate = a.publishDate || a.createdDate || a.date || "";
                    return {
                        id: a.id || idx + 1,
                        title: a.title || "School Notice",
                        category: a.category || "CAMPUS NOTICE",
                        publishDate: pubDate,
                        formattedDate: formatDateLong(pubDate),
                        content: a.content || a.description || "",
                        imageUrl: a.imageUrl || null
                    };
                });

                saveSchoolAnnouncementsCache(mappedAnnouncements);
                return mappedAnnouncements;
            }
        }
    } catch (err) {
        console.warn("SMS announcements endpoint unavailable, using cached defaults:", err);
    }

    const cached = getSchoolAnnouncementsCache();
    if (cached && cached.length > 0) {
        return cached;
    }

    return DEFAULT_SCHOOL_ANNOUNCEMENTS;
}
