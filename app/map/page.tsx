"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { MapReport } from "@/lib/schemas";
import { Loader2, SlidersHorizontal } from "lucide-react";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const PRIORITIES = ["All", "P1", "P2", "P3", "P4"];
const CATEGORIES = [
    "All",
    "pothole",
    "garbage",
    "broken_light",
    "flooding",
    "water_leak",
    "other",
];
const STATUSES = ["All", "open", "assigned", "in_progress", "resolved"];

export default function MapPage() {
    const [reports, setReports] = useState<MapReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [priority, setPriority] = useState("All");
    const [category, setCategory] = useState("All");
    const [status, setStatus] = useState("All");

    useEffect(() => {
        fetch("/api/reports/map")
            .then((r) => r.json())
            .then((data) => setReports(Array.isArray(data) ? data : []))
            .catch(() => setReports([]))
            .finally(() => setLoading(false));
    }, []);

    const filter = {
        priority: priority !== "All" ? priority : undefined,
        category: category !== "All" ? category : undefined,
        status: status !== "All" ? status : undefined,
    };

    const selectStyle = {
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#fff",
        borderRadius: "10px",
        padding: "8px 12px",
        fontSize: "13px",
        outline: "none",
        cursor: "pointer",
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ paddingTop: "64px" }}>
            {/* Header + filters */}
            <div
                className="px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
                <div>
                    <h1 className="text-xl font-bold text-white">Issue Map</h1>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {reports.length} open issues citywide · Bengaluru
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <SlidersHorizontal className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />

                    <select value={priority} onChange={(e) => setPriority(e.target.value)} style={selectStyle}>
                        {PRIORITIES.map((p) => (
                            <option key={p} value={p} style={{ background: "#1a1a2e" }}>
                                {p === "All" ? "All Priorities" : p}
                            </option>
                        ))}
                    </select>

                    <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c} style={{ background: "#1a1a2e" }}>
                                {c === "All" ? "All Categories" : c.replace(/_/g, " ")}
                            </option>
                        ))}
                    </select>

                    <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
                        {STATUSES.map((s) => (
                            <option key={s} value={s} style={{ background: "#1a1a2e" }}>
                                {s === "All" ? "All Statuses" : s.replace(/_/g, " ")}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 p-4" style={{ minHeight: "calc(100vh - 130px)" }}>
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-3">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: "var(--primary)" }} />
                            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                                Loading issue map...
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="h-full" style={{ minHeight: "500px" }}>
                        <MapView reports={reports} filter={filter} />
                    </div>
                )}
            </div>
        </div>
    );
}
