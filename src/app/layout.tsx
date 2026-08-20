import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ProfileGate from "@/components/profile-gate";
import { I18nProvider } from "@/i18n/client";
import { getDictionary, getLocale } from "@/i18n";
import { htmlLang } from "@/i18n/config";
import FloatingBasket from "@/components/floating-basket";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageTransition from "@/components/page-transition";
import RouteLoader from "@/components/route-loader";
import StoreHydration from "@/components/store-hydration";
import BasketHydration from "@/components/basket-hydration";
import AuthSessionProvider from "@/components/session-provider";
import StructuredData from "@/components/structured-data";
import { siteName, siteUrl } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

/*
 * Display face. A geometric grotesk rather than a serif: the serif read as
 * traditional, which is the opposite of what a modern clinic should look like.
 * This keeps the headings distinctive without borrowing an editorial register.
 */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#267B8D",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Memorial Hospital | Bakıdakı Müasir Klinik Xidmətlər Mərkəzi",
    template: `%s | ${siteName}`,
  },
  description:
    "Memorial Hospital — Bakıdakı müasir klinik xidmətlər mərkəzi. Kardiologiya, nevrologiya, pediatriya, ortopediya və digər şöbələrdə peşəkar tibbi xidmət.",
  applicationName: siteName,
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
  alternates: { canonical: "/" },
  openGraph: {
    title: "Memorial Hospital | Bakıdakı Müasir Klinik Xidmətlər Mərkəzi",
    description:
      "Memorial Hospital — Bakıdakı müasir klinik xidmətlər mərkəzi.",
    url: siteUrl,
    siteName,
    locale: "az_AZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Memorial Hospital | Bakıdakı Müasir Klinik Xidmətlər Mərkəzi",
    description:
      "Memorial Hospital — Bakıdakı müasir klinik xidmətlər mərkəzi.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolved on the server, so the first byte of HTML is already in the
  // visitor's language — no flash of Azerbaijani while a bundle loads.
  const locale = await getLocale()
  const dict = await getDictionary(locale)

  return (
    <html
      lang={htmlLang[locale]}
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <head>
        {/*
          Scroll-reveal sections start at opacity 0 and are revealed by an
          IntersectionObserver. With scripting disabled that observer never runs,
          so this reveals them instead of leaving the page blank. A <noscript>
          style block is used rather than a class-adding inline script, which
          would mutate <html> before hydration and cause a mismatch.
        */}
        <noscript
          /*
           * Must be injected as raw HTML: with scripting enabled the browser
           * parses <noscript> contents as plain text and builds no child
           * elements, so a JSX <style> child would fail to hydrate and take the
           * whole page subtree down with it.
           */
          dangerouslySetInnerHTML={{
            __html: `<style>
              .scroll-hidden,
              .scroll-hidden-down,
              .scroll-hidden-left,
              .scroll-hidden-right,
              .scroll-hidden-scale,
              .stagger-children > * {
                opacity: 1 !important;
                transform: none !important;
              }
            </style>`,
          }}
        />
        <StructuredData />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthSessionProvider>
          <I18nProvider locale={locale} dict={dict}>
          <a href="#main-content" className="skip-link">
            {dict.nav.skipToContent}
          </a>
          <StoreHydration />
          <BasketHydration />
          <RouteLoader />
          <Navbar />
          <main id="main-content" className="flex-1" tabIndex={-1}>
            <ProfileGate>
              <PageTransition>{children}</PageTransition>
            </ProfileGate>
          </main>
          <Footer />
          <FloatingBasket />
          </I18nProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
