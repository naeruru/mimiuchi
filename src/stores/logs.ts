import { defineStore } from 'pinia'


export interface Log {
    transcript: string,
    isFinal: boolean,
    hide: number,
    time?: Date,
}

export const useLogStore = defineStore('logs', {
    state: () => ({
        logs: [] as Log[],
    }),
    getters: {

    },
    actions: {
        export() {
            const now = new Date()
            let text = ''
            this.logs.forEach(log => text += `[${log.time?.toISOString()}] ${log.transcript}\n`)
            const blob = new Blob([ text ], {type: 'text/plain'})
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            const filename = `transcript_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.txt`
            a.setAttribute("href", url)
            a.setAttribute("download", filename)
            a.click()
        }
    }
})