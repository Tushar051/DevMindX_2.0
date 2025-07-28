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
  projectContext?: any; // Changed from string to any to match usage
}

export async function generateProjectWithAI(request: ProjectGenerationRequest): Promise<any> {
  try {
    const { prompt, model, framework, name } = request;

    console.log('generateProjectWithAI called with:', { prompt, model, framework, name });

    // Validate required parameters
    if (!prompt) {
      throw new Error('Prompt is required for project generation');
    }

    switch (model) {
      case 'together':
        const result = await generateProjectWithTogether(prompt, framework, name);
        console.log('Generated project result:', result);
        return result;
      default:
        throw new Error(`Unsupported AI model: ${model}`);
    }
  } catch (error) {
    console.error('Error in generateProjectWithAI:', error);
    throw error;
  }
}

export async function generateCodeWithAI(request: CodeGenerationRequest): Promise<AIResponse> {
  try {
    const { instruction, model, context, language } = request;
    
    console.log('generateCodeWithAI called with:', { instruction, model, context, language });
    
    // Validate required parameters
    if (!instruction) {
      throw new Error('Instruction is required for code generation');
    }

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
  } catch (error) {
    console.error('Error in generateCodeWithAI:', error);
    throw error;
  }
}

export async function chatWithAIModel(request: ChatRequest): Promise<AIResponse> {
  try {
    console.log('chatWithAIModel called with request:', request);

    const { message, model, chatHistory, projectContext } = request;
    
    // Validate required parameters
    if (!message) {
      throw new Error('Message is required for chat');
    }

    let content: string;

    switch (model) {
      case 'together':
        content = await chatWithTogether(message, chatHistory);
        break;
      default:
        throw new Error(`Unsupported AI model: ${model}`);
    }

    console.log('Chat response generated:', { content: content.substring(0, 100) + '...' });

    return {
      content,
      model,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error in chatWithAIModel:', error);
    throw error;
  }
}

// Fixed function name typo
export async function analyzeCodeWithAI(code: string, task: string, model: AIModel): Promise<AIResponse> {
  try {
    console.log('analyzeCodeWithAI called with:', { code: code.substring(0, 100) + '...', task, model });
    
    // Validate required parameters
    if (!code) {
      throw new Error('Code is required for analysis');
    }
    if (!task) {
      throw new Error('Task is required for code analysis');
    }

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
  } catch (error) {
    console.error('Error in analyzeCodeWithAI:', error);
    throw error;
  }
}

export function getAvailableModels(): { id: AIModel; name: string; description: string; available: boolean }[] {
  try {
    const models = [
      {
        id: 'together' as AIModel,
        name: 'Together AI',
        description: 'Together AI\'s open-source models',
        available: !!process.env.TOGETHER_API_KEY
      }
    ];
    
    console.log('Available models:', models);
    return models;
  } catch (error) {
    console.error('Error in getAvailableModels:', error);
    return [];
  }
}