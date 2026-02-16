import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Map, Clock, ArrowRight, User, CheckCircle2, Hash, Search, XCircle, Edit2, Save } from "lucide-react";
import { useState } from "react";

export default function Trips({ plant }: { plant?: string }) {
    const requests = useQuery(api.requests.list, { plant }) || [];
    const trips = useQuery(api.trips.list, { plant }) || [];
    const updateTripStatus = useMutation(api.trips.updateStatus);
    const [search, setSearch] = useState("");
    const [editingLog, setEditingLog] = useState<any>(null);
    const [completingTripId, setCompletingTripId] = useState<string | null>(null);
    const [endOdometer, setEndOdometer] = useState("");
    const updateTripDetails = useMutation(api.trips.updateDetails);
    const updateRequestDetails = useMutation(api.requests.updateDetails);

    // Combine trips and rejected requests for a unified operational log
    const combinedLogs = [
        ...trips.map(t => ({ ...t, type: 'trip' })),
        ...requests
            .filter(r => r.status === "rejected")
            .map(r => ({
                _id: r._id,
                _creationTime: r.createdAt,
                requestId: r.requestId,
                requesterName: r.requesterName,
                startLocation: r.pickupLocation,
                endLocation: r.dropLocation,
                startTime: r.createdAt,
                purpose: r.purpose,
                status: "Rejected",
                type: 'rejection'
            }))
    ].sort((a, b) => (b.startTime || 0) - (a.startTime || 0));

    const filteredLogs = combinedLogs.filter(t =>
        t.requestId?.toLowerCase().includes(search.toLowerCase()) ||
        t.requesterName?.toLowerCase().includes(search.toLowerCase()) ||
        t.startLocation.toLowerCase().includes(search.toLowerCase()) ||
        t.endLocation.toLowerCase().includes(search.toLowerCase())
    );

    const handleInitiateCompletion = (tripId: string) => {
        setCompletingTripId(tripId);
    };

    const handleConfirmCompletion = async () => {
        if (!endOdometer) {
            alert("Please enter ending odometer reading.");
            return;
        }

        const trip = trips.find(t => t._id === completingTripId);
        if (!trip) return;

        const endOdo = Number(endOdometer);
        if (trip.startOdometer && endOdo < trip.startOdometer) {
            alert("End odometer cannot be less than start odometer.");
            return;
        }

        try {
            await updateTripStatus({
                id: completingTripId as any,
                status: "Completed",
                endTime: Date.now(),
                endOdometer: endOdo
            });
            setCompletingTripId(null);
            setEndOdometer("");
            alert("Trip completed successfully!");
        } catch (error) {
            alert("Failed to complete trip.");
        }
    };

    const handleSaveLogEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingLog.type === 'trip') {
                await updateTripDetails({
                    id: editingLog._id,
                    updates: {
                        requesterName: editingLog.requesterName,
                        purpose: editingLog.purpose,
                        startLocation: editingLog.startLocation,
                        endLocation: editingLog.endLocation,
                        startOdometer: editingLog.startOdometer ? Number(editingLog.startOdometer) : undefined,
                        endOdometer: editingLog.endOdometer ? Number(editingLog.endOdometer) : undefined,
                    }
                });
            } else {
                // Rejection - update the original request
                await updateRequestDetails({
                    id: editingLog._id,
                    updates: {
                        requesterName: editingLog.requesterName,
                        purpose: editingLog.purpose,
                        pickupLocation: editingLog.startLocation,
                        dropLocation: editingLog.endLocation,
                    }
                });
            }
            setEditingLog(null);
            alert("Log entry updated successfully.");
        } catch (error) {
            alert("Failed to update log entry.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-[#0e2a63]">Operational Logs</h2>
                    <p className="text-sm text-slate-400 font-medium">History of all vehicle movements and plant transfers.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search logs (REQ-ID, Name...)"
                            className="pl-12 pr-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0e2a63]/10 transition-all outline-none w-64 shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0e2a63] transition-all shadow-sm">
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Timeline View */}
            <div className="space-y-4">
                {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                    <div key={log._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                        <div className="flex items-center gap-6">
                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${log.status === "Completed" ? "bg-emerald-50 text-emerald-600" :
                                log.status === "Rejected" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                                }`}>
                                {log.status === "Completed" ? <CheckCircle2 size={24} /> :
                                    log.status === "Rejected" ? <XCircle size={24} /> : <Clock size={24} />}
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black uppercase tracking-widest text-[#0e2a63]">{log.startLocation}</span>
                                    <ArrowRight size={14} className="text-slate-300" />
                                    <span className="text-xs font-black uppercase tracking-widest text-[#0e2a63]">{log.endLocation}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Clock size={12} className="text-[#f39c12]" /> {new Date(log.startTime).toLocaleString()}</span>
                                    <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                                    <span className="text-[#0e2a63]/70">{log.purpose}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 md:px-12 border-l border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                    <Hash size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Request ID</span>
                                    <span className="text-sm font-bold text-slate-700">{log.requestId || "N/A"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                    <User size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Operator</span>
                                    <span className="text-sm font-bold text-slate-700">{log.requesterName || "System Assigned"}</span>
                                </div>
                            </div>
                            {log.startOdometer !== undefined && (
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-orange-50/50 rounded-lg flex items-center justify-center text-[#f39c12]">
                                        <ArrowRight size={16} className="rotate-45" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Odometer Readings</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-700">{log.startOdometer}</span>
                                            {log.endOdometer && (
                                                <>
                                                    <ArrowRight size={12} className="text-slate-300" />
                                                    <span className="text-sm font-bold text-slate-700">{log.endOdometer}</span>
                                                    <span className="ml-2 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-lg">
                                                        +{Math.max(0, log.endOdometer - log.startOdometer)} KM
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="shrink-0 flex items-center gap-4">
                            <button
                                onClick={() => setEditingLog(log)}
                                className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-[#0e2a63] transition-colors"
                                title="Edit Log Entry"
                            >
                                <Edit2 size={14} />
                            </button>

                            <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${log.status === "Completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                log.status === "Rejected" ? "bg-red-50 text-red-600 border border-red-100" :
                                    "bg-blue-50 text-blue-600 border border-blue-100"
                                }`}>
                                {log.status}
                            </span>

                            {log.status === "In Progress" && (
                                <button
                                    onClick={() => handleInitiateCompletion(log._id)}
                                    className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-md"
                                >
                                    Complete Trip
                                </button>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                        <Map size={48} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-slate-400 text-sm font-medium italic">No operational logs recorded yet.</p>
                    </div>
                )
                }
            </div>

            {/* Edit Log Modal */}
            {editingLog && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0e2a63]/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setEditingLog(null)}></div>
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300 border border-white/20">
                        <div className={`absolute top-0 left-0 w-full h-1.5 ${editingLog.type === 'trip' ? 'bg-[#0e2a63]' : 'bg-red-500'}`}></div>
                        <form onSubmit={handleSaveLogEdit} className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-[#0e2a63]">Edit Operational Log</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{editingLog.requestId} • {editingLog.type}</p>
                                </div>
                                <button type="button" onClick={() => setEditingLog(null)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Requester Name</label>
                                    <input required className="input-field py-3" value={editingLog.requesterName} onChange={e => setEditingLog({ ...editingLog, requesterName: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Purpose</label>
                                    <input required className="input-field py-3" value={editingLog.purpose} onChange={e => setEditingLog({ ...editingLog, purpose: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pickup Location</label>
                                    <input required className="input-field py-3" value={editingLog.startLocation} onChange={e => setEditingLog({ ...editingLog, startLocation: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Drop Location</label>
                                    <input required className="input-field py-3" value={editingLog.endLocation} onChange={e => setEditingLog({ ...editingLog, endLocation: e.target.value })} />
                                </div>

                                {editingLog.type === 'trip' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Odometer</label>
                                            <input type="number" className="input-field py-3" value={editingLog.startOdometer || ""} onChange={e => setEditingLog({ ...editingLog, startOdometer: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">End Odometer</label>
                                            <input type="number" className="input-field py-3" value={editingLog.endOdometer || ""} onChange={e => setEditingLog({ ...editingLog, endOdometer: e.target.value })} />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setEditingLog(null)} className="flex-1 py-4 bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-100 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-4 bg-[#0e2a63] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-blue-900/20 hover:bg-black transition-all flex items-center justify-center gap-2 group">
                                    <Save size={14} className="group-hover:scale-110 transition-transform" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Trip Completion Modal */}
            {completingTripId && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0e2a63]/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => { setCompletingTripId(null); setEndOdometer(""); }}></div>
                    <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300 border border-white/20">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-600"></div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-[#0e2a63]">Complete Trip</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Enter final odometer reading</p>
                                </div>
                                <button type="button" onClick={() => { setCompletingTripId(null); setEndOdometer(""); }} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                                    <XCircle size={20} />
                                </button>
                            </div>

                            {(() => {
                                const trip = trips.find(t => t._id === completingTripId);
                                if (!trip) return null;

                                const distance = endOdometer && trip.startOdometer
                                    ? Math.max(0, Number(endOdometer) - trip.startOdometer)
                                    : null;

                                return (
                                    <>
                                        <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Request ID</span>
                                                    <p className="text-sm font-bold text-slate-700">{trip.requestId || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Purpose</span>
                                                    <p className="text-sm font-bold text-slate-700">{trip.purpose || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">From</span>
                                                    <p className="text-sm font-bold text-slate-700">{trip.startLocation}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">To</span>
                                                    <p className="text-sm font-bold text-slate-700">{trip.endLocation}</p>
                                                </div>
                                            </div>

                                            {trip.startOdometer && (
                                                <div className="pt-4 border-t border-slate-200">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Start Odometer</span>
                                                    <p className="text-lg font-black text-[#0e2a63]">{trip.startOdometer} km</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">End Odometer (km) *</label>
                                            <input
                                                required
                                                type="number"
                                                className="input-field py-4 text-lg font-bold"
                                                placeholder="Enter ending odometer reading"
                                                value={endOdometer}
                                                onChange={e => setEndOdometer(e.target.value)}
                                                autoFocus
                                            />
                                        </div>

                                        {distance !== null && (
                                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                                                        <ArrowRight size={20} />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Distance Driven</span>
                                                        <p className="text-2xl font-black text-emerald-700">{distance} km</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-4 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => { setCompletingTripId(null); setEndOdometer(""); }}
                                                className="flex-1 py-4 bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-100 transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleConfirmCompletion}
                                                className="flex-1 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 group"
                                            >
                                                <CheckCircle2 size={14} className="group-hover:scale-110 transition-transform" />
                                                Complete Trip
                                            </button>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
