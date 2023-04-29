import { defineStore } from 'pinia'


interface Log {
    text: string,
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