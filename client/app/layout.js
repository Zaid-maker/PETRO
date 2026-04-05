import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function getBaseUrl() {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (!candidate) {
    return new URL("http://localhost:3000");
  }

  const normalized = candidate.startsWith("http") ? candidate : `https://${candidate}`;
  return new URL(normalized);
}

export const metadata = {
  metadataBase: getBaseUrl(),
  applicationName: "Petro Watch",
  title: {
    default: "Petro Watch",
    template: "%s | Petro Watch",
  },
  description:
    "Live Pakistan fuel price monitoring with crisis updates, modeled city availability, and Brent crude tracking.",
  keywords: [
    "Pakistan fuel prices",
    "petrol price Pakistan",
    "diesel price Pakistan",
    "Brent crude",
    "Petro Watch",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Petro Watch",
    siteName: "Petro Watch",
    description:
      "Track live Pakistan fuel prices, Brent crude, and city-level availability in one dashboard.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Petro Watch",
    description:
      "Track live Pakistan fuel prices, Brent crude, and city-level availability in one dashboard.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
