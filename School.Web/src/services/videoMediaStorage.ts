/**
 * Video Media Storage Service
 * Stores uploaded promotional videos and slide videos persistently in IndexedDB
 * and provides instant streaming Object URLs for <video> playback.
 */

const DB_NAME = "SMS_MediaStorage";
const DB_VERSION = 1;
const STORE_NAME = "videos";

export const VIDEO_MEDIA_EVENT = "sms_video_media_updated";

interface StoredVideoRecord {
    key: string;
    blob: Blob;
    name: string;
    size: number;
    type: string;
    updatedAt: number;
}

// In-memory cache of generated object URLs to prevent memory leaks and redundant DB lookups
const urlCache = new Map<string, string>();

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (!("indexedDB" in window)) {
            reject(new Error("IndexedDB is not supported in this browser"));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "key" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Saves a video File/Blob in IndexedDB and generates a streamable object URL
 */
export async function saveVideoMedia(
    key: string,
    file: File | Blob,
    fileName?: string
): Promise<{ url: string; name: string; size: number }> {
    const db = await openDatabase();
    const resolvedName = fileName || (file as File).name || `video-${key}.mp4`;
    const resolvedSize = file.size || 0;

    const record: StoredVideoRecord = {
        key,
        blob: file,
        name: resolvedName,
        size: resolvedSize,
        type: file.type || "video/mp4",
        updatedAt: Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(record);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });

    // Revoke previous URL if any to free memory
    if (urlCache.has(key)) {
        try {
            URL.revokeObjectURL(urlCache.get(key)!);
        } catch (e) {
            /* ignore */
        }
    }

    const objectUrl = URL.createObjectURL(file);
    urlCache.set(key, objectUrl);

    // Notify all components in real-time
    window.dispatchEvent(
        new CustomEvent(VIDEO_MEDIA_EVENT, {
            detail: {
                key,
                url: objectUrl,
                name: resolvedName,
                size: resolvedSize,
            },
        })
    );

    return {
        url: objectUrl,
        name: resolvedName,
        size: resolvedSize,
    };
}

/**
 * Retrieves a playable object URL for a stored video key
 */
export async function getVideoMediaUrl(key: string): Promise<string | null> {
    if (urlCache.has(key)) {
        return urlCache.get(key)!;
    }

    try {
        const db = await openDatabase();
        const record = await new Promise<StoredVideoRecord | null>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readonly");
            const store = tx.objectStore(STORE_NAME);
            const req = store.get(key);

            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });

        if (record && record.blob) {
            const url = URL.createObjectURL(record.blob);
            urlCache.set(key, url);
            return url;
        }
    } catch (err) {
        console.warn(`Failed to retrieve video for key "${key}":`, err);
    }

    return null;
}

/**
 * Deletes a video from storage
 */
export async function deleteVideoMedia(key: string): Promise<void> {
    if (urlCache.has(key)) {
        try {
            URL.revokeObjectURL(urlCache.get(key)!);
        } catch (e) {
            /* ignore */
        }
        urlCache.delete(key);
    }

    try {
        const db = await openDatabase();
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            const req = store.delete(key);

            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } catch (err) {
        console.warn(`Failed to delete video for key "${key}":`, err);
    }

    window.dispatchEvent(
        new CustomEvent(VIDEO_MEDIA_EVENT, {
            detail: {
                key,
                url: null,
                name: null,
                size: 0,
            },
        })
    );
}

/**
 * Format bytes into readable MB/KB string
 */
export function formatFileSize(bytes?: number): string {
    if (!bytes || bytes <= 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
}
