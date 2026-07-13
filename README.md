# YouTube Force 1080p & 2x

[English](#english) | [简体中文](#简体中文)

---

## English

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

---

## 简体中文

### 介绍
这是一个轻量级的 Tampermonkey（油猴）用户脚本，旨在优化你的 YouTube 观看体验。它会自动将 YouTube 视频的播放速度强制设置为 2 倍速，并将视频画质默认锁定为 1080p。无需每次打开视频都手动去调整设置，让你畅快高效地观看视频。

### 特性
- **自动 2 倍速**：通过模拟原生快捷键（`Shift + >`）和底层 API 兜底，智能且无缝地将播放速度加速至目标倍速。
- **强制 1080p 画质**：在视频加载的最早期通过注入 LocalStorage 和调用播放器 API，锁定视频最高画质。
- **尊重手动调整**：每个视频只会触发一次自动加速。如果你在观看过程中想仔细看某一段，完全可以手动调回 1.0x 或其他倍速，脚本不会强制覆盖你的手动操作。
- **完美适配 SPA**：完美兼容 YouTube 的单页应用（SPA）路由跳转，无论通过侧边栏还是推荐列表切换视频，脚本都能正常生效。

### 详细使用教程
#### 前置准备
1. 确保你的浏览器（Chrome/Edge/Firefox 等）已安装用户脚本管理器插件。推荐使用 [Tampermonkey](https://www.tampermonkey.net/)。

#### 安装脚本
1. 打开 Tampermonkey 面板，点击 **添加新脚本 (Create a new script)**。
2. 将本仓库中的脚本代码全部复制，并粘贴覆盖掉新建脚本中的默认代码。
3. 按下 `Ctrl + S` (Windows) 或 `Cmd + S` (Mac) 保存脚本。
4. 打开 YouTube，随意点击一个视频，享受自动 1080p 和 2 倍速的体验。

### 自定义方法
我们已经将配置项集中在了代码的最上方。你只需要修改 `CONFIG` 对象中的数值一次，即可全局应用你想要的速度和画质。

定位到脚本代码最上方的 `CONFIG` 区域：
```javascript
    // ==========================================
    // CONFIGURATION - Customize your settings here
    // ==========================================
    const CONFIG = {
        // 目标播放倍速（例如 1.5, 2）
        TARGET_SPEED: 2,
        
        // 目标视频画质
        // 选项：highres (最高画质), hd2160 (4K), hd1440 (2K), hd1080 (1080p), hd720 (720p), large (480p)
        TARGET_QUALITY: 'hd1080'
    };
    // ==========================================
```
- **修改倍速**：将 `2` 修改为你想要的倍速。
- **修改画质**：将 `'hd1080'` 替换为你想要的画质代码。
