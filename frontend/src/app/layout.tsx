import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
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

export const metadata: Metadata = {
  title: {
    default: "Bariwala Hub",
    template: "%s | Bariwala Hub",
  },
  description:
    "All-in-one property operations and financial management platform for Bangladesh. Manage properties, tenants, rent, utilities, expenses, and more.",
  keywords: [
    "property management",
    "rent management",
    "tenant management",
    "Bangladesh",
    "landlord",
    "bariwala",
    "utility billing",
    "expense tracking",
  ],
  authors: [{ name: "Bariwala Hub" }],
  openGraph: {
    title: "Bariwala Hub",
    description:
      "All-in-one property operations and financial management platform",
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
      className={`${inter.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Bariwala Hub",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description: "All-in-one property operations and financial management platform for Bangladesh.",
              offers: {
                "@type": "AggregateOffer",
                priceCurrency: "BDT",
                lowPrice: "999",
                highPrice: "1499",
                offerCount: "2",
              },
            }),
          }}
        />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
