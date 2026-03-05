type Priority = "P1" | "P2" | "P3" | "P4";

const priorityConfig: Record<
    Priority,
    { label: string; color: string; bg: string; border: string }
> = {
    P1: {
        label: "Critical",
        color: "#ef4444",
        bg: "rgba(239,68,68,0.15)",
        border: "rgba(239,68,68,0.4)",
    },
    P2: {
        label: "High",
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.15)",
        border: "rgba(245,158,11,0.4)",
    },
    P3: {
        label: "Medium",
        color: "#3b82f6",
        bg: "rgba(59,130,246,0.15)",
        border: "rgba(59,130,246,0.4)",
    },
    P4: {
        label: "Low",
        color: "#22c55e",
        bg: "rgba(34,197,94,0.15)",
        border: "rgba(34,197,94,0.4)",
    },
};

interface PriorityBadgeProps {
    priority: Priority;
    size?: "sm" | "md" | "lg";
}

export default function PriorityBadge({
    priority,
    size = "md",
}: PriorityBadgeProps) {
    const cfg = priorityConfig[priority];
    const padding =
        size === "sm" ? "2px 8px" : size === "lg" ? "6px 14px" : "3px 10px";
    const fontSize = size === "sm" ? "10px" : size === "lg" ? "14px" : "12px";

    return (
        <span
            className="inline-flex items-center gap-1 font-semibold rounded-full"
            style={{
                background: cfg.bg,
                color: cfg.color,
                border: `1px solid ${cfg.border}`,
                padding,
                fontSize,
            }}
        >
            <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: cfg.color }}
            />
            {priority} · {cfg.label}
        </span>
    );
}
