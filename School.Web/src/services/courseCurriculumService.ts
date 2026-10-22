/* =========================================================
   COURSE & CURRICULUM MANAGEMENT SERVICE
   Mobile Bible School & Seminary Management System
   Supports dynamic courses, subjects, units, class schedules,
   modes of learning, and editable tuition payments per unit.
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
   OFFICIAL PRESCRIBED THEOLOGICAL SUBJECTS CATALOG (35 SUBJECTS)
========================================================= */

export interface PrescribedSubject {
    code: string;
    title: string;
    units: number;
    yearLevel: string;
    category: string;
}

export const PRESCRIBED_THEOLOGICAL_SUBJECTS: PrescribedSubject[] = [
    // CBS 100 Series (Certificate in Biblical Studies / 1st Year)
    { code: "CBS 101", title: "Life of Christ", units: 3, yearLevel: "1st Year", category: "Certificate in Biblical Studies (CBS)" },
    { code: "CBS 102", title: "Old Testament Survey", units: 3, yearLevel: "1st Year", category: "Certificate in Biblical Studies (CBS)" },
    { code: "CBS 103", title: "New Testament Survey", units: 3, yearLevel: "1st Year", category: "Certificate in Biblical Studies (CBS)" },
    { code: "CBS 104", title: "Hermeneutics", units: 3, yearLevel: "1st Year", category: "Certificate in Biblical Studies (CBS)" },
    { code: "CBS 105", title: "Homiletics", units: 3, yearLevel: "1st Year", category: "Certificate in Biblical Studies (CBS)" },

    // DPS 200 Series (Diploma in Pastoral Studies / 2nd Year)
    { code: "DPS 201", title: "Systematic Theology I", units: 3, yearLevel: "2nd Year", category: "Diploma in Pastoral Studies (DPS)" },
    { code: "DPS 202", title: "Systematic Theology II", units: 3, yearLevel: "2nd Year", category: "Diploma in Pastoral Studies (DPS)" },
    { code: "DPS 203", title: "Christian Education I (Children Ministry)", units: 3, yearLevel: "2nd Year", category: "Diploma in Pastoral Studies (DPS)" },
    { code: "DPS 204", title: "Christian Education II (Youth Ministry)", units: 3, yearLevel: "2nd Year", category: "Diploma in Pastoral Studies (DPS)" },
    { code: "DPS 205", title: "Expository Preaching", units: 3, yearLevel: "2nd Year", category: "Diploma in Pastoral Studies (DPS)" },

    // AML 300 Series (Applied Ministry & Leadership / 3rd Year)
    { code: "AML 301", title: "Christian Ethics", units: 3, yearLevel: "3rd Year", category: "Applied Ministry & Leadership (AML)" },
    { code: "AML 302", title: "Theology of Music", units: 3, yearLevel: "3rd Year", category: "Applied Ministry & Leadership (AML)" },
    { code: "AML 303", title: "Biblical Counseling", units: 3, yearLevel: "3rd Year", category: "Applied Ministry & Leadership (AML)" },
    { code: "AML 304", title: "Church Planting", units: 3, yearLevel: "3rd Year", category: "Applied Ministry & Leadership (AML)" },
    { code: "AML 305", title: "Eschatology", units: 3, yearLevel: "3rd Year", category: "Applied Ministry & Leadership (AML)" },

    // BTH 400 Series (Bachelor of Theology / 4th Year)
    { code: "BTH 401", title: "Pastoral Theology", units: 3, yearLevel: "4th Year", category: "Bachelor of Theology (BTH)" },
    { code: "BTH 402", title: "Ecclesiology", units: 3, yearLevel: "4th Year", category: "Bachelor of Theology (BTH)" },
    { code: "BTH 403", title: "Pauline Epistles", units: 3, yearLevel: "4th Year", category: "Bachelor of Theology (BTH)" },
    { code: "BTH 404", title: "John-in-Depth", units: 3, yearLevel: "4th Year", category: "Bachelor of Theology (BTH)" },
    { code: "BTH 405", title: "Introduction to Mission", units: 3, yearLevel: "4th Year", category: "Bachelor of Theology (BTH)" },

    // MTH 500 Series (Master of Theology & Languages / 500)
    { code: "MTH 501", title: "Greek I", units: 3, yearLevel: "General / All", category: "Master of Theology & Languages (MTH)" },
    { code: "MTH 502", title: "Hebrew I", units: 3, yearLevel: "General / All", category: "Master of Theology & Languages (MTH)" },
    { code: "MTH 503", title: "Advanced Hermeneutics", units: 3, yearLevel: "General / All", category: "Master of Theology & Languages (MTH)" },
    { code: "MTH 504", title: "Reformation Theology", units: 3, yearLevel: "General / All", category: "Master of Theology & Languages (MTH)" },
    { code: "MTH 505", title: "Theology and Psychology", units: 3, yearLevel: "General / All", category: "Master of Theology & Languages (MTH)" },

    // MMIN 600 Series (Master of Ministry & Church Management / 600)
    { code: "MMIN 601", title: "Apologetics", units: 3, yearLevel: "General / All", category: "Master of Ministry (MMIN)" },
    { code: "MMIN 602", title: "Church Management I", units: 3, yearLevel: "General / All", category: "Master of Ministry (MMIN)" },
    { code: "MMIN 603", title: "Church Management II", units: 3, yearLevel: "General / All", category: "Master of Ministry (MMIN)" },
    { code: "MMIN 604", title: "Worship Leadership", units: 3, yearLevel: "General / All", category: "Master of Ministry (MMIN)" },
    { code: "MMIN 605", title: "Music Directing and Management", units: 3, yearLevel: "General / All", category: "Master of Ministry (MMIN)" },

    // DTH 700 Series (Doctor of Theology / 700)
    { code: "DTH 701", title: "Parallel Study of the Book of Revelation", units: 3, yearLevel: "General / All", category: "Doctor of Theology (DTH)" },
    { code: "DTH 702", title: "Theological Study of the Trinity", units: 3, yearLevel: "General / All", category: "Doctor of Theology (DTH)" },
    { code: "DTH 703", title: "Genesis 1–11", units: 3, yearLevel: "General / All", category: "Doctor of Theology (DTH)" },
    { code: "DTH 704", title: "Dispensational and Covenant Theology", units: 3, yearLevel: "General / All", category: "Doctor of Theology (DTH)" },
    { code: "DTH 705", title: "21st Century Christian Ethics", units: 3, yearLevel: "General / All", category: "Doctor of Theology (DTH)" },
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

    // 2. Default faculty professors & instructors
    add("Dr. Samuel Vance, Th.D.", "Dean of Academic Affairs & Professor of Systematic Theology", "School of Theology & Biblical Studies");
    add("Prof. Nathan Cole, M.Div.", "Associate Professor of Old Testament Literature", "School of Theology & Biblical Studies");
    add("Dr. Elizabeth Warren, Ph.D.", "Professor of New Testament Exegesis & Koine Greek", "School of Theology & Biblical Studies");
    add("Pastor David Morales, D.Min.", "Senior Lecturer in Pastoral Care & Church Planting", "Department of Pastoral Ministry & Missions");
    add("Dr. Arthur Pink, Ph.D.", "Dean of Graduate Seminary & Historical Theology", "Graduate Seminary & Leadership Institute");
    add("Bishop Marcus Reed, D.Min.", "Director of Practical Ministry & Homiletics", "Department of Practical Ministry & Church Planting");
    add("Prof. Aaron Levi, M.A.", "Lecturer in Biblical Hebrew & Semitic Syntax", "Biblical Languages Hub");
    add("Dr. Constantine Palmer, Ph.D.", "Professor of Greek Grammar & Hermeneutics", "Biblical Languages Hub");
    add("Rev. Timothy Hudson, D.Miss.", "Senior Lecturer in Asian Missions & Church Planting", "Global Missions Hub");
    add("Dr. Deborah Vance, Ph.D.", "Professor of Biblical Counseling & Pastoral Care", "Pastoral Counseling Hub");
    add("Pastor Caleb Thorne, M.Div.", "Lecturer in Personal Evangelism & Discipleship", "Department of Practical Ministry");
    add("Rev. Jonathan Edwards, Th.M.", "Lecturer in Systematic Theology & Historical Doctrine", "School of Theology & Biblical Studies");
    add("Dr. Elizabeth Grace, Ph.D.", "Lecturer in Apostolic Epistles & Church History", "School of Theology & Biblical Studies");

    return list;
}

export interface CourseProgram {
    id: string;
    code: string;
    name: string;
    department: string;
    degreeLevel: "Undergraduate" | "Graduate / Seminary" | "Diploma" | "Certificate" | "Basic Education";
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

const STORAGE_KEY = "sms_courses_catalog_v2";

export const DEFAULT_COURSES: CourseProgram[] = [
    {
        id: "b-th",
        code: "B-TH",
        name: "Bachelor of Theology (B.Th.)",
        department: "School of Theology & Biblical Languages",
        degreeLevel: "Undergraduate",
        totalYears: 4,
        deanOrHead: "Dr. Samuel Vance, Th.D.",
        modeOfLearning: "Modular Field Cohort",
        paymentPerUnit: 350,
        totalUnits: 128,
        description: "Four-year ministry preparation program training pastors, church planters, and theological educators.",
        subjects: [
            {
                code: "HERM-101",
                title: "Inductive Bible Study & Biblical Hermeneutics",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Fri-Sun 8:00 AM - 12:00 PM (Modular)",
                room: "Field Cohort Hub • Room 101",
                instructor: "Dr. Samuel Vance",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "1st Year"
            },
            {
                code: "OT-101",
                title: "Old Testament Survey & Covenant Theology",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Fri-Sun 1:00 PM - 5:00 PM (Modular)",
                room: "Field Cohort Hub • Room 101",
                instructor: "Prof. Nathan Cole",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "1st Year"
            },
            {
                code: "NT-101",
                title: "New Testament Survey & Apostolic Epistles",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Mon & Wed 6:00 PM - 8:30 PM (Evening)",
                room: "Synod Hall • Room 202",
                instructor: "Dr. Elizabeth Grace",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "1st Year"
            },
            {
                code: "THEO-101",
                title: "Systematic Theology I: Bibliology & Theology Proper",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 8:00 AM - 12:00 PM (Intensive)",
                room: "Theology Hall • Room 301",
                instructor: "Rev. Jonathan Edwards",
                modeOfLearning: "Weekend Intensive",
                yearLevel: "1st Year"
            },
            {
                code: "MIN-101",
                title: "Pastoral Ministry, Leadership & Christian Ethics",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 1:00 PM - 5:00 PM (Intensive)",
                room: "Chapel Center • Room 104",
                instructor: "Bishop Marcus Reed",
                modeOfLearning: "Weekend Intensive",
                yearLevel: "1st Year"
            },
            {
                code: "HEB-101",
                title: "Biblical Hebrew Grammar & Syntax",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Tue & Thu 6:00 PM - 8:30 PM (Live Sync)",
                room: "Language Lab • Room 105",
                instructor: "Prof. Aaron Levi",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                prerequisite: "HERM-101",
                yearLevel: "2nd Year"
            }
        ]
    },
    {
        id: "m-div",
        code: "M-DIV",
        name: "Master of Divinity (M.Div.)",
        department: "Graduate Seminary & Leadership Institute",
        degreeLevel: "Graduate / Seminary",
        totalYears: 3,
        deanOrHead: "Dr. Arthur Pink, Ph.D.",
        modeOfLearning: "Hybrid Cloud / Offline Sync",
        paymentPerUnit: 550,
        totalUnits: 96,
        description: "Postgraduate seminary curriculum equipping ministerial leaders with advanced exegesis and pastoral theology.",
        subjects: [
            {
                code: "ADV-HERM-501",
                title: "Advanced Exegesis & Theological Hermeneutics",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Friday 6:00 PM - 9:00 PM (Cloud Sync)",
                room: "Seminary Hall A",
                instructor: "Dr. Samuel Vance",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "1st Year"
            },
            {
                code: "SYST-502",
                title: "Historical & Reformed Systematic Theology",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 9:00 AM - 12:00 PM (Intensive)",
                room: "Seminary Hall A",
                instructor: "Dr. Arthur Pink",
                modeOfLearning: "Weekend Intensive",
                yearLevel: "1st Year"
            },
            {
                code: "GRK-501",
                title: "Biblical Greek Syntax & Exegesis",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 1:00 PM - 4:00 PM (Language Hub)",
                room: "Language Lab • Room 105",
                instructor: "Dr. Constantine Palmer",
                modeOfLearning: "Hybrid Cloud / Offline Sync",
                yearLevel: "1st Year"
            },
            {
                code: "MISS-503",
                title: "Global Missions Strategy & Church Planting in Asia",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Sunday 2:00 PM - 5:00 PM (Modular Cohort)",
                room: "Missions Hub B",
                instructor: "Rev. Timothy Hudson",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "2nd Year"
            }
        ]
    },
    {
        id: "dip-pm",
        code: "DIP-PM",
        name: "Diploma in Pastoral Ministry",
        department: "Department of Practical Ministry & Church Planting",
        degreeLevel: "Diploma",
        totalYears: 2,
        deanOrHead: "Bishop Marcus Reed, D.Min.",
        modeOfLearning: "Weekend Intensive",
        paymentPerUnit: 300,
        totalUnits: 64,
        description: "Hands-on ministerial formation diploma for bivocational pastors, elders, and ministry coordinators.",
        subjects: [
            {
                code: "HOM-201",
                title: "Expository Preaching & Homiletics",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 8:30 AM - 12:30 PM",
                room: "Chapel Sanctuary",
                instructor: "Bishop Marcus Reed",
                modeOfLearning: "Weekend Intensive",
                yearLevel: "1st Year"
            },
            {
                code: "COUNS-202",
                title: "Biblical Counseling & Pastoral Care",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Saturday 1:30 PM - 5:30 PM",
                room: "Pastoral Lab • Room 102",
                instructor: "Dr. Deborah Vance",
                modeOfLearning: "Weekend Intensive",
                yearLevel: "1st Year"
            },
            {
                code: "ADMIN-203",
                title: "Church Administration, Finance & Polity",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Sunday 1:30 PM - 5:30 PM",
                room: "Boardroom 201",
                instructor: "Pastor David Morales",
                modeOfLearning: "Weekend Intensive",
                yearLevel: "1st Year"
            },
            {
                code: "EVANG-204",
                title: "Personal Evangelism & Discipleship Multiplication",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Friday 6:00 PM - 9:00 PM (Field Prep)",
                room: "Field Training Room",
                instructor: "Pastor Caleb Thorne",
                modeOfLearning: "Modular Field Cohort",
                yearLevel: "2nd Year"
            }
        ]
    },
    {
        id: "cert-bs",
        code: "CERT-BS",
        name: "Certificate in Biblical Studies & Hermeneutics",
        department: "Continuing Theological Education",
        degreeLevel: "Certificate",
        totalYears: 1,
        deanOrHead: "Prof. Nathan Cole, M.A.B.S.",
        modeOfLearning: "Online Distance Learning",
        paymentPerUnit: 250,
        totalUnits: 24,
        description: "Foundational one-year certificate delivering in-depth scripture study for lay leaders and believers.",
        subjects: [
            {
                code: "BIB-101",
                title: "Foundations of Biblical Faith & Scripture Doctrine",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Online Flexible / Asynchronous Modules",
                room: "Mobile Bible School Virtual Portal",
                instructor: "Dr. Samuel Vance",
                modeOfLearning: "Online Distance Learning",
                yearLevel: "1st Year"
            },
            {
                code: "HERM-100",
                title: "Basic Hermeneutics: How to Read the Bible Accurately",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Online Live Discussion • Thu 7:00 PM - 9:00 PM",
                room: "Virtual Conference Room",
                instructor: "Prof. Nathan Cole",
                modeOfLearning: "Online Distance Learning",
                yearLevel: "1st Year"
            },
            {
                code: "LIFE-102",
                title: "The Life and Ministry of Christ in the Gospels",
                units: 3,
                lectureHours: 3,
                labHours: 0,
                schedule: "Online Flexible / Self-Paced Modules",
                room: "Mobile Bible School Virtual Portal",
                instructor: "Rev. Jonathan Edwards",
                modeOfLearning: "Online Distance Learning",
                yearLevel: "1st Year"
            }
        ]
    }
];

class CourseCurriculumService {
    private cache: CourseProgram[] | null = null;

    // Load courses from localStorage or default seed
    public getCourses(): CourseProgram[] {
        if (this.cache) return this.cache;

        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    this.cache = parsed;
                    return this.cache;
                }
            }
        } catch (e) {
            console.error("Failed to load courses catalog from localStorage", e);
        }

        // Default initialization
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
                schedule: "Fri-Sun 8:00 AM - 12:00 PM (Modular)",
                room: "Theology Hall • Room 101",
                instructor: "Faculty Roster",
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
