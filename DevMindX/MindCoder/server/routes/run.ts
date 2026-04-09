import { Router } from 'express';

const router = Router();

const JUDGE0_URL = process.env.JUDGE0_URL || 'http://localhost:2358';
const MAX_INPUT_SIZE = 1024 * 100; // 100KB
const COOLDOWN_MS = 2000; // 2 seconds between requests

const userCooldowns = new Map<string, number>();

router.post('/', async (req, res) => {
  const { source_code, language_id, stdin } = req.body;
  const userId = req.headers['x-user-id'] || 'anonymous';

  // Basic rate limiting
  const now = Date.now();
  const lastRequest = userCooldowns.get(String(userId)) || 0;
  if (now - lastRequest < COOLDOWN_MS) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }
  userCooldowns.set(String(userId), now);

  if (!source_code || !language_id) {
    return res.status(400).json({ error: 'source_code and language_id are required' });
  }

  // Input size limit
  if (source_code.length > MAX_INPUT_SIZE || (stdin && stdin.length > MAX_INPUT_SIZE)) {
    return res.status(400).json({ error: 'Source code or stdin exceeds size limit (100KB)' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_code,
        language_id: parseInt(language_id, 10),
        stdin: stdin || '',
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: 'Judge0 error', details: errorData });
    }

    const result: any = await response.json();
    
    // Format response based on Judge0 response structure
    // result.status.id: 3 (Accepted), 4 (Wrong Answer), etc.
    // result.stdout, result.stderr, result.compile_output, result.time, result.memory
    
    res.json({
      stdout: result.stdout,
      stderr: result.stderr,
      compile_output: result.compile_output,
      time: result.time,
      memory: result.memory,
      status: result.status,
      message: result.message
    });

  } catch (error: any) {
    console.error('Run error:', error);
    res.status(500).json({ error: 'Failed to connect to Judge0. Make sure it is running.' });
  }
});

// Endpoint to check status and get languages
router.get('/status', async (req, res) => {
  try {
    const response = await fetch(`${JUDGE0_URL}/languages`);
    if (!response.ok) throw new Error('Failed to fetch languages');
    const languages = await response.json();
    res.json({ status: 'running', languages });
  } catch (error: any) {
    res.status(500).json({ status: 'down', error: error.message });
  }
});

export default router;
