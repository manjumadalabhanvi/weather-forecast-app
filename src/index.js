const apiKey = 'a26c79c4eadfa4c1668afff4398d56f1'

// Get weather by city name
async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`

  try {
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(url),
      fetch(forecastUrl),
    ])

    if (!weatherRes.ok || !forecastRes.ok) {
      throw new Error('City not found')
    }

    const weatherData = await weatherRes.json()
    const forecastData = await forecastRes.json()

    displayWeather(weatherData)
    displayForecast(forecastData)
  } catch (error) {
    console.error('Error fetching weather:', error.message)
    document.getElementById(
      'city-name',
    ).innerHTML = `<p class="text-red-500">City not found. Try again!</p>`
    document.getElementById('forecast').innerHTML = ''
  }
}

// Get weather by coordinates with fallback
async function getWeatherByCoords(lat, lon) {
  const reverseUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`

  try {
    const res = await fetch(reverseUrl)
    if (!res.ok) throw new Error('Reverse geocoding failed')

    const data = await res.json()
    const city = data[0]?.name
    const state = data[0]?.state

    let queryCity = city
    if (state) queryCity += `,${state}`

    try {
      await getWeather(queryCity)
      saveToRecentCities(city)
    } catch {
      // fallback using lat/lon
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`

      const [weatherRes, forecastRes] = await Promise.all([
        fetch(url),
        fetch(forecastUrl),
      ])

      if (!weatherRes.ok || !forecastRes.ok) {
        throw new Error('Weather fetch by coordinates failed')
      }

      const weatherData = await weatherRes.json()
      const forecastData = await forecastRes.json()

      displayWeather(weatherData)
      displayForecast(forecastData)
      saveToRecentCities(weatherData.name)
    }
  } catch (error) {
    console.error('Location weather fetch failed:', error.message)
    document.getElementById(
      'city-name',
    ).innerHTML = `<p class="text-red-500">Unable to detect city from location.</p>`
    document.getElementById('forecast').innerHTML = ''
  }
}

// Display current weather
function displayWeather(data) {
  document.getElementById('city-name').innerHTML = `
    <p class="text-2xl font-bold mb-2">${data.name}</p>
    <p>Temperature: ${data.main.temp}°C</p>
    <p>Weather: ${data.weather[0].description}</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
  `
}

// Display 5-day forecast
function displayForecast(forecastData) {
  const forecastContainer = document.getElementById('forecast')
  forecastContainer.innerHTML = ''

  const dailyForecasts = forecastData.list.filter((item) =>
    item.dt_txt.includes('12:00:00'),
  )

  dailyForecasts.forEach((item) => {
    const date = new Date(item.dt_txt).toLocaleDateString()
    const icon = item.weather[0].icon
    const desc = item.weather[0].description

    forecastContainer.innerHTML += `
      <section class="bg-orange-700/80 p-4 rounded-xl w-[200px] text-center shadow-lg">
        <p class="font-bold text-lg">${date}</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon" class="mx-auto"/>
        <p class="capitalize">${desc}</p>
        <p>Temp: ${item.main.temp}°C</p>
        <p>Humidity: ${item.main.humidity}%</p>
      </section>
    `
  })
}

// Save city to recent list
function saveToRecentCities(city) {
  let cities = JSON.parse(localStorage.getItem('recentCities')) || []
  city = city.trim().toLowerCase()

  if (!cities.includes(city)) {
    cities.unshift(city)
    if (cities.length > 5) cities.pop()
    localStorage.setItem('recentCities', JSON.stringify(cities))
  }

  renderDropdown()
}

// Render dropdown from localStorage
function renderDropdown() {
  const cities = JSON.parse(localStorage.getItem('recentCities')) || []
  const dropdown = document.getElementById('recent-cities')

  dropdown.innerHTML = `<option value="" disabled selected>Select Recently Searched</option>`

  if (cities.length === 0) {
    dropdown.classList.add('hidden')
  } else {
    cities.forEach((city) => {
      const option = document.createElement('option')
      option.value = city
      option.textContent = city.charAt(0).toUpperCase() + city.slice(1)
      dropdown.appendChild(option)
    })
    dropdown.classList.remove('hidden')
  }
}

// Search button click
document.getElementById('btn').addEventListener('click', () => {
  const city = document.getElementById('input-data').value.trim()
  if (city !== '') {
    getWeather(city)
    saveToRecentCities(city)
    document.getElementById('input-data').value = ''
  } else {
    alert('Please enter the city name!')
  }
})

// Use My Location button
document.getElementById('location-btn').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        document.getElementById('input-data').value = ''
        getWeatherByCoords(lat, lon)
      },
      (error) => {
        alert('Location access denied or unavailable.')
      },
    )
  } else {
    alert('Geolocation is not supported by this browser.')
  }
})

// Dropdown change event
document.getElementById('recent-cities').addEventListener('change', (e) => {
  const selectedCity = e.target.value
  if (selectedCity) {
    getWeather(selectedCity)
  }
})

// Render dropdown on page load
document.addEventListener('DOMContentLoaded', () => {
  renderDropdown()
})
