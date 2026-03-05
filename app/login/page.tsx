"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Shield, Smartphone, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

type Step = "email" | "otp" | "passkey";

export default function LoginPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) throw error;
            setStep("otp");
            toast.success("Check your email for a verification code!");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) return;
        setLoading(true);
        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: "email",
            });
            if (error) throw error;
            toast.success("Logged in successfully!");
            router.push("/report");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Invalid code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{ paddingTop: "64px" }}
        >
            {/* Background glow */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse at center, rgba(99,102,241,0.1) 0%, transparent 60%)",
                }}
            />

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="glass-card p-8 space-y-7">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div
                            className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}
                        >
                            <Shield className="w-7 h-7" style={{ color: "var(--primary)" }} />
                        </div>
                        <h1 className="text-2xl font-bold text-white">
                            {step === "email" && "Welcome to CivicSync"}
                            {step === "otp" && "Check Your Email"}
                            {step === "passkey" && "Use Passkey"}
                        </h1>
                        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                            {step === "email" && "Enter your email to continue"}
                            {step === "otp" && `We sent a code to ${email}`}
                            {step === "passkey" && "Authenticate with your device"}
                        </p>
                    </div>

                    {/* Step: Email */}
                    {step === "email" && (
                        <form onSubmit={handleEmail} className="space-y-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: "rgba(255,255,255,0.5)" }}
                                >
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                                        style={{ color: "rgba(255,255,255,0.3)" }}
                                    />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full pl-11 pr-4 py-3 rounded-xl text-white text-sm outline-none focus:ring-2 transition-all"
                                        style={{
                                            background: "rgba(255,255,255,0.06)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            focusRing: "var(--primary)",
                                        }}
                                        onFocus={(e) =>
                                            (e.target.style.borderColor = "rgba(99,102,241,0.6)")
                                        }
                                        onBlur={(e) =>
                                            (e.target.style.borderColor = "rgba(255,255,255,0.1)")
                                        }
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                                style={{ background: "var(--primary)", color: "#fff" }}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        Continue
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step: OTP */}
                    {step === "otp" && (
                        <form onSubmit={handleOtp} className="space-y-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="otp"
                                    className="text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: "rgba(255,255,255,0.5)" }}
                                >
                                    Verification Code
                                </label>
                                <input
                                    id="otp"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="123456"
                                    maxLength={6}
                                    required
                                    className="w-full px-4 py-3 rounded-xl text-white text-center text-2xl font-mono tracking-widest outline-none transition-all"
                                    style={{
                                        background: "rgba(255,255,255,0.06)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                    }}
                                    onFocus={(e) =>
                                        (e.target.style.borderColor = "rgba(99,102,241,0.6)")
                                    }
                                    onBlur={(e) =>
                                        (e.target.style.borderColor = "rgba(255,255,255,0.1)")
                                    }
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ background: "var(--primary)", color: "#fff" }}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Verify Code"
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep("email")}
                                className="w-full text-sm text-center"
                                style={{ color: "rgba(255,255,255,0.4)" }}
                            >
                                ← Back to email
                            </button>
                        </form>
                    )}

                    {/* Passkey option */}
                    {step === "email" && (
                        <div className="text-center">
                            <div
                                className="text-xs mb-3"
                                style={{ color: "rgba(255,255,255,0.3)" }}
                            >
                                — or sign in with —
                            </div>
                            <button
                                onClick={() => setStep("passkey")}
                                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    color: "rgba(255,255,255,0.8)",
                                }}
                            >
                                <Smartphone className="w-4 h-4" />
                                Passkey (Biometric / PIN)
                            </button>
                        </div>
                    )}

                    {/* Passkey step */}
                    {step === "passkey" && (
                        <div className="text-center space-y-4">
                            <div
                                className="mx-auto w-20 h-20 rounded-full flex items-center justify-center animate-pulse"
                                style={{
                                    background: "rgba(99,102,241,0.15)",
                                    border: "2px solid rgba(99,102,241,0.4)",
                                }}
                            >
                                <Smartphone className="w-10 h-10" style={{ color: "var(--primary)" }} />
                            </div>
                            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                                Use your device&apos;s biometric or PIN to authenticate
                            </p>
                            <button
                                type="button"
                                onClick={() => setStep("email")}
                                className="text-sm"
                                style={{ color: "rgba(255,255,255,0.4)" }}
                            >
                                ← Use email instead
                            </button>
                        </div>
                    )}
                </div>

                {/* Tagline */}
                <p
                    className="text-center text-xs mt-6"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                >
                    Secure authentication powered by Supabase
                </p>
            </div>
        </div>
    );
}
