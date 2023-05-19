<template>
    <v-card :title="$t('settings.speech.title')" :subtitle="$t('settings.speech.description')" color="transparent" flat>
        <v-divider></v-divider>
        <v-card-text v-if="!isElectron()">
            <v-row>
                <v-col :cols="12">
                    <v-radio-group v-model="settingsStore.stt_Settings.language" :label="$t('settings.speech.language')">
                        <v-card v-for="(language, i) in languages" class="pa-2 mb-2" :color="language.value === settingsStore.stt_Settings.language ? 'primary' : 'default'" @click="settingsStore.stt_Settings.language = language.value">
                            <v-radio :label="language.title" :value="language.value">
                                <template v-slot:label>
                                    <div>{{ language.title }}</div>
                                </template>
                            </v-radio>
                        </v-card>
                    </v-radio-group>
                </v-col>
                <v-divider></v-divider>
            </v-row>
        </v-card-text>
        <v-card-text v-else>
            <v-alert variant="outlined" type="warning" prominent>
                    <v-alert-title>
                        <i18n-t keypath="settings.speech.unsupported.text" tag="label" for="link">
                            <a @click="openURL('https://captions.naeris.net/')" class="text-primary pointer">{{ $t('settings.speech.unsupported.link')}}</a>
                        </i18n-t>
                    </v-alert-title>
                </v-alert>
        </v-card-text>
    </v-card>
</template>


<script lang="ts">
import { useSettingsStore } from  '../../stores/settings'

export default {
    name: 'STT',
    data: () => ({
        language_choice: "",
        languages: [
            {
                title: "English (United States)",
                value: "en-US"
            },
            {
                title: "日本語（日本）",
                value: "ja-JP"
            }
        ]
    }),
    watch: {
        language_choice(new_val) {
            if (new_val.value)
                this.settingsStore.stt_Settings.language = new_val.value
        }
    },
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
    computed: {

    },
    mounted() {
        this.languages.map(language => {
            if (language.value === this.settingsStore.stt_Settings.language)
                this.language_choice = language.value
        })
    },
    setup() {
        const settingsStore = useSettingsStore()

        return {
            settingsStore
        }
    }
}
</script>