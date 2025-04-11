"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Laptop, Paintbrush } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/hooks/use-theme"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          {theme === "light" && <Sun className="h-5 w-5" />}
          {theme === "dark" && <Moon className="h-5 w-5" />}
          {theme === "system" && <Laptop className="h-5 w-5" />}
          {theme === "emerald" && <Paintbrush className="h-5 w-5 text-emerald-500" />}
          {theme === "purple" && <Paintbrush className="h-5 w-5 text-purple-500" />}
          {theme === "blue" && <Paintbrush className="h-5 w-5 text-blue-500" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
        <DropdownMenuItem onClick={() => setTheme("light")} className="text-zinc-300 hover:text-white focus:text-white">
          <Sun className="h-4 w-4 mr-2" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="text-zinc-300 hover:text-white focus:text-white">
          <Moon className="h-4 w-4 mr-2" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="text-zinc-300 hover:text-white focus:text-white"
        >
          <Laptop className="h-4 w-4 mr-2" />
          <span>System</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          onClick={() => setTheme("emerald")}
          className="text-zinc-300 hover:text-white focus:text-white"
        >
          <Paintbrush className="h-4 w-4 mr-2 text-emerald-500" />
          <span>Emerald</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("purple")}
          className="text-zinc-300 hover:text-white focus:text-white"
        >
          <Paintbrush className="h-4 w-4 mr-2 text-purple-500" />
          <span>Purple</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("blue")} className="text-zinc-300 hover:text-white focus:text-white">
          <Paintbrush className="h-4 w-4 mr-2 text-blue-500" />
          <span>Blue</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
