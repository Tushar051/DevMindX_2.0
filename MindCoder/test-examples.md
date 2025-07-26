# DevMindX IDE - Code Execution Test Examples

## 🚀 **Real Code Execution is Now Working!**

The IDE now supports **real code execution** for multiple programming languages. Here are some test examples you can try:

## 📝 **JavaScript Examples**

### Basic JavaScript
```javascript
console.log("Hello from JavaScript!");
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
console.log("Sum:", sum);
```

### JavaScript with Functions
```javascript
function greet(name) {
    return `Hello, ${name}!`;
}

function calculateArea(radius) {
    return Math.PI * radius * radius;
}

console.log(greet("World"));
console.log("Area of circle with radius 5:", calculateArea(5));
```

## 🐍 **Python Examples**

### Basic Python
```python
print("Hello from Python!")
numbers = [1, 2, 3, 4, 5]
total = sum(numbers)
print(f"Sum: {total}")
```

### Python with Classes
```python
class Calculator:
    def __init__(self):
        self.result = 0
    
    def add(self, x):
        self.result += x
        return self
    
    def multiply(self, x):
        self.result *= x
        return self
    
    def get_result(self):
        return self.result

calc = Calculator()
result = calc.add(5).multiply(3).get_result()
print(f"Result: {result}")
```

## 🔷 **TypeScript Examples**

### Basic TypeScript
```typescript
interface User {
    name: string;
    age: number;
    email: string;
}

function createUser(name: string, age: number, email: string): User {
    return { name, age, email };
}

const user = createUser("John Doe", 30, "john@example.com");
console.log("User created:", user);
```

### TypeScript with Generics
```typescript
class Stack<T> {
    private items: T[] = [];
    
    push(item: T): void {
        this.items.push(item);
    }
    
    pop(): T | undefined {
        return this.items.pop();
    }
    
    peek(): T | undefined {
        return this.items[this.items.length - 1];
    }
    
    size(): number {
        return this.items.length;
    }
}

const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
numberStack.push(3);
console.log("Stack size:", numberStack.size());
console.log("Top item:", numberStack.peek());
```

## 🌐 **HTML Examples**

### Basic HTML
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Page</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: #007bff; color: white; padding: 20px; border-radius: 8px; }
        .content { margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Hello from DevMindX IDE!</h1>
        </div>
        <div class="content">
            <p>This HTML file is being served by a real HTTP server.</p>
            <p>Current time: <span id="time"></span></p>
        </div>
    </div>
    <script>
        document.getElementById('time').textContent = new Date().toLocaleString();
    </script>
</body>
</html>
```

## 🎨 **CSS Examples**

### Modern CSS
```css
/* Modern CSS with Flexbox and Grid */
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    margin: 1rem;
    max-width: 400px;
    text-align: center;
}

.button {
    background: #007bff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

.button:hover {
    background: #0056b3;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
}
```

## 📊 **JSON Examples**

### Valid JSON
```json
{
  "name": "DevMindX IDE",
  "version": "1.0.0",
  "description": "A powerful browser-based IDE",
  "features": [
    "Real code execution",
    "Multiple language support",
    "AI-powered assistance",
    "File management"
  ],
  "supportedLanguages": {
    "javascript": true,
    "typescript": true,
    "python": true,
    "html": true,
    "css": true,
    "json": true
  },
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  }
}
```

## 🧪 **How to Test**

1. **Create a new file** in the IDE
2. **Choose the file type** (JavaScript, Python, TypeScript, HTML, CSS, JSON)
3. **Copy and paste** any of the examples above
4. **Click "Run Project"** button
5. **Check the terminal** for real execution output

## ✅ **Expected Results**

### JavaScript/TypeScript:
- Real console output in terminal
- Error messages if code has issues
- Success notifications

### Python:
- Real print output in terminal
- Python error messages
- Execution results

### HTML:
- HTTP server URL provided
- Browser preview available
- Content validation

### CSS:
- Syntax validation
- Content preview
- File saving confirmation

### JSON:
- Syntax validation
- Formatting
- Error detection

## 🎯 **Key Features**

- **Real execution** (not simulation)
- **Sandboxed environment** for safety
- **Timeout protection** (10 seconds)
- **Automatic cleanup** of temporary files
- **Error handling** and display
- **Multiple language support**

The IDE now provides a complete development environment with real code execution capabilities! 🚀 