import { defineStore } from 'pinia'


export const useSpeechStore = defineStore('speech', {
    state: () => ({
        stt: {
            type: {
                title: "Web Speech API",
                value: "webspeech"
            },
            language: 'en-US',
            confidence: 0.9
        },
        tts: {
            enabled: false,
            type: {
                title: "Web Speech API",
                value: "webspeech"
            },
            voice: '',
            rate: 1,
            pitch: 1,
        }
    }),
    getters: {

    },
    actions: {

    }
})