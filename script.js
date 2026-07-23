"use strict";

// =====================================
// API CONFIGURATION
// =====================================

const API_KEY = "ecdcf62e5de9ddd9dc27606a2929b2fe";

const CURRENT_API = "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_API = "https://api.openweathermap.org/data/2.5/forecast";

// =====================================
// DOM ELEMENTS
// =====================================

const cityInput = document.getElementById("cityInput");

const searchBtn = document.getElementById("searchBtn");

const locationBtn = document.getElementById("locationBtn");

const themeBtn = document.getElementById("themeBtn");

const favoriteBtn = document.getElementById("favoriteBtn");

const loading = document.getElementById("loading");

const weatherContent = document.getElementById("weatherContent");

const welcomeMessage = document.getElementById("welcomeMessage");

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

const sunrise = document.getElementById("sunrise");

const sunset = document.getElementById("sunset");

const forecastContainer = document.getElementById("forecastContainer");

const favoritesContainer = document.getElementById("favoritesContainer");

// Navigation

const dashboardNav = document.getElementById("dashboardNav");

const forecastNav = document.getElementById("forecastNav");

const favoritesNav = document.getElementById("favoritesNav");

const navItems = document.querySelectorAll(".nav-item");

// Current City

let currentCity = "";

// =====================================
// SEARCH
// =====================================

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();

  if (!city) {
    showError("Please enter a city name.");

    return;
  }

  getWeatherByCity(city);
});

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchBtn.click();
  }
});

// =====================================
// GET WEATHER BY CITY
// =====================================

async function getWeatherByCity(city) {
  if (API_KEY === "YOUR_API_KEY_HERE") {
    showError("Please add your API key in script.js.");

    return;
  }

  showLoading();

  clearError();

  try {
    const currentResponse = await fetch(
      `${CURRENT_API}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`,
    );

    if (!currentResponse.ok) {
      throw new Error("City not found. Please check the city name.");
    }

    const currentData = await currentResponse.json();

    const forecastResponse = await fetch(
      `${FORECAST_API}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`,
    );

    if (!forecastResponse.ok) {
      throw new Error("Forecast data could not be loaded.");
    }

    const forecastData = await forecastResponse.json();

    currentCity = currentData.name;

    displayCurrentWeather(currentData);

    displayForecast(forecastData);

    updateFavoriteButton();

    showWeatherContent();

    localStorage.setItem("lastCity", currentCity);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// =====================================
// DISPLAY CURRENT WEATHER
// =====================================

function displayCurrentWeather(data) {
  cityName.textContent = `${data.name}, ${data.sys.country}`;

  date.textContent = formatDate(new Date());

  temperature.textContent = Math.round(data.main.temp);

  feelsLike.textContent = Math.round(data.main.feels_like);

  weatherDescription.textContent = data.weather[0].description;

  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

  humidity.textContent = data.main.humidity;

  windSpeed.textContent = data.wind.speed;

  pressure.textContent = data.main.pressure;

  visibility.textContent = (data.visibility / 1000).toFixed(1);

  sunrise.textContent = formatTime(data.sys.sunrise, data.timezone);

  sunset.textContent = formatTime(data.sys.sunset, data.timezone);
}

// =====================================
// DISPLAY 5-DAY FORECAST
// =====================================

function displayForecast(data) {
  forecastContainer.innerHTML = "";

  const dailyData = {};

  data.list.forEach((item) => {
    const forecastDate = item.dt_txt.split(" ")[0];

    const forecastTime = item.dt_txt.split(" ")[1];

    if (forecastTime === "12:00:00") {
      dailyData[forecastDate] = item;
    }
  });

  let forecastDays = Object.values(dailyData).slice(0, 5);

  if (forecastDays.length < 5) {
    forecastDays = getFallbackForecast(data.list);
  }

  forecastDays.forEach((item) => {
    const card = document.createElement("div");

    card.className = "forecast-card";

    const forecastDate = new Date(item.dt * 1000);

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

// =====================================
// FALLBACK FORECAST
// =====================================

function getFallbackForecast(list) {
  const dates = {};

  list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];

    if (!dates[date]) {
      dates[date] = item;
    }
  });

  return Object.values(dates).slice(0, 5);
}

// =====================================
// FAVORITE CITIES
// =====================================

function getFavorites() {
  return JSON.parse(localStorage.getItem("skycast-favorites")) || [];
}

function saveFavorites(favorites) {
  localStorage.setItem("skycast-favorites", JSON.stringify(favorites));
}

function addToFavorites() {
  if (!currentCity) {
    return;
  }

  const favorites = getFavorites();

  if (favorites.includes(currentCity)) {
    showError("This city is already in favorites.");

    return;
  }

  favorites.push(currentCity);

  saveFavorites(favorites);

  updateFavoriteButton();

  renderFavorites();
}

function removeFromFavorites(city) {
  let favorites = getFavorites();

  favorites = favorites.filter((favorite) => favorite !== city);

  saveFavorites(favorites);

  renderFavorites();

  updateFavoriteButton();
}

function updateFavoriteButton() {
  const favorites = getFavorites();

  if (favorites.includes(currentCity)) {
    favoriteBtn.textContent = "★ Saved to Favorites";
  } else {
    favoriteBtn.textContent = "☆ Add to Favorites";
  }
}

function renderFavorites() {
  const favorites = getFavorites();

  favoritesContainer.innerHTML = "";

  if (favorites.length === 0) {
    favoritesContainer.innerHTML = `

            <p class="no-favorites">

                No favorite cities yet.
                Search a city and add it to favorites.

            </p>

        `;

    return;
  }

  favorites.forEach((city) => {
    const card = document.createElement("div");

    card.className = "favorite-city-card";

    card.innerHTML = `

                <span
                    class="favorite-city-name"
                    data-city="${city}"
                >

                    📍 ${city}

                </span>


                <button
                    class="remove-favorite"
                    data-city="${city}"
                >

                    ✕

                </button>

            `;

    favoritesContainer.appendChild(card);
  });

  document.querySelectorAll(".favorite-city-name").forEach((item) => {
    item.addEventListener("click", () => {
      const city = item.dataset.city;

      cityInput.value = city;

      getWeatherByCity(city);
    });
  });

  document.querySelectorAll(".remove-favorite").forEach((button) => {
    button.addEventListener("click", () => {
      removeFromFavorites(button.dataset.city);
    });
  });
}

favoriteBtn.addEventListener("click", addToFavorites);

// =====================================
// NAVIGATION
// =====================================

function setActiveNav(activeItem) {
  navItems.forEach((item) => {
    item.classList.remove("active");
  });

  activeItem.classList.add("active");
}

dashboardNav.addEventListener("click", (event) => {
  event.preventDefault();

  setActiveNav(dashboardNav);

  window.scrollTo({
    top: 0,

    behavior: "smooth",
  });
});

forecastNav.addEventListener("click", (event) => {
  event.preventDefault();

  setActiveNav(forecastNav);

  const forecastSection = document.getElementById("forecastSection");

  forecastSection.scrollIntoView({
    behavior: "smooth",

    block: "start",
  });
});

favoritesNav.addEventListener("click", (event) => {
  event.preventDefault();

  setActiveNav(favoritesNav);

  const favoritesSection = document.getElementById("favoritesSection");

  favoritesSection.scrollIntoView({
    behavior: "smooth",

    block: "start",
  });
});

// =====================================
// MY LOCATION
// =====================================

locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");

    return;
  }

  showLoading();

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;

      const lon = position.coords.longitude;

      getWeatherByCoordinates(lat, lon);
    },

    () => {
      hideLoading();

      showError("Location permission denied. Please allow location access.");
    },
  );
});

// =====================================
// GET WEATHER BY LOCATION
// =====================================

async function getWeatherByCoordinates(lat, lon) {
  try {
    const currentResponse = await fetch(
      `${CURRENT_API}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
    );

    if (!currentResponse.ok) {
      throw new Error("Unable to get current location weather.");
    }

    const currentData = await currentResponse.json();

    const forecastResponse = await fetch(
      `${FORECAST_API}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
    );

    const forecastData = await forecastResponse.json();

    currentCity = currentData.name;

    displayCurrentWeather(currentData);

    displayForecast(forecastData);

    updateFavoriteButton();

    showWeatherContent();

    localStorage.setItem("lastCity", currentCity);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// =====================================
// DARK MODE
// =====================================

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");

  themeBtn.textContent = isDark ? "☀️" : "🌙";

  localStorage.setItem("skycast-theme", isDark ? "dark" : "light");
});

const savedTheme = localStorage.getItem("skycast-theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");

  themeBtn.textContent = "☀️";
}

// =====================================
// UI FUNCTIONS
// =====================================

function showLoading() {
  loading.style.display = "block";

  weatherContent.classList.add("hidden");

  welcomeMessage.classList.add("hidden");
}

function hideLoading() {
  loading.style.display = "none";
}

function showWeatherContent() {
  weatherContent.classList.remove("hidden");

  welcomeMessage.classList.add("hidden");
}

function showError(message) {
  errorMessage.textContent = message;
}

function clearError() {
  errorMessage.textContent = "";
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",

    month: "long",

    day: "numeric",

    year: "numeric",
  });
}

function formatTime(timestamp, timezoneOffset) {
  const date = new Date((timestamp + timezoneOffset) * 1000);

  return date.toUTCString().split(" ")[4].slice(0, 5);
}

// =====================================
// INITIALIZATION
// =====================================

renderFavorites();

const lastCity = localStorage.getItem("lastCity");

if (lastCity) {
  cityInput.value = lastCity;

  getWeatherByCity(lastCity);
}
