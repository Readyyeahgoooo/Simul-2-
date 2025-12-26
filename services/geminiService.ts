
import { GoogleGenAI } from "@google/genai";
import { GameResponse, SimulationConfig, GameState, Language, GameMode } from "../types";
import { SYSTEM_PROMPT } from "../constants";

export class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  
  private model = "gemini-3-pro-preview";

  async startSimulation(config: SimulationConfig): Promise<GameResponse> {
    const ai = this.getAI();
    const langDirective = config.language.startsWith('zh') ? "IMPORTANT: Respond entirely in Chinese." : "IMPORTANT: Respond entirely in English.";
    
    const modeDirective = config.mode === GameMode.STORY 
      ? "STORY MODE: Immersive narrative, NPC dialogue, and professional situational challenges. Weave PDF knowledge naturally into the plot."
      : `PRACTICE MODE: Technical assessment. Focus on the following question formats: ${config.questionTypes.join(', ')}. PRIORITIZE extracting core knowledge points from the provided PDF files to generate structured exam-style questions or professional case studies.`;

    const prompt = `
      ${langDirective}
      ${modeDirective}
      
      Initialize Simulation:
      Path: ${config.targetLife}
      Difficulty: ${config.difficulty}
      Target Knowledge: ${config.skillPacks.join(', ')}
      
      Reference Materials provided as PDF attachments. Digest them carefully to inform the simulation logic.
      
      Begin Chapter 1. Introduce the professional setting and the first task.
    `;

    const contents: any[] = [{ text: prompt }];
    
    if (config.pdfs.length > 0) {
      config.pdfs.forEach(pdf => {
        contents.push({
          inlineData: {
            data: pdf.data,
            mimeType: pdf.mimeType
          }
        });
      });
    }

    const response = await ai.models.generateContent({
      model: this.model,
      contents: { parts: contents },
      config: {
        systemInstruction: SYSTEM_PROMPT + "\n" + langDirective + "\n" + modeDirective,
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  }

  async nextTurn(state: GameState, userInput: string): Promise<GameResponse> {
    const ai = this.getAI();
    const langDirective = state.language.startsWith('zh') ? "IMPORTANT: Respond entirely in Chinese." : "IMPORTANT: Respond entirely in English.";
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
    `;

    const response = await ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT + "\n" + langDirective + "\n" + modeDirective,
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  }
}
