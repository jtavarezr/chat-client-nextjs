"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Menu, MoreVertical } from "lucide-react"

interface MobileHeaderProps {
  chatName: string
  onMenuClick: () => void
  rightElement?: React.ReactNode
}

export function MobileHeader({ chatName, onMenuClick, rightElement }: MobileHeaderProps) {
  return (
    <div className="h-14 border-b border-zinc-800 flex items-center px-4">
      <Button variant="ghost" size="icon" onClick={onMenuClick} className="mr-2">
        <Menu className="h-5 w-5" />
      </Button>
      <h2 className="text-lg font-medium flex-1">{chatName}</h2>
      {rightElement || (
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}
