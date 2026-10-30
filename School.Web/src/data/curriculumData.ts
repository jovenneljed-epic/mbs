/* =========================================================
   ACADEMIC CURRICULUM, COURSES & SUBJECTS CATALOG
   Mobile Bible School & Theological Seminary
   Official Theological Programs & Real Database Curriculum Data
========================================================= */

import { courseCurriculumService } from "../services/courseCurriculumService";

export interface Subject {
    code: string;
    title: string;
    units: number;
    lectureHours: number;
    labHours: number;
    schedule: string;
    room: string;
    instructor: string;
    prerequisite?: string;
}

export interface DegreeProgram {
    code: string;
    name: string;
    department: string;
    degreeLevel: "Undergraduate" | "Graduate / Seminary" | "Certificate" | "Diploma" | "Associate" | "Doctorate" | "Specialized / Bridge" | "Basic Education" | string;
    totalYears: number;
    deanOrHead: string;
    subjectsByYear: {
        [yearLevel: string]: Subject[];
    };
}

export const STATIC_DEGREE_PROGRAMS: Record<string, DegreeProgram> = {
    "Certificate in Biblical Studies (CBS)": {
        code: "CBS",
        name: "Certificate in Biblical Studies (CBS)",
        department: "Department of Biblical & Theological Foundations",
        degreeLevel: "Certificate",
        totalYears: 1,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        subjectsByYear: {
            "1st Year": [
                {
                    code: "CBS 101",
                    title: "Life of Christ & Synoptic Gospels",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 8:00 AM - 12:00 PM (Intensive)",
                    room: "Field Cohort Hub • Room 101",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "CBS 102",
                    title: "Old Testament Survey & Pentateuch",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 1:00 PM - 5:00 PM (Intensive)",
                    room: "Field Cohort Hub • Room 101",
                    instructor: "Prof. Nathan Cole, M.Div."
                },
                {
                    code: "CBS 103",
                    title: "New Testament Survey & Apostolic Epistles",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Wednesday 6:00 PM - 8:30 PM (Evening)",
                    room: "Synod Hall • Room 202",
                    instructor: "Dr. Elizabeth Grace, Ph.D."
                },
                {
                    code: "CBS 104",
                    title: "Biblical Hermeneutics & Inductive Exegesis",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Sunday 8:00 AM - 12:00 PM (Modular)",
                    room: "Theology Hall • Room 301",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "CBS 105",
                    title: "Homiletics & Expository Preaching",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Sunday 1:00 PM - 5:00 PM (Modular)",
                    room: "Chapel Center • Room 104",
                    instructor: "Rev. Jonathan Edwards, Th.M."
                }
            ]
        }
    },
    "Applied AI (Artificial Intelligence) Course": {
        code: "AI-MIN",
        name: "Applied AI (Artificial Intelligence) Course",
        department: "Center for Digital Ministry & Modern Technologies",
        degreeLevel: "Certificate",
        totalYears: 1,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        subjectsByYear: {
            "1st Year": [
                {
                    code: "AI 101",
                    title: "Fundamentals of Applied AI & Ethics for Christian Ministry",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Online Flexible / Asynchronous Modules",
                    room: "Virtual Learning Hub • Cloud",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "AI 102",
                    title: "AI-Assisted Bible Exegesis & Theological Research Tools",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Online Live Discussion • Thu 7:00 PM - 9:00 PM",
                    room: "Virtual Learning Hub • Cloud",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "AI 103",
                    title: "Digital Evangelism, Prompt Engineering & Automated Media Systems",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Online Flexible / Asynchronous Modules",
                    room: "Virtual Learning Hub • Cloud",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "AI 104",
                    title: "Church Data Administration & Intelligent Ministry Workflows",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Online Flexible / Asynchronous Modules",
                    room: "Virtual Learning Hub • Cloud",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ]
        }
    },
    "Digital Arts Short Term Course": {
        code: "DIG-ART",
        name: "Digital Arts Short Term Course",
        department: "School of Christian Media & Creative Arts",
        degreeLevel: "Certificate",
        totalYears: 1,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        subjectsByYear: {
            "1st Year": [
                {
                    code: "DA 101",
                    title: "Church Graphic Design & Visual Communication",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "Saturday 1:00 PM - 5:00 PM (Intensive)",
                    room: "Digital Media Lab • Room 201",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "DA 102",
                    title: "Audio Production & Acoustic Sound Engineering for Worship",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "Saturday 8:00 AM - 12:00 PM (Intensive)",
                    room: "Acoustics & Sound Studio",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "DA 103",
                    title: "Video Production, Live Stream Broadcasting & Post-Editing",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "Sunday 2:00 PM - 6:00 PM",
                    room: "Broadcast Production Suite",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "DA 104",
                    title: "Digital Storytelling & Church Social Media Management",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Online Flexible / Asynchronous Modules",
                    room: "Virtual Media Hub",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ]
        }
    },
    "Diploma in Pastoral Studies (DPS)": {
        code: "DPS",
        name: "Diploma in Pastoral Studies (DPS)",
        department: "Department of Pastoral Ministry & Practical Theology",
        degreeLevel: "Diploma",
        totalYears: 2,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        subjectsByYear: {
            "1st Year": [
                {
                    code: "DPS 201",
                    title: "Systematic Theology I (Theology Proper & Bibliology)",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Friday 6:00 PM - 9:00 PM",
                    room: "Seminary Hall • Room 102",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "DPS 202",
                    title: "Systematic Theology II (Christology & Soteriology)",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 8:00 AM - 12:00 PM",
                    room: "Seminary Hall • Room 102",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ],
            "2nd Year": [
                {
                    code: "DPS 203",
                    title: "Christian Education & Discipleship Foundations",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 1:00 PM - 5:00 PM",
                    room: "Education Hub • Room 204",
                    instructor: "Pastor David Morales, D.Min."
                },
                {
                    code: "DPS 204",
                    title: "Pastoral Ministry & Church Planting Practicum",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Sunday 2:00 PM - 5:00 PM",
                    room: "Main Sanctuary",
                    instructor: "Bishop Marcus Reed, D.Min."
                },
                {
                    code: "DPS 205",
                    title: "Expository Preaching & Pastoral Administration",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Sunday 9:00 AM - 12:00 PM",
                    room: "Pastoral Center • Room 101",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ]
        }
    },
    "Associate in Ministerial Leadership & Theology (AML)": {
        code: "AML",
        name: "Associate in Ministerial Leadership & Theology (AML)",
        department: "School of Practical Ministry & Church Growth",
        degreeLevel: "Associate",
        totalYears: 2,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        subjectsByYear: {
            "1st Year": [
                {
                    code: "AML 301",
                    title: "Christian Ethics & Pastoral Morality",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Friday 6:00 PM - 9:00 PM",
                    room: "Seminary Hall • Room 103",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "AML 302",
                    title: "Theology of Worship & Church Music",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 8:00 AM - 12:00 PM",
                    room: "Worship Arts Center",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ],
            "2nd Year": [
                {
                    code: "AML 303",
                    title: "Biblical Pastoral Counseling & Soul Care",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 1:00 PM - 5:00 PM",
                    room: "Counseling Suite 201",
                    instructor: "Dr. Deborah Morales, Ph.D."
                },
                {
                    code: "AML 304",
                    title: "Church Planting & Strategic Growth Dynamics",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Sunday 1:00 PM - 4:00 PM",
                    room: "Church Growth Lab",
                    instructor: "Bishop Marcus Reed, D.Min."
                },
                {
                    code: "AML 305",
                    title: "Eschatology & Biblical Prophecy",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Sunday 9:00 AM - 12:00 PM",
                    room: "Theology Hall • Room 302",
                    instructor: "Prof. Nathan Cole, M.Div."
                }
            ]
        }
    },
    "Associate in Biblical Naturopathy": {
        code: "AS-BN",
        name: "Associate in Biblical Naturopathy",
        department: "Institute of Biblical Health & Naturopathic Studies",
        degreeLevel: "Associate",
        totalYears: 2,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        subjectsByYear: {
            "1st Year": [
                {
                    code: "BN 201",
                    title: "Biblical Foundations of Health & Divine Wellness",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 8:00 AM - 12:00 PM",
                    room: "Health & Wellness Lab 101",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "BN 202",
                    title: "Botanical Herbs & Nutrition in Sacred Scripture",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 1:00 PM - 5:00 PM",
                    room: "Health & Wellness Lab 101",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ],
            "2nd Year": [
                {
                    code: "BN 203",
                    title: "Practical Naturopathic Lifestyle & Disease Prevention",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Sunday 1:00 PM - 5:00 PM",
                    room: "Health & Wellness Lab 101",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "BN 204",
                    title: "Community Health Evangelism & Medical Missionary Work",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Friday 6:00 PM - 9:00 PM",
                    room: "Field Outreach Center",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ]
        }
    },
    "Bachelor of Theology (B.Th.)": {
        code: "B-TH",
        name: "Bachelor of Theology (B.Th.)",
        department: "School of Theology & Biblical Languages",
        degreeLevel: "Undergraduate",
        totalYears: 4,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        subjectsByYear: {
            "1st Year": [
                {
                    code: "BTH 401",
                    title: "Pastoral Theology & Ministerial Ethics",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 8:00 AM - 12:00 PM",
                    room: "Theology Hall 301",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ],
            "2nd Year": [
                {
                    code: "BTH 402",
                    title: "Ecclesiology & Biblical Church Governance",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 1:00 PM - 5:00 PM",
                    room: "Theology Hall 301",
                    instructor: "Bishop Marcus Reed, D.Min."
                }
            ],
            "3rd Year": [
                {
                    code: "BTH 403",
                    title: "Pauline Epistles & Advanced Exegesis",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Sunday 1:00 PM - 5:00 PM",
                    room: "Language Lab 105",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ],
            "4th Year": [
                {
                    code: "BTH 404",
                    title: "John-in-Depth & Johannine Literature",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Wednesday 6:00 PM - 9:00 PM",
                    room: "Language Lab 105",
                    instructor: "Prof. Nathan Cole, M.Div."
                },
                {
                    code: "BTH 405",
                    title: "Introduction to Global Missions & Cross-Cultural Ministry",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Friday 6:00 PM - 9:00 PM",
                    room: "Global Missions Hall",
                    instructor: "Rev. Timothy Hudson, D.Miss."
                }
            ]
        }
    },
    "AB Worship Ministry and Music Arts": {
        code: "AB-WMMA",
        name: "AB Worship Ministry and Music Arts",
        department: "Department of Church Music & Worship Arts",
        degreeLevel: "Undergraduate",
        totalYears: 4,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        subjectsByYear: {
            "1st Year": [
                {
                    code: "WMA 101",
                    title: "Biblical Theology of Praise & Worship",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Friday 6:00 PM - 9:00 PM",
                    room: "Worship Hall Sanctuary",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ],
            "2nd Year": [
                {
                    code: "WMA 201",
                    title: "Music Theory, Harmony & Directing for Church Leaders",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 8:00 AM - 12:00 PM",
                    room: "Music Conservatory Suite",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ],
            "3rd Year": [
                {
                    code: "WMA 301",
                    title: "Worship Service Planning & Liturgical Leadership",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 1:00 PM - 5:00 PM",
                    room: "Music Conservatory Suite",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "WMA 302",
                    title: "Audio Engineering, Acoustics & Stage Management",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "Sunday 1:00 PM - 5:00 PM",
                    room: "Live Studio Control Room",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ],
            "4th Year": [
                {
                    code: "WMA 401",
                    title: "Christian Songwriting, Composition & Team Dynamics",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Wednesday 6:00 PM - 9:00 PM",
                    room: "Studio A",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "WMA 402",
                    title: "Worship Ministry Practicum & Senior Recital",
                    units: 3,
                    lectureHours: 1,
                    labHours: 6,
                    schedule: "Sunday 5:00 PM - 8:00 PM",
                    room: "Main Sanctuary",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ]
        }
    },
    "AB Biblical Naturopathy": {
        code: "AB-BN",
        name: "AB Biblical Naturopathy",
        department: "Institute of Biblical Health & Naturopathic Studies",
        degreeLevel: "Undergraduate",
        totalYears: 4,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        subjectsByYear: {
            "3rd Year": [
                {
                    code: "BN 301",
                    title: "Advanced Biblical Naturopathy & Physiological Healing",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 8:00 AM - 12:00 PM",
                    room: "Clinical Lab Room 202",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "BN 302",
                    title: "Scriptural Nutrition, Fasting & Botanical Formulations",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 1:00 PM - 5:00 PM",
                    room: "Clinical Lab Room 202",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ],
            "4th Year": [
                {
                    code: "BN 401",
                    title: "Hydrotherapy, Natural Therapies & Clinical Assessment",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "Sunday 1:00 PM - 5:00 PM",
                    room: "Therapy & Hydro Hub",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "BN 402",
                    title: "Wellness Center Administration & Field Clinical Practicum",
                    units: 3,
                    lectureHours: 1,
                    labHours: 6,
                    schedule: "Sunday 9:00 AM - 12:00 PM",
                    room: "MBS Wellness Clinic",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ]
        }
    },
    "Master of Theology (Th.M.)": {
        code: "M-TH",
        name: "Master of Theology (Th.M.)",
        department: "Graduate Seminary & Leadership Institute",
        degreeLevel: "Graduate / Seminary",
        totalYears: 2,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        subjectsByYear: {
            "Postgraduate": [
                {
                    code: "MTH 501",
                    title: "Biblical Greek Syntax & Advanced Exegesis",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Friday 6:00 PM - 9:00 PM",
                    room: "Seminary Hall A",
                    instructor: "Dr. Elizabeth Grace, Ph.D."
                },
                {
                    code: "MTH 502",
                    title: "Biblical Hebrew Grammar & Historical Syntax",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 9:00 AM - 12:00 PM",
                    room: "Seminary Hall A",
                    instructor: "Prof. Aaron Levi, M.A."
                },
                {
                    code: "MTH 503",
                    title: "Advanced Biblical Hermeneutics & Exegetical Methodology",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 1:00 PM - 4:00 PM",
                    room: "Seminary Hall A",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "MTH 504",
                    title: "Reformation Theology & Historical Dogmatics",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Sunday 1:00 PM - 4:00 PM",
                    room: "Seminary Hall B",
                    instructor: "Rev. Jonathan Edwards, Th.M."
                },
                {
                    code: "MTH 505",
                    title: "Theology and Psychology in Soul Care",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Wednesday 6:00 PM - 9:00 PM",
                    room: "Counseling Center 201",
                    instructor: "Dr. Deborah Morales, Ph.D."
                }
            ]
        }
    },
    "Master of Divinity (M.Div.)": {
        code: "M-DIV",
        name: "Master of Divinity (M.Div.)",
        department: "Graduate Seminary & Leadership Institute",
        degreeLevel: "Graduate / Seminary",
        totalYears: 3,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        subjectsByYear: {
            "Postgraduate": [
                {
                    code: "MMIN 601",
                    title: "Christian Apologetics in the 21st Century",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Friday 6:00 PM - 9:00 PM",
                    room: "Seminary Hall • Room 301",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "MMIN 602",
                    title: "Church Management & Strategic Administration I",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 8:00 AM - 12:00 PM",
                    room: "Seminary Hall • Room 301",
                    instructor: "Bishop Marcus Reed, D.Min."
                },
                {
                    code: "MMIN 603",
                    title: "Church Management & Strategic Administration II",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 1:00 PM - 5:00 PM",
                    room: "Seminary Hall • Room 301",
                    instructor: "Bishop Marcus Reed, D.Min."
                },
                {
                    code: "MMIN 604",
                    title: "Pastoral Worship Leadership & Ordinances",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Sunday 9:00 AM - 12:00 PM",
                    room: "Main Sanctuary",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "MMIN 605",
                    title: "Music Directing and Church Program Management",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Sunday 1:00 PM - 4:00 PM",
                    room: "Worship Arts Center",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "MMIN 606",
                    title: "Advanced Expository Preaching Colloquium",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Wednesday 6:00 PM - 9:00 PM",
                    room: "Chapel Center",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ]
        }
    },
    "Master of Arts in Biblical Psychology (MABPSY)": {
        code: "MABPSY",
        name: "Master of Arts in Biblical Psychology (MABPSY)",
        department: "Center for Biblical Psychology & Christian Counseling",
        degreeLevel: "Graduate / Seminary",
        totalYears: 2,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        subjectsByYear: {
            "Postgraduate": [
                {
                    code: "BP 601",
                    title: "Biblical Foundations of Psychology & the Inner Man",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Friday 6:00 PM - 9:00 PM",
                    room: "Biblical Psychology Lab",
                    instructor: "Dr. Deborah Morales, Ph.D."
                },
                {
                    code: "BP 602",
                    title: "Biblical Diagnosis vs. Secular Psychopathology",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 8:00 AM - 12:00 PM",
                    room: "Biblical Psychology Lab",
                    instructor: "Dr. Deborah Morales, Ph.D."
                },
                {
                    code: "BP 603",
                    title: "Crisis Counseling, Trauma & Family Restoration",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 1:00 PM - 5:00 PM",
                    room: "Counseling Center 102",
                    instructor: "Dr. Deborah Morales, Ph.D."
                },
                {
                    code: "BP 604",
                    title: "Neuroscience & Biblical Renewal of the Mind",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Sunday 1:00 PM - 4:00 PM",
                    room: "Biblical Psychology Lab",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "BP 605",
                    title: "Clinical Pastoral Counseling Practicum & Supervised Case Studies",
                    units: 3,
                    lectureHours: 1,
                    labHours: 6,
                    schedule: "Sunday 9:00 AM - 12:00 PM",
                    room: "Pastoral Clinic",
                    instructor: "Dr. Deborah Morales, Ph.D."
                }
            ]
        }
    },
    "Doctor of Theology (Th.D.)": {
        code: "TH-D",
        name: "Doctor of Theology (Th.D.)",
        department: "Doctoral Research & Postgraduate Divinity School",
        degreeLevel: "Doctorate",
        totalYears: 3,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        subjectsByYear: {
            "Doctorate": [
                {
                    code: "DOC 701",
                    title: "Theological Study of Genesis 1-11",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 8:00 AM - 12:00 PM (Intensive)",
                    room: "Doctoral Colloquium Hall",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "DOC 702",
                    title: "Parallel Study of Revelation in Different Perspectives",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 1:00 PM - 5:00 PM (Intensive)",
                    room: "Doctoral Colloquium Hall",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "DOC 703",
                    title: "The Spectrum of Christian Soteriology",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Sunday 9:00 AM - 12:00 PM",
                    room: "Doctoral Colloquium Hall",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "DOC 704",
                    title: "21st Century Christian Ethics",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Sunday 1:00 PM - 4:00 PM",
                    room: "Doctoral Colloquium Hall",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "DOC 705",
                    title: "Pastoral Theology Course for 21st Century Church",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Friday 6:00 PM - 9:00 PM",
                    room: "Doctoral Colloquium Hall",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "DOC 706",
                    title: "Doctorate Program Requirement & Theological Research Methods",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Thursday 6:00 PM - 9:00 PM",
                    room: "Research & Defense Chamber",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "DOC 707",
                    title: "Dissertation Options & Research Proposal Defense",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 1:00 PM - 5:00 PM",
                    room: "Research & Defense Chamber",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "DOC 708",
                    title: "Dissertation Format, Exegesis & Writing",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Online Independent Research Colloquium",
                    room: "Doctoral Advisory Suite",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "DOC 709",
                    title: "Thesis Defense Evaluation Rubric & Oral Examination",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Seminary Board of Review Schedule",
                    room: "Board of Regents Chamber",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "DOC 710",
                    title: "Final Synthesis Formats & Doctoral Conferment",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Academic Graduation Colloquium",
                    room: "Main Auditorium",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ]
        }
    },
    "BCCST: Bridge Course - Complete Systematic Theology": {
        code: "BCCST",
        name: "BCCST: Bridge Course - Complete Systematic Theology",
        department: "Department of Systematic & Historical Theology",
        degreeLevel: "Specialized / Bridge",
        totalYears: 1,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        subjectsByYear: {
            "Bridge": [
                {
                    code: "BCCST 101",
                    title: "Complete Systematic Theology: Bibliology & Theology Proper",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 8:00 AM - 12:00 PM",
                    room: "Bridge Cohort Hub",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "BCCST 102",
                    title: "Complete Systematic Theology: Christology & Pneumatology",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Saturday 1:00 PM - 5:00 PM",
                    room: "Bridge Cohort Hub",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "BCCST 103",
                    title: "Complete Systematic Theology: Anthropology, Hamartiology & Soteriology",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Sunday 9:00 AM - 12:00 PM",
                    room: "Bridge Cohort Hub",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "BCCST 104",
                    title: "Complete Systematic Theology: Ecclesiology, Israelology & Eschatology",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Sunday 1:00 PM - 4:00 PM",
                    room: "Bridge Cohort Hub",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ]
        }
    },
    "LLP: Ladderized Learning Program": {
        code: "LLP",
        name: "LLP: Ladderized Learning Program",
        department: "Office of Academic Affairs & Credit Accumulation",
        degreeLevel: "Specialized / Bridge",
        totalYears: 1,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        subjectsByYear: {
            "Ladderized": [
                {
                    code: "LLP 101",
                    title: "Core Theological Milestone Foundations",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Online Flexible / Self-Paced Modules",
                    room: "Online Portal Hub",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "LLP 201",
                    title: "Applied Ministerial Practicum & Field Leadership",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Field Ministry Hub Rotation",
                    room: "Field Ministry Hub",
                    instructor: "Bishop Marcus Reed, D.Min."
                },
                {
                    code: "LLP 301",
                    title: "Independent Biblical Research & Credit Synthesis",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Preceptorial Mentorship Sessions",
                    room: "Online Portal Hub",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ]
        }
    },
    "Honorary Degree Conferment (Honoris Causa)": {
        code: "HON-DEG",
        name: "Honorary Degree Conferment (Honoris Causa)",
        department: "Seminary Board of Regents & Executive Council",
        degreeLevel: "Specialized / Bridge",
        totalYears: 1,
        deanOrHead: "Rev. Dr. Rhoderick De Vera, Th.D.",
        subjectsByYear: {
            "Honorary": [
                {
                    code: "HON 901",
                    title: "Ministerial Life Synthesis & Portfolio Review",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Executive Review Sessions",
                    room: "Board of Regents Chamber",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                },
                {
                    code: "HON 902",
                    title: "Kingdom Leadership Colloquium & Special Conferment",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "Academic Conferment Convocation",
                    room: "Main Auditorium",
                    instructor: "Rev. Dr. Rhoderick De Vera, Th.D."
                }
            ]
        }
    }
};

/* =========================================================
   DYNAMIC CURRICULUM RESOLUTION PROXY & HELPER UTILITIES
========================================================= */

// Proxy so that Object.keys(DEGREE_PROGRAMS) and DEGREE_PROGRAMS[courseName]
// dynamically returns both active courses from courseCurriculumService and static fallbacks
export const DEGREE_PROGRAMS: Record<string, DegreeProgram> = new Proxy(STATIC_DEGREE_PROGRAMS, {
    get(target, prop: string | symbol) {
        if (typeof prop === "string") {
            const dynamic = courseCurriculumService.getCourse(prop);
            if (dynamic) {
                return {
                    code: dynamic.code,
                    name: dynamic.name,
                    department: dynamic.department,
                    degreeLevel: dynamic.degreeLevel,
                    totalYears: dynamic.totalYears || 4,
                    deanOrHead: dynamic.deanOrHead,
                    subjectsByYear: {
                        "General Curriculum": dynamic.subjects.map(s => ({
                            code: s.code,
                            title: s.title,
                            units: s.units,
                            lectureHours: s.lectureHours ?? s.units,
                            labHours: s.labHours ?? 0,
                            schedule: s.schedule,
                            room: s.room,
                            instructor: s.instructor,
                            prerequisite: s.prerequisite
                        }))
                    }
                } as DegreeProgram;
            }
            return (target as Record<string, DegreeProgram>)[prop];
        }
        return (target as any)[prop];
    },
    ownKeys() {
        const dynamicCourses = courseCurriculumService.getCourses();
        const keys = dynamicCourses.map(c => c.name);
        Object.keys(STATIC_DEGREE_PROGRAMS).forEach(k => {
            if (!keys.includes(k)) keys.push(k);
        });
        return keys;
    },
    getOwnPropertyDescriptor(target, prop: string | symbol) {
        if (typeof prop === "string") {
            const dynamic = courseCurriculumService.getCourse(prop);
            if (dynamic) {
                return {
                    enumerable: true,
                    configurable: true,
                    value: (this as any).get(target, prop, target)
                };
            }
            if (prop in target) {
                return {
                    enumerable: true,
                    configurable: true,
                    value: (target as any)[prop]
                };
            }
        }
        return undefined;
    }
});

// Get all subjects in flat list across all programs (dynamic + static)
export const getAllAvailableSubjects = (): Subject[] => {
    const map = new Map<string, Subject>();
    
    // 1. Dynamic subjects from course curriculum service
    const dynamicSubjects = courseCurriculumService.getAllSubjects();
    dynamicSubjects.forEach(s => {
        map.set(s.code, {
            code: s.code,
            title: s.title,
            units: s.units,
            lectureHours: s.lectureHours ?? s.units,
            labHours: s.labHours ?? 0,
            schedule: s.schedule,
            room: s.room,
            instructor: s.instructor,
            prerequisite: s.prerequisite
        });
    });

    // 2. Static fallbacks
    Object.values(STATIC_DEGREE_PROGRAMS).forEach(prog => {
        Object.values(prog.subjectsByYear).forEach(subList => {
            subList.forEach(s => {
                if (!map.has(s.code)) {
                    map.set(s.code, s);
                }
            });
        });
    });

    return Array.from(map.values());
};

// Lookup subject by code
export const getSubjectByCode = (code: string): Subject | undefined => {
    if (!code) return undefined;
    const clean = code.trim().toUpperCase();

    // 1. Check dynamic service
    const dyn = courseCurriculumService.getSubjectByCode(clean);
    if (dyn) {
        return {
            code: dyn.code,
            title: dyn.title,
            units: dyn.units,
            lectureHours: dyn.lectureHours ?? dyn.units,
            labHours: dyn.labHours ?? 0,
            schedule: dyn.schedule,
            room: dyn.room,
            instructor: dyn.instructor,
            prerequisite: dyn.prerequisite
        };
    }

    // 2. Check static programs
    for (const prog of Object.values(STATIC_DEGREE_PROGRAMS)) {
        for (const subList of Object.values(prog.subjectsByYear)) {
            const found = subList.find(s => s.code.toUpperCase() === clean);
            if (found) return found;
        }
    }
    return undefined;
};

// Get default subjects for a program and year level
export const getDefaultSubjectsForProgram = (
    programName: string,
    yearLevelStr: string
): Subject[] => {
    // 1. Check dynamic service first
    const dynCourse = courseCurriculumService.getCourse(programName);
    if (dynCourse && dynCourse.subjects.length > 0) {
        return dynCourse.subjects.map(s => ({
            code: s.code,
            title: s.title,
            units: s.units,
            lectureHours: s.lectureHours ?? s.units,
            labHours: s.labHours ?? 0,
            schedule: s.schedule,
            room: s.room,
            instructor: s.instructor,
            prerequisite: s.prerequisite
        }));
    }

    // 2. Check static program
    const prog = STATIC_DEGREE_PROGRAMS[programName];
    if (prog) {
        for (const [key, subjects] of Object.entries(prog.subjectsByYear)) {
            if (yearLevelStr && yearLevelStr.toLowerCase().includes(key.toLowerCase())) {
                return subjects;
            }
        }
        const firstKey = Object.keys(prog.subjectsByYear)[0];
        return prog.subjectsByYear[firstKey] || [];
    }

    // 3. Fallback to first available dynamic course or static
    const allCourses = courseCurriculumService.getCourses();
    if (allCourses.length > 0 && allCourses[0].subjects.length > 0) {
        return allCourses[0].subjects.map(s => ({
            code: s.code,
            title: s.title,
            units: s.units,
            lectureHours: s.lectureHours ?? s.units,
            labHours: s.labHours ?? 0,
            schedule: s.schedule,
            room: s.room,
            instructor: s.instructor,
            prerequisite: s.prerequisite
        }));
    }

    return STATIC_DEGREE_PROGRAMS["Certificate in Biblical Studies (CBS)"]?.subjectsByYear["1st Year"] || [];
};

// Compute total units for a list of subjects
export const calculateTotalUnits = (subjects: Subject[]): number => {
    return subjects.reduce((sum, s) => sum + s.units, 0);
};
