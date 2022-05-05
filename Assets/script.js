// Global Variables
var apiKey = "daf213d286fa80ce97ce11a2f32cdb53";
var today = moment().format('L');
var searchHistoryList = [];
// todayContainer = document.getElementById("cityDetail");

// getting the current weather condition for a specific city requested by user(s)
function currentWeather(city) {
    var requestURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

    $.ajax({
        url: requestURL,
        method: "GET"
    }).then(function(cityWeatherResponse) {
        console.log(cityWeatherResponse);

        // targeting the id weatherContent in HTML and append values declared in 'currentCity' variable
        $("#weatherContent").css("display", "block");
        $("#cityDetail").empty();

        var iconCode = cityWeatherResponse.weather[0].icon;
        var iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        var currentCity = `
            <h2 id="currentCity">
                ${cityWeatherResponse.name} ${today} <img src="${iconUrl}" alt="${cityWeatherResponse.weather[0].description}" />
            </h2>
            <p>Temp: ${cityWeatherResponse.main.temp} °F</p>
            <p>Humidity: ${cityWeatherResponse.main.humidity}%</p>
            <p>Wind Speed: ${cityWeatherResponse.wind.speed} MPH</p>
        `;

        $("#cityDetail").append(currentCity);

        // Get UV index
        var lat = cityWeatherResponse.coord.lat;
        var lon = cityWeatherResponse.coord.lon;
        var uvResponseUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        
        $.ajax({
            url: uvResponseUrl,
            method: "GET"
        }).then(function(uvResponse) {
            console.log(uvResponse);
            
            let uvIndex = uvResponse.value;
            var uvIndexDisplay = `<p>UV Index:<span id="uvIndexClr" class="px-2 py-2 rounded">${uvIndex}</span></p>`;
           
            $("#cityDetail").append(uvIndexDisplay);
            
            tomorrowsWeather(lat, lon);
            
            // Color indicators of the UV box based on the weather condition(s). Pastel green, #C1E1C1 = favorable. Pastel yelow-orange (#E6CE8D) = moderate. Pastel red (#FF6961) = severe.
            if (uvIndex >= 0 && uvIndex <= 3) {
                $("#uvIndexClr").css("background-color", "#C1E1C1").css("color", "black");
            }
            else if (uvIndex >= 4 && uvIndex <= 8) {
                $("#uvIndexClr").css("background-color", "#E6CE8D").css("color", "black");
            }
            else {
                $("#uvIndexClr").css("background-color", "#FF6961").css("color", "black");
            };
        });
    });
}

// Get the 5-day forecast cards displayed
function tomorrowsWeather(lat, lon) {
    
    var tomorrowsUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`; 

    $.ajax({
        url: tomorrowsUrl,
        method: "GET"
    }).then(function(tomorrowsResponse) {
        console.log(tomorrowsResponse);

        $("#5day").empty();

        for (var i = 0; i < 5; i++) {
            var cityInfo = {
                date: tomorrowsResponse.daily[i].dt,
                icon: tomorrowsResponse.daily[i].weather[0].icon,
                temp: tomorrowsResponse.daily[i].temp.day,
                humidity: tomorrowsResponse.daily[i].humidity,
                wind: tomorrowsResponse.daily[i].wind_speed
            };

            var todaysDate = moment.unix(cityInfo.date).format("MM/DD/YYYY");
            var iconUrl = `<img src="https://openweathermap.org/img/wn/${cityInfo.icon}.png" alt="${tomorrowsResponse.daily[i].weather[0].main}" />`;

            // variable that makes up the properties inside of each card list and append them to id=5day using for loop
            var tomorrowsCard = `
                        <div class ="card m-3 pl-3 bg-primary text-light" style="width: 12rem";>
                            <div class ="card-body text-center">
                                <h5>${todaysDate}</h5>
                                <p>${iconUrl}</p>
                                <p>Temp: ${cityInfo.temp}°F</p>
                                <p>Wind: ${cityInfo.wind} MPH<p>
                                <p>Humidity: ${cityInfo.humidity}%</p>
                            </div>
                        </div>   
                `;

            $("#5day").append(tomorrowsCard);
        }
    });
}

// addEventListener on search button
$("#searchBtn").on("click", function(event){
    event.preventDefault();

    var city = $("#inputCity").val().trim();
    currentWeather(city);
    if(!searchHistoryList.includes(city)) {
        searchHistoryList.push(city);
        var citySearched = `<li class="list-group-item">${city}</li>`;
        
        $("#searchHistory").append(citySearched);

    };

    // save entries of initially an empty array of search history to the localStorage
    localStorage.setItem("city", JSON.stringify(searchHistoryList));
    console.log(searchHistoryList);
});

// Clear list button to clear search history on the browser and local storage
$("#clearBtn").on("click", function() {
    searchHistoryList = [];
    localStorage.removeItem("city");
    $("#searchHistory").html("");
})

$(document).on("click", ".list-group-item", function(event) {
    var cityList = $(event.target).text();
    currentWeather(cityList);
});

// Parse my data from localStorage to display search history
$(document).ready(function() {
    var searchArray = JSON.parse(localStorage.getItem("city"));
    
    if (searchArray !== null) {
        // searchHistoryList = searchArray;
        // for(let i = 0; i < searchHistoryList.length; i++) {
        //     var city = $("#inputCity").val().trim();
        //     var citySearched = `<li class="list-group-item">${city}</li>`;
        
        //     $("#searchHistory").append(citySearched);
        // }
        var lastSearchIndex = searchArray.length - 1;
        var lastSearchCity = searchArray[lastSearchIndex];

        currentWeather(lastSearchCity);
    }
});