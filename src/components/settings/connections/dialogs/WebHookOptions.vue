<template>
  <v-row>
    <v-col v-if="model">
      <v-text-field
        v-model="model.url"
        label="URL"
        :rules="[rules.required]"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { Connection } from '@/stores/connections'
import { useConnectionsStore } from '@/stores/connections'
import { onMounted, ref } from 'vue'

const model = defineModel<Connection>()
const connectionsStore = useConnectionsStore()

const wh = ref<Connection>()
const rules = ref({
  required: (value: string) => {
    return !!value || 'Field is required'
  },
})

onMounted(() => {
  wh.value = JSON.parse(JSON.stringify(connectionsStore.wh))
})
</script>
