// Todo App - Full-featured task management application
// Demonstrates: CRUD operations, local storage, filtering, and modern UI

export const todoAppProject = {
  name: "TaskMaster - Todo Application",
  framework: "web",
  description: "A full-featured task management application with categories, priorities, due dates, and local storage persistence. Perfect for demonstrating CRUD operations and state management.",
  
  files: {
    "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaskMaster - Todo Application</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="app-container">
        <!-- Header -->
        <header class="header">
            <div class="logo">
                <span class="logo-icon">✅</span>
                <h1>TaskMaster</h1>
            </div>
            <div class="header-stats">
                <div class="stat">
                    <span class="stat-value" id="totalTasks">0</span>
                    <span class="stat-label">Total</span>
                </div>
                <div class="stat">
                    <span class="stat-value" id="completedTasks">0</span>
                    <span class="stat-label">Done</span>
                </div>
                <div class="stat">
                    <span class="stat-value" id="pendingTasks">0</span>
                    <span class="stat-label">Pending</span>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Add Task Form -->
            <section class="add-task-section">
                <h2>Add New Task</h2>
                <form id="taskForm" class="task-form">
                    <div class="form-row">
                        <input type="text" id="taskTitle" placeholder="What needs to be done?" required>
                        <select id="taskCategory">
                            <option value="personal">🏠 Personal</option>
                            <option value="work">💼 Work</option>
                            <option value="shopping">🛒 Shopping</option>
                            <option value="health">💪 Health</option>
                            <option value="study">📚 Study</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <select id="taskPriority">
                            <option value="low">🟢 Low Priority</option>
                            <option value="medium">🟡 Medium Priority</option>
                            <option value="high">🔴 High Priority</option>
                        </select>
                        <input type="date" id="taskDueDate">
                        <button type="submit" class="btn-add">
                            <span>➕</span> Add Task
                        </button>
                    </div>
                </form>
            </section>

            <!-- Filters -->
            <section class="filters-section">
                <div class="filter-group">
                    <button class="filter-btn active" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="pending">Pending</button>
                    <button class="filter-btn" data-filter="completed">Completed</button>
                </div>
                <div class="filter-group">
                    <select id="categoryFilter">
                        <option value="all">All Categories</option>
                        <option value="personal">🏠 Personal</option>
                        <option value="work">💼 Work</option>
                        <option value="shopping">🛒 Shopping</option>
                        <option value="health">💪 Health</option>
                        <option value="study">📚 Study</option>
                    </select>
                    <button class="btn-clear" id="clearCompleted">🗑️ Clear Completed</button>
                </div>
            </section>

            <!-- Task List -->
            <section class="tasks-section">
                <ul id="taskList" class="task-list">
                    <!-- Tasks will be rendered here -->
                </ul>
                <div id="emptyState" class="empty-state">
                    <span class="empty-icon">📝</span>
                    <h3>No tasks yet!</h3>
                    <p>Add your first task above to get started</p>
                </div>
            </section>
        </main>

        <!-- Footer -->
        <footer class="footer">
            <p>Built with ❤️ using DevMindX - AI-Powered Development Platform</p>
        </footer>
    </div>

    <script src="app.js"></script>
</body>
</html>`,

    "style.css": `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary: #6366f1;
    --primary-dark: #4f46e5;
    --success: #22c55e;
    --warning: #f59e0b;
    --danger: #ef4444;
    --dark: #1e293b;
    --light: #f1f5f9;
    --white: #ffffff;
    --border: #e2e8f0;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 2rem;
}

.app-container {
    max-width: 800px;
    margin: 0 auto;
    background: var(--white);
    border-radius: 20px;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
}

/* Header */
.header {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: var(--white);
    padding: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.logo-icon {
    font-size: 2.5rem;
}

.logo h1 {
    font-size: 1.75rem;
    font-weight: 700;
}

.header-stats {
    display: flex;
    gap: 2rem;
}

.stat {
    text-align: center;
}

.stat-value {
    display: block;
    font-size: 2rem;
    font-weight: 700;
}

.stat-label {
    font-size: 0.875rem;
    opacity: 0.9;
}

/* Main Content */
.main-content {
    padding: 2rem;
}

/* Add Task Section */
.add-task-section {
    margin-bottom: 2rem;
}

.add-task-section h2 {
    color: var(--dark);
    margin-bottom: 1rem;
    font-size: 1.25rem;
}

.task-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-row {
    display: flex;
    gap: 1rem;
}

.form-row input[type="text"] {
    flex: 2;
}

.form-row select,
.form-row input[type="date"] {
    flex: 1;
}

input, select {
    padding: 0.875rem 1rem;
    border: 2px solid var(--border);
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.3s;
}

input:focus, select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn-add {
    background: var(--primary);
    color: var(--white);
    border: none;
    padding: 0.875rem 1.5rem;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s;
}

.btn-add:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow);
}

/* Filters Section */
.filters-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid var(--border);
    flex-wrap: wrap;
    gap: 1rem;
}

.filter-group {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.filter-btn {
    background: var(--light);
    border: none;
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
}

.filter-btn:hover {
    background: var(--border);
}

.filter-btn.active {
    background: var(--primary);
    color: var(--white);
}

.btn-clear {
    background: var(--danger);
    color: var(--white);
    border: none;
    padding: 0.625rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-clear:hover {
    opacity: 0.9;
}

/* Task List */
.task-list {
    list-style: none;
}

.task-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: var(--white);
    border: 2px solid var(--border);
    border-radius: 12px;
    margin-bottom: 1rem;
    transition: all 0.3s;
}

.task-item:hover {
    border-color: var(--primary);
    box-shadow: var(--shadow);
}

.task-item.completed {
    opacity: 0.7;
    background: var(--light);
}

.task-item.completed .task-title {
    text-decoration: line-through;
    color: #94a3b8;
}

.task-checkbox {
    width: 24px;
    height: 24px;
    border: 2px solid var(--border);
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    flex-shrink: 0;
}

.task-checkbox:hover {
    border-color: var(--primary);
}

.task-checkbox.checked {
    background: var(--success);
    border-color: var(--success);
    color: var(--white);
}

.task-content {
    flex: 1;
}

.task-title {
    font-size: 1rem;
    font-weight: 500;
    color: var(--dark);
    margin-bottom: 0.5rem;
}

.task-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: #64748b;
}

.task-meta span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.priority-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
}

.priority-low { background: #dcfce7; color: #166534; }
.priority-medium { background: #fef3c7; color: #92400e; }
.priority-high { background: #fee2e2; color: #991b1b; }

.task-actions {
    display: flex;
    gap: 0.5rem;
}

.task-actions button {
    background: none;
    border: none;
    padding: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.25rem;
    transition: all 0.3s;
}

.task-actions button:hover {
    background: var(--light);
}

.btn-delete:hover {
    background: #fee2e2;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 3rem;
    color: #94a3b8;
}

.empty-state.hidden {
    display: none;
}

.empty-icon {
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
}

.empty-state h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: var(--dark);
}

/* Footer */
.footer {
    text-align: center;
    padding: 1.5rem;
    background: var(--light);
    color: #64748b;
    font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 640px) {
    body {
        padding: 1rem;
    }
    
    .header {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
    }
    
    .form-row {
        flex-direction: column;
    }
    
    .filters-section {
        flex-direction: column;
        align-items: stretch;
    }
    
    .filter-group {
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .task-item {
        flex-wrap: wrap;
    }
    
    .task-actions {
        width: 100%;
        justify-content: flex-end;
        margin-top: 0.5rem;
    }
}`,

    "app.js": `// TaskMaster - Todo Application Logic
// Demonstrates: CRUD operations, local storage, filtering, event handling

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskCategory = document.getElementById('taskCategory');
const taskPriority = document.getElementById('taskPriority');
const taskDueDate = document.getElementById('taskDueDate');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const categoryFilter = document.getElementById('categoryFilter');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterBtns = document.querySelectorAll('.filter-btn');

// Stats elements
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let currentCategory = 'all';

// Category icons
const categoryIcons = {
    personal: '🏠',
    work: '💼',
    shopping: '🛒',
    health: '💪',
    study: '📚'
};

// Initialize
function init() {
    renderTasks();
    updateStats();
    setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
    taskForm.addEventListener('submit', handleAddTask);
    clearCompletedBtn.addEventListener('click', clearCompleted);
    categoryFilter.addEventListener('change', handleCategoryFilter);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
}

// Handle Add Task
function handleAddTask(e) {
    e.preventDefault();
    
    const task = {
        id: Date.now(),
        title: taskTitle.value.trim(),
        category: taskCategory.value,
        priority: taskPriority.value,
        dueDate: taskDueDate.value,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(task);
    saveTasks();
    renderTasks();
    updateStats();
    
    // Reset form
    taskForm.reset();
    taskTitle.focus();
}

// Toggle Task Completion
function toggleTask(id) {
    tasks = tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    renderTasks();
    updateStats();
}

// Delete Task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
}

// Clear Completed Tasks
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
    updateStats();
}

// Handle Filter Click
function handleFilterClick(e) {
    filterBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.dataset.filter;
    renderTasks();
}

// Handle Category Filter
function handleCategoryFilter(e) {
    currentCategory = e.target.value;
    renderTasks();
}

// Filter Tasks
function getFilteredTasks() {
    return tasks.filter(task => {
        const statusMatch = 
            currentFilter === 'all' ||
            (currentFilter === 'completed' && task.completed) ||
            (currentFilter === 'pending' && !task.completed);
        
        const categoryMatch = 
            currentCategory === 'all' || 
            task.category === currentCategory;
        
        return statusMatch && categoryMatch;
    });
}

// Render Tasks
function renderTasks() {
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    taskList.innerHTML = filteredTasks.map(task => \`
        <li class="task-item \${task.completed ? 'completed' : ''}" data-id="\${task.id}">
            <div class="task-checkbox \${task.completed ? 'checked' : ''}" onclick="toggleTask(\${task.id})">
                \${task.completed ? '✓' : ''}
            </div>
            <div class="task-content">
                <div class="task-title">\${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    <span>\${categoryIcons[task.category]} \${capitalize(task.category)}</span>
                    \${task.dueDate ? \`<span>📅 \${formatDate(task.dueDate)}</span>\` : ''}
                </div>
            </div>
            <span class="priority-badge priority-\${task.priority}">
                \${task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} 
                \${capitalize(task.priority)}
            </span>
            <div class="task-actions">
                <button class="btn-delete" onclick="deleteTask(\${task.id})" title="Delete">🗑️</button>
            </div>
        </li>
    \`).join('');
}

// Update Stats
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
}

// Save to Local Storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Initialize App
init();`,

    "README.md": `# ✅ TaskMaster - Todo Application

A full-featured task management application built with vanilla JavaScript.

## Features

- **Add Tasks**: Create tasks with title, category, priority, and due date
- **Categories**: Personal, Work, Shopping, Health, Study
- **Priorities**: Low, Medium, High with color coding
- **Due Dates**: Set deadlines for your tasks
- **Filtering**: Filter by status (All/Pending/Completed) and category
- **Local Storage**: Tasks persist across browser sessions
- **Statistics**: Real-time task count display
- **Responsive**: Works on all devices

## How to Use

1. Enter a task title in the input field
2. Select a category and priority
3. Optionally set a due date
4. Click "Add Task" to create the task
5. Click the checkbox to mark as complete
6. Use filters to view specific tasks
7. Click the trash icon to delete a task

## Technical Details

### Architecture

\`\`\`
┌─────────────────────────────────────┐
│         index.html (UI)             │
│  - Task form                        │
│  - Filter controls                  │
│  - Task list container              │
│  - Statistics display               │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│         app.js (Logic)              │
│  - CRUD operations                  │
│  - Event handling                   │
│  - State management                 │
│  - Local storage sync               │
│  - Filtering logic                  │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│      style.css (Styling)            │
│  - Modern UI design                 │
│  - Responsive layout                │
│  - Animations                       │
└─────────────────────────────────────┘
\`\`\`

### Code Concepts Demonstrated

1. **DOM Manipulation**: Creating, updating, and removing elements
2. **Event Handling**: Form submission, click events, change events
3. **Local Storage**: Persisting data across sessions
4. **Array Methods**: map, filter, find for data manipulation
5. **Template Literals**: Dynamic HTML generation
6. **State Management**: Centralized task state with render function
7. **Input Validation**: Sanitizing user input (XSS prevention)

### Data Structure

\`\`\`javascript
{
    id: 1234567890,        // Unique timestamp ID
    title: "Task name",    // Task description
    category: "work",      // Category type
    priority: "high",      // Priority level
    dueDate: "2024-12-31", // Optional due date
    completed: false,      // Completion status
    createdAt: "ISO date"  // Creation timestamp
}
\`\`\`

## Learning Opportunities

This project demonstrates:
- CRUD operations (Create, Read, Update, Delete)
- Local storage for data persistence
- Event-driven programming
- State management patterns
- Responsive CSS design
- Form handling and validation

## Future Enhancements

- Edit task functionality
- Drag and drop reordering
- Task search
- Dark mode toggle
- Export/Import tasks
- Subtasks support
- Notifications for due dates

---

**Built with DevMindX** - AI-Powered Development Platform

Perfect for learning JavaScript fundamentals and state management!`
  }
};
