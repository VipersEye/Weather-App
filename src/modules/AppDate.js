export default class AppDate {
    constructor() {
        this.turnOnClock();
        this.updateAsideDays();
    }

    get currentDate() {
        let currentDate = new Date();

        let timeOfDay = new Date().toLocaleTimeString('en-EN').slice(-2);
        let daypart;
        switch (true) {
            case (currentDate.getHours() >= 5 && currentDate.getHours() < 12):
                daypart = 'morning';
                break;
            case (currentDate.getHours() >= 12 && currentDate.getHours() < 17):
                daypart = 'afternoon';
                break;
            case (currentDate.getHours() >= 17 && currentDate.getHours() < 21):
                daypart = 'evening';
                break;
            case (currentDate.getHours() >= 21 || currentDate.getHours() < 5):
                daypart = 'night';
                break;
        }
        let date =  {
            daypart, 
            timeOfDay,
            hours: `${'0'.repeat(2 - String(currentDate.getHours() % 12).length)}${currentDate.getHours() % 12}`,
            minutes: `${'0'.repeat(2 - String(currentDate.getMinutes()).length)}${currentDate.getMinutes()}`,
            day: currentDate.toLocaleDateString('en-EN', {weekday: "long"}),
            date: currentDate.getDate(),
            month: currentDate.toLocaleDateString('en-EN', {month: "short"}),
            year: currentDate.getFullYear(),
            seconds: currentDate.getSeconds(),
            milliseconds: currentDate.getMilliseconds()
        };
        Object.defineProperties(date, {
            seconds: {writable: true, enumerable: false, configurable: true},
            milliseconds: {writable: true, enumerable: false, configurable: true}
        });
        return date;
    }

    async turnOnClock() {
        let currentMs = (new Date()).getMilliseconds();
        await new Promise( (resolve) => setTimeout(() => {
            resolve();
        }, 1000 - currentMs) );
        let timeDelimiter = document.querySelector('#delimiter');
        timeDelimiter.style.animationName = 'ticking';
        this.updateTimeAndDate();
    }

    updateTimeAndDate() {
        for (let key in this.currentDate) {
            document.querySelector(`#${key}`).textContent = this.currentDate[key];
        }
        setTimeout( () => this.updateTimeAndDate(), 60000 - this.currentDate.seconds * 1000);
    }

    updateAsideDays() {
        let forecastDays = document.querySelectorAll('.forecast__day');
        for (let i = 0, date = new Date(); i < 5; i++, date.setDate(date.getDate() + 1)) {
            if (i === 0) {
                forecastDays[i].textContent = 'Today';
            } else if (i === 1) {
                forecastDays[i].textContent = 'Tomorrow';
            } else {
                date.toLocaleDateString('en-EN', {weekday: 'long'});
            }
            forecastDays[i].closest('.forecast__item').setAttribute('id', `forecast-${date.getDate()}`);
        }

        setTimeout(() => {
           this.updateAsideDays(); 
        }, (86400 - this.currentDate.hours * 3600 - this.currentDate.minutes - this.currentDate.seconds) * 1000 - this.currentDate.milliseconds );
    }
}