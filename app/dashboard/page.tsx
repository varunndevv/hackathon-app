"use client";

import { useState, useEffect } from "react";
import { Star, FileText, CheckCircle2, Clock, Loader2 } from "lucide-react";
import type { Report } from "@/lib/schemas";
import ReportCard from "@/components/ReportCard";
import StatusTimeline from "@/components/StatusTimeline";
import toast from "react-hot-toast";

export default function DashboardPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Report | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    useEffect(() => {
        fetch("/api/reports/my")
            .then((r) => r.json())
            .then((data) => setReports(Array.isArray(data) ? data : []))
            .catch(() => setReports([]))
            .finally(() => setLoading(false));
    }, []);

    const totalReports = reports.length;
    const resolved = reports.filter((r) => r.status === "resolved").length;
    const pending = totalReports - resolved;

    const handleFeedback = async (reportId: string) => {
        if (!rating) { toast.error("Please select a rating"); return; }
        setSubmittingFeedback(true);
        try {
            await fetch(`/api/reports/${reportId}/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, comment }),
            });
            toast.success("Feedback submitted. Thank you!");
            setSelected(null);
        } catch {
            toast.error("Failed to submit feedback");
        } finally {
            setSubmittingFeedback(false);
        }
    };

    return (
        <div className="min-h-screen px-4 py-12 max-w-4xl mx-auto" style={{ paddingTop: "88px" }}>
            <h1 className="text-3xl font-bold text-white mb-2">My Reports</h1>
            <p className="mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
                Track your civic reports and resolutions
            </p>

            {/* Summary bar */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: "My Reports", value: totalReports, Icon: FileText, color: "#6366f1" },
                    { label: "Resolved", value: resolved, Icon: CheckCircle2, color: "#22c55e" },
                    { label: "Pending", value: pending, Icon: Clock, color: "#f59e0b" },
                ].map(({ label, value, Icon, color }) => (
                    <div key={label} className="glass-card p-5 text-center">
                        <div className="mx-auto w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                            style={{ background: `${color}20` }}>
                            <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        <div className="text-2xl font-bold" style={{ color }}>{value}</div>
                        <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Reports list */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
                </div>
            ) : reports.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: "rgba(255,255,255,0.2)" }} />
                    <p className="text-white font-semibold mb-1">No reports yet</p>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                        Start by reporting a civic issue in your area.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reports.map((report) => (
                        <div key={report.id} className="space-y-4">
                            <ReportCard report={report} onClick={() => setSelected(selected?.id === report.id ? null : report)} />

                            {/* Expanded: timeline + resolution */}
                            {selected?.id === report.id && (
                                <div className="glass-card p-6 space-y-5 animate-fade-in ml-4">
                                    {/* Timeline */}
                                    <StatusTimeline events={report.timeline} />

                                    {/* Resolution card */}
                                    {report.status === "resolved" && (
                                        <div className="space-y-4 pt-4 border-t border-white/10">
                                            {report.resolutionPhotoUrl && (
                                                <div className="rounded-xl overflow-hidden">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={report.resolutionPhotoUrl} alt="Resolution proof"
                                                        className="w-full h-48 object-cover" />
                                                </div>
                                            )}
                                            <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                                                ✅ Resolved on:{" "}
                                                {report.resolvedAt
                                                    ? new Date(report.resolvedAt).toLocaleDateString("en-IN", {
                                                        day: "numeric", month: "long", year: "numeric",
                                                    })
                                                    : "—"}
                                            </p>

                                            {/* Feedback form */}
                                            <div className="p-4 rounded-xl space-y-3"
                                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                                <p className="text-sm font-semibold text-white">How would you rate the resolution?</p>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button key={star} onClick={() => setRating(star)}
                                                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                                                            style={{
                                                                background: rating >= star ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.05)",
                                                                border: `1px solid ${rating >= star ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`,
                                                            }}>
                                                            <Star className="w-4 h-4" style={{ color: rating >= star ? "#f59e0b" : "rgba(255,255,255,0.3)" }} />
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    placeholder="Optional comment..."
                                                    rows={2}
                                                    className="w-full px-3 py-2 rounded-xl text-sm text-white resize-none outline-none"
                                                    style={{
                                                        background: "rgba(255,255,255,0.05)",
                                                        border: "1px solid rgba(255,255,255,0.1)",
                                                    }}
                                                />
                                                <button
                                                    onClick={() => handleFeedback(report.id)}
                                                    disabled={submittingFeedback}
                                                    className="px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                                                    style={{ background: "var(--primary)", color: "#fff" }}>
                                                    {submittingFeedback ? <Loader2 className="w-3 h-3 animate-spin" /> : "Submit Feedback"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
