import { useEffect, useRef, useCallback } from "react";

const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

const ACTIVITY_EVENTS = [
    "mousemove",
    "mousedown",
    "keydown",
    "touchstart",
    "scroll",
    "click",
];

/**
 * Auto-logout hook — calls onTimeout after `timeoutMs` of inactivity.
 * Resets on any user interaction event.
 */
export function useSessionTimeout(onTimeout: () => void, timeoutMs = TIMEOUT_MS) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onTimeoutRef = useRef(onTimeout);

    // Keep ref fresh without re-running effect
    useEffect(() => {
        onTimeoutRef.current = onTimeout;
    }, [onTimeout]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            onTimeoutRef.current();
        }, timeoutMs);
    }, [timeoutMs]);

    useEffect(() => {
        // Start timer immediately
        resetTimer();

        // Reset on any activity
        ACTIVITY_EVENTS.forEach(event =>
            window.addEventListener(event, resetTimer, { passive: true })
        );

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            ACTIVITY_EVENTS.forEach(event =>
                window.removeEventListener(event, resetTimer)
            );
        };
    }, [resetTimer]);
}
