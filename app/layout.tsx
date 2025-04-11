import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/hooks/use-theme"
import { ChatProvider } from "@/components/chat-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DevChat - Programmer's Chat Platform",
  description: "A modern chat system designed specifically for programmers",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <ChatProvider>{children}</ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'