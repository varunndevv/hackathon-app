"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, ArrowRight, Loader2, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\d{10}$/.test(phone)) {
            toast.error("Enter a valid 10-digit phone number");
            return;
        }

        setLoading(true);
        // Mock OTP/Signin
        setTimeout(() => {
            setLoading(false);
            localStorage.setItem("civicsync_auth", "true");
            window.dispatchEvent(new Event("civicsync_auth_change"));
            toast.success("Welcome back!");
            router.push("/dashboard");
        }, 1500);
    };

    const handlePasskeySignIn = async () => {
        if (!window.PublicKeyCredential) {
            toast.error("Passkeys are not supported on this device/browser.");
            return;
        }

        try {
            setLoading(true);
            // Trigger native browser Passkey prompt (WebAuthn)
            const assertion = await navigator.credentials.get({
                publicKey: {
                    challenge: new Uint8Array(32), // mock challenge
                    rpId: window.location.hostname,
                    userVerification: "preferred",
                },
            });

            if (assertion) {
                localStorage.setItem("civicsync_auth", "true");
                window.dispatchEvent(new Event("civicsync_auth_change"));
                toast.success("Passkey verified successfully!");
                router.push("/dashboard");
            }
        } catch (err: unknown) {
            // User cancelled or error occurred
            console.error(err);
            toast.error("Passkey sign-in cancelled or failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ paddingTop: "88px" }}>
            <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(99,102,241,0.10) 0%, transparent 70%)" }} />

            <div className="relative w-full max-w-md">
                <div className="glass-card p-8 space-y-7">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold text-white">Sign In to CivicSync</h1>
                        <p className="text-sm text-white/50">Report and track civic issues</p>
                    </div>

                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-white/45">
                                Mobile Number
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-sm font-medium text-white/50">+91</span>
                                <Phone className="absolute w-4 h-4 left-[52px] text-white/30" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="9876543210"
                                    autoComplete="tel"
                                    required
                                    className="w-full py-3 rounded-xl text-white text-sm outline-none transition-all"
                                    style={{
                                        paddingLeft: "76px",
                                        paddingRight: "16px",
                                        background: "rgba(255,255,255,0.06)",
                                        border: "1px solid rgba(255,255,255,0.10)",
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.55)")}
                                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
                            style={{ background: "var(--primary)", color: "#fff" }}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In with OTP"}
                        </button>
                    </form>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-white/10" />
                        <span className="flex-shrink-0 px-4 text-xs font-medium text-white/40 uppercase tracking-widest">
                            or
                        </span>
                        <div className="flex-grow border-t border-white/10" />
                    </div>

                    <button
                        onClick={handlePasskeySignIn}
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:bg-white/10 active:scale-[0.99] disabled:opacity-50"
                        style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                    >
                        <KeyRound className="w-4 h-4" />
                        Sign in with Passkey
                    </button>

                    <p className="text-center text-sm text-white/50">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
