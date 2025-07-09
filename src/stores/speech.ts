import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSettingsStore } from './settings'
import { useDefaultStore } from '@/stores/default'
import { useLogsStore } from '@/stores/logs'
import { useAppearanceStore } from '@/stores/appearance'
import { useOSCStore } from '@/stores/osc'
import { useTranslationStore } from '@/stores/translation'
import { useConnectionsStore } from '@/stores/connections'
import { useWordReplaceStore } from '@/stores/word_replace'
import fetch from '@/helpers/fetch'
import is_electron from '@/helpers/is_electron'
import { i18n } from '@/plugins/i18n'
import { WebSpeech } from '@/modules/speech'
import yukumo from '@/constants/voices/yukumo'
import tiktok from '@/constants/voices/tiktok'
import webhook from '@/helpers/webhook'

export interface ListItem {
  title: string
  value: string
}

interface PinnedLanguages {
  [key: string]: ListItem
}

declare const window: any

export const useSpeechStore = defineStore('speech', () => {
  const stt_init = {
    type: {
      title: 'Web Speech API',
      value: 'webspeech',
    },
    language: 'en-US',
    confidence: 0.9,
    sensitivity: 0.0,
  }

  const stt = ref(structuredClone(stt_init))

  const tts_init = {
    enabled: false,
    type: 'tiktok',
    voice: '',
    rate: 1,
    pitch: 1,
  }

  const tts = ref(structuredClone(tts_init))

  const pinned_languages = ref<PinnedLanguages>({})

  function reset() {
    stt.value = structuredClone(stt_init)
    tts.value = structuredClone(tts_init)
    pinned_languages.value = {}
  }

  function initialize_speech(language: string) {
    const defaultStore = useDefaultStore()
    defaultStore.speech = new WebSpeech(language)
  }

  function toggle_listen() {
    const defaultStore = useDefaultStore()

    // recognition not supported
    if (!defaultStore.speech.recognition) {
      // listening = false
      defaultStore.show_snackbar('error', i18n.t('snackbar.no_speech'))
      return
    }

    defaultStore.speech.listening = !defaultStore.speech.listening

    defaultStore.speech.onend = () => {
      // restart if auto stopped
      if (defaultStore.speech.listening) {
        if (defaultStore.speech.last_error === 'network') {
          defaultStore.speech.try_restart_interval = setTimeout(() => {
            defaultStore.speech.start()
          }, 2000)

          return
        }

        defaultStore.speech.start()
      }
    }

    defaultStore.speech.onerror = (event: any) => {
      let desc = ''

      defaultStore.speech.last_error = event.error

      switch (event.error) {
        case 'no-speech': // No speech was detected
          return
        case 'aborted':
          desc = i18n.t('snackbar.speech_recognition_error_event.aborted')
          defaultStore.speech.listening = false
          defaultStore.speech.stop()
          break
        case 'audio-capture':
          desc = i18n.t('snackbar.speech_recognition_error_event.network')
          defaultStore.speech.listening = false
          defaultStore.speech.stop()
          break
        case 'network':
          desc = i18n.t('snackbar.speech_recognition_error_event.network')
          defaultStore.speech.stop()
          break
        case 'not-allowed':
          desc = i18n.t('snackbar.speech_recognition_error_event.not_allowed')
          defaultStore.speech.listening = false
          defaultStore.speech.stop()
          break
        case 'service-not-allowed':
          desc = i18n.t('snackbar.speech_recognition_error_event.service_not_allowed')
          defaultStore.speech.listening = false
          defaultStore.speech.stop()
          break
        case 'bad-grammar':
          desc = i18n.t('snackbar.speech_recognition_error_event.bad_grammar')
          defaultStore.speech.listening = false
          defaultStore.speech.stop()
          break
        case 'language-not-supported':
          desc = i18n.t('snackbar.speech_recognition_error_event.language_not_supported')
          break
        default:
          desc = i18n.t('snackbar.speech_recognition_error_event.unknown')
          break
      }

      defaultStore.show_snackbar('error', desc)
    }

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

    defaultStore.speech.onstart = () => {
      if (defaultStore.speech.last_error === 'network') {
        clearTimeout(defaultStore.speech.try_restart_interval)
      }
    }

    if (defaultStore.speech.listening)
      defaultStore.speech.start()
    else
      defaultStore.speech.stop()
  }

  function submit_text(input_text: string, input_index: number, isFinal: boolean) {
    const connectionsStore = useConnectionsStore()
    const logsStore = useLogsStore()

    post_to_user_webhooks(input_text, isFinal)

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

      const wsPayload = JSON.stringify(logsStore.logs[input_index])
      const rendered_payload = `{"type": "text", "data": ${wsPayload}}`

      if (connectionsStore.open.mimiuchi_websocket)
        connectionsStore.open.mimiuchi_websocket.send(rendered_payload)

      if (connectionsStore.open.obs_websocket) {
        (async () => {
          await connectionsStore.obs_set_text(logsStore.logs[input_index].transcript)
        })()
      }

      for (const openConnection of connectionsStore.open.user_websockets) {
        if (openConnection) openConnection.send(rendered_payload)
      }
    }
    else if (input_index === logsStore.logs.length - 1) {
      logsStore.logs[input_index].transcript = input_text
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
          response = await fetch.post(tiktok.api, body)
        }
        catch (e) {
          console.error(e)
          response = await fetch.post(tiktok.api, body)
        }
        if (!defaultStore.audio.src || defaultStore.audio.ended) {
          defaultStore.audio.src = `data:audio/mpeg;base64,${response.data}`
          defaultStore.audio.play()
        }
        else {
          defaultStore.audio.onended = function () {
            defaultStore.audio.src = `data:audio/mpeg;base64,${response.data}`
            defaultStore.audio.play()
            defaultStore.audio.onended = null
          }
        }
        break

      case 'webspeech':
        const { speech } = useDefaultStore()
        speech.speak(input)
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
    if (!log.transcript.trim()) // If the submitted input is only whitespace, do nothing. This may occur if the user only submitted whitespace.
      return

    const { text } = useAppearanceStore()
    const connectionsStore = useConnectionsStore()
    const defaultStore = useDefaultStore()
    const logsStore = useLogsStore()
    const oscStore = useOSCStore()
    const settingsStore = useSettingsStore()
    const translationStore = useTranslationStore()
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
      if (translationStore.enabled && !log.translate && !log.translation) {
        logsStore.logs[i].translate = true
        translationStore.translate(log.transcript, i)
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
    }

    // send text via osc
    if (defaultStore.broadcasting) {
      if (is_electron() && oscStore.osc_text) {
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
      else if (!settingsStore.realtime_text) {
        const wsPayload = JSON.stringify(log)

        // Send to mimiuchi desktop application
        if (connectionsStore.open.mimiuchi_websocket)
          connectionsStore.open.mimiuchi_websocket.send(`{"type": "text", "data": ${wsPayload}}`)

        // Send to Open Broadcaster Software (OBS) WebSocket
        await connectionsStore.obs_set_text(log.transcript)

        // Send to user WebSockets
        for (const openConnection of connectionsStore.open.user_websockets) {
          if (openConnection) openConnection.send(`{"type": "text", "data": ${wsPayload}}`)
        }

        // Post to user webhooks
        post_to_user_webhooks(log.transcript, true)
      }
    }
  }

  // temp
  interface Voice {
    lang: string
    name: string
    local_service: boolean
  }
  function load_voices(option: string): Voice[] {
    let voices: Voice[] = []
    switch (option) {
      case 'tiktok':
        voices = tiktok.voices
        break
      case 'webspeech':
        const synth = window.speechSynthesis
        voices = synth.getVoices().map((lang: SpeechSynthesisVoice) => ({
          lang: lang.lang,
          name: lang.name,
          local_service: lang.localService,
        } as Voice))
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

  function post_to_user_webhooks(text: any, is_final: boolean) {
    const connectionsStore = useConnectionsStore()

    for (const wh of connectionsStore.user_webhooks) {
      if (wh.enabled) {
        console.log(`Webhook (${wh.title}) is posting to ${wh.webhook!.address_full}.`)
        webhook.post(wh.webhook!.address_full, { transcript: text, isFinal: is_final })
      }
    }
  }

  return {
    stt,
    tts,
    pinned_languages,
    reset,
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
