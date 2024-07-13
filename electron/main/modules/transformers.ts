// see: https://github.com/xenova/transformers.js
import { PipelineType, pipeline } from '@xenova/transformers'

export class TranslationPipeline {
  static task: PipelineType = 'translation'
  static model = 'Xenova/nllb-200-distilled-600M'
  static instance: any = null

  static async getInstance(progress_callback: any = null) {
    if (this.instance === null)
      this.instance = pipeline(this.task, this.model, { progress_callback })

    return this.instance
  }

  async translate(win: any, data: any) {
    // call translator. downloads and caches model if first load
    const translator = await TranslationPipeline.getInstance((x: any) => {
        // self.postMessage(x)
        win.webContents.send('transformers-translate-render', x)
    })
  
    // console.log(data)
    const output = await translator(data.text, {
      tgt_lang: data.tgt_lang,
      src_lang: data.src_lang,
  
      // partial outputs
      callback_function: (x: any) => {
        win.webContents.send('transformers-translate-render', {
          status: 'update',
          output: translator.tokenizer.decode(x[0].output_token_ids, { skip_special_tokens: true }),
          index: data.index,
        })
      },
    })
  
    // send back to main thread
    win.webContents.send('transformers-translate-render', {
      status: 'complete',
      output,
      index: data.index,
    })
  }
}

// self.addEventListener('message', async (event) => {
//   // call translator. downloads and caches model if first load
//   const translator = await TranslationPipeline.getInstance((x: any) => {
//     self.postMessage(x)
//   })

//   const output = await translator(event.data.text, {
//     tgt_lang: event.data.tgt_lang,
//     src_lang: event.data.src_lang,

//     // partial outputs
//     callback_function: (x: any) => {
//       self.postMessage({
//         status: 'update',
//         output: translator.tokenizer.decode(x[0].output_token_ids, { skip_special_tokens: true }),
//         index: event.data.index,
//       })
//     },
//   })

//   // send back to main thread
//   self.postMessage({
//     status: 'complete',
//     output,
//     index: event.data.index,
//   })
// })