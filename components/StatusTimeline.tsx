import type { StatusEvent } from "@/lib/schemas";
import { Check } from "lucide-react";

interface StatusTimelineProps {
    events: StatusEvent[];
}

export default function StatusTimeline({ events }: StatusTimelineProps) {
    return (
        <div className="flex flex-col gap-0">
            {events.map((event, i) => {
                const isLast = i === events.length - 1;
                return (
                    <div key={i} className="flex gap-3">
                        {/* Dot + line */}
                        <div className="flex flex-col items-center">
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                style={{
                                    background: event.done
                                        ? "rgba(34,197,94,0.2)"
                                        : "rgba(255,255,255,0.07)",
                                    border: `2px solid ${event.done ? "#22c55e" : "rgba(255,255,255,0.15)"}`,
                                }}
                            >
                                {event.done && (
                                    <Check className="w-3 h-3" style={{ color: "#22c55e" }} />
                                )}
                            </div>
                            {!isLast && (
                                <div
                                    className="w-px flex-1 mt-1 mb-1"
                                    style={{
                                        background: event.done
                                            ? "rgba(34,197,94,0.3)"
                                            : "rgba(255,255,255,0.08)",
                                        minHeight: "24px",
                                    }}
                                />
                            )}
                        </div>

                        {/* Content */}
                        <div className={`pb-4 ${isLast ? "pb-0" : ""}`}>
                            <p
                                className="text-sm font-medium"
                                style={{
                                    color: event.done ? "#fff" : "rgba(255,255,255,0.4)",
                                }}
                            >
                                {event.label}
                            </p>
                            {event.date && (
                                <p
                                    className="text-xs mt-0.5"
                                    style={{ color: "rgba(255,255,255,0.3)" }}
                                >
                                    {event.date}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
