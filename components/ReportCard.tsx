import type { Report } from "@/lib/schemas";
import PriorityBadge from "./PriorityBadge";
import { ThumbsUp, MapPin } from "lucide-react";

const categoryIcons: Record<string, string> = {
    pothole: "🕳️",
    garbage: "🗑️",
    broken_light: "💡",
    flooding: "🌊",
    water_leak: "💧",
    other: "📋",
};

const statusConfig: Record<
    string,
    { label: string; color: string }
> = {
    open: { label: "Open", color: "#f59e0b" },
    assigned: { label: "Assigned", color: "#3b82f6" },
    in_progress: { label: "In Progress", color: "#a855f7" },
    resolved: { label: "Resolved", color: "#22c55e" },
};

interface ReportCardProps {
    report: Report;
    onClick?: () => void;
}

export default function ReportCard({ report, onClick }: ReportCardProps) {
    const status = statusConfig[report.status] ?? {
        label: report.status,
        color: "#fff",
    };

    return (
        <div
            className="glass-card p-5 flex gap-4 cursor-pointer hover:scale-[1.01] transition-transform duration-200"
            onClick={onClick}
        >
            {/* Thumbnail */}
            <div
                className="w-20 h-20 rounded-xl shrink-0 flex items-center justify-center text-3xl"
                style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    overflow: "hidden",
                }}
            >
                {report.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={report.imageUrl}
                        alt={report.category}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span>{categoryIcons[report.category] ?? "📋"}</span>
                )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                    <PriorityBadge priority={report.priority} size="sm" />
                    <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                            background: `${status.color}22`,
                            color: status.color,
                            border: `1px solid ${status.color}44`,
                        }}
                    >
                        {status.label}
                    </span>
                </div>

                <h3
                    className="text-sm font-semibold capitalize mb-1 truncate"
                    style={{ color: "#fff" }}
                >
                    {report.category.replace(/_/g, " ")}
                </h3>

                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {new Date(report.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })}
                </p>

                <div
                    className="flex items-center gap-3 mt-2"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                >
                    <span className="flex items-center gap-1 text-xs">
                        <ThumbsUp className="w-3 h-3" />
                        {report.upvoteCount}
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                        <MapPin className="w-3 h-3" />
                        Report
                    </span>
                </div>
            </div>
        </div>
    );
}
