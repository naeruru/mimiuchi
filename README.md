# mimiuchi: speech-to-text
mimiuchi is a free, customizable, OSC capable, speech-to-text application for displaying text or relaying it to other applications like VRChat. Its customizable text window is also designed to be paired with applications like OBS.  It runs on the web and electron, with little setup required beyond customization. You can try it out right now at [captions.naeris.net](https://mimiuchi.naeris.net/). UI currently supports English and Japanese日本語！

### Why?
I support the idea of people having many ways to communicate and do things. It is important to give people those tools and make them easily accessible. This app will give another way for people to display text in different applications like OBS or VRC. It is completely free and privacy focused. An example of a very similar application is [web captioner](https://webcaptioner.com/). However, I want to expand upon it and make this version unique!

### Features
- Speech-to-text
- Text-to-text
- OSC broadcasting (for apps like VRChat)
- Custom OSC param execution via language triggers ("turn my marker on" -> `/avatar/parameter/Marker True`) (WIP)
- ...and many settings to customize the experience!

## How to use
### Speech-to-Text
Simply go to [captions.naeris.net](https://mimiuchi.naeris.net/) and press the mic button! You will need to grant access the first time you do it. Currently, mimiuchi uses [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) to perform speech-to-text, which is only supported on the web version. You [can read more about it below](#web-speech-api).

### Using OSC
Click the broadcast button to toggle OSC. Due to how VRChat OSC works, this will require the desktop app version. If you're using speech-to-text, the web version can relay all speech-to-text to the deskop app when broadcasting is on.

### Everything together
Running both applications at once, you simply toggle on the `MIC` and `BROADCAST` button on the web app. it will then toggle the desktop on with it.

#### website -> desktop
![electron_iikWzoYPXL](https://user-images.githubusercontent.com/9059594/226288125-b09fcf3e-6a98-41e3-a84d-f382845e3a22.gif)

#### desktop -> VRChat
![desktoptovrchat](https://user-images.githubusercontent.com/9059594/226288753-1232f6e4-08db-4dd7-a28f-f5506b9f7668.gif)

\* the intermediate text results are a work in progress

# Additional info
## Web Speech API
mimiuchi uses [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) to perform speech-to-text, which is a [browser dependent](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API#browser_compatibility) API. Most browsers, like Chrome or Edge, will upload your audio to GCP or Azure respectively to have it processed, while the webpage never gets direct access to it. For example, you can read about Chrome's privacy pertaining to it [here](https://www.google.com/chrome/privacy/whitepaper.html#speech). I chose Web Speech API because it is completely free and requires no accounts to access. Unfortunately, its free use is disabled in electron's chromium, so this means speech-to-text in this form can only run in the browser. This adds slight complexity when you want to interface with local applications like VRChat by requiring a "middle man" to relay the text back and forth. Still, I think that this approach is worth it as it provides a free way to use powerful speech-to-text models for people who dont have the means to pay.

In the future, I would like to support a standalone desktop experience, but this is currently on hold till I figure out how popular this might be.

## Todo
in no particular order...
- more customization for text window
- ~~better intermediate text results~~ ✅
- support more languages
- text-to-speech (voice suggestions? let me know!)
- VRChat text shader support (sending character data to float params)
- add ability to export settings/transcripts
- better webkit/safari support
- Spotify support(maybe)
- OBS websocket support
- add button toggles (for example quick language switching via gamepad/keyboard inputs)
- better generic osc support
- DeepL translation support

## Download
See the [release page](https://github.com/naexris/mimiuchi/releases) to install the latest version of the desktop app. The desktop version lets you use additional features like OSC.

## Building it yourself
### Requirements
- [NodeJS 18.4.0+](https://nodejs.org/en/)

### Setup

Use `npm install` to install dependencies.

Use `npm run dev` to run the application. It will run an electron version and web version.

Or you can use `npm run build` to build the application. It will create an exe file in `release/`.
