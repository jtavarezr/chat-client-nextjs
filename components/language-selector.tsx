"use client"

import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"

interface Language {
  id: string
  name: string
  icon?: string
}

const languages: Language[] = [
  { id: "javascript", name: "JavaScript", icon: "js" },
  { id: "python", name: "Python", icon: "py" },
  { id: "java", name: "Java", icon: "java" },
  { id: "csharp", name: "C#", icon: "cs" },
  { id: "cpp", name: "C++", icon: "cpp" },
  { id: "go", name: "Go", icon: "go" },
  { id: "rust", name: "Rust", icon: "rs" },
  { id: "ruby", name: "Ruby", icon: "rb" },
  { id: "php", name: "PHP", icon: "php" },
  { id: "swift", name: "Swift", icon: "swift" },
  { id: "kotlin", name: "Kotlin", icon: "kt" },
  { id: "html", name: "HTML", icon: "html" },
  { id: "css", name: "CSS", icon: "css" },
  { id: "sql", name: "SQL", icon: "sql" },
  { id: "bash", name: "Bash/Shell", icon: "sh" },
  { id: "plaintext", name: "Plain Text", icon: "txt" },
  { id: "typescript", name: "TypeScript", icon: "ts" },
]

interface LanguageSelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function LanguageSelector({ value, onValueChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false)
  const selectedLanguage = languages.find((lang) => lang.id === value) || languages[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[180px] justify-between bg-secondary border-muted"
        >
          <div className="flex items-center">
            {selectedLanguage.icon && (
              <span className="mr-2 rounded px-1 bg-muted text-xs font-mono">{selectedLanguage.icon}</span>
            )}
            {selectedLanguage.name}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 bg-popover border-border">
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem
                  key={language.id}
                  value={language.name}
                  onSelect={() => {
                    onValueChange(language.id)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center">
                    {language.icon && (
                      <span className="mr-2 rounded px-1 bg-muted text-xs font-mono">{language.icon}</span>
                    )}
                    {language.name}
                  </div>
                  <Check className={`ml-auto h-4 w-4 ${value === language.id ? "opacity-100" : "opacity-0"}`} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
