// ============================================================
// NotificationBellDropdown.tsx
// Real-time Notification Bell & Interactive Dropdown Hub
// Inquiries, Requests, Messages, Admissions & New Student Alerts
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import {
    notificationService,
    type PortalNotificationFeed,
    type PortalNotificationItem,
    NOTIFICATIONS_UPDATED_EVENT
} from "../services/notificationService";
import {
    Bell,
    CheckCheck,
    RefreshCw,
    GraduationCap,
    Mail,
    Calendar,
    MessageSquare,
    ChevronRight,
    ArrowRight,
    Sparkles,
    UserCheck,
    Clock,
    X
} from "lucide-react";
import "./NotificationBellDropdown.css";

interface NotificationBellDropdownProps {
    onNavigate: (page: any) => void;
}

type FilterTab = "all" | "admissions" | "inquiries" | "requests";

export const NotificationBellDropdown: React.FC<NotificationBellDropdownProps> = ({ onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [feed, setFeed] = useState<PortalNotificationFeed | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<FilterTab>("all");
    const containerRef = useRef<HTMLDivElement>(null);

    // ------------------------------------------------------------
    // INITIALIZATION & SUBSCRIPTIONS
    // ------------------------------------------------------------
    useEffect(() => {
        // Start live polling service
        notificationService.startPolling(25000);

        // Fetch immediately
        fetchFeed();

        // Listen for notification updates
        const handleUpdate = (e: any) => {
            if (e.detail) {
                setFeed({ ...e.detail });
            }
        };

        window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdate);

        // Click outside listener to close dropdown
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdate);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchFeed = async () => {
        setLoading(true);
        try {
            const data = await notificationService.fetchFeed();
            setFeed(data);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        if (nextState) {
            // Refresh feed on open
            fetchFeed();
        }
    };

    const handleMarkAllRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        notificationService.markAllAsRead();
    };

    const handleItemClick = (item: PortalNotificationItem) => {
        notificationService.markAsRead(item.id);
        setIsOpen(false);

        if (item.actionUrl === "demo-requests" && item.referenceId) {
            sessionStorage.setItem("sms_open_inquiry_id", item.referenceId);
        }

        onNavigate(item.actionUrl || "demo-requests");
    };

    const handleViewAllInquiries = () => {
        setIsOpen(false);
        onNavigate("demo-requests");
    };

    // ------------------------------------------------------------
    // FILTERED ITEMS
    // ------------------------------------------------------------
    const allItems = feed?.notifications || [];
    const filteredItems = allItems.filter(item => {
        if (activeTab === "admissions") return item.type === "admission";
        if (activeTab === "inquiries") return item.type === "inquiry" || item.type === "message";
        if (activeTab === "requests") return item.type === "request";
        return true;
    });

    const unreadCount = feed?.unreadCount || 0;

    // Helper for time ago
    const formatTimeAgo = (dateStr: string): string => {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            if (diffMs < 0) return "Just now";
            const diffMins = Math.floor(diffMs / (1000 * 60));
            if (diffMins < 1) return "Just now";
            if (diffMins < 60) return `${diffMins}m ago`;
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours}h ago`;
            const diffDays = Math.floor(diffHours / 24);
            if (diffDays === 1) return "Yesterday";
            if (diffDays < 7) return `${diffDays}d ago`;
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        } catch {
            return "Recently";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "admission":
                return <GraduationCap size={16} className="notif-icon-admission" />;
            case "request":
                return <Calendar size={16} className="notif-icon-request" />;
            case "discussion":
                return <MessageSquare size={16} className="notif-icon-discussion" />;
            case "student":
                return <UserCheck size={16} className="notif-icon-student" />;
            default:
                return <Mail size={16} className="notif-icon-inquiry" />;
        }
    };

    return (
        <div className="notif-bell-container" ref={containerRef}>
            {/* TRIGGER BUTTON */}
            <button
                type="button"
                className={`fb-circle-action-btn notif-bell-btn ${unreadCount > 0 ? "has-unread" : ""} ${isOpen ? "active" : ""}`}
                title={unreadCount > 0 ? `${unreadCount} Unread Campus Notifications` : "Campus Notifications"}
                onClick={handleToggle}
                aria-expanded={isOpen}
            >
                <Bell size={18} strokeWidth={2.2} />
                {unreadCount > 0 && (
                    <>
                        <span className="fb-badge-count notif-badge">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                        <span className="notif-pulse-ring" />
                    </>
                )}
            </button>

            {/* DROPDOWN MENU */}
            {isOpen && (
                <div className="notif-dropdown-menu">
                    {/* DROPDOWN HEADER */}
                    <div className="notif-dropdown-header">
                        <div className="notif-header-title-group">
                            <div className="notif-header-bell-icon">
                                <Bell size={17} />
                            </div>
                            <div>
                                <h4 className="notif-header-title">Campus Notifications</h4>
                                <span className="notif-header-sub">
                                    {unreadCount > 0 ? `${unreadCount} new alerts requiring review` : "All caught up"}
                                </span>
                            </div>
                        </div>

                        <div className="notif-header-actions">
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    className="notif-action-btn"
                                    onClick={handleMarkAllRead}
                                    title="Mark all notifications as read"
                                >
                                    <CheckCheck size={14} />
                                    <span>Mark all read</span>
                                </button>
                            )}

                            <button
                                type="button"
                                className="notif-action-icon-btn"
                                onClick={fetchFeed}
                                title="Refresh feed"
                            >
                                <RefreshCw size={14} className={loading ? "spin" : ""} />
                            </button>

                            <button
                                type="button"
                                className="notif-action-icon-btn close"
                                onClick={() => setIsOpen(false)}
                                title="Close"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {/* FILTER TABS */}
                    <div className="notif-filter-tabs">
                        <button
                            type="button"
                            className={`notif-tab ${activeTab === "all" ? "active" : ""}`}
                            onClick={() => setActiveTab("all")}
                        >
                            <span>All</span>
                            <span className="notif-tab-badge">{feed?.totalCount || 0}</span>
                        </button>

                        <button
                            type="button"
                            className={`notif-tab ${activeTab === "admissions" ? "active" : ""}`}
                            onClick={() => setActiveTab("admissions")}
                        >
                            <span>Admissions</span>
                            {(feed?.admissionsCount || 0) > 0 && (
                                <span className="notif-tab-badge red">{feed?.admissionsCount}</span>
                            )}
                        </button>

                        <button
                            type="button"
                            className={`notif-tab ${activeTab === "inquiries" ? "active" : ""}`}
                            onClick={() => setActiveTab("inquiries")}
                        >
                            <span>Inquiries</span>
                            {(feed?.inquiriesCount || 0) > 0 && (
                                <span className="notif-tab-badge amber">{feed?.inquiriesCount}</span>
                            )}
                        </button>

                        <button
                            type="button"
                            className={`notif-tab ${activeTab === "requests" ? "active" : ""}`}
                            onClick={() => setActiveTab("requests")}
                        >
                            <span>Tour Requests</span>
                            {(feed?.requestsCount || 0) > 0 && (
                                <span className="notif-tab-badge blue">{feed?.requestsCount}</span>
                            )}
                        </button>
                    </div>

                    {/* NOTIFICATIONS LIST */}
                    <div className="notif-items-list">
                        {loading && filteredItems.length === 0 ? (
                            <div className="notif-state-message">
                                <RefreshCw size={24} className="spin" />
                                <p>Loading real-time notifications...</p>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="notif-empty-state">
                                <Sparkles size={32} color="#10b981" />
                                <h5>No notifications in this view</h5>
                                <p>All incoming inquiries and admissions from the front landing page are reviewed.</p>
                            </div>
                        ) : (
                            filteredItems.map(item => (
                                <div
                                    key={item.id}
                                    className={`notif-item-card ${item.isPending ? "unread" : "read"}`}
                                    onClick={() => handleItemClick(item)}
                                >
                                    <div className="notif-item-left">
                                        <div className={`notif-type-avatar ${item.type}`}>
                                            {getTypeIcon(item.type)}
                                        </div>
                                    </div>

                                    <div className="notif-item-body">
                                        <div className="notif-item-top">
                                            <span className={`notif-category-tag ${item.type}`}>
                                                {item.category || item.type.toUpperCase()}
                                            </span>
                                            <span className="notif-item-time">
                                                <Clock size={11} />
                                                <span>{formatTimeAgo(item.timestamp)}</span>
                                            </span>
                                        </div>

                                        <h5 className="notif-item-title">{item.title}</h5>

                                        <p className="notif-item-summary">{item.summary}</p>

                                        <div className="notif-item-sender-bar">
                                            <span className="notif-sender-name">
                                                From: <strong>{item.senderName}</strong>
                                            </span>
                                            {item.senderPhone && (
                                                <span className="notif-sender-contact">• {item.senderPhone}</span>
                                            )}
                                            <span className="notif-item-source">{item.source}</span>
                                        </div>
                                    </div>

                                    <div className="notif-item-right">
                                        {item.isPending && <span className="notif-unread-dot" />}
                                        <ChevronRight size={16} className="notif-arrow" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* DROPDOWN FOOTER */}
                    <div className="notif-dropdown-footer">
                        <button
                            type="button"
                            className="notif-footer-link"
                            onClick={handleViewAllInquiries}
                        >
                            <span>Open Inquiries &amp; Messages Desk</span>
                            <ArrowRight size={15} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBellDropdown;
