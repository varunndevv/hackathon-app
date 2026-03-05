import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CivicSync AI — Public Issue Reporting for Bengaluru",
  description:
    "Report civic issues instantly with a single photo. AI-powered triage, real-time tracking, and community upvoting for Bengaluru.",
  keywords: ["civic", "report", "pothole", "garbage", "Bengaluru", "BBMP"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
