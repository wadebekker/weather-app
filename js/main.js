$(document).ready(function() {
    // Get devices time and add a class of night or day depending on time
    var dt = new Date();
    var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

    if (dt.getHours() >= 6 && dt.getHours() < 18) {
        $('body').addClass('day');
    } else {
        $('body').addClass('night');
    }

    // We know co-ordinates for cities already so we parse them as variables to match against
    var capetownLat = '-33.93';
    var capetownLong = '18.42';

    var jhbLat = '-26.2';
    var jhbLong = '28.04';

    var dbnLat = '-29.86';
    var dbnLong = '31.03';

    var selectValue = $('.select-city').val();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else { 
        alert("Geolocation is not supported by this browser.");
    }

    function showPosition(position) {
        var currentPosition = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
        var ctPosition = new google.maps.LatLng(capetownLat, capetownLong);
        var jhbPosition = new google.maps.LatLng(jhbLat, jhbLong);
        var dbnPosition = new google.maps.LatLng(dbnLat, dbnLong);

        var betweenHereAndCt = parseFloat(calcDistance(currentPosition, ctPosition));
        var betweenHereAndJhb = parseFloat(calcDistance(currentPosition,jhbPosition));
        var betweenHereAndDbn = parseFloat(calcDistance(currentPosition, dbnPosition));

        console.log('Distance between you and CT: ' + betweenHereAndCt + 'km');
        console.log('Distance between you and JHB: ' + betweenHereAndJhb + 'km');
        console.log('Distance between you and DBN: ' + betweenHereAndDbn + 'km');

        //calculates distance between two points in km's
        function calcDistance(currentPosition, ctPosition){
          return (google.maps.geometry.spherical.computeDistanceBetween(currentPosition, ctPosition) / 1000).toFixed(2);
        }

        if(betweenHereAndCt < betweenHereAndJhb && betweenHereAndCt < betweenHereAndDbn) {
            console.log('Cape Town is closest');
            $('#loading').fadeIn(300);
            var selectValue = $('.select-city').val('capetown');
            getWeather(selectValue);
        } else if (betweenHereAndJhb < betweenHereAndDbn && betweenHereAndJhb < betweenHereAndCt) {
            console.log('Johannesburg is closest');
            $('#loading').fadeIn(300);
            var selectValue = $('.select-city').val('johannesburg');
            getWeather(selectValue);
        } else if (betweenHereAndDbn < betweenHereAndJhb && betweenHereAndDbn < betweenHereAndCt) {
            console.log('Durban is closest');
            $('#loading').fadeIn(300);
            var selectValue = $('.select-city').val('durban');
            getWeather(selectValue);
        }
    }


    // On load check the value of the select box, then load content if a city is selected
    if(selectValue === 'select') {
        console.log('doing nothing...');
    } else {
        $('#loading').fadeIn(300);
        getWeather(selectValue);
    };

    // Retrieve weather on change of select box
    $(".select-city").change(function(event){
        event.preventDefault();

        var selectValue = $('.select-city').val();

        if(selectValue === 'select') {
            console.log('doing nothing...');
        } else {
            $('#results').fadeTo( 300, 0.1 );
            $('#loading').fadeIn(300);
            getWeather(selectValue);
        };
    });

    // Get Weather for specified city 
    function getWeather(selectValue) {
        selectValue = $('.select-city').val();
        $.ajax({
            type:'GET',
            url:'http://api.openweathermap.org/data/2.5/weather?q=' + selectValue + '&units=metric&APPID=39b91d00d78830a4f80037ce7f530814',
            dataType: "jsonp",
            success: function(data) { 
                console.log("Success");
                console.log(data);

                var iconName = data.weather[0].icon;
                var cityName = data.name;
                var description = data.weather[0].description;
                var currentTemp = Math.round(data.main.temp);
                var maxTemp = Math.round(data.main.temp_max);
                var minTemp = Math.round(data.main.temp_min);
                var latitude = data.coord.lat;
                var longitude = data.coord.lon;
                var windSpeed = Math.round(((data.wind.speed)*3600)/1000);
                var windAngle = windDirection();


                $('.icon').attr('src', 'http://openweathermap.org/img/w/' + iconName + '.png');
                $('.city-name').html(cityName);
                $('.description').html(description);
                $('.current-temp span').html(currentTemp);
                $('.max-temp span').html(maxTemp);
                $('.min-temp span').html(minTemp);
                $('.wind-speed span').html(windSpeed);
                $('.wind-direction span').html(windAngle);

                $('.icon').load(function(){
                    $('#loading, .placeholder').fadeOut(200);
                    setTimeout(function(){
                        $('#results').fadeTo( 300, 1 );
                        document.getElementById('map-canvas').style.display="block";
                        initialize(latitude, longitude);
                    },210);
                });

                windSpeedAnimation();

                function initialize(latitude, longitude) {
                    var myLatlng = new google.maps.LatLng(latitude,longitude);
                    var mapOptions = {
                        zoom: 10,
                        center: myLatlng
                    }
                    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

                    var marker = new google.maps.Marker({
                        position: myLatlng,
                        map: map,
                        animation: google.maps.Animation.DROP,
                        title: 'Hello World!'
                    });
                }

                function windDirection() {
                    if(data.wind.deg == undefined) {
                        data.wind.deg = 'Unavailable';
                    } else if(data.wind.deg > 349 && data.wind.deg < 11) {
                        data.wind.deg = 'N';
                    } else if(data.wind.deg > 11 && data.wind.deg < 34) {
                        data.wind.deg = 'NNE';
                    } else if(data.wind.deg > 34 && data.wind.deg < 56) {
                        data.wind.deg = 'NE';
                    } else if(data.wind.deg > 56 && data.wind.deg < 79) {
                        data.wind.deg = 'ENE';
                    } else if(data.wind.deg > 79 && data.wind.deg < 101) {
                        data.wind.deg = 'E';
                    } else if(data.wind.deg > 101 && data.wind.deg < 124) {
                        data.wind.deg = 'ESE';
                    } else if(data.wind.deg > 124 && data.wind.deg < 146) {
                        data.wind.deg = 'SE';
                    } else if(data.wind.deg > 146 && data.wind.deg < 169) {
                        data.wind.deg = 'SSE';
                    } else if(data.wind.deg > 169 && data.wind.deg < 191) {
                        data.wind.deg = 'S';
                    } else if(data.wind.deg > 191 && data.wind.deg < 214) {
                        data.wind.deg = 'SSW';
                    } else if(data.wind.deg > 214 && data.wind.deg < 236) {
                        data.wind.deg = 'SW';
                    } else if(data.wind.deg > 336 && data.wind.deg < 259) {
                        data.wind.deg = 'WSW';
                    } else if(data.wind.deg > 259 && data.wind.deg < 281) {
                        data.wind.deg = 'W';
                    } else if(data.wind.deg > 281 && data.wind.deg < 304) {
                        data.wind.deg = 'WNW';
                    } else if(data.wind.deg > 304 && data.wind.deg < 326) {
                        data.wind.deg = 'NW';
                    } else if(data.wind.deg > 326 && data.wind.deg < 349) {
                        data.wind.deg = 'NNW';
                    }
                    return data.wind.deg;
                };

                function windSpeedAnimation() {
                    if (windSpeed <= 20) {
                        $('.wind-speed-indicator').addClass('stage-one');
                    } else if (windSpeed > 20 && windSpeed < 40 ) {
                        $('.wind-speed-indicator').addClass('stage-two');
                    } else if (windSpeed > 40) {
                        $('.wind-speed-indicator').addClass('stage-three');
                    }
                };
            },
            error: function(){ 
                alert('Failed!');
            }
        });

        // Once city has been selected, keep checking every 60 seconds
        /*
        setTimeout(function(){
            getWeather(selectValue);
        }, 60000);
        */
    };
});