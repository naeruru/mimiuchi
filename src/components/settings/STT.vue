<template>
    <v-card :title="$t('settings.stt.title')" :subtitle="$t('settings.stt.description')" color="transparent" flat>
        <v-divider></v-divider>
        <v-card-text>
            <v-row>
                <v-col :cols=12>
                    <v-select
                        v-model="speechStore.tts.type"
                        :label="$t('settings.stt.type')"
                        :items="stt_options"
                        item-title="title"
                        item-value="value"
                        variant="outlined"
                    ></v-select>
                </v-col>
            </v-row>
            <v-row v-if="speechStore.tts.type.value === 'webspeech' && !is_electron()">
                <v-col :cols="12">
                    <v-radio-group v-model="speechStore.stt.language" :label="$t('settings.stt.language')">
                        <v-text-field v-model="search_lang" class="mb-2" label="Search" variant="outlined" single-line hide-details></v-text-field>
                        <v-card v-for="(language, i) in filtered_lang" class="pa-2 mb-2" :color="language.value === speechStore.stt.language ? 'primary' : 'default'" @click="speechStore.stt.language = language.value">
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
            <v-card-text v-else>
                <v-alert variant="outlined" type="warning" prominent>
                    <v-alert-title>
                        <i18n-t keypath="settings.stt.unsupported.text" tag="label" for="link">
                            <a @click="openURL('https://mimiuchi.naeris.net/')" class="text-primary pointer">{{ $t('settings.stt.unsupported.link')}}</a>
                        </i18n-t>
                    </v-alert-title>
                </v-alert>
            </v-card-text>
        </v-card-text>
    </v-card>
</template>


<script lang="ts">
import { useSpeechStore } from  '../../stores/speech'

import is_electron from '../../helpers/is_electron'

export default {
    name: 'STT',
    data: () => ({
        stt_options: [
            {
                title: "Web Speech API",
                value: "webspeech"
            },
        ],
        language_choice: "",
        search_lang: '',
        languages: [
            {
                title: "English (Australia)",
                value: "en-AU"
            },
            {
                title: "English (Ireland)",
                value: "en-IE"
            },
            {
                title: "English (United Kingdom)",
                value: "en-GB"
            },
            {
                title: "English (United States)",
                value: "en-US"
            },
            {
                title: "日本語（日本）",
                value: "ja-JP"
            },
            {
                title: "한국어",
                value: "ko-KR"
            },
        ]
    }),
    computed: {
        filtered_lang() {
            return this.languages.filter(lang => `${lang.title} ${lang.value}`.toLocaleLowerCase().includes(this.search_lang.toLocaleLowerCase()))
        }
    },
    watch: {
        language_choice(new_val) {
            if (new_val.value)
                this.speechStore.stt.language = new_val.value
        }
    },
    methods: {
        openURL(url: string) {
            window.open(url, '_blank')
        }
    },
    mounted() {
        this.languages.map(language => {
            if (language.value === this.speechStore.stt.language)
                this.language_choice = language.value
        })
    },
    setup() {
        const speechStore = useSpeechStore()

        return {
            speechStore,
            is_electron
        }
    }
}
</script>