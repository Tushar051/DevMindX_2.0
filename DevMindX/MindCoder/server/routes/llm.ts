import { Router } from 'express';
import { getStorage } from '../storage.js';
import { AIModelId, PurchasedModel } from '../../shared/types.js';

const router = Router();

// Available LLM models
const availableModels = [
  {
    id: 'together' as AIModelId,
    name: 'Together AI',
    description: 'Free tier model by Gemini',
    price: 0,
    tokensPerMonth: 10000,
    features: ['Code Generation', 'Debugging', 'Refactoring', 'Documentation', 'Code Review'],
    free: true
  },
  {
    id: 'gemini' as AIModelId,
    name: 'Gemini',
    description: "Google's multimodal AI model",
    price: 749,
    tokensPerMonth: 50000,
    features: ['Code Generation', 'Image Analysis', 'Reasoning', 'Documentation', 'Testing']
  },
  {
    id: 'chatgpt' as AIModelId,
    name: 'ChatGPT',
    description: "OpenAI's powerful language model",
    price: 1499,
    tokensPerMonth: 100000,
    features: ['Natural Language', 'Code Completion', 'Problem Solving', 'Explanation', 'Debugging']
  },
  {
    id: 'claude' as AIModelId,
    name: 'Claude',
    description: "Anthropic's helpful AI assistant",
    price: 1299,
    tokensPerMonth: 100000,
    features: ['Long Context', 'Code Understanding', 'Documentation', 'Explanation', 'Reasoning']
  },
  {
    id: 'deepseek' as AIModelId,
    name: 'DeepSeek',
    description: "DeepSeek's advanced AI model",
    price: 1125,
    tokensPerMonth: 50000,
    features: ['Code Generation', 'Debugging', 'Optimization', 'Documentation', 'Architecture Design']
  }
];

// Get user's purchased models and usage
router.get('/models', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const storage = await getStorage();
    const user = await storage.getUser(userId);
    
    const purchasedModels = user?.purchasedModels || [];
    const usage = user?.usage || {
      totalTokens: 0,
      totalCost: 0,
      lastReset: new Date(),
      together: 0,
      gemini: 0,
      chatgpt: 0,
      claude: 0,
      deepseek: 0
    };

    // Add purchased status and expiration to models
    const modelsWithStatus = availableModels.map(model => {
      const purchased = purchasedModels.find((pm: PurchasedModel) => pm.id === model.id);
      
      if (purchased) {
        const purchaseDate = new Date(purchased.purchaseDate);
        const expirationDate = new Date(purchaseDate);
        expirationDate.setMonth(expirationDate.getMonth() + purchased.months);
        
        const usageForModel = (usage as any)[model.id] || 0;
        
        return {
          ...model,
          purchased: true,
          purchaseDate: purchased.purchaseDate,
          expirationDate: expirationDate.toISOString(),
          tokensUsed: usageForModel,
          tokensRemaining: model.tokensPerMonth - usageForModel,
          expired: expirationDate < new Date()
        };
      }
      
      const usageForModel = (usage as any)[model.id] || 0;
      
      return {
        ...model,
        purchased: model.free || false,
        tokensUsed: model.free ? usageForModel : 0,
        tokensRemaining: model.free ? model.tokensPerMonth - usageForModel : 0
      };
    });

    res.json({
      models: modelsWithStatus,
      usage: {
        totalTokens: usage.totalTokens,
        totalCost: usage.totalCost,
        lastReset: usage.lastReset,
        byModel: {
          together: usage.together || 0,
          gemini: usage.gemini || 0,
          chatgpt: usage.chatgpt || 0,
          claude: usage.claude || 0,
          deepseek: usage.deepseek || 0
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: error.message });
  }
});

// Purchase a model
router.post('/models/purchase', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { modelId, months, paymentMethod, paymentDetails } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!modelId || !months || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const model = availableModels.find(m => m.id === modelId);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    if (model.free) {
      return res.status(400).json({ error: 'Cannot purchase free model' });
    }

    const storage = await getStorage();
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const purchasedModel: PurchasedModel = {
      id: modelId as AIModelId,
      purchaseDate: new Date().toISOString(),
      paymentMethod,
      paymentDetails,
      months
    };

    // Add to user's purchased models
    const existingModels = user.purchasedModels || [];
    const updatedModels = [...existingModels, purchasedModel];
    
    await storage.updateUser(userId, {
      purchasedModels: updatedModels,
      usage: user.usage || {
        totalTokens: 0,
        totalCost: 0,
        lastReset: new Date(),
        [modelId]: 0
      }
    } as any);

    res.json({
      success: true,
      message: `Successfully purchased ${model.name} for ${months} month(s)`,
      model: {
        ...model,
        purchased: true,
        purchaseDate: purchasedModel.purchaseDate,
        expirationDate: new Date(new Date(purchasedModel.purchaseDate).setMonth(new Date(purchasedModel.purchaseDate).getMonth() + months)).toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error purchasing model:', error);
    res.status(500).json({ error: error.message });
  }
});

// Track token usage
router.post('/usage/track', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { modelId, tokens, cost } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!modelId || typeof tokens !== 'number') {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const storage = await getStorage();
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update usage
    const currentUsage = user.usage || {
      totalTokens: 0,
      totalCost: 0,
      lastReset: new Date()
    };
    
    const updatedUsage = {
      ...currentUsage,
      totalTokens: (currentUsage.totalTokens || 0) + tokens,
      totalCost: (currentUsage.totalCost || 0) + (cost || 0),
      [modelId]: ((currentUsage as any)[modelId] || 0) + tokens,
      lastReset: new Date()
    };
    
    await storage.updateUser(userId, { usage: updatedUsage } as any);

    res.json({ success: true });

  } catch (error: any) {
    console.error('Error tracking usage:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if user can use a model
router.get('/models/:modelId/check', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { modelId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const model = availableModels.find(m => m.id === modelId);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Together AI is always available (free)
    if (model.free) {
      return res.json({ canUse: true, reason: 'free' });
    }

    const storage = await getStorage();
    const user = await storage.getUser(userId);
    
    if (!user?.purchasedModels) {
      return res.json({ canUse: false, reason: 'not_purchased' });
    }

    const purchased = user.purchasedModels.find((pm: PurchasedModel) => pm.id === modelId);
    if (!purchased) {
      return res.json({ canUse: false, reason: 'not_purchased' });
    }

    // Check if subscription is expired
    const purchaseDate = new Date(purchased.purchaseDate);
    const expirationDate = new Date(purchaseDate);
    expirationDate.setMonth(expirationDate.getMonth() + purchased.months);

    if (expirationDate < new Date()) {
      return res.json({ canUse: false, reason: 'expired', expirationDate: expirationDate.toISOString() });
    }

    // Check token quota
    const usage = user.usage || {};
    const tokensUsed = (usage as any)[modelId] || 0;
    
    if (tokensUsed >= model.tokensPerMonth) {
      return res.json({ canUse: false, reason: 'quota_exceeded', tokensUsed, tokensLimit: model.tokensPerMonth });
    }

    res.json({
      canUse: true,
      tokensUsed,
      tokensRemaining: model.tokensPerMonth - tokensUsed,
      expirationDate: expirationDate.toISOString()
    });

  } catch (error: any) {
    console.error('Error checking model access:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reset monthly usage (admin/cron job)
router.post('/usage/reset', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'] as string;
    
    // Simple admin key check (in production, use proper authentication)
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Note: This would need to iterate through all users
    // For now, return success - implement batch user update if needed
    res.json({ success: true, message: 'Monthly usage reset endpoint - implement batch update if needed' });

  } catch (error: any) {
    console.error('Error resetting usage:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
