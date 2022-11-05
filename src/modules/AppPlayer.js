export default class AppPlayer {
    constructor() {
        this.trackNames = [
            'Lofi Fruits Music Chill Fruits Music - Take Me To Church',
            'LoFi Waiter - Cosy Rain',
            'HYGH Lofi Music Lobit Cooky - Redbone',
            'Kisiaria - Urban Sunsets',
            'Altair Blake - No Sleep',
        ];

        this.tracks = this.trackNames.map((songName) => new Audio(`./music/${songName}.mp3`));

        (async () => {
            await Promise.all(this.tracks.map((audio) => new Promise((resolve) => {
                audio.addEventListener('loadeddata', () => resolve());
            })));
            this.setTrackInfo();
        })();

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
            this.currentTrack.currentTime = +(this.currentTrack.duration * percent).toFixed(0);
            this.progress = percent * 100;
            e.target.value = this.progress;
        };

        const showHoverTrackTime = (e) => {
            let width = e.target.offsetWidth;
            let mousePos = e.clientX - e.target.getBoundingClientRect().left;
            let percent = +(mousePos / width).toFixed(2);
            let hoverTime = +(this.currentTrack.duration * percent).toFixed(0);

            let hoverTimeElem = document.querySelector('.player__hover-time');
            hoverTimeElem.textContent = this.secsToFormat(hoverTime);
            let hoverPos;
            if ( mousePos - ((hoverTimeElem.offsetWidth) / 2).toFixed(0) < 0 ) hoverPos = 0;
            else if ( mousePos + hoverTimeElem.offsetWidth / 2 > width ) hoverPos = Math.floor( width - hoverTimeElem.offsetWidth ) ;
            else hoverPos = mousePos - ((hoverTimeElem.offsetWidth) / 2).toFixed(0);
            document.documentElement.style.setProperty('--new-track-time-pos', `${hoverPos}px`);
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
        progress.addEventListener('mousemove', showHoverTrackTime);
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
        this.setTrackInfo();
        this.currentTrack.play();

        document.querySelector('#btn-play use').setAttribute('xlink:href', '#pause-icon');

        let progressBar = document.querySelector('.player__progress');
        let step = this.currentTrack.duration * 1000 / 1000;
        
        this.updater = setInterval( () => {
            this.progress += 0.1;
            progressBar.value = this.progress;

            let currentTimeElem = document.querySelector('.player__track-time_current');
            let currentTime = Math.floor(this.currentTrack.duration * this.progress / 100);
            currentTimeElem.textContent = this.secsToFormat( currentTime );

        }, step);
    }

    pause() {
        this.currentTrack.pause();

        document.querySelector('#btn-play use').setAttribute('xlink:href', '#play-icon');
        clearInterval(this.updater);
    }

    setTrackInfo() {
        let trackCurrentTime = document.querySelector('.player__track-time_current');
        let trackDurationTime = document.querySelector('.player__track-time_duration');
        let trackNameElem = document.querySelector('.player__track-name');
        let trackArtistElem = document.querySelector('.player__track-artist');

        let [,trackName] = this.trackNames[this.currentTrackId].split(' - ');
        let [trackArtist] = this.trackNames[this.currentTrackId].split(' - '); 

        trackCurrentTime.textContent = '0:00';
        trackDurationTime.textContent = `${this.secsToFormat(Math.floor(this.currentTrack.duration))}`;
        trackNameElem.textContent = trackName;
        trackArtistElem.textContent = trackArtist;
    }

    secsToFormat(secs) {
        return `${Math.floor(secs / 60)}:${'0'.repeat(2 - String(secs % 60).length)}${secs % 60}`;
    };
}