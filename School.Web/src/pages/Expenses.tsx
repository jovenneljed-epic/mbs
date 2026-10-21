import { useCallback, useEffect, useMemo, useState } from "react";
import "./Expenses.css";
import { apiClient } from "../api/apiClient";
import {
    DollarSign,
    TrendingDown,
    Plus,
    Search,
    Download,
    RefreshCw,
    Edit2,
    Trash2,
    Printer,
    X,
    CheckCircle2,
    AlertCircle,
    Calendar,
    CreditCard,
    Sparkles,
    Landmark,
    Receipt,
    Building2,
    Users,
} from "lucide-react";

/* =========================================================
   ACADEMIC EXPENSE CATEGORIES & PAYMENT METHODS
========================================================= */

export const SCHOOL_EXPENSE_CATEGORIES = [
    {
        value: "FACULTY & STAFF PAYROLL",
        label: "Faculty & Staff Payroll",
        description: "Salaries, 13th month pay, honoraria & faculty allowances",
        badgeClass: "badge-payroll",
    },
    {
        value: "CAMPUS UTILITIES",
        label: "Campus Utilities",
        description: "Electricity, water, fiber internet, phone & gas utilities",
        badgeClass: "badge-utilities",
    },
    {
        value: "INSTRUCTIONAL & OFFICE SUPPLIES",
        label: "Instructional & Office Supplies",
        description: "Paper, exam questionnaire printing, whiteboard markers & stationery",
        badgeClass: "badge-supplies",
    },
    {
        value: "LABORATORY & IT EQUIPMENT",
        label: "Lab Equipment & IT Infrastructure",
        description: "Science apparatus, chemicals, computers, servers & software",
        badgeClass: "badge-lab-it",
    },
    {
        value: "CAMPUS REPAIRS & MAINTENANCE",
        label: "Campus Repairs & Maintenance",
        description: "Classroom air conditioning, electrical, plumbing & roofing",
        badgeClass: "badge-maintenance",
    },
    {
        value: "LIBRARY & LEARNING RESOURCES",
        label: "Library & Learning Resources",
        description: "Library textbooks, reference journals & digital subscriptions",
        badgeClass: "badge-library",
    },
    {
        value: "STUDENT ACTIVITIES & ATHLETICS",
        label: "Student Activities & Athletics",
        description: "Sports intramurals, student council, quiz bees & ceremonies",
        badgeClass: "badge-activities",
    },
    {
        value: "PERMITS, LICENSES & ACCREDITATION",
        label: "Permits, Licenses & Taxes",
        description: "DepEd/CHED permits, SEC annual fees, fire safety & local taxes",
        badgeClass: "badge-permits",
    },
    {
        value: "SECURITY & SANITATION",
        label: "Security & Janitorial Services",
        description: "Campus security guard agency, janitorial & waste disposal",
        badgeClass: "badge-security",
    },
    {
        value: "OTHER OPERATIONAL EXPENSES",
        label: "Other School Operations",
        description: "Petty cash, hospitality, banking fees & unforeseen school expenses",
        badgeClass: "badge-other-exp",
    },
] as const;

export const PAYMENT_METHODS = [
    { value: "CASH", label: "Cash (Disbursement Voucher)" },
    { value: "CHECK", label: "Check / Manager's Check" },
    { value: "BANK TRANSFER", label: "Bank Transfer / Online Banking" },
    { value: "GCASH", label: "GCash" },
    { value: "MAYA", label: "Maya / PayMaya" },
    { value: "CARD", label: "School Corporate Card" },
    { value: "OTHER", label: "Other Payment Method" },
] as const;

/* =========================================================
   QUICK FILL PRESETS FOR SCHOOL DISBURSEMENTS
========================================================= */

const QUICK_FILL_PRESETS = [
    {
        name: "Faculty Monthly Payroll",
        category: "FACULTY & STAFF PAYROLL",
        description: "AY 2025-2026 Monthly Faculty & Teaching Staff Payroll",
        amount: "75000",
        paymentMethod: "BANK TRANSFER",
    },
    {
        name: "Campus Power & Electric Bill",
        category: "CAMPUS UTILITIES",
        description: "Campus Central Electric & Air Conditioning Bill",
        amount: "18500",
        paymentMethod: "BANK TRANSFER",
    },
    {
        name: "Bond Paper & Exam Printing",
        category: "INSTRUCTIONAL & OFFICE SUPPLIES",
        description: "Bulk Bond Paper (A4/Short), Ink Toner & Periodic Exam Printing",
        amount: "4800",
        paymentMethod: "CASH",
    },
    {
        name: "Computer Lab & IT Upgrades",
        category: "LABORATORY & IT EQUIPMENT",
        description: "Computer Lab SSD Upgrades & Science Lab Chemical Reagents",
        amount: "12000",
        paymentMethod: "CHECK",
    },
    {
        name: "AC Cleaning & Repairs",
        category: "CAMPUS REPAIRS & MAINTENANCE",
        description: "Classroom Aircon Cleaning & Campus Facility Preventative Maintenance",
        amount: "6500",
        paymentMethod: "CASH",
    },
    {
        name: "DepEd / LGU Accreditation Permits",
        category: "PERMITS, LICENSES & ACCREDITATION",
        description: "DepEd Annual Renewal & City Hall Business Safety Inspection",
        amount: "8200",
        paymentMethod: "CHECK",
    },
    {
        name: "Sports Intramurals Equipment",
        category: "STUDENT ACTIVITIES & ATHLETICS",
        description: "Campus Sports Intramurals Equipment, Trophies & Medals",
        amount: "5400",
        paymentMethod: "GCASH",
    },
    {
        name: "Campus Security Agency",
        category: "SECURITY & SANITATION",
        description: "Monthly Campus Security Guard & Night Watchman Services",
        amount: "24000",
        paymentMethod: "BANK TRANSFER",
    },
];

/* =========================================================
   TYPES
========================================================= */

export type ExpenseRecord = {
    expenseId: number;
    category: string;
    description: string;
    amount: number;
    expenseDate: string;
    paymentMethod: string;
    referenceNumber: string;
    recordedBy: string;
    recordedDate?: string;
};

export type CategoryBreakdown = {
    category: string;
    total: number;
    records?: number;
};

export type ExpenseDashboard = {
    totalExpenses: number;
    todayExpenses: number;
    monthlyExpenses: number;
    totalRecords: number;
    todayRecords: number;
    monthlyRecords: number;
    categoryBreakdown?: CategoryBreakdown[];
};

export type FormData = {
    category: string;
    description: string;
    amount: string;
    expenseDate: string;
    paymentMethod: string;
    referenceNumber: string;
};

/* =========================================================
   HELPERS
========================================================= */

function getToday(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function generateVoucherNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `DV-${year}-${random}`;
}

function createEmptyForm(): FormData {
    return {
        category: "FACULTY & STAFF PAYROLL",
        description: "",
        amount: "",
        expenseDate: getToday(),
        paymentMethod: "CASH",
        referenceNumber: generateVoucherNumber(),
    };
}

function money(value: number): string {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
    }).format(Number(value) || 0);
}

function dateInput(value: string): string {
    if (!value) return "";
    return String(value).slice(0, 10);
}

function dateOnly(value: string): string {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value).slice(0, 10);
    }
    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

/**
 * Normalizes legacy church categories to friendly school names
 * so existing database records are displayed cleanly.
 */
export function getExpenseCategoryDisplay(rawCategory: string | null | undefined): {
    label: string;
    badgeClass: string;
} {
    const norm = String(rawCategory || "")
        .trim()
        .toUpperCase();

    if (norm === "MINISTRY") {
        return { label: "Student Activities & Athletics", badgeClass: "badge-activities" };
    }
    if (norm === "SALARY") {
        return { label: "Faculty & Staff Payroll", badgeClass: "badge-payroll" };
    }
    if (norm === "UTILITIES") {
        return { label: "Campus Utilities", badgeClass: "badge-utilities" };
    }
    if (norm === "SUPPLIES") {
        return { label: "Instructional & Office Supplies", badgeClass: "badge-supplies" };
    }
    if (norm === "MAINTENANCE") {
        return { label: "Campus Repairs & Maintenance", badgeClass: "badge-maintenance" };
    }
    if (norm === "TRANSPORTATION") {
        return { label: "Campus Logistics & Transport", badgeClass: "badge-other-exp" };
    }
    if (norm === "FOOD") {
        return { label: "Campus Hospitality & Meals", badgeClass: "badge-supplies" };
    }

    const matched = SCHOOL_EXPENSE_CATEGORIES.find((c) => c.value === norm);
    if (matched) {
        return { label: matched.label, badgeClass: matched.badgeClass };
    }

    return { label: norm || "Other School Operations", badgeClass: "badge-other-exp" };
}

function normalizeExpenseRecord(record: any): ExpenseRecord {
    return {
        expenseId: Number(record?.expenseId ?? record?.ExpenseId ?? 0),
        category: String(record?.category ?? record?.Category ?? "OTHER OPERATIONAL EXPENSES")
            .trim()
            .toUpperCase(),
        description: String(record?.description ?? record?.Description ?? ""),
        amount: Number(record?.amount ?? record?.Amount ?? 0),
        expenseDate: String(record?.expenseDate ?? record?.ExpenseDate ?? ""),
        paymentMethod: String(record?.paymentMethod ?? record?.PaymentMethod ?? "CASH")
            .trim()
            .toUpperCase(),
        referenceNumber: String(record?.referenceNumber ?? record?.ReferenceNumber ?? ""),
        recordedBy: String(record?.recordedBy ?? record?.RecordedBy ?? "SYSTEM"),
        recordedDate: String(record?.recordedDate ?? record?.RecordedDate ?? ""),
    };
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Expenses() {
    const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
    const [dashboard, setDashboard] = useState<ExpenseDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [printingRecord, setPrintingRecord] = useState<ExpenseRecord | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [paymentFilter, setPaymentFilter] = useState("ALL");
    const [dateFilter, setDateFilter] = useState("");

    // Form
    const [form, setForm] = useState<FormData>(createEmptyForm());

    /* =====================================================
       LOAD EXPENSES & DASHBOARD
    ===================================================== */

    const loadExpenses = useCallback(async () => {
        const response = await apiClient("/Expenses");
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data?.message || data?.error || "Unable to load expense records.");
        }
        const list = Array.isArray(data) ? data : data?.records || data?.items || [];
        setExpenses(list.map(normalizeExpenseRecord));
    }, []);

    const loadDashboard = useCallback(async () => {
        try {
            const response = await apiClient("/Expenses/dashboard");
            if (!response.ok) return;
            const data = await response.json();
            setDashboard(data);
        } catch (err) {
            console.warn("Expense dashboard load warning:", err);
        }
    }, []);

    const loadAll = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            await Promise.all([loadExpenses(), loadDashboard()]);
        } catch (err) {
            console.error("EXPENSE LOAD ERROR:", err);
            setError(err instanceof Error ? err.message : "Unable to load school expenses.");
        } finally {
            setLoading(false);
        }
    }, [loadExpenses, loadDashboard]);

    useEffect(() => {
        void loadAll();
    }, [loadAll]);

    // Auto-refresh every 60 seconds
    useEffect(() => {
        const interval = window.setInterval(() => {
            void loadExpenses();
            void loadDashboard();
        }, 60000);
        return () => window.clearInterval(interval);
    }, [loadExpenses, loadDashboard]);

    /* =====================================================
       CALCULATED TOTALS
    ===================================================== */

    const totalExpenses = useMemo(() => {
        return expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    }, [expenses]);

    const todayExpenses = useMemo(() => {
        const today = getToday();
        return expenses.reduce((sum, e) => {
            if (dateInput(e.expenseDate) === today) {
                return sum + Number(e.amount || 0);
            }
            return sum;
        }, 0);
    }, [expenses]);

    const monthlyExpenses = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        return expenses.reduce((sum, e) => {
            const d = new Date(e.expenseDate);
            if (!Number.isNaN(d.getTime()) && d.getFullYear() === year && d.getMonth() === month) {
                return sum + Number(e.amount || 0);
            }
            return sum;
        }, 0);
    }, [expenses]);

    const payrollTotal = useMemo(() => {
        return expenses.reduce((sum, e) => {
            const label = getExpenseCategoryDisplay(e.category).label;
            if (label === "Faculty & Staff Payroll" || e.category === "SALARY") {
                return sum + Number(e.amount || 0);
            }
            return sum;
        }, 0);
    }, [expenses]);

    const utilitiesTotal = useMemo(() => {
        return expenses.reduce((sum, e) => {
            const label = getExpenseCategoryDisplay(e.category).label;
            if (label === "Campus Utilities" || e.category === "UTILITIES") {
                return sum + Number(e.amount || 0);
            }
            return sum;
        }, 0);
    }, [expenses]);

    /* =====================================================
       CATEGORY BREAKDOWN
    ===================================================== */

    const categoryTotals = useMemo(() => {
        const map = new Map<string, { total: number; records: number }>();

        expenses.forEach((e) => {
            const label = getExpenseCategoryDisplay(e.category).label;
            const current = map.get(label) || { total: 0, records: 0 };
            map.set(label, {
                total: current.total + Number(e.amount || 0),
                records: current.records + 1,
            });
        });

        return Array.from(map.entries())
            .map(([category, vals]) => ({
                category,
                total: vals.total,
                records: vals.records,
            }))
            .sort((a, b) => b.total - a.total);
    }, [expenses]);

    /* =====================================================
       FILTERED EXPENSES
    ===================================================== */

    const filteredExpenses = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return expenses.filter((e) => {
            const catLabel = getExpenseCategoryDisplay(e.category).label.toLowerCase();
            const rawCat = e.category.toLowerCase();
            const description = (e.description || "").toLowerCase();
            const payment = (e.paymentMethod || "").toLowerCase();
            const reference = (e.referenceNumber || "").toLowerCase();
            const recordedBy = (e.recordedBy || "").toLowerCase();

            const matchesSearch =
                !searchValue ||
                catLabel.includes(searchValue) ||
                rawCat.includes(searchValue) ||
                description.includes(searchValue) ||
                payment.includes(searchValue) ||
                reference.includes(searchValue) ||
                recordedBy.includes(searchValue);

            const matchesCategory =
                categoryFilter === "ALL" ||
                e.category === categoryFilter ||
                catLabel.toUpperCase() === categoryFilter.toUpperCase();

            const matchesPayment =
                paymentFilter === "ALL" || e.paymentMethod === paymentFilter;

            const matchesDate = !dateFilter || dateInput(e.expenseDate) === dateFilter;

            return matchesSearch && matchesCategory && matchesPayment && matchesDate;
        });
    }, [expenses, search, categoryFilter, paymentFilter, dateFilter]);

    const filteredTotal = useMemo(() => {
        return filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    }, [filteredExpenses]);

    /* =====================================================
       MODAL CONTROLS
    ===================================================== */

    function openAddModal() {
        setEditingId(null);
        setForm(createEmptyForm());
        setError("");
        setSuccess("");
        setShowModal(true);
    }

    function openEditModal(expense: ExpenseRecord) {
        setEditingId(expense.expenseId);
        setForm({
            category: expense.category,
            description: expense.description || "",
            amount: String(expense.amount || ""),
            expenseDate: dateInput(expense.expenseDate) || getToday(),
            paymentMethod: expense.paymentMethod || "CASH",
            referenceNumber: expense.referenceNumber || generateVoucherNumber(),
        });
        setError("");
        setSuccess("");
        setShowModal(true);
    }

    function closeModal() {
        if (saving) return;
        setShowModal(false);
        setEditingId(null);
        setForm(createEmptyForm());
    }

    function applyQuickPreset(preset: (typeof QUICK_FILL_PRESETS)[0]) {
        setForm((prev) => ({
            ...prev,
            category: preset.category,
            description: preset.description,
            amount: preset.amount,
            paymentMethod: preset.paymentMethod,
            referenceNumber: prev.referenceNumber || generateVoucherNumber(),
        }));
    }

    /* =====================================================
       SAVE EXPENSE (CREATE / UPDATE)
    ===================================================== */

    async function saveExpense(event: React.FormEvent) {
        event.preventDefault();
        setError("");
        setSuccess("");

        const amount = Number(form.amount);

        if (!form.category) {
            setError("Please select an expense category.");
            return;
        }

        if (!form.description.trim()) {
            setError("Please provide a description of the expense / disbursement.");
            return;
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            setError("Please enter a valid amount greater than ₱0.00.");
            return;
        }

        if (!form.expenseDate) {
            setError("Please select a transaction date.");
            return;
        }

        setSaving(true);

        try {
            const payload = {
                category: form.category.trim().toUpperCase(),
                description: form.description.trim(),
                amount,
                expenseDate: form.expenseDate,
                paymentMethod: form.paymentMethod.trim().toUpperCase(),
                referenceNumber: form.referenceNumber.trim() || generateVoucherNumber(),
            };

            const endpoint = editingId !== null ? `/Expenses/${editingId}` : "/Expenses";
            const method = editingId !== null ? "PUT" : "POST";

            const response = await apiClient(endpoint, {
                method,
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || data?.error || `Server returned ${response.status}.`);
            }

            setSuccess(
                editingId !== null
                    ? "School expense disbursement updated successfully."
                    : "School operational expense recorded and disbursement voucher issued."
            );

            setShowModal(false);
            setEditingId(null);
            setForm(createEmptyForm());

            await Promise.all([loadExpenses(), loadDashboard()]);
        } catch (err) {
            console.error("SAVE EXPENSE ERROR:", err);
            setError(err instanceof Error ? err.message : "Unable to save school expense.");
        } finally {
            setSaving(false);
        }
    }

    /* =====================================================
       DELETE EXPENSE
    ===================================================== */

    async function deleteExpense(expense: ExpenseRecord) {
        const confirmed = window.confirm(
            `Delete this school expense disbursement?\n\n${expense.description}\n${money(
                expense.amount
            )}\n\nThis action will adjust institutional financial reports.`
        );
        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            const response = await apiClient(`/Expenses/${expense.expenseId}`, { method: "DELETE" });
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to delete expense record.");
            }

            setSuccess("Disbursement record deleted successfully.");
            await Promise.all([loadExpenses(), loadDashboard()]);
        } catch (err) {
            console.error("DELETE EXPENSE ERROR:", err);
            setError(err instanceof Error ? err.message : "Unable to delete expense record.");
        }
    }

    /* =====================================================
       EXPORT TO CSV
    ===================================================== */

    function exportToCsv() {
        if (!filteredExpenses.length) {
            alert("No expense records available to export.");
            return;
        }

        const headers = [
            "Disbursement Voucher #",
            "Date",
            "Category",
            "Description",
            "Amount (PHP)",
            "Payment Method",
            "Recorded By",
        ];

        const rows = filteredExpenses.map((e) => [
            `"${e.referenceNumber || `DV-${e.expenseId}`}"`,
            `"${dateInput(e.expenseDate)}"`,
            `"${getExpenseCategoryDisplay(e.category).label}"`,
            `"${(e.description || "").replace(/"/g, '""')}"`,
            `"${e.amount.toFixed(2)}"`,
            `"${e.paymentMethod || "CASH"}"`,
            `"${e.recordedBy || "SYSTEM"}"`,
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `School_Expenses_Report_${getToday()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function clearFilters() {
        setSearch("");
        setCategoryFilter("ALL");
        setPaymentFilter("ALL");
        setDateFilter("");
    }

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="school-expenses-page">
            {/* =================================================
                HEADER
            ================================================= */}
            <header className="expenses-page-header">
                <div className="header-text-block">
                    <div className="header-badge">
                        <Building2 size={15} />
                        <span>Institutional Operations & Disbursements</span>
                    </div>
                    <h1>School Expenses & Disbursements</h1>
                    <p>
                        Track faculty payroll, campus utilities, laboratory equipment, instructional supplies, and
                        school operational disbursements.
                    </p>
                </div>

                <div className="header-action-group">
                    <button
                        className="btn btn-secondary-outline"
                        onClick={exportToCsv}
                        disabled={loading || !expenses.length}
                        title="Download CSV for accounting & auditing"
                    >
                        <Download size={16} />
                        <span>Export CSV</span>
                    </button>

                    <button
                        className="btn btn-secondary"
                        onClick={() => void loadAll()}
                        disabled={loading}
                        title="Refresh data"
                    >
                        <RefreshCw size={16} className={loading ? "spin" : ""} />
                        <span>Refresh</span>
                    </button>

                    <button className="btn btn-primary" onClick={openAddModal}>
                        <Plus size={18} strokeWidth={2.5} />
                        <span>Record Expense</span>
                    </button>
                </div>
            </header>

            {/* =================================================
                ALERTS
            ================================================= */}
            {error && (
                <div className="expenses-banner banner-error">
                    <AlertCircle size={20} />
                    <div className="banner-content">
                        <strong>Action Needed</strong>
                        <span>{error}</span>
                    </div>
                    <button className="banner-dismiss" onClick={() => setError("")}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {success && (
                <div className="expenses-banner banner-success">
                    <CheckCircle2 size={20} />
                    <div className="banner-content">
                        <strong>Success</strong>
                        <span>{success}</span>
                    </div>
                    <button className="banner-dismiss" onClick={() => setSuccess("")}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* =================================================
                KPI DASHBOARD CARDS
            ================================================= */}
            <section className="school-kpi-grid">
                {/* 1. TOTAL SCHOOL EXPENSES */}
                <div className="kpi-card total-expenses-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap icon-total-exp">
                            <TrendingDown size={22} />
                        </div>
                        <span className="kpi-pill">All-Time Disbursements</span>
                    </div>
                    <div className="kpi-body">
                        <span className="kpi-title">Total School Expenses</span>
                        <h2 className="kpi-value">{money(dashboard?.totalExpenses ?? totalExpenses)}</h2>
                    </div>
                    <div className="kpi-footer">
                        <Receipt size={14} />
                        <span>
                            {dashboard?.totalRecords ?? expenses.length} Disbursement Vouchers Issued
                        </span>
                    </div>
                </div>

                {/* 2. FACULTY & STAFF PAYROLL */}
                <div className="kpi-card payroll-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap icon-payroll">
                            <Users size={22} />
                        </div>
                        <span className="kpi-pill">Human Resources</span>
                    </div>
                    <div className="kpi-body">
                        <span className="kpi-title">Faculty & Staff Payroll</span>
                        <h2 className="kpi-value">{money(payrollTotal)}</h2>
                    </div>
                    <div className="kpi-footer">
                        <span>Teaching and administrative personnel</span>
                    </div>
                </div>

                {/* 3. CAMPUS UTILITIES */}
                <div className="kpi-card utilities-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap icon-utilities">
                            <Landmark size={22} />
                        </div>
                        <span className="kpi-pill">Campus Facilities</span>
                    </div>
                    <div className="kpi-body">
                        <span className="kpi-title">Campus Utilities</span>
                        <h2 className="kpi-value">{money(utilitiesTotal)}</h2>
                    </div>
                    <div className="kpi-footer">
                        <span>Electricity, water, internet & fiber</span>
                    </div>
                </div>

                {/* 4. TODAY'S DISBURSEMENTS */}
                <div className="kpi-card today-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap icon-today">
                            <Calendar size={22} />
                        </div>
                        <span className="kpi-pill">Disbursed Today</span>
                    </div>
                    <div className="kpi-body">
                        <span className="kpi-title">Today's Disbursements</span>
                        <h2 className="kpi-value">{money(dashboard?.todayExpenses ?? todayExpenses)}</h2>
                    </div>
                    <div className="kpi-footer">
                        <span>
                            {dashboard?.todayRecords ??
                                expenses.filter((e) => dateInput(e.expenseDate) === getToday()).length}{" "}
                            vouchers today
                        </span>
                    </div>
                </div>

                {/* 5. THIS MONTH'S EXPENDITURES */}
                <div className="kpi-card month-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap icon-month">
                            <DollarSign size={22} />
                        </div>
                        <span className="kpi-pill">Current Cycle</span>
                    </div>
                    <div className="kpi-body">
                        <span className="kpi-title">This Month's Outflows</span>
                        <h2 className="kpi-value">{money(dashboard?.monthlyExpenses ?? monthlyExpenses)}</h2>
                    </div>
                    <div className="kpi-footer">
                        <span>{dashboard?.monthlyRecords ?? "Active"} monthly allocations</span>
                    </div>
                </div>
            </section>

            {/* =================================================
                ACADEMIC EXPENSE BREAKDOWN
            ================================================= */}
            <section className="academic-breakdown-card">
                <div className="card-header-clean">
                    <div className="title-with-badge">
                        <Building2 size={20} className="header-icon" />
                        <div>
                            <h3>Operational Expense Streams</h3>
                            <p>
                                Outflow distribution across payroll, utilities, laboratory equipment, and maintenance.
                                Click any stream to filter vouchers.
                            </p>
                        </div>
                    </div>
                    {categoryFilter !== "ALL" && (
                        <button className="clear-filter-pill" onClick={() => setCategoryFilter("ALL")}>
                            Showing {categoryFilter} • Click to clear
                        </button>
                    )}
                </div>

                <div className="breakdown-pills-grid">
                    {categoryTotals.length ? (
                        categoryTotals.map((item) => {
                            const isSelected =
                                categoryFilter.toUpperCase() === item.category.toUpperCase();
                            const share =
                                totalExpenses > 0
                                    ? Math.round((item.total / totalExpenses) * 100)
                                    : 0;

                            return (
                                <button
                                    key={item.category}
                                    type="button"
                                    className={`stream-pill-item ${isSelected ? "stream-pill-selected" : ""}`}
                                    onClick={() =>
                                        setCategoryFilter(
                                            isSelected ? "ALL" : item.category
                                        )
                                    }
                                >
                                    <div className="stream-pill-top">
                                        <span className="stream-name">{item.category}</span>
                                        <span className="stream-share">{share}%</span>
                                    </div>
                                    <div className="stream-pill-amount">{money(item.total)}</div>
                                    <div className="stream-progress-track">
                                        <div
                                            className="stream-progress-bar expense-bar"
                                            style={{ width: `${Math.max(5, share)}%` }}
                                        />
                                    </div>
                                    <div className="stream-pill-count">{item.records} vouchers</div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="empty-breakdown-box">
                            <Building2 size={24} />
                            <span>No operational expenses recorded yet. Record your first school disbursement voucher.</span>
                        </div>
                    )}
                </div>
            </section>

            {/* =================================================
                DISBURSEMENTS & EXPENSE RECORDS TABLE
            ================================================= */}
            <section className="expense-records-panel">
                <div className="panel-top-row">
                    <div className="panel-title-area">
                        <h2>Disbursement Vouchers & Audit Log</h2>
                        <span className="receipts-count-badge">
                            {filteredExpenses.length} of {expenses.length} Records
                        </span>
                        <span className="receipts-total-badge">
                            Filtered Total: <strong>{money(filteredTotal)}</strong>
                        </span>
                    </div>
                </div>

                {/* FILTERS TOOLBAR */}
                <div className="filters-toolbar">
                    <div className="search-input-wrapper">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search DV #, description, payee, cashier..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className="clear-search-btn" onClick={() => setSearch("")}>
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="filter-select-wrapper">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="ALL">All Expense Streams</option>
                            {SCHOOL_EXPENSE_CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-select-wrapper">
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                        >
                            <option value="ALL">All Payment Methods</option>
                            {PAYMENT_METHODS.map((pm) => (
                                <option key={pm.value} value={pm.value}>
                                    {pm.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="date-filter-wrapper">
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            title="Filter by transaction date"
                        />
                    </div>

                    {(search ||
                        categoryFilter !== "ALL" ||
                        paymentFilter !== "ALL" ||
                        dateFilter) && (
                        <button className="btn-clear-filters" onClick={clearFilters}>
                            <X size={14} />
                            <span>Reset Filters</span>
                        </button>
                    )}
                </div>

                {/* TABLE */}
                <div className="table-responsive-container">
                    <table className="school-expenses-table">
                        <thead>
                            <tr>
                                <th>Disbursement Voucher #</th>
                                <th>Date</th>
                                <th>Expense Category</th>
                                <th>Particulars / Description</th>
                                <th className="text-right">Amount</th>
                                <th>Payment Method</th>
                                <th>Recorded By</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="empty-state-cell">
                                        <div className="loading-state-wrapper">
                                            <div className="spinner-orbit" />
                                            <span>Loading official disbursement vouchers...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="empty-state-cell">
                                        <div className="empty-receipts-state">
                                            <Receipt size={40} strokeWidth={1.5} />
                                            <h3>No expense records found</h3>
                                            <p>
                                                {search ||
                                                categoryFilter !== "ALL" ||
                                                paymentFilter !== "ALL" ||
                                                dateFilter
                                                    ? "No disbursements match your filter criteria. Try clearing filters."
                                                    : "Start tracking campus operations by recording your first expense voucher."}
                                            </p>
                                            {search ||
                                            categoryFilter !== "ALL" ||
                                            paymentFilter !== "ALL" ||
                                            dateFilter ? (
                                                <button
                                                    className="btn btn-secondary-outline btn-sm"
                                                    onClick={clearFilters}
                                                >
                                                    Clear Filters
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={openAddModal}
                                                >
                                                    ＋ Record First Expense
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map((expense) => {
                                    const catInfo = getExpenseCategoryDisplay(expense.category);

                                    return (
                                        <tr key={expense.expenseId} className="expense-row">
                                            <td className="receipt-col">
                                                <span className="dv-badge">
                                                    {expense.referenceNumber || `DV-${expense.expenseId}`}
                                                </span>
                                            </td>

                                            <td className="date-col">
                                                <div className="date-primary">
                                                    {dateOnly(expense.expenseDate)}
                                                </div>
                                            </td>

                                            <td className="category-col">
                                                <span className={`academic-badge ${catInfo.badgeClass}`}>
                                                    {catInfo.label}
                                                </span>
                                            </td>

                                            <td className="desc-col">
                                                <div className="desc-title">
                                                    {expense.description || "Operational Disbursement"}
                                                </div>
                                            </td>

                                            <td className="amount-col text-right">
                                                <span className="amount-expense">
                                                    {money(expense.amount)}
                                                </span>
                                            </td>

                                            <td className="payment-col">
                                                <span className="payment-pill">
                                                    <CreditCard size={12} />
                                                    <span>{expense.paymentMethod || "CASH"}</span>
                                                </span>
                                            </td>

                                            <td className="staff-col">
                                                <span className="staff-tag">
                                                    {expense.recordedBy || "Cashier"}
                                                </span>
                                            </td>

                                            <td className="actions-col text-center">
                                                <div className="action-buttons-wrap">
                                                    <button
                                                        type="button"
                                                        className="btn-action-icon btn-print"
                                                        title="View & Print Disbursement Voucher"
                                                        onClick={() => setPrintingRecord(expense)}
                                                    >
                                                        <Printer size={15} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn-action-icon btn-edit"
                                                        title="Edit Expense Record"
                                                        onClick={() => openEditModal(expense)}
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn-action-icon btn-delete"
                                                        title="Delete Expense Record"
                                                        onClick={() => void deleteExpense(expense)}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* =================================================
                RECORD / EDIT EXPENSE MODAL
            ================================================= */}
            {showModal && (
                <div
                    className="modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeModal();
                    }}
                >
                    <div className="expense-modal-window">
                        <div className="modal-top-bar">
                            <div className="modal-heading-wrap">
                                <div className="modal-icon-badge icon-badge-expense">
                                    <TrendingDown size={22} />
                                </div>
                                <div>
                                    <h2>
                                        {editingId !== null
                                            ? "Edit Disbursement Voucher"
                                            : "Record School Operational Expense"}
                                    </h2>
                                    <p>
                                        Log faculty payroll, utilities, supplies, maintenance, and official school
                                        disbursements.
                                    </p>
                                </div>
                            </div>

                            <button className="modal-close-btn" onClick={closeModal} disabled={saving}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* QUICK PRESET CHIPS (ONLY ON ADD) */}
                        {editingId === null && (
                            <div className="quick-presets-section">
                                <div className="quick-presets-label">
                                    <Sparkles size={14} />
                                    <span>Quick Suggestions (Click to auto-fill)</span>
                                </div>
                                <div className="quick-presets-scroll">
                                    {QUICK_FILL_PRESETS.map((p) => (
                                        <button
                                            key={p.name}
                                            type="button"
                                            className="preset-chip"
                                            onClick={() => applyQuickPreset(p)}
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form className="modal-form-body" onSubmit={saveExpense}>
                            <div className="modal-form-grid">
                                {/* CATEGORY */}
                                <div className="input-group">
                                    <label>Expense Category / Allocation *</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, category: e.target.value }))
                                        }
                                        disabled={saving}
                                    >
                                        {SCHOOL_EXPENSE_CATEGORIES.map((cat) => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label} — {cat.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* AMOUNT */}
                                <div className="input-group">
                                    <label>Disbursement Amount (PHP ₱) *</label>
                                    <div className="input-with-currency">
                                        <span className="currency-symbol">₱</span>
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={form.amount}
                                            onChange={(e) =>
                                                setForm((prev) => ({ ...prev, amount: e.target.value }))
                                            }
                                            disabled={saving}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* DESCRIPTION */}
                                <div className="input-group full-width-group">
                                    <label>Particulars / Payee / Description *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Meralco Electric Bill - Main High School Building"
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, description: e.target.value }))
                                        }
                                        disabled={saving}
                                        required
                                    />
                                    <small className="field-hint">
                                        Specify the purpose, vendor name, invoice reference, or recipient.
                                    </small>
                                </div>

                                {/* DATE */}
                                <div className="input-group">
                                    <label>Transaction / Disbursement Date *</label>
                                    <input
                                        type="date"
                                        value={form.expenseDate}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, expenseDate: e.target.value }))
                                        }
                                        disabled={saving}
                                        required
                                    />
                                </div>

                                {/* PAYMENT METHOD */}
                                <div className="input-group">
                                    <label>Payment Method *</label>
                                    <select
                                        value={form.paymentMethod}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                paymentMethod: e.target.value,
                                            }))
                                        }
                                        disabled={saving}
                                    >
                                        {PAYMENT_METHODS.map((pm) => (
                                            <option key={pm.value} value={pm.value}>
                                                {pm.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* DISBURSEMENT VOUCHER NUMBER */}
                                <div className="input-group full-width-group">
                                    <div className="label-with-tool">
                                        <label>Disbursement Voucher (DV) / Check Number</label>
                                        <button
                                            type="button"
                                            className="btn-text-action"
                                            onClick={() =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    referenceNumber: generateVoucherNumber(),
                                                }))
                                            }
                                        >
                                            Generate DV #
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="e.g. DV-2026-582910 or Check #001248"
                                        value={form.referenceNumber}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                referenceNumber: e.target.value,
                                            }))
                                        }
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            <div className="modal-bottom-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <RefreshCw size={16} className="spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : editingId !== null ? (
                                        "Update Disbursement"
                                    ) : (
                                        "Save & Issue Voucher"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =================================================
                PRINTABLE OFFICIAL DISBURSEMENT VOUCHER MODAL
            ================================================= */}
            {printingRecord && (
                <div
                    className="modal-overlay receipt-modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setPrintingRecord(null);
                    }}
                >
                    <div className="official-receipt-dialog">
                        <div className="receipt-actions-header voucher-actions-header">
                            <span className="receipt-view-title">Official School Disbursement Voucher</span>
                            <div className="receipt-btn-group">
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => window.print()}
                                >
                                    <Printer size={15} />
                                    <span>Print Voucher</span>
                                </button>
                                <button
                                    type="button"
                                    className="modal-close-btn"
                                    onClick={() => setPrintingRecord(null)}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* PRINTABLE VOUCHER CONTAINER */}
                        <div className="printable-receipt-sheet" id="printable-disbursement-voucher">
                            <div className="school-receipt-head voucher-head">
                                <div className="school-brand-title">MBS PORTAL ACADEMY</div>
                                <div className="school-brand-sub">
                                    Finance, Accounting & Operational Disbursements Department
                                </div>
                                <div className="receipt-doc-tag voucher-doc-tag">DISBURSEMENT VOUCHER</div>
                            </div>

                            <div className="receipt-meta-grid">
                                <div className="meta-item">
                                    <span className="meta-label">Disbursement Voucher #:</span>
                                    <strong className="meta-val dv-text">
                                        {printingRecord.referenceNumber || `DV-${printingRecord.expenseId}`}
                                    </strong>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Transaction Date:</span>
                                    <strong className="meta-val">
                                        {dateOnly(printingRecord.expenseDate)}
                                    </strong>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Payment Channel:</span>
                                    <strong className="meta-val">{printingRecord.paymentMethod || "CASH"}</strong>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Disbursing Officer:</span>
                                    <strong className="meta-val">{printingRecord.recordedBy || "SYSTEM"}</strong>
                                </div>
                            </div>

                            <div className="receipt-table-box">
                                <table className="receipt-items-table">
                                    <thead>
                                        <tr>
                                            <th>Account / Allocation</th>
                                            <th>Particulars / Payee / Description</th>
                                            <th className="text-right">Amount Disbursed</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <strong>
                                                    {getExpenseCategoryDisplay(printingRecord.category).label}
                                                </strong>
                                            </td>
                                            <td>{printingRecord.description || "Operational expenditure"}</td>
                                            <td className="text-right font-bold amount-expense-text">
                                                {money(printingRecord.amount)}
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={2} className="text-right total-label">
                                                TOTAL DISBURSED AMOUNT:
                                            </td>
                                            <td className="text-right total-val expense-total-val">
                                                {money(printingRecord.amount)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="voucher-signatures-grid">
                                <div className="sig-block">
                                    <div className="sig-line" />
                                    <span>Prepared By (Bookkeeper)</span>
                                </div>
                                <div className="sig-block">
                                    <div className="sig-line" />
                                    <span>Certified Correct (Accountant)</span>
                                </div>
                                <div className="sig-block">
                                    <div className="sig-line" />
                                    <span>Approved for Payment (Director)</span>
                                </div>
                                <div className="sig-block">
                                    <div className="sig-line" />
                                    <span>Received By (Payee Signature)</span>
                                </div>
                            </div>

                            <div className="receipt-footer-notice">
                                This official disbursement voucher authorizes the payment from MBS School Funds. An
                                official invoice, billing statement, or receipt is attached as supporting documentation.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
