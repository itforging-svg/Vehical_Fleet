import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Truck, Users, MapPin, Gauge, ClipboardList } from "lucide-react";

export default function Dashboard({ plant }: { plant?: string }) {
    const vehicles = useQuery(api.vehicles.list, { plant }) || [];
    const drivers = useQuery(api.drivers.list, {}) || [];
    const trips = useQuery(api.requests.list, { plant }) || [];

    const stats = [
        {
            label: "Total Fleet",
            value: vehicles.length,
            icon: Truck,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "Pending Requests",
            value: trips.filter((t: any) => t.status === "pending").length,
            icon: ClipboardList,
            color: "text-orange-600",
            bg: "bg-orange-50"
        },
        {
            label: "Active Trips",
            value: trips.filter((t: any) => t.status === "In Progress").length,
            icon: MapPin,
            color: "text-[#f39c12]",
            bg: "bg-orange-50"
        },
        {
            label: "Available Drivers",
            value: drivers.filter(d => d.status === "Available").length,
            icon: Users,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex flex-col gap-1">
                            <span className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">{stat.label}</span>
                            <span className="text-5xl font-black text-[#0e2a63] tracking-tight">{stat.value}</span>
                        </div>
                        <div className={`h-16 w-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                            <stat.icon size={32} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Gauge size={40} />
                    </div>
                    <div className="max-w-xs">
                        <h3 className="text-lg font-bold text-[#0e2a63]">Activity Heatmap</h3>
                        <p className="text-sm text-slate-400">Visual analytics of vehicle movements across plant sectors will appear here.</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm min-h-[300px]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-[#0e2a63]">Recent Alerts</h3>
                        <span className="text-[10px] bg-red-50 text-red-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">Live</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 opacity-60 italic text-sm text-slate-400">
                            No critical alerts at this time.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
