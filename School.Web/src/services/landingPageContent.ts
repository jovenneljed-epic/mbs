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
    posterUrl?: string;
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
    loop?: boolean;
    muted?: boolean;
    scenes?: PromoScene[];
}

export interface ColorThemeSettings {
    themeId: string;
    name: string;
    badge: string;
    description: string;
    primary: string;
    primaryHover: string;
    secondary: string;
    glow: string;
    heroGlow: string;
    heroBgStart: string;
    heroBgEnd: string;
    gradient: string;
    cardAccent: string;
}

export const COLOR_THEME_PRESETS: Record<string, ColorThemeSettings> = {
    "seminary-maroon": {
        themeId: "seminary-maroon",
        name: "Seminary Maroon & Gold",
        badge: "OFFICIAL MBS",
        description: "Prestigious institutional deep maroon with academic gold accents & collegiate ivory backdrop.",
        primary: "#7A1526",
        primaryHover: "#580d1b",
        secondary: "#F59E0B",
        glow: "rgba(122, 21, 38, 0.35)",
        heroGlow: "rgba(122, 21, 38, 0.2)",
        heroBgStart: "#3c0812",
        heroBgEnd: "#1a0408",
        gradient: "linear-gradient(180deg, #ffffff 20%, #fde68a 65%, #f59e0b 100%)",
        cardAccent: "rgba(122, 21, 38, 0.2)",
    },
    "classic-navy": {
        themeId: "classic-navy",
        name: "Classic Seminary",
        badge: "RECOMMENDED",
        description: "Prestigious seminary cobalt with golden celestial accents & deep navy backdrop.",
        primary: "#1877f2",
        primaryHover: "#1464cc",
        secondary: "#f59e0b",
        glow: "rgba(24, 119, 242, 0.35)",
        heroGlow: "rgba(24, 119, 242, 0.16)",
        heroBgStart: "#050a14",
        heroBgEnd: "#0a1224",
        gradient: "linear-gradient(180deg, #ffffff 20%, #93c5fd 65%, #f59e0b 100%)",
        cardAccent: "rgba(24, 119, 242, 0.2)",
    },
    "emerald-academic": {
        themeId: "emerald-academic",
        name: "Living Word Emerald",
        badge: "NATURE & GROWTH",
        description: "Deep botanical forest greens & bright mint symbolizing spiritual fruitfulness and life.",
        primary: "#10b981",
        primaryHover: "#059669",
        secondary: "#34d399",
        glow: "rgba(16, 185, 129, 0.35)",
        heroGlow: "rgba(16, 185, 129, 0.16)",
        heroBgStart: "#020f0a",
        heroBgEnd: "#051b12",
        gradient: "linear-gradient(180deg, #ffffff 20%, #a7f3d0 65%, #10b981 100%)",
        cardAccent: "rgba(16, 185, 129, 0.2)",
    },
    "covenant-crimson": {
        themeId: "covenant-crimson",
        name: "Covenant Crimson & Wine",
        badge: "HISTORIC SEMINARY",
        description: "Dignified historical wine, rich burgundy, and rose gold of ancient theological institutions.",
        primary: "#e11d48",
        primaryHover: "#be123c",
        secondary: "#fb7185",
        glow: "rgba(225, 29, 72, 0.35)",
        heroGlow: "rgba(225, 29, 72, 0.18)",
        heroBgStart: "#100307",
        heroBgEnd: "#1f070e",
        gradient: "linear-gradient(180deg, #ffffff 20%, #fecdd3 65%, #fb7185 100%)",
        cardAccent: "rgba(225, 29, 72, 0.2)",
    },
    "royal-amethyst": {
        themeId: "royal-amethyst",
        name: "Royal Amethyst & Violet",
        badge: "INSPIRATIONAL",
        description: "Majestic apostolic purple with glowing violet highlights and deep velvet shadows.",
        primary: "#8b5cf6",
        primaryHover: "#7c3aed",
        secondary: "#c084fc",
        glow: "rgba(139, 92, 246, 0.35)",
        heroGlow: "rgba(139, 92, 246, 0.18)",
        heroBgStart: "#0b0517",
        heroBgEnd: "#170b2e",
        gradient: "linear-gradient(180deg, #ffffff 20%, #ddd6fe 65%, #c084fc 100%)",
        cardAccent: "rgba(139, 92, 246, 0.2)",
    },
    "cyber-cyan": {
        themeId: "cyber-cyan",
        name: "Midnight Obsidian & Cyan",
        badge: "MODERN TECH",
        description: "Ultra-modern, high-contrast dark mode with radiant cyan and sapphire tones.",
        primary: "#06b6d4",
        primaryHover: "#0891b2",
        secondary: "#38bdf8",
        glow: "rgba(6, 182, 212, 0.35)",
        heroGlow: "rgba(6, 182, 212, 0.16)",
        heroBgStart: "#020617",
        heroBgEnd: "#081024",
        gradient: "linear-gradient(180deg, #ffffff 20%, #a5f3fc 65%, #38bdf8 100%)",
        cardAccent: "rgba(6, 182, 212, 0.2)",
    },
    "desert-harvest": {
        themeId: "desert-harvest",
        name: "Desert Harvest & Gold",
        badge: "BIBLICAL LANDS",
        description: "Warm Near-Eastern biblical tones, ancient parchment, terracotta, and amber harvest gold.",
        primary: "#f59e0b",
        primaryHover: "#d97706",
        secondary: "#fbbf24",
        glow: "rgba(245, 158, 11, 0.35)",
        heroGlow: "rgba(245, 158, 11, 0.16)",
        heroBgStart: "#0f0904",
        heroBgEnd: "#1e1308",
        gradient: "linear-gradient(180deg, #ffffff 20%, #fde68a 65%, #f59e0b 100%)",
        cardAccent: "rgba(245, 158, 11, 0.2)",
    },
    "monochrome-titanium": {
        themeId: "monochrome-titanium",
        name: "Titanium Slate Minimalist",
        badge: "MINIMALIST",
        description: "Refined Apple Pro titanium finish with monochrome steel and crisp silver accents.",
        primary: "#f8fafc",
        primaryHover: "#e2e8f0",
        secondary: "#94a3b8",
        glow: "rgba(255, 255, 255, 0.25)",
        heroGlow: "rgba(255, 255, 255, 0.1)",
        heroBgStart: "#09090b",
        heroBgEnd: "#18181b",
        gradient: "linear-gradient(180deg, #ffffff 30%, #cbd5e1 65%, #94a3b8 100%)",
        cardAccent: "rgba(255, 255, 255, 0.15)",
    },
};

export const DEFAULT_COLOR_THEME: ColorThemeSettings = COLOR_THEME_PRESETS["seminary-maroon"];

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
    colorTheme: ColorThemeSettings;
}

export const DEFAULT_LANDING_CONTENT: LandingPageContent = {
    ribbonText: "Now Accepting Applications for Academic Year 2026-2027. Modular Pastoral Intensives & Global Online Seminary Studies.",
    ribbonCta: "Apply for Admission",
    schoolName: "Mobile Bible School",
    brandTagline: "Theological Seminary & Ministerial Institute",
    heroBadge: "CHRIST-CENTERED THEOLOGICAL EDUCATION • ACCREDITED SEMINARY",
    heroTitleWhite: "Equipping Servants of the Word",
    heroTitleGradient: "for God's Global Kingdom",
    heroSubtitle: "Rooted in biblical inerrancy, sound theological scholarship, expository preaching, and pastoral ministry. Nurturing gospel-driven ministers equipped to preach the Truth and shepherd the flock with integrity.",
    ctaPrimary: "Apply for Admission",
    ctaSecondary: "Access MBS Portals",
    guarantee1: "40+ Years of Ministry",
    guarantee2: "100% Ministry Placement",
    guarantee3: "35+ Church Plants & Hubs",
    carouselEyebrow: "CURRICULUM & DEGREES",
    carouselHeadline: "Academic & Ministerial Programs",
    carouselSubheadline: "Comprehensive biblical instruction combining exegetical precision, systematic theology, and practical pastoral ministry training.",
    modules: [
        {
            id: "module-1",
            eyebrow: "DIPLOMA LEVEL",
            title: "Diploma in Pastoral Studies (DPS)",
            highlight: "Expository Preaching & Church Ministry",
            description: "Essential training in Expository Preaching, Systematic Theology I & II, and Christian Education for Church Workers.",
            hostLocation: "Main Seminary Campus & Regional Hubs",
            date: "Semester Term • Fall & Spring",
            units: "2 Years • 60 Credits",
            badge: "PASTORAL DIPLOMA",
            tagline: "Sound biblical doctrine that fuels passionate discipleship.",
            primaryCta: "Apply for DPS",
        },
        {
            id: "module-2",
            eyebrow: "FLAGSHIP DEGREE",
            title: "Bachelor of Theology (B.Th.)",
            highlight: "Original Biblical Languages & Exegesis",
            description: "In-depth study in Biblical Greek, Hebrew, Hermeneutics, Pastoral Theology, Ecclesiology, and Pauline Epistles.",
            hostLocation: "Main Campus & Online Extension",
            date: "Full Academic Degree Program",
            units: "4 Years • 128 Credits",
            badge: "FLAGSHIP DEGREE",
            tagline: "Equipping pastors with unyielding exegetical precision.",
            primaryCta: "Apply for B.Th.",
        },
        {
            id: "module-3",
            eyebrow: "GRADUATE LEVEL",
            title: "Master of Ministry & Theology (M.Min / M.Th.)",
            highlight: "Advanced Leadership & Apologetics",
            description: "Advanced leadership in Apologetics, Church Management, Worship Leadership, and Reformation Theology.",
            hostLocation: "Graduate Hall & Modular Seminars",
            date: "Modular Graduate Cohorts",
            units: "2 Years • Graduate Seminar",
            badge: "GRADUATE SEMINARY",
            tagline: "Forming scholarly shepherds and seminary educators.",
            primaryCta: "Apply for M.Min",
        },
    ],
    promoVideo: {
        mode: "embed",
        videoUrl: "/videos/promo.mp4",
        posterUrl: "/images/announcements/sunday-worship.jpg",
        badgeText: "AUTO-PLAY ON SCROLL • MBS OFFICIAL",
        videoTitle: "Mobile Bible School: Life, Doctrine & Ministry",
        videoTagline: "Watch how our accredited theological curriculum equips pastors and servants of the Word worldwide.",
        durationLabel: "03:45",
        ctaText: "Apply for Admission",
        showCaptions: false,
        autoPlay: true,
        loop: true,
        muted: true,
        scenes: [],
    },
    colorTheme: DEFAULT_COLOR_THEME,
};

const STORAGE_KEY = "sms_landing_content";
export const LANDING_CONTENT_EVENT = "sms_landing_content_updated";

export const getLandingPageContent = (): LandingPageContent => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            const promo = parsed.promoVideo || {};
            if (!promo.videoUrl || promo.videoUrl.includes("commondatastorage.googleapis.com")) {
                promo.videoUrl = "/videos/promo.mp4";
            }
            if (!promo.posterUrl) {
                promo.posterUrl = "/images/announcements/sunday-worship.jpg";
            }
            const mergedScenes: PromoScene[] = Array.isArray(promo.scenes) ? promo.scenes : [];

            const parsedTheme = parsed.colorTheme || {};
            const resolvedTheme: ColorThemeSettings = {
                ...DEFAULT_COLOR_THEME,
                ...parsedTheme,
            };

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
                colorTheme: resolvedTheme,
            };
        }
    } catch (e) {
        console.warn("Failed to read landing page content from localStorage:", e);
    }
    return DEFAULT_LANDING_CONTENT;
};

export const applyGlobalTheme = (theme?: ColorThemeSettings): void => {
    try {
        const activeTheme = theme || getLandingPageContent().colorTheme || DEFAULT_COLOR_THEME;
        if (!activeTheme || typeof document === "undefined") return;

        const root = document.documentElement;

                // Primary Brand (Admin Portal, Buttons, Highlights, Active Navigation)
        root.style.setProperty("--mbs-maroon", activeTheme.primary);
        root.style.setProperty("--mbs-maroon-dark", activeTheme.primaryHover);
        root.style.setProperty("--mbs-gold", activeTheme.secondary);
        root.style.setProperty("--mbs-gold-dark", activeTheme.secondary);
        root.style.setProperty("--mbs-maroon-deep", activeTheme.heroBgEnd || "#3c0812");

        root.style.setProperty("--epic-primary", activeTheme.primary);
        root.style.setProperty("--epic-primary-dark", activeTheme.primaryHover);
        root.style.setProperty("--epic-primary-light", `${activeTheme.primary}1f`);
        root.style.setProperty("--epic-primary-soft", `${activeTheme.primary}18`);
        root.style.setProperty("--epic-accent", activeTheme.primary);
        root.style.setProperty("--epic-accent-soft", `${activeTheme.primary}18`);
        root.style.setProperty("--border-focus", activeTheme.primary);

        // App Shell & Admin Sidebar Colors
        root.style.setProperty("--epic-navy", activeTheme.primary);
        root.style.setProperty("--epic-navy-2", activeTheme.primaryHover);
        root.style.setProperty("--epic-blue", activeTheme.primary);
        root.style.setProperty("--epic-blue-dark", activeTheme.primaryHover);
        root.style.setProperty("--epic-indigo", activeTheme.primary);
        root.style.setProperty("--epic-blue-glow", activeTheme.glow);
        root.style.setProperty("--epic-primary-glow", activeTheme.glow);

        // Secondary / Cyan / Gold Accents
        root.style.setProperty("--epic-cyan", activeTheme.secondary);
        root.style.setProperty("--epic-cyan-soft", `${activeTheme.secondary}22`);
        root.style.setProperty("--epic-secondary", activeTheme.secondary);
        root.style.setProperty("--theme-secondary-soft", `${activeTheme.secondary}22`);

        // Landing Page / Keynote Apple theme variables
        root.style.setProperty("--apple-blue", activeTheme.primary);
        root.style.setProperty("--apple-blue-hover", activeTheme.primaryHover);
        root.style.setProperty("--apple-blue-light", activeTheme.secondary);
        root.style.setProperty("--apple-blue-glow", activeTheme.glow);
        root.style.setProperty("--theme-primary", activeTheme.primary);
        root.style.setProperty("--theme-primary-hover", activeTheme.primaryHover);
        root.style.setProperty("--theme-secondary", activeTheme.secondary);
        root.style.setProperty("--theme-glow", activeTheme.glow);
        root.style.setProperty("--theme-hero-glow", activeTheme.heroGlow);
        root.style.setProperty("--theme-bg-start", activeTheme.heroBgStart);
        root.style.setProperty("--theme-bg-end", activeTheme.heroBgEnd);
        root.style.setProperty("--theme-gradient", activeTheme.gradient);
        root.style.setProperty("--theme-card-accent", activeTheme.cardAccent);

        root.setAttribute("data-theme-id", activeTheme.themeId);
    } catch (e) {
        console.warn("Failed to apply global theme:", e);
    }
};

export const saveLandingPageContent = (content: LandingPageContent): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
        if (content.colorTheme) {
            applyGlobalTheme(content.colorTheme);
        }
        window.dispatchEvent(new CustomEvent(LANDING_CONTENT_EVENT, { detail: content }));
    } catch (e) {
        console.error("Failed to save landing page content:", e);
    }
};

export const resetLandingPageContent = (): LandingPageContent => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        applyGlobalTheme(DEFAULT_COLOR_THEME);
        window.dispatchEvent(new CustomEvent(LANDING_CONTENT_EVENT, { detail: DEFAULT_LANDING_CONTENT }));
    } catch (e) {
        console.error("Failed to reset landing page content:", e);
    }
    return DEFAULT_LANDING_CONTENT;
};
