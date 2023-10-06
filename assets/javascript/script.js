const apiKey = "17c217eb87e1e62fc400a04808b0be98";

document.addEventListener("DOMContentLoaded", function () {
  const searchBtn = document.getElementById("searchBtn");
  const cityInput = document.getElementById("cityInput");

  cityInput.addEventListener("keydown", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      searchBtn.click();
    }
  });

  loadSearchHistory();

  searchBtn.addEventListener("click", function () {
    const cityName = document.getElementById("cityInput").value;
    saveSearchHistory(cityName);
    loadSearchHistory();

    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=imperial&appid=${apiKey}`
    )
      .then((response) => response.json())
      .then((data) => {
        updateFiveDayForecast(data);

        const lat = data.city.coord.lat;
        const lon = data.city.coord.lon;

        return fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
        );
      })
      .then((response) => response.json())
      .then((currentData) => {
        updateCurrentWeather(currentData, cityName);
      })
      .catch((error) => console.error("Something went wrong:", error));
  });
});

function loadSearchHistory() {
  const historyContainer = document.getElementById("searchBtn").parentNode;
  const oldHistory = document.querySelectorAll(".history-button");

  oldHistory.forEach((button) => button.remove());

  const searchHistory =
    JSON.parse(localStorage.getItem("searchHistory")) || [];

  searchHistory.reverse().forEach((city) => {
    const historyButton = document.createElement("button");
    historyButton.textContent = city;
    historyButton.className = "btn btn-secondary btn-lg btn-block my-1 history-button";

    historyButton.addEventListener("click", function () {
      document.getElementById("cityInput").value = city;
      document.getElementById("searchBtn").click();
    });

    historyContainer.appendChild(historyButton);
  });
}

function saveSearchHistory(cityName) {
  const searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

  if (!searchHistory.includes(cityName)) {
    searchHistory.push(cityName);
  }

  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

function updateFiveDayForecast(data) {
  for (let i = 1; i <= 5; i++) {
    const dayData = data.list[i];
    const formattedDate = new Date(dayData.dt_txt).toLocaleDateString();
    const weatherEmoji = `<img src="https://openweathermap.org/img/wn/${dayData.weather[0].icon}.png">`;
    const temperature = dayData.main.temp;
    const windSpeed = dayData.wind.speed;
    const humidity = dayData.main.humidity;

    document.getElementById(`day${i + 1}`).innerHTML = `
      Date: ${formattedDate}<br>
      ${weatherEmoji}<br>
      Temp: ${temperature} F<br>
      Wind: ${windSpeed} MPH<br>
      Humidity: ${humidity}%
    `;
  }
}

function updateCurrentWeather(currentData, cityName) {
  try {
    const currentTemperature = currentData.main.temp;
    const currentWindSpeed = currentData.wind.speed;
    const currentHumidity = currentData.main.humidity;
    const currentWeatherEmoji = `<img src="https://openweathermap.org/img/wn/${currentData.weather[0].icon}.png">`;

    document.getElementById("cityData").innerHTML = `
      <div class="weather-info">
        <div style="font-size: 2em;">${cityName} (${new Date().toLocaleDateString()})</div>
        <div>${currentWeatherEmoji}</div>
        <div>Temp: ${currentTemperature} F</div>
        <div>Windspeed: ${currentWindSpeed} MPH</div>
        <div>Humidity: ${currentHumidity}%</div>
      </div>
    `;
  } catch (error) {
    console.error("Error in updateCurrentWeather:", error);
  }
}