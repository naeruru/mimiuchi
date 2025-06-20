import { defineStore } from 'pinia'
import { ref } from 'vue'
import OBSWebSocket from 'obs-websocket-js'
import { useDefaultStore } from './default'
import { i18n } from '@/plugins/i18n'
import is_electron from '@/helpers/is_electron'

export type ConnectionTypes = 'webhook' | 'websocket' | 'obs' | 'websocketserver'

export class PropsWebSocket {
  address: string = ''
  port: number = 80
}

export class PropsOBS extends PropsWebSocket {
  password: string = '' // The password to authenticate with the OBS WebSocket Server
  source_text: string = '' // Text source name
}

export class PropsWebhook {
  address_full: string = ''
}

interface PropsWebSocketServer {
  port: number
}

export class Connection {
  // Display
  enabled: boolean
  icon: string
  title: string
  type: ConnectionTypes

  // Connection dialog flags
  edit_hide_title?: boolean

  // type-specific properties
  websocket?: PropsWebSocket
  obs?: PropsOBS
  webhook?: PropsWebhook
  websocketserver?: PropsWebSocketServer

  constructor() {
    this.enabled = false
    this.icon = 'mdi-transit-connection-horizontal'
    this.title = ''
    this.type = 'websocket'
    this.websocket = new PropsWebSocket()
  }
}

export interface TypeDisplayData {
  display: string
  selectable: boolean
}

interface TypeDisplays {
  [key: string]: TypeDisplayData
}

export const useConnectionsStore = defineStore('connections', () => {
  const types: TypeDisplays = {
    websocket: {
      display: 'WebSocket',
      selectable: true,
    },
    obs: {
      display: 'Open Broadcaster Software (OBS) WebSocket',
      selectable: false,
    },
    webhook: {
      display: 'Webhook',
      selectable: true,
    },
    websocketserver: {
      display: 'WebSocket Server',
      selectable: false,
    },
  }

  // Core connections

  // The mimiuchi desktop application's WebSocket server
  // The mimiuchi website application connects to this WebSocket server
  // Preset. Users cannot create, delete or edit it
  const core_mimiuchi_websocketserver_init: Connection = {
    enabled: true,
    icon: 'mdi-server',
    title: 'mimiuchi Desktop Server',
    type: 'websocketserver',
    websocketserver: {
      port: 7714, // ミ・ミ・ウ・チ
    },
  }

  const core_mimiuchi_websocketserver = ref(structuredClone(core_mimiuchi_websocketserver_init))

  // Connects the mimiuchi website application to the mimiuchi desktop application
  // Preset. Users cannot create, delete or edit it
  const core_mimiuchi_websocket_init: Connection = {
    enabled: true,
    icon: 'mdi-transit-connection-horizontal',
    title: 'mimiuchi Desktop',
    type: 'websocket',
    websocket: {
      address: '127.0.0.1',
      port: core_mimiuchi_websocketserver.value.websocketserver!.port,
    },
  }

  const core_mimiuchi_websocket = ref(structuredClone(core_mimiuchi_websocket_init))

  // Connects the mimiuchi website application to an Open Broadcaster Software (OBS) WebSocket server
  // Preset. Users cannot create, delete or edit it
  const core_obs_init: Connection = {
    enabled: false,
    icon: 'mdi-transit-connection-horizontal',
    title: 'Open Broadcaster Software (OBS)',
    type: 'obs',
    edit_hide_title: true,
    obs: {
      address: '127.0.0.1',
      port: 4455,
      password: '',
      source_text: '',
    },
  }

  const core_obs = ref<Connection>(structuredClone(core_obs_init))

  // User-defined connections
  const user_websockets = ref<Connection[]>([])
  const user_webhooks = ref<Connection[]>([]) // user_websockets and open.user_websockets have parallel indices

  // Open connections
  const open: {
    mimiuchi_websocket: (WebSocket | null | undefined)
    obs_websocket: (OBSWebSocket | null | undefined)
    user_websockets: (WebSocket | null)[]
  } = {
    mimiuchi_websocket: null,
    obs_websocket: null,
    user_websockets: [],
  }

  function reset() {
    core_mimiuchi_websocketserver.value = structuredClone(core_mimiuchi_websocketserver_init)
    core_mimiuchi_websocket.value = structuredClone(core_mimiuchi_websocket_init)
    core_obs.value = structuredClone(core_obs_init)
    user_websockets.value = []
    user_webhooks.value = []
  }

  // Returns a string that represents a WebSocket address
  function render_websocketaddress(address: string, port: number) {
    let rendered_address: string = address

    if (rendered_address.includes(':')) rendered_address = `[${rendered_address}]` // IPv6 address handling

    return `ws://${rendered_address}:${port}`
  }

  // Returns a reference to a WebSocket
  function connect_websocket(connection: Connection, user_connection_id?: number) {
    const defaultStore = useDefaultStore()
    let new_connection: WebSocket | null
    const rendered_address = render_websocketaddress(connection.websocket!.address, connection.websocket!.port)

    try {
      new_connection = new WebSocket(rendered_address)

      new_connection.onopen = () => {
        defaultStore.show_snackbar('success', `${i18n.t('snackbar.connections.websocket.opened')} (${rendered_address})`)
        defaultStore.broadcasting = true
        defaultStore.connections_count += 1
      }

      new_connection.onmessage = (event: any) => {
        const msg = JSON.parse(event.data)
        if (msg.event === 'connect' && msg.version !== __APP_VERSION__)
          defaultStore.show_snackbar('error', i18n.t('snackbar.version_mismatch'))
      }

      new_connection.onclose = (event) => {
        console.log(`WebSocket closed. (${rendered_address})`)

        if (defaultStore.broadcasting)
          defaultStore.show_snackbar('info', `${i18n.t('snackbar.connections.websocket.closed')} (${rendered_address}): ${event.reason}`)

        if (user_connection_id === undefined)
          new_connection = null
        else
          open.user_websockets[user_connection_id] = null

        if (event.wasClean && [1000, 1001].includes(event.code))
          defaultStore.connections_count -= 1
      }

      new_connection.onerror = (event) => {
        console.error(event)
      }

      return new_connection
    }
    catch (error) {
      console.error(error)
    }
  }

  // Returns a reference to a OBSWebSocket
  async function connect_websocket_obs(connection: Connection) {
    const defaultStore = useDefaultStore()
    let new_connection: OBSWebSocket
    const rendered_address = render_websocketaddress(connection.obs!.address, connection.obs!.port)

    try {
      new_connection = new OBSWebSocket()

      defaultStore.connections_count += 1

      new_connection.on('ConnectionOpened', () => {
        defaultStore.show_snackbar('success', i18n.t('snackbar.connections.websocket_obs.opened'))
      })

      new_connection.on('ConnectionClosed', () => {
        if (defaultStore.broadcasting)
          defaultStore.show_snackbar('info', i18n.t('snackbar.connections.websocket_obs.closed'))

        defaultStore.connections_count -= 1
      })

      defaultStore.show_snackbar('info', i18n.t('snackbar.connections.websocket_obs.connecting'))
      await new_connection.connect(rendered_address, connection.obs!.password)

      // Verify configuration
      const { inputs } = await new_connection.call('GetInputList')

      const source_text_exists = inputs.some((input: any) => input.inputName === core_obs.value.obs!.source_text && (input.inputKind as string).startsWith('text'))

      if (!source_text_exists)
        defaultStore.show_snackbar('warning', i18n.t('snackbar.connections.websocket_obs.error.text_source'))

      return new_connection
    }
    catch (error: any) {
      defaultStore.show_snackbar('error', i18n.t('snackbar.connections.websocket_obs.failed'))
    }
  }

  function connect_mimiuchi_websocketserver() {
    window.ipcRenderer.send('start-mimiuchi-websocketserver', core_mimiuchi_websocketserver.value.websocketserver?.port)
  }

  function disconnect_mimiuchi_websocketserver() {
    window.ipcRenderer.send('close-mimiuchi-websocketserver')
  }

  function connect_mimiuchi_websocket() {
    open.mimiuchi_websocket = connect_websocket(core_mimiuchi_websocket.value)
  }

  function disconnect_mimiuchi_websocket() {
    open.mimiuchi_websocket?.close(1000, 'Disconnected by user.')
    open.mimiuchi_websocket = null
  }

  function connect_obs() {
    connect_websocket_obs(core_obs.value).then((obsws) => {
      open.obs_websocket = obsws
    })
  }

  function disconnect_obs() {
    open.obs_websocket?.disconnect()
    open.obs_websocket = null
  }

  function connect_user_websocket(user_connection_id: number) {
    const new_websocket: (WebSocket | null | undefined) = connect_websocket(user_websockets.value[user_connection_id], user_connection_id)

    if (new_websocket) open.user_websockets[user_connection_id] = new_websocket
  }

  function disconnect_user_websocket(user_connection_id: number) {
    open.user_websockets[user_connection_id]?.close(1000, 'Disconnected by user.')
    open.user_websockets[user_connection_id] = null
  }

  async function reconnect_websocket(ws: WebSocket | OBSWebSocket, connect_ws: () => void, disconnect_ws: () => void) {
    await new Promise<void>((resolve) => {
      const on_close = () => {
        if (ws instanceof WebSocket) ws.removeEventListener('close', on_close)
        else if (ws instanceof OBSWebSocket) ws.off('ConnectionClosed', on_close)
        resolve()
      }

      if (ws instanceof WebSocket) ws.addEventListener('close', on_close)
      else if (ws instanceof OBSWebSocket) ws.on('ConnectionClosed', on_close)

      disconnect_ws()
    })

    connect_ws()
  }

  async function obs_set_text(new_text: any) {
    try {
      if (open.obs_websocket) {
        await open.obs_websocket.call('SetInputSettings', {
          inputName: core_obs.value.obs!.source_text,
          inputSettings: {
            text: new_text,
          },
          overlay: true,
        })
      }
    }
    catch (error: any) {
      console.log(error)
    }
  }

  function toggle_broadcast() {
    const defaultStore = useDefaultStore()

    defaultStore.broadcasting = !defaultStore.broadcasting // Broadcast toggle

    if (!defaultStore.broadcasting) { // Broadcast stop
      // Close core connections
      if (!is_electron()) {
        disconnect_mimiuchi_websocket()
        disconnect_obs()
      }

      // Close user-defined connections
      for (let i = 0; i < open.user_websockets.length; i++) {
        disconnect_user_websocket(i)
      }

      return
    }

    // Broadcast start
    if (!is_electron()) {
      const connectionsStore = useConnectionsStore()

      // Open core connections
      if (connectionsStore.core_mimiuchi_websocket.enabled) connect_mimiuchi_websocket()
      if (connectionsStore.core_obs.enabled) connect_obs()

      // Open user-defined connections
      for (let i = 0; i < connectionsStore.user_websockets.length; i++) {
        if (connectionsStore.user_websockets[i].enabled) connect_user_websocket(i)
      }
    }
  }

  return {
    types,
    core_mimiuchi_websocketserver,
    core_mimiuchi_websocket,
    core_obs,
    user_websockets,
    user_webhooks,
    open,
    reset,
    connect_mimiuchi_websocketserver,
    disconnect_mimiuchi_websocketserver,
    connect_mimiuchi_websocket,
    disconnect_mimiuchi_websocket,
    connect_obs,
    disconnect_obs,
    connect_user_websocket,
    disconnect_user_websocket,
    reconnect_websocket,
    obs_set_text,
    toggle_broadcast,
  }
})
