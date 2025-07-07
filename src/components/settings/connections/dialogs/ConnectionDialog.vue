<template>
  <v-dialog v-model="model" max-width="500">
    <v-card>
      <v-form v-model="form" @submit.prevent>
        <v-card-title v-if="mode === 'add'">
          {{ t('settings.connections.dialog.title.add') }}
        </v-card-title>
        <v-card-title v-if="mode === 'edit'">
          {{ t('settings.connections.dialog.title.edit') }}
        </v-card-title>
        <v-divider class="pb-2" />
        <v-card-text>
          <v-row>
            <v-col class="d-flex align-center justify-center">
              <v-icon
                :icon="new_connection.icon"
                size="20"
                color="secondary"
                class="mr-2"
              />
              <h2>{{ new_connection.title }}</h2>
            </v-col>
            <v-col :cols="12" class="d-flex justify-center text-center px-8">
              <span
                v-if="(['websocket', 'obs'] as ConnectionTypes[]).includes(new_connection.type)"
                class="text-subtitle-1"
              >
                {{ t('settings.connections.dialog.description.websocket') }}
              </span>
              <span
                v-if="new_connection.type === 'webhook'"
                class="text-subtitle-1"
              >
                {{ t('settings.connections.dialog.description.webhook') }}
                <v-col>
                  <code>=> { transcript: 'text here' }</code>
                </v-col>
              </span>
            </v-col>
          </v-row>
          <!-- Generic settings -->
          <v-row>
            <v-col v-if="!new_connection.edit_hide_title">
              <v-text-field
                v-model="new_connection.title"
                :label="t('settings.connections.dialog.field.title')"
                :rules="[rules.requiredField]"
                hide-details
              />
            </v-col>
            <v-col
              v-if="props.mode === 'add'"
              :cols="12"
              class="d-flex justify-center"
            >
              <v-select
                v-model="type_to_set"
                :label="t('settings.connections.dialog.field.type')"
                :items="get_connection_types()"
                item-title="display"
                item-value="type"
                hide-details
                @update:model-value="set_connection_type()"
              />
            </v-col>
          </v-row>
          <!-- WebSocket settings -->
          <v-row v-if="!is_electron() && new_connection.type === 'websocket'">
            <v-col :cols="8">
              <v-text-field
                v-model="new_connection.websocket!.address"
                :label="t('settings.connections.dialog.field.address')"
                prefix="ws://"
                hide-details
                :rules="[rules.requiredField]"
              />
            </v-col>
            <v-col :cols="4">
              <v-number-input
                v-model="new_connection.websocket!.port"
                control-variant="stacked"
                hide-details
                :label="t('settings.connections.dialog.field.port')"
                :min="1"
                :max="65535"
              />
            </v-col>
          </v-row>
          <!-- Open Broadcaster Software (OBS) WebSocket settings -->
          <v-row v-if="!is_electron() && new_connection.type === 'obs'">
            <v-col :cols="8">
              <v-text-field
                v-model="new_connection.obs!.address"
                :label="t('settings.connections.dialog.field.address')"
                prefix="ws://"
                placeholder="127.0.0.1"
                hide-details
                :rules="[rules.requiredField]"
              />
            </v-col>
            <v-col :cols="4">
              <v-number-input
                v-model="new_connection.obs!.port"
                control-variant="stacked"
                hide-details
                :label="t('settings.connections.dialog.field.port')"
                :min="1"
                :max="65535"
                placeholder="4455"
              />
            </v-col>
            <v-col :cols="12">
              <v-text-field
                v-model="new_connection.obs!.password"
                :label="t('settings.connections.dialog.field.password')"
                hide-details
                :placeholder="t('settings.connections.dialog.field.password_placeholder')"
                persistent-placeholder
              />
            </v-col>
            <v-col :cols="12">
              <v-text-field
                v-model="new_connection.obs!.source_text"
                :label="t('settings.connections.dialog.field.text_source_name')"
                hide-details
                :rules="[rules.requiredField]"
              />
            </v-col>
          </v-row>
          <!-- Webhook settings -->
          <v-row v-if="!is_electron() && new_connection.type === 'webhook'">
            <v-col>
              <v-text-field
                v-model="new_connection.webhook!.address_full"
                :label="t('settings.connections.dialog.field.full_address')"
                :rules="[rules.requiredField]"
                hide-details
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn
            v-if="(mode === 'edit') && (is_user_connection)"
            color="error"
            variant="flat"
            @click="delete_user_connection()"
          >
            {{ t('settings.connections.dialog.action.delete') }}
          </v-btn>
          <v-spacer />
          <v-btn @click="model = false">
            {{ t('settings.connections.dialog.action.cancel') }}
          </v-btn>
          <v-btn
            v-if="mode === 'add'"
            :disabled="!form"
            type="submit"
            color="primary"
            variant="flat"
            @click="confirm_add_connection()"
          >
            {{ t('settings.connections.dialog.action.confirm') }}
          </v-btn>
          <v-btn
            v-if="mode === 'edit'"
            :disabled="!form"
            type="submit"
            color="primary"
            variant="flat"
            @click="confirm_edit_connection()"
          >
            {{ t('settings.connections.dialog.action.confirm') }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { nextTick, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type OBSWebSocket from 'obs-websocket-js'
import is_electron from '@/helpers/is_electron'
import type { ConnectionTypes, TypeDisplayData } from '@/stores/connections'
import { Connection, PropsWebSocket, PropsWebhook, useConnectionsStore } from '@/stores/connections'
import { useDefaultStore } from '@/stores/default'

const props = defineProps<{
  modelValue: boolean
  mode: 'add' | 'edit'
  connection: Connection
  userConnectionId: number
}>()

const emit = defineEmits([
  'update:modelValue',
  'update:connectionToConfigure',
])

declare const window: any

const { t } = useI18n()
const connectionsStore = useConnectionsStore()

const model = defineModel<boolean>()

const form = ref(false)

const rules = {
  requiredField: (value: string) => {
    return !!value || 'Required'
  },
}

const new_connection = ref<Connection>(new Connection()) // Actually initialized by watcher
const is_user_connection = ref<boolean>(false) // Actually initializer by watcher
const type_to_set = ref<ConnectionTypes>('webhook') // Actually initialized by watcher

function close_dialog() {
  emit('update:modelValue', false)
}

function get_connection_types() {
  return Object.entries(connectionsStore.types)
    .filter(([type, data]: [string, TypeDisplayData]) => data.selectable) // Hide nonselectable types from the user
    .map(([type, data]: [string, TypeDisplayData]) => ({
      type,
      display: data.display,
    }))
}

function confirm_add_connection() {
  if (new_connection.value.type === 'websocket')
    connectionsStore.user_websockets.push(new_connection.value)

  if (new_connection.value.type === 'webhook')
    connectionsStore.user_webhooks.push(new_connection.value)

  close_dialog()
}

function set_connection_type() {
  const types: ConnectionTypes[] = Object.keys(connectionsStore.types) as ConnectionTypes[]
  function clean_properties() {
    types.forEach((connectionType) => {
      delete new_connection.value[connectionType]
    })
  }

  switch (type_to_set.value) {
    case 'websocket':
      new_connection.value.icon = 'mdi-transit-connection-horizontal'
      new_connection.value.type = 'websocket'
      clean_properties()
      new_connection.value.websocket = new PropsWebSocket()
      break
    case 'webhook':
      new_connection.value.icon = 'mdi-webhook'
      new_connection.value.type = 'webhook'
      clean_properties()
      new_connection.value.webhook = new PropsWebhook()
      break
  }
}

function confirm_edit_connection() {
  const defaultStore = useDefaultStore()
  const connection_is_open = defaultStore.broadcasting && props.connection.enabled

  if (new_connection.value.type === 'obs') {
    connectionsStore.core_obs = new_connection.value

    if (connection_is_open) {
      const connection_to_reconnect = connectionsStore.open.obs_websocket

      const function_connect = () => {
        connectionsStore.connect_obs()
      }

      const function_disconnect = () => {
        connectionsStore.disconnect_obs()
      }

      if (connection_to_reconnect) connectionsStore.reconnect_websocket(connection_to_reconnect as OBSWebSocket, function_connect, function_disconnect)
    }
  }

  if (new_connection.value.type === 'websocket') {
    if (is_user_connection.value) {
      connectionsStore.user_websockets[props.userConnectionId] = new_connection.value

      if (connection_is_open) {
        const connection_to_reconnect = connectionsStore.open.user_websockets[props.userConnectionId]

        const function_connect = () => {
          connectionsStore.connect_user_websocket(props.userConnectionId)
        }

        const function_disconnect = () => {
          connectionsStore.disconnect_user_websocket(props.userConnectionId)
        }

        if (connection_to_reconnect) connectionsStore.reconnect_websocket(connection_to_reconnect as WebSocket, function_connect, function_disconnect)
      }
    }
  }

  if (new_connection.value.type === 'webhook') {
    if (is_user_connection.value)
      connectionsStore.user_webhooks[props.userConnectionId] = new_connection.value
  }

  close_dialog()
}

function delete_user_connection() {
  if (new_connection.value.type === 'websocket') {
    connectionsStore.disconnect_user_websocket(props.userConnectionId)
    connectionsStore.user_websockets.splice(props.userConnectionId, 1)
    connectionsStore.open.user_websockets.splice(props.userConnectionId, 1)
  }

  if (new_connection.value.type === 'webhook') {
    connectionsStore.user_webhooks.splice(props.userConnectionId, 1)
  }

  close_dialog()
}

watch(() => props.modelValue, (ready) => {
  if (ready) {
    nextTick(() => {
      // Initializer
      new_connection.value = structuredClone(toRaw(props.connection))
      type_to_set.value = new_connection.value.type

      // Initializer
      is_user_connection.value = props.userConnectionId > -1
    })
  }
}, { immediate: true })
</script>
