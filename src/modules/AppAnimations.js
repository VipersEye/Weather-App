export default class AppAnimations {
    constructor() {
        const showNextSlide = (e) => {
            let weatherParameter = e.currentTarget;
            let slider = weatherParameter.querySelector('.weather__param-slider');
            let currentSlideNumber = +slider.getAttribute('current');
            let scroll = weatherParameter.classList.contains('weather__home-item_hover_down') ? 'down' : 'up' ;
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
        };

        const addHighlighting = (e) => {
            let weatherParameter = e.currentTarget;
            let height = weatherParameter.offsetHeight;
            let rect = weatherParameter.getBoundingClientRect();
            let mousePosY = e.clientY - rect.top;
            if (mousePosY <= height / 2) {
                weatherParameter.classList.remove('weather__home-item_hover_down');
                weatherParameter.classList.add('weather__home-item_hover_up');
            } else {
                weatherParameter.classList.remove('weather__home-item_hover_up');
                weatherParameter.classList.add('weather__home-item_hover_down');
            }
        };

        const removeHighlighting = (e) => {
            let weatherParameter = e.currentTarget;
            weatherParameter.classList.remove('weather__home-item_hover_down', 'weather__home-item_hover_up');
        };

        const toggleContent = () => {
            let navBtnActiveId = document.querySelector('.nav__btn_active').id; 
            let currentActiveContent = document.querySelector('.content_show');
            let nextShowContent = document.querySelector(`.weather__${navBtnActiveId}`);

            currentActiveContent.classList.remove('content_show');
            currentActiveContent.classList.add('content_hidden');

            nextShowContent.classList.add('content_show');
            nextShowContent.classList.remove('content_hidden');

            blockTogglerOff.classList.add('toggler_off');
        };

        const toggleContentEnd = () => {
            blockTogglerOn.classList.remove('toggler_on');
            blockTogglerOff.classList.remove('toggler_off');
        };

        const toggleContentStart = (e) => {
            if (e.currentTarget.classList.contains('nav__btn_active')) return;

            let navBtn = e.currentTarget;
            let currentActiveBtn = [...navBtns].find((btn) => btn.classList.contains('nav__btn_active'));
            currentActiveBtn.classList.remove('nav__btn_active');
            navBtn.classList.add('nav__btn_active');

            let mainContent = document.querySelector('.main');
            let mainContentWidth = mainContent.offsetWidth;
            let mainContentHeight = mainContent.offsetHeight;
            let togglerRadius = `${Math.ceil((mainContentWidth ** 2 + mainContentHeight ** 2) ** 0.5)}px`;
            document.documentElement.style.setProperty('--toggler-radius', togglerRadius);

            document.querySelector('#first-toggler').classList.add('toggler_on');
        };

        const changeAppTheme = (e) => {
            let newColor = e.target.value;
            document.documentElement.style.setProperty('--main-clr', newColor);
        };

        const changeBtnBg = (e) => {
            let headerBtn = e.currentTarget;            
            let bgToggler = headerBtn.querySelector('.btn-bg-toggler');
            bgToggler.classList.add('header__btn-toggle');
        };

        const showNav = (e) => {
            changeBtnBg(e);
            let nav = document.querySelector('.nav');
            nav.classList.toggle('nav_active');
        };

        const showWeather = (e) => {
            changeBtnBg(e);
            let forecast = document.querySelector('.forecast');
            forecast.classList.toggle('forecast_active');
        };

   
        let weatherParamSliders = document.querySelectorAll('.weather__home-item');
        weatherParamSliders.forEach( (weatherParamSlider) => {
            weatherParamSlider.addEventListener('mousemove', addHighlighting);
            weatherParamSlider.addEventListener('click', showNextSlide);
            weatherParamSlider.addEventListener('mouseleave', removeHighlighting);
        });
        

        let blockTogglerOn = document.querySelector('#first-toggler');
        let blockTogglerOff = document.querySelector('#second-toggler');
        blockTogglerOn.addEventListener('animationend', toggleContent);
        blockTogglerOff.addEventListener('animationend', toggleContentEnd);


        let navBtns = document.querySelectorAll('.nav__btn');
        navBtns.forEach((btn) => {
            btn.addEventListener('click', toggleContentStart);
        });


        let themeInputRange = document.querySelector('#input-theme');
        themeInputRange.addEventListener('input', changeAppTheme);


        let headerBtns = document.querySelectorAll('.header__btn');
        headerBtns.forEach((btn) => {
            btn.addEventListener('animationend', (e) => {
                e.currentTarget.classList.toggle('header__btn_active');
                let bgToggler = e.currentTarget.querySelector('.btn-bg-toggler');
                bgToggler.classList.remove('header__btn-toggle');
            });
            
            if (btn.classList.contains('header__btn_nav')) {
                btn.addEventListener('click', showNav);
            } else if (btn.classList.contains('header__btn_weather')) {
                btn.addEventListener('click', showWeather);
            }
        });
    }

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

        let chartIcon = document.querySelector('.icon-chart');
        chartIcon.classList.add('icon-rotate');

        if (chartIcon.classList.contains('icon-chart_moon')) {
            let starIcons = document.querySelectorAll('.icon-star');
            starIcons.forEach((starIcon, i) => {
                starIcon.classList.add(`star-animation_${i + 1}`);
            });
        }
    }

    turnOffAnimations() {
        let timeDelimiter = document.querySelector('#delimiter');
        timeDelimiter.classList.remove('ticking');

        let starIcons = document.querySelectorAll('.icon-star');
        starIcons.forEach((starIcon, i) => {
            starIcon.classList.remove(`star-animation_${i + 1}`);
        });

        let chartIcon = document.querySelector('.icon-chart');
        chartIcon.classList.remove('icon-rotate');
    }

}