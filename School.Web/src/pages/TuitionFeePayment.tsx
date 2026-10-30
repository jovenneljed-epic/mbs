import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Receipt,
    DollarSign,
    Calendar,
    Search,
    Plus,
    Printer,
    FileText,
    CheckCircle2,
    Clock,
    X,
    ArrowUpRight,
    Wallet,
    BookOpen,
    Eye,
    Layers,
    RefreshCw,
    Trash2
} from "lucide-react";
import { API_BASE_URL } from "../config";
import { courseCurriculumService } from "../services/courseCurriculumService";
import type { CourseProgram, CourseSubject } from "../services/courseCurriculumService";
import { SchoolPrintService } from "../utils/schoolPrintService";
import type { SchoolReceiptPrintData } from "../utils/schoolPrintService";
import "./TuitionFeePayment.css";

/* =========================================================
   TYPES & INTERFACES
========================================================= */

export type PaymentMethod =
    | "Cash"
    | "GCash"
    | "Maya"
    | "Bank Transfer (BDO)"
    | "Bank Transfer (BPI)"
    | "Bank Transfer (Metrobank)"
    | "Bank Transfer (Landbank)"
    | "Credit / Debit Card"
    | "Pastoral Scholarship / Study Grant";

export type FeeCategory =
    | "Tuition & Subject Units"
    | "Matriculation / Registration"
    | "Modular Study Materials"
    | "Graduation & Clearance"
    | "Special Assessment"
    | "Miscellaneous / ID";

export interface PaidSubjectItem {
    code: string;
    title: string;
    units: number;
    ratePerUnit: number;
    amount: number;
}

export interface StudentPaymentRecord {
    id: string;
    receiptNumber: string; // e.g. "MBS-OR-2026-0081"
    studentId: string;
    studentName: string;
    courseId?: string;
    courseName: string;
    yearLevel: string;
    termCohort: string;
    paymentDate: string;
    paymentTime: string;
    paymentMethod: PaymentMethod | string;
    referenceNumber?: string;
    feeCategory: FeeCategory | string;
    subjectsPaid: PaidSubjectItem[];
    particulars?: Array<{
        code?: string;
        description?: string;
        title?: string;
        units?: number;
        rate?: number;
        amount: number;
    }>;
    totalUnitsPaid: number;
    ratePerUnit: number;
    subtotal: number;
    scholarshipDiscount: number;
    amountPaid: number;
    amountInWords: string;
    previousBalance: number;
    remainingBalance: number;
    cashTendered?: number;
    changeGiven?: number;
    cashierName: string;
    notes?: string;
    status: "PAID" | "VERIFIED" | "VOID" | "PENDING";
}

interface Member {
    memberId: number;
    memberCode?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    suffix?: string;
    ministry?: string;
    civilStatus?: string;
    contactNumber?: string;
    email?: string;
    status?: string;
    photoPath?: string;
}

const STORAGE_KEY = "mbs_tuition_payments_v2";

/* Helper: Number to Words Converter (Philippine Pesos) */
function numberToWordsPesos(amount: number): string {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const whole = Math.floor(amount);
    const cents = Math.round((amount - whole) * 100);

    function convertGroup(num: number): string {
        let str = "";
        if (num >= 100) {
            str += ones[Math.floor(num / 100)] + " Hundred ";
            num %= 100;
        }
        if (num >= 20) {
            str += tens[Math.floor(num / 10)] + " ";
            num %= 10;
        }
        if (num > 0) {
            str += ones[num] + " ";
        }
        return str;
    }

    if (whole === 0) return cents > 0 ? `${cents}/100 Pesos Only` : "Zero Pesos Only";

    let result = "";
    if (whole >= 1000000) {
        result += convertGroup(Math.floor(whole / 1000000)) + "Million ";
    }
    const thousands = Math.floor((whole % 1000000) / 1000);
    if (thousands > 0) {
        result += convertGroup(thousands) + "Thousand ";
    }
    const remainder = whole % 1000;
    if (remainder > 0) {
        result += convertGroup(remainder);
    }

    result = result.trim() + " Pesos";
    if (cents > 0) {
        result += ` & ${cents}/100`;
    }
    return result + " Only";
}

/* Authentic Seminary Tuition Payments (Zero Mock Data) */
// Helper: Check if a record is from legacy hardcoded mock seeds
const isMockRecord = (p: any): boolean => {
    if (!p) return true;
    const s = JSON.stringify(p);
    if (p.id === "pay-1" || p.id === "pay-2" || p.id === "pay-3" || p.id === "pay-4" || p.id?.startsWith("pay-seed-")) return true;
    if (s.includes("Joshua Mark Bautista") || s.includes("Hannah Grace Alcantara") || s.includes("Timothy Caleb Rivera") || s.includes("Ezekiel David Ramos")) return true;
    if (s.includes("MBS-OR-2026-0041") || s.includes("MBS-OR-2026-0042") || s.includes("MBS-OR-2026-0043") || s.includes("MBS-OR-2026-0044")) return true;
    if (s.includes("Rachel Santos")) return true;
    return false;
};

const normalizePaymentRecord = (p: any): StudentPaymentRecord => {
    let subjectsPaid: PaidSubjectItem[] = [];
    if (Array.isArray(p.subjectsPaid)) {
        subjectsPaid = p.subjectsPaid;
    } else if (Array.isArray(p.particulars)) {
        subjectsPaid = p.particulars.map((pt: any) => ({
            code: pt.code || "CBS-MOD",
            title: pt.description || pt.title || "Tuition & Modular Settlement",
            units: pt.units || 3,
            ratePerUnit: pt.rate || 500,
            amount: pt.amount || 0
        }));
    }

    const particulars = Array.isArray(p.particulars)
        ? p.particulars
        : subjectsPaid.length > 0
        ? subjectsPaid.map((s) => ({
            code: s.code,
            description: `${s.code} - ${s.title}`,
            units: s.units,
            rate: s.ratePerUnit,
            amount: s.amount
        }))
        : [{ description: p.feeCategory || "Tuition & Fees Settlement", amount: p.amountPaid || 0 }];

    return {
        id: p.id || `pay-${Math.random().toString(36).substring(2, 9)}`,
        receiptNumber: p.receiptNumber || `MBS-OR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        studentId: p.studentId || "MBS-2026-0001",
        studentName: p.studentName || "Student",
        courseId: p.courseId,
        courseName: p.courseName || "Bachelor of Ministry (B.Min.)",
        yearLevel: p.yearLevel || "1st Year",
        termCohort: p.termCohort || "1st Trimester 2026",
        paymentDate: p.paymentDate || new Date().toISOString().split("T")[0],
        paymentTime: p.paymentTime || "12:00 PM",
        paymentMethod: p.paymentMethod || "Cash",
        referenceNumber: p.referenceNumber,
        feeCategory: p.feeCategory || "Tuition & Subject Units",
        subjectsPaid,
        particulars,
        totalUnitsPaid: typeof p.totalUnitsPaid === "number" ? p.totalUnitsPaid : subjectsPaid.reduce((acc, s) => acc + (s.units || 0), 0),
        ratePerUnit: p.ratePerUnit || 500,
        subtotal: p.subtotal ?? p.amountPaid ?? 0,
        scholarshipDiscount: p.scholarshipDiscount ?? p.discount ?? 0,
        amountPaid: p.amountPaid ?? 0,
        amountInWords: p.amountInWords || numberToWordsPesos(p.amountPaid ?? 0),
        previousBalance: p.previousBalance ?? 0,
        remainingBalance: p.remainingBalance ?? 0,
        cashTendered: p.cashTendered,
        changeGiven: p.changeGiven,
        cashierName: p.cashierName && p.cashierName !== "Rachel Santos, CPA" ? p.cashierName : "Office of the Seminary Bursar",
        notes: p.notes,
        status: p.status === "VOID" ? "VOID" : (p.status === "VERIFIED" ? "VERIFIED" : "PAID")
    };
};

const getToken = (): string | null => {
    const keys = ["token", "accessToken", "jwt", "authToken", "epicToken"];
    for (const key of keys) {
        const value = localStorage.getItem(key);
        if (value) return value.replace(/^Bearer\s+/i, "").trim();
    }
    return null;
};

export const TuitionFeePayment: React.FC = () => {
    // Payment records state (Zero fake records)
    const [payments, setPayments] = useState<StudentPaymentRecord[]>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    const cleaned = parsed.filter(p => !isMockRecord(p)).map(normalizePaymentRecord);
                    if (cleaned.length !== parsed.length) {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
                    }
                    return cleaned;
                }
            }
        } catch (e) {
            console.error("Failed to parse cached tuition payments:", e);
        }
        return [];
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Academic Registry
    const [students, setStudents] = useState<Member[]>([]);
    const [courses, setCourses] = useState<CourseProgram[]>([]);

    // Filters
    const [search, setSearch] = useState("");
    const [methodFilter, setMethodFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [dateFilter, setDateFilter] = useState("ALL");

    // Modals & Drawers
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<StudentPaymentRecord | null>(null);

    // New Payment Form State
    const [formStudentId, setFormStudentId] = useState("");
    const [formStudentName, setFormStudentName] = useState("");
    const [formCourseName, setFormCourseName] = useState("Bachelor of Ministry (B.Min.)");
    const [formYearLevel, setFormYearLevel] = useState("1st Year");
    const [formTermCohort, setFormTermCohort] = useState("1st Trimester 2026");
    const [formFeeCategory, setFormFeeCategory] = useState<FeeCategory>("Tuition & Subject Units");
    const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>("Cash");
    const [formReferenceNumber, setFormReferenceNumber] = useState("");
    const [formSelectedSubjectCodes, setFormSelectedSubjectCodes] = useState<string[]>([]);
    const [formRatePerUnit, setFormRatePerUnit] = useState(500);
    const [formCustomAmount, setFormCustomAmount] = useState<number | "">("");
    const [formScholarshipDiscount, setFormScholarshipDiscount] = useState<number>(0);
    const [formCashTendered, setFormCashTendered] = useState<number | "">("");
    const [formCashierName, setFormCashierName] = useState("Office of the Seminary Bursar");
    const [formNotes, setFormNotes] = useState("");

    // Load authentic database payments and students from backend API
    const loadRealData = useCallback(async () => {
        setIsLoading(true);
        try {
            const baseUrl = API_BASE_URL.replace(/\/+$/, "");
            const token = getToken();
            const headers = new Headers();
            if (token) headers.set("Authorization", `Bearer ${token}`);

            // 1. Load curriculum courses
            const loadedCourses = courseCurriculumService.getCourses();
            setCourses(loadedCourses);

            // 2. Load real students from database
            let memberList: Member[] = [];
            try {
                const studResp = await fetch(`${baseUrl}/ClientPayments/student-list`);
                if (studResp.ok) {
                    const data = await studResp.json();
                    if (Array.isArray(data)) memberList = data;
                }
            } catch (err) {
                console.warn("Could not load /ClientPayments/student-list:", err);
            }

            if (memberList.length === 0) {
                try {
                    const resp = await fetch(`${baseUrl}/Members`, { headers });
                    if (resp.ok) {
                        const data = await resp.json();
                        const list = Array.isArray(data) ? data : data.members || data.data || [];
                        memberList = list;
                    }
                } catch {}
            }
            setStudents(memberList);

            // 3. Load real database payments
            const payResp = await fetch(`${baseUrl}/ClientPayments/student-ledger`);
            if (payResp.ok) {
                const payData = await payResp.json();
                if (Array.isArray(payData)) {
                    const realList: StudentPaymentRecord[] = payData.map((p: any) => {
                        let studentId = "STD-GENERAL";
                        let studentName = "Enrolled Student";
                        let courseName = "Bachelor of Ministry (B.Min.)";
                        let yearLevel = "1st Year";
                        let termCohort = "1st Trimester 2026";
                        let feeCategory = "Tuition & Subject Units";
                        let cashierName = "Office of the Seminary Bursar";
                        let remarks = p.notes || "";
                        let subjectsPaid: PaidSubjectItem[] = [];

                        if (p.notes && typeof p.notes === "string" && p.notes.trim().startsWith("{")) {
                            try {
                                const parsed = JSON.parse(p.notes);
                                if (parsed.studentId) studentId = parsed.studentId;
                                if (parsed.studentName) studentName = parsed.studentName;
                                if (parsed.courseName) courseName = parsed.courseName;
                                if (parsed.yearLevel) yearLevel = parsed.yearLevel;
                                if (parsed.termCohort) termCohort = parsed.termCohort;
                                if (parsed.feeCategory) feeCategory = parsed.feeCategory;
                                if (parsed.cashierName) cashierName = parsed.cashierName;
                                if (parsed.remarks) remarks = parsed.remarks;
                                if (parsed.particulars) {
                                    const pt = typeof parsed.particulars === "string" ? JSON.parse(parsed.particulars) : parsed.particulars;
                                    if (Array.isArray(pt) && pt.length > 0) {
                                        subjectsPaid = pt.map((item: any) => ({
                                            code: item.code || "CBS-MOD",
                                            title: item.title || item.description || "Tuition Unit",
                                            units: item.units || 3,
                                            ratePerUnit: item.ratePerUnit || item.rate || 500,
                                            amount: item.amount || (p.amount || 0)
                                        }));
                                    }
                                }
                            } catch {}
                        } else if (p.notes) {
                            remarks = p.notes;
                            const matched = memberList.find(m =>
                                (m.memberCode && p.notes.includes(m.memberCode)) ||
                                (m.lastName && p.notes.includes(m.lastName))
                            );
                            if (matched) {
                                studentId = matched.memberCode || `MBS-${matched.memberId}`;
                                studentName = [matched.firstName, matched.lastName].filter(Boolean).join(" ");
                                if (matched.ministry) courseName = matched.ministry;
                            }
                        }

                        if (subjectsPaid.length === 0) {
                            subjectsPaid = [
                                {
                                    code: "CBS-MOD",
                                    title: remarks || feeCategory,
                                    units: Math.floor(p.amount / 500) || 3,
                                    ratePerUnit: 500,
                                    amount: p.amount
                                }
                            ];
                        }

                        const d = p.paidDate ? new Date(p.paidDate) : new Date(p.createdDate || Date.now());
                        const dateStr = d.toISOString().split("T")[0];
                        const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

                        return {
                            id: `pay-db-${p.paymentId}`,
                            receiptNumber: p.receiptNumber || `MBS-OR-2026-${p.paymentId}`,
                            studentId,
                            studentName,
                            courseName,
                            yearLevel,
                            termCohort,
                            paymentDate: dateStr,
                            paymentTime: timeStr,
                            paymentMethod: p.paymentMethod || "Cash",
                            referenceNumber: p.referenceNumber,
                            feeCategory,
                            subjectsPaid,
                            particulars: subjectsPaid.map(s => ({
                                code: s.code,
                                description: `${s.code} - ${s.title}`,
                                units: s.units,
                                rate: s.ratePerUnit,
                                amount: s.amount
                            })),
                            totalUnitsPaid: subjectsPaid.reduce((acc, s) => acc + (s.units || 0), 0),
                            ratePerUnit: 500,
                            subtotal: p.amount,
                            scholarshipDiscount: 0,
                            amountPaid: p.amount,
                            amountInWords: numberToWordsPesos(p.amount),
                            previousBalance: 0,
                            remainingBalance: 0,
                            cashierName,
                            notes: remarks,
                            status: p.status === "VOID" ? "VOID" : "PAID"
                        };
                    });

                    setPayments(realList);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(realList));
                }
            }
        } catch (err) {
            console.error("Failed to load authentic data:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadRealData();
    }, [loadRealData]);

    // Synchronize across tabs or local storage changes
    useEffect(() => {
        const handleSync = () => {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                        setPayments(parsed.filter(p => !isMockRecord(p)).map(normalizePaymentRecord));
                    }
                }
            } catch {}
        };
        window.addEventListener("storage", handleSync);
        window.addEventListener("sms_tuition_updated", handleSync);
        return () => {
            window.removeEventListener("storage", handleSync);
            window.removeEventListener("sms_tuition_updated", handleSync);
        };
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        try {
            const cleanList = payments.filter(p => !isMockRecord(p));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanList));
        } catch (e) {
            console.error("Failed to save tuition payments to localStorage:", e);
        }
    }, [payments]);

    // Helper: Map all subjects from curriculum
    const allSubjects = useMemo(() => {
        const map = new Map<string, CourseSubject>();
        courses.forEach(c => {
            (c.subjects || []).forEach(s => {
                if (!map.has(s.code)) map.set(s.code, s);
            });
        });
        return Array.from(map.values());
    }, [courses]);

    // Calculate Student Financial Summary across real registered students (Zero Fake Defaults)
    const studentFinancials = useMemo(() => {
        const map = new Map<string, {
            name: string;
            studentId: string;
            course: string;
            enrolledSubjectCodes: string[];
            totalUnits: number;
            totalAssessment: number;
            totalPaid: number;
            balance: number;
        }>();

        // 1. Populate only from real students in database
        students.forEach(std => {
            const sid = std.memberCode || `STD-2026-${String(std.memberId).padStart(4, "0")}`;
            const sname = [std.firstName, std.lastName].filter(Boolean).join(" ") || "Enrolled Student";
            let course = std.ministry || "Bachelor of Ministry (B.Min.)";
            let subjectCodes: string[] = [];

            if (std.photoPath && std.photoPath.startsWith("{")) {
                try {
                    const parsed = JSON.parse(std.photoPath);
                    if (parsed.courseName) course = parsed.courseName;
                    if (Array.isArray(parsed.subjects) && parsed.subjects.length > 0) {
                        subjectCodes = parsed.subjects;
                    }
                } catch {}
            }

            const units = subjectCodes.reduce((sum, code) => {
                const sub = courseCurriculumService.getSubjectByCode(code);
                return sum + (sub ? sub.units : 3);
            }, 0);

            const totalAssessment = units > 0 ? (units * 500 + 1000) : 0;

            map.set(sid, {
                name: sname,
                studentId: sid,
                course,
                enrolledSubjectCodes: subjectCodes,
                totalUnits: units,
                totalAssessment,
                totalPaid: 0,
                balance: totalAssessment
            });
        });

        // 2. Add real payments made so far
        payments.forEach(p => {
            if (p.status !== "VOID") {
                let entry = map.get(p.studentId);
                if (!entry && p.studentName) {
                    entry = {
                        name: p.studentName,
                        studentId: p.studentId,
                        course: p.courseName,
                        enrolledSubjectCodes: (p.subjectsPaid || []).map(s => s.code),
                        totalUnits: p.totalUnitsPaid || 0,
                        totalAssessment: p.amountPaid,
                        totalPaid: 0,
                        balance: 0
                    };
                    map.set(p.studentId, entry);
                }
                if (entry) {
                    entry.totalPaid += p.amountPaid;
                    entry.balance = Math.max(0, entry.totalAssessment - entry.totalPaid);
                }
            }
        });

        return map;
    }, [students, payments]);

    // Metrics
    const metrics = useMemo(() => {
        const todayStr = new Date().toISOString().split("T")[0];
        const thisMonthStr = todayStr.substring(0, 7);

        let totalCollected = 0;
        let todayCollected = 0;
        let monthCollected = 0;
        let cashTotal = 0;
        let gcashTotal = 0;
        let bankTotal = 0;
        let scholarshipTotal = 0;

        payments.forEach(p => {
            if (p.status !== "VOID") {
                const amt = p.amountPaid || 0;
                totalCollected += amt;
                if (p.paymentDate === todayStr) todayCollected += amt;
                if (p.paymentDate && p.paymentDate.startsWith(thisMonthStr)) monthCollected += amt;

                const pm = p.paymentMethod || "";
                if (pm === "Cash") cashTotal += amt;
                else if (pm.includes("GCash") || pm.includes("Maya")) gcashTotal += amt;
                else if (pm.startsWith("Bank")) bankTotal += amt;
                else if (pm.includes("Scholarship")) scholarshipTotal += amt;
            }
        });

        let totalAssessed = 0;
        let totalReceivables = 0;
        studentFinancials.forEach(val => {
            totalAssessed += val.totalAssessment;
            totalReceivables += val.balance;
        });

        return {
            totalCollected,
            todayCollected,
            monthCollected,
            totalAssessed,
            totalReceivables,
            cashTotal,
            gcashTotal,
            bankTotal,
            scholarshipTotal,
            totalTransactions: payments.length
        };
    }, [payments, studentFinancials]);

    // Filter payments table
    const filteredPayments = useMemo(() => {
        const sLower = search.toLowerCase();
        return payments.filter(p => {
            const matchesSearch =
                (p.studentName || "").toLowerCase().includes(sLower) ||
                (p.studentId || "").toLowerCase().includes(sLower) ||
                (p.receiptNumber || "").toLowerCase().includes(sLower) ||
                (p.referenceNumber && p.referenceNumber.toLowerCase().includes(sLower)) ||
                (p.courseName || "").toLowerCase().includes(sLower);

            const matchesMethod = methodFilter === "ALL" || p.paymentMethod === methodFilter;
            const matchesCategory = categoryFilter === "ALL" || p.feeCategory === categoryFilter;

            let matchesDate = true;
            const todayStr = new Date().toISOString().split("T")[0];
            if (dateFilter === "TODAY") {
                matchesDate = p.paymentDate === todayStr;
            } else if (dateFilter === "THIS_MONTH") {
                matchesDate = Boolean(p.paymentDate && p.paymentDate.startsWith(todayStr.substring(0, 7)));
            }

            return matchesSearch && matchesMethod && matchesCategory && matchesDate;
        });
    }, [payments, search, methodFilter, categoryFilter, dateFilter]);

    // When selecting a student in Payment Modal
    const handleSelectStudentForPayment = (sid: string) => {
        setFormStudentId(sid);
        const fin = studentFinancials.get(sid);
        if (fin) {
            setFormStudentName(fin.name);
            setFormCourseName(fin.course);
            setFormSelectedSubjectCodes(fin.enrolledSubjectCodes);
            const units = fin.enrolledSubjectCodes.reduce((s, code) => {
                const sub = courseCurriculumService.getSubjectByCode(code);
                return s + (sub ? sub.units : 3);
            }, 0);
            const defaultTuition = units * formRatePerUnit;
            setFormCustomAmount(Math.min(defaultTuition, fin.balance || defaultTuition));
        }
    };

    // Auto-calculate payment breakdown in modal
    const modalCalculations = useMemo(() => {
        const studentFin = studentFinancials.get(formStudentId);
        const prevBal = studentFin ? studentFin.balance : 5000;

        let calculatedSubtotal = 0;
        let paidUnitsCount = 0;
        const paidItems: PaidSubjectItem[] = [];

        if (formFeeCategory === "Tuition & Subject Units") {
            if (formSelectedSubjectCodes.length > 0) {
                formSelectedSubjectCodes.forEach(code => {
                    const sub = courseCurriculumService.getSubjectByCode(code);
                    const u = sub ? sub.units : 3;
                    const amt = u * formRatePerUnit;
                    calculatedSubtotal += amt;
                    paidUnitsCount += u;
                    paidItems.push({
                        code,
                        title: sub ? sub.title : code,
                        units: u,
                        ratePerUnit: formRatePerUnit,
                        amount: amt
                    });
                });
            } else {
                const amt = typeof formCustomAmount === "number" && formCustomAmount > 0 ? formCustomAmount : 1500;
                const u = Math.floor(amt / formRatePerUnit) || 3;
                calculatedSubtotal = amt;
                paidUnitsCount = u;
                paidItems.push({
                    code: "CBS-MOD",
                    title: "Modular Tuition & Enrolled Units",
                    units: u,
                    ratePerUnit: formRatePerUnit,
                    amount: amt
                });
            }
        } else if (formFeeCategory === "Matriculation / Registration") {
            calculatedSubtotal = 1000;
            paidItems.push({
                code: "MATRIC-01",
                title: "Official Matriculation & Registration Fee",
                units: 0,
                ratePerUnit: 1000,
                amount: 1000
            });
        } else if (formFeeCategory === "Modular Study Materials") {
            calculatedSubtotal = 750;
            paidItems.push({
                code: "MOD-KIT",
                title: "Theological Cohort Modular Binders & Study Syllabus",
                units: 0,
                ratePerUnit: 750,
                amount: 750
            });
        } else {
            calculatedSubtotal = Number(formCustomAmount) || 1000;
            paidItems.push({
                code: "MISC-01",
                title: formFeeCategory,
                units: 0,
                ratePerUnit: calculatedSubtotal,
                amount: calculatedSubtotal
            });
        }

        // If user manually changed amount
        const netAmount = Math.max(0, (typeof formCustomAmount === "number" && formCustomAmount > 0 ? formCustomAmount : calculatedSubtotal) - formScholarshipDiscount);
        const newBalance = Math.max(0, prevBal - netAmount);

        let change = 0;
        if (formPaymentMethod === "Cash" && typeof formCashTendered === "number" && formCashTendered > netAmount) {
            change = formCashTendered - netAmount;
        }

        return {
            subtotal: calculatedSubtotal,
            paidItems,
            paidUnitsCount,
            netAmount,
            previousBalance: prevBal,
            newBalance,
            change
        };
    }, [formStudentId, studentFinancials, formFeeCategory, formSelectedSubjectCodes, formRatePerUnit, formCustomAmount, formScholarshipDiscount, formPaymentMethod, formCashTendered]);

    // Open Record Payment Modal
    const handleOpenPaymentModal = (presetStudentId?: string) => {
        const studentKeys = Array.from(studentFinancials.keys());
        if (presetStudentId && studentFinancials.has(presetStudentId)) {
            handleSelectStudentForPayment(presetStudentId);
        } else if (studentKeys.length > 0) {
            handleSelectStudentForPayment(studentKeys[0]);
        } else {
            setFormStudentId("STD-2026-0001");
            setFormStudentName("Enrolled Student");
            setFormCourseName("Bachelor of Ministry (B.Min.)");
            setFormSelectedSubjectCodes([]);
            setFormCustomAmount("");
        }

        setFormPaymentMethod("Cash");
        setFormReferenceNumber("");
        setFormFeeCategory("Tuition & Subject Units");
        setFormScholarshipDiscount(0);
        setFormCashTendered("");
        setFormNotes("");
        setIsPaymentModalOpen(true);
    };

    // Save Payment Record directly to SQL Server Database
    const handleSavePayment = async (autoPrint = false) => {
        if (!formStudentName.trim() || modalCalculations.netAmount <= 0) {
            alert("Please provide a valid student name and payment amount.");
            return;
        }

        setIsSaving(true);
        try {
            const baseUrl = API_BASE_URL.replace(/\/+$/, "");
            const newReceiptNum = `MBS-OR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

            const postBody = {
                amount: modalCalculations.netAmount,
                paymentMethod: formPaymentMethod,
                referenceNumber: formReferenceNumber.trim() || (formPaymentMethod === "Cash" ? `CSH-${Date.now().toString().slice(-6)}` : undefined),
                receiptNumber: newReceiptNum,
                notes: formNotes.trim() || `${formFeeCategory} Settlement`,
                studentId: formStudentId.trim() || "STD-2026-0001",
                studentName: formStudentName.trim(),
                courseName: formCourseName || "Bachelor of Ministry (B.Min.)",
                yearLevel: formYearLevel,
                termCohort: formTermCohort,
                feeCategory: formFeeCategory,
                particularsJson: JSON.stringify(modalCalculations.paidItems),
                cashierName: formCashierName || "Office of the Seminary Bursar"
            };

            const resp = await fetch(`${baseUrl}/ClientPayments/record-student-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(postBody)
            });

            if (!resp.ok) {
                const errData = await resp.json().catch(() => null);
                throw new Error(errData?.message || `Failed to record payment (Status: ${resp.status})`);
            }

            const resData = await resp.json();
            const actualReceipt = resData.receiptNumber || newReceiptNum;

            const newRecord: StudentPaymentRecord = {
                id: `pay-db-${resData.paymentId || Date.now()}`,
                receiptNumber: actualReceipt,
                studentId: postBody.studentId,
                studentName: postBody.studentName,
                courseName: postBody.courseName,
                yearLevel: formYearLevel,
                termCohort: formTermCohort,
                paymentDate: new Date().toISOString().split("T")[0],
                paymentTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                paymentMethod: formPaymentMethod,
                referenceNumber: postBody.referenceNumber,
                feeCategory: formFeeCategory,
                subjectsPaid: modalCalculations.paidItems,
                particulars: modalCalculations.paidItems.map(s => ({
                    code: s.code,
                    description: `${s.code} - ${s.title}`,
                    units: s.units,
                    rate: s.ratePerUnit,
                    amount: s.amount
                })),
                totalUnitsPaid: modalCalculations.paidUnitsCount,
                ratePerUnit: formRatePerUnit,
                subtotal: modalCalculations.subtotal,
                scholarshipDiscount: formScholarshipDiscount,
                amountPaid: modalCalculations.netAmount,
                amountInWords: numberToWordsPesos(modalCalculations.netAmount),
                previousBalance: modalCalculations.previousBalance,
                remainingBalance: modalCalculations.newBalance,
                cashTendered: typeof formCashTendered === "number" ? formCashTendered : undefined,
                changeGiven: modalCalculations.change > 0 ? modalCalculations.change : undefined,
                cashierName: formCashierName || "Office of the Seminary Bursar",
                notes: formNotes.trim() || undefined,
                status: "PAID"
            };

            setPayments(prev => [newRecord, ...prev.filter(p => p.id !== newRecord.id)]);
            setIsPaymentModalOpen(false);
            window.dispatchEvent(new Event("sms_tuition_updated"));

            if (autoPrint) {
                handlePrintReceipt(newRecord);
            } else {
                setSelectedReceipt(newRecord);
            }
        } catch (err: any) {
            console.error("Error saving real payment to database:", err);
            alert("Database Error: " + (err.message || "Failed to record payment to database."));
        } finally {
            setIsSaving(false);
        }
    };

    // Delete / Void payment transaction from database
    const handleDeletePayment = async (rec: StudentPaymentRecord) => {
        if (!window.confirm(`Are you sure you want to delete Official Receipt ${rec.receiptNumber} (₱${(rec.amountPaid || 0).toLocaleString()}) for ${rec.studentName}? This will permanently remove the record from SQL Server.`)) {
            return;
        }

        try {
            const baseUrl = API_BASE_URL.replace(/\/+$/, "");
            const idNum = rec.id.replace(/^pay-db-/, "");
            if (/^\d+$/.test(idNum)) {
                await fetch(`${baseUrl}/ClientPayments/delete-student-payment/${idNum}`, {
                    method: "DELETE"
                });
            }

            setPayments(prev => prev.filter(p => p.id !== rec.id));
            window.dispatchEvent(new Event("sms_tuition_updated"));
        } catch (err) {
            console.error("Failed to delete payment:", err);
            alert("Failed to delete payment transaction from database.");
        }
    };

    // Print Official Receipt
    const handlePrintReceipt = (rec: StudentPaymentRecord) => {
        const receiptData: SchoolReceiptPrintData = {
            receiptNumber: rec.receiptNumber,
            transactionDate: `${rec.paymentDate} • ${rec.paymentTime}`,
            studentName: rec.studentName,
            studentId: rec.studentId,
            courseName: rec.courseName,
            yearLevel: rec.yearLevel,
            paymentMethod: rec.paymentMethod,
            referenceNumber: rec.referenceNumber,
            paymentCategory: rec.feeCategory,
            particulars: ((rec.subjectsPaid?.length ?? 0) > 0)
                ? rec.subjectsPaid.map(s => ({
                      description: `${s.code} - ${s.title}`,
                      units: s.units,
                      rate: s.ratePerUnit,
                      amount: s.amount
                  }))
                : (Array.isArray(rec.particulars) && rec.particulars.length > 0)
                ? rec.particulars.map(pt => ({
                      description: pt.description || pt.title || rec.feeCategory,
                      units: pt.units,
                      rate: pt.rate,
                      amount: pt.amount
                  }))
                : [
                      {
                          description: rec.feeCategory || "Tuition & Fees Settlement",
                          amount: rec.amountPaid || 0
                      }
                  ],
            subtotal: rec.subtotal ?? rec.amountPaid ?? 0,
            discount: rec.scholarshipDiscount ?? 0,
            amountPaid: rec.amountPaid ?? 0,
            amountInWords: rec.amountInWords || numberToWordsPesos(rec.amountPaid ?? 0),
            previousBalance: rec.previousBalance ?? 0,
            remainingBalance: rec.remainingBalance ?? 0,
            cashierName: rec.cashierName || "Office of the Seminary Bursar",
            notes: rec.notes
        };

        SchoolPrintService.printReceipt(receiptData);
    };

    // Print Collection Summary Report
    const handlePrintCollectionReport = () => {
        SchoolPrintService.printReport({
            title: "OFFICIAL TUITION & FEE COLLECTION REPORT",
            category: "Bursar & Financial Accounting Division",
            description: "Mobile Bible School & Seminary Academic Management System • Official Audit Collection Roster",
            filterSummary: `Filter: ${methodFilter} • Category: ${categoryFilter} • Date: ${dateFilter}`,
            summaryCards: [
                { label: "Total Collections", value: `₱${metrics.totalCollected.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, subtext: "Audited Ledger" },
                { label: "Today's Collections", value: `₱${metrics.todayCollected.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, subtext: "Cashier Shift Total" },
                { label: "Outstanding Receivables", value: `₱${metrics.totalReceivables.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, subtext: "Unpaid Tuition Balances" },
                { label: "Total Transactions", value: filteredPayments.length, subtext: "Receipts Issued" }
            ],
            columns: [
                { header: "#", width: "35px", align: "center" },
                { header: "OR NUMBER", width: "130px" },
                { header: "DATE & TIME", width: "130px" },
                { header: "STUDENT NAME & ID", width: "200px" },
                { header: "COURSE / DEGREE", width: "170px" },
                { header: "PAYMENT METHOD", width: "130px" },
                { header: "FEE CATEGORY", width: "140px" },
                { header: "AMOUNT PAID", width: "110px", align: "right" },
                { header: "BALANCE", width: "100px", align: "right" }
            ],
            rows: filteredPayments.map((p, idx) => [
                idx + 1,
                p.receiptNumber,
                `${p.paymentDate} ${p.paymentTime}`,
                `${p.studentName} (${p.studentId})`,
                p.courseName,
                `${p.paymentMethod}${p.referenceNumber ? ` (${p.referenceNumber})` : ""}`,
                p.feeCategory,
                `₱${(p.amountPaid ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                `₱${(p.remainingBalance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
            ])
        });
    };

    return (
        <div className="tuition-payment-page">
            {/* HERO BANNER */}
            <div className="tuition-hero-card">
                <div className="tuition-hero-content">
                    <div className="tuition-hero-icon">
                        <Receipt size={32} />
                    </div>
                    <div>
                        <h1 className="tuition-hero-title">Student Tuition & Fee Payment System</h1>
                        <p className="tuition-hero-subtitle">
                            Multi-payment collection module for enrolled courses, subjects & units. Accepts Cash, GCash, Maya, Bank Transfers, and Scholarships with instant Official Receipt generation.
                        </p>
                    </div>
                </div>

                <div className="tuition-hero-actions">
                    <button type="button" className="hero-btn secondary" onClick={handlePrintCollectionReport}>
                        <Printer size={16} />
                        <span>Print Collection Report</span>
                    </button>
                    <button type="button" className="hero-btn primary" onClick={() => handleOpenPaymentModal()}>
                        <Plus size={16} />
                        <span>+ Record Tuition Payment</span>
                    </button>
                </div>
            </div>

            {/* KPI FINANCIAL METRICS */}
            <div className="tuition-kpi-grid">
                <div className="tuition-kpi-card">
                    <div className="kpi-icon-box green">
                        <DollarSign size={24} />
                    </div>
                    <div className="kpi-text-col">
                        <span className="kpi-label">Total Collections</span>
                        <strong className="kpi-amount">₱{metrics.totalCollected.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
                        <span className="kpi-caption">{metrics.totalTransactions} Official Receipts issued</span>
                    </div>
                </div>

                <div className="tuition-kpi-card">
                    <div className="kpi-icon-box blue">
                        <Calendar size={24} />
                    </div>
                    <div className="kpi-text-col">
                        <span className="kpi-label">Collected Today</span>
                        <strong className="kpi-amount">₱{metrics.todayCollected.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
                        <span className="kpi-caption">Active Cashier shift</span>
                    </div>
                </div>

                <div className="tuition-kpi-card">
                    <div className="kpi-icon-box indigo">
                        <Layers size={24} />
                    </div>
                    <div className="kpi-text-col">
                        <span className="kpi-label">This Month's Inflow</span>
                        <strong className="kpi-amount">₱{metrics.monthCollected.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
                        <span className="kpi-caption">Current billing cycle</span>
                    </div>
                </div>

                <div className="tuition-kpi-card">
                    <div className="kpi-icon-box amber">
                        <BookOpen size={24} />
                    </div>
                    <div className="kpi-text-col">
                        <span className="kpi-label">Total Assessment</span>
                        <strong className="kpi-amount">₱{metrics.totalAssessed.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
                        <span className="kpi-caption">Enrolled students' load</span>
                    </div>
                </div>

                <div className="tuition-kpi-card">
                    <div className="kpi-icon-box rose">
                        <ArrowUpRight size={24} />
                    </div>
                    <div className="kpi-text-col">
                        <span className="kpi-label">Outstanding Balance</span>
                        <strong className="kpi-amount" style={{ color: "#e11d48" }}>₱{metrics.totalReceivables.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
                        <span className="kpi-caption">Uncollected receivables</span>
                    </div>
                </div>
            </div>

            {/* PAYMENT CHANNELS SUMMARY STRIP */}
            <div className="payment-methods-strip">
                <div className="strip-title">
                    <Wallet size={15} />
                    <span>Multi-Payment Channels Supported:</span>
                </div>
                <div className="channel-badges">
                    <div className="channel-badge cash">
                        <span>💵 Cash (₱{metrics.cashTotal.toLocaleString()})</span>
                    </div>
                    <div className="channel-badge gcash">
                        <span>📱 GCash & Maya (₱{metrics.gcashTotal.toLocaleString()})</span>
                    </div>
                    <div className="channel-badge bank">
                        <span>🏦 Bank Transfers (₱{metrics.bankTotal.toLocaleString()})</span>
                    </div>
                    <div className="channel-badge scholarship">
                        <span>📜 Study Grants & Scholarships (₱{metrics.scholarshipTotal.toLocaleString()})</span>
                    </div>
                </div>
            </div>

            {/* CONTROLS & FILTER CARD */}
            <div className="tuition-control-card">
                <div className="control-row-top">
                    <div className="tuition-tabs">
                        <button
                            type="button"
                            className={`tuition-tab-btn ${dateFilter === "ALL" ? "active" : ""}`}
                            onClick={() => setDateFilter("ALL")}
                        >
                            <FileText size={15} />
                            <span>All Receipts ({payments.length})</span>
                        </button>
                        <button
                            type="button"
                            className={`tuition-tab-btn ${dateFilter === "TODAY" ? "active" : ""}`}
                            onClick={() => setDateFilter("TODAY")}
                        >
                            <Clock size={15} />
                            <span>Today's Payments</span>
                        </button>
                        <button
                            type="button"
                            className={`tuition-tab-btn ${dateFilter === "THIS_MONTH" ? "active" : ""}`}
                            onClick={() => setDateFilter("THIS_MONTH")}
                        >
                            <Calendar size={15} />
                            <span>This Month</span>
                        </button>
                    </div>

                    <div className="control-row-filters">
                        <div className="tuition-search-input-wrap">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search student name, ID, OR #, or reference number..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        <select className="filter-select" value={methodFilter} onChange={e => setMethodFilter(e.target.value)}>
                            <option value="ALL">All Payment Methods</option>
                            <option value="Cash">Cash (Over-the-Counter)</option>
                            <option value="GCash">GCash E-Wallet</option>
                            <option value="Maya">Maya E-Wallet</option>
                            <option value="Bank Transfer (BDO)">BDO Bank Transfer</option>
                            <option value="Bank Transfer (BPI)">BPI Bank Transfer</option>
                            <option value="Pastoral Scholarship / Study Grant">Pastoral Study Grant</option>
                        </select>

                        <select className="filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                            <option value="ALL">All Fee Categories</option>
                            <option value="Tuition & Subject Units">Tuition & Enrolled Units</option>
                            <option value="Matriculation / Registration">Matriculation & Registration</option>
                            <option value="Modular Study Materials">Modular Materials / Binders</option>
                            <option value="Graduation & Clearance">Graduation & Clearance</option>
                        </select>

                        <button
                            type="button"
                            className="hero-btn secondary"
                            style={{ padding: "8px 14px", fontSize: "12.5px", whiteSpace: "nowrap" }}
                            onClick={() => loadRealData()}
                            disabled={isLoading}
                            title="Reload live ledger from database"
                        >
                            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                            <span>{isLoading ? "Syncing..." : "Refresh Ledger"}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* PAYMENT TRANSACTIONS TABLE */}
            <div className="tuition-table-card">
                <table className="tuition-table">
                    <thead>
                        <tr>
                            <th style={{ width: "35px" }}>#</th>
                            <th style={{ width: "130px" }}>OR NUMBER</th>
                            <th>STUDENT ENROLLEE</th>
                            <th>PROGRAM & LOAD</th>
                            <th>FEE ALLOCATION</th>
                            <th>PAYMENT CHANNEL</th>
                            <th style={{ textAlign: "right" }}>AMOUNT PAID</th>
                            <th style={{ textAlign: "right" }}>BALANCE</th>
                            <th style={{ textAlign: "center", width: "140px" }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.length === 0 ? (
                            <tr>
                                <td colSpan={9} style={{ textAlign: "center", padding: "50px 20px", color: "#64748b" }}>
                                    <div style={{ maxWidth: "440px", margin: "0 auto", textAlign: "center" }}>
                                        <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px auto" }}>
                                            <Receipt size={26} />
                                        </div>
                                        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
                                            No Tuition Payments in Database
                                        </h3>
                                        <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.5, marginBottom: "18px" }}>
                                            Zero fake data. All records displayed here are loaded in real time from SQL Server. Click below to record an authentic student tuition or fee collection.
                                        </p>
                                        <button
                                            type="button"
                                            className="hero-btn primary"
                                            style={{ margin: "0 auto", display: "inline-flex" }}
                                            onClick={() => handleOpenPaymentModal()}
                                        >
                                            <Plus size={15} />
                                            <span>+ Record Official Payment</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredPayments.map((rec, idx) => (
                                <tr key={rec.id}>
                                    <td style={{ color: "#94a3b8", fontWeight: 700, textAlign: "center" }}>{idx + 1}</td>
                                    <td>
                                        <span className="or-number-badge">{rec.receiptNumber}</span>
                                        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px" }}>
                                            {rec.paymentDate} • {rec.paymentTime}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="student-col-info">
                                            <strong>{rec.studentName}</strong>
                                            <span>ID: {rec.studentId} • {rec.yearLevel}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="course-badge" title={rec.courseName}>{rec.courseName}</span>
                                        {(rec.totalUnitsPaid ?? 0) > 0 && (
                                            <div style={{ marginTop: "4px" }}>
                                                <span className="subject-count-pill">{rec.totalUnitsPaid} Units Paid</span>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600, fontSize: "12.5px" }}>{rec.feeCategory}</span>
                                        {Array.isArray(rec.subjectsPaid) && rec.subjectsPaid.length > 0 && (
                                            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                                                {rec.subjectsPaid.map(s => s.code).join(", ")}
                                            </div>
                                        )}
                                        {(!rec.subjectsPaid || rec.subjectsPaid.length === 0) && Array.isArray((rec as any).particulars) && (rec as any).particulars.length > 0 && (
                                            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                                                {(rec as any).particulars.map((pt: any) => pt.description || pt.code).join(", ")}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className="payment-method-tag">
                                            {rec.paymentMethod?.includes("Cash") ? "💵" : rec.paymentMethod?.includes("GCash") || rec.paymentMethod?.includes("Maya") ? "📱" : "🏦"} {rec.paymentMethod}
                                        </span>
                                        {rec.referenceNumber && (
                                            <div style={{ fontSize: "10.5px", color: "#64748b", marginTop: "2px", fontFamily: "monospace" }}>
                                                Ref: {rec.referenceNumber}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <span className="amount-col-bold">
                                            ₱{(rec.amountPaid ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <span className={`balance-col-due ${rec.remainingBalance === 0 ? "paid" : ""}`}>
                                            {rec.remainingBalance === 0 ? "PAID IN FULL" : `₱${(rec.remainingBalance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                        <div className="table-action-btn-group">
                                            <button
                                                type="button"
                                                className="tuition-btn-action primary"
                                                onClick={() => handlePrintReceipt(rec)}
                                                title="Print Official Receipt"
                                            >
                                                <Printer size={13} />
                                                <span>Receipt</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="tuition-btn-action"
                                                onClick={() => setSelectedReceipt(rec)}
                                                title="View Receipt Details"
                                            >
                                                <Eye size={13} />
                                            </button>
                                            <button
                                                type="button"
                                                className="tuition-btn-action danger"
                                                style={{ color: "#ef4444" }}
                                                onClick={() => handleDeletePayment(rec)}
                                                title="Delete Payment Transaction"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* RECORD PAYMENT MODAL */}
            {isPaymentModalOpen && (
                <div className="tuition-modal-overlay" onClick={() => setIsPaymentModalOpen(false)}>
                    <div className="tuition-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="tuition-modal-header">
                            <div>
                                <h3 className="tuition-modal-title">Record Student Tuition Payment</h3>
                                <div className="tuition-modal-sub">Accept student payments via Cash, GCash, Bank Transfer, Maya or Scholarship with Official Receipt</div>
                            </div>
                            <button type="button" className="tuition-modal-close" onClick={() => setIsPaymentModalOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>

                        <form
                            className="tuition-modal-body"
                            onSubmit={e => {
                                e.preventDefault();
                                handleSavePayment(false);
                            }}
                        >
                            {/* Student Selection */}
                            <div className="tuition-form-group full">
                                <label>Student Enrollee Information *</label>
                                {studentFinancials.size > 0 ? (
                                    <div style={{ marginBottom: "8px" }}>
                                        <select
                                            value={formStudentId}
                                            onChange={e => handleSelectStudentForPayment(e.target.value)}
                                        >
                                            <option value="">-- Choose Registered Student from Database --</option>
                                            {Array.from(studentFinancials.entries()).map(([sid, fin]) => (
                                                <option key={sid} value={sid}>
                                                    {fin.name} ({sid}) • {fin.course}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : null}

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "10px" }}>
                                    <div>
                                        <label style={{ fontSize: "11px", color: "#64748b" }}>Student ID #</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. STD-2026-0001"
                                            value={formStudentId}
                                            onChange={e => setFormStudentId(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: "11px", color: "#64748b" }}>Student Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Bro. John Mark Santos"
                                            value={formStudentName}
                                            onChange={e => setFormStudentName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="tuition-form-group full">
                                <label>Academic Program / Course Degree *</label>
                                <select
                                    value={formCourseName}
                                    onChange={e => setFormCourseName(e.target.value)}
                                    required
                                >
                                    {courses.map(c => (
                                        <option key={c.id} value={c.name}>
                                            {c.name} ({c.code})
                                        </option>
                                    ))}
                                    <option value="Certificate in Biblical Studies (CBS)">Certificate in Biblical Studies (CBS)</option>
                                    <option value="Diploma in Pastoral Studies (DPS)">Diploma in Pastoral Studies (DPS)</option>
                                    <option value="Associate in Ministerial Leadership & Theology (AML)">Associate in Ministerial Leadership & Theology (AML)</option>
                                    <option value="Bachelor of Theology (B.Th.)">Bachelor of Theology (B.Th.)</option>
                                    <option value="Master of Divinity (M.Div.)">Master of Divinity (M.Div.)</option>
                                    <option value="Doctor of Theology (Th.D.)">Doctor of Theology (Th.D.)</option>
                                </select>
                            </div>

                            {/* Live Student Assessment Stats Preview */}
                            <div className="student-assessment-preview">
                                <div className="preview-stat-item">
                                    <span>Program / Course:</span>
                                    <strong style={{ fontSize: "13.5px" }}>{formCourseName || "Theology Program"}</strong>
                                </div>
                                <div className="preview-stat-item">
                                    <span>Total Units Load:</span>
                                    <strong>{modalCalculations.paidUnitsCount} Units</strong>
                                </div>
                                <div className="preview-stat-item">
                                    <span>Outstanding Balance:</span>
                                    <strong style={{ color: "#dc2626" }}>₱{modalCalculations.previousBalance.toLocaleString()}</strong>
                                </div>
                                <div className="preview-stat-item">
                                    <span>Remaining After Payment:</span>
                                    <strong style={{ color: modalCalculations.newBalance === 0 ? "#16a34a" : "#0284c7" }}>
                                        ₱{modalCalculations.newBalance.toLocaleString()}
                                    </strong>
                                </div>
                            </div>

                            {/* Fee Category & Cohort Term */}
                            <div className="tuition-form-row">
                                <div className="tuition-form-group">
                                    <label>Fee Category Allocation *</label>
                                    <select
                                        value={formFeeCategory}
                                        onChange={e => setFormFeeCategory(e.target.value as FeeCategory)}
                                    >
                                        <option value="Tuition & Subject Units">Tuition & Enrolled Course Units</option>
                                        <option value="Matriculation / Registration">Matriculation / Registration Fee (₱1,000)</option>
                                        <option value="Modular Study Materials">Modular Syllabus & Binders (₱750)</option>
                                        <option value="Graduation & Clearance">Graduation & Clearance Fee (₱2,500)</option>
                                        <option value="Special Assessment">Special Assessment / Other</option>
                                    </select>
                                </div>

                                <div className="tuition-form-group">
                                    <label>Academic Term / Cohort</label>
                                    <select
                                        value={formTermCohort}
                                        onChange={e => setFormTermCohort(e.target.value)}
                                    >
                                        <option value="1st Trimester 2026">1st Trimester 2026 (Jan - Apr)</option>
                                        <option value="2nd Trimester 2026">2nd Trimester 2026 (May - Aug)</option>
                                        <option value="3rd Trimester 2026">3rd Trimester 2026 (Sep - Dec)</option>
                                        <option value="Modular Weekend Cohort">Modular Weekend Field Cohort</option>
                                    </select>
                                </div>
                            </div>

                            <div className="tuition-form-row">
                                <div className="tuition-form-group">
                                    <label>Academic Year Level</label>
                                    <select
                                        value={formYearLevel}
                                        onChange={e => setFormYearLevel(e.target.value)}
                                    >
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="4th Year">4th Year</option>
                                        <option value="Modular Cohort">Modular Cohort</option>
                                    </select>
                                </div>
                                <div className="tuition-form-group">
                                    <label>Tuition Rate Per Unit (₱)</label>
                                    <input
                                        type="number"
                                        min="100"
                                        step="50"
                                        value={formRatePerUnit}
                                        onChange={e => setFormRatePerUnit(parseFloat(e.target.value) || 500)}
                                    />
                                </div>
                            </div>

                            {/* Enrolled Subjects Checkbox Picker (If Tuition) */}
                            {formFeeCategory === "Tuition & Subject Units" && (
                                <div className="tuition-form-group full">
                                    <label>Select Enrolled Subjects Paid For ({formSelectedSubjectCodes.length} Selected):</label>
                                    <div className="subject-multiselect-box">
                                        {allSubjects.map(sub => {
                                            const isSelected = formSelectedSubjectCodes.includes(sub.code);
                                            return (
                                                <div
                                                    key={sub.code}
                                                    className={`subject-multiselect-item ${isSelected ? "active" : ""}`}
                                                    onClick={() => {
                                                        setFormSelectedSubjectCodes(prev =>
                                                            isSelected ? prev.filter(c => c !== sub.code) : [...prev, sub.code]
                                                        );
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {}}
                                                    />
                                                    <strong style={{ minWidth: "90px" }}>{sub.code}</strong>
                                                    <span style={{ flex: 1 }}>{sub.title}</span>
                                                    <span style={{ fontWeight: 700, color: "#1e3a8a" }}>
                                                        {sub.units} Units (₱{sub.units * formRatePerUnit})
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Payment Method & Reference */}
                            <div className="tuition-form-row">
                                <div className="tuition-form-group">
                                    <label>Payment Method Channel *</label>
                                    <select
                                        value={formPaymentMethod}
                                        onChange={e => setFormPaymentMethod(e.target.value as PaymentMethod)}
                                        required
                                    >
                                        <option value="Cash">💵 Cash (Cashier Counter)</option>
                                        <option value="GCash">📱 GCash E-Wallet</option>
                                        <option value="Maya">📱 Maya E-Wallet</option>
                                        <option value="Bank Transfer (BDO)">🏦 Bank Transfer - BDO Unibank</option>
                                        <option value="Bank Transfer (BPI)">🏦 Bank Transfer - BPI</option>
                                        <option value="Bank Transfer (Metrobank)">🏦 Bank Transfer - Metrobank</option>
                                        <option value="Pastoral Scholarship / Study Grant">📜 Pastoral Study Grant / Scholarship</option>
                                    </select>
                                </div>

                                <div className="tuition-form-group">
                                    <label>
                                        {formPaymentMethod === "Cash" ? "Cashier Receipt Slip #" : "Reference / Transaction # *"}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={formPaymentMethod === "Cash" ? "e.g. CSH-2026-001" : "e.g. GCash Ref 9028374619"}
                                        value={formReferenceNumber}
                                        onChange={e => setFormReferenceNumber(e.target.value)}
                                        required={formPaymentMethod !== "Cash"}
                                    />
                                </div>
                            </div>

                            {/* E-Wallet & Bank Transfer Account Callout */}
                            {formPaymentMethod !== "Cash" && (
                                <div className="channel-info-callout">
                                    {formPaymentMethod === "GCash" && (
                                        <span><strong>Official Mobile Bible School GCash:</strong> 0917-555-0199 (Mobile Bible School Admin) • Verify reference number before receipt issue.</span>
                                    )}
                                    {formPaymentMethod === "Maya" && (
                                        <span><strong>Official Maya Wallet:</strong> 0918-555-0199 (MBS Seminary Bursar) • Ensure 12-digit transaction ID is recorded.</span>
                                    )}
                                    {formPaymentMethod.startsWith("Bank") && (
                                        <span><strong>Official Bank Account:</strong> Mobile Bible School Inc. • Account: 0012-3456-7890 • Please attach bank deposit / wire confirmation code.</span>
                                    )}
                                    {formPaymentMethod.includes("Scholarship") && (
                                        <span><strong>Pastoral Study Grant:</strong> Enter scholarship board or sponsoring church voucher reference code.</span>
                                    )}
                                </div>
                            )}

                            {/* Amount & Discount */}
                            <div className="tuition-form-row">
                                <div className="tuition-form-group">
                                    <label>Amount Received (₱) *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="any"
                                        value={formCustomAmount !== "" ? formCustomAmount : modalCalculations.subtotal}
                                        onChange={e => setFormCustomAmount(e.target.value ? parseFloat(e.target.value) : "")}
                                        required
                                    />
                                </div>

                                <div className="tuition-form-group">
                                    <label>Scholarship / Discount (₱)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={formScholarshipDiscount}
                                        onChange={e => setFormScholarshipDiscount(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            {/* Cash Tendered & Change (If Cash) */}
                            {formPaymentMethod === "Cash" && (
                                <div className="tuition-form-row" style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                    <div className="tuition-form-group">
                                        <label>Cash Amount Tendered (₱)</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 5000"
                                            value={formCashTendered}
                                            onChange={e => setFormCashTendered(e.target.value ? parseFloat(e.target.value) : "")}
                                        />
                                    </div>
                                    <div className="tuition-form-group">
                                        <label>Change to Return</label>
                                        <div style={{ fontSize: "18px", fontWeight: 800, color: modalCalculations.change > 0 ? "#16a34a" : "#64748b", padding: "8px 0" }}>
                                            ₱{modalCalculations.change.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cashier & Remarks */}
                            <div className="tuition-form-row">
                                <div className="tuition-form-group">
                                    <label>Authorized Collecting Officer / Cashier</label>
                                    <input
                                        type="text"
                                        value={formCashierName}
                                        onChange={e => setFormCashierName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="tuition-form-group">
                                    <label>Payment Remarks / Notes</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Full Prelim tuition payment"
                                        value={formNotes}
                                        onChange={e => setFormNotes(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="tuition-modal-footer">
                                <button type="button" className="btn-tuition-modal secondary" onClick={() => setIsPaymentModalOpen(false)}>
                                    <X size={15} />
                                    <span>Cancel</span>
                                </button>
                                <button type="submit" className="btn-tuition-modal primary" disabled={isSaving}>
                                    {isSaving ? <RefreshCw size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                                    <span>{isSaving ? "Saving to Database..." : "Save Payment Record"}</span>
                                </button>
                                <button
                                    type="button"
                                    className="btn-tuition-modal success"
                                    onClick={() => handleSavePayment(true)}
                                    disabled={isSaving}
                                >
                                    <Printer size={15} />
                                    <span>Save & Print Official Receipt</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* RECEIPT PREVIEW MODAL */}
            {selectedReceipt && (
                <div className="tuition-modal-overlay" onClick={() => setSelectedReceipt(null)}>
                    <div className="tuition-modal-card" style={{ maxWidth: "680px" }} onClick={e => e.stopPropagation()}>
                        <div className="tuition-modal-header">
                            <div>
                                <h3 className="tuition-modal-title">Official Receipt Preview</h3>
                                <div className="tuition-modal-sub">Receipt No: {selectedReceipt.receiptNumber} • {selectedReceipt.studentName}</div>
                            </div>
                            <button type="button" className="tuition-modal-close" onClick={() => setSelectedReceipt(null)}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className="tuition-modal-body">
                            <div className="receipt-paper-view">
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #1e3a8a", paddingBottom: "12px", marginBottom: "14px" }}>
                                    <div>
                                        <h2 style={{ fontSize: "16px", fontWeight: 900, color: "#1e3a8a", margin: 0 }}>
                                            MOBILE BIBLE SCHOOL & THEOLOGICAL SEMINARY
                                        </h2>
                                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                                            Office of the University Bursar & Student Accounts
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <span className="or-number-badge" style={{ fontSize: "13px" }}>{selectedReceipt.receiptNumber}</span>
                                        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px" }}>
                                            {selectedReceipt.paymentDate} • {selectedReceipt.paymentTime}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", background: "#f8fafc", padding: "12px", borderRadius: "8px", fontSize: "12px", marginBottom: "14px" }}>
                                    <div><strong>Payor:</strong> {selectedReceipt.studentName}</div>
                                    <div><strong>Student ID:</strong> {selectedReceipt.studentId}</div>
                                    <div><strong>Program:</strong> {selectedReceipt.courseName}</div>
                                    <div>
                                        <strong>Channel:</strong> {selectedReceipt.paymentMethod}
                                        {selectedReceipt.referenceNumber ? ` (${selectedReceipt.referenceNumber})` : ""}
                                    </div>
                                </div>

                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginBottom: "14px" }}>
                                    <thead>
                                        <tr style={{ background: "#1e3a8a", color: "#fff" }}>
                                            <th style={{ padding: "6px 8px", textAlign: "left" }}>Particulars</th>
                                            <th style={{ padding: "6px 8px", textAlign: "center", width: "60px" }}>Units</th>
                                            <th style={{ padding: "6px 8px", textAlign: "right", width: "100px" }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(selectedReceipt.subjectsPaid?.length ?? 0) > 0 ? (
                                            selectedReceipt.subjectsPaid.map((s, idx) => (
                                                <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                    <td style={{ padding: "6px 8px" }}>{s.code} - {s.title}</td>
                                                    <td style={{ padding: "6px 8px", textAlign: "center" }}>{s.units}</td>
                                                    <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>
                                                        ₱{(s.amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : Array.isArray((selectedReceipt as any).particulars) && (selectedReceipt as any).particulars.length > 0 ? (
                                            (selectedReceipt as any).particulars.map((pt: any, idx: number) => (
                                                <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                    <td style={{ padding: "6px 8px" }}>{pt.description || "Tuition Settlement"}</td>
                                                    <td style={{ padding: "6px 8px", textAlign: "center" }}>{pt.units ?? "-"}</td>
                                                    <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>
                                                        ₱{(pt.amount ?? selectedReceipt.amountPaid ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                <td style={{ padding: "6px 8px" }}>{selectedReceipt.feeCategory}</td>
                                                <td style={{ padding: "6px 8px", textAlign: "center" }}>-</td>
                                                <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>
                                                    ₱{(selectedReceipt.amountPaid ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", background: "#eff6ff", padding: "12px", borderRadius: "8px" }}>
                                    <div>
                                        <span style={{ fontSize: "10.5px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Amount in Words:</span>
                                        <div style={{ fontSize: "12px", fontWeight: 800, color: "#1e3a8a", fontStyle: "italic" }}>
                                            *** {selectedReceipt.amountInWords} ***
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <span style={{ fontSize: "11px", color: "#64748b" }}>TOTAL PAID:</span>
                                        <div style={{ fontSize: "20px", fontWeight: 900, color: "#1e3a8a" }}>
                                            ₱{(selectedReceipt.amountPaid ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px", fontSize: "11.5px", color: "#64748b" }}>
                                    <div>Previous Balance: ₱{(selectedReceipt.previousBalance ?? 0).toLocaleString()}</div>
                                    <div>Remaining Balance: <strong>₱{(selectedReceipt.remainingBalance ?? 0).toLocaleString()}</strong></div>
                                </div>
                            </div>
                        </div>

                        <div className="tuition-modal-footer">
                            <button type="button" className="btn-tuition-modal secondary" onClick={() => setSelectedReceipt(null)}>
                                <X size={15} />
                                <span>Close</span>
                            </button>
                            <button
                                type="button"
                                className="btn-tuition-modal primary"
                                onClick={() => handlePrintReceipt(selectedReceipt)}
                            >
                                <Printer size={15} />
                                <span>Print Official Receipt</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TuitionFeePayment;
