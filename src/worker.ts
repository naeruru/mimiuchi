// see: https://github.com/xenova/transformers.js
import { pipeline } from '@xenova/transformers'
import type { PipelineType } from '@xenova/transformers'

class MyTranslationPipeline {
  static task = 'translation'
  static model = 'Xenova/nllb-200-distilled-600M'
  static instance: any = null

  static async getInstance(progress_callback: any = null) {
    if (this.instance === null)
      this.instance = pipeline(<PipelineType>this.task, this.model, { progress_callback })

    return this.instance
  }
}

globalThis.addEventListener('message', async (event) => {
  // call translator. downloads and caches model if first load
  console.log('in the worker\'s addEventListener function')
  const translator = await MyTranslationPipeline.getInstance((x: any) => {
    console.log('posting message in "translator"')
    globalThis.postMessage(x)
  })

  const output = await translator(event.data.text, {
    tgt_lang: event.data.tgt_lang,
    src_lang: event.data.src_lang,

    // partial outputs
    callback_function: (x: any) => {
      console.log('posting message in "output"')
      globalThis.postMessage({
        status: 'update',
        output: translator.tokenizer.decode(x[0].output_token_ids, { skip_special_tokens: true }),
        index: event.data.index,
      })
    },
  })

  // send back to main thread
  console.log('posting message for completion')
  globalThis.postMessage({
    status: 'complete',
    output,
    index: event.data.index,
  })
})
