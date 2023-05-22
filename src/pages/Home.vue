
<template>
    <v-card
        id="log-list"
        style="overflow-y: auto; max-height: calc(100vh - 55px);"
        class="fill-height pa-4 overflow-auto log-list"
        v-resize="onResize"
        :color="appearanceStore.ui.color"
        :height="height - 55"
        tile
    >

        <div class="d-flex flex-column">
            <a
                v-for="log in logs"
                class="font-weight-light"
                :class="{'fade-out': log.hide, 'final-text': log.isFinal, 'interim-text': !log.isFinal }"
            >
                <a v-if="log.hide !== 2">{{ log.text }}</a>
            </a>
        </div>


        <WelcomeOverlay :overlay="overlay_main" :page="overlay_page"></WelcomeOverlay>
    </v-card>
</template>

<script lang="ts">
// import {ipcRenderer} from "electron"
import { useDisplay } from 'vuetify'

import WelcomeOverlay from "../components/overlays/WelcomeOverlay.vue"

import { useSettingsStore } from  '../stores/settings'
import { useAppearanceStore } from '../stores/appearance'
import { useLogStore } from '../stores/logs'

declare const window: any

export default {
    name: 'Home',
    components: {
        WelcomeOverlay
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

            // logs: [] as Log[], // { text: '' }

            input_text: '',

            snackbar: false,
            snackbar_color: "error",
            snackbar_icon: "",
            snackbar_desc: '',

            error_snackbar: false,
            error_message: '',

            windowSize: {
                x: 0,
                y: 0,
            }
        }
    },
    methods: {
        onResize() {
          this.windowSize = { x: window.innerWidth, y: window.innerHeight }
        },
        isElectron() {
            // Renderer process
            if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
                return true
            }
            // Main process
            if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
                return true
            }
            // Detect the user agent when the `nodeIntegration` option is set to true
            if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
                return true
            }
            return false
        }
    },
    mounted () {
        this.overlay_main = this.settingsStore.welcome
        this.onResize()
    },
    setup() {
        const { height } = useDisplay()

        const settingsStore = useSettingsStore()
        const appearanceStore = useAppearanceStore()
        const logStore = useLogStore()


        const font_size = `${appearanceStore.text.font_size}px`
        const fade_time = `${appearanceStore.text.fade_time}s`
        const text_color = appearanceStore.text.color
        const interim_color = appearanceStore.text.interim_color

        return {
            settingsStore,
            appearanceStore,
            logs: logStore.logs,
            font_size,
            fade_time,
            text_color,
            interim_color,
            height
        }
    }
}
</script>

<style>
html {
    overflow-y: overlay;
}

.log-list {
    display: flex;
    flex-direction: column-reverse;
    font-size: v-bind(font_size);
}
.log-list::-webkit-scrollbar {
    display: none; /* for Chrome, Safari and Opera */
}

.final-text {
    color: v-bind(text_color);
}
.interim-text {
    color: v-bind(interim_color);
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
    opacity:1;
  }
  100% {
    opacity:0;
  }
}

@-moz-keyframes fadeOut {
  0% {
    opacity:1;
  }
  100% {
    opacity:0;
  }
}

@-webkit-keyframes fadeOut {
  0% {
    opacity:1;
  }
  100% {
    opacity:0;
  }
}

@-o-keyframes fadeOut {
  0% {
    opacity:1;
  }
  100% {
    opacity:0;
  }
}

@-ms-keyframes fadeOut {
  0% {
    opacity:1;
  }
  100% {
    opacity:0;
}
}
</style>