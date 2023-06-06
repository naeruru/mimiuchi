<template>
    <v-row>
        <v-col v-if="modelValue">
            <v-text-field
                v-if="!is_electron()"
                v-model="modelValue.url"
                label="URL"
                prefix="ws://"
            ></v-text-field>
            <v-text-field
                v-if="is_electron()"
                v-model="modelValue.port"
                label="Websocket Port"
                type="number"
                :rules="port_rules"
            ></v-text-field>
        </v-col>
    </v-row>
</template>


<script lang="ts">
import is_electron from '../../../../helpers/is_electron'
import { Connection, useConnectionStore } from  '../../../../stores/connections'

export default {
    name: 'SettingsGeneral',
    props: {
        modelValue: Object,
        type: String,
    },
    emits: ['update:modelValue'],
    data: () => ({
        ws: {} as Connection,
        port_rules: [
            (value: number) => {
                if (value >= 1 && value <=  65535) return true
                return 'Must be a valid port number'
            },
        ],
    }),
    computed: {
        value: {
            get() {
                return this.modelValue
            },
            set(modelValue: boolean) {
                this.$emit('update:modelValue', modelValue)
            }
        }
    },
    methods: {
        update_ws() {
            // this.connectionStore.ws = this.ws
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