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
        type_message: 'Type a message'
    },
    settings: {
        title: 'Settings',
        general: {
            title: 'General Settings',
            description: 'General application settings',
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
            language: 'Language',
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
        wordreplace: {
            title: 'Word Replace'
        },
        osc: {
            general: {
                title: 'General'
            },
            params: {
                title: 'Custom Params'
            },
        }
    },
}