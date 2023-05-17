<template>
    <v-card :title="$t('settings.osc.general.title')" :subtitle="$t('settings.osc.general.description')" color="transparent" flat>
        <v-divider></v-divider>
        <v-card-text v-if="isElectron()">
            <!-- <div>meow meow {{ $route.fullPath }}</div> -->
            <!-- <v-sheet color="transparent" class="d-flex flex-wrap"> -->
            <v-row>
                <v-col :cols="12" :md="6">
                    <v-text-field v-model="settingsStore.osc_settings.ip" :label="$t('settings.osc.general.osc_ip')" hide-details></v-text-field>
                </v-col>
                <v-col>
                    <v-text-field v-model="settingsStore.osc_settings.port" :label="$t('settings.osc.general.osc_port')" hide-details></v-text-field>
                </v-col>
                <v-col :cols="12">
                    <v-card>
                        <v-switch
                            v-model="settingsStore.osc_settings.osc_text"
                            :label="$t('settings.osc.general.enabled')"
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
                            :label="$t('settings.osc.general.typing_indicator')"
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
                            :label="$t('settings.osc.general.speech_indicator')"
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
            <h2>
                <i18n-t keypath="settings.osc.general.unsupported.text" tag="label" for="link">
                    <a @click="openURL('https://github.com/naexris/chatbox-tools/releases')" class="text-primary pointer">{{ $t('settings.osc.general.unsupported.link')}}</a>
                </i18n-t>
            </h2>
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
        openURL(url: string) {
            window.open(url, '_blank')
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
    setup() {
        const settingsStore = useSettingsStore()

        return {
            settingsStore
        }
    }
}
</script>