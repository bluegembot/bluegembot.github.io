import { API_URL } from "@/config/environment";

let cachedCsrfToken: string | null = null;

export function clearCsrfTokenCache(): void {
    cachedCsrfToken = null;
}

async function fetchCsrfToken(): Promise<string> {
    const r = await fetch(`${API_URL}/csrf-token`, {
        method: "GET",
        credentials: "include",
    });

    if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch CSRF token");
    }

    const data = await r.json();
    if (!data?.csrfToken) throw new Error("CSRF token missing in response");

    return data.csrfToken;
}

export async function getCsrfToken(): Promise<string> {
    if (cachedCsrfToken) return cachedCsrfToken;
    cachedCsrfToken = await fetchCsrfToken();
    return cachedCsrfToken;
}

export async function csrfFetch(
    input: RequestInfo | URL,
    init: RequestInit = {}
): Promise<Response> {
    const method = (init.method || "GET").toUpperCase();
    const isStateChanging =
        method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";

    const headers = new Headers(init.headers || {});

    if (isStateChanging) {
        const token = await getCsrfToken();
        headers.set("X-CSRF-Token", token);
    }

    // Important: spread init first, then override headers/credentials LAST
    let response = await fetch(input, {
        ...init,
        headers,
        credentials: "include",
    });

    // Retry once if CSRF rejected
    if (isStateChanging && response.status === 403) {
        clearCsrfTokenCache();
        const fresh = await getCsrfToken();

        const retryHeaders = new Headers(init.headers || {});
        retryHeaders.set("X-CSRF-Token", fresh);

        response = await fetch(input, {
            ...init,
            headers: retryHeaders,
            credentials: "include",
        });
    }

    return response;
}
