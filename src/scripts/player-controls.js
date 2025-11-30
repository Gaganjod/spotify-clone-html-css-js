document.addEventListener('DOMContentLoaded', () => {
    const playerControls = document.querySelector('[data-testid="player-controls"]');
    if (!playerControls) {
        return;
    }

    // --- STATE ---
    let isPlaying = false;
    let isShuffled = false;
    let repeatMode = 'off'; // 'off', 'all', 'one'
    let volume = 0.75;
    let lastVolume = 0.75;
    let isMuted = false;
    let currentTime = 0;
    const duration = 223; // Mock duration: 3:43
    let isSeekingProgress = false;
    let isSeekingVolume = false;
    let playbackInterval;

    // --- DOM ELEMENTS ---
    const shuffleBtn = document.querySelector('[data-testid="control-button-shuffle"]');
    const prevBtn = document.querySelector('[data-testid="control-button-skip-back"]');
    const playPauseBtn = document.querySelector('[data-testid="control-button-playpause"]');
    const nextBtn = document.querySelector('[data-testid="control-button-skip-forward"]');
    const repeatBtn = document.querySelector('[data-testid="control-button-repeat"]');
    const playIcon = playPauseBtn.querySelector('svg');

    const currentTimeEl = document.querySelector('[data-testid="playback-position"]');
    const durationEl = document.querySelector('[data-testid="playback-duration"]');

    const progressBarContainer = document.querySelector('[data-testid="playback-progressbar"]');
    const progressBarFill = progressBarContainer.querySelector('.pghDjOdspOgysFT72xOx');
    const progressBarHandle = progressBarContainer.querySelector('.A9z4_R9gegKhgs_3D7Os');

    const muteBtn = document.querySelector('[data-testid="volume-bar-toggle-mute-button"]');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeBarContainer = document.querySelector('[data-testid="volume-bar"] [data-testid="progress-bar"]');
    const volumeBarFill = volumeBarContainer.querySelector('.pghDjOdspOgysFT72xOx');
    const volumeBarHandle = volumeBarContainer.querySelector('.A9z4_R9gegKhgs_3D7Os');

    // --- CONSTANTS ---
    const PAUSE_ICON_SVG_PATH = 'M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z';
    const PLAY_ICON_SVG_PATH = 'M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z';
    const VOLUME_ICON_PATHS = [
        'M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.142 2.142 0 0 0 0 3.7l5.858 3.38V2.82L2.817 6.15z',
        'M12.025 3.9a.75.75 0 0 1 .376.65v6.9a.75.75 0 0 1-.376.65l-.068.038a.75.75 0 0 1-.92-.518 13.941 13.941 0 0 0 0-7.098.75.75 0 0 1 .92-.518l.068.038z'
    ];

    // --- STYLES INJECTION ---
    const addPlayerStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            .player-control-button{ position: relative; }
            .player-control-button.active, .player-control-button.active-with-dot {
                color: var(--color-accent-primary);
            }
            .player-control-button.active svg, .player-control-button.active-with-dot svg {
                fill: var(--color-accent-primary);
            }
            .player-control-button.active-with-dot::after {
                content: '';
                position: absolute;
                bottom: 0px;
                left: 50%;
                transform: translateX(-50%);
                width: 4px;
                height: 4px;
                background-color: var(--color-accent-primary);
                border-radius: 50%;
            }
             .progress-bar-wrapper:hover .pghDjOdspOgysFT72xOx {
                 background-color: var(--color-accent-primary);
             }
             .progress-bar-wrapper:hover .A9z4_R9gegKhgs_3D7Os {
                 opacity: 1;
             }
        `;
        document.head.appendChild(style);
        [shuffleBtn, repeatBtn].forEach(btn => btn.classList.add('player-control-button'));
        [progressBarContainer, volumeBarContainer].forEach(el => el.parentElement.classList.add('progress-bar-wrapper'));
    };

    // --- UTILITY ---
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // --- UI UPDATERS ---
    const updatePlayPauseButton = () => {
        playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
        playIcon.querySelector('path').setAttribute('d', isPlaying ? PAUSE_ICON_SVG_PATH : PLAY_ICON_SVG_PATH);
    };

    const updateShuffleButton = () => {
        shuffleBtn.classList.toggle('active', isShuffled);
        shuffleBtn.setAttribute('aria-checked', String(isShuffled));
    };

    const updateRepeatButton = () => {
        repeatBtn.classList.remove('active', 'active-with-dot');
        let label = 'Enable repeat';
        if (repeatMode === 'all') {
            repeatBtn.classList.add('active');
            label = 'Enable repeat one';
        } else if (repeatMode === 'one') {
            repeatBtn.classList.add('active-with-dot');
            label = 'Disable repeat';
        }
        repeatBtn.setAttribute('aria-label', label);
    };

    const updateProgressBar = () => {
        const progressPercent = (currentTime / duration) * 100;
        progressBarFill.style.width = `${progressPercent}%`;
        progressBarHandle.style.left = `${progressPercent}%`;
        currentTimeEl.textContent = formatTime(currentTime);
    };

    const updateVolumeControls = () => {
        const currentVolume = isMuted ? 0 : volume;
        volumeIcon.innerHTML = '';
        muteBtn.setAttribute('aria-label', currentVolume === 0 ? 'Unmute' : 'Mute');

        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', VOLUME_ICON_PATHS[0]);
        volumeIcon.appendChild(path1);

        if (currentVolume === 0) {
            volumeIcon.setAttribute('aria-label', 'Volume off');
            volumeIcon.style.opacity = '0.65';
        } else {
            volumeIcon.style.opacity = '1';
            if (currentVolume > 0.5) {
                const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path2.setAttribute('d', VOLUME_ICON_PATHS[1]);
                volumeIcon.appendChild(path2);
                volumeIcon.setAttribute('aria-label', 'Volume high');
            } else {
                volumeIcon.setAttribute('aria-label', 'Volume low');
            }
        }
        
        volumeBarFill.style.width = `${currentVolume * 100}%`;
        volumeBarHandle.style.left = `${currentVolume * 100}%`;
    };
    
    const updateAllUI = () => {
        updatePlayPauseButton(); updateShuffleButton(); updateRepeatButton(); updateProgressBar(); updateVolumeControls();
    };

    // --- PLAYBACK ---
    const startPlayback = () => {
        clearInterval(playbackInterval);
        playbackInterval = setInterval(() => {
            if (currentTime < duration) {
                currentTime++; updateProgressBar();
            } else {
                handleTrackEnd();
            }
        }, 1000);
    };
    const stopPlayback = () => clearInterval(playbackInterval);
    const handleTrackEnd = () => {
        if (repeatMode === 'one') {
            currentTime = 0; startPlayback();
        } else if (repeatMode === 'all') {
            currentTime = 0; startPlayback();
        } else {
            currentTime = 0; isPlaying = false; stopPlayback(); updateAllUI();
        }
    };

    // --- EVENT HANDLERS ---
    const handlePlayPause = () => { isPlaying = !isPlaying; isPlaying ? startPlayback() : stopPlayback(); updatePlayPauseButton(); };
    const handleShuffle = () => { isShuffled = !isShuffled; updateShuffleButton(); };
    const handleRepeat = () => { const modes = ['off', 'all', 'one']; const i = modes.indexOf(repeatMode); repeatMode = modes[(i + 1) % 3]; updateRepeatButton(); };
    const handlePrev = () => { currentTime = 0; updateProgressBar(); if (isPlaying) startPlayback(); };
    const handleNext = () => handleTrackEnd();
    const handleMute = () => {
        isMuted = !isMuted;
        if (!isMuted && volume === 0) { volume = lastVolume > 0 ? lastVolume : 0.5; }
        else if (isMuted) { lastVolume = volume; }
        updateVolumeControls();
    };
    const seek = (e, bar, setter, maxVal) => { const rect = bar.getBoundingClientRect(); const progress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)); setter(progress * maxVal); };
    const handleProgressSeek = e => { seek(e, progressBarContainer, val => { currentTime = Math.floor(val); updateProgressBar(); if(isPlaying) startPlayback();}, duration); };
    const handleVolumeSeek = e => { seek(e, volumeBarContainer, val => { volume = val; if (isMuted && volume > 0) isMuted = false; updateVolumeControls(); }, 1); };

    // --- ATTACH LISTENERS ---
    playPauseBtn.addEventListener('click', handlePlayPause);
    shuffleBtn.addEventListener('click', handleShuffle);
    repeatBtn.addEventListener('click', handleRepeat);
    prevBtn.addEventListener('click', handlePrev);
    nextBtn.addEventListener('click', handleNext);
    muteBtn.addEventListener('click', handleMute);
    
    progressBarContainer.addEventListener('mousedown', e => { isSeekingProgress = true; handleProgressSeek(e); });
    volumeBarContainer.addEventListener('mousedown', e => { isSeekingVolume = true; handleVolumeSeek(e); });
    document.addEventListener('mousemove', e => { if (isSeekingProgress) handleProgressSeek(e); if (isSeekingVolume) handleVolumeSeek(e); });
    document.addEventListener('mouseup', () => { isSeekingProgress = false; isSeekingVolume = false; });
    
    document.addEventListener('keydown', e => {
        if (e.target.closest('input, textarea')) return;
        switch(e.code) {
            case 'Space': e.preventDefault(); handlePlayPause(); break;
            case 'ArrowRight': e.preventDefault(); currentTime = Math.min(duration, currentTime + 5); updateProgressBar(); if(isPlaying) startPlayback(); break;
            case 'ArrowLeft': e.preventDefault(); currentTime = Math.max(0, currentTime - 5); updateProgressBar(); if(isPlaying) startPlayback(); break;
        }
    });

    // --- INITIALIZE ---
    const init = () => {
        addPlayerStyles();
        durationEl.textContent = formatTime(duration);
        updateAllUI();
    };
    init();
});