import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CFDIGITAL · Plataforma Growth, Sales y Talent",
  description: "SaaS multiempresa de CFDIGITAL para Growth, Sales y Talent",
  icons: {
    icon: "/cfdigital-logo.png",
    apple: "/cfdigital-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
