import { defineStore } from 'pinia'

interface word_replacements {
  [U: string]: string
}

export const useWordReplaceStore = defineStore('wordreplace', {
  state: () => ({
    enabled: true,
    word_replacements: {} as word_replacements,
  }),
  getters: {

  },
  actions: {
    replace_words(input: string): string {
      if (!this.enabled || !Object.keys(this.word_replacements).length)
        return input

      // Replace words.
      // Keys are case-sensitive (e.g., "Hello" and "hello" are different replacement keys).
      // Word boundaries (\b) prevent abnormal replacements (e.g, "script" → "HELLO" would cause "description" → "deHELLOion").
      const replace_re = new RegExp("\\b(" + Object.keys(this.word_replacements).join("|") + ")\\b", "g");
      
      return input.replace(replace_re, (matched) => {
        return this.word_replacements[matched]
      })
    },
  },
})
