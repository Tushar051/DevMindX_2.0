# DevMindX - AI-Powered Web IDE

## Overview

DevMindX is a full-stack web-based Integrated Development Environment (IDE) powered by AI assistance. The application combines a modern React frontend with an Express.js backend, featuring real-time code editing, AI-powered code generation, project management, and user authentication with OAuth integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state, React Context for authentication
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Authentication**: Passport.js with Google OAuth and GitHub OAuth strategies
- **Session Management**: Express sessions with in-memory storage
- **API Design**: RESTful API with structured error handling

## Key Components

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: Configured for PostgreSQL (Neon Database serverless)
- **Schema**: User management, project storage, and chat session tracking
- **Migrations**: Drizzle Kit for schema management

### Authentication System
- **Multi-provider OAuth**: Google and GitHub integration via Passport.js
- **JWT Tokens**: For API authentication and session persistence
- **Email Verification**: Nodemailer integration for account verification
- **Password Security**: Bcrypt for password hashing

### AI Integration
- **Primary Provider**: Google Gemini (gemini-2.5-pro, gemini-2.5-flash)
- **Multi-Model Support**: Architecture ready for OpenAI GPT-4o and Anthropic Claude
- **Features**: AI-powered project generation, code assistance, chat functionality, and code analysis
- **Model Selection**: Users can choose between available AI models via the IDE interface
- **Context**: Project-aware AI assistance with chat history persistence

### IDE Features
- **File Explorer**: Hierarchical file tree with expand/collapse functionality
- **Code Editor**: Placeholder for Monaco Editor integration
- **Terminal**: Simulated terminal interface for project commands
- **Project Management**: Create, load, and manage multiple projects
- **Real-time Chat**: AI assistant integration with project context

## Data Flow

1. **Authentication Flow**:
   - OAuth providers redirect to Express routes
   - Passport strategies handle provider authentication
   - JWT tokens issued for API access
   - Frontend stores tokens in localStorage

2. **Project Management**:
   - Projects stored with file structure in JSONB format
   - AI generates complete project scaffolding via OpenAI API
   - File changes tracked and persisted to database

3. **AI Interaction**:
   - Chat sessions linked to specific projects
   - Context includes project files and previous conversations
   - OpenAI API integration for code generation and assistance

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Database ORM and query builder
- **passport**: Authentication middleware
- **openai**: AI API integration
- **nodemailer**: Email service integration
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token management

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **@tanstack/react-query**: Server state management
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling for server code

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx with nodemon-like behavior
- **Database**: Environment variable configuration for development DB

### Production Build
- **Frontend**: Static assets built to `dist/public`
- **Backend**: Single bundled file using esbuild
- **Deployment**: Express serves both API and static frontend

### Environment Configuration
- Database URL via `DATABASE_URL` environment variable
- OAuth credentials via environment variables
- OpenAI API key configuration
- Email service credentials for verification

### File Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── migrations/      # Database migrations
└── dist/           # Production build output
```

The application follows a monorepo structure with clear separation between frontend, backend, and shared code, enabling efficient development and deployment workflows.