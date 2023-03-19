<template>
    <v-card color="transparent" flat>
        <v-card-title>
            General Settings
        </v-card-title>
        <v-card-subtitle class="overflow-hidden">General application settings</v-card-subtitle>
        <v-divider></v-divider>
        <v-card-text>
            <v-row>
                <v-col>
                    <v-btn color="error">
                        Reset all settings
                        <v-dialog
                            v-model="reset_dialog"
                            activator="parent"
                            max-width="500"
                        >
                            <v-card>
                                <v-card-title>Reset Settings</v-card-title>
                                <v-card-text>
                                    You are about to reset settings for the entire application.
                                </v-card-text>
                                <v-form validate-on="input" @submit.prevent="reset_submit">
                                    <v-card-actions>
                                        <!-- <v-col>
                                            <v-checkbox v-model="settings" label="General" hide-details></v-checkbox>
                                            <v-checkbox v-model="word_replace" label="Word Replace" hide-details></v-checkbox>
                                        </v-col> -->
                                    </v-card-actions>
                                </v-form>
                                <v-btn @click="reset_settings()" class="mt-2" color="error">reset</v-btn>
                                
                            </v-card>
                        </v-dialog>
                    </v-btn>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>


<script lang="ts">
import { useWordReplaceStore } from  '../../stores/word_replace'
import { useSettingsStore } from  '../../stores/settings'

export default {
    name: 'SettingsGeneral',
    data: () => ({
        reset_dialog: false,
        settings: true,
        word_replace: true,
    }),
    methods: {
        reset_submit() {
            
        },
        reset_settings() {
            if (this.word_replace) this.wordReplaceStore.$reset()
            if (this.settings) this.settingsStore.$reset()
            this.reset_dialog = false
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