import Together from 'together-ai';
import JSON5 from 'json5'; // Install via: npm install json5

if (!process.env.TOGETHER_API_KEY) {
  console.warn('TOGETHER_API_KEY is not set. AI features will not work.');
}

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

const SYSTEM_PROMPT = {
  role: 'system',
  content:
    'You are a concise programming assistant. Respond briefly. Avoid examples or code unless explicitly asked. Do not repeat the question.',
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
export async function generateCodeWithTogether(instruction: string, context?: string): Promise<string> {
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
    return content;

  } catch (error) {
    console.error('Error in generateCodeWithTogether:', error);
    throw new Error(`Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// --- 3. Chat With the AI ---
export async function chatWithTogether(
  message: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
  try {
    if (!process.env.TOGETHER_API_KEY) throw new Error('TOGETHER_API_KEY is not configured');

    const limitedHistory = chatHistory.slice(-10);
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
    return content;

  } catch (error) {
    console.error('Error in chatWithTogether:', error);
    if (error instanceof Error) {
      if (error.message.includes('API key')) return 'AI service not configured.';
      if (error.message.includes('rate limit')) return 'Service is rate-limited. Try again later.';
      return `Error: ${error.message}`;
    }
    return 'Unexpected error occurred.';
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
