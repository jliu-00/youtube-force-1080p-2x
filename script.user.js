// ==UserScript==
// @name         YouTube Force 1080p & 2x
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Force YouTube playback speed and video quality
// @author       jliu-00
// @match        *://www.youtube.com/*
// @match        *://m.youtube.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        TARGET_SPEED: 2,
        TARGET_QUALITY: 'hd1080'
    };

    let lastProcessedVideoId = null;
    let lastQualityVideoId = null;
    let speedSyncInterval = null;

    const getQualityLabel = (qualityCode) => {
        const map = { 'highres': '4320p', 'hd2160': '2160p', 'hd1440': '1440p', 'hd1080': '1080p', 'hd720': '720p', 'large': '480p', 'medium': '360p', 'small': '240p', 'tiny': '144p' };
        return map[qualityCode] || '1080p';
    };

    function lockSettingsStorage() {
        try {
            window.localStorage.setItem('yt-player-quality', JSON.stringify({ data: CONFIG.TARGET_QUALITY, expiration: Date.now() + 31536000000, creation: Date.now() }));
            window.localStorage.setItem('yt-player-playback-rate', JSON.stringify({data: CONFIG.TARGET_SPEED, creation: Date.now()}));
        } catch (e) {}
    }

    function syncSpeed(video) {
        if (!video || speedSyncInterval) return;
        let attempts = 0;
        speedSyncInterval = setInterval(() => {
            if (video.playbackRate >= CONFIG.TARGET_SPEED || attempts > 20) {
                clearInterval(speedSyncInterval);
                speedSyncInterval = null;
                if (video.playbackRate < CONFIG.TARGET_SPEED) video.playbackRate = CONFIG.TARGET_SPEED;
                return;
            }
            document.dispatchEvent(new KeyboardEvent('keydown', { key: '>', code: 'Period', keyCode: 190, which: 190, shiftKey: true, bubbles: true }));
            attempts++;
        }, 80);
    }

    function clickEl(el) { if(el) el.click(); }

    // Clean UI automation chain (no loops, no hiding, no flashing)
    function runCleanUIAutomation() {
        const gear = document.querySelector('.ytp-settings-button');
        if (!gear) return;

        const targetLabel = getQualityLabel(CONFIG.TARGET_QUALITY);

        // Close menu if it was already open to reset state
        if (gear.getAttribute('aria-expanded') === 'true') {
            clickEl(gear);
        }

        setTimeout(() => {
            clickEl(gear); // 1. Click gear to open main menu

            setTimeout(() => {
                const items = Array.from(document.querySelectorAll('.ytp-menuitem'));
                const qItem = items.find(el => el.textContent.includes('画质') || el.textContent.includes('Quality') || el.textContent.includes('画質') || el.textContent.includes('畫質'));
                
                if (!qItem) {
                    clickEl(gear); // Quality not found (e.g. live stream), close menu safely
                    return;
                }

                // Check if already on target quality without 'Auto' tag
                const content = qItem.textContent;
                const isAuto = content.includes('自动') || content.includes('Auto') || content.includes('自動');
                if (content.includes(targetLabel) && !isAuto) {
                    clickEl(gear); // Target met, close menu
                    return;
                }

                clickEl(qItem); // 2. Click Quality submenu

                setTimeout(() => {
                    let subItems = Array.from(document.querySelectorAll('.ytp-menuitem'));
                    
                    // Handle "Advanced" intermediate menu if present
                    const advKeywords = ['高级', '进阶', '進階', 'Advanced', '詳細設定'];
                    const advancedItem = subItems.find(el => advKeywords.some(kw => el.textContent.includes(kw)));
                    
                    if (advancedItem) {
                        clickEl(advancedItem); // 3a. Click Advanced

                        setTimeout(() => {
                            let finalItems = Array.from(document.querySelectorAll('.ytp-menuitem'));
                            let pureRes = finalItems.filter(el => /\d+p/.test(el.textContent));
                            let targetOption = pureRes.find(el => el.textContent.includes(targetLabel) && !el.textContent.includes('Premium'));
                            if (!targetOption && pureRes.length > 0) targetOption = pureRes[0]; // Fallback to max available
                            
                            clickEl(targetOption); // 4a. Click target quality
                        }, 350);

                    } else {
                        // Already in pure resolution list
                        let pureRes = subItems.filter(el => /\d+p/.test(el.textContent) && !el.textContent.includes('画质') && !el.textContent.includes('Quality'));
                        let targetOption = pureRes.find(el => el.textContent.includes(targetLabel) && !el.textContent.includes('Premium'));
                        if (!targetOption && pureRes.length > 0) targetOption = pureRes[0]; // Fallback
                        
                        clickEl(targetOption); // 4b. Click target quality
                    }

                }, 350); 
            }, 350); 
        }, 150); 
    }

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

    document.addEventListener('playing', function(e) {
        if (e.target.tagName && e.target.tagName.toLowerCase() === 'video') {
            let currentVideoId = new URLSearchParams(window.location.search).get('v');
            if (currentVideoId && currentVideoId !== lastQualityVideoId) {
                lastQualityVideoId = currentVideoId;
                
                // Allow 2s for DOM to fully render before automating clicks
                setTimeout(runCleanUIAutomation, 2000); 
            }
        }
    }, true);

})();
