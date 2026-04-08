const prompt = `You are an expert system architect mapping out software diagrams via Mermaid syntax.

Task: Create a sequence diagram using 'sequenceDiagram' syntax. Example template:
sequenceDiagram
  User->>System: Action
  System-->>User: Response

User description:
Alice sends a request to Bob. Bob checks his database and replies to Alice with an ok message.

CRITICAL RULES:
1. Respond ONLY with the raw diagram code. Do NOT output markdown, backticks, or any conversational text.
2. The very first line of your response MUST BE the exact diagram type declaration (e.g. "flowchart TB", "classDiagram", "sequenceDiagram"). Do NOT output extra text or title lines before it.
3. Keep the graph syntax simple and highly readable. Use double strings for text with spaces.

Output your raw Mermaid diagram code below:`;

fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'llama3.2',
    prompt: prompt,
    stream: false
  })
}).then(r => r.json()).then(console.log);
