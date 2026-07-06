import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CuraPix — Your space for your taste",
  description:
    "CuraPix is a social movie discovery and curation platform. Rate, review, and swipe your way to your next favorite film.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7C6FE0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white antialiased">
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
