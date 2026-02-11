import { useState } from "react";
import { Shield, Lock, User, ArrowLeft, LogIn, AlertCircle } from "lucide-react";
import PageWrapper from "../components/PageWrapper";

interface LoginPageProps {
    onLogin: () => void;
    onBack: () => void;
}

export default function LoginPage({ onLogin, onBack }: LoginPageProps) {
    const [credentials, setCredentials] = useState({ id: "", password: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Simulated validation (Standard admin credentials for demo)
        setTimeout(() => {
            if (credentials.id === "cslsuperadmin" && credentials.password === "cslsuperadmin") {
                onLogin();
            } else {
                setError("Invalid ID or Password. Please try again.");
                setIsSubmitting(false);
            }
        }, 800);
    };

    return (
        <PageWrapper showAdminButton={false}>
            <div className="max-w-[440px] w-full py-12 flex flex-col items-center">
                <button
                    onClick={onBack}
                    className="self-start flex items-center gap-2 text-slate-500 hover:text-[#0e2a63] transition-all font-bold uppercase tracking-wider text-xs mb-8 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Selection
                </button>

                <div className="w-full bg-white p-10 rounded-[2.5rem] shadow-[0_20px_70px_-15px_rgba(14,42,99,0.15)] border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0e2a63] to-[#f39c12]"></div>

                    <div className="text-center space-y-3 mb-10">
                        <div className="h-16 w-16 rounded-2xl bg-[#0e2a63] flex items-center justify-center shadow-lg shadow-blue-900/20 mx-auto mb-6">
                            <Shield size={32} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-[#0e2a63]">Security Login</h2>
                        <p className="text-slate-500 font-medium">Administration & Control Gateway</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0e2a63]/70 ml-1">Admin ID</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0e2a63] transition-colors" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="input-field py-4 pl-12 rounded-xl text-sm"
                                        placeholder="Enter Employee ID"
                                        value={credentials.id}
                                        onChange={e => setCredentials({ ...credentials, id: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0e2a63]/70 ml-1">Security PIN</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0e2a63] transition-colors" size={18} />
                                    <input
                                        type="password"
                                        required
                                        className="input-field py-4 pl-12 rounded-xl text-sm"
                                        placeholder="Enter Password"
                                        value={credentials.password}
                                        onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 animate-in fade-in zoom-in duration-200">
                                <AlertCircle size={18} className="shrink-0" />
                                <span className="text-xs font-bold leading-tight">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full py-4 rounded-xl text-lg shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isSubmitting ? (
                                <div className="h-5 w-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    LOGIN TO SYSTEM
                                    <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                            Authorized Personnel Only.<br />All access attempts are monitored and logged.
                        </p>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
