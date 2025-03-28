import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Use Node.js runtime since we need file system access
export const runtime = "nodejs";

export async function GET() {
  try {
    const knowledgeBasePath = path.join(
      process.cwd(),
      "src/data/kabbalah/knowledge-base"
    );
    const files = await fs.readdir(knowledgeBasePath);
    let knowledge = "";

    for (const file of files) {
      if (file.endsWith(".txt")) {
        const content = await fs.readFile(
          path.join(knowledgeBasePath, file),
          "utf-8"
        );
        knowledge += `\n\n${content}`;
      }
    }

    return NextResponse.json({ knowledge });
  } catch (error) {
    console.error("Error loading knowledge base:", error);
    return NextResponse.json(
      { error: "Failed to load knowledge base" },
      { status: 500 }
    );
  }
}
