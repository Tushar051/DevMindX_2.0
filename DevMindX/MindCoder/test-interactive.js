#!/usr/bin/env node
/**
 * Interactive Test Script for DevMindX Terminal
 * This script demonstrates interactive input functionality using Node.js readline.
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log("=== DevMindX Interactive Terminal Test (Node.js) ===");
  console.log("This script will ask for your input to test the terminal.");
  
  try {
    // Test 1: Simple input
    const name = await askQuestion("What's your name? ");
    console.log(`Hello, ${name}! Nice to meet you.`);
    
    // Test 2: Number input
    const ageStr = await askQuestion("How old are you? ");
    const age = parseInt(ageStr);
    if (isNaN(age)) {
      console.log("That's not a valid number!");
    } else {
      console.log(`You are ${age} years old.`);
    }
    
    // Test 3: Choice input
    const choice = await askQuestion("Do you like programming? (y/n): ");
    if (choice.toLowerCase() === 'y' || choice.toLowerCase() === 'yes') {
      console.log("Great! Programming is awesome!");
    } else if (choice.toLowerCase() === 'n' || choice.toLowerCase() === 'no') {
      console.log("Maybe you'll change your mind!");
    } else {
      console.log("I didn't understand that.");
    }
    
    // Test 4: Password-like input
    const password = await askQuestion("Enter a secret password: ");
    console.log(`Your password is ${password.length} characters long.`);
    
    // Test 5: Multiple choice
    const favoriteLanguage = await askQuestion("What's your favorite programming language? ");
    console.log(`Interesting! ${favoriteLanguage} is a great choice.`);
    
    // Test 6: Confirmation
    const confirm = await askQuestion("Are you ready to continue? (yes/no): ");
    if (confirm.toLowerCase() === 'yes') {
      console.log("Excellent! Let's continue...");
    } else {
      console.log("No problem, we can stop here.");
    }
    
    console.log("\n=== Test completed successfully! ===");
    console.log("The terminal should now support interactive input properly.");
    
  } catch (error) {
    console.error("An error occurred:", error.message);
  } finally {
    rl.close();
  }
}

main();
