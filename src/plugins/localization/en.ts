// i18n english translations
export default {
  welcome: {
    intro: {
      title: 'Welcome to {name}!',
      description: '{name} is a captioning tool that can display spoken or typed text onto a customizable window so that you can effortlessly display the results in applications like OBS. It also supports relaying text and commands to other applications (like VRChat).',
      button: 'next',
    },
    controls: {
      title: 'Controls',
      broadcast: 'Toggle OSC broadcasting (requires desktop app)',
      mic: 'Toggle speech-to-text (requires browser permission)',
      settings: 'Open settings panel',
      button: 'close',
    },
  },
  general: {
    type_message: 'Type a message',
    beta: 'BETA',
    update: 'Update',
  },
  alerts: {
    no_speech: 'Your browser does not support Web Speech API (Speech-to-text).',
    mic_error: 'Error enabling microphone. You must give permission to use it.',
    device_in_use: 'Error: device in use by another tab.',
    broadcast_error: 'Error enabling broadcast. Make sure the desktop app is running.',
    websocket_error: 'Invalid websocket URL',
    version_mismatch: 'The desktop app has a different version than the web version. Consider updating, as things might break.',
  },
  settings: {
    title: 'Settings',
    general: {
      title: 'General Settings',
      description: 'General application settings',
      language: 'Select a UI language',
      transcript: 'Download session transcript',
      reset: {
        button: 'Reset all settings',
        dialog: {
          title: 'Reset Settings',
          description: 'You are about to reset settings for the entire application.',
          button: 'Reset',
        },
        snackbar: {
          title: 'Settings reset',
          button: 'Close',
        },
      },
    },
    stt: {
      title: 'Speech-to-Text',
      description: 'Speech-to-text settings',
      type: 'Select a STT service',
      sensitivity: 'Sensitivity gate',
      sensitivity_start: 'Check',
      sensitivity_stop: 'Stop',
      device: 'Listening: ',
      pinned_languages: 'Pinned languages',
      language: 'Select a speech detection language',
      unsupported: {
        text: 'Web Speech API Speech-to-Text is only available on the {0}. (^・ω・^)',
        link: 'website version',
      },
    },
    tts: {
      title: 'Text-to-Speech',
      description: 'Text-to-speech settings',
      enabled: 'Enable text-to-speech voice playback',
      type: 'Select a TTS service',
      rate: 'Rate',
      pitch: 'Pitch',
      language: 'Select a text-to-speech voice',
      unsupported: {
        text: 'Speech-to-Text is only available on the {0}. (^・ω・^)',
        link: 'website version',
      },
    },
    appearance: {
      title: 'Appearance',
      description: 'Change the appearance of the app',
      text: {
        title: 'Text Settings',
        font_family: 'Font family',
        font_type: 'Type',
        font_size: 'Font Size',
        fade: 'Fade text',
        fade_after: 'Fade text after',
        seconds: 'seconds',
        fade_for: 'Fade text for',
        new_line_delay: {
          hint: 'Start a new line when no text is sent',
          options: [
            {
              title: 'Instantly',
              value: 0,
            },
            {
              title: 'after 2 seconds',
              value: 2,
            },
            {
              title: 'after 4 seconds',
              value: 4,
            },
            {
              title: 'after 6 seconds',
              value: 6,
            },
            {
              title: 'after 8 seconds',
              value: 8,
            },
            {
              title: 'after 10 seconds',
              value: 10,
            },
            {
              title: 'Never',
              value: -1,
            },
          ],
        },
        color: 'Text color',
        interim_color: 'Interim text color',
      },
      ui: {
        title: 'UI Settings',
        color: 'Background color',
      },
    },
    word_replace: {
      title: 'Word Replace',
      description: 'Add words or phrases to replace here',
      enabled: 'Enable replacing words or phrases',
      match_whole_word: 'Match whole word only',
      match_case: 'Match case',
      info: 'Use the + button to add a new replacement!',
      replacing: 'Replacing',
      replacement: 'Replacement',
    },
    translation: {
      title: 'Translations',
      description: 'Settings for translating to another language',
      warning: 'Translations are a work in progress. Do not trust them as perfect!',
      enabled: 'Enable translations',
      type: 'Select a translation service',
      source: 'Source',
      target: 'Target',
      show_original: 'Show original phrase before translating',
      ml_notice: '{0} is an ML-powered library that uses local compute resources (CPU) to generate translations on your device. On lower end computers, it might not run well.',
      speech_lang: 'Your Speech-to-text language is ',
      unsupported: {
        text: 'Translations are currently only available on the {0}. (^・ω・^)',
        link: 'desktop version',
      },
    },
    connections: {
      title: 'Connections',
      description: 'Send data to other applications when using {icon}',
      update: 'Update Connection',
      ws: {
        name: 'Desktop connection',
        port: 'Websocket Port',
        description: 'Send real-time text updates over a websocket',
      },
      wh: {
        description: 'Send text updates over a webhook POST request',
      },
    },
    osc: {
      title: 'VRChat',
      general: {
        title: 'General',
        description: 'Settings for customizing OSC connection',
        osc_ip: 'Default OSC IP',
        osc_port: 'Default OSC Port',
        enabled: 'Send all text with OSC (when broadcasting)',
        typing_indicator: 'Enable typing indicator when typing',
        speech_indicator: 'Enable typing indicator for speech-to-text',
        show_keyboard: 'Open keyboard in VRChat when sending text',
        sfx: 'Play a sound effect after sending text',
        unsupported: {
          text: 'To use OSC, you must use the {link}. Once installed, the website and desktop versions can be used together with the {icon} button. (  ᐡᴗ  ̫ ᴗᐡ)',
          link: 'desktop app',
          icon: 'mdi-broadcast',
        },
      },
      params: {
        title: 'Custom Params',
      },
    },
  },
}
