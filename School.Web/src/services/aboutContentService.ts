// ============================================================
// aboutContentService.ts
// Live Content Management Service for About MBS & Institutional Dossier
// Allows Administrator editing while maintaining View-Only mode for others
// ============================================================

import { API_BASE_URL } from "../config";
import PermissionService from "../PermissionService";

export interface DoctrinalArticle {
    num: string;
    title: string;
    shortSummary: string;
    fullText: string;
    scriptures: string[];
}

export interface FacultyMember {
    id: string;
    name: string;
    title: string;
    department: "leadership" | "languages" | "theology" | "ministry";
    departmentLabel: string;
    degrees: string[];
    courses: string[];
    bio: string;
    tenureYears: number;
    photoUrl?: string;
}

export interface PillarItem {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export interface TimelineItem {
    year: string;
    text: string;
}

export interface AccreditationItem {
    id: string;
    badge: string;
    title: string;
    description: string;
    meta: Array<{ label: string; value: string }>;
}

export interface CampusFacility {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
}

export interface RegionalHub {
    id: string;
    regionBadge: string;
    title: string;
    subtitle: string;
    hubs: Array<{ name: string; description: string }>;
}

export interface AboutContentData {
    hero: {
        badge: string;
        title: string;
        titleHighlight: string;
        subtitle: string;
        trustChips: string[];
    };
    overview: {
        chancellor: {
            eyebrow: string;
            name: string;
            title: string;
            quote: string;
            scripture: string;
            reference: string;
        };
        pillars: PillarItem[];
        history: {
            eyebrow: string;
            title: string;
            desc: string;
            timeline: TimelineItem[];
        };
    };
    faith: {
        intro: {
            eyebrow: string;
            title: string;
            desc: string;
        };
        articles: DoctrinalArticle[];
    };
    faculty: {
        intro: {
            eyebrow: string;
            title: string;
            desc: string;
        };
        members: FacultyMember[];
    };
    accreditations: {
        intro: {
            eyebrow: string;
            title: string;
            desc: string;
        };
        accreditations: AccreditationItem[];
        transfer: {
            title: string;
            subtitle: string;
            points: Array<{ title: string; desc: string }>;
        };
    };
    campuses: {
        intro: {
            eyebrow: string;
            title: string;
            desc: string;
        };
        mainCampus: {
            badge: string;
            title: string;
            location: string;
            narrative: string;
            facilities: CampusFacility[];
        };
        regionalHubs: RegionalHub[];
        onlineExt: {
            title: string;
            desc: string;
            buttonText: string;
        };
    };
    cta: {
        pill: string;
        title: string;
        desc: string;
        primaryBtn: string;
        secondaryBtn: string;
    };
}

// ------------------------------------------------------------
// DEFAULT FACTORY CONTENT
// ------------------------------------------------------------
export const DEFAULT_ABOUT_CONTENT: AboutContentData = {
    hero: {
        badge: "CHRIST-CENTERED THEOLOGICAL EDUCATION • EST. 1986",
        title: "Mobile Bible School",
        titleHighlight: " & Theological Seminary",
        subtitle: "Rooted in verbal plenary biblical inerrancy, sound theological scholarship, expository preaching, and pastoral ministry. Equipping pastors, church planters, and ministers through faithful gospel witness.",
        trustChips: [
            "100% Inerrantist Stance",
            "ACTS & CCHE Accredited",
            "Original Languages Exegesis",
            "35+ Provincial Hubs"
        ]
    },
    overview: {
        chancellor: {
            eyebrow: "A MESSAGE FROM THE CHANCELLOR",
            name: "Dr. Emmanuel G. Ramos, Th.D.",
            title: "President & Professor of Systematic Theology",
            quote: "The church does not need more programs; it needs preachers of the Word who tremble at God’s truth. At Mobile Bible School, we believe theological education should not be confined to elite metropolitan halls—it belongs wherever God calls men and women to shepherd His flock. For four decades, our faculty has brought unyielding biblical fidelity directly to the grassroots, training leaders who preach Christ with exegetical clarity and holy courage.",
            scripture: "“Preach the word; be ready in season and out of season; reprove, rebuke, and exhort, with complete patience and teaching.”",
            reference: "— 2 Timothy 4:2"
        },
        pillars: [
            {
                id: "pil-1",
                title: "Biblical Inerrancy",
                description: "We affirm without reservation the verbal plenary inspiration and total inerrancy of Holy Scripture as the sole rule of faith and conduct.",
                icon: "BookOpen"
            },
            {
                id: "pil-2",
                title: "Expository Rigor",
                description: "Pastors are trained in Greek and Hebrew grammatical-historical exegesis to preach the full counsel of God with accuracy and authority.",
                icon: "ScrollText"
            },
            {
                id: "pil-3",
                title: "Modular Accessibility",
                description: "Our mobile modular schedule allows bi-vocational pastors and rural church workers to earn accredited degrees without leaving their pulpits.",
                icon: "GraduationCap"
            },
            {
                id: "pil-4",
                title: "Pastoral Mentorship",
                description: "Every student is paired with experienced senior shepherd-scholars for spiritual accountability, moral formation, and pulpit evaluation.",
                icon: "Users"
            }
        ],
        history: {
            eyebrow: "OUR HERITAGE",
            title: "Four Decades of Faithful Ministerial Instruction",
            desc: "Founded in 1986 amidst a profound shortage of formally trained pastors in provincial and rural communities, Mobile Bible School began as a traveling cohort of seasoned pastors and biblical scholars. Carrying commentary libraries and syllabus binders from province to province, the faculty conducted intensive weekend theological modules for local ministers. Today, Mobile Bible School & Theological Seminary has grown into a fully accredited institution with 35 regional centers, a vibrant digital LMS, and thousands of alumni faithfully shepherding congregations worldwide.",
            timeline: [
                {
                    year: "1986",
                    text: "First mobile pastoral cohort established in Luzon with 28 pioneer pastors."
                },
                {
                    year: "1998",
                    text: "Main Seminary Campus opened in Metro Manila with a 15,000-volume theological research library."
                },
                {
                    year: "2012",
                    text: "Full accreditation granted by the Asian Association of Christian Theological Studies (ACTS)."
                },
                {
                    year: "2026",
                    text: "Launch of MBS Theological LMS 3.0, expanding global extension cohorts to international pastors."
                }
            ]
        }
    },
    faith: {
        intro: {
            eyebrow: "CONFESSIONAL STANDARDS",
            title: "The Ten Articles of Faith & Doctrine",
            desc: "Mobile Bible School & Theological Seminary stands unequivocally within the historic, orthodox evangelical tradition, affirming the full authority of the inerrant Scriptures, the solas of the Protestant Reformation, and the urgent mandate of the Great Commission."
        },
        articles: [
            {
                num: "Article I",
                title: "The Holy Scriptures (Inerrancy & Sufficiency)",
                shortSummary: "The 66 books of the Old and New Testaments as verbally inspired by God and inerrant in original manuscripts.",
                fullText: "We believe that the Holy Bible, consisting of sixty-six books of the Old and New Testaments, is the verbally inspired Word of God, fully inerrant in the original manuscripts, infallible in its content, and the supreme, final authority in all matters of faith, doctrine, and conduct. Scripture is sufficient for salvation, spiritual growth, and the ordering of the church and Christian life.",
                scriptures: ["2 Timothy 3:16–17", "2 Peter 1:20–21", "Psalm 19:7–11", "Matthew 5:18", "John 10:35"]
            },
            {
                num: "Article II",
                title: "The Sovereign Triune God",
                shortSummary: "One eternally existent God in three co-equal persons: Father, Son, and Holy Spirit.",
                fullText: "We believe in one God, eternally existing in three distinct, co-equal persons: the Father, the Son, and the Holy Spirit. Each person of the Godhead possesses identically the same divine nature, attributes, and perfections, executing distinct but harmonious offices in the eternal work of creation, providence, and redemption.",
                scriptures: ["Deuteronomy 6:4", "Matthew 28:19", "2 Corinthians 13:14", "John 1:1–3", "Genesis 1:26"]
            },
            {
                num: "Article III",
                title: "The Lord Jesus Christ",
                shortSummary: "Fully God and fully man, His virgin birth, sinless life, substitutionary blood atonement, bodily resurrection, and ascension.",
                fullText: "We believe that the Lord Jesus Christ is the eternal Son of God, who became man without ceasing to be God, having been conceived by the Holy Spirit and born of the virgin Mary. He lived a sinless life, died on the Cross as a substitutionary sacrifice for the sins of the world, rose bodily from the grave on the third day, ascended into heaven, and now sits at the right hand of God the Father as our High Priest, Intercessor, and Advocate.",
                scriptures: ["John 1:1, 14", "Philippians 2:5–11", "1 Corinthians 15:3–4", "Hebrews 7:25", "Colossians 1:15–20"]
            },
            {
                num: "Article IV",
                title: "The Holy Spirit & Regeneration",
                shortSummary: "The divine person who convicts, regenerates, indwells, sanctifies, and empowers believers for gospel ministry.",
                fullText: "We believe that the Holy Spirit is a divine person equal with the Father and the Son. He convicts the world of sin, righteousness, and judgment. At the moment of regeneration, He baptizes every believer into the Body of Christ, permanently indwells them, seals them unto the day of redemption, imparts spiritual gifts for the edification of the church, and empowers them to walk in holiness and witness boldly for Christ.",
                scriptures: ["John 14:16–17", "John 16:7–11", "Romans 8:9, 14–16", "1 Corinthians 12:7, 13", "Ephesians 1:13–14"]
            },
            {
                num: "Article V",
                title: "The Fall of Humanity & Depravity",
                shortSummary: "Created in God's image, fallen through Adam's transgression, spiritually dead and unable to save themselves.",
                fullText: "We believe that man was created directly in the image and likeness of God, free from sin, with a rational nature and moral responsibility. Through voluntary disobedience, Adam fell, and as a consequence, all humanity inherited a fallen nature, became spiritually dead in trespasses and sins, subject to physical and eternal death, and utterly unable to remedy their lost condition apart from God's sovereign grace.",
                scriptures: ["Genesis 1:26–27", "Genesis 3:1–19", "Romans 3:10–23", "Romans 5:12–19", "Ephesians 2:1–3"]
            },
            {
                num: "Article VI",
                title: "Salvation Solely by Grace through Faith",
                shortSummary: "Justification by faith alone in Christ's finished work on Calvary, without human works or merit.",
                fullText: "We believe that salvation is the gift of God brought to man by grace and received solely by personal faith in the Lord Jesus Christ, whose precious blood was shed for the forgiveness of sins. No works, rituals, sacraments, or human merit can contribute to justification. True believers are kept eternally secure by the power of God through faith unto final salvation.",
                scriptures: ["Ephesians 2:8–9", "Titus 3:5", "Romans 5:1", "John 10:28–30", "Romans 8:38–39"]
            },
            {
                num: "Article VII",
                title: "The Church & The Ordinances",
                shortSummary: "The Body of Christ manifested in local assemblies observing Believer's Water Baptism and the Lord's Supper.",
                fullText: "We believe that the Church is the spiritual Body and Bride of Christ, composed of all born-again believers of the present age. This universal body is manifested in autonomous local assemblies of baptized believers united for worship, biblical teaching, prayer, fellowship, and the Great Commission. We recognize two scriptural ordinances: Believer's Baptism by immersion as a testimony of faith, and the Lord's Supper as a memorial of His sacrificial death.",
                scriptures: ["Matthew 28:19–20", "Acts 2:41–42", "1 Corinthians 11:23–26", "Ephesians 4:4–6", "Hebrews 10:24–25"]
            },
            {
                num: "Article VIII",
                title: "Expository Preaching & Pastoral Integrity",
                shortSummary: "The sacred mandate to herald the full counsel of God with grammatical-historical precision and unblemished character.",
                fullText: "We believe that the pastoral office is established by Christ for the spiritual shepherding and governance of the local church. Pastors and elders must satisfy the strict biblical qualifications of 1 Timothy 3:1–7 and Titus 1:5–9, living blameless lives of moral purity and marital fidelity. The core task of the pulpit is sequential expository preaching—rightly dividing the Word of truth to equip the saints for the work of ministry.",
                scriptures: ["2 Timothy 4:1–5", "1 Timothy 3:1–7", "Titus 1:5–9", "1 Peter 5:1–4", "Acts 20:26–28"]
            },
            {
                num: "Article IX",
                title: "The Great Commission & Church Multiplication",
                shortSummary: "The solemn imperative to proclaim the Gospel to every creature and plant reproducing New Testament churches.",
                fullText: "We believe that it is the solemn privilege and sacred responsibility of every redeemed person and every biblical church to engage in personal evangelism, world missions, and church planting. The Great Commission commands us to go into all the world, proclaim the gospel to every nation, make disciples, baptize converts, and teach them to observe all things commanded by Christ.",
                scriptures: ["Matthew 28:18–20", "Mark 16:15", "Luke 24:46–48", "Acts 1:8", "Romans 10:14–17"]
            },
            {
                num: "Article X",
                title: "The Second Coming & Eternal Destiny",
                shortSummary: "The bodily, glorious return of Jesus Christ, resurrection of the dead, eternal reward for the saved, and judgment for the lost.",
                fullText: "We believe in the personal, bodily, and glorious return of our Lord Jesus Christ to establish His kingdom and execute judgment. We believe in the bodily resurrection of both the saved and the lost—the redeemed to everlasting life, blessedness, and joy in the presence of God, and the unrepentant to conscious, everlasting punishment in the Lake of Fire separated from the glory of the Lord.",
                scriptures: ["1 Thessalonians 4:13–18", "Revelation 20:11–15", "Revelation 21:1–7", "Matthew 25:31–46", "John 14:1–3"]
            }
        ]
    },
    faculty: {
        intro: {
            eyebrow: "ACADEMIC ROSTER & CHAIRS",
            title: "Seminary Faculty, Deans & Leadership",
            desc: "Our distinguished faculty combines high-tier theological scholarship with decades of active pastoral and church-planting experience. Every professor signs the MBS Inerrancy Statement annually and actively shepherds local congregations."
        },
        members: [
            {
                id: "fac-1",
                name: "Dr. Emmanuel G. Ramos",
                title: "Seminary President & Professor of Systematic Theology",
                department: "leadership",
                departmentLabel: "Executive Leadership & Deans",
                degrees: ["Th.D. in Systematic Theology (ATS)", "D.Min. in Pastoral Leadership (DTS)", "M.Div. in Biblical Studies"],
                courses: ["Systematic Theology I & II", "Trinitarian Dogmatics", "Theological Prolegomena", "Ecclesiology & Eschatology"],
                bio: "Dr. Ramos has served in pastoral ministry and seminary leadership for over 35 years. He is the author of four theological monographs and has trained over 250 pastors across Luzon, Visayas, and Mindanao.",
                tenureYears: 32,
                photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
            },
            {
                id: "fac-2",
                name: "Dr. Benjamin V. De Jesus",
                title: "Dean of the Seminary & Chair of Biblical Languages",
                department: "languages",
                departmentLabel: "Biblical Languages & Exegesis",
                degrees: ["Ph.D. in New Testament Exegesis (AGST)", "Th.M. in Greek Grammar (Magna Cum Laude)", "M.Div."],
                courses: ["Biblical Greek Grammar I & II", "Greek Exegesis of Romans", "Advanced Hermeneutics", "Pauline Epistles"],
                bio: "Renowned Greek syntactician with 28 years of academic instruction. Passionate about empowering church planters and pastors to read the New Testament in its inspired original tongue.",
                tenureYears: 28,
                photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80"
            },
            {
                id: "fac-3",
                name: "Rev. Dr. Joseph M. Santos",
                title: "Dean of Pastoral Studies & Church Multiplication",
                department: "ministry",
                departmentLabel: "Pastoral Studies & Missions",
                degrees: ["D.Min. in Expository Preaching", "M.Div. in Pastoral Ministry", "B.Th."],
                courses: ["Expository Preaching Practicum", "Pastoral Theology & Shepherding", "Principles of Church Planting", "Evangelism & Disciple Making"],
                bio: "Veteran pastor and church planter responsible for 14 daughter church plants. Oversees the Mobile Bible School grassroots modular cohorts across provincial hubs.",
                tenureYears: 24,
                photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80"
            },
            {
                id: "fac-4",
                name: "Rev. Josue C. Bautista",
                title: "Seminary Registrar & Professor of Old Testament",
                department: "languages",
                departmentLabel: "Biblical Languages & Exegesis",
                degrees: ["Th.M. in Old Testament Literature", "M.Div. in Hebrew Exegesis", "B.S. Education"],
                courses: ["Biblical Hebrew Grammar", "The Pentateuch & Covenant Theology", "Old Testament Historical Books", "Hebrew Poetry & Wisdom"],
                bio: "Old Testament specialist committed to the historical-grammatical interpretation of the Hebrew Scriptures. Guides students through textual criticism and canonical exegesis.",
                tenureYears: 19,
                photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80"
            },
            {
                id: "fac-5",
                name: "Prof. Mary Grace L. Villanueva",
                title: "Dean of Christian Education & Counseling",
                department: "theology",
                departmentLabel: "Systematic & Educational Theology",
                degrees: ["M.Th. in Christian Education", "M.A. in Christian Counseling", "B.Th."],
                courses: ["Christian Education in the Church", "Biblical Counseling & Care", "Family Discipleship", "Curriculum Design"],
                bio: "Over 20 years developing curriculum for theological extensions and Sunday school leadership throughout the Philippines. Advisor for women's ministries and child catechesis.",
                tenureYears: 21,
                photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
            },
            {
                id: "fac-6",
                name: "Rev. Samuel P. Cruz",
                title: "Director of Field Education & Modular Extensions",
                department: "ministry",
                departmentLabel: "Pastoral Studies & Missions",
                degrees: ["M.Div. in Evangelism & Missions", "D.Min. (cand.) in Urban Ministry", "B.A. Theology"],
                courses: ["Field Ministry Practicum", "Christian Apologetics", "Missions History & Strategy", "Spiritual Formation"],
                bio: "Field director coordinating Mobile Bible School modular weekend sessions across 35 provincial centers. Serves as active church revitalizer and mentor to rural pastors.",
                tenureYears: 16,
                photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80"
            }
        ]
    },
    accreditations: {
        intro: {
            eyebrow: "INSTITUTIONAL VALIDATION",
            title: "Academic Accreditations, Recognition & Charters",
            desc: "Mobile Bible School & Theological Seminary adheres to high institutional standards of academic excellence and ministerial accountability. Our curriculum and degree programs are fully vetted and recognized for ministerial ordination and graduate transferability."
        },
        accreditations: [
            {
                id: "acc-1",
                badge: "FULL ACCREDITATION",
                title: "Asian Association of Christian Theological Studies (ACTS)",
                description: "Mobile Bible School holds full accredited institutional member status under the Asian Association of Christian Theological Studies (ACTS). Accreditation certifies that our academic degrees (DPS, B.Th., M.Min., M.Th.) fulfill comprehensive faculty qualifications, library holdings, curricular depth, and spiritual formation benchmarks.",
                meta: [
                    { label: "Accreditation No", value: "#ACTS-SEM-2024-8891" },
                    { label: "Status", value: "Accredited with Highest Distinction" },
                    { label: "Next Review", value: "Academic Year 2030" }
                ]
            },
            {
                id: "acc-2",
                badge: "RECOGNIZED INSTITUTION",
                title: "Commission on Christian Higher Education (CCHE)",
                description: "Recognized by the Commission on Christian Higher Education (CCHE), ensuring that our diploma, undergraduate, and graduate programs comply with pedagogical standards recognized by tertiary evangelical colleges and pastoral fellowships across the country.",
                meta: [
                    { label: "Institutional Seal", value: "CCHE Validated" },
                    { label: "Level", value: "Graduate Seminary Charter" },
                    { label: "Curriculum", value: "Classical Biblical Exegesis" }
                ]
            }
        ],
        transfer: {
            title: "Ordination & Graduate Credit Transferability",
            subtitle: "Degrees awarded by Mobile Bible School & Theological Seminary qualify graduates for formal ordination examinations and pastoral credentialing.",
            points: [
                {
                    title: "Denominational Acceptance",
                    desc: "Recognized by major evangelical denominations, Baptist associations, Reformed councils, and independent missionary boards throughout Asia and North America."
                },
                {
                    title: "Official Transcripts",
                    desc: "The Registrar Office issues official sealed transcripts, English translations, and credential certificates for advanced seminary applications and chaplaincy verification."
                },
                {
                    title: "Academic Integrity",
                    desc: "All credit hours require rigorous classroom lecture attendance, exegetical research papers, Greek/Hebrew translation drills, and supervised field ministry practicums."
                }
            ]
        }
    },
    campuses: {
        intro: {
            eyebrow: "CENTERS & TRAINING FACILITIES",
            title: "Main Campus & Provincial Extension Hubs",
            desc: "Mobile Bible School operates an integrated network of learning environments: our Metro Manila Headquarters, 35 regional modular hubs across Luzon, Visayas, and Mindanao, and the MBS Global Online Extension."
        },
        mainCampus: {
            badge: "MAIN INSTITUTIONAL HEADQUARTERS",
            title: "Metro Manila Seminary Campus & Library Commons",
            location: "Main Seminary Campus • Metro Manila, Philippines",
            narrative: "The main seminary complex houses the Central Academic Administration, the Dean’s Office, the Registrar, the 500-seat Grand Chapel Auditorium, multimedia recording lecture halls, and the John Bunyan Theological Library containing more than 15,000 cataloged commentaries, concordances, journals, and microfiche archives.",
            facilities: [
                {
                    id: "fac-item-1",
                    title: "500-Seat Chapel Auditorium",
                    subtitle: "Weekly chapel worship, ordination convocations, and annual pastor colloquiums.",
                    icon: "Landmark"
                },
                {
                    id: "fac-item-2",
                    title: "Theological Research Library",
                    subtitle: "15,000+ print volumes, ATLA Religion Database access, and Greek/Hebrew study desks.",
                    icon: "BookOpen"
                },
                {
                    id: "fac-item-3",
                    title: "Multimedia Lecture Halls",
                    subtitle: "Four smart lecture halls equipped with HD streaming cameras for modular broadcasts.",
                    icon: "Building2"
                },
                {
                    id: "fac-item-4",
                    title: "Admissions & Registrar Center",
                    subtitle: "Full student services, student records, enrollment counseling, and bookshop.",
                    icon: "Users"
                }
            ]
        },
        regionalHubs: [
            {
                id: "reg-1",
                regionBadge: "LUZON PROVINCIAL CENTERS",
                title: "Luzon Modular Extension Centers",
                subtitle: "Monthly pastoral intensives conducted by traveling resident professors.",
                hubs: [
                    { name: "Baguio City & Cordillera Hub", description: "Serving Northern Luzon pastors" },
                    { name: "Dagupan City (Pangasinan)", description: "Central Plains Regional Training Hub" },
                    { name: "San Fernando (Pampanga)", description: "Central Luzon Ministerial Center" },
                    { name: "Lipa City (Batangas)", description: "Southern Tagalog & Bicol Extension" }
                ]
            },
            {
                id: "reg-2",
                regionBadge: "VISAYAS & MINDANAO CENTERS",
                title: "Visayas & Mindanao Extension Hubs",
                subtitle: "Equipping pastors across the central and southern islands with sound doctrine.",
                hubs: [
                    { name: "Cebu City Central Hub", description: "Regional Headquarters for Central Visayas" },
                    { name: "Iloilo & Bacolod Hubs", description: "Panay & Negros Island Pastoral Cohorts" },
                    { name: "Davao City Seminary Center", description: "Serving Southern Mindanao" },
                    { name: "Cagayan de Oro Center", description: "Northern Mindanao & Caraga pastoral students" }
                ]
            }
        ],
        onlineExt: {
            title: "MBS Global Online Extension (Theological LMS 3.0)",
            desc: "For international pastors and overseas church workers unable to attend physical modular sessions, our full curriculum is accessible via our secure, high-definition online classroom platform.",
            buttonText: "Access LMS Platform"
        }
    },
    cta: {
        pill: "ACCREDITED THEOLOGICAL FORMATION",
        title: "Called to Preach the Uncompromising Word?",
        desc: "Whether you are an aspiring minister seeking formal ordination, a bi-vocational church planter, or an active pastor desiring deeper exegetical precision, Mobile Bible School welcomes your application.",
        primaryBtn: "Apply for Admission",
        secondaryBtn: "Speak with Admissions Registrar"
    }
};

const STORAGE_KEY = "mbs_about_content_v2";
export const ABOUT_CONTENT_UPDATED_EVENT = "mbs_about_content_updated";

// ------------------------------------------------------------
// AUTHENTICATION & ROLE DETECTION
// ------------------------------------------------------------
export function isUserAdmin(): boolean {
    if (typeof window === "undefined") return false;

    try {
        if (PermissionService.isAdministrator()) {
            return true;
        }

        const role = (localStorage.getItem("role") || localStorage.getItem("currentRole") || "").trim().toLowerCase();
        const adminRoles = ["admin", "administrator", "system administrator", "super admin", "superadmin", "system admin"];
        if (adminRoles.includes(role)) {
            return true;
        }

        const roleId = Number(localStorage.getItem("roleId") || localStorage.getItem("currentRoleId"));
        if (roleId === 1) {
            return true;
        }

        // Check epicUser session
        const rawUser = localStorage.getItem("epicUser");
        if (rawUser) {
            const user = JSON.parse(rawUser);
            if (user?.role && adminRoles.includes(String(user.role).trim().toLowerCase())) {
                return true;
            }
            if (Number(user?.roleId) === 1) {
                return true;
            }
        }
    } catch (e) {
        console.warn("Admin check warning in aboutContentService:", e);
    }

    return false;
}

// ------------------------------------------------------------
// CONTENT FETCHER
// ------------------------------------------------------------
export async function getAboutContent(): Promise<AboutContentData> {
    // 1. Check local storage for immediate synchronous return
    let localContent: AboutContentData | null = null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            localContent = JSON.parse(raw);
        }
    } catch {
        // ignore
    }

    // 2. Fetch from backend API
    try {
        const res = await fetch(`${API_BASE_URL}/AboutContent`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (res.ok) {
            const data = await res.json();
            if (data && !data.isDefault && data.hero && data.faith) {
                // Merge with default to guarantee all keys exist
                const merged: AboutContentData = {
                    ...DEFAULT_ABOUT_CONTENT,
                    ...data,
                    hero: { ...DEFAULT_ABOUT_CONTENT.hero, ...(data.hero || {}) },
                    overview: {
                        ...DEFAULT_ABOUT_CONTENT.overview,
                        ...(data.overview || {}),
                        chancellor: { ...DEFAULT_ABOUT_CONTENT.overview.chancellor, ...(data.overview?.chancellor || {}) },
                        history: { ...DEFAULT_ABOUT_CONTENT.overview.history, ...(data.overview?.history || {}) }
                    },
                    faith: {
                        ...DEFAULT_ABOUT_CONTENT.faith,
                        ...(data.faith || {})
                    },
                    faculty: {
                        ...DEFAULT_ABOUT_CONTENT.faculty,
                        ...(data.faculty || {})
                    },
                    accreditations: {
                        ...DEFAULT_ABOUT_CONTENT.accreditations,
                        ...(data.accreditations || {})
                    },
                    campuses: {
                        ...DEFAULT_ABOUT_CONTENT.campuses,
                        ...(data.campuses || {}),
                        mainCampus: { ...DEFAULT_ABOUT_CONTENT.campuses.mainCampus, ...(data.campuses?.mainCampus || {}) }
                    },
                    cta: {
                        ...DEFAULT_ABOUT_CONTENT.cta,
                        ...(data.cta || {})
                    }
                };

                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
                } catch {
                    // ignore
                }
                return merged;
            }
        }
    } catch (err) {
        console.warn("[AboutContent] Failed to fetch live content, using cached or fallback:", err);
    }

    return localContent || DEFAULT_ABOUT_CONTENT;
}

// ------------------------------------------------------------
// SAVE CONTENT
// ------------------------------------------------------------
export async function saveAboutContent(data: AboutContentData): Promise<boolean> {
    // 1. Immediately cache locally
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent(ABOUT_CONTENT_UPDATED_EVENT, { detail: data }));
    } catch (e) {
        console.warn("[AboutContent] LocalStorage save warning:", e);
    }

    // 2. Persist to API
    try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(`${API_BASE_URL}/AboutContent`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify(data)
        });

        return res.ok;
    } catch (err) {
        console.error("[AboutContent] API save failed:", err);
        return false;
    }
}

// ------------------------------------------------------------
// RESET CONTENT
// ------------------------------------------------------------
export async function resetAboutContent(): Promise<AboutContentData> {
    try {
        localStorage.removeItem(STORAGE_KEY);
        const token = localStorage.getItem("token") || "";
        await fetch(`${API_BASE_URL}/AboutContent/reset`, {
            method: "POST",
            headers: {
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            }
        });
    } catch (err) {
        console.warn("[AboutContent] Reset API error:", err);
    }

    window.dispatchEvent(new CustomEvent(ABOUT_CONTENT_UPDATED_EVENT, { detail: DEFAULT_ABOUT_CONTENT }));
    return DEFAULT_ABOUT_CONTENT;
}

// ------------------------------------------------------------
// UPLOAD FACULTY PHOTO (API + COMPRESSED CLIENT DATA URL FALLBACK)
// ------------------------------------------------------------
export async function uploadFacultyPhoto(file: File): Promise<string> {
    // 1. Try backend API upload
    try {
        const formData = new FormData();
        formData.append("file", file);
        const token = localStorage.getItem("token") || "";

        const res = await fetch(`${API_BASE_URL}/AboutContent/upload-faculty-photo`, {
            method: "POST",
            headers: {
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: formData
        });

        if (res.ok) {
            const data = await res.json();
            if (data.url) {
                const fullUrl = data.url.startsWith("http")
                    ? data.url
                    : `${API_BASE_URL.replace(/\/api$/, "")}${data.url}`;
                return fullUrl;
            }
        }
    } catch (err) {
        console.warn("[AboutContent] Photo upload to API failed, falling back to compressed client DataURL:", err);
    }

    // 2. High-reliability client-side Data URL fallback with canvas compression
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 600;
                const MAX_HEIGHT = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width = Math.round((width * MAX_HEIGHT) / height);
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL("image/jpeg", 0.85));
                } else {
                    resolve((e.target?.result as string) || "");
                }
            };
            img.onerror = () => {
                resolve((e.target?.result as string) || "");
            };
            img.src = (e.target?.result as string) || "";
        };
        reader.readAsDataURL(file);
    });
}
