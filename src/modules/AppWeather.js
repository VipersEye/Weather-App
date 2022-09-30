export default class AppWeather {

    constructor() {
        this.position = null;
        this.city = null;
        this.weatherData = null;
        new Promise( (resolve, reject) => {
            navigator.geolocation.getCurrentPosition( 
                (position) => {
                    this.position = position;
                    resolve();
                }, 
                async (error) => {
                    if (error.code === 1) {
                        alert('Geolocation denied, please choose your city');
                        await this.requestCity();
                        resolve();
                    } else {
                        reject(error);
                    }
                } 
            );
        } ).then( () => {
            this.startApp();
        } ).catch( (error) => {
            console.log(`unknown error ${error.code}: ${error.message}`);
        } );
    }

    async requestCity() {
        let modalCity = document.querySelector('.modal_city');
        let modalCityInput = document.querySelector('.modal-city__input');
        let modalCityBtn = document.querySelector('.modal-city__btn');
        modalCity.showModal();

        await new Promise( (resolve) => {
            modalCityBtn.addEventListener('click', () => resolve());
        } );

        let cityName = modalCityInput.value;
        modalCityInput.value = '';
        this.city = cityName;
    }

    async startApp() {
        console.log('start app');
        await this.setWeather();
        this.updateWeather();
        this.setInitialStateChart();

        const weatherDataUpdater = () => {
            setTimeout( async () => {
                await this.setWeather();
            }, 3600 * 1000);
        };

        weatherDataUpdater();
    }

    updateWeather() {
        console.log('update weather');
        this.updateCurrentWeather();
        this.updateForecastWeather();
        
        setTimeout(() => {
            this.updateWeather();
        }, 3 * 3600 * 1000);
    }

    async updateForecastWeather() {
        document.querySelector('#current-weather').textContent = this.weatherData.current.weather;

        for (let dayData of this.weatherData.forecast) {
            let day = document.querySelector(`#forecast-${dayData.date}`);
            if (day === null) continue;
            
            let dayWeather = day.querySelector('.forecast__weather');
            let dayTemp = day.querySelector('.forecast__temp');
            let dayWeatherIcon = day.querySelector('.forecast__img');

            dayWeather.textContent = dayData.avgWeather;
            dayWeatherIcon.setAttribute('src', `./images/icons/weather-icons/${dayData.avgWeather.toLowerCase()}.svg`);
            dayWeatherIcon.setAttribute('alt', dayData.avgWeather);
            dayTemp.textContent = `${dayData.avgTempDay}${this.weatherData.units.temperature.temp}/${dayData.avgTempNight}${this.weatherData.units.temperature.temp}`;
        }
    }

    updateCurrentWeather() {
        for (let param in this.weatherData.difference) {
            for (let paramType in this.weatherData.difference[param]) {
                let weatherParameterCurrent = document.querySelector(`#current-${param}-${paramType}`);
                weatherParameterCurrent.textContent = `${this.weatherData.current[param][paramType]}${this.weatherData.units[param][paramType]}`;

                let weatherParameterForecast = document.querySelector(`#forecast-${param}-${paramType}`);
                weatherParameterForecast.textContent = `${this.weatherData.difference[param][paramType].value}${this.weatherData.units[param][paramType]}`;
                weatherParameterForecast.classList.remove(
                    'weather__param-forecast_inc', 
                    'weather__param-forecast_dec', 
                    'weather__param-forecast_same'
                );
                weatherParameterForecast.classList.add(`weather__param-forecast_${this.weatherData.difference[param][paramType].change}`);
            }
        }        
    }

    async setInitialStateChart() {

        // console.log('ini');
        
        // let currentTime = new Date(  new Date().setMinutes( new Date().getMinutes() + 458) );
        // console.log(currentTime);
        let currentTime = new Date();
        let {sunset, sunrise} = this.weatherData.current.time;

        if ( currentTime > sunset ) {
            sunrise = new Date(sunrise.setDate(sunrise.getDate() + 1));
        } else if (currentTime < sunset && currentTime < sunrise) {
            sunset = new Date(sunset.setDate(sunset.getDate() - 1));
        }

        let forecastDaylight = document.querySelector('.forecast__daylight-times');
        let timeSortedArr = [sunset, sunrise].sort( (time1, time2) => time1 - time2 );
        let [leftSideBlock, rightSideBlock] = timeSortedArr.map( (time) => `${time.toLocaleTimeString('en-US').includes('AM') ? 'Sunrise' : 'Sunset'} ${time.toLocaleTimeString('en-US').replace(/:\d\d /g, ' ')}`);

        forecastDaylight.children[0].textContent = leftSideBlock;
        forecastDaylight.children[1].textContent = rightSideBlock;
        
        let percentCurrent = +( (currentTime - timeSortedArr[0]) / (timeSortedArr[1] - timeSortedArr[0]) ).toFixed(2);
        let degCurrent = +getComputedStyle(document.body).getPropertyValue('--chart-deg').slice(0, -3);
        degCurrent = degCurrent + (67 * percentCurrent);
        document.documentElement.style.setProperty('--chart-deg', `${degCurrent}deg`);

        // console.log(percentCurrent, degCurrent);

        let percentRest = +(1 - percentCurrent).toFixed(2);
        let degRest = 67 * percentRest;
        let timeRest = timeSortedArr[1] - currentTime;
        let timeStep = timeRest / degRest / 10;
        const degStep = 0.1;


        // console.log(percentRest, degRest, timeRest, timeStep);
        // console.log(degStep * (timeRest / timeStep) , degRest);
        // console.log(degRest / degStep * timeStep , timeRest);

        const updateChart = () => {
            degCurrent += degStep;
            document.documentElement.style.setProperty('--chart-deg', `${degCurrent}deg`);
            let timerId = setTimeout(() => {
                // console.log(new Date());
                // console.log(timeSortedArr[1]);
                // console.log(degCurrent);
                if (degCurrent > -56 && new Date() >= timeSortedArr[1]) {
                    // console.log(new Date());
                    clearTimeout(timerId);
                    this.setInitialStateChart();
               } else updateChart(); 
            }, timeStep);
        };

        updateChart();
    }

    async setWeather() {

        console.log('set weather');

        const generateFetchURL = (type) => {
            let url = new URL(`https://api.openweathermap.org/data/2.5/${type}`);           
            if (this.position) {
                url.searchParams.set('lat', this.position.coords.latitude.toFixed(2));
                url.searchParams.set('lon', this.position.coords.longitude.toFixed(2));
            } else {
                url.searchParams.set('q', this.city);
            }
            url.searchParams.set('appid', '');
            url.searchParams.set('units', 'metric');
            return url;
        };

        const fetchWeather = async () => {
            try {
                let urlWeather = generateFetchURL('weather');
                let responseWeather = await fetch(urlWeather);
                let weather = await responseWeather.json();
    
                if (weather.message === 'city not found') throw new Error(weather.message);
    
                let urlForecast = generateFetchURL('forecast');
                let responseForecast = await fetch(urlForecast);
                let forecast = await responseForecast.json();
    
                console.log(weather);
                console.log(forecast);
    
                return {weather, forecast};
    
            } catch (error) {
    
                if (error.message === 'city not found') {
                    alert(`${this.city} not found, try again`);
                    await this.requestCity();
                    this.startApp();
                } else if (error.message === 'Failed to fetch') {
                    alert('Error: check your internet connection and try again');
                    await new Promise( (resolve) => setTimeout( () => resolve() , 60000) );
                    this.startApp();
                } else {
                    alert('Something went wrong :(');
                }
    
            }
        };

        const reduceWeatherData = (weatherRowData) => {
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
                    }).map((day) => {
                        if (isNaN(day.avgTempDay)) day.avgTempDay = day.avgTempNight;
                        else if (isNaN(day.avgTempNight)) day.avgTempNight = day.avgTempDay;
                        return day;
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
                date: new Date(),
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
        };
    
        let weatherRowData = await fetchWeather();
        let weatherData = reduceWeatherData(weatherRowData);
        this.weatherData = weatherData;  
    }
}