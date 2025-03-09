import { global_langs } from '@/plugins/i18n'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // État par défaut du store
  const welcome = ref(true)
  const drawer = ref(true) // Le drawer doit être true par défaut
  const realtime_text = ref(false)

  const stt_Settings = ref({
    language: 'en-US',
    confidence: 0.9,
  })

  const languages = ref(global_langs)

  const language = ref(
    languages.value.map(language => language.value).includes(navigator.language.split('-')[0])
      ? navigator.language.split('-')[0]
      : 'en',
  )

  // Fonction pour forcer l'ouverture du drawer
  function openDrawer() {
    drawer.value = true
  }

  // Fonction pour forcer la fermeture du drawer
  function closeDrawer() {
    drawer.value = false
  }

  // Fonction pour basculer l'état du drawer
  function toggleDrawer() {
    drawer.value = !drawer.value
  }

  return {
    welcome,
    drawer,
    realtime_text,
    stt_Settings,
    languages,
    language,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  }
})
