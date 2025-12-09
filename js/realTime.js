    import { API_KEY } from '.config.js';
(() => {
    const locationInput = document.getElementById('locationInput');
    const locationSubmit = document.getElementById('locationSubmit');
    const locationStatus = document.getElementById('locationStatus');

    let realTimeData = {
        hour: 12,
        cloudiness: 0,
        windSpeed: 0,
        precipitation: 0,
        season: 'spring'
    };



    async function fetchWeather(city) {
        locationStatus.textContent = 'Hämtar data...';
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
            if (!response.ok) throw new Error('Plats ej hittad');

            const data = await response.json();

            // Extract relevant parameters
            const now = new Date((data.dt + data.timezone) * 1000); // local time
            realTimeData.hour = now.getUTCHours();
            realTimeData.cloudiness = data.clouds.all; // 0–100%
            realTimeData.windSpeed = data.wind.speed; // m/s
            realTimeData.precipitation = data.rain?.['1h'] || data.snow?.['1h'] || 0;
            
            const month = now.getUTCMonth() + 1;
            if (month >= 3 && month <= 5) realTimeData.season = 'spring';
            else if (month >= 6 && month <= 8) realTimeData.season = 'summer';
            else if (month >= 9 && month <= 11) realTimeData.season = 'autumn';
            else realTimeData.season = 'winter';

            locationStatus.textContent = `Uppdaterad för ${city}`;
            // Send data to theme
            window.applyRealTimeData?.(realTimeData);
        } catch (err) {
            console.error(err);
            locationStatus.textContent = 'Fel vid hämtning av data.';
        }
    }

    locationSubmit.addEventListener('click', () => {
        const city = locationInput.value.trim();
        if (city) fetchWeather(city);
    });

})();
