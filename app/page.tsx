"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Camera,
    Brain,
    Wrench,
    AlertOctagon,
    Trash2,
    Zap,
    Waves,
    Droplets,
    HelpCircle,
    Construction,
    TrendingUp,
    Clock,
    CheckCircle2,
} from "lucide-react";
import type { Stats } from "@/lib/schemas";

const categories = [
    { label: "Pothole", icon: Construction, color: "#f59e0b" },
    { label: "Garbage", icon: Trash2, color: "#22c55e" },
    { label: "Broken Light", icon: Zap, color: "#eab308" },
    { label: "Flooding", icon: Waves, color: "#3b82f6" },
    { label: "Water Leak", icon: Droplets, color: "#06b6d4" },
    { label: "Other", icon: HelpCircle, color: "#8b5cf6" },
];

const howItWorks = [
    {
        step: "01",
        title: "Upload Photo",
        desc: "Take a photo of the civic issue. Our AI handles the rest.",
        Icon: Camera,
        color: "#6366f1",
    },
    {
        step: "02",
        title: "AI Triage",
        desc: "Instant categorization, priority scoring, and duplicate detection.",
        Icon: Brain,
        color: "#a855f7",
    },
    {
        step: "03",
        title: "City Fixes It",
        desc: "Ticket routed to the right department. Track resolution in real time.",
        Icon: Wrench,
        color: "#ec4899",
    },
];

export default function LandingPage() {
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        fetch("/api/stats")
            .then((r) => r.json())
            .then(setStats)
            .catch(() => { });
    }, []);

    return (
        <div className="min-h-screen" style={{ paddingTop: "64px" }}>
            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden px-4 pt-24 pb-20 text-center">
                {/* Background glow blobs */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
                    }}
                />

                <div className="relative max-w-4xl mx-auto">
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
                        style={{
                            background: "rgba(99,102,241,0.15)",
                            border: "1px solid rgba(99,102,241,0.3)",
                            color: "#a5b4fc",
                        }}
                    >
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        AI-Powered Civic Reporting · Bengaluru
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                        <span className="gradient-text">Report.</span>{" "}
                        <span style={{ color: "rgba(255,255,255,0.9)" }}>Verify.</span>{" "}
                        <span className="gradient-text">Resolve.</span>
                    </h1>

                    <p
                        className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
                        style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                        Snap a photo of any civic issue — potholes, broken lights, flooding.
                        Our AI triages it instantly and routes it to the right city
                        department.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="/report"
                            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-200 hover:scale-105 animate-pulse-glow"
                            style={{ background: "var(--primary)" }}
                        >
                            <Camera className="w-5 h-5" />
                            Report an Issue
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/map"
                            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-200 hover:scale-105"
                            style={{
                                background: "rgba(255,255,255,0.07)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                color: "#fff",
                            }}
                        >
                            View Map
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Live Stats ────────────────────────────────────────────────── */}
            <section className="px-4 py-12">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        {
                            label: "Total Reports",
                            value: stats?.total ?? "—",
                            Icon: TrendingUp,
                            color: "#6366f1",
                        },
                        {
                            label: "Resolved Today",
                            value: stats?.resolvedToday ?? "—",
                            Icon: CheckCircle2,
                            color: "#22c55e",
                        },
                        {
                            label: "Avg Resolution",
                            value: stats ? `${stats.avgResolutionHours}h` : "—",
                            Icon: Clock,
                            color: "#3b82f6",
                        },
                        {
                            label: "Active P1 Issues",
                            value: stats?.openP1 ?? "—",
                            Icon: AlertOctagon,
                            color: "#ef4444",
                        },
                    ].map(({ label, value, Icon, color }) => (
                        <div
                            key={label}
                            className="glass-card p-5 text-center hover:scale-[1.02] transition-transform duration-200"
                        >
                            <div
                                className="mx-auto w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                                style={{ background: `${color}22` }}
                            >
                                <Icon className="w-5 h-5" style={{ color }} />
                            </div>
                            <div
                                className="text-2xl font-bold mb-1"
                                style={{ color }}
                            >
                                {value}
                            </div>
                            <div
                                className="text-xs font-medium"
                                style={{ color: "rgba(255,255,255,0.45)" }}
                            >
                                {label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How It Works ─────────────────────────────────────────────── */}
            <section className="px-4 py-16">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-white mb-2">
                        How It Works
                    </h2>
                    <p
                        className="text-center mb-12"
                        style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                        Three steps from photo to fix
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {howItWorks.map(({ step, title, desc, Icon, color }) => (
                            <div key={step} className="glass-card p-7 relative group">
                                <div
                                    className="absolute top-5 right-5 text-5xl font-black opacity-10"
                                    style={{ color }}
                                >
                                    {step}
                                </div>
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                                    style={{ background: `${color}20` }}
                                >
                                    <Icon className="w-6 h-6" style={{ color }} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                                <p
                                    className="text-sm leading-relaxed"
                                    style={{ color: "rgba(255,255,255,0.5)" }}
                                >
                                    {desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Issue Categories ─────────────────────────────────────────── */}
            <section className="px-4 py-16">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-white mb-2">
                        Issue Categories
                    </h2>
                    <p
                        className="text-center mb-12"
                        style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                        We handle everything in your city
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {categories.map(({ label, icon: Icon, color }) => (
                            <Link
                                key={label}
                                href="/report"
                                className="glass-card p-5 flex flex-col items-center gap-3 hover:scale-105 transition-transform duration-200 group"
                            >
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                    style={{ background: `${color}20` }}
                                >
                                    <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" style={{ color }} />
                                </div>
                                <span className="text-xs font-semibold text-center text-white/70">
                                    {label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Footer ───────────────────────────────────────────────────── */}
            <footer
                className="px-4 py-8 text-center"
                style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: "var(--primary)" }}
                        >
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold">
                            Civic<span style={{ color: "var(--primary)" }}>Sync</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                        <Link href="/contact" className="hover:text-white transition-colors">
                            Contact
                        </Link>
                        <Link href="/map" className="hover:text-white transition-colors">
                            Map
                        </Link>
                        <Link href="/admin/login" className="hover:text-white transition-colors">
                            Admin
                        </Link>
                    </div>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                        © 2026 CivicSync · Bengaluru
                    </p>
                </div>
            </footer>
        </div>
    );
}
