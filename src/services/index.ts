/**
 * Services centralisés pour l'application Mimiuchi
 * Ce fichier exporte tous les services pour faciliter l'importation
 */

// Services OSC
export * from './osc.service'

// Services de traduction
export * from './translation.service'

// Services Webhook
export * from './webhook.service'

/**
 * Liste des services disponibles pour référence
 */
export const AVAILABLE_SERVICES = {
  OSC: 'osc',
  WEBHOOK: 'webhook',
  TRANSLATION: 'translation',
}
