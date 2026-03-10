import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navigation, Clock, ArrowRight, Edit2, Save, XCircle, Search, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function InternalMovementLogs({ plant }: { plant?: string }) {
    const trips = useQuery(api.trips.list, { plant }) || [];
    const vehicles = useQuery(api.vehicles.list, {}) || [];
    const drivers = useQuery(api.drivers.list) || [];
    const updateTripDetails = useMutation(api.trips.updateDetails);
    const updateTripStatus = useMutation(api.trips.updateStatus);

    const getVehicle = (id?: string) => id ? vehicles.find(v => v._id === id) : null;
    const getDriver = (id?: string) => id ? drivers.find(d => d._id === id) : null;

    const [search, setSearch] = useState("");
    const [editingLog, setEditingLog] = useState<any>(null);
    const [completingTripId, setCompletingTripId] = useState<string | null>(null);
    const [endOdometer, setEndOdometer] = useState("");

    const internalLogs = trips
        .filter(t => t.purpose === "Internal Transfer")
        .map(t => ({
            ...t,
            role: plant ? (t.startLocation === plant ? "Origin" : "Destination") : null
        }))
        .sort((a, b) => (b.startTime || 0) - (a.startTime || 0));

    const filteredLogs = internalLogs.filter(t =>
        (t.requestId || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.requesterName || "").toLowerCase().includes(search.toLowerCase()) ||
        t.startLocation.toLowerCase().includes(search.toLowerCase()) ||
        t.endLocation.toLowerCase().includes(search.toLowerCase())
    );

    const handleConfirmCompletion = async () => {
        if (!endOdometer) { alert("Please enter ending odometer reading."); return; }
        const trip = trips.find(t => t._id === completingTripId);
        if (!trip) return;
        const endOdo = Number(endOdometer);
        if (trip.startOdometer && endOdo < trip.startOdometer) {
            alert("End odometer cannot be less than start odometer."); return;
        }
        try {
            await updateTripStatus({ id: completingTripId as any, status: "Completed", endTime: Date.now(), endOdometer: endOdo });
            setCompletingTripId(null); setEndOdometer("");
        } catch { alert("Failed to complete trip."); }
    };

    const handleSaveLogEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
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
            setEditingLog(null);
        } catch { alert("Failed to update log entry."); }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Page Header */}
            <div className="page-header">
                <div className="flex items-center gap-4">
                    <div className="page-header-icon">
                        <Navigation size={26} />
                    </div>
                    <div>
                        <h1 className="page-title">Internal Movements</h1>
                        <p className="page-subtitle">Plant-to-plant transfers and internal utility movements</p>
                    </div>
                </div>
                <div className="relative group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f39c12] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search movements..."
                        className="bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#f39c12]/20 focus:border-[#f39c12] transition-all shadow-sm w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Logs List */}
            <div className="space-y-3">
                {filteredLogs.length > 0 ? filteredLogs.map((log) => {
                    const vehicle = getVehicle(log.vehicleId as any);
                    const driver = getDriver(log.driverId as any);
                    const kmDriven = (log.startOdometer && log.endOdometer)
                        ? Math.max(0, log.endOdometer - log.startOdometer) : null;

                    return (
                        <div key={log._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex">

                            {/* Left colour strip */}
                            <div className={`w-1 shrink-0 ${log.status === "Completed" ? "bg-emerald-400" : "bg-[#f39c12]"}`} />

                            {/* Card body */}
                            <div className="flex-1 px-5 py-4 min-w-0 space-y-3">

                                {/* TOP ROW: Route + status + actions */}
                                <div className="flex items-center justify-between gap-3">

                                    {/* Route */}
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <Navigation size={15} className="text-[#f39c12] shrink-0" />
                                        <span className="text-sm font-black text-[#0e2a63] truncate max-w-[120px]">{log.startLocation}</span>
                                        <div className="flex items-center shrink-0">
                                            <div className="w-3 h-px bg-slate-200" />
                                            <ArrowRight size={13} className="text-[#f39c12]" />
                                            <div className="w-3 h-px bg-slate-200" />
                                        </div>
                                        <span className="text-sm font-black text-[#0e2a63] truncate max-w-[120px]">{log.endLocation}</span>
                                        {log.requestId && (
                                            <span className="hidden sm:inline ml-2 px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 text-[9px] font-black tracking-widest rounded-lg shrink-0">
                                                {log.requestId}
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border whitespace-nowrap
                                            ${log.status === "Completed"
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                                            {log.status}
                                        </span>
                                        <button
                                            onClick={() => setEditingLog(log)}
                                            className="p-1.5 rounded-lg text-slate-300 hover:text-[#0e2a63] hover:bg-slate-50 transition-all"
                                            title="Edit"
                                        >
                                            <Edit2 size={13} />
                                        </button>
                                        {log.status === "In Progress" && (
                                            <button
                                                onClick={() => { setCompletingTripId(log._id); setEndOdometer(""); }}
                                                className="px-3 py-1.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-600 transition-all shadow-sm whitespace-nowrap"
                                            >
                                                Complete ✓
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* BOTTOM ROW: Meta chips */}
                                <div className="border-t border-dashed border-slate-100 pt-2.5 flex items-center gap-2 flex-wrap">
                                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                                        <Clock size={10} className="text-slate-300" />
                                        {new Date(log.startTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {log.role && (
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider
                                            ${log.role === 'Origin' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                                            {log.role === 'Origin' ? '↑ Origin' : '↓ Dest'}
                                        </span>
                                    )}
                                    {vehicle && (
                                        <span className="px-2.5 py-1 bg-[#0e2a63]/5 text-[#0e2a63] text-[10px] font-bold rounded-lg border border-[#0e2a63]/10 whitespace-nowrap">
                                            {vehicle.registrationNumber} <span className="text-slate-400 font-normal">· {vehicle.model}</span>
                                        </span>
                                    )}
                                    {driver && (
                                        <span className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100 whitespace-nowrap">
                                            {driver.name} <span className="text-slate-400 font-normal">· {driver.phoneNumber}</span>
                                        </span>
                                    )}
                                    {log.startOdometer !== undefined && (
                                        <span className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100 flex items-center gap-1 whitespace-nowrap">
                                            {log.startOdometer} km
                                            {log.endOdometer && (
                                                <>
                                                    <span className="text-slate-300 mx-0.5">→</span>
                                                    {log.endOdometer} km
                                                </>
                                            )}
                                            {kmDriven !== null && (
                                                <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-black">
                                                    +{kmDriven} km
                                                </span>
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="py-20 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                        <Navigation size={48} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-slate-400 text-sm font-medium italic">No internal movements recorded yet.</p>
                    </div>
                )}
            </div>

            {/* Complete Trip Modal */}
            {completingTripId && (() => {
                const trip = trips.find(t => t._id === completingTripId);
                if (!trip) return null;
                const distance = endOdometer && trip.startOdometer
                    ? Math.max(0, Number(endOdometer) - trip.startOdometer) : null;
                return (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-[#0e2a63]/40 backdrop-blur-sm" onClick={() => { setCompletingTripId(null); setEndOdometer(""); }} />
                        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-white/20">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-600" />
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-[#0e2a63]">Complete Movement</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{trip.startLocation} → {trip.endLocation}</p>
                                    </div>
                                    <button onClick={() => { setCompletingTripId(null); setEndOdometer(""); }} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                                        <XCircle size={20} />
                                    </button>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
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
                                        <div className="pt-3 border-t border-slate-200">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Start Odometer</span>
                                            <p className="text-lg font-black text-[#0e2a63]">{trip.startOdometer} km</p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">End Odometer (km) *</label>
                                    <input
                                        autoFocus required type="number"
                                        className="input-field py-4 text-lg font-bold"
                                        placeholder="Enter ending odometer reading"
                                        value={endOdometer}
                                        onChange={e => setEndOdometer(e.target.value)}
                                    />
                                </div>
                                {distance !== null && (
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
                                        <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shrink-0">
                                            <ArrowRight size={20} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Distance Driven</span>
                                            <p className="text-2xl font-black text-emerald-700">{distance} km</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-4">
                                    <button onClick={() => { setCompletingTripId(null); setEndOdometer(""); }} className="flex-1 py-4 bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-100 transition-all">
                                        Cancel
                                    </button>
                                    <button onClick={handleConfirmCompletion} className="flex-1 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                                        <CheckCircle2 size={14} />
                                        Mark Complete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Edit Modal */}
            {editingLog && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0e2a63]/40 backdrop-blur-sm" onClick={() => setEditingLog(null)} />
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-white/20">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#f39c12]" />
                        <form onSubmit={handleSaveLogEdit} className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-[#0e2a63]">Edit Movement Log</h3>
                                <button type="button" onClick={() => setEditingLog(null)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                                    <XCircle size={20} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Operator Name</label>
                                    <input required className="input-field py-3" value={editingLog.requesterName} onChange={e => setEditingLog({ ...editingLog, requesterName: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Purpose</label>
                                    <input required className="input-field py-3" value={editingLog.purpose} onChange={e => setEditingLog({ ...editingLog, purpose: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">From</label>
                                    <input required className="input-field py-3" value={editingLog.startLocation} onChange={e => setEditingLog({ ...editingLog, startLocation: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">To</label>
                                    <input required className="input-field py-3" value={editingLog.endLocation} onChange={e => setEditingLog({ ...editingLog, endLocation: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setEditingLog(null)} className="flex-1 py-4 bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-4 bg-[#0e2a63] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2">
                                    <Save size={14} />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
