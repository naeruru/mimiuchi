<template>
  <v-row>
    <v-col v-if="modelValue">
      <v-text-field
        v-if="!is_electron()"
        v-model="modelValue.url"
        label="URL"
        prefix="ws://"
      />
      <v-text-field
        v-if="is_electron()"
        v-model="modelValue.port"
        :label="$t('settings.connections.ws.port')"
        type="number"
        :rules="port_rules"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import is_electron from '@/helpers/is_electron'
import type { Connection } from '@/stores/connections'
import { useConnectionStore } from '@/stores/connections'

export default {
  name: 'WebSocketOptions',
  props: {
    modelValue: Object,
    type: String,
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
    ws: {} as Connection,
    port_rules: [
      (value: number) => {
        if (value >= 1 && value <= 65535)
          return true
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
      },
    },
  },
  mounted() {
    this.ws = JSON.parse(JSON.stringify(this.connectionStore.ws))
  },
}
</script>
