import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const welcome = ref(true)

  const language = ref(navigator.language.split('-')[0])

  const drawer = ref(true)

  const stt_Settings = ref({
    language: 'en-US',
    confidence: 0.9,
  })
  return {
    welcome,
    language,
    drawer,
    stt_Settings,
  }
})
