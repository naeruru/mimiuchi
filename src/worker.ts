// see: https://github.com/xenova/transformers.js
import { pipeline } from '@xenova/transformers'

class MyTranslationPipeline {
  static task = 'translation'
  static model = 'Xenova/nllb-200-distilled-600M'
  static instance: any = null

  static async getInstance(progress_callback: any = null) {
    if (this.instance === null)
      this.instance = pipeline(this.task, this.model, { progress_callback })

    return this.instance
  }
}

self.addEventListener('message', async (event) => {
  // call translator. downloads and caches model if first load
  const translator = await MyTranslationPipeline.getInstance((x: any) => {
    self.postMessage(x)
  })

  const output = await translator(event.data.text, {
    tgt_lang: event.data.tgt_lang,
    src_lang: event.data.src_lang,

    // partial outputs
    callback_function: (x: any) => {
      self.postMessage({
        status: 'update',
        output: translator.tokenizer.decode(x[0].output_token_ids, { skip_special_tokens: true }),
        index: event.data.index,
      })
    },
  })

  // send back to main thread
  self.postMessage({
    status: 'complete',
    output,
    index: event.data.index,
  })
})
