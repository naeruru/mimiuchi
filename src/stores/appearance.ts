import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppearanceStore = defineStore('appearance', () => {
  const current_theme = ref('midnight_purple')
  const footer_size = ref(0)

  const text = ref({
    color: '#FFFFFF',
    interim_color: '#BC96FF', // ⑅•ᴗ•⑅)◜..°♡
    font: {
      type: 'google', // system, server, google
      name: 'Roboto',
      info: undefined,
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
    outline: false,
    outline_size: 4,
    outline_color: '#6d6d6d',
    font_size: 64,
    enable_fade: true,
    hide_after: 10, // seconds
    fade_time: 4, // seconds
    new_line_delay: 0 as number, // seconds
  })
  const ui = ref({
    color: '#000000',
  })

  return {
    current_theme,
    footer_size,
    text,
    ui,
  }
})
