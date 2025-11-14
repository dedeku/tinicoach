import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "tinicoach - Teen Life Coaching",
  description: "Solution-Focused Teen Life Coaching App",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "tinicoach",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF4315",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" className={montserrat.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

