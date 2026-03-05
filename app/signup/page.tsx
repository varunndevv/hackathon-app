"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Calendar, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", phone: "", age: "" });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim()) { toast.error("Please enter your name"); return; }
        if (!/^\d{10}$/.test(form.phone)) { toast.error("Enter a valid 10-digit phone number"); return; }
        const age = parseInt(form.age);
        if (isNaN(age) || age < 10 || age > 120) { toast.error("Enter a valid age"); return; }

        setLoading(true);
        try {
            // Find prefix from fields or default to +91
            const prefix = "+91";
            // Actually create user in Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                phone: prefix + form.phone,
                password: "civicsync-passkey-user", // Default dummy password since we want them to use passkeys/OTP
                options: {
                    data: {
                        full_name: form.name,
                        age: age,
                    }
                }
            });

            if (error) throw error;

            setSuccess(true);
            localStorage.setItem("civicsync_auth", "true");
            window.dispatchEvent(new Event("civicsync_auth_change"));
            toast.success("Account created in database successfully!");

            // Prompt for passkey creation
            tryCreatePasskey();
        } catch (err: any) {
            toast.error(err.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    const tryCreatePasskey = async () => {
        if (window.PublicKeyCredential) {
            try {
                await navigator.credentials.create({
                    publicKey: {
                        challenge: new Uint8Array(32),
                        rp: { name: "CivicSync", id: window.location.hostname },
                        user: {
                            id: new Uint8Array(16),
                            name: form.phone,
                            displayName: form.name
                        },
                        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
                        authenticatorSelection: { userVerification: "preferred" },
                    }
                });
                toast.success("Passkey saved to your device!");
            } catch (err) {
                // Ignore errors if user cancels passkey creation during signup
            }
        }
        router.push("/dashboard");
    };

    const fields = [
        { name: "name", label: "Full Name", type: "text", placeholder: "Aditya Kumar", Icon: User, autoComplete: "name" },
        { name: "phone", label: "Mobile Number", type: "tel", placeholder: "9876543210", Icon: Phone, autoComplete: "tel", prefix: "+91" },
        { name: "age", label: "Age", type: "number", placeholder: "24", Icon: Calendar, autoComplete: "off", min: "10", max: "120" },
    ] as const;

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ paddingTop: "88px" }}>
            <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(99,102,241,0.10) 0%, transparent 70%)" }} />

            <div className="relative w-full max-w-md">
                <div className="glass-card p-8 space-y-7">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold text-white">
                            {success ? "Welcome! 🎉" : "Join CivicSync"}
                        </h1>
                        <p className="text-sm text-white/50">
                            {success ? "Setting up your account..." : "Create an account to report missing infrastructure"}
                        </p>
                    </div>

                    {success ? (
                        <div className="flex flex-col items-center py-6 space-y-4">
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                            <p className="text-white font-semibold text-lg text-center">
                                Account Created!<br />
                                <span className="text-sm text-white/50 font-normal">You can now set up a Passkey for quick login.</span>
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {fields.map(({ name, label, type, placeholder, Icon, autoComplete, ...rest }) => {
                                const prefix = 'prefix' in rest ? rest.prefix : null;
                                return (
                                    <div key={name} className="space-y-1.5">
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-white/45">
                                            {label}
                                        </label>
                                        <div className="relative flex items-center">
                                            {prefix && <span className="absolute left-4 text-sm font-medium text-white/50">{prefix}</span>}
                                            <Icon className="absolute w-4 h-4 text-white/30" style={{ left: prefix ? "52px" : "14px" }} />
                                            <input
                                                name={name}
                                                type={type}
                                                value={form[name as keyof typeof form]}
                                                onChange={handleChange}
                                                placeholder={placeholder}
                                                autoComplete={autoComplete}
                                                required
                                                {...('prefix' in rest ? { ...rest, prefix: undefined } : rest)}
                                                className="w-full py-3 rounded-xl text-white text-sm outline-none transition-all"
                                                style={{
                                                    paddingLeft: prefix ? "76px" : "42px",
                                                    paddingRight: "16px",
                                                    background: "rgba(255,255,255,0.06)",
                                                    border: "1px solid rgba(255,255,255,0.10)",
                                                }}
                                                onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.55)")}
                                                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
                                style={{ background: "var(--primary)", color: "#fff" }}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign Up <ArrowRight className="w-4 h-4" /></>}
                            </button>

                            <p className="text-center text-sm text-white/50 pt-2">
                                Already have an account?{" "}
                                <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                                    Sign In
                                </Link>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
