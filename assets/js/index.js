// api key
const apiKey = "b705b8aac2d674d7a8bbd75cc1543296";
// function grabs city name
document.querySelector("form").addEventListener("submit", function (sub) {
  sub.preventDefault();
  const city = document.getElementById("cityInput").value;
  getCurrentWeather(city);
  getForecast(city);
});
// fetches current weather data for the city
function getCurrentWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const temperature = data.main.temp;
      const humidity = data.main.humidity;
      const windSpeed = data.wind.speed;
      const weatherIcon = data.weather[0].icon;
      const weatherHTML = `
          <div class="weather-box">
              <img src="https://openweathermap.org/img/w/${weatherIcon}.png" alt="Weather Icon" class="weather-icon">
              <p>Temperature: ${temperature} ºF, Humidity: ${humidity}%, Wind Speed: ${windSpeed} mph</p>
          </div>
      `;
      document.getElementById("currentWeather").innerHTML = weatherHTML;
    })
    .catch((error) => {
      console.error(error);
    });
}
// fetches forecast data for the city for the next 5 days
function getForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const forecastList = data.list;
      const dailyForecasts = groupForecastsByDay(forecastList);
// forecast data 
      let forecastHTML = "";
      let dayCount = 0;
      for (const [day, forecasts] of Object.entries(dailyForecasts)) {
        const maxTemperature = Math.max(
          ...forecasts.map((forecast) => forecast.main.temp)
        );
        const maxHumidity = Math.max(
          ...forecasts.map((forecast) => forecast.main.humidity)
        );
        const maxWindSpeed = Math.max(
          ...forecasts.map((forecast) => forecast.wind.speed)
        );
        const weatherIcon = forecasts[0].weather[0].icon;
// adds forecast data to the page
        forecastHTML += `
            <div class="weather-box">
                <img src="https://openweathermap.org/img/w/${weatherIcon}.png" alt="Weather Icon" class="weather-icon">
                <p>${day}: Temperature: ${maxTemperature} ºF, Humidity: ${maxHumidity}%, Wind Speed: ${maxWindSpeed} mph</p>
            </div>
        `;
// limits forecast to 5 days
        dayCount++;
        if (dayCount >= 5) {
          break;
        }
      }

      document.getElementById("forecast").innerHTML = forecastHTML;
    })
    .catch((error) => {
      console.log("Error:", error);
    });

  saveSearchedCity(city);
}
// groups forecast data by day
function groupForecastsByDay(forecastList) {
  const dailyForecasts = {};

  for (const forecast of forecastList) {
    const date = dayjs(forecast.dt_txt).format("MMMM-DD-YYYY");
    if (!dailyForecasts[date]) {
      dailyForecasts[date] = [];
    }
    dailyForecasts[date].push(forecast);
  }

  return dailyForecasts;
}
// saves searched city to local storage
function saveSearchedCity(city) {
  let searchedCities = localStorage.getItem("searchedCities");
  if (searchedCities) {
    searchedCities = JSON.parse(searchedCities);
    if (!searchedCities.includes(city)) {
      searchedCities.push(city);
    }
  } else {
    searchedCities = [city];
  }

  localStorage.setItem("searchedCities", JSON.stringify(searchedCities));

  displaySearchedCities(searchedCities);
}
// capitalizes a given string
function capitalizeString(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

// displays previously searched cities
function displaySearchedCities(searchedCities) {
  const searchedCitiesList = document.getElementById("searchedCities");
  searchedCitiesList.innerHTML = "";

  for (const city of searchedCities) {
    const li = document.createElement("li");
    li.textContent = capitalizeString(city);

    // Add a click event listener to each saved city
    li.addEventListener("click", function () {
      getForecast(city);
    });

    searchedCitiesList.appendChild(li);
  }
}

// displays previously searched cities on page load
document.addEventListener("DOMContentLoaded", function () {
  const searchedCities = localStorage.getItem("searchedCities");
  if (searchedCities) {
    displaySearchedCities(JSON.parse(searchedCities));
  }
});
