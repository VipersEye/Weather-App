export default class App {

    constructor(
        dateModule, 
        weatherModule, 
        animationsModule, 
        playerModule, 
        sliderModule
    ) { 

        this.date = dateModule;
        this.weather = weatherModule;
        this.animations = animationsModule;
        this.player = playerModule;
        this.slider = sliderModule;

        let applySettingsBtn = document.querySelector('.settings__btn_apply');
        applySettingsBtn.addEventListener('click', this.applySettings.bind(this));

        let closeSettingsBtn = document.querySelector('.settings__btn_close');
        closeSettingsBtn.addEventListener('click', this.closeSettings);
    }

    async start() {
        await this.setInitialSettings();
        this.date.start();
        this.weather.start();
        this.animations.start();
        this.player.start();
        this.slider.start();
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
                theme: 252,
                volume: 0.5,
            };
            localStorage.setItem('settings', JSON.stringify(defaultSettings));
        }

        let settings = JSON.parse( localStorage.getItem('settings') );
        document.querySelector('#username').textContent = settings.username;
        document.querySelector('#input-username').value = settings.username;
        document.querySelector(`.settings__input_radio[value="${settings.units}"]`).checked = true;
        document.querySelector(`.settings__input_radio[value="${settings.animations ? 'on' : 'off'}"]`).checked = true;
        document.querySelector('#input-theme').value = settings.theme;
        document.documentElement.style.setProperty('--main-clr', settings.theme);
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
            let theme = +document.querySelector('#input-theme').value;
            let volume = +document.querySelector('#input-volume').value;
            
            let settings = {
                username,
                units,
                animations,
                theme,
                volume,
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