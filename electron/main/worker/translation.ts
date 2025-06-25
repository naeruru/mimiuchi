import type { PipelineType, TranslationPipeline as XenovaTranslationPipeline } from '@xenova/transformers'
import { parentPort } from 'node:worker_threads'
import { pipeline } from '@xenova/transformers'

// see: https://github.com/xenova/transformers.js

class TranslationPipeline {
  static task: PipelineType = 'translation'
  static model = 'Xenova/nllb-200-distilled-600M'
  static instance: Promise<XenovaTranslationPipeline> | null = null

  static async getInstance(progress_callback: ((progress: any) => void) | null = null): Promise<XenovaTranslationPipeline> {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback }) as Promise<XenovaTranslationPipeline>
    }

    return this.instance
  }
}

parentPort?.on('message', async (message) => {
  if (message.type === 'transformers-translate') {
    // call translator. downloads and caches model if first load
    const translator = await TranslationPipeline.getInstance((download_progress) => {
      parentPort?.postMessage(download_progress)
    })

    const output = await translator(message.data.text, {
      tgt_lang: message.data.tgt_lang,
      src_lang: message.data.src_lang,

      // partial outputs
      callback_function: (x: any) => {
        parentPort?.postMessage({
          status: 'update',
          output: translator.tokenizer.decode(x[0].output_token_ids, { skip_special_tokens: true }),
          index: message.data.index,
        })
      },
    })

    // send back to main thread
    parentPort?.postMessage({
      status: 'complete',
      output,
      index: message.data.index,
    })
  }
})
