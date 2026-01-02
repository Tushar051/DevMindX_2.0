// Weather Dashboard - Interactive weather application
// Demonstrates: API simulation, dynamic UI, animations, and data visualization

export const weatherDashboardProject = {
  name: "WeatherNow - Weather Dashboard",
  framework: "web",
  description: "An interactive weather dashboard with current conditions, forecasts, and beautiful animations. Demonstrates API handling, dynamic UI updates, and data visualization.",
  
  files: {
    "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WeatherNow - Weather Dashboard</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="app">
        <!-- Search Section -->
        <header class="search-section">
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input type="text" id="cityInput" placeholder="Search city..." value="New York">
                <button id="searchBtn" class="search-btn">Search</button>
            </div>
            <div class="quick-cities">
                <button class="city-btn" data-city="New York">New York</button>
                <button class="city-btn" data-city="London">London</button>
                <button class="city-btn" data-city="Tokyo">Tokyo</button>
                <button class="city-btn" data-city="Paris">Paris</button>
                <button class="city-btn" data-city="Sydney">Sydney</button>
            </div>
        </header>

        <!-- Main Weather Display -->
        <main class="weather-main">
            <!-- Current Weather -->
            <section class="current-weather">
                <div class="weather-icon-large" id="weatherIcon">☀️</div>
                <div class="weather-info">
                    <h1 class="city-name" id="cityName">New York</h1>
                    <p class="weather-date" id="weatherDate">Loading...</p>
                    <div class="temperature">
                        <span class="temp-value" id="temperature">--</span>
                        <span class="temp-unit">°C</span>
                    </div>
                    <p class="weather-desc" id="weatherDesc">Loading...</p>
                </div>
            </section>

            <!-- Weather Details -->
            <section class="weather-details">
                <div class="detail-card">
                    <span class="detail-icon">💨</span>
                    <div class="detail-info">
                        <span class="detail-value" id="windSpeed">--</span>
                        <span class="detail-label">Wind Speed</span>
                    </div>
                </div>
                <div class="detail-card">
                    <span class="detail-icon">💧</span>
                    <div class="detail-info">
                        <span class="detail-value" id="humidity">--</span>
                        <span class="detail-label">Humidity</span>
                    </div>
                </div>
                <div class="detail-card">
                    <span class="detail-icon">🌡️</span>
                    <div class="detail-info">
                        <span class="detail-value" id="feelsLike">--</span>
                        <span class="detail-label">Feels Like</span>
                    </div>
                </div>
                <div class="detail-card">
                    <span class="detail-icon">👁️</span>
                    <div class="detail-info">
                        <span class="detail-value" id="visibility">--</span>
                        <span class="detail-label">Visibility</span>
                    </div>
                </div>
            </section>
        </main>

        <!-- 5-Day Forecast -->
        <section class="forecast-section">
            <h2>5-Day Forecast</h2>
            <div class="forecast-grid" id="forecastGrid">
                <!-- Forecast cards will be rendered here -->
            </div>
        </section>

        <!-- Hourly Forecast -->
        <section class="hourly-section">
            <h2>Today's Hourly Forecast</h2>
            <div class="hourly-scroll" id="hourlyScroll">
                <!-- Hourly cards will be rendered here -->
            </div>
        </section>

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
    --secondary: #8b5cf6;
    --accent: #f59e0b;
    --dark: #1e293b;
    --light: #f8fafc;
    --white: #ffffff;
    --glass: rgba(255, 255, 255, 0.1);
    --glass-border: rgba(255, 255, 255, 0.2);
}

body {
    font-family: 'Segoe UI', system-ui, sans-serif;
    background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 50%, #db2777 100%);
    min-height: 100vh;
    color: var(--white);
}

.app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

/* Search Section */
.search-section {
    margin-bottom: 2rem;
}

.search-box {
    display: flex;
    align-items: center;
    background: var(--glass);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-radius: 50px;
    padding: 0.5rem 1rem;
    margin-bottom: 1rem;
}

.search-icon {
    font-size: 1.25rem;
    margin-right: 0.75rem;
}

.search-box input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--white);
    font-size: 1rem;
    padding: 0.75rem;
    outline: none;
}

.search-box input::placeholder {
    color: rgba(255, 255, 255, 0.6);
}

.search-btn {
    background: var(--white);
    color: var(--primary);
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.search-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.quick-cities {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: center;
}

.city-btn {
    background: var(--glass);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    color: var(--white);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 0.875rem;
}

.city-btn:hover {
    background: var(--white);
    color: var(--primary);
}

/* Current Weather */
.weather-main {
    display: grid;
    gap: 2rem;
}

.current-weather {
    background: var(--glass);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 30px;
    padding: 3rem;
    display: flex;
    align-items: center;
    gap: 3rem;
    justify-content: center;
}

.weather-icon-large {
    font-size: 8rem;
    animation: float 3s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.weather-info {
    text-align: left;
}

.city-name {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.weather-date {
    opacity: 0.8;
    margin-bottom: 1rem;
}

.temperature {
    display: flex;
    align-items: flex-start;
}

.temp-value {
    font-size: 5rem;
    font-weight: 700;
    line-height: 1;
}

.temp-unit {
    font-size: 2rem;
    margin-top: 0.5rem;
}

.weather-desc {
    font-size: 1.25rem;
    opacity: 0.9;
    margin-top: 0.5rem;
    text-transform: capitalize;
}

/* Weather Details */
.weather-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.detail-card {
    background: var(--glass);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.3s;
}

.detail-card:hover {
    transform: translateY(-5px);
}

.detail-icon {
    font-size: 2.5rem;
}

.detail-info {
    display: flex;
    flex-direction: column;
}

.detail-value {
    font-size: 1.5rem;
    font-weight: 700;
}

.detail-label {
    font-size: 0.875rem;
    opacity: 0.8;
}

/* Forecast Section */
.forecast-section, .hourly-section {
    margin-top: 2rem;
}

.forecast-section h2, .hourly-section h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    padding-left: 0.5rem;
}

.forecast-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
}

.forecast-card {
    background: var(--glass);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 1.5rem;
    text-align: center;
    transition: transform 0.3s;
}

.forecast-card:hover {
    transform: translateY(-5px);
}

.forecast-day {
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.forecast-icon {
    font-size: 3rem;
    margin: 0.5rem 0;
}

.forecast-temp {
    font-size: 1.25rem;
    font-weight: 700;
}

.forecast-temp-low {
    font-size: 0.875rem;
    opacity: 0.7;
}

/* Hourly Section */
.hourly-scroll {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding-bottom: 1rem;
    scrollbar-width: thin;
    scrollbar-color: var(--glass-border) transparent;
}

.hourly-scroll::-webkit-scrollbar {
    height: 6px;
}

.hourly-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.hourly-scroll::-webkit-scrollbar-thumb {
    background: var(--glass-border);
    border-radius: 3px;
}

.hourly-card {
    background: var(--glass);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-radius: 15px;
    padding: 1rem 1.5rem;
    text-align: center;
    flex-shrink: 0;
    min-width: 100px;
    transition: transform 0.3s;
}

.hourly-card:hover {
    transform: scale(1.05);
}

.hourly-time {
    font-size: 0.875rem;
    opacity: 0.8;
    margin-bottom: 0.5rem;
}

.hourly-icon {
    font-size: 2rem;
    margin: 0.5rem 0;
}

.hourly-temp {
    font-weight: 700;
}

/* Footer */
.footer {
    text-align: center;
    padding: 2rem;
    margin-top: 2rem;
    opacity: 0.8;
    font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
    .app {
        padding: 1rem;
    }
    
    .current-weather {
        flex-direction: column;
        text-align: center;
        padding: 2rem;
    }
    
    .weather-info {
        text-align: center;
    }
    
    .weather-icon-large {
        font-size: 5rem;
    }
    
    .temp-value {
        font-size: 4rem;
    }
    
    .city-name {
        font-size: 2rem;
    }
}`,

    "app.js": `// WeatherNow - Weather Dashboard Application
// Demonstrates: API simulation, dynamic UI, state management

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const cityBtns = document.querySelectorAll('.city-btn');

// Display Elements
const cityNameEl = document.getElementById('cityName');
const weatherDateEl = document.getElementById('weatherDate');
const temperatureEl = document.getElementById('temperature');
const weatherDescEl = document.getElementById('weatherDesc');
const weatherIconEl = document.getElementById('weatherIcon');
const windSpeedEl = document.getElementById('windSpeed');
const humidityEl = document.getElementById('humidity');
const feelsLikeEl = document.getElementById('feelsLike');
const visibilityEl = document.getElementById('visibility');
const forecastGrid = document.getElementById('forecastGrid');
const hourlyScroll = document.getElementById('hourlyScroll');

// Simulated Weather Data (In real app, this would come from API)
const weatherData = {
    'New York': {
        temp: 22, feelsLike: 24, humidity: 65, wind: 12, visibility: 10,
        desc: 'Partly Cloudy', icon: '⛅',
        forecast: [
            { day: 'Mon', icon: '☀️', high: 24, low: 18 },
            { day: 'Tue', icon: '⛅', high: 22, low: 16 },
            { day: 'Wed', icon: '🌧️', high: 19, low: 14 },
            { day: 'Thu', icon: '⛅', high: 21, low: 15 },
            { day: 'Fri', icon: '☀️', high: 25, low: 19 }
        ],
        hourly: [
            { time: '9AM', icon: '☀️', temp: 20 },
            { time: '12PM', icon: '☀️', temp: 24 },
            { time: '3PM', icon: '⛅', temp: 22 },
            { time: '6PM', icon: '⛅', temp: 20 },
            { time: '9PM', icon: '🌙', temp: 18 },
            { time: '12AM', icon: '🌙', temp: 16 }
        ]
    },
    'London': {
        temp: 15, feelsLike: 13, humidity: 78, wind: 18, visibility: 8,
        desc: 'Light Rain', icon: '🌧️',
        forecast: [
            { day: 'Mon', icon: '🌧️', high: 16, low: 11 },
            { day: 'Tue', icon: '🌧️', high: 14, low: 10 },
            { day: 'Wed', icon: '⛅', high: 17, low: 12 },
            { day: 'Thu', icon: '☀️', high: 19, low: 13 },
            { day: 'Fri', icon: '⛅', high: 18, low: 12 }
        ],
        hourly: [
            { time: '9AM', icon: '🌧️', temp: 14 },
            { time: '12PM', icon: '🌧️', temp: 15 },
            { time: '3PM', icon: '⛅', temp: 16 },
            { time: '6PM', icon: '⛅', temp: 15 },
            { time: '9PM', icon: '🌙', temp: 13 },
            { time: '12AM', icon: '🌙', temp: 11 }
        ]
    },
    'Tokyo': {
        temp: 28, feelsLike: 32, humidity: 72, wind: 8, visibility: 12,
        desc: 'Sunny', icon: '☀️',
        forecast: [
            { day: 'Mon', icon: '☀️', high: 30, low: 24 },
            { day: 'Tue', icon: '☀️', high: 31, low: 25 },
            { day: 'Wed', icon: '⛅', high: 29, low: 23 },
            { day: 'Thu', icon: '🌧️', high: 26, low: 22 },
            { day: 'Fri', icon: '⛅', high: 28, low: 23 }
        ],
        hourly: [
            { time: '9AM', icon: '☀️', temp: 26 },
            { time: '12PM', icon: '☀️', temp: 30 },
            { time: '3PM', icon: '☀️', temp: 31 },
            { time: '6PM', icon: '⛅', temp: 28 },
            { time: '9PM', icon: '🌙', temp: 25 },
            { time: '12AM', icon: '🌙', temp: 23 }
        ]
    },
    'Paris': {
        temp: 18, feelsLike: 17, humidity: 60, wind: 14, visibility: 11,
        desc: 'Cloudy', icon: '☁️',
        forecast: [
            { day: 'Mon', icon: '☁️', high: 19, low: 13 },
            { day: 'Tue', icon: '⛅', high: 21, low: 14 },
            { day: 'Wed', icon: '☀️', high: 23, low: 16 },
            { day: 'Thu', icon: '☀️', high: 24, low: 17 },
            { day: 'Fri', icon: '⛅', high: 22, low: 15 }
        ],
        hourly: [
            { time: '9AM', icon: '☁️', temp: 16 },
            { time: '12PM', icon: '☁️', temp: 18 },
            { time: '3PM', icon: '⛅', temp: 19 },
            { time: '6PM', icon: '⛅', temp: 18 },
            { time: '9PM', icon: '🌙', temp: 15 },
            { time: '12AM', icon: '🌙', temp: 13 }
        ]
    },
    'Sydney': {
        temp: 25, feelsLike: 26, humidity: 55, wind: 20, visibility: 15,
        desc: 'Clear Sky', icon: '☀️',
        forecast: [
            { day: 'Mon', icon: '☀️', high: 27, low: 20 },
            { day: 'Tue', icon: '☀️', high: 28, low: 21 },
            { day: 'Wed', icon: '⛅', high: 26, low: 19 },
            { day: 'Thu', icon: '⛅', high: 25, low: 18 },
            { day: 'Fri', icon: '☀️', high: 27, low: 20 }
        ],
        hourly: [
            { time: '9AM', icon: '☀️', temp: 23 },
            { time: '12PM', icon: '☀️', temp: 26 },
            { time: '3PM', icon: '☀️', temp: 27 },
            { time: '6PM', icon: '⛅', temp: 25 },
            { time: '9PM', icon: '🌙', temp: 22 },
            { time: '12AM', icon: '🌙', temp: 20 }
        ]
    }
};

// Initialize
function init() {
    updateWeather('New York');
    setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    cityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            updateWeather(btn.dataset.city);
            cityInput.value = btn.dataset.city;
        });
    });
}

// Handle Search
function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        updateWeather(city);
    }
}

// Update Weather Display
function updateWeather(city) {
    const data = weatherData[city] || weatherData['New York'];
    
    // Update current weather
    cityNameEl.textContent = city;
    weatherDateEl.textContent = formatDate(new Date());
    temperatureEl.textContent = data.temp;
    weatherDescEl.textContent = data.desc;
    weatherIconEl.textContent = data.icon;
    
    // Update details
    windSpeedEl.textContent = data.wind + ' km/h';
    humidityEl.textContent = data.humidity + '%';
    feelsLikeEl.textContent = data.feelsLike + '°C';
    visibilityEl.textContent = data.visibility + ' km';
    
    // Update forecast
    renderForecast(data.forecast);
    
    // Update hourly
    renderHourly(data.hourly);
    
    // Add animation
    document.querySelector('.current-weather').style.animation = 'none';
    setTimeout(() => {
        document.querySelector('.current-weather').style.animation = '';
    }, 10);
}

// Render 5-Day Forecast
function renderForecast(forecast) {
    forecastGrid.innerHTML = forecast.map(day => \`
        <div class="forecast-card">
            <div class="forecast-day">\${day.day}</div>
            <div class="forecast-icon">\${day.icon}</div>
            <div class="forecast-temp">\${day.high}°</div>
            <div class="forecast-temp-low">\${day.low}°</div>
        </div>
    \`).join('');
}

// Render Hourly Forecast
function renderHourly(hourly) {
    hourlyScroll.innerHTML = hourly.map(hour => \`
        <div class="hourly-card">
            <div class="hourly-time">\${hour.time}</div>
            <div class="hourly-icon">\${hour.icon}</div>
            <div class="hourly-temp">\${hour.temp}°</div>
        </div>
    \`).join('');
}

// Format Date
function formatDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
}

// Initialize App
init();`,

    "README.md": `# 🌤️ WeatherNow - Weather Dashboard

An interactive weather dashboard with beautiful glassmorphism design.

## Features

- **Current Weather**: Temperature, description, and weather icon
- **Weather Details**: Wind speed, humidity, feels like, visibility
- **5-Day Forecast**: Daily weather predictions
- **Hourly Forecast**: Hour-by-hour weather for today
- **City Search**: Search any city or use quick buttons
- **Responsive Design**: Works on all devices
- **Beautiful UI**: Glassmorphism design with animations

## How to Use

1. Enter a city name in the search box
2. Click "Search" or press Enter
3. Or click any quick city button
4. View current weather and forecasts

## Supported Cities (Demo)

- New York
- London
- Tokyo
- Paris
- Sydney

## Technical Details

### Architecture

\\\`\\\`\\\`
┌─────────────────────────────────────┐
│         index.html (UI)             │
│  - Search interface                 │
│  - Weather display cards            │
│  - Forecast grids                   │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│         app.js (Logic)              │
│  - Weather data simulation          │
│  - DOM manipulation                 │
│  - Event handling                   │
│  - Dynamic rendering                │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│      style.css (Styling)            │
│  - Glassmorphism design             │
│  - CSS animations                   │
│  - Responsive layout                │
└─────────────────────────────────────┘
\\\`\\\`\\\`

### Code Concepts Demonstrated

1. **DOM Manipulation**: Dynamic content updates
2. **Event Handling**: Search, click, keyboard events
3. **Data Structures**: Weather data objects
4. **Template Literals**: Dynamic HTML generation
5. **CSS Animations**: Floating icons, hover effects
6. **Glassmorphism**: Modern UI design technique
7. **Responsive Design**: Mobile-first approach

### Data Structure

\\\`\\\`\\\`javascript
{
    temp: 22,           // Current temperature
    feelsLike: 24,      // Feels like temperature
    humidity: 65,       // Humidity percentage
    wind: 12,           // Wind speed km/h
    visibility: 10,     // Visibility km
    desc: 'Partly Cloudy',
    icon: '⛅',
    forecast: [...],    // 5-day forecast array
    hourly: [...]       // Hourly forecast array
}
\\\`\\\`\\\`

## Learning Opportunities

This project demonstrates:
- API data handling patterns
- Dynamic UI updates
- Modern CSS techniques (glassmorphism)
- Responsive design principles
- Event-driven programming
- Data visualization

## Future Enhancements

- Real weather API integration
- Geolocation support
- Weather maps
- Severe weather alerts
- Multiple unit systems (°C/°F)
- Weather history charts
- Dark/Light theme toggle

---

**Built with DevMindX** - AI-Powered Development Platform

Perfect for learning API handling and modern UI design!`
  }
};
