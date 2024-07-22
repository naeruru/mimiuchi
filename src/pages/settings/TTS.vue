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
            v-model="selected_option"
            :label="$t('settings.tts.type')"
            :items="tts_options"
            item-title="title"
            item-value="value"
            variant="outlined"
            @update:model-value="loadVoices"
          />
        </v-col>
        <v-col :cols="12" :md="6">
          <v-slider
            v-model="speechStore.tts.rate"
            :disabled="selected_option !== 'webspeech'"
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
            :disabled="selected_option !== 'webspeech'"
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
          <v-radio-group
            v-model="speechStore.tts.voice"
            :label="$t('settings.tts.language')"
          >
            <v-text-field
              v-model="search_lang"
              class="mb-2"
              label="Search"
              variant="outlined"
              hide-details
            />
            <v-card
              v-for="(language) in filtered_lang"
              :key="language.name"
              class="pa-2 mb-2"
              :color="language.name === speechStore.tts.voice ? 'primary' : 'default'"
              @click="update_voice(language.name)"
            >
              <v-row class="pa-3">
                <v-radio :label="language.name" :value="language.name">
                  <template #label>
                    <div>{{ language.name }}</div>
                  </template>
                </v-radio>
                <v-icon class="pt-4 pr-2" :icon="language.local_service ? 'mdi-laptop' : 'mdi-weather-cloudy'" />
              </v-row>
            </v-card>
          </v-radio-group>
        </v-col>
        <v-divider />
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useSpeechStore } from '@/stores/speech'

interface Voice {
  lang: string
  name: string
  local_service: boolean
}

const synth = window.speechSynthesis

const speechStore = useSpeechStore()

const tts_options = ref([
  {
    title: 'TikTok',
    value: 'tiktok',
  },
  {
    title: 'Web Speech API',
    value: 'webspeech',
  },
  {
    title: 'Yukumo!',
    value: 'yukumo',
  },
])
const selected_option = ref(speechStore.tts.type)
const search_lang = ref('')
const languages = ref([] as Voice[])

onMounted(() => {
  if ('onvoiceschanged' in synth)
    synth.onvoiceschanged = loadVoices

  loadVoices()

  if (speechSynthesis.onvoiceschanged !== undefined)
    speechSynthesis.onvoiceschanged = loadVoices
})

const filtered_lang = computed(() => {
  return languages.value.filter(lang => `${lang.name} ${lang.lang}`.toLocaleLowerCase().includes(search_lang.value.toLocaleLowerCase()))
})

function loadVoices() {
  languages.value = speechStore.load_voices(selected_option.value)
}

function update_voice(voice: string) {
  speechStore.tts.voice = voice
  speechStore.tts.type = selected_option.value
}
</script>
