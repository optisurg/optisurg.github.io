import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex-sans",
  display: "swap",
  weight: ["300", "400", "500"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "ONN Capstone | Optical Neural Network",
  description: "Real-time image-guided surgery segmentation via Optical Neural Networks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${plexSans.variable} ${plexMono.variable} bg-background text-foreground antialiased`}>
        <main id="main-content" className="relative min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
