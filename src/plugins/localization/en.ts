// i18n english translations
export default {
    welcome: {
        intro: {
            title: 'Welcome to {name}!',
            description: '{name} is a captioning tool that can display spoken or typed text onto a customizable window so that you can effortlessly display the results in applications like OBS. It also supports relaying text and commands to other applications (like VRChat).',
            button: 'next'
        },
        controls: {
            title: 'Controls',
            broadcast: 'Toggle OSC broadcasting (requires desktop app)',
            mic: 'Toggle speech-to-text (requires browser permission)',
            settings: 'Open settings panel',
            button: 'close'
        }
    },
    general: {
        type_message: 'Type a message',
        beta: 'BETA'
    },
    alerts: {
        no_speech: 'Your browser does not support Web Speech API (Speech-to-text).',
        mic_error: 'Error enabling microphone. You must give permission to use it.',
        broadcast_error: 'Error enabling broadcast. Make sure the desktop app is running.',
        version_mismatch: 'The desktop app has a different version than the web version. Consider updating, as things might break.'
    },
    settings: {
        title: 'Settings',
        general: {
            title: 'General Settings',
            description: 'General application settings',
            language: 'Select a UI language',
            reset: {
                button: 'Reset all settings',
                dialog: {
                    title: 'Reset Settings',
                    description: 'You are about to reset settings for the entire application.',
                    button: 'Reset'
                },
                snackbar: {
                    title: 'Settings reset',
                    button: 'Close'
                }
            }
        },
        stt: {
            title: 'Speech-to-Text',
            description: 'Speech-to-text settings',
            type: 'Select a STT service',
            language: 'Select a speech detection language',
            unsupported: {
                text: 'Web Speech API Speech-to-Text is only available on the {0}. (^・ω・^)',
                link: 'website version'
            }
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
                link: 'website version'
            }
        },
        appearance: {
            title: 'Appearance',
            description: 'Change the appearance of the app',
            text: {
                title: 'Text Settings',
                font_size: 'Font Size',
                fade_after: 'Fade text after',
                seconds: 'seconds',
                fade_for: 'Fade text for',
                color: 'Text color',
                interim_color: 'Iterim text color'
            },
            ui: {
                title: 'UI Settings',
                color: 'Background color'
            }
        },
        word_replace: {
            title: 'Word Replace',
            description: 'Add words or phrases to replace here',
            enabled: 'Enable replacing words or phrases',
            info: 'Use the + button to add a new replacement!',
            replacing: 'Replacing',
            replacement: 'Replacement'
        },
        osc: {
            general: {
                title: 'OSC Settings',
                description: 'Settings for customizing OSC connection',
                osc_ip: 'Default OSC IP',
                osc_port: 'Default OSC Port',
                enabled: 'Send all text with OSC (when broadcasting)',
                typing_indicator: 'Enable typing indicator when typing',
                speech_indicator: 'Enable typing indicator for speech-to-text',
                unsupported: {
                    text: 'To use OSC, you must use the {link}. Once installed, the website and desktop versions can be used together with the {icon} button. (  ᐡᴗ  ̫ ᴗᐡ)',
                    link: 'desktop app',
                    icon: 'mdi-broadcast'
                }
            },
            params: {
                title: 'Custom Params'
            },
        }
    },
}