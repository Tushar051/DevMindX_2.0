// Note: OpenAI and Anthropic imports commented out until API keys are configured
import { generateProjectWithTogether, generateCodeWithTogether, chatWithTogether, analyzeCodeWithTogether } from './together.js';

export type AIModel = 'together';

export interface AIResponse {
  content: string;
  model: AIModel;
  timestamp: Date;
}

export interface ProjectGenerationRequest {
  prompt: string;
  model: AIModel;
  framework?: string;
  name?: string;
}

export interface CodeGenerationRequest {
  instruction: string;
  model: AIModel;
  context?: string;
  language?: string;
}

export interface ChatRequest {
  message: string;
  model: AIModel;
  chatHistory?: any[];
  projectContext?: string;
}

export async function generateProjectWithAI(request: ProjectGenerationRequest): Promise<any> {
  const { prompt, model, framework, name } = request;

  switch (model) {
    case 'together':
      return await generateProjectWithTogether(prompt);
    default:
      throw new Error(`Unsupported AI model: ${model}`);
  }
}

export async function generateCodeWithAI(request: CodeGenerationRequest): Promise<AIResponse> {
  const { instruction, model, context, language } = request;
  let content: string;

  switch (model) {
    case 'together':
      content = await generateCodeWithTogether(instruction, context);
      break;
    default:
      throw new Error(`Unsupported AI model: ${model}`);
  }

  return {
    content,
    model,
    timestamp: new Date()
  };
}

export async function chatWithAIModel(request: ChatRequest): Promise<AIResponse> {
  console.log('chatWithAIModel called with request:', request);

  const { message, model, chatHistory, projectContext } = request;
  let content: string;

  switch (model) {
    case 'together':
      content = await chatWithTogether(message, chatHistory);
      break;
    default:
      throw new Error(`Unsupported AI model: ${model}`);
  }

  return {
    content,
    model,
    timestamp: new Date()
  };
}

export async function analyzeCodeWithAI(code: string, task: string, model: AIModel): Promise<AIResponse> {
  let content: string;

  switch (model) {
    case 'together':
      content = await analyzeCodeWithTogether(code, task);
      break;
    default:
      throw new Error(`Unsupported AI model: ${model}`);
  }

  return {
    content,
    model,
    timestamp: new Date()
  };
}

export function getAvailableModels(): { id: AIModel; name: string; description: string; available: boolean }[] {
  return [
    {
      id: 'together',
      name: 'Together AI',
      description: 'Together AI\'s open-source models',
      available: !!process.env.TOGETHER_API_KEY
    }
  ];
}