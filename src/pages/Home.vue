<template>
  <v-card id="log-list" v-resize="onResize" class="fill-height pa-4 overflow-auto log-list" :color="appearanceStore.ui.color" :height="height - 55" tile>
    <div>
      <a
        v-for="log in logs"
        :class="{ 'fade-out': log.hide, 'final-text': log.isFinal || log.isTranslationFinal, 'interim-text': !log.isFinal || (!log.isTranslationFinal && log.translate) }"
      >
        <a v-if="log.hide !== 2">{{ (translationStore.enabled && (log.translation || !translationStore.show_original)) ? log.translation : log.transcript }}&nbsp;&nbsp;</a>
        <v-expand-transition v-show="log.pause">
          <div>
            <v-col class="pa-0" />
          </div>
        </v-expand-transition>
      </a>
    </div>

    <WelcomeOverlay :overlay="overlay_main" :page="overlay_page" />
  </v-card>
</template>

<script lang="ts">
// import {ipcRenderer} from "electron"
import { useDisplay } from 'vuetify'

import is_electron from '@/helpers/is_electron'

import WelcomeOverlay from '@/components/overlays/WelcomeOverlay.vue'

import { useSettingsStore } from '@/stores/settings'
import { useAppearanceStore } from '@/stores/appearance'
import { useLogStore } from '@/stores/logs'
import { useTranslationStore } from '@/stores/translation'

declare const window: any

export default {
  name: 'Home',
  components: {
    WelcomeOverlay,
  },
  setup() {
    const { height } = useDisplay()

    const settingsStore = useSettingsStore()
    const appearanceStore = useAppearanceStore()
    const logStore = useLogStore()
    const translationStore = useTranslationStore()

    const font_size = `${appearanceStore.text.font_size}px`
    const fade_time = `${appearanceStore.text.fade_time}s`
    const text_color = appearanceStore.text.color
    const interim_color = appearanceStore.text.interim_color

    const font_name = appearanceStore.text.font.name
    const font_subtype = appearanceStore.text.font.sub_type

    return {
      settingsStore,
      appearanceStore,
      logs: logStore.logs,
      translationStore,
      font_size,
      fade_time,
      text_color,
      interim_color,
      font_name,
      font_subtype,
      height,
    }
  },
  data() {
    return {
      // oscClient: client,
      overlay_main: false,
      overlay_page: 0,

      ws: null as any,

      listening: false,
      listening_error: false,
      talking: false,

      loadingWebsocket: false,
      broadcasting: false,

      input_text: '',

      snackbar: false,
      snackbar_color: 'error',
      snackbar_icon: '',
      snackbar_desc: '',

      error_snackbar: false,
      error_message: '',

      windowSize: {
        x: 0,
        y: 0,
      },
    }
  },
  computed: {
    outer_size: () => is_electron() ? '90px' : '55px',
  },
  mounted() {
    this.overlay_main = this.settingsStore.welcome
    this.onResize()
  },
  methods: {
    onResize() {
      this.windowSize = { x: window.innerWidth, y: window.innerHeight }
    },
  },
}
</script>

<style>
html {
  overflow-y: hidden;
}

.log-list {
  display: flex;
  flex-direction: column-reverse;
  font-family: v-bind(font_name);
  font-style: v-bind('font_subtype.style');
  font-weight: v-bind('font_subtype.weight');
  font-size: v-bind(font_size);
  overflow-y: auto;
  max-height: calc(100vh - v-bind(outer_size));
}

.log-list::-webkit-scrollbar {
  display: none;
  /* for Chrome, Safari and Opera */
}

.final-text {
  color: v-bind(text_color);
}

.interim-text {
  color: v-bind(interim_color);
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.fade-out {
  animation: fadeOut ease v-bind(fade_time);
  -webkit-animation: fadeOut ease v-bind(fade_time);
  -moz-animation: fadeOut ease v-bind(fade_time);
  -o-animation: fadeOut ease v-bind(fade_time);
  -ms-animation: fadeOut ease v-bind(fade_time);
  animation-fill-mode: forwards;
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

@-moz-keyframes fadeOut {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

@-webkit-keyframes fadeOut {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

@-o-keyframes fadeOut {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

@-ms-keyframes fadeOut {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
