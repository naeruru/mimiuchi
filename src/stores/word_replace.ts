import { defineStore } from 'pinia'

interface word_replacements {
  [U: string]: string
}

export const useWordReplaceStore = defineStore('wordreplace', {
  state: () => ({
    enabled: true,
    match_whole_word: false,
    match_case: false,
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
      // Longer keys have higher priority (e.g., with "Hello world" → "apple" and "Hello" → "banana", the transcript "Hello world" will become "apple".). Keys are sorted in the Word Replace component.
      const joined = Object.keys(this.word_replacements)
        .map(key => this.escapeRegExp(key))
        .join("|")

      const replace_re = new RegExp(joined, "g")
      
      return input.replace(replace_re, (matched) => {
        return this.word_replacements[matched.toLowerCase()]
      })
    },
  },
})
