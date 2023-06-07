import { defineStore } from 'pinia'


export interface Log {
    transcript: string,
    isFinal: boolean,
    hide: number
}

export const useLogStore = defineStore('logs', {
    state: () => ({
        logs: [] as Log[],
    }),
    getters: {

    },
    actions: {

    }
})