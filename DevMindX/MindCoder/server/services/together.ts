import Together from 'together-ai';
import JSON5 from 'json5'; 
import { FileChange } from '@shared/types.js';

if (!process.env.TOGETHER_API_KEY) {
  console.warn('TOGETHER_API_KEY is not set. AI features will not work.');
}

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

const SYSTEM_PROMPT = {
  role: 'system',
  content:
    'You are a concise programming assistant. Respond briefly. Avoid examples or code unless explicitly asked. Do not repeat the question. If you are given diagnostic information (errors, warnings), prioritize addressing them by providing an updated file content. When suggesting code changes, provide a JSON object with a \'fileChanges\' array, where each object in the array has \'filePath\', \'action\' (create, update, or delete), and \'newContent\' (if action is create or update). If no specific file changes are needed, or if the response is purely conversational, return a simple text response. When providing file changes, ensure the content is complete and syntactically correct, including all necessary imports and surrounding code context.',
};

// --- 1. Generate Full Project Code ---
export async function generateProjectWithTogether(prompt: string, framework?: string, name?: string): Promise<any> {
  try {
    if (!process.env.TOGETHER_API_KEY) throw new Error('TOGETHER_API_KEY is not configured');

    const projectFolderName = name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'generated-project';
    const frameworkToUse = framework || 'default';

    console.log('Calling Together AI for project generation with:', { prompt, framework: frameworkToUse, name });

    let enhancedPrompt = `Generate a full project structure and code for the following description:

"${prompt}"

You MUST follow these strict requirements:
1. Place all files inside a root folder named '${projectFolderName}'
2. Use consistent code indentation (2 spaces) and clean formatting
3. Include essential files like README.md, package.json, etc. if relevant
4. Follow modern development practices and the conventions of the chosen stack
5. Return the result strictly as a valid JSON object with this structure:

{
  "name": "${name || 'Generated Project'}",
  "framework": "${frameworkToUse}",
  "description": "Project description",
  "files": {
    "${projectFolderName}/index.html": "file content",
    "${projectFolderName}/style.css": "file content",
    "${projectFolderName}/README.md": "project documentation"
  }
}

Do not include any markdown explanations or extra commentary. Just return the raw JSON object. Do not escape newlines inside the code content.
`;

    const response = await together.chat.completions.create({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      messages: [
        { role: SYSTEM_PROMPT.role as 'system', content: SYSTEM_PROMPT.content },
        { role: 'user', content: enhancedPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.5,
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('No response from Together AI');

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON5.parse(jsonMatch[0]); // safer parser
        return {
          name: parsed.name || name || 'Generated Project',
          framework: parsed.framework || framework || 'web',
          description: parsed.description || prompt,
          files: parsed.files || {}
        };
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
      }
    }

    // fallback if no match
    return {
      name: name || 'Generated Project',
      framework: framework || 'web',
      description: prompt,
      files: {
        'README.md': `# ${name || 'Generated Project'}\n\n${prompt}`,
        'main.js': content
      }
    };

  } catch (error) {
    console.error('Error in generateProjectWithTogether:', error);
    return {
      name: name || 'Error Project',
      framework: framework || 'web',
      description: prompt,
      files: {
        'README.md': `# ${name || 'Error Project'}\n\nError: ${error instanceof Error ? error.message : 'Unknown'}`,
        'index.html': `<html><body><h1>Error generating project</h1></body></html>`
      }
    };
  }
}

// --- 2. Generate Code Snippet ---
export async function generateCodeWithTogether(instruction: string, context?: string): Promise<{ content: string; fileChanges?: FileChange[] }> {
  try {
    if (!process.env.TOGETHER_API_KEY) throw new Error('TOGETHER_API_KEY is not configured');

    const userPrompt = context
      ? `Context:\n${context}\n\nInstruction:\n${instruction}`
      : `Instruction:\n${instruction}`;

    const response = await together.chat.completions.create({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      messages: [
        { role: SYSTEM_PROMPT.role as 'system', content: SYSTEM_PROMPT.content },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('No response from Together AI');
    return { content, fileChanges: [] };

  } catch (error) {
    console.error('Error in generateCodeWithTogether:', error);
    throw new Error(`Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// --- 3. Chat With the AI ---
function normalizeChatHistory(
  history: { role: 'user' | 'assistant'; content: string }[] = []
) {
  const normalized: { role: 'user' | 'assistant'; content: string }[] = [];
  let expectedRole: 'user' | 'assistant' = 'user';

  for (const entry of history) {
    if (entry.role !== expectedRole) {
      continue;
    }

    normalized.push({ role: entry.role, content: entry.content });
    expectedRole = expectedRole === 'user' ? 'assistant' : 'user';
  }

  while (normalized.length > 0 && normalized[normalized.length - 1].role === 'user') {
    normalized.pop();
    expectedRole = 'assistant';
  }

  return normalized;
}

export async function chatWithTogether(
  message: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[] = [],
  projectContext?: any // Added projectContext parameter
): Promise<{ content: string; fileChanges?: FileChange[] }> {
  try {
    if (!process.env.TOGETHER_API_KEY) throw new Error('TOGETHER_API_KEY is not configured');

    const limitedHistory = normalizeChatHistory(chatHistory.slice(-10));
    const messages = [
      SYSTEM_PROMPT,
      ...limitedHistory,
      { role: 'user', content: message }
    ];

    const response = await together.chat.completions.create({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      messages: messages.map(m => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content
      })),
      max_tokens: 700,
      temperature: 0.5,
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('No response from Together AI');

    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
    if (jsonMatch) {
      const jsonString = jsonMatch[1] || jsonMatch[2];
      try {
        const parsedContent = JSON5.parse(jsonString);
        if (parsedContent && typeof parsedContent === 'object' && parsedContent.fileChanges) {
          return { content: parsedContent.content || '', fileChanges: parsedContent.fileChanges };
        }
      } catch (parseError) {
        console.log('AI response contained JSON but failed to parse or was not expected structure. Treating as plain text.', parseError);
      }
    }

    return { content, fileChanges: [] };

  } catch (error) {
    console.error('Error in chatWithTogether:', error);
    if (error instanceof Error) {
      if (error.message.includes('API key')) return { content: 'AI service not configured.', fileChanges: [] };
      if (error.message.includes('rate limit')) return { content: 'Service is rate-limited. Try again later.', fileChanges: [] };
      return { content: `Error: ${error.message}`, fileChanges: [] };
    }
    return { content: 'Unexpected error occurred.', fileChanges: [] };
  }
}

// --- 4. Analyze Code ---
export async function analyzeCodeWithTogether(code: string, task: string): Promise<string> {
  try {
    if (!process.env.TOGETHER_API_KEY) throw new Error('TOGETHER_API_KEY is not configured');

    const formattedPrompt = `Task: "${task}"\n\nCode:\n\`\`\`\n${code}\n\`\`\``;

    const response = await together.chat.completions.create({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      messages: [
        { role: SYSTEM_PROMPT.role as 'system', content: SYSTEM_PROMPT.content },
        { role: 'user', content: formattedPrompt }
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('No response from Together AI');
    return content;

  } catch (error) {
    console.error('Error in analyzeCodeWithTogether:', error);
    throw new Error(`Failed to analyze code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
