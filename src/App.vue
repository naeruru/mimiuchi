<template>
  <v-app>
    <v-main>
      <router-view name="Header"></router-view>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts">

import { useSettingsStore } from  './stores/settings'

export default {
  name: 'App',

  setup() {
    const settingsStore = useSettingsStore()

    settingsStore.increment()

    // console.log(settingsStore.count)
    
    return {
      settingsStore
    }
  },

  data: () => ({
    //
  }),
}
</script>
