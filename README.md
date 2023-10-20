<p align="center">
  <img src="https://mimiuchi.com/logo-256x256.png" width="100">
</p>

# mimiuchi: speech-to-text

mimiuchi is a free, customizable, OSC capable, speech-to-text application for displaying text or relaying it to other applications like VRChat. Its customizable text window is also designed to be paired with applications like OBS. It runs on the web, with little setup required beyond customization. You can try it out right now at [mimiuchi.com](https://mimiuchi.com/) with Chrome, Safari, or Edge. UI currently supports English and Japanese日本語！

### Features

- Speech-to-text
- Text-to-speech
- On-device translations
- OSC broadcasting (for apps like VRChat)
- (WIP) Custom OSC param execution via language triggers ("turn my marker on" -> `/avatar/parameter/Marker True`)
- ...and many settings to customize the experience!

## How to use

### Speech-to-Text

Simply go to [mimiuchi.com](https://mimiuchi.com/) and press the mic button! You will need to grant access the first time you do it. Currently, mimiuchi uses [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) to perform speech-to-text, which is only supported on the web version. You [can read more about it below](#web-speech-api). In the future I will support more options.

### Using OSC

Click the broadcast button to toggle OSC. Due to how VRChat OSC works, this will require the desktop app version which you can download [here](https://github.com/naeruru/mimiuchi/releases/). If you're using speech-to-text, the web version can relay all speech-to-text to the deskop app when broadcasting is on.

### Everything together

Running both applications at once, you simply toggle on the `MIC` and `BROADCAST` button on the web app. it will then toggle the desktop on with it.

website -> desktop

![mimiuchi-ws_example](https://github.com/naeruru/mimiuchi/assets/9059594/4a85352f-7183-448e-931e-0ab07054231e)


website -> desktop -> VRChat

![mimiuchi-vrchat_example](https://github.com/naeruru/mimiuchi/assets/9059594/666900a9-d176-4c39-a5dd-6a320a46cd8c)


# Additional info

### Why?

I support the idea of people having many ways to communicate and do things. It is important to give people those tools and make them easily accessible. This app will give another way for people to display text in different applications like OBS or VRC. It is free and focused on privacy as an end goal. An example of a very similar application is [web captioner](https://webcaptioner.com/). However, I want to expand upon it and make this version unique!

## Web Speech API

mimiuchi uses [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) to perform speech-to-text, which is a [browser dependent](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API#browser_compatibility) API. Most browsers, like Chrome or Edge, will upload your audio to GCP or Azure respectively to have it processed, while the webpage never gets direct access to it. For example, you can read about Chrome's privacy pertaining to it [here](https://www.google.com/chrome/privacy/whitepaper.html#speech). I chose Web Speech API because it is completely free and requires no accounts to access. Unfortunately, its free use is disabled in electron's chromium, so this means speech-to-text in this form can only run in the browser. This adds slight complexity when you want to interface with local applications like VRChat by requiring a "middle application" to relay the text back and forth. Still, I think that this approach is worth it as it provides a free way to use powerful speech-to-text models for people who dont have the means to pay.

In the future, I would like to support a standalone desktop experience, but this is currently on hold till I figure out how popular this might be.

## Todo

in no particular order...

- more customization for text window
- ~~better intermediate text results~~ ✅
- ~~text-to-speech~~ ✅
- more TTS/STT options (for standalone desktop experience)
- VRChat text shader support (sending character data to float params)
- ~~add ability to export settings/transcripts~~✅
- ~~better webkit/safari support~~✅
- Spotify support(maybe)
- OBS websocket and 'text source' support
- option for second 'control panel' type screen with focus on quick switching between settings
- better generic osc support
- ~~translation support~~✅
- ~~webhook/websocket customization to connect to other apps that aren't related to me~~✅
- documentation
- steamvr integration
- continuous text transmission option for VRChat
- locally run whisper c++ bindings / WebGPU based inference
  - this point is really important to me, because I want a truly low latency private STT system. but.. I want to make sure I do it the right way, such that it can work entirely in the browser, utilizing the full power of your GPU or CPU, completely local and with minimal latency. A lot of this is very new, so it may take some time to iron it out. the first versions of it may differ greatly from the end goal.

## Download

See the [release page](https://github.com/naeruru/mimiuchi/releases) to install the latest version of the desktop app. The desktop version lets you use additional features like OSC.

## Building it yourself

### Requirements

- [NodeJS 18.x+](https://nodejs.org/en/)

### Setup

Use `npm install` to install dependencies.

Use `npm run dev` to run the application. It will run an electron version and web version.

Or you can use `npm run build` to build the application. It will create an exe file in `release/`.

## Special Thanks

- fuopy for the name, mimiuchi, which lends the name from a project they made long ago!

## License

This project is licensed under GNU General Public License v3.0 - see the [LICENSE.txt](LICENSE.txt) file for details.
