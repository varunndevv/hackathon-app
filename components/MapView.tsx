"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapReport } from "@/lib/schemas";
import PriorityBadge from "./PriorityBadge";
import Link from "next/link";

// Fix leaflet default marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const priorityColors: Record<string, string> = {
    P1: "#ef4444",
    P2: "#f59e0b",
    P3: "#3b82f6",
    P4: "#22c55e",
};

function createPriorityIcon(priority: string) {
    const color = priorityColors[priority] ?? "#6366f1";
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
      <filter id="s" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.5)"/>
      </filter>
      <circle cx="16" cy="16" r="14" fill="${color}" filter="url(#s)"/>
      <circle cx="16" cy="16" r="8" fill="white" opacity="0.9"/>
      <circle cx="16" cy="16" r="4" fill="${color}"/>
      <line x1="16" y1="30" x2="16" y2="40" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `;
    return L.divIcon({
        html: svg,
        className: "",
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -42],
    });
}

interface MapViewProps {
    reports: MapReport[];
    filter?: { priority?: string; category?: string; status?: string };
}

export default function MapView({ reports, filter }: MapViewProps) {
    const filtered = reports.filter((r) => {
        if (filter?.priority && r.priority !== filter.priority) return false;
        if (filter?.category && r.category !== filter.category) return false;
        if (filter?.status && r.status !== filter.status) return false;
        return true;
    });

    return (
        <MapContainer
            center={[12.9716, 77.5946]} // Bengaluru center
            zoom={12}
            style={{ height: "100%", width: "100%", borderRadius: "16px" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filtered.map((report) => (
                <Marker
                    key={report.id}
                    position={[report.lat, report.lng]}
                    icon={createPriorityIcon(report.priority)}
                >
                    <Popup>
                        <div className="p-2 space-y-2 min-w-[160px]">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">
                                    {report.category === "pothole"
                                        ? "🕳️"
                                        : report.category === "garbage"
                                            ? "🗑️"
                                            : report.category === "broken_light"
                                                ? "💡"
                                                : report.category === "flooding"
                                                    ? "🌊"
                                                    : report.category === "water_leak"
                                                        ? "💧"
                                                        : "📋"}
                                </span>
                                <span className="font-semibold capitalize text-sm text-white">
                                    {report.category.replace(/_/g, " ")}
                                </span>
                            </div>
                            <PriorityBadge priority={report.priority} size="sm" />
                            <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                                👍 {report.upvoteCount} upvotes
                            </div>
                            <Link
                                href={`/dashboard`}
                                className="block text-xs font-medium text-center py-1.5 rounded-lg mt-1"
                                style={{ background: "var(--primary)", color: "#fff" }}
                            >
                                View Issue →
                            </Link>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
