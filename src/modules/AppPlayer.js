export default class AppPlayer {
    constructor() {
        let trackNames = [
            'Lofi Fruits Music Chill Fruits Music - Take Me To Church',
            'HYGH Lofi Music Lobit Cooky - Redbone',
            'LoFi Waiter - Cosy Rain',
            'Kisiaria - Urban Sunsets',
            'Altair Blake - No Sleep',

        ];

        this.tracks = trackNames.map((songName) => new Audio(`./music/${songName}.mp3`));
        this.currentTrackId = 0;
        this.progress = 0;
        this.repeat = false;
        this.volume = +JSON.parse(localStorage.getItem('settings')).volume;
        
        const changeVolume = (newVolume) => {
            this.volume = newVolume;
            this.currentTrack.volume = this.volume;
            let rangeColorSaturation = `${this.volume * 100}%`;
            document.documentElement.style.setProperty('--range-saturation', rangeColorSaturation);
            document.querySelector('#btn-volume use').setAttribute('xlink:href',`#volume-icon-${this.volume > 0.66 ? 'high' : this.volume < 0.67 && this.volume > 0.33 ? 'medium' : this.volume < 0.34 && this.volume > 0 ? 'low' : 'mute'}`);
        };
        
        const changeMute = () => {
            if (this.volume) {
                changeVolume(0);
                document.querySelector('#input-volume').value = 0;
            } else {
                changeVolume(0.5);
                document.querySelector('#input-volume').value = 0.5;
            }
        };

        const changeRepeat = (e) => {
            let trackRepeatBtn = e.currentTarget;
            trackRepeatBtn.classList.toggle('player__btn_on');
            trackRepeatBtn.classList.toggle('player__btn_off');
            this.repeat = !this.repeat;
        };

        const stopPlayTrack = () => {
            if (this.currentTrack.paused) this.play();
            else this.pause();
        };

        const autoPlayNext = () => {
            if (this.repeat) {
                clearInterval(this.updater);
                this.currentTrack.currentTime = 0;
                this.progress = 0;
                this.play();
            } else this.next();
        };

        const playWithPosition = (e) => {
            let width = e.target.offsetWidth;
            let mousePos = e.clientX - e.target.getBoundingClientRect().left;
            let percent = +(mousePos / width).toFixed(2);
            this.currentTrack.currentTime = this.currentTrack.duration * percent;
            this.progress = percent * 100;
            e.target.value = this.progress;
        };

        let volumeRange = document.querySelector('#input-volume');
        volumeRange.addEventListener('input', (e) => {
            changeVolume(e.target.value);
        });

        let volumeBtn = document.querySelector('#btn-volume');
        volumeBtn.addEventListener('click', changeMute);

        let trackRepeatBtn = document.querySelector('#btn-repeat');
        trackRepeatBtn.addEventListener('click', changeRepeat);
  
        this.tracks.forEach((track) => {
            track.addEventListener('ended', autoPlayNext);
        });


        let prevBtn = document.querySelector('#btn-prev');
        prevBtn.addEventListener('click', this.prev.bind(this));

        let playBtn = document.querySelector('#btn-play');
        playBtn.addEventListener('click', stopPlayTrack);

        let nextBtn = document.querySelector('#btn-next');
        nextBtn.addEventListener('click', this.next.bind(this));

        let progress = document.querySelector('.player__progress');
        progress.addEventListener('click', playWithPosition);
    }

    get currentTrack() {
        return this.tracks[this.currentTrackId];
    }

    prev() {
        this.pause();
        this.currentTrackId = this.currentTrackId > 0 ? this.currentTrackId - 1 : this.tracks.length - 1;
        this.currentTrack.currentTime = 0;
        this.progress = 0;
        this.play();
    }

    next() {
        this.pause();
        this.currentTrackId = (this.currentTrackId + 1) % this.tracks.length;
        this.currentTrack.currentTime = 0;
        this.progress = 0;
        this.play();
    }

    play() {
        this.currentTrack.volume = this.volume;
        this.currentTrack.play();

        document.querySelector('#btn-play use').setAttribute('xlink:href', '#pause-icon');

        let progressBar = document.querySelector('.player__progress');
        let step = this.currentTrack.duration * 1000 / 1000;
        
        this.updater = setInterval( () => {
            this.progress += 0.1;
            progressBar.value = this.progress;
        }, step);
    }

    pause() {
        this.currentTrack.pause();

        document.querySelector('#btn-play use').setAttribute('xlink:href', '#play-icon');
        clearInterval(this.updater);
    }
}