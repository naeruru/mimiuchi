import { createI18n } from 'vue-i18n'

import en from './localization/en'
import ja from './localization/ja'

const messages = {
    en,
    ja
}

export default createI18n({
    fallbackLocale: 'en',
    messages
})