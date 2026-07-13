# YouTube Force 1080p & 2x

[简体中文](./README-zh.md)

### Introduction
This is a lightweight Tampermonkey user script designed to optimize your YouTube viewing experience. It automatically forces the playback speed of YouTube videos to 2x and locks the default video quality to 1080p. There is no need to manually adjust the settings every time you open a video, allowing for a seamless and highly efficient viewing experience.

### Features
- **Automatic 2x Speed**: Intelligently and seamlessly accelerates playback speed to the target rate by simulating native shortcuts (`Shift + >`) with an underlying API fallback.
- **Forced 1080p Quality**: Locks the highest video quality by injecting into LocalStorage and calling the player API at the earliest stage of video loading.
- **Respects Manual Adjustments**: The automatic speed-up triggers only once per video. If you want to watch a specific segment carefully, you can manually revert to 1.0x or any other speed. The script will not forcibly overwrite your manual operations.
- **SPA Compatibility**: Perfectly compatible with YouTube's Single Page Application (SPA) routing. The script works normally regardless of how you navigate through the sidebar or recommended videos.

### Detailed Usage Instructions
#### Prerequisites
1. Ensure your browser (Chrome/Edge/Firefox, etc.) has a user script manager extension installed. [Tampermonkey](https://www.tampermonkey.net/) is recommended.

#### Installation
1. Open the Tampermonkey dashboard and click **Create a new script**.
2. Copy all the script code from this repository and paste it to overwrite the default code in the newly created script.
3. Press `Ctrl + S` (Windows) or `Cmd + S` (Mac) to save the script.
4. Open YouTube, click on any video, and enjoy the automatic 1080p and 2x speed experience.

### Customization Methods
We have centralized the configuration at the very top of the script. You only need to change the values in the `CONFIG` object once to apply your desired speed and quality globally.

Locate the `CONFIG` section at the top of the script code:
```javascript
    // ==========================================
    // CONFIGURATION - Customize your settings here
    // ==========================================
    const CONFIG = {
        // Target playback speed (e.g., 1.5, 2)
        TARGET_SPEED: 2,
        
        // Target video quality
        // Options: highres (Highest), hd2160 (4K), hd1440 (2K), hd1080 (1080p), hd720 (720p), large (480p)
        TARGET_QUALITY: 'hd1080'
    };
    // ==========================================
```
- **Modify Speed**: Change `2` to your desired speed.
- **Modify Quality**: Change `'hd1080'` to your desired quality code.
