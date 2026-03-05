"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/report", label: "Report" },
    { href: "/map", label: "Map" },
    { href: "/contact", label: "Contact" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        // Check for mock login first for demo purposes
        const checkAuth = () => {
            const isMockAuth = typeof window !== "undefined" ? localStorage.getItem("civicsync_auth") === "true" : false;
            if (isMockAuth) {
                setIsLoggedIn(true);
            } else {
                supabase.auth.getSession().then(({ data }) => {
                    setIsLoggedIn(!!data.session);
                });
            }
        };

        checkAuth();

        // Listen for custom login events from the mock auth
        const handleAuthChange = () => checkAuth();
        window.addEventListener("civicsync_auth_change", handleAuthChange);

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (typeof window !== "undefined" && !localStorage.getItem("civicsync_auth")) {
                setIsLoggedIn(!!session);
            }
        });

        return () => {
            window.removeEventListener("civicsync_auth_change", handleAuthChange);
            listener.subscription.unsubscribe();
        };
    }, [pathname]);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, []);

    const allLinks = isLoggedIn
        ? [...navLinks, { href: "/dashboard", label: "Dashboard" }]
        : navLinks;

    return (
        <header className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4 sm:pt-6 pointer-events-none transition-all duration-500">
            {/* Premium Floating Glassmorphism Pill */}
            <div
                className={`w-full max-w-5xl flex items-center justify-between px-4 py-3 rounded-full pointer-events-auto transition-all duration-500 ${scrolled
                    ? "bg-zinc-950/70 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
                    : "bg-white/5 border border-white/5 shadow-2xl backdrop-blur-xl"
                    }`}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-400 opacity-90 group-hover:scale-110 transition-transform duration-500" />
                        <Zap className="w-4 h-4 text-white relative z-10 fill-white/20" />
                    </div>
                    <span className="font-semibold tracking-tight text-white text-lg">
                        Civic<span className="text-indigo-400 font-bold">Sync</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    <div className="flex items-center bg-white/5 p-1 rounded-full border border-white/5 mr-4">
                        {allLinks.map((link) => {
                            const active = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${active
                                        ? "text-white bg-white/10 shadow-sm"
                                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {!isLoggedIn && (
                        <Link
                            href="/login"
                            className="relative group overflow-hidden px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                            <span className="absolute inset-[1px] bg-zinc-950 rounded-full transition-all group-hover:bg-opacity-0" />
                            <span className="relative z-10 text-zinc-300 group-hover:text-white transition-colors">
                                Sign In
                            </span>
                        </Link>
                    )}
                </nav>

                {/* Mobile toggle */}
                <button
                    className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile menu dropdown */}
            <div
                className={`absolute top-20 left-4 right-4 md:hidden pointer-events-auto transition-all duration-300 origin-top overflow-hidden ${isOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"
                    }`}
            >
                <div className="bg-zinc-950/90 border border-white/10 shadow-2xl backdrop-blur-2xl rounded-3xl p-4 flex flex-col space-y-2">
                    {allLinks.map((link) => {
                        const active = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${active
                                    ? "bg-white/10 text-white"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    }`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                    {!isLoggedIn && (
                        <Link
                            href="/login"
                            className="mt-2 text-center px-4 py-3 rounded-2xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
