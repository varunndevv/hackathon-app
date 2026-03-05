import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { GlobalBackground } from "@/components/ui/global-background";

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
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
            </head>
            <body className="min-h-screen relative" style={{ background: "var(--bg)" }}>
                <GlobalBackground />
                <Navbar />
                <main className="relative z-10">{children}</main>
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
