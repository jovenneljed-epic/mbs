// ============================================================
// mbsSupportService.ts
// Central Service for Managing MBS Support Documents, Videos & Toolkits
// Synchronizes Admin Uploads with Public Landing Page & Student Portal
// ============================================================

import { DEFAULT_MBS_RESOURCES, type MbsResourceItem } from "../components/MbsSupportsMegaMenu";

const STORAGE_KEY = "mbs_support_resources_v1";
export const MBS_SUPPORTS_UPDATED_EVENT = "mbs:supports-updated";

/**
 * Get all support resources (from localStorage or defaults)
 */
export function getMbsSupportResources(): MbsResourceItem[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn("[mbsSupportService] Failed to read from localStorage", e);
    }
    return DEFAULT_MBS_RESOURCES;
}

/**
 * Save full list of resources and dispatch event
 */
export function saveAllMbsSupportResources(resources: MbsResourceItem[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
        window.dispatchEvent(new CustomEvent(MBS_SUPPORTS_UPDATED_EVENT, { detail: resources }));
    } catch (e) {
        console.error("[mbsSupportService] Failed to save to localStorage", e);
    }
}

/**
 * Add a new resource (document, PDF, video, toolkit)
 */
export function addMbsSupportResource(resource: Omit<MbsResourceItem, "id"> & { id?: string }): MbsResourceItem {
    const current = getMbsSupportResources();
    const newId = resource.id || `mbs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fullItem: MbsResourceItem = {
        ...resource,
        id: newId,
    };
    const updated = [fullItem, ...current];
    saveAllMbsSupportResources(updated);
    return fullItem;
}

/**
 * Update an existing resource
 */
export function updateMbsSupportResource(id: string, updates: Partial<MbsResourceItem>): boolean {
    const current = getMbsSupportResources();
    const index = current.findIndex(r => r.id === id);
    if (index === -1) return false;

    current[index] = { ...current[index], ...updates };
    saveAllMbsSupportResources(current);
    return true;
}

/**
 * Delete a resource
 */
export function deleteMbsSupportResource(id: string): boolean {
    const current = getMbsSupportResources();
    const filtered = current.filter(r => r.id !== id);
    if (filtered.length === current.length) return false;

    saveAllMbsSupportResources(filtered);
    return true;
}

/**
 * Reset back to factory default resources
 */
export function resetMbsSupportResources(): MbsResourceItem[] {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(MBS_SUPPORTS_UPDATED_EVENT, { detail: DEFAULT_MBS_RESOURCES }));
    return DEFAULT_MBS_RESOURCES;
}
