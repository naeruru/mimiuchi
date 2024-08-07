<template>
  <v-card
    :title="$t('settings.osc.general.title')" :subtitle="$t('settings.osc.general.description')"
    color="transparent" flat
  >
    <v-divider />
    <v-card-text>
      <v-row v-if="is_electron()">
        <v-col :cols="12" :sm="6">
          <v-text-field v-model="oscStore.ip" :label="$t('settings.osc.general.osc_ip')" hide-details />
        </v-col>
        <v-col :cols="12" :sm="6">
          <v-text-field v-model="oscStore.port" :label="$t('settings.osc.general.osc_port')" hide-details />
        </v-col>
        <v-divider />
        <v-col :cols="12">
          <v-card>
            <v-list-item :title="$t('settings.osc.general.enabled')">
              <template #append>
                <v-switch
                  v-model="oscStore.osc_text"
                  color="primary"
                  hide-details
                  inset
                />
              </template>
            </v-list-item>
          </v-card>

          <v-card class="mt-2">
            <v-list-item :title="$t('settings.osc.general.typing_indicator')">
              <template #append>
                <v-switch
                  v-model="oscStore.text_typing"
                  :disabled="!oscStore.osc_text"
                  color="primary"
                  hide-details
                  inset
                />
              </template>
            </v-list-item>
          </v-card>

          <v-card class="mt-2">
            <v-list-item :title="$t('settings.osc.general.speech_indicator')">
              <template #append>
                <v-switch
                  v-model="oscStore.stt_typing"
                  :disabled="!oscStore.osc_text"
                  color="primary"
                  hide-details
                  inset
                />
              </template>
            </v-list-item>
          </v-card>

          <v-card class="mt-2">
            <v-list-item :title="$t('settings.osc.general.show_keyboard')">
              <template #append>
                <v-switch
                  v-model="oscStore.show_keyboard"
                  :disabled="!oscStore.osc_text"
                  color="primary"
                  hide-details
                  inset
                />
              </template>
            </v-list-item>
          </v-card>

          <v-card class="mt-2">
            <v-list-item :title="$t('settings.osc.general.sfx')">
              <template #append>
                <v-switch
                  v-model="oscStore.sfx"
                  :disabled="!oscStore.osc_text || oscStore.show_keyboard"
                  color="primary"
                  hide-details
                  inset
                />
              </template>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-if="!is_electron()" class="justify-center">
        <v-col :cols="12">
          <v-alert variant="outlined" type="warning" prominent>
            <v-alert-title>
              <i18n-t keypath="settings.osc.general.unsupported.text" tag="label">
                <template #link>
                  <a class="text-primary pointer" @click="openURL('https://github.com/naeruru/mimiuchi/releases')">
                    {{ $t('settings.osc.general.unsupported.link') }}
                  </a>
                </template>
                <template #icon>
                  <v-icon color="success" size="small">
                    {{ $t('settings.osc.general.unsupported.icon') }}
                  </v-icon>
                </template>
              </i18n-t>
            </v-alert-title>
          </v-alert>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useOSCStore } from '@/stores/osc'
import is_electron from '@/helpers/is_electron'

const oscStore = useOSCStore()

function openURL(url: string) {
  window.open(url, '_blank')
}
</script>
