import { parentPort } from 'worker_threads';

// see: https://github.com/xenova/transformers.js
import { pipeline } from '@xenova/transformers';

class MyTranslationPipeline {
  static task = 'translation';
  static model = 'Xenova/nllb-200-distilled-600M';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null)
      this.instance = pipeline(this.task, this.model, { progress_callback });

    return this.instance;
  }
}

parentPort.on('message', async (message) => {
  if (message.type === 'transformers-translate') {
    // call translator. downloads and caches model if first load
    const translator = await MyTranslationPipeline.getInstance((download_progress) => {
      parentPort.postMessage({ type: 'transformers-translate-output', data: download_progress });
    });
  
    const output = await translator(message.data.text, {
      tgt_lang: message.data.tgt_lang,
      src_lang: message.data.src_lang,
  
      // partial outputs
      callback_function: (x) => {
        parentPort.postMessage({ type: 'transformers-translate-output', data: {
          status: 'update',
          output: translator.tokenizer.decode(x[0].output_token_ids, { skip_special_tokens: true }),
          index: message.data.index,
        }});
      },
    });
  
    // send back to main thread
    parentPort.postMessage({ type: 'transformers-translate-output', data: {
      status: 'complete',
      output,
      index: message.data.index,
    }});
  }
});
