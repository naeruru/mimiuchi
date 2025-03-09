/**
 * Service pour la traduction de texte
 * Ce service fournit une interface pour traduire du texte avec différents moteurs
 */

interface TranslationOptions {
  sourceLanguage: string
  targetLanguage: string
  model?: string
  callback?: (update: any) => void
}

/**
 * Résultat de traduction
 */
interface TranslationResult {
  originalText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  confidence?: number
  model: string
}

/**
 * État du modèle de traduction
 */
export enum ModelStatus {
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error',
}

// État du service
let modelStatus = ModelStatus.LOADING
let modelLoadProgress = 0

/**
 * Démarre le téléchargement du modèle de traduction
 * @param callback Fonction de rappel pour les mises à jour de chargement
 */
export async function initTranslationModel(callback?: (progress: number) => void): Promise<void> {
  if (typeof window === 'undefined' || !window.ipcRenderer) {
    modelStatus = ModelStatus.ERROR
    throw new Error('Translation service requires Electron runtime')
  }

  // S'abonner aux événements de mise à jour du modèle
  window.ipcRenderer.on('transformers-translate-render', (event: any, data: any) => {
    if (data.status === 'progress') {
      modelLoadProgress = data.progress
      callback?.(modelLoadProgress)
    }
    else if (data.status === 'ready') {
      modelStatus = ModelStatus.READY
      modelLoadProgress = 100
      callback?.(100)
    }
  })

  // Initialiser le modèle en envoyant un message au processus principal
  window.ipcRenderer.send('transformers-translate-init')
}

/**
 * Traduit un texte avec Transformers.js
 * @param text Texte à traduire
 * @param options Options de traduction
 * @returns Promesse résolvant à un objet contenant le texte traduit
 */
export function translateWithTransformers(
  text: string,
  options: TranslationOptions,
): Promise<TranslationResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.ipcRenderer) {
      reject(new Error('Translation service requires Electron runtime'))
      return
    }

    if (modelStatus !== ModelStatus.READY) {
      reject(new Error('Translation model is not ready yet'))
      return
    }

    const translationId = `translation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Configurer un écouteur de réponse unique pour cette traduction
    const responseHandler = (event: any, data: any) => {
      if (data.id !== translationId) return

      // Appeler le callback pour les mises à jour progressives
      if (data.status === 'update') {
        options.callback?.(data)
        return
      }

      // Traitement terminé
      if (data.status === 'complete') {
        window.ipcRenderer.removeListener('transformers-translate-render', responseHandler)

        resolve({
          originalText: text,
          translatedText: data.output[0].translation_text,
          sourceLanguage: options.sourceLanguage,
          targetLanguage: options.targetLanguage,
          model: 'Transformers.js',
        })
      }
    }

    // S'abonner aux événements de résultat
    window.ipcRenderer.on('transformers-translate-render', responseHandler)

    // Envoyer la demande de traduction
    window.ipcRenderer.send('transformers-translate', {
      text,
      src_lang: options.sourceLanguage,
      tgt_lang: options.targetLanguage,
      id: translationId,
    })

    // Configurer un timeout pour éviter de bloquer indéfiniment
    setTimeout(() => {
      window.ipcRenderer.removeListener('transformers-translate-render', responseHandler)
      reject(new Error('Translation request timed out after 30 seconds'))
    }, 30000)
  })
}

/**
 * Obtient l'état actuel du modèle de traduction
 * @returns État actuel du modèle et pourcentage de chargement
 */
export function getModelStatus(): { status: ModelStatus, progress: number } {
  return {
    status: modelStatus,
    progress: modelLoadProgress,
  }
}

/**
 * Liste des langues supportées avec leur code
 * @param filterFn Fonction de filtrage optionnelle
 * @returns Liste des langues supportées
 */
export function getSupportedLanguages(filterFn?: (lang: { title: string, value: string }) => boolean): { title: string, value: string }[] {
  // Liste partielle des langues les plus communes
  // Dans une implémentation réelle, cette liste serait beaucoup plus complète
  const languages = [
    { title: 'English', value: 'eng_Latn' },
    { title: 'French', value: 'fra_Latn' },
    { title: 'Spanish', value: 'spa_Latn' },
    { title: 'German', value: 'deu_Latn' },
    { title: 'Italian', value: 'ita_Latn' },
    { title: 'Japanese', value: 'jpn_Jpan' },
    { title: 'Chinese (Simplified)', value: 'zho_Hans' },
    { title: 'Chinese (Traditional)', value: 'zho_Hant' },
    { title: 'Korean', value: 'kor_Hang' },
    { title: 'Russian', value: 'rus_Cyrl' },
    { title: 'Portuguese', value: 'por_Latn' },
    { title: 'Arabic', value: 'arb_Arab' },
    { title: 'Dutch', value: 'nld_Latn' },
    { title: 'Hindi', value: 'hin_Deva' },
    { title: 'Swedish', value: 'swe_Latn' },
  ]

  return filterFn ? languages.filter(filterFn) : languages
}
