import { createApp } from 'vue'
import App from '@/App.vue'
import vuetify from '@/plugins/vuetify'
import router from '@/plugins/router'
import i18n from '@/plugins/i18n'

// import { loadFonts } from './plugins/webfontloader'

import '@/assets/fonts/fonts.css'

import { createPinia } from 'pinia'

const pinia = createPinia()

// loadFonts()

const app_name = 'mimiuchi'

createApp(App)
  .use(vuetify)
  .use(pinia)
  .use(router)
  .use(i18n)
  .provide('app_name', app_name)
  .mount('#app')
