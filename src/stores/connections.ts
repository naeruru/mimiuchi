import { defineStore } from 'pinia'
import { ref } from 'vue'

// import { i18n } from '../plugins/i18n'

export interface Connection {
  enabled: boolean
  // name: string,
  icon: string
  // description: string,
  type: string // websocket, webhook, obs, vrchat
  url: string
  port: number | null
}

export interface ConnectionType {
  title?: string
  type?: string
  icon?: string
}

export const useConnectionsStore = defineStore('connections', () => {
  const ws = ref<Connection>({
    enabled: true,
    icon: 'mdi-transit-connection-horizontal',
    type: 'websocket',
    url: '127.0.0.1:7714',
    port: 7714, // ミ・ミ・ウ・チ
    // description: i18n.t('settings.connections.ws.description'),
    // name: i18n.t('settings.connections.ws.name'),
  })

  const wh = ref<Connection>({
    enabled: false,
    icon: 'mdi-webhook',
    type: 'webhook',
    url: '',
    port: null,
  })

  return { ws, wh }
})
