import { useState, useEffect, useRef } from "react";
import { LayoutDashboard, Truck, Users, Map, LogOut, ChevronLeft, ChevronRight, Bell, ClipboardList, Fuel, Navigation, Wifi, Clock } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSessionTimeout } from "../hooks/useSessionTimeout";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface LayoutProps {
    user?: any;
    onLogout: () => void;
}

const navItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
    { id: "requests", label: "Vehicle Requests", icon: ClipboardList, path: "/requests" },
    { id: "vehicles", label: "Fleet Management", icon: Truck, path: "/vehicles" },
    { id: "drivers", label: "Drivers", icon: Users, path: "/drivers" },
    { id: "trips", label: "Operational Logs", icon: Map, path: "/trips" },
    { id: "internalMovements", label: "Internal Movements", icon: Navigation, path: "/internal-logs" },
    { id: "fuel", label: "Fuel Management", icon: Fuel, path: "/fuel" },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
];

const TIMEOUT_MINUTES = 10;

export function Layout({ user, onLogout }: LayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [timeoutWarning, setTimeoutWarning] = useState(false);
    const [countdown, setCountdown] = useState(60); // 60-sec warning

    const unreadCount = useQuery(api.notifications.getUnreadCount, {}) || 0;
    const syncExpiries = useMutation(api.notifications.syncExpiries);
    const requests = useQuery(api.requests.list, { plant: user?.plant }) || [];
    const navigate = useNavigate();
    const location = useLocation();

    // Track previous request count to detect new incoming requests
    const prevRequestCount = useRef<number | null>(null);

    // ── Session timeout ───────────────────────────────────────────────
    // Show a warning 1 minute before timeout
    const WARNING_MS = (TIMEOUT_MINUTES - 1) * 60 * 1000;
    const TIMEOUT_MS = TIMEOUT_MINUTES * 60 * 1000;

    const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const resetTimers = () => {
        // Clear existing timers
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        setTimeoutWarning(false);

        // Set new timers
        warningTimerRef.current = setTimeout(() => {
            setTimeoutWarning(true);
            setCountdown(60);
        }, WARNING_MS);

        logoutTimerRef.current = setTimeout(() => {
            setTimeoutWarning(false);
            onLogout();
        }, TIMEOUT_MS);
    };

    // Track activity events to reset the timers
    useEffect(() => {
        const EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
        const handler = () => { resetTimers(); };
        EVENTS.forEach(e => window.addEventListener(e, handler, { passive: true }));
        resetTimers(); // start immediately

        return () => {
            EVENTS.forEach(e => window.removeEventListener(e, handler));
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        };
    }, []);

    // Countdown ticker when warning is visible
    useEffect(() => {
        if (!timeoutWarning) return;
        setCountdown(60);
        const interval = setInterval(() => {
            setCountdown(c => {
                if (c <= 1) { clearInterval(interval); return 0; }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timeoutWarning]);

    // ── New request toast ─────────────────────────────────────────────
    useEffect(() => {
        if (prevRequestCount.current === null) {
            prevRequestCount.current = requests.length;
            return;
        }
        const pending = requests.filter((r: any) => r.status === "pending").length;
        const prevPending = prevRequestCount.current;
        if (requests.length > prevRequestCount.current) {
            const newCount = requests.length - prevRequestCount.current;
            showToast(`🔔 ${newCount} new vehicle request${newCount > 1 ? "s" : ""}!`);
        }
        prevRequestCount.current = requests.length;
    }, [requests.length]);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
    };

    // ── Init ──────────────────────────────────────────────────────────
    useEffect(() => {
        setIsVisible(true);
        syncExpiries();
    }, []);

    // Filter nav items based on user role
    const filteredNavItems = navItems.filter(item => {
        if (item.id === "notifications") {
            return user?.adminId === "cslsuperadmin" || user?.adminId === "masteradmin";
        }
        return true;
    });

    const currentPage = navItems.find(item => item.path === location.pathname)?.id || "dashboard";

    return (
        <div className="flex h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-hidden">

            {/* ── Session timeout warning overlay ── */}
            {timeoutWarning && (
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center space-y-5">
                        <div className="h-16 w-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
                            <Clock size={32} className="text-[#f39c12]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-[#0e2a63]">Session Expiring</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                You've been inactive. Auto-logout in
                            </p>
                            <p className="text-5xl font-black text-[#f39c12] mt-3 tabular-nums">{countdown}s</p>
                        </div>
                        <button
                            onClick={() => { setTimeoutWarning(false); resetTimers(); }}
                            className="w-full btn-primary justify-center"
                        >
                            Stay Logged In
                        </button>
                        <button
                            onClick={onLogout}
                            className="w-full btn-ghost justify-center text-red-500 hover:text-red-600"
                        >
                            Logout Now
                        </button>
                    </div>
                </div>
            )}

            {/* ── New request toast ── */}
            {toast && (
                <div className="fixed top-6 right-6 z-[9998] animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="bg-[#0e2a63] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold">
                        <Bell size={16} className="text-[#f39c12] shrink-0 animate-bounce" />
                        {toast}
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <aside className={cn(
                "bg-[#0e2a63] text-white flex flex-col transition-all duration-300 relative z-20 shadow-2xl",
                isCollapsed ? "w-20" : "w-64"
            )}>
                <div className="p-6 flex items-center gap-4 border-b border-white/10 shrink-0">
                    <div className="bg-white p-1.5 rounded-lg shrink-0">
                        <img src="https://www.chandansteel.net/images/logo-floated.png" alt="Logo" className="h-6 w-6 object-contain" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col animate-in fade-in duration-500">
                            <span className="text-xs font-black tracking-[0.2em] uppercase text-blue-300">Vehicle</span>
                            <span className="text-lg font-bold leading-none tracking-tight">System</span>
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
                    {filteredNavItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                                currentPage === item.id
                                    ? "bg-[#f39c12] text-white shadow-lg shadow-orange-500/20"
                                    : "text-blue-100/70 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <item.icon size={20} className={cn(
                                "shrink-0 transition-transform duration-300",
                                currentPage === item.id ? "scale-110" : "group-hover:scale-110"
                            )} />
                            {!isCollapsed && <span className="font-bold text-sm tracking-wide">{item.label}</span>}
                            {item.id === "notifications" && unreadCount > 0 && (
                                <span className={cn(
                                    "absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-lg animate-pulse",
                                    !isCollapsed && "relative top-0 right-0 ml-auto"
                                )}>
                                    {unreadCount}
                                </span>
                            )}
                            {item.id === "requests" && requests.filter((r: any) => r.status === "pending").length > 0 && (
                                <span className={cn(
                                    "absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-black text-white shadow-lg",
                                    !isCollapsed && "relative top-0 right-0 ml-auto"
                                )}>
                                    {requests.filter((r: any) => r.status === "pending").length}
                                </span>
                            )}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Session timer indicator */}
                {!isCollapsed && (
                    <div className="px-4 pb-2">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                            <Clock size={12} className="text-blue-300 shrink-0" />
                            <span className="text-[10px] text-blue-200/60 font-bold uppercase tracking-wider">
                                Auto-logout: {TIMEOUT_MINUTES}min idle
                            </span>
                        </div>
                    </div>
                )}

                <div className="p-3 border-t border-white/10">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-100/50 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300 group"
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span className="font-bold text-sm">Logout</span>}
                    </button>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-20 h-6 w-6 bg-[#f39c12] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform hidden md:flex"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative flex flex-col">
                {/* Background Decoration */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.3]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }}></div>
                </div>

                <header className="h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 border-b border-slate-200 shadow-sm">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-[#0e2a63] uppercase tracking-tight leading-none italic">
                            {navItems.find(i => i.id === currentPage)?.label || currentPage}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="h-1 w-8 bg-[#f39c12] rounded-full"></div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Administration Portal</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Live indicator */}
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                            <Wifi size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        </div>
                        <div className="flex flex-col items-end text-right hidden sm:flex">
                            <span className="text-sm font-bold text-[#0e2a63]">{user?.name || "Admin"}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user?.plant || "Main Gate Terminal Master Controller"}</span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0e2a63] to-blue-500 shadow-lg p-0.5">
                            <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center text-[#0e2a63] font-black text-xs">
                                {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : "SA"}
                            </div>
                        </div>
                    </div>
                </header>

                <div className={cn(
                    "flex-1 p-8 relative z-1 transition-all duration-700 transform",
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                )}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
