export default class AppDate {
    constructor() {
        this.turnOnClockTicking();
    }

    get currentDate() {
        let days = [
            'Sunday',
            'Monday',
            'Tuesday', 
            'Wednesday', 
            'Thursday', 
            'Friday', 
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
        return {
            daypart, 
            timeOfDay,
            hours: timeOfDay === 'AM' ? `${'0'.repeat(2 - String(currentDate.getHours()).length )}${currentDate.getHours()}` : currentDate.getHours() - 12 ,
            minutes: String(currentDate.getMinutes()).length < 2 ? `0${currentDate.getMinutes()}` : currentDate.getMinutes() ,
            day: days[currentDate.getDay()],
            date: currentDate.getDate(),
            month: months[currentDate.getMonth()].slice(0,3),
            year: currentDate.getFullYear(),
        };
        
    }

    async turnOnClockTicking() {
        let currentMs = (new Date()).getMilliseconds();
        await new Promise( (resolve) => setTimeout(() => {
            resolve();
        }, 1000 - currentMs) );
        let timeDelimiter = document.querySelector('#delimiter');
        timeDelimiter.style.animationName = 'ticking';
        this.updateTime();
    }

    updateTime() {
        for (let key in this.currentDate) {
            document.querySelector(`#${key}`).textContent = this.currentDate[key];
        }
        setTimeout( () => this.updateTime() ,60000 - (new Date).getSeconds() * 1000);
    }
}