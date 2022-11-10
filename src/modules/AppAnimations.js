export default class AppAnimations {
    constructor() {}

    start() {
        this.setAnimations();
    }

    setAnimations() {
        if (JSON.parse(localStorage.getItem('settings')).animations) {
            this.turnOnAnimations();
        } else {
            this.turnOffAnimations();
        }
    }

    async turnOnAnimations() {
        let currentMs = (new Date()).getMilliseconds();
        await new Promise( (resolve) => setTimeout(() => {
            resolve();
        }, 1000 - currentMs) );
        let timeDelimiter = document.querySelector('#delimiter');
        timeDelimiter.classList.add('ticking');

        let starIcons = document.querySelectorAll('.icon-star');
        starIcons.forEach((starIcon, i) => {
            starIcon.classList.add(`star-animation_${i + 1}`);
        });

        let moonIcon = document.querySelector('.icon-moon');
        moonIcon.classList.add('moon-rotate');
    }

    turnOffAnimations() {
        let timeDelimiter = document.querySelector('#delimiter');
        timeDelimiter.classList.remove('ticking');

        let starIcons = document.querySelectorAll('.icon-star');
        starIcons.forEach((starIcon, i) => {
            starIcon.classList.remove(`star-animation_${i + 1}`);
        });

        let moonIcon = document.querySelector('.icon-moon');
        moonIcon.classList.remove('moon-rotate');
    }

}