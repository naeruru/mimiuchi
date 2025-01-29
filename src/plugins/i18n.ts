import { createI18n } from 'vue-i18n'

import en from '@/plugins/localization/en'
import es from '@/plugins/localization/es'
import ja from '@/plugins/localization/ja'
import zh from '@/plugins/localization/zh'

interface Language {
  title: string,
  value: string,
}

const messages = {
  en,
  es,
  ja,
  zh,
}

export const global_langs = [
  {
    title: 'English (United States)',
    value: 'en',
  },
  {
    title: 'Spanish (España)',
    value: 'es',
  },
  {
    title: '日本語（日本）',
    value: 'ja',
  },
  {
    title: '中文（中国）',
    value: 'zh',
  },
] as Language[]

const instance = createI18n({
  legacy: false,
  missingWarn: false,
  fallbackWarn: false,
  fallbackLocale: 'en',
  messages,
})

export default instance

export const i18n = instance.global
