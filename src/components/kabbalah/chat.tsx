import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/components/ui/chat-message";
import { Send, Loader2, Sparkles, Glasses } from "lucide-react";
import { KabbalahAgent } from "@/lib/kabbalah-agent";
import {
  TreeOfLife,
  SephirahStructure,
  PathStructure,
} from "@/app/models/TreeOfLife.interface";
import traditionalTreeOfLife from "@/data/kabbalah/TreeOfLifeData";
import { toast } from "sonner";

export type Message = {
  id: string;
  sender: "user" | "system";
  content: string;
  timestamp: Date;
  isTreeUpdate?: boolean;
};

export interface KabbalahChatProps {
  className?: string;
  onTreeUpdate?: (tree: TreeOfLife) => void;
}

export function KabbalahChat({ className, onTreeUpdate }: KabbalahChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "system",
      content:
        "Welcome to the Kabbalistic Tree of Life creator. Share your story, dreams, life situation, or a topic that interests you. I'll create a personalized Tree of Life visualization that reflects your unique journey and grows with our conversation.",
      timestamp: new Date(),
    },
    {
      id: "2",
      sender: "system",
      content:
        "You can be as specific or abstract as you like - speak about your career, relationships, spiritual journey, creative pursuits, or simply describe your current state of mind.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const agentRef = useRef<KabbalahAgent>(new KabbalahAgent());
  const [mounted, setMounted] = useState(true);

  // Component mount/unmount effect
  useEffect(() => {
    setMounted(true);

    return () => {
      // Set flag indicating component is unmounted
      setMounted(false);
    };
  }, []);

  // Suggested prompts for users
  const suggestedPrompts = [
    "I'm starting a new career in technology and feel both excited and nervous.",
    "I've been going through a difficult breakup and trying to find meaning.",
    "I'm working on a creative project and looking for inspiration.",
    "I'm on a spiritual journey seeking deeper understanding of myself.",
    "I feel stuck in life and unsure which direction to take next.",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize agent with knowledge base
    const initAgent = async () => {
      try {
        await agentRef.current.loadKnowledgeBase();
        agentRef.current.setCurrentTree(traditionalTreeOfLife);
      } catch (error) {
        console.error("Failed to initialize Kabbalah agent:", error);
        // Add error message to chat
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: "system",
            content:
              "I'm having trouble connecting to the knowledge base. Some features may be limited.",
            timestamp: new Date(),
          },
        ]);
        // Show error toast
        toast.error("Connection issue", {
          description: "Failed to load knowledge base. Please try again later.",
        });
      }
    };
    initAgent();
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Add thinking message
    const thinkingMessage: Message = {
      id: "thinking",
      sender: "system",
      content: "✨ Contemplating the Tree of Life...",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, thinkingMessage]);

    // Use AbortController for cleanup
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      // Get response from agent
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to get response: ${response.status}`);
      }

      // Only proceed if component is still mounted (check with a flag)
      const data = await response.json();
      console.log("Chat API response:", data);

      // Remove thinking message and add system response
      if (mounted) {
        setMessages((prev) => {
          // Double-check component is mounted by checking if thinking message exists
          if (!prev.some((m) => m.id === "thinking")) return prev;

          return prev
            .filter((m) => m.id !== "thinking")
            .concat({
              id: Date.now().toString(),
              sender: "system",
              content: data.message,
              timestamp: new Date(),
            });
        });
      }

      // Check if response contains a TreeOfLife object
      if (mounted && data.treeUpdate && typeof data.treeUpdate === "object") {
        console.log("Tree update received:", data.treeUpdate);

        // Validate that it matches the TreeOfLife interface
        if (
          data.treeUpdate.sephiroth &&
          data.treeUpdate.paths &&
          Array.isArray(data.treeUpdate.sephiroth) &&
          Array.isArray(data.treeUpdate.paths) &&
          data.treeUpdate.sephiroth.length > 0 &&
          data.treeUpdate.paths.length > 0
        ) {
          try {
            // Start with a deep copy of the traditional tree to ensure structure is preserved
            const baseTree = JSON.parse(JSON.stringify(traditionalTreeOfLife));

            // Create validated tree, ensuring we maintain the core structure
            const validatedTree: TreeOfLife = {
              ...baseTree,
              // Keep original name/layout but allow updates from response
              name: data.treeUpdate.name || baseTree.name,
              description: data.treeUpdate.description || baseTree.description,
              layout: data.treeUpdate.layout || baseTree.layout,
              // Preserve metadata with potential updates
              metadata: {
                ...baseTree.metadata,
                ...data.treeUpdate.metadata,
                lastModified: new Date().toISOString(),
              },
              // Preserve visual settings with potential updates
              visualSettings: {
                ...baseTree.visualSettings,
                ...data.treeUpdate.visualSettings,
              },
            };

            // Carefully merge sephiroth data, ensuring positions remain consistent
            validatedTree.sephiroth = baseTree.sephiroth.map(
              (baseSephirah: SephirahStructure) => {
                // Find the corresponding sephirah in the update
                const updateSephirah = data.treeUpdate.sephiroth.find(
                  (s: any) =>
                    s.id === baseSephirah.id || s.number === baseSephirah.number
                );

                if (!updateSephirah) {
                  return baseSephirah; // Keep original if no update exists
                }

                // Create merged sephirah with updated properties but preserved position
                return {
                  ...baseSephirah,
                  // Only update color and description, not structural properties
                  color: updateSephirah.color || baseSephirah.color,
                  description:
                    updateSephirah.description || baseSephirah.description,
                  // Store traditional description in a separate property
                  traditionalDescription: baseSephirah.description,
                  // Always preserve the original position to maintain structure
                  position: baseSephirah.position,
                  renderOptions: {
                    ...baseSephirah.renderOptions,
                    // Only update glow properties
                    glowIntensity:
                      updateSephirah.renderOptions?.glowIntensity ||
                      baseSephirah.renderOptions?.glowIntensity ||
                      0.8,
                    glowColor:
                      updateSephirah.renderOptions?.glowColor ||
                      baseSephirah.renderOptions?.glowColor ||
                      baseSephirah.color,
                  },
                };
              }
            );

            // Merge paths data
            const mergedPaths = [...baseTree.paths];

            // Update existing paths with any changes
            mergedPaths.forEach((basePath: PathStructure, index: number) => {
              const updatePath = data.treeUpdate.paths.find(
                (p: any) =>
                  (p.sourceId === basePath.sourceId &&
                    p.targetId === basePath.targetId) ||
                  (p.sourceId === basePath.targetId &&
                    p.targetId === basePath.sourceId)
              );

              if (updatePath) {
                mergedPaths[index] = {
                  ...basePath,
                  // Only update color and description, not structural properties
                  color: updatePath.color || basePath.color,
                  description: updatePath.description || basePath.description,
                  // Store traditional description separately
                  traditionalDescription: basePath.description,
                  // Keep some original properties for consistency
                  curved: basePath.curved,
                  controlPoint: basePath.controlPoint,
                  renderOptions: {
                    ...basePath.renderOptions,
                    thickness:
                      updatePath.renderOptions?.thickness ||
                      basePath.renderOptions?.thickness ||
                      0.12,
                    opacity:
                      updatePath.renderOptions?.opacity ||
                      basePath.renderOptions?.opacity ||
                      0.8,
                  },
                };
              }
            });

            validatedTree.paths = mergedPaths;

            // Update the tree in the parent component
            if (onTreeUpdate) {
              console.log(
                "Updating tree with preserved structure:",
                validatedTree
              );
              onTreeUpdate(validatedTree);

              // Add a visual notification that the tree was updated
              const updateMessage: Message = {
                id: `tree-update-${Date.now()}`,
                sender: "system",
                content: `🌳 The Tree of Life has been updated to reflect your journey.`,
                timestamp: new Date(),
                isTreeUpdate: true,
              };
              setMessages((prev) => [...prev, updateMessage]);

              // Show a toast notification
              toast.success("Tree of Life Updated", {
                description:
                  "Your personalized Tree of Life visualization has been updated.",
                icon: <Sparkles className="h-4 w-4" />,
                duration: 4000,
              });
            }

            // Fire the onTreeUpdate callback if provided
            onTreeUpdate?.(validatedTree);

            // Update agent's current tree
            agentRef.current.setCurrentTree(validatedTree);
          } catch (error) {
            console.error("Error processing tree update:", error);
            toast.error("Processing Error", {
              description:
                "There was an error updating the Tree of Life visualization.",
            });
          }
        } else {
          console.error("Invalid tree update structure:", data.treeUpdate);
        }
      } else {
        console.log("No tree update in response");
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Error getting response:", error);

      // Show error message only if the component is still mounted
      if (mounted) {
        setMessages((prev) => {
          // Check if thinking message still exists (component is mounted)
          if (!prev.some((m) => m.id === "thinking")) return prev;

          return prev
            .filter((m) => m.id !== "thinking")
            .concat({
              id: Date.now().toString(),
              sender: "system",
              content:
                "I apologize, but I'm having trouble connecting to the wisdom of the Tree of Life. Please try again in a moment.",
              timestamp: new Date(),
            });
        });

        toast.error("Connection Issue", {
          description:
            "Failed to connect to the Kabbalah interpreter. Please try again.",
        });
      }
    } finally {
      if (mounted) {
        setIsLoading(false);
      }
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="p-4 border-b border-[var(--border)] bg-[var(--card-30)] backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--primary)]" />
          <h2 className="text-xl font-semibold">Tree of Life Creator</h2>
        </div>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          Share your story, and watch the Tree transform
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            className={cn(
              message.id === "thinking" && "animate-pulse",
              message.isTreeUpdate &&
                "bg-[var(--primary)] text-[var(--primary-foreground)] max-w-[85%] mx-auto rounded-xl shadow-md"
            )}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 3 && !isLoading && (
        <div className="px-4 py-2 space-y-2 flex-shrink-0">
          <p className="text-xs text-[var(--muted-foreground)]">
            Try one of these prompts:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs truncate max-w-full"
                onClick={() => handleSuggestedPrompt(prompt)}
              >
                {prompt.length > 40 ? prompt.slice(0, 40) + "..." : prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-[var(--border)] bg-[var(--card-30)] backdrop-blur-sm flex-shrink-0">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <Input
            placeholder="Share your thoughts..."
            className="flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Send message"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
