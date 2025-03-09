import App from '@/App.vue'
import i18n from '@/plugins/i18n'
import router from '@/plugins/router'

import storeReset from '@/plugins/storereset'
import vuetify from '@/plugins/vuetify'
// Initialize services on startup
import { initTranslationModel } from '@/services/translation.service'
import { createPinia } from 'pinia'

import { createApp } from 'vue'

import '@/assets/fonts/fonts.css'

const pinia = createPinia()
pinia.use(storeReset)

// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.

const app_name = 'mimiuchi'

// Initialiser le modèle de traduction si nous sommes en mode electron
if (typeof window !== 'undefined' && window.ipcRenderer) {
  initTranslationModel((progress) => {
    console.log(`Translation model loading: ${progress}%`)
  }).catch((error) => {
    console.error('Failed to initialize translation model:', error)
  })
}

createApp(App)
  .use(vuetify)
  .use(pinia)
  .use(router)
  .use(i18n)
  .provide('app_name', app_name)
  .mount('#app')
