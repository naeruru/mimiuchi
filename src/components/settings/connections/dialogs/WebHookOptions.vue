<template>
  <v-row>
    <v-col v-if="model">
      <v-text-field
        v-model="model.url"
        label="URL"
        :rules="url_rules"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Connection } from '@/stores/connections'
import { useConnectionsStore } from '@/stores/connections'

const model = defineModel()
const connectionStore = useConnectionsStore()

const wh = ref<Connection>()
const url_rules = ref([
  (value: string) => {
    return true
    return 'Must be a valid URL'
  },
])

onMounted(() => {
  wh.value = JSON.parse(JSON.stringify(connectionStore.wh))
})
</script>
