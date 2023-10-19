<template>
    <v-card :title="$t('settings.translation.title')" :subtitle="$t('settings.translation.description')" color="transparent" flat>
        <v-divider></v-divider>
        <v-card-text>
            <v-row>
                <v-col :cols="12">
                    <v-card flat>
                        <v-switch
                            v-model="translationStore.enabled"
                            :label="$t('settings.translation.enabled')"
                            color="primary"
                            hide-details
                            inset
                            class="mx-3"
                        ></v-switch>
                    </v-card>
                </v-col>
                <v-col :cols=12>
                    <v-select
                        v-model="translationStore.type"
                        :label="$t('settings.translation.type')"
                        :items="translation_types"
                        item-title="title"
                        item-value="value"
                        variant="outlined"
                        hide-details
                    >
                        <template v-slot:item="{ props, item }">
                            <v-list-item v-bind="props">
                                <template v-slot:append>
                                    <v-icon icon="mdi-laptop"></v-icon>
                                </template>
                            </v-list-item>
                        </template>
                    </v-select>
                </v-col>
                <v-col v-if="translation_types.find(o => o.type === 'local')" :cols="12">
                    <v-alert variant="outlined" type="info" prominent>
                        <v-alert-title class="text-subtitle-1">
                            <i18n-t keypath="settings.translation.ml_notice" tag="label" scope="global">
                                <span class="text-primary">{{ translationStore.type }}</span>
                            </i18n-t>
                        </v-alert-title>
                    </v-alert>
                </v-col>
                <v-col :cols=12 :sm=6>
                    <v-autocomplete
                        v-model="translationStore.source"
                        :label="$t('settings.translation.source')"
                        :items="translation_options"
                        item-title="title"
                        item-value="value"
                        auto-select-first
                        :hint="`${$t('settings.translation.speech_lang')}${stt_language}`"
                        persistent-hint
                    ></v-autocomplete>
                </v-col>
                <v-col :cols=12 :sm=6>
                    <v-autocomplete
                        v-model="translationStore.target"
                        :label="$t('settings.translation.target')"
                        :items="translation_options"
                        item-title="title"
                        item-value="value"
                        auto-select-first
                        hide-details
                    ></v-autocomplete>
                </v-col>
                <v-col :cols="12">
                    <v-card flat>
                        <v-switch
                            v-model="translationStore.show_original"
                            :label="$t('settings.translation.show_original')"
                            color="primary"
                            hide-details
                            inset
                            class="mx-3"
                        ></v-switch>
                    </v-card>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>


<script lang="ts">
import { useTranslationStore } from '../../stores/translation'
import { useSpeechStore } from  '../../stores/speech'
import translation_options from '../../constants/translation_options'

export default {
    name: 'SettingsTranslation',
    data() {
        return {
            translation_types: [
                {
                    title: "Transformers.js",
                    value: "Transformers.js",
                    type: "local",
                },
            ],
            translation_options: translation_options,
        }
    },
    methods: {
        open_external(link: string | null) {
            if (link) window.open(link, '_blank')
        }
    },
    async mounted() {
        
    },
    setup() {
        const translationStore = useTranslationStore()
        const speechStore = useSpeechStore()

        return {
            translationStore,
            stt_language: speechStore.stt.language
        }
    }
}
</script>