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
    word_replacements_lowercase: {} as word_replacements,
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
      // Longer keys have higher priority (e.g., "Hello world" → "apple", "Hello" → "banana". The transcript "Hello world" will become "apple"). Keys are sorted by the Word Replace component.

      // Interpret depending on the "Match case" option.
      let inputInterpretation
      let joinedKeys

      if (!this.match_case) { // Option: Do not match case. Case-insensitive.
        inputInterpretation = input.toLowerCase()
        joinedKeys = Object.keys(this.word_replacements_lowercase)
      }
      else { // Option: Match case. Case-sensitive.
        inputInterpretation = input
        joinedKeys = Object.keys(this.word_replacements)
      }

      joinedKeys = joinedKeys.map(key => this.escapeRegExp(key)).join("|")

      // Build pattern depending on options.
      let pattern

      if (!this.match_whole_word) // Option. Word/phrase match. Word boundaries prevent unexpected replacements (e.g, "script" → "HELLO" would undesirably cause "description" → "deHELLOion").
        pattern = joinedKeys
      else
        pattern = "(?<![\\w*])(" + joinedKeys + ")(?![\\w*])"

      const replace_re = new RegExp(pattern, "g")

      return inputInterpretation.replace(replace_re, (matched) => {
        if (!this.match_case)
          return this.word_replacements_lowercase[matched.toLowerCase()]
        else
          return this.word_replacements[matched]
      })
    },
  },
})
