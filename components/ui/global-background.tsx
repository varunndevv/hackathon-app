"use client";

import { usePathname } from "next/navigation";

export function GlobalBackground() {
    const pathname = usePathname();

    // Do not render on the home page as it has its own hero background
    if (pathname === "/") return null;

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-zinc-950">
            {/* Base ambient gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

            {/* 3D Perspective Grid */}
            <div
                className="absolute inset-[0_-200%_0_-200%] h-[200vh] w-[500%] top-1/2 -translate-y-1/2 opacity-20"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: "60px 60px",
                    transform: "perspective(1000px) rotateX(60deg) translateY(100px) translateZ(-200px)",
                    transformOrigin: "center top",
                    maskImage: "linear-gradient(to top, transparent, black 40%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to top, transparent, black 40%, transparent 100%)",
                }}
            >
                {/* Animated moving gradient light over the grid */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-transparent mix-blend-overlay animate-[spin_20s_linear_infinite]" />
            </div>

            {/* Floating Orbs for depth */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[128px] pointer-events-none mix-blend-screen" />

            {/* Vignette edge darkening */}
            <div className="absolute inset-0 bg-[#0A0A0B] [mask-image:radial-gradient(circle_at_center,transparent_0%,black_100%)] pointer-events-none opacity-80" />
        </div>
    );
}
