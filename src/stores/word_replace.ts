import { defineStore } from 'pinia'

interface word_replacements {
  [U: string]: string
}

export const useWordReplaceStore = defineStore('wordreplace', {
  state: () => ({
    enabled: true,
    match_whole_word: true,
    match_case: false,
    word_replacements: {} as word_replacements,
    word_replacements_lowercase: {} as word_replacements,
  }),
  getters: {

  },
  actions: {
    // Escape regex metacharacters
    escapeRegExp(input: string) {
      return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    },
    // Add case insensitivity
    case_insensitive_regex(input: string) {
      return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    },
    // Replace words.
    // Longer keys have higher priority (e.g., "Hello world" → "apple", "Hello" → "banana".
    // The transcript "Hello world" will become "apple"). Keys are sorted by the Word Replace component.
    replace_words(input: string): string {
      if (!this.enabled || !Object.keys(this.word_replacements).length)
        return input

      let joined_keys: string[] = []
      let input_interpretation: string

      // Interpret depending on the "Match case" option.
      if (!this.match_case) {
        input_interpretation = input.toLowerCase()
        joined_keys = Object.keys(this.word_replacements_lowercase)
      }
      else {
        input_interpretation = input
        joined_keys = Object.keys(this.word_replacements)
      }

      const regex_keys = joined_keys.map(key => this.escapeRegExp(key)).join('|')

      // Build pattern depending on options.
      let pattern

      // Option: Word/phrase match. Word boundaries prevent unexpected replacements
      // (e.g, "script" → "HELLO" would undesirably cause "description" → "deHELLOion").
      if (!this.match_whole_word)
        pattern = regex_keys
      else
        pattern = `(?<![\\w*])(${regex_keys})(?![\\w*])`

      const replace_re = new RegExp(pattern, 'g')

      return input_interpretation.replace(replace_re, (matched) => {
        if (!this.match_case)
          return this.word_replacements_lowercase[matched.toLowerCase()]
        else
          return this.word_replacements[matched]
      })
    },
  },
})
