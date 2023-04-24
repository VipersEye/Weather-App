(()=>{"use strict";class e{constructor(){}start(){this.updateTimeAndDate(),this.updateAsideDays(),document.documentElement.classList=[this.currentDate.daypart]}get currentDate(){let e,t=new Date,r=(new Date).toLocaleTimeString("en-EN").slice(-2);switch(!0){case t.getHours()>=5&&t.getHours()<12:e="morning";break;case t.getHours()>=12&&t.getHours()<17:e="afternoon";break;case t.getHours()>=17&&t.getHours()<21:e="evening";break;case t.getHours()>=21||t.getHours()<5:e="night"}let a={daypart:e,timeOfDay:r,hours:`${"0".repeat(2-String(t.getHours()%12).length)}${t.getHours()%12}`,minutes:`${"0".repeat(2-String(t.getMinutes()).length)}${t.getMinutes()}`,day:t.toLocaleDateString("en-EN",{weekday:"long"}),date:t.getDate(),month:t.toLocaleDateString("en-EN",{month:"short"}),year:t.getFullYear(),seconds:t.getSeconds(),milliseconds:t.getMilliseconds()};return Object.defineProperties(a,{seconds:{writable:!0,enumerable:!1,configurable:!0},milliseconds:{writable:!0,enumerable:!1,configurable:!0}}),a}async updateTimeAndDate(){let e=(new Date).getMilliseconds();await new Promise((t=>setTimeout((()=>{t()}),1e3-e))),document.documentElement.classList=[this.currentDate.daypart];for(let e in this.currentDate)document.querySelector(`#${e}`).textContent=this.currentDate[e];setTimeout((()=>this.updateTimeAndDate()),6e4-1e3*this.currentDate.seconds)}updateAsideDays(){let e=document.querySelectorAll(".forecast__day");for(let t=0,r=new Date;t<5;t++,r.setDate(r.getDate()+1))e[t].textContent=0===t?"Today":1===t?"Tomorrow":r.toLocaleDateString("en-EN",{weekday:"long"}),e[t].closest(".forecast__item").setAttribute("id",`forecast-${r.getDate()}`);setTimeout((()=>{this.updateAsideDays()}),1e3*(86400-3600*this.currentDate.hours-this.currentDate.minutes-this.currentDate.seconds)-this.currentDate.milliseconds)}}class t{constructor(){}start(){this.settings=settings,this.position=null,this.city=null,this.weatherData=null,new Promise(((e,t)=>{navigator.geolocation.getCurrentPosition((t=>{this.position=t,e()}),(async r=>{1===r.code?(await this.showAlert("alert","Geolocation denied, please choose your city"),await this.requestCity(),e()):t(r)}))})).then((()=>{this.setDataUpdaters()})).catch((async e=>{await this.showAlert("alert",`unknown error ${e.code}: ${e.message}`)}))}async showAlert(e,t){await new Promise((r=>{let a=document.createElement("canvas").getContext("2d");a.font="500 24px poppins";let s=a.measureText(t).width+96,n=`${Math.ceil(s)}px`,i=document.querySelector(".message"),o=i.querySelector(".message__text");let c=function*(){o.textContent=t,o.classList.add("show-message"),yield,i.classList.add("hide"),yield,i.classList.remove("message__alert","message__success","push","hide"),o.classList.remove("show-message"),r()}();i.addEventListener("animationend",(()=>{c.next()})),document.documentElement.style.setProperty("--message-width",n),i.classList.add(`message__${e}`,"push")}))}async requestCity(){let e=document.querySelector(".modal"),t=e.querySelector(".modal__header"),r=e.querySelector(".modal__input"),a=e.querySelector(".modal__btn");t.textContent="Enter the name of your city",r.value="",e.showModal(),await new Promise((e=>{const t=()=>{let s="",n=r.value;switch(!0){case/[0-9]/.test(n):s="City name should contain only latin letters";break;case n.length<1||n.length>20:s="Length of city name should be between 1 and 20 symbols";break;default:s=""}r.setCustomValidity(s),r.reportValidity()&&(a.removeEventListener("click",t),e())};a.addEventListener("click",t)}));let s=r.value;this.city=s}async setDataUpdaters(){await this.updateWeather(),this.setInitialStateChart();const e=()=>{setTimeout((async()=>{await this.updateWeather(),e()}),36e5)};e()}async updateWeather(){await this.setWeather(),this.updateCurrentWeather(),this.updateForecastWeather()}async updateForecastWeather(){document.querySelector("#current-city").textContent=this.weatherData.city,document.querySelector("#current-weather").textContent=this.weatherData.current.weather;for(let e of this.weatherData.forecast){let t=document.querySelector(`#forecast-${e.date}`);if(null===t)continue;let r=t.querySelector(".forecast__weather"),a=t.querySelector(".forecast__temp"),s=t.querySelector(".forecast__img");r.textContent=e.avgWeather,s.setAttribute("src",`./images/icons/weather-icons/${e.avgWeather.toLowerCase()}.svg`),s.setAttribute("alt",e.avgWeather),a.textContent=`${e.avgTempDay}${this.weatherData.units.temperature.temp}/${e.avgTempNight}${this.weatherData.units.temperature.temp}`}}updateCurrentWeather(){for(let e in this.weatherData.difference)for(let t in this.weatherData.difference[e]){document.querySelector(`#current-${e}-${t}`).textContent=`${this.weatherData.current[e][t]}${this.weatherData.units[e][t]}`;let r=document.querySelector(`#forecast-${e}-${t}`);r.textContent=`${this.weatherData.difference[e][t].value}${this.weatherData.units[e][t]}`,r.classList.remove("weather__param-forecast_inc","weather__param-forecast_dec","weather__param-forecast_same"),r.classList.add(`weather__param-forecast_${this.weatherData.difference[e][t].change}`)}}async setInitialStateChart(){let e=new Date,{sunset:t,sunrise:r}=this.weatherData.current.time;e>t?r=new Date(r.setDate(r.getDate()+1)):e<t&&e<r&&(t=new Date(t.setDate(t.getDate()-1)));let a=document.querySelector(".forecast__daylight-times"),s=[t,r].sort(((e,t)=>e-t)),[n,i]=s.map((e=>`${e.toLocaleTimeString("en-US").includes("AM")?"Sunrise":"Sunset"} ${e.toLocaleTimeString("en-US").replace(/:\d\d /g," ")}`));a.children[0].textContent=n,a.children[1].textContent=i;let o=document.querySelector(".icon-chart"),c=n.includes("Sunrise")?"sun":"moon";o.classList.remove("icon-chart_sun","icon-chart_moon"),o.classList.add(`icon-chart_${c}`),o.src=`./images/icons/chart-icons/${c}.svg`,o.alt=`${c} icon`;let l=+((e-s[0])/(s[1]-s[0])).toFixed(2),u=+getComputedStyle(document.body).getPropertyValue("--chart-deg").slice(0,-3);u+=67*l,document.documentElement.style.setProperty("--chart-deg",`${u}deg`);let d=67*+(1-l).toFixed(2),m=(s[1]-e)/d/10;const h=()=>{u+=.1,document.documentElement.style.setProperty("--chart-deg",`${u}deg`);let e=setTimeout((()=>{u>-56&&new Date>=s[1]?(clearTimeout(e),this.setInitialStateChart()):h()}),m)};h()}async setWeather(){const e=e=>{let t=new URL(`https://api.openweathermap.org/data/2.5/${e}`);return this.position?(t.searchParams.set("lat",this.position.coords.latitude.toFixed(2)),t.searchParams.set("lon",this.position.coords.longitude.toFixed(2))):t.searchParams.set("q",this.city),t.searchParams.set("appid","242332545f3bef63dbb3fb922ae08531"),t.searchParams.set("units",`${JSON.parse(localStorage.getItem("settings")).units}`),t};let t=(e=>{const t=e=>{let t={temp:+e.main.temp.toFixed(0),temp_min:+e.main.temp_min.toFixed(0),temp_max:+e.main.temp_max.toFixed(0)},r={pressure:e.main.pressure,sea_level:e.main.sea_level},a={direction:(e=>{switch(!0){case e<15||e>=345:return"North";case e>=15&&e<75:return"NE";case e>=75&&e<105:return"East";case e>=105&&e<165:return"SE";case e>=165&&e<195:return"South";case e>=195&&e<255:return"SW";case e>=255&&e<285:return"West";case e>=285&&e<345:return"NW"}})(+e.wind.deg),gust:+e.wind.gust?.toFixed(0)??0,speed:+e.wind.speed.toFixed(0)};return{temperature:t,pressure:r,humidity:{humidity:e.main.humidity},wind:a}};let{weather:r,forecast:a}=e;a.list.unshift(r);let s={Clear:"Clear",Clouds:"Party Cloudy",Rain:"Rain",Snow:"Snow"},n="metric"===JSON.parse(localStorage.getItem("settings")).units?"°":"K",i={city:r.name,date:new Date,units:{temperature:{temp:n,temp_min:n,temp_max:n},pressure:{pressure:" hpa",sea_level:" hpa"},humidity:{humidity:"%"},wind:{speed:" m/s",direction:"",gust:" m/s"}},current:t(r),forecast:(e=>{const t=e=>+(e.reduce(((e,t)=>e+t),0)/e.length).toFixed(0),r=e=>Object.entries(e.reduce(((e,t)=>(e[t]||(e[t]=0),e[t]++,e)),{})).sort(((e,t)=>t[1]-e[1]))[0][0];return e.map((e=>({date:new Date(1e3*e.dt),weather:s[e.weather[0].main],temp:+e.main.temp.toFixed(0)}))).reduce(((e,t)=>{void 0===e.find((e=>e.date===t.date.getDate()))&&e.push({date:t.date.getDate(),tempDayData:[],tempNightData:[],weatherData:[]});let r=e.find((e=>e.date===t.date.getDate()));return r.weatherData.push(t.weather),t.date.getHours()<20&&t.date.getHours()>8?r.tempDayData.push(t.temp):r.tempNightData.push(t.temp),e}),[]).map((e=>({date:e.date,avgTempDay:t(e.tempDayData),avgTempNight:t(e.tempNightData),avgWeather:r(e.weatherData)}))).map((e=>(isNaN(e.avgTempDay)?e.avgTempDay=e.avgTempNight:isNaN(e.avgTempNight)&&(e.avgTempNight=e.avgTempDay),e)))})(a.list),closest:t(a.list[1]),difference:{}};Object.defineProperties(i.current,{weather:{value:s[e.weather.weather[0].main],configurable:!0,enumerable:!1,writable:!0},time:{value:{sunrise:new Date(1e3*r.sys.sunrise),sunset:new Date(1e3*r.sys.sunset)},configurable:!0,enumerable:!1,writable:!0}});for(let e in i.current){i.difference[e]={};for(let t in i.current[e])i.difference[e][t]="direction"!==t?{value:Math.abs(i.current[e][t]-i.closest[e][t]).toFixed(0),change:i.closest[e][t]>i.current[e][t]?"inc":i.closest[e][t]<i.current[e][t]?"dec":"same"}:{value:i.closest[e][t]}}return i})(await(async()=>{try{let t=e("weather"),r=await fetch(t),a=await r.json();if("city not found"===a.message)throw new Error(a.message);let s=e("forecast"),n=await fetch(s);return{weather:a,forecast:await n.json()}}catch(e){"city not found"===e.message?(await this.showAlert("alert",`${this.city} not found, try again`),await this.requestCity(),this.setDataUpdaters()):"Failed to fetch"===e.message?(await this.showAlert("alert","Check your internet connection and try again"),await new Promise((e=>setTimeout((()=>e()),6e4))),this.setDataUpdaters()):this.showAlert("alert","Something went wrong :(")}})());this.weatherData=t}}class r{constructor(){const e=e=>{let t,r=e.currentTarget,a=r.querySelector(".weather__param-slider"),s=+a.getAttribute("current"),n=r.classList.contains("weather__home-item_hover_down")?"down":"up",i=a.children.length;if("down"===n){if(s+1>i-1)return;a.setAttribute("current",s+1),t=a.children[s+1]}else{if(s-1<0)return;a.setAttribute("current",s-1),t=a.children[s-1]}let o=t.querySelector(".weather__param-icon"),c=t.querySelector(".weather__param-name"),l=t.querySelector(".weather__param-value"),u=t.querySelector(".weather__param-forecast");o.classList.add(`slide-${n}`),c.classList.add(`slide-${n}`,"slide_delay_low"),l.classList.add(`slide-${n}`,"slide_delay_medium"),u.classList.add(`slide-${n}`,"slide_delay_high");let d=a.offsetHeight;a.scrollTop="down"===n?a.scrollTop+d:a.scrollTop-d,[o,c,l,u].forEach((e=>{e.addEventListener("animationend",(function t(r){e.classList.remove(`slide-${n}`),r.target.removeEventListener("animationend",t)}))}))},t=e=>{let t=e.currentTarget,r=t.offsetHeight,a=t.getBoundingClientRect();e.clientY-a.top<=r/2?(t.classList.remove("weather__home-item_hover_down"),t.classList.add("weather__home-item_hover_up")):(t.classList.remove("weather__home-item_hover_up"),t.classList.add("weather__home-item_hover_down"))},r=e=>{e.currentTarget.classList.remove("weather__home-item_hover_down","weather__home-item_hover_up")},a=e=>{if(e.currentTarget.classList.contains("nav__btn_active"))return;let t=e.currentTarget;[...l].find((e=>e.classList.contains("nav__btn_active"))).classList.remove("nav__btn_active"),t.classList.add("nav__btn_active");let r=document.querySelector(".main"),a=r.offsetWidth,s=r.offsetHeight,n=`${Math.ceil((a**2+s**2)**.5)}px`;document.documentElement.style.setProperty("--toggler-radius",n),document.querySelector("#first-toggler").classList.add("toggler_on")},s=e=>{e.currentTarget.querySelector(".btn-bg-toggler").classList.add("header__btn-toggle")},n=e=>{s(e),document.querySelector(".nav").classList.toggle("nav_active")},i=e=>{s(e),document.querySelector(".forecast").classList.toggle("forecast_active")};document.querySelectorAll(".weather__home-item").forEach((a=>{a.addEventListener("mousemove",t),a.addEventListener("click",e),a.addEventListener("mouseleave",r)}));let o=document.querySelector("#first-toggler"),c=document.querySelector("#second-toggler");o.addEventListener("animationend",(()=>{let e=document.querySelector(".nav__btn_active").id,t=document.querySelector(".content_show"),r=document.querySelector(`.weather__${e}`);t.classList.remove("content_show"),t.classList.add("content_hidden"),r.classList.add("content_show"),r.classList.remove("content_hidden"),c.classList.add("toggler_off")})),c.addEventListener("animationend",(()=>{o.classList.remove("toggler_on"),c.classList.remove("toggler_off")}));let l=document.querySelectorAll(".nav__btn");l.forEach((e=>{e.addEventListener("click",a)})),document.querySelector("#input-theme").addEventListener("input",(e=>{let t=e.target.value;document.documentElement.style.setProperty("--main-clr",t)})),document.querySelectorAll(".header__btn").forEach((e=>{e.addEventListener("animationend",(e=>{e.currentTarget.classList.toggle("header__btn_active"),e.currentTarget.querySelector(".btn-bg-toggler").classList.remove("header__btn-toggle")})),e.classList.contains("header__btn_nav")?e.addEventListener("click",n):e.classList.contains("header__btn_weather")&&e.addEventListener("click",i)}))}start(){this.setAnimations()}setAnimations(){JSON.parse(localStorage.getItem("settings")).animations?this.turnOnAnimations():this.turnOffAnimations()}async turnOnAnimations(){let e=(new Date).getMilliseconds();await new Promise((t=>setTimeout((()=>{t()}),1e3-e))),document.querySelector("#delimiter").classList.add("ticking");let t=document.querySelector(".icon-chart");if(t.classList.add("icon-rotate"),t.classList.contains("icon-chart_moon")){document.querySelectorAll(".icon-star").forEach(((e,t)=>{e.classList.add(`star-animation_${t+1}`)}))}}turnOffAnimations(){document.querySelector("#delimiter").classList.remove("ticking"),document.querySelectorAll(".icon-star").forEach(((e,t)=>{e.classList.remove(`star-animation_${t+1}`)})),document.querySelector(".icon-chart").classList.remove("icon-rotate")}}class a{constructor(){}start(){this.trackNames=["Lofi Fruits Music Chill Fruits Music - Take Me To Church","LoFi Waiter - Cosy Rain","HYGH Lofi Music Lobit Cooky - Redbone","Kisiaria - Urban Sunsets","Altair Blake - No Sleep"],this.tracks=this.trackNames.map((e=>new Audio(`./music/${e}.mp3`))),(async()=>{await Promise.all(this.tracks.map((e=>new Promise((t=>{e.addEventListener("loadeddata",(()=>t()))}))))),this.setTrackInfo()})(),this.currentTrackId=0,this.progress=0,this.repeat=!1,this.volume=+JSON.parse(localStorage.getItem("settings")).volume;const e=e=>{this.volume=e,this.currentTrack.volume=this.volume;let t=100*this.volume+"%";document.documentElement.style.setProperty("--range-saturation",t),document.querySelector("#btn-volume use").setAttribute("xlink:href","./images/icons/icons.svg#volume-icon-"+(this.volume>.66?"high":this.volume<.67&&this.volume>.33?"medium":this.volume<.34&&this.volume>0?"low":"mute"))},t=()=>{this.repeat?(clearInterval(this.updater),this.currentTrack.currentTime=0,this.progress=0,this.play()):this.next()};document.querySelector("#input-volume").addEventListener("input",(t=>{e(t.target.value)})),document.querySelector("#btn-volume").addEventListener("click",(()=>{this.volume?(e(0),document.querySelector("#input-volume").value=0):(e(.5),document.querySelector("#input-volume").value=.5)})),document.querySelector("#btn-repeat").addEventListener("click",(e=>{let t=e.currentTarget;t.classList.toggle("player__btn_on"),t.classList.toggle("player__btn_off"),this.repeat=!this.repeat})),this.tracks.forEach((e=>{e.addEventListener("ended",t)})),document.querySelector("#btn-prev").addEventListener("click",this.prev.bind(this)),document.querySelector("#btn-play").addEventListener("click",(()=>{this.currentTrack.paused?this.play():this.pause()})),document.querySelector("#btn-next").addEventListener("click",this.next.bind(this));let r=document.querySelector(".player__progress");r.addEventListener("click",(e=>{let t=e.target.offsetWidth,r=+((e.clientX-e.target.getBoundingClientRect().left)/t).toFixed(2);this.currentTrack.currentTime=+(this.currentTrack.duration*r).toFixed(0),this.progress=100*r,e.target.value=this.progress})),r.addEventListener("mousemove",(e=>{let t,r=e.target.offsetWidth,a=e.clientX-e.target.getBoundingClientRect().left,s=+(a/r).toFixed(2),n=+(this.currentTrack.duration*s).toFixed(0),i=document.querySelector(".player__hover-time");i.textContent=this.secsToFormat(n),t=a-(i.offsetWidth/2).toFixed(0)<0?0:a+i.offsetWidth/2>r?Math.floor(r-i.offsetWidth):a-(i.offsetWidth/2).toFixed(0),document.documentElement.style.setProperty("--new-track-time-pos",`${t}px`)}))}get currentTrack(){return this.tracks[this.currentTrackId]}prev(){this.pause(),this.currentTrackId=this.currentTrackId>0?this.currentTrackId-1:this.tracks.length-1,this.currentTrack.currentTime=0,this.progress=0,this.play()}next(){this.pause(),this.currentTrackId=(this.currentTrackId+1)%this.tracks.length,this.currentTrack.currentTime=0,this.progress=0,this.play()}play(){this.currentTrack.volume=this.volume,this.setTrackInfo(),this.currentTrack.play(),document.querySelector("#btn-play use").setAttribute("xlink:href","./images/icons/icons.svg#pause-icon");let e=document.querySelector(".player__progress"),t=1e3*this.currentTrack.duration/1e3;this.updater=setInterval((()=>{this.progress+=.1,e.value=this.progress;let t=document.querySelector(".player__track-time_current"),r=Math.floor(this.currentTrack.duration*this.progress/100);t.textContent=this.secsToFormat(r)}),t)}pause(){this.currentTrack.pause(),document.querySelector("#btn-play use").setAttribute("xlink:href","./images/icons/icons.svg#play-icon"),clearInterval(this.updater)}setTrackInfo(){let e=document.querySelector(".player__track-time_current"),t=document.querySelector(".player__track-time_duration"),r=document.querySelector(".player__track-name"),a=document.querySelector(".player__track-artist"),[,s]=this.trackNames[this.currentTrackId].split(" - "),[n]=this.trackNames[this.currentTrackId].split(" - ");e.textContent="0:00",t.textContent=`${this.secsToFormat(Math.floor(this.currentTrack.duration))}`,r.textContent=s,a.textContent=n}secsToFormat(e){return`${Math.floor(e/60)}:${"0".repeat(2-String(e%60).length)}${e%60}`}}class s{constructor(){}start(){this.slides={morning:5,afternoon:3,evening:5,night:5},(()=>{let[e]=document.documentElement.classList,t=document.querySelector(".weather__images-slider"),r=document.querySelector(".weather__images-control");for(let a=0;a<this.slides[e];a++){let s=document.createElement("div");s.classList.add("weather__images-item");let n=document.createElement("img");n.src=`./images/backgrounds/${e}/${e}_${a+1}.jpg`,n.alt=`${e} image`,n.classList.add("weather__img"),s.appendChild(n),t.appendChild(s);let i=document.createElement("button");i.type="button",i.setAttribute("num",a),i.classList.add("weather__images-btn"),0===a&&i.classList.add("weather__images-btn_active"),r.appendChild(i)}})(),this.numOfSlides=document.querySelectorAll(".weather__images-item").length,this.currentSlide=0,document.querySelectorAll(".weather__images-btn").forEach((e=>{e.addEventListener("click",(e=>{this.setSlide(+e.target.getAttribute("num"))}))})),document.querySelector(".nav").addEventListener("click",(e=>{"images"===e.target.closest(".nav__btn").id?this.turnOn():"images"!==e.target.closest(".nav__btn").id&&this.turnOff()}))}turnOn(){this.slider&&clearInterval(this.slider),this.slider=setInterval((()=>{this.nextSlide()}),1e4)}turnOff(){clearInterval(this.slider)}nextSlide(){let e=this.currentSlide<this.numOfSlides-1?this.currentSlide+1:0;this.setSlide(e)}setSlide(e){let t=document.querySelector(".weather__images-slider"),r=t.offsetWidth;this.currentSlide=e,t.scrollLeft=this.currentSlide*r;let a=document.querySelectorAll(".weather__images-btn");[...a].find((e=>e.classList.contains("weather__images-btn_active"))).classList.remove("weather__images-btn_active"),a[e].classList.add("weather__images-btn_active")}}(new class{constructor(){this.date=new e,this.weather=new t,this.animations=new r,this.player=new a,this.slider=new s,document.querySelector(".settings__btn_apply").addEventListener("click",this.applySettings.bind(this)),document.querySelector(".settings__btn_close").addEventListener("click",this.closeSettings)}async start(){await this.setInitialSettings(),this.date.start(),this.weather.start(),this.animations.start(),this.player.start(),this.slider.start()}async setInitialSettings(){const e=async()=>{let e=document.querySelector(".modal"),t=e.querySelector(".modal__header"),r=e.querySelector(".modal__input"),a=e.querySelector(".modal__btn");return t.textContent="Enter your name",r.value="",e.showModal(),await new Promise((e=>{const t=()=>{this.checkUsernameValidity(r)&&(a.removeEventListener("click",t),e())};a.addEventListener("click",t)})),r.value};if(0===localStorage.length){let t={username:await e(),units:"metric",animations:!1,theme:252,volume:.5};localStorage.setItem("settings",JSON.stringify(t))}let t=JSON.parse(localStorage.getItem("settings"));document.querySelector("#username").textContent=t.username,document.querySelector("#input-username").value=t.username,document.querySelector(`.settings__input_radio[value="${t.units}"]`).checked=!0,document.querySelector(`.settings__input_radio[value="${t.animations?"on":"off"}"]`).checked=!0,document.querySelector("#input-theme").value=t.theme,document.documentElement.style.setProperty("--main-clr",t.theme),document.querySelector("#input-volume").value=t.volume,document.documentElement.style.setProperty("--range-saturation",100*t.volume+"%"),document.querySelector("#btn-volume use").setAttribute("xlink:href","./images/icons/icons.svg#volume-icon-"+(t.volume>.66?"high":t.volume<.67&&t.volume>.33?"medium":t.volume<.34&&t.volume>0?"low":"mute"))}checkUsernameValidity(e){let t="",r=e.value;switch(!0){case/^[a-z]+| [a-z]+/.test(r):t="Name must begin with uppercase letter";break;case/[^A-Za-z ]/.test(r):t="Name should contain only latin letters";break;case r.length<1||r.length>20:t="Name min length is 1 and max length is 20 symbols"}return e.setCustomValidity(t),e.reportValidity()}async applySettings(){let e=document.querySelector("#input-username");this.checkUsernameValidity(e)&&((()=>{let e={username:document.querySelector("#input-username").value,units:document.querySelector('.settings__input_radio[name="temp-metric"]:checked').value,animations:"on"===document.querySelector('.settings__input_radio[name="animations"]:checked').value,theme:+document.querySelector("#input-theme").value,volume:+document.querySelector("#input-volume").value};localStorage.setItem("settings",JSON.stringify(e))})(),document.querySelector("#username").textContent=JSON.parse(localStorage.getItem("settings")).username,await this.weather.updateWeather(),this.animations.setAnimations(),await this.weather.showAlert("success","Settings have been successfully applied"))}closeSettings(){document.querySelector("#home").dispatchEvent(new Event("click"))}}).start()})();