import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Truck, Users, MapPin, Gauge, ClipboardList, LayoutDashboard } from "lucide-react";

export default function Dashboard({ user }: { user?: any }) {
    const plant = user?.plant;
    const vehicles = useQuery(api.vehicles.list, { plant }) || [];
    const drivers = useQuery(api.drivers.list, {}) || [];
    const requests = useQuery(api.requests.list, { plant }) || [];
    const trips = useQuery(api.trips.list, { plant }) || [];

    // Process activity data (Current Week: Sunday to Saturday)
    const today_raw = new Date();
    const dayOfWeek = today_raw.getDay();
    const sunday = new Date(today_raw);
    sunday.setDate(today_raw.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);

    const currentWeek = [...Array(7)].map((_, i) => {
        const d = new Date(sunday);
        d.setDate(sunday.getDate() + i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    const activityData = currentWeek.map(date => {
        const count = trips.filter((t: any) => {
            const tripDate = new Date(t.startTime);
            const year = tripDate.getFullYear();
            const month = String(tripDate.getMonth() + 1).padStart(2, '0');
            const day = String(tripDate.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}` === date;
        }).length;
        return { date, count };
    });

    const maxCount = Math.max(...activityData.map(d => d.count), 5);

    const today = (() => {
        const year = today_raw.getFullYear();
        const month = String(today_raw.getMonth() + 1).padStart(2, '0');
        const day = String(today_raw.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    })();
    const hours = [...Array(12)].map((_, i) => i * 2);

    const todayActivity = hours.map(hour => {
        const count = trips.filter((t: any) => {
            const tripDate = new Date(t.startTime);
            const year = tripDate.getFullYear();
            const month = String(tripDate.getMonth() + 1).padStart(2, '0');
            const day = String(tripDate.getDate()).padStart(2, '0');
            const tripLocalDate = `${year}-${month}-${day}`;
            const tripHour = tripDate.getHours();
            return tripLocalDate === today && tripHour >= hour && tripHour < hour + 2;
        }).length;
        return { hour: `${hour.toString().padStart(2, '0')}:00`, count };
    });

    const maxTodayCount = Math.max(...todayActivity.map(d => d.count), 3);

    const stats = [
        { label: "Total Fleet", value: vehicles.length, icon: Truck, color: "text-[#0e2a63]", bg: "bg-blue-50" },
        { label: "Pending Requests", value: requests.filter((t: any) => t.status === "pending").length, icon: ClipboardList, color: "text-orange-500", bg: "bg-orange-50" },
        { label: "Active Trips", value: trips.filter((t: any) => t.status === "In Progress").length, icon: MapPin, color: "text-[#f39c12]", bg: "bg-amber-50" },
        { label: "Available Drivers", value: drivers.filter(d => d.status === "Available").length, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="page-header">
                <div className="flex items-center gap-4">
                    <div className="page-header-icon">
                        <LayoutDashboard size={26} />
                    </div>
                    <div>
                        <h1 className="page-title">Overview</h1>
                        <p className="page-subtitle">Real-time fleet performance dashboard</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Live Data</span>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card group">
                        <div className={`stat-card-icon ${stat.bg} ${stat.color} group-hover:scale-110`}>
                            <stat.icon size={26} />
                        </div>
                        <div>
                            <p className="stat-label">{stat.label}</p>
                            <p className="stat-value">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 7-Day Trend Chart */}
                <div className="section-card p-8 flex flex-col group/chart">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-base font-black text-[#0e2a63]">Fleet Utilization</h3>
                            <p className="page-subtitle">7-Day Operational Trend</p>
                        </div>
                        <div className="h-10 w-10 bg-blue-50 text-[#0e2a63] rounded-xl flex items-center justify-center group-hover/chart:rotate-12 transition-transform">
                            <Gauge size={20} />
                        </div>
                    </div>
                    <div className="flex-1 flex items-end justify-between gap-2 min-h-[200px] pt-4 px-2">
                        {activityData.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                                <div className="relative w-full flex flex-col items-center justify-end h-40">
                                    <div className="absolute -top-7 bg-[#0e2a63] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-xl opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                                        {day.count} Trips
                                    </div>
                                    <div className="w-full max-w-[32px] bg-slate-100 rounded-t-lg absolute bottom-0 h-full" />
                                    <div
                                        className="w-full max-w-[32px] bg-gradient-to-t from-[#0e2a63] to-[#2c5299] rounded-t-lg relative z-10 transition-all duration-1000 group-hover/bar:from-[#f39c12] group-hover/bar:to-[#e67e22]"
                                        style={{ height: `${Math.max((day.count / maxCount) * 100, 4)}%` }}
                                    />
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Today's Hourly Chart */}
                <div className="section-card p-8 flex flex-col group/chart">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-base font-black text-[#0e2a63]">Daily Intensity</h3>
                            <p className="page-subtitle">Live Hourly Breakdown (Today)</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Real-time</span>
                        </div>
                    </div>
                    <div className="flex-1 flex items-end justify-between gap-1.5 min-h-[200px] pt-4 px-2">
                        {todayActivity.map((slot, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                                <div className="relative w-full flex flex-col items-center justify-end h-40">
                                    <div className="absolute -top-7 bg-[#f39c12] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-xl opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                                        {slot.count}
                                    </div>
                                    <div className="w-full max-w-[24px] bg-slate-100 rounded-t-md absolute bottom-0 h-full" />
                                    <div
                                        className="w-full max-w-[24px] bg-gradient-to-t from-[#f39c12] to-[#e67e22] rounded-t-md relative z-10 transition-all duration-700 group-hover/bar:from-[#0e2a63] group-hover/bar:to-[#2c5299]"
                                        style={{ height: `${Math.max((slot.count / maxTodayCount) * 100, 4)}%` }}
                                    />
                                </div>
                                <span className="text-[9px] font-black text-slate-400 tracking-tighter whitespace-nowrap">
                                    {slot.hour}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Alerts */}
                <div className="section-card p-8 col-span-1 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-black text-[#0e2a63]">Recent Alerts</h3>
                            <p className="page-subtitle">System alerts and expiry notices</p>
                        </div>
                        <span className="badge badge-red animate-pulse">Live</span>
                    </div>
                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-400 italic">
                        No critical alerts at this time.
                    </div>
                </div>
            </div>
        </div>
    );
}
