import { useState } from "react";
import { ArrowLeft, Send, CheckCircle2, User, Phone, MapPin, Navigation, Car, ShieldAlert, BadgeInfo } from "lucide-react";
import PageWrapper from "../components/PageWrapper";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";

export default function RequestVehicle() {
    const navigate = useNavigate();
    const createRequest = useMutation(api.requests.createRequest);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedId, setSubmittedId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        requesterName: "",
        employeeId: "",
        department: "",
        plant: "Forging",
        contactNumber: "",
        purpose: "Official",
        priority: "Normal",
        pickupLocation: "",
        dropLocation: "",
        tripType: "One-way",
        vehicleType: "Car",
        bookingDateTime: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.contactNumber.length !== 10) {
            alert("Please enter a valid 10-digit contact number.");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createRequest(formData);
            setSubmittedId(result.requestId);
        } catch (error) {
            alert("Failed to submit request. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submittedId) {
        return (
            <PageWrapper showAdminButton={false}>
                <div className="max-w-xl w-full mx-auto py-12 px-6">
                    <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-2xl text-center space-y-8 animate-in zoom-in duration-500 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>

                        <div className="h-24 w-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <CheckCircle2 size={48} />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-[#0e2a63] tracking-tight uppercase italic">Request Submitted</h2>
                            <p className="text-slate-500 font-medium">Your vehicle request has been successfully registered.</p>
                        </div>

                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Your Unique Request ID</p>
                            <p className="text-4xl font-black text-[#0e2a63] tracking-tighter">{submittedId}</p>
                        </div>

                        <button
                            onClick={() => navigate("/")}
                            className="w-full py-4 bg-[#0e2a63] text-white font-bold rounded-2xl shadow-lg hover:shadow-blue-900/20 transition-all uppercase tracking-widest text-xs"
                        >
                            Back to Selection
                        </button>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper showAdminButton={false}>
            <div className="max-w-4xl w-full mx-auto py-12 px-6">
                <button
                    onClick={() => navigate("/")}
                    className="mb-8 flex items-center gap-2 text-slate-400 hover:text-[#0e2a63] font-bold text-xs uppercase tracking-widest transition-colors group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Selection
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-[#f39c12]"></div>

                    <div className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-[#0e2a63] uppercase tracking-tight italic">Vehicle Request Form</h2>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <BadgeInfo size={12} />
                                    Digital Logistics Portal
                                </p>
                            </div>
                            <div className="h-14 w-px bg-slate-100 hidden md:block"></div>
                            <div className="flex flex-col md:items-end">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Service Status</span>
                                <span className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest mt-1">
                                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    Operational
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-12">
                            {/* Requester Details */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                    <User size={18} className="text-[#f39c12]" />
                                    <h3 className="text-xs font-black text-[#0e2a63] uppercase tracking-widest">Requester Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                        <input required className="input-field" placeholder="Enter Full Name" value={formData.requesterName} onChange={e => setFormData({ ...formData, requesterName: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Employee ID</label>
                                        <input required className="input-field" placeholder="Enter Emp ID" value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Department</label>
                                        <input required className="input-field" placeholder="Enter Department" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Plant</label>
                                        <select className="input-field" value={formData.plant} onChange={e => setFormData({ ...formData, plant: e.target.value })}>
                                            {["Seamsless", "Forging", "Main Plant (SMS)", "Bright Bar", "Flat Bar", "Wire Plant", "Main Plant 2 ( SMS 2 )", "40\"Inch Mill"].map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Number</label>
                                        <div className="relative">
                                            <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                required
                                                type="tel"
                                                className="input-field pl-12"
                                                placeholder="10-Digit Contact #"
                                                value={formData.contactNumber}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    setFormData({ ...formData, contactNumber: val });
                                                }}
                                                pattern="[0-9]{10}"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Trip Details */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                    <MapPin size={18} className="text-[#f39c12]" />
                                    <h3 className="text-xs font-black text-[#0e2a63] uppercase tracking-widest">Trip & Logistics</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Purpose</label>
                                        <select className="input-field" value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })}>
                                            {["Official", "Personal", "Client Visit", "Logistics"].map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Priority</label>
                                        <select className="input-field" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                                            <option value="Normal">Normal</option>
                                            <option value="Urgent">Urgent</option>
                                            <option value="Emergency">Emergency</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Trip Type</label>
                                        <select className="input-field" value={formData.tripType} onChange={e => setFormData({ ...formData, tripType: e.target.value })}>
                                            <option value="One-way">One-way</option>
                                            <option value="Round trip">Round trip</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pickup Location</label>
                                        <div className="relative">
                                            <Navigation size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input required className="input-field pl-12" placeholder="Start Point" value={formData.pickupLocation} onChange={e => setFormData({ ...formData, pickupLocation: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Drop Location</label>
                                        <div className="relative">
                                            <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input required className="input-field pl-12" placeholder="Destination" value={formData.dropLocation} onChange={e => setFormData({ ...formData, dropLocation: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Required Vehicle Type</label>
                                        <div className="relative">
                                            <Car size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <select className="input-field pl-12" value={formData.vehicleType} onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}>
                                                {["Car", "Truck", "Bus", "2W", "JCB", "Hydra", "Dumper", "Tractor"].map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Advance Booking Schedule */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                    <BadgeInfo size={18} className="text-[#f39c12]" />
                                    <h3 className="text-xs font-black text-[#0e2a63] uppercase tracking-widest">Advance Booking Schedule (IST)</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Proposed Pickup Date & Time</label>
                                        <div className="relative">
                                            <BadgeInfo size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="datetime-local"
                                                className="input-field pl-12"
                                                value={formData.bookingDateTime}
                                                onChange={e => setFormData({ ...formData, bookingDateTime: e.target.value })}
                                            />
                                        </div>
                                        <p className="text-[9px] text-slate-400 italic ml-1">* Leave blank for immediate requirement</p>
                                    </div>
                                </div>
                            </section>

                            <div className="flex flex-col md:flex-row items-center gap-6 pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 w-full md:w-auto flex items-center justify-center gap-3 bg-[#0e2a63] text-white py-4 px-8 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-900/10 hover:bg-[#1a3b7c] transition-all disabled:opacity-50 active:scale-95"
                                >
                                    {isSubmitting ? "Processing..." : (
                                        <>
                                            Submit Request
                                            <Send size={16} />
                                        </>
                                    )}
                                </button>
                                <div className="flex items-center gap-3 text-slate-400 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 italic text-[10px] font-bold uppercase tracking-widest w-full md:w-auto">
                                    <ShieldAlert size={16} className="text-orange-400 animate-pulse" />
                                    Requests are subject to admin approval
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <footer className="mt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    Chandan Steel Ltd • Logistics Management System
                </footer>
            </div>
        </PageWrapper>
    );
}
