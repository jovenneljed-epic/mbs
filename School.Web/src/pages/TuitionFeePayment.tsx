import React, { useState, useEffect, useMemo } from "react";
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
    Layers
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
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    feeCategory: FeeCategory;
    subjectsPaid: PaidSubjectItem[];
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
    status: "PAID" | "VERIFIED" | "VOID";
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

/* Initial realistic seminary tuition payment records */
const DEFAULT_PAYMENT_RECORDS: StudentPaymentRecord[] = [
    {
        id: "pay-1",
        receiptNumber: "MBS-OR-2026-0041",
        studentId: "MBS-2026-0012",
        studentName: "Joshua Mark Bautista",
        courseId: "bmin",
        courseName: "Bachelor of Ministry (B.Min.)",
        yearLevel: "1st Year",
        termCohort: "1st Trimester 2026",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentTime: "09:30 AM",
        paymentMethod: "GCash",
        referenceNumber: "902184756201",
        feeCategory: "Tuition & Subject Units",
        subjectsPaid: [
            { code: "HERM-101", title: "Biblical Hermeneutics", units: 3, ratePerUnit: 500, amount: 1500 },
            { code: "THEO-101", title: "Systematic Theology 1", units: 3, ratePerUnit: 500, amount: 1500 }
        ],
        totalUnitsPaid: 6,
        ratePerUnit: 500,
        subtotal: 3000,
        scholarshipDiscount: 0,
        amountPaid: 3000,
        amountInWords: "Three Thousand Pesos Only",
        previousBalance: 6000,
        remainingBalance: 3000,
        cashierName: "Rachel Santos, CPA",
        notes: "Full payment for Prelim & Midterm Units (Hermeneutics & Systematic Theo)",
        status: "PAID"
    },
    {
        id: "pay-2",
        receiptNumber: "MBS-OR-2026-0042",
        studentId: "MBS-2026-0015",
        studentName: "Hannah Grace Alcantara",
        courseId: "tha",
        courseName: "Associate in Theology (Th.A.)",
        yearLevel: "1st Year",
        termCohort: "1st Trimester 2026",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentTime: "11:15 AM",
        paymentMethod: "Cash",
        referenceNumber: "CSH-2026-089",
        feeCategory: "Tuition & Subject Units",
        subjectsPaid: [
            { code: "OT-101", title: "Old Testament Survey", units: 3, ratePerUnit: 500, amount: 1500 },
            { code: "NT-101", title: "New Testament Survey", units: 3, ratePerUnit: 500, amount: 1500 }
        ],
        totalUnitsPaid: 6,
        ratePerUnit: 500,
        subtotal: 3000,
        scholarshipDiscount: 500,
        amountPaid: 2500,
        amountInWords: "Two Thousand Five Hundred Pesos Only",
        previousBalance: 4000,
        remainingBalance: 1500,
        cashTendered: 3000,
        changeGiven: 500,
        cashierName: "Rachel Santos, CPA",
        notes: "Granted ₱500 Pastoral Family Discount. Balance ₱1,500 due before Finals.",
        status: "PAID"
    },
    {
        id: "pay-3",
        receiptNumber: "MBS-OR-2026-0043",
        studentId: "MBS-2026-0018",
        studentName: "Pastor Timothy Caleb Rivera",
        courseId: "bmin",
        courseName: "Bachelor of Ministry (B.Min.)",
        yearLevel: "2nd Year",
        termCohort: "Modular Weekend Cohort",
        paymentDate: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
        paymentTime: "02:45 PM",
        paymentMethod: "Bank Transfer (BDO)",
        referenceNumber: "BDO-DEP-994821",
        feeCategory: "Tuition & Subject Units",
        subjectsPaid: [
            { code: "MIN-101", title: "Pastoral Ministry & Leadership", units: 3, ratePerUnit: 500, amount: 1500 },
            { code: "LANG-101", title: "Biblical Greek & Hebrew Basics", units: 3, ratePerUnit: 500, amount: 1500 },
            { code: "HIST-101", title: "Church History & Apostolic Era", units: 3, ratePerUnit: 500, amount: 1500 }
        ],
        totalUnitsPaid: 9,
        ratePerUnit: 500,
        subtotal: 4500,
        scholarshipDiscount: 0,
        amountPaid: 4500,
        amountInWords: "Four Thousand Five Hundred Pesos Only",
        previousBalance: 4500,
        remainingBalance: 0,
        cashierName: "Clarissa Mendez",
        notes: "Full payment of entire semester load (9 units). Account fully cleared.",
        status: "PAID"
    },
    {
        id: "pay-4",
        receiptNumber: "MBS-OR-2026-0044",
        studentId: "MBS-2026-0021",
        studentName: "Ezekiel David Ramos",
        courseId: "cbs",
        courseName: "Certificate in Biblical Studies (CBS)",
        yearLevel: "1st Year",
        termCohort: "Online Cohort 2026",
        paymentDate: new Date(Date.now() - 86400000 * 4).toISOString().split("T")[0],
        paymentTime: "10:00 AM",
        paymentMethod: "Pastoral Scholarship / Study Grant",
        referenceNumber: "SCH-PROV-7701",
        feeCategory: "Matriculation / Registration",
        subjectsPaid: [],
        totalUnitsPaid: 0,
        ratePerUnit: 500,
        subtotal: 2000,
        scholarshipDiscount: 2000,
        amountPaid: 2000,
        amountInWords: "Two Thousand Pesos Only",
        previousBalance: 2000,
        remainingBalance: 0,
        cashierName: "Rachel Santos, CPA",
        notes: "100% Sponsored by Northern Luzon Missions Board Grant.",
        status: "PAID"
    }
];

const getToken = (): string | null => {
    const keys = ["token", "accessToken", "jwt", "authToken", "epicToken"];
    for (const key of keys) {
        const value = localStorage.getItem(key);
        if (value) return value.replace(/^Bearer\s+/i, "").trim();
    }
    return null;
};

export const TuitionFeePayment: React.FC = () => {
    // Payment records state
    const [payments, setPayments] = useState<StudentPaymentRecord[]>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch {}
        return DEFAULT_PAYMENT_RECORDS;
    });

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
    const [formCourseName, setFormCourseName] = useState("");
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
    const [formCashierName, setFormCashierName] = useState("Rachel Santos, CPA");
    const [formNotes, setFormNotes] = useState("");

    // Save to LocalStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
        } catch (e) {
            console.error("Failed to save tuition payments to localStorage:", e);
        }
    }, [payments]);

    // Load courses and enrolled students from backend/curriculum service
    useEffect(() => {
        const loadRegistry = async () => {
            try {
                const loadedCourses = courseCurriculumService.getCourses();
                setCourses(loadedCourses);

                const baseUrl = API_BASE_URL.replace(/\/+$/, "");
                const token = getToken();
                const headers = new Headers();
                if (token) headers.set("Authorization", `Bearer ${token}`);

                const resp = await fetch(`${baseUrl}/Members`, { headers });
                if (resp.ok) {
                    const data = await resp.json();
                    const list = Array.isArray(data) ? data : data.members || data.data || [];
                    setStudents(list);
                }
            } catch (err) {
                console.error("Failed to load students in Tuition Module:", err);
            }
        };

        void loadRegistry();
    }, []);

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

    // Calculate Student Financial Summary across the entire registry
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

        // 1. Populate from students
        students.forEach(std => {
            const sid = std.memberCode || `MBS-${std.memberId}`;
            const sname = [std.firstName, std.lastName].filter(Boolean).join(" ") || "Student";
            let course = std.ministry || "Bachelor of Ministry (B.Min.)";
            let subjectCodes: string[] = ["HERM-101", "THEO-101"]; // default 6 units

            if (std.photoPath && std.photoPath.startsWith("{")) {
                try {
                    const parsed = JSON.parse(std.photoPath);
                    if (parsed.courseName) course = parsed.courseName;
                    if (Array.isArray(parsed.subjects) && parsed.subjects.length > 0) {
                        subjectCodes = parsed.subjects;
                    }
                } catch {}
            }

            // Calculate units
            const units = subjectCodes.reduce((sum, code) => {
                const sub = courseCurriculumService.getSubjectByCode(code);
                return sum + (sub ? sub.units : 3);
            }, 0);

            const totalAssessment = units * 500 + 1000; // units * 500 + 1000 matriculation

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

        // 2. Add payments made so far
        payments.forEach(p => {
            if (p.status !== "VOID") {
                const entry = map.get(p.studentId);
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
                totalCollected += p.amountPaid;
                if (p.paymentDate === todayStr) todayCollected += p.amountPaid;
                if (p.paymentDate.startsWith(thisMonthStr)) monthCollected += p.amountPaid;

                if (p.paymentMethod === "Cash") cashTotal += p.amountPaid;
                else if (p.paymentMethod === "GCash" || p.paymentMethod === "Maya") gcashTotal += p.amountPaid;
                else if (p.paymentMethod.startsWith("Bank")) bankTotal += p.amountPaid;
                else if (p.paymentMethod.includes("Scholarship")) scholarshipTotal += p.amountPaid;
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
        return payments.filter(p => {
            const matchesSearch =
                p.studentName.toLowerCase().includes(search.toLowerCase()) ||
                p.studentId.toLowerCase().includes(search.toLowerCase()) ||
                p.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
                (p.referenceNumber && p.referenceNumber.toLowerCase().includes(search.toLowerCase())) ||
                p.courseName.toLowerCase().includes(search.toLowerCase());

            const matchesMethod = methodFilter === "ALL" || p.paymentMethod === methodFilter;
            const matchesCategory = categoryFilter === "ALL" || p.feeCategory === categoryFilter;

            let matchesDate = true;
            const todayStr = new Date().toISOString().split("T")[0];
            if (dateFilter === "TODAY") {
                matchesDate = p.paymentDate === todayStr;
            } else if (dateFilter === "THIS_MONTH") {
                matchesDate = p.paymentDate.startsWith(todayStr.substring(0, 7));
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
        const targetSid = presetStudentId || (studentKeys.length > 0 ? studentKeys[0] : "MBS-2026-0012");
        handleSelectStudentForPayment(targetSid);

        setFormPaymentMethod("Cash");
        setFormReferenceNumber("");
        setFormFeeCategory("Tuition & Subject Units");
        setFormScholarshipDiscount(0);
        setFormCashTendered("");
        setFormNotes("");
        setIsPaymentModalOpen(true);
    };

    // Save Payment Record
    const handleSavePayment = (autoPrint = false) => {
        if (!formStudentName || modalCalculations.netAmount <= 0) {
            alert("Please enter a valid student and payment amount.");
            return;
        }

        const now = new Date();
        const dateStr = now.toISOString().split("T")[0];
        const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        const newReceiptNum = `MBS-OR-2026-${String(payments.length + 45).padStart(4, "0")}`;

        const newRecord: StudentPaymentRecord = {
            id: `pay-${Date.now()}`,
            receiptNumber: newReceiptNum,
            studentId: formStudentId,
            studentName: formStudentName,
            courseName: formCourseName,
            yearLevel: formYearLevel,
            termCohort: formTermCohort,
            paymentDate: dateStr,
            paymentTime: timeStr,
            paymentMethod: formPaymentMethod,
            referenceNumber: formReferenceNumber.trim() || undefined,
            feeCategory: formFeeCategory,
            subjectsPaid: modalCalculations.paidItems,
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
            cashierName: formCashierName,
            notes: formNotes.trim() || undefined,
            status: "PAID"
        };

        setPayments(prev => [newRecord, ...prev]);
        setIsPaymentModalOpen(false);

        if (autoPrint) {
            handlePrintReceipt(newRecord);
        } else {
            setSelectedReceipt(newRecord);
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
            particulars: rec.subjectsPaid.length > 0
                ? rec.subjectsPaid.map(s => ({
                      description: `${s.code} - ${s.title}`,
                      units: s.units,
                      rate: s.ratePerUnit,
                      amount: s.amount
                  }))
                : [
                      {
                          description: rec.feeCategory,
                          amount: rec.amountPaid
                      }
                  ],
            subtotal: rec.subtotal,
            discount: rec.scholarshipDiscount,
            amountPaid: rec.amountPaid,
            amountInWords: rec.amountInWords,
            previousBalance: rec.previousBalance,
            remainingBalance: rec.remainingBalance,
            cashierName: rec.cashierName,
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
                `₱${p.amountPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                `₱${p.remainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
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
                                <td colSpan={9} style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                                    <Receipt size={40} style={{ margin: "0 auto 10px auto", color: "#94a3b8", display: "block" }} />
                                    No tuition payment records found matching your filter.
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
                                        {rec.totalUnitsPaid > 0 && (
                                            <div style={{ marginTop: "4px" }}>
                                                <span className="subject-count-pill">{rec.totalUnitsPaid} Units Paid</span>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600, fontSize: "12.5px" }}>{rec.feeCategory}</span>
                                        {rec.subjectsPaid.length > 0 && (
                                            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                                                {rec.subjectsPaid.map(s => s.code).join(", ")}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className="payment-method-tag">
                                            {rec.paymentMethod.includes("Cash") ? "💵" : rec.paymentMethod.includes("GCash") || rec.paymentMethod.includes("Maya") ? "📱" : "🏦"} {rec.paymentMethod}
                                        </span>
                                        {rec.referenceNumber && (
                                            <div style={{ fontSize: "10.5px", color: "#64748b", marginTop: "2px", fontFamily: "monospace" }}>
                                                Ref: {rec.referenceNumber}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <span className="amount-col-bold">
                                            ₱{rec.amountPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <span className={`balance-col-due ${rec.remainingBalance === 0 ? "paid" : ""}`}>
                                            {rec.remainingBalance === 0 ? "PAID IN FULL" : `₱${rec.remainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
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
                                <label>Select Enrolled Student *</label>
                                <select
                                    value={formStudentId}
                                    onChange={e => handleSelectStudentForPayment(e.target.value)}
                                    required
                                >
                                    {Array.from(studentFinancials.entries()).map(([sid, fin]) => (
                                        <option key={sid} value={sid}>
                                            {fin.name} ({sid}) • {fin.course} • Bal: ₱{fin.balance.toLocaleString()}
                                        </option>
                                    ))}
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
                                <button type="submit" className="btn-tuition-modal primary">
                                    <CheckCircle2 size={15} />
                                    <span>Save Payment Record</span>
                                </button>
                                <button
                                    type="button"
                                    className="btn-tuition-modal success"
                                    onClick={() => handleSavePayment(true)}
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
                                        {selectedReceipt.subjectsPaid.length > 0 ? (
                                            selectedReceipt.subjectsPaid.map((s, idx) => (
                                                <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                    <td style={{ padding: "6px 8px" }}>{s.code} - {s.title}</td>
                                                    <td style={{ padding: "6px 8px", textAlign: "center" }}>{s.units}</td>
                                                    <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>
                                                        ₱{s.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                <td style={{ padding: "6px 8px" }}>{selectedReceipt.feeCategory}</td>
                                                <td style={{ padding: "6px 8px", textAlign: "center" }}>-</td>
                                                <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>
                                                    ₱{selectedReceipt.amountPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
                                            ₱{selectedReceipt.amountPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px", fontSize: "11.5px", color: "#64748b" }}>
                                    <div>Previous Balance: ₱{selectedReceipt.previousBalance.toLocaleString()}</div>
                                    <div>Remaining Balance: <strong>₱{selectedReceipt.remainingBalance.toLocaleString()}</strong></div>
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
