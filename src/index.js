import mainCss from 'styles/main.css';

import App from 'modules/App';
import AppDate from 'modules/AppDate';
import AppWeather from 'modules/AppWeather';
import AppAnimations from 'modules/AppAnimations';

const app = new App(AppDate, AppWeather, AppAnimations);