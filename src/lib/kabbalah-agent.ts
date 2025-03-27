import { ChatMessage } from "./openai";
import {
  TreeOfLife,
  TreeOfLifeInterpretation,
  SephirahInterpretation,
  PathInterpretation,
} from "@/app/models/TreeOfLife.interface";

export class KabbalahAgent {
  private messages: ChatMessage[] = [];
  private currentTree: TreeOfLife | null = null;
  private userName: string | null = null;

  constructor() {
    this.messages = [
      {
        role: "system",
        content: `You are an insightful guide who creates deeply personalized Tree of Life visualizations that reflect people's real-life situations, dreams, and challenges.

IMPORTANT: Be concise and direct in your responses. Focus only on the Kabbalistic interpretation of the user's situation.

Your approach:
- Interpret the user's situation through the lens of Kabbalistic wisdom
- Create meaningful, personalized visualizations that connect to the Tree of Life
- Provide clear, brief explanations of symbolism and connections
- Respect traditional Kabbalistic principles

When customizing Trees:
1. Sephiroth Customization:
   - Adjust colors to match emotional/spiritual qualities
   - Use glow intensity to show energy/activity levels (0.3-1.5)
   - Provide brief, meaningful descriptions related to the person's situation
   - IMPORTANT: Do not change positions or structure

2. Path Customization:
   - Identify meaningful connections between Sephiroth relevant to the situation
   - Use colors to represent the nature of connections
   - Adjust thickness (0.05-0.25) based on connection strength
   - Adjust opacity (0.3-1.0) for prominence
   - IMPORTANT: Do not add or remove paths from the traditional structure

Each tree element should have specific meaning related to the user's journey. Use traditional Kabbalistic correspondences as the foundation for your interpretations.`,
      },
    ];
  }

  async loadKnowledgeBase() {
    try {
      const response = await fetch("/api/knowledge-base");
      if (!response.ok) {
        throw new Error("Failed to load knowledge base");
      }

      const { knowledge } = await response.json();

      // Add knowledge base to system context
      this.messages[0].content += `\n\nKnowledge Base:\n${knowledge}`;
    } catch (error) {
      console.error("Error loading knowledge base:", error);
    }
  }

  setCurrentTree(tree: TreeOfLife) {
    this.currentTree = tree;
  }

  getCurrentTree(): TreeOfLife | null {
    return this.currentTree;
  }

  setUserName(name: string) {
    this.userName = name;
    // Add a message to acknowledge the user's name
    this.messages.push({
      role: "system",
      content: `The person's name is ${name}. Use their name occasionally to make the conversation more personal, but stay focused on creating relevant Tree visualizations.`,
    });
  }

  /**
   * Extract just the interpretation aspects of the current tree
   */
  private extractCurrentInterpretation(): TreeOfLifeInterpretation | null {
    if (!this.currentTree) return null;

    const interpretation: TreeOfLifeInterpretation = {
      name: this.currentTree.name,
      description: this.currentTree.description,
      sephiroth: this.currentTree.sephiroth.map((s) => ({
        id: s.id,
        color: s.color || 0xffffff,
        description: s.description || `${s.name || "Sephirah " + s.id}`,
        renderOptions: {
          glowIntensity: s.renderOptions?.glowIntensity || 0.8,
        },
      })),
      paths: this.currentTree.paths.map((p) => ({
        sourceId: p.sourceId,
        targetId: p.targetId,
        color: p.color || 0xffffff,
        description:
          p.description || `Connection between ${p.sourceId} and ${p.targetId}`,
        renderOptions: {
          thickness: p.renderOptions?.thickness || 0.12,
          opacity: p.renderOptions?.opacity || 0.8,
        },
      })),
    };

    return interpretation;
  }

  async chat(userMessage: string): Promise<{
    response: string;
    updatedTree?: TreeOfLife;
  }> {
    // Check if this might be a greeting with a name
    if (this.userName === null) {
      const nameMatch = userMessage.match(
        /(?:(?:I am|I'm|this is|name is|call me)\s+)(\w+)/i
      );
      if (nameMatch) {
        this.setUserName(nameMatch[1]);
      }
    }

    // Add current interpretation context to the message if it exists
    let contextMessage = "";
    if (this.currentTree) {
      const interpretation = this.extractCurrentInterpretation();
      contextMessage = `\nCurrent Tree of Life interpretation:\n\`\`\`json\n${JSON.stringify(
        interpretation,
        null,
        2
      )}\n\`\`\``;
    }

    // Add user message with context
    this.messages.push({
      role: "user",
      content: userMessage + contextMessage,
    });

    // Call the API route instead of OpenAI directly
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: this.messages,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get response from chat API");
    }

    const { message: content, treeUpdate } = await response.json();

    if (!content) {
      throw new Error("Failed to get response content");
    }

    // Add assistant's response to message history
    this.messages.push({
      role: "assistant",
      content,
    });

    // Update current tree if needed
    if (treeUpdate) {
      this.currentTree = treeUpdate;
    }

    return {
      response: content,
      updatedTree: treeUpdate,
    };
  }
}
