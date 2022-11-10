import mainCss from 'styles/main.css';

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