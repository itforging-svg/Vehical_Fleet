import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Plus, Search, FileText, Calendar, DollarSign, PenTool, X, Edit2, Trash2 } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

interface MaintenanceProps {
    plant?: string;
}

export default function Maintenance({ plant }: MaintenanceProps) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // Queries
    const records = useQuery(api.maintenance.list, { plant }) || [];
    const stats = useQuery(api.maintenance.getStats, { plant });
    const vehiclesData = useQuery(api.vehicles.list, { plant }) || [];

    // Mutations
    const createRecord = useMutation(api.maintenance.create);
    const updateRecord = useMutation(api.maintenance.update);
    const deleteRecord = useMutation(api.maintenance.remove);

    const activeVehicles = vehiclesData.filter((v: any) => v.status !== "Decommissioned");

    // Form state
    const [formData, setFormData] = useState({
        vehicleId: "",
        type: "Scheduled",
        status: "Scheduled",
        serviceDate: new Date().toISOString().split("T")[0],
        completionDate: "",
        odometer: "",
        description: "",
        vendorName: "",
        billNumber: "",
        cost: "",
    });

    const resetForm = () => {
        setFormData({
            vehicleId: "",
            type: "Scheduled",
            status: "Scheduled",
            serviceDate: new Date().toISOString().split("T")[0],
            completionDate: "",
            odometer: "",
            description: "",
            vendorName: "",
            billNumber: "",
            cost: "",
        });
        setEditingRecord(null);
        setShowAddModal(false);
    };

    const handleEdit = (record: any) => {
        setFormData({
            vehicleId: record.vehicleId,
            type: record.type,
            status: record.status,
            serviceDate: new Date(record.serviceDate).toISOString().split("T")[0],
            completionDate: record.completionDate ? new Date(record.completionDate).toISOString().split("T")[0] : "",
            odometer: record.odometer.toString(),
            description: record.description,
            vendorName: record.vendorName || "",
            billNumber: record.billNumber || "",
            cost: record.cost.toString(),
        });
        setEditingRecord(record);
        setShowAddModal(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteRecord({ id: id as Id<"maintenanceRecords"> });
            setConfirmDeleteId(null);
        } catch (error) {
            alert("Failed to delete record.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const vehicle = activeVehicles.find((v: any) => v._id === formData.vehicleId);
        if (!vehicle) return alert("Select a valid vehicle");

        try {
            const payload = {
                vehicleId: vehicle._id,
                registrationNumber: vehicle.registrationNumber,
                plant: vehicle.locationPlant || "Unknown",
                type: formData.type,
                status: formData.status,
                serviceDate: new Date(formData.serviceDate).getTime(),
                completionDate: formData.completionDate ? new Date(formData.completionDate).getTime() : undefined,
                odometer: Number(formData.odometer),
                description: formData.description,
                vendorName: formData.vendorName || undefined,
                billNumber: formData.billNumber || undefined,
                cost: Number(formData.cost),
            };

            if (editingRecord) {
                await updateRecord({
                    id: editingRecord._id,
                    ...payload,
                });
            } else {
                // Get the admin name (usually stored in local storage or context, assuming "Admin" as fallback)
                let addedBy = "Admin";
                const userObj = localStorage.getItem("user");
                if (userObj) {
                    try {
                        addedBy = JSON.parse(userObj).name || "Admin";
                    } catch (e) { }
                }

                await createRecord({
                    ...payload,
                    addedBy,
                });
            }
            resetForm();
        } catch (error) {
            alert("Error saving record: " + (error as Error).message);
        }
    };

    const filteredRecords = records.filter((r: any) =>
        r.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.vendorName && r.vendorName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-4">
                    <div className="page-header-icon">
                        <PenTool className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="page-title">Maintenance</h1>
                        <p className="page-subtitle">Track and manage vehicle repairs and services</p>
                    </div>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn-primary">
                    <Plus size={20} />
                    <span>Log Maintenance</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="stat-card">
                    <div className="flex justify-between items-start mb-4">
                        <div className="stat-card-icon bg-blue-50 text-blue-600">
                            <FileText size={24} />
                        </div>
                    </div>
                    <div>
                        <div className="stat-value">{stats?.totalMaintenanceEvents || 0}</div>
                        <div className="stat-label">Total Logs</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex justify-between items-start mb-4">
                        <div className="stat-card-icon bg-orange-50 text-orange-600">
                            <Calendar size={24} />
                        </div>
                    </div>
                    <div>
                        <div className="stat-value">{stats?.scheduledUpcoming || 0}</div>
                        <div className="stat-label">Upcoming Scheduled</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex justify-between items-start mb-4">
                        <div className="stat-card-icon bg-yellow-50 text-yellow-600">
                            <PenTool size={24} />
                        </div>
                    </div>
                    <div>
                        <div className="stat-value">{stats?.inProgressCount || 0}</div>
                        <div className="stat-label">In Progress</div>
                    </div>
                </div>
                <div className="stat-card relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="stat-card-icon bg-emerald-50 text-emerald-600">
                            <DollarSign size={24} />
                        </div>
                        <span className="badge badge-emerald">This Month</span>
                    </div>
                    <div className="relative z-10">
                        <div className="stat-value text-emerald-600">₹{(stats?.currentMonthCost || 0).toLocaleString()}</div>
                        <div className="stat-label">Monthly Cost</div>
                    </div>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                <div className="relative w-full sm:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f39c12] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search vehicle, part, or vendor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#f39c12]/20 font-medium text-slate-700 transition-all placeholder:font-normal"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Vehicle</th>
                                <th>Description</th>
                                <th>Type & Status</th>
                                <th>Vendor</th>
                                <th>Cost</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map((record: any) => (
                                <tr key={record._id}>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-[#0e2a63]">
                                            {new Date(record.serviceDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-[#0e2a63]">{record.registrationNumber}</div>
                                        <div className="text-xs font-bold text-slate-400 tracking-wider uppercase mt-0.5">{record.plant}</div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate" title={record.description}>
                                        <span className="text-sm text-slate-600 font-medium">{record.description}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5 items-start">
                                            <span className={`badge ${record.type === 'Scheduled' ? 'badge-blue' : 'badge-orange'}`}>
                                                {record.type}
                                            </span>
                                            <span className={`badge ${record.status === 'Completed' ? 'badge-emerald' :
                                                record.status === 'In Progress' ? 'badge-yellow' :
                                                    'badge-slate'
                                                }`}>
                                                {record.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-slate-700">{record.vendorName || "-"}</div>
                                        {record.billNumber && (
                                            <div className="text-xs text-slate-400 mt-0.5">Bill: {record.billNumber}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-black tracking-tight text-[#0e2a63]">
                                        ₹{record.cost.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            {confirmDeleteId === record._id ? (
                                                <>
                                                    <span className="text-[10px] text-red-500 font-black uppercase">Delete?</span>
                                                    <button
                                                        onClick={() => handleDelete(record._id)}
                                                        className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-black rounded-lg hover:bg-red-600 transition-colors"
                                                    >Yes</button>
                                                    <button
                                                        onClick={() => setConfirmDeleteId(null)}
                                                        className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg hover:bg-slate-200 transition-colors"
                                                    >No</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(record)}
                                                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-[#0e2a63] transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDeleteId(record._id)}
                                                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-red-600 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRecords.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 bg-slate-50/50">
                                        No maintenance records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-[#0e2a63] tracking-tight">
                                    {editingRecord ? "Edit Record" : "Log Maintenance"}
                                </h2>
                                <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                    Service & Repair Details
                                </p>
                            </div>
                            <button
                                onClick={resetForm}
                                className="p-3 hover:bg-slate-200/50 rounded-2xl transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 md:p-8 overflow-y-auto">
                            <form id="maintenanceForm" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle *</label>
                                        <select
                                            required
                                            value={formData.vehicleId}
                                            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                            className="input-field"
                                            disabled={!!editingRecord}
                                        >
                                            <option value="">Select Vehicle</option>
                                            {activeVehicles.map((v: any) => (
                                                <option key={v._id} value={v._id}>
                                                    {v.registrationNumber} ({v.type})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Maintenance Type *</label>
                                        <select
                                            required
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="input-field"
                                        >
                                            <option value="Scheduled">Scheduled (Routine Service)</option>
                                            <option value="Unscheduled">Unscheduled (Breakdown/Crash)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status *</label>
                                        <select
                                            required
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="input-field"
                                        >
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Odometer Reading *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.odometer}
                                            onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                                            className="input-field"
                                            placeholder="e.g. 45000"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Date *</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.serviceDate}
                                            onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completion Date</label>
                                        <input
                                            type="date"
                                            value={formData.completionDate}
                                            onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description / Work Done *</label>
                                        <textarea
                                            required
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="input-field resize-none h-24"
                                            placeholder="Describe the maintenance performed..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Vendor / Garage</label>
                                        <input
                                            type="text"
                                            value={formData.vendorName}
                                            onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                                            className="input-field"
                                            placeholder="e.g. Authorized Dealer"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bill / Invoice No.</label>
                                        <input
                                            type="text"
                                            value={formData.billNumber}
                                            onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
                                            className="input-field"
                                            placeholder="e.g. INV-2024-001"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Cost (₹) *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.cost}
                                            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                            className="input-field font-black text-emerald-600 bg-emerald-50/50 mb-6"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="btn-ghost"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="maintenanceForm"
                                className="btn-primary min-w-[140px] justify-center"
                            >
                                {editingRecord ? "Save Changes" : "Save Record"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
