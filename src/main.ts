// import './demos/ipc'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from '@/App.vue'
import vuetify from '@/plugins/vuetify'

import router from '@/plugins/router'

import i18n from '@/plugins/i18n'

// import { loadFonts } from './plugins/webfontloader'
// loadFonts()

import '@/assets/fonts/fonts.css'
import storeReset from './plugins/storereset'

const pinia = createPinia()
pinia.use(storeReset)

// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

const app_name = 'mimiuchi'

createApp(App)
  .use(vuetify)
  .use(pinia)
  .use(router)
  .use(i18n)
  .provide('app_name', app_name)
  .mount('#app')
