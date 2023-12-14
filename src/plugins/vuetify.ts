// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'

// themes
import { midnight_purple } from '@/plugins/themes/midnight_purple'
import { cotton_candy } from '@/plugins/themes/cotton_candy'

export default createVuetify({
  theme: {
    defaultTheme: 'midnight_purple',
    themes: {
      midnight_purple,
      cotton_candy,
    },
  },
})
