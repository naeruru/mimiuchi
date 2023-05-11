<template>
    <v-snackbar
        v-model="snackbar"
        :color="snackbar_color"
        location="top"
        max-height="60"
    >
        <v-row class="align-center justify-center">
            <v-col :cols="2">
                <v-icon :cols="2">{{ snackbar_icon }}</v-icon>
            </v-col>
            <v-col :cols="10">
                <p v-html="snackbar_desc"></p>
            </v-col>
        </v-row>
        <template v-slot:actions>
            <v-btn variant="text" @click="snackbar = false">
                Close
            </v-btn>
        </template>
    </v-snackbar>
    <v-footer app class="d-flex flex-column" height="55" absolute permanent>
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

import { useWordReplaceStore } from  '../stores/word_replace'
import { useSettingsStore } from  '../stores/settings'
import { useAppearanceStore } from '../stores/appearance'
import { useLogStore } from '../stores/logs'

declare const window: any

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent

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
    watch: {
        input_text(new_val) {
            if (this.isElectron() && new_val.length === 1)
                window.ipcRenderer.send("typing-text-event", !!new_val)
        },
        'settingsStore.stt_Settings.language'(new_val) {
            if (recognition)
                recognition.lang = new_val
        }
    },
    methods: {
        toggleListen () {
            this.listening = !this.listening
            if (this.listening) {
                if (!recognition) {
                    this.listening = false
                    this.listening_error = true
                    this.snackbar_desc = 'Your browswer does not support Web Speech API.'
                    this.snackbar_icon = 'mdi-alert-circle-outline'
                    this.snackbar_color = 'error'
                    this.snackbar = true
                    return
                }
                recognition.start()

                // recognition.onspeechstart = () => {
                //     console.log('Speech has been detected')
                //     this.ws.send(`{"type": "command", "data": "speechstart"}`)
                // }
                // recognition.onspeechend = () => {
                //     console.log('Speech has ended')
                //     this.ws.send(`{"type": "command", "data": "speechend"}`)
                // }
                recognition.onresult = (event: any) => {
                    const results = event.results[event.results.length - 1]
                    // if (event.results[event.results.length - 1][0].confidence >= 0.0)
                    // result is final
                    if (results.isFinal) {
                        console.log(results)
                        this.onSubmit(results[0].transcript, results.isFinal)
                        this.talking = false
                        // if (this.ws && this.settingsStore.osc_settings.stt_typing)
                        //     this.ws.send(`{"type": "command", "data": "speechend"}`)
                    // user started talking
                    } else if (!results.isFinal && !this.talking) {
                        console.log('Speech has been detected')
                        this.talking = true
                        // if (this.ws && this.settingsStore.osc_settings.stt_typing)
                        //     this.ws.send(`{"type": "command", "data": "speechstart"}`)
                    }

                    // continually track changes
                    if (!results.isFinal && this.talking) {
                        this.onSubmit(results[0].transcript, results.isFinal)
                    }
                        // this.ws.send(`{"type": "command", "data": "speechend"}`)
                        // recognition.stop()
                }
                recognition.onend = () => {
                    console.log('speech recognition stopped')

                    // restart if auto stopped
                    if (this.listening)
                        recognition.start()
                }
                recognition.onerror = (event: any) => {
                    if (event.error === 'no-speech') return
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
        paramTrigger(input: string) {
            // console.log(window.process.type)
            if (this.broadcasting) {

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
                if (input.startsWith(this.logs[i].text.slice(0, 5)) || isFinal) {
                    this.logs[i] = toSend
                }
            // push to log
            } else {
                this.logs.push(toSend)
                i++;
                if (this.isElectron() && this.settingsStore.osc_settings.stt_typing) {
                    window.ipcRenderer.send("typing-text-event", true)
                }
            }

            // fadeout text
            if (isFinal && this.appearanceStore.text.enable_fade) 
                setTimeout(() => {
                    this.logs[i].hide = 1
                    setTimeout(() => this.logs[i].hide = 2, this.appearanceStore.text.fade_time * 1000)
                }, this.appearanceStore.text.hide_after * 1000)

            // send text via osc
            if (this.isElectron() && isFinal && this.settingsStore.osc_settings.osc_text) {
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

            if (!this.isElectron()) {
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
                this.ws.onerror = () => {
                    console.log('websocket error')
                    this.broadcasting = false
                    this.loadingWebsocket = false
                    this.ws = null
                    this.snackbar_desc = `Error enabling broadcast. Make sure the desktop app is running.`
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
        },
        reloadEvents() {
            if (this.isElectron()) {
                window.ipcRenderer.removeListener('websocket-connect')
                window.ipcRenderer.removeListener('receive-text-event')
                window.ipcRenderer.receive('websocket-connect', (event: any, data: any) => {
                    console.log('meow')
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
        if (this.isElectron()) {
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
        const appearanceStore = useAppearanceStore()
        const logStore = useLogStore()

        if (recognition)
            recognition.lang = settingsStore.stt_Settings.language


        const font_size = `${appearanceStore.text.font_size}px`
        const fade_time = `${appearanceStore.text.fade_time}s`
        const text_color = appearanceStore.text.color
        const interim_color = appearanceStore.text.interim_color

        return {
            wordReplaceStore,
            settingsStore,
            appearanceStore,
            logs: logStore.logs,
            font_size,
            fade_time,
            text_color,
            interim_color
        }
    }
}
</script>