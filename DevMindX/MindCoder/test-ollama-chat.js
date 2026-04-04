/**
 * Test Ollama Chat Endpoint
 * This script tests if Ollama is responding to chat requests
 */

async function testOllamaChat() {
  const OLLAMA_BASE_URL = 'http://localhost:11434';
  
  console.log('Testing Ollama chat endpoint...\n');
  
  try {
    // Test 1: Check if Ollama is running
    console.log('1. Checking Ollama availability...');
    const tagsResponse = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!tagsResponse.ok) {
      throw new Error('Ollama is not running or not accessible');
    }
    const tags = await tagsResponse.json();
    console.log('✓ Ollama is running');
    console.log('Available models:', tags.models.map(m => m.name).join(', '));
    console.log('');
    
    // Test 2: Simple chat request
    console.log('2. Testing simple chat request...');
    const chatRequest = {
      model: 'llama3.2',
      messages: [
        {
          role: 'user',
          content: 'Say hello in one sentence'
        }
      ],
      stream: false
    };
    
    console.log('Sending request:', JSON.stringify(chatRequest, null, 2));
    const startTime = Date.now();
    
    const chatResponse = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chatRequest)
    });
    
    const responseTime = Date.now() - startTime;
    
    if (!chatResponse.ok) {
      throw new Error(`Chat request failed: ${chatResponse.statusText}`);
    }
    
    const chatData = await chatResponse.json();
    console.log('✓ Chat request successful');
    console.log('Response time:', responseTime, 'ms');
    console.log('Response:', chatData.message?.content || 'No content');
    console.log('');
    
    // Test 3: Code generation request
    console.log('3. Testing code generation request...');
    const codeRequest = {
      model: 'llama3.2',
      messages: [
        {
          role: 'system',
          content: 'You are a coding assistant. Provide code in markdown format.'
        },
        {
          role: 'user',
          content: 'Write a simple hello world function in JavaScript'
        }
      ],
      stream: false
    };
    
    const codeStartTime = Date.now();
    const codeResponse = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(codeRequest)
    });
    
    const codeResponseTime = Date.now() - codeStartTime;
    
    if (!codeResponse.ok) {
      throw new Error(`Code generation failed: ${codeResponse.statusText}`);
    }
    
    const codeData = await codeResponse.json();
    console.log('✓ Code generation successful');
    console.log('Response time:', codeResponseTime, 'ms');
    console.log('Response:', codeData.message?.content || 'No content');
    console.log('');
    
    console.log('=== All tests passed! ===');
    console.log('Ollama is working correctly and ready to use.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Make sure Ollama is running (check Task Manager for "ollama" process)');
    console.error('2. Verify Ollama is accessible at http://localhost:11434');
    console.error('3. Ensure llama3.2 model is pulled: ollama pull llama3.2');
    console.error('4. Try restarting Ollama service');
  }
}

// Run the test
testOllamaChat();
