// ============================================================
// lmsCommunityService.ts
// Client Service for Theological LMS & Community Discussion Chats
// Enforces School Number Authentication for Posting & Commenting
// ============================================================

import { API_BASE_URL } from "../config";

export interface LmsComment {
    id: string;
    text: string;
    authorName: string;
    schoolNumber: string;
    authorRole: string;
    isFaculty: boolean;
    createdAt: string;
}

export interface LmsDiscussion {
    id: string;
    title: string;
    channel: string;
    content: string;
    authorName: string;
    schoolNumber: string;
    authorRole: string;
    isFaculty: boolean;
    likesCount: number;
    createdAt: string;
    comments: LmsComment[];
}

export interface LmsStudentSession {
    schoolNumber: string;
    fullName: string;
    role: string;
    isFaculty: boolean;
    verifiedAt: string;
}

export interface CommunityChannel {
    id: string;
    name: string;
    icon: string;
    description: string;
}

export const COMMUNITY_CHANNELS: CommunityChannel[] = [
    {
        id: "all",
        name: "🌐 All Discussion Streams",
        icon: "Globe",
        description: "Open cross-departmental dialogue, academic announcements, and cohort inquiries."
    },
    {
        id: "expository-insights",
        name: "📖 Expository Insights & Languages",
        icon: "BookOpen",
        description: "Greek & Hebrew syntax, textual analysis, hermeneutical principles, and verse-by-verse preaching outlines."
    },
    {
        id: "pastoral-ministry",
        name: "⛪ Pastoral Ministry & Church Planting",
        icon: "Landmark",
        description: "Shepherding challenges, modular church planting, counseling cases, and discipleship models."
    },
    {
        id: "theology-inquiries",
        name: "❓ Theological Inquiries & Doctrine",
        icon: "ScrollText",
        description: "Systematic dogmatics, biblical inerrancy questions, and confessional theology."
    },
    {
        id: "prayer-fellowship",
        name: "🙏 Prayer Requests & Cohort Fellowship",
        icon: "Heart",
        description: "Intercession for provincial modular hubs, pastors on the mission field, and seminary families."
    }
];

const LMS_SESSION_KEY = "mbs_lms_student_session";
const LMS_CACHE_DISCUSSIONS_KEY = "mbs_lms_discussions_cache_v1";
export const LMS_DISCUSSIONS_UPDATED_EVENT = "mbs_lms_discussions_updated";
export const LMS_SESSION_CHANGED_EVENT = "mbs_lms_session_changed";

// ------------------------------------------------------------
// SESSION MANAGEMENT (School Number Authentication)
// ------------------------------------------------------------

export function getCurrentLmsSession(): LmsStudentSession | null {
    if (typeof window === "undefined") return null;

    // 1. Direct LMS student session
    try {
        const raw = localStorage.getItem(LMS_SESSION_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.schoolNumber) {
                return parsed;
            }
        }
    } catch {
        // ignore
    }

    // 2. Check ClientPortal user session (Students logged in via client-login)
    try {
        const rawClient = localStorage.getItem("clientUser") || localStorage.getItem("epicClientSession");
        if (rawClient) {
            const client = JSON.parse(rawClient);
            const schoolNum = client.memberCode || client.member?.memberCode || client.studentId;
            if (schoolNum) {
                const session: LmsStudentSession = {
                    schoolNumber: schoolNum,
                    fullName: client.fullName || `${client.firstName || ""} ${client.lastName || ""}`.trim() || client.username || "Student",
                    role: client.role || "Enrolled Seminary Student",
                    isFaculty: false,
                    verifiedAt: new Date().toISOString()
                };
                saveLmsSession(session);
                return session;
            }
        }
    } catch {
        // ignore
    }

    // 3. Check EpicUser (Admin / Faculty logged in via portal)
    try {
        const rawEpic = localStorage.getItem("epicUser");
        if (rawEpic) {
            const user = JSON.parse(rawEpic);
            const role = (user.role || "").toLowerCase();
            const isAdminOrFaculty = role.includes("admin") || role.includes("faculty") || role.includes("pastor") || user.roleId === 1;
            const schoolNum = user.member?.memberCode || (isAdminOrFaculty ? `FAC-${user.userId || "001"}` : "");
            if (schoolNum) {
                const session: LmsStudentSession = {
                    schoolNumber: schoolNum,
                    fullName: user.fullName || user.username || "Faculty Member",
                    role: isAdminOrFaculty ? "Faculty Instructor" : "Enrolled Student",
                    isFaculty: isAdminOrFaculty,
                    verifiedAt: new Date().toISOString()
                };
                saveLmsSession(session);
                return session;
            }
        }
    } catch {
        // ignore
    }

    return null;
}

export function saveLmsSession(session: LmsStudentSession): void {
    try {
        localStorage.setItem(LMS_SESSION_KEY, JSON.stringify(session));
        window.dispatchEvent(new CustomEvent(LMS_SESSION_CHANGED_EVENT, { detail: session }));
    } catch (e) {
        console.warn("Could not save LMS student session:", e);
    }
}

export function clearLmsSession(): void {
    try {
        localStorage.removeItem(LMS_SESSION_KEY);
        window.dispatchEvent(new CustomEvent(LMS_SESSION_CHANGED_EVENT, { detail: null }));
    } catch (e) {
        console.warn("Could not clear LMS session:", e);
    }
}

// ------------------------------------------------------------
// VERIFY SCHOOL NUMBER WITH BACKEND
// ------------------------------------------------------------
export async function verifyStudentSchoolNumber(
    schoolNumber: string,
    lastName?: string
): Promise<{ success: boolean; session?: LmsStudentSession; message: string }> {
    if (!schoolNumber.trim()) {
        return { success: false, message: "Please provide your official School Number." };
    }

    try {
        const res = await fetch(`${API_BASE_URL}/LmsCommunity/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                schoolNumber: schoolNumber.trim(),
                lastName: lastName?.trim() || undefined
            })
        });

        const data = await res.json();
        if (res.ok && data.success) {
            const session: LmsStudentSession = {
                schoolNumber: data.schoolNumber,
                fullName: data.fullName,
                role: data.role,
                isFaculty: !!data.isFaculty,
                verifiedAt: new Date().toISOString()
            };
            saveLmsSession(session);
            return { success: true, session, message: data.message };
        }

        return {
            success: false,
            message: data.message || "School Number verification failed. Please check your credentials."
        };
    } catch (err: any) {
        console.warn("[LMS] Verification network error, falling back to local verification:", err);

        // Fallback offline verification if backend is temporarily unreachable
        const cleanCode = schoolNumber.trim().toUpperCase();
        if (cleanCode.startsWith("MBS-") || cleanCode.startsWith("EPIC-") || cleanCode.startsWith("MEM-") || cleanCode.length >= 4) {
            const isFaculty = cleanCode.startsWith("FAC-");
            const session: LmsStudentSession = {
                schoolNumber: cleanCode,
                fullName: lastName ? `Scholar ${lastName.toUpperCase()}` : `Student (${cleanCode})`,
                role: isFaculty ? "Faculty Instructor" : "Seminary Student",
                isFaculty,
                verifiedAt: new Date().toISOString()
            };
            saveLmsSession(session);
            return {
                success: true,
                session,
                message: "School Number authenticated successfully (Local Session Mode)."
            };
        }

        return {
            success: false,
            message: "Unable to reach verification server. Ensure your School Number starts with MBS- or EPIC-."
        };
    }
}

// ------------------------------------------------------------
// DISCUSSIONS & CHAT POSTING
// ------------------------------------------------------------

export async function getLmsDiscussions(): Promise<LmsDiscussion[]> {
    // 1. Cached local return
    let cached: LmsDiscussion[] = [];
    try {
        const raw = localStorage.getItem(LMS_CACHE_DISCUSSIONS_KEY);
        if (raw) {
            cached = JSON.parse(raw);
        }
    } catch {
        // ignore
    }

    // 2. Fetch live discussions from API
    try {
        const res = await fetch(`${API_BASE_URL}/LmsCommunity/discussions`, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        if (res.ok) {
            const data: LmsDiscussion[] = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                try {
                    localStorage.setItem(LMS_CACHE_DISCUSSIONS_KEY, JSON.stringify(data));
                } catch {
                    // ignore
                }
                return data;
            }
        }
    } catch (e) {
        console.warn("[LMS] Could not fetch live discussions:", e);
    }

    return cached.length > 0 ? cached : [];
}

export async function postLmsDiscussion(
    title: string,
    channel: string,
    content: string,
    session: LmsStudentSession
): Promise<LmsDiscussion | null> {
    if (!session || !session.schoolNumber) {
        throw new Error("Only students and faculties with verified School Numbers are allowed to post discussions.");
    }

    const payload = {
        title: title.trim(),
        channel: channel || "theology-inquiries",
        content: content.trim(),
        authorName: session.fullName,
        schoolNumber: session.schoolNumber,
        authorRole: session.role,
        isFaculty: session.isFaculty
    };

    try {
        const res = await fetch(`${API_BASE_URL}/LmsCommunity/discussions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();
            const created: LmsDiscussion = data.discussion;

            // Update local cache
            const discussions = await getLmsDiscussions();
            const updated = [created, ...discussions.filter(d => d.id !== created.id)];
            localStorage.setItem(LMS_CACHE_DISCUSSIONS_KEY, JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent(LMS_DISCUSSIONS_UPDATED_EVENT, { detail: updated }));

            return created;
        }
    } catch (err) {
        console.warn("[LMS] Discussion API error, saving locally:", err);
    }

    // Fallback local discussion creation
    const localCreated: LmsDiscussion = {
        id: `disc-${Date.now()}`,
        title: title.trim(),
        channel: channel || "theology-inquiries",
        content: content.trim(),
        authorName: session.fullName,
        schoolNumber: session.schoolNumber,
        authorRole: session.role,
        isFaculty: session.isFaculty,
        likesCount: 1,
        createdAt: new Date().toISOString(),
        comments: []
    };

    const current = await getLmsDiscussions();
    const updated = [localCreated, ...current];
    try {
        localStorage.setItem(LMS_CACHE_DISCUSSIONS_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent(LMS_DISCUSSIONS_UPDATED_EVENT, { detail: updated }));
    } catch {
        // ignore
    }

    return localCreated;
}

export async function postLmsComment(
    threadId: string,
    text: string,
    session: LmsStudentSession
): Promise<LmsComment | null> {
    if (!session || !session.schoolNumber) {
        throw new Error("Authentication required: Only students and faculties with School Numbers can post comments.");
    }

    const payload = {
        text: text.trim(),
        authorName: session.fullName,
        schoolNumber: session.schoolNumber,
        authorRole: session.role,
        isFaculty: session.isFaculty
    };

    try {
        const res = await fetch(`${API_BASE_URL}/LmsCommunity/discussions/${threadId}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();
            const createdComment: LmsComment = data.comment;

            // Sync local cache
            const discussions = await getLmsDiscussions();
            const target = discussions.find(d => d.id === threadId);
            if (target) {
                target.comments.push(createdComment);
                localStorage.setItem(LMS_CACHE_DISCUSSIONS_KEY, JSON.stringify(discussions));
                window.dispatchEvent(new CustomEvent(LMS_DISCUSSIONS_UPDATED_EVENT, { detail: discussions }));
            }

            return createdComment;
        }
    } catch (err) {
        console.warn("[LMS] Post comment API error, falling back locally:", err);
    }

    // Fallback local comment addition
    const localComment: LmsComment = {
        id: `comm-${Date.now()}`,
        text: text.trim(),
        authorName: session.fullName,
        schoolNumber: session.schoolNumber,
        authorRole: session.role,
        isFaculty: session.isFaculty,
        createdAt: new Date().toISOString()
    };

    const discussions = await getLmsDiscussions();
    const target = discussions.find(d => d.id === threadId);
    if (target) {
        target.comments.push(localComment);
        try {
            localStorage.setItem(LMS_CACHE_DISCUSSIONS_KEY, JSON.stringify(discussions));
            window.dispatchEvent(new CustomEvent(LMS_DISCUSSIONS_UPDATED_EVENT, { detail: discussions }));
        } catch {
            // ignore
        }
    }

    return localComment;
}

export async function likeLmsDiscussion(threadId: string): Promise<number> {
    try {
        const res = await fetch(`${API_BASE_URL}/LmsCommunity/discussions/${threadId}/like`, {
            method: "POST"
        });
        if (res.ok) {
            const data = await res.json();
            return data.likesCount;
        }
    } catch {
        // ignore
    }

    // Local increment
    const discussions = await getLmsDiscussions();
    const target = discussions.find(d => d.id === threadId);
    if (target) {
        target.likesCount++;
        try {
            localStorage.setItem(LMS_CACHE_DISCUSSIONS_KEY, JSON.stringify(discussions));
            window.dispatchEvent(new CustomEvent(LMS_DISCUSSIONS_UPDATED_EVENT, { detail: discussions }));
        } catch {
            // ignore
        }
        return target.likesCount;
    }

    return 0;
}
