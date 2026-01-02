// Weather Dashboard - Simple HTML+CSS version for instant preview
// No JavaScript for maximum compatibility with CodeSandbox

export const weatherDashboardProject = {
  name: "WeatherNow - Weather Dashboard",
  framework: "web",
  description: "A beautiful weather dashboard with current conditions and forecasts. HTML+CSS only for instant preview.",
  
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
        <header class="search-section">
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input type="text" placeholder="Search city..." value="New York" readonly>
                <button class="search-btn">Search</button>
            </div>
            <div class="quick-cities">
                <button class="city-btn active">New York</button>
                <button class="city-btn">London</button>
                <button class="city-btn">Tokyo</button>
                <button class="city-btn">Paris</button>
                <button class="city-btn">Sydney</button>
            </div>
        </header>

        <main class="weather-main">
            <section class="current-weather">
                <div class="weather-icon-large">⛅</div>
                <div class="weather-info">
                    <h1 class="city-name">New York</h1>
                    <p class="weather-date">Friday, January 2, 2026</p>
                    <div class="temperature">
                        <span class="temp-value">22</span>
                        <span class="temp-unit">°C</span>
                    </div>
                    <p class="weather-desc">Partly Cloudy</p>
                </div>
            </section>

            <section class="weather-details">
                <div class="detail-card">
                    <span class="detail-icon">💨</span>
                    <div class="detail-info">
                        <span class="detail-value">12 km/h</span>
                        <span class="detail-label">Wind Speed</span>
                    </div>
                </div>
                <div class="detail-card">
                    <span class="detail-icon">💧</span>
                    <div class="detail-info">
                        <span class="detail-value">65%</span>
                        <span class="detail-label">Humidity</span>
                    </div>
                </div>
                <div class="detail-card">
                    <span class="detail-icon">🌡️</span>
                    <div class="detail-info">
                        <span class="detail-value">24°C</span>
                        <span class="detail-label">Feels Like</span>
                    </div>
                </div>
                <div class="detail-card">
                    <span class="detail-icon">👁️</span>
                    <div class="detail-info">
                        <span class="detail-value">10 km</span>
                        <span class="detail-label">Visibility</span>
                    </div>
                </div>
            </section>
        </main>

        <section class="forecast-section">
            <h2>5-Day Forecast</h2>
            <div class="forecast-grid">
                <div class="forecast-card">
                    <div class="forecast-day">Mon</div>
                    <div class="forecast-icon">☀️</div>
                    <div class="forecast-temp">24°</div>
                    <div class="forecast-temp-low">18°</div>
                </div>
                <div class="forecast-card">
                    <div class="forecast-day">Tue</div>
                    <div class="forecast-icon">⛅</div>
                    <div class="forecast-temp">22°</div>
                    <div class="forecast-temp-low">16°</div>
                </div>
                <div class="forecast-card">
                    <div class="forecast-day">Wed</div>
                    <div class="forecast-icon">🌧️</div>
                    <div class="forecast-temp">19°</div>
                    <div class="forecast-temp-low">14°</div>
                </div>
                <div class="forecast-card">
                    <div class="forecast-day">Thu</div>
                    <div class="forecast-icon">⛅</div>
                    <div class="forecast-temp">21°</div>
                    <div class="forecast-temp-low">15°</div>
                </div>
                <div class="forecast-card">
                    <div class="forecast-day">Fri</div>
                    <div class="forecast-icon">☀️</div>
                    <div class="forecast-temp">25°</div>
                    <div class="forecast-temp-low">19°</div>
                </div>
            </div>
        </section>

        <section class="hourly-section">
            <h2>Today's Hourly Forecast</h2>
            <div class="hourly-scroll">
                <div class="hourly-card">
                    <div class="hourly-time">9AM</div>
                    <div class="hourly-icon">☀️</div>
                    <div class="hourly-temp">20°</div>
                </div>
                <div class="hourly-card">
                    <div class="hourly-time">12PM</div>
                    <div class="hourly-icon">☀️</div>
                    <div class="hourly-temp">24°</div>
                </div>
                <div class="hourly-card">
                    <div class="hourly-time">3PM</div>
                    <div class="hourly-icon">⛅</div>
                    <div class="hourly-temp">22°</div>
                </div>
                <div class="hourly-card">
                    <div class="hourly-time">6PM</div>
                    <div class="hourly-icon">⛅</div>
                    <div class="hourly-temp">20°</div>
                </div>
                <div class="hourly-card">
                    <div class="hourly-time">9PM</div>
                    <div class="hourly-icon">🌙</div>
                    <div class="hourly-temp">18°</div>
                </div>
                <div class="hourly-card">
                    <div class="hourly-time">12AM</div>
                    <div class="hourly-icon">🌙</div>
                    <div class="hourly-temp">16°</div>
                </div>
            </div>
        </section>

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

body {
    font-family: 'Segoe UI', system-ui, sans-serif;
    background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 50%, #db2777 100%);
    min-height: 100vh;
    color: #ffffff;
}

.app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.search-section { margin-bottom: 2rem; }

.search-box {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50px;
    padding: 0.5rem 1rem;
    margin-bottom: 1rem;
}

.search-icon { font-size: 1.25rem; margin-right: 0.75rem; }

.search-box input {
    flex: 1;
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 1rem;
    padding: 0.75rem;
    outline: none;
}

.search-btn {
    background: #ffffff;
    color: #6366f1;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
}

.quick-cities {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: center;
}

.city-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.875rem;
}

.city-btn.active {
    background: #ffffff;
    color: #6366f1;
}

.current-weather {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 30px;
    padding: 3rem;
    display: flex;
    align-items: center;
    gap: 3rem;
    justify-content: center;
    margin-bottom: 2rem;
}

.weather-icon-large {
    font-size: 8rem;
    animation: float 3s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.city-name { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; }
.weather-date { opacity: 0.8; margin-bottom: 1rem; }
.temperature { display: flex; align-items: flex-start; }
.temp-value { font-size: 5rem; font-weight: 700; line-height: 1; }
.temp-unit { font-size: 2rem; margin-top: 0.5rem; }
.weather-desc { font-size: 1.25rem; opacity: 0.9; margin-top: 0.5rem; }

.weather-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.detail-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.3s;
}

.detail-card:hover { transform: translateY(-5px); }
.detail-icon { font-size: 2.5rem; }
.detail-info { display: flex; flex-direction: column; }
.detail-value { font-size: 1.5rem; font-weight: 700; }
.detail-label { font-size: 0.875rem; opacity: 0.8; }

.forecast-section, .hourly-section { margin-top: 2rem; }
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
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 1.5rem;
    text-align: center;
    transition: transform 0.3s;
}

.forecast-card:hover { transform: translateY(-5px); }
.forecast-day { font-weight: 600; margin-bottom: 0.5rem; }
.forecast-icon { font-size: 3rem; margin: 0.5rem 0; }
.forecast-temp { font-size: 1.25rem; font-weight: 700; }
.forecast-temp-low { font-size: 0.875rem; opacity: 0.7; }

.hourly-scroll {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding-bottom: 1rem;
}

.hourly-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 15px;
    padding: 1rem 1.5rem;
    text-align: center;
    flex-shrink: 0;
    min-width: 100px;
}

.hourly-time { font-size: 0.875rem; opacity: 0.8; margin-bottom: 0.5rem; }
.hourly-icon { font-size: 2rem; margin: 0.5rem 0; }
.hourly-temp { font-weight: 700; }

.footer {
    text-align: center;
    padding: 2rem;
    margin-top: 2rem;
    opacity: 0.8;
    font-size: 0.875rem;
}

@media (max-width: 768px) {
    .app { padding: 1rem; }
    .current-weather { flex-direction: column; text-align: center; padding: 2rem; }
    .weather-icon-large { font-size: 5rem; }
    .temp-value { font-size: 4rem; }
    .city-name { font-size: 2rem; }
}`,

    "README.md": `# 🌤️ WeatherNow - Weather Dashboard

A beautiful weather dashboard with glassmorphism design.

## Features
- Current weather display with animated icon
- Weather details (wind, humidity, feels like, visibility)
- 5-day forecast cards
- Hourly forecast scroll
- Quick city selection buttons
- Responsive design

## Demo Data
- New York weather: 22°C, Partly Cloudy
- 5-day forecast with varying conditions
- Hourly forecast from 9AM to 12AM

Built with DevMindX - AI-Powered Development Platform`
  }
};
