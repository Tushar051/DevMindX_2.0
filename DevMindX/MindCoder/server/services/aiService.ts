// Import LLM service implementations (avoid loading Together AI at startup)
import { generateProjectWithGemini, generateCodeWithGemini, chatWithGemini, analyzeCodeWithGemini } from './gemini.js';
import { generateProjectWithChatGPT, generateCodeWithChatGPT, chatWithChatGPT, analyzeCodeWithChatGPT } from './chatgpt.js';
import { generateProjectWithClaude, generateCodeWithClaude, chatWithClaude, analyzeCodeWithClaude } from './claude.js';
import { generateProjectWithDeepSeek, generateCodeWithDeepSeek, chatWithDeepSeek, analyzeCodeWithDeepSeek } from './deepseek.js';

// Import shared types
import { AIModelId, AIResponse, ProjectGenerationRequest, CodeGenerationRequest, ChatRequest, AIModel, PurchasedModel, FileChange } from '../../shared/types.js';

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
      case 'together': {
        try {
          const { generateProjectWithTogether } = await import('./together.js');
          const result = await generateProjectWithTogether(prompt, framework, name);
          console.log('Generated project result:', result);
          return result;
        } catch (e) {
          console.warn('Together AI not available, falling back to Gemini for project generation.');
          return await generateProjectWithGemini(prompt, framework, name);
        }
      }
      case 'gemini':
        return await generateProjectWithGemini(prompt, framework, name);
      case 'chatgpt':
      case 'claude':
      case 'deepseek':
        // Route these providers to Gemini under the hood
        return await generateProjectWithGemini(prompt, framework, name);
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
    let fileChanges: FileChange[] = []; // Initialize fileChanges array

    switch (model) {
      case 'together': {
        try {
          const { generateCodeWithTogether } = await import('./together.js');
          const togetherResult = await generateCodeWithTogether(instruction, context);
          content = togetherResult.content;
          fileChanges = togetherResult.fileChanges || [];
        } catch (e) {
          console.warn('Together AI not available, falling back to Gemini for code generation.');
          const geminiResult = await generateCodeWithGemini(instruction, context);
          content = geminiResult.content;
          fileChanges = geminiResult.fileChanges || [];
        }
        break;
      }
      case 'gemini':
        const geminiResult = await generateCodeWithGemini(instruction, context);
        content = geminiResult.content;
        fileChanges = geminiResult.fileChanges || [];
        break;
      case 'chatgpt':
      case 'claude':
      case 'deepseek':
        // Route these providers to Gemini under the hood
        const routedGeminiResult = await generateCodeWithGemini(instruction, context);
        content = routedGeminiResult.content;
        fileChanges = routedGeminiResult.fileChanges || [];
        break;
      default:
        throw new Error(`Unsupported AI model: ${model}`);
    }

    return {
      content,
      model,
      timestamp: new Date(),
      fileChanges // Include fileChanges in the response
    };
  } catch (error) {
    console.error('Error in generateCodeWithAI:', error);
    throw error;
  }
}

export async function chatWithAIModel(request: ChatRequest): Promise<AIResponse> {
  try {
    console.log('chatWithAIModel called with request:', request);

    const { message, model, chatHistory, projectContext, image } = request;
    
    // Validate required parameters
    if (!message) {
      throw new Error('Message is required for chat');
    }

    let content: string;
    let fileChanges: FileChange[] = []; // Initialize fileChanges array

    // Construct the full prompt for the AI, including diagnostics if available
    let fullMessage = message;
    if (
      projectContext &&
      Array.isArray(projectContext.diagnostics) &&
      projectContext.diagnostics.length > 0
    ) {
      const diagnosticsString = projectContext.diagnostics
        .map((d: {
          filePath: string;
          lineNumber: number;
          columnNumber: number;
          severity: string;
          message: string;
        }) =>
          `File: ${d.filePath}, Line: ${d.lineNumber}, Column: ${d.columnNumber}, Severity: ${d.severity}, Message: ${d.message}`
        )
        .join('\n');
      fullMessage = `The user has provided the following request: "${message}".\n\nAdditionally, there are current diagnostics (errors/warnings) in the project that might need attention:\n${diagnosticsString}\n\nPlease address these in your response and provide any necessary file changes.`;
    }

    switch (model) {
      case 'together': {
        try {
          const { chatWithTogether } = await import('./together.js');
          const togetherChatResult = await chatWithTogether(fullMessage, chatHistory, projectContext);
          content = togetherChatResult.content;
          fileChanges = togetherChatResult.fileChanges || [];
        } catch (e) {
          console.warn('Together AI not available, falling back to Gemini for chat.');
          const geminiChatResult = await chatWithGemini(fullMessage, chatHistory, projectContext, image);
          content = geminiChatResult.content;
          fileChanges = geminiChatResult.fileChanges || [];
        }
        break;
      }
      case 'gemini':
        const geminiChatResult = await chatWithGemini(fullMessage, chatHistory, projectContext, image);
        content = geminiChatResult.content;
        fileChanges = geminiChatResult.fileChanges || [];
        break;
      case 'chatgpt':
      case 'claude':
      case 'deepseek':
        // Route these providers to Gemini under the hood
        const routedGeminiChat = await chatWithGemini(fullMessage, chatHistory, projectContext);
        content = routedGeminiChat.content;
        fileChanges = routedGeminiChat.fileChanges || [];
        break;
      default:
        throw new Error(`Unsupported AI model: ${model}`);
    }

    console.log('Chat response generated:', { content: content.substring(0, 100) + '...' });

    return {
      content,
      model,
      timestamp: new Date(),
      fileChanges // Include fileChanges in the response
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
      case 'together': {
        try {
          const { analyzeCodeWithTogether } = await import('./together.js');
          content = await analyzeCodeWithTogether(code, task);
        } catch (e) {
          console.warn('Together AI not available, falling back to Gemini for analysis.');
          content = await analyzeCodeWithGemini(code, task);
        }
        break;
      }
      case 'gemini':
        content = await analyzeCodeWithGemini(code, task);
        break;
      case 'chatgpt':
      case 'claude':
      case 'deepseek':
        // Route these providers to Gemini under the hood
        content = await analyzeCodeWithGemini(code, task);
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
        name: 'Together (Free)',
        description: 'Free tier routed to Gemini backend',
        available: true,
        complexity: 'Basic' as 'Basic' | 'Medium' | 'Complex',
        tokensPerMonth: 10000,
        pricePerToken: 0,
        price: 0,
        features: [
          'Code Generation',
          'Debugging',
          'Refactoring',
          'Documentation',
          'Code Review'
        ],
        purchased: true,
        expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
      },
      {
        id: 'gemini' as AIModelId,
        name: 'Gemini',
        description: 'Google\'s multimodal AI model (primary backend)',
        available: !!process.env.GEMINI_API_KEY,
        complexity: 'Medium' as 'Basic' | 'Medium' | 'Complex',
        tokensPerMonth: 50000,
        pricePerToken: 0.002,
        price: 749,
        features: [
          'Code Generation',
          'Image Analysis',
          'Reasoning',
          'Documentation',
          'Testing'
        ],
        purchased: true,
        expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
      },
      {
        id: 'chatgpt' as AIModelId,
        name: 'ChatGPT',
        description: 'OpenAI\'s powerful language model',
        available: userPurchasedModels.includes('chatgpt'),
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
        available: userPurchasedModels.includes('claude'),
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
        available: userPurchasedModels.includes('deepseek'),
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