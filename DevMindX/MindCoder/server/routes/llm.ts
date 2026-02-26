import { Router } from 'express';
import { connectToMongoDB, createMongoIdFilter } from '../db.js';
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

    const db = await connectToMongoDB();
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne(createMongoIdFilter(userId) as any);
    
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
        
        return {
          ...model,
          purchased: true,
          purchaseDate: purchased.purchaseDate,
          expirationDate: expirationDate.toISOString(),
          tokensUsed: usage[model.id] || 0,
          tokensRemaining: model.tokensPerMonth - (usage[model.id] || 0),
          expired: expirationDate < new Date()
        };
      }
      
      return {
        ...model,
        purchased: model.free || false,
        tokensUsed: model.free ? (usage[model.id] || 0) : 0,
        tokensRemaining: model.free ? model.tokensPerMonth - (usage[model.id] || 0) : 0
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

    const db = await connectToMongoDB();
    const usersCollection = db.collection('users');

    const purchasedModel: PurchasedModel = {
      id: modelId as AIModelId,
      purchaseDate: new Date().toISOString(),
      paymentMethod,
      paymentDetails,
      months
    };

    // Add to user's purchased models
    await usersCollection.updateOne(
      createMongoIdFilter(userId) as any,
      {
        $push: { purchasedModels: purchasedModel } as any,
        $setOnInsert: {
          usage: {
            totalTokens: 0,
            totalCost: 0,
            lastReset: new Date(),
            [modelId]: 0
          }
        }
      },
      { upsert: true }
    );

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

    const db = await connectToMongoDB();
    const usersCollection = db.collection('users');

    // Update usage
    await usersCollection.updateOne(
      createMongoIdFilter(userId) as any,
      {
        $inc: {
          'usage.totalTokens': tokens,
          'usage.totalCost': cost || 0,
          [`usage.${modelId}`]: tokens
        },
        $set: {
          'usage.lastReset': new Date()
        }
      },
      { upsert: true }
    );

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

    const db = await connectToMongoDB();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne(createMongoIdFilter(userId) as any);

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
    const tokensUsed = usage[modelId] || 0;
    
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

    const db = await connectToMongoDB();
    const usersCollection = db.collection('users');

    // Reset all users' monthly token usage
    await usersCollection.updateMany(
      {},
      {
        $set: {
          'usage.together': 0,
          'usage.gemini': 0,
          'usage.chatgpt': 0,
          'usage.claude': 0,
          'usage.deepseek': 0,
          'usage.lastReset': new Date()
        }
      }
    );

    res.json({ success: true, message: 'Monthly usage reset for all users' });

  } catch (error: any) {
    console.error('Error resetting usage:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
