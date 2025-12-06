// Simple E-commerce Store - HTML + CSS only (no JavaScript) for guaranteed preview compatibility

export const ecommerceSimpleProject = {
  name: "Modern E-commerce Store",
  framework: "web",
  description: "A modern, responsive e-commerce store with product catalog. HTML+CSS only for maximum preview compatibility.",
  
  files: {
    "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TechStore - Modern E-commerce</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="logo">
                <span class="logo-icon">🛒</span>
                <span>TechStore</span>
            </div>
            <nav class="nav">
                <a href="#" class="nav-link active">Home</a>
                <a href="#" class="nav-link">Products</a>
                <a href="#" class="nav-link">About</a>
                <a href="#" class="nav-link">Contact</a>
            </nav>
            <div class="header-actions">
                <button class="icon-btn">🔍</button>
                <button class="icon-btn cart-btn">
                    🛒
                    <span class="cart-count">3</span>
                </button>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <h1>Welcome to TechStore</h1>
                <p>Discover the latest tech products at amazing prices</p>
                <button class="btn btn-primary">Shop Now</button>
            </div>
        </div>
    </section>

    <!-- Filters -->
    <section class="filters">
        <div class="container">
            <div class="filter-group">
                <label>Category:</label>
                <select>
                    <option>All Products</option>
                    <option>Electronics</option>
                    <option>Accessories</option>
                    <option>Gadgets</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Sort by:</label>
                <select>
                    <option>Default</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Name: A to Z</option>
                </select>
            </div>
        </div>
    </section>

    <!-- Products Grid -->
    <section class="products">
        <div class="container">
            <h2>Featured Products</h2>
            <div class="products-grid">
                <!-- Product 1 -->
                <div class="product-card">
                    <div class="product-image">🎧</div>
                    <div class="product-info">
                        <div class="product-category">ELECTRONICS</div>
                        <div class="product-name">Wireless Headphones</div>
                        <div class="product-description">Premium noise-cancelling wireless headphones</div>
                        <div class="product-footer">
                            <div class="product-price">$79.99</div>
                            <button class="add-to-cart">Add to Cart</button>
                        </div>
                    </div>
                </div>

                <!-- Product 2 -->
                <div class="product-card">
                    <div class="product-image">⌚</div>
                    <div class="product-info">
                        <div class="product-category">GADGETS</div>
                        <div class="product-name">Smart Watch</div>
                        <div class="product-description">Fitness tracking smartwatch with heart rate monitor</div>
                        <div class="product-footer">
                            <div class="product-price">$199.99</div>
                            <button class="add-to-cart">Add to Cart</button>
                        </div>
                    </div>
                </div>

                <!-- Product 3 -->
                <div class="product-card">
                    <div class="product-image">💻</div>
                    <div class="product-info">
                        <div class="product-category">ACCESSORIES</div>
                        <div class="product-name">Laptop Stand</div>
                        <div class="product-description">Ergonomic aluminum laptop stand</div>
                        <div class="product-footer">
                            <div class="product-price">$49.99</div>
                            <button class="add-to-cart">Add to Cart</button>
                        </div>
                    </div>
                </div>

                <!-- Product 4 -->
                <div class="product-card">
                    <div class="product-image">🖱️</div>
                    <div class="product-info">
                        <div class="product-category">ACCESSORIES</div>
                        <div class="product-name">Wireless Mouse</div>
                        <div class="product-description">Ergonomic wireless mouse with precision tracking</div>
                        <div class="product-footer">
                            <div class="product-price">$29.99</div>
                            <button class="add-to-cart">Add to Cart</button>
                        </div>
                    </div>
                </div>

                <!-- Product 5 -->
                <div class="product-card">
                    <div class="product-image">🔌</div>
                    <div class="product-info">
                        <div class="product-category">ELECTRONICS</div>
                        <div class="product-name">USB-C Hub</div>
                        <div class="product-description">7-in-1 USB-C hub with HDMI and card reader</div>
                        <div class="product-footer">
                            <div class="product-price">$59.99</div>
                            <button class="add-to-cart">Add to Cart</button>
                        </div>
                    </div>
                </div>

                <!-- Product 6 -->
                <div class="product-card">
                    <div class="product-image">🔋</div>
                    <div class="product-info">
                        <div class="product-category">GADGETS</div>
                        <div class="product-name">Portable Charger</div>
                        <div class="product-description">20000mAh fast-charging power bank</div>
                        <div class="product-footer">
                            <div class="product-price">$39.99</div>
                            <button class="add-to-cart">Add to Cart</button>
                        </div>
                    </div>
                </div>

                <!-- Product 7 -->
                <div class="product-card">
                    <div class="product-image">🔊</div>
                    <div class="product-info">
                        <div class="product-category">ELECTRONICS</div>
                        <div class="product-name">Bluetooth Speaker</div>
                        <div class="product-description">Waterproof portable Bluetooth speaker</div>
                        <div class="product-footer">
                            <div class="product-price">$89.99</div>
                            <button class="add-to-cart">Add to Cart</button>
                        </div>
                    </div>
                </div>

                <!-- Product 8 -->
                <div class="product-card">
                    <div class="product-image">📱</div>
                    <div class="product-info">
                        <div class="product-category">ACCESSORIES</div>
                        <div class="product-name">Phone Case</div>
                        <div class="product-description">Protective silicone phone case</div>
                        <div class="product-footer">
                            <div class="product-price">$19.99</div>
                            <button class="add-to-cart">Add to Cart</button>
                        </div>
                    </div>
                </div>

                <!-- Product 9 -->
                <div class="product-card">
                    <div class="product-image">📹</div>
                    <div class="product-info">
                        <div class="product-category">ELECTRONICS</div>
                        <div class="product-name">Webcam HD</div>
                        <div class="product-description">1080p HD webcam with built-in microphone</div>
                        <div class="product-footer">
                            <div class="product-price">$69.99</div>
                            <button class="add-to-cart">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 TechStore. Built with DevMindX - AI-Powered Development Platform</p>
        </div>
    </footer>
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
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: var(--light);
    color: var(--dark);
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header */
.header {
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 20px;
}

.logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary);
}

.logo-icon {
    font-size: 2rem;
}

.nav {
    display: flex;
    gap: 2rem;
}

.nav-link {
    text-decoration: none;
    color: var(--dark);
    font-weight: 500;
    transition: color 0.3s;
}

.nav-link:hover,
.nav-link.active {
    color: var(--primary);
}

.header-actions {
    display: flex;
    gap: 1rem;
}

.icon-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    position: relative;
    padding: 0.5rem;
    transition: transform 0.3s;
}

.icon-btn:hover {
    transform: scale(1.1);
}

.cart-count {
    position: absolute;
    top: 0;
    right: 0;
    background: var(--danger);
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: bold;
}

/* Hero */
.hero {
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    color: white;
    padding: 4rem 0;
    text-align: center;
}

.hero-content h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.hero-content p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

/* Buttons */
.btn {
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-primary {
    background: white;
    color: var(--primary);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

/* Filters */
.filters {
    background: white;
    padding: 1.5rem 0;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.filters .container {
    display: flex;
    gap: 2rem;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.filter-group label {
    font-weight: 600;
}

.filter-group select {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
}

/* Products */
.products {
    padding: 3rem 0;
}

.products h2 {
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2rem;
    color: var(--dark);
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
}

.product-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: transform 0.3s, box-shadow 0.3s;
    cursor: pointer;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

.product-image {
    width: 100%;
    height: 200px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 5rem;
}

.product-info {
    padding: 1.5rem;
}

.product-category {
    color: var(--primary);
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.product-name {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--dark);
}

.product-description {
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 1rem;
}

.product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.product-price {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary);
}

.add-to-cart {
    background: var(--primary);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.3s;
}

.add-to-cart:hover {
    background: var(--secondary);
}

/* Footer */
.footer {
    background: var(--dark);
    color: white;
    text-align: center;
    padding: 2rem 0;
    margin-top: 4rem;
}

/* Responsive */
@media (max-width: 768px) {
    .nav {
        display: none;
    }
    
    .hero-content h1 {
        font-size: 2rem;
    }
    
    .filters .container {
        flex-direction: column;
        gap: 1rem;
    }
    
    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
}`,

    "README.md": `# 🛒 Modern E-commerce Store

A modern, responsive e-commerce store built with HTML and CSS only.

## Features

- **Product Catalog**: 9 tech products displayed in a grid
- **Category Badges**: Visual product categorization
- **Responsive Design**: Works on all devices
- **Modern UI**: Clean, professional interface with gradients
- **Hover Effects**: Interactive product cards
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

- Demonstrating UI/UX design
- Learning HTML/CSS
- Preview system compatibility
- Quick prototyping

---

**Built with DevMindX** - AI-Powered Development Platform

Perfect for showcasing e-commerce layouts!`
  }
};
