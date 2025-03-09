<template>
  <v-app>
    <SystemBar v-if="is_electron()" />
    <router-view name="Header" />
    <v-main>
      <router-view />
    </v-main>
    <router-view name="Footer" />
  </v-app>
</template>

<script setup lang="ts">
import SystemBar from '@/components/appbars/SystemBar.vue'
import is_electron from '@/helpers/is_electron'
import { global_langs } from '@/plugins/i18n'
import { useAppearanceStore } from '@/stores/appearance'
import { useConnectionsStore } from '@/stores/connections'
import { useOSCStore } from '@/stores/osc'
import { useSettingsStore } from '@/stores/settings'
import { useSpeechStore } from '@/stores/speech'
import { useTranslationStore } from '@/stores/translation'
import { useWordReplaceStore } from '@/stores/word_replace'
import { onMounted, onUnmounted } from 'vue'

import { useI18n } from 'vue-i18n'

import { useRouter } from 'vue-router'

const { locale } = useI18n()

declare const window: any

const appearanceStore = useAppearanceStore()
const speechStore = useSpeechStore()
const wordReplaceStore = useWordReplaceStore()
const translationStore = useTranslationStore()
const settingsStore = useSettingsStore()
const connectionsStore = useConnectionsStore()
const oscStore = useOSCStore()

const router = useRouter()

if (is_electron())
  router.push('/')

appearanceStore.$subscribe((_, state) => {
  localStorage.setItem('appearance', JSON.stringify(state))
})
speechStore.$subscribe((_, state) => {
  localStorage.setItem('speech', JSON.stringify(state))
})
settingsStore.$subscribe((_, state) => {
  localStorage.setItem('settings', JSON.stringify(state))
})
wordReplaceStore.$subscribe((_, state) => {
  localStorage.setItem('word_replace', JSON.stringify(state))
})
translationStore.$subscribe((_, state) => {
  localStorage.setItem('translation', JSON.stringify(state))
})
connectionsStore.$subscribe((_, state) => {
  localStorage.setItem('connections', JSON.stringify(state))
})
oscStore.$subscribe((_, state) => {
  localStorage.setItem('osc', JSON.stringify(state))
})

appearanceStore.$patch(JSON.parse(localStorage.getItem('appearance') || '{}'))
speechStore.$patch(JSON.parse(localStorage.getItem('speech') || '{}'))
settingsStore.$patch(JSON.parse(localStorage.getItem('settings') || '{}'))
wordReplaceStore.$patch(JSON.parse(localStorage.getItem('word_replace') || '{}'))
translationStore.$patch(JSON.parse(localStorage.getItem('translation') || '{}'))
connectionsStore.$patch(JSON.parse(localStorage.getItem('connections') || '{}'))
oscStore.$patch(JSON.parse(localStorage.getItem('osc') || '{}'))

settingsStore.languages = global_langs

onUnmounted(() => {
  if (is_electron())
    window.ipcRenderer.send('close-ws')
})

onMounted(() => {
  if (is_electron() && connectionsStore.ws.enabled)
    window.ipcRenderer.send('start-ws', connectionsStore.ws.port)

  locale.value = settingsStore.language
  settingsStore.$subscribe((_, state) => {
    locale.value = settingsStore.language
  })
})
</script>

<style>
.pointer {
  cursor: pointer;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background-color: transparent; /* rgb(var(--v-theme-primary)); */
}

::-webkit-scrollbar-thumb {
  background: #4e4e4e; /* #a9a4e5 */
  border-radius: 10px;
}

/* blink keyframe */
.text-glow {
  color: rgba(var(--v-theme-secondary))
}

.blink {
  animation: blinker 1s cubic-bezier(.5, 0, 1, 1) infinite alternate;
}

@keyframes blinker {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
