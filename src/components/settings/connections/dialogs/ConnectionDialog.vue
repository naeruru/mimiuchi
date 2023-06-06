<template>
    <v-dialog v-model="value" max-width="600">
        <v-card>
            <v-form v-model="form" @submit.prevent>
                <v-card-title>
                    <span class="text-subtitle-1">{{ $t('settings.connections.update') }}</span>
                </v-card-title>
                <v-divider class="pb-2"></v-divider>
                <v-card-text>
                        <v-row>
                            <v-col :cols="12" class="d-flex justify-center">
                                <v-icon
                                        icon="mdi-transit-connection-horizontal"
                                        size="20"
                                        color="secondary"
                                        class="mr-2"
                                    ></v-icon>
                                <h2>Websocket</h2>
                            </v-col>
                            <v-col class="d-flex justify-center text-center px-8">
                                <label class="text-subtitle-1">{{ $t('settings.connections.ws.description') }}</label>
                            </v-col>
                            <v-col :cols="12" class="pt-2">
                                <!-- {{ $t('settings.connections.ws.description') }} -->
                                <v-divider></v-divider>
                            </v-col>
                        </v-row>
                        <WebSocketOptions v-if="type === 'ws'" v-model="ws"></WebSocketOptions>
                        
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn type="submit" @click="value = false">Cancel</v-btn>
                    <v-btn :disabled="!form" type="submit" color="primary" variant="flat" @click="update_ws()">Update</v-btn>
                </v-card-actions>
            </v-form>
        </v-card>
    </v-dialog>
</template>


<script lang="ts">
import is_electron from '../../../../helpers/is_electron'
import { Connection, useConnectionStore } from  '../../../../stores/connections'
import WebSocketOptions from './WebSocketOptions.vue'

declare const window: any

export default {
    name: 'SettingsGeneral',
    components: { WebSocketOptions },
    props: {
        modelValue: Boolean,
        type: String,
    },
    emits: ['update:modelValue'],
    data: () => ({
        form: false,
        ws: {} as Connection,
        firstNameRules: [
            (value: string) => {
                if (value?.length > 3) return true

                return 'First name must be at least 3 characters.'
            },
        ],
    }),
    computed: {
        value: {
            get() {
                return this.modelValue
            },
            set(modelValue: boolean) {
                this.ws = JSON.parse(JSON.stringify(this.connectionStore.ws))
                this.$emit('update:modelValue', modelValue)
            }
        }
    },
    methods: {
        update_ws() {
            this.connectionStore.ws = this.ws
            if (this.is_electron()) {
                if (this.connectionStore.ws.enabled) {
                    window.ipcRenderer.send("close-ws")
                    window.ipcRenderer.send("start-ws", this.connectionStore.ws.port)
                }
            }
            this.$emit('update:modelValue', false)
        }
    },
    mounted() {
        this.ws = JSON.parse(JSON.stringify(this.connectionStore.ws))
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