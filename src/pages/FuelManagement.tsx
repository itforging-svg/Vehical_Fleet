import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Plus, Edit2, Trash2, Fuel, DollarSign, TrendingUp, Calendar, Search, XCircle, Save } from "lucide-react";

interface FuelManagementProps {
    plant?: string;
}

export default function FuelManagement({ plant }: FuelManagementProps) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");

    // Queries
    const vehicles = useQuery(api.vehicles.list, { plant }) || [];
    const drivers = useQuery(api.drivers.list) || [];
    const fuelRecords = useQuery(api.fuelRecords.list, { plant }) || [];
    const stats = useQuery(api.fuelRecords.getStats, { plant }) || {
        totalCost: 0,
        totalLiters: 0,
        avgEfficiency: 0,
        refuelsCount: 0,
    };

    // Mutations
    const createRecord = useMutation(api.fuelRecords.create);
    const updateRecord = useMutation(api.fuelRecords.update);
    const deleteRecord = useMutation(api.fuelRecords.remove);

    // Filter records
    const filteredRecords = fuelRecords.filter(record => {
        const matchesVehicle = !selectedVehicle || record.vehicleId === selectedVehicle;
        const matchesSearch = !searchQuery ||
            record.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.driverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.location?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesVehicle && matchesSearch;
    });

    // Form state
    const [formData, setFormData] = useState({
        vehicleId: "",
        registrationNumber: "",
        driverId: "",
        driverName: "",
        fuelType: "Diesel",
        quantity: "",
        pricePerLiter: "",
        currentOdometer: "",
        location: "",
        vendorName: "",
        billNumber: "",
        remarks: "",
    });

    const resetForm = () => {
        setFormData({
            vehicleId: "",
            registrationNumber: "",
            driverId: "",
            driverName: "",
            fuelType: "Diesel",
            quantity: "",
            pricePerLiter: "",
            currentOdometer: "",
            location: "",
            vendorName: "",
            billNumber: "",
            remarks: "",
        });
        setShowAddModal(false);
        setEditingRecord(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.vehicleId || !formData.quantity || !formData.pricePerLiter || !formData.currentOdometer) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            if (editingRecord) {
                await updateRecord({
                    id: editingRecord._id,
                    fuelType: formData.fuelType,
                    quantity: Number(formData.quantity),
                    pricePerLiter: Number(formData.pricePerLiter),
                    currentOdometer: Number(formData.currentOdometer),
                    location: formData.location || undefined,
                    vendorName: formData.vendorName || undefined,
                    billNumber: formData.billNumber || undefined,
                    remarks: formData.remarks || undefined,
                });
                alert("Fuel record updated successfully!");
            } else {
                await createRecord({
                    vehicleId: formData.vehicleId as any,
                    registrationNumber: formData.registrationNumber,
                    driverId: formData.driverId ? (formData.driverId as any) : undefined,
                    driverName: formData.driverName || undefined,
                    fuelType: formData.fuelType,
                    quantity: Number(formData.quantity),
                    pricePerLiter: Number(formData.pricePerLiter),
                    currentOdometer: Number(formData.currentOdometer),
                    location: formData.location || undefined,
                    vendorName: formData.vendorName || undefined,
                    billNumber: formData.billNumber || undefined,
                    plant: plant || "General",
                    addedBy: "Admin",
                    remarks: formData.remarks || undefined,
                });
                alert("Fuel record added successfully!");
            }
            resetForm();
        } catch (error) {
            alert("Failed to save fuel record.");
        }
    };

    const handleEdit = (record: any) => {
        setEditingRecord(record);
        setFormData({
            vehicleId: record.vehicleId,
            registrationNumber: record.registrationNumber,
            driverId: record.driverId || "",
            driverName: record.driverName || "",
            fuelType: record.fuelType,
            quantity: record.quantity.toString(),
            pricePerLiter: record.pricePerLiter.toString(),
            currentOdometer: record.currentOdometer.toString(),
            location: record.location || "",
            vendorName: record.vendorName || "",
            billNumber: record.billNumber || "",
            remarks: record.remarks || "",
        });
        setShowAddModal(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this fuel record?")) {
            try {
                await deleteRecord({ id: id as any });
                alert("Fuel record deleted successfully!");
            } catch (error) {
                alert("Failed to delete fuel record.");
            }
        }
    };

    const handleVehicleSelect = (vehicleId: string) => {
        const vehicle = vehicles.find(v => v._id === vehicleId);
        if (vehicle) {
            setFormData({
                ...formData,
                vehicleId,
                registrationNumber: vehicle.registrationNumber,
            });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-[#0e2a63]">Fuel Management</h2>
                    <p className="text-sm text-slate-400 font-medium">Track fuel consumption and expenses across the fleet.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-[#0e2a63] text-white rounded-2xl shadow-xl shadow-blue-900/20 hover:bg-black transition-all flex items-center gap-2 font-black uppercase tracking-widest text-[10px]"
                >
                    <Plus size={16} />
                    Add Fuel Record
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Cost (Month)</p>
                            <p className="text-2xl font-black text-slate-700">₹{stats.totalCost.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <Fuel size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Liters</p>
                            <p className="text-2xl font-black text-slate-700">{stats.totalLiters.toFixed(2)}L</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center text-[#f39c12]">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Avg Efficiency</p>
                            <p className="text-2xl font-black text-slate-700">{stats.avgEfficiency.toFixed(2)} km/L</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Refuels (Month)</p>
                            <p className="text-2xl font-black text-slate-700">{stats.refuelsCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by vehicle, driver, location..."
                            className="pl-12 pr-4 py-3 w-full bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0e2a63]/10 transition-all outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <select
                        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0e2a63]/10 transition-all outline-none"
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                    >
                        <option value="">All Vehicles</option>
                        {vehicles.map(v => (
                            <option key={v._id} value={v._id}>{v.registrationNumber} - {v.model}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Fuel Records Table */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Driver</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Fuel Type</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Quantity (L)</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Price/L</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Total Cost</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Odometer</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Efficiency</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length > 0 ? filteredRecords.map((record) => (
                                <tr key={record._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        {new Date(record.refuelDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-[#0e2a63]">
                                        {record.registrationNumber}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {record.driverName || "N/A"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
                                            {record.fuelType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right font-bold text-slate-700">
                                        {record.quantity.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right text-slate-600">
                                        ₹{record.pricePerLiter.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right font-bold text-emerald-600">
                                        ₹{record.totalCost.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right text-slate-600">
                                        {record.currentOdometer} km
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right">
                                        {record.fuelEfficiency ? (
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
                                                {record.fuelEfficiency.toFixed(2)} km/L
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-xs">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(record)}
                                                className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-[#0e2a63] transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(record._id)}
                                                className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-red-600 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={10} className="px-6 py-20 text-center">
                                        <Fuel size={48} className="mx-auto text-slate-100 mb-4" />
                                        <p className="text-slate-400 text-sm font-medium italic">No fuel records found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0e2a63]/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={resetForm}></div>
                    <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300 border border-white/20 max-h-[90vh] overflow-y-auto">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0e2a63]"></div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-[#0e2a63]">{editingRecord ? "Edit" : "Add"} Fuel Record</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Fill in the fuel transaction details</p>
                                </div>
                                <button type="button" onClick={resetForm} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Vehicle Selection */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Vehicle *</label>
                                    <select
                                        required
                                        className="input-field py-3"
                                        value={formData.vehicleId}
                                        onChange={(e) => handleVehicleSelect(e.target.value)}
                                        disabled={!!editingRecord}
                                    >
                                        <option value="">Select Vehicle</option>
                                        {vehicles.map(v => (
                                            <option key={v._id} value={v._id}>{v.registrationNumber} - {v.model}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Driver (Optional) */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Driver</label>
                                    <select
                                        className="input-field py-3"
                                        value={formData.driverId}
                                        onChange={(e) => {
                                            const driver = drivers.find(d => d._id === e.target.value);
                                            setFormData({ ...formData, driverId: e.target.value, driverName: driver?.name || "" });
                                        }}
                                    >
                                        <option value="">Select Driver (Optional)</option>
                                        {drivers.map(d => (
                                            <option key={d._id} value={d._id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Fuel Type */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Fuel Type *</label>
                                    <select required className="input-field py-3" value={formData.fuelType} onChange={e => setFormData({ ...formData, fuelType: e.target.value })}>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Petrol">Petrol</option>
                                        <option value="CNG">CNG</option>
                                    </select>
                                </div>

                                {/* Quantity */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Quantity (Liters) *</label>
                                    <input required type="number" step="0.01" className="input-field py-3" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                                </div>

                                {/* Price Per Liter */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Price Per Liter (₹) *</label>
                                    <input required type="number" step="0.01" className="input-field py-3" value={formData.pricePerLiter} onChange={e => setFormData({ ...formData, pricePerLiter: e.target.value })} />
                                </div>

                                {/* Odometer */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Odometer (km) *</label>
                                    <input required type="number" className="input-field py-3" value={formData.currentOdometer} onChange={e => setFormData({ ...formData, currentOdometer: e.target.value })} />
                                </div>

                                {/* Location */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Location</label>
                                    <input type="text" className="input-field py-3" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Rourkela, Odisha" />
                                </div>

                                {/* Vendor Name */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Vendor/Station Name</label>
                                    <input type="text" className="input-field py-3" value={formData.vendorName} onChange={e => setFormData({ ...formData, vendorName: e.target.value })} placeholder="e.g., Indian Oil Pump" />
                                </div>

                                {/* Bill Number */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bill/Invoice Number</label>
                                    <input type="text" className="input-field py-3" value={formData.billNumber} onChange={e => setFormData({ ...formData, billNumber: e.target.value })} placeholder="Optional" />
                                </div>

                                {/* Remarks */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Remarks</label>
                                    <textarea className="input-field py-3 resize-none" rows={2} value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} placeholder="Any additional notes..."></textarea>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={resetForm} className="flex-1 py-4 bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-100 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-4 bg-[#0e2a63] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-blue-900/20 hover:bg-black transition-all flex items-center justify-center gap-2 group">
                                    <Save size={14} className="group-hover:scale-110 transition-transform" />
                                    {editingRecord ? "Update Record" : "Save Record"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
