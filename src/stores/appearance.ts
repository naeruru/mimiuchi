import { defineStore } from 'pinia'


export const useAppearanceStore = defineStore('appearance', {
    state: () => ({
        text: {
            color: '#FFFFFF',
            interim_color: '#BC96FF', //⑅•ᴗ•⑅)◜..°♡
            font: {
                type: 'google', // system, server, google
                name: 'Roboto',
                sub_type: 'regular',
                sub_types: [
                    '100',
                    '100italic',
                    '300',
                    '300italic',
                    'regular',
                    'italic',
                    '500',
                    '500italic',
                    '700',
                    '700italic',
                    '900',
                    '900italic',
                ]
            },
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