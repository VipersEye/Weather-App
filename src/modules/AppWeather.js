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

    updateWeather() {
        this.updateCurrentWeather();
        
        setTimeout(() => {
            this.updateWeather();
        }, 3 * 3600 * 1000);
    }

    async updateCurrentWeather() {
        let weather = await this.getWeather();
        for (let param in weather.difference) {
            for (let paramType in weather.difference[param]) {
                let weatherParameterCurrent = document.querySelector(`#current-${param}-${paramType}`);
                weatherParameterCurrent.textContent = `${weather.current[param][paramType]}${weather.units[param][paramType]}`;

                let weatherParameterForecast = document.querySelector(`#forecast-${param}-${paramType}`);
                weatherParameterForecast.textContent = `${weather.difference[param][paramType].value}${weather.units[param][paramType]}`;
                weatherParameterForecast.classList.remove('weather__param-forecast_inc', 'weather__param-forecast_dec', 'weather__param-forecast_same');
                weatherParameterForecast.classList.add(`weather__param-forecast_${weather.difference[param][paramType].change}`);
            }
        }
    }

    async getWeather() {
        const extractWeatherData = (data) => {

            const degToDirection = (deg) => {
                switch (true) {
                    case (deg < 15 || deg >= 345): return 'North';
                    case (deg >= 15 && deg < 75): return 'Northeast';
                    case (deg >= 75 && deg < 105): return 'East';
                    case (deg >= 105 && deg < 165): return 'Southeast';
                    case (deg >= 165 && deg < 195): return 'South';
                    case (deg >= 195 && deg < 255): return 'Southwest';
                    case (deg >= 255 && deg < 285): return 'West';
                    case (deg >= 285 && deg < 345): return 'Northwest';
                }
            };

            let temperature = {
                temp: +data.main.temp.toFixed(0),
                temp_min: +data.main.temp_min.toFixed(0),
                temp_max: +data.main.temp_max.toFixed(0)
            };
            let pressure = {
                pressure: data.main.pressure,
                sea_level: data.main.sea_level
            };
            let wind = {
                direction: degToDirection(+data.wind.deg),
                gust: +data.wind.gust.toFixed(0),
                speed: +data.wind.speed.toFixed(0)
            };
            let humidity = {
                humidity: data.main.humidity
            };
            return {temperature, pressure, humidity, wind};
        };
        
        let {weather: currentWeatherData, forecast: forecastWeatherData} = await this.requestWeather();

        let weather = {
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
            current: extractWeatherData(currentWeatherData),
            forecast: forecastWeatherData.list,
            closest: extractWeatherData(forecastWeatherData.list[1]),
            difference: {}
        };

        for (let param in weather.current) {
            weather.difference[param] = {};
            for (let paramType in weather.current[param]) {
                if (paramType === 'direction') {
                    weather.difference[param][paramType] = {
                        value: weather.closest[param][paramType]
                    };
                    continue;
                }
                weather.difference[param][paramType] = {
                    value: Math.abs(weather.current[param][paramType] - weather.closest[param][paramType]).toFixed(0),
                    change: weather.closest[param][paramType] > weather.current[param][paramType] ? 'inc' :
                    weather.closest[param][paramType] < weather.current[param][paramType] ? 'dec' : 'same' ,
                };
            }
        }

        return weather;

    }

    async requestWeather() {
        try {
            let urlWeather = this.generateFetchURL('weather');
            let responseWeather = await fetch(urlWeather);
            let weather = await responseWeather.json();

            if (weather.message === 'city not found') throw new Error(weather.message);

            let urlForecast = this.generateFetchURL('forecast');
            let responseForecast = await fetch(urlForecast);
            let forecast = await responseForecast.json();

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