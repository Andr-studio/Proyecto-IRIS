import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionSync from "@/components/auth/SessionSync";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Proyecto IRIS",
  description:
    "IRIS es una plataforma que unifica el seguimiento en tiempo real, la gestión de documentos y la colaboración multidevice en una sola plataforma elegante y poderosa.",
  keywords: ["SaaS", "productividad", "gestión de documentos", "colaboración", "tiempo real"],
  openGraph: {
    title: "Proyecto IRIS",
    description:
      "Claridad total en cada proyecto. Prueba IRIS hoy.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <SessionSync />
        {children}
      </body>
    </html>
  );
}
