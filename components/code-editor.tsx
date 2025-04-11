"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language-selector"
import { Play, Save, Share2, Users } from "lucide-react"
import { useChat } from "@/components/chat-context"

export function CodeEditor() {
  const [language, setLanguage] = useState("javascript")
  const [code, setCode] = useState(`// Write your code here
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("Developer"));
`)
  const { selectedChat, sendMessage } = useChat()

  // Function to handle code changes
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value)

    // In a real implementation, you would emit this code change via socket.io
    // to enable real-time collaboration
    // For this demo, we'll simulate by sending a message when code changes stop
  }

  // Share code with the chat
  const handleShareCode = () => {
    if (selectedChat) {
      const codeMessage = "```" + language + "\n" + code + "\n```"
      sendMessage(codeMessage)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <LanguageSelector value={language} onValueChange={setLanguage} />
          <span className="text-sm text-muted-foreground">code-snippet.js</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="bg-secondary border-input hover:bg-secondary/80">
            <Users className="h-4 w-4 mr-2" />
            Collaborate
          </Button>
          <Button variant="outline" size="sm" className="bg-secondary border-input hover:bg-secondary/80">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-secondary border-input hover:bg-secondary/80"
            onClick={handleShareCode}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Play className="h-4 w-4 mr-2" />
            Run
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <textarea
          value={code}
          onChange={handleCodeChange}
          className="w-full h-full p-4 bg-background text-foreground font-mono text-sm resize-none focus:outline-none"
          spellCheck="false"
        />
      </div>

      <div className="p-2 border-t border-border bg-card">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Collaboration: Enabled</span>
          <span className="text-xs text-muted-foreground">Line: 1, Column: 1</span>
        </div>
      </div>
    </div>
  )
}
