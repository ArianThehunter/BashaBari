import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { Noto_Sans_Bengali } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { LanguageProvider } from "@/providers/language-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Inter carries no Bengali glyphs. Without this the Bangla interface falls back
// to whatever the OS happens to ship, which differs on every device.
const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BashaBari | Property Operations Platform for Bangladesh",
    template: "%s | BashaBari",
  },
  description:
    "All-in-one property operations and financial management platform for Bangladesh. Manage properties, tenants, rent, sub-meter utilities, expenses, and legal contracts.",
  keywords: [
    "BashaBari",
    "property management",
    "rent management",
    "tenant management",
    "Bangladesh",
    "landlord",
    "bariwala",
    "sub-meter utility billing",
    "DPDC",
    "DESCO",
    "DWASA",
    "expense tracking",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BashaBari",
  },
  openGraph: {
    title: "BashaBari | Property Operations Platform for Bangladesh",
    description:
      "All-in-one property operations and financial management platform for Bangladesh",
    type: "website",
    locale: "en_BD",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${notoSansBengali.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased bg-background text-foreground selection:bg-primary selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "BashaBari",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description: "All-in-one property operations and financial management platform for Bangladesh.",
              offers: {
                "@type": "AggregateOffer",
                priceCurrency: "BDT",
                lowPrice: "999",
                highPrice: "2499",
                offerCount: "2",
              },
            }),
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <QueryProvider>{children}</QueryProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
