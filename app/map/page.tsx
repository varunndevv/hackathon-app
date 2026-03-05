"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { MapReport } from "@/lib/schemas";
import { Loader2, SlidersHorizontal, Flame, MapPin } from "lucide-react";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const PRIORITIES = ["All", "P1", "P2", "P3", "P4"];
const CATEGORIES = ["All", "pothole", "garbage", "broken_light", "flooding", "water_leak", "other"];
const STATUSES = ["All", "open", "assigned", "in_progress", "resolved"];

// Demo data — Bengaluru issue hotspots shown when backend returns no data
const DEMO_REPORTS: MapReport[] = [
    { id: "d1", lat: 12.9716, lng: 77.5946, category: "pothole", priority: "P1", upvoteCount: 34, status: "open" },
    { id: "d2", lat: 12.9352, lng: 77.6245, category: "garbage", priority: "P2", upvoteCount: 21, status: "assigned" },
    { id: "d3", lat: 12.9698, lng: 77.7499, category: "flooding", priority: "P1", upvoteCount: 47, status: "open" },
    { id: "d4", lat: 12.9279, lng: 77.6271, category: "broken_light", priority: "P3", upvoteCount: 8, status: "in_progress" },
    { id: "d5", lat: 13.0012, lng: 77.5764, category: "water_leak", priority: "P2", upvoteCount: 15, status: "open" },
    { id: "d6", lat: 12.9831, lng: 77.7088, category: "pothole", priority: "P2", upvoteCount: 19, status: "open" },
    { id: "d7", lat: 12.9150, lng: 77.6011, category: "garbage", priority: "P3", upvoteCount: 6, status: "resolved" },
    { id: "d8", lat: 13.0358, lng: 77.5970, category: "pothole", priority: "P1", upvoteCount: 52, status: "open" },
    { id: "d9", lat: 12.9582, lng: 77.6408, category: "flooding", priority: "P2", upvoteCount: 29, status: "assigned" },
    { id: "d10", lat: 12.9453, lng: 77.7021, category: "broken_light", priority: "P4", upvoteCount: 3, status: "open" },
    { id: "d11", lat: 12.9944, lng: 77.6953, category: "water_leak", priority: "P1", upvoteCount: 38, status: "open" },
    { id: "d12", lat: 12.8961, lng: 77.5952, category: "garbage", priority: "P2", upvoteCount: 23, status: "open" },
    { id: "d13", lat: 12.9756, lng: 77.5483, category: "pothole", priority: "P3", upvoteCount: 11, status: "in_progress" },
    { id: "d14", lat: 13.0200, lng: 77.6511, category: "flooding", priority: "P1", upvoteCount: 61, status: "open" },
    { id: "d15", lat: 12.9607, lng: 77.5739, category: "broken_light", priority: "P3", upvoteCount: 7, status: "assigned" },
    { id: "d16", lat: 12.9100, lng: 77.6388, category: "pothole", priority: "P2", upvoteCount: 18, status: "open" },
    { id: "d17", lat: 12.9876, lng: 77.6217, category: "garbage", priority: "P4", upvoteCount: 5, status: "open" },
    { id: "d18", lat: 13.0088, lng: 77.7200, category: "water_leak", priority: "P2", upvoteCount: 24, status: "open" },
    { id: "d19", lat: 12.9435, lng: 77.5622, category: "flooding", priority: "P3", upvoteCount: 12, status: "in_progress" },
    { id: "d20", lat: 12.9290, lng: 77.6855, category: "pothole", priority: "P1", upvoteCount: 43, status: "open" },
];

export default function MapPage() {
    const [reports, setReports] = useState<MapReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [priority, setPriority] = useState("All");
    const [category, setCategory] = useState("All");
    const [status, setStatus] = useState("All");

    useEffect(() => {
        fetch("/api/reports/map")
            .then((r) => r.json())
            .then((data) => setReports(Array.isArray(data) && data.length > 0 ? data : DEMO_REPORTS))
            .catch(() => setReports(DEMO_REPORTS))
            .finally(() => setLoading(false));
    }, []);

    const filter = {
        priority: priority !== "All" ? priority : undefined,
        category: category !== "All" ? category : undefined,
        status: status !== "All" ? status : undefined,
    };

    const selectStyle: React.CSSProperties = {
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#fff",
        borderRadius: "10px",
        padding: "7px 10px",
        fontSize: "13px",
        outline: "none",
        cursor: "pointer",
    };

    const activeCount = reports.filter((r) => {
        if (filter.priority && r.priority !== filter.priority) return false;
        if (filter.category && r.category !== filter.category) return false;
        if (filter.status && r.status !== filter.status) return false;
        return true;
    }).length;

    return (
        <div className="min-h-screen flex flex-col" style={{ paddingTop: "100px" }}>
            {/* Header + controls */}
            <div
                className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
                <div>
                    <h1 className="text-xl font-bold text-white">Issue Map</h1>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {activeCount} issues · Bengaluru
                        {reports === DEMO_REPORTS ? " (demo data)" : ""}
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Heatmap toggle */}
                    <button
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200"
                        style={{
                            background: showHeatmap ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)",
                            border: `1px solid ${showHeatmap ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.12)"}`,
                            color: showHeatmap ? "#ef4444" : "rgba(255,255,255,0.7)",
                        }}
                    >
                        <Flame className="w-3.5 h-3.5" />
                        {showHeatmap ? "Heatmap ON" : "Heatmap"}
                    </button>

                    {/* Cluster toggle */}
                    <button
                        onClick={() => setShowHeatmap(false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200"
                        style={{
                            background: !showHeatmap ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)",
                            border: `1px solid ${!showHeatmap ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.12)"}`,
                            color: !showHeatmap ? "#a5b4fc" : "rgba(255,255,255,0.7)",
                        }}
                    >
                        <MapPin className="w-3.5 h-3.5" />
                        Cluster
                    </button>

                    {/* Divider */}
                    <div className="w-px h-6" style={{ background: "rgba(255,255,255,0.12)" }} />

                    {/* Filters */}
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

            {/* Legend */}
            {showHeatmap && (
                <div
                    className="px-4 py-2 flex items-center gap-4 text-xs flex-wrap"
                    style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>Intensity:</span>
                    {[
                        { label: "Low", color: "#22c55e" },
                        { label: "Medium", color: "#3b82f6" },
                        { label: "High", color: "#f59e0b" },
                        { label: "Critical", color: "#ef4444" },
                    ].map(({ label, color }) => (
                        <span key={label} className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full" style={{ background: color }} />
                            <span style={{ color: "rgba(255,255,255,0.6)" }}>{label}</span>
                        </span>
                    ))}
                </div>
            )}

            {/* Map */}
            <div className="flex-1 p-4" style={{ minHeight: "calc(100vh - 150px)" }}>
                {loading ? (
                    <div className="flex items-center justify-center h-full min-h-[500px]">
                        <div className="text-center space-y-3">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: "var(--primary)" }} />
                            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Loading issue map...</p>
                        </div>
                    </div>
                ) : (
                    <div style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}>
                        <MapView reports={reports} filter={filter} showHeatmap={showHeatmap} />
                    </div>
                )}
            </div>
        </div>
    );
}
