import { useQuery, useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";
import { Bell, Clock, ShieldAlert, CheckCheck, CheckCircle2, Truck, ShieldCheck, FileText, Activity } from "lucide-react";

export default function NotificationPage() {
    const notifications = useQuery(api.notifications.list, {}) || [];
    const markAsRead = useMutation(api.notifications.markAsRead);
    const markAllAsRead = useMutation(api.notifications.markAllAsRead);
    const syncExpiries = useMutation(api.notifications.syncExpiries);

    useEffect(() => {
        syncExpiries();
    }, [syncExpiries]);

    const unread = notifications.filter((n: any) => n.status === "unread");
    const read = notifications.filter((n: any) => n.status !== "unread");

    const formatDate = (timestamp: number) =>
        new Date(timestamp).toLocaleString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });

    const getTypeIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case "puc": return <Activity size={14} />;
            case "insurance": return <ShieldCheck size={14} />;
            case "rc": return <FileText size={14} />;
            case "fitness": return <ShieldAlert size={14} />;
            default: return <Truck size={14} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case "puc": return "badge badge-orange";
            case "insurance": return "badge badge-blue";
            case "rc": return "badge badge-amber";
            case "fitness": return "badge badge-red";
            default: return "badge badge-slate";
        }
    };

    const getStripColor = (item: any) => {
        if (item.status === "unread") return "bg-red-400";
        return "bg-slate-200";
    };

    const NotifCard = ({ item }: { item: any }) => (
        <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex ${item.status === "unread" ? "border-red-100" : "border-slate-100 opacity-70"
            }`}>
            {/* Left colour strip */}
            <div className={`w-1 shrink-0 ${getStripColor(item)}`} />

            {/* Card body */}
            <div className="flex-1 px-5 py-4 min-w-0 space-y-2.5">
                {/* TOP ROW: title + timestamp + dismiss */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${item.status === "unread" ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400"
                            }`}>
                            <ShieldAlert size={16} />
                        </div>
                        <div className="min-w-0">
                            <h3 className={`text-sm font-black uppercase tracking-wide truncate ${item.status === "unread" ? "text-[#0e2a63]" : "text-slate-400"
                                }`}>
                                {item.title}
                                {item.status === "unread" && (
                                    <span className="inline-block ml-2 h-2 w-2 rounded-full bg-red-500 align-middle" />
                                )}
                            </h3>
                            <p className={`text-xs leading-relaxed mt-0.5 ${item.status === "unread" ? "text-slate-600" : "text-slate-400 italic"
                                }`}>
                                {item.message}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold whitespace-nowrap">
                            <Clock size={10} className="text-slate-300" />
                            {formatDate(item.createdAt)}
                        </span>
                        {item.status === "unread" && (
                            <button
                                onClick={() => markAsRead({ id: item._id })}
                                className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 active:scale-95 transition-all shadow-sm"
                                title="Mark as read"
                            >
                                <CheckCircle2 size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* BOTTOM ROW: meta chips */}
                <div className="border-t border-dashed border-slate-100 pt-2.5 flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 bg-[#0e2a63]/5 text-[#0e2a63] text-[10px] font-black rounded-lg border border-[#0e2a63]/10 flex items-center gap-1.5 whitespace-nowrap">
                        <Truck size={10} />
                        {item.registrationNumber}
                    </span>
                    <span className={`${getTypeColor(item.type)} flex items-center gap-1.5`}>
                        {getTypeIcon(item.type)}
                        {item.type?.toUpperCase() || "Alert"}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="page-header">
                <div className="flex items-center gap-4">
                    <div className="page-header-icon" style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}>
                        <Bell size={26} />
                    </div>
                    <div>
                        <h1 className="page-title">Expiry Alerts</h1>
                        <p className="page-subtitle">Compliance monitoring — PUC · Insurance · RC · Fitness</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {unread.length > 0 && (
                        <span className="badge badge-red animate-pulse">
                            {unread.length} Unread
                        </span>
                    )}
                    <button
                        onClick={() => markAllAsRead()}
                        className="btn-ghost"
                    >
                        <CheckCheck size={16} className="text-emerald-500" />
                        Mark All Read
                    </button>
                </div>
            </div>

            {/* Notification Cards */}
            {notifications.length > 0 ? (
                <div className="space-y-4">
                    {/* Unread section */}
                    {unread.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-red-100" />
                                <span className="text-[10px] text-red-400 font-black uppercase tracking-widest">
                                    {unread.length} Active Alerts
                                </span>
                                <div className="h-px flex-1 bg-red-100" />
                            </div>
                            {unread.map((item: any) => (
                                <NotifCard key={item._id} item={item} />
                            ))}
                        </div>
                    )}

                    {/* Read section */}
                    {read.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-slate-100" />
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                    {read.length} Dismissed
                                </span>
                                <div className="h-px flex-1 bg-slate-100" />
                            </div>
                            {read.map((item: any) => (
                                <NotifCard key={item._id} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="section-card py-24 flex flex-col items-center justify-center text-center">
                    <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-300 mb-6">
                        <Bell size={40} />
                    </div>
                    <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">All Cleared</h3>
                    <p className="text-slate-300 text-xs font-medium uppercase tracking-[0.2em] mt-2">
                        No active document alerts at this time
                    </p>
                </div>
            )}
        </div>
    );
}
