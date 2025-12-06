import { Router } from 'express';
import { sandboxExecutor } from '../services/sandbox-executor.js';
import { chatWithGemini } from '../services/gemini.js';

const router = Router();

// Execute code in Docker sandbox
router.post('/execute', async (req, res) => {
  try {
    const { code, language, filename, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const result = await sandboxExecutor.executeCode(code, language, filename, input);

    res.json({
      output: result.output,
      error: result.error,
      exitCode: result.exitCode,
      executionTime: result.executionTime
    });

  } catch (error: any) {
    console.error('Execution error:', error);
    res.status(500).json({ error: error.message || 'Execution failed' });
  }
});

// AI Chat endpoint
router.post('/ai/chat', async (req, res) => {
  try {
    const { messages, model, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    
    // Build chat history (exclude the last message as it will be sent separately)
    const chatHistory = messages.slice(0, -1);

    // Call Gemini with context
    const result = await chatWithGemini(
      lastMessage.content,
      chatHistory,
      context ? { currentFile: context } : undefined
    );

    res.json({ response: result.content, fileChanges: result.fileChanges });

  } catch (error: any) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: error.message || 'AI request failed' });
  }
});

// File system operations
router.post('/files/create', async (req, res) => {
  try {
    const { projectId, path, type, content } = req.body;
    
    // TODO: Implement file creation in database
    // For now, return success
    res.json({ success: true, id: Date.now().toString() });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/files/update', async (req, res) => {
  try {
    const { fileId, content } = req.body;
    
    // TODO: Implement file update in database
    res.json({ success: true });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // TODO: Implement file deletion in database
    res.json({ success: true });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Project operations - these are handled by main routes.ts
// Just add a helper endpoint for IDE-specific project info
router.get('/projects/:id/info', async (req, res) => {
  try {
    const { id } = req.params;
    // This will be handled by the main project routes
    // Just return success for now
    res.json({ success: true, projectId: id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check Docker availability
router.get('/sandbox/status', async (req, res) => {
  try {
    const available = await sandboxExecutor.checkDockerAvailability();
    res.json({ available, message: available ? 'Docker is ready' : 'Docker is not available' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// LLM Model management
router.get('/models', async (req, res) => {
  try {
    // TODO: Get user's purchased models from database
    const userModels = ['gemini-pro']; // Default free model
    
    res.json({ 
      purchased: userModels,
      available: [
        { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', price: 0 },
        { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', price: 20 },
        { id: 'claude-3', name: 'Claude 3', provider: 'Anthropic', price: 20 },
        { id: 'grok-beta', name: 'Grok Beta', provider: 'xAI', price: 15 },
      ]
    });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/models/purchase', async (req, res) => {
  try {
    const { modelId } = req.body;
    
    // TODO: Process payment and add model to user's account
    res.json({ success: true, message: 'Model purchased successfully' });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
