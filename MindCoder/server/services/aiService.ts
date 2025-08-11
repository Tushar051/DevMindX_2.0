// Import all LLM service implementations
import { generateProjectWithTogether, generateCodeWithTogether, chatWithTogether, analyzeCodeWithTogether } from './together.js';
import { generateProjectWithGemini, generateCodeWithGemini, chatWithGemini, analyzeCodeWithGemini } from './gemini.js';
import { generateProjectWithChatGPT, generateCodeWithChatGPT, chatWithChatGPT, analyzeCodeWithChatGPT } from './chatgpt.js';
import { generateProjectWithClaude, generateCodeWithClaude, chatWithClaude, analyzeCodeWithClaude } from './claude.js';
import { generateProjectWithDeepSeek, generateCodeWithDeepSeek, chatWithDeepSeek, analyzeCodeWithDeepSeek } from './deepseek.js';

// Import shared types
import { AIModelId, AIResponse, ProjectGenerationRequest, CodeGenerationRequest, ChatRequest, AIModel, PurchasedModel } from '../../shared/types.js';

// Use AIModelId instead of AIModel for type compatibility

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
      case 'gemini':
        return await generateProjectWithGemini(prompt, framework, name);
      case 'chatgpt':
        return await generateProjectWithChatGPT(prompt, framework, name);
      case 'claude':
        return await generateProjectWithClaude(prompt, framework, name);
      case 'deepseek':
        return await generateProjectWithDeepSeek(prompt, framework, name);
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
      case 'gemini':
        content = await generateCodeWithGemini(instruction, context);
        break;
      case 'chatgpt':
        content = await generateCodeWithChatGPT(instruction, context);
        break;
      case 'claude':
        content = await generateCodeWithClaude(instruction, context);
        break;
      case 'deepseek':
        content = await generateCodeWithDeepSeek(instruction, context);
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
      case 'gemini':
        content = await chatWithGemini(message, chatHistory);
        break;
      case 'chatgpt':
        content = await chatWithChatGPT(message, chatHistory);
        break;
      case 'claude':
        content = await chatWithClaude(message, chatHistory);
        break;
      case 'deepseek':
        content = await chatWithDeepSeek(message, chatHistory);
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
export async function analyzeCodeWithAI(code: string, task: string, model: AIModelId): Promise<AIResponse> {
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
      case 'gemini':
        content = await analyzeCodeWithGemini(code, task);
        break;
      case 'chatgpt':
        content = await analyzeCodeWithChatGPT(code, task);
        break;
      case 'claude':
        content = await analyzeCodeWithClaude(code, task);
        break;
      case 'deepseek':
        content = await analyzeCodeWithDeepSeek(code, task);
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

// Import MongoDB connection
import { connectToMongoDB } from '../db.js';
import { ObjectId } from 'mongodb';
import { createMongoIdFilter } from '../db.js';

export async function getAvailableModels(userId?: string): Promise<AIModel[]> { // Changed return type to any[]
  try {
    // Default purchased models (Together AI is always available)
    let userPurchasedModels: AIModelId[] = ['together'];
    let userPurchasedRecords: PurchasedModel[] = [];
    
    // If userId is provided, get the user's purchased models from MongoDB
    if (userId) {
      try {
        const db = await connectToMongoDB();
        let user = null;
        if (typeof userId === 'string' && /^[0-9a-fA-F]{24}$/.test(userId) || typeof userId === 'number') { // Allow number type IDs
          user = await db.collection('users').findOne({ _id: createMongoIdFilter(userId) });
          console.log('User found in getAvailableModels:', user);
        }
        
        if (user && user.purchasedModels && Array.isArray(user.purchasedModels)) {
          console.log('Raw user.purchasedModels:', user.purchasedModels);
          // Filter out expired models and add active ones to userPurchasedModels
          userPurchasedRecords = user.purchasedModels.filter((p: PurchasedModel) => {
            const purchaseDate = new Date(p.purchaseDate);
            const expirationDate = new Date(purchaseDate.setMonth(purchaseDate.getMonth() + p.months));
            return new Date() < expirationDate; // Check if still active
          });
          console.log('Filtered userPurchasedRecords (active subscriptions):', userPurchasedRecords);
          userPurchasedModels = [...new Set([...userPurchasedModels, ...userPurchasedRecords.map((p: PurchasedModel) => p.id)])];
        }
      } catch (dbError) {
        console.error('Error fetching user purchased models:', dbError);
        // Continue with default models if there's an error
      }
    }
    
    const models = [
      {
        id: 'together' as AIModelId,
        name: 'Together AI',
        description: 'Together AI\'s open-source models',
        available: true, // Together AI is always available
        complexity: 'Basic' as 'Basic' | 'Medium' | 'Complex',
        tokensPerMonth: 10000,
        pricePerToken: 0,
        price: 0, // Free tier
        features: [
          'Code Generation',
          'Debugging',
          'Refactoring',
          'Documentation',
          'Code Review'
        ],
        purchased: true, // Always purchased
        expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString() // Always available for 1 month from now
      },
      {
        id: 'gemini' as AIModelId,
        name: 'Gemini',
        description: 'Google\'s multimodal AI model',
        available: !!process.env.GEMINI_API_KEY && userPurchasedModels.includes('gemini'),
        complexity: 'Medium' as 'Basic' | 'Medium' | 'Complex',
        tokensPerMonth: 50000,
        pricePerToken: 0.002,
        price: 749, // Updated price to match landing page (INR)
        features: [
          'Code Generation',
          'Image Analysis',
          'Reasoning',
          'Documentation',
          'Testing'
        ],
        purchased: userPurchasedModels.includes('gemini'),
        expirationDate: userPurchasedRecords.find(p => p.id === 'gemini') ? 
          new Date(new Date(userPurchasedRecords.find(p => p.id === 'gemini')!.purchaseDate).setMonth(new Date(userPurchasedRecords.find(p => p.id === 'gemini')!.purchaseDate).getMonth() + userPurchasedRecords.find(p => p.id === 'gemini')!.months)).toISOString() : 
          undefined
      },
      {
        id: 'chatgpt' as AIModelId,
        name: 'ChatGPT',
        description: 'OpenAI\'s powerful language model',
        available: !!process.env.CHATGPT_API_KEY && userPurchasedModels.includes('chatgpt'),
        complexity: 'Complex' as 'Basic' | 'Medium' | 'Complex',
        tokensPerMonth: 100000,
        pricePerToken: 0.005,
        price: 1499, // Updated price to match landing page (INR)
        features: [
          'Natural Language',
          'Code Completion',
          'Problem Solving',
          'Explanation',
          'Debugging'
        ],
        purchased: userPurchasedModels.includes('chatgpt'),
        expirationDate: userPurchasedRecords.find(p => p.id === 'chatgpt') ? 
          new Date(new Date(userPurchasedRecords.find(p => p.id === 'chatgpt')!.purchaseDate).setMonth(new Date(userPurchasedRecords.find(p => p.id === 'chatgpt')!.purchaseDate).getMonth() + userPurchasedRecords.find(p => p.id === 'chatgpt')!.months)).toISOString() : 
          undefined
      },
      {
        id: 'claude' as AIModelId,
        name: 'Claude',
        description: 'Anthropic\'s helpful, harmless, and honest AI assistant',
        available: !!process.env.CLAUDE_API_KEY && userPurchasedModels.includes('claude'),
        complexity: 'Complex' as 'Basic' | 'Medium' | 'Complex',
        tokensPerMonth: 100000,
        pricePerToken: 0.005,
        price: 1299, // Updated price to match landing page (INR)
        features: [
          'Long Context',
          'Code Understanding',
          'Documentation',
          'Explanation',
          'Reasoning'
        ],
        purchased: userPurchasedModels.includes('claude'),
        expirationDate: userPurchasedRecords.find(p => p.id === 'claude') ? 
          new Date(new Date(userPurchasedRecords.find(p => p.id === 'claude')!.purchaseDate).setMonth(new Date(userPurchasedRecords.find(p => p.id === 'claude')!.purchaseDate).getMonth() + userPurchasedRecords.find(p => p.id === 'claude')!.months)).toISOString() : 
          undefined
      },
      {
        id: 'deepseek' as AIModelId,
        name: 'DeepSeek',
        description: 'DeepSeek\'s advanced AI model',
        available: !!process.env.DEEPSEEK_API_KEY && userPurchasedModels.includes('deepseek'),
        complexity: 'Medium' as 'Basic' | 'Medium' | 'Complex',
        tokensPerMonth: 50000,
        pricePerToken: 0.003,
        price: 1125, // Updated price to match landing page (INR)
        features: [
          'Code Generation',
          'Debugging',
          'Optimization',
          'Documentation',
          'Architecture Design'
        ],
        purchased: userPurchasedModels.includes('deepseek'),
        expirationDate: userPurchasedRecords.find(p => p.id === 'deepseek') ? 
          new Date(new Date(userPurchasedRecords.find(p => p.id === 'deepseek')!.purchaseDate).setMonth(new Date(userPurchasedRecords.find(p => p.id === 'deepseek')!.purchaseDate).getMonth() + userPurchasedRecords.find(p => p.id === 'deepseek')!.months)).toISOString() : 
          undefined
      }
    ];
    
    console.log('Available models returned by backend:', models);
    return models; // Return full model objects, not just IDs
  } catch (error) {
    console.error('Error in getAvailableModels:', error);
    return [];
  }
}


// Add this near other utility functions
async function updateTokenUsage(userId: string, modelId: string, tokensUsed: number): Promise<void> {
  try {
    const db = await connectToMongoDB();
    if (typeof userId === 'string' && /^[0-9a-fA-F]{24}$/.test(userId)) {
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $inc: { [`usage.${modelId}`]: tokensUsed } },
        { upsert: true }
      );
    }
  } catch (error) {
    console.error('Failed to update token usage:', error);
    throw error;
  }
}