<template>
  <v-app-bar color="primary" app flat height="50">
    <v-app-bar-nav-icon
      variant="text"
      @click.stop="settingsStore.drawer = !settingsStore.drawer"
    />
    <v-container class="mb-7 fill-height d-flex align-center">
      <v-icon
        class="me-6 ms-4 d-none d-sm-flex"
        icon="mdi-weather-night"
      />
      <v-app-bar-title class="font-weight-medium">
        {{ APP_NAME }}
      </v-app-bar-title>
      <v-btn
        icon :color="route.name === 'home' ? 'secondary' : 'white'"
        @click="router.push({ path: '/' })"
      >
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-btn
        icon
        :color="route.fullPath.startsWith('/settings') ? 'secondary' : 'white'"
        @click="router.push({ path: '/settings/general' })"
      >
        <v-icon>mdi-cog</v-icon>
      </v-btn>
      <v-btn
        icon
        color="white"
        @click="open_external('https://github.com/naeruru/mimiuchi')"
      >
        <v-icon>mdi-help-circle-outline</v-icon>
      </v-btn>
    </v-container>
  </v-app-bar>
</template>

<script setup lang='ts'>
import { useSettingsStore } from '@/stores/settings'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const settingsStore = useSettingsStore()

const APP_NAME = __APP_NAME__

function open_external(link: string) {
  window.open(link, '_blank')
}
</script>
