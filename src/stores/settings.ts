import { defineStore } from 'pinia'
import { ref } from 'vue'
import { global_langs } from '@/plugins/i18n'

export const useSettingsStore = defineStore('settings', () => {
  const config_version = ref(0)

  const welcome = ref(true)
  const drawer = ref(true)
  const realtime_text = ref(false)

  const stt_Settings = ref({
    language: 'en-US',
    confidence: 0.9,
  })

  const languages = ref(global_langs)

  const language = ref(languages.value.map(language => language.value).includes(navigator.language.split('-')[0]) ? navigator.language.split('-')[0] : 'en')

  return {
    config_version,
    welcome,
    drawer,
    realtime_text,
    stt_Settings,
    languages,
    language,
  }
})
