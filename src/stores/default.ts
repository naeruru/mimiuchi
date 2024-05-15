import { defineStore, storeToRefs } from 'pinia'

import { ref } from 'vue'
import { useConnectionsStore } from '@/stores/connections'
import type { WebSpeech } from '@/modules/speech'
import { i18n } from '@/plugins/i18n'
import is_electron from '@/helpers/is_electron'

export const useDefaultStore = defineStore('default', () => {
  const worker = ref<Worker | null>(null)
  const ws1 = ref<WebSocket | null>(null)
  const loading_websocket = ref(false)
  const broadcasting = ref(false)
  const connections = ref(0)
  const typing_limited = ref(false)
  const speech = ref(<WebSpeech>{})
  const snackbar = ref({
    enabled: false,
    type: 'error',
    desc: '',
  })

  function show_snackbar(type: string, desc: string) {
    console.log(desc)
    snackbar.value.type = type
    snackbar.value.desc = desc
    snackbar.value.enabled = true
  }
  function toggle_broadcast() {
    if (broadcasting.value) {
      broadcasting.value = false
      connections.value = 0
      if (ws1.value) {
        ws1.value.send('{"type": "command", "data": "stop"}')
        ws1.value.close()
        ws1.value = null
      }
      return
    }

    broadcasting.value = true
    const { ws, wh } = storeToRefs(useConnectionsStore())

    if (!is_electron() && ws.value.enabled) {
      loading_websocket.value = true
      try {
        ws1.value = new WebSocket(`ws://${ws.value.url}`)
      }
      catch {
        broadcasting.value = false
        loading_websocket.value = false
        ws1.value = null
        show_snackbar('error', i18n.t('alerts.websocket_error'))
        return
      }
      ws1.value.onopen = () => {
        broadcasting.value = true
        loading_websocket.value = false
        connections.value += 1
      }
      ws1.value.onmessage = (event: any) => {
        const msg = JSON.parse(event.data)
        if (msg.event === 'connect' && msg.version !== __APP_VERSION__)
          show_snackbar('error', i18n.t('alerts.version_mismatch'))
      }
      ws1.value.onclose = () => {
        console.log('websocket closed')
        if (connections.value === 0)
          broadcasting.value = false
        loading_websocket.value = false
        ws1.value = null
      }
      ws1.value.onerror = () => {
        show_snackbar('error', i18n.t('alerts.broadcast_error'))
      }
    }

    if (wh.value.enabled)
      connections.value += 1
  }

  return {
    worker,
    ws1,
    loading_websocket,
    broadcasting,
    connections,
    typing_limited,
    speech,
    snackbar,
    show_snackbar,
    toggle_broadcast,
  }
})
