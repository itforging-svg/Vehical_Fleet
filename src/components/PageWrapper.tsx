import { ReactNode, useEffect, useState } from "react";
import { Shield, Truck, Users, LayoutDashboard } from "lucide-react";

interface PageWrapperProps {
    children: ReactNode;
    onSelectOption?: (option: string) => void;
    showAdminButton?: boolean;
}

export default function PageWrapper({ children, onSelectOption, showAdminButton = true }: PageWrapperProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

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

                {showAdminButton && onSelectOption && (
                    <button
                        onClick={() => onSelectOption("dashboard")}
                        className="group flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-all text-xs font-bold px-5 py-2.5 rounded-full border border-white/20 hover:border-white/40"
                    >
                        <LayoutDashboard size={16} className="text-white/70 group-hover:text-white transition-colors" />
                        ADMIN DASHBOARD
                    </button>
                )}
            </header>

            <main className={`flex-1 flex flex-col items-center p-6 relative z-10 transition-all duration-700 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                {children}
            </main>

            {/* Footer */}
            <footer className="py-6 text-center text-slate-400 text-xs font-medium z-10">
                © {new Date().getFullYear()} Chandan Steel Ltd. All rights reserved.
            </footer>
        </div>
    );
}
