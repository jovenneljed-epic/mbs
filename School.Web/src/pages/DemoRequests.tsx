// ============================================================
// DemoRequests.tsx -> Inquiries & Contact Management System
// Mobile Bible School & Theological Seminary
// Public Website & CMS • Campus Communication Desk
// ============================================================

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";
import {
    Mail,
    Phone,
    Clock,
    Calendar,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Search,
    Plus,
    RotateCcw,
    Printer,
    Eye,
    MessageSquare,
    Trash2,
    Send,
    Building,
    Copy,
    Check,
    GraduationCap,
    X,
    RefreshCw
} from "lucide-react";

import "./DemoRequests.css";
import { API_BASE_URL } from "../config";
import { SchoolPrintService } from "../utils/schoolPrintService";

// =========================================================
// DATA MODELS
// =========================================================

export interface InquiryRecord {
    demoRequestId: number;
    fullName: string;
    churchName: string; // Affiliation / School / Church / Org
    email: string;
    phone?: string | null;
    position?: string | null; // Category / Subject / Inquiry Type
    message?: string | null;
    status: string; // Pending | Contacted | Scheduled | Completed | Cancelled
    adminNotes?: string | null;
    createdDate: string;
    contactedDate?: string | null;
    demoDate?: string | null; // Scheduled Appointment / Follow-up Date
    isConverted?: boolean;
    customerId?: number | null;
    convertedDate?: string | null;
}

export interface InquirySummary {
    total: number;
    pending: number;
    contacted: number;
    scheduled: number;
    completed: number;
    cancelled: number;
}

interface ApiResponse {
    success?: boolean;
    message?: string;
    title?: string;
    errors?: Record<string, string[]>;
}

// =========================================================
// STATUS & CATEGORY DEFINITIONS
// =========================================================

const STATUS_OPTIONS = [
    { value: "Pending", label: "Pending / New", color: "status-pending" },
    { value: "Contacted", label: "Contacted / In Progress", color: "status-contacted" },
    { value: "Scheduled", label: "Scheduled Follow-up", color: "status-scheduled" },
    { value: "Completed", label: "Resolved / Completed", color: "status-completed" },
    { value: "Cancelled", label: "Archived / Cancelled", color: "status-cancelled" }
];

const CATEGORY_OPTIONS = [
    "All Categories",
    "Admissions & Enrollment",
    "Academic Programs & Curriculum",
    "Tuition, Units & Fees",
    "Campus Tour & Visit Request",
    "System Demonstration Request",
    "Student Records & Credentials",
    "Partnership & Collaboration",
    "General Inquiries"
];

// =========================================================
// AUTH TOKEN RETRIEVER
// =========================================================

const getAuthToken = (): string | null => {
    const keys = ["token", "accessToken", "jwt", "authToken", "epicToken"];
    for (const key of keys) {
        const token = localStorage.getItem(key);
        if (token) return token;
    }
    return null;
};

// =========================================================
// HELPERS
// =========================================================

const formatDate = (value?: string | null): string => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
};

const formatDateOnly = (value?: string | null): string => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
};

const toDateTimeLocal = (value?: string | null): string => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getTimeAgo = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "Just now";
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDateOnly(dateStr);
};

const getInitials = (name: string): string => {
    if (!name) return "??";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarColor = (name: string): string => {
    const colors = [
        "linear-gradient(135deg, #3b82f6, #1d4ed8)",
        "linear-gradient(135deg, #10b981, #047857)",
        "linear-gradient(135deg, #8b5cf6, #6d28d9)",
        "linear-gradient(135deg, #f59e0b, #b45309)",
        "linear-gradient(135deg, #ec4899, #be185d)",
        "linear-gradient(135deg, #06b6d4, #0e7490)"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

const getCategoryBadgeClass = (category?: string | null): string => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("admission") || cat.includes("enroll")) return "badge-admission";
    if (cat.includes("program") || cat.includes("curriculum")) return "badge-curriculum";
    if (cat.includes("tuition") || cat.includes("fee")) return "badge-tuition";
    if (cat.includes("demo") || cat.includes("tour")) return "badge-demo";
    if (cat.includes("record") || cat.includes("tor")) return "badge-records";
    return "badge-general";
};

// =========================================================
// MAIN COMPONENT
// =========================================================

const DemoRequests: React.FC = () => {
    // -----------------------------------------------------
    // STATE
    // -----------------------------------------------------
    const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
    const [summary, setSummary] = useState<InquirySummary>({
        total: 0,
        pending: 0,
        contacted: 0,
        scheduled: 0,
        completed: 0,
        cancelled: 0
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

    // Modal state: Dossier / View
    const [selectedInquiry, setSelectedInquiry] = useState<InquiryRecord | null>(null);
    const [editingStatus, setEditingStatus] = useState("Pending");
    const [adminNotes, setAdminNotes] = useState("");
    const [contactedDate, setContactedDate] = useState("");
    const [demoDate, setDemoDate] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [converting, setConverting] = useState(false);
    const [resendingEmailId, setResendingEmailId] = useState<number | null>(null);

    // Modal state: Log Manual Inquiry
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({
        fullName: "",
        churchName: "",
        email: "",
        phone: "",
        position: "Admissions & Enrollment",
        message: "",
        status: "Pending",
        adminNotes: ""
    });
    const [addingInquiry, setAddingInquiry] = useState(false);

    // Notification toast
    const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

    const showToast = (type: "success" | "error" | "info", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4500);
    };

    // -----------------------------------------------------
    // AUTH HEADERS
    // -----------------------------------------------------
    const getHeaders = useCallback((): HeadersInit => {
        const token = getAuthToken();
        return {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
    }, []);

    // -----------------------------------------------------
    // LOAD INQUIRIES & SUMMARY
    // -----------------------------------------------------
    const loadInquiries = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) setRefreshing(true);
            else setLoading(true);
            setError("");

            const res = await fetch(`${API_BASE_URL}/DemoRequests`, {
                method: "GET",
                headers: getHeaders()
            });

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    throw new Error("You are not authorized to view inquiries and contact messages.");
                }
                throw new Error(`Failed to load inquiries (${res.status}).`);
            }

            const data = await res.json();
            const list = Array.isArray(data) ? data : [];
            setInquiries(list);

            // Auto-open inquiry if clicked from notification
            try {
                const targetId = sessionStorage.getItem("sms_open_inquiry_id");
                if (targetId && list.length > 0) {
                    const found = list.find((x: InquiryRecord) => String(x.demoRequestId) === String(targetId));
                    if (found) {
                        setSelectedInquiry(found);
                        setEditingStatus(found.status || "Pending");
                        setAdminNotes(found.adminNotes || "");
                        setContactedDate(toDateTimeLocal(found.contactedDate));
                        setDemoDate(toDateTimeLocal(found.demoDate));
                        setCopiedEmail(false);
                        sessionStorage.removeItem("sms_open_inquiry_id");
                    }
                }
            } catch {
                // ignore
            }
        } catch (err: unknown) {
            const e = err as Error;
            console.error("Inquiries load error:", e);
            setError(e.message || "Unable to load inquiries.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [getHeaders]);

    const loadSummary = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/DemoRequests/summary`, {
                method: "GET",
                headers: getHeaders()
            });
            if (!res.ok) return;
            const data = await res.json();
            setSummary({
                total: Number(data.total) || 0,
                pending: Number(data.pending) || 0,
                contacted: Number(data.contacted) || 0,
                scheduled: Number(data.scheduled) || 0,
                completed: Number(data.completed) || 0,
                cancelled: Number(data.cancelled) || 0
            });
        } catch (err) {
            console.error("Summary error:", err);
        }
    }, [getHeaders]);

    const loadAllData = useCallback(async (showRefresh = false) => {
        await Promise.all([loadInquiries(showRefresh), loadSummary()]);
    }, [loadInquiries, loadSummary]);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    // -----------------------------------------------------
    // FILTERED & SORTED INQUIRIES
    // -----------------------------------------------------
    const filteredInquiries = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return inquiries.filter(item => {
            const matchesSearch =
                !query ||
                item.fullName?.toLowerCase().includes(query) ||
                item.churchName?.toLowerCase().includes(query) ||
                item.email?.toLowerCase().includes(query) ||
                (item.phone && item.phone.toLowerCase().includes(query)) ||
                (item.position && item.position.toLowerCase().includes(query)) ||
                (item.message && item.message.toLowerCase().includes(query)) ||
                (item.adminNotes && item.adminNotes.toLowerCase().includes(query));

            const matchesStatus =
                statusFilter === "All" ||
                item.status?.toLowerCase() === statusFilter.toLowerCase();

            const matchesCategory =
                categoryFilter === "All Categories" ||
                (item.position && item.position.toLowerCase().includes(categoryFilter.toLowerCase())) ||
                (!item.position && categoryFilter === "General Inquiries");

            return matchesSearch && matchesStatus && matchesCategory;
        }).sort((a, b) => {
            const timeA = new Date(a.createdDate).getTime() || 0;
            const timeB = new Date(b.createdDate).getTime() || 0;
            return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
        });
    }, [inquiries, searchTerm, statusFilter, categoryFilter, sortOrder]);

    // -----------------------------------------------------
    // DOSSIER VIEW & EDIT
    // -----------------------------------------------------
    const handleOpenDossier = (item: InquiryRecord) => {
        setSelectedInquiry(item);
        setEditingStatus(item.status || "Pending");
        setAdminNotes(item.adminNotes || "");
        setContactedDate(toDateTimeLocal(item.contactedDate));
        setDemoDate(toDateTimeLocal(item.demoDate));
        setCopiedEmail(false);
    };

    const handleSaveDossier = async () => {
        if (!selectedInquiry) return;

        try {
            setSaving(true);
            const payload = {
                status: editingStatus,
                adminNotes: adminNotes.trim() || null,
                contactedDate: contactedDate ? new Date(contactedDate).toISOString() : null,
                demoDate: demoDate ? new Date(demoDate).toISOString() : null
            };

            const res = await fetch(`${API_BASE_URL}/DemoRequests/${selectedInquiry.demoRequestId}`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            const data: ApiResponse = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || `Failed to update inquiry (${res.status}).`);
            }

            showToast("success", `Inquiry #${selectedInquiry.demoRequestId} updated successfully!`);
            setSelectedInquiry(null);
            await loadAllData(true);
        } catch (err: unknown) {
            const e = err as Error;
            showToast("error", e.message || "Failed to update inquiry.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteInquiry = async () => {
        if (!selectedInquiry) return;
        if (!window.confirm(`Permanently delete the inquiry record from "${selectedInquiry.fullName}"?`)) {
            return;
        }

        try {
            setDeleting(true);
            const res = await fetch(`${API_BASE_URL}/DemoRequests/${selectedInquiry.demoRequestId}`, {
                method: "DELETE",
                headers: getHeaders()
            });
            const data: ApiResponse = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || "Failed to delete inquiry.");
            }
            showToast("info", "Inquiry deleted successfully.");
            setSelectedInquiry(null);
            await loadAllData(true);
        } catch (err: unknown) {
            const e = err as Error;
            showToast("error", e.message || "Failed to delete inquiry.");
        } finally {
            setDeleting(false);
        }
    };

    // Quick status toggle directly from table
    const handleQuickStatus = async (item: InquiryRecord, newStatus: string) => {
        try {
            const payload = {
                status: newStatus,
                adminNotes: item.adminNotes,
                contactedDate: newStatus === "Contacted" && !item.contactedDate ? new Date().toISOString() : item.contactedDate,
                demoDate: item.demoDate
            };

            const res = await fetch(`${API_BASE_URL}/DemoRequests/${item.demoRequestId}`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error("Failed to update status.");
            }

            showToast("success", `Marked inquiry as '${newStatus}'.`);
            await loadAllData(true);
        } catch (err: unknown) {
            const e = err as Error;
            showToast("error", e.message || "Failed to update status.");
        }
    };

    // -----------------------------------------------------
    // FORWARD INQUIRY TO ADMISSIONS PIPELINE
    // -----------------------------------------------------
    const handleResendInquiryEmail = async (id: number, email: string) => {
        if (resendingEmailId === id) return;
        try {
            setResendingEmailId(id);
            const res = await fetch(`${API_BASE_URL}/DemoRequests/${id}/resend-confirmation`, {
                method: "POST",
                headers: getHeaders()
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data?.message || "Failed to resend confirmation email.");
            }
            showToast("success", `✓ Automated confirmation email successfully resent to ${email}!`);
            await loadAllData(true);
        } catch (err: unknown) {
            const e = err as Error;
            showToast("error", e.message || "Failed to resend confirmation email.");
        } finally {
            setResendingEmailId(null);
        }
    };

    const handleForwardToAdmissions = async () => {
        if (!selectedInquiry) return;

        try {
            setConverting(true);
            // Split full name into first and last
            const nameParts = (selectedInquiry.fullName || "Prospective Student").trim().split(/\s+/);
            const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "Applicant";

            const notesPayload = JSON.stringify({
                inquiryId: selectedInquiry.demoRequestId,
                source: "Inquiries & Contact Desk",
                email: selectedInquiry.email,
                originalMessage: selectedInquiry.message || "",
                credentials: {
                    tor: false,
                    birthCert: false,
                    goodMoral: false,
                    photos: false,
                    medical: false,
                    recommendation: false
                }
            });

            const visitorPayload = {
                firstName,
                lastName,
                gender: "Unspecified",
                birthDate: new Date("2000-01-01").toISOString(),
                contactNumber: selectedInquiry.phone || "N/A",
                address: selectedInquiry.churchName || "Website Applicant",
                invitedBy: selectedInquiry.churchName || "Website Inquiry Desk",
                ministry: selectedInquiry.position || "College Admissions",
                firstVisitDate: new Date().toISOString(),
                notes: notesPayload
            };

            const res = await fetch(`${API_BASE_URL}/Visitors`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(visitorPayload)
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Failed to create admissions record.");
            }

            // Also mark current inquiry as Contacted with updated notes
            const updatePayload = {
                status: "Contacted",
                adminNotes: `${selectedInquiry.adminNotes ? selectedInquiry.adminNotes + "\n" : ""}Forwarded to Admissions & Applications system as registered applicant on ${new Date().toLocaleDateString()}.`,
                contactedDate: new Date().toISOString(),
                demoDate: selectedInquiry.demoDate
            };

            await fetch(`${API_BASE_URL}/DemoRequests/${selectedInquiry.demoRequestId}`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify(updatePayload)
            });

            showToast("success", `Applicant ${selectedInquiry.fullName} successfully registered in Admissions & Applications!`);
            setSelectedInquiry(null);
            await loadAllData(true);
        } catch (err: unknown) {
            const e = err as Error;
            showToast("error", e.message || "Failed to forward to admissions.");
        } finally {
            setConverting(false);
        }
    };

    // -----------------------------------------------------
    // LOG NEW MANUAL INQUIRY
    // -----------------------------------------------------
    const handleAddManualInquiry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addForm.fullName.trim() || !addForm.email.trim() || !addForm.message.trim()) {
            showToast("error", "Please provide inquirer name, valid email, and message details.");
            return;
        }

        try {
            setAddingInquiry(true);
            const payload = {
                fullName: addForm.fullName.trim(),
                churchName: addForm.churchName.trim() || "Walk-in / Phone Inquiry",
                email: addForm.email.trim().toLowerCase(),
                phone: addForm.phone.trim() || null,
                position: addForm.position.trim() || "General Inquiry",
                message: addForm.message.trim()
            };

            const res = await fetch(`${API_BASE_URL}/DemoRequests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || "Failed to log inquiry.");
            }

            // If initial status is not Pending, update it
            if (data.demoRequestId && addForm.status !== "Pending") {
                await fetch(`${API_BASE_URL}/DemoRequests/${data.demoRequestId}`, {
                    method: "PUT",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        status: addForm.status,
                        adminNotes: addForm.adminNotes.trim() || null,
                        contactedDate: addForm.status === "Contacted" ? new Date().toISOString() : null,
                        demoDate: null
                    })
                });
            }

            showToast("success", "New inquiry logged successfully into inbox!");
            setShowAddModal(false);
            setAddForm({
                fullName: "",
                churchName: "",
                email: "",
                phone: "",
                position: "Admissions & Enrollment",
                message: "",
                status: "Pending",
                adminNotes: ""
            });
            await loadAllData(true);
        } catch (err: unknown) {
            const e = err as Error;
            showToast("error", e.message || "Failed to log inquiry.");
        } finally {
            setAddingInquiry(false);
        }
    };

    // -----------------------------------------------------
    // PRINT OFFICIAL REPORT
    // -----------------------------------------------------
    const handlePrintInquiryLog = () => {
        SchoolPrintService.printReport({
            title: "OFFICIAL INQUIRIES & CONTACT MESSAGES REPORT",
            category: "Public Website, Admissions & Campus Communication Desk",
            description: "Registrar / Office of Admissions",
            summaryCards: [
                { label: "Total Inquiries", value: summary.total },
                { label: "Pending Review", value: summary.pending },
                { label: "Contacted / In Progress", value: summary.contacted },
                { label: "Scheduled Consultations", value: summary.scheduled },
                { label: "Resolved / Completed", value: summary.completed }
            ],
            columns: [
                { header: "ID", width: "70px", align: "center" },
                { header: "Inquirer Name", width: "160px" },
                { header: "Organization / Affiliation", width: "160px" },
                { header: "Contact Details", width: "180px" },
                { header: "Category / Purpose", width: "160px" },
                { header: "Status", width: "100px", align: "center" },
                { header: "Received Date", width: "130px", align: "center" }
            ],
            rows: filteredInquiries.map(item => [
                `#INQ-${item.demoRequestId}`,
                item.fullName,
                item.churchName || "Website Visitor",
                `${item.email}${item.phone ? " | " + item.phone : ""}`,
                item.position || "General Inquiry",
                item.status,
                formatDateOnly(item.createdDate)
            ])
        });
    };

    // Quick copy email
    const handleCopyEmail = (emailStr: string) => {
        navigator.clipboard.writeText(emailStr);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    // -----------------------------------------------------
    // RENDER: LOADING STATE
    // -----------------------------------------------------
    if (loading) {
        return (
            <div className="inquiry-mgmt-page">
                <div className="inquiry-loading-state">
                    <div className="inquiry-spinner" />
                    <h3>Loading Inquiries & Messages</h3>
                    <p>Connecting to campus communications database...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="inquiry-mgmt-page">
            {/* NOTIFICATION TOAST */}
            {toast && (
                <div className={`inquiry-toast toast-${toast.type}`}>
                    {toast.type === "success" && <CheckCircle2 size={18} />}
                    {toast.type === "error" && <AlertCircle size={18} />}
                    {toast.type === "info" && <Mail size={18} />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* ==================================================
                HERO BANNER & ACTIONS
            ================================================== */}
            <div className="inquiry-hero-card">
                <div className="inquiry-hero-info">
                    <div className="inquiry-hero-badge">
                        <Mail size={15} />
                        <span>CAMPUS COMMUNICATION DESK</span>
                    </div>
                    <h1>Inquiries & Contact Management</h1>
                    <p>
                        Real-time unified inbox for public website messages, prospective student admissions questions, campus tour bookings, and consultation requests.
                    </p>
                </div>

                <div className="inquiry-hero-actions">
                    <button
                        type="button"
                        className="btn-hero-primary"
                        onClick={() => setShowAddModal(true)}
                    >
                        <Plus size={16} strokeWidth={2.4} />
                        <span>Log Inquiry</span>
                    </button>

                    <button
                        type="button"
                        className="btn-hero-secondary"
                        onClick={handlePrintInquiryLog}
                        title="Print official inquiry report"
                    >
                        <Printer size={16} />
                        <span>Print Log</span>
                    </button>

                    <button
                        type="button"
                        className="btn-hero-secondary"
                        onClick={() => loadAllData(true)}
                        disabled={refreshing}
                        title="Refresh inbox"
                    >
                        <RotateCcw size={16} className={refreshing ? "spin" : ""} />
                        <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
                    </button>
                </div>
            </div>

            {/* ==================================================
                ERROR NOTIFICATION
            ================================================== */}
            {error && (
                <div className="inquiry-alert-error">
                    <AlertCircle size={20} />
                    <div>
                        <strong>Connection Notice</strong>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {/* ==================================================
                KPI SUMMARY CARDS (6 INTERACTIVE TILES)
            ================================================== */}
            <div className="inquiry-stats-grid">
                <div
                    className={`inquiry-stat-tile stat-total ${statusFilter === "All" ? "tile-active" : ""}`}
                    onClick={() => setStatusFilter("All")}
                    role="button"
                    tabIndex={0}
                >
                    <div className="stat-tile-icon">
                        <Mail size={20} />
                    </div>
                    <div className="stat-tile-data">
                        <span className="stat-tile-label">TOTAL INQUIRIES</span>
                        <strong className="stat-tile-value">{summary.total}</strong>
                        <small className="stat-tile-sub">All incoming messages</small>
                    </div>
                </div>

                <div
                    className={`inquiry-stat-tile stat-pending ${statusFilter === "Pending" ? "tile-active" : ""}`}
                    onClick={() => setStatusFilter("Pending")}
                    role="button"
                    tabIndex={0}
                >
                    <div className="stat-tile-icon">
                        <Clock size={20} />
                        {summary.pending > 0 && <span className="stat-pulse-dot" />}
                    </div>
                    <div className="stat-tile-data">
                        <span className="stat-tile-label">PENDING / NEW</span>
                        <strong className="stat-tile-value">{summary.pending}</strong>
                        <small className="stat-tile-sub">Awaiting review & reply</small>
                    </div>
                </div>

                <div
                    className={`inquiry-stat-tile stat-contacted ${statusFilter === "Contacted" ? "tile-active" : ""}`}
                    onClick={() => setStatusFilter("Contacted")}
                    role="button"
                    tabIndex={0}
                >
                    <div className="stat-tile-icon">
                        <Phone size={20} />
                    </div>
                    <div className="stat-tile-data">
                        <span className="stat-tile-label">CONTACTED</span>
                        <strong className="stat-tile-value">{summary.contacted}</strong>
                        <small className="stat-tile-sub">In communication / call</small>
                    </div>
                </div>

                <div
                    className={`inquiry-stat-tile stat-scheduled ${statusFilter === "Scheduled" ? "tile-active" : ""}`}
                    onClick={() => setStatusFilter("Scheduled")}
                    role="button"
                    tabIndex={0}
                >
                    <div className="stat-tile-icon">
                        <Calendar size={20} />
                    </div>
                    <div className="stat-tile-data">
                        <span className="stat-tile-label">SCHEDULED</span>
                        <strong className="stat-tile-value">{summary.scheduled}</strong>
                        <small className="stat-tile-sub">Consultations / tours</small>
                    </div>
                </div>

                <div
                    className={`inquiry-stat-tile stat-completed ${statusFilter === "Completed" ? "tile-active" : ""}`}
                    onClick={() => setStatusFilter("Completed")}
                    role="button"
                    tabIndex={0}
                >
                    <div className="stat-tile-icon">
                        <CheckCircle2 size={20} />
                    </div>
                    <div className="stat-tile-data">
                        <span className="stat-tile-label">RESOLVED</span>
                        <strong className="stat-tile-value">{summary.completed}</strong>
                        <small className="stat-tile-sub">Addressed & closed</small>
                    </div>
                </div>

                <div
                    className={`inquiry-stat-tile stat-cancelled ${statusFilter === "Cancelled" ? "tile-active" : ""}`}
                    onClick={() => setStatusFilter("Cancelled")}
                    role="button"
                    tabIndex={0}
                >
                    <div className="stat-tile-icon">
                        <XCircle size={20} />
                    </div>
                    <div className="stat-tile-data">
                        <span className="stat-tile-label">ARCHIVED</span>
                        <strong className="stat-tile-value">{summary.cancelled}</strong>
                        <small className="stat-tile-sub">Spam or cancelled</small>
                    </div>
                </div>
            </div>

            {/* ==================================================
                SEARCH & FILTER CONTROLS
            ================================================== */}
            <div className="inquiry-filter-card">
                <div className="inquiry-search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by inquirer name, email, phone, school/church, message keywords..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            className="clear-search-btn"
                            onClick={() => setSearchTerm("")}
                        >
                            ×
                        </button>
                    )}
                </div>

                <div className="inquiry-dropdown-filters">
                    <div className="filter-select-wrap">
                        <label>STATUS</label>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Statuses ({inquiries.length})</option>
                            <option value="Pending">Pending / New ({summary.pending})</option>
                            <option value="Contacted">Contacted / In Progress ({summary.contacted})</option>
                            <option value="Scheduled">Scheduled Follow-up ({summary.scheduled})</option>
                            <option value="Completed">Resolved / Completed ({summary.completed})</option>
                            <option value="Cancelled">Archived / Cancelled ({summary.cancelled})</option>
                        </select>
                    </div>

                    <div className="filter-select-wrap">
                        <label>CATEGORY</label>
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                        >
                            {CATEGORY_OPTIONS.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-select-wrap">
                        <label>SORT</label>
                        <select
                            value={sortOrder}
                            onChange={e => setSortOrder(e.target.value as "newest" | "oldest")}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ==================================================
                INQUIRIES TABLE & INBOX LIST
            ================================================== */}
            <div className="inquiry-table-card">
                <div className="inquiry-table-header">
                    <div className="inquiry-table-title">
                        <h2>Incoming Inquiries & Messages</h2>
                        <span className="results-count-pill">
                            Showing {filteredInquiries.length} of {inquiries.length} messages
                        </span>
                    </div>

                    {statusFilter !== "All" && (
                        <button
                            type="button"
                            className="btn-filter-reset"
                            onClick={() => {
                                setStatusFilter("All");
                                setCategoryFilter("All Categories");
                                setSearchTerm("");
                            }}
                        >
                            Reset Filters
                        </button>
                    )}
                </div>

                {filteredInquiries.length === 0 ? (
                    <div className="inquiry-empty-state">
                        <div className="empty-state-icon">
                            <Mail size={48} strokeWidth={1.5} />
                        </div>
                        <h3>No Inquiries Found</h3>
                        <p>
                            {searchTerm || statusFilter !== "All" || categoryFilter !== "All Categories"
                                ? "No messages match your active filter criteria. Try resetting your search or filters."
                                : "No messages in the inbox yet. Messages submitted via the contact page or inquiry form will immediately appear here."}
                        </p>
                        <button
                            type="button"
                            className="btn-empty-action"
                            onClick={() => setShowAddModal(true)}
                        >
                            <Plus size={16} />
                            <span>Log an Inquiry Manually</span>
                        </button>
                    </div>
                ) : (
                    <div className="inquiry-table-wrapper">
                        <table className="inquiry-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "240px" }}>Inquirer</th>
                                    <th style={{ width: "200px" }}>Affiliation / School</th>
                                    <th style={{ width: "200px" }}>Contact Details</th>
                                    <th style={{ width: "180px" }}>Category / Subject</th>
                                    <th>Message Preview</th>
                                    <th style={{ width: "120px" }}>Status</th>
                                    <th style={{ width: "130px" }}>Received</th>
                                    <th style={{ width: "130px", textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInquiries.map(item => {
                                    const avatarGradient = getAvatarColor(item.fullName);
                                    const initials = getInitials(item.fullName);
                                    const categoryClass = getCategoryBadgeClass(item.position);

                                    return (
                                        <tr key={item.demoRequestId} className="inquiry-row">
                                            {/* INQUIRER */}
                                            <td>
                                                <div className="inquiry-user-cell">
                                                    <div
                                                        className="inquiry-avatar"
                                                        style={{ background: avatarGradient }}
                                                    >
                                                        {initials}
                                                    </div>
                                                    <div className="inquiry-user-meta">
                                                        <strong className="user-name">{item.fullName}</strong>
                                                        <span className="inquiry-id-tag">#INQ-{item.demoRequestId}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* AFFILIATION */}
                                            <td>
                                                <div className="inquiry-affiliation-cell">
                                                    <Building size={14} className="affiliation-icon" />
                                                    <span className="affiliation-text" title={item.churchName}>
                                                        {item.churchName || "Website Visitor"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* CONTACT */}
                                            <td>
                                                <div className="inquiry-contact-cell">
                                                    <a
                                                        href={`mailto:${item.email}`}
                                                        className="contact-link"
                                                        title={`Send email to ${item.email}`}
                                                    >
                                                        <Mail size={13} />
                                                        <span>{item.email}</span>
                                                    </a>
                                                    {item.phone && (
                                                        <a
                                                            href={`tel:${item.phone}`}
                                                            className="contact-link contact-phone"
                                                            title={`Call ${item.phone}`}
                                                        >
                                                            <Phone size={13} />
                                                            <span>{item.phone}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </td>

                                            {/* CATEGORY */}
                                            <td>
                                                <span className={`category-pill ${categoryClass}`}>
                                                    {item.position || "General Inquiry"}
                                                </span>
                                            </td>

                                            {/* MESSAGE PREVIEW */}
                                            <td>
                                                <div className="message-snippet-cell">
                                                    <p className="message-snippet" title={item.message || "No message body"}>
                                                        {item.message || "— No written message attached —"}
                                                    </p>
                                                    {item.adminNotes && (
                                                        <span className="has-notes-badge" title={item.adminNotes}>
                                                            📝 Has Staff Notes
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* STATUS */}
                                            <td>
                                                <span className={`inquiry-status-badge status-${(item.status || "pending").toLowerCase()}`}>
                                                    {item.status || "Pending"}
                                                </span>
                                            </td>

                                            {/* RECEIVED DATE */}
                                            <td>
                                                <div className="received-date-cell">
                                                    <span className="date-primary">{getTimeAgo(item.createdDate)}</span>
                                                    <span className="date-sub">{formatDateOnly(item.createdDate)}</span>
                                                </div>
                                            </td>

                                            {/* ACTIONS */}
                                            <td style={{ textAlign: "right" }}>
                                                <div className="table-actions-group">
                                                    <button
                                                        type="button"
                                                        className="btn-action-view"
                                                        onClick={() => handleOpenDossier(item)}
                                                        title="View full inquiry & respond"
                                                    >
                                                        <Eye size={15} />
                                                        <span>View</span>
                                                    </button>

                                                    {item.status === "Pending" && (
                                                        <button
                                                            type="button"
                                                            className="btn-action-quick-status"
                                                            onClick={() => handleQuickStatus(item, "Contacted")}
                                                            title="Mark as Contacted"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className="btn-action-resend"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleResendInquiryEmail(item.demoRequestId, item.email);
                                                        }}
                                                        disabled={resendingEmailId === item.demoRequestId}
                                                        title={`Resend confirmation email to ${item.email}`}
                                                    >
                                                        <RefreshCw size={13} className={resendingEmailId === item.demoRequestId ? "spin" : ""} />
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

            {/* ==================================================
                MODAL 1: FULL INQUIRY DOSSIER & RESPONSE DESK
            ================================================== */}
            {selectedInquiry && (
                <div
                    className="inquiry-modal-backdrop"
                    onMouseDown={e => {
                        if (e.target === e.currentTarget && !saving && !deleting) {
                            setSelectedInquiry(null);
                        }
                    }}
                >
                    <div className="inquiry-modal-sheet" role="dialog" aria-modal="true">
                        {/* MODAL HEADER */}
                        <div className="inquiry-modal-header">
                            <div className="modal-header-title">
                                <div className="modal-header-badge">
                                    <MessageSquare size={16} />
                                    <span>INQUIRY DOSSIER #INQ-{selectedInquiry.demoRequestId}</span>
                                </div>
                                <h2>{selectedInquiry.fullName}</h2>
                                <span className={`inquiry-status-badge status-${(editingStatus || "pending").toLowerCase()}`}>
                                    {editingStatus}
                                </span>
                            </div>

                            <button
                                type="button"
                                className="btn-modal-close"
                                onClick={() => setSelectedInquiry(null)}
                                disabled={saving || deleting}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* MODAL CONTENT */}
                        <div className="inquiry-modal-body">
                            {/* SENDER PROFILE CARD */}
                            <div className="dossier-sender-card">
                                <div
                                    className="dossier-avatar"
                                    style={{ background: getAvatarColor(selectedInquiry.fullName) }}
                                >
                                    {getInitials(selectedInquiry.fullName)}
                                </div>

                                <div className="dossier-sender-details">
                                    <h3>{selectedInquiry.fullName}</h3>
                                    <div className="dossier-meta-chips">
                                        <span className="meta-chip">
                                            <Building size={14} />
                                            {selectedInquiry.churchName || "Website Public Visitor"}
                                        </span>
                                        <span className={`category-pill ${getCategoryBadgeClass(selectedInquiry.position)}`}>
                                            {selectedInquiry.position || "General Inquiry"}
                                        </span>
                                    </div>

                                    <div className="dossier-contact-row">
                                        <div className="dossier-contact-item">
                                            <Mail size={14} />
                                            <strong>{selectedInquiry.email}</strong>
                                            <button
                                                type="button"
                                                className="btn-copy-mini"
                                                onClick={() => handleCopyEmail(selectedInquiry.email)}
                                                title="Copy email address"
                                            >
                                                {copiedEmail ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                                            </button>
                                        </div>

                                        {selectedInquiry.phone && (
                                            <div className="dossier-contact-item">
                                                <Phone size={14} />
                                                <strong>{selectedInquiry.phone}</strong>
                                                <a
                                                    href={`tel:${selectedInquiry.phone}`}
                                                    className="btn-call-mini"
                                                    title="Call phone number"
                                                >
                                                    Call
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ORIGINAL MESSAGE BOX */}
                            <div className="dossier-message-card">
                                <div className="message-card-header">
                                    <span className="card-section-label">ORIGINAL INQUIRY MESSAGE</span>
                                    <span className="message-received-time">
                                        Received: {formatDate(selectedInquiry.createdDate)} ({getTimeAgo(selectedInquiry.createdDate)})
                                    </span>
                                </div>
                                <div className="message-card-body">
                                    <p className="message-full-text">
                                        {selectedInquiry.message || "— No written message body submitted —"}
                                    </p>
                                </div>
                            </div>

                            {/* QUICK ACTIONS TOOLBAR */}
                            <div className="dossier-actions-toolbar">
                                <a
                                    href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.position || "Inquiry Response")} - Mobile Bible School&body=Dear ${encodeURIComponent(selectedInquiry.fullName)},%0D%0A%0D%0AThank you for reaching out to Mobile Bible School & Theological Seminary regarding "${encodeURIComponent(selectedInquiry.position || "your inquiry")}".%0D%0A%0D%0A`}
                                    className="btn-toolbar-action btn-email-reply"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <Send size={15} />
                                    <span>Launch Email Reply</span>
                                </a>

                                <button
                                    type="button"
                                    className="btn-toolbar-action btn-forward-admissions"
                                    onClick={handleForwardToAdmissions}
                                    disabled={converting}
                                    title="Register this inquirer as an applicant in the Admissions module"
                                >
                                    <GraduationCap size={16} />
                                    <span>{converting ? "Registering..." : "Forward to Admissions"}</span>
                                </button>

                                <button
                                    type="button"
                                    className="btn-toolbar-action btn-resend-auto-email"
                                    onClick={() => handleResendInquiryEmail(selectedInquiry.demoRequestId, selectedInquiry.email)}
                                    disabled={resendingEmailId === selectedInquiry.demoRequestId}
                                    title="Trigger the auto-resender to dispatch official confirmation email via Resend"
                                >
                                    <RefreshCw size={15} className={resendingEmailId === selectedInquiry.demoRequestId ? "spin" : ""} />
                                    <span>{resendingEmailId === selectedInquiry.demoRequestId ? "Resending Email..." : "Resend Auto Email"}</span>
                                </button>
                            </div>

                            {/* STAFF MANAGEMENT FORM */}
                            <div className="dossier-management-section">
                                <h4 className="section-title">Staff Administration & Follow-Up</h4>

                                <div className="management-form-grid">
                                    <div className="form-field-group">
                                        <label>INQUIRY LIFECYCLE STATUS</label>
                                        <select
                                            value={editingStatus}
                                            onChange={e => setEditingStatus(e.target.value)}
                                        >
                                            {STATUS_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-field-group">
                                        <label>CONTACTED / RESPONSE DATE</label>
                                        <input
                                            type="datetime-local"
                                            value={contactedDate}
                                            onChange={e => setContactedDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-field-group">
                                        <label>SCHEDULED CONSULTATION / TOUR DATE</label>
                                        <input
                                            type="datetime-local"
                                            value={demoDate}
                                            onChange={e => setDemoDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-field-group" style={{ marginTop: "14px" }}>
                                    <label>STAFF INTERNAL FOLLOW-UP NOTES</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Record phone conversation notes, admissions counselor follow-up, inquiries resolution, or actions taken..."
                                        value={adminNotes}
                                        onChange={e => setAdminNotes(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* MODAL FOOTER */}
                        <div className="inquiry-modal-footer">
                            <button
                                type="button"
                                className="btn-modal-delete"
                                onClick={handleDeleteInquiry}
                                disabled={saving || deleting}
                            >
                                <Trash2 size={16} />
                                <span>{deleting ? "Deleting..." : "Delete Inquiry"}</span>
                            </button>

                            <div className="modal-footer-right">
                                <button
                                    type="button"
                                    className="btn-modal-cancel"
                                    onClick={() => setSelectedInquiry(null)}
                                    disabled={saving || deleting}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="btn-modal-save"
                                    onClick={handleSaveDossier}
                                    disabled={saving || deleting}
                                >
                                    {saving ? "Saving Changes..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================
                MODAL 2: LOG NEW MANUAL INQUIRY
            ================================================== */}
            {showAddModal && (
                <div
                    className="inquiry-modal-backdrop"
                    onMouseDown={e => {
                        if (e.target === e.currentTarget && !addingInquiry) {
                            setShowAddModal(false);
                        }
                    }}
                >
                    <div className="inquiry-modal-sheet" role="dialog" aria-modal="true">
                        <div className="inquiry-modal-header">
                            <div className="modal-header-title">
                                <div className="modal-header-badge">
                                    <Plus size={16} />
                                    <span>NEW INQUIRY INTAKE</span>
                                </div>
                                <h2>Log Manual Inquiry or Walk-In Message</h2>
                            </div>

                            <button
                                type="button"
                                className="btn-modal-close"
                                onClick={() => setShowAddModal(false)}
                                disabled={addingInquiry}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddManualInquiry}>
                            <div className="inquiry-modal-body">
                                <div className="management-form-grid">
                                    <div className="form-field-group">
                                        <label>INQUIRER FULL NAME *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Bro. David Santos"
                                            value={addForm.fullName}
                                            onChange={e => setAddForm({ ...addForm, fullName: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-field-group">
                                        <label>EMAIL ADDRESS *</label>
                                        <input
                                            type="email"
                                            placeholder="inquirer@example.com"
                                            value={addForm.email}
                                            onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-field-group">
                                        <label>CONTACT PHONE NUMBER</label>
                                        <input
                                            type="tel"
                                            placeholder="+63 9XX XXX XXXX"
                                            value={addForm.phone}
                                            onChange={e => setAddForm({ ...addForm, phone: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-field-group">
                                        <label>ORGANIZATION / CHURCH / AFFILIATION</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Grace Bible Church or Walk-In"
                                            value={addForm.churchName}
                                            onChange={e => setAddForm({ ...addForm, churchName: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-field-group">
                                        <label>INQUIRY CATEGORY / PURPOSE *</label>
                                        <select
                                            value={addForm.position}
                                            onChange={e => setAddForm({ ...addForm, position: e.target.value })}
                                        >
                                            <option value="Admissions & Enrollment">Admissions & Enrollment</option>
                                            <option value="Academic Programs & Curriculum">Academic Programs & Curriculum</option>
                                            <option value="Tuition, Units & Fees">Tuition, Units & Fees</option>
                                            <option value="Campus Tour & Visit Request">Campus Tour & Visit Request</option>
                                            <option value="System Demonstration Request">System Demonstration Request</option>
                                            <option value="Student Records & Credentials">Student Records & Credentials</option>
                                            <option value="Partnership & Collaboration">Partnership & Collaboration</option>
                                            <option value="General Inquiries">General Inquiries</option>
                                        </select>
                                    </div>

                                    <div className="form-field-group">
                                        <label>INITIAL STATUS</label>
                                        <select
                                            value={addForm.status}
                                            onChange={e => setAddForm({ ...addForm, status: e.target.value })}
                                        >
                                            <option value="Pending">Pending / New</option>
                                            <option value="Contacted">Contacted / In Progress</option>
                                            <option value="Scheduled">Scheduled Follow-up</option>
                                            <option value="Completed">Resolved / Completed</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-field-group" style={{ marginTop: "14px" }}>
                                    <label>MESSAGE / INQUIRY DETAILS *</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Record the caller's or visitor's questions, requested curriculum, or message details..."
                                        value={addForm.message}
                                        onChange={e => setAddForm({ ...addForm, message: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-field-group" style={{ marginTop: "14px" }}>
                                    <label>STAFF INTERNAL NOTES (OPTIONAL)</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Internal notes for admissions committee or registrar..."
                                        value={addForm.adminNotes}
                                        onChange={e => setAddForm({ ...addForm, adminNotes: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="inquiry-modal-footer">
                                <div />
                                <div className="modal-footer-right">
                                    <button
                                        type="button"
                                        className="btn-modal-cancel"
                                        onClick={() => setShowAddModal(false)}
                                        disabled={addingInquiry}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn-modal-save"
                                        disabled={addingInquiry}
                                    >
                                        {addingInquiry ? "Saving..." : "Log Inquiry to Inbox"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DemoRequests;
