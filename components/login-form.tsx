"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Code } from "lucide-react"

interface LoginFormProps {
  onLogin: (userId: string) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [userId, setUserId] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!userId.trim()) {
      setError("Por favor ingresa un nombre de usuario")
      setIsLoading(false)
      return
    }

    // Validate username (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(userId)) {
      setError("El nombre de usuario solo puede contener letras, números y guiones bajos")
      setIsLoading(false)
      return
    }

    // Simulate a small delay to show loading state
    setTimeout(() => {
      onLogin(userId)
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-primary/20 p-3 rounded-full">
              <Code className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">DevChat</CardTitle>
          <CardDescription>Plataforma de chat para programadores</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="userId">Nombre de usuario</Label>
                <Input
                  id="userId"
                  placeholder="Ingresa tu nombre de usuario"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="bg-secondary border-input"
                  disabled={isLoading}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
