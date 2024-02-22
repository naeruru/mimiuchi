<template>
  <v-card :title="$t('settings.stt.title')" :subtitle="$t('settings.stt.description')" color="transparent" flat>
    <v-divider />
    <v-card-text>
      <v-row>
        <v-col :cols="12">
          <v-select
            v-model="speechStore.stt.type"
            :label="$t('settings.stt.type')"
            :items="stt_options"
            item-title="title"
            item-value="value"
            variant="outlined"
          />
        </v-col>
      </v-row>

      <v-row v-if="speechStore.stt.type.value === 'webspeech' && !is_electron()">
        <v-col :cols="12">
          <v-slider
            v-model="speechStore.stt.sensitivity"
            :label="$t('settings.stt.sensitivity')"
            max="1"
            color="orange"
            track-color="green"
            thumb-color="primary"
            hide-details
          />
        </v-col>
        <v-row class="mx-3 mb-4 mt-2">
          <v-col class="pa-0">
            <v-slider
              v-model="sensitivity"
              color="orange"
              :track-color="sensitivity === 0 ? `grey` : `green`"
              hide-details
              readonly
              max="1"
              height="20"
              thumb-size="4"
            >
              <template #prepend>
                <v-btn
                  color="primary"
                  width="122"
                  :loading="loading_media"
                  @click="test_sensitivity()"
                >
                  {{ stream ? $t('settings.stt.sensitivity_stop') : $t('settings.stt.sensitivity_start') }}
                </v-btn>
              </template>
            </v-slider>
            <div v-if="active_device" class="text-caption d-flex flex-row-reverse mr-2">
              <p class="text-glow">
                {{ $t('settings.stt.device') }}{{ active_device }}
              </p>
              <v-icon class="fa fa-circle text-glow blink mr-1">
                mdi-circle
              </v-icon>
            </div>
          </v-col>
        </v-row>

        <v-col :cols="12">
          <v-radio-group v-if="Object.keys(speechStore.pinned_languages).length > 0" v-model="speechStore.stt.language" :label="$t('settings.stt.pinned_languages')">
            <v-card v-for="language in speechStore.pinned_languages" class="language-card pa-2 mb-2" :color="language.value === speechStore.stt.language ? 'primary' : 'default'" @click="speechStore.stt.language = language.value">
              <v-radio :label="language.title" :value="language.value">
                <template #label>
                  <div class="d-flex flex-grow-1 justify-space-between me-2">
                    <div>{{ language.title }}</div>
                    <div class="pin-icon">
                      <v-icon v-if="!is_pinned_language(language)" class="pin-icon-not-pinned" @click.prevent="pin_language(language)">
                        mdi-star-outline
                      </v-icon>
                      <v-icon v-else class="pin-icon-pinned" @click.prevent="unpin_language(language)">
                        mdi-star
                      </v-icon>
                    </div>
                  </div>
                </template>
              </v-radio>
            </v-card>
          </v-radio-group>
          <v-radio-group v-model="speechStore.stt.language" :label="$t('settings.stt.language')">
            <v-text-field v-model="search_lang" class="mb-2" label="Search" variant="outlined" single-line hide-details />
            <v-card v-for="(language, i) in filtered_lang" class="language-card pa-2 mb-2" :color="language.value === speechStore.stt.language ? 'primary' : 'default'" @click="speechStore.stt.language = language.value">
              <v-radio :label="language.title" :value="language.value">
                <template #label>
                  <div class="d-flex flex-grow-1 justify-space-between me-2">
                    <div>{{ language.title }}</div>
                    <div class="pin-icon">
                      <v-icon v-if="!is_pinned_language(language)" class="pin-icon-not-pinned" @click.prevent="pin_language(language)">
                        mdi-star-outline
                      </v-icon>
                      <v-icon v-else class="pin-icon-pinned" @click.prevent="unpin_language(language)">
                        mdi-star
                      </v-icon>
                    </div>
                  </div>
                </template>
              </v-radio>
            </v-card>
          </v-radio-group>
        </v-col>
        <v-divider />
      </v-row>
      <v-card-text v-else>
        <v-alert variant="outlined" type="warning" prominent>
          <v-alert-title>
            <i18n-t keypath="settings.stt.unsupported.text" tag="label" for="link" scope="global">
              <a class="text-primary pointer" @click="openURL('https://mimiuchi.com/')">{{ $t('settings.stt.unsupported.link') }}</a>
            </i18n-t>
          </v-alert-title>
        </v-alert>
      </v-card-text>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { useSpeechStore } from '@/stores/speech'
import { WebSpeechLangs } from '@/modules/speech'

import is_electron from '@/helpers/is_electron'

declare interface MediaDevice {
  kind?: string
  label?: string
  id?: string
}

export default {
  name: 'STT',
  setup() {
    const speechStore = useSpeechStore()

    return {
      speechStore,
      is_electron,
      languages: WebSpeechLangs,
    }
  },
  data: () => ({
    stt_options: [
      {
        title: 'Web Speech API',
        value: 'webspeech',
      },
    ],
    language_choice: '',
    search_lang: '',

    active_device: '',
    media_devices: [] as any,
    stream: null as any,
    sensitivity: 0,
    loading_media: false,
  }),
  computed: {
    filtered_lang() {
      return this.languages.filter(lang => `${lang.title} ${lang.value}`.toLocaleLowerCase().includes(this.search_lang.toLocaleLowerCase()))
    },
  },
  watch: {
    language_choice(new_val) {
      if (new_val.value)
        this.speechStore.stt.language = new_val.value
    },
  },
  unmounted() {
    this.stop_stream()
  },
  mounted() {
    this.languages.map((language) => {
      if (language.value === this.speechStore.stt.language)
        this.language_choice = language.value
    })
    this.get_media_devices()
  },
  methods: {
    openURL(url: string) {
      window.open(url, '_blank')
    },
    async test_sensitivity() {
      if (this.stream) {
        this.stop_stream()
        return
      }

      this.loading_media = true
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      this.stream.getTracks().forEach((track: any) => this.active_device = track.label)
      const audioContext = new AudioContext()
      const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(this.stream)
      const analyserNode = audioContext.createAnalyser()
      mediaStreamAudioSourceNode.connect(analyserNode)

      const pcmData = new Float32Array(analyserNode.fftSize)
      const onFrame = () => {
        if (!this.stream)
          return
        analyserNode.getFloatTimeDomainData(pcmData)
        let sumSquares = 0.0
        for (const amplitude of pcmData) sumSquares += amplitude * amplitude
        this.sensitivity = Math.round(Math.sqrt(sumSquares / pcmData.length) * 1000) / 1000
        window.requestAnimationFrame(onFrame)
      }
      window.requestAnimationFrame(onFrame)
      this.loading_media = false
    },
    stop_stream() {
      if (this.stream) {
        this.stream.getTracks().forEach((track: any) => {
          track.stop()
          this.stream = null
          this.sensitivity = 0
          this.loading_media = false
          this.active_device = ''
        })
      }
    },
    async get_media_devices() {
      this.media_devices = []
      navigator.mediaDevices.enumerateDevices().then((devices: any) => {
        devices.forEach((device: MediaDevice) => {
          if (device.kind === 'audioinput') {
            this.media_devices.push({
              kind: device.kind,
              label: device.label,
              id: device.label,
            })
          }
        })
      })
    },
    pin_language(selected_language: list_item) {
      this.speechStore.pin_language(selected_language)
    },
    unpin_language(selected_language: list_item) {
      this.speechStore.unpin_language(selected_language)
    },
    is_pinned_language(selected_language: list_item) {
      return this.speechStore.is_pinned_language(selected_language)
    },
  },
}
</script>

<style>
.language-card .v-selection-control .v-label {
  width: 100%;
}

.language-card .pin-icon-not-pinned:before {
  display: none !important;
}

.language-card:hover .pin-icon-not-pinned:before {
  display: inline-block !important;
}

/* v-hover is unreliable and doesn't respond to layout changes. */
.pin-icon-pinned:hover:before {
  content: "\F1564" !important; /* mdi-star-minus */
}

.pin-icon-not-pinned:hover:before {
  content: "\F1567" !important; /* mdi-star-plus-outline */
}
</style>
