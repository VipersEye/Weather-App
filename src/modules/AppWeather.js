export default class AppWeather {

    constructor() {
        this.position = null;
        this.city = null;
        new Promise( (resolve, reject) => {
            navigator.geolocation.getCurrentPosition( (position) => {
                this.position = position;
                resolve();
            }, (error) => {
                if (error.code === 1) {
                    alert('Geolocation denied, please choose your city');
                    this.city = prompt();
                    resolve();
                } else {
                    reject(error);
                }
            } );
        } ).then( () => {
            this.updateWeather();
        } ).catch( (error) => {
            console.log(`unknown error ${error.code}: ${error.message}`);
        } );        
    }

    async updateWeather() {
        let weatherRowData = await this.getWeather();
        let weatherData = this.reduceWeatherData(weatherRowData);
        this.updateCurrentWeather(weatherData);
        this.updateForecastWeather(weatherData);
        
        setTimeout(() => {
            this.updateWeather();
        }, 3 * 3600 * 1000);
    }

    async updateForecastWeather(weatherData) {
        document.querySelector('#current-weather').textContent = weatherData.current.weather;
        let forecastDaylight = document.querySelector('.forecast__daylight-times');
        if (new Date() < weatherData.current.time.sunrise) {
            forecastDaylight.children[0].textContent = `Sunset ${weatherData.current.time.sunset.toLocaleTimeString('en-US').replace(/:\d\d /g, ' ')}`;
            forecastDaylight.children[1].textContent = `Sunrise ${weatherData.current.time.sunrise.toLocaleTimeString('en-US').replace(/:\d\d /g, ' ')}`;
        }

        for (let dayData of weatherData.forecast) {
            let day = document.querySelector(`#forecast-${dayData.date}`);
            if (day === null) continue;
            
            let dayWeather = day.querySelector('.forecast__weather');
            let dayTemp = day.querySelector('.forecast__temp');
            let dayWeatherIcon = day.querySelector('.forecast__img');

            dayWeather.textContent = dayData.avgWeather;
            dayWeatherIcon.setAttribute('src', `./images/icons/weather-icons/${dayData.avgWeather.toLowerCase()}.svg`);
            dayWeatherIcon.setAttribute('alt', dayData.avgWeather);
            dayTemp.textContent = `${dayData.avgTempDay}${weatherData.units.temperature.temp}/${dayData.avgTempNight}${weatherData.units.temperature.temp}`;
        }
    }

    updateCurrentWeather(weatherData) {
        for (let param in weatherData.difference) {
            for (let paramType in weatherData.difference[param]) {
                let weatherParameterCurrent = document.querySelector(`#current-${param}-${paramType}`);
                weatherParameterCurrent.textContent = `${weatherData.current[param][paramType]}${weatherData.units[param][paramType]}`;

                let weatherParameterForecast = document.querySelector(`#forecast-${param}-${paramType}`);
                weatherParameterForecast.textContent = `${weatherData.difference[param][paramType].value}${weatherData.units[param][paramType]}`;
                weatherParameterForecast.classList.remove(
                    'weather__param-forecast_inc', 
                    'weather__param-forecast_dec', 
                    'weather__param-forecast_same'
                );
                weatherParameterForecast.classList.add(`weather__param-forecast_${weatherData.difference[param][paramType].change}`);
            }
        }        
    }

    reduceWeatherData(weatherRowData) {
        const reduceCurrentData = (weatherFullData) => {

            const degToDirection = (deg) => {
                switch (true) {
                    case (deg < 15 || deg >= 345): return 'North';
                    case (deg >= 15 && deg < 75): return 'NE';
                    case (deg >= 75 && deg < 105): return 'East';
                    case (deg >= 105 && deg < 165): return 'SE';
                    case (deg >= 165 && deg < 195): return 'South';
                    case (deg >= 195 && deg < 255): return 'SW';
                    case (deg >= 255 && deg < 285): return 'West';
                    case (deg >= 285 && deg < 345): return 'NW';
                }
            };

            let temperature = {
                temp: +weatherFullData.main.temp.toFixed(0),
                temp_min: +weatherFullData.main.temp_min.toFixed(0),
                temp_max: +weatherFullData.main.temp_max.toFixed(0)
            };
            let pressure = {
                pressure: weatherFullData.main.pressure,
                sea_level: weatherFullData.main.sea_level
            };
            let wind = {
                direction: degToDirection(+weatherFullData.wind.deg),
                gust: +weatherFullData.wind.gust?.toFixed(0) ?? 0,
                speed: +weatherFullData.wind.speed.toFixed(0)
            };
            let humidity = {
                humidity: weatherFullData.main.humidity
            };
            return {temperature, pressure, humidity, wind};
        };

        const reduceForecastData = (forecastList) => {
            const avgTemp = (tempData) => +(tempData.reduce( (sum, temp) => sum + temp ,0) / tempData.length).toFixed(0);
            const avgWeather = (weatherData) => Object.entries(weatherData.reduce( (obj, weather) => {
                if (!obj[weather]) obj[weather] = 0;
                obj[weather]++;
                return obj;
            }, {} )).sort((w1 ,w2) => w2[1] - w1[1])[0][0];
            return forecastList
                .map( (step) => {
                    return {
                        date: new Date(step.dt * 1000),
                        weather: weatherTypes[step.weather[0].main],
                        temp: +step.main.temp.toFixed(0)
                    };
                } )
                .reduce( (forecast, step) => {
                    if (forecast.find((day) => day.date === step.date.getDate()) === undefined) {
                        forecast.push({
                            date: step.date.getDate(),
                            tempDayData: [],
                            tempNightData: [],
                            weatherData: []
                        });
                    }
                    let day = forecast.find((day) => day.date === step.date.getDate());
                    day.weatherData.push(step.weather);
                    if (step.date.getHours() < 20 && step.date.getHours() > 8) {
                        day.tempDayData.push(step.temp);
                    } else {
                        day.tempNightData.push(step.temp);
                    }
                    return forecast;
                }, [])
                .map((day) => {
                    return {
                        date: day.date,
                        avgTempDay: avgTemp(day.tempDayData),
                        avgTempNight: avgTemp(day.tempNightData),
                        avgWeather: avgWeather(day.weatherData)
                    };
                });
        };
        
        let {weather: currentWeatherData, forecast: forecastWeatherData} = weatherRowData;
        forecastWeatherData.list.unshift(currentWeatherData);

        let weatherTypes = {
            Clear: 'Clear',
            Clouds: 'Party Cloudy',
            Rain: 'Rain',
            Snow: 'Snow'
        };

        let weatherData = {
            units: {
                temperature: {
                    temp: '°',
                    temp_min: '°',
                    temp_max: '°'
                },
                pressure: {
                    pressure: ' hpa',
                    sea_level: ' hpa'
                },
                humidity: {
                   humidity: '%'
                },
                wind: {
                    speed: ' m/s',
                    direction: '',
                    gust: ' m/s'
                }
            },
            current: reduceCurrentData(currentWeatherData),
            forecast: reduceForecastData(forecastWeatherData.list),
            closest: reduceCurrentData(forecastWeatherData.list[1]),
            difference: {},
        };

        Object.defineProperties(
            weatherData.current, {
                weather: {
                    value: weatherTypes[weatherRowData.weather.weather[0].main],
                    configurable: true,
                    enumerable: false,
                    writable: true
                },
                time: {
                    value: {
                        sunrise: new Date(currentWeatherData.sys.sunrise * 1000),
                        sunset: new Date(currentWeatherData.sys.sunset * 1000)
                    },
                    configurable: true,
                    enumerable: false,
                    writable: true
                }
            }
        );

        for (let param in weatherData.current) {
            weatherData.difference[param] = {};
            for (let paramType in weatherData.current[param]) {
                if (paramType === 'direction') {
                    weatherData.difference[param][paramType] = {
                        value: weatherData.closest[param][paramType]
                    };
                    continue;
                }
                weatherData.difference[param][paramType] = {
                    value: Math.abs(weatherData.current[param][paramType] - weatherData.closest[param][paramType]).toFixed(0),
                    change: weatherData.closest[param][paramType] > weatherData.current[param][paramType] ? 'inc' :
                    weatherData.closest[param][paramType] < weatherData.current[param][paramType] ? 'dec' : 'same' ,
                };
            }
        }
        console.log(weatherData);
        return weatherData;
    }

    async getWeather() {
        try {
            let urlWeather = this.generateFetchURL('weather');
            let responseWeather = await fetch(urlWeather);
            let weather = await responseWeather.json();

            if (weather.message === 'city not found') throw new Error(weather.message);

            let urlForecast = this.generateFetchURL('forecast');
            let responseForecast = await fetch(urlForecast);
            let forecast = await responseForecast.json();

            console.log(weather);
            console.log(forecast);

            return {weather, forecast};

        } catch (error) {

            if (error.message === 'city not found') {
                alert(`${this.city} not found, try again`);
                this.city = prompt();
                this.updateWeather();
            } else if (error.message === 'Failed to fetch') {
                alert('Error: check your internet connection and try again');
                await new Promise( (resolve) => setTimeout( () => resolve() , 60000) );
                this.updateWeather();
            } else {
                alert('Something went wrong :(');
            }

        }
    }

    generateFetchURL = (type) => {
        let url = new URL(`https://api.openweathermap.org/data/2.5/${type}`);           
        if (this.position) {
            url.searchParams.set('lat', this.position.coords.latitude.toFixed(2));
            url.searchParams.set('lon', this.position.coords.longitude.toFixed(2));
        } else {
            url.searchParams.set('q', this.city);
        }
        url.searchParams.set('appid', '949e7c85a5e24668e40350ebc260b5ad');
        url.searchParams.set('units', 'metric');
        return url;
    };
}