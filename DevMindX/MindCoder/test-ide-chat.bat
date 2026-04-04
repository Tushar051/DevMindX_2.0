@echo off
echo ========================================
echo Testing IDE Chat with Ollama
echo ========================================
echo.

echo Step 1: Testing Ollama availability...
node test-ollama-chat.js
echo.

echo Step 2: Instructions for testing IDE chat:
echo.
echo 1. Make sure DevMindX server is running (npm run dev)
echo 2. Open http://localhost:5173 in your browser
echo 3. Navigate to the IDE (Cursor IDE page)
echo 4. Open the browser console (F12)
echo 5. Type a message in the AI chat panel
echo 6. Watch both:
echo    - Browser console for frontend logs
echo    - Server terminal for backend logs
echo.
echo Expected logs in browser console:
echo   - "Sending AI message: [your message]"
echo   - "Selected model: [model name]"
echo   - "Fetching from /api/ide/ai/chat..."
echo   - "Response status: 200"
echo   - "Received response: [response data]"
echo.
echo Expected logs in server terminal:
echo   - "=== IDE AI Chat Request ==="
echo   - "Body: [request data]"
echo   - "Calling chatWithAIModel..."
echo   - "Routing [model] to Ollama for chat"
echo   - "Got response from AI, length: [number]"
echo.
echo If you see errors, note which step fails and share the error message.
echo.
pause
