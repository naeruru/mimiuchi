import { createI18n } from 'vue-i18n'

import en from '@/plugins/localization/en'
import es from '@/plugins/localization/es'
import ja from '@/plugins/localization/ja'
import zh from '@/plugins/localization/zh'

const messages = {
  en,
  es,
  ja,
  zh,
}

const instance = createI18n({
  legacy: false,
  missingWarn: false,
  fallbackWarn: false,
  fallbackLocale: 'en',
  messages,
})

export default instance

export const i18n = instance.global
