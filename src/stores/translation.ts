import { defineStore } from 'pinia'

import { useDefaultStore } from './default'
import { useLogStore } from './logs'
import { useSpeechStore } from './speech'

export const useTranslationStore = defineStore('translation', {
    state: () => ({
        enabled: false,
        type: 'Transformers.js',
        source: 'eng_Latn',
        target: 'jpn_Jpan',
        key: '', // api key
        download: -1, // percent downloaded 0-100. -1 = done
        show_original: true,
    }),
    getters: {

    },
    actions: {
        async start_service(log: any, i: number) {
            const logStore = useLogStore()
            const defaultStore = useDefaultStore()

            logStore.logs[i].translate = true
            switch (this.type) {
                case 'Transformers.js':
                    defaultStore.worker.postMessage({
                        text: log.transcript,
                        src_lang: this.source,
                        tgt_lang: this.target,
                        index: i,
                    })
                    break
                case 'DeepL':
                    const response: any = await this.translate_deepl(log.transcript)
                    console.log(response)
                    break
                default:
                    break
            }
        },
        async translate_deepl(transcript: string) {
            let url: string
            if (this.key.endsWith(':fx')) {
                url = 'https://api-free.deepl.com/v2/translate'
            } else {
                url = 'https://api.deepl.com/v2/translate'
            }
            return fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `DeepL-Auth-Key ${this.key}`,
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": '*',
                },
                body: JSON.stringify({
                    type: 'deepl',
                    text: [ transcript ],
                    source_lang: 'EN',
                    target_lang: 'JA'
                })
            })
        },
        onMessageReceived(e: any) {
            const logStore = useLogStore()
            switch(e.data.status) {
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
                    const { on_submit} = useSpeechStore()

                    logStore.logs[e.data.index].translation = e.data.output[0].translation_text
                    logStore.loading_result = false
                    logStore.logs[e.data.index].isTranslationFinal = true

                    on_submit(logStore.logs[e.data.index], e.data.index)
                    break
            }
        },
    }
})