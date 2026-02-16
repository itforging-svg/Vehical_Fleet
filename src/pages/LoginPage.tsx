import { useState, useEffect } from "react";
import { Shield, Lock, User, ArrowLeft, LogIn, Truck, Users } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";

interface LoginPageProps {
    onLogin: (user: any) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const login = useMutation(api.auth.login);
    const navigate = useNavigate();

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const user = await login({ adminId: id, password });
            if (user) {
                onLogin(user);
                navigate("/dashboard");
            } else {
                setError("Invalid ID or password");
            }
        } catch (err) {
            setError("Login failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans w-full animate-fade-in overflow-x-hidden relative items-center justify-center p-6">
            {/* Background: Tech Logistics Theme (Synced with LandingPage) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* 1. Subtle Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.4]" style={{
                    backgroundImage: "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)",
                    backgroundSize: "40px 40px"
                }}></div>

                {/* 2. Soft Gradient Blobs for depth */}
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[100px] mix-blend-multiply"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-orange-50/40 rounded-full blur-[100px] mix-blend-multiply"></div>

                {/* 3. Floating Logistics Icons */}
                <Shield className="absolute top-[10%] left-[5%] text-slate-200/50 w-24 h-24 -rotate-12" strokeWidth={1} />
                <Truck className="absolute bottom-[15%] right-[5%] text-slate-200/50 w-32 h-32 rotate-6" strokeWidth={1} />
                <Users className="absolute top-[20%] right-[15%] text-slate-200/40 w-16 h-16 rotate-12" strokeWidth={1} />
            </div>

            <div className={`max-w-md w-full relative z-10 transition-all duration-700 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#0e2a63] mb-8 transition-colors group font-bold uppercase tracking-widest text-[10px]"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Portal
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_70px_-15px_rgba(14,42,99,0.15)] p-10 border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0e2a63] via-[#2c5299] to-[#f39c12]"></div>

                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="h-16 w-16 bg-[#0e2a63] rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-900/20 group-hover:rotate-6 transition-transform">
                            <Lock size={32} />
                        </div>
                        <h1 className="text-3xl font-black text-[#0e2a63] uppercase tracking-tight italic leading-tight">
                            Admin <span className="text-[#f39c12]">Terminal</span>
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
                            Secure Logistics Authentication
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0e2a63]/70 ml-1">
                                Terminal ID
                            </label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within/input:text-[#0e2a63] transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-0 focus:border-[#0e2a63] focus:bg-white transition-all font-bold placeholder:text-slate-300 placeholder:font-bold italic"
                                    placeholder="Enter Terminal ID"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0e2a63]/70 ml-1">
                                Access Code
                            </label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within/input:text-[#0e2a63] transition-colors">
                                    <Shield size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-0 focus:border-[#0e2a63] focus:bg-white transition-all font-bold placeholder:text-slate-300 placeholder:font-bold italic"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 text-center animate-in zoom-in duration-200">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-[#0e2a63] hover:bg-[#0a1f4d] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98]"
                        >
                            Authorize Entry
                            <LogIn size={18} />
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-50">
                        <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                            Authorized personnel only. All access attempts are digitally logged and monitored by the system.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
