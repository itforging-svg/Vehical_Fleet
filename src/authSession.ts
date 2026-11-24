import type { AdminUser } from "./types";

const SESSION_KEY = "fleet-admin-session";

interface StoredSession {
    user: AdminUser;
    token: string;
    expiresAt: number;
}

export function readAuthSession(): StoredSession | null {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw) as StoredSession;
        if (!session.token || session.expiresAt <= Date.now()) {
            sessionStorage.removeItem(SESSION_KEY);
            return null;
        }
        return session;
    } catch {
        return null;
    }
}

export function saveAuthSession(session: StoredSession) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
    sessionStorage.removeItem(SESSION_KEY);
}

export function getSessionToken() {
    return readAuthSession()?.token ?? null;
}
