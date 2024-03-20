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

<script lang="ts">
import { useAppearanceStore } from '@/stores/appearance'
import { useWordReplaceStore } from '@/stores/word_replace'
import { useSettingsStore } from '@/stores/settings'
import { useSpeechStore } from '@/stores/speech'
import { useTranslationStore } from '@/stores/translation'
import { useConnectionStore } from '@/stores/connections'
import { useOSCStore } from '@/stores/osc'

import is_electron from '@/helpers/is_electron'

import SystemBar from '@/components/appbars/SystemBar.vue'

declare const window: any

export default {
  name: 'App',
  components: {
    SystemBar,
  },
  setup() {
    const appearanceStore = useAppearanceStore()
    const speechStore = useSpeechStore()
    const wordReplaceStore = useWordReplaceStore()
    const translationStore = useTranslationStore()
    const settingsStore = useSettingsStore()
    const connectionStore = useConnectionStore()
    const oscStore = useOSCStore()

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
    connectionStore.$subscribe((_, state) => {
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
    connectionStore.$patch(JSON.parse(localStorage.getItem('connections') || '{}'))
    oscStore.$patch(JSON.parse(localStorage.getItem('osc') || '{}'))

    return {
      settingsStore,
      connectionStore,
      is_electron,
      wordReplaceStore,
    }
  },
  unmounted() {
    if (this.is_electron())
      window.ipcRenderer.send('close-ws')
  },
  mounted() {
    if (this.is_electron() && this.connectionStore.ws.enabled)
      window.ipcRenderer.send('start-ws', this.connectionStore.ws.port)

    this.$i18n.locale = this.settingsStore.language
    this.settingsStore.$subscribe((language, state) => {
      this.$i18n.locale = this.settingsStore.language
    })

    // temp word replace upgrade
    this.wordReplaceStore.update()
    console.log(this.wordReplaceStore.word_replacements)
  },
  created() {
    if (this.is_electron())
      this.$router.push('/')
  },
}
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
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>
