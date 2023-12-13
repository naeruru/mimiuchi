import { defineStore } from 'pinia'

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

export const useConnectionStore = defineStore('connections', {
  state: () => ({
    ws: {
      enabled: true,
      // name: i18n.t('settings.connections.ws.name'),
      icon: 'mdi-transit-connection-horizontal',
      // description: i18n.t('settings.connections.ws.description'),
      type: 'websocket',
      url: '127.0.0.1:7714',
      port: 7714, // ミ・ミ・ウ・チ
    } as Connection,
    wh: {
      enabled: false,
      icon: 'mdi-webhook',
      type: 'webhook',
      url: '',
    } as Connection,
  }),
  getters: {

  },
  actions: {

  },
})
