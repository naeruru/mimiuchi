import { defineStore } from 'pinia'
import { useDefaultStore } from '@/stores/default'
import { useLogStore } from '@/stores/logs'
import { useAppearanceStore } from '@/stores/appearance'
import { useOSCStore } from '@/stores/osc'
import { useTranslationStore } from '@/stores/translation'
import { useConnectionStore } from '@/stores/connections'
import { useWordReplaceStore } from '@/stores/word_replace'
import webhook from '@/helpers/webhook'
import is_electron from '@/helpers/is_electron'
import { i18n } from '@/plugins/i18n'
import { WebSpeech } from '@/modules/speech'

declare const window: any

export const useSpeechStore = defineStore('speech', {
  state: () => ({
    stt: {
      type: {
        title: 'Web Speech API',
        value: 'webspeech',
      },
      language: 'en-US',
      confidence: 0.9,
      sensitivity: 0.0,
    },
    tts: {
      enabled: false,
      type: {
        title: 'Web Speech API',
        value: 'webspeech',
      },
      voice: '',
      rate: 1,
      pitch: 1,
    },
  }),
  getters: {

  },
  actions: {
    initialize_speech(language: string) {
      const defaultStore = useDefaultStore()
      defaultStore.speech = new WebSpeech(language)
    },
    toggle_listen() {
      const defaultStore = useDefaultStore()

      // recognition not supported
      if (!defaultStore.speech.recognition) {
        // this.listening = false
        defaultStore.speech.listening_error = true
        defaultStore.show_snackbar('error', i18n.t('alerts.no_speech'))
        return
      }

      defaultStore.speech.listening = !defaultStore.speech.listening
      if (defaultStore.speech.listening) {
        defaultStore.speech.start()
        defaultStore.speech.onresult = (transcript: string, isFinal: boolean) => {
          const { logs } = useLogStore()
          const log = {
            transcript,
            isFinal,
            isTranslationFinal: false,
            translate: false,
            hide: 0, // 1 = fade, 2 = hide
          }
          this.on_submit(log, logs.length - 1)
        }
        defaultStore.speech.onend = () => {
          // restart if auto stopped
          if (defaultStore.speech.listening)
            defaultStore.speech.start()
        }
        defaultStore.speech.onerror = (event: any) => {
          let desc = ''
          if (event.error === 'no-speech')
            return // web-speech: no sound detected
          if (event.error === 'not-allowed')
            desc = i18n.t('alerts.mic_error')
          if (event.error === 'aborted')
            desc = i18n.t('alerts.device_in_use')
          defaultStore.speech.listening = false
          defaultStore.speech.listening_error = true
          defaultStore.show_snackbar('error', desc)
          defaultStore.speech.stop()
        }
      }
      else {
        defaultStore.speech.stop()
      }
    },
    typing_event(event: boolean) {
      const defaultStore = useDefaultStore()
      if (is_electron() && !defaultStore.typing_limited) {
        defaultStore.typing_limited = true
        window.ipcRenderer.send('typing-text-event', event)
        setTimeout(() => defaultStore.typing_limited = false, 6 * 1000)
      }
    },
    speak(input: string) {
      const { speech } = useDefaultStore()
      speech.speak(input)
    },
    async on_submit(log: any, index: number) {
      if (!log.transcript.replace(/\s/g, '').length)
        return

      const logStore = useLogStore()
      const { text } = useAppearanceStore()
      const oscStore = useOSCStore()
      const translationStore = useTranslationStore()
      const connectionStore = useConnectionStore()
      const defaultStore = useDefaultStore()
      const { replace_words } = useWordReplaceStore()

      logStore.loading_result = true

      // word replace
      log.transcript = replace_words(log.transcript)

      // scroll to bottom
      const loglist = document.getElementById('loglist')
      if (loglist)
        loglist.scrollTop = loglist.scrollHeight

      if (is_electron() && oscStore.osc_text && oscStore.stt_typing && defaultStore.broadcasting)
        this.typing_event(true)

      let i = logStore.logs.length - 1 // track current index
      if (i >= 0 && !logStore.logs[i].isFinal || log.translation) {
        logStore.logs[index] = log
        // push to log
      }
      else {
        logStore.logs.push(log)
        i++
      }

      // new line delay
      if (logStore.wait_interval)
        clearTimeout(logStore.wait_interval)
      if (text.new_line_delay >= 0) {
        logStore.wait_interval = setTimeout(() => {
          logStore.logs[logStore.logs.length - 1].pause = true
        }, text.new_line_delay * 1000)
      }

      // finalized text
      if (log.isFinal) {
        logStore.loading_result = false

        // translate if not translating and enabled
        if (translationStore.enabled && !log.translate && !log.translation) {
          logStore.logs[i].translate = true
          defaultStore.worker.postMessage({
            text: log.transcript,
            src_lang: translationStore.source,
            tgt_lang: translationStore.target,
            index: i,
          })
        }

        // timestamp
        logStore.logs[i].time = new Date()
        // text-to-speech
        if (this.tts.enabled && this.tts.voice)
          this.speak(log.transcript)

        // fadeout text
        if (text.enable_fade) {
          setTimeout(() => {
            if (!logStore.logs[i].pause)
              return

            let pauses = 0
            // fade out all text since last pause
            while (i >= 0 && pauses < 2) {
              logStore.logs[i].hide = 1
              setTimeout(i => logStore.logs[i].hide = 2, text.fade_time * 1000, i)
              if (logStore.logs[i].pause)
                pauses += 1
              i -= 1
            }
          }, text.hide_after * 1000)
        }

        // webhook
        if (connectionStore.wh.enabled && defaultStore.broadcasting)
          webhook.post(connectionStore.wh.url, { transcript: log.transcript })
      }

      // send text via osc
      if (is_electron() && (oscStore.osc_text) && defaultStore.broadcasting) {
        if (log.isTranslationFinal && log.translation) {
          const transcript = (translationStore.show_original) ? `${log.transcript} (${log.translation})` : log.translation
          window.ipcRenderer.send('send-text-event', `{ "transcript": "${transcript}", "hide_ui": ${!oscStore.show_keyboard}, "sfx": ${oscStore.sfx} }`)
        }
        else if (log.isFinal && !log.translate) {
          window.ipcRenderer.send('send-text-event', `{ "transcript": "${log.transcript}", "hide_ui": ${!oscStore.show_keyboard}, "sfx": ${oscStore.sfx} }`)
        }
      }
      else if (defaultStore.ws) {
        defaultStore.ws.send(`{"type": "text", "data": ${JSON.stringify(log)}}`)
      }
    },
  },
})
