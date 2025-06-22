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
  <v-footer app class="d-flex flex-column pl-2" :height="route.name === 'home' && appearanceStore.footer_size ? 200 : 55" permanent fixed>
    <div class="d-flex w-100 align-center">
      <v-form
        class="d-flex w-100 align-center"
        @submit.prevent="onSubmit()"
      >
        <div class="d-flex w-100">
          <v-textarea
            v-if="route.name === 'home' && appearanceStore.footer_size"
            v-model="input_text"
            variant="outlined"
            :label="t('general.type_message')"
            append-inner-icon="mdi-chevron-right"
            class="mr-6 mt-1 fill-height"
            rows="6"
            hide-details
            flat
            loading
            @keyup.enter="onSubmit()"
          >
            <template #loader>
              <v-progress-linear
                :active="logsStore.loading_result || translationStore.download >= 0"
                :color="translationStore.download !== -1 ? 'warning' : 'secondary'"
                :indeterminate="translationStore.download === -1"
                :model-value="translationStore.download"
                :max="100"
                height="5"
                rounded
              />
            </template>
          </v-textarea>

          <v-text-field
            v-else
            v-model="input_text"
            density="compact"
            variant="outlined"
            :label="t('general.type_message')"
            append-inner-icon="mdi-chevron-right"
            class="mr-6"
            single-line
            hide-details
            flat
            loading
          >
            <template #loader>
              <v-progress-linear
                :active="logsStore.loading_result || translationStore.download >= 0"
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
            <v-btn
              v-if="!is_electron()" class="mr-4"
              :color="(defaultStore.speech.listening) ? 'success' : 'error'"
              size="small"
              :icon="!defaultStore.speech.listening ? 'mdi-microphone-off' : 'mdi-microphone'"
              variant="outlined"
              @click="toggleListen"
            />
            <v-badge
              :model-value="!!defaultStore.connections_count"
              :content="defaultStore.connections_count ? defaultStore.connections_count : undefined" color="success"
              class="mr-4"
            >
              <v-btn
                :color="(defaultStore.broadcasting) ? 'success' : 'error'" size="small"
                :icon="!defaultStore.broadcasting ? 'mdi-broadcast-off' : 'mdi-broadcast'"
                variant="outlined"
                @click="connectionsStore.toggle_broadcast()"
              />
            </v-badge>
            <v-divider height="50" class="mr-4" vertical />
            <v-btn
              v-if="route.name === 'home'" color="transparent"
              size="small"
              icon="mdi-cog"
              flat
              @click="router.push({ path: last_setting })"
            />
            <v-btn
              v-else
              color="transparent"
              size="small"
              icon="mdi-home"
              flat
              @click="router.push({ path: '/' })"
            />
          </div>
        </div>
      </v-form>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
// import {ipcRenderer} from "electron"

import { computed, onMounted, onUnmounted, onUpdated, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import is_electron from '@/helpers/is_electron'

import { useAppearanceStore } from '@/stores/appearance'
import { useConnectionsStore } from '@/stores/connections'
import { useDefaultStore } from '@/stores/default'
import type { Log } from '@/stores/logs'
import { useLogsStore } from '@/stores/logs'
import { useSettingsStore } from '@/stores/settings'
import { useOSCStore } from '@/stores/osc'
import { useSpeechStore } from '@/stores/speech'
import { useTranslationStore } from '@/stores/translation'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

declare const window: any

const last_route = ref<any>(null)
const { smAndDown } = useDisplay()
const appearanceStore = useAppearanceStore()
const connectionsStore = useConnectionsStore()
const defaultStore = useDefaultStore()
const logsStore = useLogsStore()
const oscStore = useOSCStore()
const settingsStore = useSettingsStore()
const speechStore = useSpeechStore()
const translationStore = useTranslationStore()

const input_text = ref('')
const input_index = ref<any>(null)

const windowSize = ref({
  x: 0,
  y: 0,
})

const last_setting = computed(() => {
  return (last_route.value && last_route.value.startsWith('/settings')) ? last_route.value : '/settings/general'
})

watch(input_text, () => {
  if (oscStore.osc_text && oscStore.text_typing && defaultStore.broadcasting)
    typing_event(true)

  if (input_index.value === null) {
    input_index.value = logsStore.logs.length
  }
  if (settingsStore.realtime_text)
    speechStore.submit_text(input_text.value, input_index.value, false)
})

const { stt } = storeToRefs(speechStore)
watch(
  () => stt.value.language,
  (new_val) => {
    if (defaultStore.speech.recognition) {
      defaultStore.speech.stop()
      defaultStore.speech.recognition.lang = new_val
    }
  },
  { deep: true },
)

onMounted(() => {
  onResize()
  reloadEvents()

  if (is_electron()) {
    // Connections
    window.ipcRenderer.on('mimiuchi-websocketserver-started', () => {
      console.log(`Starting mimiuchi WebSocket server... (Listening on port ${connectionsStore.core_mimiuchi_websocketserver.websocketserver?.port})`)
    })

    window.ipcRenderer.on('mimiuchi-websocketserver-close', () => {
      console.log('Closing mimiuchi WebSocket server...')
    })

    window.ipcRenderer.on('mimiuchi-websocketserver-closed', () => {
      console.log('Closed mimiuchi WebSocket server.')
    })

    window.ipcRenderer.on('mimiuchi-websocketserver-error', (event: any, data: any) => {
      console.error(data)
    })

    window.ipcRenderer.on('mimiuchi-websocketserver-client-connected', (event: any, arg1: any, arg2: any) => {
      defaultStore.broadcasting = arg1
      console.log(`A WebSocket client connected. (${arg2})`)
    })

    window.ipcRenderer.on('mimiuchi-websocketserver-client-disconnected', (event: any, arg1: any, arg2: any) => {
      defaultStore.broadcasting = arg1
      console.log(`A WebSocket client disconnected. (${arg2.ip})`)
      console.log(`Code: ${arg2.code}. Reason: ${arg2.reason}`)
    })

    // Speech
    window.ipcRenderer.on('transformers-translate-render', (event: any, data: any) => {
      translationStore.onMessageReceived(data)
    })
  }

  speechStore.initialize_speech(speechStore.stt.language)
})

onUnmounted(() => {
  if (defaultStore.speech.listening)
    toggleListen()

  if (defaultStore.broadcasting)
    connectionsStore.toggle_broadcast()

  if (is_electron()) {
    // Connections
    window.ipcRenderer.removeListener('mimiuchi-websocketserver-started')
    window.ipcRenderer.removeListener('mimiuchi-websocketserver-closed')
    window.ipcRenderer.removeListener('mimiuchi-websocketserver-error')
    window.ipcRenderer.removeListener('mimiuchi-websocketserver-client-connected')
    window.ipcRenderer.removeListener('mimiuchi-websocketserver-client-disconnected')

    // Speech
    window.ipcRenderer.removeListener('receive-text-event')
    window.ipcRenderer.removeListener('transformers-translate-render')
  }
})

onUpdated(() => {
  reloadEvents()
  last_route.value = router.options.history.state.back
})

function toggleListen() {
  speechStore.toggle_listen()
}

function typing_event(event: boolean) {
  speechStore.typing_event(event)
}

function match_osc_trigger(input: string) {
  // console.log(window.process.type)
  if (defaultStore.broadcasting && is_electron()) {
    // potential addition:
    // use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/search
    // to see which assign is the closest to the keyword found
    // unless switch to nlp first.....
    if (oscStore.osc_profiles[oscStore.current_profile].length) {
      oscStore.osc_profiles[oscStore.current_profile].forEach((trigger) => {
        let matchesKey: RegExpExecArray | null = null

        trigger.keywords.forEach((keyword) => {
          if (matchesKey)
            return

          const key_check = `(^|\\s)(${keyword.text})($|[^a-zA-Z\\d])`
          const reKey = new RegExp(key_check, 'gi')
          matchesKey = reKey.exec(input)
        })

        if (matchesKey) {
          trigger.assigns.forEach((assign) => {
            const assign_check = `(^|\\s)(${assign.keyword})($|[^a-zA-Z\\d])`
            const reAssign = new RegExp(assign_check, 'gi')
            const matchesAssign = reAssign.exec(input)
            if (matchesAssign) {
              show_snackbar('secondary', `<code>${trigger.route} = ${assign.set1}</code>`)

              let newValue: number | boolean | null = null

              switch (assign.type) {
                case 'int':
                case 'float':
                  newValue = Number(assign.set1)

                  break
                case 'bool':
                  if (assign.set1 === 'true')
                    newValue = true
                  else if (assign.set1 === 'false')
                    newValue = false
                  else
                    newValue = Boolean(assign.set1)

                  break
              }

              window.ipcRenderer.send('send-osc-message', {
                ip: trigger.ip,
                port: trigger.port,
                route: trigger.route,
                value: newValue,
              })

              if (assign.activation === 'pulse') {
                // The value should reset after some time.
                setTimeout(() => {
                  show_snackbar('secondary', `<code>${trigger.route} = ${assign.set2}</code>`)

                  switch (assign.type) {
                    case 'int':
                    case 'float':
                      newValue = Number(assign.set2)

                      break
                    case 'bool':
                      if (assign.set2 === 'true')
                        newValue = true
                      else if (assign.set2 === 'false')
                        newValue = false
                      else
                        newValue = Boolean(assign.set2)

                      break
                  }

                  window.ipcRenderer.send('send-osc-message', {
                    ip: trigger.ip,
                    port: trigger.port,
                    route: trigger.route,
                    value: newValue,
                  })
                }, assign.pulse_duration)
              }
            }
          })
        }
      })
    }
  }
}

async function onSubmit(log: Log | null = null) {
  if (log && !log.transcript)
    return

  if (!log) {
    log = {
      transcript: input_text.value,
      isFinal: true,
      isTranslationFinal: false,
      translate: false,
      hide: 0, // 1 = fade, 2 = hide
    }
  }

  if (log && log.isFinal)
    match_osc_trigger(log.transcript)

  speechStore.on_submit(log, input_index.value ?? Math.max(logsStore.logs.length - 1, 0))

  // clear chatbox
  input_text.value = ''
  input_index.value = null
}

function show_snackbar(type: string, desc: string) {
  defaultStore.snackbar.desc = desc
  defaultStore.snackbar.type = type
  defaultStore.snackbar.enabled = true
}

function onResize() {
  windowSize.value = { x: window.innerWidth, y: window.innerHeight }
}

function reloadEvents() {
  if (is_electron()) {
    window.ipcRenderer.removeListener('websocket-connect')
    window.ipcRenderer.removeListener('receive-text-event')
    window.ipcRenderer.on('receive-text-event', (event: any, data: any) => {
      const parsedData = JSON.parse(data)
      onSubmit(parsedData)
    })
  }
}
</script>
