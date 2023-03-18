import { defineStore } from 'pinia'

interface word_replacements {
    [U: string]: string
}

export const useWordReplaceStore = defineStore('wordreplace', {
    state: () => ({
        enabled: true,
        word_replacements: {} as word_replacements
    }),
    getters: {

    },
    actions: {

    }
})