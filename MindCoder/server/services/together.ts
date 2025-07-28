

import Together from 'together-ai';

// Validate API key
if (!process.env.TOGETHER_API_KEY) {
  console.warn('TOGETHER_API_KEY is not set. AI features will not work.');
}

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

// System prompt to guide the model's behavior as an IDE AI assistant
const SYSTEM_PROMPT = {
  role: 'system',
  content: 'You are an expert programming assistant. Provide clean, efficient code with minimal explanation unless asked.',
};

// --- 1. Generate Full Project Code ---
export async function generateProjectWithTogether(
  prompt: string, 
  framework?: string, 
  name?: string
): Promise<any> {
  try {
    if (!process.env.TOGETHER_API_KEY) {
      throw new Error('TOGETHER_API_KEY is not configured');
    }

    console.log('Calling Together AI for project generation with:', { prompt, framework, name });

    let enhancedPrompt = `Generate a complete project structure and main code logic based on this prompt: "${prompt}"`;
    
    if (framework) {
      enhancedPrompt += `\nFramework: ${framework}`;
    }
    
    if (name) {
      enhancedPrompt += `\nProject name: ${name}`;
    }

    enhancedPrompt += `\n\nReturn the response as a JSON object with the following structure:
{
  "name": "project-name",
  "framework": "framework-name",
  "description": "project description",
  "files": {
    "filename.ext": "file content",
    "folder/filename.ext": "file content"
  }
}`;

    const response = await together.chat.completions.create({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      messages: [
        { role: SYSTEM_PROMPT.role as 'system', content: SYSTEM_PROMPT.content },
        { role: 'user', content: enhancedPrompt },
      ],
      max_tokens: 2048,
      temperature: 0.7,
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('No response from Together AI');
    }

    console.log('Raw Together AI response:', content);

    // Try to parse JSON response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        return {
          name: parsedResponse.name || name || 'Generated Project',
          framework: parsedResponse.framework || framework || 'web',
          description: parsedResponse.description || prompt,
          files: parsedResponse.files || {}
        };
      }
    } catch (parseError) {
      console.warn('Failed to parse JSON response, returning basic structure:', parseError);
    }

    // Fallback: return basic structure with content as main file
    return {
      name: name || 'Generated Project',
      framework: framework || 'web',
      description: prompt,
      files: {
        'README.md': `# ${name || 'Generated Project'}\n\n${prompt}\n\n## Generated Code\n\n${content}`,
        'main.js': content
      }
    };

  } catch (error) {
    console.error('Error in generateProjectWithTogether:', error);
    
    // Return a basic fallback project structure
    return {
      name: name || 'Error Project',
      framework: framework || 'web',
      description: prompt || 'Failed to generate project',
      files: {
        'README.md': `# ${name || 'Error Project'}\n\nFailed to generate project: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'index.html': `<!DOCTYPE html>
<html>
<head>
    <title>${name || 'Error Project'}</title>
</head>
<body>
    <h1>Project Generation Failed</h1>
    <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
</body>
</html>`
      }
    };
  }
}

// --- 2. Generate Code Snippet Based on Instruction and Optional Context ---
export async function generateCodeWithTogether(instruction: string, context?: string): Promise<string> {
  try {
    if (!process.env.TOGETHER_API_KEY) {
      throw new Error('TOGETHER_API_KEY is not configured');
    }

    console.log('Calling Together AI for code generation with:', { instruction, hasContext: !!context });

    const userPrompt = context
      ? `Given the following context:\n${context}\n\nGenerate code for this instruction:\n${instruction}`
      : `Generate code for the following instruction:\n${instruction}`;

    const response = await together.chat.completions.create({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      messages: [
        { role: SYSTEM_PROMPT.role as 'system', content: SYSTEM_PROMPT.content },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1024,
      temperature: 0.3,
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('No response from Together AI');
    }

    return content;

  } catch (error) {
    console.error('Error in generateCodeWithTogether:', error);
    throw new Error(`Failed to generate code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// --- 3. Chat With the AI (Like in Cursor/Copilot-style Chat) ---
export async function chatWithTogether(
  message: string, 
  chatHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
  try {
    if (!process.env.TOGETHER_API_KEY) {
      throw new Error('TOGETHER_API_KEY is not configured');
    }

    console.log('Calling Together AI for chat with:', { 
      message: message.substring(0, 100) + '...', 
      historyLength: chatHistory.length 
    });

    // Limit chat history to last 10 messages to avoid token limits
    const limitedHistory = chatHistory.slice(-10);
    
    const messages = [
      SYSTEM_PROMPT, 
      ...limitedHistory, 
      { role: 'user', content: message }
    ];

    const response = await together.chat.completions.create({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      messages: messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      })),
      max_tokens: 1024,
      temperature: 0.7,
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('No response from Together AI');
    }

    return content;

  } catch (error) {
    console.error('Error calling Together AI chat:', error);
    
    // Provide a helpful error message to the user
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return 'I apologize, but the AI service is not properly configured. Please check the API key settings.';
      } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return 'I apologize, but the AI service is currently rate limited. Please try again in a few moments.';
      } else {
        return `I apologize, but I encountered an error: ${error.message}. Please try again.`;
      }
    }
    
    return 'I apologize, but I encountered an unexpected error. Please try again.';
  }
}

// --- 4. Analyze Code for a Given Task (e.g., Explain, Refactor, Debug) ---
export async function analyzeCodeWithTogether(code: string, task: string): Promise<string> {
  try {
    if (!process.env.TOGETHER_API_KEY) {
      throw new Error('TOGETHER_API_KEY is not configured');
    }

    console.log('Calling Together AI for code analysis with:', { 
      codeLength: code.length, 
      task 
    });

    const formattedPrompt = `Please perform the following task: "${task}"\n\nCode:\n\`\`\`\n${code}\n\`\`\``;

    const response = await together.chat.completions.create({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      messages: [
        { role: SYSTEM_PROMPT.role as 'system', content: SYSTEM_PROMPT.content },
        { role: 'user', content: formattedPrompt }
      ],
      max_tokens: 1024,
      temperature: 0.3,
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('No response from Together AI');
    }

    return content;

  } catch (error) {
    console.error('Error in analyzeCodeWithTogether:', error);
    throw new Error(`Failed to analyze code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}