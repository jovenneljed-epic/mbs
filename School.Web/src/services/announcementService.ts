import { API_BASE_URL } from "../config";

export interface Announcement {
    id: number;
    title: string;
    content: string;
    category: string;
    imageUrl: string | null;
    isPublished: boolean;
    publishDate: string;
    createdDate: string;
}

/**
 * Fetch all published announcements for public and authorized users.
 */
export async function getAnnouncements(): Promise<Announcement[]> {
    const token = typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("accessToken")) : null;
    const headers: Record<string, string> = {
        "Accept": "application/json"
    };

    if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/announcements`, {
        headers
    });

    if (!response.ok) {
        throw new Error("Failed to load announcements");
    }

    return await response.json();
}

/**
 * Fetch single announcement by ID.
 */
export async function getAnnouncementById(id: number): Promise<Announcement> {
    const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
        headers: { Accept: "application/json" }
    });

    if (!response.ok) {
        throw new Error(`Failed to load announcement with id ${id}`);
    }

    return await response.json();
}

/**
 * Admin: Create announcement
 */
export async function createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
    const token = typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("accessToken")) : null;
    const response = await fetch(`${API_BASE_URL}/announcements`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...(token && token !== "null" && token !== "undefined" ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error("Failed to create announcement");
    }

    return await response.json();
}

/**
 * Admin: Update announcement
 */
export async function updateAnnouncement(id: number, data: Partial<Announcement>): Promise<void> {
    const token = typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("accessToken")) : null;
    const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token && token !== "null" && token !== "undefined" ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`Failed to update announcement with id ${id}`);
    }
}

/**
 * Admin: Delete announcement
 */
export async function deleteAnnouncement(id: number): Promise<void> {
    const token = typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("accessToken")) : null;
    const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
        method: "DELETE",
        headers: {
            ...(token && token !== "null" && token !== "undefined" ? { Authorization: `Bearer ${token}` } : {})
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to delete announcement with id ${id}`);
    }
}
