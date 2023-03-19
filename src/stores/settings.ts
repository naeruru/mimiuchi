import { defineStore } from 'pinia'


interface Param {
    ip: string,
    port: string,
    route: string,
    keywords: Keyword[],
    assigns: Assign[]
}
interface Keyword {
    enabled: boolean,
    text: string
}
interface Assign {
    keyword: string,
    type: string,
    set: boolean | number | string
}


export const useSettingsStore = defineStore('settings', {
    state: () => ({

        welcome: true,

        stt_Settings: {
            language: 'en-US',
            confidence: 0.9
        },

        osc_settings: {
            ip: '127.0.0.1',
            port: '9000',
            osc_text: true,
            text_typing: true, // typing indicator
            stt_typing: true, // talking indicator
        },
        osc_params: [] as Param[]
    }),
    getters: {

    },
    actions: {

    }
})