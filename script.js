const icons = {
    0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',
    51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',
    71:'🌨️',73:'🌨️',75:'🌨️',95:'⛈️'
};

const desc = {
    0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',
    45:'Foggy',51:'Drizzle',61:'Rain',71:'Snow',95:'Thunderstorm'
};

function icon(code){ return icons[code] || '🌤️'; }
function text(code){ return desc[code] || 'Weather'; }

async function getCoordinates(city){
    const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );
    const data = await res.json();
    if(!data.results) throw new Error("City not found");
    return data.results[0];
}

async function getWeather(lat, lon){
    const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
    );
    return await res.json();
}

function searchWeather(){
    const city = cityInput.value.trim();
    if(!city) return;

    loading.style.display="block";
    weatherContent.style.display="none";
    errorMsg.style.display="none";

    getCoordinates(city)
    .then(loc=>getWeather(loc.latitude,loc.longitude).then(w=>({loc,w})))
    .then(({loc,w})=>{
        location.textContent = `${loc.name}, ${loc.country}`;
        date.textContent = new Date().toDateString();

        currentIcon.textContent = icon(w.current.weather_code);
        temperature.textContent = `${Math.round(w.current.temperature_2m)}°C`;
        description.textContent = text(w.current.weather_code);
        feelsLike.textContent = `${Math.round(w.current.apparent_temperature)}°C`;
        humidity.textContent = `${w.current.relative_humidity_2m}%`;
        windSpeed.textContent = `${Math.round(w.current.wind_speed_10m * 3.6)} km/h`;
        pressure.textContent = `${w.current.pressure_msl} hPa`;

        hourlyForecast.innerHTML="";
        for(let i=0;i<24;i++){
            hourlyForecast.innerHTML+=`
            <div class="hourly-item">
                <div>${new Date(w.hourly.time[i]).getHours()}:00</div>
                <div>${icon(w.hourly.weather_code[i])}</div>
                <div>${Math.round(w.hourly.temperature_2m[i])}°C</div>
            </div>`;
        }

        dailyForecast.innerHTML="";
        for(let i=0;i<7;i++){
            dailyForecast.innerHTML+=`
            <div class="daily-item">
                <div>${i===0?'Today':new Date(w.daily.time[i]).toLocaleDateString('en',{weekday:'short'})}</div>
                <div>${icon(w.daily.weather_code[i])}</div>
                <div>${Math.round(w.daily.temperature_2m_max[i])}° / ${Math.round(w.daily.temperature_2m_min[i])}°</div>
            </div>`;
        }

        loading.style.display="none";
        weatherContent.style.display="block";
    })
    .catch(err=>{
        loading.style.display="none";
        errorMsg.style.display="block";
        errorMsg.textContent = err.message;
    });
}

cityInput.addEventListener("keypress",e=>e.key==="Enter" && searchWeather());
searchWeather();
