import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
    title: "CivicSync — Report. Verify. Resolve.",
    description:
        "AI-powered civic issue reporting for Bengaluru. Report potholes, garbage, broken lights, flooding, and more.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="min-h-screen" style={{ background: "var(--bg)" }}>
                <Navbar />
                <main>{children}</main>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: "rgba(30, 30, 45, 0.95)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.1)",
                            backdropFilter: "blur(12px)",
                        },
                    }}
                />
            </body>
        </html>
    );
}
