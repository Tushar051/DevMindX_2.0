import { GoogleGenerativeAI } from '@google/generative-ai';
import { FileChange } from '@shared/types.js';
import JSON5 from 'json5';

// Model names for Gemini API (verified available models)
// gemini-2.5-flash for fast responses, gemini-2.5-pro for complex tasks
const GEMINI_MODEL = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
const GEMINI_PRO_MODEL = 'gemini-2.5-pro';

if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set. Gemini AI features will use simulated responses.');
}

const isFakeKey = (key: string | undefined) => {
  return key?.startsWith('fake_');
};

const simulateResponse = (prompt: string) => {
  return `[FAKE GEMINI] This is a simulated response for your prompt: "${prompt}"`;
};

const SYSTEM_PROMPT = {
  role: 'system',
  content:
    'You are a concise programming assistant. Respond briefly. Avoid examples or code unless explicitly asked. Do not repeat the question. If you are given diagnostic information (errors, warnings), prioritize addressing them by providing an updated file content. When suggesting code changes, provide a JSON object with both \'content\' (explanation of what you did) and \'fileChanges\' array, where each object in the array has \'filePath\', \'action\' (create, update, or delete), and \'newContent\' (if action is create or update). Always include a brief \'content\' field explaining what changes were made. If no specific file changes are needed, return a simple text response. When providing file changes, ensure the content is complete and syntactically correct, including all necessary imports and surrounding code context.',
};

// Simple retry with exponential backoff for transient errors (e.g., 429/500/503)
async function retryWithBackoff<T>(fn: () => Promise<T>, attempts = 3, baseDelayMs = 300): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.statusCode;
      const retriable = status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
      if (!retriable || i === attempts - 1) break;
      const delay = baseDelayMs * Math.pow(2, i) + Math.floor(Math.random() * 100);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Request failed');
}

// --- 1. Generate Full Project Code ---
export async function generateProjectWithGemini(prompt: string, framework?: string, name?: string): Promise<any> {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
    
    if (isFakeKey(process.env.GEMINI_API_KEY)) {
      const projectFolderName = name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'generated-project';
      return {
        name: name || 'Generated Project',
        framework: framework || 'web',
        description: prompt,
        files: {
          [`${projectFolderName}/README.md`]: simulateResponse(prompt),
          [`${projectFolderName}/index.html`]: simulateResponse(`Create index.html for ${prompt}`),
          [`${projectFolderName}/style.css`]: simulateResponse(`Create style.css for ${prompt}`),
          [`${projectFolderName}/script.js`]: simulateResponse(`Create script.js for ${prompt}`)
        }
      };
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use Pro model for project generation to handle longer outputs
    const model = genAI.getGenerativeModel({ model: GEMINI_PRO_MODEL });

    const system = SYSTEM_PROMPT.content;
    const projectName = name || 'Generated Project';
    const frameworkToUse = framework || 'web';
    const frameworkLower = frameworkToUse.toLowerCase();

    const frameworkGuidance = (() => {
      if (frameworkLower.includes('react') || frameworkLower.includes('next')) {
        return `Framework specifics: ${frameworkLower.includes('next') ? 'Next.js' : 'React'} with modern setup.
Required files:
- package.json with proper dependencies and scripts
- ${frameworkLower.includes('next') ? 'pages/index.js or app/page.js' : 'src/main.jsx and index.html'}
- Component files in appropriate directories
- CSS/styling files
- README.md with setup instructions
Create a complete, functional project structure with proper imports and exports.`;
      }
      if (frameworkLower.includes('vue')) {
        return `Framework specifics: Vue.js with Vite setup.
Required files:
- package.json with Vue dependencies
- index.html with Vue app mount point
- src/main.js and src/App.vue
- Component files in src/components/
- CSS files and README.md`;
      }
      if (frameworkLower.includes('angular')) {
        return `Framework specifics: Angular with CLI structure.
Required files:
- package.json with Angular dependencies
- src/main.ts, src/app/ directory structure
- angular.json configuration
- Component and service files
- Proper TypeScript setup`;
      }
      if (frameworkLower.includes('node') || frameworkLower.includes('express')) {
        return `Framework specifics: Node.js/Express server application.
Required files:
- package.json with proper scripts and dependencies
- server.js or index.js as entry point
- Route files, middleware, models if applicable
- Environment configuration
- README.md with API documentation`;
      }
      if (frameworkLower.includes('mern')) {
        return `Framework specifics: MERN Stack (MongoDB, Express, React, Node.js).
Create both frontend and backend:
- Backend: Express server with MongoDB connection
- Frontend: React application
- Proper folder structure (client/, server/)
- Package.json files for both parts
- API routes and React components`;
      }
      if (frameworkLower.includes('mean')) {
        return `Framework specifics: MEAN Stack (MongoDB, Express, Angular, Node.js).
Create both frontend and backend:
- Backend: Express server with MongoDB
- Frontend: Angular application
- Proper folder structure
- API integration between frontend and backend`;
      }
      if (frameworkLower.includes('django') || frameworkLower.includes('flask')) {
        return `Framework specifics: ${frameworkLower.includes('django') ? 'Django' : 'Flask'} Python web application.
Required files:
- requirements.txt with dependencies
- Main application files
- Templates and static files
- Models, views, and URL configurations
- README.md with setup instructions`;
      }
      return `Framework specifics: Modern web application.
Create a complete project structure with:
- HTML, CSS, JavaScript files
- Package.json if using npm packages
- Proper file organization
- README.md with instructions
Make it functional and well-structured.`;
    })();

    const enhancedPrompt = `Generate a functional ${frameworkToUse} project for: ${prompt}

Return ONLY valid JSON (no markdown, no code fences):
{
  "name": "${projectName}",
  "framework": "${frameworkToUse}",
  "description": "brief description",
  "files": {
    "filename": "file content"
  }
}

Requirements:
- 4-6 essential files only
- Compact, working code
- No excessive comments
- Complete valid JSON

${frameworkGuidance}

Return the complete JSON now:`;

    const result = await retryWithBackoff(() => model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: enhancedPrompt }] }
      ],
      generationConfig: {
        maxOutputTokens: 8192, // Reduced for more reliable responses
        temperature: 0.7,
      }
    }));

    const text = result.response.text();
    console.log('Gemini response length:', text.length);
    console.log('First 500 chars:', text.substring(0, 500));
    console.log('Last 500 chars:', text.substring(Math.max(0, text.length - 500)));
    
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
    if (!jsonMatch) {
      console.log('No JSON found in response, using fallback');
      return {
        name: projectName,
        framework: frameworkToUse,
        description: prompt,
        files: {
          'README.md': text,
          ...(frameworkLower.includes('node') ? {
            'package.json': `{
  \"name\": \"${projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'project'}\",
  \"version\": \"1.0.0\",
  \"private\": true,
  \"scripts\": { \"start\": \"node index.js\" }
}`,
            'index.js': `const http = require('http');\nconst server = http.createServer((req, res) => { res.end('Hello from ${projectName}!'); });\nserver.listen(3000, () => console.log('Server listening on http://localhost:3000'));`
          } : frameworkLower.includes('react') ? {
            'index.html': `<!doctype html>\n<html>\n  <head>\n    <meta charset=\"utf-8\"/>\n    <div id=\"root\"></div>\n    <title>${projectName}</title>\n  </head>\n  <body>\n    <script type=\"module\" src=\"/src/main.jsx\"></script>\n  </body>\n</html>`,
            'src/main.jsx': `import React from 'react';\nimport { createRoot } from 'react-dom/client';\nfunction App(){ return <h1>${projectName}</h1>; }\ncreateRoot(document.getElementById('root')).render(<App />);`,
            'package.json': `{
  \"name\": \"${projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'project'}\",
  \"version\": \"1.0.0\",
  \"private\": true,
  \"scripts\": { \"dev\": \"vite\", \"build\": \"vite build\", \"preview\": \"vite preview\" },
  \"dependencies\": { \"react\": \"^18.0.0\", \"react-dom\": \"^18.0.0\" }
}`
          } : {
            'index.html': `<!doctype html>\n<html>\n  <head>\n    <meta charset=\"utf-8\"/>\n    <title>${projectName}</title>\n  </head>\n  <body>\n    <h1>${projectName}</h1>\n    <script src=\"script.js\"></script>\n  </body>\n</html>`,
            'script.js': `console.log('Project generated but model did not return JSON.');`
          })
        }
      };
    }

    const jsonString = jsonMatch[1] || jsonMatch[2];
    console.log('Extracted JSON string length:', jsonString.length);
    console.log('JSON string preview:', jsonString.substring(0, 200));
    
    // Check if JSON looks complete (basic validation)
    const openBraces = (jsonString.match(/\{/g) || []).length;
    const closeBraces = (jsonString.match(/\}/g) || []).length;
    const openBrackets = (jsonString.match(/\[/g) || []).length;
    const closeBrackets = (jsonString.match(/\]/g) || []).length;
    
    console.log(`Brace balance: { ${openBraces} vs } ${closeBraces}, [ ${openBrackets} vs ] ${closeBrackets}`);
    
    if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
      console.warn('JSON appears truncated or malformed - brace/bracket mismatch');
      // Try to recover by using fallback
      return {
        name: projectName,
        framework: frameworkToUse,
        description: prompt,
        files: {
          'README.md': `# ${projectName}\n\n${prompt}\n\nNote: AI response was incomplete. Please try again.`,
          'index.html': `<!doctype html>\n<html>\n  <head>\n    <meta charset="utf-8"/>\n    <title>${projectName}</title>\n  </head>\n  <body>\n    <h1>${projectName}</h1>\n    <p>Project generation incomplete. Please try again.</p>\n  </body>\n</html>`
        }
      };
    }
    
    let parsed;
    try {
      parsed = JSON5.parse(jsonString);
    } catch (parseError: any) {
      console.error('JSON5 parse error:', parseError.message);
      console.error('Failed JSON string (first 1000 chars):', jsonString.substring(0, 1000));
      console.error('Failed JSON string (last 500 chars):', jsonString.substring(Math.max(0, jsonString.length - 500)));
      
      // Return fallback instead of throwing
      console.warn('Returning fallback project due to JSON parse error');
      return {
        name: projectName,
        framework: frameworkToUse,
        description: prompt,
        files: {
          'README.md': `# ${projectName}\n\n${prompt}\n\n## Note\nThe AI response was incomplete. This is a basic template. Please try again or modify as needed.`,
          'index.html': `<!doctype html>\n<html>\n  <head>\n    <meta charset="utf-8"/>\n    <title>${projectName}</title>\n    <link rel="stylesheet" href="style.css">\n  </head>\n  <body>\n    <h1>${projectName}</h1>\n    <p>Welcome to your project!</p>\n    <script src="script.js"></script>\n  </body>\n</html>`,
          'style.css': `body {\n  font-family: Arial, sans-serif;\n  max-width: 800px;\n  margin: 50px auto;\n  padding: 20px;\n}\n\nh1 {\n  color: #333;\n}`,
          'script.js': `console.log('${projectName} loaded successfully!');\n\n// Add your code here`
        }
      };
    }
    
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Gemini returned invalid project JSON');
    }
    const normalized = {
      name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name : projectName,
      framework: typeof parsed.framework === 'string' && parsed.framework.trim() ? parsed.framework : frameworkToUse,
      description: typeof parsed.description === 'string' ? parsed.description : prompt,
      files: typeof parsed.files === 'object' && parsed.files !== null ? parsed.files : {}
    } as { name: string; framework: string; description: string; files: Record<string, string> };

    // Ensure README.md exists with proper content
    if (!normalized.files['README.md']) {
      normalized.files['README.md'] = `# ${normalized.name}

${normalized.description}

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
1. Clone or download this project
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

### Running the Project
\`\`\`bash
${frameworkLower.includes('react') || frameworkLower.includes('next') ? 'npm run dev' : 
  frameworkLower.includes('node') || frameworkLower.includes('express') ? 'npm start' : 
  'Open index.html in your browser'}
\`\`\`

## Features
- Modern, responsive design
- Clean, maintainable code structure
- Best practices implementation

## Project Structure
Generated with DevMindX AI - Your intelligent development companion.
`;
    }
    const hasHtml = Object.keys(normalized.files).some(p => p.toLowerCase().endsWith('.html'));
    const hasJs = Object.keys(normalized.files).some(p => p.toLowerCase().endsWith('.js'));
    const hasPkg = !!normalized.files['package.json'];
    const hasIndexJs = !!normalized.files['index.js'];
    const hasReactMain = !!normalized.files['src/main.jsx'] || !!normalized.files['src/main.tsx'];

    if (frameworkLower.includes('node')) {
      if (!hasPkg) {
        normalized.files['package.json'] = `{
  \"name\": \"${normalized.name.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'project'}\",
  \"version\": \"1.0.0\",
  \"private\": true,
  \"scripts\": { \"start\": \"node index.js\" }
}`;
      }
      if (!hasIndexJs) {
        normalized.files['index.js'] = `const http = require('http');\nconst server = http.createServer((req, res) => { res.end('Hello from ${normalized.name}!'); });\nserver.listen(3000, () => console.log('Server listening on http://localhost:3000'));`;
      }
    } else if (frameworkLower.includes('react')) {
      if (!hasHtml) {
        normalized.files['index.html'] = `<!doctype html>\n<html>\n  <head>\n    <meta charset=\"utf-8\"/>\n    <div id=\"root\"></div>\n    <title>${normalized.name}</title>\n  </head>\n  <body>\n    <script type=\"module\" src=\"/src/main.jsx\"></script>\n  </body>\n</html>`;
      }
      if (!hasReactMain) {
        normalized.files['src/main.jsx'] = `import React from 'react';\nimport { createRoot } from 'react-dom/client';\nfunction App(){ return <h1>${normalized.name}</h1>; }\ncreateRoot(document.getElementById('root')).render(<App />);`;
      }
      if (!hasPkg) {
        normalized.files['package.json'] = `{
  \"name\": \"${normalized.name.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'project'}\",
  \"version\": \"1.0.0\",
  \"private\": true,
  \"scripts\": { \"dev\": \"vite\", \"build\": \"vite build\", \"preview\": \"vite preview\" },
  \"dependencies\": { \"react\": \"^18.0.0\", \"react-dom\": \"^18.0.0\" }
}`;
      }
    } else {
      if (!hasHtml) {
        normalized.files['index.html'] = `<!doctype html>\n<html>\n  <head>\n    <meta charset=\"utf-8\"/>\n    <title>${normalized.name}</title>\n  </head>\n  <body>\n    <h1>${normalized.name}</h1>\n    <script src=\"script.js\"></script>\n  </body>\n</html>`;
      }
      if (!hasJs) {
        normalized.files['script.js'] = `console.log('Hello from ${normalized.name}');`;
      }
    }

    return normalized;

  } catch (error) {
    console.error('Error in generateProjectWithGemini:', error);
    // Graceful fallback
    const projectFolderName = name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'generated-project';
    return {
      name: name || 'Generated Project',
      framework: framework || 'web',
      description: prompt,
      files: {
        [`${projectFolderName}/README.md`]: `Gemini error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    };
  }
}

// --- 2. Generate Code Snippet ---
export async function generateCodeWithGemini(instruction: string, context?: string): Promise<{ content: string; fileChanges?: FileChange[] }> {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
    
    if (isFakeKey(process.env.GEMINI_API_KEY)) {
      return { content: simulateResponse(instruction), fileChanges: [] };
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const parts = [
      { text: instruction },
    ];

    if (context) {
      parts.unshift({ text: `Context:\n${context}\n\n` });
    }

    const result = await retryWithBackoff(() => model.generateContent({
      contents: [
        { role: "user", parts: [{ text: `${SYSTEM_PROMPT.content}\n\nRespond to the user.\n` }] },
        { role: "user", parts }
      ]
    }));
    const content = result.response.text();

    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
    if (jsonMatch) {
      const jsonString = jsonMatch[1] || jsonMatch[2];
      try {
        const parsedContent = JSON5.parse(jsonString);
        if (parsedContent && typeof parsedContent === 'object' && parsedContent.fileChanges) {
          // Provide a default message if content is empty but file changes exist
          const defaultContent = parsedContent.content || 
            (parsedContent.fileChanges.length > 0 ? 
              `I've generated ${parsedContent.fileChanges.length} file${parsedContent.fileChanges.length > 1 ? 's' : ''} as requested.` : 
              '');
          return { content: defaultContent, fileChanges: parsedContent.fileChanges };
        }
      } catch (parseError) {
        console.log('Gemini code generation response contained JSON but failed to parse or was not expected structure. Treating as plain text.', parseError);
      }
    }

    return { content, fileChanges: [] };

  } catch (error) {
    console.error('Error in generateCodeWithGemini:', error);
    // Graceful fallback
    return { content: `Gemini error: ${error instanceof Error ? error.message : 'Unknown error'}`, fileChanges: [] };
  }
}

// --- 3. Chat with AI ---
export async function chatWithGemini(message: string, chatHistory?: any[], projectContext?: any, image?: string): Promise<{ content: string; fileChanges?: FileChange[] }> {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
    
    if (isFakeKey(process.env.GEMINI_API_KEY)) {
      return { content: simulateResponse(message), fileChanges: [] };
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // Prepare message parts (text + image if provided)
    const messageParts: any[] = [{ text: message }];
    
    if (image) {
      // Extract image data and mime type from base64 data URL
      const imageMatch = image.match(/^data:([^;]+);base64,(.+)$/);
      if (imageMatch) {
        const mimeType = imageMatch[1];
        const imageData = imageMatch[2];
        
        // Add image analysis prompt
        const imagePrompt = `\n\nI've uploaded an image. Please analyze it and help me with the following:
- If it's a UI/website design, convert it to HTML/CSS/JavaScript code
- If it's a wireframe or mockup, create a functional website based on it
- If it's a diagram or flowchart, explain it and create relevant code
- Be specific about colors, layout, components, and functionality you can see

Please provide complete, working code with proper file structure.`;
        
        messageParts[0].text = message + imagePrompt;
        messageParts.push({
          inlineData: {
            mimeType: mimeType,
            data: imageData
          }
        });
      }
    }

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT.content }] },
        ...(chatHistory || []).map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }))
      ],
    });

    const result = await retryWithBackoff(() => chat.sendMessage(messageParts));
    const content = result.response.text();

    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
    if (jsonMatch) {
      const jsonString = jsonMatch[1] || jsonMatch[2];
      try {
        const parsedContent = JSON5.parse(jsonString);
        if (parsedContent && typeof parsedContent === 'object' && parsedContent.fileChanges) {
          // Provide a default message if content is empty but file changes exist
          const defaultContent = parsedContent.content || 
            (parsedContent.fileChanges.length > 0 ? 
              `I've made ${parsedContent.fileChanges.length} file change${parsedContent.fileChanges.length > 1 ? 's' : ''} as requested.` : 
              '');
          return { content: defaultContent, fileChanges: parsedContent.fileChanges };
        }
      } catch (parseError) {
        console.log('Gemini chat response contained JSON but failed to parse or was not expected structure. Treating as plain text.', parseError);
      }
    }

    return { content, fileChanges: [] };

  } catch (error) {
    console.error('Error in chatWithGemini:', error);
    // Graceful fallback
    return { content: `Gemini error: ${error instanceof Error ? error.message : 'Unknown error'}`, fileChanges: [] };
  }
}

// --- 4. Analyze Code ---
export async function analyzeCodeWithGemini(code: string, task: string): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
    
    if (isFakeKey(process.env.GEMINI_API_KEY)) {
      return simulateResponse(`Analyze code: ${task}`);
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const result = await retryWithBackoff(() => model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: `${SYSTEM_PROMPT.content}\n\nAnalyze the code for the task and return a concise answer.\n\nTask: ${task}\n\nCode:\n\n${code}` }] }
      ]
    }));
    return result.response.text();

  } catch (error) {
    console.error('Error in analyzeCodeWithGemini:', error);
    // Graceful fallback
    return `Gemini error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// Diagnostics: list available Gemini models using server-side API key
export async function listGeminiModels(): Promise<any> {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
    const resp = await fetch(url);
    const data = await resp.json();
    return { ok: resp.ok, status: resp.status, data };
  } catch (error) {
    return { ok: false, status: 500, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}