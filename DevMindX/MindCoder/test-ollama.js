/**
 * Test script for Ollama integration
 * Run with: node test-ollama.js
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

async function testOllamaConnection() {
  console.log('========================================');
  console.log('Testing Ollama Connection');
  console.log('========================================\n');

  try {
    console.log(`Connecting to Ollama at ${OLLAMA_BASE_URL}...`);
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✓ Successfully connected to Ollama\n');
    
    console.log('Available models:');
    if (data.models && data.models.length > 0) {
      data.models.forEach(model => {
        console.log(`  - ${model.name} (${(model.size / 1024 / 1024 / 1024).toFixed(2)} GB)`);
      });
    } else {
      console.log('  No models found. Please pull a model first:');
      console.log('  ollama pull llama3.2');
    }
    
    return true;
  } catch (error) {
    console.error('✗ Failed to connect to Ollama');
    console.error(`Error: ${error.message}\n`);
    console.log('Make sure Ollama is running:');
    console.log('  Windows: Check system tray for Ollama icon');
    console.log('  Mac/Linux: Run "ollama serve" in a terminal\n');
    return false;
  }
}

async function testOllamaGeneration() {
  console.log('\n========================================');
  console.log('Testing Code Generation');
  console.log('========================================\n');

  const model = process.env.OLLAMA_MODEL || 'llama3.2';
  
  try {
    console.log(`Using model: ${model}`);
    console.log('Generating a simple function...\n');

    const prompt = 'Write a JavaScript function that adds two numbers and returns the result. Include comments.';
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✓ Successfully generated code\n');
    console.log('Generated response:');
    console.log('-----------------------------------');
    console.log(data.response);
    console.log('-----------------------------------\n');
    
    return true;
  } catch (error) {
    console.error('✗ Failed to generate code');
    console.error(`Error: ${error.message}\n`);
    
    if (error.message.includes('not found')) {
      console.log(`Model "${model}" not found. Pull it with:`);
      console.log(`  ollama pull ${model}\n`);
    }
    
    return false;
  }
}

async function testOllamaChat() {
  console.log('\n========================================');
  console.log('Testing Chat API');
  console.log('========================================\n');

  const model = process.env.OLLAMA_MODEL || 'llama3.2';
  
  try {
    console.log(`Using model: ${model}`);
    console.log('Testing chat conversation...\n');

    const messages = [
      {
        role: 'system',
        content: 'You are a helpful coding assistant.'
      },
      {
        role: 'user',
        content: 'What is the difference between let and const in JavaScript?'
      }
    ];
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: false,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✓ Successfully completed chat\n');
    console.log('Chat response:');
    console.log('-----------------------------------');
    console.log(data.message.content);
    console.log('-----------------------------------\n');
    
    return true;
  } catch (error) {
    console.error('✗ Failed to chat');
    console.error(`Error: ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   DevMindX - Ollama Integration Test  ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('\n');

  const connectionOk = await testOllamaConnection();
  
  if (!connectionOk) {
    console.log('\n❌ Tests failed: Cannot connect to Ollama');
    console.log('\nPlease ensure:');
    console.log('1. Ollama is installed (https://ollama.com/download)');
    console.log('2. Ollama service is running');
    console.log('3. At least one model is pulled (ollama pull llama3.2)');
    process.exit(1);
  }

  const generationOk = await testOllamaGeneration();
  const chatOk = await testOllamaChat();

  console.log('\n========================================');
  console.log('Test Summary');
  console.log('========================================\n');
  console.log(`Connection:     ${connectionOk ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Generation:     ${generationOk ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Chat:           ${chatOk ? '✓ PASS' : '✗ FAIL'}`);
  console.log('\n');

  if (connectionOk && generationOk && chatOk) {
    console.log('✅ All tests passed! Ollama is ready to use.');
    console.log('\nYou can now:');
    console.log('1. Set USE_OLLAMA=true in your .env file');
    console.log('2. Start your DevMindX server: npm run dev');
    console.log('3. Use any AI model in the UI - it will use Ollama!\n');
  } else {
    console.log('❌ Some tests failed. Please check the errors above.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
