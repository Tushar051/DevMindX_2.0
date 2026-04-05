/**
 * Ollama Local LLM Service
 * This service integrates with locally running Ollama models
 * All external LLM requests are routed through this service
 */

// Import FileChange type from shared types
import type { FileChange } from '../../shared/types.js';

// Ollama configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2'; // Default model

// Model mapping: Frontend model names to Ollama model names
const MODEL_MAPPING: Record<string, string> = {
  'together': process.env.OLLAMA_MODEL_TOGETHER || 'llama3.2',
  'gemini': process.env.OLLAMA_MODEL_GEMINI || 'llama3.2',
  'chatgpt': process.env.OLLAMA_MODEL_CHATGPT || 'llama3.2',
  'claude': process.env.OLLAMA_MODEL_CLAUDE || 'llama3.2',
  'deepseek': process.env.OLLAMA_MODEL_DEEPSEEK || 'deepseek-coder'
};

/**
 * Check if Ollama is available
 */
export async function checkOllamaAvailability(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    return response.ok;
  } catch (error) {
    console.warn('Ollama is not available:', error);
    return false;
  }
}

/**
 * Get the appropriate Ollama model for a given frontend model
 */
function getOllamaModel(frontendModel?: string): string {
  if (!frontendModel) return OLLAMA_MODEL;
  return MODEL_MAPPING[frontendModel] || OLLAMA_MODEL;
}

/**
 * Call Ollama API with streaming support
 */
async function callOllama(
  prompt: string,
  model?: string,
  systemPrompt?: string,
  temperature: number = 0.7
): Promise<string> {
  const ollamaModel = getOllamaModel(model);
  
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: prompt,
        system: systemPrompt,
        temperature: temperature,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return (data as any).response || '';
  } catch (error) {
    console.error('Error calling Ollama:', error);
    throw new Error(`Failed to generate response with Ollama: ${error}`);
  }
}

/**
 * Call Ollama Chat API for conversational interactions
 */
async function callOllamaChat(
  messages: Array<{ role: string; content: string }>,
  model?: string,
  temperature: number = 0.7
): Promise<string> {
  const ollamaModel = getOllamaModel(model);
  
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ollamaModel,
        messages: messages,
        temperature: temperature,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return (data as any).message?.content || '';
  } catch (error) {
    console.error('Error calling Ollama chat:', error);
    throw new Error(`Failed to generate chat response with Ollama: ${error}`);
  }
}

/**
 * Extract file changes from AI response
 */
function extractFileChanges(content: string): FileChange[] {
  const fileChanges: FileChange[] = [];
  const seen = new Set<string>();

  const push = (filePath: string, fileContent: string) => {
    const p = filePath.trim();
    const c = fileContent.trim();
    if (!p || !c || seen.has(p)) return;
    seen.add(p);
    fileChanges.push({ filePath: p, newContent: c, action: "update" });
  };

  // ```lang\n// path/to/file.ext\ncode```
  const fileBlockRegex = /```(?:[\w.+#-]+)?\s*\n(?:\/\/\s*([^\n]+\.[\w.]+)\s*\n)([\s\S]*?)```/g;
  let match;
  while ((match = fileBlockRegex.exec(content)) !== null) {
    const [, filePath, fileContent] = match;
    if (filePath && fileContent) push(filePath, fileContent);
  }

  // ```lang path/file.ext\ncode``` (comment-style path on first line optional above; second pattern)
  const alt = /```(?:[\w.+#-]+)?\s+([^\n`]+\.[\w.]+)\s*\n([\s\S]*?)```/g;
  while ((match = alt.exec(content)) !== null) {
    const [, filePath, fileContent] = match;
    if (filePath && fileContent) push(filePath, fileContent);
  }

  // Original: ```lang\npath.ext\ncode``` (path as first line without //)
  const fileBlockRegex2 = /```(\w+)?\s*(?:\/\/\s*)?([^\n]+\.[\w]+)\n([\s\S]*?)```/g;
  while ((match = fileBlockRegex2.exec(content)) !== null) {
    const [, , filePath, fileContent] = match;
    if (filePath && fileContent) push(filePath, fileContent);
  }

  return fileChanges;
}

/**
 * Generate a complete project using Ollama
 */
export async function generateProjectWithOllama(
  prompt: string,
  framework?: string,
  name?: string,
  model?: string
): Promise<any> {
  try {
    const projectName = name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'generated-project';
    
    const systemPrompt = `You are an elite Senior Full-Stack Architect. Your goal is to generate a comprehensive, professional, and visually stunning project.
    
IMPORTANT RULES:
1. NEVER generate a single file. Always split logic into index.html, style.css, and script.js (and others as needed).
2. Use modern, premium DESIGN. Use Tailwind CSS via CDN in the HTML.
3. Every project MUST have:
   - A modern responsive layout.
   - Interactive elements with animations.
   - Professional typography and color palettes.
4. For games, include full game loops and collision logic.
5. Format EVERY file block as:
\`\`\`language
// filename.ext
code contents
\`\`\`

Framework: ${framework || 'vanilla JavaScript'}
Project Name: ${projectName}`;

    const fullPrompt = `Create a complete project: ${prompt}

Requirements:
- Use ${framework || 'vanilla JavaScript'}
- Include all necessary files (HTML, CSS, JavaScript, package.json if needed)
- Add proper error handling and comments
- Make it production-ready
- Include a README.md with setup instructions`;

    const response = await callOllama(fullPrompt, model, systemPrompt, 0.7);
    
    const fileChanges = extractFileChanges(response);
    
    // Build project structure
    const files: Record<string, string> = {};
    fileChanges.forEach(change => {
      if (change.newContent) {
        files[change.filePath] = change.newContent;
      }
    });

    // Ensure we have at least an index.html
    if (!files['index.html'] && !files['src/index.html']) {
      files['index.html'] = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
</head>
<body>
    <h1>${projectName}</h1>
    <p>Generated with Ollama</p>
</body>
</html>`;
    }

    return {
      name: projectName,
      description: `Project generated with Ollama: ${prompt}`,
      files,
      framework: framework || 'vanilla',
      template: 'custom',
      fileChanges
    };
  } catch (error) {
    console.error('Error generating project with Ollama:', error);
    throw error;
  }
}

/**
 * Generate code using Ollama
 */
export async function generateCodeWithOllama(
  instruction: string,
  context?: string,
  model?: string
): Promise<{ content: string; fileChanges?: FileChange[] }> {
  try {
    const systemPrompt = `You are an expert programmer. Generate clean, efficient, and well-documented code based on the user's instructions.
    
When providing code:
1. Use proper syntax and best practices
2. Include comments explaining complex logic
3. Handle edge cases and errors
4. Format code properly
5. If creating/modifying files, use this format:
\`\`\`language filename
// code here
\`\`\``;

    const fullPrompt = context 
      ? `Context:\n${context}\n\nInstruction: ${instruction}`
      : instruction;

    const response = await callOllama(fullPrompt, model, systemPrompt, 0.7);
    const fileChanges = extractFileChanges(response);

    return {
      content: response,
      fileChanges
    };
  } catch (error) {
    console.error('Error generating code with Ollama:', error);
    throw error;
  }
}

/**
 * Chat with Ollama
 */
export async function chatWithOllama(
  message: string,
  chatHistory?: any[],
  projectContext?: any,
  model?: string
): Promise<{ content: string; fileChanges?: FileChange[] }> {
  try {
    // Build messages array for chat
    const messages: Array<{ role: string; content: string }> = [];
    
    // Add system message
    messages.push({
      role: 'system',
      content: `You are an AI coding assistant integrated into an IDE. Help users with:
- Code generation and debugging
- Explaining concepts
- Suggesting improvements
- Fixing errors
- Answering questions

IMPORTANT: When providing code:
1. Always use markdown code blocks with language specification
2. Include the filename as a comment on the first line of the code block
3. Format: \`\`\`language
// filename.ext
code here
\`\`\`

Example:
\`\`\`javascript
// app.js
function hello() {
  console.log("Hello World");
}
\`\`\`

This allows the user to apply your code directly to files with one click.`
    });

    // Add project context if available
    if (projectContext) {
      let contextStr = 'Project Context:\n';
      if (projectContext.files) {
        contextStr += `Files: ${Object.keys(projectContext.files).join(', ')}\n`;
      }
      if (projectContext.framework) {
        contextStr += `Framework: ${projectContext.framework}\n`;
      }
      if (projectContext.diagnostics && projectContext.diagnostics.length > 0) {
        contextStr += `\nCurrent Issues:\n`;
        projectContext.diagnostics.forEach((d: any) => {
          contextStr += `- ${d.filePath}:${d.lineNumber} - ${d.message}\n`;
        });
      }
      messages.push({
        role: 'system',
        content: contextStr
      });
    }

    // Add chat history
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    const response = await callOllamaChat(messages, model, 0.7);
    const fileChanges = extractFileChanges(response);

    return {
      content: response,
      fileChanges
    };
  } catch (error) {
    console.error('Error chatting with Ollama:', error);
    throw error;
  }
}

/**
 * Analyze code using Ollama
 */
export async function analyzeCodeWithOllama(
  code: string,
  task: string,
  model?: string
): Promise<string> {
  try {
    const systemPrompt = `You are an expert code reviewer and analyzer. Provide detailed, actionable feedback on code quality, performance, security, and best practices.`;

    const prompt = `Task: ${task}

Code to analyze:
\`\`\`
${code}
\`\`\`

Please provide:
1. Code quality assessment
2. Potential issues or bugs
3. Performance considerations
4. Security concerns
5. Suggestions for improvement`;

    const response = await callOllama(prompt, model, systemPrompt, 0.5);
    return response;
  } catch (error) {
    console.error('Error analyzing code with Ollama:', error);
    throw error;
  }
}

/**
 * List available Ollama models
 */
export async function listOllamaModels(): Promise<any> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) {
      throw new Error('Failed to fetch Ollama models');
    }
    const data = await response.json();
    return (data as any).models || [];
  } catch (error) {
    console.error('Error listing Ollama models:', error);
    return [];
  }
}
