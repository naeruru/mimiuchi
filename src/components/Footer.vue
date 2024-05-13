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
                :active="logsStore.loading_result === true || translationStore.download >= 0"
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
              v-if="!is_electron()" class="mr-4" :color="(defaultStore.speech.listening) ? 'success' : 'error'"
              size="small" icon variant="outlined" @click="toggleListen"
            >
              <v-icon v-if="!defaultStore.speech.listening">
                mdi-microphone-off
              </v-icon>
              <v-icon v-else>
                mdi-microphone
              </v-icon>
            </v-btn>
            <v-badge
              :model-value="!!defaultStore.connections"
              :content="defaultStore.connections ? defaultStore.connections : undefined" color="success"
              class="mr-4"
            >
              <v-btn
                :loading="defaultStore.loading_websocket" :disabled="defaultStore.loading_websocket"
                :color="(defaultStore.broadcasting) ? 'success' : 'error'" size="small" icon variant="outlined"
                @click="toggleBroadcast"
              >
                <v-icon v-if="!defaultStore.broadcasting">
                  mdi-broadcast-off
                </v-icon>
                <v-icon v-else>
                  mdi-broadcast
                </v-icon>
              </v-btn>
            </v-badge>
            <v-divider class="mr-4" vertical />
            <v-btn
              v-if="$route.name === 'home'" color="transparent" size="small" icon flat
              @click="$router.push({ path: last_setting })"
            >
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

<script setup lang="ts">
// import {ipcRenderer} from "electron"

import { computed, onMounted, onUnmounted, onUpdated, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import is_electron from '@/helpers/is_electron'

import { useSpeechStore } from '@/stores/speech'
import type { Log } from '@/stores/logs'
import { useLogsStore } from '@/stores/logs'
import { useTranslationStore } from '@/stores/translation'
import { useOSCStore } from '@/stores/osc'
import { useDefaultStore } from '@/stores/default'

declare const window: any

const last_route = ref<any>(null)
const { smAndDown } = useDisplay()
const speechStore = useSpeechStore()
const logsStore = useLogsStore()
const translationStore = useTranslationStore()
const oscStore = useOSCStore()
const defaultStore = useDefaultStore()

const router = useRouter()
const input_text = ref('')

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

onUnmounted(() => {
  if (defaultStore.speech.listening)
    toggleListen()
  if (defaultStore.broadcasting)
    toggleBroadcast()
  if (is_electron()) {
    window.ipcRenderer.removeListener('websocket-connect')
    window.ipcRenderer.removeListener('receive-text-event')
  }

  if (defaultStore.worker)
    defaultStore.worker.removeEventListener('message', translationStore.onMessageReceived)
})

onUpdated(() => {
  reloadEvents()
  last_route.value = router.options.history.state.back
})

onMounted(() => {
  onResize()
  reloadEvents()

  if (!defaultStore.worker) {
    defaultStore.worker = new Worker(new URL('../worker.ts', import.meta.url), {
      type: 'module',
    })
    
    defaultStore.worker.addEventListener('message', translationStore.onMessageReceived)
  }

  speechStore.initialize_speech(speechStore.stt.language)
})

function toggleListen() {
  speechStore.toggle_listen()
}

function typing_event(event: boolean) {
  speechStore.typing_event(event)
}

function paramTrigger(input: string) {
  // console.log(window.process.type)
  if (defaultStore.broadcasting && is_electron()) {
    // if custom params
    // potential addition:
    // use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/search
    // to see which assign is the closest to the keyword found
    // unless switch to nlp first.....
    if (oscStore.osc_profiles[oscStore.current_profile].length) {
      oscStore.osc_profiles[oscStore.current_profile].forEach((custom_param) => {
        let matchesKey: RegExpExecArray | null = null

        custom_param.keywords.forEach((keyword) => {
          if (matchesKey)
            return

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
              show_snackbar('secondary', `<code>${custom_param.route} = ${assign.set1}</code>`)

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

              window.ipcRenderer.send('send-param-event', {
                ip: custom_param.ip,
                port: custom_param.port,
                route: custom_param.route,
                value: newValue,
              })

              if (assign.activation === 'pulse') {
                // The value should reset after some time.
                setTimeout(() => {
                  show_snackbar('secondary', `<code>${custom_param.route} = ${assign.set2}</code>`)

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

                  window.ipcRenderer.send('send-param-event', {
                    ip: custom_param.ip,
                    port: custom_param.port,
                    route: custom_param.route,
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
    paramTrigger(log.transcript)
  speechStore.on_submit(log, Math.max(logsStore.logs.length - 1, 0))

  // clear chatbox
  input_text.value = ''
}

function toggleBroadcast() {
  defaultStore.toggle_broadcast()
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
    window.ipcRenderer.on('websocket-connect', (event: any, data: any) => {
      defaultStore.broadcasting = data
    })
    window.ipcRenderer.on('receive-text-event', (event: any, data: any) => {
      const parsedData = JSON.parse(data)
      onSubmit(parsedData)
    })
  }
}
</script>
