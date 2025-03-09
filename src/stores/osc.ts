import { useOSC } from '@/composables/useOSC'
import { sendVRChatMessage, sendVRChatParameter, sendVRChatTypingIndicator } from '@/services/osc.service'
import { defineStore } from 'pinia'

interface Profile {
  [name: string]: Param[]
}
interface Param {
  ip: string
  port: string
  route: string
  keywords: Keyword[]
  assigns: Assign[]
}
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

/**
 * Store pour gérer les fonctionnalités OSC
 * Cette version utilise le composable useOSC et le service OSC
 */
export const useOSCStore = defineStore('osc', () => {
  // Utiliser le composable useOSC
  const {
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
    processParamTriggers,
  } = useOSC()

  /**
   * Envoie un message texte à VRChat
   * @param text Texte à envoyer
   * @param hideUI Masquer l'UI après l'envoi
   * @param playSound Jouer un son après l'envoi
   */
  function sendChatboxMessage(text: string, hideUI: boolean = true, playSound: boolean = true) {
    if (!osc_text.value) return false

    return sendVRChatMessage(
      text,
      ip.value,
      Number.parseInt(port.value),
      hideUI ? !show_keyboard.value : false,
      playSound ? sfx.value : false,
    )
  }

  /**
   * Envoie un indicateur de frappe
   * @param isTyping État de frappe (true = en train d'écrire)
   */
  function sendTyping(isTyping: boolean) {
    if (!text_typing.value) return false

    return sendVRChatTypingIndicator(isTyping, ip.value, Number.parseInt(port.value))
  }

  /**
   * Envoie un paramètre personnalisé
   * @param route Route OSC (ex: /avatar/parameters/MyParam)
   * @param value Valeur à envoyer
   */
  function sendParameter(route: string, value: any) {
    return sendVRChatParameter(route, value, ip.value, Number.parseInt(port.value))
  }

  /**
   * Analyse le texte pour détecter les commandes de paramètres
   * @param text Texte à analyser
   * @returns true si au moins un paramètre a été déclenché
   */
  function analyzeText(text: string): boolean {
    return processParamTriggers(text)
  }

  /**
   * Ajoute un nouveau profil
   * @param name Nom du profil
   * @returns true si le profil a été créé
   */
  function addProfile(name: string): boolean {
    if (osc_profiles.value[name]) return false

    osc_profiles.value[name] = []
    return true
  }

  /**
   * Supprime un profil
   * @param name Nom du profil
   * @returns true si le profil a été supprimé
   */
  function deleteProfile(name: string): boolean {
    if (name === 'Default' || !osc_profiles.value[name]) return false

    if (current_profile.value === name) {
      current_profile.value = 'Default'
    }

    delete osc_profiles.value[name]
    return true
  }

  /**
   * Renomme un profil
   * @param oldName Ancien nom
   * @param newName Nouveau nom
   * @returns true si le profil a été renommé
   */
  function renameProfile(oldName: string, newName: string): boolean {
    if (oldName === 'Default' || !osc_profiles.value[oldName] || osc_profiles.value[newName]) {
      return false
    }

    osc_profiles.value[newName] = osc_profiles.value[oldName]
    delete osc_profiles.value[oldName]

    if (current_profile.value === oldName) {
      current_profile.value = newName
    }

    return true
  }

  /**
   * Ajoute un paramètre à un profil
   * @param param Paramètre à ajouter
   * @param profileName Nom du profil (par défaut, profil actuel)
   */
  function addParam(param: Param, profileName: string = current_profile.value): boolean {
    if (!osc_profiles.value[profileName]) return false

    osc_profiles.value[profileName].push(param)
    return true
  }

  /**
   * Met à jour un paramètre existant
   * @param index Index du paramètre à mettre à jour
   * @param param Nouveau paramètre
   * @param profileName Nom du profil (par défaut, profil actuel)
   */
  function updateParam(index: number, param: Param, profileName: string = current_profile.value): boolean {
    if (!osc_profiles.value[profileName] || !osc_profiles.value[profileName][index]) return false

    osc_profiles.value[profileName][index] = param
    return true
  }

  /**
   * Supprime un paramètre
   * @param index Index du paramètre à supprimer
   * @param profileName Nom du profil (par défaut, profil actuel)
   */
  function deleteParam(index: number, profileName: string = current_profile.value): boolean {
    if (!osc_profiles.value[profileName] || !osc_profiles.value[profileName][index]) return false

    osc_profiles.value[profileName].splice(index, 1)
    return true
  }

  return {
    // État
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
    sendChatboxMessage,
    sendTyping,
    sendParameter,
    analyzeText,
    addProfile,
    deleteProfile,
    renameProfile,
    addParam,
    updateParam,
    deleteParam,
  }
})
