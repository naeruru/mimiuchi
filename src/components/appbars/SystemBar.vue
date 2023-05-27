<template>
      <v-system-bar height="35" class="systembar pr-0" color="background" window>
        <v-icon class="me-2" icon="mdi-weather-night"></v-icon>
  
        <span class="font-weight-medium">{{ APP_NAME }}</span>
        <v-chip class="ml-2" size="x-small" label>{{ $t('general.beta') }}</v-chip>
  
        <v-spacer></v-spacer>
  
        <v-btn @click="minimize" class="systembar-button" variant="text" height="35" size="x-small">
          <v-icon icon="mdi-minus"></v-icon>
        </v-btn>
  
        <v-btn @click="toggle_maximize" variant="text" class="systembar-button ms-2" height="35" size="x-small">
          <v-icon :icon=" maximized ? 'mdi-checkbox-multiple-blank-outline' : 'mdi-checkbox-blank-outline'"></v-icon>
        </v-btn>
  
        <v-hover>
          <template v-slot:default="{ isHovering, props }">
            <v-btn @click="close_app" v-bind="props" :color="isHovering ? 'red' : undefined" :variant="isHovering ? `flat` : `text`" class="systembar-button ms-2" height="35" size="x-small">
              <v-icon icon="mdi-close"></v-icon>
            </v-btn>
          </template>
        </v-hover>
      </v-system-bar>
</template>
  
<script lang="ts">
declare const window: any

import is_electron from '../../helpers/is_electron'

export default {
  name: 'App',
  data() {
      return {
        APP_NAME: __APP_NAME__,
        maximized: false,
      }
  },
  methods: {
    close_app() {
      if (is_electron()) window.ipcRenderer.send("close_app")
    },
    toggle_maximize() {
      if (is_electron()) window.ipcRenderer.send("toggle_maximize")
    },
    minimize() {
      if (is_electron()) window.ipcRenderer.send("minimize")
    },
  },
  mounted() {
      if (is_electron())
        window.ipcRenderer.receive('maximized_state', (event: any, data: any) => {
            this.maximized = event
        })
    }
}
</script>

<style>

.systembar {
  -webkit-app-region: drag;
}

.systembar-button {
  -webkit-app-region: no-drag;
}
</style>