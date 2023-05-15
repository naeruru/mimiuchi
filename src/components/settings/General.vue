<template>
    <v-card :title="$t('settings.general.title')" :subtitle="$t('settings.general.description')" color="transparent" flat>
        <v-snackbar v-model="snackbar" location="top" color="success">
            {{ snackbar_text }}
            <template v-slot:actions>
                <v-btn variant="text" @click="snackbar = false">
                    {{  $t('settings.general.reset.snackbar.button') }}
                </v-btn>
            </template>
        </v-snackbar>
        <v-divider></v-divider>
        <v-card-text>
            <v-row>
                <v-col>
                    <v-btn color="error" block>
                        {{  $t('settings.general.reset.button') }}
                        <v-dialog
                                v-model="reset_dialog"
                                activator="parent"
                                max-width="500"
                            >
                                <v-card>
                                    <v-card-title>{{  $t('settings.general.reset.dialog.title') }}</v-card-title>
                                    <v-card-text>
                                        {{  $t('settings.general.reset.dialog.description') }}
                                    </v-card-text>
                                    <v-form validate-on="input" @submit.prevent="reset_submit">
                                        <v-card-actions>
                                            <!-- <v-col>
                                                <v-checkbox v-model="settings" label="General" hide-details></v-checkbox>
                                                <v-checkbox v-model="word_replace" label="Word Replace" hide-details></v-checkbox>
                                            </v-col> -->
                                        </v-card-actions>
                                    </v-form>
                                    <v-btn @click="reset_settings()" class="mt-2" color="error">
                                        {{  $t('settings.general.reset.dialog.button') }}
                                    </v-btn>
                                </v-card>
                        </v-dialog>
                    </v-btn>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>


<script lang="ts">
import { useAppearanceStore } from  '../../stores/appearance'
import { useWordReplaceStore } from  '../../stores/word_replace'
import { useSettingsStore } from  '../../stores/settings'

export default {
    name: 'SettingsGeneral',
    data: () => ({
        snackbar: false,
        snackbar_text: '',

        reset_dialog: false,
        appearance: true,
        settings: true,
        word_replace: true,
    }),
    methods: {
        reset_submit() {
            
        },
        reset_settings() {
            if (this.appearance) this.appearanceStore.$reset()
            if (this.word_replace) this.wordReplaceStore.$reset()
            if (this.settings) this.settingsStore.$reset()
            this.reset_dialog = false
            this.snackbar_text = this.$t('settings.general.reset.snackbar.title')
            this.snackbar = true
        }
    },
    setup() {
        const appearanceStore = useAppearanceStore()
        const wordReplaceStore = useWordReplaceStore()
        const settingsStore = useSettingsStore()
        
        return {
            appearanceStore,
            wordReplaceStore,
            settingsStore
        }
    }
}
</script>