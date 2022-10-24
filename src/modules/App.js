export default class App {
    static #instance = null;

    constructor(AppDate, AppWeather) {
        if (App.#instance) return App.#instance;
        App.#instance = this;
        this.date = new AppDate();
        this.weather = new AppWeather();


        let weatherParameters = document.querySelectorAll('.weather__grid-item');
        weatherParameters.forEach( (elem) => {
            elem.addEventListener('mousemove', (e) => {
                let weatherParameter = e.currentTarget;
                let height = weatherParameter.offsetHeight;
                let rect = weatherParameter.getBoundingClientRect();
                let mousePosY = e.clientY - rect.top;
                if (mousePosY <= height / 2) {
                    weatherParameter.classList.remove('weather__grid-item_hover_down');
                    weatherParameter.classList.add('weather__grid-item_hover_up');
                } else {
                    weatherParameter.classList.remove('weather__grid-item_hover_up');
                    weatherParameter.classList.add('weather__grid-item_hover_down');
                }
            });

            elem.addEventListener('click', (e) => {
                let weatherParameter = e.currentTarget;
                let slider = weatherParameter.querySelector('.weather__param-slider');
                let currentSlideNumber = +slider.getAttribute('current');
                let scroll = weatherParameter.classList.contains('weather__grid-item_hover_down') ? 'down' : 'up' ;
                let numberOfSlides = slider.children.length;
                let nextSlide;
            
                if (scroll === 'down') {
                    if (currentSlideNumber + 1 > numberOfSlides - 1) return;
                    slider.setAttribute('current', currentSlideNumber + 1);
                    nextSlide = slider.children[currentSlideNumber + 1];
                } else {
                    if (currentSlideNumber - 1 < 0) return; 
                    slider.setAttribute('current', currentSlideNumber - 1);
                    nextSlide = slider.children[currentSlideNumber - 1];
                }

                let paramIcon = nextSlide.querySelector('.weather__param-icon');
                let paramName = nextSlide.querySelector('.weather__param-name');
                let paramValue = nextSlide.querySelector('.weather__param-value');
                let paramForecast = nextSlide.querySelector('.weather__param-forecast');
                
                paramIcon.classList.add(`slide-${scroll}`);
                paramName.classList.add(`slide-${scroll}`, 'slide_delay_low');
                paramValue.classList.add(`slide-${scroll}`, 'slide_delay_medium');
                paramForecast.classList.add(`slide-${scroll}`, 'slide_delay_high');

                let sliderHeight = slider.offsetHeight;
                slider.scrollTop = scroll === 'down' ? slider.scrollTop + sliderHeight : slider.scrollTop - sliderHeight;

                [paramIcon, paramName, paramValue, paramForecast].forEach((paramPart) => {
                    const removeAnimationClass = function remover(e) {
                        paramPart.classList.remove(`slide-${scroll}`);
                        e.target.removeEventListener('animationend', remover );
                    };
                    paramPart.addEventListener('animationend', removeAnimationClass);
                });
            });

            elem.addEventListener('mouseleave', (e) => {
                let weatherParameter = e.currentTarget;
                weatherParameter.classList.remove('weather__grid-item_hover_down', 'weather__grid-item_hover_up');
            });
        } );

        const toggleMainContent = (e) => {
            let navBtn = e.currentTarget;
            let currentActiveBtn = [...navBtns].find((btn) => btn.classList.contains('nav__btn_active'));
            currentActiveBtn.classList.remove('nav__btn_active');
            navBtn.classList.add('nav__btn_active');

            let mainContent = document.querySelector('.main');
            let mainContentWidth = mainContent.offsetWidth;
            let mainContentHeight = mainContent.offsetHeight;
            let togglerRadius = `${Math.ceil((mainContentWidth ** 2 + mainContentHeight ** 2) ** 0.5)}px`;
            document.documentElement.style.setProperty('--toggler-radius', togglerRadius);

            let blockTogglerOn = document.querySelector('#first-toggler');
            let blockTogglerOff = document.querySelector('#second-toggler');

            blockTogglerOn.addEventListener('animationend', () => {
                blockTogglerOff.classList.add('toggler_off');
            });
            blockTogglerOff.addEventListener('animationend', () => {
                blockTogglerOn.classList.remove('toggler_on');
                blockTogglerOff.classList.remove('toggler_off');
            });
            blockTogglerOn.classList.add('toggler_on');
        };

        let navBtns = document.querySelectorAll('.nav__btn');
        navBtns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                if (!e.currentTarget.classList.contains('nav__btn_active')) {
                    toggleMainContent(e);
                }
            });
        });
    }

}