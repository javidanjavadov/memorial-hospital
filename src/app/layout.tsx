import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import RouteChange from "@/components/route-change";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Memorial Hospital | Bakıdakı Müasir Klinik Xidmətlər Mərkəzi",
  description:
    "Memorial Hospital — Bakıdakı müasir klinik xidmətlər mərkəzi. Kardiologiya, nevrologiya, pediatriya, ortopediya və digər şöbələrdə peşəkar tibbi xidmət.",
  keywords: [
    "xəstəxana",
    "həkim",
    "qəbul",
    "kardioloq",
    "pediatr",
    "terapevt",
    "laboratoriya",
    "tibbi müayinə",
    "check-up",
    "bakı",
  ],
  openGraph: {
    title: "Memorial Hospital | Bakıdakı Müasir Klinik Xidmətlər Mərkəzi",
    description:
      "Memorial Hospital — Bakıdakı müasir klinik xidmətlər mərkəzi.",
    url: "https://memorialhospital.az",
    siteName: "Memorial Hospital",
    locale: "az_AZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" className={`${inter.variable} h-full antialiased`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1"><RouteChange>{children}</RouteChange></main>
        <Footer />
      </body>
    </html>
  );
}
