import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Specterfy | Privacy Pre-Processor",
  description:
    "A privacy-first pre-processing utility for Pennsylvania notaries. Sanitize sensitive PDFs before downstream workflow handling.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
