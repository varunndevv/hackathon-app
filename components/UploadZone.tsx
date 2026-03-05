"use client";

import { useState, useCallback } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
    disabled?: boolean;
}

export default function UploadZone({ onFileSelect, disabled }: UploadZoneProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);

    const handleFile = useCallback(
        (file: File) => {
            if (!file || disabled) return;
            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return;
            const url = URL.createObjectURL(file);
            setPreview(url);
            onFileSelect(file);
        },
        [onFileSelect, disabled]
    );

    const onDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    const clearPreview = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
    };

    return (
        <div
            className="relative rounded-2xl overflow-hidden transition-all duration-300"
            style={{
                border: `2px dashed ${dragging ? "var(--primary)" : "rgba(255,255,255,0.15)"}`,
                background: dragging
                    ? "rgba(99,102,241,0.08)"
                    : "rgba(255,255,255,0.03)",
                minHeight: "220px",
            }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
        >
            {preview ? (
                <div className="relative w-full h-56">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={clearPreview}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.7)" }}
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center gap-4 cursor-pointer w-full h-full py-12 px-6">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgba(99,102,241,0.15)" }}
                    >
                        {dragging ? (
                            <ImageIcon className="w-8 h-8" style={{ color: "var(--primary)" }} />
                        ) : (
                            <Upload className="w-8 h-8" style={{ color: "var(--primary)" }} />
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-white">
                            {dragging ? "Drop to upload" : "Drag & drop or click to upload"}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                            JPG, PNG, WEBP — max 10MB
                        </p>
                    </div>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={disabled}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFile(file);
                        }}
                    />
                </label>
            )}
        </div>
    );
}
