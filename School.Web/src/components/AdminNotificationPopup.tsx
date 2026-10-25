// ============================================================
// AdminNotificationPopup.tsx
// Interactive Notification Pop-up for Admin & School Owner
// Automatically pops up whenever the Admin Portal is opened,
// alerting the administrator to pending inquiries, admissions,
// and incoming messages from the front landing page.
// ============================================================

import React, { useState, useEffect } from "react";
import {
    notificationService,
    type PortalNotificationFeed,
    type PortalNotificationItem,
    NOTIFICATIONS_UPDATED_EVENT,
    NOTIFICATIONS_POPUP_TRIGGER_EVENT,
    NEW_INCOMING_NOTIFICATION_EVENT
} from "../services/notificationService";
import {
    Bell,
    X,
    GraduationCap,
    Mail,
    Calendar,
    ArrowRight,
    Sparkles,
    ExternalLink
} from "lucide-react";
import "./AdminNotificationPopup.css";

interface AdminNotificationPopupProps {
    onNavigate: (page: any) => void;
}

export const AdminNotificationPopup: React.FC<AdminNotificationPopupProps> = ({ onNavigate }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [feed, setFeed] = useState<PortalNotificationFeed | null>(null);
    const [liveToast, setLiveToast] = useState<PortalNotificationItem | null>(null);

    // ------------------------------------------------------------
    // INITIALIZATION & PORTAL MOUNT TRIGGER
    // ------------------------------------------------------------
    useEffect(() => {
        const checkInitialPopup = async () => {
            const data = await notificationService.fetchFeed();
            setFeed(data);

            // Pop up if there are unread notifications awaiting review
            if (data && data.unreadCount > 0) {
                // Check if already dismissed in this specific tab session
                const dismissedThisSession = sessionStorage.getItem("sms_admin_notif_popup_dismissed");
                if (!dismissedThisSession) {
                    // Small graceful delay to let portal render before opening
                    const timer = setTimeout(() => {
                        setIsVisible(true);
                    }, 800);
                    return () => clearTimeout(timer);
                }
            }
        };

        checkInitialPopup();

        // Listen for manual trigger from bell or service
        const handleManualTrigger = (e: any) => {
            if (e.detail) {
                setFeed(e.detail);
                setIsVisible(true);
            }
        };

        // Listen for notification updates
        const handleUpdate = (e: any) => {
            if (e.detail) {
                setFeed(e.detail);
            }
        };

        // Listen for live incoming inquiry while portal is open
        const handleLiveIncoming = (e: any) => {
            if (e.detail) {
                setLiveToast(e.detail);
                setTimeout(() => setLiveToast(null), 7000);
            }
        };

        window.addEventListener(NOTIFICATIONS_POPUP_TRIGGER_EVENT, handleManualTrigger);
        window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdate);
        window.addEventListener(NEW_INCOMING_NOTIFICATION_EVENT, handleLiveIncoming);

        return () => {
            window.removeEventListener(NOTIFICATIONS_POPUP_TRIGGER_EVENT, handleManualTrigger);
            window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdate);
            window.removeEventListener(NEW_INCOMING_NOTIFICATION_EVENT, handleLiveIncoming);
        };
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        try {
            sessionStorage.setItem("sms_admin_notif_popup_dismissed", "true");
        } catch {
            // ignore
        }
    };

    const handleReviewAll = () => {
        setIsVisible(false);
        try {
            sessionStorage.setItem("sms_admin_notif_popup_dismissed", "true");
        } catch {
            // ignore
        }
        onNavigate("demo-requests");
    };

    const handleOpenItem = (item: PortalNotificationItem) => {
        notificationService.markAsRead(item.id);
        setIsVisible(false);
        if (item.actionUrl === "demo-requests" && item.referenceId) {
            sessionStorage.setItem("sms_open_inquiry_id", item.referenceId);
        }
        onNavigate(item.actionUrl || "demo-requests");
    };

    const pendingItems = (feed?.notifications || []).filter(n => n.isPending).slice(0, 3);
    const unreadCount = feed?.unreadCount || 0;

    return (
        <>
            {/* REAL-TIME INCOMING TOAST (When new inquiry arrives during active session) */}
            {liveToast && (
                <div className="admin-live-toast-alert" onClick={() => handleOpenItem(liveToast)}>
                    <div className="admin-live-toast-glow" />
                    <div className="admin-live-toast-icon">
                        <Sparkles size={18} />
                    </div>
                    <div className="admin-live-toast-content">
                        <strong>New Inquiry from Front Landing Page!</strong>
                        <p>{liveToast.senderName} ({liveToast.category || "Public Message"})</p>
                    </div>
                    <button
                        type="button"
                        className="admin-live-toast-action"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenItem(liveToast);
                        }}
                    >
                        <span>Review</span>
                        <ArrowRight size={13} />
                    </button>
                    <button
                        type="button"
                        className="admin-live-toast-close"
                        onClick={(e) => {
                            e.stopPropagation();
                            setLiveToast(null);
                        }}
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* MAIN ADMIN WELCOME POPUP MODAL */}
            {isVisible && unreadCount > 0 && (
                <div className="admin-notif-popup-overlay">
                    <div className="admin-notif-popup-card">
                        {/* HEADER */}
                        <div className="admin-notif-popup-header">
                            <div className="admin-notif-popup-badge">
                                <Bell size={18} className="admin-popup-bell-icon" />
                                <span>NEW CAMPUS NOTIFICATIONS DETECTED</span>
                            </div>

                            <button
                                type="button"
                                className="admin-notif-popup-close-btn"
                                onClick={handleDismiss}
                                title="Dismiss"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* TITLE & DESCRIPTION */}
                        <div className="admin-notif-popup-headline">
                            <h2>
                                You have <span className="admin-notif-count-highlight">{unreadCount}</span> pending inquiries &amp; admissions
                            </h2>
                            <p>
                                Prospective students and ministry candidates have submitted messages and admission applications through the front landing page and contact desk awaiting review.
                            </p>
                        </div>

                        {/* PREVIEW CARDS */}
                        <div className="admin-notif-preview-list">
                            {pendingItems.map(item => (
                                <div
                                    key={item.id}
                                    className="admin-notif-preview-item"
                                    onClick={() => handleOpenItem(item)}
                                >
                                    <div className={`admin-notif-preview-icon-wrap ${item.type}`}>
                                        {item.type === "admission" ? (
                                            <GraduationCap size={16} />
                                        ) : item.type === "request" ? (
                                            <Calendar size={16} />
                                        ) : (
                                            <Mail size={16} />
                                        )}
                                    </div>

                                    <div className="admin-notif-preview-info">
                                        <div className="admin-notif-preview-top">
                                            <span className={`admin-notif-pill ${item.type}`}>
                                                {item.type === "admission" ? "Online Admission" : item.category || "Inquiry"}
                                            </span>
                                            <span className="admin-notif-time-tag">Pending Review</span>
                                        </div>
                                        <h4 className="admin-notif-preview-title">{item.title}</h4>
                                        <p className="admin-notif-preview-snippet">{item.summary}</p>
                                        <span className="admin-notif-preview-sender">
                                            Candidate: <strong>{item.senderName}</strong>
                                            {item.senderEmail && ` • ${item.senderEmail}`}
                                        </span>
                                    </div>

                                    <div className="admin-notif-preview-action">
                                        <span className="admin-notif-btn-open-sm">
                                            <span>Open</span>
                                            <ExternalLink size={12} />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* FOOTER ACTIONS */}
                        <div className="admin-notif-popup-footer">
                            <button
                                type="button"
                                className="admin-notif-btn-dismiss"
                                onClick={handleDismiss}
                            >
                                Dismiss / Remind Later
                            </button>

                            <button
                                type="button"
                                className="admin-notif-btn-review-primary"
                                onClick={handleReviewAll}
                            >
                                <span>Review All Inquiries ({unreadCount})</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminNotificationPopup;
