<template>
    <v-card :title="$t('settings.connections.title')" color="transparent" flat>
        <template v-slot:subtitle>
            <i18n-t keypath="settings.connections.description" tag="label" scope="global">
                <template v-slot:icon>
                    <v-icon color="success">mdi-broadcast</v-icon>
                </template>
            </i18n-t>
        </template>
        <ConnectionDialog v-model="dialog" :connection="connection_type" ></ConnectionDialog>
        <v-divider></v-divider>
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
                                <template v-slot:prepend>
                                    <v-icon
                                        icon="mdi-transit-connection-horizontal"
                                        size="30"
                                        color="secondary"
                                        class="mr-4"
                                    ></v-icon>
                                </template>
                                <!-- <v-col>
                                    <p class="text-subtitle-1 font-weight-bold pb-0">{{ $t('settings.connections.websocket_name') }}</p>
                                    <p class="text-subtitle-2　font-weight-light text-medium-emphasis">websocket</p>
                                </v-col> -->
                                <v-spacer></v-spacer>
                                <template v-slot:append>
                                    <v-btn 
                                        @click.stop="open_dialog({title: 'Websocket', icon: 'mdi-transit-connection-horizontal', type: 'ws'})" 
                                        class="mr-4" icon variant="text"
                                    >
                                        <v-icon>mdi-cog</v-icon>
                                    </v-btn>
                                    <v-switch v-model="connectionStore.ws.enabled" color="primary" inset hide-details></v-switch>
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
                                <template v-slot:prepend>
                                    <v-icon
                                        :icon="connectionStore.wh.icon"
                                        size="30"
                                        color="secondary"
                                        class="mr-4"
                                    ></v-icon>
                                </template>
                                <!-- <v-col>
                                    <p class="text-subtitle-1 font-weight-bold pb-0">{{ $t('settings.connections.websocket_name') }}</p>
                                    <p class="text-subtitle-2　font-weight-light text-medium-emphasis">websocket</p>
                                </v-col> -->
                                <v-spacer></v-spacer>
                                <template v-slot:append>
                                    <v-btn
                                        v-if="connectionStore.wh.enabled"
                                        @click.stop="open_dialog({title: 'Webhook', icon: 'mdi-webhook', type: 'wh'})" 
                                        class="mr-4"
                                        icon
                                        variant="text"
                                    >
                                        <v-icon>mdi-cog</v-icon>
                                    </v-btn>
                                    <v-btn 
                                        v-if="!connectionStore.wh.enabled"
                                        @click.stop="open_dialog({title: 'Webhook', icon: 'mdi-webhook', type: 'wh'})" 
                                        icon
                                        color="success"
                                        variant="text"
                                    >
                                        <v-icon>mdi-plus-circle</v-icon>
                                    </v-btn>
                                    <v-btn 
                                        v-if="connectionStore.wh.enabled"
                                        @click.stop="clear_wh()" 
                                        icon
                                        color="error"
                                        variant="text"
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


<script lang="ts">
import is_electron from '../../../helpers/is_electron'
import { useConnectionStore } from  '../../../stores/connections'
import ConnectionDialog from './dialogs/ConnectionDialog.vue'

declare const window: any

declare interface ConnectionType {
    title?: string,
    type?: string,
    icon?: string
}

export default {
    name: "SettingsGeneral",
    components: { ConnectionDialog },
    data: () => ({
        dialog: false,
        connection_type: {} as ConnectionType,
        connection_options: [
            {
                title: "Webhook",
                type: "wh",
                icon: "mdi-webhook"
            }
        ] as ConnectionType[],
        snackbar: false,
        snackbar_text: "",
        reset_dialog: false,
        appearance: true,
        settings: true,
        word_replace: true,
        speech: true
    }),
    watch: {
        'connectionStore.ws.enabled'(new_val) {
            this.ws_toggled(new_val)
        }
    },
    methods: {
        open_dialog(connection: ConnectionType) {
            this.connection_type = connection
            this.dialog = true
        },
        ws_toggled(value: boolean) {
            if (this.is_electron()) 
                if (value) {
                    window.ipcRenderer.send("start-ws", this.connectionStore.ws.port)
                } else {
                    window.ipcRenderer.send("close-ws")
                }
                // value = !value
        },
        clear_wh() {
            this.connectionStore.wh.enabled = false
            this.connectionStore.wh.url = ''
        }
    },
    unmounted() {
        if (this.is_electron())
            window.ipcRenderer.removeListener('websocket-error')
    },
    mounted() {
        if (this.is_electron()) {
            // window.ipcRenderer.receive('websocket-started', (event: any, data: any) => {
            //     // console.log("MEOW")
            // })
            window.ipcRenderer.receive('websocket-error', (event: any, data: any) => {
                this.connectionStore.ws.enabled = false
                console.log('error')
            })
        }
    },
    setup() {
        const connectionStore = useConnectionStore()

        return {
            connectionStore,
            is_electron
        }
    }
}
</script>