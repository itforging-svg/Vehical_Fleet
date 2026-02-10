import { useState, useEffect } from "react";
import { Shield, Truck, Users, ArrowRight, LayoutDashboard } from "lucide-react";

interface LandingPageProps {
    onSelectOption: (option: string) => void;
}

export default function LandingPage({ onSelectOption }: LandingPageProps) {
    const [selectedPortal, setSelectedPortal] = useState<string>("request_vehicle");
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleProceed = () => {
        onSelectOption(selectedPortal);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans w-full animate-fade-in overflow-x-hidden relative">
            {/* Background: Tech Logistics Theme */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* 1. Subtle Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.4]" style={{
                    backgroundImage: "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)",
                    backgroundSize: "40px 40px"
                }}></div>

                {/* 2. Soft Gradient Blobs for depth */}
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[100px] mix-blend-multiply unchecked"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-orange-50/40 rounded-full blur-[100px] mix-blend-multiply unchecked"></div>

                {/* 3. Floating Logistics Icons (Watermark effect) */}
                <Shield className="absolute top-[10%] left-[5%] text-slate-200/50 w-24 h-24 -rotate-12" strokeWidth={1} />
                <Truck className="absolute bottom-[15%] right-[5%] text-slate-200/50 w-32 h-32 rotate-6" strokeWidth={1} />
                <Users className="absolute top-[20%] right-[15%] text-slate-200/40 w-16 h-16 rotate-12" strokeWidth={1} />

                {/* Abstract decorative circles */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-slate-200/30 rounded-full opacity-50"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-slate-200/20 rounded-full opacity-40"></div>
            </div>

            {/* Header */}
            <header className="bg-[#0e2a63] text-white py-4 px-6 md:px-16 flex items-center justify-between shadow-lg sticky top-0 z-50">
                <div className="flex items-center gap-5">
                    <div className="bg-white p-2.5 rounded-lg shadow-sm">
                        <img
                            src="https://www.chandansteel.net/images/logo-floated.png"
                            alt="Chandan Steel Logo"
                            className="h-10 md:h-12 object-contain"
                            onError={(e) => {
                                e.currentTarget.src = "https://www.chandansteel.net/wp-content/uploads/2018/06/logo.png";
                            }}
                        />
                    </div>
                    <div className="h-10 w-px bg-white/20 hidden md:block"></div>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-sm md:text-[17px] font-bold tracking-wider uppercase text-white leading-none mb-1">
                            Vehicle System
                        </h1>
                        <p className="text-[10px] text-blue-200 font-medium tracking-[0.2em] uppercase">
                            Official Gateway Portal
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => onSelectOption("dashboard")}
                    className="group flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-all text-xs font-bold px-5 py-2.5 rounded-full border border-white/20 hover:border-white/40"
                >
                    <LayoutDashboard size={16} className="text-white/70 group-hover:text-white transition-colors" />
                    ADMIN DASHBOARD
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className={`max-w-[1000px] w-full grid md:grid-cols-2 gap-12 items-center transition-all duration-700 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                    }`}>

                    {/* Left Side: Welcome / Context */}
                    <div className="space-y-8 hidden md:block">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#0e2a63] text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">
                            <Shield size={14} />
                            Secure Access Control
                        </div>
                        <h2 className="text-5xl font-extrabold text-slate-900 leading-[1.1]">
                            Simplifying <span className="text-[#0e2a63]">Plant Logistics</span> & Security.
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed max-w-md">
                            Welcome to the Chandan Steel Vehicle System. Please select your operational portal to proceed with digital gate entry logging.
                        </p>
                        <div className="flex items-center gap-8 pt-4">
                            <div className="flex flex-col">
                                <span className="text-4xl font-black text-[#f39c12] tracking-tight">24/7</span>
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">System Uptime</span>
                            </div>
                            <div className="h-12 w-px bg-slate-200"></div>
                            <div className="flex flex-col">
                                <span className="text-4xl font-black text-[#0e2a63] tracking-tight">100%</span>
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Digital Logging</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Action Card */}
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_70px_-15px_rgba(14,42,99,0.15)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_30px_90px_-20px_rgba(14,42,99,0.2)] transition-shadow duration-500">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0e2a63] via-[#2c5299] to-[#f39c12]"></div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-slate-900">Select Portal</h3>
                                <p className="text-slate-500 text-sm">Choose the appropriate module for your entry type.</p>
                            </div>

                            <div className="space-y-4">
                                {/* Option 1 */}
                                <label className={`cursor-pointer block relative rounded-2xl border-2 transition-all duration-300 p-5 ${selectedPortal === "request_vehicle"
                                    ? "border-[#f39c12] bg-[#fdf5e8]"
                                    : "border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                                    }`}>
                                    <input
                                        type="radio"
                                        name="portal"
                                        value="request_vehicle"
                                        checked={selectedPortal === "request_vehicle"}
                                        onChange={() => setSelectedPortal("request_vehicle")}
                                        className="absolute opacity-0"
                                    />
                                    <div className="flex items-start gap-4">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selectedPortal === "request_vehicle" ? "bg-[#f39c12] text-white shadow-md shadow-orange-500/20" : "bg-white border border-slate-200 text-slate-400"
                                            }`}>
                                            <Truck size={24} strokeWidth={2} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className={`font-bold text-[17px] ${selectedPortal === "request_vehicle" ? "text-[#0e2a63]" : "text-slate-700"}`}>Vehicle Request</h4>
                                                <div className={`h-5 w-5 rounded-full border-[1.5px] flex items-center justify-center ${selectedPortal === "request_vehicle" ? "border-[#f39c12]" : "border-slate-300"
                                                    }`}>
                                                    {selectedPortal === "request_vehicle" && <div className="h-2.5 w-2.5 rounded-full bg-[#f39c12]"></div>}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1 leading-snug">For contractors, trucks, and external logistics.</p>
                                        </div>
                                    </div>
                                </label>

                                {/* Option 2 */}
                                <label className={`cursor-pointer block relative rounded-2xl border-2 transition-all duration-300 p-5 ${selectedPortal === "internal_movement"
                                    ? "border-[#f39c12] bg-[#fdf5e8]"
                                    : "border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                                    }`}>
                                    <input
                                        type="radio"
                                        name="portal"
                                        value="internal_movement"
                                        checked={selectedPortal === "internal_movement"}
                                        onChange={() => setSelectedPortal("internal_movement")}
                                        className="absolute opacity-0"
                                    />
                                    <div className="flex items-start gap-4">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selectedPortal === "internal_movement" ? "bg-[#f39c12] text-white shadow-md shadow-orange-500/20" : "bg-white border border-slate-200 text-slate-400"
                                            }`}>
                                            <Users size={24} strokeWidth={2} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className={`font-bold text-[17px] ${selectedPortal === "internal_movement" ? "text-[#0e2a63]" : "text-slate-700"}`}>Internal Movement</h4>
                                                <div className={`h-5 w-5 rounded-full border-[1.5px] flex items-center justify-center ${selectedPortal === "internal_movement" ? "border-[#f39c12]" : "border-slate-300"
                                                    }`}>
                                                    {selectedPortal === "internal_movement" && <div className="h-2.5 w-2.5 rounded-full bg-[#f39c12]"></div>}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1 leading-snug">For intra-plant transfers and utility vehicles.</p>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            <button
                                onClick={handleProceed}
                                className="w-full bg-[#0e2a63] hover:bg-[#1a3b7c] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/10 transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
                            >
                                PROCEED TO PORTAL
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 text-center text-slate-400 text-xs font-medium z-10">
                © {new Date().getFullYear()} Chandan Steel Ltd. All rights reserved.
            </footer>
        </div>
    );
}
