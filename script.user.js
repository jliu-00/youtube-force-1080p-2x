// ==UserScript==
// @name         YouTube Force 1080p & 2x
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Force YouTube playback speed to 2x and video quality to 1080p
// @author       jliu-00
// @match        *://www.youtube.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // CONFIGURATION - Customize your settings here
    // ==========================================
    const CONFIG = {
        // Target playback speed (e.g., 1.5, 2)
        TARGET_SPEED: 2,
        
        // Target video quality
        // Options: highres, hd2160, hd1440, hd1080, hd720, large, medium, small, tiny
        TARGET_QUALITY: 'hd1080'
    };
    // ==========================================

    let lastProcessedVideoId = null;

    // 1. Attempt to inject into LocalStorage early to lock the quality upper limit
    function lockQualityStorage() {
        try {
            window.localStorage.setItem('yt-player-quality', JSON.stringify({
                data: CONFIG.TARGET_QUALITY, expiration: Date.now() + 31536000000, creation: Date.now()
            }));
        } catch (e) {}
    }

    // 2. Core logic: Simulate human pressing the native speed-up shortcut (Shift + >)
    function syncSpeed() {
        const video = document.querySelector('video');
        if (!video || video.playbackRate >= CONFIG.TARGET_SPEED) return;

        let attempts = 0;
        // Press the speed-up key every 100ms until reaching target speed
        const speedUpInterval = setInterval(() => {
            if (video.playbackRate >= CONFIG.TARGET_SPEED || attempts > 10) {
                clearInterval(speedUpInterval);

                // Fallback: If the browser blocks simulated key presses, force it via underlying API
                // and manually dispatch an update event to wake up the UI
                if (video.playbackRate < CONFIG.TARGET_SPEED) {
                    const player = document.getElementById('movie_player');
                    if (player && typeof player.setPlaybackRate === 'function') {
                        player.setPlaybackRate(CONFIG.TARGET_SPEED);
                    } else {
                        video.playbackRate = CONFIG.TARGET_SPEED;
                    }
                    video.dispatchEvent(new Event('ratechange', {bubbles: true}));
                }
                return;
            }

            // Dispatch native shortcut event
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: '>', code: 'Period', keyCode: 190, which: 190, shiftKey: true, bubbles: true
            }));

            attempts++;
        }, 100);
    }

    // 3. Force video quality setting
    function applyQualitySettings() {
        const player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
        if (player && typeof player.setPlaybackQualityRange === 'function') {
            player.setPlaybackQualityRange(CONFIG.TARGET_QUALITY, CONFIG.TARGET_QUALITY);
        }
    }

    // 4. Main video control logic
    function processNewVideo() {
        const player = document.getElementById('movie_player');
        if (!player) return;

        let currentVideoId = null;
        if (typeof player.getVideoData === 'function') {
            const data = player.getVideoData();
            currentVideoId = data ? data.video_id : null;
        }
        if (!currentVideoId) {
            currentVideoId = new URLSearchParams(window.location.search).get('v');
        }

        // Ensure speed-up triggers only once per video, retaining your right to manually slow it back down
        if (currentVideoId && currentVideoId !== lastProcessedVideoId) {
            lastProcessedVideoId = currentVideoId;
            syncSpeed();
            applyQualitySettings();
        }
    }

    lockQualityStorage();

    // Listen for YouTube internal route changes (SPA)
    window.addEventListener('yt-navigate-finish', () => {
        lockQualityStorage();
        setTimeout(processNewVideo, 800);
        setTimeout(processNewVideo, 2000);
    });

    // Listen for underlying video element loading
    document.addEventListener('loadeddata', function(e) {
        if (e.target.tagName && e.target.tagName.toLowerCase() === 'video') {
            setTimeout(processNewVideo, 500);
        }
    }, true);

})();
