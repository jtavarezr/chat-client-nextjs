"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/language-selector";
import { Play, Save, Share2, Users } from "lucide-react";
import { useChat } from "@/components/chat-context";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import axios from "axios";

export function CodeEditor() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState({
    javascript: `// Write your code here
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("Developer"));
`,
    python: `# Write your code here
def greet(name):
    return f"Hello, {name}!"
print(greet("Developer"))
`,
    java: `// Write your code here
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Developer!");
    }
}
`,
  });
  const [output, setOutput] = useState("");
  const { selectedChat, sendMessage } = useChat();

  // Judge0 API configuration
  const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";
  const JUDGE0_API_KEY = "6116f2ebe9mshe05eb679247b230p17cf94jsn07f2c29ca90f";

  // Handle code changes
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode((prev) => ({ ...prev, [language]: e.target.value }));
  };

  // Share code with chat
  const handleShareCode = () => {
    if (selectedChat) {
      const codeMessage = "```" + language + "\n" + code[language] + "\n```";
      sendMessage(codeMessage);
    }
  };

  // Run the code
  const handleRunCode = async () => {
    setOutput("");
    try {
      if (language === "javascript") {
        // Execute JavaScript locally
        const logs: string[] = [];
        const originalConsoleLog = console.log;
        console.log = (...args: any[]) => {
          logs.push(args.join(" "));
        };

        const result = eval(code.javascript);
        console.log = originalConsoleLog;

        const outputText = logs.join("\n") + (result !== undefined ? `\n${result}` : "");
        setOutput(outputText || "No output");
      } else if (language === "python") {
        // Execute Python via Judge0
        const response = await axios.post(
          `${JUDGE0_API_URL}/submissions?wait=true`,
          {
            source_code: code.python,
            language_id: 71, // Python 3
            stdin: "",
          },
          {
            headers: {
              "x-rapidapi-key": JUDGE0_API_KEY,
              "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
              "content-type": "application/json",
            },
          }
        );

        const result = response.data;
        if (result.status.id === 3) {
          setOutput(result.stdout || "No output");
        } else {
          setOutput(result.stderr || `Error: ${result.status.description}`);
        }
      } else if (language === "java") {
        // Execute Java via Judge0
        const response = await axios.post(
          `${JUDGE0_API_URL}/submissions?wait=true`,
          {
            source_code: code.java,
            language_id: 62, // Java
            stdin: "",
          },
          {
            headers: {
              "x-rapidapi-key": JUDGE0_API_KEY,
              "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
              "content-type": "application/json",
            },
          }
        );

        const result = response.data;
        if (result.status.id === 3) {
          setOutput(result.stdout || "No output");
        } else {
          setOutput(result.stderr || `Error: ${result.status.description}`);
        }
      } else {
        setOutput(`Execution not supported for ${language}`);
      }
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-2">
          <LanguageSelector
            value={language}
            onValueChange={setLanguage}
            options={["javascript", "python", "java"]}
          />
          <span className="text-sm text-gray-400">
            code-snippet.{language === "javascript" ? "js" : language === "python" ? "py" : "java"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
          >
            <Users className="h-4 w-4 mr-2" />
            Collaborate
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
            onClick={handleShareCode}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleRunCode}
          >
            <Play className="h-4 w-4 mr-2" />
            Run
          </Button>
        </div>
      </div>

      {/* Editor and Output */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="relative flex-1">
          {/* Syntax Highlighter for display */}
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: "1rem",
              height: "100%",
              background: "transparent",
            }}
            wrapLines
            showLineNumbers
          >
            {code[language]}
          </SyntaxHighlighter>
          {/* Transparent textarea for editing */}
          <textarea
            value={code[language]}
            onChange={handleCodeChange}
            className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white font-mono text-sm resize-none focus:outline-none"
            spellCheck="false"
            style={{ lineHeight: "1.5", tabSize: 2 }}
          />
        </div>
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <h3 className="text-sm font-semibold mb-2 text-gray-200">Output:</h3>
          <pre className="text-sm text-gray-300 bg-gray-900 p-2 rounded border border-gray-700 max-h-40 overflow-auto">
            {output || "Run the code to see the output"}
          </pre>
        </div>
      </div>

      {/* Status Bar */}
      <div className="p-2 border-t border-gray-700 bg-gray-800">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Collaboration: Enabled</span>
          <span className="text-xs text-gray-400">Line: 1, Column: 1</span>
        </div>
      </div>
    </div>
  );
}