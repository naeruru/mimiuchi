import is_electron from '@/helpers/is_electron'
import { computed, ref } from 'vue'

interface Keyword {
  enabled: boolean
  text: string
}

interface Assign {
  keyword: string
  type: string
  set1: string
  set2: string
  activation: string
  pulse_duration: number
}

interface Param {
  ip: string
  port: string
  route: string
  keywords: Keyword[]
  assigns: Assign[]
}

interface Profile {
  [name: string]: Param[]
}

declare const window: any

/**
 * Composable pour gérer les fonctionnalités OSC
 */
export function useOSC() {
  // Configuration générale OSC
  const ip = ref('127.0.0.1')
  const port = ref('9000')
  const osc_text = ref(true)
  const text_typing = ref(true)
  const stt_typing = ref(true)
  const sfx = ref(true)
  const show_keyboard = ref(false)

  // Gestion des profils et paramètres OSC
  const osc_profiles = ref<Profile>({ Default: [] })
  const current_profile = ref<string>('Default')

  // Files d'attente pour les messages
  const messageQueue = ref<any[]>([])
  const isSending = ref(false)

  /**
   * Envoie un message OSC à VRChat
   * @param route Route OSC
   * @param value Valeur à envoyer
   */
  function sendMessage(route: string, value: any) {
    if (!is_electron()) return false

    window.ipcRenderer?.send('send-param-event', {
      ip: ip.value,
      port: Number.parseInt(port.value),
      route,
      value,
    })

    return true
  }

  /**
   * Envoie un message texte à VRChat via OSC
   * @param text Texte à envoyer
   * @param hide_ui Masquer l'UI du clavier après envoi
   * @param play_sfx Jouer un effet sonore
   */
  function sendText(text: string, hide_ui: boolean = true, play_sfx: boolean = true) {
    if (!is_electron() || !osc_text.value) return false

    const data = {
      transcript: text,
      hide_ui: hide_ui ? !show_keyboard.value : false,
      sfx: play_sfx ? sfx.value : false,
    }

    window.ipcRenderer?.send('send-text-event', JSON.stringify(data))
    return true
  }

  /**
   * Envoie un message d'indication de frappe
   * @param isTyping État de frappe (true = en train de taper)
   */
  function sendTypingIndicator(isTyping: boolean) {
    if (!is_electron() || !text_typing.value) return false

    return sendMessage('/chatbox/typing', isTyping)
  }

  /**
   * Ajoute un nouveau profil OSC
   * @param name Nom du profil
   * @returns true si le profil a été créé, false s'il existe déjà
   */
  function addProfile(name: string): boolean {
    if (osc_profiles.value[name]) return false

    osc_profiles.value[name] = []
    return true
  }

  /**
   * Renomme un profil OSC
   * @param oldName Ancien nom du profil
   * @param newName Nouveau nom du profil
   * @returns true si le profil a été renommé, false sinon
   */
  function renameProfile(oldName: string, newName: string): boolean {
    if (!osc_profiles.value[oldName] || osc_profiles.value[newName]) return false

    osc_profiles.value[newName] = osc_profiles.value[oldName]
    delete osc_profiles.value[oldName]

    // Mettre à jour current_profile si nécessaire
    if (current_profile.value === oldName) {
      current_profile.value = newName
    }

    return true
  }

  /**
   * Supprime un profil OSC
   * @param name Nom du profil à supprimer
   * @returns true si le profil a été supprimé, false sinon
   */
  function deleteProfile(name: string): boolean {
    if (!osc_profiles.value[name] || name === 'Default') return false

    delete osc_profiles.value[name]

    // Revenir au profil par défaut si le profil actuel est supprimé
    if (current_profile.value === name) {
      current_profile.value = 'Default'
    }

    return true
  }

  /**
   * Ajoute un paramètre OSC à un profil
   * @param profileName Nom du profil
   * @param param Paramètre à ajouter
   * @returns true si le paramètre a été ajouté, false sinon
   */
  function addParam(profileName: string, param: Param): boolean {
    if (!osc_profiles.value[profileName]) return false

    osc_profiles.value[profileName].push(param)
    return true
  }

  /**
   * Met à jour un paramètre OSC dans un profil
   * @param profileName Nom du profil
   * @param index Index du paramètre
   * @param param Paramètre mis à jour
   * @returns true si le paramètre a été mis à jour, false sinon
   */
  function updateParam(profileName: string, index: number, param: Param): boolean {
    if (!osc_profiles.value[profileName] || !osc_profiles.value[profileName][index]) return false

    osc_profiles.value[profileName][index] = param
    return true
  }

  /**
   * Supprime un paramètre OSC d'un profil
   * @param profileName Nom du profil
   * @param index Index du paramètre
   * @returns true si le paramètre a été supprimé, false sinon
   */
  function deleteParam(profileName: string, index: number): boolean {
    if (!osc_profiles.value[profileName] || !osc_profiles.value[profileName][index]) return false

    osc_profiles.value[profileName].splice(index, 1)
    return true
  }

  /**
   * Traite le texte pour détecter les déclencheurs de paramètres
   * @param input Texte à analyser
   * @returns true si au moins un paramètre a été déclenché, false sinon
   */
  function processParamTriggers(input: string): boolean {
    if (!is_electron() || !current_profile.value) return false

    let paramTriggered = false

    osc_profiles.value[current_profile.value].forEach((param) => {
      let matchedKey: RegExpExecArray | null = null

      // Vérifier si un mot-clé correspond
      param.keywords.forEach((keyword) => {
        if (matchedKey || !keyword.enabled) return

        const keyRegex = new RegExp(`(^|\\s)(${keyword.text})($|[^a-zA-Z\\d])`, 'gi')
        matchedKey = keyRegex.exec(input)
      })

      // Si un mot-clé correspond, vérifier les assignations
      if (matchedKey) {
        param.assigns.forEach((assign) => {
          const assignRegex = new RegExp(`(^|\\s)(${assign.keyword})($|[^a-zA-Z\\d])`, 'gi')
          const matchesAssign = assignRegex.exec(input)

          if (matchesAssign) {
            // Traiter l'assignation
            executeAssignment(param, assign)
            paramTriggered = true
          }
        })
      }
    })

    return paramTriggered
  }

  /**
   * Exécute une assignation de paramètre
   * @param param Paramètre à modifier
   * @param assign Assignation à exécuter
   */
  function executeAssignment(param: Param, assign: Assign) {
    let value: number | boolean | null = null

    // Convertir la valeur selon le type
    switch (assign.type) {
      case 'int':
      case 'float':
        value = Number(assign.set1)
        break
      case 'bool':
        value = assign.set1 === 'true'
        break
    }

    // Envoyer le paramètre
    sendMessage(param.route, value)

    // Si c'est une pulsation, programmer le retour à la valeur d'origine
    if (assign.activation === 'pulse') {
      setTimeout(() => {
        let resetValue: number | boolean | null = null

        switch (assign.type) {
          case 'int':
          case 'float':
            resetValue = Number(assign.set2)
            break
          case 'bool':
            resetValue = assign.set2 === 'true'
            break
        }

        sendMessage(param.route, resetValue)
      }, assign.pulse_duration)
    }
  }

  /**
   * Retourne les profils triés (Default en premier)
   */
  const sortedProfiles = computed(() => {
    return Object.keys(osc_profiles.value).sort((a, b) => {
      if (a === 'Default') return -1
      if (b === 'Default') return 1
      return a.localeCompare(b)
    })
  })

  return {
    // États
    ip,
    port,
    osc_text,
    text_typing,
    stt_typing,
    sfx,
    show_keyboard,
    osc_profiles,
    current_profile,
    sortedProfiles,

    // Méthodes
    sendMessage,
    sendText,
    sendTypingIndicator,
    addProfile,
    renameProfile,
    deleteProfile,
    addParam,
    updateParam,
    deleteParam,
    processParamTriggers,
  }
}
