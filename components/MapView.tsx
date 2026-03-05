/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat"; // side-effect only — adds L.heatLayer (safe: MapView is ssr:false)
import type { MapReport } from "@/lib/schemas";
import Link from "next/link";

// Fix default marker icons (Leaflet + bundlers issue)
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const PRIORITY_COLORS: Record<string, string> = {
    P1: "#ef4444",
    P2: "#f59e0b",
    P3: "#3b82f6",
    P4: "#22c55e",
};

const CATEGORY_EMOJI: Record<string, string> = {
    pothole: "🕳️",
    garbage: "🗑️",
    broken_light: "💡",
    flooding: "🌊",
    water_leak: "💧",
    other: "📋",
};

const PRIORITY_WEIGHT: Record<string, number> = {
    P1: 1.0, P2: 0.75, P3: 0.5, P4: 0.25,
};

function makePinIcon(priority: string): L.DivIcon {
    const color = PRIORITY_COLORS[priority] ?? "#6366f1";
    return L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="36" height="48">
      <circle cx="18" cy="18" r="16" fill="${color}" opacity="0.9"/>
      <circle cx="18" cy="18" r="8" fill="white"/>
      <circle cx="18" cy="18" r="4" fill="${color}"/>
      <line x1="18" y1="34" x2="18" y2="46" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
        className: "",
        iconSize: [36, 48] as [number, number],
        iconAnchor: [18, 48] as [number, number],
        popupAnchor: [0, -50] as [number, number],
    });
}

// ── Heatmap Layer (lazy-loads leaflet.heat plugin) ──────────────────────────
function HeatmapLayer({ points }: { points: Array<[number, number, number]> }) {
    const map = useMap();
    const layerRef = useRef<any>(null);

    useEffect(() => {
        if (!map || points.length === 0) return;
        let mounted = true;

        import("leaflet.heat").then(() => {
            if (!mounted) return;
            // leaflet.heat attaches itself to L
            const heat = (L as any).heatLayer(points, {
                radius: 35,
                blur: 25,
                maxZoom: 15,
                gradient: {
                    0.1: "#22c55e",
                    0.3: "#3b82f6",
                    0.6: "#f59e0b",
                    0.9: "#ef4444",
                    1.0: "#7f1d1d",
                },
            });
            heat.addTo(map);
            layerRef.current = heat;
        }).catch(() => {/* ignore if heat plugin unavailable */ });

        return () => {
            mounted = false;
            if (layerRef.current) {
                try { map.removeLayer(layerRef.current); } catch (_) { }
                layerRef.current = null;
            }
        };
    }, [map, points]);

    return null;
}

// ── MapView ─────────────────────────────────────────────────────────────────
interface Props {
    reports: MapReport[];
    filter?: { priority?: string; category?: string; status?: string };
    showHeatmap?: boolean;
}

export default function MapView({ reports, filter, showHeatmap = false }: Props) {
    const filtered = reports.filter((r) => {
        if (filter?.priority && r.priority !== filter.priority) return false;
        if (filter?.category && r.category !== filter.category) return false;
        if (filter?.status && r.status !== filter.status) return false;
        return true;
    });

    const maxUpvotes = Math.max(1, ...filtered.map((r) => r.upvoteCount));
    const heatPoints: Array<[number, number, number]> = filtered.map((r) => [
        r.lat,
        r.lng,
        (PRIORITY_WEIGHT[r.priority] ?? 0.5) * 0.6 + (r.upvoteCount / maxUpvotes) * 0.4,
    ]);

    return (
        <MapContainer
            center={[12.9716, 77.5946] as any}
            zoom={12}
            style={{ height: "100%", width: "100%", borderRadius: "16px" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Cluster layer */}
            {!showHeatmap && (
                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={60}
                    spiderfyOnMaxZoom
                    showCoverageOnHover={false}
                    iconCreateFunction={(cluster: any) => {
                        const n = cluster.getChildCount();
                        const size = n > 50 ? 52 : n > 20 ? 44 : n > 5 ? 38 : 32;
                        return L.divIcon({
                            html: `<div style="
                width:${size}px;height:${size}px;border-radius:50%;
                background:rgba(99,102,241,0.88);
                border:3px solid rgba(255,255,255,0.9);
                display:flex;align-items:center;justify-content:center;
                color:#fff;font-weight:700;font-size:${size < 38 ? 12 : 14}px;
                box-shadow:0 0 18px rgba(99,102,241,0.55);
              ">${n}</div>`,
                            className: "",
                            iconSize: [size, size] as [number, number],
                            iconAnchor: [size / 2, size / 2] as [number, number],
                        });
                    }}
                >
                    {filtered.map((report) => (
                        <Marker
                            key={report.id}
                            position={[report.lat, report.lng] as any}
                            icon={makePinIcon(report.priority)}
                        >
                            <Popup>
                                <div style={{ padding: "4px 0", minWidth: "150px" }}>
                                    <p style={{ fontSize: "15px", marginBottom: "4px" }}>
                                        {CATEGORY_EMOJI[report.category] ?? "📋"}{" "}
                                        <strong style={{ color: "#fff" }}>
                                            {report.category.replace(/_/g, " ")}
                                        </strong>
                                    </p>
                                    <span
                                        style={{
                                            display: "inline-block",
                                            padding: "2px 8px",
                                            borderRadius: "6px",
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            background: `${PRIORITY_COLORS[report.priority]}25`,
                                            color: PRIORITY_COLORS[report.priority],
                                            border: `1px solid ${PRIORITY_COLORS[report.priority]}50`,
                                            marginBottom: "6px",
                                        }}
                                    >
                                        {report.priority}
                                    </span>
                                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}>
                                        👍 {report.upvoteCount} · {report.status.replace(/_/g, " ")}
                                    </p>
                                    <Link
                                        href="/dashboard"
                                        style={{
                                            display: "block",
                                            textAlign: "center",
                                            padding: "6px",
                                            background: "#6366f1",
                                            color: "#fff",
                                            borderRadius: "8px",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            textDecoration: "none",
                                        }}
                                    >
                                        View →
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            )}

            {/* Heatmap layer */}
            {showHeatmap && <HeatmapLayer points={heatPoints} />}
        </MapContainer>
    );
}
