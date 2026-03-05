"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    AlertOctagon,
    CheckCircle2,
    TrendingUp,
    Clock,
    Copy,
    Loader2,
    ChevronDown,
    Upload,
    Brain,
} from "lucide-react";
import type { AdminReport, AdminStats } from "@/lib/schemas";
import PriorityBadge from "@/components/PriorityBadge";
import toast from "react-hot-toast";

const STATUSES = ["open", "assigned", "in_progress", "resolved"] as const;
type Status = typeof STATUSES[number];

const statusLabel: Record<Status, string> = {
    open: "Open",
    assigned: "Assigned",
    in_progress: "In Progress",
    resolved: "Resolved",
};

export default function AdminPage() {
    const router = useRouter();
    const [reports, setReports] = useState<AdminReport[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [wardSummary, setWardSummary] = useState<string>("");
    const [loading, setLoading] = useState(true);

    // Filters
    const [filterPriority, setFilterPriority] = useState("All");
    const [filterCategory, setFilterCategory] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");

    // Resolution modal
    const [resolvingId, setResolvingId] = useState<string | null>(null);
    const [resolutionFile, setResolutionFile] = useState<File | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (filterPriority !== "All") params.set("priority", filterPriority);
            if (filterCategory !== "All") params.set("category", filterCategory);
            if (filterStatus !== "All") params.set("status", filterStatus);

            const [reportsRes, statsRes, wardRes] = await Promise.all([
                fetch(`/api/admin/reports?${params}`),
                fetch("/api/admin/stats"),
                fetch("/api/admin/ward-summary"),
            ]);

            const [r, s, w] = await Promise.all([
                reportsRes.json(),
                statsRes.json(),
                wardRes.json(),
            ]);

            setReports(Array.isArray(r) ? r : []);
            setStats(s);
            setWardSummary(w?.summary ?? "");
        } catch {
            // Check for admin_auth cookie — if missing, redirect
            if (document.cookie.indexOf("admin_auth") === -1) {
                router.push("/admin/login");
            }
        } finally {
            setLoading(false);
        }
    }, [filterPriority, filterCategory, filterStatus, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusChange = async (reportId: string, newStatus: Status) => {
        if (newStatus === "resolved") {
            setResolvingId(reportId);
            return;
        }
        setUpdatingId(reportId);
        try {
            await fetch(`/api/admin/reports/${reportId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            toast.success("Status updated");
            fetchData();
        } catch {
            toast.error("Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleResolve = async () => {
        if (!resolvingId) return;
        setUpdatingId(resolvingId);
        try {
            let resolutionPhotoUrl: string | undefined;
            if (resolutionFile) {
                const fd = new FormData();
                fd.append("file", resolutionFile);
                const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
                const uploadData = await uploadRes.json();
                resolutionPhotoUrl = uploadData.url;
            }
            await fetch(`/api/admin/reports/${resolvingId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "resolved", resolutionPhotoUrl }),
            });
            toast.success("Issue marked as resolved!");
            setResolvingId(null);
            setResolutionFile(null);
            fetchData();
        } catch {
            toast.error("Failed to resolve issue");
        } finally {
            setUpdatingId(null);
        }
    };

    const selectStyle = {
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        color: "#fff",
        borderRadius: "10px",
        padding: "7px 10px",
        fontSize: "13px",
        outline: "none",
    };

    // Sort: P1 always on top
    const sorted = [...reports].sort((a, b) => {
        const order = { P1: 0, P2: 1, P3: 2, P4: 3 };
        return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
    });

    return (
        <div className="min-h-screen px-4 py-12 max-w-7xl mx-auto" style={{ paddingTop: "88px" }}>
            <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
                    <p style={{ color: "rgba(255,255,255,0.4)" }}>Manage all civic reports</p>
                </div>
                <span
                    className="px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
                >
                    🔒 Admin Access
                </span>
            </div>

            {/* Stats row */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: "Total", value: stats.total, Icon: TrendingUp, color: "#6366f1" },
                        { label: "Open P1", value: stats.openP1, Icon: AlertOctagon, color: "#ef4444" },
                        { label: "Resolved Today", value: stats.resolvedToday, Icon: CheckCircle2, color: "#22c55e" },
                        { label: "Avg Resolution", value: `${stats.avgResolutionHours}h`, Icon: Clock, color: "#3b82f6" },
                        { label: "Duplicate Rate", value: `${(stats.duplicateRate * 100).toFixed(1)}%`, Icon: Copy, color: "#a855f7" },
                    ].map(({ label, value, Icon, color }) => (
                        <div key={label} className="glass-card p-4 text-center">
                            <div className="mx-auto w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                                style={{ background: `${color}20` }}>
                                <Icon className="w-4 h-4" style={{ color }} />
                            </div>
                            <div className="text-xl font-bold" style={{ color }}>{value}</div>
                            <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* AI Ward Summary */}
            {wardSummary && (
                <div className="glass-card p-5 mb-6 flex items-start gap-3">
                    <div
                        className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
                        style={{ background: "rgba(99,102,241,0.15)" }}
                    >
                        <Brain className="w-5 h-5" style={{ color: "var(--primary)" }} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1"
                            style={{ color: "rgba(255,255,255,0.4)" }}>AI Ward Summary</p>
                        <p className="text-sm text-white">{wardSummary}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={selectStyle}>
                    {["All", "P1", "P2", "P3", "P4"].map((p) => (
                        <option key={p} value={p} style={{ background: "#1a1a2e" }}>
                            {p === "All" ? "All Priorities" : p}
                        </option>
                    ))}
                </select>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={selectStyle}>
                    {["All", "pothole", "garbage", "broken_light", "flooding", "water_leak", "other"].map((c) => (
                        <option key={c} value={c} style={{ background: "#1a1a2e" }}>
                            {c === "All" ? "All Categories" : c.replace(/_/g, " ")}
                        </option>
                    ))}
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
                    {["All", "open", "assigned", "in_progress", "resolved"].map((s) => (
                        <option key={s} value={s} style={{ background: "#1a1a2e" }}>
                            {s === "All" ? "All Statuses" : s.replace(/_/g, " ")}
                        </option>
                    ))}
                </select>
            </div>

            {/* Reports table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                                {["Thumbnail", "Category", "Priority", "Ward", "Upvotes", "Status", "Actions"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: "rgba(255,255,255,0.4)" }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((report) => (
                                <tr
                                    key={report.id}
                                    style={{
                                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                                        background: report.priority === "P1" ? "rgba(239,68,68,0.05)" : "transparent",
                                    }}
                                >
                                    {/* Thumbnail */}
                                    <td className="px-4 py-3">
                                        <div
                                            className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center text-xl"
                                            style={{ background: "rgba(255,255,255,0.05)" }}
                                        >
                                            {report.imageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={report.imageUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                { pothole: "🕳️", garbage: "🗑️", broken_light: "💡", flooding: "🌊", water_leak: "💧", other: "📋" }[report.category] ?? "📋"
                                            )}
                                        </div>
                                    </td>
                                    {/* Category */}
                                    <td className="px-4 py-3 text-sm text-white capitalize">
                                        {report.category.replace(/_/g, " ")}
                                    </td>
                                    {/* Priority */}
                                    <td className="px-4 py-3">
                                        <PriorityBadge priority={report.priority} size="sm" />
                                    </td>
                                    {/* Ward */}
                                    <td className="px-4 py-3 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                                        {report.ward || "—"}
                                    </td>
                                    {/* Upvotes */}
                                    <td className="px-4 py-3 text-sm text-white">
                                        👍 {report.upvoteCount}
                                    </td>
                                    {/* Status */}
                                    <td className="px-4 py-3">
                                        <div className="relative inline-flex items-center gap-1">
                                            <select
                                                value={report.status}
                                                onChange={(e) => handleStatusChange(report.id, e.target.value as Status)}
                                                disabled={updatingId === report.id}
                                                className="appearance-none pr-6 pl-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                                                style={{
                                                    background: "rgba(255,255,255,0.08)",
                                                    border: "1px solid rgba(255,255,255,0.12)",
                                                    color: "#fff",
                                                    outline: "none",
                                                }}
                                            >
                                                {STATUSES.map((s) => (
                                                    <option key={s} value={s} style={{ background: "#1a1a2e" }}>
                                                        {statusLabel[s]}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-1.5 w-3 h-3 pointer-events-none"
                                                style={{ color: "rgba(255,255,255,0.4)" }} />
                                        </div>
                                    </td>
                                    {/* Actions */}
                                    <td className="px-4 py-3">
                                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                                            {new Date(report.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric", month: "short",
                                            })}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                            {sorted.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-sm"
                                        style={{ color: "rgba(255,255,255,0.3)" }}>
                                        No reports found for the current filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Resolution Modal */}
            {resolvingId && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                >
                    <div className="glass-card p-6 w-full max-w-md space-y-5">
                        <h2 className="text-lg font-bold text-white">Mark as Resolved</h2>
                        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                            Upload a resolution proof photo (optional)
                        </p>
                        <label className="block">
                            <div
                                className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
                                style={{
                                    borderColor: resolutionFile ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.15)",
                                    background: resolutionFile ? "rgba(34,197,94,0.05)" : "rgba(255,255,255,0.02)",
                                }}
                            >
                                <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: "rgba(255,255,255,0.4)" }} />
                                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                                    {resolutionFile ? resolutionFile.name : "Click to upload photo"}
                                </p>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setResolutionFile(e.target.files?.[0] ?? null)}
                            />
                        </label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setResolvingId(null); setResolutionFile(null); }}
                                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    color: "rgba(255,255,255,0.7)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResolve}
                                disabled={!!updatingId}
                                className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ background: "#22c55e", color: "#fff" }}
                            >
                                {updatingId ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Resolved"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
