<template>
    <v-card color="transparent" flat>
        <v-card-title>OSC Settings</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
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
                            label="Enable typing indicator for speech-to-text (!! experimental !!)"
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

    },
    setup() {
        const settingsStore = useSettingsStore()

        // Object.keys(osc_settings).forEach((setting, i) => this.settings.push({ [setting]: osc_settings[setting]}))

        console.log(settingsStore.osc_settings)

        return {
            settingsStore
        }
    }
}
</script>