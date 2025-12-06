#!/usr/bin/env python3
"""
Interactive Test Script for DevMindX Terminal
This script demonstrates interactive input functionality.
"""

import sys
import time

def main():
    print("=== DevMindX Interactive Terminal Test ===")
    print("This script will ask for your input to test the terminal.")
    
    # Test 1: Simple input
    name = input("What's your name? ")
    print(f"Hello, {name}! Nice to meet you.")
    
    # Test 2: Number input
    try:
        age = int(input("How old are you? "))
        print(f"You are {age} years old.")
    except ValueError:
        print("That's not a valid number!")
    
    # Test 3: Choice input
    choice = input("Do you like programming? (y/n): ").lower()
    if choice in ['y', 'yes']:
        print("Great! Programming is awesome!")
    elif choice in ['n', 'no']:
        print("Maybe you'll change your mind!")
    else:
        print("I didn't understand that.")
    
    # Test 4: Password-like input (hidden)
    password = input("Enter a secret password: ")
    print(f"Your password is {len(password)} characters long.")
    
    # Test 5: Multiple line input
    print("Enter some text (press Enter twice to finish):")
    lines = []
    while True:
        line = input()
        if line == "":
            break
        lines.append(line)
    
    print(f"You entered {len(lines)} lines:")
    for i, line in enumerate(lines, 1):
        print(f"  {i}: {line}")
    
    print("\n=== Test completed successfully! ===")
    print("The terminal should now support interactive input properly.")

if __name__ == "__main__":
    main()
