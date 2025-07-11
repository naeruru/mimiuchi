<template>
  <v-navigation-drawer v-model="settingsStore.drawer" :permanent="!smAndDown">
    <v-list density="compact" nav>
      <v-list-subheader>{{ t('settings.title') }}</v-list-subheader>
      <v-list-item
        v-for="(setting) in settings_general"
        :key="setting.value"
        :value="setting.value"
        :active="setting.value === route.name"
        color="primary"
        @click="setting.unavailable_condition ? null : router.push({ path: `/settings/${setting.value}` })"
      >
        <template #prepend>
          <v-icon :class="{ 'settings-disabled': setting.unavailable_condition }">
            {{ setting.icon }}
          </v-icon>
        </template>
        <v-list-item-title :class="{ 'settings-disabled': setting.unavailable_condition }">
          {{ setting.title }}
        </v-list-item-title>
        <v-tooltip
          v-if="setting.unavailable_condition && setting.unavailable_tooltip"
          v-bind="unavailable_tooltip_attributes"
        >
          <component :is="setting.unavailable_tooltip" />
        </v-tooltip>
      </v-list-item>

      <v-divider />
      <v-list-subheader>{{ t('settings.connections.title') }}</v-list-subheader>
      <v-list-item
        v-for="(setting) in settings_connections"
        :key="setting.value"
        :prepend-icon="setting.icon"
        :title="setting.title"
        :value="setting.value"
        :active="setting.value === route.name"
        color="primary"
        @click="router.push({ path: `/settings/${setting.value}` })"
      />

      <v-divider />
      <v-list-subheader>
        {{ t('settings.osc.title') }}
        <v-tooltip
          open-on-click
          class="settings_tooltip"
          :text="t('settings.osc.title_tooltip')"
        >
          <template #activator="{ props }">
            <v-icon
              v-bind="props"
              icon="mdi-broadcast"
              color="success"
              size="15"
            />
          </template>
        </v-tooltip>
      </v-list-subheader>
      <v-list-item
        v-for="(setting) in settings_osc"
        :key="setting.value"
        :value="setting.value"
        :active="setting.value === route.name"
        color="primary"
        @click="setting.unavailable_condition ? null : router.push({ path: `/settings/${setting.value}` })"
      >
        <template #prepend>
          <v-icon :class="{ 'settings-disabled': setting.unavailable_condition }">
            {{ setting.icon }}
          </v-icon>
        </template>
        <v-list-item-title :class="{ 'settings-disabled': setting.unavailable_condition }">
          {{ setting.title }}
        </v-list-item-title>
        <v-tooltip
          v-if="setting.unavailable_condition && setting.unavailable_tooltip"
          v-bind="unavailable_tooltip_attributes"
        >
          <component :is="setting.unavailable_tooltip" />
        </v-tooltip>
      </v-list-item>
      <v-divider />
    </v-list>

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
          {{ t('general.update') }}
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
      <router-view v-slot="{ Component }">
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
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import is_electron from '@/helpers/is_electron'
import { useSettingsStore } from '@/stores/settings'

import OSCUnavailable from '@/pages/tooltips/OSCUnavailable.vue'
import STTUnavailable from '@/pages/tooltips/STTUnavailable.vue'
import TranslationUnavailable from '@/pages/tooltips/TranslationUnavailable.vue'

declare const window: any

const settingsStore = useSettingsStore()
const { smAndDown } = useDisplay()

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

settingsStore.drawer = !smAndDown.value
const APP_VERSION = ref(__APP_VERSION__)
const update_available = ref(false)

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
      unavailable_condition: is_electron(),
      unavailable_tooltip: STTUnavailable,
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
      unavailable_condition: !is_electron(),
      unavailable_tooltip: TranslationUnavailable,
    },
  ]
})

const settings_connections = computed(() => {
  return [
    {
      title: t('settings.connections.title'),
      value: 'connections',
      icon: 'mdi-broadcast',
    },
  ]
})

const settings_osc = computed(() => {
  return [
    {
      title: t('settings.osc.general.title'),
      value: 'osc',
      icon: 'mdi-transit-connection-variant',
      unavailable_condition: !is_electron(),
      unavailable_tooltip: OSCUnavailable,
    },
    {
      title: t('settings.osc.triggers.title'),
      value: 'osctriggers',
      icon: 'mdi-format-list-bulleted-square',
      unavailable_condition: !is_electron(),
      unavailable_tooltip: OSCUnavailable,
    },
  ]
})

const unavailable_tooltip_attributes = {
  // open_delay is deliberately set to an absurdly high number
  // This forces the user to click the activator to open it within a reasonable amount of time
  // Essentially, the tooltip becomes an exclusively open-on-click tooltip while retaining all the features provided by open-on-hover
  // If the attribute open-on-hover is set to false, various features are lost
  activator: 'parent',
  class: 'settings_tooltip',
  closeOnBack: true,
  interactive: true,
  maxWidth: '256px',
  offset: -20, // px
  openDelay: 60000, // ms
  openOnClick: true,
  scrollStrategy: 'close' as const,
}

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

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape')
    router.push({ path: '/' })
}
</script>

<style>
.v-navigation-drawer {
  user-select: none;
}

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

.settings_tooltip > .v-overlay__content {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  outline-style: solid;
  outline-color: rgba(var(--v-border-color), var(--v-border-opacity));
  outline-width: 1px;
}

.settings-disabled {
  opacity: var(--v-disabled-opacity) !important;
}
</style>
