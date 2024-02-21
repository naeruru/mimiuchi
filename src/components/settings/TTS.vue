<template>
  <v-card :title="$t('settings.tts.title')" :subtitle="$t('settings.tts.description')" color="transparent" flat>
    <v-divider />
    <v-card-text>
      <v-row>
        <v-col :cols="12">
          <v-card>
            <v-list-item :title="$t('settings.tts.enabled') ">
              <template #append>
                <v-switch
                  v-model="speechStore.tts.enabled"
                  color="primary"
                  hide-details
                  inset
                />
              </template>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col :cols="12">
          <v-select
            v-model="speechStore.tts.type"
            :label="$t('settings.tts.type')"
            :items="tts_options"
            item-title="title"
            item-value="value"
            variant="outlined"
          />
        </v-col>
        <v-col :cols="12" :md="6">
          <v-slider
            v-model="speechStore.tts.rate"
            class="align-center"
            max="1.5"
            min=".1"
            :label="$t('settings.tts.rate')"
            thumb-color="primary"
            hide-details
          >
            <template #append>
              <v-text-field
                v-model="speechStore.tts.rate"
                hide-details
                single-line
                disabled
                density="compact"
                type="number"
                style="width: 70px"
                variant="outlined"
              />
            </template>
          </v-slider>
        </v-col>
        <v-col :cols="12" :md="6">
          <v-slider
            v-model="speechStore.tts.pitch"
            class="align-center"
            max="1.5"
            min=".1"
            :label="$t('settings.tts.pitch')"
            thumb-color="primary"
            hide-details
          >
            <template #append>
              <v-text-field
                v-model="speechStore.tts.pitch"
                hide-details
                single-line
                disabled
                density="compact"
                type="number"
                style="width: 70px"
                variant="outlined"
              />
            </template>
          </v-slider>
        </v-col>
        <v-col :cols="12">
          <v-radio-group v-model="speechStore.tts.voice" :label="$t('settings.tts.language')">
            <v-text-field v-model="search_lang" class="mb-2" label="Search" variant="outlined" hide-details />
            <v-card v-for="(language, i) in filtered_lang" class="pa-2 mb-2" :color="language.name === speechStore.tts.voice ? 'primary' : 'default'" @click="speechStore.tts.voice = language.name">
              <v-row class="pa-3">
                <v-radio :label="language.name" :value="language.name">
                  <template #label>
                    <div>{{ language.name }}</div>
                  </template>
                </v-radio>
                <v-icon class="pt-4 pr-2" :icon="language.localService ? 'mdi-laptop' : 'mdi-weather-cloudy'" />
              </v-row>
            </v-card>
          </v-radio-group>
        </v-col>
        <v-divider />
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { useSpeechStore } from '@/stores/speech'

const synth = window.speechSynthesis

export default {
  name: 'STT',
  setup() {
    const speechStore = useSpeechStore()

    return {
      speechStore,
    }
  },
  data: () => ({
    tts_options: [
      {
        title: 'Web Speech API',
        value: 'webspeech',
      },
    ],
    language_choice: '',
    search_lang: '',
    languages: [] as SpeechSynthesisVoice[],
  }),
  computed: {
    filtered_lang() {
      return this.languages.filter(lang => `${lang.name} ${lang.lang}`.toLocaleLowerCase().includes(this.search_lang.toLocaleLowerCase()))
    },
  },
  watch: {
    language_choice(new_val) {
      if (new_val.value)
        this.speechStore.stt.language = new_val.value
    },
  },
  mounted() {
    if ('onvoiceschanged' in synth)
      synth.onvoiceschanged = this.loadVoices
    else
      this.loadVoices()

    this.loadVoices()
    if (speechSynthesis.onvoiceschanged !== undefined)
      speechSynthesis.onvoiceschanged = this.loadVoices
  },
  methods: {
    loadVoices() {
      this.languages = synth.getVoices()
    },
    openURL(url: string) {
      window.open(url, '_blank')
    },
  },
}
</script>
