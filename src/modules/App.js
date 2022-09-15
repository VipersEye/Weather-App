export default class App {
    static #instance = null;

    constructor(AppDate, AppWeather) {
        if (App.#instance) return App.#instance;
        App.#instance = this;
        this.date = new AppDate();
        this.weather = new AppWeather();
    }

}