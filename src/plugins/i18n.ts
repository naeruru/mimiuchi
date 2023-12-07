import { createI18n } from 'vue-i18n'

import en from './localization/en'
import ja from './localization/ja'

const messages = {
    en,
    ja,
    es
}

const instance = createI18n({
    fallbackLocale: 'en',
    messages
})

export default instance

export const i18n = instance.global
