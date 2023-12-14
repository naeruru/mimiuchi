import { createI18n } from 'vue-i18n'

import en from '@/plugins/localization/en'
import es from '@/plugins/localization/es'
import ja from '@/plugins/localization/ja'

const messages = {
  en,
  es,
  ja,
}

const instance = createI18n({
  fallbackLocale: 'en',
  messages,
})

export default instance

export const i18n = instance.global
