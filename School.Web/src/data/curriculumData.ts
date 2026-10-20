/* =========================================================
   ACADEMIC CURRICULUM, COURSES & SUBJECTS CATALOG
   School Management System - Official Curriculum Data
========================================================= */

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
    degreeLevel: "Undergraduate" | "Basic Education";
    totalYears: number;
    deanOrHead: string;
    subjectsByYear: {
        [yearLevel: string]: Subject[];
    };
}

import { courseCurriculumService } from "../services/courseCurriculumService";

export const STATIC_DEGREE_PROGRAMS: Record<string, DegreeProgram> = {
    "BS Information Technology": {
        code: "BSIT",
        name: "BS Information Technology",
        department: "College of Computer Studies",
        degreeLevel: "Undergraduate",
        totalYears: 4,
        deanOrHead: "Dean Roberto Tan, MIT",
        subjectsByYear: {
            "1st Year": [
                {
                    code: "IT101",
                    title: "Introduction to Computing",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 08:00 AM - 09:00 AM",
                    room: "CL-101 (Main)",
                    instructor: "Engr. Marco V. Ramos"
                },
                {
                    code: "IT102",
                    title: "Computer Programming 1 (Python)",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "TTH 09:00 AM - 11:30 AM",
                    room: "IT Lab 2",
                    instructor: "Prof. Sofia L. Mendoza"
                },
                {
                    code: "MATH101",
                    title: "Discrete Mathematics",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 10:00 AM - 11:00 AM",
                    room: "Rm 304 - Academic Bldg",
                    instructor: "Dr. Ramon C. Santos"
                },
                {
                    code: "ENG101",
                    title: "Purposive Communication",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 01:00 PM - 02:30 PM",
                    room: "Rm 208 - Liberal Arts",
                    instructor: "Prof. Carmela Dela Rosa"
                },
                {
                    code: "HIST101",
                    title: "Readings in Philippine History",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 01:00 PM - 02:00 PM",
                    room: "Rm 210 - Social Sciences",
                    instructor: "Prof. Danilo Bautista"
                },
                {
                    code: "PE101",
                    title: "Physical Fitness & Wellness",
                    units: 2,
                    lectureHours: 2,
                    labHours: 0,
                    schedule: "SAT 08:00 AM - 10:00 AM",
                    room: "University Gymnasium",
                    instructor: "Coach Arnold Reyes"
                },
                {
                    code: "NSTP1",
                    title: "National Service Training Program 1",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "SAT 01:00 PM - 04:00 PM",
                    room: "Auditorium / Field",
                    instructor: "Lt. Col. Vicente Gomez"
                }
            ],
            "2nd Year": [
                {
                    code: "IT201",
                    title: "Data Structures & Algorithms",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "MWF 09:00 AM - 10:30 AM",
                    room: "IT Lab 3",
                    instructor: "Engr. Marco V. Ramos",
                    prerequisite: "IT102"
                },
                {
                    code: "IT202",
                    title: "Object-Oriented Programming (Java/C#)",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "TTH 10:00 AM - 12:30 PM",
                    room: "IT Lab 1",
                    instructor: "Prof. Sofia L. Mendoza",
                    prerequisite: "IT102"
                },
                {
                    code: "CS201",
                    title: "Database Management Systems",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "MWF 11:00 AM - 12:30 PM",
                    room: "Database Lab",
                    instructor: "Dr. Maria Elena Santos",
                    prerequisite: "IT101"
                },
                {
                    code: "MATH201",
                    title: "Quantitative Methods & Statistics",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 01:30 PM - 03:00 PM",
                    room: "Rm 305 - Academic Bldg",
                    instructor: "Dr. Ramon C. Santos"
                },
                {
                    code: "ENG102",
                    title: "Technical Writing & Presentation",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 02:00 PM - 03:00 PM",
                    room: "Rm 208 - Liberal Arts",
                    instructor: "Prof. Carmela Dela Rosa"
                },
                {
                    code: "GE-ETHICS",
                    title: "Ethics in Computing & Society",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 03:30 PM - 05:00 PM",
                    room: "Rm 212 - Social Sciences",
                    instructor: "Atty. Fernando Morales"
                }
            ],
            "3rd Year": [
                {
                    code: "IT301",
                    title: "Web Systems & Full-Stack Technologies",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "MWF 08:30 AM - 10:00 AM",
                    room: "Web Innovation Lab",
                    instructor: "Prof. Alvin Gutierrez",
                    prerequisite: "IT202, CS201"
                },
                {
                    code: "IT302",
                    title: "Information Assurance & Cybersecurity",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "TTH 08:00 AM - 10:30 AM",
                    room: "Cyber Lab Rm 401",
                    instructor: "Engr. Richard P. Cruz"
                },
                {
                    code: "IT303",
                    title: "Mobile Application Development",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "MWF 10:30 AM - 12:00 PM",
                    room: "Mobile Dev Lab",
                    instructor: "Prof. Alvin Gutierrez"
                },
                {
                    code: "IT304",
                    title: "Systems Analysis & Software Architecture",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 01:00 PM - 02:30 PM",
                    room: "Rm 301 - IT Bldg",
                    instructor: "Dean Roberto Tan, MIT"
                },
                {
                    code: "SYS101",
                    title: "Networking & Data Communications",
                    units: 4,
                    lectureHours: 3,
                    labHours: 3,
                    schedule: "MWF 01:30 PM - 03:30 PM",
                    room: "Cisco Networking Lab",
                    instructor: "Engr. Richard P. Cruz"
                },
                {
                    code: "GE-RIZAL",
                    title: "Life and Works of Jose Rizal",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 03:00 PM - 04:30 PM",
                    room: "Rm 201 - Main Bldg",
                    instructor: "Prof. Danilo Bautista"
                }
            ],
            "4th Year": [
                {
                    code: "IT401",
                    title: "Capstone Project & Research 1",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 09:00 AM - 10:00 AM",
                    room: "Research & Innovation Rm 501",
                    instructor: "Dean Roberto Tan, MIT"
                },
                {
                    code: "IT402",
                    title: "Cloud Computing & DevOps Architecture",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "TTH 09:00 AM - 11:30 AM",
                    room: "Cloud Computing Lab",
                    instructor: "Prof. Sofia L. Mendoza"
                },
                {
                    code: "IT403",
                    title: "Enterprise Architecture & IT Governance",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 11:00 AM - 12:00 PM",
                    room: "Rm 302 - IT Bldg",
                    instructor: "Engr. Richard P. Cruz"
                },
                {
                    code: "IT404",
                    title: "Industry Practicum / On-the-Job Training",
                    units: 6,
                    lectureHours: 0,
                    labHours: 12,
                    schedule: "Mon-Fri (480 Hours Industry)",
                    room: "Partner Tech Industries",
                    instructor: "Dean Roberto Tan, MIT"
                }
            ]
        }
    },

    "BS Computer Science": {
        code: "BSCS",
        name: "BS Computer Science",
        department: "College of Computer Studies",
        degreeLevel: "Undergraduate",
        totalYears: 4,
        deanOrHead: "Dr. Maria Elena Santos, Ph.D.",
        subjectsByYear: {
            "1st Year": [
                {
                    code: "CS101",
                    title: "Introduction to Computer Science & Discrete Logic",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 08:00 AM - 09:00 AM",
                    room: "CS Lab 1",
                    instructor: "Dr. Maria Elena Santos"
                },
                {
                    code: "CS102",
                    title: "Object-Oriented Programming & Systems Design",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "TTH 09:00 AM - 11:30 AM",
                    room: "CS Lab 2",
                    instructor: "Prof. Kenneth Lim"
                },
                {
                    code: "MATH101",
                    title: "Discrete Structures & Proofs",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 10:00 AM - 11:00 AM",
                    room: "Rm 306 - Academic Bldg",
                    instructor: "Dr. Ramon C. Santos"
                },
                {
                    code: "ENG101",
                    title: "Purposive Communication",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 01:00 PM - 02:30 PM",
                    room: "Rm 208 - Liberal Arts",
                    instructor: "Prof. Carmela Dela Rosa"
                },
                {
                    code: "HIST101",
                    title: "Readings in Philippine History",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 01:00 PM - 02:00 PM",
                    room: "Rm 210 - Social Sciences",
                    instructor: "Prof. Danilo Bautista"
                },
                {
                    code: "PE101",
                    title: "Physical Fitness & Wellness",
                    units: 2,
                    lectureHours: 2,
                    labHours: 0,
                    schedule: "SAT 08:00 AM - 10:00 AM",
                    room: "Gymnasium",
                    instructor: "Coach Arnold Reyes"
                },
                {
                    code: "NSTP1",
                    title: "National Service Training Program 1",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "SAT 01:00 PM - 04:00 PM",
                    room: "Auditorium",
                    instructor: "Lt. Col. Vicente Gomez"
                }
            ],
            "2nd Year": [
                {
                    code: "CS201",
                    title: "Design and Analysis of Algorithms",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "MWF 09:00 AM - 10:30 AM",
                    room: "CS Lab 3",
                    instructor: "Dr. Maria Elena Santos"
                },
                {
                    code: "CS202",
                    title: "Computer Organization & Assembly Language",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "TTH 10:00 AM - 12:30 PM",
                    room: "Hardware Architecture Lab",
                    instructor: "Engr. Richard P. Cruz"
                },
                {
                    code: "CS203",
                    title: "Automata Theory & Formal Languages",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 11:00 AM - 12:00 PM",
                    room: "Rm 304 - Academic Bldg",
                    instructor: "Prof. Kenneth Lim"
                },
                {
                    code: "MATH202",
                    title: "Linear Algebra & Probability Theory",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 01:30 PM - 03:00 PM",
                    room: "Rm 306 - Academic Bldg",
                    instructor: "Dr. Ramon C. Santos"
                },
                {
                    code: "GE-CW",
                    title: "The Contemporary World",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 02:00 PM - 03:00 PM",
                    room: "Rm 204 - Social Sciences",
                    instructor: "Prof. Gabriel Navarro"
                },
                {
                    code: "PE103",
                    title: "Individual & Dual Sports",
                    units: 2,
                    lectureHours: 2,
                    labHours: 0,
                    schedule: "SAT 10:00 AM - 12:00 PM",
                    room: "University Gymnasium",
                    instructor: "Coach Arnold Reyes"
                }
            ],
            "3rd Year": [
                {
                    code: "CS301",
                    title: "Artificial Intelligence & Intelligent Systems",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "MWF 08:30 AM - 10:00 AM",
                    room: "AI & Machine Learning Lab",
                    instructor: "Dr. Maria Elena Santos"
                },
                {
                    code: "CS302",
                    title: "Operating Systems & Kernel Programming",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "TTH 08:30 AM - 11:00 AM",
                    room: "Systems Lab 2",
                    instructor: "Prof. Kenneth Lim"
                },
                {
                    code: "CS303",
                    title: "Software Engineering & Agile Methodologies",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 10:30 AM - 11:30 AM",
                    room: "Rm 302 - IT Bldg",
                    instructor: "Engr. Marco V. Ramos"
                },
                {
                    code: "CS304",
                    title: "Compiler Design & Construction",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "TTH 01:00 PM - 03:30 PM",
                    room: "CS Lab 1",
                    instructor: "Prof. Kenneth Lim"
                },
                {
                    code: "GE-ART",
                    title: "Art Appreciation",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 01:00 PM - 02:00 PM",
                    room: "Rm 202 - Humanities Bldg",
                    instructor: "Prof. Cecilia Perez"
                },
                {
                    code: "GE-STS",
                    title: "Science, Technology, and Society",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 03:30 PM - 05:00 PM",
                    room: "Rm 205 - Science Bldg",
                    instructor: "Dr. Gabriel Navarro"
                }
            ],
            "4th Year": [
                {
                    code: "CS401",
                    title: "CS Thesis & Scientific Research 1",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 09:00 AM - 10:00 AM",
                    room: "Research & Defense Center",
                    instructor: "Dr. Maria Elena Santos"
                },
                {
                    code: "CS402",
                    title: "Distributed Computing & Cloud Infrastructure",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "TTH 09:00 AM - 11:30 AM",
                    room: "Cloud Computing Lab",
                    instructor: "Prof. Kenneth Lim"
                },
                {
                    code: "CS403",
                    title: "Natural Language Processing & Computer Vision",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "MWF 11:00 AM - 12:30 PM",
                    room: "AI Lab",
                    instructor: "Dr. Maria Elena Santos"
                },
                {
                    code: "CS404",
                    title: "Practicum & Industry Immersion",
                    units: 6,
                    lectureHours: 0,
                    labHours: 12,
                    schedule: "Mon-Fri (480 Hours Industry)",
                    room: "Industry Partner Research Labs",
                    instructor: "Dr. Maria Elena Santos"
                }
            ]
        }
    },

    "BS Business Administration": {
        code: "BSBA",
        name: "BS Business Administration",
        department: "College of Business & Accountancy",
        degreeLevel: "Undergraduate",
        totalYears: 4,
        deanOrHead: "Prof. Carlos Mendoza, MBA",
        subjectsByYear: {
            "1st Year": [
                {
                    code: "BA101",
                    title: "Principles of Management & Organization",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 08:00 AM - 09:00 AM",
                    room: "Business Hall Rm 401",
                    instructor: "Prof. Carlos Mendoza"
                },
                {
                    code: "BA102",
                    title: "Fundamentals of Financial Accounting",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 09:00 AM - 10:30 AM",
                    room: "Business Hall Rm 402",
                    instructor: "Prof. Jennifer Diaz, CPA"
                },
                {
                    code: "ECON101",
                    title: "Microeconomic Theory and Practice",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 10:00 AM - 11:00 AM",
                    room: "Business Hall Rm 403",
                    instructor: "Dr. Victoriano Lopez"
                },
                {
                    code: "MATH101",
                    title: "Business Mathematics & Analytics",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 01:00 PM - 02:30 PM",
                    room: "Rm 305 - Academic Bldg",
                    instructor: "Prof. Angela Garcia"
                },
                {
                    code: "ENG101",
                    title: "Business Communication & Correspondence",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 01:00 PM - 02:00 PM",
                    room: "Rm 208 - Liberal Arts",
                    instructor: "Prof. Carmela Dela Rosa"
                },
                {
                    code: "PE101",
                    title: "Physical Fitness & Wellness",
                    units: 2,
                    lectureHours: 2,
                    labHours: 0,
                    schedule: "SAT 08:00 AM - 10:00 AM",
                    room: "Gymnasium",
                    instructor: "Coach Arnold Reyes"
                },
                {
                    code: "NSTP1",
                    title: "National Service Training Program 1",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "SAT 01:00 PM - 04:00 PM",
                    room: "Auditorium",
                    instructor: "Lt. Col. Vicente Gomez"
                }
            ],
            "2nd Year": [
                {
                    code: "BA201",
                    title: "Human Resource Management & Talent Dev",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 09:00 AM - 10:00 AM",
                    room: "Business Hall Rm 401",
                    instructor: "Prof. Carlos Mendoza"
                },
                {
                    code: "BA202",
                    title: "Managerial Accounting & Cost Control",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 10:30 AM - 12:00 PM",
                    room: "Business Hall Rm 402",
                    instructor: "Prof. Jennifer Diaz, CPA"
                },
                {
                    code: "FIN201",
                    title: "Financial Management & Capital Markets",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 11:00 AM - 12:00 PM",
                    room: "Business Hall Rm 404",
                    instructor: "Dr. Victoriano Lopez"
                },
                {
                    code: "MKT201",
                    title: "Principles of Marketing & Consumer Behavior",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 01:30 PM - 03:00 PM",
                    room: "Business Hall Rm 405",
                    instructor: "Prof. Marites Salazar"
                },
                {
                    code: "LAW201",
                    title: "Law on Business Obligations and Contracts",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 02:00 PM - 03:00 PM",
                    room: "Rm 212 - Social Sciences",
                    instructor: "Atty. Fernando Morales"
                },
                {
                    code: "GE-ART",
                    title: "Art Appreciation",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 03:30 PM - 05:00 PM",
                    room: "Rm 202 - Humanities",
                    instructor: "Prof. Cecilia Perez"
                }
            ],
            "3rd Year": [
                {
                    code: "BA301",
                    title: "Strategic Management & Corporate Policy",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 08:30 AM - 09:30 AM",
                    room: "Business Hall Rm 401",
                    instructor: "Prof. Carlos Mendoza"
                },
                {
                    code: "BA302",
                    title: "Operations & Supply Chain Management",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 09:00 AM - 10:30 AM",
                    room: "Business Hall Rm 403",
                    instructor: "Prof. Marites Salazar"
                },
                {
                    code: "BA303",
                    title: "Business Analytics & Predictive Modeling",
                    units: 3,
                    lectureHours: 2,
                    labHours: 3,
                    schedule: "MWF 10:00 AM - 11:30 AM",
                    room: "Business Computer Lab",
                    instructor: "Prof. Angela Garcia"
                },
                {
                    code: "FIN301",
                    title: "Investment & Securities Portfolio Analysis",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 01:00 PM - 02:30 PM",
                    room: "Business Hall Rm 404",
                    instructor: "Dr. Victoriano Lopez"
                },
                {
                    code: "MKT301",
                    title: "Digital Marketing & Brand Communications",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 01:00 PM - 02:00 PM",
                    room: "Business Hall Rm 405",
                    instructor: "Prof. Marites Salazar"
                },
                {
                    code: "GE-ETHICS",
                    title: "Business Ethics & Corporate Responsibility",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 03:00 PM - 04:30 PM",
                    room: "Rm 212 - Social Sciences",
                    instructor: "Atty. Fernando Morales"
                }
            ],
            "4th Year": [
                {
                    code: "BA401",
                    title: "Business Research & Feasibility Study",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 09:00 AM - 10:00 AM",
                    room: "Business Boardroom Rm 501",
                    instructor: "Prof. Carlos Mendoza"
                },
                {
                    code: "BA402",
                    title: "International Business & Global Logistics",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 09:00 AM - 10:30 AM",
                    room: "Business Hall Rm 402",
                    instructor: "Dr. Victoriano Lopez"
                },
                {
                    code: "BA403",
                    title: "Entrepreneurship & Innovation Incubation",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 10:30 AM - 11:30 AM",
                    room: "Incubation Center Rm 502",
                    instructor: "Prof. Marites Salazar"
                },
                {
                    code: "BA404",
                    title: "Corporate Internship & Management OJT",
                    units: 6,
                    lectureHours: 0,
                    labHours: 12,
                    schedule: "Mon-Fri (600 Hours Corporate)",
                    room: "Partner Corporate Offices",
                    instructor: "Prof. Carlos Mendoza"
                }
            ]
        }
    },

    "Bachelor of Secondary Education": {
        code: "BSED",
        name: "Bachelor of Secondary Education",
        department: "College of Education",
        degreeLevel: "Undergraduate",
        totalYears: 4,
        deanOrHead: "Dr. Teresa Ramos, Ed.D.",
        subjectsByYear: {
            "1st Year": [
                {
                    code: "ED101",
                    title: "The Child and Adolescent Learners",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 08:00 AM - 09:00 AM",
                    room: "Education Rm 101",
                    instructor: "Dr. Teresa Ramos"
                },
                {
                    code: "ED102",
                    title: "Foundations of Special and Inclusive Education",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 09:00 AM - 10:30 AM",
                    room: "Education Rm 102",
                    instructor: "Prof. Rowena Santos"
                },
                {
                    code: "MATH101",
                    title: "Mathematics in the Modern World",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 10:00 AM - 11:00 AM",
                    room: "Rm 304 - Academic Bldg",
                    instructor: "Dr. Ramon C. Santos"
                },
                {
                    code: "ENG101",
                    title: "Purposive Communication for Educators",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 01:00 PM - 02:30 PM",
                    room: "Rm 208 - Liberal Arts",
                    instructor: "Prof. Carmela Dela Rosa"
                },
                {
                    code: "HIST101",
                    title: "Philippine History & Constitution",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 01:00 PM - 02:00 PM",
                    room: "Rm 210 - Social Sciences",
                    instructor: "Prof. Danilo Bautista"
                },
                {
                    code: "PE101",
                    title: "Physical Fitness & Gymnastics",
                    units: 2,
                    lectureHours: 2,
                    labHours: 0,
                    schedule: "SAT 08:00 AM - 10:00 AM",
                    room: "Gymnasium",
                    instructor: "Coach Arnold Reyes"
                },
                {
                    code: "NSTP1",
                    title: "National Service Training Program (LTS)",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "SAT 01:00 PM - 04:00 PM",
                    room: "Education Rm 105",
                    instructor: "Prof. Rowena Santos"
                }
            ],
            "2nd Year": [
                {
                    code: "ED201",
                    title: "Facilitating Learner-Centered Teaching",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 09:00 AM - 10:00 AM",
                    room: "Education Rm 101",
                    instructor: "Dr. Teresa Ramos"
                },
                {
                    code: "ED202",
                    title: "Assessment of Learning 1 & Test Design",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 10:30 AM - 12:00 PM",
                    room: "Education Rm 103",
                    instructor: "Prof. Rowena Santos"
                },
                {
                    code: "ED203",
                    title: "The Teacher and the School Curriculum",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 11:00 AM - 12:00 PM",
                    room: "Education Rm 104",
                    instructor: "Dr. Teresa Ramos"
                },
                {
                    code: "FIL201",
                    title: "Panitikang Panlipunan at Kultura",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 01:30 PM - 03:00 PM",
                    room: "Rm 206 - Liberal Arts",
                    instructor: "Prof. Lualhati Castro"
                },
                {
                    code: "ENG102",
                    title: "Literary Theory & World Masterpieces",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 02:00 PM - 03:00 PM",
                    room: "Rm 208 - Liberal Arts",
                    instructor: "Prof. Carmela Dela Rosa"
                },
                {
                    code: "GE-STS",
                    title: "Science, Technology, and Society",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 03:30 PM - 05:00 PM",
                    room: "Rm 205 - Science Bldg",
                    instructor: "Dr. Gabriel Navarro"
                }
            ]
        }
    },

    "Senior High School - STEM": {
        code: "SHS-STEM",
        name: "Senior High School - STEM",
        department: "Senior High School Department",
        degreeLevel: "Basic Education",
        totalYears: 2,
        deanOrHead: "Engr. Arnold Cruz",
        subjectsByYear: {
            "Grade 11": [
                {
                    code: "STEM-PCALC",
                    title: "Pre-Calculus & Trigonometry",
                    units: 4,
                    lectureHours: 4,
                    labHours: 0,
                    schedule: "MWF 07:30 AM - 09:00 AM",
                    room: "SHS Rm 201",
                    instructor: "Engr. Arnold Cruz"
                },
                {
                    code: "STEM-GENMATH",
                    title: "General Mathematics & Functions",
                    units: 4,
                    lectureHours: 4,
                    labHours: 0,
                    schedule: "TTH 07:30 AM - 09:30 AM",
                    room: "SHS Rm 201",
                    instructor: "Prof. Jennifer Balagtas"
                },
                {
                    code: "STEM-BIO1",
                    title: "General Biology 1 with Laboratory",
                    units: 4,
                    lectureHours: 3,
                    labHours: 3,
                    schedule: "MWF 09:30 AM - 11:30 AM",
                    room: "Science Lab 1",
                    instructor: "Dr. Alicia S. Santos"
                },
                {
                    code: "ENG-ORAL",
                    title: "Oral Communication in Context",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 10:00 AM - 11:30 AM",
                    room: "SHS Rm 202",
                    instructor: "Prof. Leandro Garcia"
                },
                {
                    code: "PE-SHS1",
                    title: "Health Optimizing Physical Education (HOPE 1)",
                    units: 2,
                    lectureHours: 2,
                    labHours: 0,
                    schedule: "FRI 01:00 PM - 03:00 PM",
                    room: "Gymnasium",
                    instructor: "Coach Arnold Reyes"
                }
            ],
            "Grade 12": [
                {
                    code: "STEM-CALC",
                    title: "Basic Calculus & Differential Equations",
                    units: 4,
                    lectureHours: 4,
                    labHours: 0,
                    schedule: "MWF 07:30 AM - 09:00 AM",
                    room: "SHS Rm 201",
                    instructor: "Engr. Arnold Cruz"
                },
                {
                    code: "STEM-PHYS1",
                    title: "General Physics 1 with Laboratory",
                    units: 4,
                    lectureHours: 3,
                    labHours: 3,
                    schedule: "TTH 08:00 AM - 10:30 AM",
                    room: "Physics Lab",
                    instructor: "Dr. Mariano Estrada"
                },
                {
                    code: "STEM-CHEM1",
                    title: "General Chemistry 1 with Laboratory",
                    units: 4,
                    lectureHours: 3,
                    labHours: 3,
                    schedule: "MWF 09:30 AM - 11:30 AM",
                    room: "Chemistry Lab",
                    instructor: "Prof. Elena Ocampo"
                },
                {
                    code: "STEM-BIO2",
                    title: "General Biology 2 & Genetics",
                    units: 4,
                    lectureHours: 3,
                    labHours: 3,
                    schedule: "TTH 01:00 PM - 03:00 PM",
                    room: "Science Lab 1",
                    instructor: "Dr. Alicia S. Santos"
                },
                {
                    code: "ENG-ACAD",
                    title: "English for Academic & Professional Purposes",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 01:00 PM - 02:00 PM",
                    room: "SHS Rm 203",
                    instructor: "Prof. Leandro Garcia"
                },
                {
                    code: "PE-SHS3",
                    title: "HOPE 3 - Philippine Traditional Dances & Sports",
                    units: 2,
                    lectureHours: 2,
                    labHours: 0,
                    schedule: "FRI 03:00 PM - 05:00 PM",
                    room: "Gymnasium",
                    instructor: "Coach Arnold Reyes"
                }
            ]
        }
    },

    "Senior High School - ABM": {
        code: "SHS-ABM",
        name: "Senior High School - ABM",
        department: "Senior High School Department",
        degreeLevel: "Basic Education",
        totalYears: 2,
        deanOrHead: "Prof. Jennifer Diaz, CPA",
        subjectsByYear: {
            "Grade 11": [
                {
                    code: "ABM-FABM1",
                    title: "Fundamentals of Accountancy & Management 1",
                    units: 4,
                    lectureHours: 4,
                    labHours: 0,
                    schedule: "MWF 07:30 AM - 09:00 AM",
                    room: "SHS Rm 205",
                    instructor: "Prof. Jennifer Diaz, CPA"
                },
                {
                    code: "ABM-BOM",
                    title: "Business Organization and Management",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 08:00 AM - 09:30 AM",
                    room: "SHS Rm 205",
                    instructor: "Prof. Marites Salazar"
                },
                {
                    code: "ABM-BES",
                    title: "Business Ethics and Social Responsibility",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 09:30 AM - 10:30 AM",
                    room: "SHS Rm 205",
                    instructor: "Atty. Fernando Morales"
                },
                {
                    code: "GEN-MATH",
                    title: "General Mathematics for Business",
                    units: 4,
                    lectureHours: 4,
                    labHours: 0,
                    schedule: "TTH 10:00 AM - 12:00 PM",
                    room: "SHS Rm 206",
                    instructor: "Prof. Jennifer Balagtas"
                },
                {
                    code: "ORAL-COMM",
                    title: "Oral Communication in Business",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 11:00 AM - 12:00 PM",
                    room: "SHS Rm 206",
                    instructor: "Prof. Leandro Garcia"
                },
                {
                    code: "PE-SHS1",
                    title: "Health Optimizing Physical Education (HOPE 1)",
                    units: 2,
                    lectureHours: 2,
                    labHours: 0,
                    schedule: "FRI 01:00 PM - 03:00 PM",
                    room: "Gymnasium",
                    instructor: "Coach Arnold Reyes"
                }
            ],
            "Grade 12": [
                {
                    code: "ABM-FABM2",
                    title: "Fundamentals of Accountancy & Management 2",
                    units: 4,
                    lectureHours: 4,
                    labHours: 0,
                    schedule: "MWF 07:30 AM - 09:00 AM",
                    room: "SHS Rm 205",
                    instructor: "Prof. Jennifer Diaz, CPA"
                },
                {
                    code: "ABM-FIN",
                    title: "Business Finance & Investment Principles",
                    units: 4,
                    lectureHours: 4,
                    labHours: 0,
                    schedule: "TTH 08:00 AM - 10:00 AM",
                    room: "SHS Rm 205",
                    instructor: "Dr. Victoriano Lopez"
                },
                {
                    code: "ABM-MKT",
                    title: "Principles of Marketing & Salesmanship",
                    units: 4,
                    lectureHours: 4,
                    labHours: 0,
                    schedule: "MWF 09:30 AM - 11:00 AM",
                    room: "SHS Rm 206",
                    instructor: "Prof. Marites Salazar"
                },
                {
                    code: "AP-ECON",
                    title: "Applied Economics for Decision Making",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "TTH 10:30 AM - 12:00 PM",
                    room: "SHS Rm 206",
                    instructor: "Dr. Victoriano Lopez"
                },
                {
                    code: "ENG-ACAD",
                    title: "English for Academic & Professional Purposes",
                    units: 3,
                    lectureHours: 3,
                    labHours: 0,
                    schedule: "MWF 01:00 PM - 02:00 PM",
                    room: "SHS Rm 203",
                    instructor: "Prof. Leandro Garcia"
                },
                {
                    code: "PE-SHS3",
                    title: "HOPE 3 - Physical Fitness and Sports",
                    units: 2,
                    lectureHours: 2,
                    labHours: 0,
                    schedule: "FRI 03:00 PM - 05:00 PM",
                    room: "Gymnasium",
                    instructor: "Coach Arnold Reyes"
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
                    degreeLevel: dynamic.degreeLevel === "Basic Education" ? "Basic Education" : "Undergraduate",
                    totalYears: dynamic.totalYears || 4,
                    deanOrHead: dynamic.deanOrHead,
                    subjectsByYear: {
                        "1st Year": dynamic.subjects.map(s => ({
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

    return STATIC_DEGREE_PROGRAMS["BS Information Technology"]?.subjectsByYear["1st Year"] || [];
};

// Compute total units for a list of subjects
export const calculateTotalUnits = (subjects: Subject[]): number => {
    return subjects.reduce((sum, s) => sum + s.units, 0);
};

