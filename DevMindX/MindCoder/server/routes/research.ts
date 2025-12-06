import type { Express, Request, Response } from 'express';
import { analyzeProjectIdea } from '../services/research.js';

// Middleware to authenticate token
function authenticateToken(req: any, res: Response, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { verifyToken } = require('../services/auth.js');
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

export function registerResearchRoutes(app: Express) {
  // Research Engine - Analyze project idea
  app.post('/api/research/analyze', authenticateToken, async (req: any, res: Response) => {
    try {
      const { idea } = req.body;

      if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
        return res.status(400).json({ 
          message: 'Project idea is required' 
        });
      }

      if (idea.length > 2000) {
        return res.status(400).json({ 
          message: 'Project idea is too long (max 2000 characters)' 
        });
      }

      // Get user's preferred model or default to 'together'
      const model = req.body.model || 'together';

      console.log(`Analyzing project idea for user ${req.user.id}...`);
      
      const result = await analyzeProjectIdea(idea, model);

      res.json(result);
    } catch (error) {
      console.error('Research analysis error:', error);
      res.status(500).json({ 
        message: 'Failed to analyze project idea',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get research history (optional feature for future)
  app.get('/api/research/history', authenticateToken, async (req: any, res: Response) => {
    try {
      // TODO: Implement research history storage and retrieval
      res.json({ 
        message: 'Research history feature coming soon',
        history: []
      });
    } catch (error) {
      console.error('Get research history error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
}
