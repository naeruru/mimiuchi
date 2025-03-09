<template>
  <div class="speech-control-container">
    <v-card flat>
      <v-card-title>{{ t('speech_control.title') }}</v-card-title>

      <v-card-text>
        <!-- Statut de reconnaissance vocale -->
        <v-alert
          :color="listening ? 'success' : 'warning'"
          :icon="listening ? 'mdi-microphone' : 'mdi-microphone-off'"
          density="compact"
          variant="tonal"
          class="mb-4"
        >
          {{ listening ? t('speech_control.status.listening') : t('speech_control.status.not_listening') }}
        </v-alert>

        <!-- Contrôles principaux -->
        <v-row>
          <v-col>
            <v-btn
              :color="listening ? 'success' : 'error'"
              :prepend-icon="listening ? 'mdi-microphone' : 'mdi-microphone-off'"
              variant="tonal"
              block
              @click="toggleListening"
            >
              {{ listening ? t('speech_control.button.stop') : t('speech_control.button.start') }}
            </v-btn>
          </v-col>
        </v-row>

        <!-- Sélection de langue -->
        <v-row v-if="showLanguageSelector">
          <v-col>
            <v-autocomplete
              v-model="selectedLanguage"
              :label="t('speech_control.language.selector')"
              :items="availableLanguages"
              item-title="title"
              item-value="value"
              density="comfortable"
              variant="outlined"
              :loading="changingLanguage"
              @update:model-value="changeLanguage"
            >
              <template #prepend-item>
                <v-list-item
                  v-for="language in pinnedLanguages"
                  :key="language.value"
                  :title="language.title"
                  :value="language.value"
                  @click="selectedLanguage = language.value"
                >
                  <template #prepend>
                    <v-icon color="warning">
                      mdi-star
                    </v-icon>
                  </template>
                </v-list-item>
                <v-divider v-if="pinnedLanguages.length" class="mb-2" />
              </template>

              <template #item="{ item, props }">
                <v-list-item v-bind="props">
                  <template #append>
                    <v-btn
                      icon="mdi-star-outline"
                      variant="text"
                      size="small"
                      :color="isPinned(item.value) ? 'warning' : undefined"
                      @click.stop="togglePin(item.raw)"
                    />
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>

        <!-- Texte reconnu -->
        <v-row v-if="latestTranscript">
          <v-col>
            <v-card variant="outlined" class="pa-3">
              <div class="text-body-1">
                <strong>{{ t('speech_control.transcript.label') }}:</strong>
              </div>
              <div :class="{ 'text-grey': !isFinalTranscript }" class="mt-2">
                {{ latestTranscript }}
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useSpeech } from '@/composables/useSpeech'
import { WebSpeechLangs } from '@/modules/speech'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  showLanguageSelector: {
    type: Boolean,
    default: true,
  },
})
const emit = defineEmits(['transcript', 'speechStart', 'speechEnd', 'languageChange'])
const { t } = useI18n()
// Utiliser le composable useSpeech
const {
  stt,
  initialize_speech,
  toggle_listen,
  pinned_languages,
  pin_language,
  unpin_language,
  is_pinned_language,
} = useSpeech()

// État local
const listening = ref(false)
const changingLanguage = ref(false)
const latestTranscript = ref('')
const isFinalTranscript = ref(true)
const selectedLanguage = ref(stt.value.language)

// Langues disponibles pour la reconnaissance vocale
const availableLanguages = WebSpeechLangs

// Langues épinglées pour un accès rapide
const pinnedLanguages = computed(() => {
  return Object.values(pinned_languages.value)
})

// Vérifier si une langue est épinglée
function isPinned(languageCode: string) {
  return Object.values(pinned_languages.value).some(lang => lang.value === languageCode)
}

// Épingler/désépingler une langue
function togglePin(language: any) {
  if (isPinned(language.value)) {
    unpin_language(language)
  }
  else {
    pin_language(language)
  }
}

// Démarrer/arrêter la reconnaissance vocale
function toggleListening() {
  listening.value = toggle_listen()

  if (listening.value) {
    emit('speechStart')
  }
  else {
    emit('speechEnd')
  }
}

// Changer la langue de reconnaissance vocale
function changeLanguage(languageCode: string) {
  if (languageCode === stt.value.language) return

  changingLanguage.value = true

  // Arrêter la reconnaissance si elle est en cours
  if (listening.value) {
    toggle_listen()
    listening.value = false
  }

  // Changer la langue
  stt.value.language = languageCode

  // Réinitialiser la reconnaissance vocale
  initialize_speech(languageCode)

  // Émettre l'événement de changement de langue
  emit('languageChange', languageCode)

  changingLanguage.value = false
}

// Configurez les gestionnaires d'événements pour la reconnaissance vocale
onMounted(() => {
  // Initialiser la reconnaissance vocale
  initialize_speech(selectedLanguage.value)

  // Configurer les écouteurs d'événements pour capturer les résultats
  window.addEventListener('speech-result', (event: any) => {
    latestTranscript.value = event.detail.transcript
    isFinalTranscript.value = event.detail.isFinal

    // Émettre l'événement de transcription
    emit('transcript', {
      transcript: event.detail.transcript,
      isFinal: event.detail.isFinal,
    })
  })
})

// Nettoyer les écouteurs d'événements
onBeforeUnmount(() => {
  // Si la reconnaissance est en cours, l'arrêter
  if (listening.value) {
    toggle_listen()
  }

  // Supprimer les écouteurs d'événements
  window.removeEventListener('speech-result', () => {})
})
</script>

<style scoped>
.speech-control-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>
