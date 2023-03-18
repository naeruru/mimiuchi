
<template>
    <div>
        <v-snackbar
            v-model="snackbar"
            :color="snackbar_color"
            location="top"
            max-height="20px"
        >
            <v-row class="align-center justify-center ma-1">
                <v-icon class="mr-2">{{ snackbar_icon }}</v-icon>
                <p v-html="snackbar_desc"></p>
            </v-row>
            <template v-slot:actions>
                <v-btn variant="text" @click="snackbar = false">
                    Close
                </v-btn>
            </template>
        </v-snackbar>

        <v-card
            v-resize="onResize"
            class="d-flex align-end pa-4"
            color="black"
            flat
            :height="windowSize.y - 55"
            tile
        >
            <div class="d-flex flex-column">
                <code v-for="log in logs" class="text-h2 mt-6">{{ log.text }}</code>
            </div>


            <WelcomeOverlay :overlay="overlay_main" :page="overlay_page"></WelcomeOverlay>
        </v-card>

        <v-footer app class="d-flex flex-column" height="55">
            <div class="d-flex w-100 align-center">
                
                <v-form
                        @submit.prevent="onSubmit(null)"
                        class="d-flex w-100 align-center"
                >
                    <div class="d-flex w-100 align-center">
                        
                            <v-text-field
                                v-model="input_text"
                                density="compact"
                                variant="outlined"
                                label="Type a message"
                                append-inner-icon="mdi-chevron-right"
                                single-line
                                hide-details
                                flat
                            ></v-text-field>

                        <v-spacer></v-spacer>

                        <v-btn v-if="!isElectron()" @click="toggleListen" class="mr-4" :color="(listening) ? 'success' : 'error'" size="small"  icon variant="outlined">
                            <v-icon v-if="!listening">mdi-microphone-off</v-icon>
                            <v-icon v-else>mdi-microphone</v-icon>
                        </v-btn>
                        <v-btn @click="toggleBroadcast" :loading="loadingWebsocket" :disabled="loadingWebsocket" class="mr-4" :color="(broadcasting) ? 'success' : 'error'" size="small" icon variant="outlined">
                            <v-icon v-if="!broadcasting">mdi-broadcast-off</v-icon>
                            <v-icon v-else>mdi-broadcast</v-icon>
                        </v-btn>
                        <v-divider class="mr-4" vertical></v-divider>
                        <v-btn @click="$router.push({ path: '/settings/general' })" color="transparent"  size="small" icon flat>
                            <v-icon>mdi-cog</v-icon>
                        </v-btn>
                    </div>

                </v-form>

            </div>
        </v-footer>
    </div>
</template>

<script lang="ts">
// import {ipcRenderer} from "electron"
import WelcomeOverlay from "../components/overlays/WelcomeOverlay.vue"

import { useWordReplaceStore } from  '../stores/word_replace'
import { useSettingsStore } from  '../stores/settings'

const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition
const SpeechGrammarList = window.SpeechGrammarList || webkitSpeechGrammarList
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent

const recognition = new SpeechRecognition();
// const speechRecognitionList = new SpeechGrammarList()

// recognition.grammars = speechRecognitionList
recognition.continuous = true
recognition.lang = 'en-US'
recognition.interimResults = false
recognition.maxAlternatives = 1

export default {
    name: 'Home',
    components: {
        WelcomeOverlay
    },
    data() {
            return {
            // oscClient: client,
            overlay_main: this.settingsStore.welcome,
            overlay_page: 0,

            ws: null,

            listening: false,
            listening_error: false,

            loadingWebsocket: false,
            broadcasting: false,

            logs: [], // { text: '' }

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
            },
        }
    },
    watch: {
        input_text(prev_val, new_val) {
            if (this.isElectron() && new_val.length === 1)
                window.ipcRenderer.send("typing-text-event", !!new_val)
        }
    },
    methods: {
        toggleListen () {
            this.listening = !this.listening
            if (this.listening) {
                recognition.start()

                // too sensitive, needs testing
                // recognition.onspeechstart = () => {
                //     console.log('Speech has been detected')
                //     this.ws.send(`{"type": "command", "data": "speechstart"}`)
                // }
                // recognition.onspeechend = () => {
                //     console.log('Speech has ended')
                //     this.ws.send(`{"type": "command", "data": "speechend"}`)
                // }
                recognition.onresult = (event: any) => {
                    console.log(event.results[event.results.length - 1])
                    console.log(event.results[event.results.length - 1][0].confidence)
                    if (event.results[event.results.length - 1][0].confidence > 0.3)
                        this.onSubmit(event.results[event.results.length - 1][0].transcript)
                        // this.ws.send(`{"type": "command", "data": "speechend"}`)
                        // recognition.stop()
                }
                recognition.onend = () => {
                    console.log('speech recognition stopped')

                    // restart if auto stopped
                    if (this.listening)
                        recognition.start()
                }
                recognition.onerror = () => {
                    this.listening = false
                    this.listening_error = true
                    this.snackbar_desc = "Error enabling microphone. You must give permission to use it."
                    this.snackbar_icon = "mdi-alert-circle-outline"
                    this.snackbar_color = "error"
                    this.snackbar = true
                }
            } else {
                recognition.stop()
            }
        },
        replace_words(input: string) {
            if (!this.wordReplaceStore.enabled || !Object.keys(this.wordReplaceStore.word_replacements).length) return input
            const replace_re = new RegExp(Object.keys(this.wordReplaceStore.word_replacements).join("|"),"gi")
            return input.replace(replace_re, (matched) => {
                return this.wordReplaceStore.word_replacements[matched.toLowerCase()]
            })
        },
        onSubmit (input_override) {
            let input = (input_override) ? input_override : this.input_text

            // word replace
            input = this.replace_words(input)

            // console.log(window.process.type)
            if (this.broadcasting) {
                // send text via osc
                if (this.isElectron()) {
                    if (this.settingsStore.osc_settings.osc_text)
                        window.ipcRenderer.send("send-text-event", input)
                } else {
                    this.ws.send(`{"type": "text", "data": "${input}"}`)
                }

                // if custom params
                // potential addition:
                // use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/search
                // to see which assign is the closest to the keyword found
                // unless switch to nlp first.....
                if (this.isElectron()) {
                    if (this.settingsStore.osc_params.length) {
                        this.settingsStore.osc_params.forEach(custom_param => {
                            let matchesKey = null

                            custom_param.keywords.forEach(keyword => {
                                const key_check = `(^|\\s)(${keyword.text})($|[^a-zA-Z\\d])`
                                const reKey = new RegExp(key_check, "ig")
                                matchesKey = reKey.exec(input)
                                console.log(matchesKey)
                            })

                            if (matchesKey) {
                                // console.log(`matched keyword!`)
                                custom_param.assigns.forEach(assign => {
                                    const assign_check = `(^|\\s)(${assign.keyword})($|[^a-zA-Z\\d])`
                                    const reAssign = new RegExp(assign_check, "ig")
                                    console.log(reAssign)
                                    const matchesAssign = reAssign.exec(input)
                                    if (matchesAssign) {
                                        // console.log(`matched keyword and assign!`)

                                        let value = assign.set

                                        if (value === 'false') value = false // todo: fix

                                        this.snackbar_desc = `<code>${custom_param.route} = ${value}</code>`
                                        this.snackbar_color = "secondary"
                                        this.snackbar_icon = "mdi-send"
                                        this.snackbar = true
                                        window.ipcRenderer.send("send-param-event", { ip: custom_param.ip, port: custom_param.port, route: custom_param.route, value: value})
                                    }
                                })
                            }
                        })
                    }
                }
            }
            
            this.logs.push({text: input})
            this.input_text = ''
        },
        toggleBroadcast () {
            if (this.broadcasting) {
                this.broadcasting = false
                this.ws.send('{"type": "command", "data": "stop"}')
                this.ws.close()
                this.ws = null
                return
            }

            this.loadingWebsocket = true
            this.ws = new WebSocket('ws://localhost:8999/')
            this.ws.onopen = () => {
                console.log('websocket connected')
                this.broadcasting = true
                this.loadingWebsocket = false
            }

            this.ws.onclose = () => {
                console.log('websocket closed')
                this.broadcasting = false
                this.loadingWebsocket = false
                this.ws = null
            }

        },
        onResize () {
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
    unmounted () {
        if (this.listening) this.toggleListen()
        if (this.broadcasting) this.toggleBroadcast()
    },
    mounted () {
        this.onResize()

        if (this.isElectron()) {
            window.ipcRenderer.receive('websocket-connect', (event, data) => {
                this.broadcasting = event
            })
            window.ipcRenderer.receive('receive-text-event', (event, data) => {
                this.onSubmit(event)
            })
        }
    },
    setup() {
        const wordReplaceStore = useWordReplaceStore()
        const settingsStore = useSettingsStore()

        return {
            wordReplaceStore,
            settingsStore
        }
    }
}
</script>

<style>
  html { overflow-y: auto }
</style>