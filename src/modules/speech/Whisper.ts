import { useSpeechStore } from '@/stores/speech'

declare const window: any

declare interface Lang {
  title: string
  value: string
  icon?: string
}

function get_mime_type() {
  const types = [
    'audio/webm',
    'audio/mp4',
    'audio/ogg',
    'audio/wav',
    'audio/aac',
  ]
  for (let i = 0; i < types.length; i++) {
    if (MediaRecorder.isTypeSupported(types[i]))
      return types[i]
  }
  return undefined
}

class Whisper {
  recorded: Blob | null = null

  stream_ref: MediaStream | null = null // MediaStream
  media_recorder: MediaRecorder | null = null
  chunks_ref: Blob[] = []

  talking: boolean = false
  listening: boolean = false

  speechStore = useSpeechStore()

  onresult: Function = () => {}
  onend: Function = () => {}
  onerror: Function = () => {}

  constructor(lang: string = 'en-US') {

  }

  async start() {
    // start recognition

    const start_time = Date.now()

    if (!this.stream_ref) {
      this.stream_ref = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
    }

    const mime_type = get_mime_type()
    this.media_recorder = new MediaRecorder(this.stream_ref, { mimeType: mime_type })

    // this.media_recorder_ref = media_recorder

    this.media_recorder.addEventListener('dataavailable', async (event) => {
      if (event.data.size > 0)
        this.chunks_ref.push(event.data)
      if (event.data.size > 50) {

      }
      if (this.media_recorder?.state === 'inactive') {
        const duration = Date.now() - start_time
        const blob = new Blob(this.chunks_ref, { type: mime_type })
        if (mime_type === 'audio/webm')
          console.log('todo: fix webm issue(?)')

        this.recorded = blob
        this.onresult('transcript here', true)
      }
    })

    // this.recognition.start()

    // this.recognition.onresult = (event: any) => {
    //     const results = event.results[event.results.length - 1]

    //     // result is final
    //     if (results.isFinal) {
    //         this.talking = false
    //         this.stop()
    //         this.onresult(results[0].transcript, results.isFinal)
    //     // user started talking
    //     } else if (!results.isFinal && !this.talking) {
    //         // console.log('Speech has been detected')
    //         this.talking = true
    //     }

    //     // continually track changes
    //     if (!results.isFinal && this.talking) {
    //         let transcript = ''
    //         Object.keys(event.results).forEach((key: string) => {
    //             transcript += event.results[key][0].transcript
    //         })
    //         this.onresult(transcript, results.isFinal)
    //     }
    // }
    // this.recognition.onend = () => this.onend()
    // this.recognition.onerror = (event: any) => this.onerror(event)
  }

  stop() {
    // this.recognition.stop()
    if (this.media_recorder)
      this.media_recorder.stop()
  }

  transcribe() {

  }

  speak(input: string) {
    // const utterance = new SpeechSynthesisUtterance(input)
    // utterance.voice = this.synth.getVoices().filter((voice: any) => voice.name === this.speechStore.tts.voice)[0]
    // utterance.pitch = this.speechStore.tts.pitch
    // utterance.rate = this.speechStore.tts.rate
    // this.synth.speak(utterance)
  }
}
