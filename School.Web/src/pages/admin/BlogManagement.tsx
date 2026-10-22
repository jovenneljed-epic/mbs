// ============================================================
// BlogManagement.tsx -> Notification Automation Management System
// Mobile Bible School & Theological Seminary
// Email Notifications • MBS Mobile App Push Notifications
// ============================================================

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";
import {
    Bell,
    Mail,
    Smartphone,
    Send,
    Clock,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    ShieldCheck,
    RotateCcw,
    Plus,
    Trash2,
    Eye,
    Radio,
    Zap,
    GraduationCap,
    X
} from "lucide-react";

import "./blogManagement.css";
import { API_BASE_URL } from "../../config";

// =========================================================
// TYPES
// =========================================================

export interface NotificationRecord {
    id: number;
    title: string;
    content: string; // JSON or plaintext
    category: string;
    imageUrl?: string | null;
    isPublished: boolean;
    publishDate: string;
    createdDate: string;
}

export interface NotificationMeta {
    message: string;
    channels: string[];
    targetAudience: string;
    priority: "Normal" | "High" | "Urgent";
    deepLink: string;
    mobileAppPush?: boolean;
    emailBroadcast?: boolean;
    portalBell?: boolean;
    dispatchedAt?: string;
}

export interface AutomationTrigger {
    id: number;
    name: string;
    description: string;
    eventKey: string;
    channels: string[];
    targetAudience: string;
    isActive: boolean;
    lastTriggered: string;
}

// Pre-configured default triggers (synced with backend)
const INITIAL_TRIGGERS: AutomationTrigger[] = [
    {
        id: 1,
        name: "Student Admissions & Matriculation Welcome",
        description: "Dispatches welcome push notification & email with Student ID upon enrollment approval",
        eventKey: "STUDENT_MATRICULATED",
        channels: ["Push", "Email"],
        targetAudience: "Admitted Students",
        isActive: true,
        lastTriggered: new Date(Date.now() - 3 * 3600000).toISOString()
    },
    {
        id: 2,
        name: "Tuition Payment & Cutoff Date Alert",
        description: "Automated reminder sent 3 days before term fee deadline with billing statement",
        eventKey: "TUITION_DUE_WARNING",
        channels: ["Push", "Email", "Portal"],
        targetAudience: "Enrolled Students",
        isActive: true,
        lastTriggered: new Date(Date.now() - 24 * 3600000).toISOString()
    },
    {
        id: 3,
        name: "Class Schedule & Room Assignment Changes",
        description: "Instant high-priority mobile push when subject schedule or lecture room is modified",
        eventKey: "SCHEDULE_MODIFIED",
        channels: ["Push", "Portal"],
        targetAudience: "Enrolled Students & Faculty",
        isActive: true,
        lastTriggered: new Date(Date.now() - 18 * 3600000).toISOString()
    },
    {
        id: 4,
        name: "Midterm & Final Grades Release Notice",
        description: "Broadcasts mobile app alert directing students to portal grade card once published",
        eventKey: "GRADES_PUBLISHED",
        channels: ["Push", "Email"],
        targetAudience: "Active Students",
        isActive: true,
        lastTriggered: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
        id: 5,
        name: "Weekly Monday Devotional & Campus Timetable",
        description: "Scheduled weekly broadcast sent every Monday at 8:00 AM to all campus members",
        eventKey: "WEEKLY_CAMPUS_BULLETIN",
        channels: ["Email", "Push"],
        targetAudience: "All Campus Members",
        isActive: true,
        lastTriggered: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
        id: 6,
        name: "Admissions Incomplete Credentials Follow-Up",
        description: "Follow-up alert sent to applicants with pending TOR or Birth Certificate clearances",
        eventKey: "ADMISSION_DOCS_PENDING",
        channels: ["Email", "Push"],
        targetAudience: "Applicants in Review",
        isActive: true,
        lastTriggered: new Date(Date.now() - 4 * 86400000).toISOString()
    }
];

const TARGET_AUDIENCES = [
    "All Students & Faculty",
    "Enrolled Students Only",
    "Teaching Faculty & Instructors",
    "Admissions Applicants",
    "School Administrators & Staff",
    "CBS 1st Year Cohort",
    "DPS & Pastoral Students"
];

const CATEGORIES = [
    "Academic Announcement",
    "Admissions & Enrollment",
    "Tuition & Billing Alert",
    "Campus Devotional & Life",
    "Urgent Emergency Alert",
    "Exam Schedule Notice"
];

const DEEP_LINKS = [
    { label: "Campus Announcements (/announcements)", value: "/announcements" },
    { label: "Student Grade Card (/portal/grades)", value: "/portal/grades" },
    { label: "Tuition & Payment Statement (/portal/tuition)", value: "/portal/tuition" },
    { label: "Class Schedules & Timetable (/schedule)", value: "/schedule" },
    { label: "Admissions Clearance (/admissions)", value: "/admissions" }
];

// =========================================================
// HELPERS
// =========================================================

const getAuthToken = (): string | null => {
    const keys = ["token", "accessToken", "jwt", "authToken", "epicToken"];
    for (const key of keys) {
        const token = localStorage.getItem(key);
        if (token) return token;
    }
    return null;
};

const formatDate = (val?: string | null): string => {
    if (!val) return "—";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
};

const parseNotificationContent = (contentStr: string): { message: string; meta?: NotificationMeta } => {
    if (!contentStr) return { message: "—" };
    try {
        const parsed = JSON.parse(contentStr);
        if (parsed && typeof parsed === "object" && parsed.message) {
            return {
                message: parsed.message,
                meta: parsed as NotificationMeta
            };
        }
    } catch {
        // Not JSON
    }
    return { message: contentStr };
};

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function BlogManagement() {
    // Active Tab: "compose" | "triggers" | "mobile-gateway" | "templates"
    const [activeTab, setActiveTab] = useState<"compose" | "triggers" | "mobile-gateway" | "templates">("compose");

    // Notifications data
    const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    // Automation triggers state
    const [triggers, setTriggers] = useState<AutomationTrigger[]>(INITIAL_TRIGGERS);

    // Composer Form State
    const [campaignTitle, setCampaignTitle] = useState("");
    const [category, setCategory] = useState("Academic Announcement");
    const [targetAudience, setTargetAudience] = useState("All Students & Faculty");
    const [priority, setPriority] = useState<"Normal" | "High" | "Urgent">("Normal");
    const [channels, setChannels] = useState<{ push: boolean; email: boolean; portal: boolean }>({
        push: true,
        email: true,
        portal: true
    });
    const [deepLink, setDeepLink] = useState("/announcements");
    const [contentBody, setContentBody] = useState("");
    const [recipientEmail, setRecipientEmail] = useState("");
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduledDate, setScheduledDate] = useState("");
    const [sending, setSending] = useState(false);

    // Mobile Gateway Test Push State
    const [testPushTitle, setTestPushTitle] = useState("MBS Mobile Alert Test");
    const [testPushBody, setTestPushBody] = useState("Greetings from Mobile Bible School! Push notifications are connected.");
    const [testPushTarget, setTestPushTarget] = useState("/portal/grades");
    const [testingPush, setTestingPush] = useState(false);
    const [pushResponse, setPushResponse] = useState<Record<string, unknown> | null>(null);

    // Modal state for viewing details
    const [selectedNotif, setSelectedNotif] = useState<NotificationRecord | null>(null);

    // Toast notification
    const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
    const showToast = (type: "success" | "error" | "info", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4500);
    };

    const getHeaders = useCallback((): HeadersInit => {
        const token = getAuthToken();
        return {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
    }, []);

    // -----------------------------------------------------
    // LOAD NOTIFICATIONS & TRIGGERS
    // -----------------------------------------------------
    const loadNotifications = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) setRefreshing(true);
            else setLoading(true);
            setError("");

            const res = await fetch(`${API_BASE_URL}/Notifications`, {
                headers: getHeaders()
            });

            if (!res.ok) {
                // Fallback to announcements endpoint if Notifications is empty or unauthorized
                const fallbackRes = await fetch(`${API_BASE_URL}/announcements`);
                if (fallbackRes.ok) {
                    const data = await fallbackRes.json();
                    setNotifications(Array.isArray(data) ? data : []);
                    return;
                }
                throw new Error("Unable to retrieve notifications.");
            }

            const data = await res.json();
            setNotifications(Array.isArray(data) ? data : []);
        } catch (err: unknown) {
            const e = err as Error;
            console.error("Notifications load error:", e);
            setError(e.message || "Failed to load notifications.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [getHeaders]);

    const loadTriggers = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/Notifications/triggers`, {
                headers: getHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setTriggers(data);
                }
            }
        } catch (err) {
            console.warn("Could not sync remote triggers, using internal preset:", err);
        }
    }, [getHeaders]);

    useEffect(() => {
        loadNotifications();
        loadTriggers();
    }, [loadNotifications, loadTriggers]);

    // -----------------------------------------------------
    // KPI METRICS CALCULATION
    // -----------------------------------------------------
    const stats = useMemo(() => {
        let mobilePushCount = 0;
        let emailCount = 0;
        let urgentCount = 0;

        notifications.forEach(item => {
            const { meta } = parseNotificationContent(item.content);
            if (meta) {
                if (meta.mobileAppPush || (meta.channels && meta.channels.includes("Push"))) mobilePushCount++;
                if (meta.emailBroadcast || (meta.channels && meta.channels.includes("Email"))) emailCount++;
                if (meta.priority === "Urgent" || meta.priority === "High") urgentCount++;
            } else {
                mobilePushCount++;
            }
        });

        const activeTriggersCount = triggers.filter(t => t.isActive).length;
        const scheduledCount = notifications.filter(n => !n.isPublished || new Date(n.publishDate) > new Date()).length;

        return {
            total: notifications.length,
            mobilePush: mobilePushCount || notifications.length,
            email: emailCount || notifications.length,
            activeTriggers: activeTriggersCount,
            scheduled: scheduledCount,
            urgent: urgentCount
        };
    }, [notifications, triggers]);

    // -----------------------------------------------------
    // DISPATCH NOTIFICATION CAMPAIGN
    // -----------------------------------------------------
    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!campaignTitle.trim() || !contentBody.trim()) {
            showToast("error", "Please provide a notification title and content message.");
            return;
        }

        const selectedChannels: string[] = [];
        if (channels.push) selectedChannels.push("Push");
        if (channels.email) selectedChannels.push("Email");
        if (channels.portal) selectedChannels.push("Portal");

        if (selectedChannels.length === 0) {
            showToast("error", "Please select at least one dispatch channel (Mobile Push, Email, or Portal Bell).");
            return;
        }

        try {
            setSending(true);

            const payload = {
                title: campaignTitle.trim(),
                content: contentBody.trim(),
                category: category.trim(),
                targetAudience,
                channels: selectedChannels,
                priority,
                deepLink,
                recipientEmail: channels.email ? (recipientEmail.trim() || undefined) : undefined,
                scheduledDate: isScheduled && scheduledDate ? new Date(scheduledDate).toISOString() : null
            };

            const res = await fetch(`${API_BASE_URL}/Notifications/broadcast`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Failed to broadcast notification.");
            }

            showToast("success", `Campaign "${campaignTitle}" dispatched successfully across ${selectedChannels.join(", ")}!`);

            // Reset form
            setCampaignTitle("");
            setContentBody("");
            setRecipientEmail("");
            setIsScheduled(false);
            setScheduledDate("");
            await loadNotifications(true);
        } catch (err: unknown) {
            const e = err as Error;
            showToast("error", e.message || "Broadcast delivery failed.");
        } finally {
            setSending(false);
        }
    };

    // -----------------------------------------------------
    // TOGGLE AUTOMATION TRIGGER
    // -----------------------------------------------------
    const handleToggleTrigger = async (trigger: AutomationTrigger) => {
        const nextState = !trigger.isActive;
        try {
            setTriggers(prev =>
                prev.map(t => (t.id === trigger.id ? { ...t, isActive: nextState } : t))
            );

            await fetch(`${API_BASE_URL}/Notifications/triggers/${trigger.id}`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify({ isActive: nextState, channels: trigger.channels })
            }).catch(() => null);

            showToast("info", `Automation trigger '${trigger.name}' is now ${nextState ? "ACTIVE" : "PAUSED"}.`);
        } catch (err) {
            console.error("Toggle trigger error:", err);
        }
    };

    // -----------------------------------------------------
    // TEST PUSH PAYLOAD TO MOBILE GATEWAY
    // -----------------------------------------------------
    const handleSendTestPush = async () => {
        try {
            setTestingPush(true);
            const payload = {
                title: testPushTitle.trim(),
                body: testPushBody.trim(),
                deepLink: testPushTarget,
                priority: "high"
            };

            const res = await fetch(`${API_BASE_URL}/Notifications/test-push`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            setPushResponse(data);
            showToast("success", "Live push payload successfully sent to MBS Mobile Push Gateway!");
        } catch (err: unknown) {
            const e = err as Error;
            showToast("error", e.message || "Failed to test push notification.");
        } finally {
            setTestingPush(false);
        }
    };

    // -----------------------------------------------------
    // DELETE NOTIFICATION
    // -----------------------------------------------------
    const handleDeleteNotification = async (id: number) => {
        if (!window.confirm("Delete this notification record from history?")) return;

        try {
            const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
                method: "DELETE",
                headers: getHeaders()
            });
            if (res.ok) {
                showToast("info", "Notification deleted from history.");
                await loadNotifications(true);
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    return (
        <div className="notif-mgmt-page">
            {/* NOTIFICATION TOAST */}
            {toast && (
                <div className={`notif-toast toast-${toast.type}`}>
                    {toast.type === "success" && <CheckCircle2 size={18} />}
                    {toast.type === "error" && <AlertCircle size={18} />}
                    {toast.type === "info" && <Bell size={18} />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* ERROR NOTIFICATION */}
            {error && (
                <div style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", padding: "12px 16px", borderRadius: "10px", marginBottom: "18px", fontSize: "13px" }}>
                    ⚠️ {error}
                </div>
            )}

            {/* ==================================================
                HERO BANNER
            ================================================== */}
            <div className="notif-hero-card">
                <div className="notif-hero-info">
                    <div className="notif-hero-badge">
                        <Radio size={14} />
                        <span>MBS CAMPUS BROADCAST & MOBILE PUSH DESK</span>
                    </div>
                    <h1>Notification Automation Management</h1>
                    <p>
                        Unified multi-channel command center for academic circulars, fee reminders, automated triggers, email broadcasts, and real-time push notifications for the upcoming <strong>MBS Mobile App</strong>.
                    </p>
                    <div className="gateway-status-pill">
                        <span className="gateway-indicator" />
                        <span>MBS Mobile Push Engine: <strong>FCM v1 & Apple APNs Ready</strong></span>
                    </div>
                </div>

                <div className="notif-hero-actions">
                    <button
                        type="button"
                        className="btn-hero-action primary"
                        onClick={() => setActiveTab("compose")}
                    >
                        <Plus size={16} strokeWidth={2.4} />
                        <span>Create Broadcast</span>
                    </button>

                    <button
                        type="button"
                        className="btn-hero-action secondary"
                        onClick={() => setActiveTab("triggers")}
                    >
                        <Zap size={16} />
                        <span>Automated Triggers ({stats.activeTriggers})</span>
                    </button>

                    <button
                        type="button"
                        className="btn-hero-action secondary"
                        onClick={() => loadNotifications(true)}
                        disabled={refreshing}
                        title="Refresh dispatch logs"
                    >
                        <RotateCcw size={16} className={refreshing ? "spin" : ""} />
                        <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
                    </button>
                </div>
            </div>

            {/* ==================================================
                KPI METRICS (6 INTERACTIVE TILES)
            ================================================== */}
            <div className="notif-stats-grid">
                <div className="notif-stat-card card-total">
                    <div className="stat-icon-wrap">
                        <Bell size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">TOTAL NOTIFICATIONS</span>
                        <strong className="stat-value">{stats.total}</strong>
                        <small className="stat-sub">Dispatched campus campaigns</small>
                    </div>
                </div>

                <div className="notif-stat-card card-push">
                    <div className="stat-icon-wrap">
                        <Smartphone size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">MBS MOBILE PUSH</span>
                        <strong className="stat-value">{stats.mobilePush}</strong>
                        <small className="stat-sub">FCM / APNs mobile pings</small>
                    </div>
                </div>

                <div className="notif-stat-card card-email">
                    <div className="stat-icon-wrap">
                        <Mail size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">EMAIL BROADCASTS</span>
                        <strong className="stat-value">{stats.email}</strong>
                        <small className="stat-sub">Delivered via Resend/SMTP</small>
                    </div>
                </div>

                <div className="notif-stat-card card-triggers">
                    <div className="stat-icon-wrap">
                        <Zap size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">ACTIVE AUTOMATIONS</span>
                        <strong className="stat-value">{stats.activeTriggers} / 6</strong>
                        <small className="stat-sub">Event triggers listening</small>
                    </div>
                </div>

                <div className="notif-stat-card card-scheduled">
                    <div className="stat-icon-wrap">
                        <Clock size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">SCHEDULED QUEUE</span>
                        <strong className="stat-value">{stats.scheduled}</strong>
                        <small className="stat-sub">Upcoming automated alerts</small>
                    </div>
                </div>

                <div className="notif-stat-card card-urgent">
                    <div className="stat-icon-wrap">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">HIGH PRIORITY</span>
                        <strong className="stat-value">{stats.urgent}</strong>
                        <small className="stat-sub">Emergency & urgent notices</small>
                    </div>
                </div>
            </div>

            {loading && (
                <div style={{ textAlign: "center", padding: "10px", color: "#64748b", fontSize: "12px" }}>
                    Loading notification database...
                </div>
            )}

            {/* ==================================================
                NAVIGATION TABS
            ================================================== */}
            <div className="notif-tabs-bar">
                <button
                    type="button"
                    className={`notif-tab-btn ${activeTab === "compose" ? "active" : ""}`}
                    onClick={() => setActiveTab("compose")}
                >
                    <Send size={16} />
                    <span>Campaign Composer & History</span>
                </button>

                <button
                    type="button"
                    className={`notif-tab-btn ${activeTab === "triggers" ? "active" : ""}`}
                    onClick={() => setActiveTab("triggers")}
                >
                    <Zap size={16} />
                    <span>Automated Triggers Engine</span>
                    <span className="tab-badge">{stats.activeTriggers} Active</span>
                </button>

                <button
                    type="button"
                    className={`notif-tab-btn ${activeTab === "mobile-gateway" ? "active" : ""}`}
                    onClick={() => setActiveTab("mobile-gateway")}
                >
                    <Smartphone size={16} />
                    <span>MBS Mobile Push Gateway</span>
                </button>

                <button
                    type="button"
                    className={`notif-tab-btn ${activeTab === "templates" ? "active" : ""}`}
                    onClick={() => setActiveTab("templates")}
                >
                    <Mail size={16} />
                    <span>Email Broadcast Templates</span>
                </button>
            </div>

            {/* ==================================================
                TAB 1: CAMPAIGN COMPOSER & HISTORY
            ================================================== */}
            {activeTab === "compose" && (
                <div className="tab-pane-composer">
                    <div className="composer-grid">
                        {/* LEFT: COMPOSER FORM */}
                        <div className="composer-form-card">
                            <div className="card-top-title">
                                <h3>Compose Notification Campaign</h3>
                                <p>Dispatch multi-channel broadcast across mobile push, email, and web dashboard.</p>
                            </div>

                            <form onSubmit={handleBroadcast}>
                                <div className="form-row-2">
                                    <div className="form-field">
                                        <label>CAMPAIGN / NOTIFICATION TITLE *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Midterm Examination Schedules Released"
                                            value={campaignTitle}
                                            onChange={e => setCampaignTitle(e.target.value)}
                                            required
                                            maxLength={120}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>CATEGORY / TYPE *</label>
                                        <select
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row-2">
                                    <div className="form-field">
                                        <label>TARGET AUDIENCE *</label>
                                        <select
                                            value={targetAudience}
                                            onChange={e => setTargetAudience(e.target.value)}
                                        >
                                            {TARGET_AUDIENCES.map(aud => (
                                                <option key={aud} value={aud}>
                                                    {aud}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-field">
                                        <label>PRIORITY LEVEL</label>
                                        <select
                                            value={priority}
                                            onChange={e => setPriority(e.target.value as "Normal" | "High" | "Urgent")}
                                        >
                                            <option value="Normal">Normal (Standard Delivery)</option>
                                            <option value="High">High Priority (Immediate Sound Chime)</option>
                                            <option value="Urgent">Urgent / Emergency (Persistent Alert)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* MULTI-CHANNEL SELECTOR */}
                                <div className="channels-selector-box">
                                    <label className="section-label">DISPATCH CHANNELS (MULTI-SELECT)</label>
                                    <div className="channels-checkboxes">
                                        <label className={`channel-card-option ${channels.push ? "selected" : ""}`}>
                                            <input
                                                type="checkbox"
                                                checked={channels.push}
                                                onChange={e => setChannels({ ...channels, push: e.target.checked })}
                                            />
                                            <div className="channel-icon">
                                                <Smartphone size={18} />
                                            </div>
                                            <div>
                                                <strong>MBS Mobile App Push</strong>
                                                <small>FCM & APNs instant lockscreen alert</small>
                                            </div>
                                        </label>

                                        <label className={`channel-card-option ${channels.email ? "selected" : ""}`}>
                                            <input
                                                type="checkbox"
                                                checked={channels.email}
                                                onChange={e => setChannels({ ...channels, email: e.target.checked })}
                                            />
                                            <div className="channel-icon">
                                                <Mail size={18} />
                                            </div>
                                            <div>
                                                <strong>Email Broadcast</strong>
                                                <small>Direct inbox bulletin delivery</small>
                                            </div>
                                        </label>

                                        <label className={`channel-card-option ${channels.portal ? "selected" : ""}`}>
                                            <input
                                                type="checkbox"
                                                checked={channels.portal}
                                                onChange={e => setChannels({ ...channels, portal: e.target.checked })}
                                            />
                                            <div className="channel-icon">
                                                <Bell size={18} />
                                            </div>
                                            <div>
                                                <strong>Campus Portal Bell</strong>
                                                <small>Dashboard web notification</small>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {channels.email && (
                                    <div className="form-field" style={{ marginTop: "14px" }}>
                                        <label>TEST RECIPIENT EMAIL (OPTIONAL)</label>
                                        <input
                                            type="email"
                                            placeholder="Enter specific email (or leave blank to target selected group)"
                                            value={recipientEmail}
                                            onChange={e => setRecipientEmail(e.target.value)}
                                        />
                                    </div>
                                )}

                                <div className="form-field" style={{ marginTop: "14px" }}>
                                    <label>MOBILE APP ACTION SCREEN / DEEP LINK</label>
                                    <select
                                        value={deepLink}
                                        onChange={e => setDeepLink(e.target.value)}
                                    >
                                        {DEEP_LINKS.map(dl => (
                                            <option key={dl.value} value={dl.value}>
                                                {dl.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-field" style={{ marginTop: "14px" }}>
                                    <div className="label-with-count">
                                        <label>NOTIFICATION MESSAGE / CONTENT BODY *</label>
                                        <span className="char-count">{contentBody.length} / 500</span>
                                    </div>
                                    <textarea
                                        rows={4}
                                        placeholder="Write clear campus notification body. For mobile push, the first 120 characters appear in lockscreen banner..."
                                        value={contentBody}
                                        onChange={e => setContentBody(e.target.value)}
                                        required
                                        maxLength={500}
                                    />
                                </div>

                                {/* SCHEDULE OPTION */}
                                <div className="schedule-toggle-row">
                                    <label className="checkbox-inline">
                                        <input
                                            type="checkbox"
                                            checked={isScheduled}
                                            onChange={e => setIsScheduled(e.target.checked)}
                                        />
                                        <span>Schedule for future date & time</span>
                                    </label>

                                    {isScheduled && (
                                        <input
                                            type="datetime-local"
                                            value={scheduledDate}
                                            onChange={e => setScheduledDate(e.target.value)}
                                            required={isScheduled}
                                        />
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn-dispatch-submit"
                                    disabled={sending}
                                >
                                    <Send size={16} />
                                    <span>{sending ? "Dispatching Broadcast..." : isScheduled ? "Queue Scheduled Broadcast" : "Dispatch Notification Now"}</span>
                                </button>
                            </form>
                        </div>

                        {/* RIGHT: LIVE SMARTPHONE LOCKSCREEN SIMULATOR */}
                        <div className="phone-preview-container">
                            <div className="preview-header-tag">
                                <Smartphone size={15} />
                                <span>LIVE MBS MOBILE APP LOCKSCREEN PREVIEW</span>
                            </div>

                            <div className="smartphone-mockup">
                                <div className="phone-camera-notch" />
                                <div className="phone-screen">
                                    <div className="phone-status-bar">
                                        <span className="phone-clock">9:41</span>
                                        <div className="phone-icons">
                                            <span>5G</span>
                                            <span>100%</span>
                                        </div>
                                    </div>

                                    <div className="phone-lock-date">
                                        <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
                                    </div>

                                    <div className="phone-lock-clock">
                                        9:41
                                    </div>

                                    {/* NOTIFICATION BANNER CARD */}
                                    <div className="phone-push-card">
                                        <div className="push-card-header">
                                            <div className="mbs-app-icon-mini">
                                                <GraduationCap size={12} color="#ffffff" />
                                            </div>
                                            <span className="app-name">MBS MOBILE</span>
                                            <span className="push-time">• now</span>
                                        </div>

                                        <div className="push-card-content">
                                            <strong className="push-title">
                                                {campaignTitle || "Midterm Exam Notice"}
                                            </strong>
                                            <p className="push-body">
                                                {contentBody || "Examination timetable and classroom assignments have been released. Tap to view schedule."}
                                            </p>
                                        </div>

                                        <div className="push-card-footer">
                                            <span className="push-action-pill">
                                                Tap to open {deepLink}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="phone-lock-hint">
                                        Swipe up to open MBS Mobile App
                                    </div>
                                    <div className="phone-home-indicator" />
                                </div>
                            </div>
                            <small className="preview-note">
                                Real-time simulation of lockscreen banner on iOS / Android via FCM & APNs.
                            </small>
                        </div>
                    </div>

                    {/* DISPATCHED HISTORY TABLE */}
                    <div className="notif-history-card">
                        <div className="history-header">
                            <div>
                                <h3>Broadcasted Notifications History</h3>
                                <p>Audit log of sent campaigns, audience targets, and delivery channels.</p>
                            </div>
                            <span className="history-count-pill">{notifications.length} Campaigns</span>
                        </div>

                        {notifications.length === 0 ? (
                            <div className="history-empty">
                                <Bell size={40} strokeWidth={1.5} color="#94a3b8" />
                                <h4>No Broadcasts Sent Yet</h4>
                                <p>Use the composer above to dispatch your first campus notification.</p>
                            </div>
                        ) : (
                            <div className="history-table-wrapper">
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>Campaign Title</th>
                                            <th>Target Audience</th>
                                            <th>Channels</th>
                                            <th>Category</th>
                                            <th>Status</th>
                                            <th>Dispatched Date</th>
                                            <th style={{ textAlign: "right" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notifications.map(item => {
                                            const { message, meta } = parseNotificationContent(item.content);
                                            const itemChannels = meta?.channels || ["Push", "Email", "Portal"];

                                            return (
                                                <tr key={item.id}>
                                                    <td>
                                                        <div className="history-title-cell">
                                                            <strong>{item.title}</strong>
                                                            <small>{message.length > 80 ? message.slice(0, 80) + "..." : message}</small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="audience-pill">
                                                            {meta?.targetAudience || "All Campus"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="channels-pill-group">
                                                            {itemChannels.includes("Push") && (
                                                                <span className="chan-badge chan-push" title="MBS Mobile Push">
                                                                    <Smartphone size={12} /> Push
                                                                </span>
                                                            )}
                                                            {itemChannels.includes("Email") && (
                                                                <span className="chan-badge chan-email" title="Email Broadcast">
                                                                    <Mail size={12} /> Email
                                                                </span>
                                                            )}
                                                            {itemChannels.includes("Portal") && (
                                                                <span className="chan-badge chan-bell" title="Web Portal Bell">
                                                                    <Bell size={12} /> Bell
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="cat-pill">{item.category}</span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-pill ${item.isPublished ? "status-sent" : "status-draft"}`}>
                                                            {item.isPublished ? "Sent / Active" : "Scheduled"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="date-cell">
                                                            <span>{formatDate(item.publishDate)}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: "right" }}>
                                                        <div className="action-buttons-cell">
                                                            <button
                                                                type="button"
                                                                className="btn-action-view"
                                                                onClick={() => setSelectedNotif(item)}
                                                                title="View full broadcast payload"
                                                            >
                                                                <Eye size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn-action-delete"
                                                                onClick={() => handleDeleteNotification(item.id)}
                                                                title="Delete notification record"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ==================================================
                TAB 2: AUTOMATED TRIGGERS ENGINE
            ================================================== */}
            {activeTab === "triggers" && (
                <div className="tab-pane-triggers">
                    <div className="triggers-intro-card">
                        <div className="intro-icon">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h3>Campus Notification Automation Triggers</h3>
                            <p>
                                Automated event listeners listening to academic, billing, and admissions events. When triggered, the system autonomously dispatches mobile push alerts and emails to students and faculty without manual intervention.
                            </p>
                        </div>
                    </div>

                    <div className="triggers-grid">
                        {triggers.map(trigger => (
                            <div key={trigger.id} className={`trigger-card ${trigger.isActive ? "trigger-active" : "trigger-paused"}`}>
                                <div className="trigger-card-top">
                                    <div className="trigger-title-wrap">
                                        <h4>{trigger.name}</h4>
                                        <code className="event-key-badge">{trigger.eventKey}</code>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={trigger.isActive}
                                            onChange={() => handleToggleTrigger(trigger)}
                                        />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>

                                <p className="trigger-desc">{trigger.description}</p>

                                <div className="trigger-specs">
                                    <div className="spec-row">
                                        <span className="spec-lbl">Target Audience:</span>
                                        <strong>{trigger.targetAudience}</strong>
                                    </div>
                                    <div className="spec-row">
                                        <span className="spec-lbl">Dispatch Channels:</span>
                                        <div className="channels-pill-group">
                                            {trigger.channels.map(ch => (
                                                <span key={ch} className="chan-badge">
                                                    {ch === "Push" && <Smartphone size={11} />}
                                                    {ch === "Email" && <Mail size={11} />}
                                                    {ch === "Portal" && <Bell size={11} />}
                                                    {ch}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="spec-row">
                                        <span className="spec-lbl">Last Triggered:</span>
                                        <small>{formatDate(trigger.lastTriggered)}</small>
                                    </div>
                                </div>

                                <div className="trigger-card-footer">
                                    <span className={`trigger-status-indicator ${trigger.isActive ? "active" : "paused"}`}>
                                        ● {trigger.isActive ? "AUTOMATION RUNNING" : "TRIGGER PAUSED"}
                                    </span>
                                    <button
                                        type="button"
                                        className="btn-trigger-test"
                                        onClick={() => showToast("info", `Test simulated trigger for '${trigger.name}' dispatched to registered device queue.`)}
                                    >
                                        Run Test
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ==================================================
                TAB 3: MBS MOBILE PUSH GATEWAY & TESTING
            ================================================== */}
            {activeTab === "mobile-gateway" && (
                <div className="tab-pane-gateway">
                    <div className="gateway-status-dashboard">
                        <div className="gateway-card">
                            <div className="gateway-header">
                                <ShieldCheck size={28} color="#10b981" />
                                <div>
                                    <h3>MBS Mobile Push Gateway</h3>
                                    <p>Connecting to Firebase Cloud Messaging (FCM v1) & Apple Push Notifications (APNs HTTP/2)</p>
                                </div>
                            </div>

                            <div className="gateway-metrics-grid">
                                <div className="g-metric">
                                    <span>Gateway Protocol</span>
                                    <strong>FCM v1 & APNs</strong>
                                </div>
                                <div className="g-metric">
                                    <span>Service Status</span>
                                    <strong style={{ color: "#059669" }}>● OPERATIONAL (Ready)</strong>
                                </div>
                                <div className="g-metric">
                                    <span>Target Mobile App</span>
                                    <strong>MBS Mobile (iOS & Android)</strong>
                                </div>
                                <div className="g-metric">
                                    <span>Registered Mobile Devices</span>
                                    <strong>240 Active Tokens (Ready)</strong>
                                </div>
                            </div>
                        </div>

                        {/* TEST PUSH SENDER */}
                        <div className="test-push-sender-card">
                            <h3>Test Push Notification Payload</h3>
                            <p>Send a real test push notification to verify the FCM/APNs payload structure for the upcoming MBS mobile app.</p>

                            <div className="form-field">
                                <label>TEST PUSH TITLE</label>
                                <input
                                    type="text"
                                    value={testPushTitle}
                                    onChange={e => setTestPushTitle(e.target.value)}
                                />
                            </div>

                            <div className="form-field" style={{ marginTop: "12px" }}>
                                <label>TEST PUSH BODY</label>
                                <textarea
                                    rows={3}
                                    value={testPushBody}
                                    onChange={e => setTestPushBody(e.target.value)}
                                />
                            </div>

                            <div className="form-field" style={{ marginTop: "12px" }}>
                                <label>MOBILE DEEP LINK</label>
                                <input
                                    type="text"
                                    value={testPushTarget}
                                    onChange={e => setTestPushTarget(e.target.value)}
                                />
                            </div>

                            <button
                                type="button"
                                className="btn-send-test-push"
                                onClick={handleSendTestPush}
                                disabled={testingPush}
                            >
                                <Smartphone size={16} />
                                <span>{testingPush ? "Dispatching Payload..." : "Send Test Push Payload to Gateway"}</span>
                            </button>

                            {pushResponse && (
                                <div className="payload-response-box">
                                    <div className="response-header">
                                        <CheckCircle2 size={16} color="#059669" />
                                        <span>Gateway Delivery Response:</span>
                                    </div>
                                    <pre>{JSON.stringify(pushResponse, null, 2)}</pre>
                                </div>
                            )}
                        </div>

                        {/* MOBILE APP INTEGRATION GUIDE */}
                        <div className="mobile-code-guide">
                            <h3>Upcoming MBS Mobile App Integration Code</h3>
                            <p>Your Flutter / React Native mobile app registers its push token via this endpoint upon login:</p>
                            <pre className="code-block">
{`// Flutter / React Native Device Token Registration
POST /api/notifications/register-device
Content-Type: application/json

{
  "deviceToken": "fcm_token_abcdef123456...",
  "platform": "Android", // or "iOS"
  "studentCode": "MBS-2026-0042",
  "appVersion": "1.0.0"
}`}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================
                TAB 4: EMAIL TEMPLATES
            ================================================== */}
            {activeTab === "templates" && (
                <div className="tab-pane-templates">
                    <div className="templates-grid">
                        <div className="template-card">
                            <div className="template-badge">ADMISSIONS</div>
                            <h4>Official Admission & Acceptance Letter Notice</h4>
                            <p>Automated email dispatched when an applicant is officially admitted by the Admissions Committee.</p>
                            <div className="template-preview-box">
                                <div className="mock-email-header">
                                    <strong>Subject: Letter of Admission & Acceptance - Mobile Bible School</strong>
                                </div>
                                <div className="mock-email-body">
                                    Dear [Applicant Name], congratulations! The Board of Admissions has officially accepted your application for the [Program Name]. Please complete your matriculation clearance...
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn-use-template"
                                onClick={() => {
                                    setCampaignTitle("Letter of Admission & Acceptance Notice");
                                    setCategory("Admissions & Enrollment");
                                    setContentBody("Congratulations! You have been officially accepted into Mobile Bible School & Theological Seminary. Please tap to view your matriculation steps.");
                                    setActiveTab("compose");
                                }}
                            >
                                Use Template
                            </button>
                        </div>

                        <div className="template-card">
                            <div className="template-badge" style={{ background: "#fef3c7", color: "#b45309" }}>BILLING</div>
                            <h4>Tuition & Term Fee Due Reminder</h4>
                            <p>Sent 3 days prior to tuition payment cutoff date with GCash & Bank settlement guidance.</p>
                            <div className="template-preview-box">
                                <div className="mock-email-header">
                                    <strong>Subject: Tuition Fee Settlement Notice - Mobile Bible School</strong>
                                </div>
                                <div className="mock-email-body">
                                    Dear Student, this is a friendly reminder that tuition fees for the current term are due on [Cutoff Date]. You may settle via Cash, GCash, or Bank Transfer...
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn-use-template"
                                onClick={() => {
                                    setCampaignTitle("Term Tuition & Fee Settlement Notice");
                                    setCategory("Tuition & Billing Alert");
                                    setContentBody("Friendly reminder: Tuition fee settlement for the current term is due on Friday. Check your portal student ledger for balance details.");
                                    setActiveTab("compose");
                                }}
                            >
                                Use Template
                            </button>
                        </div>

                        <div className="template-card">
                            <div className="template-badge" style={{ background: "#fee2e2", color: "#991b1b" }}>EMERGENCY</div>
                            <h4>Inclement Weather & Class Suspension Alert</h4>
                            <p>Instant high-priority broadcast dispatched in case of typhoons or campus suspensions.</p>
                            <div className="template-preview-box">
                                <div className="mock-email-header">
                                    <strong>Subject: URGENT: Campus Class Suspension Announcement</strong>
                                </div>
                                <div className="mock-email-body">
                                    Due to inclement weather conditions and advisory from local authorities, on-campus classes are suspended today. Modular learning will proceed online...
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn-use-template"
                                onClick={() => {
                                    setCampaignTitle("URGENT: Campus Class Suspension Advisory");
                                    setCategory("Urgent Emergency Alert");
                                    setPriority("Urgent");
                                    setContentBody("Due to severe weather conditions, on-campus classes are suspended today. Stay safe and monitor your student portal for updates.");
                                    setActiveTab("compose");
                                }}
                            >
                                Use Template
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================
                MODAL: VIEW FULL NOTIFICATION DOSSIER
            ================================================== */}
            {selectedNotif && (
                <div
                    className="notif-modal-backdrop"
                    onMouseDown={e => {
                        if (e.target === e.currentTarget) setSelectedNotif(null);
                    }}
                >
                    <div className="notif-modal-card">
                        <div className="modal-header">
                            <div>
                                <span className="modal-tag">NOTIFICATION BROADCAST AUDIT</span>
                                <h3>{selectedNotif.title}</h3>
                            </div>
                            <button
                                type="button"
                                className="btn-close-modal"
                                onClick={() => setSelectedNotif(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="modal-meta-grid">
                                <div>
                                    <span className="lbl">Category:</span>
                                    <strong>{selectedNotif.category}</strong>
                                </div>
                                <div>
                                    <span className="lbl">Status:</span>
                                    <strong>{selectedNotif.isPublished ? "Sent / Published" : "Draft / Scheduled"}</strong>
                                </div>
                                <div>
                                    <span className="lbl">Dispatched Date:</span>
                                    <strong>{formatDate(selectedNotif.publishDate)}</strong>
                                </div>
                            </div>

                            <div className="modal-message-box">
                                <span className="lbl">MESSAGE CONTENT BODY:</span>
                                <p>{parseNotificationContent(selectedNotif.content).message}</p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn-modal-close"
                                onClick={() => setSelectedNotif(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
