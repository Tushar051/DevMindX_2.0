import * as fs from "fs";
import { GoogleGenAI, Modality } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateProjectWithGemini(prompt: string): Promise<any> {
  try {
    const systemPrompt = `You are an expert full-stack developer. Generate a complete project structure based on the user's description. 
    Return a JSON object with this structure:
    {
      "name": "project-name",
      "description": "Brief description",
      "framework": "detected framework",
      "files": {
        "filename.ext": "file content",
        "folder/file.ext": "file content"
      }
    }
    
    Create a realistic, functional project with proper file structure, dependencies, and working code.
    Include all necessary files like package.json, README.md, and proper folder structure.
    Make sure the code is complete and runnable.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      contents: prompt,
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    throw new Error(`Gemini project generation failed: ${error}`);
  }
}

export async function generateCodeWithGemini(instruction: string, context?: string): Promise<string> {
  try {
    const systemPrompt = `You are an expert programmer. Generate clean, well-documented code based on the user's instruction.
    ${context ? `Current project context: ${context}` : ''}
    
    Provide only the code without explanations unless specifically asked.
    Make sure the code is complete and functional.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: instruction,
    });

    return response.text || "// No code generated";
  } catch (error) {
    throw new Error(`Gemini code generation failed: ${error}`);
  }
}

export async function chatWithGemini(message: string, chatHistory?: any[]): Promise<string> {
  try {
    const systemPrompt = `You are an AI coding assistant integrated into an IDE. Help users with:
    - Code explanations and debugging
    - Architecture suggestions
    - Best practices
    - Problem solving
    - File and project structure recommendations
    
    Be concise and practical in your responses. When suggesting code changes, provide complete, working code.
    Consider the current file context and project structure when giving advice.`;

    const contents = chatHistory && chatHistory.length > 0 
      ? [...chatHistory.map(msg => ({ role: msg.role, parts: [{ text: msg.content }] })), { role: "user", parts: [{ text: message }] }]
      : [{ role: "user", parts: [{ text: message }] }];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: contents,
    });

    return response.text || "I'm sorry, I couldn't process your request.";
  } catch (error) {
    throw new Error(`Gemini chat failed: ${error}`);
  }
}

export async function analyzeCodeWithGemini(code: string, task: string): Promise<string> {
  try {
    const systemPrompt = `You are a code analysis expert. Analyze the provided code and help with the specific task.
    
    Tasks you can help with:
    - Code review and suggestions
    - Bug detection
    - Performance optimization
    - Refactoring suggestions
    - Documentation generation
    - Security analysis
    
    Provide specific, actionable feedback with code examples when appropriate.`;

    const prompt = `Task: ${task}\n\nCode:\n\`\`\`\n${code}\n\`\`\``;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: prompt,
    });

    return response.text || "Analysis could not be completed.";
  } catch (error) {
    throw new Error(`Gemini code analysis failed: ${error}`);
  }
}