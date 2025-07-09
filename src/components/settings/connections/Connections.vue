<template>
  <v-card :title="t('settings.connections.title')" color="transparent" flat>
    <template #subtitle>
      <i18n-t keypath="settings.connections.description" tag="label" scope="global">
        <template #icon>
          <v-icon color="success">
            mdi-broadcast
          </v-icon>
        </template>
      </i18n-t>
    </template>
    <ConnectionDialog
      v-model="dialog"
      :mode="dialog_mode"
      :connection="dialog_connection"
      :user-connection-id="dialog_user_connection_id"
    />
    <v-divider />
    <v-card-text v-if="is_electron()">
      <v-row>
        <!-- Core connections -->
        <v-col :cols="12">
          <v-card class="py-2" flat>
            <v-list-item
              :title="connectionsStore.core_mimiuchi_websocketserver.title"
              :subtitle="display_subtitle(connectionsStore.core_mimiuchi_websocketserver.type)"
            >
              <template #prepend>
                <v-icon
                  :icon="connectionsStore.core_mimiuchi_websocketserver.icon"
                  size="30"
                  color="secondary"
                  class="mr-4"
                />
              </template>
              <v-spacer />
              <template #append>
                <v-switch
                  v-model="connectionsStore.core_mimiuchi_websocketserver.enabled"
                  color="primary"
                  inset
                  hide-details
                  @update:model-value="toggle_open_mimiuchi_websocketserver()"
                />
              </template>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-text v-if="!is_electron()">
      <v-row>
        <!-- Core connections -->
        <v-col :cols="12">
          <v-card class="py-2" flat>
            <v-list-item
              :title="connectionsStore.core_mimiuchi_websocket.title"
              :subtitle="display_subtitle(connectionsStore.core_mimiuchi_websocket.type)"
            >
              <template #prepend>
                <v-icon
                  :icon="connectionsStore.core_mimiuchi_websocket.icon"
                  size="30"
                  color="secondary"
                  class="mr-4"
                />
              </template>
              <v-spacer />
              <template #append>
                <v-switch
                  v-model="connectionsStore.core_mimiuchi_websocket.enabled"
                  color="primary"
                  inset
                  hide-details
                  @update:model-value="toggle_open_mimiuchi_websocket()"
                />
              </template>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col :cols="12">
          <v-card class="py-2" flat>
            <v-list-item
              :title="connectionsStore.core_obs.title"
              :subtitle="display_subtitle(connectionsStore.core_obs.type)"
            >
              <template #prepend>
                <v-icon
                  :icon="connectionsStore.core_obs.icon"
                  size="30"
                  color="background-variant"
                  class="mr-4"
                />
              </template>
              <v-spacer />
              <template #append>
                <v-btn
                  class="mr-4"
                  icon variant="text"
                  @click.stop="edit_connection(connectionsStore.core_obs)"
                >
                  <v-icon>mdi-cog</v-icon>
                </v-btn>
                <v-switch
                  v-model="connectionsStore.core_obs.enabled"
                  color="primary"
                  inset
                  hide-details
                  @update:model-value="() => {
                    dialog_user_connection_id = -1
                    toggle_open_obs()
                  }"
                />
              </template>
            </v-list-item>
          </v-card>
        </v-col>
        <!-- User-defined connections -->
        <!-- WebSockets -->
        <v-col
          v-for="(connection, i) in connectionsStore.user_websockets"
          :cols="12"
        >
          <v-card class="py-2" flat>
            <v-list-item
              :title="connectionsStore.user_websockets[i].title"
              :subtitle="display_subtitle(connectionsStore.user_websockets[i].type)"
            >
              <template #prepend>
                <v-icon
                  :icon="connectionsStore.user_websockets[i].icon"
                  size="30"
                  color="secondary"
                  class="mr-4"
                />
              </template>
              <v-spacer />
              <template #append>
                <v-btn
                  class="mr-4"
                  icon variant="text"
                  @click.stop="edit_connection(connectionsStore.user_websockets[i], i)"
                >
                  <v-icon>mdi-cog</v-icon>
                </v-btn>
                <v-switch
                  v-model="connection.enabled"
                  color="primary"
                  inset
                  hide-details
                  @update:model-value="toggle_open_user_websocket(i)"
                />
              </template>
            </v-list-item>
          </v-card>
        </v-col>
        <!-- Webhooks -->
        <v-col
          v-for="(connection, i) in connectionsStore.user_webhooks"
          :cols="12"
        >
          <v-card class="py-2" flat>
            <v-list-item
              :title="connectionsStore.user_webhooks[i].title"
              :subtitle="display_subtitle(connectionsStore.user_webhooks[i].type)"
            >
              <template #prepend>
                <v-icon
                  :icon="connectionsStore.user_webhooks[i].icon"
                  size="30"
                  color="secondary"
                  class="mr-4"
                />
              </template>
              <v-spacer />
              <template #append>
                <v-btn
                  class="mr-4"
                  icon variant="text"
                  @click.stop="edit_connection(connectionsStore.user_webhooks[i], i)"
                >
                  <v-icon>mdi-cog</v-icon>
                </v-btn>
                <v-switch
                  v-model="connectionsStore.user_webhooks[i].enabled"
                  color="primary"
                  inset
                  hide-details
                />
              </template>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>
      <p class="mt-6">
        <i18n-t keypath="settings.connections.action.add" tag="label" scope="global">
          <template #icon>
            <v-icon
              color="primary"
              size="small"
            >
              mdi-plus-circle-outline
            </v-icon>
          </template>
        </i18n-t>
      </p>
      <v-card class="mt-4" color="transparent" flat>
        <v-card-actions>
          <v-btn
            color="primary"
            variant="outlined"
            size="small"
            icon="mdi-plus"
            @click="add_user_connection()"
          />
        </v-card-actions>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDefaultStore } from '@/stores/default'
import { Connection, useConnectionsStore } from '@/stores/connections'
import ConnectionDialog from '@/components/settings/connections/dialogs/ConnectionDialog.vue'
import is_electron from '@/helpers/is_electron'

const { t } = useI18n()

declare const window: any

const connectionsStore = useConnectionsStore()
const defaultStore = useDefaultStore()

const dialog = ref(false)
const dialog_mode = ref<'add' | 'edit'>('add')
const dialog_connection = ref<(Connection)>(new Connection())
const dialog_user_connection_id = ref<number>(-1)

function display_subtitle(currentConnectionType: string) {
  return connectionsStore.types[currentConnectionType].display
}

function edit_connection(connection: Connection, userConnectionID?: number) {
  dialog_mode.value = 'edit'
  dialog_connection.value = connection

  if (userConnectionID === undefined) dialog_user_connection_id.value = -1
  else dialog_user_connection_id.value = userConnectionID

  dialog.value = true
}

function toggle_open_mimiuchi_websocketserver() {
  if (connectionsStore.core_mimiuchi_websocketserver.enabled)
    connectionsStore.connect_mimiuchi_websocketserver()
  else
    connectionsStore.disconnect_mimiuchi_websocketserver()
}

function toggle_open_mimiuchi_websocket() {
  if (defaultStore.broadcasting) {
    if (connectionsStore.core_mimiuchi_websocket.enabled)
      connectionsStore.connect_mimiuchi_websocket()
    else
      connectionsStore.disconnect_mimiuchi_websocket()
  }
}

function toggle_open_obs() {
  if (defaultStore.broadcasting) {
    if (connectionsStore.core_obs.enabled)
      connectionsStore.connect_obs()
    else
      connectionsStore.disconnect_obs()
  }
}

function add_user_connection() {
  dialog_connection.value = new Connection()
  dialog_mode.value = 'add'
  dialog.value = true
}

function toggle_open_user_websocket(userConnectionID: number) {
  if (defaultStore.broadcasting) {
    if (connectionsStore.user_websockets[userConnectionID].enabled)
      connectionsStore.connect_user_websocket(userConnectionID)
    else
      connectionsStore.disconnect_user_websocket(userConnectionID)
  }
}
</script>
