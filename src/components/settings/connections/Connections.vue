<template>
  <v-card :title="$t('settings.connections.title')" color="transparent" flat>
    <template #subtitle>
      <i18n-t keypath="settings.connections.description" tag="label" scope="global">
        <template #icon>
          <v-icon color="success">
            mdi-broadcast
          </v-icon>
        </template>
      </i18n-t>
    </template>
    <ConnectionDialog v-model="dialog" :connection="connection_type" />
    <v-divider />
    <v-card-text>
      <v-row>
        <!-- <v-col :cols="12">
                    <v-card subtitle="Add new connection" variant="outlined">
                        <v-card-text>
                            <v-row class="justify-center pb-4" :cols="12">
                                <v-card
                                    v-for="(connection) in connection_options"
                                    class="ma-2 text-white"
                                    variant="tonal"
                                    @click="open_dialog(connection)"
                                >
                                    <v-card-item>
                                        <template v-slot:title>
                                            <p class="text-subtitle-1">
                                                <v-icon
                                                    :icon="connection.icon"
                                                    size="18"
                                                    color="secondary"
                                                    class="me-1 pb-1"
                                                ></v-icon>
                                                {{ connection.title }}
                                            </p>
                                        </template>
                                    </v-card-item>
                                </v-card>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-col> -->

        <v-col :cols="12">
          <v-card flat>
            <v-card class="py-2" flat>
              <v-list-item :title="$t('settings.connections.ws.name')" subtitle="websocket">
                <template #prepend>
                  <v-icon
                    icon="mdi-transit-connection-horizontal"
                    size="30"
                    color="secondary"
                    class="mr-4"
                  />
                </template>
                <!-- <v-col>
                                    <p class="text-subtitle-1 font-weight-bold pb-0">{{ $t('settings.connections.websocket_name') }}</p>
                                    <p class="text-subtitle-2　font-weight-light text-medium-emphasis">websocket</p>
                                </v-col> -->
                <v-spacer />
                <template #append>
                  <v-btn
                    class="mr-4"
                    icon variant="text"
                    @click.stop="open_dialog({ title: 'Websocket', icon: 'mdi-transit-connection-horizontal', type: 'ws' })"
                  >
                    <v-icon>mdi-cog</v-icon>
                  </v-btn>
                  <v-switch v-model="connectionStore.ws.enabled" color="primary" inset hide-details />
                </template>
              </v-list-item>
            </v-card>
            <!-- <v-divider></v-divider> -->
            <!-- <v-list class="pa-0">
                            <v-list-item :ripple="false" @click="toggle_ws()">
                                <template v-slot:prepend>
                                <p class="text-body-2">Enable</p>
                            </template>
                            <template v-slot:append>
                                <v-switch v-model="connectionStore.ws.enabled" color="primary" inset hide-details></v-switch>
                            </template>
                            </v-list-item>
                        </v-list> -->
          </v-card>
          <!-- <v-card>meow</v-card> -->
        </v-col>

        <v-col :cols="12">
          <v-card flat>
            <v-card class="py-2" flat>
              <v-list-item title="Webhook">
                <template #prepend>
                  <v-icon
                    :icon="connectionStore.wh.icon"
                    size="30"
                    color="secondary"
                    class="mr-4"
                  />
                </template>
                <!-- <v-col>
                                    <p class="text-subtitle-1 font-weight-bold pb-0">{{ $t('settings.connections.websocket_name') }}</p>
                                    <p class="text-subtitle-2　font-weight-light text-medium-emphasis">websocket</p>
                                </v-col> -->
                <v-spacer />
                <template #append>
                  <v-btn
                    v-if="connectionStore.wh.enabled"
                    class="mr-4"
                    icon
                    variant="text"
                    @click.stop="open_dialog({ title: 'Webhook', icon: 'mdi-webhook', type: 'wh' })"
                  >
                    <v-icon>mdi-cog</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="!connectionStore.wh.enabled"
                    icon
                    color="success"
                    variant="text"
                    @click.stop="open_dialog({ title: 'Webhook', icon: 'mdi-webhook', type: 'wh' })"
                  >
                    <v-icon>mdi-plus-circle</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="connectionStore.wh.enabled"
                    icon
                    color="error"
                    variant="text"
                    @click.stop="clear_wh()"
                  >
                    <v-icon>mdi-close-circle</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-card>
            <!-- <v-divider></v-divider> -->
            <!-- <v-list class="pa-0">
                            <v-list-item :ripple="false" @click="toggle_ws()">
                                <template v-slot:prepend>
                                <p class="text-body-2">Enable</p>
                            </template>
                            <template v-slot:append>
                                <v-switch v-model="connectionStore.ws.enabled" color="primary" inset hide-details></v-switch>
                            </template>
                            </v-list-item>
                        </v-list> -->
          </v-card>
          <!-- <v-card>meow</v-card> -->
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import ConnectionDialog from '@/components/settings/connections/dialogs/ConnectionDialog.vue'
import is_electron from '@/helpers/is_electron'
import { useConnectionsStore } from '@/stores/connections'

declare const window: any

declare interface ConnectionType {
  title?: string
  type?: string
  icon?: string
}

const connectionStore = useConnectionsStore()

const dialog = ref(false)
const connection_type = ref<ConnectionType>({})
// const connection_options = ref<ConnectionType[]>([
//   {
//     title: 'Webhook',
//     type: 'wh',
//     icon: 'mdi-webhook',
//   },
// ])
// const snackbar = ref(false)
// const snackbar_text = ref('')
// const reset_dialog = ref(false)
// const appearance = ref(true)
// const settings = ref(true)
// const word_replace = ref(true)
// const speech = ref(true)

const { ws } = storeToRefs(connectionStore)
watch(
  () => ws.value.enabled,
  (new_val: boolean) => {
    ws_toggled(new_val)
  },
  { deep: true },
)

onUnmounted(() => {
  if (is_electron())
    window.ipcRenderer.removeListener('websocket-error')
})

onMounted(() => {
  if (is_electron()) {
    // window.ipcRenderer.on('websocket-started', (event: any, data: any) => {
    //     // console.log("MEOW")
    // })
    window.ipcRenderer.on('websocket-error', (event: any, data: any) => {
      connectionStore.ws.enabled = false
      console.log('error')
    })
  }
})

function open_dialog(connection: ConnectionType) {
  connection_type.value = connection
  dialog.value = true
}

function ws_toggled(value: boolean) {
  if (is_electron()) {
    if (value)
      window.ipcRenderer.send('start-ws', connectionStore.ws.port)
    else
      window.ipcRenderer.send('close-ws')
  }

  // value = !value
}

function clear_wh() {
  connectionStore.wh.enabled = false
  connectionStore.wh.url = ''
}
</script>
