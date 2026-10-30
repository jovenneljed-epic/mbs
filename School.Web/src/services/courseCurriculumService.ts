import axios from "axios";
import { API_BASE_URL } from "../config";
/* =========================================================
   COURSE & CURRICULUM MANAGEMENT SERVICE
   Mobile Bible School & Theological Seminary Management System
   Authentic curriculum matching official catalog:
   - Certificate Level: Biblical Studies, Applied AI, Digital Arts
   - Diploma Level: Diploma in Pastoral Studies
   - Associate Degree: Ministerial Leadership & Theology, Biblical Naturopathy
   - Bachelor Degree: Bachelor of Theology, AB Worship Ministry & Music Arts, AB Biblical Naturopathy
   - Masteral Degree: Master of Theology, Master of Divinity, MABPSY Biblical Psychology
   - Doctorate Degree: Doctor of Theology (Genesis 1-11, Revelation, Soteriology, Ethics, Pastoral Theology, Dissertation)
   - Specialized & Bridge: BCCST Systematic Theology, LLP Ladderized Learning, Honorary Conferment
========================================================= */

export type ModeOfLearningType =
    | "Modular Field Cohort"
    | "Hybrid Cloud / Offline Sync"
    | "Weekend Intensive"
    | "Online Distance Learning"
    | "On-Campus Resident"
    | string;

export interface CourseSubject {
    code: string;
    title: string;
    units: number;
    lectureHours?: number;
    labHours?: number;
    schedule: string;
    room: string;
    instructor: string;
    modeOfLearning?: ModeOfLearningType;
    prerequisite?: string;
    yearLevel?: string;
}

/* =========================================================
   OFFICIAL PRESCRIBED THEOLOGICAL SUBJECTS CATALOG
========================================================= */

export interface PrescribedSubject {
    code: string;
    title: string;
    units: number;
    yearLevel: string;
    category: string;
}

export const PRESCRIBED_THEOLOGICAL_SUBJECTS: PrescribedSubject[] = [
    // CBS 100 Series (Certificate in Biblical Studies)
    { code: "CBS 101", title: "Life of Christ & Synoptic Gospels", units: 3, yearLevel: "1st Year", category: "Certificate in Biblical Studies (CBS)" },
    { code: "CBS 102", title: "Old Testament Survey & Pentateuch", units: 3, yearLevel: "1st Year", category: "Certificate in Biblical Studies (CBS)" },
    { code: "CBS 103", title: "New Testament Survey & Apostolic Epistles", units: 3, yearLevel: "1st Year", category: "Certificate in Biblical Studies (CBS)" },
    { code: "CBS 104", title: "Biblical Hermeneutics & Inductive Exegesis", units: 3, yearLevel: "1st Year", category: "Certificate in Biblical Studies (CBS)" },
    { code: "CBS 105", title: "Homiletics & Expository Preaching", units: 3, yearLevel: "1st Year", category: "Certificate in Biblical Studies (CBS)" },

    // AI 100 Series (Applied AI in Ministry)
    { code: "AI 101", title: "Fundamentals of Applied AI & Ethics for Christian Ministry", units: 3, yearLevel: "1st Year", category: "Applied AI Course" },
    { code: "AI 102", title: "AI-Assisted Bible Exegesis & Theological Research Tools", units: 3, yearLevel: "1st Year", category: "Applied AI Course" },
    { code: "AI 103", title: "Digital Evangelism, Prompt Engineering & Automated Media Systems", units: 3, yearLevel: "1st Year", category: "Applied AI Course" },
    { code: "AI 104", title: "Church Data Administration & Intelligent Ministry Workflows", units: 3, yearLevel: "1st Year", category: "Applied AI Course" },

    // DA 100 Series (Digital Arts Short Term Course)
    { code: "DA 101", title: "Church Graphic Design & Visual Communication", units: 3, yearLevel: "1st Year", category: "Digital Arts Short Term Course" },
    { code: "DA 102", title: "Audio Production & Acoustic Sound Engineering for Worship", units: 3, yearLevel: "1st Year", category: "Digital Arts Short Term Course" },
    { code: "DA 103", title: "Video Production, Live Stream Broadcasting & Post-Editing", units: 3, yearLevel: "1st Year", category: "Digital Arts Short Term Course" },
    { code: "DA 104", title: "Digital Storytelling & Church Social Media Management", units: 3, yearLevel: "1st Year", category: "Digital Arts Short Term Course" },

    // DPS 200 Series (Diploma in Pastoral Studies)
    { code: "DPS 201", title: "Systematic Theology I (Theology Proper & Bibliology)", units: 3, yearLevel: "2nd Year", category: "Diploma in Pastoral Studies (DPS)" },
    { code: "DPS 202", title: "Systematic Theology II (Christology & Soteriology)", units: 3, yearLevel: "2nd Year", category: "Diploma in Pastoral Studies (DPS)" },
    { code: "DPS 203", title: "Christian Education & Discipleship Foundations", units: 3, yearLevel: "2nd Year", category: "Diploma in Pastoral Studies (DPS)" },
    { code: "DPS 204", title: "Pastoral Ministry & Church Planting Practicum", units: 3, yearLevel: "2nd Year", category: "Diploma in Pastoral Studies (DPS)" },
    { code: "DPS 205", title: "Expository Preaching & Pastoral Administration", units: 3, yearLevel: "2nd Year", category: "Diploma in Pastoral Studies (DPS)" },

    // AML 300 Series (Associate in Ministerial Leadership & Theology)
    { code: "AML 301", title: "Christian Ethics & Pastoral Morality", units: 3, yearLevel: "2nd Year", category: "Associate in Ministerial Leadership (AML)" },
    { code: "AML 302", title: "Theology of Worship & Church Music", units: 3, yearLevel: "2nd Year", category: "Associate in Ministerial Leadership (AML)" },
    { code: "AML 303", title: "Biblical Pastoral Counseling & Soul Care", units: 3, yearLevel: "2nd Year", category: "Associate in Ministerial Leadership (AML)" },
    { code: "AML 304", title: "Church Planting & Strategic Growth Dynamics", units: 3, yearLevel: "2nd Year", category: "Associate in Ministerial Leadership (AML)" },
    { code: "AML 305", title: "Eschatology & Biblical Prophecy", units: 3, yearLevel: "2nd Year", category: "Associate in Ministerial Leadership (AML)" },

    // BN Series (Biblical Naturopathy - Associate & Bachelor)
    { code: "BN 201", title: "Biblical Foundations of Health & Divine Wellness", units: 3, yearLevel: "2nd Year", category: "Biblical Naturopathy" },
    { code: "BN 202", title: "Botanical Herbs & Nutrition in Sacred Scripture", units: 3, yearLevel: "2nd Year", category: "Biblical Naturopathy" },
    { code: "BN 203", title: "Practical Naturopathic Lifestyle & Disease Prevention", units: 3, yearLevel: "2nd Year", category: "Biblical Naturopathy" },
    { code: "BN 204", title: "Community Health Evangelism & Medical Missionary Work", units: 3, yearLevel: "2nd Year", category: "Biblical Naturopathy" },
    { code: "BN 301", title: "Advanced Biblical Naturopathy & Physiological Healing", units: 3, yearLevel: "3rd Year", category: "Biblical Naturopathy" },
    { code: "BN 302", title: "Scriptural Nutrition, Fasting & Botanical Formulations", units: 3, yearLevel: "3rd Year", category: "Biblical Naturopathy" },
    { code: "BN 401", title: "Hydrotherapy, Natural Therapies & Clinical Assessment", units: 3, yearLevel: "4th Year", category: "Biblical Naturopathy" },
    { code: "BN 402", title: "Wellness Center Administration & Field Clinical Practicum", units: 3, yearLevel: "4th Year", category: "Biblical Naturopathy" },

    // BTH 400 Series (Bachelor of Theology)
    { code: "BTH 401", title: "Pastoral Theology & Ministerial Ethics", units: 3, yearLevel: "4th Year", category: "Bachelor of Theology (B.Th.)" },
    { code: "BTH 402", title: "Ecclesiology & Biblical Church Governance", units: 3, yearLevel: "4th Year", category: "Bachelor of Theology (B.Th.)" },
    { code: "BTH 403", title: "Pauline Epistles & Advanced Exegesis", units: 3, yearLevel: "4th Year", category: "Bachelor of Theology (B.Th.)" },
    { code: "BTH 404", title: "John-in-Depth & Johannine Literature", units: 3, yearLevel: "4th Year", category: "Bachelor of Theology (B.Th.)" },
    { code: "BTH 405", title: "Introduction to Global Missions & Cross-Cultural Ministry", units: 3, yearLevel: "4th Year", category: "Bachelor of Theology (B.Th.)" },

    // WMA Series (AB Worship Ministry and Music Arts)
    { code: "WMA 101", title: "Biblical Theology of Praise & Worship", units: 3, yearLevel: "1st Year", category: "AB Worship Ministry & Music Arts" },
    { code: "WMA 201", title: "Music Theory, Harmony & Directing for Church Leaders", units: 3, yearLevel: "2nd Year", category: "AB Worship Ministry & Music Arts" },
    { code: "WMA 301", title: "Worship Service Planning & Liturgical Leadership", units: 3, yearLevel: "3rd Year", category: "AB Worship Ministry & Music Arts" },
    { code: "WMA 302", title: "Audio Engineering, Acoustics & Stage Management", units: 3, yearLevel: "3rd Year", category: "AB Worship Ministry & Music Arts" },
    { code: "WMA 401", title: "Christian Songwriting, Composition & Team Dynamics", units: 3, yearLevel: "4th Year", category: "AB Worship Ministry & Music Arts" },
    { code: "WMA 402", title: "Worship Ministry Practicum & Senior Recital", units: 3, yearLevel: "4th Year", category: "AB Worship Ministry & Music Arts" },

    // MTH 500 Series (Master of Theology - Th.M.)
    { code: "MTH 501", title: "Biblical Greek Syntax & Advanced Exegesis", units: 3, yearLevel: "Postgraduate", category: "Master of Theology (Th.M.)" },
    { code: "MTH 502", title: "Biblical Hebrew Grammar & Historical Syntax", units: 3, yearLevel: "Postgraduate", category: "Master of Theology (Th.M.)" },
    { code: "MTH 503", title: "Advanced Biblical Hermeneutics & Exegetical Methodology", units: 3, yearLevel: "Postgraduate", category: "Master of Theology (Th.M.)" },
    { code: "MTH 504", title: "Reformation Theology & Historical Dogmatics", units: 3, yearLevel: "Postgraduate", category: "Master of Theology (Th.M.)" },
    { code: "MTH 505", title: "Theology and Psychology in Soul Care", units: 3, yearLevel: "Postgraduate", category: "Master of Theology (Th.M.)" },

    // MMIN 600 Series (Master of Divinity - M.Div.)
    { code: "MMIN 601", title: "Christian Apologetics in the 21st Century", units: 3, yearLevel: "Postgraduate", category: "Master of Divinity (M.Div.)" },
    { code: "MMIN 602", title: "Church Management & Strategic Administration I", units: 3, yearLevel: "Postgraduate", category: "Master of Divinity (M.Div.)" },
    { code: "MMIN 603", title: "Church Management & Strategic Administration II", units: 3, yearLevel: "Postgraduate", category: "Master of Divinity (M.Div.)" },
    { code: "MMIN 604", title: "Pastoral Worship Leadership & Ordinances", units: 3, yearLevel: "Postgraduate", category: "Master of Divinity (M.Div.)" },
    { code: "MMIN 605", title: "Music Directing and Church Program Management", units: 3, yearLevel: "Postgraduate", category: "Master of Divinity (M.Div.)" },
    { code: "MMIN 606", title: "Advanced Expository Preaching Colloquium", units: 3, yearLevel: "Postgraduate", category: "Master of Divinity (M.Div.)" },

    // BP 600 Series (Master of Arts in Biblical Psychology - MABPSY)
    { code: "BP 601", title: "Biblical Foundations of Psychology & the Inner Man", units: 3, yearLevel: "Postgraduate", category: "Biblical Psychology (MABPSY)" },
    { code: "BP 602", title: "Biblical Diagnosis vs. Secular Psychopathology", units: 3, yearLevel: "Postgraduate", category: "Biblical Psychology (MABPSY)" },
    { code: "BP 603", title: "Crisis Counseling, Trauma & Family Restoration", units: 3, yearLevel: "Postgraduate", category: "Biblical Psychology (MABPSY)" },
    { code: "BP 604", title: "Neuroscience & Biblical Renewal of the Mind", units: 3, yearLevel: "Postgraduate", category: "Biblical Psychology (MABPSY)" },
    { code: "BP 605", title: "Clinical Pastoral Counseling Practicum & Supervised Case Studies", units: 3, yearLevel: "Postgraduate", category: "Biblical Psychology (MABPSY)" },

    // DOC 700 Series (Doctor of Theology - Th.D. Official Menu Subjects)
    { code: "DOC 701", title: "Theological Study of Genesis 1-11", units: 3, yearLevel: "Doctorate", category: "Doctor of Theology (Th.D.)" },
    { code: "DOC 702", title: "Parallel Study of Revelation in Different Perspectives", units: 3, yearLevel: "Doctorate", category: "Doctor of Theology (Th.D.)" },
    { code: "DOC 703", title: "The Spectrum of Christian Soteriology", units: 3, yearLevel: "Doctorate", category: "Doctor of Theology (Th.D.)" },
    { code: "DOC 704", title: "21st Century Christian Ethics", units: 3, yearLevel: "Doctorate", category: "Doctor of Theology (Th.D.)" },
    { code: "DOC 705", title: "Pastoral Theology Course for 21st Century Church", units: 3, yearLevel: "Doctorate", category: "Doctor of Theology (Th.D.)" },
    { code: "DOC 706", title: "Doctorate Program Requirement & Theological Research Methods", units: 3, yearLevel: "Doctorate", category: "Doctor of Theology (Th.D.)" },
    { code: "DOC 707", title: "Dissertation Options & Research Proposal Defense", units: 3, yearLevel: "Doctorate", category: "Doctor of Theology (Th.D.)" },
    { code: "DOC 708", title: "Dissertation Format, Exegesis & Writing", units: 3, yearLevel: "Doctorate", category: "Doctor of Theology (Th.D.)" },
    { code: "DOC 709", title: "Thesis Defense Evaluation Rubric & Oral Examination", units: 3, yearLevel: "Doctorate", category: "Doctor of Theology (Th.D.)" },
    { code: "DOC 710", title: "Final Synthesis Formats & Doctoral Conferment", units: 3, yearLevel: "Doctorate", category: "Doctor of Theology (Th.D.)" },

    // BCCST Series (Bridge Course Complete Systematic Theology)
    { code: "BCCST 101", title: "Complete Systematic Theology: Bibliology & Theology Proper", units: 3, yearLevel: "Bridge", category: "BCCST Bridge Course" },
    { code: "BCCST 102", title: "Complete Systematic Theology: Christology & Pneumatology", units: 3, yearLevel: "Bridge", category: "BCCST Bridge Course" },
    { code: "BCCST 103", title: "Complete Systematic Theology: Anthropology, Hamartiology & Soteriology", units: 3, yearLevel: "Bridge", category: "BCCST Bridge Course" },
    { code: "BCCST 104", title: "Complete Systematic Theology: Ecclesiology, Israelology & Eschatology", units: 3, yearLevel: "Bridge", category: "BCCST Bridge Course" },

    // LLP Series (Ladderized Learning Program)
    { code: "LLP 101", title: "Core Theological Milestone Foundations", units: 3, yearLevel: "Ladderized", category: "Ladderized Learning Program (LLP)" },
    { code: "LLP 201", title: "Applied Ministerial Practicum & Field Leadership", units: 3, yearLevel: "Ladderized", category: "Ladderized Learning Program (LLP)" },
    { code: "LLP 301", title: "Independent Biblical Research & Credit Synthesis", units: 3, yearLevel: "Ladderized", category: "Ladderized Learning Program (LLP)" },

    // HON Series (Honorary Conferment)
    { code: "HON 901", title: "Ministerial Life Synthesis & Portfolio Review", units: 3, yearLevel: "Honorary", category: "Honorary Degree Conferment" },
    { code: "HON 902", title: "Kingdom Leadership Colloquium & Special Conferment", units: 3, yearLevel: "Honorary", category: "Honorary Degree Conferment" }
];

/* =========================================================
   FACULTY INSTRUCTOR ROSTER HELPER
========================================================= */

export interface FacultyInstructorOption {
    fullName: string;
    academicRank?: string;
    department?: string;
    email?: string;
}

export function getSystemFacultyList(): FacultyInstructorOption[] {
    const list: FacultyInstructorOption[] = [];
    const seen = new Set<string>();

    const add = (name: string, rank?: string, dept?: string, email?: string) => {
        const clean = name.trim();
        if (!clean || seen.has(clean.toLowerCase())) return;
        seen.add(clean.toLowerCase());
        list.push({ fullName: clean, academicRank: rank, department: dept, email });
    };

    // 1. Load active roster from Teachers & Faculty Corner in localStorage
    try {
        const raw = localStorage.getItem("mbs_faculty_staff_catalog_v2");
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                parsed.forEach((f: any) => {
                    const honorific = f.honorific ? `${f.honorific} ` : "";
                    const suffix = f.suffix ? `, ${f.suffix}` : "";
                    const full = `${honorific}${f.firstName || ""} ${f.lastName || ""}${suffix}`.trim();
                    add(full, f.academicRank || f.specialization, f.department, f.email);
                });
            }
        }
    } catch {}

    // 2. Official Mobile Bible School & Theological Seminary Faculty
    add("Rev. Dr. Rhoderick De Vera, Th.D.", "President & Dean of Academic Affairs", "Mobile Bible School & Theological Seminary");
    add("Bishop Marcus Reed, D.Min.", "Director of Practical Ministry & Church Governance", "Department of Pastoral Ministry & Missions");
    add("Prof. Nathan Cole, M.Div.", "Associate Professor of Old Testament Literature", "Department of Biblical Studies");
    add("Dr. Elizabeth Grace, Ph.D.", "Professor of New Testament Exegesis & Koine Greek", "School of Theology & Biblical Languages");
    add("Pastor David Morales, D.Min.", "Senior Lecturer in Pastoral Care & Church Planting", "Department of Pastoral Ministry");
    add("Prof. Aaron Levi, M.A.", "Lecturer in Biblical Hebrew & Semitic Syntax", "Biblical Languages Hub");
    add("Dr. Deborah Morales, Ph.D.", "Director of Biblical Psychology & Counseling", "Center for Biblical Psychology");
    add("Rev. Timothy Hudson, D.Miss.", "Senior Lecturer in Global Missions & Outreach", "Department of Missions");
    add("Rev. Jonathan Edwards, Th.M.", "Lecturer in Systematic Theology & Dogmatics", "Department of Systematic Theology");

    return list;
}

export interface CourseProgram {
    id: string;
    code: string;
    name: string;
    department: string;
    degreeLevel: "Undergraduate" | "Graduate / Seminary" | "Diploma" | "Certificate" | "Associate" | "Doctorate" | "Specialized / Bridge" | "Basic Education" | string;
    totalYears: number;
    deanOrHead: string;
    modeOfLearning: ModeOfLearningType;
    paymentPerUnit: number;
    totalUnits?: number;
    description?: string;
    subjects: CourseSubject[];
}

export interface StudentEnrollmentFinancials {
    subjects: string[];
    units: number;
    courseCode?: string;
    courseName?: string;
    modeOfLearning?: string;
    paymentPerUnit: number;
    totalTuition: number;
    amountPaid: number;
    balance: number;
    paymentStatus: "PAID" | "PARTIAL" | "UNPAID";
    guardian?: string;
    guardianContact?: string;
    email?: string;
    academicStatus?: string;
    assessmentDate?: string;
}

const STORAGE_KEY = "mbs_courses_catalog_v4";

/* =========================================================
   AUTHENTIC 16 MOBILE BIBLE SCHOOL COURSES & CURRICULUM
========================================================= */

export const DEFAULT_COURSES: CourseProgram[] = [
    // 1. Certificate in Biblical Studies (CBS)
    {
        id: "cbs",
        code: "CBS",
        name: "Certificate in Biblical Studies (CBS)",
        department: "Department of Biblical & Theological Foundations",
        degreeLevel: "Certificate",
        totalYears: 1,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        modeOfLearning: "Modular Field Cohort",
        paymentPerUnit: 500,
        totalUnits: 15,
        description: "1-year foundational theological curriculum covering inductive Bible study, Old & New Testament surveys, hermeneutics, and homiletics.",
        subjects: [
            {
                code: "CBS 101",
                title: "Life of Christ & Synoptic Gospels",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 8:00 AM - 12:00 PM (Intensive)",
                room: "Field Cohort Hub • Room 101",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "1st Year"
            },
            {
                code: "CBS 102",
                title: "Old Testament Survey & Pentateuch",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 1:00 PM - 5:00 PM (Intensive)",
                room: "Field Cohort Hub • Room 101",
                instructor: "Prof. Nathan Cole, M.Div.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "1st Year"
            },
            {
                code: "CBS 103",
                title: "New Testament Survey & Apostolic Epistles",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Wednesday 6:00 PM - 8:30 PM (Evening)",
                room: "Synod Hall • Room 202",
                instructor: "Dr. Elizabeth Grace, Ph.D.",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "1st Year"
            },
            {
                code: "CBS 104",
                title: "Biblical Hermeneutics & Inductive Exegesis",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Sunday 8:00 AM - 12:00 PM (Modular)",
                room: "Theology Hall • Room 301",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "1st Year"
            },
            {
                code: "CBS 105",
                title: "Homiletics & Expository Preaching",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Sunday 1:00 PM - 5:00 PM (Modular)",
                room: "Chapel Center • Room 104",
                instructor: "Rev. Jonathan Edwards, Th.M.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "1st Year"
            }
        ]
    },

    // 2. Applied AI (Artificial Intelligence) Course
    {
        id: "cert-ai",
        code: "AI-MIN",
        name: "Applied AI (Artificial Intelligence) Course",
        department: "Center for Digital Ministry & Modern Technologies",
        degreeLevel: "Certificate",
        totalYears: 1,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        modeOfLearning: "Online Distance Learning",
        paymentPerUnit: 500,
        totalUnits: 12,
        description: "Modern technology certification teaching artificial intelligence for theological research, sermon synthesis, ministry automation, and digital evangelism.",
        subjects: [
            {
                code: "AI 101",
                title: "Fundamentals of Applied AI & Ethics for Christian Ministry",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Online Flexible / Asynchronous Modules",
                room: "Virtual Learning Hub • Cloud",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Online Distance Learning",
                yearLevel: "1st Year"
            },
            {
                code: "AI 102",
                title: "AI-Assisted Bible Exegesis & Theological Research Tools",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Online Live Discussion • Thu 7:00 PM - 9:00 PM",
                room: "Virtual Learning Hub • Cloud",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Online Distance Learning",
                yearLevel: "1st Year"
            },
            {
                code: "AI 103",
                title: "Digital Evangelism, Prompt Engineering & Automated Media Systems",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Online Flexible / Asynchronous Modules",
                room: "Virtual Learning Hub • Cloud",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Online Distance Learning",
                yearLevel: "1st Year"
            },
            {
                code: "AI 104",
                title: "Church Data Administration & Intelligent Ministry Workflows",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Online Flexible / Asynchronous Modules",
                room: "Virtual Learning Hub • Cloud",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Online Distance Learning",
                yearLevel: "1st Year"
            }
        ]
    },

    // 3. Digital Arts Short Term Course
    {
        id: "cert-da",
        code: "DIG-ART",
        name: "Digital Arts Short Term Course",
        department: "School of Christian Media & Creative Arts",
        degreeLevel: "Certificate",
        totalYears: 1,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        modeOfLearning: "Hybrid Cloud / Offline Sync",
        paymentPerUnit: 500,
        totalUnits: 12,
        description: "Hands-on multimedia short course equipping church leaders in branding, live broadcasting, multi-track audio engineering, and visual media.",
        subjects: [
            {
                code: "DA 101",
                title: "Church Graphic Design & Visual Communication",
                units: 3,
                lectureHours: 2,
                labHours: 3,
                schedule: "Saturday 1:00 PM - 5:00 PM (Intensive)",
                room: "Digital Media Lab • Room 201",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "1st Year"
            },
            {
                code: "DA 102",
                title: "Audio Production & Acoustic Sound Engineering for Worship",
                units: 3,
                lectureHours: 2,
                labHours: 3,
                schedule: "Saturday 8:00 AM - 12:00 PM (Intensive)",
                room: "Acoustics & Sound Studio",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "1st Year"
            },
            {
                code: "DA 103",
                title: "Video Production, Live Stream Broadcasting & Post-Editing",
                units: 3,
                lectureHours: 2,
                labHours: 3,
                schedule: "Sunday 2:00 PM - 6:00 PM",
                room: "Broadcast Production Suite",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "1st Year"
            },
            {
                code: "DA 104",
                title: "Digital Storytelling & Church Social Media Management",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Online Flexible / Asynchronous Modules",
                room: "Virtual Media Hub",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "1st Year"
            }
        ]
    },

    // 4. Diploma in Pastoral Studies (DPS)
    {
        id: "dps",
        code: "DPS",
        name: "Diploma in Pastoral Studies (DPS)",
        department: "Department of Pastoral Ministry & Practical Theology",
        degreeLevel: "Diploma",
        totalYears: 2,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        modeOfLearning: "Modular Field Cohort",
        paymentPerUnit: 500,
        totalUnits: 15,
        description: "2-year comprehensive diploma program developing pastors and church leaders in systematic theology, Christian education, and ministry planting.",
        subjects: [
            {
                code: "DPS 201",
                title: "Systematic Theology I (Theology Proper & Bibliology)",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Friday 6:00 PM - 9:00 PM",
                room: "Seminary Hall • Room 102",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "2nd Year"
            },
            {
                code: "DPS 202",
                title: "Systematic Theology II (Christology & Soteriology)",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 8:00 AM - 12:00 PM",
                room: "Seminary Hall • Room 102",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "2nd Year"
            },
            {
                code: "DPS 203",
                title: "Christian Education & Discipleship Foundations",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 1:00 PM - 5:00 PM",
                room: "Education Hub • Room 204",
                instructor: "Pastor David Morales, D.Min.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "2nd Year"
            },
            {
                code: "DPS 204",
                title: "Pastoral Ministry & Church Planting Practicum",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Sunday 2:00 PM - 5:00 PM",
                room: "Main Sanctuary",
                instructor: "Bishop Marcus Reed, D.Min.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "2nd Year"
            },
            {
                code: "DPS 205",
                title: "Expository Preaching & Pastoral Administration",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Sunday 9:00 AM - 12:00 PM",
                room: "Pastoral Center • Room 101",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "2nd Year"
            }
        ]
    },

    // 5. Associate in Ministerial Leadership & Theology (AML)
    {
        id: "aml",
        code: "AML",
        name: "Associate in Ministerial Leadership & Theology (AML)",
        department: "School of Practical Ministry & Church Growth",
        degreeLevel: "Associate",
        totalYears: 2,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        modeOfLearning: "Modular Field Cohort",
        paymentPerUnit: 500,
        totalUnits: 15,
        description: "2-year associate degree preparing church workers in biblical counseling, Christian ethics, eschatology, and church growth dynamics.",
        subjects: [
            {
                code: "AML 301",
                title: "Christian Ethics & Pastoral Morality",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Friday 6:00 PM - 9:00 PM",
                room: "Seminary Hall • Room 103",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "2nd Year"
            },
            {
                code: "AML 302",
                title: "Theology of Worship & Church Music",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 8:00 AM - 12:00 PM",
                room: "Worship Arts Center",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "2nd Year"
            },
            {
                code: "AML 303",
                title: "Biblical Pastoral Counseling & Soul Care",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 1:00 PM - 5:00 PM",
                room: "Counseling Suite 201",
                instructor: "Dr. Deborah Morales, Ph.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "2nd Year"
            },
            {
                code: "AML 304",
                title: "Church Planting & Strategic Growth Dynamics",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Sunday 1:00 PM - 4:00 PM",
                room: "Church Growth Lab",
                instructor: "Bishop Marcus Reed, D.Min.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "2nd Year"
            },
            {
                code: "AML 305",
                title: "Eschatology & Biblical Prophecy",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Sunday 9:00 AM - 12:00 PM",
                room: "Theology Hall • Room 302",
                instructor: "Prof. Nathan Cole, M.Div.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "2nd Year"
            }
        ]
    },

    // 6. Associate in Biblical Naturopathy
    {
        id: "assoc-bn",
        code: "AS-BN",
        name: "Associate in Biblical Naturopathy",
        department: "Institute of Biblical Health & Naturopathic Studies",
        degreeLevel: "Associate",
        totalYears: 2,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        modeOfLearning: "Hybrid Cloud / Offline Sync",
        paymentPerUnit: 500,
        totalUnits: 12,
        description: "2-year associate degree integrating biblical dietary principles, botanical herbs, natural lifestyle therapies, and community health evangelism.",
        subjects: [
            {
                code: "BN 201",
                title: "Biblical Foundations of Health & Divine Wellness",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 8:00 AM - 12:00 PM",
                room: "Health & Wellness Lab 101",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "1st Year"
            },
            {
                code: "BN 202",
                title: "Botanical Herbs & Nutrition in Sacred Scripture",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 1:00 PM - 5:00 PM",
                room: "Health & Wellness Lab 101",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "1st Year"
            },
            {
                code: "BN 203",
                title: "Practical Naturopathic Lifestyle & Disease Prevention",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Sunday 1:00 PM - 5:00 PM",
                room: "Health & Wellness Lab 101",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "2nd Year"
            },
            {
                code: "BN 204",
                title: "Community Health Evangelism & Medical Missionary Work",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Friday 6:00 PM - 9:00 PM",
                room: "Field Outreach Center",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "2nd Year"
            }
        ]
    },

    // 7. Bachelor of Theology (B.Th.)
    {
        id: "b-th",
        code: "B-TH",
        name: "Bachelor of Theology (B.Th.)",
        department: "School of Theology & Biblical Languages",
        degreeLevel: "Undergraduate",
        totalYears: 4,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        modeOfLearning: "Modular Field Cohort",
        paymentPerUnit: 500,
        totalUnits: 15,
        description: "Four-year comprehensive ministerial degree in pastoral theology, church governance, Pauline exegesis, and global missions.",
        subjects: [
            {
                code: "BTH 401",
                title: "Pastoral Theology & Ministerial Ethics",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 8:00 AM - 12:00 PM",
                room: "Theology Hall 301",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "4th Year"
            },
            {
                code: "BTH 402",
                title: "Ecclesiology & Biblical Church Governance",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 1:00 PM - 5:00 PM",
                room: "Theology Hall 301",
                instructor: "Bishop Marcus Reed, D.Min.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "4th Year"
            },
            {
                code: "BTH 403",
                title: "Pauline Epistles & Advanced Exegesis",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Sunday 1:00 PM - 5:00 PM",
                room: "Language Lab 105",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "4th Year"
            },
            {
                code: "BTH 404",
                title: "John-in-Depth & Johannine Literature",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Wednesday 6:00 PM - 9:00 PM",
                room: "Language Lab 105",
                instructor: "Prof. Nathan Cole, M.Div.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "4th Year"
            },
            {
                code: "BTH 405",
                title: "Introduction to Global Missions & Cross-Cultural Ministry",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Friday 6:00 PM - 9:00 PM",
                room: "Global Missions Hall",
                instructor: "Rev. Timothy Hudson, D.Miss.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "4th Year"
            }
        ]
    },

    // 8. AB Worship Ministry and Music Arts
    {
        id: "ab-wmma",
        code: "AB-WMMA",
        name: "AB Worship Ministry and Music Arts",
        department: "Department of Church Music & Worship Arts",
        degreeLevel: "Undergraduate",
        totalYears: 4,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        modeOfLearning: "Modular Field Cohort",
        paymentPerUnit: 500,
        totalUnits: 18,
        description: "4-year professional Bachelor of Arts degree equipping worship directors, song leaders, audio engineers, and music ministers.",
        subjects: [
            {
                code: "WMA 101",
                title: "Biblical Theology of Praise & Worship",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Friday 6:00 PM - 9:00 PM",
                room: "Worship Hall Sanctuary",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "1st Year"
            },
            {
                code: "WMA 201",
                title: "Music Theory, Harmony & Directing for Church Leaders",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 8:00 AM - 12:00 PM",
                room: "Music Conservatory Suite",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "2nd Year"
            },
            {
                code: "WMA 301",
                title: "Worship Service Planning & Liturgical Leadership",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 1:00 PM - 5:00 PM",
                room: "Music Conservatory Suite",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "3rd Year"
            },
            {
                code: "WMA 302",
                title: "Audio Engineering, Acoustics & Stage Management",
                units: 3,
                lectureHours: 2,
                labHours: 3,
                schedule: "Sunday 1:00 PM - 5:00 PM",
                room: "Live Studio Control Room",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "3rd Year"
            },
            {
                code: "WMA 401",
                title: "Christian Songwriting, Composition & Team Dynamics",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Wednesday 6:00 PM - 9:00 PM",
                room: "Studio A",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "4th Year"
            },
            {
                code: "WMA 402",
                title: "Worship Ministry Practicum & Senior Recital",
                units: 3,
                lectureHours: 1,
                labHours: 6,
                schedule: "Sunday 5:00 PM - 8:00 PM",
                room: "Main Sanctuary",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "4th Year"
            }
        ]
    },

    // 9. AB Biblical Naturopathy
    {
        id: "ab-bn",
        code: "AB-BN",
        name: "AB Biblical Naturopathy",
        department: "Institute of Biblical Health & Naturopathic Studies",
        degreeLevel: "Undergraduate",
        totalYears: 4,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        modeOfLearning: "Hybrid Cloud / Offline Sync",
        paymentPerUnit: 500,
        totalUnits: 12,
        description: "4-year undergraduate degree in natural healing, hydrotherapy, biblical lifestyle counseling, and community health centers.",
        subjects: [
            {
                code: "BN 301",
                title: "Advanced Biblical Naturopathy & Physiological Healing",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 8:00 AM - 12:00 PM",
                room: "Clinical Lab Room 202",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "3rd Year"
            },
            {
                code: "BN 302",
                title: "Scriptural Nutrition, Fasting & Botanical Formulations",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 1:00 PM - 5:00 PM",
                room: "Clinical Lab Room 202",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "3rd Year"
            },
            {
                code: "BN 401",
                title: "Hydrotherapy, Natural Therapies & Clinical Assessment",
                units: 3,
                lectureHours: 2,
                labHours: 3,
                schedule: "Sunday 1:00 PM - 5:00 PM",
                room: "Therapy & Hydro Hub",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "4th Year"
            },
            {
                code: "BN 402",
                title: "Wellness Center Administration & Field Clinical Practicum",
                units: 3,
                lectureHours: 1,
                labHours: 6,
                schedule: "Sunday 9:00 AM - 12:00 PM",
                room: "MBS Wellness Clinic",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "4th Year"
            }
        ]
    },

    // 10. Master of Theology (Th.M.)
    {
        id: "m-th",
        code: "M-TH",
        name: "Master of Theology (Th.M.)",
        department: "Graduate Seminary & Leadership Institute",
        degreeLevel: "Graduate / Seminary",
        totalYears: 2,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        modeOfLearning: "Modular Field Cohort",
        paymentPerUnit: 550,
        totalUnits: 15,
        description: "Postgraduate master's degree in Greek and Hebrew exegesis, Reformation theology, and advanced hermeneutics.",
        subjects: [
            {
                code: "MTH 501",
                title: "Biblical Greek Syntax & Advanced Exegesis",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Friday 6:00 PM - 9:00 PM",
                room: "Seminary Hall A",
                instructor: "Dr. Elizabeth Grace, Ph.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Postgraduate"
            },
            {
                code: "MTH 502",
                title: "Biblical Hebrew Grammar & Historical Syntax",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 9:00 AM - 12:00 PM",
                room: "Seminary Hall A",
                instructor: "Prof. Aaron Levi, M.A.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Postgraduate"
            },
            {
                code: "MTH 503",
                title: "Advanced Biblical Hermeneutics & Exegetical Methodology",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 1:00 PM - 4:00 PM",
                room: "Seminary Hall A",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Postgraduate"
            },
            {
                code: "MTH 504",
                title: "Reformation Theology & Historical Dogmatics",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Sunday 1:00 PM - 4:00 PM",
                room: "Seminary Hall B",
                instructor: "Rev. Jonathan Edwards, Th.M.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Postgraduate"
            },
            {
                code: "MTH 505",
                title: "Theology and Psychology in Soul Care",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Wednesday 6:00 PM - 9:00 PM",
                room: "Counseling Center 201",
                instructor: "Dr. Deborah Morales, Ph.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Postgraduate"
            }
        ]
    },

    // 11. Master of Divinity (M.Div.)
    {
        id: "m-div",
        code: "M-DIV",
        name: "Master of Divinity (M.Div.)",
        department: "Graduate Seminary & Leadership Institute",
        degreeLevel: "Graduate / Seminary",
        totalYears: 3,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        modeOfLearning: "Modular Field Cohort",
        paymentPerUnit: 550,
        totalUnits: 18,
        description: "Flagship postgraduate seminary curriculum covering advanced pastoral theology, apologetics, church management, and preaching.",
        subjects: [
            {
                code: "MMIN 601",
                title: "Christian Apologetics in the 21st Century",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Friday 6:00 PM - 9:00 PM",
                room: "Seminary Hall • Room 301",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Postgraduate"
            },
            {
                code: "MMIN 602",
                title: "Church Management & Strategic Administration I",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 8:00 AM - 12:00 PM",
                room: "Seminary Hall • Room 301",
                instructor: "Bishop Marcus Reed, D.Min.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Postgraduate"
            },
            {
                code: "MMIN 603",
                title: "Church Management & Strategic Administration II",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 1:00 PM - 5:00 PM",
                room: "Seminary Hall • Room 301",
                instructor: "Bishop Marcus Reed, D.Min.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Postgraduate"
            },
            {
                code: "MMIN 604",
                title: "Pastoral Worship Leadership & Ordinances",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Sunday 9:00 AM - 12:00 PM",
                room: "Main Sanctuary",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Postgraduate"
            },
            {
                code: "MMIN 605",
                title: "Music Directing and Church Program Management",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Sunday 1:00 PM - 4:00 PM",
                room: "Worship Arts Center",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Postgraduate"
            },
            {
                code: "MMIN 606",
                title: "Advanced Expository Preaching Colloquium",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Wednesday 6:00 PM - 9:00 PM",
                room: "Chapel Center",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Postgraduate"
            }
        ]
    },

    // 12. Master of Arts in Biblical Psychology (MABPSY)
    {
        id: "mabpsy",
        code: "MABPSY",
        name: "Master of Arts in Biblical Psychology (MABPSY)",
        department: "Center for Biblical Psychology & Christian Counseling",
        degreeLevel: "Graduate / Seminary",
        totalYears: 2,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        modeOfLearning: "Hybrid Cloud / Offline Sync",
        paymentPerUnit: 550,
        totalUnits: 15,
        description: "Graduate degree addressing emotional and psychological restoration through the authority and sufficiency of God's Word.",
        subjects: [
            {
                code: "BP 601",
                title: "Biblical Foundations of Psychology & the Inner Man",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Friday 6:00 PM - 9:00 PM",
                room: "Biblical Psychology Lab",
                instructor: "Dr. Deborah Morales, Ph.D.",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "Postgraduate"
            },
            {
                code: "BP 602",
                title: "Biblical Diagnosis vs. Secular Psychopathology",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 8:00 AM - 12:00 PM",
                room: "Biblical Psychology Lab",
                instructor: "Dr. Deborah Morales, Ph.D.",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "Postgraduate"
            },
            {
                code: "BP 603",
                title: "Crisis Counseling, Trauma & Family Restoration",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 1:00 PM - 5:00 PM",
                room: "Counseling Center 102",
                instructor: "Dr. Deborah Morales, Ph.D.",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "Postgraduate"
            },
            {
                code: "BP 604",
                title: "Neuroscience & Biblical Renewal of the Mind",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Sunday 1:00 PM - 4:00 PM",
                room: "Biblical Psychology Lab",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "Postgraduate"
            },
            {
                code: "BP 605",
                title: "Clinical Pastoral Counseling Practicum & Supervised Case Studies",
                units: 3,
                lectureHours: 1,
                labHours: 6,
                schedule: "Sunday 9:00 AM - 12:00 PM",
                room: "Pastoral Clinic",
                instructor: "Dr. Deborah Morales, Ph.D.",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "Postgraduate"
            }
        ]
    },

    // 13. Doctor of Theology (Th.D.)
    {
        id: "th-d",
        code: "TH-D",
        name: "Doctor of Theology (Th.D.)",
        department: "Doctoral Research & Postgraduate Divinity School",
        degreeLevel: "Doctorate",
        totalYears: 3,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        modeOfLearning: "Modular Field Cohort",
        paymentPerUnit: 600,
        totalUnits: 30,
        description: "Highest terminal doctorate covering Genesis 1-11, Revelation, Soteriology, Christian Ethics, Pastoral Theology, and doctoral dissertation.",
        subjects: [
            {
                code: "DOC 701",
                title: "Theological Study of Genesis 1-11",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 8:00 AM - 12:00 PM (Intensive)",
                room: "Doctoral Colloquium Hall",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Doctorate"
            },
            {
                code: "DOC 702",
                title: "Parallel Study of Revelation in Different Perspectives",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 1:00 PM - 5:00 PM (Intensive)",
                room: "Doctoral Colloquium Hall",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Doctorate"
            },
            {
                code: "DOC 703",
                title: "The Spectrum of Christian Soteriology",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Sunday 9:00 AM - 12:00 PM",
                room: "Doctoral Colloquium Hall",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Doctorate"
            },
            {
                code: "DOC 704",
                title: "21st Century Christian Ethics",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Sunday 1:00 PM - 4:00 PM",
                room: "Doctoral Colloquium Hall",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Doctorate"
            },
            {
                code: "DOC 705",
                title: "Pastoral Theology Course for 21st Century Church",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Friday 6:00 PM - 9:00 PM",
                room: "Doctoral Colloquium Hall",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Doctorate"
            },
            {
                code: "DOC 706",
                title: "Doctorate Program Requirement & Theological Research Methods",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Thursday 6:00 PM - 9:00 PM",
                room: "Research & Defense Chamber",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Doctorate"
            },
            {
                code: "DOC 707",
                title: "Dissertation Options & Research Proposal Defense",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 1:00 PM - 5:00 PM",
                room: "Research & Defense Chamber",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Doctorate"
            },
            {
                code: "DOC 708",
                title: "Dissertation Format, Exegesis & Writing",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Online Independent Research Colloquium",
                room: "Doctoral Advisory Suite",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Doctorate"
            },
            {
                code: "DOC 709",
                title: "Thesis Defense Evaluation Rubric & Oral Examination",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Seminary Board of Review Schedule",
                room: "Board of Regents Chamber",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Doctorate"
            },
            {
                code: "DOC 710",
                title: "Final Synthesis Formats & Doctoral Conferment",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Academic Graduation Colloquium",
                room: "Main Auditorium",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Doctorate"
            }
        ]
    },

    // 14. BCCST: Bridge Course - Complete Systematic Theology
    {
        id: "bccst",
        code: "BCCST",
        name: "BCCST: Bridge Course - Complete Systematic Theology",
        department: "Department of Systematic & Historical Theology",
        degreeLevel: "Specialized / Bridge",
        totalYears: 1,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        modeOfLearning: "Modular Field Cohort",
        paymentPerUnit: 500,
        totalUnits: 12,
        description: "Comprehensive bridge curriculum providing complete mastery in Bibliology, Theology Proper, Pneumatology, Christology, and Eschatology.",
        subjects: [
            {
                code: "BCCST 101",
                title: "Complete Systematic Theology: Bibliology & Theology Proper",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 8:00 AM - 12:00 PM",
                room: "Bridge Cohort Hub",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Bridge"
            },
            {
                code: "BCCST 102",
                title: "Complete Systematic Theology: Christology & Pneumatology",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 1:00 PM - 5:00 PM",
                room: "Bridge Cohort Hub",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Bridge"
            },
            {
                code: "BCCST 103",
                title: "Complete Systematic Theology: Anthropology, Hamartiology & Soteriology",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Sunday 9:00 AM - 12:00 PM",
                room: "Bridge Cohort Hub",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Bridge"
            },
            {
                code: "BCCST 104",
                title: "Complete Systematic Theology: Ecclesiology, Israelology & Eschatology",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Sunday 1:00 PM - 4:00 PM",
                room: "Bridge Cohort Hub",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Bridge"
            }
        ]
    },

    // 15. LLP: Ladderized Learning Program
    {
        id: "llp",
        code: "LLP",
        name: "LLP: Ladderized Learning Program",
        department: "Office of Academic Affairs & Credit Accumulation",
        degreeLevel: "Specialized / Bridge",
        totalYears: 1,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        modeOfLearning: "Online Distance Learning",
        paymentPerUnit: 500,
        totalUnits: 9,
        description: "Modular progressive academic program allowing self-paced credit accumulation for ministers and working professionals worldwide.",
        subjects: [
            {
                code: "LLP 101",
                title: "Core Theological Milestone Foundations",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Online Flexible / Self-Paced Modules",
                room: "Online Portal Hub",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Online Distance Learning",
                yearLevel: "Ladderized"
            },
            {
                code: "LLP 201",
                title: "Applied Ministerial Practicum & Field Leadership",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Field Ministry Hub Rotation",
                room: "Field Ministry Hub",
                instructor: "Bishop Marcus Reed, D.Min.",
                modeOfLearning: "Online Distance Learning",
                yearLevel: "Ladderized"
            },
            {
                code: "LLP 301",
                title: "Independent Biblical Research & Credit Synthesis",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Preceptorial Mentorship Sessions",
                room: "Online Portal Hub",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Online Distance Learning",
                yearLevel: "Ladderized"
            }
        ]
    },

    // 16. Honorary Degree Conferment (Honoris Causa)
    {
        id: "hon-deg",
        code: "HON-DEG",
        name: "Honorary Degree Conferment (Honoris Causa)",
        department: "Seminary Board of Regents & Executive Council",
        degreeLevel: "Specialized / Bridge",
        totalYears: 1,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        modeOfLearning: "Modular Field Cohort",
        paymentPerUnit: 0,
        totalUnits: 6,
        description: "Doctor of Ministry (D.Min.) / Doctor of Divinity (D.Div.) Honoris Causa conferred upon long-standing Christian leaders with exemplary service.",
        subjects: [
            {
                code: "HON 901",
                title: "Ministerial Life Synthesis & Portfolio Review",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Executive Review Sessions",
                room: "Board of Regents Chamber",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Honorary"
            },
            {
                code: "HON 902",
                title: "Kingdom Leadership Colloquium & Special Conferment",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Academic Conferment Convocation",
                room: "Main Auditorium",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "Honorary"
            }
        ]
    }
];

class CourseCurriculumService {
    private cache: CourseProgram[] | null = null;

    // Fetch authentic courses & modules directly from database API
    public async fetchCoursesFromApi(): Promise<CourseProgram[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/Courses?published=true`);
            const dbCourses: any[] = response.data;
            if (Array.isArray(dbCourses) && dbCourses.length > 0) {
                const mappedCourses: CourseProgram[] = dbCourses.map((c) => {
                    let code = "CBS";
                    const title = c.title || "";
                    if (title.includes("(CBS)") || title.includes("Biblical Studies")) code = "CBS";
                    else if (title.includes("Applied AI") || title.includes("Artificial Intelligence")) code = "AI-MIN";
                    else if (title.includes("Digital Arts")) code = "DIG-ART";
                    else if (title.includes("(DPS)") || title.includes("Pastoral Studies")) code = "DPS";
                    else if (title.includes("(AML)") || title.includes("Ministerial Leadership")) code = "AML";
                    else if (title.includes("Associate in Biblical Naturopathy")) code = "AS-BN";
                    else if (title.includes("(B.Th.)") || title.includes("Bachelor of Theology")) code = "B-TH";
                    else if (title.includes("Worship Ministry") || title.includes("Music Arts")) code = "AB-WMMA";
                    else if (title.includes("AB Biblical Naturopathy")) code = "AB-BN";
                    else if (title.includes("(Th.M.)") || title.includes("Master of Theology")) code = "M-TH";
                    else if (title.includes("(M.Div.)") || title.includes("Master of Divinity")) code = "M-DIV";
                    else if (title.includes("MABPSY") || title.includes("Biblical Psychology")) code = "MABPSY";
                    else if (title.includes("(Th.D.)") || title.includes("Doctor of Theology")) code = "TH-D";
                    else if (title.includes("BCCST") || title.includes("Bridge Course")) code = "BCCST";
                    else if (title.includes("LLP") || title.includes("Ladderized")) code = "LLP";
                    else if (title.includes("Honorary")) code = "HON-DEG";
                    else code = title.split(" ")[0].toUpperCase().replace(/[^A-Z0-9]/g, "");

                    const subjects: CourseSubject[] = (c.modules || []).map((m: any) => {
                        const colonIdx = m.title ? m.title.indexOf(":") : -1;
                        let subjCode = m.title || "MOD";
                        let subjTitle = m.title || "Module";
                        if (colonIdx > 0) {
                            subjCode = m.title.substring(0, colonIdx).trim();
                            subjTitle = m.title.substring(colonIdx + 1).trim();
                        }

                        return {
                            code: subjCode,
                            title: subjTitle,
                            units: 3,
                            lectureHours: 3,
                            labHours: 0,
                            schedule: "Modular Intensive / Online Sync",
                            room: "Main Seminary Hall • Field Hub",
                            instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                            modeOfLearning: (c.category?.includes("AI") || c.category?.includes("Ladderized"))
                                ? "Online Distance Learning"
                                : (c.category?.includes("Digital") || c.category?.includes("Naturopathy"))
                                ? "Hybrid Cloud / Offline Sync"
                                : "Modular Field Cohort",
                            yearLevel: "General"
                        };
                    });

                    let rate = 500;
                    if (c.level?.includes("Graduate") || c.level?.includes("Masteral")) rate = 550;
                    else if (c.level?.includes("Doctorate")) rate = 600;
                    else if (c.level?.includes("Honorary")) rate = 0;

                    return {
                        id: `course-${c.courseId}`,
                        code,
                        name: c.title,
                        department: c.category || "Theological Studies",
                        degreeLevel: (c.level as any) || "Certificate",
                        totalYears: c.level?.includes("Undergraduate") ? 4 : c.level?.includes("Doctorate") ? 3 : 2,
                        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
                        modeOfLearning: (c.title?.includes("AI") || c.title?.includes("LLP"))
                            ? "Online Distance Learning"
                            : (c.title?.includes("Digital") || c.title?.includes("Naturopathy"))
                            ? "Hybrid Cloud / Offline Sync"
                            : "Modular Field Cohort",
                        paymentPerUnit: rate,
                        totalUnits: subjects.length * 3 || 15,
                        description: c.description || c.shortDescription || "",
                        subjects
                    };
                });

                this.saveToStorage(mappedCourses);
                return mappedCourses;
            }
        } catch (e) {
            console.error("fetchCoursesFromApi failed, falling back to database defaults:", e);
        }
        return this.getCourses();
    }

    // Load courses from localStorage or default seed
    public getCourses(): CourseProgram[] {
        if (this.cache) return this.cache;

        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length >= 12) {
                    const hasFakeData = parsed.some(
                        (c: any) =>
                            c.deanOrHead?.includes("Samuel Vance") ||
                            c.name?.includes("Information Technology") ||
                            c.subjects?.some((s: any) => s.code?.includes("ADV-HERM") || s.instructor?.includes("Samuel Vance"))
                    );

                    if (!hasFakeData) {
                        this.cache = parsed;
                        return this.cache;
                    }
                }
                console.log("Upgraded stale courses cache to full authentic MBS 16-course curriculum.");
            }
        } catch (e) {
            console.error("Failed to load courses catalog from localStorage", e);
        }

        // Clean legacy keys
        try {
            localStorage.removeItem("sms_courses_catalog_v2");
            localStorage.removeItem("sms_courses_catalog_v3");
        } catch {}

        // Authentic MBS database initialization
        this.cache = [...DEFAULT_COURSES];
        this.saveToStorage(this.cache);
        return this.cache;
    }

    // Persist courses to localStorage and dispatch event
    private saveToStorage(courses: CourseProgram[]): void {
        this.cache = courses;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
            window.dispatchEvent(new CustomEvent("sms_curriculum_updated", { detail: courses }));
        } catch (e) {
            console.error("Failed to persist courses to localStorage", e);
        }
    }

    // Lookup course by code or name
    public getCourse(codeOrName: string): CourseProgram | undefined {
        const courses = this.getCourses();
        const search = codeOrName.trim().toUpperCase();
        return courses.find(
            c => c.code.toUpperCase() === search || c.name.toUpperCase() === search || c.id.toUpperCase() === search
        );
    }

    // Add or update a course program
    public saveCourse(course: CourseProgram): void {
        const courses = [...this.getCourses()];
        const index = courses.findIndex(
            c => c.id === course.id || c.code.toUpperCase() === course.code.toUpperCase()
        );

        if (index >= 0) {
            courses[index] = { ...courses[index], ...course };
        } else {
            courses.push({
                ...course,
                id: course.id || course.code.toLowerCase().replace(/[^a-z0-9]/g, "-")
            });
        }

        this.saveToStorage(courses);
    }

    // Delete a course
    public deleteCourse(idOrCode: string): boolean {
        const courses = this.getCourses();
        const filtered = courses.filter(
            c => c.id !== idOrCode && c.code.toUpperCase() !== idOrCode.toUpperCase()
        );

        if (filtered.length === courses.length) return false;
        this.saveToStorage(filtered);
        return true;
    }

    // Add subject to a specific course
    public addSubjectToCourse(courseCode: string, subject: CourseSubject): void {
        const courses = [...this.getCourses()];
        const course = courses.find(
            c => c.code.toUpperCase() === courseCode.toUpperCase() || c.name.toUpperCase() === courseCode.toUpperCase()
        );
        if (!course) throw new Error(`Course with code or name '${courseCode}' not found.`);

        const subjectIndex = course.subjects.findIndex(
            s => s.code.toUpperCase() === subject.code.toUpperCase()
        );

        if (subjectIndex >= 0) {
            course.subjects[subjectIndex] = { ...course.subjects[subjectIndex], ...subject };
        } else {
            course.subjects.push(subject);
        }

        this.saveToStorage(courses);
    }

    // Update subject in a course
    public updateSubjectInCourse(courseCode: string, oldSubjectCode: string, updatedSubject: CourseSubject): void {
        const courses = [...this.getCourses()];
        const course = courses.find(
            c => c.code.toUpperCase() === courseCode.toUpperCase() || c.name.toUpperCase() === courseCode.toUpperCase()
        );
        if (!course) throw new Error(`Course '${courseCode}' not found.`);

        const idx = course.subjects.findIndex(
            s => s.code.toUpperCase() === oldSubjectCode.toUpperCase()
        );
        if (idx >= 0) {
            course.subjects[idx] = updatedSubject;
        } else {
            course.subjects.push(updatedSubject);
        }

        this.saveToStorage(courses);
    }

    // Remove subject from course
    public deleteSubjectFromCourse(courseCode: string, subjectCode: string): void {
        const courses = [...this.getCourses()];
        const course = courses.find(
            c => c.code.toUpperCase() === courseCode.toUpperCase() || c.name.toUpperCase() === courseCode.toUpperCase()
        );
        if (!course) return;

        course.subjects = course.subjects.filter(
            s => s.code.toUpperCase() !== subjectCode.toUpperCase()
        );

        this.saveToStorage(courses);
    }

    // Reset back to Mobile Bible School defaults
    public resetToDefaults(): CourseProgram[] {
        this.saveToStorage([...DEFAULT_COURSES]);
        return this.getCourses();
    }

    // Flat list of all available subjects across all active programs
    public getAllSubjects(): CourseSubject[] {
        const courses = this.getCourses();
        const map = new Map<string, CourseSubject>();
        courses.forEach(c => {
            c.subjects.forEach(s => {
                if (!map.has(s.code)) {
                    map.set(s.code, s);
                }
            });
        });
        return Array.from(map.values());
    }

    // Search subject by code
    public getSubjectByCode(code: string): CourseSubject | undefined {
        const courses = this.getCourses();
        const clean = code.trim().toUpperCase();
        for (const c of courses) {
            const found = c.subjects.find(s => s.code.toUpperCase() === clean);
            if (found) return found;
        }
        const prescribed = PRESCRIBED_THEOLOGICAL_SUBJECTS.find(p => p.code.toUpperCase() === clean);
        if (prescribed) {
            return {
                code: prescribed.code,
                title: prescribed.title,
                units: prescribed.units,
                lectureHours: prescribed.units,
                labHours: 0,
                schedule: "Modular Intensive / Online Sync",
                room: "Main Seminary Hall • Field Hub",
                instructor: "Rev. Dr. Rhoderick De Vera, Th.D.",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: prescribed.yearLevel
            };
        }
        return undefined;
    }

    // Compute tuition fee from enrolled units & payment per unit
    public calculateTuition(units: number, paymentPerUnit: number): number {
        return Math.max(0, units) * Math.max(0, paymentPerUnit);
    }

    // Financial balance and status calculation
    public calculateFinancials(
        units: number,
        paymentPerUnit: number,
        amountPaid: number
    ): {
        totalTuition: number;
        amountPaid: number;
        balance: number;
        paymentStatus: "PAID" | "PARTIAL" | "UNPAID";
    } {
        const totalTuition = this.calculateTuition(units, paymentPerUnit);
        const paid = Math.max(0, amountPaid || 0);
        const balance = Math.max(0, totalTuition - paid);
        let paymentStatus: "PAID" | "PARTIAL" | "UNPAID" = "UNPAID";

        if (totalTuition > 0 && paid >= totalTuition) {
            paymentStatus = "PAID";
        } else if (paid > 0) {
            paymentStatus = "PARTIAL";
        }

        return {
            totalTuition,
            amountPaid: paid,
            balance,
            paymentStatus
        };
    }

    // Subscribe to curriculum changes
    public subscribe(callback: () => void): () => void {
        const handler = () => {
            this.cache = null;
            callback();
        };
        window.addEventListener("sms_curriculum_updated", handler);
        return () => window.removeEventListener("sms_curriculum_updated", handler);
    }
}

export const courseCurriculumService = new CourseCurriculumService();
