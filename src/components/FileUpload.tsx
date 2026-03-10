import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UploadCloud, X, Loader2, CheckCircle2, Eye } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

interface FileUploadProps {
    label: string;
    acceptedTypes?: string; // e.g. "image/*,.pdf"
    storageId?: Id<"_storage"> | null; // Current file id if any
    onUploadComplete: (storageId: Id<"_storage">) => void;
    onRemove?: () => void;
}

export default function FileUpload({
    label,
    acceptedTypes = "image/*,.pdf",
    storageId,
    onUploadComplete,
    onRemove
}: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generateUploadUrl = useMutation(api.files.generateUploadUrl);

    // Auto-fetch the URL if we already have a storageId (for editing mode)
    const fileUrl = useQuery(api.files.getUrl, storageId ? { storageId } : "skip");

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Optional constraint: 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large. Maximum size is 5MB.");
            return;
        }

        try {
            setIsUploading(true);

            // 1. Get a short-lived upload URL from Convex
            const postUrl = await generateUploadUrl();

            // 2. POST the file to the URL
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId: newStorageId } = await result.json();

            // 3. Callback with the new ID
            onUploadComplete(newStorageId);

            // Set local preview if it's an image
            if (file.type.startsWith("image/")) {
                const objectUrl = URL.createObjectURL(file);
                setPreviewUrl(objectUrl);
            } else {
                setPreviewUrl(null);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload the file. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    // Determine what URL to show (local preview overrides the DB url if we just uploaded)
    const displayUrl = previewUrl || fileUrl;

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>

            <div className={`relative border-2 border-dashed rounded-xl p-4 transition-colors ${isUploading ? "border-blue-300 bg-blue-50/50" :
                storageId ? "border-emerald-200 bg-emerald-50/30" :
                    "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100/50"
                }`}>
                <input
                    type="file"
                    accept={acceptedTypes}
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    disabled={isUploading}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-2 text-blue-500">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm font-bold">Uploading...</span>
                    </div>
                ) : storageId ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-100 px-3 py-1.5 rounded-lg w-full justify-center">
                            <CheckCircle2 size={16} />
                            <span className="text-sm truncate max-w-[150px]">File Attached</span>
                        </div>

                        <div className="flex w-full gap-2">
                            {displayUrl && (
                                <a
                                    href={displayUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 hover:text-[#0e2a63] transition-colors"
                                >
                                    <Eye size={14} /> View
                                </a>
                            )}
                            {onRemove && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPreviewUrl(null);
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                        onRemove();
                                    }}
                                    className="px-2.5 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                    title="Remove File"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center gap-2 py-4 text-slate-400 hover:text-[#0e2a63] transition-colors"
                    >
                        <div className="p-2 bg-white rounded-full shadow-sm">
                            <UploadCloud size={20} />
                        </div>
                        <div className="text-center">
                            <span className="text-sm font-bold block">Click to upload</span>
                            <span className="text-xs font-medium text-slate-400">PDF or Image (max 5MB)</span>
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
}
