<template>
  <v-card
    :title="$t('settings.osc.general.title')" :subtitle="$t('settings.osc.general.description')"
    color="transparent" flat
  >
    <v-divider />
    <v-card-text>
      <v-row>
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
