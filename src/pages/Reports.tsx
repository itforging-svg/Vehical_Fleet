import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FileBarChart, Download, FileText, Calendar, Filter, FileSpreadsheet, AlertCircle, Map as MapIcon } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


type ModuleType = "trips" | "fuel" | "maintenance" | "requests";

export default function Reports({ user }: { user?: any }) {
    const plant = user?.plant;
    const [selectedModule, setSelectedModule] = useState<ModuleType>("trips");
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(1); // Default to start of current month
        return d.toISOString().split("T")[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split("T")[0];
    });

    // Fetch all records for the selected module (plant-filtered by backend where applicable)
    const trips = useQuery(api.trips.list, { plant }) || [];
    const fuel = useQuery(api.fuelRecords.list, { plant }) || [];
    const maintenance = useQuery(api.maintenance.list, { plant }) || [];
    const requests = useQuery(api.requests.list, { plant }) || [];

    // Filter records by date range based on the selected module
    const getFilteredRecords = () => {
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        const end = new Date(endDate).setHours(23, 59, 59, 999);

        switch (selectedModule) {
            case "trips":
                return trips.filter((r: any) => {
                    // Extract date from startTimestamp or fallback to date string parsing
                    const ts = r.startTimestamp || new Date(r.date).getTime();
                    return ts >= start && ts <= end;
                });
            case "fuel":
                return fuel.filter((r: any) => {
                    const ts = r.refuelDate;
                    return ts >= start && ts <= end;
                });
            case "maintenance":
                return maintenance.filter((r: any) => {
                    const ts = r.serviceDate;
                    return ts >= start && ts <= end;
                });
            case "requests":
                return requests.filter((r: any) => {
                    const ts = r._creationTime;
                    return ts >= start && ts <= end;
                });
            default:
                return [];
        }
    };

    const records = getFilteredRecords();

    // Data mappers for export
    const getExportData = () => {
        switch (selectedModule) {
            case "trips":
                return {
                    headers: ["Date", "Vehicle No", "Plant", "Driver", "Start Odo", "End Odo", "Distance (km)", "Start Loc", "End Loc", "Status"],
                    rows: records.map((r: any) => [
                        new Date(r.startTimestamp || r.date).toLocaleDateString(),
                        r.registrationNumber,
                        r.plant || "-",
                        r.driverName || "-",
                        r.startOdometer,
                        r.endOdometer || "Ongoing",
                        r.endOdometer ? (r.endOdometer - r.startOdometer) : "-",
                        r.startLocation || "-",
                        r.endLocation || "-",
                        r.status
                    ])
                };
            case "fuel":
                return {
                    headers: ["Date", "Vehicle No", "Plant", "Driver", "Fuel Type", "Quantity (L)", "Price/L (₹)", "Total (₹)", "Odometer", "Vendor"],
                    rows: records.map((r: any) => [
                        new Date(r.refuelDate).toLocaleDateString(),
                        r.registrationNumber,
                        r.plant || "-",
                        r.driverName || "-",
                        r.fuelType,
                        r.quantity,
                        r.pricePerLiter,
                        r.quantity * r.pricePerLiter,
                        r.currentOdometer,
                        r.vendorName || "-"
                    ])
                };
            case "maintenance":
                return {
                    headers: ["Date", "Vehicle No", "Plant", "Type", "Status", "Odometer", "Description", "Cost (₹)", "Vendor", "Bill No"],
                    rows: records.map((r: any) => [
                        new Date(r.serviceDate).toLocaleDateString(),
                        r.registrationNumber,
                        r.plant || "-",
                        r.type,
                        r.status,
                        r.odometer,
                        r.description || "-",
                        r.cost,
                        r.vendorName || "-",
                        r.billNumber || "-"
                    ])
                };
            case "requests":
                return {
                    headers: ["Date Requested", "Requester", "Department", "Plant", "Required Date", "Required Time", "Status", "Approved By", "Vehicle Allocated"],
                    rows: records.map((r: any) => [
                        new Date(r._creationTime).toLocaleDateString(),
                        r.requesterName,
                        r.department,
                        r.plant,
                        new Date(r.requiredDate).toLocaleDateString(),
                        r.requiredTime,
                        r.status,
                        r.approvedBy || "-",
                        r.allocatedVehicleReg || "-"
                    ])
                };
        }
    };

    const handleExportExcel = () => {
        if (records.length === 0) return alert("No records found for the selected date range.");

        const { headers, rows } = getExportData();
        const data = [headers, ...rows];

        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

        const filename = `${selectedModule.toUpperCase()}_Report_${startDate}_to_${endDate}.xlsx`;
        XLSX.writeFile(workbook, filename);
    };

    const handleExportPDF = () => {
        if (records.length === 0) return alert("No records found for the selected date range.");

        const doc = new jsPDF('landscape');
        const { headers, rows } = getExportData();

        // Add Header
        doc.setFontSize(20);
        doc.setTextColor(14, 42, 99); // #0e2a63
        doc.text("Vehicle Fleet Management System", 14, 22);

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`${selectedModule.toUpperCase()} REPORT`, 14, 30);
        doc.text(`Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`, 14, 36);
        doc.text(`Plant: ${plant || "All Plants"}`, 14, 42);

        // Add Table
        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: 50,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [14, 42, 99], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
        });

        const filename = `${selectedModule.toUpperCase()}_Report_${startDate}_to_${endDate}.pdf`;
        doc.save(filename);
    };

    const modules = [
        { id: "trips", label: "Operational Logs (Trips)", icon: MapIcon },
        { id: "fuel", label: "Fuel Records", icon: FileText },
        { id: "maintenance", label: "Maintenance Logs", icon: FileText },
        { id: "requests", label: "Vehicle Requests", icon: FileText },
    ] as const;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-4">
                    <div className="page-header-icon bg-indigo-500 text-white">
                        <FileBarChart size={24} />
                    </div>
                    <div>
                        <h1 className="page-title">Reports & Export</h1>
                        <p className="page-subtitle">Generate custom reports and download data</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 p-6 sm:p-8 border border-slate-100">
                        <h2 className="text-lg font-black text-[#0e2a63] mb-6 flex items-center gap-2">
                            <Filter size={18} className="text-[#f39c12]" />
                            Report Configuration
                        </h2>

                        <div className="space-y-6">
                            {/* Module Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Module *</label>
                                <div className="space-y-2">
                                    {modules.map(mod => (
                                        <button
                                            key={mod.id}
                                            onClick={() => setSelectedModule(mod.id as ModuleType)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${selectedModule === mod.id
                                                ? "border-[#0e2a63] bg-blue-50/50 text-[#0e2a63]"
                                                : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                                                }`}
                                        >
                                            <div className={`p-1.5 rounded-lg ${selectedModule === mod.id ? "bg-[#0e2a63] text-white" : "bg-slate-100"}`}>
                                                <mod.icon size={16} />
                                            </div>
                                            <span className="font-bold">{mod.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date Range Selection */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-[#0e2a63] flex items-center gap-2">
                                    <Calendar size={16} className="text-slate-400" />
                                    Date Range
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">From</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="input-field text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">To</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="input-field text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview and Export Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 p-6 sm:p-8 border border-slate-100 h-full flex flex-col">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div>
                                <h2 className="text-lg font-black text-[#0e2a63]">Export Data</h2>
                                <p className="text-sm font-medium text-slate-500 mt-1">
                                    Found <span className="text-[#f39c12] font-bold">{records.length}</span> records for the selected period
                                </p>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                    onClick={handleExportPDF}
                                    disabled={records.length === 0}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FileText size={18} />
                                    PDF
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    disabled={records.length === 0}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FileSpreadsheet size={18} />
                                    Excel
                                </button>
                            </div>
                        </div>

                        {records.length > 0 ? (
                            <div className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-100 p-6 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="h-20 w-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                                    <Download size={32} />
                                </div>
                                <div>
                                    <h3 className="text-[#0e2a63] font-bold text-lg">Ready to Export</h3>
                                    <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                                        Your report containing {records.length} {selectedModule} records from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()} is ready.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed p-6 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="h-16 w-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                                    <AlertCircle size={28} />
                                </div>
                                <div>
                                    <h3 className="text-slate-600 font-bold">No Data Available</h3>
                                    <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
                                        Try broadening your date range or selecting a different module to export.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
