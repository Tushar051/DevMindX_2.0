import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "default_key"
});

export interface GenerateProjectRequest {
  name: string;
  framework: string;
  description: string;
}

export interface GeneratedProject {
  files: { [path: string]: string };
  structure: string[];
}

export async function generateProject(request: GenerateProjectRequest): Promise<GeneratedProject> {
  try {
    const prompt = `Generate a complete ${request.framework} project structure and code for: "${request.name}"

Description: ${request.description}

Requirements:
1. Create a complete, production-ready project structure
2. Include all necessary files with actual code (no placeholders)
3. Use modern best practices and latest syntax
4. Include package.json with appropriate dependencies
5. Add proper error handling and validation
6. Include README.md with setup instructions

Respond with JSON in this exact format:
{
  "files": {
    "path/to/file.ext": "file content here",
    "another/file.js": "actual code content"
  },
  "structure": ["folder1", "folder2", "file1.js", "folder1/subfile.js"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert software architect. Generate complete, production-ready code projects with proper structure and implementation. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    throw new Error(`Failed to generate project: ${error.message}`);
  }
}

export async function generateCode(prompt: string, context?: string): Promise<string> {
  try {
    const systemPrompt = context 
      ? `You are an expert programmer. Generate code based on the user's request. Context: ${context}`
      : "You are an expert programmer. Generate code based on the user's request.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000
    });

    return response.choices[0].message.content;
  } catch (error) {
    throw new Error(`Failed to generate code: ${error.message}`);
  }
}

export async function chatWithAI(message: string, conversationHistory: any[] = []): Promise<string> {
  try {
    const messages = [
      {
        role: "system",
        content: "You are an AI coding assistant. Help users with programming questions, code generation, debugging, and software development best practices."
      },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      {
        role: "user",
        content: message
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      max_tokens: 1500
    });

    return response.choices[0].message.content;
  } catch (error) {
    throw new Error(`Failed to chat with AI: ${error.message}`);
  }
}
