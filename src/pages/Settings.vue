<template>
  <v-card
    :title="t('settings.translation.title')" :subtitle="t('settings.translation.description')"
    color="transparent" flat
  >
    <v-divider />
    <v-card-text>
      <v-row v-if="is_electron()">
        <v-col>
          <v-chip variant="outlined" label color="error" size="large">
            <v-icon start icon="mdi-alert" />
            {{ t('settings.translation.warning') }}
          </v-chip>
        </v-col>
        <v-col :cols="12">
          <v-card flat>
            <v-list-item :title="t('settings.translation.enabled')">
              <template #append>
                <v-switch
                  v-model="translationStore.enabled"
                  color="primary"
                  hide-details
                  inset
                  @update:model-value="handleEnableChange"
                />
              </template>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col :cols="12">
          <v-select
            v-model="translationStore.type"
            :label="t('settings.translation.type')"
            :items="translation_types"
            item-title="title"
            item-value="value"
            variant="outlined"
            hide-details
          >
            <template #item="{ props }">
              <v-list-item v-bind="props">
                <template #append>
                  <v-icon icon="mdi-laptop" />
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
        <v-col :cols="12" :sm="6">
          <v-autocomplete
            v-model="source"
            :label="t('settings.translation.source')"
            :items="translation_options"
            item-title="title"
            item-value="value"
            auto-select-first
            :hint="`${t('settings.translation.speech_lang')}${stt_language}`"
            persistent-hint
            @update:model-value="translationStore.setSourceLanguage($event)"
          />
        </v-col>
        <v-col :cols="12" :sm="6">
          <v-autocomplete
            v-model="target"
            :label="t('settings.translation.target')"
            :items="translation_options"
            item-title="title"
            item-value="value"
            auto-select-first
            hide-details
            @update:model-value="translationStore.setTargetLanguage($event)"
          />
        </v-col>
        <v-col :cols="12">
          <v-card flat>
            <v-list-item :title="t('settings.translation.show_original')">
              <template #append>
                <v-switch
                  v-model="translationStore.show_original"
                  color="primary"
                  hide-details
                  inset
                />
              </template>
            </v-list-item>
          </v-card>
        </v-col>

        <!-- Afficher le statut du modèle s'il est en cours de téléchargement -->
        <v-col v-if="translationStore.download > 0 && translationStore.download < 100" :cols="12">
          <v-alert type="info" variant="tonal">
            {{ t('settings.translation.downloading') }}: {{ translationStore.download }}%
            <v-progress-linear
              v-model="translationStore.download"
              color="primary"
              height="6"
              striped
            />
          </v-alert>
        </v-col>

        <!-- Option pour re-traduire tous les logs existants -->
        <v-col v-if="translationStore.enabled" :cols="12">
          <v-btn
            color="secondary"
            variant="tonal"
            :disabled="translationStore.download > 0 && translationStore.download < 100"
            @click="translateAllPending"
          >
            {{ t('settings.translation.translate_all') }}
          </v-btn>
        </v-col>
      </v-row>
      <v-card-text v-else>
        <v-alert variant="outlined" type="warning" prominent>
          <v-alert-title>
            <i18n-t keypath="settings.translation.unsupported.text" tag="label" for="link" scope="global">
              <a class="text-primary pointer" @click="openURL('https://github.com/naeruru/mimiuchi/releases')">
                {{ t('settings.translation.unsupported.link') }}
              </a>
            </i18n-t>
          </v-alert-title>
        </v-alert>
      </v-card-text>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useTranslation } from '@/composables/useTranslation'
import translation_options from '@/constants/translation_options'
import is_electron from '@/helpers/is_electron'
import { useSpeechStore } from '@/stores/speech'
import { useTranslationStore } from '@/stores/translation'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const translationStore = useTranslationStore()
const speechStore = useSpeechStore()

// Utiliser le composable useTranslation
const { translateAllPending } = useTranslation()

const stt_language = computed(() => speechStore.stt.language)

// Refs pour maintenir la synchronisation bidirectionnelle
const source = ref(translationStore.source)
const target = ref(translationStore.target)

const translation_types = ref([
  {
    title: 'Transformers.js (BETA)',
    value: 'Transformers.js',
    type: 'local',
  },
])

// Initialise le modèle de traduction si la traduction est activée
function handleEnableChange(enabled: boolean) {
  if (enabled && is_electron()) {
    translationStore.initializeTranslation()
  }
}

onMounted(() => {
  // Initialiser le modèle de traduction si la traduction est activée
  if (translationStore.enabled && is_electron()) {
    translationStore.initializeTranslation()
  }
})

function openURL(url: string) {
  window.open(url, '_blank')
}
</script>
