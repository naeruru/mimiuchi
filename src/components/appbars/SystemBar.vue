<template>
  <v-system-bar height="35" class="systembar pr-0" color="background" window>
    <div v-if="platform.includes('mac')" :style="{ 'min-width': '75px' }"></div>
    <v-icon class="me-2" icon="mdi-weather-night" />

    <span class="font-weight-medium">{{ APP_NAME }}</span>
    <v-chip class="ml-2" size="x-small" label>
      {{ t('general.beta') }}
    </v-chip>

    <v-spacer />

    <div v-if="!platform.includes('mac')">
      <v-btn class="systembar-button" variant="text" height="35" size="x-small" @click="minimize">
      <v-icon icon="mdi-minus" />
      </v-btn>

      <v-btn variant="text" class="systembar-button ms-2" height="35" size="x-small" @click="toggle_maximize">
        <v-icon :icon=" maximized ? 'mdi-checkbox-multiple-blank-outline' : 'mdi-checkbox-blank-outline'" />
      </v-btn>

      <v-hover>
        <template #default="{ isHovering, props }">
          <v-btn
            v-bind="props"
            :color="isHovering ? 'red' : undefined"
            :variant="isHovering ? `flat` : `text`"
            class="systembar-button ms-2"
            height="35"
            size="x-small"
            @click="close_app"
          >
            <v-icon icon="mdi-close" />
          </v-btn>
        </template>
      </v-hover>
    </div>
  </v-system-bar>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import is_electron from '@/helpers/is_electron'

const { t } = useI18n()

declare const window: any

const APP_NAME = __APP_NAME__
const maximized = ref(false)
const platform = ref(window.navigator.platform.toLowerCase())

// onMounted(() => {
//   if (is_electron()) {
//     window.ipcRenderer.on('maximized_state', (event: any, data: any) => {
//       maximized.value = event
//     })
//   }
// })

function close_app() {
  if (is_electron())
    window.ipcRenderer.send('close_app')
}
function toggle_maximize() {
  if (is_electron())
    window.ipcRenderer.send('toggle_maximize')
}
function minimize() {
  if (is_electron())
    window.ipcRenderer.send('minimize')
}
</script>

<style scoped>
.systembar {
  -webkit-app-region: drag;
}

.systembar-button {
  -webkit-app-region: no-drag;
}
</style>
