<template>
    <v-snackbar
        v-model="snackbar"
        :color="snackbar_color"
        location="top"
        :timeout="8000"
    >
        <v-row class="align-center justify-center">
            <v-col :cols="2" class="d-none d-md-flex">
                <v-icon :cols="2">{{ snackbar_icon }}</v-icon>
            </v-col>
            <v-col :cols="12" :md="10">
                <p v-html="snackbar_desc"></p>
            </v-col>
        </v-row>
        <template v-slot:actions>
            <v-btn variant="text" @click="snackbar = false">
                Close
            </v-btn>
        </template>
    </v-snackbar>
    <v-footer app class="d-flex flex-column" height="55" permanent fixed>
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
                            single-line
                            hide-details
                            flat
                        ></v-text-field>

                    <v-spacer></v-spacer>
                    
                    <v-btn v-if="!is_electron()" @click="toggleListen" class="mr-4" :color="(listening) ? 'success' : 'error'" size="small"  icon variant="outlined">
                        <v-icon v-if="!listening">mdi-microphone-off</v-icon>
                        <v-icon v-else>mdi-microphone</v-icon>
                    </v-btn>
                    <v-btn @click="toggleBroadcast" :loading="loadingWebsocket" :disabled="loadingWebsocket" class="mr-4" :color="(broadcasting) ? 'success' : 'error'" size="small" icon variant="outlined">
                        <v-icon v-if="!broadcasting">mdi-broadcast-off</v-icon>
                        <v-icon v-else>mdi-broadcast</v-icon>
                    </v-btn>
                    <v-divider class="mr-4" vertical></v-divider>
                    <v-btn v-if="$route.name === 'home'" @click="$router.push({ path: last_setting })" color="transparent"  size="small" icon flat>
                        <v-icon>mdi-cog</v-icon>
                    </v-btn>
                    <v-btn v-else @click="$router.push({ path: '/' })" color="transparent"  size="small" icon flat>
                        <v-icon>mdi-home</v-icon>
                    </v-btn>
                </div>
            </v-form>
        </div>
    </v-footer>
</template>

<script lang="ts">
// import {ipcRenderer} from "electron"
import WelcomeOverlay from "../components/overlays/WelcomeOverlay.vue"

import is_electron from "../helpers/is_electron"

import { useWordReplaceStore } from  '../stores/word_replace'
import { useSettingsStore } from  '../stores/settings'
import { useSpeechStore } from  '../stores/speech'
import { useAppearanceStore } from '../stores/appearance'
import { useLogStore } from '../stores/logs'
import { useOSCStore } from '../stores/osc'

declare const window: any

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent

const synth = window.speechSynthesis

const recognition = (SpeechRecognition) ? new SpeechRecognition() : null;
// const speechRecognitionList = new SpeechGrammarList()

// recognition.grammars = speechRecognitionList
if (recognition) {
    recognition.continuous = true
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.maxAlternatives = 1
}

interface Log {
    text: string,
    isFinal: boolean,
    hide: number
}

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

            loadingWebsocket: false,
            broadcasting: false,

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
    watch: {
        input_text(new_val) {
            if (is_electron() && new_val.length === 1 && this.oscStore.text_typing && this.broadcasting)
                window.ipcRenderer.send("typing-text-event", !!new_val)
        },
        'speechStore.stt.language'(new_val) {
            if (recognition)
                recognition.lang = new_val
        }
    },
    methods: {
        toggleListen () {
            this.listening = !this.listening
            if (this.listening) {
                // recognition not supported
                if (!recognition) {
                    this.listening = false
                    this.listening_error = true
                    this.snackbar_desc = this.$t('alerts.no_speech')
                    this.snackbar_icon = 'mdi-alert-circle-outline'
                    this.snackbar_color = 'error'
                    this.snackbar = true
                    return
                }

                // start recognition
                recognition.start()

                // on result
                recognition.onresult = (event: any) => {
                    const results = event.results[event.results.length - 1]

                    // result is final
                    if (results.isFinal) {
                        this.onSubmit(results[0].transcript, results.isFinal)
                        this.talking = false
                        recognition.stop()
                    // user started talking
                    } else if (!results.isFinal && !this.talking) {
                        // console.log('Speech has been detected')
                        this.talking = true
                    }

                    // continually track changes
                    if (!results.isFinal && this.talking) {
                        let transcript = ''
                        Object.keys(event.results).forEach((key: string) => {
                            transcript += event.results[key][0].transcript
                        })
                        this.onSubmit(transcript, results.isFinal)
                    }
                }
                recognition.onend = () => {
                    // console.log('speech recognition stopped')

                    // restart if auto stopped
                    if (this.listening)
                        recognition.start()
                }
                recognition.onerror = (event: any) => {
                    if (event.error === 'no-speech') return
                    this.listening = false
                    this.listening_error = true
                    this.snackbar_desc = this.$t('alerts.mic_error')
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
        paramTrigger(input: string) {
            // console.log(window.process.type)
            if (this.broadcasting) {

                // if custom params
                // potential addition:
                // use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/search
                // to see which assign is the closest to the keyword found
                // unless switch to nlp first.....
                if (is_electron()) {
                    if (this.oscStore.osc_params.length) {
                        this.oscStore.osc_params.forEach(custom_param => {
                            let matchesKey = null

                            custom_param.keywords.forEach(keyword => {
                                const key_check = `(^|\\s)(${keyword.text})($|[^a-zA-Z\\d])`
                                const reKey = new RegExp(key_check, "ig")
                                matchesKey = reKey.exec(input)
                                // console.log(matchesKey)
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

                                        // let value = assign.set

                                        this.snackbar_desc = `<code>${custom_param.route} = ${assign.set}</code>`
                                        this.snackbar_color = "secondary"
                                        this.snackbar_icon = "mdi-send"
                                        this.snackbar = true
                                        window.ipcRenderer.send("send-param-event", { ip: custom_param.ip, port: custom_param.port, route: custom_param.route, value: assign.set})
                                    }
                                })
                            }
                        })
                    }
                }
            }
        },
        tts(input: string) {
            const utterance = new SpeechSynthesisUtterance(input)
            utterance.voice = synth.getVoices().filter((voice: any) => voice.name === this.speechStore.tts.voice)[0]
            utterance.pitch = this.speechStore.tts.pitch
            utterance.rate = this.speechStore.tts.rate
            synth.speak(utterance)
        },
        onSubmit (input_override: string, isFinal: boolean = true) {
            let input = (input_override) ? input_override : this.input_text

            // word replace
            input = this.replace_words(input)

            // check for param triggers
            this.paramTrigger(input)
            
            // scroll to bottom
            const loglist = document.getElementById("loglist")
            if (loglist) loglist.scrollTop = loglist.scrollHeight

            const toSend = {
                text: input, 
                isFinal: isFinal, 
                hide: 0 // 1 = fade, 2 = hide
            }

            // overwrite last log
            let i = this.logs.length - 1 // track current index
            if (i >= 0 && !this.logs[i].isFinal) {
                this.logs[i] = toSend
            // push to log
            } else {
                this.logs.push(toSend)
                i++;
                if (is_electron() && this.oscStore.stt_typing && this.broadcasting) {
                    window.ipcRenderer.send("typing-text-event", true)
                }
            }

            // finalized text
            if (isFinal) {
                // text-to-speech
                if (this.speechStore.tts.enabled && this.speechStore.tts.voice) this.tts(input)

                // fadeout text
                if (this.appearanceStore.text.enable_fade)
                    setTimeout(() => {
                        this.logs[i].hide = 1
                        setTimeout(() => this.logs[i].hide = 2, this.appearanceStore.text.fade_time * 1000)
                    }, this.appearanceStore.text.hide_after * 1000)
            }

            // send text via osc
            if (is_electron() && isFinal && this.oscStore.osc_text && this.broadcasting) {
                window.ipcRenderer.send("send-text-event", input)
                // window.ipcRenderer.send("typing-text-event", false)
            } else if (this.ws) {
                this.ws.send(`{"type": "text", "data": ${JSON.stringify(toSend)}}`)
            }

            // clear chatbox
            this.input_text = ''
        },
        toggleBroadcast () {
            if (this.broadcasting) {
                this.broadcasting = false
                if (this.ws) {
                    this.ws.send('{"type": "command", "data": "stop"}')
                    this.ws.close()
                    this.ws = null
                }
                return
            }

            if (!is_electron()) {
                this.loadingWebsocket = true
                this.ws = new WebSocket('ws://localhost:8999/')
                this.ws.onopen = () => {
                    console.log('websocket connected')
                    this.broadcasting = true
                    this.loadingWebsocket = false
                }
                this.ws.onmessage = (event: any) => {
                    const msg = JSON.parse(event.data)
                    if (msg.event === 'connect' && msg.version !== __APP_VERSION__) {
                        this.snackbar_desc = this.$t('alerts.version_mismatch')
                        this.snackbar_icon = "mdi-alert-circle-outline"
                        this.snackbar_color = "warning"
                        this.snackbar = true
                    }
                }
                this.ws.onclose = () => {
                    console.log('websocket closed')
                    this.broadcasting = false
                    this.loadingWebsocket = false
                    this.ws = null
                }
                this.ws.onerror = () => {
                    console.log('websocket error')
                    this.broadcasting = false
                    this.loadingWebsocket = false
                    this.ws = null
                    this.snackbar_desc = this.$t('alerts.broadcast_error')
                    this.snackbar_color = "error"
                    this.snackbar_icon = "mdi-alert-circle-outline"
                    this.snackbar = true
                }
            } else {
                this.broadcasting = true
            }

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
                    this.onSubmit(event.text, event.isFinal)
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
        const wordReplaceStore = useWordReplaceStore()
        const settingsStore = useSettingsStore()
        const speechStore = useSpeechStore()
        const appearanceStore = useAppearanceStore()
        const logStore = useLogStore()
        const oscStore = useOSCStore()

        if (recognition)
            recognition.lang = speechStore.stt.language

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
            font_size,
            fade_time,
            text_color,
            interim_color,
            is_electron
        }
    }
}
</script>