import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useLogsStore } from '@/stores/logs'
import { useSpeechStore } from '@/stores/speech'
import TranslationWorker from '@/workers/translation.worker.ts?worker'

export const useTranslationStore = defineStore('translation', () => {
  const enabled = ref(false)
  const type = ref('Transformers.js')
  const source = ref('eng_Latn')
  const target = ref('jpn_Jpan')
  const download = ref(-1) // percent downloaded 0-100. -1 = done
  const show_original = ref(true)
  const worker = ref<Worker | null>(null)

  function getWorker(): Worker {
    if (!worker.value) {
      worker.value = new TranslationWorker()
      worker.value.onmessage = (event) => {
        onMessageReceived(event.data)
      }
    }
    return worker.value
  }

  function translate(text: string, index: number) {
    getWorker().postMessage({
      type: 'transformers-translate',
      text,
      tgt_lang: target.value,
      src_lang: source.value,
      index,
    })
  }

  function onMessageReceived(data: any) {
    const logsStore = useLogsStore()
    switch (data.status) {
      case 'progress':
        if (data.file === 'onnx/encoder_model_quantized.onnx')
          download.value = data.progress
        break
      case 'ready':
        download.value = -1
        break
      case 'update':
        logsStore.logs[data.index].translation = data.output
        logsStore.loading_result = true
        break
      case 'complete': {
        const { on_submit } = useSpeechStore()

        logsStore.logs[data.index].translation = data.output[0].translation_text
        logsStore.loading_result = false
        logsStore.logs[data.index].isTranslationFinal = true

        on_submit(logsStore.logs[data.index], data.index)
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
    translate,
  }
})
