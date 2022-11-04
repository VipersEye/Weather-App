export default class App {
    static #instance = null;

    constructor(AppDate, AppWeather, AppAnimations, AppPlayer) {
        // singleton

        if (App.#instance) return App.#instance;
        App.#instance = this; 

        // settings

        (async () => {
            await this.setInitialSettings();
            this.date = new AppDate();
            this.weather = new AppWeather();
            this.animations = new AppAnimations();
            this.player = new AppPlayer();
        })();

        // listeners

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

            currentActiveContent?.classList.toggle('content_show');
            currentActiveContent?.classList.toggle('content_hidden');

            nextShowContent?.classList.toggle('content_show');
            nextShowContent?.classList.toggle('content_hidden');

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

        let applySettingsBtn = document.querySelector('.settings__btn_apply');
        applySettingsBtn.addEventListener('click', this.applySettings.bind(this));

        let closeSettingsBtn = document.querySelector('.settings__btn_close');
        closeSettingsBtn.addEventListener('click', this.closeSettings);
    }

    async setInitialSettings() {
        const showModalUsername = async () => {
            let modalUsername = document.querySelector('.modal');
            let modalUsernameHeader = modalUsername.querySelector('.modal__header');
            let modalUsernameInput = modalUsername.querySelector('.modal__input');
            let modalUsernameBtn = modalUsername.querySelector('.modal__btn');
            modalUsernameHeader.textContent = 'Enter your name';
            modalUsernameInput.value = '';
            modalUsername.showModal();
            console.log('show modal');
            await new Promise( (resolve) => {
                const modalEventListener = () => {
                    console.log('modal click username');
                    
                    if (this.checkUsernameValidity(modalUsernameInput)) {
                        modalUsernameBtn.removeEventListener('click', modalEventListener);
                        resolve();
                    }; 
                };

                modalUsernameBtn.addEventListener('click', modalEventListener);
                console.log('eventL');
            } );
            return modalUsernameInput.value;
        };

        if (localStorage.length === 0) {
            let username = await showModalUsername();
            let defaultSettings = {
                username,
                units: 'metric',
                animations: false,
                volume: 0.5
            };
            localStorage.setItem('settings', JSON.stringify(defaultSettings));
        }

        let settings = JSON.parse( localStorage.getItem('settings') );
        document.querySelector('#username').textContent = settings.username;
        document.querySelector('#input-username').value = settings.username;
        document.querySelector(`.settings__input_radio[value="${settings.units}"]`).checked = true;
        document.querySelector(`.settings__input_radio[value="${settings.animations ? 'on' : 'off'}"]`).checked = true;
        document.querySelector('#input-volume').value = settings.volume;
        document.documentElement.style.setProperty('--range-saturation', `${settings.volume * 100}%`);
        document.querySelector('#btn-volume use').setAttribute('xlink:href',`#volume-icon-${settings.volume > 0.66 ? 'high' : settings.volume < 0.67 && settings.volume > 0.33 ? 'medium' : settings.volume < 0.34 && settings.volume > 0 ? 'low' : 'mute'}`);
    }

    checkUsernameValidity(usernameInput) {
        let errorMessage = '';
        let username = usernameInput.value;
        switch (true) {
            case (/^[a-z]+| [a-z]+/.test(username)):
                errorMessage = 'Name must begin with uppercase letter';
                break;
            case (/[^A-Za-z ]/.test(username)):
                errorMessage = 'Name should contain only latin letters';
                break;
            case (username.length < 1 || username.length > 20):
                errorMessage = 'Name min length is 1 and max length is 20 symbols';
        }
        usernameInput.setCustomValidity(errorMessage);
        return usernameInput.reportValidity();
    }    

    async applySettings() {
        const storeSettings = () => {
            let username = document.querySelector('#input-username').value;
            let units = document.querySelector('.settings__input_radio[name="temp-metric"]:checked').value;
            let animations = document.querySelector('.settings__input_radio[name="animations"]:checked').value === 'on';
            let volume = +document.querySelector('#input-volume').value;
            
            let settings = {
                username,
                units,
                animations,
                volume
            };
            localStorage.setItem('settings', JSON.stringify(settings));
        };

        let usernameInput = document.querySelector('#input-username');
        if (!this.checkUsernameValidity(usernameInput)) return;

        storeSettings();

        let usernameElem = document.querySelector('#username');
        usernameElem.textContent = JSON.parse( localStorage.getItem('settings') ).username;
        await this.weather.updateWeather();
        this.animations.setAnimations();

        await this.weather.showAlert('success', 'Settings have been successfully applied');
    }

    closeSettings() {
        document.querySelector('#home').dispatchEvent(new Event('click'));
    }

}