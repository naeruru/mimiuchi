import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Profile {
  [name: string]: Trigger[]
}
interface Trigger {
  ip: string
  port: number
  route: string
  keywords: Keyword[]
  assigns: Assign[]
}
interface Keyword {
  enabled: boolean
  text: string
}
export interface Assign {
  keyword: string
  type: string
  set1: any
  set2: any
  behavior: string
  pulse_duration: number
}

export const useOSCStore = defineStore('osc', () => {
  const ip = ref('127.0.0.1')
  const port = ref(9000)
  const osc_text = ref(true)
  const text_typing = ref(true)
  const stt_typing = ref(true)
  const sfx = ref(true)
  const show_keyboard = ref(false)

  const osc_profiles = ref<Profile>({ Default: [] })

  const current_profile = ref<string>('Default')

  return {
    ip,
    port,
    osc_text,
    text_typing,
    stt_typing,
    sfx,
    show_keyboard,
    osc_profiles,
    current_profile,
  }
})
