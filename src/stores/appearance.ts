import { defineStore } from 'pinia'


export const useAppearanceStore = defineStore('appearance', {
    state: () => ({
        text: {
            color: '#FFFFFF',
            interim_color: '#FFFFFF',
            font_size: 64,
            enable_fade: true,
            hide_after: 10, // seconds
            fade_time: 4, // seconds
        },
        ui: {
            color: '#000000'
        }
    }),
    getters: {

    },
    actions: {

    }
})