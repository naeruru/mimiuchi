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
      const replace_re = new RegExp(Object.keys(this.word_replacements).join('|'), 'gi')
      return input.replace(replace_re, (matched) => {
        return this.word_replacements[matched.toLowerCase()]
      })
    },
  },
})
