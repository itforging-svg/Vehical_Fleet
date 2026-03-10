import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ClipboardList, CheckCircle, XCircle, Search, Clock, ArrowRight, Edit2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useLastOdometer } from "../hooks/useLastOdometer";

export default function Requests({ user }: { user?: any }) {
    const plant = user?.plant;
    const requests = useQuery(api.requests.list, { plant }) || [];
    const vehicles = useQuery(api.vehicles.list, { plant }) || [];
    const drivers = useQuery(api.drivers.list, {}) || [];
    const trips = useQuery(api.trips.list, { plant }) || [];
    const updateStatus = useMutation(api.requests.updateStatus);
    const updateTripStatus = useMutation(api.trips.updateStatus);
    const [filter, setFilter] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [assigningId, setAssigningId] = useState<string | null>(null);
    const [completingId, setCompletingId] = useState<string | null>(null);
    const [selection, setSelection] = useState({ vehicleId: "", driverId: "", startOdometer: "" });
    const [endOdometer, setEndOdometer] = useState("");
    const [editingRequest, setEditingRequest] = useState<any>(null);
    const updateRequestDetails = useMutation(api.requests.updateDetails);
    const updateTripDetails = useMutation(api.trips.updateDetails);

    const lastOdoForAssignment = useLastOdometer(assigningId ? selection.vehicleId || undefined : undefined);
    useEffect(() => {
        if (lastOdoForAssignment !== null && selection.vehicleId) {
            setSelection(prev => ({ ...prev, startOdometer: String(lastOdoForAssignment) }));
        }
    }, [lastOdoForAssignment, selection.vehicleId]);

    const availableVehicles = vehicles.filter(v => v.status === "Active");
    const availableDrivers = drivers.filter(d => d.status === "Available");

    const handleMarkBack = async (requestId: string) => {
        const activeTrip = trips.find(t => t.requestId === requestId && t.status === "In Progress");
        if (!activeTrip) {
            alert("No active trip record found for this request. It might have been already completed or there's a sync delay.");
            return;
        }
        setCompletingId(requestId);
    };

    const handleConfirmCompletion = async () => {
        if (!endOdometer) { alert("Please enter ending odometer reading."); return; }
        const activeTrip = trips.find(t => t.requestId === completingId && t.status === "In Progress");
        if (!activeTrip) return;
        if (confirm("Is the vehicle back at plant? This will release the assets.")) {
            try {
                await updateTripStatus({ id: activeTrip._id, status: "Completed", endTime: Date.now(), endOdometer: Number(endOdometer), performedBy: user?.name || "Unknown Admin" });
                setCompletingId(null); setEndOdometer("");
            } catch { alert("Failed to complete trip."); }
        }
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { _id, _creationTime, status, requestId, vehicleId, driverId, createdAt, ...updates } = editingRequest;
            await updateRequestDetails({ id: _id, updates, performedBy: user?.name || "Unknown Admin" });
            const linkedTrip = trips.find(t => t.requestId === requestId);
            if (linkedTrip) {
                await updateTripDetails({
                    id: linkedTrip._id,
                    updates: {
                        requesterName: updates.requesterName,
                        requesterDepartment: updates.department,
                        purpose: updates.purpose,
                        startLocation: updates.pickupLocation,
                        endLocation: updates.dropLocation
                    },
                    performedBy: user?.name || "Unknown Admin"
                });
            }
            setEditingRequest(null);
            alert("Request updated successfully.");
        } catch { alert("Failed to update request."); }
    };

    const filteredRequests = requests.filter((req: any) => {
        const isActive = req.status === "pending" || req.status === "approved";
        if (!isActive) return false;
        const matchesStatus = filter === "all" || req.status === filter;
        const matchesSearch = req.requesterName.toLowerCase().includes(search.toLowerCase()) ||
            req.requestId.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return "bg-orange-50 text-orange-600 border-orange-100";
            case "approved": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "rejected": return "bg-red-50 text-red-600 border-red-100";
            default: return "bg-slate-50 text-slate-400 border-slate-100";
        }
    };

    const handleAction = async (id: any, status: string) => {
        if (status === "approved") { setAssigningId(id); return; }
        if (confirm(`Are you sure you want to ${status} this request?`)) {
            await updateStatus({ id, status, performedBy: user?.name || "Unknown Admin" });
        }
    };

    const handleConfirmApproval = async () => {
        if (!selection.vehicleId || !selection.driverId || !selection.startOdometer) {
            alert("Please select vehicle, driver and enter starting odometer."); return;
        }
        try {
            await updateStatus({
                id: assigningId as any, status: "approved",
                vehicleId: selection.vehicleId as any,
                driverId: selection.driverId as any,
                startOdometer: Number(selection.startOdometer),
                performedBy: user?.name || "Unknown Admin"
            });
            setAssigningId(null);
            setSelection({ vehicleId: "", driverId: "", startOdometer: "" });
        } catch { alert("Failed to approve request."); }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="page-header">
                <div className="flex items-center gap-4">
                    <div className="page-header-icon">
                        <ClipboardList size={26} />
                    </div>
                    <div>
                        <h1 className="page-title">Vehicle Requests</h1>
                        <p className="page-subtitle">Movement authorization and vehicle assignment center</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f39c12] transition-colors" />
                        <input
                            type="text" placeholder="Search by ID or name..."
                            className="bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#f39c12]/20 focus:border-[#f39c12] w-64 transition-all shadow-sm"
                            value={search} onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
                        {["all", "pending", "approved"].map((f) => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? "bg-[#0e2a63] text-white shadow-md" : "text-slate-400 hover:text-slate-600"}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Requests List */}
            <div className="space-y-3">
                {filteredRequests.length > 0 ? filteredRequests.map((req: any) => (
                    <div key={req._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex">
                        {/* Left colour strip */}
                        <div className={`w-1 shrink-0 ${req.status === "pending" ? "bg-[#f39c12]" : "bg-emerald-400"}`} />

                        {/* Card body */}
                        <div className="flex-1 px-5 py-4 min-w-0 space-y-3">
                            {/* TOP ROW: Route + status + actions */}
                            <div className="flex items-center justify-between gap-3">
                                {/* Route */}
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="text-sm font-black text-[#0e2a63] truncate max-w-[130px]">{req.pickupLocation}</span>
                                    <div className="flex items-center shrink-0">
                                        <div className="w-3 h-px bg-slate-200" />
                                        <ArrowRight size={13} className="text-[#f39c12]" />
                                        <div className="w-3 h-px bg-slate-200" />
                                    </div>
                                    <span className="text-sm font-black text-[#0e2a63] truncate max-w-[130px]">{req.dropLocation}</span>
                                    <span className="hidden sm:inline ml-2 px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 text-[9px] font-black tracking-widest rounded-lg shrink-0">
                                        {req.requestId}
                                    </span>
                                </div>

                                {/* Status + Actions */}
                                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border whitespace-nowrap ${getStatusColor(req.status)}`}>
                                        <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1 ${req.status === "pending" ? "bg-orange-400" : "bg-emerald-400"}`} />
                                        {req.status}
                                    </span>
                                    {req.priority && (
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border whitespace-nowrap ${req.priority === "Urgent" || req.priority === "Emergency"
                                            ? "bg-red-50 text-red-500 border-red-100"
                                            : "bg-blue-50 text-[#0e2a63] border-blue-100"
                                            }`}>{req.priority}</span>
                                    )}

                                    {req.status === "pending" && (
                                        assigningId === req._id ? (
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex flex-col gap-1">
                                                    <select className="w-32 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-[10px] font-bold outline-none" value={selection.vehicleId} onChange={(e) => setSelection({ ...selection, vehicleId: e.target.value })}>
                                                        <option value="">Vehicle...</option>
                                                        {availableVehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber}</option>)}
                                                    </select>
                                                    <select className="w-32 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-[10px] font-bold outline-none" value={selection.driverId} onChange={(e) => setSelection({ ...selection, driverId: e.target.value })}>
                                                        <option value="">Driver...</option>
                                                        {availableDrivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                                    </select>
                                                    <input type="number" placeholder="Start ODO" className="w-32 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-[10px] font-bold outline-none" value={selection.startOdometer} onChange={(e) => setSelection({ ...selection, startOdometer: e.target.value })} />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <button onClick={() => setEditingRequest(req)} className="p-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-[#0e2a63] transition-colors"><Edit2 size={12} /></button>
                                                    <button onClick={handleConfirmApproval} className="p-1.5 bg-[#0e2a63] text-white rounded-lg"><CheckCircle size={12} /></button>
                                                    <button onClick={() => setAssigningId(null)} className="p-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg"><XCircle size={12} /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setEditingRequest(req)} className="p-1.5 text-slate-300 hover:text-[#0e2a63] rounded-lg hover:bg-slate-50 transition-all"><Edit2 size={13} /></button>
                                                <button onClick={() => handleAction(req._id, "approved")} className="px-3 py-1.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-600 transition-all shadow-sm flex items-center gap-1 whitespace-nowrap">
                                                    <CheckCircle size={11} /> Assign
                                                </button>
                                                <button onClick={() => handleAction(req._id, "rejected")} className="px-3 py-1.5 bg-white border border-red-100 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-red-50 transition-all flex items-center gap-1 whitespace-nowrap">
                                                    <XCircle size={11} /> Reject
                                                </button>
                                            </div>
                                        )
                                    )}

                                    {req.status === "approved" && (
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setEditingRequest(req)} className="p-1.5 text-slate-300 hover:text-[#0e2a63] rounded-lg hover:bg-slate-50 transition-all"><Edit2 size={13} /></button>
                                            <button onClick={() => handleMarkBack(req.requestId)} className="px-3 py-1.5 bg-[#0e2a63] text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-600 transition-all shadow-sm flex items-center gap-1 whitespace-nowrap">
                                                <CheckCircle size={11} /> Mark Done
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* BOTTOM ROW: Meta chips */}
                            <div className="border-t border-dashed border-slate-100 pt-2.5 flex items-center gap-2 flex-wrap">
                                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                                    <Clock size={10} className="text-slate-300" />
                                    {req.bookingDateTime
                                        ? new Date(req.bookingDateTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                                        : "Immediate"}
                                </span>
                                {req.requesterName && (
                                    <span className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100 whitespace-nowrap">
                                        👤 {req.requesterName} · {req.department}
                                    </span>
                                )}
                                {req.purpose && (
                                    <span className="px-2.5 py-1 bg-[#0e2a63]/5 text-[#0e2a63] text-[10px] font-bold rounded-lg border border-[#0e2a63]/10 whitespace-nowrap">
                                        {req.purpose}
                                    </span>
                                )}
                                {req.vehicleType && (
                                    <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-100 whitespace-nowrap">
                                        🚗 {req.vehicleType} · {req.tripType}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="py-24 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm border-dashed">
                        <ClipboardList size={40} className="mx-auto text-slate-200 mb-3" />
                        <h3 className="text-base font-bold text-slate-400 uppercase tracking-widest">No Requests Found</h3>
                        <p className="text-slate-300 text-xs mt-1">Incoming requirements will appear here in list format.</p>
                    </div>
                )}
            </div>

            {/* Completion Modal */}
            {completingId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0e2a63]/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setCompletingId(null)} />
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300 border border-white/20 p-8">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
                        <div className="text-center space-y-4">
                            <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#0e2a63]">Complete Trip</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Request: {completingId}</p>
                            </div>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ending Odometer Reading</label>
                                    <input
                                        type="number" className="input-field py-3.5" placeholder="Enter Current ODO"
                                        value={endOdometer} onChange={(e) => setEndOdometer(e.target.value)} autoFocus
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setCompletingId(null)} className="flex-1 py-3.5 bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-100 transition-all">
                                        Cancel
                                    </button>
                                    <button onClick={handleConfirmCompletion} className="flex-1 py-3.5 bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95">
                                        Confirm Arrival
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingRequest && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0e2a63]/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setEditingRequest(null)} />
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300 border border-white/20">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0e2a63]" />
                        <form onSubmit={handleSaveEdit} className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-[#0e2a63]">Edit Request</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{editingRequest.requestId}</p>
                                </div>
                                <button type="button" onClick={() => setEditingRequest(null)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                                    <XCircle size={20} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Requester Name</label>
                                    <input required className="input-field py-3" value={editingRequest.requesterName} onChange={e => setEditingRequest({ ...editingRequest, requesterName: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Department</label>
                                    <input required className="input-field py-3" value={editingRequest.department} onChange={e => setEditingRequest({ ...editingRequest, department: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Plant</label>
                                    <select className="input-field py-3" value={editingRequest.plant} onChange={e => setEditingRequest({ ...editingRequest, plant: e.target.value })}>
                                        {["Seamless", "Forging", "Main Plant (SMS)", "Bright Bar", "Flat Bar", "Wire Plant", "Main Plant 2 ( SMS 2 )", "40\"Inch Mill"].map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Number</label>
                                    <input required className="input-field py-3" value={editingRequest.contactNumber} onChange={e => setEditingRequest({ ...editingRequest, contactNumber: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pickup Location</label>
                                    <input required className="input-field py-3" value={editingRequest.pickupLocation} onChange={e => setEditingRequest({ ...editingRequest, pickupLocation: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Drop Location</label>
                                    <input required className="input-field py-3" value={editingRequest.dropLocation} onChange={e => setEditingRequest({ ...editingRequest, dropLocation: e.target.value })} />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Purpose of Visit</label>
                                    <textarea required className="input-field py-3 min-h-[80px]" value={editingRequest.purpose} onChange={e => setEditingRequest({ ...editingRequest, purpose: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setEditingRequest(null)} className="flex-1 py-4 bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-100 transition-all">
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
        </div>
    );
}
