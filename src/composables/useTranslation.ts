import is_electron from '@/helpers/is_electron'
import { useLogsStore } from '@/stores/logs'
import { ref } from 'vue'

/**
 * Composable pour gérer les fonctionnalités de traduction
 */
export function useTranslation() {
  const enabled = ref(false)
  const type = ref('Transformers.js')
  const source = ref('eng_Latn')
  const target = ref('jpn_Jpan')
  const download = ref(-1) // percent downloaded 0-100. -1 = done
  const show_original = ref(true)
  const translating = ref(false)

  // État temporaire pour les traductions en cours
  const pendingTranslations = ref(new Map())

  /**
   * Gestionnaire de messages reçus depuis le worker de traduction
   * @param data Données reçues depuis le worker
   */
  function onMessageReceived(data: any) {
    const logsStore = useLogsStore()

    switch (data.status) {
      case 'progress':
        // Suivi du téléchargement du modèle
        if (data.file === 'onnx/encoder_model_quantized.onnx')
          download.value = data.progress
        break

      case 'ready':
        // Modèle prêt à l'emploi
        download.value = -1
        break

      case 'update':
        // Mise à jour de la traduction en cours
        if (logsStore.logs[data.index]) {
          logsStore.logs[data.index].translation = data.output
          logsStore.loading_result = true
        }
        break

      case 'complete':
        // Traduction terminée
        translating.value = false

        if (logsStore.logs[data.index]) {
          logsStore.logs[data.index].translation = data.output[0].translation_text
          logsStore.logs[data.index].isTranslationFinal = true
          logsStore.loading_result = false

          // Déclencher des actions supplémentaires si nécessaire
          // Par exemple, mettre à jour l'interface ou envoyer à VRChat
        }

        // Traiter la traduction suivante dans la file si nécessaire
        processNextTranslation()
        break
    }
  }

  /**
   * Traduit un texte dans la langue cible
   * @param text Texte à traduire
   * @param index Index du log dans le store des logs
   * @returns Promise qui se résout lorsque la traduction est terminée
   */
  async function translateText(text: string, index: number): Promise<void> {
    if (!enabled.value || !text || !is_electron()) return

    // Enregistrer cette demande de traduction
    pendingTranslations.value.set(index, text)

    // Si aucune traduction n'est en cours, démarrer celle-ci
    if (!translating.value) {
      processNextTranslation()
    }
  }

  /**
   * Traite la prochaine traduction en attente
   */
  function processNextTranslation() {
    if (pendingTranslations.value.size === 0 || !is_electron()) return

    // Obtenir le premier élément de la file
    const [index, text] = pendingTranslations.value.entries().next().value

    // Supprimer cet élément de la file
    pendingTranslations.value.delete(index)

    // Marquer comme en cours de traduction
    translating.value = true

    // Envoyer au processus principal pour traduction
    const translationData = {
      text,
      src_lang: source.value,
      tgt_lang: target.value,
      index,
    }

    if (window.ipcRenderer) {
      window.ipcRenderer.send('transformers-translate', translationData)
    }
  }

  /**
   * Arrête toutes les traductions en cours
   */
  function cancelAllTranslations() {
    pendingTranslations.value.clear()
    translating.value = false

    if (is_electron() && window.ipcRenderer) {
      window.ipcRenderer.send('transformers-translate-cancel')
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
    // État
    enabled,
    type,
    source,
    target,
    download,
    show_original,
    translating,

    // Méthodes
    onMessageReceived,
    translateText,
    cancelAllTranslations,
    setSourceLanguage,
    setTargetLanguage,
  }
}
