import { useSpeechStore } from  '../../stores/speech'

declare const window: any

class WebSpeech {
    SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
    SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent
    synth = window.speechSynthesis
    recognition: any

    talking: boolean = false
    listening: boolean = false

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
        } else {
            // throw i18n.t('alerts.no_speech')
        }
    }

    start() {
        // start recognition
        this.recognition.start()

        this.recognition.onresult = (event: any) => {
            const results = event.results[event.results.length - 1]

            // result is final
            if (results.isFinal) {
                this.talking = false
                this.stop()
                this.onresult(results[0].transcript, results.isFinal)
            // user started talking
            } else if (!results.isFinal && !this.talking) {
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
    }

    speak(input: string) {
        const utterance = new SpeechSynthesisUtterance(input)
        utterance.voice = this.synth.getVoices().filter((voice: any) => voice.name === this.speechStore.tts.voice)[0]
        utterance.pitch = this.speechStore.tts.pitch
        utterance.rate = this.speechStore.tts.rate
        this.synth.speak(utterance)
    }
}



export { WebSpeech }