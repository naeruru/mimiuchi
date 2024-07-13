<template>
  <v-row>
    <v-col v-if="model">
      <v-text-field
        v-if="!is_electron()"
        v-model="model.url"
        label="URL"
        prefix="ws://"
      />
      <v-text-field
        v-if="is_electron()"
        v-model="model.port"
        :label="$t('settings.connections.ws.port')"
        type="number"
        :rules="port_rules"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import is_electron from '@/helpers/is_electron'
import type { Connection } from '@/stores/connections'
import { useConnectionsStore } from '@/stores/connections'

const model = defineModel<Connection>()

const connectionsStore = useConnectionsStore()

const ws = ref<Connection>()
const port_rules = ref([
  (value: number) => {
    if (value >= 1 && value <= 65535)
      return true
    return 'Must be a valid port number'
  },
])

onMounted(() => {
  ws.value = JSON.parse(JSON.stringify(connectionsStore.ws))
})
</script>
