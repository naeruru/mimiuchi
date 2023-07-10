<template>
    <v-app-bar color="primary" app flat height="50">
      <v-app-bar-nav-icon variant="text" @click.stop="settingsStore.drawer = !settingsStore.drawer"></v-app-bar-nav-icon>
      <v-container class="mb-7 fill-height d-flex align-center">
        <v-icon class="me-6 ms-4 d-none d-sm-flex" icon="mdi-weather-night"></v-icon>

        <v-app-bar-title class="font-weight-medium">
          {{ APP_NAME }}
          <!-- <v-chip class="ml-2" label>{{ $t('general.beta') }}</v-chip> -->
        </v-app-bar-title>

        <v-btn icon @click="$router.push({ path: '/' })" :color="$route.name === 'home' ? 'secondary' : 'white'">
            <v-icon>mdi-home</v-icon>
        </v-btn>
        <v-btn icon @click="$router.push({ path: '/settings/general' })" :color="$route.fullPath.startsWith('/settings') ? 'secondary' : 'white'">
            <v-icon>mdi-cog</v-icon>
        </v-btn>
        <v-btn icon @click="open_external('https://github.com/naeruru/mimiuchi')" color="white">
            <v-icon>mdi-help-circle-outline</v-icon>
        </v-btn>
      </v-container>
    </v-app-bar>
  </template>
  
<script lang='ts'>
import { useSettingsStore } from  '../stores/settings'
import logo from "../assets/logo-256x256.png"

export default {
    name: 'Header',
    data() {
        return {
          APP_NAME: __APP_NAME__,
          logo: logo
        }
    },
    methods: {
      open_external(link: string) {
        window.open(link, '_blank')
      }
    },
    setup() {
      const settingsStore = useSettingsStore()
      return {
        settingsStore
      }
    }
}
</script>