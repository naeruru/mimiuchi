import { defineStore } from 'pinia'

import { ref } from 'vue'
import { useLogsStore } from '@/stores/logs'
import { useSpeechStore } from '@/stores/speech'

export const useTranslationStore = defineStore('translation', () => {
  const enabled = ref(false)
  const type = ref('Transformers.js')
  const source = ref('eng_Latn')
  const target = ref('jpn_Jpan')
  const download = ref(-1) // percent downloaded 0-100. -1 = done
  const show_original = ref(true)

  function onMessageReceived(e: any) {
    const logsStore = useLogsStore()
    console.log(e.data.status)
    switch (e.data.status) {
      case 'progress':
        if (e.data.file === 'onnx/encoder_model_quantized.onnx')
          download.value = e.data.progress
        break
      case 'ready':
        download.value = -1
        break
      case 'update':
        logsStore.logs[e.data.index].translation = e.data.output
        logsStore.loading_result = true
        break
      case 'complete': {
        const { on_submit } = useSpeechStore()

        logsStore.logs[e.data.index].translation = e.data.output[0].translation_text
        logsStore.loading_result = false
        logsStore.logs[e.data.index].isTranslationFinal = true

        on_submit(logsStore.logs[e.data.index], e.data.index)
        break
      }
    }
  }
  return {
    enabled,
    type,
    source,
    target,
    download,
    show_original,
    onMessageReceived,
  }
})
