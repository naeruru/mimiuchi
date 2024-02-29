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
    escapeRegExp(input: string) {
      return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex metacharacters.
    },
    replace_words(input: string): string {
      if (!this.enabled || !Object.keys(this.word_replacements).length)
        return input

      // Replace words.
      // Keys are case-sensitive (e.g., "Hello" and "hello" are different replacement keys).
      // Longer keys have higher priority. (E.g., "Hello world" → "apple", "Hello" → "banana". The transcript "Hello world" will become "apple" instead of "banana world".) Keys are sorted when Word Replace is unmounted.
      // Word boundaries prevent abnormal replacements (e.g, "script" → "HELLO" would cause "description" → "deHELLOion").
      // The shortest censored word is expected to have at least 2 asterisks.
      const joined = Object.keys(this.word_replacements)
        .map(key => this.escapeRegExp(key))
        .join("|")

      const replace_re = new RegExp(`\\b(${joined})(?![\\w*]{2,})`, "g")
      
      return input.replace(replace_re, (matched) => {
        return this.word_replacements[matched]
      })
    },
  },
})
