import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './plugins/router'
import i18n from './plugins/i18n'
// import { loadFonts } from './plugins/webfontloader'

import { createPinia } from 'pinia'
const pinia = createPinia()

// loadFonts()

createApp(App)
  .use(vuetify)
  .use(pinia)
  .use(router)
  .use(i18n)
  .mount('#app')
