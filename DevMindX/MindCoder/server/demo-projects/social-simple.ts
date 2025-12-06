// Simple Social Media App - HTML + CSS only (no JavaScript) for guaranteed preview compatibility

export const socialSimpleProject = {
  name: "SocialHub - Social Media Platform",
  framework: "web",
  description: "A modern social media platform with posts and user profiles. HTML+CSS only for maximum preview compatibility.",
  
  files: {
    "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SocialHub - Connect with Friends</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="container">
            <div class="nav-brand">
                <span class="brand-icon">👥</span>
                <span>SocialHub</span>
            </div>
            <div class="nav-search">
                <span class="search-icon">🔍</span>
                <input type="text" placeholder="Search..." readonly>
            </div>
            <div class="nav-menu">
                <button class="nav-btn active">
                    <span>🏠</span>
                    <span>Home</span>
                </button>
                <button class="nav-btn">
                    <span>🔔</span>
                    <span>Notifications</span>
                    <span class="badge">3</span>
                </button>
                <button class="nav-btn">
                    <span>✉️</span>
                    <span>Messages</span>
                </button>
                <div class="nav-profile">
                    <div class="avatar">👤</div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <div class="main-container">
        <div class="container">
            <div class="layout">
                <!-- Sidebar -->
                <aside class="sidebar">
                    <div class="profile-card">
                        <div class="profile-header">
                            <div class="avatar large">👤</div>
                            <h3>John Doe</h3>
                            <p>@johndoe</p>
                        </div>
                        <div class="profile-stats">
                            <div class="stat">
                                <strong>256</strong>
                                <span>Posts</span>
                            </div>
                            <div class="stat">
                                <strong>1.2K</strong>
                                <span>Followers</span>
                            </div>
                            <div class="stat">
                                <strong>892</strong>
                                <span>Following</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="menu-card">
                        <h4>Menu</h4>
                        <a href="#" class="menu-item active">
                            <span>🏠</span>
                            <span>Feed</span>
                        </a>
                        <a href="#" class="menu-item">
                            <span>👥</span>
                            <span>Friends</span>
                        </a>
                        <a href="#" class="menu-item">
                            <span>🖼️</span>
                            <span>Photos</span>
                        </a>
                        <a href="#" class="menu-item">
                            <span>🎥</span>
                            <span>Videos</span>
                        </a>
                        <a href="#" class="menu-item">
                            <span>⚙️</span>
                            <span>Settings</span>
                        </a>
                    </div>
                </aside>

                <!-- Feed -->
                <main class="feed">
                    <!-- Create Post -->
                    <div class="create-post">
                        <div class="avatar">👤</div>
                        <input type="text" placeholder="What's on your mind?" readonly>
                        <button class="btn-post">📤</button>
                    </div>

                    <!-- Post 1 -->
                    <div class="post-card">
                        <div class="post-header">
                            <div class="avatar">👩</div>
                            <div class="post-user-info">
                                <strong>Alice Johnson</strong>
                                <span>@alicej</span>
                            </div>
                            <span class="post-time">3h ago</span>
                        </div>
                        <div class="post-content">
                            Just launched my new project! Check it out 🚀
                        </div>
                        <div class="post-image">🎨</div>
                        <div class="post-actions">
                            <button class="action-btn">
                                <span>❤️</span>
                                <span>42</span>
                            </button>
                            <button class="action-btn">
                                <span>💬</span>
                                <span>2</span>
                            </button>
                            <button class="action-btn">
                                <span>🔄</span>
                                <span>Share</span>
                            </button>
                        </div>
                    </div>

                    <!-- Post 2 -->
                    <div class="post-card">
                        <div class="post-header">
                            <div class="avatar">👨</div>
                            <div class="post-user-info">
                                <strong>David Smith</strong>
                                <span>@davids</span>
                            </div>
                            <span class="post-time">6h ago</span>
                        </div>
                        <div class="post-content">
                            Beautiful sunset today 🌅 #nature #photography
                        </div>
                        <div class="post-image">🌄</div>
                        <div class="post-actions">
                            <button class="action-btn">
                                <span>❤️</span>
                                <span>128</span>
                            </button>
                            <button class="action-btn">
                                <span>💬</span>
                                <span>1</span>
                            </button>
                            <button class="action-btn">
                                <span>🔄</span>
                                <span>Share</span>
                            </button>
                        </div>
                    </div>

                    <!-- Post 3 -->
                    <div class="post-card">
                        <div class="post-header">
                            <div class="avatar">👧</div>
                            <div class="post-user-info">
                                <strong>Emma Wilson</strong>
                                <span>@emmaw</span>
                            </div>
                            <span class="post-time">9h ago</span>
                        </div>
                        <div class="post-content">
                            Learning React today! Any tips? 💻 #webdev #react
                        </div>
                        <div class="post-image">💻</div>
                        <div class="post-actions">
                            <button class="action-btn">
                                <span>❤️</span>
                                <span>89</span>
                            </button>
                            <button class="action-btn">
                                <span>💬</span>
                                <span>2</span>
                            </button>
                            <button class="action-btn">
                                <span>🔄</span>
                                <span>Share</span>
                            </button>
                        </div>
                    </div>
                </main>

                <!-- Right Sidebar -->
                <aside class="widgets">
                    <div class="widget">
                        <h4>Trending Topics</h4>
                        <div class="trending-list">
                            <div class="trending-item">
                                <span class="trend-tag">#Technology</span>
                                <span class="trend-count">12.5K posts</span>
                            </div>
                            <div class="trending-item">
                                <span class="trend-tag">#WebDev</span>
                                <span class="trend-count">8.3K posts</span>
                            </div>
                            <div class="trending-item">
                                <span class="trend-tag">#AI</span>
                                <span class="trend-count">15.2K posts</span>
                            </div>
                            <div class="trending-item">
                                <span class="trend-tag">#DevMindX</span>
                                <span class="trend-count">5.1K posts</span>
                            </div>
                        </div>
                    </div>

                    <div class="widget">
                        <h4>Suggested Friends</h4>
                        <div class="suggestions-list">
                            <div class="suggestion-item">
                                <div class="avatar small">👩</div>
                                <div class="suggestion-info">
                                    <strong>Jane Smith</strong>
                                    <span>@janesmith</span>
                                </div>
                                <button class="btn-follow">Follow</button>
                            </div>
                            <div class="suggestion-item">
                                <div class="avatar small">👨</div>
                                <div class="suggestion-info">
                                    <strong>Mike Johnson</strong>
                                    <span>@mikej</span>
                                </div>
                                <button class="btn-follow">Follow</button>
                            </div>
                            <div class="suggestion-item">
                                <div class="avatar small">👧</div>
                                <div class="suggestion-info">
                                    <strong>Sarah Wilson</strong>
                                    <span>@sarahw</span>
                                </div>
                                <button class="btn-follow">Follow</button>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    </div>
</body>
</html>`,

    "style.css": `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary: #667eea;
    --secondary: #764ba2;
    --success: #4ade80;
    --danger: #ef4444;
    --dark: #1f2937;
    --light: #f9fafb;
    --border: #e5e7eb;
    --card-bg: white;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: var(--light);
    color: var(--dark);
    line-height: 1.6;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Navbar */
.navbar {
    background: var(--card-bg);
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 1rem 0;
}

.navbar .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary);
}

.brand-icon {
    font-size: 2rem;
}

.nav-search {
    flex: 1;
    max-width: 400px;
    margin: 0 2rem;
    position: relative;
}

.search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
}

.nav-search input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    border: 1px solid var(--border);
    border-radius: 25px;
    font-size: 1rem;
    background: var(--light);
}

.nav-menu {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.nav-btn {
    background: none;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    transition: background 0.3s;
    position: relative;
}

.nav-btn:hover,
.nav-btn.active {
    background: var(--light);
}

.badge {
    position: absolute;
    top: 5px;
    right: 5px;
    background: var(--danger);
    color: white;
    border-radius: 10px;
    padding: 2px 6px;
    font-size: 0.75rem;
    font-weight: bold;
}

.nav-profile {
    margin-left: 1rem;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    cursor: pointer;
}

.avatar.large {
    width: 80px;
    height: 80px;
    font-size: 3rem;
}

.avatar.small {
    width: 35px;
    height: 35px;
    font-size: 1.2rem;
}

/* Layout */
.main-container {
    padding: 2rem 0;
}

.layout {
    display: grid;
    grid-template-columns: 280px 1fr 320px;
    gap: 2rem;
}

/* Sidebar */
.sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.profile-card,
.menu-card,
.widget {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.profile-header {
    text-align: center;
}

.profile-header h3 {
    margin-top: 1rem;
    font-size: 1.25rem;
}

.profile-header p {
    color: #6b7280;
    font-size: 0.875rem;
}

.profile-stats {
    display: flex;
    justify-content: space-around;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
}

.stat {
    text-align: center;
}

.stat strong {
    display: block;
    font-size: 1.25rem;
    color: var(--primary);
}

.stat span {
    font-size: 0.875rem;
    color: #6b7280;
}

.menu-card h4,
.widget h4 {
    margin-bottom: 1rem;
    font-size: 1.1rem;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    text-decoration: none;
    color: var(--dark);
    transition: background 0.3s;
    margin-bottom: 0.5rem;
}

.menu-item:hover,
.menu-item.active {
    background: var(--light);
    color: var(--primary);
}

/* Feed */
.feed {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.create-post {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    display: flex;
    align-items: center;
    gap: 1rem;
}

.create-post input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border);
    border-radius: 25px;
    font-size: 1rem;
    background: var(--light);
}

.btn-post {
    background: var(--primary);
    color: white;
    border: none;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: background 0.3s;
}

.btn-post:hover {
    background: var(--secondary);
}

/* Post Card */
.post-card {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.post-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.post-user-info {
    flex: 1;
}

.post-user-info strong {
    display: block;
    font-size: 1rem;
}

.post-user-info span {
    color: #6b7280;
    font-size: 0.875rem;
}

.post-time {
    color: #9ca3af;
    font-size: 0.875rem;
}

.post-content {
    margin-bottom: 1rem;
    line-height: 1.6;
}

.post-image {
    width: 100%;
    height: 300px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border-radius: 8px;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 6rem;
}

.post-actions {
    display: flex;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
}

.action-btn {
    flex: 1;
    background: none;
    border: none;
    padding: 0.75rem;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 1rem;
    color: #6b7280;
    transition: all 0.3s;
}

.action-btn:hover {
    background: var(--light);
}

/* Widgets */
.widgets {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.trending-list,
.suggestions-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.trending-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.trend-tag {
    color: var(--primary);
    font-weight: 600;
}

.trend-count {
    color: #9ca3af;
    font-size: 0.875rem;
}

.suggestion-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.suggestion-info {
    flex: 1;
}

.suggestion-info strong {
    display: block;
    font-size: 0.875rem;
}

.suggestion-info span {
    color: #9ca3af;
    font-size: 0.75rem;
}

.btn-follow {
    background: var(--primary);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;
    transition: background 0.3s;
}

.btn-follow:hover {
    background: var(--secondary);
}

/* Responsive */
@media (max-width: 1200px) {
    .layout {
        grid-template-columns: 250px 1fr;
    }
    
    .widgets {
        display: none;
    }
}

@media (max-width: 768px) {
    .layout {
        grid-template-columns: 1fr;
    }
    
    .sidebar {
        display: none;
    }
    
    .nav-search {
        display: none;
    }
    
    .nav-btn span:nth-child(2) {
        display: none;
    }
}`,

    "README.md": `# 📱 SocialHub - Social Media Platform

A modern, interactive social media platform built with HTML and CSS only.

## Features

- **User Profile**: Profile card with stats
- **Post Feed**: 3 sample posts with likes and comments
- **Trending Topics**: Popular hashtags
- **Friend Suggestions**: Discover new connections
- **Responsive Design**: Works on all devices
- **Modern UI**: Clean, professional interface
- **No JavaScript**: Pure HTML+CSS for maximum compatibility

## Preview Compatibility

This version uses only HTML and CSS (no JavaScript) to ensure it works perfectly in any preview system including CodeSandbox.

## How to Use

Simply open index.html in any browser - it works standalone!

## Technical Details

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Grid and Flexbox
- **Responsive**: Mobile-first design
- **No Dependencies**: Pure HTML+CSS

## Perfect For

- Demonstrating social media UI/UX
- Learning HTML/CSS layouts
- Preview system compatibility
- Quick prototyping

---

**Built with DevMindX** - AI-Powered Development Platform

Perfect for showcasing social media layouts!`
  }
};
