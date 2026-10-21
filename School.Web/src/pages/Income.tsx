import { useCallback, useEffect, useMemo, useState } from "react";
import "./Income.css";
import { apiClient } from "../api/apiClient";
import {
    DollarSign,
    TrendingUp,
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
    GraduationCap,
    BookOpen,
    Sparkles,
    Landmark,
    Receipt,
} from "lucide-react";

/* =========================================================
   ACADEMIC INCOME CATEGORIES & PAYMENT METHODS
========================================================= */

export const SCHOOL_INCOME_CATEGORIES = [
    {
        value: "TUITION FEE",
        label: "Tuition Fees",
        description: "Semester, monthly, and unit-based student tuition payments",
        badgeClass: "badge-tuition",
    },
    {
        value: "REGISTRATION & MISCELLANEOUS",
        label: "Registration & Misc Fees",
        description: "Matriculation, student ID, handbook, and enrollment fees",
        badgeClass: "badge-registration",
    },
    {
        value: "LABORATORY & COMPUTER FEES",
        label: "Laboratory & Tech Fees",
        description: "Science lab, computer lab, internet, and tech fees",
        badgeClass: "badge-lab",
    },
    {
        value: "BOOKS & LEARNING MODULES",
        label: "Books & Learning Modules",
        description: "Textbooks, workbooks, printed modules, and digital materials",
        badgeClass: "badge-books",
    },
    {
        value: "UNIFORM & MERCHANDISE",
        label: "Uniform & School Supplies",
        description: "School uniforms, PE attire, student badges, and supplies",
        badgeClass: "badge-uniform",
    },
    {
        value: "GRADUATION & CREDENTIALS",
        label: "Graduation & Credentials",
        description: "Graduation fee, diploma, Transcript of Records (TOR), certificates",
        badgeClass: "badge-graduation",
    },
    {
        value: "GOVERNMENT SUBSIDIES & GRANTS",
        label: "Grants & Subsidies",
        description: "DepEd ESC, CHED UniFAST, institutional subsidies, research grants",
        badgeClass: "badge-grants",
    },
    {
        value: "FACILITY & CANTEEN RENTAL",
        label: "Canteen & Facility Rentals",
        description: "School canteen concessionaire, gym, auditorium, and facility lease",
        badgeClass: "badge-facility",
    },
    {
        value: "EXAM & ENTRANCE FEES",
        label: "Exam & Entrance Fees",
        description: "College entrance exam, entrance tests, diagnostic, and re-exams",
        badgeClass: "badge-exam",
    },
    {
        value: "OTHER ACADEMIC REVENUE",
        label: "Other School Revenue",
        description: "Late registration surcharges, clinic fees, and miscellaneous receipts",
        badgeClass: "badge-other",
    },
] as const;

export const PAYMENT_METHODS = [
    { value: "CASH", label: "Cash (Cashier Counter)" },
    { value: "GCASH", label: "GCash" },
    { value: "MAYA", label: "Maya / PayMaya" },
    { value: "BANK TRANSFER", label: "Bank Transfer / Deposit" },
    { value: "CHECK", label: "Manager's Check / Bank Check" },
    { value: "ONLINE GATEWAY", label: "Online Payment Gateway" },
    { value: "GOVERNMENT VOUCHER", label: "Govt Voucher / ESC Subsidy" },
    { value: "OTHER", label: "Other Payment Method" },
] as const;

/* =========================================================
   QUICK FILL PRESETS FOR SCHOOL CASHIERS
========================================================= */

const QUICK_FILL_PRESETS = [
    {
        name: "Semester Tuition Installment",
        category: "TUITION FEE",
        description: "AY 2025-2026 - 1st Semester Tuition Installment",
        amount: "12500",
        paymentMethod: "CASH",
    },
    {
        name: "Enrollment & Registration Fee",
        category: "REGISTRATION & MISCELLANEOUS",
        description: "Admission, Matriculation, Student ID & Handbook Fee",
        amount: "3500",
        paymentMethod: "CASH",
    },
    {
        name: "Computer & Science Lab Fee",
        category: "LABORATORY & COMPUTER FEES",
        description: "High-Speed Internet, Computer & Science Lab Maintenance Fee",
        amount: "2200",
        paymentMethod: "GCASH",
    },
    {
        name: "Learning Modules Package",
        category: "BOOKS & LEARNING MODULES",
        description: "Complete Grade Level Textbooks & Learning Modules Pack",
        amount: "4500",
        paymentMethod: "CASH",
    },
    {
        name: "School Uniform & ID",
        category: "UNIFORM & MERCHANDISE",
        description: "Standard Uniform Set, PE Attire & Student RFID ID Card",
        amount: "1850",
        paymentMethod: "CASH",
    },
    {
        name: "Transcript of Records (TOR)",
        category: "GRADUATION & CREDENTIALS",
        description: "Issuance of Official Transcript of Records (TOR) & Clearances",
        amount: "450",
        paymentMethod: "CASH",
    },
    {
        name: "DepEd ESC Voucher Subsidy",
        category: "GOVERNMENT SUBSIDIES & GRANTS",
        description: "Educational Service Contracting (ESC) Student Subsidy Voucher",
        amount: "9000",
        paymentMethod: "GOVERNMENT VOUCHER",
    },
    {
        name: "Canteen Stall Monthly Rental",
        category: "FACILITY & CANTEEN RENTAL",
        description: "School Canteen Stall Rental & Utility Share (Monthly)",
        amount: "6000",
        paymentMethod: "BANK TRANSFER",
    },
];

/* =========================================================
   TYPES
========================================================= */

export type IncomeRecord = {
    incomeId: number;
    category: string;
    description: string;
    amount: number;
    incomeDate: string;
    paymentMethod: string;
    referenceNumber: string;
    recordedBy: string;
    recordedDate: string;
};

export type CategoryBreakdown = {
    category: string;
    total: number;
    records: number;
};

export type Dashboard = {
    totalIncome: number;
    todayIncome: number;
    monthlyIncome: number;

    totalRecords: number;
    todayRecords: number;
    monthlyRecords: number;

    categoryBreakdown: CategoryBreakdown[];

    totalExpenses: number;
    todayExpenses: number;
    monthlyExpenses: number;

    totalExpenseRecords: number;
    todayExpenseRecords: number;
    monthlyExpenseRecords: number;

    netSchoolFunds: number;
    todayNetFunds: number;
    monthlyNetFunds: number;
};

export type FormData = {
    category: string;
    description: string;
    amount: string;
    incomeDate: string;
    paymentMethod: string;
    referenceNumber: string;
    payerName?: string;
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

function generateReceiptNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `OR-${year}-${random}`;
}

function createEmptyForm(): FormData {
    return {
        category: "TUITION FEE",
        description: "",
        amount: "",
        incomeDate: getToday(),
        paymentMethod: "CASH",
        referenceNumber: generateReceiptNumber(),
        payerName: "",
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
export function getCategoryDisplay(rawCategory: string | null | undefined): {
    label: string;
    badgeClass: string;
} {
    const norm = String(rawCategory || "")
        .trim()
        .toUpperCase();

    if (
        norm === "SUNDAY WORSHIP TOTAL INCOME" ||
        norm === "TITHES" ||
        norm === "OFFERING" ||
        norm === "THANKSGIVING"
    ) {
        return { label: "General School Collections", badgeClass: "badge-tuition" };
    }
    if (norm === "DONATION" || norm === "BUILDING FUND") {
        return { label: "Grants & Endowments", badgeClass: "badge-grants" };
    }
    if (norm === "EVENT") {
        return { label: "School Events & Activities", badgeClass: "badge-exam" };
    }
    if (norm === "RENTAL") {
        return { label: "Canteen & Facility Rentals", badgeClass: "badge-facility" };
    }
    if (norm === "BOOKS") {
        return { label: "Books & Learning Modules", badgeClass: "badge-books" };
    }
    if (norm === "MERCHANDISE") {
        return { label: "Uniform & School Supplies", badgeClass: "badge-uniform" };
    }
    if (norm === "REGISTRATION") {
        return { label: "Registration & Misc Fees", badgeClass: "badge-registration" };
    }

    const matched = SCHOOL_INCOME_CATEGORIES.find((c) => c.value === norm);
    if (matched) {
        return { label: matched.label, badgeClass: matched.badgeClass };
    }

    return { label: norm || "Other School Revenue", badgeClass: "badge-other" };
}

function normalizeIncomeRecord(record: any): IncomeRecord {
    return {
        incomeId: Number(record?.incomeId ?? record?.IncomeId ?? 0),
        category: String(record?.category ?? record?.Category ?? "OTHER ACADEMIC REVENUE")
            .trim()
            .toUpperCase(),
        description: String(record?.description ?? record?.Description ?? ""),
        amount: Number(record?.amount ?? record?.Amount ?? 0),
        incomeDate: String(record?.incomeDate ?? record?.IncomeDate ?? ""),
        paymentMethod: String(record?.paymentMethod ?? record?.PaymentMethod ?? "CASH")
            .trim()
            .toUpperCase(),
        referenceNumber: String(record?.referenceNumber ?? record?.ReferenceNumber ?? ""),
        recordedBy: String(record?.recordedBy ?? record?.RecordedBy ?? "SYSTEM"),
        recordedDate: String(record?.recordedDate ?? record?.RecordedDate ?? ""),
    };
}

function extractArray<T>(data: any, keys: string[] = []): T[] {
    if (Array.isArray(data)) return data;
    for (const key of keys) {
        if (Array.isArray(data?.[key])) return data[key];
    }
    return [];
}

function normalizeCategoryBreakdown(breakdown: any): CategoryBreakdown[] {
    const list = extractArray<any>(breakdown, [
        "categoryBreakdown",
        "incomeCategoryBreakdown",
        "categories",
        "data",
        "items",
    ]);

    if (!list.length) return [];

    const categoryMap = new Map<string, { total: number; records: number }>();

    list.forEach((item) => {
        const rawCategory = String(item?.category ?? item?.Category ?? "OTHER").trim().toUpperCase();
        const category = getCategoryDisplay(rawCategory).label;
        const total = Number(item?.total ?? item?.Total ?? 0);
        const records = Number(item?.records ?? item?.Records ?? item?.count ?? item?.Count ?? 0);

        const current = categoryMap.get(category) || { total: 0, records: 0 };
        categoryMap.set(category, {
            total: current.total + total,
            records: current.records + records,
        });
    });

    return Array.from(categoryMap.entries())
        .map(([category, values]) => ({
            category,
            total: values.total,
            records: values.records,
        }))
        .sort((a, b) => b.total - a.total);
}

function normalizeDashboard(data: any): Dashboard {
    const financialPosition = data?.financialPosition || {};
    const expenses = data?.expenses || {};

    const totalIncome = Number(
        data?.totalIncome ??
        data?.TotalIncome ??
        financialPosition?.totalIncome ??
        financialPosition?.TotalIncome ??
        0
    );

    const totalExpenses = Number(
        data?.totalExpenses ??
        data?.TotalExpenses ??
        financialPosition?.totalExpenses ??
        financialPosition?.TotalExpenses ??
        expenses?.totalExpenses ??
        expenses?.TotalExpenses ??
        0
    );

    const netSchoolFunds = Number(
        data?.netSchoolFunds ??
        data?.NetSchoolFunds ??
        data?.netOperatingIncome ??
        data?.NetOperatingIncome ??
        data?.netChurchFunds ??
        data?.NetChurchFunds ??
        financialPosition?.netSchoolFunds ??
        financialPosition?.netChurchFunds ??
        totalIncome - totalExpenses
    );

    return {
        totalIncome,
        todayIncome: Number(data?.todayIncome ?? data?.TodayIncome ?? 0),
        monthlyIncome: Number(data?.monthlyIncome ?? data?.MonthlyIncome ?? 0),
        totalRecords: Number(data?.totalRecords ?? data?.TotalRecords ?? 0),
        todayRecords: Number(data?.todayRecords ?? data?.TodayRecords ?? 0),
        monthlyRecords: Number(data?.monthlyRecords ?? data?.MonthlyRecords ?? 0),
        categoryBreakdown: normalizeCategoryBreakdown(
            data?.categoryBreakdown ?? data?.incomeCategoryBreakdown ?? []
        ),
        totalExpenses,
        todayExpenses: Number(data?.todayExpenses ?? data?.TodayExpenses ?? 0),
        monthlyExpenses: Number(data?.monthlyExpenses ?? data?.MonthlyExpenses ?? 0),
        totalExpenseRecords: Number(
            data?.totalExpenseRecords ?? data?.TotalExpenseRecords ?? expenses?.totalRecords ?? 0
        ),
        todayExpenseRecords: Number(data?.todayExpenseRecords ?? data?.TodayExpenseRecords ?? 0),
        monthlyExpenseRecords: Number(data?.monthlyExpenseRecords ?? data?.MonthlyExpenseRecords ?? 0),
        netSchoolFunds,
        todayNetFunds: Number(data?.todayNetFunds ?? data?.TodayNetFunds ?? 0),
        monthlyNetFunds: Number(data?.monthlyNetFunds ?? data?.MonthlyNetFunds ?? 0),
    };
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Income() {
    const [dashboard, setDashboard] = useState<Dashboard | null>(null);
    const [records, setRecords] = useState<IncomeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [printingRecord, setPrintingRecord] = useState<IncomeRecord | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [paymentFilter, setPaymentFilter] = useState("ALL");
    const [dateFilter, setDateFilter] = useState("");

    // Form
    const [form, setForm] = useState<FormData>(createEmptyForm());

    /* =====================================================
       LOAD DASHBOARD & RECORDS
    ===================================================== */

    const loadDashboard = useCallback(async () => {
        const response = await apiClient("/Income/dashboard");
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data?.message || data?.error || "Unable to load revenue dashboard.");
        }
        setDashboard(normalizeDashboard(data));
    }, []);

    const loadRecords = useCallback(async () => {
        const response = await apiClient("/Income");
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data?.message || data?.error || "Unable to load income records.");
        }
        const list = extractArray<any>(data, ["records", "income", "incomes", "data", "items"]);
        setRecords(list.map(normalizeIncomeRecord));
    }, []);

    const loadAll = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            await Promise.all([loadDashboard(), loadRecords()]);
        } catch (err) {
            console.error("INCOME LOAD ERROR:", err);
            setError(err instanceof Error ? err.message : "Unable to load school income data.");
        } finally {
            setLoading(false);
        }
    }, [loadDashboard, loadRecords]);

    useEffect(() => {
        void loadAll();
    }, [loadAll]);

    // Auto-refresh dashboard every 60 seconds
    useEffect(() => {
        const interval = window.setInterval(() => {
            void loadDashboard();
        }, 60000);
        return () => window.clearInterval(interval);
    }, [loadDashboard]);

    /* =====================================================
       FILTERED RECORDS
    ===================================================== */

    const filteredRecords = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return records.filter((record) => {
            const catDisplay = getCategoryDisplay(record.category).label.toLowerCase();
            const rawCat = record.category.toLowerCase();
            const description = (record.description || "").toLowerCase();
            const payment = (record.paymentMethod || "").toLowerCase();
            const reference = (record.referenceNumber || "").toLowerCase();
            const recordedBy = (record.recordedBy || "").toLowerCase();

            const matchesSearch =
                !searchValue ||
                catDisplay.includes(searchValue) ||
                rawCat.includes(searchValue) ||
                description.includes(searchValue) ||
                payment.includes(searchValue) ||
                reference.includes(searchValue) ||
                recordedBy.includes(searchValue);

            const matchesCategory =
                categoryFilter === "ALL" ||
                record.category === categoryFilter ||
                catDisplay.toUpperCase() === categoryFilter.toUpperCase();

            const matchesPayment =
                paymentFilter === "ALL" || record.paymentMethod === paymentFilter;

            const matchesDate =
                !dateFilter || dateInput(record.incomeDate) === dateFilter;

            return matchesSearch && matchesCategory && matchesPayment && matchesDate;
        });
    }, [records, search, categoryFilter, paymentFilter, dateFilter]);

    const filteredTotal = useMemo(() => {
        return filteredRecords.reduce((total, r) => total + Number(r.amount || 0), 0);
    }, [filteredRecords]);

    /* =====================================================
       FINANCIAL TOTALS
    ===================================================== */

    const totalIncome = dashboard?.totalIncome || 0;
    const totalExpenses = dashboard?.totalExpenses || 0;
    const netSchoolFunds = dashboard?.netSchoolFunds ?? totalIncome - totalExpenses;
    const netMarginPercent =
        totalIncome > 0 ? Math.round((netSchoolFunds / totalIncome) * 100) : 0;

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

    function openEditModal(record: IncomeRecord) {
        setEditingId(record.incomeId);
        setForm({
            category: record.category,
            description: record.description || "",
            amount: String(record.amount ?? ""),
            incomeDate: dateInput(record.incomeDate),
            paymentMethod: record.paymentMethod || "CASH",
            referenceNumber: record.referenceNumber || generateReceiptNumber(),
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
            referenceNumber: prev.referenceNumber || generateReceiptNumber(),
        }));
    }

    /* =====================================================
       SAVE INCOME (CREATE / UPDATE)
    ===================================================== */

    async function saveIncome() {
        setError("");
        setSuccess("");

        const amount = Number(form.amount);

        if (!form.category) {
            setError("Please select an income category.");
            return;
        }

        if (!form.description.trim()) {
            setError("Please provide a description of the income receipt.");
            return;
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            setError("Please enter a valid amount greater than ₱0.00.");
            return;
        }

        if (!form.incomeDate) {
            setError("Please select an official income date.");
            return;
        }

        setSaving(true);

        try {
            const payload = {
                category: form.category.trim().toUpperCase(),
                description: form.description.trim(),
                amount,
                incomeDate: form.incomeDate,
                paymentMethod: form.paymentMethod.trim().toUpperCase(),
                referenceNumber: form.referenceNumber.trim() || generateReceiptNumber(),
            };

            const endpoint = editingId !== null ? `/Income/${editingId}` : "/Income";
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
                    ? "School income receipt updated successfully."
                    : "School revenue recorded and receipt issued successfully."
            );

            setShowModal(false);
            setEditingId(null);
            setForm(createEmptyForm());

            await Promise.all([loadDashboard(), loadRecords()]);
        } catch (err) {
            console.error("SAVE INCOME ERROR:", err);
            setError(err instanceof Error ? err.message : "Unable to save school income receipt.");
        } finally {
            setSaving(false);
        }
    }

    /* =====================================================
       DELETE INCOME
    ===================================================== */

    async function deleteIncome(id: number) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this school income receipt? This action will adjust all revenue reports."
        );
        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            const response = await apiClient(`/Income/${id}`, { method: "DELETE" });
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to delete income receipt.");
            }

            setSuccess("Income receipt deleted successfully.");
            await Promise.all([loadDashboard(), loadRecords()]);
        } catch (err) {
            console.error("DELETE INCOME ERROR:", err);
            setError(err instanceof Error ? err.message : "Unable to delete income receipt.");
        }
    }

    /* =====================================================
       EXPORT TO CSV
    ===================================================== */

    function exportToCsv() {
        if (!filteredRecords.length) {
            alert("No income records available to export.");
            return;
        }

        const headers = [
            "Official Receipt #",
            "Date",
            "Category",
            "Description",
            "Amount (PHP)",
            "Payment Method",
            "Recorded By",
        ];

        const rows = filteredRecords.map((r) => [
            `"${r.referenceNumber || "—"}"`,
            `"${dateInput(r.incomeDate)}"`,
            `"${getCategoryDisplay(r.category).label}"`,
            `"${(r.description || "").replace(/"/g, '""')}"`,
            `"${r.amount.toFixed(2)}"`,
            `"${r.paymentMethod || "CASH"}"`,
            `"${r.recordedBy || "SYSTEM"}"`,
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `School_Income_Report_${getToday()}.csv`);
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
        <div className="school-income-page">
            {/* =================================================
                TOP HEADER
            ================================================= */}
            <header className="income-page-header">
                <div className="header-text-block">
                    <div className="header-badge">
                        <Landmark size={15} />
                        <span>Institutional Financial Management</span>
                    </div>
                    <h1>School Income & Revenue</h1>
                    <p>
                        Track student matriculation & tuition receipts, lab/library fees, government grants, and
                        school institutional revenue.
                    </p>
                </div>

                <div className="header-action-group">
                    <button
                        className="btn btn-secondary-outline"
                        onClick={exportToCsv}
                        disabled={loading || !records.length}
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
                        <span>Record Income</span>
                    </button>
                </div>
            </header>

            {/* =================================================
                ALERTS
            ================================================= */}
            {error && (
                <div className="income-banner banner-error">
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
                <div className="income-banner banner-success">
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
                {/* 1. TOTAL SCHOOL REVENUE */}
                <div className="kpi-card revenue-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap icon-revenue">
                            <TrendingUp size={22} />
                        </div>
                        <span className="kpi-pill">All-Time Revenue</span>
                    </div>
                    <div className="kpi-body">
                        <span className="kpi-title">Total School Revenue</span>
                        <h2 className="kpi-value">{money(totalIncome)}</h2>
                    </div>
                    <div className="kpi-footer">
                        <Receipt size={14} />
                        <span>{dashboard?.totalRecords || 0} Official Receipts Issued</span>
                    </div>
                </div>

                {/* 2. TOTAL OPERATING EXPENSES */}
                <div className="kpi-card expenses-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap icon-expense">
                            <TrendingDown size={22} />
                        </div>
                        <span className="kpi-pill">Total Outflow</span>
                    </div>
                    <div className="kpi-body">
                        <span className="kpi-title">School Operating Expenses</span>
                        <h2 className="kpi-value">{money(totalExpenses)}</h2>
                    </div>
                    <div className="kpi-footer">
                        <span>{dashboard?.totalExpenseRecords || 0} Expense Entries</span>
                    </div>
                </div>

                {/* 3. NET OPERATING INCOME */}
                <div className="kpi-card net-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap icon-net">
                            <DollarSign size={22} />
                        </div>
                        <span className={`kpi-pill ${netSchoolFunds >= 0 ? "pill-positive" : "pill-negative"}`}>
                            {netSchoolFunds >= 0 ? `+${netMarginPercent}% Net Margin` : "Deficit"}
                        </span>
                    </div>
                    <div className="kpi-body">
                        <span className="kpi-title">Net Institutional Revenue</span>
                        <h2 className={`kpi-value ${netSchoolFunds < 0 ? "negative-val" : "positive-val"}`}>
                            {money(netSchoolFunds)}
                        </h2>
                    </div>
                    <div className="kpi-footer">
                        <span>Revenue minus Expenses balance</span>
                    </div>
                </div>

                {/* 4. TODAY'S COLLECTIONS */}
                <div className="kpi-card cashier-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap icon-today">
                            <Calendar size={22} />
                        </div>
                        <span className="kpi-pill">Cashier Today</span>
                    </div>
                    <div className="kpi-body">
                        <span className="kpi-title">Today's Collections</span>
                        <h2 className="kpi-value">{money(dashboard?.todayIncome || 0)}</h2>
                    </div>
                    <div className="kpi-footer">
                        <span>{dashboard?.todayRecords || 0} collections today</span>
                    </div>
                </div>

                {/* 5. THIS MONTH'S REVENUE */}
                <div className="kpi-card month-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap icon-month">
                            <Landmark size={22} />
                        </div>
                        <span className="kpi-pill">Current Cycle</span>
                    </div>
                    <div className="kpi-body">
                        <span className="kpi-title">This Month's Revenue</span>
                        <h2 className="kpi-value">{money(dashboard?.monthlyIncome || 0)}</h2>
                    </div>
                    <div className="kpi-footer">
                        <span>{dashboard?.monthlyRecords || 0} monthly transactions</span>
                    </div>
                </div>
            </section>

            {/* =================================================
                ACADEMIC REVENUE BREAKDOWN
            ================================================= */}
            <section className="academic-breakdown-card">
                <div className="card-header-clean">
                    <div className="title-with-badge">
                        <GraduationCap size={20} className="header-icon" />
                        <div>
                            <h3>Academic Revenue Streams</h3>
                            <p>Income distribution across tuition, miscellaneous fees, and grants. Click any stream to filter receipts.</p>
                        </div>
                    </div>
                    {categoryFilter !== "ALL" && (
                        <button className="clear-filter-pill" onClick={() => setCategoryFilter("ALL")}>
                            Showing {categoryFilter} • Click to clear
                        </button>
                    )}
                </div>

                <div className="breakdown-pills-grid">
                    {dashboard?.categoryBreakdown?.length ? (
                        dashboard.categoryBreakdown.map((item) => {
                            const isSelected =
                                categoryFilter.toUpperCase() === item.category.toUpperCase();
                            const share =
                                totalIncome > 0
                                    ? Math.round((item.total / totalIncome) * 100)
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
                                            className="stream-progress-bar"
                                            style={{ width: `${Math.max(5, share)}%` }}
                                        />
                                    </div>
                                    <div className="stream-pill-count">{item.records} records</div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="empty-breakdown-box">
                            <BookOpen size={24} />
                            <span>No revenue categories recorded yet. Record your first tuition or fee receipt.</span>
                        </div>
                    )}
                </div>
            </section>

            {/* =================================================
                RECEIPTS & INCOME RECORDS TABLE
            ================================================= */}
            <section className="income-records-panel">
                <div className="panel-top-row">
                    <div className="panel-title-area">
                        <h2>Income Receipts & Audit Log</h2>
                        <span className="receipts-count-badge">
                            {filteredRecords.length} of {records.length} Records
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
                            placeholder="Search OR #, student name, description, cashier..."
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
                            <option value="ALL">All Revenue Streams</option>
                            {SCHOOL_INCOME_CATEGORIES.map((cat) => (
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
                            title="Filter by receipt date"
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
                    <table className="school-income-table">
                        <thead>
                            <tr>
                                <th>Official Receipt #</th>
                                <th>Date</th>
                                <th>Revenue Stream</th>
                                <th>Description / Payee</th>
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
                                            <span>Loading official school receipts...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="empty-state-cell">
                                        <div className="empty-receipts-state">
                                            <Receipt size={40} strokeWidth={1.5} />
                                            <h3>No income receipts found</h3>
                                            <p>
                                                {search ||
                                                categoryFilter !== "ALL" ||
                                                paymentFilter !== "ALL" ||
                                                dateFilter
                                                    ? "No transactions match your filter criteria. Try clearing filters."
                                                    : "Start tracking tuition, miscellaneous fees, and grants by recording an income transaction."}
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
                                                    ＋ Record First Income
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => {
                                    const catInfo = getCategoryDisplay(record.category);

                                    return (
                                        <tr key={record.incomeId} className="income-row">
                                            <td className="receipt-col">
                                                <span className="or-badge">
                                                    {record.referenceNumber || `OR-${record.incomeId}`}
                                                </span>
                                            </td>

                                            <td className="date-col">
                                                <div className="date-primary">
                                                    {dateOnly(record.incomeDate)}
                                                </div>
                                            </td>

                                            <td className="category-col">
                                                <span className={`academic-badge ${catInfo.badgeClass}`}>
                                                    {catInfo.label}
                                                </span>
                                            </td>

                                            <td className="desc-col">
                                                <div className="desc-title">
                                                    {record.description || "School Payment Receipt"}
                                                </div>
                                            </td>

                                            <td className="amount-col text-right">
                                                <span className="amount-primary">
                                                    {money(record.amount)}
                                                </span>
                                            </td>

                                            <td className="payment-col">
                                                <span className="payment-pill">
                                                    <CreditCard size={12} />
                                                    <span>{record.paymentMethod || "CASH"}</span>
                                                </span>
                                            </td>

                                            <td className="staff-col">
                                                <span className="staff-tag">
                                                    {record.recordedBy || "Cashier"}
                                                </span>
                                            </td>

                                            <td className="actions-col text-center">
                                                <div className="action-buttons-wrap">
                                                    <button
                                                        type="button"
                                                        className="btn-action-icon btn-print"
                                                        title="View & Print Official Receipt"
                                                        onClick={() => setPrintingRecord(record)}
                                                    >
                                                        <Printer size={15} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn-action-icon btn-edit"
                                                        title="Edit Income Record"
                                                        onClick={() => openEditModal(record)}
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn-action-icon btn-delete"
                                                        title="Delete Income Record"
                                                        onClick={() => deleteIncome(record.incomeId)}
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
                RECORD / EDIT INCOME MODAL
            ================================================= */}
            {showModal && (
                <div
                    className="modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeModal();
                    }}
                >
                    <div className="income-modal-window">
                        <div className="modal-top-bar">
                            <div className="modal-heading-wrap">
                                <div className="modal-icon-badge">
                                    <Receipt size={22} />
                                </div>
                                <div>
                                    <h2>
                                        {editingId !== null
                                            ? "Edit School Income Record"
                                            : "Record School Revenue & Receipt"}
                                    </h2>
                                    <p>
                                        Log student tuition payments, lab fees, subsidies, and official school
                                        collections.
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

                        <div className="modal-form-body">
                            <div className="modal-form-grid">
                                {/* CATEGORY */}
                                <div className="input-group">
                                    <label>Revenue Category / Stream *</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, category: e.target.value }))
                                        }
                                        disabled={saving}
                                    >
                                        {SCHOOL_INCOME_CATEGORIES.map((cat) => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label} — {cat.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* AMOUNT */}
                                <div className="input-group">
                                    <label>Payment Amount (PHP ₱) *</label>
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
                                    <label>Description / Particulars *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 1st Semester Tuition Installment - Grade 11 STEM"
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, description: e.target.value }))
                                        }
                                        disabled={saving}
                                        required
                                    />
                                    <small className="field-hint">
                                        Specify details such as grade level, subject code, or fee description.
                                    </small>
                                </div>

                                {/* DATE */}
                                <div className="input-group">
                                    <label>Official Transaction Date *</label>
                                    <input
                                        type="date"
                                        value={form.incomeDate}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, incomeDate: e.target.value }))
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

                                {/* OFFICIAL RECEIPT NUMBER */}
                                <div className="input-group full-width-group">
                                    <div className="label-with-tool">
                                        <label>Official Receipt (OR) / Reference Number</label>
                                        <button
                                            type="button"
                                            className="btn-text-action"
                                            onClick={() =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    referenceNumber: generateReceiptNumber(),
                                                }))
                                            }
                                        >
                                            Generate OR #
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="e.g. OR-2026-894120"
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

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={saveIncome}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw size={16} className="spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : editingId !== null ? (
                                    "Update Income Record"
                                ) : (
                                    "Save & Issue Receipt"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =================================================
                PRINTABLE OFFICIAL RECEIPT MODAL
            ================================================= */}
            {printingRecord && (
                <div
                    className="modal-overlay receipt-modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setPrintingRecord(null);
                    }}
                >
                    <div className="official-receipt-dialog">
                        <div className="receipt-actions-header">
                            <span className="receipt-view-title">Official School Cash Receipt</span>
                            <div className="receipt-btn-group">
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => window.print()}
                                >
                                    <Printer size={15} />
                                    <span>Print Receipt</span>
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

                        {/* PRINTABLE RECEIPT CONTAINER */}
                        <div className="printable-receipt-sheet" id="printable-official-receipt">
                            <div className="school-receipt-head">
                                <div className="school-brand-title">MBS PORTAL ACADEMY</div>
                                <div className="school-brand-sub">
                                    Official Institutional Revenue & Cashier Department
                                </div>
                                <div className="receipt-doc-tag">OFFICIAL RECEIPT</div>
                            </div>

                            <div className="receipt-meta-grid">
                                <div className="meta-item">
                                    <span className="meta-label">Receipt / OR Number:</span>
                                    <strong className="meta-val or-text">
                                        {printingRecord.referenceNumber || `OR-${printingRecord.incomeId}`}
                                    </strong>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Transaction Date:</span>
                                    <strong className="meta-val">
                                        {dateOnly(printingRecord.incomeDate)}
                                    </strong>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Payment Channel:</span>
                                    <strong className="meta-val">{printingRecord.paymentMethod || "CASH"}</strong>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Cashier / Staff:</span>
                                    <strong className="meta-val">{printingRecord.recordedBy || "SYSTEM"}</strong>
                                </div>
                            </div>

                            <div className="receipt-table-box">
                                <table className="receipt-items-table">
                                    <thead>
                                        <tr>
                                            <th>Stream / Category</th>
                                            <th>Description / Particulars</th>
                                            <th className="text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <strong>
                                                    {getCategoryDisplay(printingRecord.category).label}
                                                </strong>
                                            </td>
                                            <td>{printingRecord.description || "School fee payment"}</td>
                                            <td className="text-right font-bold">
                                                {money(printingRecord.amount)}
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={2} className="text-right total-label">
                                                TOTAL AMOUNT PAID:
                                            </td>
                                            <td className="text-right total-val">
                                                {money(printingRecord.amount)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="receipt-signatures-row">
                                <div className="sig-block">
                                    <div className="sig-line" />
                                    <span>Student / Payee Signature</span>
                                </div>
                                <div className="sig-block">
                                    <div className="sig-line" />
                                    <span>Authorized School Cashier</span>
                                </div>
                            </div>

                            <div className="receipt-footer-notice">
                                This document serves as an authentic electronic receipt generated from the MBS School
                                Financial & Revenue System. Keep this for your official academic records.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
