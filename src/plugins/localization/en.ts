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
        broadcast_error: 'Error enabling broadcast. Make sure the desktop app is running.'
    },
    settings: {
        title: 'Settings',
        general: {
            title: 'General Settings',
            description: 'General application settings',
            language: 'Select a language',
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
        speech: {
            title: 'Speech',
            description: 'Speech settings',
            language: 'Select a speech detection language',
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
                    text: 'To use OSC, you must use the {0}. You can access additional settings there. (  ᐡᴗ  ̫ ᴗᐡ)',
                    link: 'desktop app'
                }
            },
            params: {
                title: 'Custom Params'
            },
        }
    },
}