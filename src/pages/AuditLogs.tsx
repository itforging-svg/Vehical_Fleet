import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
    ClipboardList,
    Search,
    Filter,
    Calendar,
    User,
    Activity,
} from "lucide-react";

export default function AuditLogs() {
    const [searchTerm, setSearchTerm] = useState("");
    const [moduleFilter, setModuleFilter] = useState("All");
    const [actionFilter, setActionFilter] = useState("All");

    const logs = useQuery(api.audit.list, {
        module: moduleFilter === "All" ? undefined : moduleFilter,
        action: actionFilter === "All" ? undefined : actionFilter,
    });

    const filteredLogs = logs?.filter(log =>
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.performedBy.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const modules = ["All", "Vehicles", "Drivers", "Operational Logs", "Fuel Records", "Maintenance", "Vehicle Requests"];
    const actions = ["All", "CREATE", "UPDATE", "DELETE"];

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-navy-900 rounded-lg">
                            <ClipboardList className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-navy-900">Audit Logs</h1>
                    </div>
                    <p className="text-gray-500">Track all system activities and administrative changes</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by details or administrator..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={moduleFilter}
                        onChange={(e) => setModuleFilter(e.target.value)}
                    >
                        {modules.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                    >
                        {actions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Administrator</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Module</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLogs === undefined ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading audit logs...</td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">No activity logs found.</td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(log.timestamp).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-navy-50 flex items-center justify-center text-navy-600">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{log.performedBy}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.action === "CREATE" ? "bg-green-100 text-green-700" :
                                                log.action === "UPDATE" ? "bg-blue-100 text-blue-700" :
                                                    "bg-red-100 text-red-700"
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Activity className="w-4 h-4 text-navy-400" />
                                                {log.module}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700 line-clamp-2">{log.details}</p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
