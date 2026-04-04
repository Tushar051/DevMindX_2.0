# DevMindX - AI-Powered Development Environment

A full-featured, browser-based AI IDE similar to VS Code or Cursor, built with Monaco Editor and integrated with Gemini AI for intelligent code generation and assistance.

## 🚀 Features

### Core IDE Features
- **Monaco Editor Integration**: Full-featured code editor with syntax highlighting for multiple languages
- **File Explorer**: Create, rename, delete, upload, and manage files and folders
- **Multi-tab Support**: Open and edit multiple files simultaneously
- **Resizable Panels**: Customizable layout with drag-and-drop resizing
- **Dark Theme**: Professional dark theme optimized for development

### AI-Powered Features
- **Gemini AI Integration**: Advanced AI assistance powered by Google's Gemini model
- **Context-Aware Chat**: AI understands your current file and project structure
- **Project Generation**: Generate complete projects from natural language descriptions
- **Code Review & Refactoring**: Get AI-powered suggestions for code improvements
- **Multi-language Support**: Support for JavaScript, TypeScript, HTML, CSS, Python, and more

### Terminal Integration
- **Built-in Terminal**: Execute commands directly in the browser
- **Multi-language Execution**: Run Python, Node.js, and other languages
- **Real-time Output**: See command results instantly
- **File System Integration**: Terminal commands work with the file explorer

### File Management
- **Upload Support**: Drag and drop or upload existing files
- **Project Import**: Import entire project folders
- **File Operations**: Create, rename, delete, and organize files
- **Auto-save**: Automatic file saving with visual indicators

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Monaco Editor** for code editing
- **Tailwind CSS** for styling
- **Radix UI** for components
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MongoDB** for data storage
- **Google Gemini AI** for AI features
- **WebSocket** for real-time communication

### AI Features
- **Gemini 2.5 Pro** for advanced code generation
- **Gemini 2.5 Flash** for quick responses
- **Context-aware prompts** with file and project information
- **Multi-model support** for different use cases

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DevMindX/MindCoder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   SESSION_SECRET=your_session_secret
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   GITHUB_CLIENT_ID=your_github_oauth_client_id
   GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## 🎯 Usage

### Creating Projects with AI

1. **Sign up or log in** to access the IDE
2. **Click "Generate Project"** in the IDE header
3. **Describe your project** in natural language (e.g., "Build a to-do app using MERN")
4. **Review the generated code** and start editing

### Using the AI Chat

1. **Open a file** in the editor
2. **Switch to the AI Chat tab** in the side panel
3. **Ask questions** about your code or request improvements
4. **Get context-aware responses** based on your current file

### Terminal Commands

The built-in terminal supports common development commands:

```bash
# List files
ls
dir

# View file contents
cat filename.js
type filename.js

# Run scripts
node script.js
python script.py

# Package management
npm install
yarn add package-name
```

### File Management

- **Upload files**: Use the upload button in the file explorer
- **Create new files**: Right-click in the explorer to create files/folders
- **Rename files**: Double-click on file names to rename
- **Delete files**: Right-click and select delete

## 🔧 Configuration

### AI Model Settings

The IDE supports multiple AI models:

- **Gemini 2.5 Pro**: Best for complex code generation and analysis
- **Gemini 2.5 Flash**: Fast responses for quick questions
- **Custom models**: Add your own AI model integrations

### Editor Settings

Customize the Monaco Editor:

- **Theme**: Dark theme optimized for development
- **Font size**: Adjustable from 12px to 20px
- **Word wrap**: Automatic line wrapping
- **Minimap**: File overview sidebar

### Terminal Configuration

- **Working directory**: `/workspace` by default
- **Command history**: Persistent across sessions
- **Output formatting**: Syntax highlighting for different languages

## 🏗️ Architecture

### Frontend Structure
The SPA lives in `../front/` (sibling to `MindCoder/`). Login, signup, marketing, and app routes are under `front/src/`.
```
front/src/
├── components/
├── pages/
│   ├── auth/           # Login, signup
│   ├── Features/
│   └── app/            # Generator, IDE, etc.
├── layouts/
└── context/
```

### Backend Structure
```
server/
├── index.ts           # Main server file
├── routes.ts          # API routes
├── services/          # Business logic
│   ├── gemini.ts     # AI service
│   └── auth.ts       # Authentication
├── storage.ts         # Data persistence
└── db.ts             # Database connection
```

## 🔒 Security

- **Authentication**: JWT-based authentication
- **OAuth Support**: Google and GitHub login
- **File Isolation**: User-specific file storage
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API rate limiting for AI requests

## 🚀 Deployment

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

### Environment Variables

Set these environment variables for production:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
GEMINI_API_KEY=your_gemini_api_key
SESSION_SECRET=your_secure_session_secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check the inline documentation in the code
- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Join the community discussions

## 🔮 Roadmap

### Upcoming Features
- **Git integration**: Built-in version control
- **Deployment tools**: One-click deployment
- **Advanced AI**: More sophisticated code generation
- **Plugin system**: Extensible architecture
- **Mobile support**: Responsive design for mobile devices

### Planned Improvements
- **Performance optimization**: Faster loading times
- **Enhanced terminal**: More terminal features
- **Better file management**: Advanced file operations
- **AI model selection**: Choose different AI models
- **Custom themes**: User-defined themes

---

**DevMindX** - Empowering developers with AI-powered tools for the future of software development. 