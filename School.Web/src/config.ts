// Centralized API configuration
function resolveApiBaseUrl(): string {
    const envUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");

    // Safety fallback: if VITE_API_URL points to the frontend static site itself, is blank, or invalid, use the live backend API
    if (!envUrl || envUrl.includes("mbs-portal.onrender.com") || envUrl === "undefined") {
        return "https://mbs-tvr0.onrender.com/api";
    }

    // Ensure it ends with /api if not already present
    return envUrl.endsWith("/api") ? envUrl : `${envUrl}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl();
export default API_BASE_URL;
