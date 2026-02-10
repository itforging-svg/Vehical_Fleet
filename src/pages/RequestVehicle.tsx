import { ArrowLeft } from "lucide-react";
import PageWrapper from "../components/PageWrapper";

export default function RequestVehicle({ onBack }: { onBack: () => void }) {
    return (
        <PageWrapper showAdminButton={false}>
            <div className="max-w-3xl w-full space-y-8 py-8 h-full flex flex-col items-center justify-center">
                <div className="bg-white p-12 rounded-[2.5rem] shadow-[0_20px_70px_-15px_rgba(14,42,99,0.1)] border border-slate-100 text-center space-y-8 max-w-md w-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-[#f39c12]"></div>

                    <div className="space-y-4">
                        <h2 className="text-3xl font-extrabold text-[#0e2a63]">Request Vehicle</h2>
                        <p className="text-slate-500 font-medium">The vehicle request module is currently undergoing system upgrades for better performance.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button onClick={onBack} className="btn-primary w-full py-4 text-lg">
                            <ArrowLeft size={18} />
                            BACK TO SELECTION
                        </button>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
