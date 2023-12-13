import { defineStore } from 'pinia'

export interface Log {
  transcript: string // text that was said
  isFinal: boolean // is final interpretation
  translate: boolean // is there a translation
  translation?: string // translation of transcript (if exists)
  isTranslationFinal: boolean // is final translation
  hide: number // hide text from view
  time?: Date // timestamp of transcript
  pause?: boolean // if user paused
}

export const useLogStore = defineStore('logs', {
  state: () => ({
    logs: [] as Log[],
    loading_result: false,
    wait_interval: undefined as undefined | ReturnType<typeof setTimeout>,
  }),
  getters: {

  },
  actions: {
    export() {
      const now = new Date()
      let text = ''
      this.logs.forEach(log => text += `[${log.time?.toISOString()}] ${log.transcript}\n`)
      const blob = new Blob([text], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      const filename = `transcript_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.txt`
      a.setAttribute('href', url)
      a.setAttribute('download', filename)
      a.click()
    },
  },
})
