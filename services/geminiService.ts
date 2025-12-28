import { GameResponse, SimulationConfig, GameState, GameMode } from "../types";
import { SYSTEM_PROMPT } from "../constants";

export class GeminiService {
  private model = "deepseek/deepseek-r1"; // can override later via env/server

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

Return ONLY valid JSON matching the required schema.
    `.trim();

    const response = await fetch("/api/llm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT + "\n" + langDirective + "\n" + modeDirective },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    return await response.json();
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

Return ONLY valid JSON matching the required schema.
    `.trim();

    const response = await fetch("/api/llm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT + "\n" + langDirective + "\n" + modeDirective },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    return await response.json();
  }
}
