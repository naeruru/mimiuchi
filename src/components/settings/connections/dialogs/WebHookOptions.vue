<template>
  <v-row>
    <v-col v-if="modelValue">
      <v-text-field
        v-model="modelValue.url"
        label="URL"
        :rules="url_rules"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import is_electron from '@/helpers/is_electron'
import type { Connection } from '@/stores/connections'
import { useConnectionStore } from '@/stores/connections'

export default {
  name: 'WebHookOptions',
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
    wh: {} as Connection,
    url_rules: [
      (value: string) => {
        return true
        return 'Must be a valid URL'
      },
    ],
  }),
  computed: {
    value: {
      get() {
        return this.modelValue
      },
      set(modelValue: any) {
        this.$emit('update:modelValue', modelValue)
      },
    },
  },
  mounted() {
    this.wh = JSON.parse(JSON.stringify(this.connectionStore.wh))
  },
}
</script>
