
<template>
    <div>
        <v-card
            v-resize="onResize"
            class="d-flex align-end pa-4"
            color="black"
            flat
            :height="windowSize.y - 100"
            tile
        >
            <div class="d-flex flex-column">
                <code v-for="log in logs" class="text-h2 mt-6">{{ log.text }}</code>
            </div>
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

                        <v-btn @click="toggleRandomMsg" class="mr-2" :color="(jokeTimer !== null) ? 'success' : '#095C51'" variant="flat">
                            <v-icon v-if="!jokeTimer">mdi-cat</v-icon>
                            <v-progress-circular v-else class="mr-1" :size="14" :width="1" indeterminate></v-progress-circular>
                            Jokes
                        </v-btn>
                        <v-btn @click="toggleListen" class="mr-2" :color="(listening) ? 'success' : '#095C51'" variant="flat">
                            <v-icon v-if="!listening">mdi-microphone</v-icon>
                            <v-progress-circular v-else class="mr-1" :size="14" :width="1" indeterminate></v-progress-circular>
                            Listen
                        </v-btn>
                        <v-btn @click="toggleBroadcast" :loading="loadingWebsocket" :disabled="loadingWebsocket" :color="(broadcasting) ? 'success' : '#095C51'" variant="flat" width="150">
                            <v-icon v-if="!broadcasting">mdi-broadcast</v-icon>
                            <v-progress-circular v-else class="mr-1" :size="14" :width="1" indeterminate></v-progress-circular>
                            Broadcast
                        </v-btn>
                    </div>

                </v-form>

            </div>
        </v-footer>
    </div>
</template>

<script lang="ts">
// import {ipcRenderer} from "electron"
import jokes from './jokes.json'

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
    data: () => ({
        // oscClient: client,

        ws: null,

        listening: false,

        loadingWebsocket: false,
        broadcasting: false,

        logs: [], // { text: '' }

        input_text: '',

        windowSize: {
            x: 0,
            y: 0,
        },

        jokeTimer: null,
    }),
    watch: {
        input_text(prev_val, new_val) {
            if (this.isElectron())
                window.ipcRenderer.send("typing-text-event", !!new_val)
        }
    },
    methods: {
        toggleRandomMsg() {
            if (this.jokeTimer !== null) {
                clearInterval(this.jokeTimer)
                this.jokeTimer = null
            } else {
                this.jokeTimer = setInterval(() => this.sendRandomMsg(), 1000 * jokes.timer)
            }
        },
        sendRandomMsg() {
            const rand_joke = jokes.jokes[Math.floor(Math.random() * jokes.jokes.length)]
            this.input_text = rand_joke
            this.onSubmit(null)
        },
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
                recognition.onresult = (event) => {
                    console.log(event.results[event.results.length - 1])
                    console.log(event.results[event.results.length - 1][0].confidence)
                    if (event.results[event.results.length - 1][0].confidence > 0.3)
                        this.onSubmit(event.results[event.results.length - 1][0].transcript)
                        // this.ws.send(`{"type": "command", "data": "speechend"}`)
                        // recognition.stop()
                }
                recognition.onend = (event) => {
                    console.log('speech recognition stopped')

                    // restart if auto stopped
                    if (this.listening)
                        recognition.start()
                }
            } else {
                recognition.stop()
            }
        },
        onSubmit (input_override) {
            const input = (input_override) ? input_override : this.input_text

            // console.log(window.process.type)
            if (this.broadcasting) {
                if (this.isElectron()) {
                    window.ipcRenderer.send("send-text-event", input)
                } else {
                    this.ws.send(`{"type": "text", "data": "${input}"}`)
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
    mounted () {
        this.onResize()

        if (this.isElectron()) {
            window.ipcRenderer.receive('websocket-connect', (event, data) => {
                this.broadcasting = event
            })
            window.ipcRenderer.receive('receive-text-event', (event, data) => {
                this.onSubmit(event)
            })

            // this.jokeTimer = setInterval(() => this.sendRandomMsg(), 1000 * jokes.timer)
        }
    },
    beforeDestroy() {
        clearInterval(this.jokeTimer)
    }
}
</script>