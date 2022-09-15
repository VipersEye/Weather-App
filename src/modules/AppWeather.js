export default class AppWeather {
    constructor() {
        console.log(this.currentWeather);
        this.updateCurrentWeather();
    }

    async updateCurrentWeather() {
        const requestWeather = async (position = false) => {
            let request = new URL('https://api.openweathermap.org/data/2.5/weather');
            
            if (position) {
                request.searchParams.set('lat', position.coords.latitude.toFixed(2));
                request.searchParams.set('lon', position.coords.longitude.toFixed(2));
            } else {
                let city = prompt();
                request.searchParams.set('q', city);
            }
            request.searchParams.set('appid', '949e7c85a5e24668e40350ebc260b5ad');
            request.searchParams.set('units', 'metric');
            

            try {
                let response = await fetch(request);
                let weather = await response.json();
                console.log(weather.name);
                let {main:{temp:temperature, pressure, humidity}, wind:{speed:wind} } = weather;
                
                document.querySelector('#current-temperature').textContent = `${temperature.toFixed(0)}°`;
                document.querySelector('#current-pressure').textContent = `${pressure} hpa`;
                document.querySelector('#current-humidity').textContent = `${humidity}%`;
                document.querySelector('#current-wind').textContent = `${wind} m/s`;
            } catch(error) {
                alert('wrong city try again');
                requestWeather();
            }
        };

        const errorHandler = (error) => {
            alert('You denied permission to your location, print name of city');
            requestWeather();
        };

        navigator.geolocation.getCurrentPosition( requestWeather, errorHandler );
    }
}