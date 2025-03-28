import { NextResponse } from "next/server";
import { openai, ChatMessage } from "@/lib/openai";
import {
  TreeOfLife,
  TreeOfLifeStructure,
  TreeOfLifeInterpretation,
  SephirahInterpretation,
  PathInterpretation,
} from "@/app/models/TreeOfLife.interface";
import traditionalTreeOfLife from "@/data/kabbalah/TreeOfLifeData";

// Enable Edge runtime to avoid timeouts
export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages must be an array" },
        { status: 400 }
      );
    }

    // Transform messages to OpenAI format
    const formattedMessages: ChatMessage[] = messages.map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.content,
    }));

    // Add system prompt at the beginning
    formattedMessages.unshift({
      role: "system",
      content:
        "You are a knowledgeable Kabbalah teacher specializing in the Tree of Life (Etz Chaim). Create personalized Tree of Life visualizations that reflect the user's real-life situations, dreams, and challenges." +
        "\n\nAnalyze the user's messages to understand their situation, challenges, and aspirations. Then, customize the Tree of Life to represent their journey." +
        "\n\nIMPORTANT RULES:" +
        "\n1. Be concise and direct in your responses." +
        "\n2. The Tree of Life structure must remain fixed with traditional positions." +
        "\n3. Only modify these attributes:" +
        "\n\nFor the Tree as a whole:" +
        "\n- name: A personalized name for this tree" +
        "\n- description: Overall meaning of this personalized tree" +
        "\n\nFor each Sephirah:" +
        '\n- color: Represent emotional/spiritual qualities (e.g., "#ff0000" or "0xff0000")' +
        "\n- description: Personalized meaning relating to the person's situation" +
        "\n- glowIntensity: Value between 0.3-1.5 showing energy level in this sphere" +
        "\n\nFor relevant Paths:" +
        '\n- color: Represent the nature of the connection (e.g., "#ff0000" or "0xff0000")' +
        "\n- description: Personalized meaning of the connection" +
        "\n- thickness: Value between 0.05-0.25 showing strength of connection" +
        "\n- opacity: Value between 0.3-1.0 showing prominence" +
        "\n\nIn your responses:" +
        "\n1. Give a brief explanation (2-3 sentences) of the Tree's significance to their situation" +
        "\n2. Include a JSON update with ONLY the attributes that should change:" +
        "\n```json" +
        "\n{" +
        '\n  "name": "Personal Tree Name",' +
        '\n  "description": "Overall meaning of this personalized tree",' +
        '\n  "sephiroth": [' +
        '\n    {"id": 1, "color": "#ffffff", "description": "Personal meaning for Keter", "renderOptions": {"glowIntensity": 1.2}},' +
        '\n    {"id": 2, "color": "#ff0000", "description": "Personal meaning for Chokmah", "renderOptions": {"glowIntensity": 0.8}},' +
        "\n    // Only include Sephiroth that should be customized" +
        "\n  ]," +
        '\n  "paths": [' +
        '\n    {"sourceId": 1, "targetId": 2, "color": "#0000ff", "description": "Personal meaning", "renderOptions": {"thickness": 0.15, "opacity": 0.9}},' +
        "\n    // Only include paths that should be customized" +
        "\n  ]" +
        "\n}" +
        "\n```" +
        "\n\nNever modify the layout or positions of any elements.",
    });

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const completion = await openai.chat.completions.create(
        {
          model: "gpt-4-turbo-preview",
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 2500,
        },
        {
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      const response = completion.choices[0].message;

      // Check if response contains a tree update
      let updatedTree: TreeOfLife | undefined;
      let responseContent = response.content || "";

      if (responseContent) {
        console.log("Processing AI response to extract tree data...");

        // Use traditionalTreeOfLife as the base structure
        const baseStructure = traditionalTreeOfLife as TreeOfLifeStructure;

        // If the AI didn't provide a tree update (sometimes it forgets), use a fallback
        if (!responseContent.includes("```json")) {
          console.log(
            "No JSON tree update found in response, using fallback tree"
          );
          // Use a modified version of the traditional tree as fallback
          updatedTree = createFallbackTree(responseContent, baseStructure);
          // Keep the explanation part of the response
          responseContent = responseContent.trim();
        } else {
          // Extract the JSON tree update
          const treeMatch = responseContent.match(/```json\n([\s\S]*?)\n```/);
          if (treeMatch && treeMatch[1]) {
            try {
              console.log(
                "Found JSON block in response, attempting to parse..."
              );
              // Clean up the JSON string to remove any potential issues
              const jsonStr = treeMatch[1]
                .replace(/0x[0-9a-fA-F]+/g, (match) => `"${match}"`) // Convert hex literals to strings
                .replace(/,\s*]/g, "]") // Remove trailing commas
                .replace(/,\s*}/g, "}"); // Remove trailing commas

              console.log(
                "Cleaned JSON string:",
                jsonStr.substring(0, 100) + "..."
              );

              let interpretation: Partial<TreeOfLifeInterpretation>;
              try {
                interpretation = JSON.parse(jsonStr);
                console.log("Successfully parsed JSON data");
              } catch (parseError: any) {
                console.error("JSON parse error:", parseError);
                console.log(
                  "Attempted to parse:",
                  jsonStr.substring(0, 200) + "..."
                );
                throw new Error("Failed to parse JSON: " + parseError.message);
              }

              // Process the tree data to ensure it's valid
              if (isValidTreeInterpretation(interpretation)) {
                console.log("Valid TreeOfLifeInterpretation structure found");

                // Create updated tree by combining the structure with the interpretation
                updatedTree = combineStructureAndInterpretation(
                  baseStructure,
                  interpretation
                );

                console.log(
                  "Successfully created updated tree with",
                  updatedTree.sephiroth.length,
                  "sephiroth and",
                  updatedTree.paths.length,
                  "paths"
                );

                // Remove the JSON data from the response to show only the natural language part
                responseContent = responseContent
                  .replace(/```json[\s\S]*?```/g, "")
                  .trim();
              } else {
                console.error(
                  "Invalid TreeOfLifeInterpretation structure:",
                  Object.keys(interpretation)
                );
                throw new Error("Invalid TreeOfLifeInterpretation structure");
              }
            } catch (error) {
              console.error("Error processing tree update:", error);
              // Use fallback tree if JSON parsing or processing fails
              updatedTree = createFallbackTree(responseContent, baseStructure);
            }
          } else {
            console.log("No valid JSON found in ```json``` block");
            // No valid JSON found, use fallback tree
            updatedTree = createFallbackTree(responseContent, baseStructure);
          }
        }
      }

      return NextResponse.json({
        message: responseContent.trim(),
        treeUpdate: updatedTree,
      });
    } catch (error: any) {
      clearTimeout(timeoutId);
      // Handle timeouts with a friendly message
      if (
        error.name === "AbortError" ||
        error.code === "ETIMEDOUT" ||
        error.code === "ECONNABORTED"
      ) {
        console.log("Request timed out, returning fallback response");
        return NextResponse.json({
          message:
            "I'm contemplating your request deeply and need a bit more time. Perhaps we could explore your question in a slightly different way? Please try again with a simpler query.",
          treeUpdate: undefined,
        });
      }
      throw error; // Re-throw other errors to be caught by outer catch
    }
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to get chat completion" },
      { status: 500 }
    );
  }
}

function isValidTreeInterpretation(
  data: any
): data is Partial<TreeOfLifeInterpretation> {
  return (
    data &&
    typeof data === "object" &&
    (Array.isArray(data.sephiroth) || Array.isArray(data.paths)) &&
    (typeof data.name === "string" || typeof data.description === "string")
  );
}

function combineStructureAndInterpretation(
  structure: TreeOfLifeStructure,
  interpretation: Partial<TreeOfLifeInterpretation>
): TreeOfLife {
  // Start with a clean tree based on the structure
  const combinedTree: TreeOfLife = {
    name:
      interpretation.name ||
      (structure as any).name ||
      "Personalized Tree of Life",
    description:
      interpretation.description ||
      (structure as any).description ||
      "A personalized Tree of Life visualization",
    layout: structure.layout,
    sephiroth: [],
    paths: [],
    visualSettings: { ...structure.visualSettings },
  };

  // Process sephiroth
  combinedTree.sephiroth = structure.sephiroth.map((structureSephirah) => {
    // Find matching interpretation sephirah if it exists
    const interpretationSephirah = interpretation.sephiroth?.find(
      (s) => s.id === structureSephirah.id
    ) as SephirahInterpretation | undefined;

    // Process color values
    let sephirahColor: number =
      typeof (structureSephirah as any).color === "number"
        ? (structureSephirah as any).color
        : 0xffffff;

    if (interpretationSephirah?.color) {
      if (typeof interpretationSephirah.color === "string") {
        if (interpretationSephirah.color.startsWith("0x")) {
          sephirahColor = parseInt(
            interpretationSephirah.color.substring(2),
            16
          );
        } else if (interpretationSephirah.color.startsWith("#")) {
          sephirahColor = parseInt(
            interpretationSephirah.color.substring(1),
            16
          );
        }
      } else if (typeof interpretationSephirah.color === "number") {
        sephirahColor = interpretationSephirah.color;
      }
    }

    // Process glow color and intensity
    let glowColor = sephirahColor;
    let glowIntensity = 0.8;

    if (interpretationSephirah?.renderOptions) {
      glowIntensity =
        interpretationSephirah.renderOptions.glowIntensity || glowIntensity;

      if (interpretationSephirah.renderOptions.glowColor) {
        if (
          typeof interpretationSephirah.renderOptions.glowColor === "string"
        ) {
          const glowColorStr = interpretationSephirah.renderOptions.glowColor;
          if (glowColorStr.startsWith("0x")) {
            glowColor = parseInt(glowColorStr.substring(2), 16);
          } else if (glowColorStr.startsWith("#")) {
            glowColor = parseInt(glowColorStr.substring(1), 16);
          }
        } else if (
          typeof interpretationSephirah.renderOptions.glowColor === "number"
        ) {
          glowColor = interpretationSephirah.renderOptions.glowColor;
        }
      }
    }

    return {
      ...structureSephirah,
      description:
        interpretationSephirah?.description ||
        (structureSephirah as any).description ||
        "",
      color: sephirahColor,
      renderOptions: {
        glowIntensity,
        glowColor,
      },
    };
  });

  // Process paths
  combinedTree.paths = structure.paths.map((structurePath) => {
    // Find matching interpretation path if it exists
    const interpretationPath = interpretation.paths?.find(
      (p) =>
        p.sourceId === structurePath.sourceId &&
        p.targetId === structurePath.targetId
    ) as PathInterpretation | undefined;

    // Process color values
    let pathColor: number =
      typeof (structurePath as any).color === "number"
        ? (structurePath as any).color
        : 0xffffff;

    if (interpretationPath?.color) {
      if (typeof interpretationPath.color === "string") {
        if (interpretationPath.color.startsWith("0x")) {
          pathColor = parseInt(interpretationPath.color.substring(2), 16);
        } else if (interpretationPath.color.startsWith("#")) {
          pathColor = parseInt(interpretationPath.color.substring(1), 16);
        }
      } else if (typeof interpretationPath.color === "number") {
        pathColor = interpretationPath.color;
      }
    }

    // Default render options that can be overridden
    const defaultRenderOptions = {
      thickness: 0.12,
      opacity: 0.8,
    };

    return {
      ...structurePath,
      description:
        interpretationPath?.description ||
        (structurePath as any).description ||
        "",
      color: pathColor,
      renderOptions: {
        ...defaultRenderOptions,
        ...(interpretationPath?.renderOptions || {}),
      },
    };
  });

  // Add any additional paths from the interpretation that don't exist in the structure
  // (this should be rare since the structure should contain all valid paths)
  interpretation.paths?.forEach((interpretationPath) => {
    const pathExists = combinedTree.paths.some(
      (p) =>
        p.sourceId === interpretationPath.sourceId &&
        p.targetId === interpretationPath.targetId
    );

    if (!pathExists) {
      // Process a new path that doesn't exist in the traditional tree
      let pathColor: number = 0xffffff; // Default white

      if (typeof interpretationPath.color === "string") {
        if (interpretationPath.color.startsWith("0x")) {
          pathColor = parseInt(interpretationPath.color.substring(2), 16);
        } else if (interpretationPath.color.startsWith("#")) {
          pathColor = parseInt(interpretationPath.color.substring(1), 16);
        }
      } else if (typeof interpretationPath.color === "number") {
        pathColor = interpretationPath.color;
      }

      combinedTree.paths.push({
        sourceId: interpretationPath.sourceId,
        targetId: interpretationPath.targetId,
        name: `Path ${interpretationPath.sourceId}-${interpretationPath.targetId}`,
        description: interpretationPath.description || "New connection",
        color: pathColor,
        renderOptions: {
          thickness: interpretationPath.renderOptions?.thickness || 0.15,
          opacity: interpretationPath.renderOptions?.opacity || 0.9,
        },
      });
    }
  });

  return combinedTree;
}

function createFallbackTree(
  responseContent: string,
  baseStructure: TreeOfLifeStructure
): TreeOfLife {
  // Create a personalized interpretation based on the response content
  const fallbackInterpretation: TreeOfLifeInterpretation = {
    name: "Personalized Tree of Life",
    description:
      "A personalized Tree of Life visualization reflecting your unique journey",
    sephiroth: [],
    paths: [],
  };

  // Analyze response to determine emotional tone
  const hasPositiveTone =
    /joy|happiness|excitement|love|hope|optimism|growth/i.test(responseContent);
  const hasNegativeTone =
    /fear|anxiety|sadness|grief|challenge|difficulty|struggle/i.test(
      responseContent
    );
  const hasTransformationTone =
    /transformation|change|evolution|journey|progress|development/i.test(
      responseContent
    );
  const hasWisdomTone =
    /wisdom|knowledge|understanding|insight|learning|teaching/i.test(
      responseContent
    );
  const hasSpiritualTone =
    /spiritual|divine|sacred|holy|meditation|prayer|enlightenment/i.test(
      responseContent
    );

  // Create sephiroth interpretations based on the tone
  baseStructure.sephiroth.forEach((sephirah) => {
    let glowIntensity = 0.8; // default
    let color = 0xffffff; // default white

    // Adjust Keter (Crown) - spiritual connection
    if (sephirah.id === 1 && hasSpiritualTone) {
      color = 0xffffff; // Bright white
      glowIntensity = 1.2;
    }

    // Adjust Chokmah (Wisdom) - insight and understanding
    if (sephirah.id === 2 && hasWisdomTone) {
      color = 0xc0c0c0; // Silver
      glowIntensity = 1.1;
    }

    // Adjust Binah (Understanding) - structural thinking
    if (sephirah.id === 3 && hasWisdomTone) {
      color = 0x6a0dad; // Deep purple
      glowIntensity = 1.0;
    }

    // Adjust Chesed (Mercy) - love and compassion
    if (sephirah.id === 4 && hasPositiveTone) {
      color = 0x4169e1; // Royal blue
      glowIntensity = 1.1;
    }

    // Adjust Geburah (Strength) - challenges and discipline
    if (sephirah.id === 5 && hasNegativeTone) {
      color = 0xdc143c; // Crimson
      glowIntensity = 1.0;
    }

    // Adjust Tiferet (Beauty) - harmony and balance
    if (sephirah.id === 6) {
      color = 0xffd700; // Gold
      glowIntensity = hasTransformationTone ? 1.2 : 0.9;
    }

    // Adjust Netzach (Victory) - emotions and passion
    if (sephirah.id === 7 && hasPositiveTone) {
      color = 0x00ff00; // Bright green
      glowIntensity = 1.0;
    }

    // Adjust Hod (Splendor) - intellect and communication
    if (sephirah.id === 8 && hasWisdomTone) {
      color = 0xffa500; // Orange
      glowIntensity = 1.0;
    }

    // Adjust Yesod (Foundation) - subconscious and dreams
    if (sephirah.id === 9 && hasTransformationTone) {
      color = 0x9932cc; // Dark orchid
      glowIntensity = 1.1;
    }

    // Adjust Malkuth (Kingdom) - physical manifestation
    if (sephirah.id === 10) {
      color = 0x8b4513; // Saddle brown
      glowIntensity = 0.9;
    }

    // Create an interpretation for this sephirah
    fallbackInterpretation.sephiroth.push({
      id: sephirah.id,
      color,
      description: `${sephirah.name} - Representing the ${
        sephirah.world || ""
      } aspect of your journey`,
      renderOptions: {
        glowIntensity,
        glowColor: color,
      },
    });
  });

  // Create path interpretations based on the tone
  baseStructure.paths.forEach((path) => {
    let thickness = 0.12; // default
    let opacity = 0.8; // default
    let color = 0xffffff; // default white

    // Strengthen paths between Tiferet (6) and other spheres for transformation
    if ((path.sourceId === 6 || path.targetId === 6) && hasTransformationTone) {
      thickness = 0.18;
      opacity = 0.9;
      color = 0xffd700; // Gold
    }

    // Strengthen paths connected to Keter (1) for spiritual journeys
    if ((path.sourceId === 1 || path.targetId === 1) && hasSpiritualTone) {
      thickness = 0.16;
      opacity = 0.9;
      color = 0xffffff; // White
    }

    // Strengthen paths connected to Chokmah (2) or Binah (3) for wisdom seekers
    if (
      (path.sourceId === 2 ||
        path.targetId === 2 ||
        path.sourceId === 3 ||
        path.targetId === 3) &&
      hasWisdomTone
    ) {
      thickness = 0.15;
      opacity = 0.85;
    }

    // Strengthen emotional paths (connected to Netzach - 7)
    if ((path.sourceId === 7 || path.targetId === 7) && hasPositiveTone) {
      thickness = 0.15;
      opacity = 0.85;
      color = 0x00ff00; // Green
    }

    // Strengthen challenge paths (connected to Geburah - 5)
    if ((path.sourceId === 5 || path.targetId === 5) && hasNegativeTone) {
      thickness = 0.15;
      opacity = 0.85;
      color = 0xdc143c; // Crimson
    }

    // Create an interpretation for this path
    fallbackInterpretation.paths.push({
      sourceId: path.sourceId,
      targetId: path.targetId,
      color,
      description: `Connection between ${
        path.name || `path ${path.sourceId}-${path.targetId}`
      }`,
      renderOptions: {
        thickness,
        opacity,
      },
    });
  });

  // Update tree name and description based on tone
  fallbackInterpretation.name = hasSpiritualTone
    ? "The Seeker's Tree of Life"
    : hasTransformationTone
    ? "Tree of Transformation"
    : hasWisdomTone
    ? "Tree of Wisdom"
    : "Personalized Tree of Life";

  fallbackInterpretation.description =
    "A personalized Tree of Life visualization reflecting your unique journey";

  // Combine the structure with our interpretation
  return combineStructureAndInterpretation(
    baseStructure,
    fallbackInterpretation
  );
}
