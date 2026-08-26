import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { Footer } from "@/components/layout/Footer";
import { MainContent } from "@/components/layout/MainContent";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "VEYORA — Real Estate, Reimagined",
    template: "%s · VEYORA",
  },
  description:
    "VEYORA is Africa's next-generation real-estate marketplace: 3D property tours, live viewings, immersive video discovery, and verified agents across 11 countries.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export const viewport: Viewport = {
  themeColor: "#06070a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen bg-void-950 text-white">
        <Providers>
          <Navbar />
          <MainContent>{children}</MainContent>
          <Footer />
          <MobileTabBar />
        </Providers>
      </body>
    </html>
  );
}
