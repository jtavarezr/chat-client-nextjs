"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Smile, ImageIcon, Code, FileText, X, File } from "lucide-react";
import { cn } from "@/lib/utils";
import Picker from 'emoji-picker-react';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onFileUpload?: (file: File) => void;
  isLoading: boolean;
}

function FilePreview({ file, onRemove }: FilePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, [file]);

  const getFileIcon = () => {
    const fileIcons = {
      image: <ImageIcon className="h-4 w-4 text-blue-500" />,
      code: <Code className="h-4 w-4 text-yellow-500" />,
      pdf: <FileText className="h-4 w-4 text-red-500" />,
      doc: <FileText className="h-4 w-4 text-blue-700" />,
      default: <File className="h-4 w-4 text-gray-500" />,
    };

    if (file.type.startsWith("image/")) return fileIcons.image;
    if (/\.(js|ts|jsx|tsx)$/.test(file.name)) return fileIcons.code;
    if (file.name.endsWith(".pdf")) return fileIcons.pdf;
    if (/\.(doc|docx)$/.test(file.name)) return fileIcons.doc;
    return fileIcons.default;
  };

  return (
    <div className="flex items-center p-1 bg-gray-100 rounded-md w-full border">
      {preview ? (
        <img src={preview} alt="Preview" className="h-8 w-8 rounded object-cover mr-2" />
      ) : (
        <div className="flex items-center justify-center h-8 w-8 bg-white rounded mr-2">
          {getFileIcon()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-xs truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
      </div>
      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onRemove}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function ChatInput({ value, onChange, onSubmit, onFileUpload, isLoading }: ChatInputProps) {
  const [rows, setRows] = useState(1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRows(Math.min(5, Math.max(1, value.split("\n").length)));
  }, [value]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      setAttachedFile(file);
      e.target.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value.trim() && !attachedFile) return;

    // Primero enviamos el mensaje de texto
    if (value.trim()) onSubmit(e);
    
    // Luego, si hay un archivo adjunto, lo enviamos
    // pero solo si no hay texto, para evitar enviar dos mensajes separados
    if (attachedFile && onFileUpload && !value.trim()) {
      onFileUpload(attachedFile);
    } else if (attachedFile && onFileUpload) {
      // Si hay texto y archivo, enviamos el archivo como parte del mismo mensaje
      onFileUpload(attachedFile);
    }
    
    // Limpiamos el estado
    setAttachedFile(null);
    onChange({ target: { value: "" } } as React.ChangeEvent<HTMLTextAreaElement>);
    setShowEmojiPicker(false);
  };

  const onEmojiClick = (emojiObject) => {
    onChange({ target: { value: value + emojiObject.emoji } } as React.ChangeEvent<HTMLTextAreaElement>);
    setShowEmojiPicker(false);
  };

  return (
    <form onSubmit={handleSubmit} className="sticky bottom-0 z-10 w-full bg-background p-2 sm:p-4 shadow-lg">
      <div className="relative rounded-lg border bg-background">
        {attachedFile && (
          <div className="absolute top-2 left-2 max-w-[calc(100%-1rem)] z-20">
            <FilePreview file={attachedFile} onRemove={() => setAttachedFile(null)} />
          </div>
        )}
        <textarea
          value={value}
          onChange={onChange}
          placeholder="Escribe tu mensaje aquí..."
          className="w-full resize-none rounded-lg border-none p-3 pr-14 sm:p-4 text-sm focus:outline-none"
          rows={rows}
          style={{ minHeight: "60px", maxHeight: "150px", paddingTop: attachedFile ? "50px" : "12px" }}
        />
        <div className="absolute right-2 top-2 sm:right-3 sm:top-3 flex gap-1 sm:gap-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || (!value.trim() && !attachedFile)}
            className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-full", isLoading && "bg-primary/50")}
          >
            {isLoading ? (
              <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-t-transparent" />
            ) : (
              <Send className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </Button>
        </div>
      </div>
      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2 left-0 right-0 rounded-lg border bg-background p-2 sm:p-3 shadow-lg z-30">
          <Picker onEmojiClick={onEmojiClick} />
        </div>
      )}
    </form>
  );
}