<template>
  <v-card :title="$t('settings.general.title')" :subtitle="$t('settings.general.description')" color="transparent" flat>
    <v-snackbar v-model="snackbar" location="top" color="success">
      {{ snackbar_text }}
      <template #actions>
        <v-btn variant="text" @click="snackbar = false">
          {{ $t('settings.general.reset.snackbar.button') }}
        </v-btn>
      </template>
    </v-snackbar>
    <v-divider />
    <v-card-text>
      <v-row>
        <v-col :cols="12">
          <v-radio-group v-model="settingsStore.language" :label="$t('settings.general.language')">
            <v-card v-for="(language, i) in languages" class="pa-2 mb-2" :color="language.value === settingsStore.language ? 'primary' : 'default'" @click="settingsStore.language = language.value">
              <v-radio :label="language.title" :value="language.value">
                <template #label>
                  <div>{{ language.title }}</div>
                </template>
              </v-radio>
            </v-card>
          </v-radio-group>
        </v-col>
        <v-divider />
      </v-row>
      <v-row>
        <v-col :cols="12" class="d-flex flex-no-wrap justify-space-between">
          <v-card-text class="text-subtitle-1 font-weight-medium">
            {{ $t('settings.general.transcript') }}
          </v-card-text>
          <v-btn color="primary" class="mt-2" @click="logStore.export()">
            <v-icon>mdi-download</v-icon>
          </v-btn>
        </v-col>
        <v-divider />
      </v-row>
      <v-row>
        <v-col :cols="12" :md="12" class="d-flex flex-no-wrap justify-space-between">
          <v-card-text class="text-subtitle-1 font-weight-medium">
            {{ $t('settings.general.reset.button') }}
          </v-card-text>
          <v-btn color="error" class="mt-2">
            <v-icon>mdi-restore</v-icon>
            <v-dialog
              v-model="reset_dialog"
              activator="parent"
              max-width="500"
            >
              <v-card>
                <v-card-title>{{ $t('settings.general.reset.dialog.title') }}</v-card-title>
                <v-card-text>
                  {{ $t('settings.general.reset.dialog.description') }}
                </v-card-text>
                <v-form validate-on="input" @submit.prevent="reset_submit">
                  <v-card-actions>
                    <!-- <v-col>
                                                <v-checkbox v-model="settings" label="General" hide-details></v-checkbox>
                                                <v-checkbox v-model="word_replace" label="Word Replace" hide-details></v-checkbox>
                                            </v-col> -->
                  </v-card-actions>
                </v-form>
                <v-btn class="mt-2" color="error" @click="reset_settings()">
                  {{ $t('settings.general.reset.dialog.button') }}
                </v-btn>
              </v-card>
            </v-dialog>
          </v-btn>
        </v-col>
        <v-divider />
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { useAppearanceStore } from '@/stores/appearance'
import { useWordReplaceStore } from '@/stores/word_replace'
import { useSettingsStore } from '@/stores/settings'
import { useSpeechStore } from '@/stores/speech'
import { useConnectionStore } from '@/stores/connections'
import { useLogStore } from '@/stores/logs'

export default {
  name: 'SettingsGeneral',
  setup() {
    const appearanceStore = useAppearanceStore()
    const wordReplaceStore = useWordReplaceStore()
    const settingsStore = useSettingsStore()
    const speechStore = useSpeechStore()
    const connectionStore = useConnectionStore()
    const logStore = useLogStore()

    return {
      appearanceStore,
      wordReplaceStore,
      settingsStore,
      speechStore,
      connectionStore,
      logStore,
    }
  },
  data: () => ({
    languages: [
      {
        title: 'English (United States)',
        value: 'en',
      },
      {
        title: 'Spanish (España)',
        value: 'es',
      },
      {
        title: '日本語（日本）',
        value: 'ja',
      },
    ],

    snackbar: false,
    snackbar_text: '',

    reset_dialog: false,
    appearance: true,
    settings: true,
    word_replace: true,
    speech: true,
    connection: true,
  }),
  methods: {
    reset_submit() {

    },
    reset_settings() {
      if (this.appearance)
        this.appearanceStore.$reset()
      if (this.word_replace)
        this.wordReplaceStore.$reset()
      if (this.settings)
        this.settingsStore.$reset()
      if (this.speech)
        this.speechStore.$reset()
      if (this.connection)
        this.connectionStore.$reset()
      this.reset_dialog = false
      this.snackbar_text = this.$t('settings.general.reset.snackbar.title')
      this.snackbar = true
      // this.$i18n.locale = this.settingsStore.language
    },
  },
}
</script>
