export default class AppDate {
    constructor() {
        this.turnOnClock();
        this.updateAsideDays();
    }

    get currentDate() {
        let days = [
            'Sunday',
            'Monday',
            'Tuesday', 
            'Wednesday', 
            'Thursday', 
            'Friday', 
            'Saturday', 
        ];
        let months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];
        let currentDate = new Date();

        let timeOfDay = +currentDate.getHours() < 12 ? 'AM' : 'PM';
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
            hours: timeOfDay === 'AM' ? `${'0'.repeat(2 - String(currentDate.getHours()).length )}${currentDate.getHours()}` : currentDate.getHours() - 12 ,
            minutes: String(currentDate.getMinutes()).length < 2 ? `0${currentDate.getMinutes()}` : currentDate.getMinutes() ,
            day: days[currentDate.getDay()],
            date: currentDate.getDate(),
            month: months[currentDate.getMonth()].slice(0,3),
            year: currentDate.getFullYear(),

            days,
            seconds: currentDate.getSeconds(),
            milliseconds: currentDate.getMilliseconds()
        };
        Object.defineProperties(date, {
            days: {writable: true, enumerable: false, configurable: true},
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
        setTimeout( () => this.updateTimeAndDate() ,60000 - this.currentDate.seconds * 1000);
    }

    updateAsideDays() {
        let forecastDays = document.querySelectorAll('.forecast__day');
        let {days, day:today} = this.currentDate;
        for (let i = days.indexOf(today), date = new Date(), j = 0; j < 5; i++, j++, date.setDate(date.getDate() + 1)) {
            if (j === 0) {
                forecastDays[j].textContent = 'Today';
            } else if (j === 1) {
                forecastDays[j].textContent = 'Tomorrow';
            } else {
                forecastDays[j].textContent = days[i % 7];
            }
            forecastDays[j].closest('.forecast__item').setAttribute('id', `forecast-${date.getDate()}`);
        }

        setTimeout(() => {
           this.updateAsideDays(); 
        }, (86400 - this.currentDate.hours * 3600 - this.currentDate.minutes - this.currentDate.seconds) * 1000 - this.currentDate.milliseconds );
    }
}