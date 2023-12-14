<template>
  <v-snackbar
    v-model="defaultStore.snackbar.enabled"
    :color="defaultStore.snackbar.type"
    location="top"
    :timeout="8000"
  >
    <v-row class="align-center justify-center">
      <v-col :cols="12">
        <p v-html="defaultStore.snackbar.desc" />
      </v-col>
    </v-row>
    <template #actions>
      <v-btn variant="text" @click="defaultStore.snackbar.enabled = false">
        Close
      </v-btn>
    </template>
  </v-snackbar>
  <v-footer app class="d-flex flex-column pl-2" height="60" permanent fixed>
    <div class="d-flex w-100 align-center">
      <v-form
        class="d-flex w-100 align-center"
        @submit.prevent="onSubmit()"
      >
        <div class="d-flex w-100 align-center">
          <v-text-field
            v-model="input_text"
            density="compact"
            variant="outlined"
            :label="$t('general.type_message')"
            append-inner-icon="mdi-chevron-right"
            class="mr-6"
            single-line
            hide-details
            flat
            loading
          >
            <template #loader>
              <v-progress-linear
                :active="logStore.loading_result === true || translationStore.download >= 0"
                :color="translationStore.download !== -1 ? 'warning' : 'secondary'"
                :indeterminate="translationStore.download === -1"
                :model-value="translationStore.download"
                :max="100"
                height="5"
                rounded
              />
            </template>
          </v-text-field>

          <v-spacer v-if="!smAndDown" />

          <div class="d-flex justify-right">
            <v-btn v-if="!is_electron()" class="mr-4" :color="(defaultStore.speech.listening) ? 'success' : 'error'" size="small" icon variant="outlined" @click="toggleListen">
              <v-icon v-if="!defaultStore.speech.listening">
                mdi-microphone-off
              </v-icon>
              <v-icon v-else>
                mdi-microphone
              </v-icon>
            </v-btn>
            <v-badge :model-value="!!defaultStore.connections" :content="defaultStore.connections ? defaultStore.connections : undefined" color="success" class="mr-4">
              <v-btn :loading="defaultStore.loading_websocket" :disabled="defaultStore.loading_websocket" :color="(defaultStore.broadcasting) ? 'success' : 'error'" size="small" icon variant="outlined" @click="toggleBroadcast">
                <v-icon v-if="!defaultStore.broadcasting">
                  mdi-broadcast-off
                </v-icon>
                <v-icon v-else>
                  mdi-broadcast
                </v-icon>
              </v-btn>
            </v-badge>
            <v-divider class="mr-4" vertical />
            <v-btn v-if="$route.name === 'home'" color="transparent" size="small" icon flat @click="$router.push({ path: last_setting })">
              <v-icon>mdi-cog</v-icon>
            </v-btn>
            <v-btn v-else color="transparent" size="small" icon flat @click="$router.push({ path: '/' })">
              <v-icon>mdi-home</v-icon>
            </v-btn>
          </div>
        </div>
      </v-form>
    </div>
  </v-footer>
</template>

<script lang="ts">
// import {ipcRenderer} from "electron"
import { useDisplay } from 'vuetify'
import is_electron from '@/helpers/is_electron'

import { useWordReplaceStore } from '@/stores/word_replace'
import { useSettingsStore } from '@/stores/settings'
import { useSpeechStore } from '@/stores/speech'
import { useAppearanceStore } from '@/stores/appearance'
import type { Log } from '@/stores/logs'
import { useLogStore } from '@/stores/logs'
import { useTranslationStore } from '@/stores/translation'
import { useOSCStore } from '@/stores/osc'
import { useConnectionStore } from '@/stores/connections'
import { useDefaultStore } from '@/stores/default'

declare const window: any

export default {
  name: 'Home',
  setup() {
    const { smAndDown } = useDisplay()
    const wordReplaceStore = useWordReplaceStore()
    const settingsStore = useSettingsStore()
    const speechStore = useSpeechStore()
    const appearanceStore = useAppearanceStore()
    const logStore = useLogStore()
    const translationStore = useTranslationStore()
    const oscStore = useOSCStore()
    const connectionStore = useConnectionStore()
    const defaultStore = useDefaultStore()

    return {
      wordReplaceStore,
      settingsStore,
      speechStore,
      appearanceStore,
      logs: logStore.logs,
      logStore,
      translationStore,
      oscStore,
      connectionStore,
      defaultStore,

      smAndDown,
      is_electron,
    }
  },
  data() {
    return {
      last_route: null as any,

      input_text: '',
      typing_limited: false,

      snackbar: false,
      snackbar_color: 'error',
      snackbar_icon: '',
      snackbar_desc: '',

      windowSize: {
        x: 0,
        y: 0,
      },
    }
  },
  computed: {
    last_setting() {
      return (this.last_route && this.last_route.startsWith('/settings')) ? this.last_route : '/settings/general'
    },
  },
  watch: {
    input_text() {
      if (this.oscStore.osc_text && this.oscStore.text_typing && this.defaultStore.broadcasting)
        this.typing_event(true)
    },
    'speechStore.stt.language': function (new_val) {
      if (this.defaultStore.speech.recognition) {
        this.defaultStore.speech.stop()
        this.defaultStore.speech.recognition.lang = new_val
      }
    },
  },
  unmounted() {
    if (this.defaultStore.speech.listening)
      this.toggleListen()
    if (this.defaultStore.broadcasting)
      this.toggleBroadcast()
    if (is_electron()) {
      window.ipcRenderer.removeListener('websocket-connect')
      window.ipcRenderer.removeListener('receive-text-event')
    }
    this.defaultStore.worker.removeEventListener('message', this.translationStore.onMessageReceived)
  },
  updated() {
    this.reloadEvents()
    this.last_route = this.$router.options.history.state.back
  },
  mounted() {
    this.onResize()
    this.reloadEvents()

    if (!this.defaultStore.worker) {
      this.defaultStore.worker = new Worker(new URL('../worker.ts', import.meta.url), {
        type: 'module',
      })
    }
    this.defaultStore.worker.addEventListener('message', this.translationStore.onMessageReceived)

    this.speechStore.initialize_speech(this.speechStore.stt.language)
  },
  methods: {
    toggleListen() {
      this.speechStore.toggle_listen()
    },
    typing_event(event: boolean) {
      this.speechStore.typing_event(event)
    },
    paramTrigger(input: string) {
      // console.log(window.process.type)
      if (this.defaultStore.broadcasting && is_electron()) {
        // if custom params
        // potential addition:
        // use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/search
        // to see which assign is the closest to the keyword found
        // unless switch to nlp first.....
        if (this.oscStore.osc_params.length) {
          this.oscStore.osc_params.forEach((custom_param) => {
            let matchesKey = null

            custom_param.keywords.forEach((keyword) => {
              const key_check = `(^|\\s)(${keyword.text})($|[^a-zA-Z\\d])`
              const reKey = new RegExp(key_check, 'ig')
              matchesKey = reKey.exec(input)
            })

            if (matchesKey) {
              custom_param.assigns.forEach((assign) => {
                const assign_check = `(^|\\s)(${assign.keyword})($|[^a-zA-Z\\d])`
                const reAssign = new RegExp(assign_check, 'ig')
                const matchesAssign = reAssign.exec(input)
                if (matchesAssign) {
                  this.show_snackbar('secondary', `<code>${custom_param.route} = ${assign.set}</code>`)
                  window.ipcRenderer.send('send-param-event', { ip: custom_param.ip, port: custom_param.port, route: custom_param.route, value: assign.set })
                }
              })
            }
          })
        }
      }
    },
    async onSubmit(log: Log | null = null) {
      if (log && !log.transcript)
        return

      if (!log) {
        log = {
          transcript: this.input_text,
          isFinal: true,
          isTranslationFinal: false,
          translate: false,
          hide: 0, // 1 = fade, 2 = hide
        }
      }
      if (log.isFinal)
        this.paramTrigger(log.transcript)
      this.speechStore.on_submit(log, Math.max(this.logStore.logs.length - 1, 0))

      // clear chatbox
      this.input_text = ''
    },
    toggleBroadcast() {
      this.defaultStore.toggle_broadcast()
    },
    show_snackbar(type: string, desc: string) {
      this.defaultStore.snackbar.desc = desc
      this.defaultStore.snackbar.type = type
      this.defaultStore.snackbar.enabled = true
    },
    onResize() {
      this.windowSize = { x: window.innerWidth, y: window.innerHeight }
    },
    reloadEvents() {
      if (is_electron()) {
        window.ipcRenderer.removeListener('websocket-connect')
        window.ipcRenderer.removeListener('receive-text-event')
        window.ipcRenderer.receive('websocket-connect', (event: any, data: any) => {
          this.defaultStore.broadcasting = event
        })
        window.ipcRenderer.receive('receive-text-event', (event: any, data: any) => {
          event = JSON.parse(event)
          this.onSubmit(event)
        })
      }
    },
  },
}
</script>
