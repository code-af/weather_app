const currentLocation = document.getElementById("current-location")
const currentWeatherInfo = document.getElementById("current-weather")
const hourlyForecast = document.getElementById("hourly-forecast")
const dailyForecast = document.getElementById("daily-forecast")
const inputSection = document.getElementById("input-section")

currentLocation.innerHTML = "<h1>How's the weather ?</h1>"
hourlyForecast.innerHTML = "<h2>Todays Hourly Forecast</h2>"
dailyForecast.innerHTML = "<h2>Forecast for Following days</h2>"

const month = {"01":"january","02":"February", "03":"March", "04":"April","05":"May",
    "06":"June","07":"July","08":"August","09":"September","10":"October","11":"November","12":"December"}

navigator.geolocation.getCurrentPosition(
    async (accepted)=>{
    const latitude = accepted.coords.latitude
    const longitude = accepted.coords.longitude
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,weather_code&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`)
    const data = await response.json()
    const dateTime = `${data.current.time.slice(0, 10)}`
    console.log(data)
    setBackground(data.current.weather_code, data.current.temperature_2m)

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    const addyResponse = await fetch(url)
    const addyData = await addyResponse.json()
    const address = addyData.address
    console.log(address)

    currentLocation.innerHTML = `<h1>Weather at ${address.country}, ${address.state}-${address.city}
    <h2>Date: ${dateTime}</h2>`

    currentWeatherInfo.innerHTML = `<h2>Current Weather Info</h2><h3>Time : ${data.current.time.slice(-5)}
    <br>Temperature : ${data.current.temperature_2m}${data.current_units.temperature_2m}${getWeatherEmoji(data.current.weather_code)}<br>
    Condition : ${getWeatherDescription(data.current.weather_code)}<br>
    Rain-Chance : ${data.current.precipitation_probability}${data.current_units.precipitation_probability}<br>
    Humidity : ${data.current.relative_humidity_2m}${data.current_units.relative_humidity_2m}</br>
    Wind-Speed : ${data.current.wind_speed_10m}${data.current_units.wind_speed_10m}</h3>`

    const hours = 24
    for(let h = 0; h<hours; h++){
        hourlyForecast.innerHTML += `<h3>Time ${data.hourly.time[h].slice(-5)} : Temperature ${data.hourly.temperature_2m[h]}
        ${data.hourly_units.temperature_2m}<br>${getWeatherEmoji(data.hourly.weather_code[h])}</h3>`
    }
    
    const days = data.daily.time.length
    for(let i = 0; i<days ; i++){
        dailyForecast.innerHTML += `<h3>${getWeatherDescription(data.daily.weather_code[i])} 
        On ${data.daily.time[i].slice(-2)} ${month[data.daily.time[i].slice(-5, -3)]},
        From ${data.daily.temperature_2m_min[i]}${data.daily_units.temperature_2m_min} 
        To ${data.daily.temperature_2m_max[i]}${data.daily_units.temperature_2m_max}
        ${getWeatherEmoji(data.daily.weather_code[i])}</h3>`
    }

},
                                                //  USER DENIED SECTION !!!!!!!!!!
    (denied)=>{
        console.log(denied.message)
        
        currentWeatherInfo.innerHTML = `<h1>Allow location or Search by City Name</h1>`
        inputSection.innerHTML += `<input id="input-field" type="text" placeholder="Enter a city..."/>
                                    <button id="search-btn">Search</button>`

        const inputField = document.getElementById("input-field")
        const searchBtn = document.getElementById("search-btn")
        
        searchBtn.addEventListener("click", async ()=>{
            
            const cityName = inputField.value.trim()
            // basic validation
            if(!cityName) return
            if(cityName.length > 50) return  // too long
            if(!/^[a-zA-Z\s]+$/.test(cityName)) return  // only letters and spaces

            const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`
            const response = await fetch(geocodeUrl)
            const data = await response.json()
            console.log(data?.results[0])
            currentLocation.innerHTML = `<h1>Weather at ${data.results[0]?.name}, ${data.results[0]?.country}</h1>`
            const latitude = data.results[0].latitude
            const longitude = data.results[0].longitude

            const searchResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,weather_code&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`)
            const searchData = await searchResponse.json()
            currentLocation.innerHTML += `<h3>${searchData.current.time.slice(0, 10)}</h3>`
            console.log(searchData)
            setBackground(searchData.current.weather_code, searchData.current.temperature_2m)

            currentWeatherInfo.innerHTML = `<h2>Current Weather Info</h2><h3>Time : ${searchData.current.time.slice(-5)}
            <br>Temperature : ${searchData.current.temperature_2m}${searchData.current_units.temperature_2m}
            ${getWeatherEmoji(searchData.current.weather_code)}<br>
            Condition : ${getWeatherDescription(searchData.current.weather_code)}
            <br>Rain-Chance : ${searchData.current.precipitation_probability}${searchData.current_units.precipitation_probability}<br>
            Humidity : ${searchData.current.relative_humidity_2m}${searchData.current_units.relative_humidity_2m}</br>
            Wind-Speed : ${searchData.current.wind_speed_10m}${searchData.current_units.wind_speed_10m}</h3>`            

            const hours = 24
            hourlyForecast.innerHTML = "<h2>Todays Hourly Forecast</h2>"
            for(let h = 0; h<hours; h++){
                hourlyForecast.innerHTML += `<h3>Time ${searchData.hourly.time[h].slice(-5)} : Temperature ${searchData.hourly.temperature_2m[h]}
                ${searchData.hourly_units.temperature_2m}<br>${getWeatherEmoji(searchData.hourly.weather_code[h])}</h3>`
            }

            const days = searchData.daily.time.length
            dailyForecast.innerHTML = "<h2>Forecast for upcoming days</h2>"
            for(let i = 0; i<days ; i++){
                dailyForecast.innerHTML += `<h3>${getWeatherDescription(searchData.daily.weather_code[i])} 
                On ${searchData.daily.time[i].slice(-2)} ${month[searchData.daily.time[i].slice(-5, -3)]}
                From ${searchData.daily.temperature_2m_min[i]}${searchData.daily_units.temperature_2m_min} 
                To ${searchData.daily.temperature_2m_max[i]}${searchData.daily_units.temperature_2m_max}
                ${getWeatherEmoji(searchData.daily.weather_code[i])}</h3>`
            }

        })
    })
function getWeatherDescription(code) {
    const descriptions = {
        0: "Clear Sky",
        1: "Mainly Clear",
        2: "Partly Cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Icy Fog",
        51: "Light Drizzle",
        53: "Moderate Drizzle",
        55: "Heavy Drizzle",
        61: "Light Rain",
        63: "Moderate Rain",
        65: "Heavy Rain",
        71: "Light Snow",
        73: "Moderate Snow",
        75: "Heavy Snow",
        77: "Snow Grains",
        80: "Light Showers",
        81: "Moderate Showers",
        82: "Heavy Showers",
        85: "Snow Showers",
        95: "Thunderstorm",
        96: "Thunderstorm with Hail",
        99: "Heavy Thunderstorm with Hail"
    }
    return descriptions[code] || "Unknown"
}
function getWeatherEmoji(code) {
    if(code === 0) return "☀️"   // if exactly 0 → return immediately
    if(code <= 3) return "⛅"    // if 1,2,3 → return immediately
    if(code <= 48) return "🌫️"  // if 4-48 → return immediately
    if(code <= 67) return "🌧️"  // if 49-67 → return immediately
    if(code <= 77) return "❄️"  // if 68-77 → return immediately
    if(code <= 82) return "🌦️"  // if 78-82 → return immediately
    if(code >= 95) return "⛈️"  // if 95+ → return immediately
    return "🌤️"                 // anything else → default
}
function setBackground(code, temperature) {
    const container = document.getElementById("parent")
    
    if(code === 0 && !isNight) {
        container.style.backgroundImage = "url('images/sunny.jpg')"
    } else if(code === 0 && isNight) {
        container.style.backgroundImage = "url('images/night.jpg')"
    } else if(code <= 3) {
        container.style.backgroundImage = "url('images/partly_cloudy.jpg')"
    } else if(code <= 48) {
        container.style.backgroundImage = "url('images/cloudy.jpg')"
    } else if(code <= 67 || (code >= 80 && code <= 82)) {
        container.style.backgroundImage = "url('images/rainy.jpg')"
    } else if(code <= 77) {
        container.style.backgroundImage = "url('images/snowy.jpg')"
    } else if(code >= 95) {
        container.style.backgroundImage = "url('images/thunder.jpg')"
    }
}