import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Activity, Trophy, Droplets, Award, Search } from "lucide-react";
import { useState } from "react";

export default function DriverPerformance({ plant }: { plant?: string }) {
    const [searchTerm, setSearchTerm] = useState("");

    const performanceStats = useQuery(api.drivers.getPerformanceStats, { plant });

    // Ensure array exists to avoid undefined errors
    const safeData = performanceStats || [];

    const statsArray = safeData.map(stat => ({
        ...stat,
        fuelEfficiency: stat.fuelConsumed > 0 ? (stat.kmDriven / stat.fuelConsumed).toFixed(2) : "0.00"
    }));

    const filteredStats = statsArray.filter(stat =>
        stat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stat.driverEmpId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Derived Summary Metrics
    const topKmDriver = [...statsArray].sort((a, b) => b.kmDriven - a.kmDriven)[0];
    const topTripsDriver = [...statsArray].sort((a, b) => b.tripsCompleted - a.tripsCompleted)[0];
    const topFuelConsumer = [...statsArray].sort((a, b) => b.fuelConsumed - a.fuelConsumed)[0];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-4">
                    <div className="page-header-icon bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-indigo-200">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="page-title">Driver Performance</h1>
                        <p className="page-subtitle text-indigo-600">Leaderboard & Efficiency Analytics</p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="stat-card">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Top Driver (Distance)</p>
                            <h3 className="text-xl font-bold text-slate-900 border-b pb-2 mb-2 line-clamp-1 truncate max-w-[200px]">
                                {topKmDriver ? topKmDriver.name : "-"}
                            </h3>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-indigo-600">
                                    {topKmDriver ? topKmDriver.kmDriven.toLocaleString() : "0"} <span className="text-sm font-semibold text-slate-500">km</span>
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Trophy className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Top Driver (Trips)</p>
                            <h3 className="text-xl font-bold text-slate-900 border-b pb-2 mb-2 line-clamp-1 truncate max-w-[200px]">
                                {topTripsDriver ? topTripsDriver.name : "-"}
                            </h3>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-blue-600">
                                    {topTripsDriver ? topTripsDriver.tripsCompleted : "0"} <span className="text-sm font-semibold text-slate-500">trips</span>
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Award className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="stat-card border-orange-100 shadow-orange-50/50">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Highest Fuel Consumer</p>
                            <h3 className="text-xl font-bold text-slate-900 border-b pb-2 mb-2 line-clamp-1 truncate max-w-[200px]">
                                {topFuelConsumer ? topFuelConsumer.name : "-"}
                            </h3>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-orange-600">
                                    {topFuelConsumer ? topFuelConsumer.fuelConsumed.toLocaleString() : "0"} <span className="text-sm font-semibold text-slate-500">Liters</span>
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                            <Droplets className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaderboard Table */}
            <div className="section-card">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-800">Performance Leaderboard</h2>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search driver by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver Name</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Trips Completed</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Distance (km)</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Fuel (Ltrs)</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Fuel Cost (₹)</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Efficiency (km/L)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {performanceStats === undefined ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-slate-500 flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                        Calculating metrics...
                                    </td>
                                </tr>
                            ) : filteredStats.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-slate-500">
                                        No performance data found.
                                    </td>
                                </tr>
                            ) : (
                                filteredStats.map((stat, index) => (
                                    <tr key={stat.driverId} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                                                index === 1 ? "bg-slate-200 text-slate-700 border border-slate-300" :
                                                    index === 2 ? "bg-amber-100 text-amber-800 border border-amber-200" :
                                                        "bg-slate-50 text-slate-500 border border-slate-100"
                                                }`}>
                                                #{index + 1}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{stat.name}</span>
                                                <span className="text-xs text-slate-500 text-slate-500 font-mono mt-0.5">{stat.driverEmpId}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-center">
                                            <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                                {stat.tripsCompleted}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-right font-medium text-slate-700">
                                            {(stat.kmDriven).toLocaleString()} <span className="text-xs text-slate-400 font-normal">km</span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-right font-medium text-slate-700">
                                            {(stat.fuelConsumed).toLocaleString()} <span className="text-xs text-slate-400 font-normal">L</span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-right font-medium text-slate-700">
                                            ₹ {(stat.fuelCost).toLocaleString()}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-right">
                                            <span className={`px-2.5 py-1 rounded-lg font-bold text-sm ${Number(stat.fuelEfficiency) > 15 ? "bg-green-50 text-green-700 border border-green-100" :
                                                Number(stat.fuelEfficiency) > 8 ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                                                    stat.fuelConsumed === 0 ? "bg-slate-50 text-slate-500" :
                                                        "bg-orange-50 text-orange-700 border border-orange-100"
                                                }`}>
                                                {stat.fuelEfficiency}
                                            </span>
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
