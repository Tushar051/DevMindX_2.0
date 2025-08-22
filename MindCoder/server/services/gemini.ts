import { GoogleGenerativeAI } from '@google/generative-ai';
import { FileChange } from '@shared/types.js';
import JSON5 from 'json5';

if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set. Gemini AI features will use simulated responses.');
}

const isFakeKey = (key: string | undefined) => {
  return key?.startsWith('fake_');
};

const simulateResponse = (prompt: string) => {
  return `[FAKE GEMINI] This is a simulated response for your prompt: "${prompt}"`;
};

const SYSTEM_PROMPT = {
  role: 'system',
  content:
    'You are a concise programming assistant. Respond briefly. Avoid examples or code unless explicitly asked. Do not repeat the question. If you are given diagnostic information (errors, warnings), prioritize addressing them by providing an updated file content. When suggesting code changes, provide a JSON object with a \'fileChanges\' array, where each object in the array has \'filePath\', \'action\' (create, update, or delete), and \'newContent\' (if action is create or update). If no specific file changes are needed, or if the response is purely conversational, return a simple text response. When providing file changes, ensure the content is complete and syntactically correct, including all necessary imports and surrounding code context.',
};

// --- 1. Generate Full Project Code ---
export async function generateProjectWithGemini(prompt: string, framework?: string, name?: string): Promise<any> {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
    
    if (isFakeKey(process.env.GEMINI_API_KEY)) {
      const projectFolderName = name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'generated-project';
      return {
        name: name || 'Generated Project',
        framework: framework || 'web',
        description: prompt,
        files: {
          [`${projectFolderName}/README.md`]: simulateResponse(prompt),
          [`${projectFolderName}/index.html`]: simulateResponse(`Create index.html for ${prompt}`),
          [`${projectFolderName}/style.css`]: simulateResponse(`Create style.css for ${prompt}`),
          [`${projectFolderName}/script.js`]: simulateResponse(`Create script.js for ${prompt}`)
        }
      };
    }

    // Real implementation would go here
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Implementation details would go here
    throw new Error('Real Gemini implementation not yet available');

  } catch (error) {
    console.error('Error in generateProjectWithGemini:', error);
    throw error;
  }
}

// --- 2. Generate Code Snippet ---
export async function generateCodeWithGemini(instruction: string, context?: string): Promise<{ content: string; fileChanges?: FileChange[] }> {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
    
    if (isFakeKey(process.env.GEMINI_API_KEY)) {
      return { content: simulateResponse(instruction), fileChanges: [] };
    }

    // Real implementation would go here
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const parts = [
      { text: instruction },
    ];

    if (context) {
      parts.unshift({ text: `Context:\n${context}\n\n` });
    }

    const result = await model.generateContent({
      contents: [
        { role: "system", parts: [{ text: SYSTEM_PROMPT.content }] },
        { role: "user", parts }
      ]
    });
    const content = result.response.text();

    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
    if (jsonMatch) {
      const jsonString = jsonMatch[1] || jsonMatch[2];
      try {
        const parsedContent = JSON5.parse(jsonString);
        if (parsedContent && typeof parsedContent === 'object' && parsedContent.fileChanges) {
          return { content: parsedContent.content || '', fileChanges: parsedContent.fileChanges };
        }
      } catch (parseError) {
        console.log('Gemini code generation response contained JSON but failed to parse or was not expected structure. Treating as plain text.', parseError);
      }
    }

    return { content, fileChanges: [] };

  } catch (error) {
    console.error('Error in generateCodeWithGemini:', error);
    throw error;
  }
}

// --- 3. Chat with AI ---
export async function chatWithGemini(message: string, chatHistory?: any[], projectContext?: any): Promise<{ content: string; fileChanges?: FileChange[] }> {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
    
    if (isFakeKey(process.env.GEMINI_API_KEY)) {
      return { content: simulateResponse(message), fileChanges: [] };
    }

    // Real implementation would go here
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const chat = model.startChat({
      history: [
        { role: "model", parts: [{ text: SYSTEM_PROMPT.content }] }, // System instruction as first model message
        ...(chatHistory || []).map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }))
      ],
    });

    const result = await chat.sendMessage(message);
    const content = result.response.text();

    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
    if (jsonMatch) {
      const jsonString = jsonMatch[1] || jsonMatch[2];
      try {
        const parsedContent = JSON5.parse(jsonString);
        if (parsedContent && typeof parsedContent === 'object' && parsedContent.fileChanges) {
          return { content: parsedContent.content || '', fileChanges: parsedContent.fileChanges };
        }
      } catch (parseError) {
        console.log('Gemini chat response contained JSON but failed to parse or was not expected structure. Treating as plain text.', parseError);
      }
    }

    return { content, fileChanges: [] };

  } catch (error) {
    console.error('Error in chatWithGemini:', error);
    throw error;
  }
}

// --- 4. Analyze Code ---
export async function analyzeCodeWithGemini(code: string, task: string): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
    
    if (isFakeKey(process.env.GEMINI_API_KEY)) {
      return simulateResponse(`Analyze code: ${task}`);
    }

    // Real implementation would go here
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Implementation details would go here
    throw new Error('Real Gemini implementation not yet available');

  } catch (error) {
    console.error('Error in analyzeCodeWithGemini:', error);
    throw error;
  }
}