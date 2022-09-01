
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
                        @submit.prevent="onSubmit"
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

                        <v-btn @click="listening = !listening" class="mr-2" color="#095C51" flat>
                            <v-icon v-if="!listening">mdi-microphone</v-icon>
                            <v-progress-circular v-else class="mr-1" :size="14" :width="1" indeterminate></v-progress-circular>
                            Listen
                        </v-btn>
                        <v-btn @click="broadcasting = !broadcasting" color="#095C51" flat>
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

export default {
    name: 'Home',
    data: () => ({
        // oscClient: client,

        listening: false,
        broadcasting: false,

        logs: [], // { text: '' }

        input_text: '',

        windowSize: {
            x: 0,
            y: 0,
        },
    }),
    watch: {
        input_text(prev_val, new_val) {
            window.ipcRenderer.send("typing-text-event", !!new_val)
        }
    },
    methods: {
        onSubmit () {
            // console.log(window.process.type)
            if (this.broadcasting)
                window.ipcRenderer.send("send-text-event", this.input_text)
            
            this.logs.push({text: this.input_text})
            this.input_text = ''
        },
        onResize () {
            this.windowSize = { x: window.innerWidth, y: window.innerHeight }
        },
    },
    mounted () {
        this.onResize()
    }
}
</script>