<template>
  <v-app>
    <v-main>
      <router-view name="Header"></router-view>
      <router-view></router-view>
      <router-view name="Footer"></router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { useAppearanceStore } from  './stores/appearance'
import { useWordReplaceStore } from  './stores/word_replace'
import { useSettingsStore } from  './stores/settings'

export default {
  name: 'App',
  setup() {
    const appearanceStore = useAppearanceStore()
    const wordReplaceStore = useWordReplaceStore()
    const settingsStore = useSettingsStore()

    appearanceStore.$subscribe((_, state) => {
        localStorage.setItem('appearance', JSON.stringify(state))
    })
    settingsStore.$subscribe((_, state) => {
        localStorage.setItem('settings', JSON.stringify(state))
    })
    wordReplaceStore.$subscribe((_, state) => {
        localStorage.setItem('word_replace', JSON.stringify(state))
    })


    appearanceStore.$patch(JSON.parse(localStorage.getItem('appearance') || '{}'))
    settingsStore.$patch(JSON.parse(localStorage.getItem('settings') || '{}'))
    wordReplaceStore.$patch(JSON.parse(localStorage.getItem('word_replace') || '{}'))
    
    return {
      appearanceStore,
      wordReplaceStore,
      settingsStore
    }
  }
}
</script>

<style>
.pointer {
  cursor: pointer;
}
html::-webkit-scrollbar {
      width: 10px; 
      height: 120px;
   }

html::-webkit-scrollbar-track {
    background-color: black;
  }

html::-webkit-scrollbar-thumb {
    background: #4e4e4e; /* #a9a4e5 */
    border-radius: 10px;
  }
</style>