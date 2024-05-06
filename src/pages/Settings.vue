<template>
  <!-- <v-navigation-drawer :width="Math.ceil((window_size.x * .2) / 10) * 10" v-model="settingsStore.drawer" :permanent="!smAndDown" floating v-resize="on_resize">
            {{ window_size }} {{ Math.ceil((window_size.x * .2) / 2) * 2 }}
        </v-navigation-drawer> -->
  <v-navigation-drawer v-model="settingsStore.drawer" :permanent="!smAndDown">
    <v-list density="compact" nav>
      <v-list-subheader>{{ $t('settings.title') }}</v-list-subheader>
      <v-list-item
        v-for="(setting) in settings_general"
        :prepend-icon="setting.icon"
        :title="setting.title"
        :value="setting.value"
        :active="setting.value === $route.name"
        color="primary"
        @click="$router.push({ path: `/settings/${setting.value}` })"
      />

      <v-divider />
      <v-list-subheader>{{ $t('settings.connections.title') }}</v-list-subheader>
      <v-list-item
        v-for="(setting) in connections"
        :prepend-icon="setting.icon"
        :title="setting.title"
        :value="setting.value"
        :active="setting.value === $route.name"
        color="primary"
        @click="$router.push({ path: `/settings/${setting.value}` })"
      />

      <v-divider />
      <v-list-subheader>{{ $t('settings.osc.title') }}</v-list-subheader>
      <v-list-item
        v-for="(setting) in settings_osc"
        :prepend-icon="setting.icon"
        :title="setting.title"
        :value="setting.value"
        :active="setting.value === $route.name"
        color="primary"
        @click="$router.push({ path: `/settings/${setting.value}` })"
      />
      <v-divider />
    </v-list>

    <!-- <v-list :items="settings_list" density="compact" nav></v-list> -->
    <template #append>
      <v-divider />
      <v-col class="d-flex justify-right mt-1 px-2">
        <v-btn
          v-if="update_available" size="small" variant="flat" prepend-icon="mdi-download"
          @click="open_external('https://github.com/naeruru/mimiuchi/releases/latest')"
        >
          <template #prepend>
            <v-icon color="success" size="large" />
          </template>
          {{ $t('general.update') }}
        </v-btn>
        <v-spacer />
        <v-btn
          size="small" variant="flat" prepend-icon="mdi-tag"
          @click="open_external(`https://github.com/naeruru/mimiuchi/releases/tag/v${APP_VERSION}`)"
        >
          v{{ APP_VERSION }}
        </v-btn>
      </v-col>
    </template>
  </v-navigation-drawer>

  <div id="settings" class="d-flex fill-height justify-center settings">
    <v-col class="pa-0" cols="12" md="10" lg="8" xl="6">
      <router-view v-slot="{ Component }" name="panel">
        <transition name="slide-up">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-col>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import is_electron from '@/helpers/is_electron'
import { useSettingsStore } from '@/stores/settings'

declare const window: any

const settingsStore = useSettingsStore()
const { smAndDown } = useDisplay()

const { t } = useI18n()

settingsStore.drawer = !smAndDown.value
const APP_VERSION = ref(__APP_VERSION__)
const update_available = ref(false)

// const window_size = ref({
//   x: 0,
//   y: 0,
// })

const outer_size = computed(() => is_electron() ? '140px' : '105px')
const settings_general = computed(() => {
  return [
    {
      title: t('settings.general.title'),
      value: 'general',
      icon: 'mdi-home',
    },
    {
      title: t('settings.appearance.title'),
      value: 'appearance',
      icon: 'mdi-palette',
    },
    {
      title: t('settings.stt.title'),
      value: 'stt',
      icon: 'mdi-microphone-outline',
    },
    {
      title: t('settings.tts.title'),
      value: 'tts',
      icon: 'mdi-account-voice',
    },
    {
      title: t('settings.word_replace.title'),
      value: 'wordreplace',
      icon: 'mdi-swap-horizontal',
    },
    {
      title: t('settings.translation.title'),
      value: 'translation',
      icon: 'mdi-translate',
    },
  ]
})

const connections = computed(() => {
  return [
    {
      title: t('settings.connections.title'),
      value: 'connections',
      icon: 'mdi-broadcast',
    },
  ]
})

const settings_osc = computed(() => {
  const settings_osc = [
    {
      title: t('settings.osc.general.title'),
      value: 'osc',
      icon: 'mdi-transit-connection-variant',
    },
    {
      title: t('settings.osc.params.title'),
      value: 'oscparams',
      icon: 'mdi-format-list-bulleted-square',
    },
  ]
  if (is_electron())
    return settings_osc
  else return settings_osc.slice(0, 1)
})

onMounted(() => {
  if (is_electron()) {
    window.ipcRenderer.removeListener('update-check')
    window.ipcRenderer.send('update-check')
    window.ipcRenderer.on('update-check', (event: any, data: any) => {
      if (data !== `v${APP_VERSION.value}`)
        update_available.value = true
    })
  }

  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

function open_external(link: string) {
  window.open(link, '_blank')
}
const router = useRouter()

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape')
    router.push({ path: '/' })
}
</script>

<style>
.settings {
  overflow-y: auto;
  max-height: calc(100svh - v-bind(outer_size));
}

.slide-up-enter-active {
  transition: all 0.25s ease-out;
}

.slide-up-leave-active {
  transition: all 0s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
