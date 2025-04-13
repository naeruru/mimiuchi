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
            <v-card
              v-for="(language) in settingsStore.languages"
              :key="language.value"
              class="pa-2 mb-2" :color="language.value === settingsStore.language ? 'primary' : 'default'"
              @click="settingsStore.language = language.value"
            >
              <v-radio
                :label="language.title"
                :value="language.value"
              >
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
        <v-col :cols="12" :md="12" class="pb-0">
          <v-card>
            <v-list-item :title="$t('settings.general.realtime_text')">
              <template #append>
                <v-switch
                  v-model="settingsStore.realtime_text"
                  color="primary"
                  hide-details
                  inset
                />
              </template>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-if="is_electron()">
        <v-col :cols="12" :md="12" class="pb-0">
          <v-card>
            <v-list-item>
              <v-list-item-title>
                {{ $t('settings.general.auto_open_web_app') }}
              </v-list-item-title>
              <template #append>
                <v-switch
                  v-model="auto_open_web_app_on_launch"
                  color="primary"
                  hide-details
                  inset
                  @change="set_auto_open_web_app_on_launch()"
                />
              </template>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>
      <v-row class="mt-12" />
      <v-row>
        <v-col :cols="12" class="pb-0">
          <v-card>
            <v-list-item :title="$t('settings.general.transcript')">
              <template #append>
                <v-btn color="primary" class="my-2" @click="logsStore.exportLogs()">
                  <v-icon>mdi-download</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col :cols="12" class="pb-0">
          <v-card>
            <v-list-item :title="$t('settings.general.reset.button')">
              <template #append>
                <v-btn color="error" class="my-2">
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
                      <v-btn class="mt-2" color="error" @click="reset_settings()">
                        {{ $t('settings.general.reset.dialog.button') }}
                      </v-btn>
                    </v-card>
                  </v-dialog>
                </v-btn>
              </template>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>
      <!-- <v-row>
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
                <v-btn class="mt-2" color="error" @click="reset_settings()">
                  {{ $t('settings.general.reset.dialog.button') }}
                </v-btn>
              </v-card>
            </v-dialog>
          </v-btn>
        </v-col>
        <v-divider />
      </v-row> -->
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import is_electron from '@/helpers/is_electron'

import { useAppearanceStore } from '@/stores/appearance'
import { useWordReplaceStore } from '@/stores/word_replace'
import { useSettingsStore } from '@/stores/settings'
import { useSpeechStore } from '@/stores/speech'
import { useConnectionsStore } from '@/stores/connections'
import { useLogsStore } from '@/stores/logs'
import { useTranslationStore } from '@/stores/translation'
import { useOSCStore } from '@/stores/osc'

const { t } = useI18n()

const snackbar = ref(false)
const snackbar_text = ref('')

const reset_dialog = ref(false)

const appearance = ref(true)
const settings = ref(true)
const word_replace = ref(true)
const speech = ref(true)
const connection = ref(true)
const translation = ref(true)
const osc = ref(true)

const appearanceStore = useAppearanceStore()
const wordReplaceStore = useWordReplaceStore()
const settingsStore = useSettingsStore()
const speechStore = useSpeechStore()
const connectionsStore = useConnectionsStore()
const logsStore = useLogsStore()
const translationStore = useTranslationStore()
const oscStore = useOSCStore()

const router = useRouter()
const auto_open_web_app_on_launch = ref(false) // Stores the display value for UI. The source of truth is in the Electron store

onMounted(() => {
  if (is_electron())
    sync_auto_open_web_app_on_launch()
})

async function sync_auto_open_web_app_on_launch() {
  const value = await window.ipcRenderer.invoke('get-auto-open-web-app-on-launch')
  auto_open_web_app_on_launch.value = value
}

function set_auto_open_web_app_on_launch() {
  window.ipcRenderer.send('set-auto-open-web-app-on-launch', auto_open_web_app_on_launch.value)
}

function reset_settings() {
  if (appearance.value)
    appearanceStore.$reset()
  if (word_replace.value)
    wordReplaceStore.$reset()
  if (settings.value)
    settingsStore.$reset()
  if (speech.value)
    speechStore.$reset()
  if (connection.value)
    connectionsStore.$reset()
  if (translation.value)
    translationStore.$reset()
  if (osc.value)
    oscStore.$reset()
  reset_dialog.value = false
  snackbar_text.value = t('settings.general.reset.snackbar.title')
  snackbar.value = true
  // this.$i18n.locale = this.settingsStore.language

  router.push('/')
}
</script>
