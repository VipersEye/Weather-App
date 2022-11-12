import mainStyles from 'styles/main.css';
import variablesStyles from 'styles/variables.css';
import navStyles from 'styles/navigation.css';
import headerStyles from 'styles/header.css';
import mainContentStyles from 'styles/main-content.css';
import sliderStyles from 'styles/slider.css';
import homeStyles from 'styles/home.css';
import settingsStyles from 'styles/settings.css';
import playerStyles from 'styles/player.css';
import forecastStyles from 'styles/forecast.css';
import modalStyles from 'styles/modal.css';
import pushStyles from 'styles/push.css';
import utilityStyles from 'styles/utility.css';
import mediaStyles from 'styles/media.css';


import App from 'modules/App';
import AppDate from 'modules/AppDate';
import AppWeather from 'modules/AppWeather';
import AppAnimations from 'modules/AppAnimations';
import AppPlayer from 'modules/AppPlayer';
import AppSlider from 'modules/AppSlider';

const app = new App
    (
        new AppDate(), 
        new AppWeather(), 
        new AppAnimations(), 
        new AppPlayer(),
        new AppSlider()
    );

app.start();