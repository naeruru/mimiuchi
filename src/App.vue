<template>
  <v-app>
    <v-main>
      <router-view name="Header"></router-view>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { useWordReplaceStore } from  './stores/word_replace'
import { useSettingsStore } from  './stores/settings'

export default {
  name: 'App',

  setup() {
    const wordReplaceStore = useWordReplaceStore()
    const settingsStore = useSettingsStore()

    settingsStore.$subscribe((_, state) => {
        localStorage.setItem('settings', JSON.stringify(state))
    })
    wordReplaceStore.$subscribe((_, state) => {
        localStorage.setItem('word_replace', JSON.stringify(state))
    })


    
    settingsStore.$patch(JSON.parse(localStorage.getItem('settings') || '{}'))
    wordReplaceStore.$patch(JSON.parse(localStorage.getItem('word_replace') || '{}'))


    
    // settingsStore.increment()

    // console.log(settingsStore.count)
    
    return {
      wordReplaceStore,
      settingsStore
    }
  },

  data: () => ({
    //
  })
}
</script>