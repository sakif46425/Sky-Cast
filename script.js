"use strict";

// =================================
// API CONFIGURATION
// =================================

const API_KEY = "ecdcf62e5de9ddd9dc27606a2929b2fe";

const CURRENT_WEATHER_API = "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_API = "https://api.openweathermap.org/data/2.5/forecast";

// =================================
// DOM ELEMENTS
// =================================

const cityInput = document.getElementById("cityInput");

const searchBtn = document.getElementById("searchBtn");

const themeBtn = document.getElementById("themeBtn");

const weatherContent = document.getElementById("weatherContent");

const welcomeMessage = document.getElementById("welcomeMessage");

const loading = document.getElementById("loading");

const errorMessage = document.getElementById("errorMessage");

// Weather Elements

const cityName = document.getElementById("cityName");

const date = document.getElementById("date");

const temperature = document.getElementById("temperature");

const feelsLike = document.getElementById("feelsLike");

const weatherDescription = document.getElementById("weatherDescription");

const weatherIcon = document.getElementById("weatherIcon");

const humidity = document.getElementById("humidity");

const windSpeed = document.getElementById("windSpeed");

const pressure = document.getElementById("pressure");

const visibility = document.getElementById("visibility");

const forecastContainer = document.getElementById("forecastContainer");

// =================================
// SEARCH WEATHER
// =================================

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();

  if (city === "") {
    showError("Please enter a city name.");

    return;
  }

  getWeather(city);
});

// Search with Enter

cityInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    searchBtn.click();
  }
});

// =================================
// GET WEATHER DATA
// =================================

async function getWeather(city) {
  if (API_KEY === "YOUR_API_KEY_HERE") {
    showError("Please add your OpenWeatherMap API key in script.js");

    return;
  }

  showLoading();

  clearError();

  try {
    // Current Weather API

    const currentResponse = await fetch(
      `${CURRENT_WEATHER_API}?q=${city}&appid=${API_KEY}&units=metric`,
    );

    if (!currentResponse.ok) {
      throw new Error("City not found. Please enter a valid city.");
    }

    const currentData = await currentResponse.json();

    // Forecast API

    const forecastResponse = await fetch(
      `${FORECAST_API}?q=${city}&appid=${API_KEY}&units=metric`,
    );

    if (!forecastResponse.ok) {
      throw new Error("Forecast data could not be loaded.");
    }

    const forecastData = await forecastResponse.json();

    // Display Data

    displayCurrentWeather(currentData);

    displayForecast(forecastData);

    // Show Content

    welcomeMessage.classList.add("hidden");

    weatherContent.classList.remove("hidden");
  } catch (error) {
    showError(error.message);

    weatherContent.classList.add("hidden");

    welcomeMessage.classList.remove("hidden");
  } finally {
    hideLoading();
  }
}

// =================================
// DISPLAY CURRENT WEATHER
// =================================

function displayCurrentWeather(data) {
  cityName.textContent = `${data.name}, ${data.sys.country}`;

  temperature.textContent = Math.round(data.main.temp);

  feelsLike.textContent = Math.round(data.main.feels_like);

  weatherDescription.textContent = data.weather[0].description;

  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

  weatherIcon.alt = data.weather[0].description;

  humidity.textContent = data.main.humidity;

  windSpeed.textContent = data.wind.speed;

  pressure.textContent = data.main.pressure;

  visibility.textContent = (data.visibility / 1000).toFixed(1);

  date.textContent = formatDate(new Date());
}

// =================================
// DISPLAY 5-DAY FORECAST
// =================================

function displayForecast(data) {
  forecastContainer.innerHTML = "";

  const dailyForecast = {};

  data.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];

    if (!dailyForecast[date]) {
      dailyForecast[date] = item;
    }
  });

  const forecastDays = Object.values(dailyForecast).slice(0, 5);

  forecastDays.forEach((item) => {
    const forecastDate = new Date(item.dt * 1000);

    const card = document.createElement("div");

    card.className = "forecast-card";

    card.innerHTML = `

            <h3>
                ${forecastDate.toLocaleDateString("en-US", {
                  weekday: "short",
                })}
            </h3>


            <img
                src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png"
                alt="${item.weather[0].description}"
            >


            <div class="forecast-temp">
                ${Math.round(item.main.temp)}°C
            </div>


            <p>
                ${item.weather[0].description}
            </p>


            <p>
                💧 ${item.main.humidity}%
            </p>

        `;

    forecastContainer.appendChild(card);
  });
}

// =================================
// FORMAT DATE
// =================================

function formatDate(date) {
  return date.toLocaleDateString(
    "en-US",

    {
      weekday: "long",

      year: "numeric",

      month: "long",

      day: "numeric",
    },
  );
}

// =================================
// LOADING
// =================================

function showLoading() {
  loading.style.display = "block";
}

function hideLoading() {
  loading.style.display = "none";
}

// =================================
// ERROR
// =================================

function showError(message) {
  errorMessage.textContent = message;
}

function clearError() {
  errorMessage.textContent = "";
}

// =================================
// DARK MODE
// =================================

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");

  themeBtn.textContent = isDark ? "☀️" : "🌙";

  localStorage.setItem("skycast-theme", isDark ? "dark" : "light");
});

// Load Saved Theme

const savedTheme = localStorage.getItem("skycast-theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");

  themeBtn.textContent = "☀️";
}
