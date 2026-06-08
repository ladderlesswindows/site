import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ladderless Windows | Premium No-Ladder Window Cleaning",
  description: "Professional exterior window cleaning for tall buildings and high-rises using advanced carbon fiber extension poles. No ladders. No risk. Serving the Bay Area and Central Coast.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${satoshi.variable} h-full antialiased bg-[#c3c3c3]`}>
      <body className="min-h-full flex flex-col bg-[#c3c3c3] text-neutral-950 font-sans">
        {children}
      </body>
    </html>
  );
}
