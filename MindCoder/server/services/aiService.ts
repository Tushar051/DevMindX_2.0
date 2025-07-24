// Note: OpenAI and Anthropic imports commented out until API keys are configured
// import { generateProject as generateOpenAIProject, generateCode as generateOpenAICode, chatWithAI as chatWithOpenAI } from './openai';
import { generateProjectWithGemini, generateCodeWithGemini, chatWithGemini, analyzeCodeWithGemini } from './gemini';

export type AIModel = 'openai' | 'gemini' | 'anthropic';

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
    case 'gemini':
      return await generateProjectWithGemini(prompt);
    case 'openai':
      throw new Error('OpenAI API not configured yet');
    case 'anthropic':
      throw new Error('Claude API not configured yet');
    default:
      throw new Error(`Unsupported AI model: ${model}`);
  }
}

export async function generateCodeWithAI(request: CodeGenerationRequest): Promise<AIResponse> {
  const { instruction, model, context, language } = request;
  let content: string;

  switch (model) {
    case 'gemini':
      content = await generateCodeWithGemini(instruction, context);
      break;
    case 'openai':
      throw new Error('OpenAI API not configured yet');
    case 'anthropic':
      throw new Error('Claude API not configured yet');
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
  const { message, model, chatHistory, projectContext } = request;
  let content: string;

  switch (model) {
    case 'gemini':
      content = await chatWithGemini(message, chatHistory);
      break;
    case 'openai':
      throw new Error('OpenAI API not configured yet');
    case 'anthropic':
      throw new Error('Claude API not configured yet');
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
    case 'gemini':
      content = await analyzeCodeWithGemini(code, task);
      break;
    case 'openai':
      throw new Error('OpenAI API not configured yet');
    case 'anthropic':
      throw new Error('Claude API not configured yet');
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
      id: 'gemini',
      name: 'Gemini Pro',
      description: 'Google\'s advanced multimodal AI',
      available: !!process.env.GEMINI_API_KEY
    },
    {
      id: 'openai',
      name: 'ChatGPT',
      description: 'OpenAI\'s GPT-4o model',
      available: !!process.env.OPENAI_API_KEY
    },
    {
      id: 'anthropic',
      name: 'Claude',
      description: 'Anthropic\'s reasoning-focused AI',
      available: !!process.env.ANTHROPIC_API_KEY
    }
  ];
}