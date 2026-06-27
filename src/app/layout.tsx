import type { Metadata } from "next";
import { DM_Sans, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import "material-symbols";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "BrandAid - Proposal Generator",
  description: "Premium client proposal generation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${hankenGrotesk.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
