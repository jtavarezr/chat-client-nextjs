"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mic, MicOff, PhoneOff, Users } from "lucide-react"

interface Participant {
  id: string
  name: string
  avatar?: string
  isSpeaking: boolean
  isMuted: boolean
}

interface AudioCallProps {
  isGroup: boolean
  participants: Participant[]
  onEndCall: () => void
}

export function AudioCall({ isGroup, participants, onEndCall }: AudioCallProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [localParticipants, setLocalParticipants] = useState<Participant[]>(participants)

  // Simulate call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format call duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Toggle mute for local user
  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  // Simulate random participant speaking
  useEffect(() => {
    const speakingInterval = setInterval(() => {
      setLocalParticipants((prev) =>
        prev.map((p, i) => ({
          ...p,
          isSpeaking: Math.random() > 0.7 && !p.isMuted,
        })),
      )
    }, 1500)

    return () => clearInterval(speakingInterval)
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center">
          {isGroup ? (
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              <span className="font-medium">Group Call</span>
              <span className="ml-2 text-xs text-muted-foreground">({participants.length} participants)</span>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="font-medium">{participants[1]?.name}</span>
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground">{formatDuration(callDuration)}</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`grid gap-4 ${isGroup ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"} w-full max-w-3xl`}>
          {localParticipants.map((participant) => (
            <div
              key={participant.id}
              className={`flex flex-col items-center p-4 rounded-lg ${
                participant.isSpeaking ? "bg-primary/10 ring-2 ring-primary" : "bg-secondary"
              }`}
            >
              <Avatar className="h-16 w-16 mb-2">
                <AvatarImage src={participant.avatar || `/placeholder.svg?height=64&width=64`} />
                <AvatarFallback className="text-lg">
                  {participant.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-medium">{participant.name}</p>
                <p className="text-xs text-muted-foreground">
                  {participant.isMuted ? "Muted" : participant.isSpeaking ? "Speaking" : "Silent"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-border flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button variant="destructive" size="icon" className="h-12 w-12 rounded-full" onClick={onEndCall}>
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
