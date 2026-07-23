"use strict";

/* ===============================
   API
================================ */

const API_KEY = "1d979122602c1cfc9887737c6abb8807";

const WEATHER_API = "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_API = "https://api.openweathermap.org/data/2.5/forecast";

/* ===============================
   STORAGE
================================ */

const CURRENT_USER_KEY = "skycast_current_user";

const FAVORITES_KEY = "skycast_favorites";

const THEME_KEY = "skycast_theme";

const LAST_CITY_KEY = "skycast_last_city";

/* ===============================
   USER
================================ */

const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));

if (!currentUser) {
  window.location.href = "login.html";
}

/* ===============================
   DOM
================================ */

const cityInput = document.getElementById("cityInput");

const searchBtn = document.getElementById("searchBtn");

const locationBtn = document.getElementById("locationBtn");

const logoutBtn = document.getElementById("logoutBtn");

const themeBtn = document.getElementById("themeBtn");

const loading = document.getElementById("loading");

const welcomeMessage = document.getElementById("welcomeMessage");

const weatherContent = document.getElementById("weatherContent");

const errorMessage = document.getElementById("errorMessage");

const cityName = document.getElementById("cityName");

const dateElement = document.getElementById("date");

const temperature = document.getElementById("temperature");

const weatherDescription = document.getElementById("weatherDescription");

const feelsLike = document.getElementById("feelsLike");

const weatherIcon = document.getElementById("weatherIcon");

const humidity = document.getElementById("humidity");

const windSpeed = document.getElementById("windSpeed");

const pressure = document.getElementById("pressure");

const visibility = document.getElementById("visibility");

const sunrise = document.getElementById("sunrise");

const sunset = document.getElementById("sunset");

const favoriteBtn = document.getElementById("favoriteBtn");

const forecastContainer = document.getElementById("forecastContainer");

const favoritesContainer = document.getElementById("favoritesContainer");

const userInitial = document.getElementById("userInitial");

const dashboardProfileImage = document.getElementById("dashboardProfileImage");

let currentCity = "";

/* ===============================
   PROFILE IMAGE
================================ */

function loadDashboardProfile() {
  if (currentUser.profileImage) {
    dashboardProfileImage.src = currentUser.profileImage;

    dashboardProfileImage.style.display = "block";

    userInitial.style.display = "none";
  } else {
    dashboardProfileImage.style.display = "none";

    userInitial.style.display = "block";

    userInitial.textContent = currentUser.name.charAt(0).toUpperCase();
  }
}

loadDashboardProfile();

/* ===============================
   THEME
================================ */

function applyTheme() {
  const theme = localStorage.getItem(THEME_KEY);

  if (theme === "dark") {
    document.body.classList.add("dark-mode");

    themeBtn.textContent = "☀️";
  } else {
    document.body.classList.remove("dark-mode");

    themeBtn.textContent = "🌙";
  }
}

applyTheme();

themeBtn.addEventListener("click", function () {
  const dark = document.body.classList.toggle("dark-mode");

  localStorage.setItem(THEME_KEY, dark ? "dark" : "light");

  themeBtn.textContent = dark ? "☀️" : "🌙";
});

/* ===============================
   LOGOUT
================================ */

logoutBtn.addEventListener("click", function () {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem(CURRENT_USER_KEY);

    window.location.href = "login.html";
  }
});

/* ===============================
   SEARCH
================================ */

searchBtn.addEventListener("click", function () {
  const city = cityInput.value.trim();

  if (city === "") {
    showError("Please enter a city name.");

    return;
  }

  getWeather(city);
});

cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchBtn.click();
  }
});

/* ===============================
   WEATHER
================================ */

async function getWeather(city) {
  showLoading();

  try {
    const response = await fetch(
      `${WEATHER_API}?q=${encodeURIComponent(
        city,
      )}&appid=${API_KEY}&units=metric`,
    );

    const data = await response.json();

    if (data.cod !== 200) {
      throw new Error(data.message);
    }

    currentCity = data.name;

    localStorage.setItem(LAST_CITY_KEY, currentCity);

    updateWeather(data);

    const forecastResponse = await fetch(
      `${FORECAST_API}?q=${encodeURIComponent(
        city,
      )}&appid=${API_KEY}&units=metric`,
    );

    const forecastData = await forecastResponse.json();

    updateForecast(forecastData);

    updateFavoriteButton();

    showWeather();
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

/* ===============================
   WEATHER UPDATE
================================ */

function updateWeather(data) {
  cityName.textContent = `${data.name}, ${data.sys.country}`;

  dateElement.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",

    month: "long",

    day: "numeric",

    year: "numeric",
  });

  temperature.textContent = Math.round(data.main.temp);

  feelsLike.textContent = Math.round(data.main.feels_like);

  weatherDescription.textContent = capitalize(data.weather[0].description);

  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

  humidity.textContent = data.main.humidity;

  windSpeed.textContent = data.wind.speed;

  pressure.textContent = data.main.pressure;

  visibility.textContent = (data.visibility / 1000).toFixed(1);

  sunrise.textContent = formatTime(data.sys.sunrise);

  sunset.textContent = formatTime(data.sys.sunset);
}

/* ===============================
   FORECAST
================================ */

function updateForecast(data) {
  forecastContainer.innerHTML = "";

  const days = {};

  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000);

    const key = date.toISOString().split("T")[0];

    if (!days[key]) {
      days[key] = [];
    }

    days[key].push(item);
  });

  Object.values(days)
    .slice(0, 5)
    .forEach((day) => {
      const item = day[Math.floor(day.length / 2)];

      const card = document.createElement("div");

      card.className = "forecast-card";

      card.innerHTML = `

                <div class="forecast-day">

                    ${new Date(item.dt * 1000).toLocaleDateString("en-US", {
                      weekday: "short",

                      month: "short",

                      day: "numeric",
                    })}

                </div>


                <img
                    src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png"
                    alt="Weather">


                <h3>

                    ${Math.round(item.main.temp)}°C

                </h3>


                <p>

                    ${capitalize(item.weather[0].description)}

                </p>


                <div
                    class="forecast-extra">

                    💧 ${item.main.humidity}%

                    <br>

                    💨 ${item.wind.speed} m/s

                </div>

            `;

      forecastContainer.appendChild(card);
    });
}

/* ===============================
   FAVORITES
================================ */

function getFavoriteKey() {
  return currentUser.id ? `${FAVORITES_KEY}_${currentUser.id}` : FAVORITES_KEY;
}

function getFavorites() {
  return JSON.parse(localStorage.getItem(getFavoriteKey())) || [];
}

function saveFavorites(favorites) {
  localStorage.setItem(getFavoriteKey(), JSON.stringify(favorites));
}

favoriteBtn.addEventListener("click", function () {
  if (!currentCity) {
    return;
  }

  let favorites = getFavorites();

  const exists = favorites.some(
    (city) => city.toLowerCase() === currentCity.toLowerCase(),
  );

  if (exists) {
    favorites = favorites.filter(
      (city) => city.toLowerCase() !== currentCity.toLowerCase(),
    );
  } else {
    favorites.push(currentCity);
  }

  saveFavorites(favorites);

  updateFavoriteButton();

  renderFavorites();
});

function updateFavoriteButton() {
  const favorites = getFavorites();

  const exists = favorites.some(
    (city) => city.toLowerCase() === currentCity.toLowerCase(),
  );

  favoriteBtn.textContent = exists
    ? "★ Remove from Favorites"
    : "☆ Add to Favorites";

  favoriteBtn.classList.toggle("active", exists);
}

function renderFavorites() {
  favoritesContainer.innerHTML = "";

  const favorites = getFavorites();

  if (favorites.length === 0) {
    favoritesContainer.innerHTML = `

            <div
                class="empty-favorites">

                <div>
                    ☆
                </div>


                <p>
                    No favorite cities yet.
                </p>


                <small>
                    Search a city and add it to your favorites.
                </small>

            </div>

        `;

    return;
  }

  favorites.forEach((city) => {
    const card = document.createElement("div");

    card.className = "favorite-card";

    card.innerHTML = `

                <div
                    class="favorite-city-icon">

                    📍

                </div>


                <div
                    class="favorite-city-info">

                    <h3>
                        ${city}
                    </h3>


                    <p>
                        Click to view weather
                    </p>

                </div>


                <button
                    class="remove-favorite">

                    ×

                </button>

            `;

    card.addEventListener("click", function (event) {
      if (event.target.classList.contains("remove-favorite")) {
        return;
      }

      getWeather(city);
    });

    card
      .querySelector(".remove-favorite")
      .addEventListener("click", function (event) {
        event.stopPropagation();

        let favorites = getFavorites();

        favorites = favorites.filter((item) => item !== city);

        saveFavorites(favorites);

        renderFavorites();

        updateFavoriteButton();
      });

    favoritesContainer.appendChild(card);
  });
}

/* ===============================
   LOCATION
================================ */

locationBtn.addEventListener("click", function () {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported.");

    return;
  }

  showLoading();

  navigator.geolocation.getCurrentPosition(
    (position) => {
      getWeatherByLocation(position.coords.latitude, position.coords.longitude);
    },

    () => {
      hideLoading();

      showError("Please allow location permission.");
    },
  );
});

async function getWeatherByLocation(lat, lon) {
  try {
    const response = await fetch(
      `${WEATHER_API}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
    );

    const data = await response.json();

    currentCity = data.name;

    updateWeather(data);

    const forecastResponse = await fetch(
      `${FORECAST_API}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
    );

    const forecastData = await forecastResponse.json();

    updateForecast(forecastData);

    updateFavoriteButton();

    showWeather();
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

/* ===============================
   NAVIGATION
================================ */

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", function (event) {
    const href = this.getAttribute("href");

    if (href.startsWith("#")) {
      event.preventDefault();

      document.querySelectorAll(".nav-item").forEach((nav) => {
        nav.classList.remove("active");
      });

      this.classList.add("active");

      const target = document.querySelector(href);

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",

          block: "start",
        });
      }
    }
  });
});

/* ===============================
   UI
================================ */

function showLoading() {
  loading.style.display = "flex";

  welcomeMessage.classList.add("hidden");
}

function hideLoading() {
  loading.style.display = "none";
}

function showWeather() {
  welcomeMessage.classList.add("hidden");

  weatherContent.classList.remove("hidden");
}

function showError(message) {
  errorMessage.textContent = `⚠️ ${message}`;

  errorMessage.style.display = "block";
}

function formatTime(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",

    minute: "2-digit",
  });
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* ===============================
   INIT
================================ */

renderFavorites();

const lastCity = localStorage.getItem(LAST_CITY_KEY);

if (lastCity) {
  getWeather(lastCity);
}
