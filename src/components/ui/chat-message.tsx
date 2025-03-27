import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Message } from "@/components/kabbalah/chat";
import { Sparkles } from "lucide-react";

export interface ChatMessageProps {
  message: Message;
  className?: string;
}

export function ChatMessage({ message, className }: ChatMessageProps) {
  const isSystemMessage = message.sender === "system";
  const isUserMessage = message.sender === "user";
  const isTreeUpdate = message.isTreeUpdate;

  return (
    <Card
      className={cn(
        "max-w-[85%] transition-all shadow-sm",
        isUserMessage
          ? "bg-[var(--primary)] text-[var(--primary-foreground)] ml-auto rounded-tr-none"
          : isTreeUpdate
          ? "mx-auto bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] text-[var(--primary-foreground)]"
          : "bg-[var(--card)] text-[var(--card-foreground)] rounded-tl-none",
        className
      )}
    >
      <CardContent className="p-3">
        {isTreeUpdate && (
          <div className="flex items-center mb-1 gap-1 text-[var(--primary-foreground)]">
            <Sparkles className="h-3 w-3" />
            <p className="text-xs font-medium">Tree Updated</p>
          </div>
        )}

        {!isTreeUpdate && (
          <p className="text-sm font-medium mb-1">
            {isUserMessage ? "You" : "Guide"}
          </p>
        )}

        <p
          className={cn(
            "whitespace-pre-wrap",
            isSystemMessage && !isTreeUpdate && "text-[var(--foreground)]"
          )}
        >
          {message.content}
        </p>

        <p className="text-xs mt-1 opacity-70">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </CardContent>
    </Card>
  );
}
