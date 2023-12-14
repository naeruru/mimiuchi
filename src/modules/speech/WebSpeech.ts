import { useSpeechStore } from '@/stores/speech'

declare const window: any

declare interface Lang {
  title: string
  value: string
  icon?: string
}

class WebSpeech {
  SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
  SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent
  synth = window.speechSynthesis
  recognition: any

  stream: any = null
  sensitivity: number = 0.0
  max_sensitivity: number = 0.0

  talking: boolean = false
  listening: boolean = false
  listening_error: boolean = false

  speechStore = useSpeechStore()

  onresult: Function = () => {}
  onend: Function = () => {}
  onerror: Function = () => {}

  constructor(lang: string = 'en-US') {
    this.recognition = (this.SpeechRecognition) ? new this.SpeechRecognition() : null

    if (this.recognition) {
      this.recognition.continuous = true
      this.recognition.lang = lang
      this.recognition.interimResults = true
      this.recognition.maxAlternatives = 1
    }
    else {
      // throw i18n.t('alerts.no_speech')
    }
  }

  async get_sensitivity() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    const audioContext = new AudioContext()
    const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(this.stream)
    const analyserNode = audioContext.createAnalyser()
    mediaStreamAudioSourceNode.connect(analyserNode)

    const pcmData = new Float32Array(analyserNode.fftSize)
    const onFrame = () => {
      if (!this.stream)
        return
      analyserNode.getFloatTimeDomainData(pcmData)
      let sumSquares = 0.0
      for (const amplitude of pcmData) sumSquares += amplitude * amplitude
      this.sensitivity = Math.sqrt(sumSquares / pcmData.length)
      if (this.sensitivity > this.max_sensitivity)
        this.max_sensitivity = this.sensitivity
      window.requestAnimationFrame(onFrame)
    }
    window.requestAnimationFrame(onFrame)
  }

  async start() {
    // start recognition
    this.recognition.start()
    try {
      if (!this.stream)
        await this.get_sensitivity()
    }
    catch {} // ios will deny the request on unsecure connections

    this.recognition.onresult = (event: any) => {
      if (this.max_sensitivity < this.speechStore.stt.sensitivity)
        return

      const results = event.results[event.results.length - 1]

      // result is final
      if (results.isFinal) {
        this.talking = false
        this.stop()
        this.max_sensitivity = 0.0
        this.onresult(results[0].transcript, results.isFinal)
        // user started talking
      }
      else if (!results.isFinal && !this.talking) {
        // console.log('Speech has been detected')
        this.talking = true
      }

      // continually track changes
      if (!results.isFinal && this.talking) {
        let transcript = ''
        Object.keys(event.results).forEach((key: string) => {
          transcript += event.results[key][0].transcript
        })
        this.onresult(transcript, results.isFinal)
      }
    }
    this.recognition.onend = () => this.onend()
    this.recognition.onerror = (event: any) => this.onerror(event)
  }

  stop() {
    this.recognition.stop()
    this.stream?.getTracks().forEach((track: any) => {
      track.stop()
      this.stream = null
      this.max_sensitivity = 0.0
    })
  }

  speak(input: string) {
    const utterance = new SpeechSynthesisUtterance(input)
    utterance.voice = this.synth.getVoices().filter((voice: any) => voice.name === this.speechStore.tts.voice)[0]
    utterance.pitch = this.speechStore.tts.pitch
    utterance.rate = this.speechStore.tts.rate
    this.synth.speak(utterance)
  }
}

const WebSpeechLangs: Lang[] = [
  {
    title: 'Afrikaans',
    value: 'af-ZA',
  },
  {
    title: 'Bahasa Indonesia',
    value: 'id-ID',
  },
  {
    title: 'Bahasa Melayu',
    value: 'ms-MY',
  },
  {
    title: 'Català',
    value: 'ca-ES',
  },
  {
    title: 'Čeština',
    value: 'cs-CZ',
  },
  {
    title: 'Deutsch',
    value: 'de-DE',
  },

  {
    title: 'English (Australia)',
    value: 'en-AU',
  },
  {
    title: 'English (Canada)',
    value: 'en-CA',
  },
  {
    title: 'English (India)',
    value: 'en-IN',
  },
  {
    title: 'English (Ireland)',
    value: 'en-IE',
  },
  {
    title: 'English (New Zealand)',
    value: 'en-NZ',
  },
  {
    title: 'English (South Africa)',
    value: 'en-ZA',
  },
  {
    title: 'English (United Kingdom)',
    value: 'en-GB',
  },
  {
    title: 'English (United States)',
    value: 'en-US',
  },

  {
    title: 'Español (Argentina)',
    value: 'es-AR',
  },
  {
    title: 'Español (Bolivia)',
    value: 'es-BO',
  },
  {
    title: 'Español (Chile)',
    value: 'es-CL',
  },
  {
    title: 'Español (Columbia)',
    value: 'es-CO',
  },
  {
    title: 'Español (Costa Rica)',
    value: 'es-CR',
  },
  {
    title: 'Español (Ecuador)',
    value: 'es-EC',
  },
  {
    title: 'Español (El Salvador)',
    value: 'es-SV',
  },
  {
    title: 'Español (España)',
    value: 'es-ES',
  },
  {
    title: 'Español (Estados Unidos)',
    value: 'es-US',
  },
  {
    title: 'Español (Guatemala)',
    value: 'es-GT',
  },
  {
    title: 'Español (Honduras)',
    value: 'es-HN',
  },
  {
    title: 'Español (México)',
    value: 'es-MX',
  },
  {
    title: 'Español (Nicaragua)',
    value: 'es-NI',
  },
  {
    title: 'Español (Panamá)',
    value: 'es-PA',
  },
  {
    title: 'Español (Paraguay)',
    value: 'es-PY',
  },
  {
    title: 'Español (Perú)',
    value: 'es-PE',
  },
  {
    title: 'Español (Puerto Rico)',
    value: 'es-PR',
  },
  {
    title: 'Español (República Dominicana)',
    value: 'es-DO',
  },
  {
    title: 'Español (Uruguay)',
    value: 'es-UY',
  },
  {
    title: 'Español (Venezuela)',
    value: 'es-VE',
  },

  {
    title: 'Euskara',
    value: 'eu-ES',
  },
  {
    title: 'French',
    value: 'fr-FR',
  },
  {
    title: 'Galego',
    value: 'gl-ES',
  },
  {
    title: 'Hrvatski',
    value: 'hr-HR',
  },
  {
    title: 'IsiZulu',
    value: 'zu-ZA',
  },
  {
    title: 'Íslenska',
    value: 'is-IS',
  },
  {
    title: 'Italiano (Italia)',
    value: 'it-IT',
  },
  {
    title: 'Italiano (Svizzera)',
    value: 'it-CH',
  },
  {
    title: 'Magyar',
    value: 'hu-HU',
  },
  {
    title: 'Nederlands',
    value: 'nl-NL',
  },
  {
    title: 'Norsk bokmå',
    value: 'nb-NO',
  },
  {
    title: 'Polski',
    value: 'pl-PL',
  },
  {
    title: 'Português (Brasil)',
    value: 'pt-BR',
  },
  {
    title: 'Português (Portugal)',
    value: 'pt-PT',
  },
  {
    title: 'Română',
    value: 'ro-RO',
  },
  {
    title: 'Slovenčina',
    value: 'sk-SK',
  },
  {
    title: 'Suomi',
    value: 'fi-FI',
  },
  {
    title: 'Svenska',
    value: 'sv-SE',
  },
  {
    title: 'Türkçe',
    value: 'tr-TR',
  },
  {
    title: 'български',
    value: 'bg-BG',
  },
  {
    title: 'Pусский',
    value: 'ru-RU',
  },
  {
    title: 'Српски',
    value: 'sr-RS',
  },
  {
    title: '普通话 (中国大陆)',
    value: 'cmn-Hans-CN',
  },
  {
    title: '普通话 (香港)',
    value: 'cmn-Hans-HK',
  },
  {
    title: '中文 (台灣)',
    value: 'cmn-Hant-TW',
  },
  {
    title: '粵語 (香港)',
    value: 'yue-Hant-HK',
  },

  {
    title: '日本語（日本）',
    value: 'ja-JP',
  },
  {
    title: '한국어',
    value: 'ko-KR',
  },
  {
    title: 'Lingua latīna',
    value: 'la',
  },
]

export { WebSpeech, WebSpeechLangs }
