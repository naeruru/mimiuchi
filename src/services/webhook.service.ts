/**
 * Service pour l'envoi de webhooks
 * Ce service fournit une interface pour envoyer des données à des services externes via HTTP
 */

/**
 * Options pour les requêtes webhook
 */
interface WebhookOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  timeout?: number
  retries?: number
}

/**
 * État de la dernière requête
 */
interface RequestStatus {
  success: boolean
  statusCode?: number
  response?: any
  error?: Error
  timestamp: number
}

// État global du service
const lastRequestStatus: RequestStatus = {
  success: false,
  timestamp: 0,
}

/**
 * Envoie une requête HTTP à une URL avec les données spécifiées
 * @param url URL du webhook
 * @param data Données à envoyer
 * @param options Options de la requête
 * @returns Promesse résolvant à la réponse du serveur
 */
export async function sendWebhook(url: string, data: any, options: WebhookOptions = {}): Promise<any> {
  const {
    method = 'POST',
    headers = { 'Content-Type': 'application/json' },
    timeout = 10000,
    retries = 0,
  } = options

  // Convertir les données en JSON si nécessaire
  const body = typeof data === 'string' ? data : JSON.stringify(data)

  try {
    // Créer un contrôleur d'abandon pour le timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    // Envoyer la requête
    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
    })

    // Annuler le timeout
    clearTimeout(timeoutId)

    // Analyser la réponse
    let responseData
    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      responseData = await response.json()
    }
    else {
      responseData = await response.text()
    }

    // Mettre à jour le statut
    lastRequestStatus.success = response.ok
    lastRequestStatus.statusCode = response.status
    lastRequestStatus.response = responseData
    lastRequestStatus.timestamp = Date.now()

    // Retourner ou lancer une erreur selon le statut HTTP
    if (!response.ok) {
      throw new Error(`Webhook request failed with status ${response.status}: ${JSON.stringify(responseData)}`)
    }

    return responseData
  }
  catch (error: any) {
    // Mettre à jour le statut d'erreur
    lastRequestStatus.success = false
    lastRequestStatus.error = error
    lastRequestStatus.timestamp = Date.now()

    // Retenter si des tentatives sont encore disponibles
    if (retries > 0) {
      // Attendre un peu avant de réessayer (stratégie de backoff exponentiel)
      const delay = 1000 * 2 ** (options.retries! - retries)
      await new Promise(resolve => setTimeout(resolve, delay))

      return sendWebhook(url, data, {
        ...options,
        retries: retries - 1,
      })
    }

    throw error
  }
}

/**
 * Envoie une notification de texte via webhook
 * @param url URL du webhook
 * @param text Texte à envoyer
 * @param isFinal Indique si c'est le résultat final ou intermédiaire
 * @returns Promesse résolvant à la réponse du serveur
 */
export async function sendTextNotification(url: string, text: string, isFinal: boolean = true): Promise<any> {
  return sendWebhook(url, {
    transcript: text,
    isFinal,
    timestamp: Date.now(),
  })
}

/**
 * Obtient le statut de la dernière requête
 * @returns État de la dernière requête
 */
export function getLastRequestStatus(): RequestStatus {
  return { ...lastRequestStatus }
}

/**
 * Vérifie si une URL est valide
 * @param url URL à vérifier
 * @returns true si l'URL est valide, false sinon
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  }
  catch {
    return false
  }
}
