import type { WebSpeech } from '@/modules/speech'
import type { Log } from '@/stores/logs'
import is_electron from '@/helpers/is_electron'
import { ref } from 'vue'

export interface ListItem {
  title: string
  value: string
}

export interface Voice {
  lang: string
  name: string
  local_service: boolean
}

export interface PinnedLanguages {
  [key: string]: ListItem
}

declare const window: any

/**
 * Composable pour gérer les fonctionnalités de reconnaissance vocale et de synthèse vocale
 */
export function useSpeech() {
  const listening = ref(false)
  const listening_error = ref(false)
  const speech = ref<WebSpeech | null>(null)
  const audio = ref<HTMLAudioElement>(new Audio())

  // STT (Speech-to-Text)
  const stt = ref({
    type: {
      title: 'Web Speech API',
      value: 'webspeech',
    },
    language: 'en-US',
    confidence: 0.9,
    sensitivity: 0.0,
  })

  // TTS (Text-to-Speech)
  const tts = ref({
    enabled: false,
    type: 'tiktok',
    voice: '',
    rate: 1,
    pitch: 1,
  })

  const pinned_languages = ref<PinnedLanguages>({})

  /**
   * Initialise le moteur de reconnaissance vocale
   * @param language Langue à utiliser pour la reconnaissance
   */
  function initialize_speech(language: string) {
    if (typeof window !== 'undefined' && window.WebSpeech) {
      speech.value = new WebSpeech(language)
    }
  }

  /**
   * Active/désactive la reconnaissance vocale
   */
  function toggle_listen() {
    if (!speech.value || !speech.value.recognition) {
      listening_error.value = true
      return false
    }

    if (listening.value) {
      stop_listening()
    }
    else {
      start_listening()
    }

    return listening.value
  }

  /**
   * Démarre la reconnaissance vocale
   */
  function start_listening() {
    if (!speech.value) return

    listening.value = true
    listening_error.value = false

    speech.value.start()
  }

  /**
   * Arrête la reconnaissance vocale
   */
  function stop_listening() {
    if (!speech.value) return

    listening.value = false
    speech.value.stop()
  }

  /**
   * Envoie un événement de frappe (pour les indicateurs de frappe dans VRChat)
   * @param typing État de la frappe (true = en train d'écrire)
   */
  function typing_event(typing: boolean) {
    if (is_electron() && window.ipcRenderer) {
      window.ipcRenderer.send('typing-text-event', typing)
    }
  }

  /**
   * Soumet du texte pour traitement
   * @param text Texte à soumettre
   * @param index Index dans le tableau des logs
   * @param isFinal Indique si c'est la version finale du texte
   */
  function submit_text(text: string, index: number, isFinal: boolean) {
    // Cette fonction doit être implémentée en fonction de votre logique métier
    // Elle interagira probablement avec d'autres stores ou services
  }

  /**
   * Prononce le texte via la synthèse vocale
   * @param input Texte à prononcer
   */
  async function speak(input: string) {
    switch (tts.value.type) {
      case 'webspeech':
        if (speech.value) {
          speech.value.speak(input)
        }
        break

      // D'autres types de TTS peuvent être ajoutés ici (tiktok, yukumo, etc.)
      // Ces implémentations devraient être déplacées vers un service dédié
    }
  }

  /**
   * Traite un log de reconnaissance vocale
   * @param log Log à traiter
   * @param index Index du log
   */
  function on_submit(log: Log, index: number) {
    // Implémentation de la logique de traitement des logs
    // Cette fonction sera appelée lorsqu'un log est prêt à être traité
  }

  /**
   * Charge les voix disponibles pour un type de TTS spécifique
   * @param option Type de TTS ('tiktok', 'webspeech', 'yukumo', etc.)
   * @returns Liste des voix disponibles
   */
  function load_voices(option: string): Voice[] {
    const voices: Voice[] = []

    // Chargement des voix en fonction du type de TTS
    // Cette logique pourrait être déplacée vers un service dédié

    return voices
  }

  /**
   * Épingle une langue pour un accès rapide
   * @param selected_language Langue à épingler
   */
  function pin_language(selected_language: ListItem) {
    // Épingle la langue spécifiée
    pinned_languages.value[selected_language.title] = selected_language

    // Tri alphabétique des langues épinglées
    const sortedKeys = Object.keys(pinned_languages.value).sort()
    const sortedPins = {} as PinnedLanguages

    sortedKeys.forEach((key) => {
      sortedPins[key] = pinned_languages.value[key]
    })

    pinned_languages.value = sortedPins
  }

  /**
   * Désépingle une langue
   * @param selected_language Langue à désépingler
   */
  function unpin_language(selected_language: ListItem) {
    delete pinned_languages.value[selected_language.title]
  }

  /**
   * Vérifie si une langue est épinglée
   * @param selected_language Langue à vérifier
   * @returns true si la langue est épinglée, false sinon
   */
  function is_pinned_language(selected_language: ListItem) {
    return pinned_languages.value.hasOwnProperty(selected_language.title)
  }

  return {
    listening,
    listening_error,
    speech,
    audio,
    stt,
    tts,
    pinned_languages,
    initialize_speech,
    toggle_listen,
    start_listening,
    stop_listening,
    typing_event,
    submit_text,
    speak,
    on_submit,
    load_voices,
    pin_language,
    unpin_language,
    is_pinned_language,
  }
}
