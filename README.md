# DevMindX: AI IDE (Cursor Clone)

A full-featured, AI-powered IDE inspired by Cursor, built with the MERN stack (MongoDB, Express, React, Node.js).

## Tech Stack
- **Frontend:** React (TypeScript, Monaco Editor, File Explorer, Terminal, AI Assistant)
- **Backend:** Node.js, Express, WebSocket (for real-time), AI API integration
- **Database:** MongoDB
- **Shared:** Types/interfaces for full-stack type safety

## Features (Planned)
- File explorer (tree view)
- Code editor (Monaco)
- Terminal emulator
- AI assistant/chat sidebar
- User authentication
- Project/workspace management
- Real-time collaboration (WebSocket/Yjs)
- Code execution/sandboxing (optional)

## Getting Started

### 1. Install dependencies
```
cd client
npm install
cd ../server
npm install
```

### 2. Start development servers
```
# In one terminal
cd server
npm run dev

# In another terminal
cd client
npm start
```

### 3. Environment Variables
- Create a `.env` file in `server/` for MongoDB and AI API keys.

---

## Roadmap
- [ ] Scaffold all main features
- [ ] Implement file system API
- [ ] Integrate Monaco Editor
- [ ] Add AI assistant (OpenAI/local LLM)
- [ ] Real-time collaboration
- [ ] User authentication
- [ ] Terminal emulator
- [ ] Project/workspace management
