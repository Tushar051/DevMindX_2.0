// Todo App - Simple HTML+CSS version for instant preview
// No JavaScript for maximum compatibility

export const todoAppProject = {
  name: "TaskMaster - Todo Application",
  framework: "web",
  description: "A beautiful task management application with categories and priorities. HTML+CSS only for instant preview.",
  
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
        <header class="header">
            <div class="logo">
                <span class="logo-icon">✅</span>
                <h1>TaskMaster</h1>
            </div>
            <div class="header-stats">
                <div class="stat">
                    <span class="stat-value">8</span>
                    <span class="stat-label">Total</span>
                </div>
                <div class="stat">
                    <span class="stat-value">3</span>
                    <span class="stat-label">Done</span>
                </div>
                <div class="stat">
                    <span class="stat-value">5</span>
                    <span class="stat-label">Pending</span>
                </div>
            </div>
        </header>

        <main class="main-content">
            <section class="add-task-section">
                <h2>➕ Add New Task</h2>
                <div class="task-form">
                    <input type="text" placeholder="What needs to be done?" class="task-input">
                    <select class="task-select">
                        <option>🏠 Personal</option>
                        <option>💼 Work</option>
                        <option>🛒 Shopping</option>
                    </select>
                    <button class="btn-add">Add Task</button>
                </div>
            </section>

            <section class="filters-section">
                <div class="filter-group">
                    <button class="filter-btn active">All</button>
                    <button class="filter-btn">Pending</button>
                    <button class="filter-btn">Completed</button>
                </div>
            </section>

            <section class="tasks-section">
                <ul class="task-list">
                    <li class="task-item completed">
                        <div class="task-checkbox checked">✓</div>
                        <div class="task-content">
                            <div class="task-title">Complete project documentation</div>
                            <div class="task-meta">
                                <span>💼 Work</span>
                                <span>📅 Jan 2</span>
                            </div>
                        </div>
                        <span class="priority-badge priority-high">🔴 High</span>
                    </li>

                    <li class="task-item">
                        <div class="task-checkbox"></div>
                        <div class="task-content">
                            <div class="task-title">Review pull requests</div>
                            <div class="task-meta">
                                <span>💼 Work</span>
                                <span>📅 Jan 3</span>
                            </div>
                        </div>
                        <span class="priority-badge priority-high">🔴 High</span>
                    </li>

                    <li class="task-item completed">
                        <div class="task-checkbox checked">✓</div>
                        <div class="task-content">
                            <div class="task-title">Buy groceries</div>
                            <div class="task-meta">
                                <span>🛒 Shopping</span>
                                <span>📅 Jan 1</span>
                            </div>
                        </div>
                        <span class="priority-badge priority-medium">🟡 Medium</span>
                    </li>

                    <li class="task-item">
                        <div class="task-checkbox"></div>
                        <div class="task-content">
                            <div class="task-title">Schedule dentist appointment</div>
                            <div class="task-meta">
                                <span>🏠 Personal</span>
                                <span>📅 Jan 5</span>
                            </div>
                        </div>
                        <span class="priority-badge priority-low">🟢 Low</span>
                    </li>

                    <li class="task-item">
                        <div class="task-checkbox"></div>
                        <div class="task-content">
                            <div class="task-title">Learn React hooks</div>
                            <div class="task-meta">
                                <span>📚 Study</span>
                                <span>📅 Jan 7</span>
                            </div>
                        </div>
                        <span class="priority-badge priority-medium">🟡 Medium</span>
                    </li>

                    <li class="task-item completed">
                        <div class="task-checkbox checked">✓</div>
                        <div class="task-content">
                            <div class="task-title">Morning workout</div>
                            <div class="task-meta">
                                <span>💪 Health</span>
                                <span>📅 Today</span>
                            </div>
                        </div>
                        <span class="priority-badge priority-high">🔴 High</span>
                    </li>

                    <li class="task-item">
                        <div class="task-checkbox"></div>
                        <div class="task-content">
                            <div class="task-title">Call mom</div>
                            <div class="task-meta">
                                <span>🏠 Personal</span>
                                <span>📅 Jan 4</span>
                            </div>
                        </div>
                        <span class="priority-badge priority-medium">🟡 Medium</span>
                    </li>

                    <li class="task-item">
                        <div class="task-checkbox"></div>
                        <div class="task-content">
                            <div class="task-title">Prepare presentation slides</div>
                            <div class="task-meta">
                                <span>💼 Work</span>
                                <span>📅 Jan 6</span>
                            </div>
                        </div>
                        <span class="priority-badge priority-high">🔴 High</span>
                    </li>
                </ul>
            </section>
        </main>

        <footer class="footer">
            <p>Built with ❤️ using DevMindX - AI-Powered Development Platform</p>
        </footer>
    </div>
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
}

body {
    font-family: 'Segoe UI', system-ui, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 2rem;
}

.app-container {
    max-width: 800px;
    margin: 0 auto;
    background: var(--white);
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    overflow: hidden;
}

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

.logo-icon { font-size: 2.5rem; }
.logo h1 { font-size: 1.75rem; }

.header-stats {
    display: flex;
    gap: 2rem;
}

.stat { text-align: center; }
.stat-value { display: block; font-size: 2rem; font-weight: 700; }
.stat-label { font-size: 0.875rem; opacity: 0.9; }

.main-content { padding: 2rem; }

.add-task-section { margin-bottom: 2rem; }
.add-task-section h2 { color: var(--dark); margin-bottom: 1rem; }

.task-form {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.task-input {
    flex: 2;
    min-width: 200px;
    padding: 0.875rem 1rem;
    border: 2px solid var(--border);
    border-radius: 10px;
    font-size: 1rem;
}

.task-select {
    flex: 1;
    min-width: 150px;
    padding: 0.875rem 1rem;
    border: 2px solid var(--border);
    border-radius: 10px;
    font-size: 1rem;
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
    transition: all 0.3s;
}

.btn-add:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
}

.filters-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid var(--border);
}

.filter-group { display: flex; gap: 0.5rem; }

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

.filter-btn:hover { background: var(--border); }
.filter-btn.active { background: var(--primary); color: var(--white); }

.task-list { list-style: none; }

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
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.task-item.completed { opacity: 0.7; background: var(--light); }
.task-item.completed .task-title { text-decoration: line-through; color: #94a3b8; }

.task-checkbox {
    width: 24px;
    height: 24px;
    border: 2px solid var(--border);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-weight: bold;
}

.task-checkbox.checked {
    background: var(--success);
    border-color: var(--success);
    color: var(--white);
}

.task-content { flex: 1; }
.task-title { font-size: 1rem; font-weight: 500; color: var(--dark); margin-bottom: 0.5rem; }
.task-meta { display: flex; gap: 1rem; font-size: 0.75rem; color: #64748b; }

.priority-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    flex-shrink: 0;
}

.priority-low { background: #dcfce7; color: #166534; }
.priority-medium { background: #fef3c7; color: #92400e; }
.priority-high { background: #fee2e2; color: #991b1b; }

.footer {
    text-align: center;
    padding: 1.5rem;
    background: var(--light);
    color: #64748b;
}

@media (max-width: 640px) {
    body { padding: 1rem; }
    .header { flex-direction: column; gap: 1.5rem; text-align: center; }
    .task-form { flex-direction: column; }
    .task-item { flex-wrap: wrap; }
}`,

    "README.md": `# ✅ TaskMaster - Todo Application

A beautiful task management application built with HTML and CSS.

## Features
- Task list with categories
- Priority badges (High/Medium/Low)
- Completion status
- Filter buttons
- Responsive design

## Demo Data
- 8 sample tasks
- 3 completed, 5 pending
- Multiple categories

Built with DevMindX - AI-Powered Development Platform`
  }
};
