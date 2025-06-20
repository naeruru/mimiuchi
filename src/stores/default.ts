import { defineStore } from 'pinia'

import { ref } from 'vue'
import type { WebSpeech } from '@/modules/speech'

export const useDefaultStore = defineStore('default', () => {
  const typing_limited = ref(false)
  const broadcasting = ref<boolean>(false)
  const connection_count = ref<number>(0)
  const speech = ref(<WebSpeech>{})
  const audio = ref<HTMLAudioElement>(new Audio())
  const snackbar = ref({
    enabled: false,
    type: 'error',
    desc: '',
  })

  function show_snackbar(type: string, desc: string) {
    console.log(desc)
    snackbar.value.type = type
    snackbar.value.desc = desc
    snackbar.value.enabled = true
  }

  return {
    typing_limited,
    broadcasting,
    connections_count: connection_count,
    speech,
    audio,
    snackbar,
    show_snackbar,
  }
})
