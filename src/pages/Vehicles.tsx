import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Plus, Search, Filter, Truck, X, Save, Trash2, Edit2, ShieldCheck, FileText, Landmark, ClipboardList } from "lucide-react";

export default function Vehicles({ plant }: { plant?: string }) {
    const vehicles = useQuery(api.vehicles.list, { plant }) || [];
    const createVehicle = useMutation(api.vehicles.create);
    const updateVehicle = useMutation(api.vehicles.update);
    const removeVehicle = useMutation(api.vehicles.remove);
    const syncExpiries = useMutation(api.notifications.syncExpiries);

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState("identification");

    const [formData, setFormData] = useState({
        registrationNumber: "",
        chassisNumber: "",
        engineNumber: "",
        type: "Truck",
        category: "Logistics",
        make: "",
        model: "",
        variant: "",
        manufacturingYear: "",
        fuelType: "Diesel",
        transmission: "Manual",
        rcExpiryDate: "",
        insuranceProvider: "",
        insurancePolicyNumber: "",
        insuranceExpiryDate: "",
        pucExpiryDate: "",
        fitnessExpiryDate: "",
        permitType: "State",
        permitExpiryDate: "",
        ownershipType: "Company-owned",
        assignedDepartment: "",
        assignedDriver: "",
        locationPlant: "",
        vendorName: "",
        status: "Active",
        addedBy: "cslsuperadmin",
        remarks: ""
    });

    const filteredVehicles = vehicles.filter(v =>
        v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.make && v.make.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleOpenModal = (vehicle?: any) => {
        if (vehicle) {
            setEditingId(vehicle._id);
            setFormData({
                registrationNumber: vehicle.registrationNumber || "",
                chassisNumber: vehicle.chassisNumber || "",
                engineNumber: vehicle.engineNumber || "",
                type: vehicle.type || "Truck",
                category: vehicle.category || "Logistics",
                make: vehicle.make || "",
                model: vehicle.model || "",
                variant: vehicle.variant || "",
                manufacturingYear: vehicle.manufacturingYear || "",
                fuelType: vehicle.fuelType || "Diesel",
                transmission: vehicle.transmission || "Manual",
                rcExpiryDate: vehicle.rcExpiryDate || "",
                insuranceProvider: vehicle.insuranceProvider || "",
                insurancePolicyNumber: vehicle.insurancePolicyNumber || "",
                insuranceExpiryDate: vehicle.insuranceExpiryDate || "",
                pucExpiryDate: vehicle.pucExpiryDate || "",
                fitnessExpiryDate: vehicle.fitnessExpiryDate || "",
                permitType: vehicle.permitType || "State",
                permitExpiryDate: vehicle.permitExpiryDate || "",
                ownershipType: vehicle.ownershipType || "Company-owned",
                assignedDepartment: vehicle.assignedDepartment || "",
                assignedDriver: vehicle.assignedDriver || "",
                locationPlant: vehicle.locationPlant || "",
                vendorName: vehicle.vendorName || "",
                status: vehicle.status || "Active",
                addedBy: vehicle.addedBy || "cslsuperadmin",
                remarks: vehicle.remarks || ""
            });
        } else {
            setEditingId(null);
            setFormData({
                registrationNumber: "", chassisNumber: "", engineNumber: "",
                type: "Truck", category: "Logistics", make: "", model: "",
                variant: "", manufacturingYear: "", fuelType: "Diesel",
                transmission: "Manual", rcExpiryDate: "", insuranceProvider: "",
                insurancePolicyNumber: "", insuranceExpiryDate: "", pucExpiryDate: "",
                fitnessExpiryDate: "", permitType: "State", permitExpiryDate: "",
                ownershipType: "Company-owned", assignedDepartment: "",
                assignedDriver: "", locationPlant: "", vendorName: "",
                status: "Active", addedBy: "cslsuperadmin", remarks: ""
            });
        }
        setActiveSection("identification");
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingId) {
                await updateVehicle({ id: editingId as any, ...formData });
            } else {
                await createVehicle(formData);
            }
            // Trigger expiry sync
            await syncExpiries();
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message || "Failed to save vehicle.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, regNo: string) => {
        if (window.confirm(`Are you sure you want to delete vehicle ${regNo}?`)) {
            try {
                await removeVehicle({ id: id as any });
            } catch (error) {
                alert("Failed to delete vehicle.");
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f39c12] transition-colors" size={18} />
                    <input
                        className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#f39c12]/20 focus:border-[#f39c12] transition-all shadow-sm"
                        placeholder="Search by registration, model or make..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-[#0e2a63] hover:bg-slate-50 transition-all shadow-sm">
                        <Filter size={16} />
                        Filter
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-6 py-3.5 bg-[#f39c12] rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-[#e67e22] transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                    >
                        <Plus size={18} />
                        Add Vehicle
                    </button>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50 bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vehicle Information</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Make/Model</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Type/Cat</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ownership/Plant</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredVehicles.length > 0 ? filteredVehicles.map((vehicle) => (
                                <tr key={vehicle._id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                                <Truck size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-[#0e2a63] uppercase tracking-wide">{vehicle.registrationNumber}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{vehicle.chassisNumber || "NO VIN"}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-600">{vehicle.make || "Unknown"}</span>
                                            <span className="text-xs text-slate-400">{vehicle.model}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-600">{vehicle.type}</span>
                                            <span className="text-[10px] text-[#f39c12] font-bold uppercase tracking-widest">{vehicle.category}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-slate-500">{vehicle.ownershipType}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{vehicle.locationPlant || "Main Plant"}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${vehicle.status === "Active"
                                            ? "bg-emerald-50 text-emerald-600"
                                            : vehicle.status === "In Maintenance"
                                                ? "bg-orange-50 text-orange-600"
                                                : "bg-red-50 text-red-600"
                                            }`}>
                                            {vehicle.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(vehicle)}
                                                className="h-8 w-8 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(vehicle._id, vehicle.registrationNumber)}
                                                className="h-8 w-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all font-bold"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                <Search size={32} />
                                            </div>
                                            <p className="text-slate-400 text-sm font-medium italic">No vehicles found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0e2a63]/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300 border border-white/20 flex flex-col max-h-[90vh]">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#f39c12]"></div>

                        <div className="p-8 md:p-10 flex-1 overflow-y-auto">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-[#0e2a63] rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                                        <Truck size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#0e2a63]">{editingId ? "Edit Vehicle" : "Register New Vehicle"}</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Comprehensive Fleet Entry</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-8 bg-slate-50 p-1.5 rounded-2xl w-fit">
                                {[
                                    { id: "identification", label: "Identification", icon: ShieldCheck },
                                    { id: "compliance", label: "Legal", icon: FileText },
                                    { id: "ownership", label: "Fleet", icon: Landmark },
                                    { id: "metadata", label: "Extra", icon: ClipboardList }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveSection(tab.id)}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === tab.id ? "bg-[#0e2a63] text-white shadow-lg" : "text-slate-400 hover:text-[#0e2a63]"
                                            }`}
                                    >
                                        <tab.icon size={14} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {activeSection === "identification" && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Registration #</label>
                                            <input required className="input-field py-3.5 uppercase" value={formData.registrationNumber} onChange={e => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Chassis #</label>
                                            <input className="input-field py-3.5 uppercase" value={formData.chassisNumber} onChange={e => setFormData({ ...formData, chassisNumber: e.target.value.toUpperCase() })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Engine #</label>
                                            <input className="input-field py-3.5 uppercase" value={formData.engineNumber} onChange={e => setFormData({ ...formData, engineNumber: e.target.value.toUpperCase() })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type</label>
                                            <select className="input-field py-3.5" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                                {["Car", "Truck", "Bus", "2W", "JCB", "Hydra", "Dumper", "Tractor"].map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                                            <select className="input-field py-3.5" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                                {["Pool", "Assigned", "Logistics", "Executive"].map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Make</label>
                                            <input className="input-field py-3.5" value={formData.make} onChange={e => setFormData({ ...formData, make: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Model</label>
                                            <input required className="input-field py-3.5" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Variant</label>
                                            <input className="input-field py-3.5" value={formData.variant} onChange={e => setFormData({ ...formData, variant: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">MFG Year</label>
                                            <input className="input-field py-3.5" type="number" value={formData.manufacturingYear} onChange={e => setFormData({ ...formData, manufacturingYear: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Fuel Type</label>
                                            <select className="input-field py-3.5" value={formData.fuelType} onChange={e => setFormData({ ...formData, fuelType: e.target.value })}>
                                                {["Diesel", "Petrol", "EV", "CNG"].map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Transmission</label>
                                            <select className="input-field py-3.5" value={formData.transmission} onChange={e => setFormData({ ...formData, transmission: e.target.value })}>
                                                {["Manual", "Automatic"].map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {activeSection === "compliance" && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">RC Expiry</label>
                                            <input className="input-field py-3.5" type="date" value={formData.rcExpiryDate} onChange={e => setFormData({ ...formData, rcExpiryDate: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Provider</label>
                                            <input className="input-field py-3.5" value={formData.insuranceProvider} onChange={e => setFormData({ ...formData, insuranceProvider: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Policy #</label>
                                            <input className="input-field py-3.5" value={formData.insurancePolicyNumber} onChange={e => setFormData({ ...formData, insurancePolicyNumber: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ins Expiry</label>
                                            <input className="input-field py-3.5" type="date" value={formData.insuranceExpiryDate} onChange={e => setFormData({ ...formData, insuranceExpiryDate: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">PUC Expiry</label>
                                            <input className="input-field py-3.5" type="date" value={formData.pucExpiryDate} onChange={e => setFormData({ ...formData, pucExpiryDate: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Fitness Expiry</label>
                                            <input className="input-field py-3.5" type="date" value={formData.fitnessExpiryDate} onChange={e => setFormData({ ...formData, fitnessExpiryDate: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Permit</label>
                                            <select className="input-field py-3.5" value={formData.permitType} onChange={e => setFormData({ ...formData, permitType: e.target.value })}>
                                                {["National", "State", "Local"].map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Permit Expiry</label>
                                            <input className="input-field py-3.5" type="date" value={formData.permitExpiryDate} onChange={e => setFormData({ ...formData, permitExpiryDate: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                {activeSection === "ownership" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type</label>
                                            <select className="input-field py-3.5" value={formData.ownershipType} onChange={e => setFormData({ ...formData, ownershipType: e.target.value })}>
                                                {["Company-owned", "Leased", "Vendor"].map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Plant</label>
                                            <select className="input-field py-3.5" value={formData.locationPlant} onChange={e => setFormData({ ...formData, locationPlant: e.target.value })}>
                                                {["Seamsless", "Forging", "Main Plant (SMS)", "Bright Bar", "Flat Bar", "Wire Plant", "Main Plant 2 ( SMS 2 )", "40\"Inch Mill"].map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dept</label>
                                            <input className="input-field py-3.5" value={formData.assignedDepartment} onChange={e => setFormData({ ...formData, assignedDepartment: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Driver</label>
                                            <input className="input-field py-3.5" value={formData.assignedDriver} onChange={e => setFormData({ ...formData, assignedDriver: e.target.value })} />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Vendor Name</label>
                                            <input className="input-field py-3.5" value={formData.vendorName} onChange={e => setFormData({ ...formData, vendorName: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                {activeSection === "metadata" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Status</label>
                                            <select className="input-field py-3.5" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                                {["Active", "In Maintenance", "Decommissioned"].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Remarks</label>
                                            <textarea className="input-field py-4 min-h-[120px] resize-none" value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 bg-slate-50 text-slate-400 font-bold rounded-xl uppercase tracking-widest text-[10px]">Cancel</button>
                                    <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-[#0e2a63] text-white font-bold rounded-xl shadow-lg hover:bg-[#1a3b7c] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] disabled:opacity-50">
                                        {isSubmitting ? "Saving..." : <><Save size={16} /> {editingId ? "Update Asset" : "Register Asset"}</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
