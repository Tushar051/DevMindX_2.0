# DevMindX IDE Setup Guide

## Prerequisites

To run code in the IDE, you need to install the following on your system:

### 1. Node.js (Required)
- Download from: https://nodejs.org/
- Version: 18.0.0 or higher
- This enables JavaScript/TypeScript execution

### 2. Python (Required for Python files)
- Download from: https://python.org/
- Version: 3.7 or higher
- Make sure `python` command is available in PATH

### 3. TypeScript Compiler (Required for TypeScript files)
```bash
npm install -g typescript
```

## Installation Steps

### 1. Install Server Dependencies
```bash
cd server
npm install
```

### 2. Install Client Dependencies
```bash
cd ../client
npm install
```

### 3. Environment Setup
Create a `.env` file in the server directory:
```env
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
```

### 4. Start the Development Server
```bash
# Terminal 1 - Start the backend server
cd server
npm run dev

# Terminal 2 - Start the frontend client
cd client
npm run dev
```

## Supported Languages

The IDE can now execute the following languages:

### ✅ JavaScript (.js)
- Full Node.js execution
- Console output capture
- Error handling

### ✅ TypeScript (.ts)
- TypeScript compilation
- JavaScript execution
- Type checking

### ✅ Python (.py)
- Python 3 execution
- Print output capture
- Error handling

### ✅ HTML (.html)
- HTTP server serving
- Browser preview URL
- Content validation

### ✅ CSS (.css)
- Syntax validation
- Content preview
- File saving

### ✅ JSON (.json)
- JSON validation
- Formatting
- Syntax checking

## Usage Examples

### JavaScript Example
```javascript
console.log("Hello from JavaScript!");
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
console.log("Sum:", sum);
```

### Python Example
```python
print("Hello from Python!")
numbers = [1, 2, 3, 4, 5]
total = sum(numbers)
print(f"Sum: {total}")
```

### HTML Example
```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Page</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>This HTML will be served on a local server.</p>
</body>
</html>
```

## Security Features

- **Sandboxed execution**: Code runs in isolated temporary directories
- **Timeout limits**: 10-second timeout for most languages
- **Automatic cleanup**: Temporary files are deleted after execution
- **Error isolation**: Failed executions don't affect the IDE

## Troubleshooting

### "Command not found" errors
- Make sure Node.js and Python are installed and in PATH
- Restart your terminal after installation

### TypeScript compilation errors
- Install TypeScript globally: `npm install -g typescript`
- Make sure TypeScript is in your PATH

### Permission errors
- Make sure the server has write permissions to create temporary directories
- Run the server with appropriate permissions

### Port conflicts
- The HTML server uses random ports to avoid conflicts
- If you see port errors, restart the server

## Advanced Configuration

### Custom Language Support
To add support for new languages, modify the `executeProject` function in `server/routes.ts`:

```typescript
case 'your-language':
  output = await executeYourLanguage(content, tempDir);
  break;
```

### Execution Timeouts
Modify the timeout values in the execution functions:
```typescript
timeout: 10000, // 10 seconds
```

### Output Formatting
Customize how output is displayed by modifying the terminal output conversion in the frontend. 