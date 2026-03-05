"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, Shield } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;
        setLoading(true);
        try {
            const res = await fetch("/api/admin/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Access granted");
                router.push("/admin");
            } else {
                toast.error("Invalid password");
            }
        } catch {
            toast.error("Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{ paddingTop: "64px" }}
        >
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse at center, rgba(239,68,68,0.08) 0%, transparent 60%)",
                }}
            />

            <div className="relative w-full max-w-sm">
                <div className="glass-card p-8 space-y-7">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div
                            className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                            style={{
                                background: "rgba(239,68,68,0.12)",
                                border: "1px solid rgba(239,68,68,0.25)",
                            }}
                        >
                            <Shield className="w-7 h-7" style={{ color: "#ef4444" }} />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Admin Access</h1>
                        <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                            City authority personnel only
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="text-xs font-semibold uppercase tracking-wider"
                                style={{ color: "rgba(255,255,255,0.45)" }}
                            >
                                Admin Password
                            </label>
                            <div className="relative">
                                <Lock
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                                    style={{ color: "rgba(255,255,255,0.3)" }}
                                />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter admin password"
                                    required
                                    className="w-full pl-11 pr-11 py-3 rounded-xl text-white text-sm outline-none"
                                    style={{
                                        background: "rgba(255,255,255,0.06)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                    }}
                                    onFocus={(e) =>
                                        (e.target.style.borderColor = "rgba(239,68,68,0.5)")
                                    }
                                    onBlur={(e) =>
                                        (e.target.style.borderColor = "rgba(255,255,255,0.1)")
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2"
                                    style={{ color: "rgba(255,255,255,0.3)" }}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: "#ef4444", color: "#fff" }}
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
