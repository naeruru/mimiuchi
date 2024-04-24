// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'

// themes
import { midnight_purple } from '@/plugins/themes/midnight_purple'
import { cotton_candy } from '@/plugins/themes/cotton_candy'
import { red_light } from '@/plugins/themes/red_light'
import { red_dark } from '@/plugins/themes/red_dark'
import { gold_dark } from '@/plugins/themes/gold_dark'
import { gold_light } from '@/plugins/themes/gold_light'
import { forest_dark } from '@/plugins/themes/forest_dark'
import { forest_light } from '@/plugins/themes/forest_light'

export default createVuetify({
  theme: {
    defaultTheme: 'midnight_purple',
    themes: {
      midnight_purple,
      cotton_candy,
      red_light,
      red_dark,
      gold_dark,
      gold_light,
      forest_dark,
      forest_light,
    },
  },
})
