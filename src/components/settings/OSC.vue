<template>
    <v-card :title="$t('settings.osc.general.title')" :subtitle="$t('settings.osc.general.description')" color="transparent" flat>
        <v-divider></v-divider>
        <v-card-text>
            <v-row v-if="isElectron()">
                <v-col :cols="12" :sm="6">
                    <v-text-field v-model="oscStore.ip" :label="$t('settings.osc.general.osc_ip')" hide-details></v-text-field>
                </v-col>
                <v-col :cols="12" :sm="6">
                    <v-text-field v-model="oscStore.port" :label="$t('settings.osc.general.osc_port')" hide-details></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col :cols="12">
                    <v-card>
                        <v-switch
                            v-model="oscStore.osc_text"
                            :label="$t('settings.osc.general.enabled')"
                            color="primary"
                            hide-details
                            inset
                            class="mx-3"
                        ></v-switch>
                    </v-card>

                    <v-card class="mt-2">
                        <v-switch
                            v-model="oscStore.text_typing"
                            :disabled="!oscStore.osc_text"
                            :label="$t('settings.osc.general.typing_indicator')"
                            color="primary"
                            hide-details
                            inset
                            class="mx-3"
                        ></v-switch>
                    </v-card>

                    <v-card class="mt-2">
                        <v-switch
                            v-model="oscStore.stt_typing"
                            :disabled="!oscStore.osc_text"
                            :label="$t('settings.osc.general.speech_indicator')"
                            color="primary"
                            hide-details
                            inset
                            class="mx-3"
                        ></v-switch>
                    </v-card>
                </v-col>
            </v-row>
            <v-row v-if="!isElectron()" class="justify-center">
                <v-col :cols="12">
                    <v-alert variant="outlined" type="warning" prominent>
                        <v-alert-title>
                            <i18n-t keypath="settings.osc.general.unsupported.text" tag="label">
                                
                                <template v-slot:link>
                                    <a @click="openURL('https://github.com/naexris/chatbox-tools/releases')" class="text-primary pointer">{{ $t('settings.osc.general.unsupported.link')}}</a>
                                </template>
                                <template v-slot:icon>
                                    <v-icon color="success" size="small">{{ $t('settings.osc.general.unsupported.icon')}}</v-icon>
                                </template>
                            </i18n-t>
                        </v-alert-title>
                    </v-alert>
                </v-col>
            </v-row>
            <!-- </v-sheet> -->
        </v-card-text>
    </v-card>
</template>


<script lang="ts">

import { useOSCStore } from  '../../stores/osc'

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
        const oscStore = useOSCStore()

        return {
            oscStore
        }
    }
}
</script>