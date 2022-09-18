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
            let weatherParameterCurrent = document.querySelector(`#current-${param}`);
            weatherParameterCurrent.textContent = `${weather.current[param]}${weather.units[param]}`;

            let weatherParameterForecast = document.querySelector(`#forecast-${param}`);
            weatherParameterForecast.textContent = `${weather.difference[param].value}${weather.units[param]}`;
            weatherParameterForecast.classList.remove('weather__param-forecast_inc', 'weather__param-forecast_dec', 'weather__param-forecast_same');
            weatherParameterForecast.classList.add(`weather__param-forecast_${weather.difference[param].change}`);
        }
    }

    async getWeather() {
        const extractWeatherData = (data) => {
            let {main: {temp: temperature, pressure, humidity}, wind: {speed: wind}} = data;
            temperature = +temperature.toFixed(0);
            wind = +wind.toFixed(0);
            return {temperature, pressure, humidity, wind};
        };
        
        let {weather: currentWeatherData, forecast: forecastWeatherData} = await this.requestWeather();

        let weather = {
            units: {
                temperature: '°',
                pressure: ' hpa',
                humidity: '%',
                wind: ' m/s'
            },
            current: extractWeatherData(currentWeatherData),
            forecast: forecastWeatherData.list,
            closest: extractWeatherData(forecastWeatherData.list[1]),
            difference: {}
        };

        for (let param in weather.current) {
            weather.difference[param] = {
                value: Math.abs(weather.current[param] - weather.closest[param]).toFixed(0),
                change: weather.current[param] > weather.closest[param] ? 'dec' : weather.current[param] < weather.closest[param] ? 'dec' : 'same' ,
            };
        }

        return weather;

    }

    async requestWeather() {
        try {
            let urlWeather = this.generateFetchURL('weather');
            let responseWeather = await fetch(urlWeather);
            let weather = await responseWeather.json();

            console.log(weather);
            if (weather.message === 'city not found') throw new Error(weather.message);

            let urlForecast = this.generateFetchURL('forecast');
            let responseForecast = await fetch(urlForecast);
            let forecast = await responseForecast.json();

            return {weather, forecast};

        } catch (error) {

            console.log(error);
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