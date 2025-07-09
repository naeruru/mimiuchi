import type { PipelineType, TranslationPipeline as XenovaTranslationPipeline } from '@huggingface/transformers'
import { env, pipeline } from '@huggingface/transformers'

// Skip local model check
env.allowLocalModels = false

class TranslationPipeline {
  static task: PipelineType = 'translation'
  static model = 'Xenova/nllb-200-distilled-600M'
  static instance: Promise<XenovaTranslationPipeline> | null = null

  static async getInstance(progress_callback?: (progress: any) => void): Promise<XenovaTranslationPipeline> {
    if (this.instance === null) {
      try {
        this.instance = await pipeline(this.task, this.model, { progress_callback, device: 'webgpu' }) as XenovaTranslationPipeline
      }
      catch (e) {
        console.error(e)
        throw e
      }
    }

    return this.instance
  }
}

self.onmessage = async (event) => {
  if (event.data.type === 'transformers-translate') {
    const translator = await TranslationPipeline.getInstance((progress) => {
      self.postMessage(progress)
    })

    const output = await translator(event.data.text, {
      tgt_lang: event.data.tgt_lang,
      src_lang: event.data.src_lang,
      callback_function: (x: any) => {
        self.postMessage({
          status: 'update',
          output: translator.tokenizer.decode(x[0].output_token_ids, { skip_special_tokens: true }),
          index: event.data.index,
        })
      },
    } as any)

    self.postMessage({
      status: 'complete',
      output,
      index: event.data.index,
    })
  }
}
