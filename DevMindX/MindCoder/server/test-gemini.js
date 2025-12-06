/**
 * Test script to verify Gemini API key
 * Usage: 
 *   node test-gemini.js
 *   or
 *   GEMINI_API_KEY=your_key_here node test-gemini.js
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// Get API key from environment or command line argument
const API_KEY = process.env.GEMINI_API_KEY || process.argv[2] || 'AIzaSyCgPrayZtswmC0q9Meb8CLe-MvVYqlnrGU';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

async function testGeminiAPI() {
  console.log('🔍 Testing Gemini API Key...\n');
  console.log(`Model: ${MODEL}`);
  console.log(`API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 4)}\n`);

  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });

    console.log('📡 Sending test request to Gemini API...\n');

    // Make a simple test request
    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: 'Say "Hello, API is working!" if you can read this.' }] }
      ],
      generationConfig: {
        maxOutputTokens: 50,
      }
    });

    const response = result.response;
    const text = response.text();

    console.log('✅ SUCCESS! Gemini API is working!\n');
    console.log('Response:', text);
    console.log('\n📊 Response Details:');
    console.log('- Finish Reason:', response.candidates?.[0]?.finishReason || 'N/A');
    console.log('- Safety Ratings:', JSON.stringify(response.candidates?.[0]?.safetyRatings || [], null, 2));
    
    // Test listing models
    console.log('\n📋 Testing model list access...');
    const modelsUrl = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(API_KEY)}`;
    const modelsResponse = await fetch(modelsUrl);
    
    if (modelsResponse.ok) {
      const modelsData = await modelsResponse.json();
      console.log(`✅ Can access models list! Found ${modelsData.models?.length || 0} models`);
      if (modelsData.models && modelsData.models.length > 0) {
        console.log('\nAvailable models:');
        modelsData.models.slice(0, 5).forEach((model) => {
          console.log(`  - ${model.name}`);
        });
      }
    } else {
      console.log('⚠️  Could not access models list (this is okay, API key still works)');
    }

    console.log('\n✨ All tests passed! Your Gemini API key is working correctly.');

  } catch (error) {
    console.error('\n❌ ERROR: Gemini API test failed!\n');
    
    if (error.message) {
      console.error('Error message:', error.message);
    }
    
    if (error.status || error.statusCode) {
      console.error('Status code:', error.status || error.statusCode);
    }

    // Common error messages
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('invalid API key')) {
      console.error('\n💡 The API key appears to be invalid. Please check:');
      console.error('   1. The key is correct');
      console.error('   2. The key has not been revoked');
      console.error('   3. The key has the necessary permissions');
    } else if (error.message?.includes('PERMISSION_DENIED')) {
      console.error('\n💡 Permission denied. The API key may not have access to this model.');
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      console.error('\n💡 Quota exceeded. You may have reached your free tier limit.');
    } else if (error.message?.includes('429')) {
      console.error('\n💡 Rate limit exceeded. Please try again in a moment.');
    } else {
      console.error('\n💡 Full error:', error);
    }

    process.exit(1);
  }
}

// Run the test
testGeminiAPI();

