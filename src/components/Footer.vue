<template>
    <v-snackbar
        v-model="snackbar"
        :color="snackbar_color"
        location="top"
        :timeout="8000"
    >
        <v-row class="align-center justify-center">
            <v-col :cols="12">
                <p v-html="snackbar_desc"></p>
            </v-col>
        </v-row>
        <template v-slot:actions>
            <v-btn variant="text" @click="snackbar = false">
                Close
            </v-btn>
        </template>
    </v-snackbar>
    <v-footer app class="d-flex flex-column" height="60" permanent fixed>
        <div class="d-flex w-100 align-center">
            
            <v-form
                    @submit.prevent="onSubmit('')"
                    class="d-flex w-100 align-center"
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
                    ></v-text-field>

                    <v-spacer v-if="!smAndDown"></v-spacer>
                    
                    <div class="d-flex justify-right">
                        <v-btn v-if="!is_electron()" @click="toggleListen" class="mr-4" :color="(listening) ? 'success' : 'error'" size="small"  icon variant="outlined">
                            <v-icon v-if="!listening">mdi-microphone-off</v-icon>
                            <v-icon v-else>mdi-microphone</v-icon>
                        </v-btn>
                        <v-badge :model-value="!!connections" :content="connections ? connections : undefined" color="success" class="mr-4">
                            <v-btn @click="toggleBroadcast" :loading="loadingWebsocket" :disabled="loadingWebsocket"  :color="(broadcasting) ? 'success' : 'error'" size="small" icon variant="outlined">
                                <v-icon v-if="!broadcasting">mdi-broadcast-off</v-icon>
                                <v-icon v-else>mdi-broadcast</v-icon>
                            </v-btn>
                        </v-badge>
                        <v-divider class="mr-4" vertical></v-divider>
                        <v-btn v-if="$route.name === 'home'" @click="$router.push({ path: last_setting })" color="transparent"  size="small" icon flat>
                            <v-icon>mdi-cog</v-icon>
                        </v-btn>
                        <v-btn v-else @click="$router.push({ path: '/' })" color="transparent"  size="small" icon flat>
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
import WelcomeOverlay from "../components/overlays/WelcomeOverlay.vue"

import is_electron from "../helpers/is_electron"
import webhook from '../helpers/webhook'

import { useDisplay } from 'vuetify'
import { useWordReplaceStore } from  '../stores/word_replace'
import { useSettingsStore } from  '../stores/settings'
import { useSpeechStore } from  '../stores/speech'
import { useAppearanceStore } from '../stores/appearance'
import { useLogStore } from '../stores/logs'
import { useOSCStore } from '../stores/osc'
import { useConnectionStore } from "../stores/connections"

declare const window: any

import { WebSpeech } from '../modules/speech'

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

            last_route: null as any,

            ws: null as any,

            listening: false,
            listening_error: false,
            talking: false,
            wait_interval: undefined as undefined | ReturnType<typeof setTimeout>,

            connections: 0,

            loadingWebsocket: false,
            broadcasting: false,

            input_text: '',
            typing_limited: false,

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
    watch: {
        input_text(new_val) {
            if (this.oscStore.text_typing && this.broadcasting)
                this.typing_event(true)
        },
        'speechStore.stt.language'(new_val) {
            if (this.speech.recognition) {
                this.speech.stop()
                this.speech.recognition.lang = new_val
            }
        }
    },
    methods: {
        toggleListen () {
            // recognition not supported
            if (!this.speech.recognition) {
                // this.listening = false
                this.listening_error = true
                this.show_snackbar('error', this.$t('alerts.no_speech'))
                return
            }

            this.listening = !this.listening
            if (this.listening) {
                this.speech.start()
                this.speech.onresult = (transcript: string, isFinal: boolean) => {
                    this.onSubmit(transcript, isFinal)
                }
                this.speech.onend = () => {
                    // restart if auto stopped
                    if (this.listening) this.speech.start()
                }
                this.speech.onerror = (event: any) => {
                    let desc = ''
                    if (event.error === 'no-speech') return // web-speech: no sound detected
                    if (event.error === 'not-allowed') desc = this.$t('alerts.mic_error')
                    if (event.error === 'aborted') desc = this.$t('alerts.device_in_use')
                    this.listening = false
                    this.listening_error = true
                    this.show_snackbar('error', desc)
                    this.listening = false
                    this.speech.stop()
                }
            } else {
                this.speech.stop()
            }
        },
        replace_words(input: string) {
            if (!this.wordReplaceStore.enabled || !Object.keys(this.wordReplaceStore.word_replacements).length) return input
            const replace_re = new RegExp(Object.keys(this.wordReplaceStore.word_replacements).join("|"),"gi")
            return input.replace(replace_re, (matched) => {
                return this.wordReplaceStore.word_replacements[matched.toLowerCase()]
            })
        },
        typing_event(event: boolean) {
            if (is_electron() && !this.typing_limited) {
                this.typing_limited = true
                window.ipcRenderer.send("typing-text-event", event)
                setTimeout(() => this.typing_limited = false, 6 * 1000)
            }
            
            
        },
        paramTrigger(input: string) {
            // console.log(window.process.type)
            if (this.broadcasting && is_electron()) {
                // if custom params
                // potential addition:
                // use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/search
                // to see which assign is the closest to the keyword found
                // unless switch to nlp first.....
                if (this.oscStore.osc_params.length) {
                    this.oscStore.osc_params.forEach(custom_param => {
                        let matchesKey = null

                        custom_param.keywords.forEach(keyword => {
                            const key_check = `(^|\\s)(${keyword.text})($|[^a-zA-Z\\d])`
                            const reKey = new RegExp(key_check, "ig")
                            matchesKey = reKey.exec(input)
                        })

                        if (matchesKey) {
                            custom_param.assigns.forEach(assign => {
                                const assign_check = `(^|\\s)(${assign.keyword})($|[^a-zA-Z\\d])`
                                const reAssign = new RegExp(assign_check, "ig")
                                const matchesAssign = reAssign.exec(input)
                                if (matchesAssign) {
                                    this.show_snackbar('secondary', `<code>${custom_param.route} = ${assign.set}</code>`)
                                    window.ipcRenderer.send("send-param-event", { ip: custom_param.ip, port: custom_param.port, route: custom_param.route, value: assign.set})
                                }
                            })
                        }
                    })
                }
            }
        },
        tts(input: string) {
            this.speech.speak(input)
        },
        onSubmit (input_override: string, isFinal: boolean = true) {
            let input = (input_override) ? input_override : this.input_text

            if (this.wait_interval) clearTimeout(this.wait_interval)
            if (this.appearanceStore.text.new_line_delay >= 0)
                this.wait_interval = setTimeout(() => {
                    this.logs[this.logs.length - 1].pause = true
                }, this.appearanceStore.text.new_line_delay * 1000)

            // word replace
            input = this.replace_words(input)

            // check for param triggers
            this.paramTrigger(input)
            
            // scroll to bottom
            const loglist = document.getElementById("loglist")
            if (loglist) loglist.scrollTop = loglist.scrollHeight

            const toSend = {
                transcript: input, 
                isFinal: isFinal, 
                hide: 0 // 1 = fade, 2 = hide
            }

            // broadcast typing event
            if (is_electron() && this.oscStore.stt_typing && this.broadcasting) {
                this.typing_event(true)
            }

            // overwrite last log
            let i = this.logs.length - 1 // track current index
            if (i >= 0 && !this.logs[i].isFinal) {
                this.logs[i] = toSend
            // push to log
            } else {
                this.logs.push(toSend)
                i++;
            }

            // finalized text
            if (isFinal) {
                // timestamp
                this.logs[i].time = new Date()
                // text-to-speech
                if (this.speechStore.tts.enabled && this.speechStore.tts.voice) this.tts(input)

                // fadeout text
                if (this.appearanceStore.text.enable_fade)
                    setTimeout(() => {
                        if(!this.logs[i].pause) return

                        let pauses = 0
                        // fade out all text since last pause
                        while (i >= 0 && pauses < 2) {
                            this.logs[i].hide = 1
                            setTimeout((i) => this.logs[i].hide = 2, this.appearanceStore.text.fade_time * 1000, i)
                            if (this.logs[i].pause) pauses += 1
                            i -= 1
                        }
                    }, this.appearanceStore.text.hide_after * 1000)
                
                // webhook
                if (this.connectionStore.wh.enabled) {
                    webhook.post(this.connectionStore.wh.url, { transcript: input })
                }
            }

            // send text via osc
            if (is_electron() && isFinal && this.oscStore.osc_text && this.broadcasting) {
                window.ipcRenderer.send("send-text-event", `{ "transcript": "${input}", "hide_ui": ${!this.oscStore.show_keyboard} }`)
            } else if (this.ws) {
                this.ws.send(`{"type": "text", "data": ${JSON.stringify(toSend)}}`)
            }

            // clear chatbox
            this.input_text = ''
        },
        toggleBroadcast () {
            if (this.broadcasting) {
                this.broadcasting = false
                this.connections = 0
                if (this.ws) {
                    this.ws.send('{"type": "command", "data": "stop"}')
                    this.ws.close()
                    this.ws = null
                }
                return
            }

            this.broadcasting = true

            if (!is_electron() && this.connectionStore.ws.enabled) {
                this.loadingWebsocket = true
                try {
                    this.ws = new WebSocket(`ws://${this.connectionStore.ws.url}`)
                } catch {
                    this.broadcasting = false
                    this.loadingWebsocket = false
                    this.ws = null
                    this.show_snackbar('error', this.$t('alerts.websocket_error'))
                    return
                }
                this.ws.onopen = () => {
                    this.broadcasting = true
                    this.loadingWebsocket = false
                    this.connections += 1
                }
                this.ws.onmessage = (event: any) => {
                    const msg = JSON.parse(event.data)
                    if (msg.event === 'connect' && msg.version !== __APP_VERSION__) {
                        this.show_snackbar('error', this.$t('alerts.version_mismatch'))
                    }
                }
                this.ws.onclose = () => {
                    console.log('websocket closed')
                    if (this.connections === 0)
                        this.broadcasting = false
                    this.loadingWebsocket = false
                    this.ws = null
                }
                this.ws.onerror = () => {
                    this.show_snackbar('error', this.$t('alerts.broadcast_error'))
                }
            }

            if (this.connectionStore.wh.enabled) 
                this.connections += 1

        },
        show_snackbar(type: string, desc: string) {
            this.snackbar_desc = desc
            this.snackbar_color = type
            this.snackbar = true
        },
        onResize () {
            this.windowSize = { x: window.innerWidth, y: window.innerHeight }
        },
        reloadEvents() {
            if (is_electron()) {
                window.ipcRenderer.removeListener('websocket-connect')
                window.ipcRenderer.removeListener('receive-text-event')
                window.ipcRenderer.receive('websocket-connect', (event: any, data: any) => {
                    this.broadcasting = event
                })
                window.ipcRenderer.receive('receive-text-event', (event: any, data: any) => {
                    event = JSON.parse(event)
                    this.onSubmit(event.transcript, event.isFinal)
                })
            }
        }
    },
    computed: {
        last_setting () {
            return (this.last_route && this.last_route.startsWith('/settings')) ? this.last_route : '/settings/general'
        }
    },
    unmounted () {
        if (this.listening) this.toggleListen()
        if (this.broadcasting) this.toggleBroadcast()
        if (is_electron()) {
            window.ipcRenderer.removeListener('websocket-connect')
            window.ipcRenderer.removeListener('receive-text-event')
        }
    },
    updated() {
        this.reloadEvents()
        this.last_route = this.$router.options.history.state.back
    },
    mounted () {
        this.onResize()

        this.overlay_main = this.settingsStore.welcome

        this.reloadEvents()
    },
    setup() {
        const { smAndDown } = useDisplay()
        const wordReplaceStore = useWordReplaceStore()
        const settingsStore = useSettingsStore()
        const speechStore = useSpeechStore()
        const appearanceStore = useAppearanceStore()
        const logStore = useLogStore()
        const oscStore = useOSCStore()
        const connectionStore = useConnectionStore()

        let speech = new WebSpeech(speechStore.stt.language)

        // if (recognition)
        //     recognition.lang = speechStore.stt.language

        const font_size = `${appearanceStore.text.font_size}px`
        const fade_time = `${appearanceStore.text.fade_time}s`
        const text_color = appearanceStore.text.color
        const interim_color = appearanceStore.text.interim_color

        return {
            wordReplaceStore,
            settingsStore,
            speechStore,
            appearanceStore,
            logs: logStore.logs,
            oscStore,
            connectionStore,

            speech,

            font_size,
            fade_time,
            text_color,
            interim_color,
            smAndDown,
            is_electron
        }
    }
}
</script>