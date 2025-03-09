import tiktok from '@/constants/voices/tiktok'
import yukumo from '@/constants/voices/yukumo'
import is_electron from '@/helpers/is_electron'
import { WebSpeech } from '@/modules/speech'
import { i18n } from '@/plugins/i18n'
import { sendWebhook } from '@/services/webhook.service'
import { useAppearanceStore } from '@/stores/appearance'
import { useConnectionsStore } from '@/stores/connections'
import { useDefaultStore } from '@/stores/default'
import { useLogsStore } from '@/stores/logs'
import { useOSCStore } from '@/stores/osc'
import { useTranslationStore } from '@/stores/translation'
import { useWordReplaceStore } from '@/stores/word_replace'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ListItem {
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
    type: 'tiktok',
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
      return false
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

    return defaultStore.speech.listening
  }

  function submit_text(input_text: string, input_index: number, isFinal: boolean) {
    const defaultStore = useDefaultStore()
    const connectionsStore = useConnectionsStore()
    const logsStore = useLogsStore()

    if (connectionsStore.wh.enabled && defaultStore.broadcasting) {
      try {
        sendWebhook(connectionsStore.wh.url, { transcript: input_text, isFinal })
      }
      catch (error) {
        console.error('Failed to send webhook:', error)
      }
    }

    if (input_text) {
      if (input_index === logsStore.logs.length - 1) {
        logsStore.logs[input_index].transcript = input_text
      }
      else {
        const log = {
          transcript: input_text,
          isFinal: false,
          isTranslationFinal: false,
          translate: false,
          hide: 0, // 1 = fade, 2 = hide
        }
        logsStore.logs.push(log)
      }

      if (defaultStore.ws1) {
        defaultStore.ws1.send(`{"type": "text", "data": ${JSON.stringify(logsStore.logs[input_index])}}`)
      }
    }
    else {
      if (input_index === logsStore.logs.length - 1) {
        logsStore.logs[input_index].transcript = input_text
      }
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

  async function speak(input: string) {
    let response: any
    const defaultStore = useDefaultStore()
    switch (tts.value.type) {
      case 'tiktok':
        const body = {
          text: input,
          voice: tiktok.voices.find(voice => voice.name === tts.value.voice)?.lang,
        }
        try {
          response = await fetch(tiktok.api, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const data = await response.json()

          if (!defaultStore.audio.src || defaultStore.audio.ended) {
            defaultStore.audio.src = `data:audio/mpeg;base64,${data.data}`
            defaultStore.audio.play()
          }
          else {
            defaultStore.audio.onended = function () {
              defaultStore.audio.src = `data:audio/mpeg;base64,${data.data}`
              defaultStore.audio.play()
              defaultStore.audio.onended = null
            }
          }
        }
        catch (e) {
          console.error('TikTok TTS error:', e)
        }
        break

      case 'webspeech':
        const { speech } = useDefaultStore()
        if (speech && speech.speak) {
          speech.speak(input)
        }
        else {
          console.error('WebSpeech not initialized')
        }
        break

      case 'yukumo':
        if (!defaultStore.audio.src || defaultStore.audio.ended) {
          defaultStore.audio.src = yukumo.build_api(tts.value.voice, input)
          defaultStore.audio.play()
        }
        else {
          defaultStore.audio.onended = function () {
            defaultStore.audio.src = yukumo.build_api(tts.value.voice, input)
            defaultStore.audio.play()
            defaultStore.audio.onended = null
          }
        }
        break
    }
  }

  async function on_submit(log: any, index: number) {
    if (!log.transcript.trim()) return

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
    if (!log.transcript.trim()) {
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
        window.ipcRenderer.send('transformers-translate', {
          text: log.transcript,
          src_lang: translationStore.source,
          tgt_lang: translationStore.target,
          index: i,
        })
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
      if (connectionsStore.wh.enabled && defaultStore.broadcasting) {
        try {
          sendWebhook(connectionsStore.wh.url, { transcript: log.transcript, isFinal: true })
        }
        catch (error) {
          console.error('Failed to send webhook:', error)
        }
      }
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

  function load_voices(option: string): any[] {
    let voices: any[] = []
    switch (option) {
      case 'tiktok':
        voices = tiktok.voices
        break
      case 'webspeech':
        const synth = window.speechSynthesis
        if (synth) {
          voices = synth.getVoices().map((lang: SpeechSynthesisVoice) => ({
            lang: lang.lang,
            name: lang.name,
            local_service: lang.localService,
          }))
        }
        break
      case 'yukumo':
        voices = yukumo.voices
        break
    }

    return voices
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
    submit_text,
    typing_event,
    speak,
    on_submit,
    load_voices,
    pin_language,
    unpin_language,
    is_pinned_language,
  }
})
