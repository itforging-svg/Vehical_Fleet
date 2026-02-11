import { useQuery, useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";
import { Bell, CheckCircle, Clock, ShieldAlert, CheckCheck } from "lucide-react";

export default function NotificationPage() {
    const notifications = useQuery(api.notifications.list, {}) || [];
    const markAsRead = useMutation(api.notifications.markAsRead);
    const markAllAsRead = useMutation(api.notifications.markAllAsRead);
    const syncExpiries = useMutation(api.notifications.syncExpiries);

    useEffect(() => {
        syncExpiries();
    }, [syncExpiries]);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-sm">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-[#0e2a63] uppercase tracking-tight italic">Expiry Alerts</h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Compliance Monitoring System</p>
                    </div>
                </div>

                <button
                    onClick={() => markAllAsRead()}
                    className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-[#0e2a63] hover:bg-slate-50 transition-all shadow-sm group"
                >
                    <CheckCheck size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                    Mark All as Read
                </button>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden min-h-[400px]">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                        {notifications.map((item: any) => (
                            <div
                                key={item._id}
                                className={`p-8 group hover:bg-slate-50/50 transition-all flex items-start gap-6 ${item.status === "unread" ? "bg-blue-50/20" : ""}`}
                            >
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${item.status === "unread" ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-400"
                                    }`}>
                                    <ShieldAlert size={24} />
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <h3 className={`text-sm font-black uppercase tracking-wide ${item.status === "unread" ? "text-[#0e2a63]" : "text-slate-400"}`}>
                                                {item.title}
                                            </h3>
                                            {item.status === "unread" && (
                                                <span className="flex h-2 w-2 rounded-full bg-red-500"></span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                <Clock size={12} /> {formatDate(item.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    <p className={`text-xs leading-relaxed max-w-2xl ${item.status === "unread" ? "text-slate-600" : "text-slate-400 italic"}`}>
                                        {item.message}
                                    </p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className="px-3 py-1 bg-[#0e2a63]/5 text-[#0e2a63] text-[10px] font-black rounded-lg uppercase tracking-widest">
                                            Vehicle: {item.registrationNumber}
                                        </span>
                                        <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black rounded-lg uppercase tracking-widest">
                                            Type: {item.type}
                                        </span>
                                    </div>
                                </div>

                                {item.status === "unread" && (
                                    <button
                                        onClick={() => markAsRead({ id: item._id })}
                                        className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                                        title="Dismiss Alert"
                                    >
                                        <CheckCircle size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                            <Bell size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest italic leading-none">All Cleared</h3>
                        <p className="text-slate-300 text-xs font-medium uppercase tracking-[0.2em] mt-3">No active document alerts at this time</p>
                    </div>
                )}
            </div>
        </div>
    );
}
