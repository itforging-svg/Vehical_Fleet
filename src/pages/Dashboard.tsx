export default function Dashboard() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-[#0e2a63] mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2">
                        <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Metric {i}</span>
                        <span className="text-4xl font-extrabold text-[#0e2a63]">--</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
