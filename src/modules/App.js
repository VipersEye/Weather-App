export default class App {
    static #instance = null;

    constructor(AppDate) {
        if (App.#instance) return App.#instance;
        App.#instance = this;
        this.date = new AppDate();
    }

}