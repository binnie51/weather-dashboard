const sampleData = 
{"coord":{"lon":-75.1638,"lat":39.9523},
"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04n"}],
"base":"stations","main":{"temp":286.12,"feels_like":284.93,"temp_min":282.62,"temp_max":288.14,"pressure":1016,"humidity":56},
"visibility":10000,"wind":{"speed":1.34,"deg":288,"gust":3.58},
"clouds":{"all":100},"dt":1650002150,
"sys":{"type":2,"id":2037403,"country":"US","sunrise":1650018159,"sunset":1650065896},
"timezone":-14400,"id":4560349,
"name":"Philadelphia",
"cod":200};

var apiKey = "daf213d286fa80ce97ce11a2f32cdb53";
var today = moment().format('L');
var searchHistoryList = [];

// getting the current weather condition for a specific city requested by user(s)
function currentWeather(city) {
    var requestURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

    $.ajax({
        url:requestURL,
        method: "GET"
    }).then(function(cityWeatherResponse) {
        console.log(cityWeatherResponse);

        // targeting the id weatherContent in HTML and append values declared in 'currentCity' variable
        $("#weatherContent").css("display", "block");
        $("#cityDetail").empty();

        var iconCode = cityWeatherResponse.weather[0].icon;
        var iconUrl = 'https://openweathermap.org/img/wn/${iconCode}.png';


        var currentCity = $(`
        <h2 id="currentCity">
            ${cityWeatherResponse.name} ${today} <img src="${iconUrl}" alt="${cityWeatherResponse.weather[0].description}" />
        </h2>
        <p>Temperature: ${cityWeatherResponse.main.temp} °F</p>
        <p>Humidity: ${cityWeatherResponse.main.humidity}\%</p>
        <p>Wind Speed: ${cityWeatherResponse.wind.speed} MPH</p>
        `);

        $("cityDetail").append(currentCity);

        // UV index
        var lat = cityWeatherResponse.coord.lat;
        var lon = cityWeatherResponse.coord.lon;
        var uvResponseUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        $.ajax({
            url: uvResponseUrl,
            method: "GET"
        }).then(function(uvResponse) {
            console.log(uvResponse);

            let uvIndex = uvResponse.value;
            var uvIndexDisplay = $('<p>UV Index:<span id="uvIndexClr" class="px-2 py-2 rounded">${uvIndex}</span></p>');

            $("#cityDetail").append(uvIndexDisplay);

            tomorrowsWeather(lat, lon);

            // Color indicators of the UV box based on the weather condition(s). Pastel green, #C1E1C1 = favorable. Pastel yelow-orange (#e6ce8d) = moderate. Pastel red (#ff6961) = severe. 
            if (uvIndex >= 0 && uvIndex <= 3) {
                $("#uvIndexClr").css("background-color", "#C1E1C1");
            }
            else if (uvIndex >= 4 && uvIndex <= 8) {
                $("#uvIndexClr").css("background-color", "#e6ce8d");
            }
            else {
                $("#uvIndexClr").css("background-color", "#ff6961");
            };
        });
    });
}

// Get the 5-day forecast
function tomorrowsWeather(lat, lon) {
    
    var tomorrowsUrl = 'https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}'; 

    $.ajax({
        url: tomorrowsUrl,
        method: "GET"
    }).then(function(tomorrowsResponse) {
        console.log(tomorrowsResponse);

        $("#5day").empty();

        for (var i = 0; i < 6; i++) {
            var cityInfo = {
                date: tomorrowsResponse.daily[i].dt,
                icon: tomorrowsResponse.daily[i].weather[0].icon,
                temp: tomorrowsResponse.daily[i].temp.day,
                humidity: tomorrowsResponse.daily[i].humidity
            };

            var todaysDate = moment.unix(cityInfo.date).format("MM/DD/YYYY");
            var iconUrl = '<img src="https://openweathermap.org/img/w/${cityInfo.icon}.png" alt="${tomorrowsResponse.daily[i].weather[0].main}" />';

            

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
        var citySearched = $('<li class="list-group-item">${city}</li>');
        
    };
})