# Chatbox Tools
Chatbox Tools is a customizable, OSC capable, speech-to-text application for displaying text or relaying it to other applications like VRChat. Its customizable text window is also designed to be paired with applications like OBS.  It runs on the web and electron, with little setup required beyond customization. You can try it out right now at [captions.naeris.net](https://captions.naeris.net/).

### Why?
I support the idea of people having many ways to communicate and do things. It is important to give people those tools and make them easily accessible. This app will give another way for people to display text in different applications like OBS or VRC. It is completely free and privacy focused. An example of a very similar application is [web captioner](https://webcaptioner.com/). However, I want to expand upon it and make this version unique!

## How to use
### Speech-to-Text
Simply go to [captions.naeris.net](https://captions.naeris.net/) and press the mic button! Chatbox Tools uses [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) to perform speech-to-text. I chose Web Speech API because it is completely free and requires no accounts to access. Keep in mind that its implementation varies between browsers. Unfortunately, its free use is disabled in electron, so this means speech-to-text in this form can only run on a website.

### Using OSC
All features **except** OSC are enabled on the web version of the app. In order to use OSC, you must use the desktop version of this application. If you're using speech-to-text, the website version can relay all text to the deskop app when broadcasting is on. I believe tis approach is worth it in order to have a super simple system for speaking that requires zero setup besides a single install.

### Everything together
Running both applications at once, you simply toggle on the `MIC` and `BROADCAST` button on the web app. it will then toggle the desktop on with it.

#### website -> desktop
![electron_iikWzoYPXL](https://user-images.githubusercontent.com/9059594/226288125-b09fcf3e-6a98-41e3-a84d-f382845e3a22.gif)

#### desktop -> VRChat
![desktoptovrchat](https://user-images.githubusercontent.com/9059594/226288753-1232f6e4-08db-4dd7-a28f-f5506b9f7668.gif)

\* the intermediate text results are a work in progress

## Todo
- add customization for text window
- better intermittent text results
- support more languages (speech and ui)
- better generic osc support
- organize code base

## Download
I have yet to have release a build of the desktop app, but you are free to build it with the steps below!

## Building it yourself
### Requirements
- [NodeJS 18.4.0+](https://nodejs.org/en/)

### Setup

Use `npm install` to install dependencies.

Use `npm run dev` to run the application. It will run an electron version and web version.

Or you can use `npm run build` to build the application. It will create an exe file in `release/`.
