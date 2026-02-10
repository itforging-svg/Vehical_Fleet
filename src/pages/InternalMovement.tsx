import { useState } from "react";
import { Navigation, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import PageWrapper from "../components/PageWrapper";

interface InternalMovementProps {
    onBack: () => void;
}

export default function InternalMovement({ onBack }: InternalMovementProps) {
    const vehicles = useQuery(api.vehicles.list) || [];
    const drivers = useQuery(api.drivers.list) || [];
    const createTrip = useMutation(api.trips.assignVehicle);
    const createRequest = useMutation(api.trips.createRequest);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        vehicleId: "",
        driverId: "",
        startLocation: "",
        endLocation: "",
        purpose: "Internal Transfer",
        notes: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const tripId = await createRequest({
                requesterName: "Internal System",
                requesterDepartment: "Logistics",
                purpose: formData.purpose,
                startLocation: formData.startLocation,
                endLocation: formData.endLocation,
                startTime: Date.now(),
                status: "In Progress",
                notes: formData.notes
            });

            await createTrip({
                id: tripId,
                vehicleId: formData.vehicleId as any,
                driverId: formData.driverId as any,
                status: "In Progress"
            });

            setSuccess(true);
            setTimeout(() => onBack(), 2000);
        } catch (err) {
            alert("Failed to log movement.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <PageWrapper showAdminButton={false}>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4 animate-in zoom-in duration-300 bg-white/50 backdrop-blur-md p-12 rounded-[2.5rem] border border-white shadow-xl">
                        <div className="h-20 w-20 bg-[#f39c12]/20 text-[#f39c12] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-3xl font-bold text-[#0e2a63]">Movement Logged</h2>
                        <p className="text-slate-500">Vehicle movement has been recorded in the system.</p>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper showAdminButton={false}>
            <div className="max-w-3xl w-full space-y-8 py-8 h-full flex flex-col">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#0e2a63] transition-all font-bold uppercase tracking-wider text-xs"
                >
                    <ArrowLeft size={16} />
                    Back to Selection
                </button>

                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-[#0e2a63] flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <Navigation size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#0e2a63]">Internal Movement</h1>
                        <p className="text-slate-500 font-medium">Log intra-plant transfers and utility movements.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_70px_-15px_rgba(14,42,99,0.1)] border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-[#f39c12]"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0e2a63]/70">Vehicle Selection</label>
                            <select
                                required
                                className="input-field py-3.5"
                                value={formData.vehicleId}
                                onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
                            >
                                <option value="">Select Vehicle</option>
                                {vehicles.map(v => (
                                    <option key={v._id} value={v._id}>{v.registrationNumber}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0e2a63]/70">Driver Selection</label>
                            <select
                                required
                                className="input-field py-3.5"
                                value={formData.driverId}
                                onChange={e => setFormData({ ...formData, driverId: e.target.value })}
                            >
                                <option value="">Select Driver</option>
                                {drivers.map(d => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0e2a63]/70">From</label>
                            <input
                                required
                                className="input-field py-3.5"
                                placeholder="Starting Location"
                                value={formData.startLocation}
                                onChange={e => setFormData({ ...formData, startLocation: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0e2a63]/70">To</label>
                            <input
                                required
                                className="input-field py-3.5"
                                placeholder="Destination Location"
                                value={formData.endLocation}
                                onChange={e => setFormData({ ...formData, endLocation: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0e2a63]/70">Notes</label>
                            <textarea
                                rows={3}
                                className="input-field py-3.5 resize-none"
                                placeholder="Additional details..."
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full py-4 rounded-xl text-lg shadow-orange-500/10"
                    >
                        {isSubmitting ? "LOGGING..." : "LOG MOVEMENT"}
                    </button>
                </form>
            </div>
        </PageWrapper>
    );
}
    );
}
