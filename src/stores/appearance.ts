import { defineStore } from 'pinia'

export const useAppearanceStore = defineStore('appearance', {
  state: () => ({
    text: {
      color: '#FFFFFF',
      interim_color: '#BC96FF', // ⑅•ᴗ•⑅)◜..°♡
      font: {
        type: 'google', // system, server, google
        name: 'Roboto',
        info: null,
        sub_type: { style: 'regular', weight: '400' },
        sub_types: [
          { style: 'regular', weight: '100' },
          { style: 'italic', weight: '100' },
          { style: 'regular', weight: '300' },
          { style: 'italic', weight: '300' },
          { style: 'regular', weight: '400' },
          { style: 'italic', weight: '400' },
          { style: 'regular', weight: '500' },
          { style: 'italic', weight: '500' },
          { style: 'regular', weight: '700' },
          { style: 'italic', weight: '700' },
          { style: 'regular', weight: '900' },
          { style: 'italic', weight: '900' },
        ],
      },
      font_size: 64,
      enable_fade: true,
      hide_after: 10, // seconds
      fade_time: 4, // seconds
      new_line_delay: 0 as number, // seconds
    },
    ui: {
      color: '#000000',
    },
  }),
  getters: {

  },
  actions: {

  },
})
