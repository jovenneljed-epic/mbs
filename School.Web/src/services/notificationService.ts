// ============================================================
// notificationService.ts
// Real-time Notification System for School Management System
// Aggregates Inquiries, Requests, Incoming Messages, Admissions,
// and New Student Inquiries from the Front Landing Page & Campus
// ============================================================

import { API_BASE_URL } from "../config";

export type NotificationType =
    | "admission"
    | "inquiry"
    | "request"
    | "message"
    | "student"
    | "discussion"
    | "system";

export interface PortalNotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    summary: string;
    source: string;
    senderName: string;
    senderEmail?: string | null;
    senderPhone?: string | null;
    affiliation?: string | null;
    category?: string | null;
    timestamp: string;
    status: string;
    isPending: boolean;
    priority: "high" | "normal";
    actionUrl: string;
    referenceId: string;
    isRead?: boolean;
}

export interface PortalNotificationFeed {
    success: boolean;
    totalCount: number;
    unreadCount: number;
    admissionsCount: number;
    inquiriesCount: number;
    requestsCount: number;
    notifications: PortalNotificationItem[];
    latestPending?: PortalNotificationItem | null;
    retrievedAt: string;
}

export const NOTIFICATIONS_UPDATED_EVENT = "sms_notifications_updated";
export const NOTIFICATIONS_POPUP_TRIGGER_EVENT = "sms_notifications_popup_trigger";
export const NEW_INCOMING_NOTIFICATION_EVENT = "sms_new_incoming_notification";

const READ_STORAGE_KEY = "sms_read_notification_ids_v1";
const LAST_POLL_COUNT_KEY = "sms_last_known_pending_count";

class SchoolNotificationService {
    private cachedFeed: PortalNotificationFeed | null = null;
    private pollIntervalId: any = null;
    private lastPendingCount: number = 0;

    constructor() {
        if (typeof window !== "undefined") {
            try {
                this.lastPendingCount = parseInt(sessionStorage.getItem(LAST_POLL_COUNT_KEY) || "0", 10);
            } catch {
                this.lastPendingCount = 0;
            }
        }
    }

    // ------------------------------------------------------------
    // READ STATUS TRACKING
    // ------------------------------------------------------------
    public getReadIds(): Set<string> {
        if (typeof window === "undefined") return new Set();
        try {
            const raw = localStorage.getItem(READ_STORAGE_KEY);
            if (raw) {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr)) return new Set(arr);
            }
        } catch {
            // ignore
        }
        return new Set();
    }

    public markAsRead(id: string): void {
        const set = this.getReadIds();
        set.add(id);
        try {
            localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(set)));
        } catch {
            // ignore
        }
        if (this.cachedFeed) {
            this.cachedFeed.notifications = this.cachedFeed.notifications.map(n =>
                n.id === id ? { ...n, isRead: true, isPending: false } : n
            );
            this.recalculateCounts();
            this.emitUpdate();
        }
    }

    public markAllAsRead(): void {
        if (!this.cachedFeed) return;
        const set = this.getReadIds();
        this.cachedFeed.notifications.forEach(n => {
            set.add(n.id);
            n.isRead = true;
            n.isPending = false;
        });
        try {
            localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(set)));
        } catch {
            // ignore
        }
        this.recalculateCounts();
        this.emitUpdate();
    }

    private recalculateCounts(): void {
        if (!this.cachedFeed) return;
        const readSet = this.getReadIds();
        const unreadItems = this.cachedFeed.notifications.filter(n => n.isPending && !readSet.has(n.id));
        this.cachedFeed.unreadCount = unreadItems.length;
        this.cachedFeed.admissionsCount = unreadItems.filter(n => n.type === "admission").length;
        this.cachedFeed.inquiriesCount = unreadItems.filter(n => n.type === "inquiry" || n.type === "message").length;
        this.cachedFeed.requestsCount = unreadItems.filter(n => n.type === "request").length;
    }

    // ------------------------------------------------------------
    // FETCH LIVE NOTIFICATION FEED
    // ------------------------------------------------------------
    public async fetchFeed(): Promise<PortalNotificationFeed> {
        try {
            const res = await fetch(`${API_BASE_URL}/Notifications/portal-feed`, {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            });

            if (res.ok) {
                const data: PortalNotificationFeed = await res.json();
                const readSet = this.getReadIds();

                // Apply read state overlay
                data.notifications = (data.notifications || []).map(n => {
                    const isRead = readSet.has(n.id) || !n.isPending;
                    return {
                        ...n,
                        isRead,
                        isPending: n.isPending && !isRead
                    };
                });

                // Check for brand new incoming items
                const activePendingCount = data.notifications.filter(n => n.isPending).length;
                if (activePendingCount > this.lastPendingCount && this.lastPendingCount > 0) {
                    const newest = data.notifications.find(n => n.isPending);
                    if (newest) {
                        this.emitNewIncoming(newest);
                    }
                }
                this.lastPendingCount = activePendingCount;
                try {
                    sessionStorage.setItem(LAST_POLL_COUNT_KEY, String(activePendingCount));
                } catch {
                    // ignore
                }

                // Recalculate based on client read set
                const unread = data.notifications.filter(n => n.isPending);
                data.unreadCount = unread.length;
                data.admissionsCount = unread.filter(n => n.type === "admission").length;
                data.inquiriesCount = unread.filter(n => n.type === "inquiry" || n.type === "message").length;
                data.requestsCount = unread.filter(n => n.type === "request").length;

                this.cachedFeed = data;
                this.emitUpdate();
                return data;
            }
        } catch (err) {
            console.warn("[Notifications] Error fetching feed, fallback local:", err);
        }

        // Fallback demo/cached data
        if (this.cachedFeed) return this.cachedFeed;

        return this.generateFallbackFeed();
    }

    private generateFallbackFeed(): PortalNotificationFeed {
        const fallbackItems: PortalNotificationItem[] = [
            {
                id: "inq-sample-1",
                type: "admission",
                title: "New Student Admission Application: Jonathan Vance",
                summary: "Application submitted for Bachelor of Theology (B.Th.). Desires pastoral training.",
                source: "Front Landing Page • Online Admission",
                senderName: "Jonathan Vance",
                senderEmail: "jvance@example.com",
                senderPhone: "0917-555-0192",
                affiliation: "Grace Reformed Baptist Fellowship",
                category: "Admissions & Enrollment",
                timestamp: new Date().toISOString(),
                status: "Pending",
                isPending: true,
                priority: "high",
                actionUrl: "demo-requests",
                referenceId: "1",
                isRead: false
            },
            {
                id: "inq-sample-2",
                type: "inquiry",
                title: "Curriculum & Units Inquiry from Sarah Morales",
                summary: "Requesting details on CBS Certificate in Biblical Studies modular schedule.",
                source: "Front Contact Desk • Incoming Inquiry",
                senderName: "Sarah Morales",
                senderEmail: "sarah.m@example.com",
                senderPhone: "0920-888-4321",
                affiliation: "Cornerstone Bible Community",
                category: "Academic Programs & Curriculum",
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                status: "Pending",
                isPending: true,
                priority: "normal",
                actionUrl: "demo-requests",
                referenceId: "2",
                isRead: false
            },
            {
                id: "inq-sample-3",
                type: "request",
                title: "Campus Visit / Demo Request from Pastor Manuel Reyes",
                summary: "Requesting on-site campus tour and overview of seminary extension program.",
                source: "Public Campus Tour Request",
                senderName: "Pastor Manuel Reyes",
                senderEmail: "pastor.reyes@example.com",
                senderPhone: "0918-222-3344",
                affiliation: "Living Hope Christian Church",
                category: "Campus Tour & Visit Request",
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                status: "Pending",
                isPending: true,
                priority: "normal",
                actionUrl: "demo-requests",
                referenceId: "3",
                isRead: false
            }
        ];

        const readSet = this.getReadIds();
        const items = fallbackItems.map(n => ({
            ...n,
            isRead: readSet.has(n.id),
            isPending: !readSet.has(n.id)
        }));

        const unread = items.filter(n => n.isPending);

        const feed: PortalNotificationFeed = {
            success: true,
            totalCount: items.length,
            unreadCount: unread.length,
            admissionsCount: unread.filter(n => n.type === "admission").length,
            inquiriesCount: unread.filter(n => n.type === "inquiry" || n.type === "message").length,
            requestsCount: unread.filter(n => n.type === "request").length,
            notifications: items,
            latestPending: unread[0] || null,
            retrievedAt: new Date().toISOString()
        };

        this.cachedFeed = feed;
        return feed;
    }

    public getCachedFeed(): PortalNotificationFeed | null {
        return this.cachedFeed;
    }

    // ------------------------------------------------------------
    // POLLING LIFECYCLE
    // ------------------------------------------------------------
    public startPolling(intervalMs: number = 25000): void {
        if (typeof window === "undefined") return;
        if (this.pollIntervalId) return;

        // Initial fetch
        this.fetchFeed();

        // Recurring poll
        this.pollIntervalId = setInterval(() => {
            this.fetchFeed();
        }, intervalMs);
    }

    public stopPolling(): void {
        if (this.pollIntervalId) {
            clearInterval(this.pollIntervalId);
            this.pollIntervalId = null;
        }
    }

    // ------------------------------------------------------------
    // EVENTS
    // ------------------------------------------------------------
    private emitUpdate(): void {
        if (typeof window === "undefined") return;
        window.dispatchEvent(
            new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, { detail: this.cachedFeed })
        );
    }

    private emitNewIncoming(item: PortalNotificationItem): void {
        if (typeof window === "undefined") return;
        window.dispatchEvent(
            new CustomEvent(NEW_INCOMING_NOTIFICATION_EVENT, { detail: item })
        );
    }

    public triggerPopupModal(): void {
        if (typeof window === "undefined") return;
        window.dispatchEvent(
            new CustomEvent(NOTIFICATIONS_POPUP_TRIGGER_EVENT, { detail: this.cachedFeed })
        );
    }
}

export const notificationService = new SchoolNotificationService();
export default notificationService;
