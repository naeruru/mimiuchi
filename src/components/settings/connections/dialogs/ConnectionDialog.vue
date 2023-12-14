<template>
  <v-dialog v-model="value" max-width="600">
    <v-card>
      <v-form v-model="form" @submit.prevent>
        <v-card-title>
          <span class="text-subtitle-1">{{ $t('settings.connections.update') }}</span>
        </v-card-title>
        <v-divider class="pb-2" />
        <v-card-text>
          <v-row>
            <v-col :cols="12" class="d-flex justify-center">
              <v-icon
                icon="mdi-transit-connection-horizontal"
                size="20"
                color="secondary"
                class="mr-2"
              />
              <h2>{{ connection?.title }}</h2>
            </v-col>
            <v-col class="d-flex justify-center text-center px-8">
              <label v-if="connection?.type === 'ws'" class="text-subtitle-1">{{ $t('settings.connections.ws.description') }}</label>
              <label v-if="connection?.type === 'wh'" class="text-subtitle-1">{{ $t('settings.connections.wh.description') }}</label>
            </v-col>
            <v-col :cols="12" class="pt-2">
              <!-- {{ $t('settings.connections.ws.description') }} -->
              <v-divider />
            </v-col>
          </v-row>
          <WebSocketOptions v-if="connection?.type === 'ws'" v-model="ws" />
          <WebHookOptions v-if="connection?.type === 'wh'" v-model="wh" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn type="submit" @click="value = false">
            Cancel
          </v-btn>
          <v-btn :disabled="!form" type="submit" color="primary" variant="flat" @click="update_connection(connection)">
            Update
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import WebSocketOptions from '@/components/settings/connections/dialogs/WebSocketOptions.vue'
import WebHookOptions from '@/components/settings/connections/dialogs/WebHookOptions.vue'
import is_electron from '@/helpers/is_electron'
import type { Connection } from '@/stores/connections'
import { useConnectionStore } from '@/stores/connections'

declare const window: any

declare interface ConnectionType {
  title?: string
  type?: string
  icon?: string
}

export default {
  name: 'ConnectionDialog',
  components: {
    WebSocketOptions,
    WebHookOptions,
  },
  props: {
    modelValue: Boolean,
    connection: Object,
  },
  emits: ['update:modelValue'],
  setup() {
    const connectionStore = useConnectionStore()

    return {
      connectionStore,
      is_electron,
    }
  },
  data: () => ({
    form: false,
    ws: {} as Connection,
    wh: {} as Connection,
  }),
  computed: {
    value: {
      get() {
        return this.modelValue
      },
      set(modelValue: boolean) {
        this.ws = JSON.parse(JSON.stringify(this.connectionStore.ws))
        this.wh = JSON.parse(JSON.stringify(this.connectionStore.wh))
        this.$emit('update:modelValue', modelValue)
      },
    },
  },
  mounted() {
    this.ws = JSON.parse(JSON.stringify(this.connectionStore.ws))
    this.wh = JSON.parse(JSON.stringify(this.connectionStore.wh))
  },
  methods: {
    update_connection(connection: any) {
      switch (connection.type) {
        case 'ws':
          this.connectionStore.ws = this.ws
          if (this.is_electron()) {
            if (this.connectionStore.ws.enabled) {
              window.ipcRenderer.send('close-ws')
              window.ipcRenderer.send('start-ws', this.connectionStore.ws.port)
            }
          }
          break
        case 'wh':
          this.connectionStore.wh = this.wh
          this.connectionStore.wh.enabled = true
          break
      }
      this.$emit('update:modelValue', false)
    },
  },
}
</script>
