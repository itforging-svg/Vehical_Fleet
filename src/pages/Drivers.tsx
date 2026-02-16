import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Plus, Search, Filter, X, Save, Trash2, Edit2, ShieldCheck, FileText, ClipboardList, UserCheck, Droplets } from "lucide-react";

export default function Drivers() {
    const drivers = useQuery(api.drivers.list, {}) || [];
    const createDriver = useMutation(api.drivers.create);
    const updateDriver = useMutation(api.drivers.update);
    const removeDriver = useMutation(api.drivers.remove);

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState("identification");

    const [formData, setFormData] = useState({
        driverId: "",
        name: "",
        phoneNumber: "",
        dob: "",
        bloodGroup: "",
        photo: "",
        licenseNumber: "",
        licenseType: [] as string[],
        licenseIssueDate: "",
        licenseValidity: "",
        licenseIssuedBy: "",
        status: "Available",
        addedBy: "cslsuperadmin",
        addedDate: new Date().toISOString().split('T')[0]
    });

    const filteredDrivers = drivers.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.driverId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const generateDriverId = () => {
        const num = Math.floor(1000 + Math.random() * 9000);
        return `DRV-${num}`;
    };

    const handleOpenModal = (driver?: any) => {
        if (driver) {
            setEditingId(driver._id);
            setFormData({
                driverId: driver.driverId || "",
                name: driver.name || "",
                phoneNumber: driver.phoneNumber || "",
                dob: driver.dob || "",
                bloodGroup: driver.bloodGroup || "",
                photo: driver.photo || "",
                licenseNumber: driver.licenseNumber || "",
                licenseType: driver.licenseType || [],
                licenseIssueDate: driver.licenseIssueDate || "",
                licenseValidity: driver.licenseValidity || "",
                licenseIssuedBy: driver.licenseIssuedBy || "",
                status: driver.status || "Available",
                addedBy: driver.addedBy || "cslsuperadmin",
                addedDate: driver.addedDate || new Date().toISOString().split('T')[0]
            });
        } else {
            setEditingId(null);
            setFormData({
                driverId: generateDriverId(),
                name: "",
                phoneNumber: "",
                dob: "",
                bloodGroup: "",
                photo: "",
                licenseNumber: "",
                licenseType: [],
                licenseIssueDate: "",
                licenseValidity: "",
                licenseIssuedBy: "",
                status: "Available",
                addedBy: "cslsuperadmin",
                addedDate: new Date().toISOString().split('T')[0]
            });
        }
        setActiveSection("identification");
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.phoneNumber.length !== 10) {
            alert("Please enter a valid 10-digit mobile number.");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingId) {
                await updateDriver({ id: editingId as any, ...formData });
            } else {
                await createDriver(formData);
            }
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message || "Failed to save driver.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete driver ${name}?`)) {
            try {
                await removeDriver({ id: id as any });
            } catch (error) {
                alert("Failed to delete driver.");
            }
        }
    };

    const toggleLicenseType = (type: string) => {
        setFormData(prev => {
            const current = [...prev.licenseType];
            if (current.includes(type)) {
                return { ...prev, licenseType: current.filter(t => t !== type) };
            } else {
                return { ...prev, licenseType: [...current, type] };
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f39c12] transition-colors" size={18} />
                    <input
                        className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#f39c12]/20 focus:border-[#f39c12] transition-all shadow-sm"
                        placeholder="Search by name, ID or license..."
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
                        Add Driver
                    </button>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50 bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Driver Information</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Licensing</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contact/Safety</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredDrivers.length > 0 ? filteredDrivers.map((driver) => (
                                <tr key={driver._id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                                <UserCheck size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-[#0e2a63] uppercase tracking-wide">{driver.name}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{driver.driverId}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{driver.licenseNumber}</span>
                                            <div className="flex gap-1 mt-1">
                                                {driver.licenseType?.map((t: string) => (
                                                    <span key={t} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded uppercase">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-slate-500">{driver.phoneNumber}</span>
                                            <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                                <Droplets size={10} /> {driver.bloodGroup || "N/A"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${driver.status === "Available"
                                            ? "bg-emerald-50 text-emerald-600"
                                            : driver.status === "On Duty"
                                                ? "bg-blue-50 text-blue-600"
                                                : "bg-red-50 text-red-600"
                                            }`}>
                                            {driver.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(driver)}
                                                className="h-8 w-8 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all font-bold"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(driver._id, driver.name)}
                                                className="h-8 w-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                <Search size={32} />
                                            </div>
                                            <p className="text-slate-400 text-sm font-medium italic">No drivers found matching your criteria.</p>
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
                                        <UserCheck size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#0e2a63]">{editingId ? "Edit Driver" : "Register New Driver"}</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Personnel Compliance Profile</p>
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
                                    { id: "licensing", label: "Licensing", icon: FileText },
                                    { id: "system", label: "System", icon: ClipboardList }
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                            <input required className="input-field py-3.5" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mobile Number</label>
                                            <input
                                                required
                                                className="input-field py-3.5"
                                                placeholder="10-Digit Mobile #"
                                                value={formData.phoneNumber}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    setFormData({ ...formData, phoneNumber: val });
                                                }}
                                                pattern="[0-9]{10}"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date of Birth</label>
                                            <input className="input-field py-3.5" type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Blood Group</label>
                                            <select className="input-field py-3.5" value={formData.bloodGroup} onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}>
                                                <option value="">Select Group</option>
                                                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Avatar / Photo URL</label>
                                            <input className="input-field py-3.5" placeholder="e.g. Profile photo link" value={formData.photo} onChange={e => setFormData({ ...formData, photo: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                {activeSection === "licensing" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">License Type (Select Multiple)</label>
                                            <div className="flex gap-3">
                                                {["LMV", "HMV", "Transport"].map(type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => toggleLicenseType(type)}
                                                        className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-bold text-xs uppercase tracking-widest ${formData.licenseType.includes(type)
                                                            ? "bg-blue-50 border-blue-500 text-blue-600 shadow-sm"
                                                            : "border-slate-100 text-slate-400 hover:border-slate-200"
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">License Number</label>
                                            <input required className="input-field py-3.5 uppercase" value={formData.licenseNumber} onChange={e => setFormData({ ...formData, licenseNumber: e.target.value.toUpperCase() })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Issued By (Authority)</label>
                                            <input className="input-field py-3.5" placeholder="e.g. RTO Gujarat" value={formData.licenseIssuedBy} onChange={e => setFormData({ ...formData, licenseIssuedBy: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Issue Date</label>
                                            <input className="input-field py-3.5" type="date" value={formData.licenseIssueDate} onChange={e => setFormData({ ...formData, licenseIssueDate: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Validity Date</label>
                                            <input className="input-field py-3.5" type="date" value={formData.licenseValidity} onChange={e => setFormData({ ...formData, licenseValidity: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                {activeSection === "system" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Driver ID (Auto)</label>
                                            <input disabled className="input-field py-3.5 bg-slate-50 text-slate-500 font-bold" value={formData.driverId} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Operating Status</label>
                                            <select className="input-field py-3.5" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                                {["Available", "On Duty", "On Leave", "Inactive"].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">System Entry Date</label>
                                            <input disabled className="input-field py-3.5 bg-slate-50 text-slate-400" value={formData.addedDate} />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 bg-slate-50 text-slate-400 font-bold rounded-xl uppercase tracking-widest text-[10px]">Cancel</button>
                                    <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-[#0e2a63] text-white font-bold rounded-xl shadow-lg hover:bg-[#1a3b7c] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] disabled:opacity-50">
                                        {isSubmitting ? "Processing..." : <><Save size={16} /> {editingId ? "Update Profile" : "Create Profile"}</>}
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
