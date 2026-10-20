export interface FieldModuleItem {
    id: string;
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    hostLocation: string;
    date: string;
    units: string;
    badge: string;
    tagline: string;
    primaryCta: string;
    curriculumHighlight?: string[];
    themeGradient?: string;
    videoUrl?: string;
    videoName?: string;
    videoSize?: number;
}

export interface PromoScene {
    id: string;
    chapterNumber: string;
    chapterLabel: string;
    title: string;
    subtitle: string;
    quoteGreek?: string;
    quoteEnglish?: string;
    locationBadge: string;
    durationSeconds: number;
    bgGradient: string;
    imageUrl?: string;
    imageName?: string;
    videoUrl?: string;
    videoName?: string;
    videoSize?: number;
    mediaType?: "image" | "video";
    eventBadge?: string;
    eventDate?: string;
    eventDescription?: string;
}

export interface PromoVideoSettings {
    mode: "cinematic" | "embed" | "uploaded";
    videoUrl: string;
    uploadedVideoUrl?: string;
    uploadedVideoName?: string;
    uploadedVideoSize?: number;
    badgeText: string;
    videoTitle: string;
    videoTagline: string;
    durationLabel: string;
    ctaText: string;
    showCaptions: boolean;
    autoPlay: boolean;
    scenes: PromoScene[];
}

export interface LandingPageContent {
    ribbonText: string;
    ribbonCta: string;
    schoolName: string;
    brandTagline: string;
    heroBadge: string;
    heroTitleWhite: string;
    heroTitleGradient: string;
    heroSubtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    guarantee1: string;
    guarantee2: string;
    guarantee3: string;
    carouselEyebrow: string;
    carouselHeadline: string;
    carouselSubheadline: string;
    modules: FieldModuleItem[];
    promoVideo: PromoVideoSettings;
}

export const DEFAULT_LANDING_CONTENT: LandingPageContent = {
    ribbonText: "Spring & Summer 2027 Mobile Modular Cohorts. Bring accredited biblical education directly to your local church or province.",
    ribbonCta: "Host a Mobile Cohort",
    schoolName: "Mobile Bible School",
    brandTagline: "INTERNATIONAL",
    heroBadge: "ACCREDITED THEOLOGICAL EDUCATION • ZERO RELOCATION",
    heroTitleWhite: "Deep Biblical Truth.",
    heroTitleGradient: "Everywhere You Are Called.",
    heroSubtitle: "Mobile Bible School delivers rigorous, Christ-centered seminary instruction directly to local churches, mission frontiers, and bi-vocational ministers. Study where you serve.",
    ctaPrimary: "Apply for Admission",
    ctaSecondary: "Explore Field Modules",
    guarantee1: "100% Mobile & Modular",
    guarantee2: "Keep Working Full-Time",
    guarantee3: "80% Subsidized Tuition",
    carouselEyebrow: "UPCOMING FIELD INTENSIVES",
    carouselHeadline: "Where Mobile Bible School is Heading Next.",
    carouselSubheadline: "Experience world-class faculty on location. Each 3-day modular session equips leaders with in-depth scripture study and practical ministry skills.",
    modules: [
        {
            id: "module-1",
            eyebrow: "FIELD INTENSIVE • ADVANCED HERMENEUTICS",
            title: "Inductive Bible Study",
            highlight: "& Expository Exegesis",
            description: "Master the principles of biblical interpretation without relocating. We bring veteran theological faculty directly to your local church for a 3-day intensive on Greek tools, historical contexts, and expository sermon prep.",
            hostLocation: "Central Host Church • Metro Manila Hub",
            date: "November 14–16, 2026",
            units: "3 Academic Units",
            badge: "FALL COHORT",
            tagline: "Uncompromising biblical scholarship. Grounded in the local church.",
            primaryCta: "Apply for Hermeneutics Cohort",
        },
        {
            id: "module-2",
            eyebrow: "CORE THEOLOGY • SYSTEMATIC DOCTRINE",
            title: "Theology Proper &",
            highlight: "The Doctrines of Grace",
            description: "A foundational survey of Systematic Theology tailored for bi-vocational pastors and church leaders. Explore the character of God, Christology, Pneumatology, and the sovereign plan of redemption.",
            hostLocation: "North Luzon Regional Center • Baguio Hub",
            date: "December 04–06, 2026",
            units: "3 Academic Units",
            badge: "WINTER COHORT",
            tagline: "Sound doctrine that fuels passionate discipleship.",
            primaryCta: "Enroll in Systematic Theology",
        },
        {
            id: "module-3",
            eyebrow: "MINISTRY PRACTICUM • HOMILETICS LAB",
            title: "Expository Preaching",
            highlight: "& Pastoral Care Lab",
            description: "Step into an interactive preaching clinic. Deliver trial messages before mentor pastors, receive constructive exegetical feedback, and learn biblical counseling techniques for church care.",
            hostLocation: "Visayas Regional Center • Cebu Hub",
            date: "January 15–17, 2027",
            units: "3 Academic Units",
            badge: "SPRING 2027",
            tagline: "Transforming scripture insights into life-changing proclamation.",
            primaryCta: "Register for Preaching Lab",
        },
        {
            id: "module-4",
            eyebrow: "FRONTIER MISSIONS • CHURCH EXPANSION",
            title: "Pioneer Church Planting",
            highlight: "& Cross-Cultural Evangelism",
            description: "Designed for evangelists and frontier missionaries. Learn strategy, demographic mapping, disciple-making movements, and multiplying indigenous church plants in unreached rural communities.",
            hostLocation: "Mindanao Frontier Campus • Davao Hub",
            date: "February 19–21, 2027",
            units: "4 Academic Units",
            badge: "MISSION FRONTIER",
            tagline: "Equipping disciples to take the Gospel to the unreached ends.",
            primaryCta: "Join Church Planting Practicum",
        },
    ],
    promoVideo: {
        mode: "cinematic",
        videoUrl: "",
        badgeText: "OFFICIAL 2026 PROMO • 4K HDR",
        videoTitle: "Mobile Bible School: The Vision & Movement",
        videoTagline: "Watch how our mobile modular curriculum brings accredited theological training directly into remote churches and communities.",
        durationLabel: "03:45",
        ctaText: "Apply for Next Cohort",
        showCaptions: true,
        autoPlay: false,
        scenes: [
            {
                id: "scene-1",
                chapterNumber: "01",
                chapterLabel: "THE VISION",
                title: "The Seminary Comes to Your City",
                subtitle: "No pastor should have to abandon their congregation to receive rigorous theological training. We bring the seminary directly to the frontier.",
                quoteGreek: "ἀποστελλόμενοι εἰς τὸν κόσμον",
                quoteEnglish: "“Sent into the harvest fields with uncompromising theological bedrock.”",
                locationBadge: "REGIONAL MISSION HUBS",
                durationSeconds: 6,
                bgGradient: "linear-gradient(135deg, #090e17 0%, #0d1e38 50%, #15294a 100%)",
                imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80",
                eventBadge: "ANNUAL SCHOOL CONVOCATION • THEOLOGICAL SUMMIT",
                eventDate: "November 14–16, 2026 • Metro Manila Campus & Regional Hubs",
                eventDescription: "3-day campus gathering with master-class expository lectures, faculty panels, and praise."
            },
            {
                id: "scene-2",
                chapterNumber: "02",
                chapterLabel: "GREEK & EXEGESIS",
                title: "The Grammar of Grace: Pauline Epistles in Context",
                subtitle: "Observing the textual syntax of Ephesians 2:1–10. Examining causative participles and theological implications for local pastoral preaching.",
                quoteGreek: "χάριτί ἐστε σεσῳσμένοι διὰ πίστεως",
                quoteEnglish: "“By grace you have been saved through faith” — Ephesians 2:8",
                locationBadge: "HERMENEUTICS LAB • 3.0 UNITS",
                durationSeconds: 7,
                bgGradient: "linear-gradient(135deg, #0f1712 0%, #132b1e 50%, #1b3d2b 100%)",
                imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1600&q=80",
                eventBadge: "CAMPUS WORKSHOP • GREEK EXEGESIS & INDUCTIVE STUDY",
                eventDate: "December 04–06, 2026 • North Luzon Regional Hub",
                eventDescription: "Hands-on syntax diagramming and original language analysis for biblical sermon drafting."
            },
            {
                id: "scene-3",
                chapterNumber: "03",
                chapterLabel: "OFFLINE FIELD TECH",
                title: "Zero Internet? Offline Field Satellite Technology",
                subtitle: "Our rugged solar-powered mobile servers deliver thousands of hours of master-level commentaries and digital libraries to remote islands.",
                quoteGreek: "κηρύξατε τὸ εὐαγγέλιον πάσῃ τῇ κτίσει",
                quoteEnglish: "“Preach the gospel to all creation” — Mark 16:15",
                locationBadge: "MBS OFFLINE CLOUD CAMPUS",
                durationSeconds: 6,
                bgGradient: "linear-gradient(135deg, #170d1e 0%, #2a133b 50%, #3e1b54 100%)",
                imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1600&q=80",
                eventBadge: "MISSION OUTREACH • PROVINCIAL FIELD PRACTICUM",
                eventDate: "January 15–17, 2027 • Visayas & Mindanao Mission Frontiers",
                eventDescription: "Field cohort deployment for community evangelism, pastoral counseling, and leadership clinics."
            },
            {
                id: "scene-4",
                chapterNumber: "04",
                chapterLabel: "ORDINATION & HARVEST",
                title: "Commissioning Faithful Servants of the Word",
                subtitle: "Over 1,200 pastors ordained and 340 indigenous churches planted worldwide. Your ministry journey starts where God called you today.",
                quoteGreek: "σπούδασον σεαυτὸν δόκιμον παραστῆσαι τῷ Θεῷ",
                quoteEnglish: "“Present yourself approved to God, rightly handling the word of truth” — 2 Tim 2:15",
                locationBadge: "GRADUATION & PASTORAL ORDINATION",
                durationSeconds: 7,
                bgGradient: "linear-gradient(135deg, #1a1608 0%, #33260c 50%, #4a3814 100%)",
                imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80",
                eventBadge: "COMMENCEMENT • BACCALAUREATE & PASTORAL ORDINATION",
                eventDate: "February 19–21, 2027 • Main Seminary Auditorium",
                eventDescription: "Celebrating graduating cohorts receiving theological degrees and laying on of hands for pastoral ministry."
            },
        ],
    },
};

const STORAGE_KEY = "sms_landing_content";
export const LANDING_CONTENT_EVENT = "sms_landing_content_updated";

export const getLandingPageContent = (): LandingPageContent => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            const promo = parsed.promoVideo || {};
            const parsedScenes = Array.isArray(promo.scenes) && promo.scenes.length > 0 ? promo.scenes : DEFAULT_LANDING_CONTENT.promoVideo.scenes;
            const mergedScenes = parsedScenes.map((s: any, idx: number) => {
                const def = DEFAULT_LANDING_CONTENT.promoVideo.scenes[idx] || DEFAULT_LANDING_CONTENT.promoVideo.scenes[0];
                return {
                    ...def,
                    ...s,
                    imageUrl: s.imageUrl !== undefined ? s.imageUrl : def.imageUrl,
                    imageName: s.imageName,
                    videoUrl: s.videoUrl,
                    videoName: s.videoName,
                    videoSize: s.videoSize,
                    mediaType: s.mediaType,
                    eventBadge: s.eventBadge || def.eventBadge,
                    eventDate: s.eventDate || def.eventDate,
                    eventDescription: s.eventDescription || def.eventDescription,
                };
            });

            return {
                ...DEFAULT_LANDING_CONTENT,
                ...parsed,
                carouselEyebrow: parsed.carouselEyebrow || DEFAULT_LANDING_CONTENT.carouselEyebrow,
                carouselHeadline: parsed.carouselHeadline || DEFAULT_LANDING_CONTENT.carouselHeadline,
                carouselSubheadline: parsed.carouselSubheadline || DEFAULT_LANDING_CONTENT.carouselSubheadline,
                modules: Array.isArray(parsed.modules) && parsed.modules.length > 0 ? parsed.modules : DEFAULT_LANDING_CONTENT.modules,
                promoVideo: {
                    ...DEFAULT_LANDING_CONTENT.promoVideo,
                    ...promo,
                    scenes: mergedScenes,
                },
            };
        }
    } catch (e) {
        console.warn("Failed to read landing page content from localStorage:", e);
    }
    return DEFAULT_LANDING_CONTENT;
};

export const saveLandingPageContent = (content: LandingPageContent): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
        window.dispatchEvent(new CustomEvent(LANDING_CONTENT_EVENT, { detail: content }));
    } catch (e) {
        console.error("Failed to save landing page content:", e);
    }
};

export const resetLandingPageContent = (): LandingPageContent => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent(LANDING_CONTENT_EVENT, { detail: DEFAULT_LANDING_CONTENT }));
    } catch (e) {
        console.error("Failed to reset landing page content:", e);
    }
    return DEFAULT_LANDING_CONTENT;
};
