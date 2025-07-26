import Together from 'together-ai';

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

// System prompt to guide the model's behavior as an IDE AI assistant
const SYSTEM_PROMPT = {
  role: 'system',
  content: 'You are an expert programming assistant inside a modern IDE. Provide clean, well-documented, and efficient code. Explain decisions clearly.',
};

// --- 1. Generate Full Project Code ---
export async function generateProjectWithTogether(prompt: string): Promise<string> {
  const response = await together.chat.completions.create({
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    messages: [
      SYSTEM_PROMPT,
      { role: 'user', content: `Generate a complete project structure and main code logic based on this prompt:\n\n"${prompt}"` },
    ],
    max_tokens: 2048,
  });

  return response.choices?.[0]?.message?.content?.trim() || '[No response from model]';
}

// --- 2. Generate Code Snippet Based on Instruction and Optional Context ---
export async function generateCodeWithTogether(instruction: string, context?: string): Promise<string> {
  const userPrompt = context
    ? `Given the following context:\n${context}\n\nGenerate code for this instruction:\n${instruction}`
    : `Generate code for the following instruction:\n${instruction}`;

  const response = await together.chat.completions.create({
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    messages: [SYSTEM_PROMPT, { role: 'user', content: userPrompt }],
    max_tokens: 1024,
  });

  return response.choices?.[0]?.message?.content?.trim() || '[No code generated]';
}

// --- 3. Chat With the AI (Like in Cursor/Copilot-style Chat) ---
export async function chatWithTogether(message: string, chatHistory: { role: 'user' | 'assistant'; content: string }[] = []): Promise<string> {
  const messages = [SYSTEM_PROMPT, ...chatHistory, { role: 'user', content: message }];

  const response = await together.chat.completions.create({
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    messages,
    max_tokens: 1024,
  });

  return response.choices?.[0]?.message?.content?.trim() || '[No reply from assistant]';
}

// --- 4. Analyze Code for a Given Task (e.g., Explain, Refactor, Debug) ---
export async function analyzeCodeWithTogether(code: string, task: string): Promise<string> {
  const formattedPrompt = `Please perform the following task: "${task}"\n\nCode:\n${code}`;

  const response = await together.chat.completions.create({
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    messages: [SYSTEM_PROMPT, { role: 'user', content: formattedPrompt }],
    max_tokens: 1024,
  });

  return response.choices?.[0]?.message?.content?.trim() || '[Analysis failed]';
}
