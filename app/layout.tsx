import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Lighthouse AI - The AI-powered way to do your spreadsheet work",
  description:
    "Transform your CSV files into enriched datasets with intelligent AI automation. Upload, enrich, and analyze your data with human-level precision.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
