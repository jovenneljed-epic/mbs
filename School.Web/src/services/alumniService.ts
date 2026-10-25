// ============================================================
// alumniService.ts
// Live Content Management Service for Ordained Alumni & Ministry Achievers
// Supports Administrator Editing & Viewing-Only Mode for Others
// ============================================================

import { API_BASE_URL } from "../config";
import PermissionService from "../PermissionService";

export interface AlumniAchiever {
    id: string;
    category: string;
    rate: string;
    title: string;
    role: string;
    honors: string;
    achievement: string;
    initials: string;
}

export interface AlumniSectionConfig {
    tag: string;
    title: string;
    lead: string;
    items: AlumniAchiever[];
}

export const DEFAULT_ALUMNI_SECTION: AlumniSectionConfig = {
    tag: "FAITHFUL ALUMNI & GOSPEL IMPACT",
    title: "Ordained Alumni & Ministry Achievers",
    lead: "Celebrating our graduates who are faithfully planting churches, shepherding congregations, and leading cross-cultural ministries worldwide.",
    items: [
        {
            id: "1",
            category: "BACHELOR OF THEOLOGY (B.TH.)",
            rate: "100% ORDAINED",
            title: "Rev. David S. Morales, B.Th.",
            role: "Senior Pastor & Church Planter",
            honors: "Batch 2021 Summa Cum Laude",
            achievement: "Successfully planted 3 daughter churches and equipped 45 lay preachers across Southern Tagalog.",
            initials: "DM"
        },
        {
            id: "2",
            category: "MASTER OF MINISTRY (M.MIN.)",
            rate: "DISTINGUISHED ALUMNA",
            title: "Dr. Rebecca L. Santos, M.Min.",
            role: "Director of Biblical Counseling & Family Ministry",
            honors: "Batch 2019 Valedictorian",
            achievement: "Author of pastoral counseling manuals used across 80+ partner churches in Metro Manila.",
            initials: "RS"
        },
        {
            id: "3",
            category: "MASTER OF THEOLOGY (M.TH.)",
            rate: "EXPOSITOR & SCHOLAR",
            title: "Pastor Jonathan M. Cruz, M.Th.",
            role: "Dean of Biblical Languages & Exegesis",
            honors: "Batch 2016 High Distinction",
            achievement: "Lecturer in New Testament Greek, mentoring 120+ pastors in expository verse-by-verse pulpit ministry.",
            initials: "JC"
        },
        {
            id: "4",
            category: "DIPLOMA IN PASTORAL STUDIES (DPS)",
            rate: "CHURCH REVITALIZER",
            title: "Pastor Timothy A. Bautista, DPS",
            role: "Lead Pastor & Youth Evangelist",
            honors: "Batch 2022 Magna Cum Laude",
            achievement: "Revitalized a struggling municipal congregation, growing active Sunday attendance from 30 to over 280 members.",
            initials: "TB"
        },
        {
            id: "5",
            category: "CROSS-CULTURAL MISSIONS",
            rate: "FRONTIER MISSIONARY",
            title: "Missionary Sarah G. Ramos, B.Th.",
            role: "Indigenous Church Planter",
            honors: "Batch 2020 Leadership Award",
            achievement: "Established 4 tribal Bible study fellowship hubs with translated hymnody and children's catechisms.",
            initials: "SR"
        },
        {
            id: "6",
            category: "DOCTOR OF THEOLOGY (D.TH.)",
            rate: "THEOLOGICAL PROFESSOR",
            title: "Dr. Benjamin K. Lee, D.Th.",
            role: "Professor of Systematic Theology",
            honors: "Batch 2014 Doctoral Fellow",
            achievement: "Published 3 peer-reviewed theological treatises on Reformation Ecclesiology and Expository Preaching.",
            initials: "BL"
        },
        {
            id: "7",
            category: "CERTIFICATE IN BIBLICAL STUDIES (CBS)",
            rate: "LAY MINISTRY LEADER",
            title: "Sister Mary Grace Torres, CBS",
            role: "Director of Children's Ministry & VBS",
            honors: "Batch 2023 Exemplary Service",
            achievement: "Trained 200+ Sunday school teachers and coordinated Vacation Bible Schools reaching 1,500 children.",
            initials: "MT"
        },
        {
            id: "8",
            category: "BACHELOR OF THEOLOGY (B.TH.)",
            rate: "CAMPUS CHAPLAIN",
            title: "Pastor Emmanuel R. Reyes, B.Th.",
            role: "Collegiate Chaplain & Discipleship Mentor",
            honors: "Batch 2018 Academic Excellence",
            achievement: "Founded collegiate Christian fellowships across 5 university campuses in central Luzon.",
            initials: "ER"
        },
        {
            id: "9",
            category: "MASTER OF MINISTRY (M.MIN.)",
            rate: "WORSHIP DIRECTOR",
            title: "Pastor Nathaniel O. Castro, M.Min.",
            role: "Dean of Church Music & Hymnology",
            honors: "Batch 2017 Ministry Distinction",
            achievement: "Mentored over 60 church choirs and praise ensembles in Christ-centered, scripture-rich liturgical worship.",
            initials: "NC"
        }
    ]
};

const STORAGE_KEY = "mbs_alumni_data_v1";
export const ALUMNI_UPDATED_EVENT = "mbs_alumni_data_updated";

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
        console.warn("Admin check warning in alumniService:", e);
    }

    return false;
}

// ------------------------------------------------------------
// DATA FETCHER
// ------------------------------------------------------------
export async function getAlumniData(): Promise<AlumniSectionConfig> {
    let localData: AlumniSectionConfig | null = null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            localData = JSON.parse(raw);
        }
    } catch {
        // ignore
    }

    try {
        const res = await fetch(`${API_BASE_URL}/Alumni`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (res.ok) {
            const data = await res.json();
            if (data && !data.isDefault && Array.isArray(data.items) && data.items.length > 0) {
                const merged: AlumniSectionConfig = {
                    tag: data.tag || DEFAULT_ALUMNI_SECTION.tag,
                    title: data.title || DEFAULT_ALUMNI_SECTION.title,
                    lead: data.lead || DEFAULT_ALUMNI_SECTION.lead,
                    items: data.items
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
        console.warn("[Alumni] Failed to fetch live alumni data, using cached or fallback:", err);
    }

    return localData || DEFAULT_ALUMNI_SECTION;
}

// ------------------------------------------------------------
// SAVE DATA
// ------------------------------------------------------------
export async function saveAlumniData(config: AlumniSectionConfig): Promise<boolean> {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        window.dispatchEvent(new CustomEvent(ALUMNI_UPDATED_EVENT, { detail: config }));
    } catch (e) {
        console.warn("[Alumni] LocalStorage save warning:", e);
    }

    try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(`${API_BASE_URL}/Alumni`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify(config)
        });

        return res.ok;
    } catch (err) {
        console.error("[Alumni] API save failed:", err);
        return false;
    }
}

// ------------------------------------------------------------
// RESET DATA
// ------------------------------------------------------------
export async function resetAlumniData(): Promise<AlumniSectionConfig> {
    try {
        localStorage.removeItem(STORAGE_KEY);
        const token = localStorage.getItem("token") || "";
        await fetch(`${API_BASE_URL}/Alumni/reset`, {
            method: "POST",
            headers: {
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            }
        });
    } catch (err) {
        console.warn("[Alumni] Reset API error:", err);
    }

    window.dispatchEvent(new CustomEvent(ALUMNI_UPDATED_EVENT, { detail: DEFAULT_ALUMNI_SECTION }));
    return DEFAULT_ALUMNI_SECTION;
}
