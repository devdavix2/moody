import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "MoodyFlicks - Movie Recommendations Based on Your Mood",
    template: "%s | MoodyFlicks",
  },
  description:
    "Discover movies that match your current mood with MoodyFlicks. Get personalized recommendations, create collections, and track your movie journey.",
  keywords: ["movies", "recommendations", "mood", "entertainment", "film", "cinema", "streaming"],
  authors: [{ name: "devdavix" }],
  creator: "devdavix",
  publisher: "MoodyFlicks",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
      },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://moodyflicks.vercel.app",
    title: "MoodyFlicks - Movie Recommendations Based on Your Mood",
    description:
      "Discover movies that match your current mood with MoodyFlicks. Get personalized recommendations, create collections, and track your movie journey.",
    siteName: "MoodyFlicks",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/android-chrome-192x192-e3w8N1d1BJdyZwefJRsrYeSETHEHTG.png",
        width: 192,
        height: 192,
        alt: "MoodyFlicks Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "MoodyFlicks - Movie Recommendations Based on Your Mood",
    description: "Discover movies that match your current mood with MoodyFlicks",
    creator: "@devdavix",
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/android-chrome-192x192-e3w8N1d1BJdyZwefJRsrYeSETHEHTG.png",
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020817" },
  ],
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'