# DevMindX Production Architecture

## Current Setup (After Fix)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                   https://devmindx.vercel.app                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             │ (with CORS headers)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL (Frontend)                          │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  React App (Vite)                                         │ │
│  │  - API_BASE_URL: https://devmindx.onrender.com           │ │
│  │  - SOCKET_URL: https://devmindx.onrender.com             │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ API Calls
                             │ Origin: https://devmindx.vercel.app
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RENDER (Backend)                             │
│              https://devmindx.onrender.com                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Express Server (Node.js)                                 │ │
│  │                                                            │ │
│  │  CORS Middleware ✅                                        │ │
│  │  - Checks Origin header                                   │ │
│  │  - Validates against ALLOWED_ORIGINS                      │ │
│  │  - Adds CORS headers to response                          │ │
│  │  - Handles OPTIONS preflight (204)                        │ │
│  │                                                            │ │
│  │  API Routes:                                              │ │
│  │  - /api/health (health check)                            │ │
│  │  - /api/auth/* (authentication)                          │ │
│  │  - /api/projects (project management)                    │ │
│  │  - /api/research/* (research engine)                     │ │
│  │  - /api/architecture/* (architecture generator)          │ │
│  │  - /api/learning/* (learning mode)                       │ │
│  │  - /api/llm/* (AI models)                                │ │
│  └───────────────────────────┬───────────────────────────────┘ │
└────────────────────────────┬─┴────────────────────────────────┘
                             │
                             │ Database Queries
                             │ (MongoDB Driver)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MONGODB ATLAS (Database)                      │
│              mongodb+srv://cluster.mongodb.net                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Collections:                                             │ │
│  │  - users (user accounts)                                  │ │
│  │  - projects (user projects)                               │ │
│  │  - chatSessions (chat history)                            │ │
│  │  - chatHistory (AI conversations)                         │ │
│  │  - collaborationSessions (real-time collab)               │ │
│  │  - files (IDE files)                                      │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow (After Fix)

### 1. User Visits Account Page

```
Browser → Vercel Frontend
  ↓
Frontend makes API call:
  GET https://devmindx.onrender.com/api/llm/models
  Headers:
    - Origin: https://devmindx.vercel.app
    - x-user-id: user123
  ↓
Render Backend receives request
  ↓
CORS Middleware checks:
  ✅ Origin in ALLOWED_ORIGINS?
  ✅ Add CORS headers to response
  ↓
Route handler executes:
  - Connects to MongoDB ✅
  - Queries users collection ✅
  - Returns user's models ✅
  ↓
Response sent with CORS headers:
  Access-Control-Allow-Origin: https://devmindx.vercel.app
  Access-Control-Allow-Credentials: true
  ↓
Browser receives response ✅
  ↓
Account page displays data ✅
```

### 2. Preflight Request (OPTIONS)

```
Browser detects cross-origin request
  ↓
Sends OPTIONS preflight:
  OPTIONS https://devmindx.onrender.com/api/projects
  Headers:
    - Origin: https://devmindx.vercel.app
    - Access-Control-Request-Method: GET
    - Access-Control-Request-Headers: Content-Type
  ↓
CORS Middleware handles:
  ✅ Checks origin
  ✅ Adds CORS headers
  ✅ Returns 204 (No Content)
  ↓
Browser receives 204 with CORS headers ✅
  ↓
Browser sends actual request ✅
```

## Environment Variables Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    RENDER ENVIRONMENT                           │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  MONGODB_URI → MongoDB connection                         │ │
│  │  MONGODB_DB → Database name                               │ │
│  │  ALLOWED_ORIGINS → CORS validation                        │ │
│  │  JWT_SECRET → Token signing                               │ │
│  │  EMAIL_USER/PASS → OTP emails                             │ │
│  │  TOGETHER_API_KEY → AI model                              │ │
│  │  GEMINI_API_KEY → AI model                                │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ Used by
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER                               │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  process.env.MONGODB_URI                                  │ │
│  │  process.env.ALLOWED_ORIGINS                              │ │
│  │  process.env.JWT_SECRET                                   │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL ENVIRONMENT                           │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  VITE_API_URL → Backend URL                               │ │
│  │  VITE_SOCKET_URL → WebSocket URL                          │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ Used by
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REACT APP                                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  import.meta.env.VITE_API_URL                             │ │
│  │  → API_BASE_URL in api.ts                                 │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Error Scenarios (Before Fix)

### ❌ CORS Error
```
Browser → Vercel Frontend
  ↓
Frontend: GET https://devmindx.onrender.com/api/projects
  ↓
Backend: No CORS headers (or wrong origin)
  ↓
Browser: ❌ CORS policy error
  ↓
User sees: Network error / Failed to fetch
```

### ❌ MongoDB Error
```
Backend receives request
  ↓
Tries to connect to MongoDB
  ↓
MONGODB_URI not set ❌
  ↓
Error: Cannot read properties of undefined (reading 'collection')
  ↓
Response: 500 Internal Server Error
  ↓
User sees: Failed to load data
```

### ❌ 404 Error
```
Frontend: GET /api/projects
  ↓
API_BASE_URL is empty string
  ↓
Actual request: GET https://devmindx.vercel.app/api/projects
  ↓
Vercel: No such route ❌
  ↓
Response: 404 Not Found
  ↓
User sees: Feature not working
```

## Success Scenarios (After Fix)

### ✅ CORS Success
```
Browser → Vercel Frontend
  ↓
Frontend: GET https://devmindx.onrender.com/api/projects
  Origin: https://devmindx.vercel.app
  ↓
Backend CORS Middleware:
  - Checks origin ✅
  - Adds CORS headers ✅
  ↓
Response with headers:
  Access-Control-Allow-Origin: https://devmindx.vercel.app
  ↓
Browser: ✅ CORS check passed
  ↓
User sees: Data loaded successfully
```

### ✅ MongoDB Success
```
Backend receives request
  ↓
Connects to MongoDB:
  - MONGODB_URI is set ✅
  - Connection successful ✅
  ↓
Queries database ✅
  ↓
Returns data ✅
  ↓
User sees: Data displayed
```

### ✅ API Success
```
Frontend: GET /api/projects
  ↓
API_BASE_URL = https://devmindx.onrender.com
  ↓
Actual request: GET https://devmindx.onrender.com/api/projects ✅
  ↓
Render: Route found ✅
  ↓
Response: 200 OK with data
  ↓
User sees: Feature working
```

## Health Check Flow

```
User/Monitor → GET https://devmindx.onrender.com/api/health
  ↓
Backend health endpoint:
  - Attempts MongoDB connection
  - Sends ping command
  ↓
MongoDB responds ✅
  ↓
Response:
  {
    "status": "healthy",
    "mongodb": "connected",
    "environment": "production",
    "timestamp": "2024-..."
  }
  ↓
Monitor: ✅ System healthy
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: CORS (Origin Validation)                             │
│  - Only allows requests from Vercel frontend                    │
│  - Blocks unauthorized origins                                  │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  Layer 2: JWT Authentication                                    │
│  - Validates user tokens                                        │
│  - Checks token expiration                                      │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  Layer 3: MongoDB TLS                                           │
│  - Encrypted connection to database                             │
│  - User authentication required                                 │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  Layer 4: Environment Variables                                 │
│  - Secrets stored securely                                      │
│  - Not exposed in code                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Pipeline

```
Developer → Git Push
  ↓
GitHub Repository
  ├─→ Vercel (Frontend)
  │   - Detects changes
  │   - Builds React app
  │   - Deploys to CDN
  │   - Uses VITE_API_URL
  │
  └─→ Render (Backend)
      - Detects changes
      - Installs dependencies
      - Builds TypeScript
      - Starts Express server
      - Uses MONGODB_URI, etc.
```

## Monitoring Points

```
1. Health Check
   GET /api/health
   → Monitor MongoDB connection

2. Error Logs
   Render Dashboard → Logs
   → Check for errors

3. Browser Console
   F12 → Console
   → Check for CORS/API errors

4. MongoDB Atlas
   Dashboard → Metrics
   → Monitor database performance
```
