# Chatbox Tools
Chatbox Tools is a customizable, osc enabled, text interface for displaying text or relaying it to other applications (like VRC). It is an all-in-one application and runs on electron and on the web, with little setup required beyond customization! It is a work in progress and only has very basic functionality at the moment. Will update as I go (though slowly).

## Why?
I support the idea of people having many ways to communicate and do things. It is important to give people those tools and make them easily accessible. This app will give another way for people to display text in different applications like OBS or VRC. It is completely free and privacy focused. An example of a very similar application is [web captioner](https://webcaptioner.com/). However, I want to expand upon it and make this version unique!

## Todo
- better text interface window
- ability to customize text page any way you want
- support more languages (waiting for vrc osc chatbox endpoint to support more than ascii)
- better generic osc support
- pics!

## Done
- veryveryvery basic ui
- text to text
- vrc osc support
- speech to text (using Web Speech API)

## Download
I have yet to release a public version since it has basic functionality at the moment, but you are free to build it with the steps below!

## Building it yourself
### Requirements
- [NodeJS 18.4.0+](https://nodejs.org/en/)

### Setup

Use `npm install` to install dependencies.

Use `npm run dev` to run the application. It will run an electron version and web version.

### Usage
Most all features are available on the web version. The only missing feature on the web version is OSC over UDP (browser doesn't support that). To fix that, you can run the electron version at the same time, and the web version will communicate with it and send all commands locally. The web version is required to take advantage of the free, and unlimited use, Web Speech API for speech to text. If Web Speech API is ever changed to no longer be free, I will do my best to change how this app works.


- To use speech to text, click `LISTEN` on the web version.

- To use osc, open the desktop app and click `BROADCAST` button.

- To use osc and speech to text at the same time, open the desktop app and the web app. Then, click `BROADCAST` and `LISTEN` button on the web version so it can send speech to text data to desktop app. If broadcast is not on on the desktop version when you do that, the web version will automatically turn it on too.