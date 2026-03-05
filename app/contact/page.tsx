"use client";

import { useState } from "react";
import { Phone, Clock, Search, MapPin } from "lucide-react";

const departments = [
    { name: "BBMP Roads", issues: "Potholes, Road damage", contact: "1533", emoji: "🛣️", color: "#f59e0b" },
    { name: "BBMP Solid Waste", issues: "Garbage, Waste disposal", contact: "1533", emoji: "🗑️", color: "#22c55e" },
    { name: "BESCOM", issues: "Broken streetlights, Power", contact: "1912", emoji: "💡", color: "#eab308" },
    { name: "BWSSB", issues: "Water leaks, Supply", contact: "1916", emoji: "💧", color: "#06b6d4" },
    { name: "BBMP Stormwater", issues: "Flooding, Drainage", contact: "080-22975650", emoji: "🌊", color: "#3b82f6" },
    { name: "General", issues: "Other civic issues", contact: "080-22221188", emoji: "📋", color: "#8b5cf6" },
];

const slaRows = [
    { priority: "P1 Critical", time: "4 hours", color: "#ef4444" },
    { priority: "P2 High", time: "24 hours", color: "#f59e0b" },
    { priority: "P3 Medium", time: "72 hours", color: "#3b82f6" },
    { priority: "P4 Low", time: "7 days", color: "#22c55e" },
];

const wardOffices = [
    { ward: "Koramangala (Ward 68)", address: "Ward Office, 80 Feet Rd, Koramangala, Bengaluru - 560034" },
    { ward: "Indiranagar (Ward 84)", address: "Ward Office, 100 Feet Rd, Indiranagar, Bengaluru - 560038" },
    { ward: "Jayanagar (Ward 154)", address: "Ward Office, 4th Block, Jayanagar, Bengaluru - 560041" },
    { ward: "Whitefield (Ward 85)", address: "Ward Office, Whitefield Main Rd, Bengaluru - 560066" },
    { ward: "Hebbal (Ward 6)", address: "Ward Office, Hebbal, Bengaluru - 560024" },
    { ward: "HSR Layout (Ward 172)", address: "Ward Office, Sector 7, HSR Layout, Bengaluru - 560102" },
    { ward: "Majestic (Ward 115)", address: "Ward Office, KG Rd, Majestic, Bengaluru - 560009" },
    { ward: "Marathahalli (Ward 150)", address: "Ward Office, Marathahalli, Bengaluru - 560037" },
];

export default function ContactPage() {
    const [query, setQuery] = useState("");

    const filtered = query.trim()
        ? wardOffices.filter(
            (w) =>
                w.ward.toLowerCase().includes(query.toLowerCase()) ||
                w.address.toLowerCase().includes(query.toLowerCase())
        )
        : wardOffices;

    return (
        <div className="min-h-screen px-4 py-12 max-w-5xl mx-auto" style={{ paddingTop: "88px" }}>
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">City Authorities</h1>
                <p style={{ color: "rgba(255,255,255,0.5)" }}>
                    Know which department handles which issue and how to reach them.
                </p>
            </div>

            {/* Department cards */}
            <section className="mb-12">
                <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                    <Phone className="w-5 h-5" style={{ color: "var(--primary)" }} />
                    Departments
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.map((dept) => (
                        <div
                            key={dept.name}
                            className="glass-card p-6 hover:scale-[1.02] transition-transform duration-200"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                                    style={{ background: `${dept.color}20` }}
                                >
                                    {dept.emoji}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white text-sm">{dept.name}</h3>
                                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                                        {dept.issues}
                                    </p>
                                </div>
                            </div>
                            <a
                                href={`tel:${dept.contact}`}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold w-fit transition-all hover:opacity-80"
                                style={{
                                    background: `${dept.color}18`,
                                    color: dept.color,
                                    border: `1px solid ${dept.color}30`,
                                }}
                            >
                                <Phone className="w-3.5 h-3.5" />
                                {dept.contact}
                            </a>
                        </div>
                    ))}
                </div>
            </section>

            {/* SLA Table */}
            <section className="mb-12">
                <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                    <Clock className="w-5 h-5" style={{ color: "var(--primary)" }} />
                    Resolution SLA
                </h2>
                <div className="glass-card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: "rgba(255,255,255,0.4)" }}>Priority</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: "rgba(255,255,255,0.4)" }}>Expected Resolution</th>
                            </tr>
                        </thead>
                        <tbody>
                            {slaRows.map((row, i) => (
                                <tr
                                    key={row.priority}
                                    style={{ borderBottom: i < slaRows.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                                >
                                    <td className="px-6 py-4">
                                        <span
                                            className="text-sm font-semibold px-3 py-1 rounded-full"
                                            style={{
                                                background: `${row.color}18`,
                                                color: row.color,
                                                border: `1px solid ${row.color}30`,
                                            }}
                                        >
                                            {row.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-white font-medium">{row.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Ward Office Finder */}
            <section>
                <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                    <MapPin className="w-5 h-5" style={{ color: "var(--primary)" }} />
                    Ward Office Finder
                </h2>
                <div className="relative mb-4">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                    />
                    <input
                        type="text"
                        placeholder="Search ward name or area..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl text-white text-sm outline-none"
                        style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                </div>
                <div className="space-y-2">
                    {filtered.length === 0 ? (
                        <p className="text-sm text-center py-6" style={{ color: "rgba(255,255,255,0.35)" }}>
                            No ward offices found
                        </p>
                    ) : (
                        filtered.map((w) => (
                            <div key={w.ward} className="glass-card px-5 py-4 flex items-start gap-3">
                                <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
                                <div>
                                    <p className="text-sm font-semibold text-white">{w.ward}</p>
                                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                                        {w.address}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
