import { type ReactNode, useState, useEffect } from "react";
import { LayoutDashboard, Truck, Users, Map, Settings, LogOut, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface LayoutProps {
    children: ReactNode;
    currentPage: string;
    onPageChange: (page: string) => void;
}

const navItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "vehicles", label: "Fleet Management", icon: Truck },
    { id: "drivers", label: "Drivers", icon: Users },
    { id: "trips", label: "Operational Logs", icon: Map },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
];

export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const unreadCount = useQuery(api.notifications.getUnreadCount, {}) || 0;
    const syncExpiries = useMutation(api.notifications.syncExpiries);

    useEffect(() => {
        setIsVisible(true);
        // Sync expiries on load
        syncExpiries();
    }, []);

    return (
        <div className="flex h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-hidden">
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
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onPageChange(item.id)}
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
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-3 border-t border-white/10">
                    <button
                        onClick={() => onPageChange("logout")}
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
                        <div className="flex flex-col items-end text-right hidden sm:flex">
                            <span className="text-sm font-bold text-[#0e2a63]">Superadmin</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Main Gate Terminal Master Controller</span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0e2a63] to-blue-500 shadow-lg p-0.5">
                            <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center text-[#0e2a63] font-black text-xs">
                                SA
                            </div>
                        </div>
                    </div>
                </header>

                <div className={cn(
                    "flex-1 p-8 relative z-1 transition-all duration-700 transform",
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                )}>
                    {children}
                </div>
            </main>
        </div>
    );
}
