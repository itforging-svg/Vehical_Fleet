import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 italic space-y-4">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                <SettingsIcon size={32} />
            </div>
            <p>App settings coming soon...</p>
        </div>
    );
}
