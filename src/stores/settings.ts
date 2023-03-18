import { defineStore } from 'pinia'


export const useSettingsStore = defineStore('settings', {
    state: () => ({

        welcome: true,

        stt_Settings: {
            language: '',
            confidence: 0.9
        },

        osc_settings: {
            ip: '127.0.0.1',
            port: '9000',
            osc_text: true,
            text_typing: true, // typing indicator
            stt_typing: false,
        },
        osc_params: []
    }),
    getters: {

    },
    actions: {

    }
})