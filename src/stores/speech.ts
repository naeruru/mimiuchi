import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useDefaultStore } from '@/stores/default'
import { useLogsStore } from '@/stores/logs'
import { useAppearanceStore } from '@/stores/appearance'
import { useOSCStore } from '@/stores/osc'
import { useTranslationStore } from '@/stores/translation'
import { useConnectionsStore } from '@/stores/connections'
import { useWordReplaceStore } from '@/stores/word_replace'
import webhook from '@/helpers/webhook'
import is_electron from '@/helpers/is_electron'
import { i18n } from '@/plugins/i18n'
import { WebSpeech } from '@/modules/speech'

interface ListItem {
  title: string
  value: string
}

interface PinnedLanguages {
  [key: string]: ListItem
}

declare const window: any

export const useSpeechStore = defineStore('speech', () => {
  const stt = ref({
    type: {
      title: 'Web Speech API',
      value: 'webspeech',
    },
    language: 'en-US',
    confidence: 0.9,
    sensitivity: 0.0,
  })
  const tts = ref({
    enabled: false,
    type: {
      title: 'Web Speech API',
      value: 'webspeech',
    },
    voice: '',
    rate: 1,
    pitch: 1,
  })
  const pinned_languages = ref<PinnedLanguages>({})

  function initialize_speech(language: string) {
    const defaultStore = useDefaultStore()
    defaultStore.speech = new WebSpeech(language)
  }

  function toggle_listen() {
    const defaultStore = useDefaultStore()

    // recognition not supported
    if (!defaultStore.speech.recognition) {
      // listening = false
      defaultStore.speech.listening_error = true
      defaultStore.show_snackbar('error', i18n.t('alerts.no_speech'))
      return
    }

    defaultStore.speech.listening = !defaultStore.speech.listening
    if (defaultStore.speech.listening) {
      defaultStore.speech.start()
      defaultStore.speech.onresult = (transcript: string, isFinal: boolean) => {
        const { logs } = useLogsStore()
        const log = {
          transcript,
          isFinal,
          isTranslationFinal: false,
          translate: false,
          hide: 0, // 1 = fade, 2 = hide
        }
        on_submit(log, logs.length - 1)
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
  }

  function typing_event(event: boolean) {
    const defaultStore = useDefaultStore()
    if (is_electron() && !defaultStore.typing_limited) {
      defaultStore.typing_limited = true
      window.ipcRenderer.send('typing-text-event', event)
      setTimeout(() => defaultStore.typing_limited = false, 6 * 1000)
    }
  }

  function speak(input: string) {
    const { speech } = useDefaultStore()
    speech.speak(input)
  }

  async function on_submit(log: any, index: number) {
    if (!log.transcript.trim()) // If the submitted input is only whitespace, do nothing. This may occur if the user only submitted whitespace.
      return

    const logsStore = useLogsStore()
    const { text } = useAppearanceStore()
    const oscStore = useOSCStore()
    const translationStore = useTranslationStore()
    const connectionsStore = useConnectionsStore()
    const defaultStore = useDefaultStore()
    const { replace_words } = useWordReplaceStore()

    logsStore.loading_result = true

    // word replace
    log.transcript = replace_words(log.transcript)
    if (!log.transcript.trim()) { // If the processed input is only whitespace, do nothing. This may occur if the entire log transcript was replaced with whitespace.
      logsStore.loading_result = false

      return
    }

    // scroll to bottom
    const loglist = document.getElementById('loglist')
    if (loglist)
      loglist.scrollTop = loglist.scrollHeight

    if (is_electron() && oscStore.osc_text && oscStore.stt_typing && defaultStore.broadcasting)
      typing_event(true)

    let i = logsStore.logs.length - 1 // track current index
    if ((i >= 0 && !logsStore.logs[i].isFinal) || log.translation) {
      logsStore.logs[index] = log
      // push to log
    }
    else {
      logsStore.logs.push(log)
      i++
    }

    // new line delay
    if (logsStore.wait_interval)
      clearTimeout(logsStore.wait_interval)
    if (text.new_line_delay >= 0) {
      logsStore.wait_interval = setTimeout(() => {
        logsStore.logs[logsStore.logs.length - 1].pause = true
      }, text.new_line_delay * 1000)
    }

    // finalized text
    if (log.isFinal) {
      logsStore.loading_result = false

      // translate if not translating and enabled
      if (is_electron() && translationStore.enabled && !log.translate && !log.translation) {
        logsStore.logs[i].translate = true
        if (defaultStore.worker) {
          defaultStore.worker.postMessage({
            text: log.transcript,
            src_lang: translationStore.source,
            tgt_lang: translationStore.target,
            index: i,
          })
        }
      }

      // timestamp
      logsStore.logs[i].time = new Date()
      // text-to-speech
      if (tts.value.enabled && tts.value.voice)
        speak(log.transcript)

      // fadeout text
      if (text.enable_fade) {
        setTimeout(() => {
          if (!logsStore.logs[i].pause)
            return

          let pauses = 0
          // fade out all text since last pause
          while (i >= 0 && pauses < 2) {
            logsStore.logs[i].hide = 1
            setTimeout(i => logsStore.logs[i].hide = 2, text.fade_time * 1000, i)
            if (logsStore.logs[i].pause)
              pauses += 1
            i -= 1
          }
        }, text.hide_after * 1000)
      }

      // webhook
      if (connectionsStore.wh.enabled && defaultStore.broadcasting)
        webhook.post(connectionsStore.wh.url, { transcript: log.transcript })
    }

    // send text via osc
    if (is_electron() && (oscStore.osc_text) && defaultStore.broadcasting) {
      if (log.isTranslationFinal && log.translation) {
        const transcript = (translationStore.show_original) ? `${log.transcript} (${log.translation})` : log.translation
        const data = {
          transcript,
          hide_ui: !oscStore.show_keyboard,
          sfx: oscStore.sfx,
        }
        window.ipcRenderer.send('send-text-event', JSON.stringify(data))
      }
      else if (log.isFinal && !log.translate) {
        const data = {
          transcript: log.transcript,
          hide_ui: !oscStore.show_keyboard,
          sfx: oscStore.sfx,
        }
        window.ipcRenderer.send('send-text-event', JSON.stringify(data))
      }
    }
    else if (defaultStore.ws1) {
      defaultStore.ws1.send(`{"type": "text", "data": ${JSON.stringify(log)}}`)
    }
  }

  function pin_language(selected_language: ListItem) {
    const pins = pinned_languages

    // Pin
    pins.value[selected_language.title] = selected_language

    // Alphabetically sort
    const sortedKeys = Object.keys(pins.value).sort()
    const sortedPins = {} as PinnedLanguages

    sortedKeys.forEach((key) => {
      sortedPins[key] = pins.value[key]
    })

    pinned_languages.value = sortedPins
  }

  function unpin_language(selected_language: ListItem) {
    const pins = pinned_languages

    // Unpin
    delete pins.value[selected_language.title]
  }

  function is_pinned_language(selected_language: ListItem) {
    const pins = pinned_languages

    return pins.value.hasOwnProperty(selected_language.title)
  }

  return {
    stt,
    tts,
    pinned_languages,
    initialize_speech,
    toggle_listen,
    typing_event,
    speak,
    on_submit,
    pin_language,
    unpin_language,
    is_pinned_language,
  }
})
