import { defineStore } from 'pinia'

import { useLogStore } from '@/stores/logs'
import { useSpeechStore } from '@/stores/speech'

export const useTranslationStore = defineStore('translation', {
  state: () => ({
    enabled: false,
    type: 'Transformers.js',
    source: 'eng_Latn',
    target: 'jpn_Jpan',
    download: -1, // percent downloaded 0-100. -1 = done
    show_original: true,
  }),
  getters: {

  },
  actions: {
    onMessageReceived(e: any) {
      const logStore = useLogStore()
      switch (e.data.status) {
        case 'progress':
          if (e.data.file === 'onnx/encoder_model_quantized.onnx')
            this.download = e.data.progress
          break
        case 'ready':
          this.download = -1
          break
        case 'update':
          logStore.logs[e.data.index].translation = e.data.output
          logStore.loading_result = true
          break
        case 'complete':
          const { on_submit } = useSpeechStore()

          logStore.logs[e.data.index].translation = e.data.output[0].translation_text
          logStore.loading_result = false
          logStore.logs[e.data.index].isTranslationFinal = true

          on_submit(logStore.logs[e.data.index], e.data.index)
          break
      }
    },
  },
})
