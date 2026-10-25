// ============================================================
// galleryService.ts -> Mobile Bible School & Theological Seminary
// Official Institutional Campus Photo Gallery & Media Pipeline
// Handles real-time API syncing, file upload, local caching, and admin logic
// ============================================================

import { API_BASE_URL } from "../config";
import PermissionService from "../PermissionService";

export interface GalleryPhoto {
    id: number;
    title: string;
    category: "ACADEMIC" | "ORDINATION" | "CHAPEL" | "MINISTRIES" | "FACILITIES" | string;
    description: string;
    imageUrl: string;
    location: string;
    date: string;
    tags?: string;
    isFeatured?: boolean;
    likesCount?: number;
    createdAt?: string;
}

const STORAGE_KEY = "mbs_campus_gallery_photos_v2";
const LEGACY_STORAGE_KEY = "mbs_campus_gallery_photos";
export const GALLERY_UPDATED_EVENT = "mbs-gallery-updated";

// Map known dead/404 CDN links to verified high-availability photos
const BROKEN_URL_MAP: Record<string, string> = {
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80":
        "https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1532012164546-f432f2e3dd42?auto=format&fit=crop&w=1200&q=80":
        "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80"
};

export const GALLERY_CATEGORIES = [
    { id: "ALL", label: "All Chronicles", description: "Comprehensive archive of seminary life, worship, and scholarship." },
    { id: "ACADEMIC", label: "Academic & Lectures", description: "Rigorous biblical scholarship, Greek/Hebrew exegesis, and theology seminars." },
    { id: "ORDINATION", label: "Ordination & Convocation", description: "Baccalaureate convocations, sacred commissioning, and degree conferring." },
    { id: "CHAPEL", label: "Chapel & Worship", description: "Campus prayer assemblies, faculty-led worship, and intercessory vigils." },
    { id: "MINISTRIES", label: "Field Missions & Outreach", description: "Church-planting practicum, pastoral care, and regional gospel missions." },
    { id: "FACILITIES", label: "Campus & Research Library", description: "Headquarters complex, patristic library archives, and study halls." }
] as const;

// High-Resolution Curated Institutional Photos
export const DEFAULT_GALLERY_PHOTOS: GalleryPhoto[] = [
    {
        id: 1,
        title: "39th Annual Baccalaureate & Pastoral Ordination Convocation",
        category: "ORDINATION",
        description: "Conferring of the Bachelor of Theology (B.Th.) and Master of Divinity (M.Div.) degrees upon 64 ministerial candidates by the Seminary Faculty Council.",
        imageUrl: "https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=1200&q=80",
        location: "Main Campus Auditorium, Manila",
        date: "October 2026",
        tags: "Graduation, B.Th., Ordination, Faculty Council",
        isFeatured: true,
        likesCount: 142
    },
    {
        id: 2,
        title: "Biblical Greek & Exegetical Hermeneutics Intensive",
        category: "ACADEMIC",
        description: "Undergraduate and pastoral students analyzing original Koine Greek manuscripts of the Pauline epistles during the Fall Exegetical Seminar.",
        imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
        location: "Theology Hall Room 302",
        date: "September 2026",
        tags: "Greek Exegesis, Hermeneutics, Biblical Languages",
        isFeatured: true,
        likesCount: 98
    },
    {
        id: 3,
        title: "Seminary Campus Chapel Worship & Intercessory Assembly",
        category: "CHAPEL",
        description: "Weekly Wednesday morning student and faculty chapel gathering for liturgical prayer, Scripture reading, and worship before lectures.",
        imageUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
        location: "Grace Memorial Chapel, Main Campus",
        date: "October 2026",
        tags: "Chapel, Worship, Prayer, Seminary Fellowship",
        isFeatured: true,
        likesCount: 115
    },
    {
        id: 4,
        title: "Systematic Theology Lecture Series with Academic Dean",
        category: "ACADEMIC",
        description: "Dr. Benjamin Santos lecturing on the Doctrine of Scripture and Reformed Soteriology to second-year pastoral leadership candidates.",
        imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
        location: "Academic Amphitheater",
        date: "October 2026",
        tags: "Systematic Theology, Dean Lecture, Doctrine",
        isFeatured: false,
        likesCount: 87
    },
    {
        id: 5,
        title: "Student Field Ministry & Rural Church-Planting Outreach",
        category: "MINISTRIES",
        description: "MBS student pastoral teams facilitating weekend expository Bible studies and community youth programs across regional church plants.",
        imageUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80",
        location: "Northern Luzon Ministry Center",
        date: "September 2026",
        tags: "Field Ministry, Missions, Church Planting, Outreach",
        isFeatured: true,
        likesCount: 134
    },
    {
        id: 6,
        title: "Theological Research Library & Patristic Archives",
        category: "FACILITIES",
        description: "Students conducting theological thesis research in our quiet archives containing over 35,000 commentary volumes and historical church records.",
        imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
        location: "Charles Spurgeon Memorial Library",
        date: "August 2026",
        tags: "Library, Research, Archives, Exegesis",
        isFeatured: false,
        likesCount: 76
    },
    {
        id: 7,
        title: "Conferring of Ministerial Hoods & Sacred Commissioning",
        category: "ORDINATION",
        description: "Senior theological faculty laying hands and presenting sacred hoods upon newly ordained pastors entering full-time missionary service.",
        imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
        location: "Main Campus Sanctuary",
        date: "October 2026",
        tags: "Ordination, Commissioning, Ministry Vows",
        isFeatured: false,
        likesCount: 92
    },
    {
        id: 8,
        title: "Modular Pastoral Training Cohort for Working Pastors",
        category: "ACADEMIC",
        description: "Executive weekend modular class where bivocational pastors gather for accelerated credit courses in church governance and homiletics.",
        imageUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80",
        location: "Executive Seminar Suite B",
        date: "September 2026",
        tags: "Modular Training, Pastoral Ministry, Homiletics",
        isFeatured: false,
        likesCount: 68
    },
    {
        id: 9,
        title: "Evening Campus Praise & Scripture Proclamation",
        category: "CHAPEL",
        description: "Evening student praise vigil featuring student testimonies and continuous Psalms proclamation before semester midterm examinations.",
        imageUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80",
        location: "Grace Memorial Chapel",
        date: "October 2026",
        tags: "Evening Chapel, Praise, Prayer Vigil",
        isFeatured: false,
        likesCount: 104
    },
    {
        id: 10,
        title: "Medical-Dental Mission & Compassion Ministry Practicum",
        category: "MINISTRIES",
        description: "MBS pastoral candidates partnering with Christian medical professionals to minister physical healing and the Gospel of Christ.",
        imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
        location: "Southern Tagalog Community Outreach",
        date: "August 2026",
        tags: "Compassion Ministry, Medical Outreach, Evangelism",
        isFeatured: false,
        likesCount: 119
    },
    {
        id: 11,
        title: "Main Campus Administrative Complex & Faculty Quad",
        category: "FACILITIES",
        description: "Exterior view of the historic neoclassical facade of Mobile Bible School & Theological Seminary headquarters and registrar offices.",
        imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
        location: "Main Campus Headquarters, Manila",
        date: "July 2026",
        tags: "Campus, Architecture, Facilities, Headquarters",
        isFeatured: true,
        likesCount: 88
    },
    {
        id: 12,
        title: "Hermeneutics Practicum: Scripture Translation & Textual Criticism",
        category: "ACADEMIC",
        description: "Advanced students engaged in textual criticism of Hebrew Masoretic texts and Septuagint variants under faculty supervision.",
        imageUrl: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80",
        location: "Manuscript Study Room",
        date: "October 2026",
        tags: "Hebrew, Textual Criticism, Hermeneutics, Exegesis",
        isFeatured: false,
        likesCount: 95
    }
];

// Helper: Check if active user has Admin privileges
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
    } catch (e) {
        console.warn("Admin check warning:", e);
    }

    return false;
}

// Helper: Auto-repair photo URLs that are known to return 404 or dead links
export function sanitizeGalleryPhotos(photos: GalleryPhoto[]): GalleryPhoto[] {
    if (!Array.isArray(photos)) return DEFAULT_GALLERY_PHOTOS;
    return photos.map((p) => {
        let currentUrl = p.imageUrl || "";
        if (BROKEN_URL_MAP[currentUrl]) {
            currentUrl = BROKEN_URL_MAP[currentUrl];
        }
        return {
            ...p,
            imageUrl: currentUrl
        };
    });
}

// Fetch all gallery photos (API with localStorage fallback)
export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
    // 0. Clean legacy storage if present
    if (typeof window !== "undefined") {
        try {
            if (localStorage.getItem(LEGACY_STORAGE_KEY)) {
                localStorage.removeItem(LEGACY_STORAGE_KEY);
            }
        } catch {
            // Ignore
        }
    }

    // 1. Try fetching from live backend
    try {
        const response = await fetch(`${API_BASE_URL}/Gallery`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
            const data: GalleryPhoto[] = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                const sanitized = sanitizeGalleryPhotos(data);
                // Cache locally
                localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
                return sanitized;
            }
        }
    } catch (err) {
        console.warn("Backend /Gallery fetch error, falling back to local cache:", err);
    }

    // 2. Fallback to localStorage
    try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const sanitized = sanitizeGalleryPhotos(parsed);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
                return sanitized;
            }
        }
    } catch (e) {
        console.warn("Cache parse error:", e);
    }

    // 3. Ultimate Fallback to Default Seed Photos
    const cleanDefaults = sanitizeGalleryPhotos(DEFAULT_GALLERY_PHOTOS);
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanDefaults));
    } catch {
        // Ignore
    }
    return cleanDefaults;
}

// Add a new photo (Admin only)
export async function addGalleryPhoto(newPhoto: Omit<GalleryPhoto, "id">): Promise<GalleryPhoto> {
    const list = await getGalleryPhotos();
    const nextId = list.length > 0 ? Math.max(...list.map(p => p.id)) + 1 : 1;

    const fullPhoto: GalleryPhoto = {
        id: nextId,
        ...newPhoto,
        likesCount: newPhoto.likesCount ?? 0,
        createdAt: new Date().toISOString()
    };

    // Try posting to API
    try {
        const response = await fetch(`${API_BASE_URL}/Gallery`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(localStorage.getItem("token") ? { "Authorization": `Bearer ${localStorage.getItem("token")}` } : {})
            },
            body: JSON.stringify(fullPhoto)
        });

        if (response.ok) {
            const saved = await response.json();
            if (saved && saved.id) {
                fullPhoto.id = saved.id;
            }
        }
    } catch (err) {
        console.warn("API add photo error, saving locally:", err);
    }

    // Save locally
    const updated = [fullPhoto, ...list.filter(p => p.id !== fullPhoto.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(GALLERY_UPDATED_EVENT, { detail: updated }));
    }

    return fullPhoto;
}

// Upload photo file (Multipart form upload or Base64 dataURL fallback)
export async function uploadPhotoFile(file: File): Promise<string> {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE_URL}/Gallery/upload`, {
            method: "POST",
            body: formData,
            headers: {
                ...(localStorage.getItem("token") ? { "Authorization": `Bearer ${localStorage.getItem("token")}` } : {})
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (result && result.url) {
                return result.url.startsWith("http") ? result.url : `${API_BASE_URL.replace(/\/api$/, "")}${result.url}`;
            }
        }
    } catch (err) {
        console.warn("File upload to API failed, falling back to client Base64 DataURL:", err);
    }

    // High quality client-side Data URL fallback
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Delete photo (Admin only)
export async function deleteGalleryPhoto(id: number): Promise<boolean> {
    try {
        await fetch(`${API_BASE_URL}/Gallery/${id}`, {
            method: "DELETE",
            headers: {
                ...(localStorage.getItem("token") ? { "Authorization": `Bearer ${localStorage.getItem("token")}` } : {})
            }
        });
    } catch (err) {
        console.warn("API delete photo error:", err);
    }

    const list = await getGalleryPhotos();
    const updated = list.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(GALLERY_UPDATED_EVENT, { detail: updated }));
    }

    return true;
}

// Like photo (Available to all users & visitors)
export async function likeGalleryPhoto(id: number): Promise<number> {
    const list = await getGalleryPhotos();
    const photo = list.find(p => p.id === id);
    const newCount = (photo?.likesCount || 0) + 1;

    try {
        await fetch(`${API_BASE_URL}/Gallery/${id}/like`, { method: "POST" });
    } catch {
        // Ignore network error for likes
    }

    if (photo) {
        photo.likesCount = newCount;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent(GALLERY_UPDATED_EVENT, { detail: list }));
        }
    }

    return newCount;
}

// Reset gallery to default seed
export async function resetGalleryPhotos(): Promise<GalleryPhoto[]> {
    try {
        await fetch(`${API_BASE_URL}/Gallery/reset`, { method: "POST" });
    } catch {
        // Ignore
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GALLERY_PHOTOS));
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(GALLERY_UPDATED_EVENT, { detail: DEFAULT_GALLERY_PHOTOS }));
    }
    return DEFAULT_GALLERY_PHOTOS;
}
