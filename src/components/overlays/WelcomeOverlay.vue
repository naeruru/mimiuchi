<template>
  <v-overlay
    v-model="overlay_state"
    transition="slide-x-transition"
    :contained="overlay_page === 0 ? false : true"
    :class="overlay_page === 0 ? 'align-center justify-center' : 'align-end justify-end'"
  >
    <v-card v-if="overlay_page == 0" :title="$t('welcome.intro.title', { name: APP_NAME })" class="pa-2" max-width="500">
      <template #prepend>
        <v-avatar
          color="transparent"
        >
          <v-img src="logo-256x256.png" />
        </v-avatar>
      </template>
      <v-card-text class="text-subtitle-1 py-2">
        {{ $t('welcome.intro.description', { name: APP_NAME }) }}
      </v-card-text>
      <v-card-actions>
        <v-btn color="secondary" @click="overlay_state = false">
          {{ $t('welcome.intro.button') }}
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-scroll-x-transition>
      <v-card v-if="overlay_page == 1" :title="$t('welcome.controls.title')" class="mb-2 mr-8">
        <v-divider class="mb-2" />
        <v-card-text class="text-subtitle-1 py-">
          <v-icon class="me-1" color="success">
            mdi-broadcast
          </v-icon>
          <v-icon class="me-1" color="error">
            mdi-broadcast-off
          </v-icon>
          <span class="subheading me-2">{{ $t('welcome.controls.broadcast') }}</span>
        </v-card-text>
        <v-card-text class="text-subtitle-1 py-2">
          <v-icon class="me-1" color="success">
            mdi-microphone
          </v-icon>
          <v-icon class="me-1" color="error">
            mdi-microphone-off
          </v-icon>
          <span class="subheading me-2">{{ $t('welcome.controls.mic') }}</span>
        </v-card-text>
        <v-card-text class="text-subtitle-1 py-2">
          <v-icon class="me-1">
            mdi-cog
          </v-icon>
          <span class="subheading me-2">{{ $t('welcome.controls.settings') }}</span>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="overlay_state = false">
            {{ $t('welcome.controls.button') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-scroll-x-transition>
  </v-overlay>
</template>

<script lang="ts">
import { useSettingsStore } from '@/stores/settings'

export default {
  name: 'WelcomeOverlay',
  props: {
    overlay: Boolean,
    page: Number,
  },
  setup() {
    const APP_NAME = __APP_NAME__
    const settingsStore = useSettingsStore()

    return {
      APP_NAME,
      settingsStore,
    }
  },
  data() {
    return {
      overlay_state: this.overlay,
      overlay_page: this.page,
    }
  },
  watch: {
    overlay(new_val) {
      this.overlay_state = new_val
    },
    overlay_state(new_val) {
      if (new_val == false && this.overlay_page === 0) {
        this.overlay_state = true
        this.overlay_page++
      }
      else if (this.overlay_page === 1) {
        this.settingsStore.welcome = false
      }
    },
  },
}
</script>
