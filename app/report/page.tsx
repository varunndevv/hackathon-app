"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { experimental_useObject as useObject } from "ai/react";
import { TriageSchema } from "@/lib/schemas";
import UploadZone from "@/components/UploadZone";
import TriageStream from "@/components/TriageStream";
import toast from "react-hot-toast";

export default function ReportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [location, setLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [gpsStatus, setGpsStatus] = useState<"loading" | "ok" | "unavailable">(
        "loading"
    );
    const [submitted, setSubmitted] = useState(false);

    const { object, submit, isLoading } = useObject({
        api: "/api/triage",
        schema: TriageSchema,
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setGpsStatus("unavailable");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setGpsStatus("ok");
            },
            () => setGpsStatus("unavailable")
        );
    }, []);

    const handleFileSelect = (f: File) => {
        setFile(f);
        setSubmitted(false);
    };

    const handleSubmit = async () => {
        if (!file) {
            toast.error("Please select an image first");
            return;
        }
        setSubmitted(true);

        const formData = new FormData();
        formData.append("image", file);
        if (location) {
            formData.append("lat", String(location.lat));
            formData.append("lng", String(location.lng));
        }

        try {
            await submit(formData);
        } catch {
            toast.error("Failed to analyze image. Please try again.");
        }
    };

    return (
        <div
            className="min-h-screen px-4 py-12 max-w-2xl mx-auto"
            style={{ paddingTop: "88px" }}
        >
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Report an Issue</h1>
                <p style={{ color: "rgba(255,255,255,0.5)" }}>
                    Upload a photo and our AI will classify it instantly.
                </p>
            </div>

            <div className="space-y-5">
                {/* GPS pill */}
                <div className="flex items-center gap-2">
                    {gpsStatus === "loading" && (
                        <span
                            className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
                            style={{
                                background: "rgba(99,102,241,0.12)",
                                color: "rgba(255,255,255,0.5)",
                            }}
                        >
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Getting location...
                        </span>
                    )}
                    {gpsStatus === "ok" && (
                        <span
                            className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
                            style={{
                                background: "rgba(34,197,94,0.12)",
                                color: "#22c55e",
                                border: "1px solid rgba(34,197,94,0.25)",
                            }}
                        >
                            <MapPin className="w-3 h-3" />
                            📍 Location captured ({location?.lat.toFixed(4)},{" "}
                            {location?.lng.toFixed(4)})
                        </span>
                    )}
                    {gpsStatus === "unavailable" && (
                        <span
                            className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
                            style={{
                                background: "rgba(245,158,11,0.12)",
                                color: "#f59e0b",
                                border: "1px solid rgba(245,158,11,0.25)",
                            }}
                        >
                            ⚠️ Location unavailable
                        </span>
                    )}
                </div>

                {/* Upload zone */}
                <div className="glass-card p-4">
                    <UploadZone onFileSelect={handleFileSelect} disabled={isLoading} />
                </div>

                {/* Submit */}
                {file && !submitted && (
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full py-4 rounded-2xl font-semibold text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
                        style={{ background: "var(--primary)" }}
                    >
                        Analyze with AI →
                    </button>
                )}

                {/* Triage stream */}
                {submitted && (
                    <TriageStream
                        isLoading={isLoading}
                        result={(object as typeof TriageSchema._type) ?? null}
                    />
                )}
            </div>
        </div>
    );
}
