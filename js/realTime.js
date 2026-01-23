// realTime.js — Fetches real weather & time, updates realTheme
import { API_KEY } from './config.js';
(() => {
    const input = document.getElementById('locationInput');
    const button = document.getElementById('setLocationBtn');

    if (!input || !button) return;

    let currentCity = '';

    // Helper: fetch weather & time for city
    async function fetchWeather(city) {
        try {
            const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
            if (!resp.ok) throw new Error('City not found');
            const data = await resp.json();

            const timeOffset = data.timezone; // in seconds
            const localTime = new Date(Date.now() + timeOffset * 1000 - new Date().getTimezoneOffset()*60000);
            const hour = localTime.getHours();

            // Determine time of day
            let timeOfDay;
            if (hour >= 5 && hour < 8) timeOfDay = 'dawn';
            else if (hour >= 8 && hour < 18) timeOfDay = 'day';
            else if (hour >= 18 && hour < 20) timeOfDay = 'dusk';
            else timeOfDay = 'night';

            // Season approximation
            const month = localTime.getMonth();
            const season = (month >= 2 && month <= 4) ? 'spring' :
                           (month >= 5 && month <= 7) ? 'summer' :
                           (month >= 8 && month <= 10) ? 'autumn' : 'winter';

            // Cloud coverage 0–1
            const cloudCoverage = (data.clouds && data.clouds.all) ? data.clouds.all/100 : 0;

            // Wind speed
            const windSpeed = data.wind && data.wind.speed ? data.wind.speed : 0;

            // Precipitation type
            let precipitation = 'none';
            if (data.rain) precipitation = 'rain';
            else if (data.snow) precipitation = 'snow';

            return { timeOfDay, season, cloudCoverage, windSpeed, precipitation };

        } catch (err) {
            console.error('Weather fetch error:', err);
            return null;
        }
    }

    // Update theme function
    async function updateTheme(city) {
        const themeData = await fetchWeather(city);
        if (!themeData) return;

        if (window.updateRealTheme) {
            window.updateRealTheme(themeData);
        } else {
            console.warn('updateRealTheme not defined.');
        }
    }

    // Event listener
    button.addEventListener('click', () => {
        const city = input.value.trim();
        if (!city) return;
        currentCity = city;
        updateTheme(currentCity);
    });

    // Optional: refresh every 10 minutes
    setInterval(() => {
        if (currentCity) updateTheme(currentCity);
    }, 10*60*1000);

})();
