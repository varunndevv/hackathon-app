"use client";

import { useEffect, useState } from "react";
import type { TriageResult } from "@/lib/schemas";
import PriorityBadge from "./PriorityBadge";
import {
    Loader2,
    CheckCircle2,
    Brain,
    MapPin,
    BookOpen,
    Ticket,
    ThumbsUp,
    AlertTriangle,
    Zap,
} from "lucide-react";

const STAGES = [
    { label: "Analyzing image...", Icon: Brain },
    { label: "Checking for nearby duplicates...", Icon: MapPin },
    { label: "Querying Bengaluru ward rules...", Icon: BookOpen },
    { label: "Generating ticket...", Icon: Ticket },
];

const categoryIcons: Record<string, string> = {
    pothole: "🕳️",
    garbage: "🗑️",
    broken_light: "💡",
    flooding: "🌊",
    water_leak: "💧",
    other: "📋",
};

interface TriageStreamProps {
    isLoading: boolean;
    currentStage?: number;
    result: TriageResult | null;
}

export default function TriageStream({
    isLoading,
    currentStage = 0,
    result,
}: TriageStreamProps) {
    const [animatedStage, setAnimatedStage] = useState(0);

    useEffect(() => {
        if (!isLoading) return;
        setAnimatedStage(0);
        const interval = setInterval(() => {
            setAnimatedStage((s) => {
                if (s < STAGES.length - 1) return s + 1;
                clearInterval(interval);
                return s;
            });
        }, 900);
        return () => clearInterval(interval);
    }, [isLoading]);

    const effectiveStage = isLoading ? animatedStage : currentStage;

    return (
        <div className="glass-card p-6 space-y-6 animate-fade-in">
            {/* Stages */}
            <div className="space-y-3">
                {STAGES.map((stage, i) => {
                    const done = !isLoading || i < effectiveStage;
                    const active = isLoading && i === effectiveStage;
                    const { Icon } = stage;
                    return (
                        <div
                            key={i}
                            className="flex items-center gap-3 transition-all duration-300"
                            style={{ opacity: !isLoading ? 1 : i <= effectiveStage ? 1 : 0.3 }}
                        >
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                style={{
                                    background: done && !isLoading
                                        ? "rgba(34,197,94,0.15)"
                                        : active
                                            ? "rgba(99,102,241,0.2)"
                                            : "rgba(255,255,255,0.05)",
                                    border: `1px solid ${done && !isLoading ? "rgba(34,197,94,0.4)" : active ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
                                }}
                            >
                                {active ? (
                                    <Loader2
                                        className="w-4 h-4 animate-spin"
                                        style={{ color: "var(--primary)" }}
                                    />
                                ) : !isLoading ? (
                                    <CheckCircle2 className="w-4 h-4" style={{ color: "#22c55e" }} />
                                ) : (
                                    <Icon
                                        className="w-4 h-4"
                                        style={{ color: "rgba(255,255,255,0.3)" }}
                                    />
                                )}
                            </div>
                            <span
                                className="text-sm font-medium"
                                style={{
                                    color:
                                        active
                                            ? "#fff"
                                            : done && !isLoading
                                                ? "rgba(255,255,255,0.7)"
                                                : "rgba(255,255,255,0.3)",
                                }}
                            >
                                {stage.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Result card */}
            {result && !isLoading && (
                <div className="border-t border-white/10 pt-6 space-y-4 animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">
                                {categoryIcons[result.category] ?? "📋"}
                            </span>
                            <div>
                                <h3 className="font-semibold capitalize text-white">
                                    {result.category.replace(/_/g, " ")}
                                </h3>
                                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                                    #{result.reportId?.slice(0, 8)}
                                </p>
                            </div>
                        </div>
                        <PriorityBadge priority={result.priority} size="lg" />
                    </div>

                    {/* Duplicate banner */}
                    {result.isDuplicate && (
                        <div
                            className="flex items-center gap-2 p-3 rounded-xl"
                            style={{
                                background: "rgba(245,158,11,0.1)",
                                border: "1px solid rgba(245,158,11,0.3)",
                            }}
                        >
                            <ThumbsUp className="w-4 h-4" style={{ color: "#f59e0b" }} />
                            <p className="text-sm" style={{ color: "#f59e0b" }}>
                                ⬆️ You&apos;re upvoting an existing report —{" "}
                                <strong>{result.upvoteCount ?? 0} citizens</strong> flagged this!
                            </p>
                        </div>
                    )}

                    {/* Info grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div
                            className="p-3 rounded-xl"
                            style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.07)",
                            }}
                        >
                            <p className="text-xs font-semibold uppercase tracking-wider mb-1"
                                style={{ color: "rgba(255,255,255,0.4)" }}>
                                AI Reasoning
                            </p>
                            <p className="text-sm text-white">{result.reasoning}</p>
                        </div>

                        <div
                            className="p-3 rounded-xl"
                            style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.07)",
                            }}
                        >
                            <p className="text-xs font-semibold uppercase tracking-wider mb-1"
                                style={{ color: "rgba(255,255,255,0.4)" }}>
                                Suggested Action
                            </p>
                            <p className="text-sm text-white">{result.suggestedAction}</p>
                        </div>

                        <div
                            className="p-3 rounded-xl sm:col-span-2"
                            style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.07)",
                            }}
                        >
                            <div className="flex items-center gap-1 mb-1">
                                <MapPin className="w-3 h-3" style={{ color: "rgba(255,255,255,0.4)" }} />
                                <p className="text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: "rgba(255,255,255,0.4)" }}>
                                    Ward Context
                                </p>
                            </div>
                            <p className="text-sm text-white">{result.wardContext}</p>
                        </div>
                    </div>

                    {/* Success */}
                    <div
                        className="flex items-center gap-2 p-3 rounded-xl"
                        style={{
                            background: "rgba(34,197,94,0.1)",
                            border: "1px solid rgba(34,197,94,0.3)",
                        }}
                    >
                        <Zap className="w-4 h-4" style={{ color: "#22c55e" }} />
                        <p className="text-sm font-medium" style={{ color: "#22c55e" }}>
                            {result.isDuplicate
                                ? "Your upvote has been recorded!"
                                : "Ticket created successfully!"}
                        </p>
                    </div>
                </div>
            )}

            {/* Loading placeholder when no result yet */}
            {isLoading && (
                <div className="flex items-center gap-2 text-sm"
                    style={{ color: "rgba(255,255,255,0.4)" }}>
                    <AlertTriangle className="w-4 h-4" />
                    AI is analyzing your issue...
                </div>
            )}
        </div>
    );
}
