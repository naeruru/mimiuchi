import { defineStore } from 'pinia'


export const useSpeechStore = defineStore('speech', {
    state: () => ({
        stt: {
            type: {
                title: 'Web Speech API',
                value: 'webspeech'
            },
            language: 'en-US',
            confidence: 0.9,
            sensitivity: 0.0
        },
        tts: {
            enabled: false,
            type: {
                title: 'Web Speech API',
                value: 'webspeech'
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