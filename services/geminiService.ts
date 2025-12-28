import { GameResponse, SimulationConfig, GameState, GameMode } from "../types";
import { SYSTEM_PROMPT } from "../constants";

export class GeminiService {
  private model = "xiaomi/mimo-v2-flash:free"; // Using free Xiaomi model

  async startSimulation(config: SimulationConfig): Promise<GameResponse> {
    const langDirective = config.language.startsWith('zh')
      ? "IMPORTANT: Respond entirely in Chinese."
      : "IMPORTANT: Respond entirely in English.";

    const modeDirective = config.mode === GameMode.STORY
      ? "STORY MODE: Immersive narrative, NPC dialogue, and professional situational challenges."
      : `PRACTICE MODE: Technical assessment. Focus on the following question formats: ${config.questionTypes.join(', ')}.`;

    // OpenRouter does not accept your PDF inlineData like Gemini did.
    const pdfNote =
      config.pdfs?.length
        ? `User uploaded PDFs (not directly attached here): ${config.pdfs.map(p => p.name).join(', ')}. If you need their content, ask the user to paste relevant excerpts.`
        : `No PDFs provided.`;

    const prompt = `
${langDirective}
${modeDirective}

Initialize Simulation:
Path: ${config.targetLife}
Difficulty: ${config.difficulty}
Target Knowledge: ${config.skillPacks.join(', ')}

${pdfNote}

Begin Chapter 1. Introduce the professional setting and the first task.

CRITICAL: You MUST respond with ONLY a valid JSON object. No markdown, no explanations, just pure JSON.
Required JSON format:
{
  "event": "Your narrative description here",
  "options": ["Option 1", "Option 2", "Option 3"],
  "question": {
    "text": "The question or challenge",
    "type": "Multiple Choice",
    "choices": ["Choice A", "Choice B", "Choice C"]
  },
  "statChanges": {
    "knowledge": 0,
    "confidence": 0,
    "stress": 0,
    "resources": 0,
    "reputation": 0
  }
}
    `.trim();

    try {
      const response = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT + "\n" + langDirective + "\n" + modeDirective + "\n\nYou MUST respond with valid JSON only. No markdown code blocks, no explanations." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`API request failed: ${errorText}`);
      }

      const data = await response.json();
      
      // Validate that we got the expected structure
      if (!data.event) {
        console.error("Invalid response structure:", data);
        throw new Error("API returned invalid response structure. Missing 'event' field.");
      }

      return data;
    } catch (error: any) {
      console.error("Simulation start error:", error);
      throw new Error(`Failed to start simulation: ${error.message}`);
    }
  }

  async nextTurn(state: GameState, userInput: string): Promise<GameResponse> {
    const langDirective = state.language.startsWith('zh')
      ? "IMPORTANT: Respond entirely in Chinese."
      : "IMPORTANT: Respond entirely in English.";

    const modeDirective = state.playerProfile.mode === GameMode.STORY
      ? "STORY MODE: Continue the narrative path and NPC relationships."
      : "PRACTICE MODE: Continue technical assessment based on knowledge points and requested formats.";

    const prompt = `
${langDirective}
${modeDirective}
Input: "${userInput}"

Current Profile: ${JSON.stringify(state.playerProfile)}
Stats: ${JSON.stringify(state.stats)}
Summary: ${state.summary || 'Start'}
Turn: ${state.playerProfile.turnCount}

Generate next event/question. If turn count is multiple of 10, update "summaryUpdate".

CRITICAL: You MUST respond with ONLY a valid JSON object. No markdown, no explanations, just pure JSON.
Required JSON format:
{
  "event": "Your narrative description here",
  "options": ["Option 1", "Option 2", "Option 3"],
  "statChanges": {
    "knowledge": 0,
    "confidence": 0,
    "stress": 0,
    "resources": 0,
    "reputation": 0
  }
}
    `.trim();

    try {
      const response = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT + "\n" + langDirective + "\n" + modeDirective + "\n\nYou MUST respond with valid JSON only. No markdown code blocks, no explanations." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`API request failed: ${errorText}`);
      }

      const data = await response.json();
      
      // Validate that we got the expected structure
      if (!data.event) {
        console.error("Invalid response structure:", data);
        throw new Error("API returned invalid response structure. Missing 'event' field.");
      }

      return data;
    } catch (error: any) {
      console.error("Next turn error:", error);
      throw new Error(`Failed to process turn: ${error.message}`);
    }
  }
}
