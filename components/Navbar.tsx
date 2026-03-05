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
        supabase.auth.getSession().then(({ data }) => {
            setIsLoggedIn(!!data.session);
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
        });
        return () => listener.subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, []);

    const allLinks = isLoggedIn
        ? [...navLinks, { href: "/dashboard", label: "Dashboard" }]
        : navLinks;

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
            style={{
                background: scrolled
                    ? "rgba(15,15,19,0.85)"
                    : "rgba(15,15,19,0.4)",
                backdropFilter: "blur(16px)",
                borderBottom: scrolled
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid transparent",
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--primary)" }}
                    >
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">
                        Civic<span style={{ color: "var(--primary)" }}>Sync</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {allLinks.map((link) => {
                        const active = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                style={{
                                    color: active ? "#fff" : "rgba(255,255,255,0.6)",
                                    background: active ? "rgba(99,102,241,0.15)" : "transparent",
                                }}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                    {!isLoggedIn && (
                        <Link
                            href="/login"
                            className="ml-3 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                            style={{
                                background: "var(--primary)",
                                color: "#fff",
                            }}
                        >
                            Sign In
                        </Link>
                    )}
                </nav>

                {/* Mobile toggle */}
                <button
                    className="md:hidden p-2 rounded-lg"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div
                    className="md:hidden px-4 pb-4 space-y-1"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                >
                    {allLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="block px-4 py-3 rounded-lg text-sm font-medium"
                            style={{ color: "rgba(255,255,255,0.8)" }}
                            onClick={() => setIsOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {!isLoggedIn && (
                        <Link
                            href="/login"
                            className="block px-4 py-3 rounded-lg text-sm font-semibold mt-2"
                            style={{ background: "var(--primary)", color: "#fff" }}
                            onClick={() => setIsOpen(false)}
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
}
