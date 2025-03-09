/**
 * Service pour la communication OSC
 * Ce service fournit une interface pour envoyer des messages OSC
 * à d'autres applications comme VRChat.
 */

import is_electron from '@/helpers/is_electron'

// Déclaration des types
let Bundle: any
let Client: any

// Fonction pour charger node-osc en toute sécurité
function loadNodeOSC() {
  // Vérifie si nous sommes dans Electron et si window.require existe
  if (is_electron() && typeof window !== 'undefined' && 'require' in window) {
    try {
      // Utilise window.require qui est disponible dans Electron
      const nodeOsc = (window as any).require('node-osc')
      Bundle = nodeOsc.Bundle
      Client = nodeOsc.Client
      console.log('node-osc loaded successfully')
      return true
    }
    catch (e) {
      console.error('Failed to load node-osc:', e)
    }
  }
  return false
}

// Tentative de chargement de node-osc
const oscLoaded = loadNodeOSC()

/**
 * Émet un message OSC vers l'IP et le port spécifiés
 * @param value Valeur à envoyer (tableau contenant la route et les arguments)
 * @param ip Adresse IP de destination
 * @param port Port de destination
 * @returns true si le message a été envoyé, false sinon
 */
export function emitOSC(value: any, ip: string = '127.0.0.1', port: number = 9000): boolean {
  if (!oscLoaded) {
    console.warn('OSC functionality is only available in Electron environment')
    return false
  }

  try {
    const bundle = new Bundle(value)
    const client = new Client(ip, port)
    client.send(bundle)
    console.log(`${value[0]} -> ${value[1]}`)

    // Fermer le client après l'envoi pour éviter des fuites de mémoire
    client.close()
    return true
  }
  catch (error) {
    console.error('Error sending OSC message:', error)
    return false
  }
}

/**
 * Envoie un message texte à VRChat
 * @param text Texte à envoyer
 * @param ip Adresse IP de destination
 * @param port Port de destination
 * @param hideUI Cacher l'UI après l'envoi
 * @param playSound Jouer un son après l'envoi
 * @returns true si le message a été envoyé, false sinon
 */
export function sendVRChatMessage(text: string, ip: string = '127.0.0.1', port: number = 9000, hideUI: boolean = true, playSound: boolean = true): boolean {
  return emitOSC(['/chatbox/input', text, hideUI, playSound], ip, port)
}

/**
 * Envoie un indicateur de frappe à VRChat
 * @param isTyping État de frappe (true = en train d'écrire)
 * @param ip Adresse IP de destination
 * @param port Port de destination
 * @returns true si le message a été envoyé, false sinon
 */
export function sendVRChatTypingIndicator(isTyping: boolean, ip: string = '127.0.0.1', port: number = 9000): boolean {
  return emitOSC(['/chatbox/typing', isTyping], ip, port)
}

/**
 * Envoie une série de messages avec délai entre chaque
 * @param queue File de messages à envoyer
 * @param ip Adresse IP de destination
 * @param port Port de destination
 * @param hideUI Cacher l'UI après l'envoi
 * @param playSound Jouer un son après l'envoi
 * @param seconds Délai entre chaque message
 * @returns true si le premier message a été envoyé, false sinon
 */
export function sendMessageQueue(queue: string[], ip: string = '127.0.0.1', port: number = 9000, hideUI: boolean = true, playSound: boolean = true, seconds: number = 8): boolean {
  if (!queue.length) return false

  // Envoyer le premier message
  const success = sendVRChatMessage(queue.length > 1 ? `${queue[0]} ...` : queue[0], ip, port, hideUI, playSound)
  queue.shift()

  // S'il reste des messages, programmer leur envoi
  if (queue.length && success) {
    setTimeout(() => sendVRChatTypingIndicator(true, ip, port), 400)
    setTimeout(() => sendMessageQueue(queue, ip, port, hideUI, playSound, seconds), seconds * 1000)
  }

  return success
}

/**
 * Envoie un paramètre à VRChat (pour avatars)
 * @param route Route OSC (par exemple '/avatar/parameters/MyParam')
 * @param value Valeur à envoyer
 * @param ip Adresse IP de destination
 * @param port Port de destination
 * @returns true si le message a été envoyé, false sinon
 */
export function sendVRChatParameter(route: string, value: any, ip: string = '127.0.0.1', port: number = 9000): boolean {
  return emitOSC([route, value], ip, port)
}

/**
 * Envoie un message de pulsation pour un paramètre
 * @param route Route OSC
 * @param value1 Première valeur
 * @param value2 Seconde valeur (après le délai)
 * @param duration Durée en ms avant de revenir à la seconde valeur
 * @param ip Adresse IP de destination
 * @param port Port de destination
 * @returns true si le premier message a été envoyé, false sinon
 */
export function sendVRChatPulse(route: string, value1: any, value2: any, duration: number, ip: string = '127.0.0.1', port: number = 9000): boolean {
  // Envoyer la première valeur
  const success = sendVRChatParameter(route, value1, ip, port)

  // Programmer l'envoi de la seconde valeur après le délai
  if (success) {
    setTimeout(() => {
      sendVRChatParameter(route, value2, ip, port)
    }, duration)
  }

  return success
}
