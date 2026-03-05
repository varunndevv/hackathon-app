import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string | number;
    Icon: LucideIcon;
    color?: string;
    subtitle?: string;
}

export default function StatCard({
    label,
    value,
    Icon,
    color = "#6366f1",
    subtitle,
}: StatCardProps) {
    return (
        <div
            className="glass-card p-6 flex flex-col gap-3 hover:scale-[1.02] transition-transform duration-200"
        >
            <div className="flex items-center justify-between">
                <span
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                >
                    {label}
                </span>
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}22` }}
                >
                    <Icon className="w-5 h-5" style={{ color }} />
                </div>
            </div>
            <div
                className="text-3xl font-bold tracking-tight"
                style={{ color }}
            >
                {value}
            </div>
            {subtitle && (
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {subtitle}
                </div>
            )}
        </div>
    );
}
