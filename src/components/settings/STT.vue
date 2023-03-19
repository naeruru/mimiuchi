<template>
    <v-card color="transparent" flat>
        <v-card-title>
            Speech-to-text
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
            meow {{ $route.fullPath }}
            <v-row>
                <v-col :cols="12" :md="6">
                    <v-combobox
                        v-model="language_choice"
                        :items="languages"
                        label="Language"
                    ></v-combobox>
                </v-col>
            </v-row>
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
            console.log(new_val) // settingsStore
            if (new_val.value)
                this.settingsStore.stt_Settings.language = new_val.value
        }
    },
    methods: {

    },
    computed: {

    },
    mounted() {
        this.languages.map(language => {
            if (language.value === this.settingsStore.stt_Settings.language)
                this.language_choice = language.title
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