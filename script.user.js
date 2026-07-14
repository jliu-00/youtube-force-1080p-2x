// ==UserScript==
// @name         YouTube Force 1080p & 2x
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Force YouTube playback speed and video quality
// @author       jliu-00
// @match        *://www.youtube.com/*
// @match        *://m.youtube.com/*
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
    let lastQualityVideoId = null;
    let speedSyncInterval = null;

    // Helper: Map API quality code to UI label text
    const getQualityLabel = (qualityCode) => {
        const map = {
            'highres': '4320p',
            'hd2160': '2160p',
            'hd1440': '1440p',
            'hd1080': '1080p',
            'hd720': '720p',
            'large': '480p',
            'medium': '360p',
            'small': '240p',
            'tiny': '144p'
        };
        return map[qualityCode] || '1080p';
    };

    // 1. Inject local storage settings
    function lockSettingsStorage() {
        try {
            const qualityConfig = JSON.stringify({ data: CONFIG.TARGET_QUALITY, expiration: Date.now() + 31536000000, creation: Date.now() });
            window.localStorage.setItem('yt-player-quality', qualityConfig);
            window.localStorage.setItem('yt-player-playback-rate', JSON.stringify({data: CONFIG.TARGET_SPEED, creation: Date.now()}));
        } catch (e) {}
    }

    // 2. Sync playback speed based on config
    function syncSpeed(video) {
        if (!video || speedSyncInterval) return;
        let attempts = 0;
        speedSyncInterval = setInterval(() => {
            if (video.playbackRate >= CONFIG.TARGET_SPEED || attempts > 20) {
                clearInterval(speedSyncInterval);
                speedSyncInterval = null;
                if (video.playbackRate < CONFIG.TARGET_SPEED) {
                    const player = document.getElementById('movie_player');
                    if (player && typeof player.setPlaybackRate === 'function') {
                        player.setPlaybackRate(CONFIG.TARGET_SPEED);
                    } else {
                        video.playbackRate = CONFIG.TARGET_SPEED;
                    }
                }
                return;
            }
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: '>', code: 'Period', keyCode: 190, which: 190, shiftKey: true, bubbles: true
            }));
            attempts++;
        }, 80);
    }

    // 3. Stealth macro click using inline DOM styling
    function runStealthMacro() {
        if (window.macroActive) return;
        window.macroActive = true;

        const originalStyles = new Map();

        // Bypass CSP by directly modifying inline styles
        const hideMenu = () => {
            const menus = document.querySelectorAll('.ytp-popup, .ytp-settings-menu, .ytp-panel');
            menus.forEach(m => {
                if (!originalStyles.has(m)) {
                    originalStyles.set(m, m.style.opacity);
                }
                // Force opacity 0 directly on the DOM element
                m.style.setProperty('opacity', '0', 'important');
            });
        };

        const restoreMenu = () => {
            originalStyles.forEach((originalOpacity, m) => {
                if (m) m.style.opacity = originalOpacity || '';
            });
            originalStyles.clear();
        };

        const clickEl = (el) => {
            if(!el) return;
            el.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
            el.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
            el.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
            el.click();
        };

        let macroStep = 0;
        let attempts = 0;
        const targetLabel = getQualityLabel(CONFIG.TARGET_QUALITY);

        // Run ultra-fast polling every 20ms
        const macroTimer = setInterval(() => {
            attempts++;
            const gear = document.querySelector('.ytp-settings-button');
            
            // Timeout after ~2 seconds (100 * 20ms)
            if (!gear || attempts > 100) { 
                clearInterval(macroTimer);
                window.macroActive = false;
                restoreMenu();
                return; 
            }

            // Continually hide menu to fight against React re-renders
            hideMenu();

            if (macroStep === 0) {
                if (gear.getAttribute('aria-expanded') !== 'true') {
                    clickEl(gear);
                } else {
                    macroStep = 1;
                    attempts = 0;
                }
            }
            else if (macroStep === 1) {
                const items = Array.from(document.querySelectorAll('.ytp-menuitem'));
                const qItem = items.find(el => el.textContent.includes('画质') || el.textContent.includes('Quality') || el.textContent.includes('画質'));
                
                if (qItem) {
                    const content = qItem.textContent;
                    // If current quality already contains the exact target resolution, we are good.
                    if (content.includes(targetLabel)) {
                        clickEl(gear); 
                        clearInterval(macroTimer);
                        window.macroActive = false;
                        setTimeout(restoreMenu, 50);
                    } else {
                        // Otherwise (whether it's Auto or another resolution like 720p), enter the submenu to change it
                        clickEl(qItem);
                        macroStep = 2;
                        attempts = 0;
                    }
                }
            }
            else if (macroStep === 2) {
                const subItems = Array.from(document.querySelectorAll('.ytp-menuitem'));
                // Find standard target resolution, avoiding Premium options
                let targetOption = subItems.find(el => 
                    el.textContent.includes(targetLabel) && 
                    !el.textContent.includes('自动') && 
                    !el.textContent.includes('Auto') &&
                    !el.textContent.includes('Premium') &&
                    !el.textContent.includes('高码率') &&
                    !el.textContent.includes('高比特率')
                );
                
                if (!targetOption) {
                     const nonAutos = subItems.filter(el => 
                         /\d+p/.test(el.textContent) && 
                         !el.textContent.includes('自动') && 
                         !el.textContent.includes('Auto') &&
                         !el.textContent.includes('Premium') &&
                         !el.textContent.includes('高码率') &&
                         !el.textContent.includes('高比特率')
                     );
                     if (nonAutos.length > 0) targetOption = nonAutos[0];
                }

                if (targetOption) {
                    clickEl(targetOption);
                    clearInterval(macroTimer);
                    window.macroActive = false;
                    setTimeout(restoreMenu, 50);
                }
            }
        }, 20);
    }

    // 4. Speed controller
    function processNewVideoSpeed() {
        const video = document.querySelector('video');
        let currentVideoId = new URLSearchParams(window.location.search).get('v');
        if (currentVideoId && currentVideoId !== lastProcessedVideoId) {
            lastProcessedVideoId = currentVideoId;
            syncSpeed(video);
        }
    }

    lockSettingsStorage();

    window.addEventListener('yt-navigate-finish', () => {
        lockSettingsStorage();
        setTimeout(processNewVideoSpeed, 300);
    });
    
    document.addEventListener('loadeddata', function(e) {
        if (e.target.tagName && e.target.tagName.toLowerCase() === 'video') {
            setTimeout(processNewVideoSpeed, 100);
        }
    }, true);

    // 5. Quality controller
    document.addEventListener('playing', function(e) {
        if (e.target.tagName && e.target.tagName.toLowerCase() === 'video') {
            let currentVideoId = new URLSearchParams(window.location.search).get('v');
            if (currentVideoId && currentVideoId !== lastQualityVideoId) {
                lastQualityVideoId = currentVideoId;
                
                // Wait for UI to load before running the stealth macro
                setTimeout(runStealthMacro, 1500); 
            }
        }
    }, true);

})();
