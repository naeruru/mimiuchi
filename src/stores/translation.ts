import { useTranslation } from '@/composables/useTranslation'
import { getModelStatus, initTranslationModel, ModelStatus } from '@/services/translation.service'
import { useLogsStore } from '@/stores/logs'
import { defineStore } from 'pinia'

/**
 * Store pour gérer les fonctionnalités de traduction
 * Cette version utilise le composable useTranslation et le service de traduction
 */
export const useTranslationStore = defineStore('translation', () => {
  // Utiliser le composable useTranslation
  const {
    enabled,
    type,
    source,
    target,
    download,
    show_original,
    onMessageReceived,
  } = useTranslation()

  /**
   * Initialise le modèle de traduction
   */
  async function initializeTranslation() {
    if (!enabled.value) return

    try {
      await initTranslationModel((progress) => {
        download.value = progress
      })

      const modelStatus = getModelStatus()
      if (modelStatus.status === ModelStatus.READY) {
        download.value = -1
      }
    }
    catch (error) {
      console.error('Failed to initialize translation model:', error)
      enabled.value = false
    }
  }

  /**
   * Traduire un texte spécifique
   * @param text Texte à traduire
   * @param logIndex Index du log dans le store
   */
  async function translateText(text: string, logIndex: number) {
    const logsStore = useLogsStore()

    if (!enabled.value || !text) return

    try {
      // Marquer le log comme en cours de traduction
      if (logsStore.logs[logIndex]) {
        logsStore.logs[logIndex].translate = true
      }

      // Envoyer au processus principal pour traduction
      if (window.ipcRenderer) {
        window.ipcRenderer.send('transformers-translate', {
          text,
          src_lang: source.value,
          tgt_lang: target.value,
          index: logIndex,
        })
      }
    }
    catch (error) {
      console.error('Translation error:', error)

      // Réinitialiser l'état de traduction en cas d'erreur
      if (logsStore.logs[logIndex]) {
        logsStore.logs[logIndex].translate = false
      }
    }
  }

  /**
   * Traduire tous les logs non traduits
   */
  async function translateAllPending() {
    const logsStore = useLogsStore()

    for (let i = 0; i < logsStore.logs.length; i++) {
      const log = logsStore.logs[i]

      if (log.isFinal && !log.translate && !log.translation) {
        translateText(log.transcript, i)

        // Attendre un peu entre chaque traduction pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }

  /**
   * Change la langue source
   * @param lang Code de la langue source
   */
  function setSourceLanguage(lang: string) {
    source.value = lang
  }

  /**
   * Change la langue cible
   * @param lang Code de la langue cible
   */
  function setTargetLanguage(lang: string) {
    target.value = lang
  }

  return {
    enabled,
    type,
    source,
    target,
    download,
    show_original,
    onMessageReceived,
    initializeTranslation,
    translateText,
    translateAllPending,
    setSourceLanguage,
    setTargetLanguage,
  }
})
