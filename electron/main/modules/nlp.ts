import { dockStart } from '@nlpjs/basic'

import en from './nlp_config/corpus-en.json'
import ja from './nlp_config/corpus-ja.json'

export class NLP {
    dock: any
    manager: any
    tokenizer: any

    constructor() {}

    async initialize() {
        this.dock = await dockStart({
            settings: {
            nlp: {
                languages: ["en", "ja"],
                corpora: [
                    en,
                    ja
                  ]
            }
            },
            use: ['Basic', 'BuiltinMicrosoft', 'LangEn', 'LangJa'],
        })
        const builtin = this.dock.get('builtin-microsoft')
        const ner = this.dock.get('ner')
        ner.container.register('extract-builtin-??', builtin, true)
        
        this.manager = this.dock.get('nlp')
        this.tokenizer = this.dock.get('tokenize')

        // this.process_phrase('set marker to true', 'en')
        // this.process_phrase('マーカーを出してください', 'ja')
    }

    async train() {
        await this.manager.train()
    }

    // en, ja
    async tokenize(phrase: string, language: string) {
        const res = await this.tokenizer.run({locale: language, text: phrase})
        return res.tokens.join(' ')
    }

    async process_phrase(phrase: string, language: string) {
        let result: object

        if (language === 'ja') {
            phrase = await this.tokenize(phrase, language)
        }

        result = await this.manager.process(language, phrase)

        // console.log(result)

        return result
    }
}