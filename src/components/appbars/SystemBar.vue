<template>
  <v-system-bar height="35" class="systembar pr-0" color="background" window>
    <v-icon class="me-2" icon="mdi-weather-night" />

    <span class="font-weight-medium">{{ APP_NAME }}</span>
    <v-chip class="ml-2" size="x-small" label>
      {{ $t('general.beta') }}
    </v-chip>

    <v-spacer />

    <v-btn class="systembar-button" variant="text" height="35" size="x-small" @click="minimize">
      <v-icon icon="mdi-minus" />
    </v-btn>

    <v-btn variant="text" class="systembar-button ms-2" height="35" size="x-small" @click="toggle_maximize">
      <v-icon :icon=" maximized ? 'mdi-checkbox-multiple-blank-outline' : 'mdi-checkbox-blank-outline'" />
    </v-btn>

    <v-hover>
      <template #default="{ isHovering, props }">
        <v-btn v-bind="props" :color="isHovering ? 'red' : undefined" :variant="isHovering ? `flat` : `text`" class="systembar-button ms-2" height="35" size="x-small" @click="close_app">
          <v-icon icon="mdi-close" />
        </v-btn>
      </template>
    </v-hover>
  </v-system-bar>
</template>

<script lang="ts">
import is_electron from '@/helpers/is_electron'

declare const window: any

export default {
  name: 'App',
  data() {
    return {
      APP_NAME: __APP_NAME__,
      maximized: false,
    }
  },
  mounted() {
    if (is_electron()) {
      window.ipcRenderer.receive('maximized_state', (event: any, data: any) => {
        this.maximized = event
      })
    }
  },
  methods: {
    close_app() {
      if (is_electron())
        window.ipcRenderer.send('close_app')
    },
    toggle_maximize() {
      if (is_electron())
        window.ipcRenderer.send('toggle_maximize')
    },
    minimize() {
      if (is_electron())
        window.ipcRenderer.send('minimize')
    },
  },
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
