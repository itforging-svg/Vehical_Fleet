import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Map, Clock, ArrowRight, User, Truck, CheckCircle2 } from "lucide-react";

export default function Trips() {
    const trips = useQuery(api.trips.list) || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-[#0e2a63]">Operational Logs</h2>
                    <p className="text-sm text-slate-400 font-medium">History of all vehicle movements and plant transfers.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0e2a63] transition-all shadow-sm">
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Timeline View */}
            <div className="space-y-4">
                {trips.length > 0 ? trips.map((trip) => (
                    <div key={trip._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                        <div className="flex items-center gap-6">
                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${trip.status === "Completed" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                                }`}>
                                {trip.status === "Completed" ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black uppercase tracking-widest text-[#0e2a63]">{trip.startLocation}</span>
                                    <ArrowRight size={14} className="text-slate-300" />
                                    <span className="text-xs font-black uppercase tracking-widest text-[#0e2a63]">{trip.endLocation}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Clock size={12} className="text-[#f39c12]" /> {new Date(trip.startTime).toLocaleString()}</span>
                                    <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                                    <span className="text-[#0e2a63]/70">{trip.purpose}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 md:px-12 border-l border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                    <User size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Operator</span>
                                    <span className="text-sm font-bold text-slate-700">{trip.requesterName || "System Assigned"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                    <Truck size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Asset ID</span>
                                    <span className="text-xs font-black text-[#0e2a63] uppercase tracking-wide">Vehicle Linked</span>
                                </div>
                            </div>
                        </div>

                        <div className="shrink-0">
                            <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${trip.status === "Completed"
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                    : "bg-blue-50 text-blue-600 border border-blue-100"
                                }`}>
                                {trip.status}
                            </span>
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                        <Map size={48} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-slate-400 text-sm font-medium italic">No operational logs recorded yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
