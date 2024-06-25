import { defineStore } from 'pinia'
import { ref } from 'vue'

interface WordReplacements {
  [U: string]: string
}

export const useWordReplaceStore = defineStore('wordreplace', () => {
  const enabled = ref(true)
  const match_whole_word = ref(true)
  const match_case = ref(false)

  const word_replacements = ref<WordReplacements>({})

  const word_replacements_lowercase = ref<WordReplacements>({})

  // Escape regex metacharacters
  function escapeRegExp(input: string) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  // Replace words.
  // Longer keys have higher priority (e.g., "Hello world" → "apple", "Hello" → "banana".
  // The transcript "Hello world" will become "apple"). Keys are sorted by the Word Replace component.
  function replace_words(input: string): string {
    if (!enabled.value || !Object.keys(word_replacements.value).length)
      return input

    let joined_keys: string[] = []
    let input_interpretation: string

    // Interpret depending on the "Match case" option
    if (!match_case.value) {
      input_interpretation = input.toLowerCase()
      joined_keys = Object.keys(word_replacements_lowercase.value)
    }
    else {
      input_interpretation = input
      joined_keys = Object.keys(word_replacements.value)
    }

    const regex_keys = joined_keys.map(key => escapeRegExp(key)).join('|')

    // Build pattern depending on options
    let pattern

    // Option: Word/phrase match. Word boundaries prevent unexpected replacements.
    // (e.g, "script" → "HELLO" would undesirably cause "description" → "deHELLOion").
    if (!match_whole_word.value)
      pattern = regex_keys
    else
      pattern = `(?<![\\w*])(${regex_keys})(?![\\w*])`

    const replace_re = new RegExp(pattern, 'g')

    return input_interpretation.replace(replace_re, (matched) => {
      if (!match_case.value)
        return word_replacements_lowercase.value[matched.toLowerCase()]
      else
        return word_replacements.value[matched]
    })
  }

  return {
    enabled,
    match_whole_word,
    match_case,
    word_replacements,
    word_replacements_lowercase,
    replace_words,
  }
})
