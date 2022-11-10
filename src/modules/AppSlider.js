export default class AppSlider {
    constructor() {}

    start() {
        const creatingSlidesAndBtns = () => {
            let [theme] = document.documentElement.classList;
            let slider = document.querySelector('.weather__images-slider');
            let btnsSliderContainer = document.querySelector('.weather__images-control');

            for (let i = 0; i < this.slides[theme]; i++) {
                let slide = document.createElement('div');
                slide.classList.add('weather__images-item');
                let slideImg = document.createElement('img');
                slideImg.src = `./images/backgrounds/${theme}/${theme}_${i + 1}.jpg`;
                slideImg.alt = `${theme} image`;
                slideImg.classList.add('weather__img');

                slide.appendChild(slideImg);
                slider.appendChild(slide);

                let sliderBtn = document.createElement('button');
                sliderBtn.type = 'button';
                sliderBtn.setAttribute('num', i);
                sliderBtn.classList.add('weather__images-btn');
                if (i === 0) sliderBtn.classList.add('weather__images-btn_active');

                btnsSliderContainer.appendChild(sliderBtn);
            }
        };

        this.slides = {
            night: 5
        };

        creatingSlidesAndBtns();

        this.numOfSlides = document.querySelectorAll('.weather__images-item').length;
        this.currentSlide = 0;

        let sliderBtns = document.querySelectorAll('.weather__images-btn');
        sliderBtns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                this.setSlide(+e.target.getAttribute('num'));
            });
        });

        let nav = document.querySelector('.nav');
        nav.addEventListener('click', (e) => {
            if (e.target.closest('.nav__btn').id === 'images') this.turnOn();
            else if (e.target.closest('.nav__btn').id !== 'images') this.turnOff();
        });
    }

    turnOn() {
        if (this.slider) clearInterval(this.slider);
        this.slider = setInterval( () => {
            this.nextSlide();            
        }, 10000 );
    }

    turnOff() {
        clearInterval(this.slider);
    }  

    nextSlide() {
        let numOfNextSlide = this.currentSlide < this.numOfSlides - 1 ? this.currentSlide + 1 : 0;
        this.setSlide(numOfNextSlide);
    }

    setSlide(num) {
        let imageSlider = document.querySelector('.weather__images-slider');
        let slideWidth = imageSlider.offsetWidth;
        this.currentSlide = num;
        imageSlider.scrollLeft = this.currentSlide * slideWidth;

        let sliderBtns = document.querySelectorAll('.weather__images-btn');
        [...sliderBtns].find((btn) => btn.classList.contains('weather__images-btn_active')).classList.remove('weather__images-btn_active');
        sliderBtns[num].classList.add('weather__images-btn_active');
    }
 
}