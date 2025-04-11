import type { Metadata } from "next"
import { ChatLayout } from "@/components/chat-layout"

export const metadata: Metadata = {
  title: "DevChat - Programmer's Chat Platform",
  description: "A modern chat system designed specifically for programmers",
}

export default function Home() {
  return <ChatLayout />
}
