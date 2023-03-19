<template>
    <v-card color="transparent" flat>
        <v-card-title>OSC Settings</v-card-title>
        <v-card-subtitle class="overflow-hidden">Settings for customizing OSC connection.</v-card-subtitle>
        <v-divider></v-divider>
        <v-card-text v-if="isElectron()">
            <!-- <div>meow meow {{ $route.fullPath }}</div> -->
            meow {{ $route.fullPath }}
            <!-- <v-sheet color="transparent" class="d-flex flex-wrap"> -->
            <v-row>
                <v-col :cols="12" :md="6">
                    <v-text-field v-model="settingsStore.osc_settings.ip" label="Default OSC IP" hide-details></v-text-field>
                </v-col>
                <v-col>
                    <v-text-field v-model="settingsStore.osc_settings.port" label="Default OSC Port" hide-details></v-text-field>
                </v-col>
                <v-col :cols="12">
                    <v-card>
                        <v-switch
                            v-model="settingsStore.osc_settings.osc_text"
                            label="Send all text with OSC (when broadcasting)"
                            color="primary"
                            hide-details
                            inset
                            class="mx-3"
                        ></v-switch>
                    </v-card>

                    <v-card class="mt-2">
                        <v-switch
                            v-model="settingsStore.osc_settings.text_typing"
                            :disabled="!settingsStore.osc_settings.osc_text"
                            label="Enable typing indicator when typing"
                            color="primary"
                            hide-details
                            inset
                            class="mx-3"
                        ></v-switch>
                    </v-card>

                    <v-card class="mt-2">
                        <v-switch
                            v-model="settingsStore.osc_settings.stt_typing"
                            :disabled="!settingsStore.osc_settings.osc_text"
                            label="Enable typing indicator for speech-to-text"
                            color="primary"
                            hide-details
                            inset
                            class="mx-3"
                        ></v-switch>
                    </v-card>
                </v-col>
            </v-row>
            <!-- </v-sheet> -->
        </v-card-text>
        <v-card-text v-else>
            <h2>OSC settings are available on the desktop app version.</h2>
        </v-card-text>
    </v-card>
</template>


<script lang="ts">

import { useSettingsStore } from  '../../stores/settings'

export default {
    name: 'SettingsGeneral',
    data: () => ({
        // settings: {}
    }),
    methods: {
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
    setup() {
        const settingsStore = useSettingsStore()

        return {
            settingsStore
        }
    }
}
</script>