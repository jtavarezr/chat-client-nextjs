"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy, Play } from "lucide-react"
import { LanguageSelector } from "@/components/language-selector"

interface CodeBlockProps {
  language: string
  code: string
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [output, setOutput] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState(language || "plaintext")

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExecute = () => {
    setExecuting(true)
    // Simulate code execution
    setTimeout(() => {
      setExecuting(false)
      if (
        selectedLanguage === "javascript" ||
        selectedLanguage === "js" ||
        selectedLanguage === "jsx" ||
        selectedLanguage === "tsx"
      ) {
        try {
          // This is just a simulation - in a real app, you'd use a secure sandbox
          setOutput("// Output would appear here\n// (Execution is simulated for demo purposes)")
        } catch (error) {
          setOutput(`Error: ${error}`)
        }
      } else if (selectedLanguage === "python" || selectedLanguage === "py") {
        setOutput("# Python execution output\n# (Simulation for demo purposes)")
      } else if (selectedLanguage === "java") {
        setOutput("// Java execution output\n// (Simulation for demo purposes)")
      } else if (selectedLanguage === "csharp" || selectedLanguage === "cs") {
        setOutput("// C# execution output\n// (Simulation for demo purposes)")
      } else {
        setOutput(`Execution for ${selectedLanguage} is not supported in this demo`)
      }
    }, 1000)
  }

  const isExecutable = ["javascript", "js", "jsx", "tsx", "python", "py", "java", "csharp", "cs"].includes(
    selectedLanguage.toLowerCase(),
  )

  return (
    <div className="relative rounded-md bg-zinc-900 mb-4 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-zinc-800">
        <LanguageSelector value={selectedLanguage} onValueChange={setSelectedLanguage} />
        <div className="flex items-center space-x-2">
          {isExecutable && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleExecute} disabled={executing}>
              {executing ? (
                <>
                  <div className="h-3 w-3 border-2 border-t-transparent border-white rounded-full animate-spin mr-1" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  <span>Run</span>
                </>
              )}
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>
      <pre className={`p-4 overflow-x-auto language-${selectedLanguage}`}>
        <code className="text-sm font-mono text-zinc-100">{code}</code>
      </pre>

      {output && (
        <div className="border-t border-zinc-800 bg-zinc-950">
          <div className="px-4 py-2 text-xs text-zinc-400">Output</div>
          <pre className="p-4 overflow-x-auto bg-black bg-opacity-30">
            <code className="text-sm font-mono text-zinc-300">{output}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
