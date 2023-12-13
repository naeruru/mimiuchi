import { defineStore } from 'pinia'

interface Param {
  ip: string
  port: string
  route: string
  keywords: Keyword[]
  assigns: Assign[]
}
interface Keyword {
  enabled: boolean
  text: string
}
interface Assign {
  keyword: string
  type: string
  set: boolean | number | string
}

export const useOSCStore = defineStore('osc', {
  state: () => ({
    ws: {
      ip: '127.0.0.1',
      port: '8999',
    },

    ip: '127.0.0.1',
    port: '9000',
    osc_text: true,
    text_typing: true, // typing indicator
    stt_typing: true, // talking indicator
    sfx: true, // vrchat sfx indicator
    show_keyboard: false,

    osc_params: [] as Param[],
  }),
  getters: {

  },
  actions: {

  },
})
